import { db } from "@/lib/db";
import { sendAdminLowStockAlert } from "@/lib/email";
import { sendDiscordNotification } from "@/lib/discord";

const LOW_STOCK_THRESHOLD = 5;

export async function checkAndSendStockAlerts(productId: string): Promise<void> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return;

  if (product.stockCount === 0) {
    await sendAdminLowStockAlert(product.title, 0);
    return;
  }

  if (product.stockCount <= LOW_STOCK_THRESHOLD) {
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      await sendDiscordNotification(discordUrl, {
        content: `⚠️ Low stock alert: **${product.title}** has only ${product.stockCount} item(s) remaining.`,
      });
    }
  }
}
