# Implementation Plan: Velxo Digital Marketplace

## Overview

Incremental implementation of the Velxo platform using Next.js 14 App Router, Prisma/PostgreSQL, NextAuth.js, Stripe, and the Delivery Engine. Each task builds on the previous, ending with full integration.

## Tasks

- [x] 1. Project scaffold and database schema
  - Initialize Next.js 14 app with TypeScript, Tailwind CSS, and Prisma
  - Create `prisma/schema.prisma` with all models: User, Product, InventoryItem, Order, DeliveryLog, DiscountCode, DiscountUsage, Review, Affiliate, Referral, WebhookLog, AdminAuditLog, LoginAttempt, Session
  - Set up `src/lib/db.ts` Prisma client singleton
  - Create `.env.example` with all required environment variable keys
  - _Requirements: 3.7, 5.7, 12.5_

- [x] 2. Encryption utility
  - [x] 2.1 Implement `src/lib/crypto.ts` with AES-256-GCM `encrypt` and `decrypt` functions
    - Store IV and authTag alongside encrypted data
    - Read 32-byte key from `ENCRYPTION_KEY` env var
    - _Requirements: 5.7, 12.5_
  - [ ]* 2.2 Write property test for encrypt/decrypt round-trip
    - **Property 1: Round-trip consistency — `decrypt(encrypt(x)) === x` for all strings x**
    - **Validates: Requirements 5.7, 6.4**

- [x] 3. Authentication system
  - [x] 3.1 Configure NextAuth.js in `src/lib/auth.ts` with Credentials provider (email/password) and Google OAuth provider
    - Use bcrypt cost factor 12 for password hashing
    - Implement email verification token generation and session token issuance
    - _Requirements: 3.1, 3.2, 3.7_
  - [x] 3.2 Create auth API routes: register (`POST /api/auth/register`), verify email, password reset request, password reset confirm
    - Send verification email on registration via `src/lib/email.ts`
    - Reset link expires after 60 minutes
    - _Requirements: 3.3, 3.6_
  - [x] 3.3 Implement login attempt tracking and account lockout in `src/lib/auth.ts`
    - Lock account for 15 minutes after 3 failed attempts within 10 minutes
    - Send lockout notification email
    - _Requirements: 3.5_
  - [ ]* 3.4 Write unit tests for auth helpers
    - Test bcrypt hashing, lockout threshold logic, token expiry
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 4. Rate limiting and security middleware
  - Implement `src/lib/rate-limit.ts` with 60 req/min per IP using an in-memory sliding window
  - Apply middleware to all `/api/v1/*` routes via `src/middleware.ts`
  - Add input sanitization helper used in all API route handlers
  - _Requirements: 12.2, 12.4_

- [ ] 5. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 6. Product catalog — data layer and API
  - [x] 6.1 Implement `GET /api/v1/products` with pagination, category filter, price filter, and title search
    - Return results within 500ms; use Prisma indexed queries on `category` and `title`
    - Use JSON envelope `{ data, error, meta }`
    - _Requirements: 1.3, 1.4, 1.5, 13.1, 13.5_
  - [x] 6.2 Implement `GET /api/v1/products/:id` returning full product detail including average rating and related products (same category, limit 3)
    - _Requirements: 2.1, 2.2, 2.3, 13.4_
  - [ ]* 6.3 Write unit tests for product list and detail endpoints
    - Test out-of-stock flag, average rating calculation, related products logic
    - _Requirements: 1.6, 2.2, 2.3_

