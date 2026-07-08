import { createFileRoute } from "@tanstack/react-router"
import { buildResponse } from "../../components/server/buildResponse"

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Expendas API",
    version: "1.0.0",
    description: "API for Expendas financial management application",
  },
  servers: [{ url: "/api", description: "API server" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description:
          "API key authentication via Bearer token in Authorization header",
      },
      SessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "expendas-session",
        description: "Session cookie authentication (set after login)",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          firstName: { type: "string", nullable: true },
          lastName: { type: "string", nullable: true },
          email: { type: "string", format: "email" },
        },
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "integer" },
          message: { type: "string" },
        },
      },
      ApiKey: {
        type: "object",
        properties: {
          id: { type: "integer" },
          key: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }, { SessionCookie: [] }],
  paths: {
    "/login": {
      get: {
        summary: "Check login status",
        tags: ["Auth"],
        security: [{ SessionCookie: [] }],
        responses: {
          "200": {
            description: "User is logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "401": { description: "Not authenticated" },
        },
      },
      post: {
        summary: "Login",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "400": { description: "Invalid credentials" },
        },
      },
      delete: {
        summary: "Logout",
        tags: ["Auth"],
        security: [{ SessionCookie: [] }],
        responses: { "204": { description: "Logged out" } },
      },
    },
    "/register": {
      post: {
        summary: "Register new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "organizationName"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  organizationName: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Registration successful" } },
      },
    },
    "/forgotPassword": {
      post: {
        summary: "Request password reset",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: { "200": { description: "Reset email sent" } },
      },
    },
    "/resetPassword": {
      post: {
        summary: "Reset password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["authCode", "password"],
                properties: {
                  authCode: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Password reset successful" } },
      },
    },
    "/organizations": {
      get: {
        summary: "List organizations",
        tags: ["Organizations"],
        responses: {
          "200": {
            description: "List of organizations for the current user",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create organization",
        tags: ["Organizations"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Organization created" } },
      },
    },
    "/organizations/{id}": {
      get: {
        summary: "Get organization details",
        tags: ["Organizations"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Organization details" } },
      },
      put: {
        summary: "Update organization",
        tags: ["Organizations"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Organization updated" } },
      },
      delete: {
        summary: "Delete organization",
        tags: ["Organizations"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Organization deleted" } },
      },
    },
    "/organizations/{id}/accounts": {
      get: {
        summary: "List accounts",
        tags: ["Accounts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of accounts" } },
      },
      post: {
        summary: "Create account",
        tags: ["Accounts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Account created" } },
      },
    },
    "/organizations/{id}/accounts/{accountId}": {
      get: {
        summary: "Get account details",
        tags: ["Accounts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "accountId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Account details" } },
      },
      put: {
        summary: "Update account",
        tags: ["Accounts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "accountId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Account updated" } },
      },
      delete: {
        summary: "Delete account",
        tags: ["Accounts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "accountId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Account deleted" } },
      },
    },
    "/organizations/{id}/payments": {
      get: {
        summary: "List payments",
        tags: ["Payments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of payments" } },
      },
      post: {
        summary: "Create payment",
        tags: ["Payments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Payment created" } },
      },
    },
    "/organizations/{id}/payments/{paymentId}": {
      get: {
        summary: "Get payment details",
        tags: ["Payments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "paymentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Payment details" } },
      },
      put: {
        summary: "Update payment",
        tags: ["Payments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "paymentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Payment updated" } },
      },
      delete: {
        summary: "Delete payment",
        tags: ["Payments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "paymentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Payment deleted" } },
      },
    },
    "/organizations/{id}/tasks": {
      get: {
        summary: "List tasks",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "startDate",
            in: "query",
            required: true,
            description: "Start date for task range (format: YYYY-MM-DD)",
            schema: { type: "string", format: "date" },
          },
          {
            name: "endDate",
            in: "query",
            required: true,
            description: "End date for task range (format: YYYY-MM-DD)",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: { "200": { description: "List of tasks" } },
      },
    },
    "/organizations/{id}/tasks/groups": {
      get: {
        summary: "List task groups",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of task groups" } },
      },
      post: {
        summary: "Create task group",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Task group created" } },
      },
    },
    "/organizations/{id}/tasks/schedules": {
      get: {
        summary: "List task schedules",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of task schedules" } },
      },
      post: {
        summary: "Create task schedule",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Task schedule created" } },
      },
    },
    "/organizations/{id}/retirementPlans": {
      get: {
        summary: "List retirement plans",
        tags: ["Retirement"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of retirement plans" } },
      },
      post: {
        summary: "Create retirement plan",
        tags: ["Retirement"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Retirement plan created" } },
      },
    },
    "/organizations/{id}/receipts": {
      get: {
        summary: "List receipts",
        tags: ["Receipts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of receipts" } },
      },
      post: {
        summary: "Create receipt",
        tags: ["Receipts"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Receipt created" } },
      },
    },
    "/organizations/{id}/taxRecords": {
      get: {
        summary: "List tax records",
        tags: ["Tax Records"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of tax records" } },
      },
      post: {
        summary: "Create tax record",
        tags: ["Tax Records"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Tax record created" } },
      },
    },
    "/organizations/{id}/mealsOut": {
      get: {
        summary: "List meals out",
        tags: ["Meals Out"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of meals out" } },
      },
      post: {
        summary: "Create meal out entry",
        tags: ["Meals Out"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Meal out entry created" } },
      },
    },
    "/organizations/{id}/fixedIncomeAssets": {
      get: {
        summary: "List fixed income assets",
        tags: ["Fixed Income"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of fixed income assets" } },
      },
      post: {
        summary: "Create fixed income asset",
        tags: ["Fixed Income"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Fixed income asset created" } },
      },
    },
    "/organizations/{id}/investments/assets": {
      get: {
        summary: "List investment assets",
        tags: ["Investments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "List of investment assets" } },
      },
      post: {
        summary: "Create investment asset",
        tags: ["Investments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Investment asset created" } },
      },
    },
    "/api-keys": {
      get: {
        summary: "List API keys",
        tags: ["API Keys"],
        responses: {
          "200": {
            description: "List of API keys for the current user",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ApiKey" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create API key",
        tags: ["API Keys"],
        responses: {
          "200": {
            description: "API key created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiKey" },
              },
            },
          },
        },
      },
    },
    "/api-keys/{id}": {
      delete: {
        summary: "Revoke API key",
        tags: ["API Keys"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "API key revoked" } },
      },
    },
    "/tickerPrices": {
      get: {
        summary: "Get ticker prices",
        tags: ["Ticker Prices"],
        responses: { "200": { description: "Ticker prices" } },
      },
    },
    "/organizations/{id}/dates": {
      get: {
        summary: "Get date cycles",
        tags: ["Dates"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Date cycles" } },
      },
    },
    "/organizations/{id}/export": {
      get: {
        summary: "Export organization data",
        tags: ["Export"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Exported data" } },
      },
    },
    "/organizations/{id}/plaid/linkToken": {
      post: {
        summary: "Create Plaid link token",
        tags: ["Plaid"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Link token created" } },
      },
    },
    "/organizations/{id}/plaid/credential": {
      post: {
        summary: "Save Plaid credential",
        tags: ["Plaid"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Credential saved" } },
      },
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI specification",
        tags: ["Docs"],
        responses: { "200": { description: "OpenAPI specification" } },
      },
    },
  },
}

export const Route = createFileRoute("/api/openapi")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (session) => {
          return new Response(JSON.stringify(spec), {
            headers: { "Content-Type": "application/json" },
          })
        })
      },
    },
  },
})
