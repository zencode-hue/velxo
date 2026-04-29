# Velxo Shop — Discord Bot Context File
# Full reference for building an AI-powered Discord manager bot

---

## 1. SHOP IDENTITY

| Field | Value |
|-------|-------|
| Name | Velxo Shop |
| Website | https://velxo.shop |
| Tagline | Premium Digital Marketplace — Instant Delivery |
| Email | support@velxo.shop |
| Twitter/X | @velxoshop |
| Category | Digital goods / subscriptions marketplace |
| Currency | USD (base), supports 40+ currencies via display |

---

## 2. WHAT VELXO SELLS

Velxo is a digital subscription and software marketplace. All products are delivered instantly via email after payment.

### Product Categories
- **STREAMING** — Netflix, Spotify, IPTV, Disney+, Hulu, etc.
- **AI_TOOLS** — ChatGPT Plus, Claude, Midjourney, Copilot, etc.
- **SOFTWARE** — Windows licenses, Office, antivirus, VPNs, etc.
- **GAMING** — Game keys, accounts, in-game currency, gift cards

### Key Product Facts
- All products are digital — no physical shipping
- Credentials delivered to customer email within seconds of payment
- Products have optional **variants** (e.g. Spotify Individual $4.99 / Spotify Family $7.99)
- Products can have limited or unlimited stock
- Replacement guarantee on all products

---

## 3. PAYMENT METHODS

| Method | Description |
|--------|-------------|
| Crypto (NOWPayments) | BTC, ETH, USDT, 100+ coins |
| Binance Gift Card | USDT gift card purchased on Eneba, redeemed on site |
| Wallet Balance | Pre-loaded store credit |
| Discord Manual | Customer pays manually via Discord DM with staff |

> **Note:** Binance Gift Card option is hidden for customers in North America (US, CA, MX).

---

## 4. ORDER SYSTEM

### Order Statuses
| Status | Meaning |
|--------|---------|
| `PENDING` | Order created, awaiting payment |
| `PAID` | Payment confirmed, product delivered |
| `PENDING_STOCK` | Payment received but no inventory available |
| `FAILED` | Payment failed |
| `REFUNDED` | Order refunded |

### Order ID Format
Orders use the format `VLX-XXXXXX` (last 6 chars of internal ID, uppercase).
Example: `VLX-A3F9C2`

### Invoice URL
`https://velxo.shop/invoice/[full-order-id]`

### Delivery
- Automated: credentials sent to customer email instantly on payment
- Manual: for `PENDING_STOCK` orders, staff fulfills via Discord using the order ID
- Staff can redeliver from the staff portal

---

## 5. USER ROLES & PORTALS

### Customer
- Registers at `velxo.shop/auth/register`
- Dashboard at `velxo.shop/dashboard`
- Can view orders, wallet balance, affiliate stats, wishlist

### Staff
- Separate login at `velxo.shop/staff-login`
- Can view orders, manage inventory, redeliver, view customers
- Cannot access admin panel

### Admin
- Login at `velxo.shop/auth/login` (role = ADMIN)
- Full access: products, inventory, orders, users, analytics, settings, blog, discounts, affiliates, partners, staff management

---

## 6. AFFILIATE & PARTNER PROGRAMS

### Promo Affiliate (store credit)
- Any registered user can join from their dashboard
- Earns **10% commission** (configurable in admin settings) as store credit
- Referral via unique link: `velxo.shop/auth/register?ref=CODE`
- Earnings tracked in real-time, usable as wallet balance

### Partner Program (crypto payouts)
- Application-based, approved by admin
- Earns **15%+ commission** (configurable per partner) in real cash
- Payouts to crypto wallet (BTC, ETH, USDT TRC20/ERC20, BNB)
- Minimum payout threshold configurable in admin settings
- Partner dashboard at `velxo.shop/dashboard/partner`

---

## 7. DISCOUNT CODES

- Admin creates codes with type: `PERCENTAGE` or `FIXED`
- Each code has: usage limit, expiry date, per-user restriction
- Applied at checkout before payment
- Example: `SAVE20` = 20% off

