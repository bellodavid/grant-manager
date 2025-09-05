import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import {
  insertCallSchema,
  insertProposalSchema,
  insertBudgetLineSchema,
  insertReviewSchema,
  insertUserSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = /\.(pdf|doc|docx|txt|csv|xlsx|png|jpg|jpeg)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let roles = await storage.getUserRoles(userId);
      
      // If user has no roles, assign default researcher role
      if (roles.length === 0) {
        await storage.assignUserRole(userId, "researcher");
        roles = ["researcher"];
      }
      
      res.json({ ...user, roles });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Recent activity
  app.get("/api/dashboard/activity", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Test endpoint
  app.get("/api/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const roles = await storage.getUserRoles(userId);
      res.json({ userId, user, roles, message: "Test successful" });
    } catch (error) {
      console.error("Test error:", error);
      res.status(500).json({ message: "Test failed", error: error.message });
    }
  });

  // Call management
  app.get("/api/calls", async (req, res) => {
    try {
      const status = req.query.status as string;
      const calls = await storage.getCalls(status);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  app.get("/api/calls/:id", async (req, res) => {
    try {
      const call = await storage.getCall(req.params.id);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json(call);
    } catch (error) {
      console.error("Error fetching call:", error);
      res.status(500).json({ message: "Failed to fetch call" });
    }
  });

  app.post("/api/calls", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Creating call for user:", userId);
      console.log("Request body:", req.body);
      
      const roles = await storage.getUserRoles(userId);
      console.log("User roles:", roles);
      
      // Auto-assign grant_manager role if user doesn't have it
      if (!roles.includes("grant_manager") && !roles.includes("super_admin")) {
        console.log("Assigning grant_manager role to user");
        await storage.assignUserRole(userId, "grant_manager");
      }
      
      // Transform dates from strings to Date objects and handle budget
      const transformedData = {
        ...req.body,
        openDate: new Date(req.body.openDate),
        closeDate: new Date(req.body.closeDate),
        budgetCap: req.body.budgetCap ? String(req.body.budgetCap) : null,
      };
      
      const validatedData = insertCallSchema.parse(transformedData);
      console.log("Validated data:", validatedData);
      
      const callData = {
        ...validatedData,
        createdBy: userId,
      };
      console.log("Call data to insert:", callData);
      
      const call = await storage.createCall(callData);
      console.log("Created call:", call);

      await storage.createAuditLog({
        userId,
        action: "create_call",
        resourceType: "call",
        resourceId: call.id,
        newValues: call,
      });

      res.status(201).json(call);
    } catch (error) {
      console.error("Error creating call:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to create call",
        error: error.message 
      });
    }
  });

  // Proposal management
  app.get("/api/proposals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roles = await storage.getUserRoles(userId);

      const filters: any = {};

      // If user is a researcher, only show their proposals
      if (roles.includes("researcher") && !roles.includes("grant_manager")) {
        filters.piUserId = userId;
      }

      if (req.query.callId) filters.callId = req.query.callId;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.search) filters.search = req.query.search;

      const proposals = await storage.getProposals(filters);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/:id", isAuthenticated, async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  app.post("/api/proposals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal({
        ...validatedData,
        piUserId: userId,
      });

      await storage.createAuditLog({
        userId,
        action: "create_proposal",
        resourceType: "proposal",
        resourceId: proposal.id,
        newValues: proposal,
      });

      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.put("/api/proposals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const proposalId = req.params.id;

      // Check if user owns the proposal
      const existingProposal = await storage.getProposal(proposalId);
      if (!existingProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const roles = await storage.getUserRoles(userId);
      if (
        existingProposal.piUserId !== userId &&
        !roles.includes("grant_manager")
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertProposalSchema.partial().parse(req.body);
      const proposal = await storage.updateProposal(proposalId, updates);

      await storage.createAuditLog({
        userId,
        action: "update_proposal",
        resourceType: "proposal",
        resourceId: proposal.id,
        oldValues: existingProposal,
        newValues: proposal,
      });

      res.json(proposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  app.post(
    "/api/proposals/:id/submit",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const proposalId = req.params.id;

        // Check if user owns the proposal
        const existingProposal = await storage.getProposal(proposalId);
        if (!existingProposal) {
          return res.status(404).json({ message: "Proposal not found" });
        }

        if (existingProposal.piUserId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }

        const proposal = await storage.submitProposal(proposalId);

        await storage.createAuditLog({
          userId,
          action: "submit_proposal",
          resourceType: "proposal",
          resourceId: proposal.id,
          oldValues: existingProposal,
          newValues: proposal,
        });

        res.json(proposal);
      } catch (error) {
        console.error("Error submitting proposal:", error);
        res.status(500).json({ message: "Failed to submit proposal" });
      }
    }
  );

  // Budget management
  app.get("/api/proposals/:id/budget", isAuthenticated, async (req, res) => {
    try {
      const budgetLines = await storage.getBudgetLines(req.params.id);
      res.json(budgetLines);
    } catch (error) {
      console.error("Error fetching budget lines:", error);
      res.status(500).json({ message: "Failed to fetch budget lines" });
    }
  });

  app.post(
    "/api/proposals/:id/budget",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const validatedData = insertBudgetLineSchema.parse(req.body);
        const budgetLine = await storage.createBudgetLine(
          req.params.id,
          validatedData
        );

        await storage.createAuditLog({
          userId,
          action: "create_budget_line",
          resourceType: "budget_line",
          resourceId: budgetLine.id,
          newValues: budgetLine,
        });

        res.status(201).json(budgetLine);
      } catch (error) {
        console.error("Error creating budget line:", error);
        res.status(500).json({ message: "Failed to create budget line" });
      }
    }
  );

  // Review management
  app.get("/api/proposals/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post(
    "/api/proposals/:id/reviews",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const roles = await storage.getUserRoles(userId);

        if (!roles.includes("reviewer") && !roles.includes("grant_manager")) {
          return res.status(403).json({ message: "Access denied" });
        }

        const validatedData = insertReviewSchema.parse(req.body);
        const review = await storage.createReview(
          req.params.id,
          userId,
          validatedData
        );

        await storage.createAuditLog({
          userId,
          action: "create_review",
          resourceType: "review",
          resourceId: review.id,
          newValues: review,
        });

        res.status(201).json(review);
      } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  );

  // Award management
  app.get("/api/awards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roles = await storage.getUserRoles(userId);

      const filters: any = {};

      // If user is a researcher, only show their awards
      if (roles.includes("researcher") && !roles.includes("grant_manager")) {
        filters.piUserId = userId;
      }

      if (req.query.status) filters.status = req.query.status;

      const awards = await storage.getAwards(filters);
      res.json(awards);
    } catch (error) {
      console.error("Error fetching awards:", error);
      res.status(500).json({ message: "Failed to fetch awards" });
    }
  });

  // File upload
  app.post(
    "/api/proposals/:id/attachments",
    isAuthenticated,
    upload.single("file"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;
        const attachment = await storage.createAttachment({
          proposalId: req.params.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          type: req.body.type || "other",
          uploadedBy: userId,
        });

        await storage.createAuditLog({
          userId,
          action: "upload_attachment",
          resourceType: "attachment",
          resourceId: attachment.id,
          newValues: attachment,
        });

        res.status(201).json(attachment);
      } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  );

  app.get(
    "/api/proposals/:id/attachments",
    isAuthenticated,
    async (req, res) => {
      try {
        const attachments = await storage.getAttachments(req.params.id);
        res.json(attachments);
      } catch (error) {
        console.error("Error fetching attachments:", error);
        res.status(500).json({ message: "Failed to fetch attachments" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
