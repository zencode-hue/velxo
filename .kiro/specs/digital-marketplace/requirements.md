# Requirements Document

## Introduction

Velxo is a premium SaaS-level digital product marketplace for selling streaming subscriptions, AI tools, software licenses, and gaming products. The platform provides instant automated delivery of digital credentials and license keys after payment, a high-conversion storefront with a dark/premium UI, a full admin panel, and advanced features including discount codes, affiliate referrals, reviews, and email automation. It is fully self-hosted and independent of third-party storefront providers like SellAuth.

## Glossary

- **System**: The Velxo web application as a whole
- **Storefront**: The public-facing product listing and landing pages
- **Marketplace**: The product catalog and purchasing flow
- **Delivery_Engine**: The subsystem responsible for automatically delivering digital credentials or license keys after a confirmed payment
- **Inventory**: The pool of undelivered digital accounts, credentials, or license keys associated with a product
- **Order**: A confirmed purchase record linking a User, Product, Payment, and delivered InventoryItem
- **User**: An authenticated customer with an account on the platform
- **Admin**: An authenticated operator with elevated privileges to manage products, inventory, orders, and users
- **Payment_Processor**: The external payment gateway (Stripe or crypto provider) handling transaction authorization
- **Webhook**: An HTTP callback sent by the Payment_Processor to confirm payment status
- **InventoryItem**: A single deliverable unit (account credentials or license key) belonging to a Product's stock
- **Discount_Code**: A redeemable alphanumeric code that reduces the price of an order
- **Affiliate**: A User who earns a commission when referred customers complete purchases
- **Review**: A star rating and optional text comment left by a User on a purchased Product
- **Discord_Webhook**: An outbound HTTP POST to a Discord channel URL triggered by system events
- **OTP**: One-time password used for email-based verification flows

---

## Requirements

### Requirement 1: Product Catalog and Storefront

**User Story:** As a visitor, I want to browse available digital products by category, so that I can find and evaluate products before purchasing.

#### Acceptance Criteria

1. THE Storefront SHALL display a landing page with a hero section, featured products, product categories, and a call-to-action within the initial viewport.
2. THE Marketplace SHALL organize products into at least four categories: Streaming, AI Tools, Software, and Gaming.
3. WHEN a visitor navigates to the product listing page, THE Marketplace SHALL display product cards each containing the product title, price, category, stock availability status, and average rating.
4. WHEN a visitor enters a search query, THE Marketplace SHALL return matching products filtered by title or category within 500ms.
5. WHEN a visitor applies a category or price filter, THE Marketplace SHALL update the product listing to show only matching products without a full page reload.
6. WHEN a product has zero InventoryItems remaining, THE Marketplace SHALL display the product as "Out of Stock" and disable the purchase button.
7. THE Storefront SHALL render all public pages with a Lighthouse performance score of 90 or above on mobile.
8. THE Storefront SHALL include meta title, meta description, and Open Graph tags on every public page for SEO.

---

### Requirement 2: Product Detail Page

**User Story:** As a visitor, I want to view detailed information about a product, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a visitor navigates to a product detail page, THE Marketplace SHALL display the product title, description, price, category, stock count, average rating, and review list.
2. WHEN a product has one or more Reviews, THE Marketplace SHALL display the average star rating calculated from all submitted Review scores.
3. WHEN a visitor views a product detail page, THE Marketplace SHALL display up to three related products from the same category as upsell suggestions.
4. WHEN a product is in stock, THE Marketplace SHALL display an active "Buy Now" button on the product detail page.
5. WHEN a product is out of stock, THE Marketplace SHALL display a disabled purchase button and an "Out of Stock" label on the product detail page.

---

### Requirement 3: Authentication System

**User Story:** As a visitor, I want to create an account and log in securely, so that I can access my purchases and manage my profile.

#### Acceptance Criteria

1. THE System SHALL support account registration using an email address and password.
2. THE System SHALL support account registration and login using Google OAuth.
3. WHEN a User registers with email and password, THE System SHALL send a verification email containing a one-time link before activating the account.
4. WHEN a User submits login credentials, THE System SHALL authenticate the User and issue a session token within 2 seconds.
5. IF a User submits incorrect credentials three or more times within 10 minutes, THEN THE System SHALL temporarily lock the account for 15 minutes and notify the User by email.
6. WHEN a User requests a password reset, THE System SHALL send a reset link to the registered email address that expires after 60 minutes.
7. THE System SHALL store all passwords using a bcrypt hash with a minimum cost factor of 12.
8. WHEN a User's session token expires, THE System SHALL redirect the User to the login page.

---

### Requirement 4: Payment Processing