---

## 8. DEAL VAULT

- Daily rotating deals — 20% off selected products
- Resets at midnight UTC
- Shown on homepage and `/deals` page
- Admin can enable/disable via settings

---

## 9. ADMIN API ENDPOINTS (for bot integration)

Base URL: `https://velxo.shop/api`

All admin endpoints require the admin session cookie OR can be called server-side.

### Public Endpoints (no auth)
```
GET  /api/v1/products          — list all active products
GET  /api/v1/products/:id      — get product details + variants
GET  /api/v1/deals             — get today's deals
GET  /api/v1/settings          — get public site settings
GET  /api/v1/stats             — get live order stats
```

### Admin Endpoints (require admin auth)
```
GET    /api/admin/orders/:id          — get order details
PATCH  /api/admin/orders/:id          — update order status (triggers delivery if set to PAID)
POST   /api/admin/orders/:id/redeliver — redeliver a PAID order
GET    /api/admin/products            — list all products
POST   /api/admin/products            — create product
PATCH  /api/admin/products/:id        — update product
DELETE /api/admin/products/:id        — delete product
GET    /api/admin/products/:id/variants — get variants
PUT    /api/admin/products/:id/variants — bulk update variants
GET    /api/admin/analytics           — revenue + order analytics
POST   /api/admin/settings            — save site settings
GET    /api/admin/partners            — list partners
PATCH  /api/admin/partners/:id        — update partner status/commission
GET    /api/admin/partners/payouts    — list payout requests
PATCH  /api/admin/partners/payouts/:id — approve/reject payout
GET    /api/admin/staff               — list staff
PATCH  /api/admin/staff/:id           — update staff status
DELETE /api/admin/staff/:id           — remove staff
POST   /api/admin/send-email          — send email to user/all
GET    /api/admin/ip-lookup?ip=X      — IP intelligence lookup
POST   /api/admin/discord-push        — push message to Discord webhook
```

### Checkout / Order Flow
```
POST /api/v1/checkout                        — create order + payment
POST /api/v1/checkout/binance-gift-card      — submit gift card code for order
POST /api/v1/discount/validate               — validate discount code
GET  /api/v1/balance                         — get user wallet balance
POST /api/v1/balance/topup                   — top up wallet
GET  /api/v1/orders                          — get user's orders
POST /api/v1/notify-stock                    — subscribe to restock notification
GET  /api/v1/track?orderId=X&email=Y         — track order by ID + email
```

---

## 10. DISCORD BOT — RECOMMENDED FEATURES

### Customer Support Commands
| Command | Description |
|---------|-------------|
| `/order <order-id>` | Look up order status by VLX-XXXXXX ID |
| `/track <order-id> <email>` | Track order for guest customers |
| `/products` | Show list of available products with prices |
| `/deals` | Show today's Deal Vault with countdown |
| `/price <product-name>` | Search for a product and show price |
| `/payment-methods` | Explain all payment options |
| `/how-to-pay gift-card` | Step-by-step Binance gift card guide |
| `/support` | Open a support ticket / DM staff |
| `/faq` | Show common questions and answers |

### Staff Commands (staff role only)
| Command | Description |
|---------|-------------|
| `/fulfill <order-id>` | Mark PENDING_STOCK order as fulfilled (triggers delivery) |
| `/redeliver <order-id>` | Redeliver credentials for a PAID order |
| `/check-order <order-id>` | Get full order details |
| `/add-balance <user-id> <amount>` | Credit wallet balance to a user |
| `/ban-user <user-id> <reason>` | Ban a user from the shop |
| `/low-stock` | Show products with low inventory |
| `/pending-stock` | List all PENDING_STOCK orders |

