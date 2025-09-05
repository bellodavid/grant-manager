import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  department: varchar("department"),
  institution: varchar("institution"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role and permission system
export const roleEnum = pgEnum("role", [
  "super_admin",
  "grant_manager", 
  "researcher",
  "reviewer",
  "finance_officer",
  "ethics_officer",
  "auditor"
]);

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: roleEnum("role").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Grant calls management
export const callStatusEnum = pgEnum("call_status", ["draft", "published", "closed", "archived"]);

export const callForProposals = pgTable("call_for_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 1000 }),
  openDate: timestamp("open_date").notNull(),
  closeDate: timestamp("close_date").notNull(),
  budgetCap: decimal("budget_cap", { precision: 12, scale: 2 }),
  eligibilityCriteria: text("eligibility_criteria"),
  status: callStatusEnum("status").default("draft"),
  rubrics: jsonb("rubrics"), // JSON object for scoring criteria
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proposal management
export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft", "submitted", "admin_review", "peer_review", "panel_review", 
  "approved", "rejected", "withdrawn"
]);

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callId: varchar("call_id").notNull().references(() => callForProposals.id),
  title: varchar("title", { length: 500 }).notNull(),
  abstract: text("abstract").notNull(),
  objectives: text("objectives"),
  methodology: text("methodology"),
  expectedOutcomes: text("expected_outcomes"),
  status: proposalStatusEnum("status").default("draft"),
  piUserId: varchar("pi_user_id").notNull().references(() => users.id),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }),
  submissionDate: timestamp("submission_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team member management
export const teamRoleEnum = pgEnum("team_role", ["pi", "co_investigator", "researcher", "student"]);

export const proposalTeamMembers = pgTable("proposal_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name"), // For external members not in system
  email: varchar("email"),
  role: teamRoleEnum("role").notNull(),
  contribution: text("contribution"),
  effortPercentage: integer("effort_percentage"),
});

// Budget management
export const budgetCategoryEnum = pgEnum("budget_category", [
  "personnel", "equipment", "travel", "materials", "overhead", "other"
]);

export const budgetLines = pgTable("budget_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  category: budgetCategoryEnum("category").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  justification: text("justification"),
});

// File attachments
export const attachmentTypeEnum = pgEnum("attachment_type", [
  "proposal_document", "budget_file", "cv", "ethics_approval", 
  "support_letter", "milestone_deliverable", "report", "other"
]);

export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").references(() => proposals.id),
  awardId: varchar("award_id"), // Will reference awards table
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: integer("file_size"),
  type: attachmentTypeEnum("type").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Review system
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  scores: jsonb("scores"), // JSON object with scores for each criteria
  comments: text("comments"),
  recommendation: varchar("recommendation", { length: 50 }),
  conflictOfInterest: boolean("conflict_of_interest").default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Decision tracking
export const decisionTypeEnum = pgEnum("decision_type", ["award", "reject", "defer", "revise"]);

export const decisions = pgTable("decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  decisionType: decisionTypeEnum("decision_type").notNull(),
  rationale: text("rationale"),
  approvedBy: varchar("approved_by").notNull().references(() => users.id),
  decisionDate: timestamp("decision_date").defaultNow(),
});

// Award management
export const awardStatusEnum = pgEnum("award_status", [
  "pending", "active", "suspended", "completed", "terminated"
]);

export const awards = pgTable("awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  awardAmount: decimal("award_amount", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: awardStatusEnum("status").default("pending"),
  awardLetter: text("award_letter"),
  specialConditions: text("special_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Disbursement tracking
export const disbursementStatusEnum = pgEnum("disbursement_status", [
  "scheduled", "pending", "processed", "failed", "cancelled"
]);

export const disbursements = pgTable("disbursements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardId: varchar("award_id").notNull().references(() => awards.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  processedDate: timestamp("processed_date"),
  status: disbursementStatusEnum("status").default("scheduled"),
  transactionRef: varchar("transaction_ref"),
  notes: text("notes"),
});

// Milestone tracking
export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending", "in_progress", "completed", "overdue", "cancelled"
]);

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardId: varchar("award_id").notNull().references(() => awards.id),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: milestoneStatusEnum("status").default("pending"),
  deliverableRequired: boolean("deliverable_required").default(false),
});

// Progress reports
export const reportStatusEnum = pgEnum("report_status", ["draft", "submitted", "reviewed", "approved"]);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardId: varchar("award_id").notNull().references(() => awards.id),
  reportingPeriod: varchar("reporting_period", { length: 100 }).notNull(),
  narrative: text("narrative"),
  status: reportStatusEnum("status").default("draft"),
  submittedAt: timestamp("submitted_at"),
  submittedBy: varchar("submitted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logging
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  proposals: many(proposals),
  reviews: many(reviews),
  teamMemberships: many(proposalTeamMembers),
}));

export const callForProposalsRelations = relations(callForProposals, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [callForProposals.createdBy],
    references: [users.id],
  }),
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  call: one(callForProposals, {
    fields: [proposals.callId],
    references: [callForProposals.id],
  }),
  pi: one(users, {
    fields: [proposals.piUserId],
    references: [users.id],
  }),
  teamMembers: many(proposalTeamMembers),
  budgetLines: many(budgetLines),
  attachments: many(attachments),
  reviews: many(reviews),
  decision: one(decisions),
  award: one(awards),
}));

export const awardsRelations = relations(awards, ({ one, many }) => ({
  proposal: one(proposals, {
    fields: [awards.proposalId],
    references: [proposals.id],
  }),
  disbursements: many(disbursements),
  milestones: many(milestones),
  reports: many(reports),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  department: true,
  institution: true,
  phone: true,
});

export const insertCallSchema = createInsertSchema(callForProposals).pick({
  title: true,
  description: true,
  shortDescription: true,
  openDate: true,
  closeDate: true,
  budgetCap: true,
  eligibilityCriteria: true,
  rubrics: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  callId: true,
  title: true,
  abstract: true,
  objectives: true,
  methodology: true,
  expectedOutcomes: true,
  totalBudget: true,
});

export const insertBudgetLineSchema = createInsertSchema(budgetLines).omit({
  id: true,
  proposalId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  proposalId: true,
  reviewerId: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CallForProposal = typeof callForProposals.$inferSelect;
export type InsertCall = typeof callForProposals.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Award = typeof awards.$inferSelect;
export type InsertAward = typeof awards.$inferInsert;
export type BudgetLine = typeof budgetLines.$inferSelect;
export type InsertBudgetLine = typeof budgetLines.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;
