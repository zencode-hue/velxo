import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { sendDeliveryEmail, sendAdminPendingStockAlert, sendAdminLowStockAlert } from "@/lib/email";
import { checkAndSendStockAlerts } from "@/lib/stock-alerts";
import { sendDiscordNotification } from "@/lib/discord";

export interface DeliveryResult {
  success: boolean;
  orderId: string;
  inventoryItemId?: string;
  error?: string;
}

/**
 * Delivers a paid order by atomically assigning an available InventoryItem,
 * decrypting credentials, sending a delivery email, and logging the delivery.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 11.1, 12.6
 */
export async function deliverOrder(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { product: true, user: true },
  });

  if (!order) throw new Error(`Order not found: ${orderId}`);

  const { product, user } = order;
  const deliveryEmail = user?.email ?? (order as { guestEmail?: string | null }).guestEmail ?? null;
  if (!deliveryEmail) throw new Error(`No delivery email for order: ${orderId}`);
  const now = new Date();

  let assignedItem: { id: string; encryptedData: string; iv: string; authTag: string } | null = null;

  await db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findFirst({
      where: { productId: product.id, status: "AVAILABLE" },
    });

    if (!item) {
      await tx.order.update({ where: { id: orderId }, data: { status: "PENDING_STOCK" } });
      await sendAdminPendingStockAlert(orderId, product.title);
      await sendDeliveryEmail(deliveryEmail, {
        orderId, productTitle: product.title,
        status: "pending_stock", message: "Your order is awaiting stock replenishment",
      });
      return;
    }

    await tx.inventoryItem.update({ where: { id: item.id }, data: { status: "DELIVERED" } });
    await tx.product.update({ where: { id: product.id }, data: { stockCount: { decrement: 1 } } });
    await tx.deliveryLog.create({
      data: { orderId, userId: order.userId ?? null, productId: product.id, inventoryItemId: item.id, deliveredAt: now },
    });

    assignedItem = { id: item.id, encryptedData: item.encryptedData, iv: item.iv, authTag: item.authTag };
  });

  if (!assignedItem) return;

  const item = assignedItem as { id: string; encryptedData: string; iv: string; authTag: string };
  const decryptedCredentials = decrypt(item.encryptedData, item.iv, item.authTag);

  await sendDeliveryEmail(deliveryEmail, {
    orderId, productTitle: product.title,
    credentials: decryptedCredentials, deliveredAt: now,
  });

  await checkAndSendStockAlerts(product.id);
  await checkDuplicateDelivery(item.id, orderId);

  // Credit affiliate commission if the buyer was referred (logged-in users only)
  if (order.userId) {
    await creditAffiliateCommission(order.userId, Number(order.amount));
  }

  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  if (discordUrl) {
    await sendDiscordNotification(discordUrl, {
      content: `✅ New sale: ${product.title} — Order #${orderId}`,
    });
  }
}

async function creditAffiliateCommission(userId: string, orderAmount: number): Promise<void> {
  const referral = await db.referral.findUnique({ where: { referredUserId: userId } });
  if (!referral) return;

  const affiliate = await db.affiliate.findUnique({ where: { id: referral.affiliateId } });
  if (!affiliate) return;

  const commission = (orderAmount * Number(affiliate.commissionPct)) / 100;

  await db.affiliate.update({
    where: { id: affiliate.id },
    data: {
      pendingPayout: { increment: commission },
      totalEarned: { increment: commission },
    },
  });
}

/**
 * Retries delivery for an order that is PAID but has no DeliveryLog yet.
 */
export async function retryDelivery(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { deliveryLog: true },
  });

  if (!order) throw new Error(`Order not found: ${orderId}`);
  if (order.status !== "PAID") return;
  if (order.deliveryLog) return;

  await deliverOrder(orderId);
}

/**
 * Checks for duplicate delivery of the same InventoryItem.
 * Requirements: 12.6
 */
export async function checkDuplicateDelivery(inventoryItemId: string, orderId: string): Promise<void> {
  const count = await db.deliveryLog.count({ where: { inventoryItemId } });
  if (count > 1) {
    console.warn(`[DeliveryEngine] DUPLICATE DELIVERY — inventoryItemId=${inventoryItemId} orderId=${orderId}`);
    await sendAdminLowStockAlert("DUPLICATE DELIVERY DETECTED", -1);
  }
}
