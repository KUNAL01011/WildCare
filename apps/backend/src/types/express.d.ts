import "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "citizen" | "admin";
      };
    }
  }
}

export {};