**User Story:** As a customer, I want to pay for products using a card or cryptocurrency, so that I can complete purchases using my preferred payment method.

#### Acceptance Criteria

1. THE System SHALL support card payments via Stripe Checkout.
2. THE System SHALL support cryptocurrency payments via a NOWPayments or Cryptomus integration.
3. WHEN a customer initiates checkout, THE System SHALL create a pending Order record before redirecting to the Payment_Processor.
4. WHEN the Payment_Processor sends a confirmed payment Webhook, THE System SHALL update the Order status to "paid" and trigger the Delivery_Engine within 5 seconds of receiving the Webhook.
5. IF the Payment_Processor sends a failed or cancelled payment Webhook, THEN THE System SHALL update the Order status to "failed" and release any reserved InventoryItem back to available stock.
6. THE System SHALL validate the authenticity of every incoming Webhook using the Payment_Processor's signature verification mechanism before processing it.
7. WHEN a Discount_Code is applied at checkout, THE System SHALL calculate the discounted total and pass it to the Payment_Processor before the payment session is created.
8. THE System SHALL log every Webhook event with its payload, timestamp, and processing result for audit purposes.

---

### Requirement 5: Instant Delivery System

**User Story:** As a customer, I want to receive my purchased digital product immediately after payment, so that I can start using it without delay.

#### Acceptance Criteria

1. WHEN an Order status is set to "paid", THE Delivery_Engine SHALL assign one available InventoryItem from the purchased Product's stock to the Order.
2. WHEN an InventoryItem is assigned to an Order, THE Delivery_Engine SHALL send a delivery email to the customer containing the credentials or license key within 60 seconds of payment confirmation.
3. WHEN an InventoryItem is assigned to an Order, THE Delivery_Engine SHALL mark that InventoryItem as "delivered" and decrement the Product's available stock count.
4. WHEN a delivery email is sent, THE Delivery_Engine SHALL record a delivery log entry containing the Order ID, User ID, Product ID, InventoryItem ID, and timestamp.
5. IF no InventoryItem is available at the time of payment confirmation, THEN THE Delivery_Engine SHALL mark the Order as "pending_stock", notify the Admin via email, and notify the customer that delivery is delayed.
6. WHEN a logged-in User views their dashboard, THE System SHALL display all delivery logs associated with that User's Orders, including the delivered credentials or license keys.
7. THE Delivery_Engine SHALL encrypt all stored InventoryItem credentials at rest using AES-256 encryption.

---

### Requirement 6: Inventory Management

**User Story:** As an admin, I want to manage product stock by uploading credentials and license keys in bulk, so that the store always has available inventory.

#### Acceptance Criteria

1. WHEN an Admin uploads a bulk stock file for a Product, THE System SHALL parse each line as a separate InventoryItem and associate it with the Product.
2. THE System SHALL parse bulk stock files in plain text format with one credential or key per line.
3. THE Pretty_Printer SHALL export a Product's current InventoryItem list as a plain text file with one item per line.
4. FOR ALL valid InventoryItem lists, importing then exporting then importing SHALL produce an equivalent set of InventoryItems (round-trip property).
5. WHEN an Admin views a Product in the admin panel, THE System SHALL display the total stock count, delivered count, and remaining available count.
6. WHEN a Product's available stock count reaches zero, THE System SHALL send an alert notification to the Admin's registered email address.
7. IF an Admin attempts to delete a Product that has pending or paid Orders, THEN THE System SHALL prevent deletion and display an error message.

---

### Requirement 7: Admin Panel

**User Story:** As an admin, I want a centralized panel to manage all aspects of the store, so that I can operate the business efficiently.

#### Acceptance Criteria

1. THE System SHALL restrict access to all admin panel routes to authenticated Users with the "admin" role.
2. IF a non-admin User attempts to access an admin route, THEN THE System SHALL return a 403 response and redirect to the storefront.
3. WHEN an Admin creates or updates a Product, THE System SHALL validate that the title, price, category, and description fields are present before saving.
4. WHEN an Admin views the analytics dashboard, THE System SHALL display total revenue, total orders, orders by status, top-selling products, and new user registrations for a selectable date range.
5. WHEN an Admin views the user list, THE System SHALL display each User's email, registration date, total orders, and total spend.
6. WHEN an Admin views the order list, THE System SHALL display each Order's ID, customer email, product title, amount paid, status, and creation timestamp.
7. THE System SHALL allow an Admin to manually trigger re-delivery for a specific Order that has status "paid" but no associated delivery log.

---

### Requirement 8: Discount Codes

**User Story:** As an admin, I want to create discount codes, so that I can run promotions and increase conversions.

#### Acceptance Criteria

