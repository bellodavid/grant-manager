import {
  users,
  userRoles,
  callForProposals,
  proposals,
  proposalTeamMembers,
  budgetLines,
  attachments,
  reviews,
  decisions,
  awards,
  disbursements,
  milestones,
  reports,
  auditLogs,
  type User,
  type UpsertUser,
  type CallForProposal,
  type InsertCall,
  type Proposal,
  type InsertProposal,
  type Review,
  type InsertReview,
  type Award,
  type InsertAward,
  type BudgetLine,
  type InsertBudgetLine,
  type Attachment,
  type InsertAttachment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, and, or, gte, lte, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getUserRoles(userId: string): Promise<string[]>;
  assignUserRole(userId: string, role: string): Promise<void>;
  
  // Call management
  getCalls(status?: string): Promise<CallForProposal[]>;
  getCall(id: string): Promise<CallForProposal | undefined>;
  createCall(call: InsertCall): Promise<CallForProposal>;
  updateCall(id: string, updates: Partial<InsertCall>): Promise<CallForProposal>;
  
  // Proposal management
  getProposals(filters?: {
    callId?: string;
    piUserId?: string;
    status?: string;
    search?: string;
  }): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, updates: Partial<InsertProposal>): Promise<Proposal>;
  submitProposal(id: string): Promise<Proposal>;
  
  // Budget management
  getBudgetLines(proposalId: string): Promise<BudgetLine[]>;
  createBudgetLine(proposalId: string, budgetLine: Omit<InsertBudgetLine, 'proposalId'>): Promise<BudgetLine>;
  updateBudgetLine(id: string, updates: Partial<InsertBudgetLine>): Promise<BudgetLine>;
  deleteBudgetLine(id: string): Promise<void>;
  
  // Review management
  getReviews(proposalId: string): Promise<Review[]>;
  createReview(proposalId: string, reviewerId: string, review: Omit<InsertReview, 'proposalId' | 'reviewerId'>): Promise<Review>;
  updateReview(id: string, updates: Partial<InsertReview>): Promise<Review>;
  getReviewsForReviewer(reviewerId: string): Promise<Review[]>;
  
  // Award management
  getAwards(filters?: { status?: string; piUserId?: string }): Promise<Award[]>;
  getAward(id: string): Promise<Award | undefined>;
  createAward(proposalId: string, award: InsertAward): Promise<Award>;
  
  // File management
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachments(proposalId?: string, awardId?: string): Promise<Attachment[]>;
  
  // Dashboard metrics
  getDashboardMetrics(userId?: string, role?: string): Promise<{
    activeProposals: number;
    pendingReviews: number;
    awardsYTD: number;
    totalAwardAmount: number;
    openCalls: number;
  }>;
  
  // Recent activity
  getRecentActivity(limit?: number): Promise<any[]>;
  
  // Audit logging
  createAuditLog(log: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
  }): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return roles.map(r => r.role);
  }

  async assignUserRole(userId: string, role: string): Promise<void> {
    await db.insert(userRoles).values({
      userId,
      role: role as any,
    });
  }

  // Call management
  async getCalls(status?: string): Promise<CallForProposal[]> {
    const query = db.select().from(callForProposals);
    if (status) {
      query.where(eq(callForProposals.status, status as any));
    }
    return await query.orderBy(desc(callForProposals.createdAt));
  }

  async getCall(id: string): Promise<CallForProposal | undefined> {
    const [call] = await db.select().from(callForProposals).where(eq(callForProposals.id, id));
    return call;
  }

  async createCall(callData: InsertCall): Promise<CallForProposal> {
    const [call] = await db.insert(callForProposals).values(callData).returning();
    return call;
  }

  async updateCall(id: string, updates: Partial<InsertCall>): Promise<CallForProposal> {
    const [call] = await db
      .update(callForProposals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(callForProposals.id, id))
      .returning();
    return call;
  }

  // Proposal management
  async getProposals(filters?: {
    callId?: string;
    piUserId?: string;
    status?: string;
    search?: string;
  }): Promise<Proposal[]> {
    const conditions = [];
    if (filters?.callId) {
      conditions.push(eq(proposals.callId, filters.callId));
    }
    if (filters?.piUserId) {
      conditions.push(eq(proposals.piUserId, filters.piUserId));
    }
    if (filters?.status) {
      conditions.push(eq(proposals.status, filters.status as any));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(proposals.title, `%${filters.search}%`),
          ilike(proposals.abstract, `%${filters.search}%`)
        )
      );
    }
    
    let query = db.select().from(proposals);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }

  async createProposal(proposalData: InsertProposal): Promise<Proposal> {
    const [proposal] = await db.insert(proposals).values(proposalData).returning();
    return proposal;
  }

  async updateProposal(id: string, updates: Partial<InsertProposal>): Promise<Proposal> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  async submitProposal(id: string): Promise<Proposal> {
    const [proposal] = await db
      .update(proposals)
      .set({ 
        status: "submitted", 
        submissionDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  // Budget management
  async getBudgetLines(proposalId: string): Promise<BudgetLine[]> {
    return await db.select().from(budgetLines).where(eq(budgetLines.proposalId, proposalId));
  }

  async createBudgetLine(proposalId: string, budgetLineData: Omit<InsertBudgetLine, 'proposalId'>): Promise<BudgetLine> {
    const [budgetLine] = await db
      .insert(budgetLines)
      .values({ ...budgetLineData, proposalId })
      .returning();
    return budgetLine;
  }

  async updateBudgetLine(id: string, updates: Partial<InsertBudgetLine>): Promise<BudgetLine> {
    const [budgetLine] = await db
      .update(budgetLines)
      .set(updates)
      .where(eq(budgetLines.id, id))
      .returning();
    return budgetLine;
  }

  async deleteBudgetLine(id: string): Promise<void> {
    await db.delete(budgetLines).where(eq(budgetLines.id, id));
  }

  // Review management
  async getReviews(proposalId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.proposalId, proposalId));
  }

  async createReview(proposalId: string, reviewerId: string, reviewData: Omit<InsertReview, 'proposalId' | 'reviewerId'>): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        proposalId,
        reviewerId,
      })
      .returning();
    return review;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async getReviewsForReviewer(reviewerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.reviewerId, reviewerId));
  }

  // Award management
  async getAwards(filters?: { status?: string; piUserId?: string }): Promise<Award[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(awards.status, filters.status as any));
    }
    
    let query = db.select().from(awards);
    if (filters?.piUserId) {
      query = query.innerJoin(proposals, eq(awards.proposalId, proposals.id));
      conditions.push(eq(proposals.piUserId, filters.piUserId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(awards.createdAt));
  }

  async getAward(id: string): Promise<Award | undefined> {
    const [award] = await db.select().from(awards).where(eq(awards.id, id));
    return award;
  }

  async createAward(proposalId: string, awardData: InsertAward): Promise<Award> {
    const [award] = await db
      .insert(awards)
      .values({ ...awardData, proposalId })
      .returning();
    return award;
  }

  // File management
  async createAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db.insert(attachments).values(attachmentData).returning();
    return attachment;
  }

  async getAttachments(proposalId?: string, awardId?: string): Promise<Attachment[]> {
    const conditions = [];
    if (proposalId) {
      conditions.push(eq(attachments.proposalId, proposalId));
    }
    if (awardId) {
      conditions.push(eq(attachments.awardId, awardId));
    }

    if (conditions.length === 0) {
      return [];
    }

    return await db.select().from(attachments).where(or(...conditions));
  }

  // Dashboard metrics
  async getDashboardMetrics(userId?: string, role?: string): Promise<{
    activeProposals: number;
    pendingReviews: number;
    awardsYTD: number;
    totalAwardAmount: number;
    openCalls: number;
  }> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    // Active proposals
    const [activeProposalsResult] = await db
      .select({ count: count() })
      .from(proposals)
      .where(eq(proposals.status, "submitted"));

    // Pending reviews  
    const [pendingReviewsResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.submittedAt, null as any));

    // Awards YTD
    const [awardsYTDResult] = await db
      .select({ count: count() })
      .from(awards)
      .where(gte(awards.createdAt, yearStart));

    // Total award amount YTD
    const [totalAwardResult] = await db
      .select({ total: sum(awards.awardAmount) })
      .from(awards)
      .where(gte(awards.createdAt, yearStart));

    // Open calls
    const [openCallsResult] = await db
      .select({ count: count() })
      .from(callForProposals)
      .where(eq(callForProposals.status, "published"));

    return {
      activeProposals: activeProposalsResult.count,
      pendingReviews: pendingReviewsResult.count,
      awardsYTD: awardsYTDResult.count,
      totalAwardAmount: Number(totalAwardResult.total || 0),
      openCalls: openCallsResult.count,
    };
  }

  // Recent activity (simplified for now)
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    return await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        timestamp: auditLogs.timestamp,
        userId: auditLogs.userId,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Audit logging
  async createAuditLog(logData: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
  }): Promise<void> {
    await db.insert(auditLogs).values(logData);
  }
}

export const storage = new DatabaseStorage();
