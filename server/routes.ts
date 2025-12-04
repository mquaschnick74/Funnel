import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { weeklyRecapService } from "./services/weekly-recap-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Test endpoint to manually trigger weekly recap emails
  app.post("/api/test/trigger-weekly-recap", async (req, res) => {
    try {
      console.log("🧪 Manual trigger of weekly recap emails...");
      await weeklyRecapService.processWeeklyRecaps();
      res.json({ success: true, message: "Weekly recap processing completed" });
    } catch (error) {
      console.error("Error triggering weekly recap:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