### Admin Commands (admin role only)
| Command | Description |
|---------|-------------|
| `/stats` | Show today's revenue, orders, new users |
| `/revenue [today/week/month]` | Revenue breakdown |
| `/approve-payout <payout-id>` | Approve partner payout request |
| `/reject-payout <payout-id> <reason>` | Reject payout with reason |
| `/create-discount <code> <type> <value> <limit>` | Create discount code |
| `/announce <message>` | Push announcement to Discord + site bar |
| `/maintenance [on/off]` | Toggle maintenance mode |
| `/deals-push` | Manually push today's deals to Discord |
| `/add-product <title> <price> <category>` | Quick product creation |
| `/set-setting <key> <value>` | Update site setting |

### Automated Bot Behaviors
| Trigger | Action |
|---------|--------|
| New sale webhook | Post sale notification in #sales channel |
| PENDING_STOCK order | Alert staff in #pending-stock channel |
| Low stock (≤3 items) | Alert admin in #alerts channel |
| New partner payout request | Alert admin in #payouts channel |
| New user registration | Welcome DM with shop link |
| Order delivered | DM customer with confirmation + invoice link |
| Daily at midnight UTC | Post Deal Vault in #deals channel |
| Every 30 min | Check for unpaid invoices, send reminder |

### Ticket System
- Customer opens ticket with `/support` or button click
- Bot creates private thread with customer + support role
- Bot posts order lookup form in thread
- Staff can close ticket with `/close`
- Transcript saved on close

### Auto-Responder (AI)
The bot should understand and respond to natural language questions about:
- "How do I pay?" → explain payment methods
- "Where is my order?" → ask for order ID, look it up
- "Is [product] available?" → check stock via API
- "How much is Netflix?" → search products API
- "I didn't receive my product" → ask for order ID, check status, escalate if needed
- "How does the affiliate program work?" → explain promo + partner programs
- "Can I get a refund?" → explain policy (replacement guarantee, no cash refunds)
- "What is a Binance gift card?" → explain the payment method step by step

---

## 11. BOT PERSONALITY & TONE

- Name: **Velxo** (or **VelxoBot**)
- Personality: Helpful, professional, friendly — not robotic
- Tone: Concise, clear, solution-oriented
- Always offer next steps — never leave a customer hanging
- Use embeds for order lookups, product listings, stats
- Use emojis sparingly but effectively (✅ ❌ ⚡ 🔒 💰)

---

## 12. EMBED TEMPLATES

### Order Status Embed
```
Title: Order VLX-XXXXXX
Color: Green (PAID) / Yellow (PENDING) / Orange (PENDING_STOCK) / Red (FAILED)
Fields:
  - Product: [product name]
  - Amount: $X.XX
  - Status: [status]
  - Payment: [method]
  - Date: [date]
  - Invoice: https://velxo.shop/invoice/[id]
```

### Product Embed
```
Title: [Product Name]
Thumbnail: [product image]
Color: Purple
Fields:
  - Price: $X.XX (or range if variants)
  - Category: [category]
  - Stock: In Stock / Out of Stock
  - Variants: [list if any]
  - Buy: https://velxo.shop/products/[slug--id]
```

### Daily Deals Embed
```
Title: 🔥 DEAL VAULT — Today's Deals
Color: Green (#00ff88)
Description: X deals at 20% OFF — resets at midnight UTC
Fields: [up to 7 deals with original/deal price]
Footer: Velxo Shop • Deals reset daily at midnight UTC
```

### Stats Embed (admin)
```
Title: 📊 Velxo Stats
Color: Blue
Fields:
  - Today's Revenue: $X.XX (X orders)
  - This Week: $X.XX
  - This Month: $X.XX
  - Pending Orders: X
  - Pending Stock: X
  - Total Users: X
```

---

## 13. WEBHOOK EVENTS (from Velxo to Discord)

Velxo sends Discord webhook notifications for:
- New sale (product, amount, customer country)
- PENDING_STOCK order (order ID, product, customer email)
- Low stock alert (product, remaining count)
- New partner payout request (partner, amount, wallet)

Webhook URL is configured in admin settings under `DISCORD_WEBHOOK_URL`.

---

## 14. POLICIES (for bot to communicate)