1. WHEN an Admin creates a Discount_Code, THE System SHALL store the code string, discount type (percentage or fixed amount), discount value, usage limit, and expiry date.
2. WHEN a customer applies a Discount_Code at checkout, THE System SHALL validate that the code exists, has not exceeded its usage limit, and has not passed its expiry date.
3. IF a Discount_Code is invalid, expired, or exhausted, THEN THE System SHALL return a descriptive error message to the customer without proceeding to payment.
4. WHEN a Discount_Code is successfully applied to an Order, THE System SHALL increment the code's usage count by one.
5. THE System SHALL prevent a single User from applying the same Discount_Code more than once per account.

---

### Requirement 9: Affiliate and Referral System

**User Story:** As a user, I want to earn commissions by referring new customers, so that I can generate passive income from the platform.

#### Acceptance Criteria

1. WHEN a User opts into the affiliate program, THE System SHALL generate a unique referral link for that User.
2. WHEN a new visitor registers using a referral link, THE System SHALL associate the new User's account with the referring Affiliate.
3. WHEN a referred User completes a paid Order, THE System SHALL credit the Affiliate's account with a commission calculated as a configurable percentage of the Order total.
4. WHEN an Affiliate views their dashboard, THE System SHALL display total referrals, total commissions earned, and pending payout balance.
5. THE System SHALL allow an Admin to configure the global affiliate commission percentage from the admin panel.

---

### Requirement 10: Reviews and Ratings

**User Story:** As a customer, I want to leave a review on a product I purchased, so that I can share my experience with other buyers.

#### Acceptance Criteria

1. WHEN a User submits a Review, THE System SHALL validate that the User has a completed Order for the reviewed Product before saving the Review.
2. WHEN a User submits a Review, THE System SHALL accept a star rating between 1 and 5 and an optional text comment of up to 1000 characters.
3. THE System SHALL allow each User to submit at most one Review per Product.
4. WHEN a Review is submitted, THE System SHALL recalculate and update the Product's average rating.
5. IF a User attempts to submit a second Review for the same Product, THEN THE System SHALL return an error indicating a review already exists for that product.

---

### Requirement 11: Notifications and Integrations

**User Story:** As an admin, I want automated notifications for key events, so that I can monitor store activity in real time.

#### Acceptance Criteria

1. WHEN an Order is confirmed as paid, THE System SHALL send a POST request to the configured Discord_Webhook URL containing the order summary within 30 seconds.
2. WHEN a new User registers, THE System SHALL send a welcome email containing a link to the product catalog.
3. WHEN an Order delivery is completed, THE System SHALL send a receipt email to the customer containing the Order ID, product name, amount paid, and a link to the user dashboard.
4. IF the Discord_Webhook POST request fails, THEN THE System SHALL retry the request up to three times with exponential backoff before logging a permanent failure.
5. WHERE an Admin has configured a Discord_Webhook URL, THE System SHALL send a low-stock alert to the Discord channel when a Product's available stock drops to five or fewer InventoryItems.

---

### Requirement 12: Security and Anti-Fraud

**User Story:** As a platform operator, I want security controls in place, so that the store is protected against fraud and data breaches.

#### Acceptance Criteria

1. THE System SHALL enforce HTTPS on all routes.
2. THE System SHALL apply rate limiting of 60 requests per minute per IP address on all public API endpoints.
3. WHEN a payment is initiated, THE System SHALL associate the pending Order with the authenticated User's session to prevent order hijacking.
4. THE System SHALL sanitize all user-supplied input before storing it in the database to prevent SQL injection and XSS attacks.
5. THE System SHALL store all InventoryItem credentials encrypted at rest and decrypt them only at the point of delivery.
6. IF the same InventoryItem credentials are detected in more than one delivered Order, THEN THE System SHALL flag the duplicate delivery and alert the Admin.
7. THE System SHALL log all admin actions (create, update, delete) with the Admin's User ID and a timestamp for audit purposes.

---

### Requirement 13: Public API

**User Story:** As a developer, I want a documented REST API, so that I can build a mobile app or integrate with external tools.

#### Acceptance Criteria

1. THE System SHALL expose a versioned REST API under the `/api/v1` path prefix.
2. THE System SHALL require a valid Bearer token for all authenticated API endpoints.
3. WHEN an API request is made with an invalid or expired token, THE System SHALL return a 401 response with a descriptive error message.
4. THE System SHALL provide API endpoints for: listing products, retrieving a product by ID, retrieving the authenticated user's orders, and retrieving delivery details for a specific order.
5. THE System SHALL return all API responses in JSON format with a consistent envelope structure containing `data`, `error`, and `meta` fields.
6. THE System SHALL provide an OpenAPI 3.0 specification document accessible at `/api/v1/docs`.
