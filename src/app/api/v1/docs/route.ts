import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Velxo API",
    version: "1.0.0",
    description: "REST API for the Velxo digital product marketplace.",
  },
  servers: [{ url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          data: { nullable: true },
          error: { type: "string", nullable: true },
          meta: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/products": {
      get: {
        summary: "List products",
        tags: ["Products"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "category", in: "query", schema: { type: "string", enum: ["STREAMING", "AI_TOOLS", "SOFTWARE", "GAMING"] } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Product list" } },
      },
    },
    "/products/{id}": {
      get: {
        summary: "Get product by ID",
        tags: ["Products"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product detail" }, "404": { description: "Not found" } },
      },
    },
    "/checkout": {
      post: {
        summary: "Create checkout session",
        tags: ["Checkout"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "paymentProvider"],
                properties: {
                  productId: { type: "string" },
                  discountCode: { type: "string" },
                  paymentProvider: { type: "string", enum: ["stripe", "nowpayments", "cryptomus"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Redirect URL" }, "400": { description: "Validation error" } },
      },
    },
    "/discount/validate": {
      post: {
        summary: "Validate a discount code",
        tags: ["Discounts"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: { code: { type: "string" }, productId: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Validation result" }, "400": { description: "Invalid code" } },
      },
    },
    "/orders": {
      get: {
        summary: "List authenticated user orders",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Order list" }, "401": { description: "Unauthorized" } },
      },
    },
    "/orders/{id}/delivery": {
      get: {
        summary: "Get delivery details for an order",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Delivery details with credentials" }, "404": { description: "Not found" } },
      },
    },
    "/reviews": {
      post: {
        summary: "Submit a product review",
        tags: ["Reviews"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "rating"],
                properties: {
                  productId: { type: "string" },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string", maxLength: 1000 },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Review created" }, "403": { description: "Must purchase first" } },
      },
    },
    "/affiliate/join": {
      post: {
        summary: "Join the affiliate program",
        tags: ["Affiliate"],
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Affiliate created with referral link" } },
      },
    },
    "/affiliate/stats": {
      get: {
        summary: "Get affiliate stats",
        tags: ["Affiliate"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Referral stats" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
