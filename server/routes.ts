import type { Express } from "express";
import { createServer, type Server } from "http";
import { convertRegexToDFA, validateRegex } from "./regex2dfa";
import { convertRequestSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/convert", async (req, res) => {
    try {
      const parseResult = convertRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Validation Error",
          message: parseResult.error.errors.map(e => e.message).join(", "),
        });
      }

      const { regex } = parseResult.data;
      
      const validationError = validateRegex(regex);
      if (validationError) {
        return res.status(400).json({
          error: "Invalid Regex",
          message: validationError,
        });
      }

      const result = convertRegexToDFA(regex);
      
      return res.json({
        regex,
        syntaxTree: result.syntaxTree,
        dfa: result.dfa,
        explanation: result.explanation,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      return res.status(500).json({
        error: "Conversion Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  });

  return httpServer;
}