- [x] 7. Storefront UI — landing page and product listing
  - [x] 7.1 Build `HeroSection`, `CategoryNav`, `ProductCard`, and `ProductGrid` components in `src/components/storefront/`
    - `ProductCard` shows title, price, category, stock status, average rating
    - `ProductGrid` uses client-side filter state for category/price filters without full page reload
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [x] 7.2 Build the landing page (`src/app/(storefront)/page.tsx`) and product listing page (`src/app/(storefront)/products/page.tsx`) as React Server Components
    - Add meta title, meta description, and Open Graph tags to every public page via Next.js `generateMetadata`
    - _Requirements: 1.1, 1.7, 1.8_
  - [x] 7.3 Build the product detail page (`src/app/(storefront)/products/[id]/page.tsx`)
    - Display title, description, price, category, stock count, average rating, review list, related products, and Buy Now / Out of Stock button
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 8. Inventory management — encryption and bulk upload
  - [x] 8.1 Implement bulk stock upload handler (`POST /api/admin/products/[id]/inventory`)
    - Parse plain-text file, one credential per line
    - Encrypt each line with `lib/crypto.ts` before storing as `InventoryItem`
    - _Requirements: 6.1, 6.2, 5.7_
  - [x] 8.2 Implement inventory export (`GET /api/admin/products/[id]/inventory/export`)
    - Decrypt and return items as plain text, one per line
    - _Requirements: 6.3_
  - [ ]* 8.3 Write property test for inventory import/export round-trip
    - **Property 2: Import → export → import produces equivalent InventoryItem set**
    - **Validates: Requirements 6.4**
  - [x] 8.4 Implement low-stock detection: when `stockCount` reaches 0, email admin; when `stockCount` ≤ 5, fire Discord low-stock alert
    - _Requirements: 6.6, 11.5_

- [x] 9. Checkout and payment processing
  - [x] 9.1 Implement `POST /api/v1/checkout` — create pending Order, apply discount code if present, create Stripe Checkout session or crypto payment session, return redirect URL
    - Associate Order with authenticated user's session
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 12.3_
  - [x] 9.2 Implement `POST /api/v1/discount/validate` — validate code existence, expiry, usage limit, and per-user uniqueness
    - Return descriptive error on failure; do not proceed to payment
    - _Requirements: 8.2, 8.3, 8.5_
  - [x] 9.3 Implement Stripe webhook handler (`POST /api/webhooks/stripe`)
    - Verify `stripe-signature` header before processing
    - On `checkout.session.completed`: update Order to `paid`, trigger Delivery Engine
    - On `payment_intent.payment_failed`: update Order to `failed`, release reserved InventoryItem
    - Log every event to `WebhookLog`
    - _Requirements: 4.4, 4.5, 4.6, 4.8_
  - [x] 9.4 Implement NOWPayments webhook handler (`POST /api/webhooks/nowpayments`) and Cryptomus webhook handler (`POST /api/webhooks/cryptomus`)
    - Verify HMAC-SHA512 (NOWPayments) and MD5 (Cryptomus) signatures
    - Same state-transition logic as Stripe handler
    - _Requirements: 4.2, 4.4, 4.5, 4.6, 4.8_
  - [ ]* 9.5 Write unit tests for discount validation logic
    - Test expired, exhausted, per-user duplicate, and valid code scenarios
    - _Requirements: 8.2, 8.3, 8.5_

- [x] 10. Delivery Engine
  - [x] 10.1 Implement `src/lib/delivery.ts` — `deliverOrder(orderId)` and `retryDelivery(orderId)`
    - Atomically assign one `AVAILABLE` InventoryItem inside a Prisma transaction
    - Decrypt credentials, send delivery email, mark item `DELIVERED`, decrement `stockCount`, write `DeliveryLog`
    - If no stock: set Order to `PENDING_STOCK`, email admin, email customer
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 10.2 Wire Delivery Engine into webhook handlers (called after Order is set to `paid`)
    - Fire Discord webhook with order summary within 30 seconds
    - Implement retry with exponential backoff (up to 3 attempts) for Discord POST failures
    - _Requirements: 4.4, 11.1, 11.4_
  - [x] 10.3 Implement duplicate delivery detection: after `DeliveryLog` write, check for any other `DeliveryLog` referencing the same `InventoryItem`; flag and alert admin if found
    - _Requirements: 12.6_
  - [ ]* 10.4 Write unit tests for Delivery Engine
    - Test successful delivery, no-stock path, duplicate detection, and retry logic
    - _Requirements: 5.1, 5.2, 5.5, 12.6_

- [ ] 11. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 12. Email and notification service
  - Implement `src/lib/email.ts` abstracting Resend/Nodemailer
  - Templates: welcome email (req 11.2), delivery receipt (req 11.3), verification email (req 3.3), lockout notification (req 3.5), password reset (req 3.6), admin low-stock alert (req 6.6), admin pending-stock alert (req 5.5)
  - _Requirements: 3.3, 3.5, 3.6, 5.2, 5.5, 6.6, 11.2, 11.3_

- [x] 13. Discord webhook service
  - Implement `src/lib/discord.ts` with `sendDiscordNotification(url, payload)` and retry logic (3 attempts, exponential backoff)
  - Log permanent failures
  - _Requirements: 11.1, 11.4, 11.5_

