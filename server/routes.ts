import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { weeklyRecapService } from "./services/weekly-recap-service";
import { setupAuth, requireAuth } from "./auth";
import { customEmailService } from "./services/custom-email-service";
import { xpostService } from "./services/xpost-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // ============ AUTH ROUTES ============

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message?: string }) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }
    res.status(401).json({ error: "Not authenticated" });
  });

  // ============ EMAIL TEMPLATE ROUTES ============

  // Get all email templates
  app.get("/api/admin/templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get single template
  app.get("/api/admin/templates/:id", requireAuth, async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // Create template
  app.post("/api/admin/templates", requireAuth, async (req, res) => {
    try {
      const { name, subject, headerImageUrl, content } = req.body;
      const user = req.user as any;

      const template = await storage.createEmailTemplate({
        name,
        subject,
        headerImageUrl,
        content: typeof content === "string" ? content : JSON.stringify(content),
        createdBy: user.id,
      });

      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // Update template
  app.put("/api/admin/templates/:id", requireAuth, async (req, res) => {
    try {
      const { name, subject, headerImageUrl, content } = req.body;

      const template = await storage.updateEmailTemplate(req.params.id, {
        name,
        subject,
        headerImageUrl,
        content: typeof content === "string" ? content : JSON.stringify(content),
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  // Delete template
  app.delete("/api/admin/templates/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteEmailTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // ============ EMAIL SENDING ROUTES ============

  // Send custom email to specific recipients
  app.post("/api/admin/send-email", requireAuth, async (req, res) => {
    try {
      const { recipients, subject, headerImageUrl, content } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: "Recipients are required" });
      }

      const result = await customEmailService.sendCustomEmail({
        recipients,
        subject,
        headerImageUrl,
        content,
      });

      res.json(result);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Generate preview HTML for email
  app.post("/api/admin/preview-email", requireAuth, async (req, res) => {
    try {
      const { subject, headerImageUrl, content } = req.body;

      const html = customEmailService.generateEmailHTML({
        subject,
        headerImageUrl,
        content,
      });

      res.json({ html });
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).json({ error: "Failed to generate preview" });
    }
  });

  // Generate AI icon based on text
  app.post("/api/admin/generate-icon", requireAuth, async (req, res) => {
    try {
      const { text, style } = req.body;

      const iconUrl = await customEmailService.generateIcon(text, style);

      res.json({ iconUrl });
    } catch (error) {
      console.error("Error generating icon:", error);
      res.status(500).json({ error: "Failed to generate icon" });
    }
  });

  // Upload image for email header
  app.post("/api/admin/upload-image", requireAuth, async (req, res) => {
    try {
      const { imageData, filename } = req.body;

      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const imageUrl = await customEmailService.uploadImage(imageData, filename);

      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // ============ X POST ROUTES ============

  // Get all draft posts awaiting approval
  app.get('/api/x-posts/drafts', requireAuth, async (req, res) => {
    try {
      const drafts = await xpostService.getDrafts();
      res.json(drafts);
    } catch (error) {
      console.error('Error fetching X post drafts:', error);
      res.status(500).json({ error: 'Failed to fetch drafts' });
    }
  });

  // Get post history
  app.get('/api/x-posts/history', requireAuth, async (req, res) => {
    try {
      const history = await xpostService.getHistory();
      res.json(history);
    } catch (error) {
      console.error('Error fetching X post history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Approve a draft
  app.post('/api/x-posts/approve', requireAuth, async (req, res) => {
    try {
      const { id, selectedVariation, editedContent } = req.body;
      if (!id || !selectedVariation) {
        return res.status(400).json({ error: 'id and selectedVariation are required' });
      }
      await xpostService.approveDraft(id, selectedVariation, editedContent);
      res.json({ success: true });
    } catch (error) {
      console.error('Error approving draft:', error);
      res.status(500).json({ error: 'Failed to approve draft' });
    }
  });

  // Reject a draft
  app.post('/api/x-posts/reject', requireAuth, async (req, res) => {
    try {
      const { id, reason } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      await xpostService.rejectDraft(id, reason);
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting draft:', error);
      res.status(500).json({ error: 'Failed to reject draft' });
    }
  });

  // Mark an approved post as posted
  app.post('/api/x-posts/mark-posted', requireAuth, async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      await xpostService.markPosted(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking post as posted:', error);
      res.status(500).json({ error: 'Failed to mark as posted' });
    }
  });

  // Manual generation trigger
  app.post('/api/x-posts/generate', requireAuth, async (req, res) => {
    try {
      await xpostService.generateDailyDraft();
      res.json({ success: true });
    } catch (error) {
      console.error('Error generating X post drafts:', error);
      res.status(500).json({ error: 'Failed to generate drafts' });
    }
  });

  // ============ EXISTING ROUTES ============

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
