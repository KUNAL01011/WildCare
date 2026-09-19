import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "TransitOps API",
    version: "1.0.0",
    description: "API documentation for TransitOps",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "httpOnly accessToken cookie set on login",
      },
      verificationToken: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Short-lived JWT returned from /register, used for /verify-email and /resend-otp",
      },
    },
    responses: {
      ValidationError: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request data",
                details: { email: ["Invalid email address"] },
              },
            },
          },
        },
      },
      UnauthorizedError: {
        description: "Authentication required or token invalid",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: { code: "INVALID_ACCESS_TOKEN", message: "Invalid or expired access token" },
            },
          },
        },
      },
      RateLimitError: {
        description: "Too many requests",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid request data" },
              details: { type: "object", additionalProperties: true },
            },
            required: ["code", "message"],
          },
        },
        required: ["success", "error"],
      },
      MessageResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              message: { type: "string", example: "Operation successful" },
            },
            required: ["message"],
          },
        },
        required: ["success", "data"],
      },
      // ── Register ─────────────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Kunal Kumar" },
          email: { type: "string", format: "email", example: "kunal@example.com" },
          password: { type: "string", format: "password", example: "StrongPass123!" },
        },
      },
      RegisterResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              verificationToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." },
            },
            required: ["verificationToken"],
          },
        },
      },
      // ── Verify Email ──────────────────────────────────────────────────────
      VerifyEmailRequest: {
        type: "object",
        required: ["otp"],
        properties: {
          otp: { type: "string", example: "482910", minLength: 6, maxLength: 6 },
        },
      },
      // ── Login ─────────────────────────────────────────────────────────────
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "kunal@example.com" },
          password: { type: "string", format: "password", example: "StrongPass123!" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/UserProfile" },
            },
          },
        },
      },
      // ── Me ────────────────────────────────────────────────────────────────
      MeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/UserProfile" },
            },
          },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          name: { type: "string", example: "Kunal Kumar" },
          email: { type: "string", format: "email", example: "kunal@example.com" },
          emailVerified: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "emailVerified", "createdAt"],
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: ["./src/**/*.routes.ts"],
});