- [x] 14. Reviews and ratings
  - [x] 14.1 Implement review submission endpoint (`POST /api/v1/reviews`)
    - Validate user has a completed Order for the product
    - Accept rating 1–5 and optional comment ≤ 1000 chars
    - Enforce one review per user per product
    - Recalculate and update `Product.avgRating` in the same transaction
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ]* 14.2 Write property test for average rating recalculation
    - **Property 3: avgRating equals arithmetic mean of all Review ratings for a Product**
    - **Validates: Requirements 2.2, 10.4**

- [x] 15. Affiliate and referral system
  - [x] 15.1 Implement affiliate opt-in (`POST /api/v1/affiliate/join`) — generate unique referral code, create `Affiliate` record
    - _Requirements: 9.1_
  - [x] 15.2 Implement referral tracking middleware: on registration with `?ref=CODE`, associate new User with Affiliate via `Referral` record
    - _Requirements: 9.2_
  - [x] 15.3 Implement commission crediting in Delivery Engine: after successful delivery, credit `Affiliate.pendingPayout` by `commissionPct * order.amount`
    - _Requirements: 9.3_
  - [x] 15.4 Implement affiliate dashboard data endpoint (`GET /api/v1/affiliate/stats`) returning total referrals, total earned, pending payout
    - _Requirements: 9.4_

- [x] 16. Customer dashboard
  - Build `src/app/dashboard/page.tsx` as a server component
  - Display all delivery logs for the authenticated user including decrypted credentials/license keys
  - Display order history with status
  - _Requirements: 5.6, 7.6_

- [x] 17. Admin panel
  - [x] 17.1 Implement admin route protection middleware: restrict all `/admin/*` routes to `role === ADMIN`; return 403 and redirect non-admins
    - _Requirements: 7.1, 7.2_
  - [x] 17.2 Build product CRUD pages (`/admin/products`) with server actions
    - Validate title, price, category, description before saving
    - Prevent deletion of products with pending/paid orders
    - _Requirements: 7.3, 6.7_
  - [x] 17.3 Build inventory management page (`/admin/products/[id]/inventory`) with bulk upload UI and export button
    - Display total, delivered, and available stock counts
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - [x] 17.4 Build order list page (`/admin/orders`) showing Order ID, customer email, product title, amount, status, timestamp
    - Include manual re-delivery button for Orders with status `paid` and no `DeliveryLog`
    - _Requirements: 7.6, 7.7_
  - [x] 17.5 Build analytics dashboard (`/admin`) with total revenue, total orders, orders by status, top-selling products, new user registrations for a selectable date range
    - _Requirements: 7.4_
  - [x] 17.6 Build user list page (`/admin/users`) showing email, registration date, total orders, total spend
    - _Requirements: 7.5_
  - [x] 17.7 Build discount code management pages (`/admin/discounts`) — create/list discount codes with type, value, usage limit, expiry
    - _Requirements: 8.1_
  - [x] 17.8 Build affiliate management page (`/admin/affiliates`) and settings page (`/admin/settings`) for Discord webhook URL and global commission percentage
    - _Requirements: 9.5, 11.1_
  - [x] 17.9 Implement admin audit logging: wrap all admin server actions to write `AdminAuditLog` entries with adminId, action, entityType, entityId, timestamp
    - _Requirements: 12.7_

- [x] 18. Public REST API — authenticated endpoints and OpenAPI spec
  - [x] 18.1 Implement `GET /api/v1/orders` and `GET /api/v1/orders/:id/delivery` with Bearer token auth
    - Return 401 with descriptive message on invalid/expired token
    - _Requirements: 13.2, 13.3, 13.4_
  - [x] 18.2 Generate OpenAPI 3.0 spec and serve it at `GET /api/v1/docs`
    - Cover all endpoints listed in the design
    - _Requirements: 13.6_
  - [ ]* 18.3 Write unit tests for API envelope structure
    - **Property 4: Every API response contains `data`, `error`, and `meta` fields**
    - **Validates: Requirements 13.5**

- [x] 19. Discount code increment and per-user enforcement wiring
  - On successful Order creation with a discount code, increment `DiscountCode.usageCount` and write `DiscountUsage` record in the same transaction as Order creation
  - _Requirements: 8.4, 8.5_

- [x] 20. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties; unit tests cover specific examples and edge cases