### Refund Policy
- All sales are final for digital products
- If credentials are invalid/not working: replacement within 24 hours
- Contact support within 24 hours of purchase with order ID

### Delivery Policy
- Instant automated delivery to registered email
- If not received: check spam folder, then contact support with order ID
- PENDING_STOCK: staff will fulfill manually, usually within hours

### Account Policy
- One account per person
- Sharing accounts is not allowed
- Banned users lose access to all services

### Affiliate Policy
- Promo affiliates earn store credit only (not withdrawable as cash)
- Partner affiliates earn real crypto, minimum payout applies
- Commission is credited on successful delivery, not on order creation

---

## 15. QUICK LINKS FOR BOT RESPONSES

| Purpose | URL |
|---------|-----|
| Shop homepage | https://velxo.shop |
| All products | https://velxo.shop/products |
| Today's deals | https://velxo.shop/deals |
| Register | https://velxo.shop/auth/register |
| Login | https://velxo.shop/auth/login |
| Dashboard | https://velxo.shop/dashboard |
| Track order | https://velxo.shop/track |
| Support page | https://velxo.shop/support |
| Affiliate info | https://velxo.shop/affiliate |
| Blog | https://velxo.shop/blog |
| Terms | https://velxo.shop/terms |
| Privacy | https://velxo.shop/privacy |

---

## 16. ENVIRONMENT VARIABLES NEEDED BY BOT

```env
VELXO_API_BASE=https://velxo.shop/api
VELXO_ADMIN_EMAIL=your-admin@email.com
VELXO_ADMIN_PASSWORD=your-admin-password
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
DISCORD_SALES_CHANNEL_ID=channel-for-sale-notifications
DISCORD_SUPPORT_CHANNEL_ID=channel-for-support-tickets
DISCORD_DEALS_CHANNEL_ID=channel-for-daily-deals
DISCORD_ALERTS_CHANNEL_ID=channel-for-admin-alerts
DISCORD_STAFF_ROLE_ID=role-id-for-staff
DISCORD_ADMIN_ROLE_ID=role-id-for-admin
DISCORD_CUSTOMER_ROLE_ID=role-id-for-verified-customers
OPENAI_API_KEY=your-openai-key (for AI responses)
```

---

## 17. SUGGESTED DISCORD SERVER STRUCTURE

```
📢 ANNOUNCEMENTS
  #announcements
  #deals-vault (daily deals posted here)
  #new-products

🛒 SHOP
  #shop-info
  #how-to-buy
  #payment-guide
  #faq

🎫 SUPPORT
  #open-ticket (button to create ticket)
  #order-lookup (bot command channel)

💬 COMMUNITY
  #general
  #reviews
  #off-topic

👥 STAFF (private)
  #staff-chat
  #pending-stock-alerts
  #admin-alerts
  #payouts

🤖 BOT
  #bot-commands (public bot commands)
```

---

## 18. SAMPLE BOT SYSTEM PROMPT (for AI layer)

```
You are VelxoBot, the official AI assistant for Velxo Shop (velxo.shop).

Velxo Shop is a digital marketplace selling streaming subscriptions (Netflix, Spotify, IPTV), 
AI tools (ChatGPT Plus), software licenses, and gaming keys. All products are delivered 
instantly to the customer's email after payment.

Your job is to:
1. Help customers find products and understand pricing
2. Look up order status when given an order ID (format: VLX-XXXXXX)
3. Explain payment methods (Crypto, Binance Gift Card, Wallet Balance, Discord Manual)
4. Guide customers through the Binance gift card payment process step by step
5. Explain the affiliate and partner programs
6. Handle support requests and escalate to human staff when needed
7. Answer questions about delivery, refunds, and policies

Always be helpful, concise, and professional. Use the Velxo API to fetch real-time data 
when needed. Never make up order information — always fetch it from the API.

If a customer has a problem you cannot solve, create a support ticket and tag the staff role.

Shop URL: https://velxo.shop
Support email: support@velxo.shop
```

---

*Last updated: April 2026 — Velxo Shop v2*
