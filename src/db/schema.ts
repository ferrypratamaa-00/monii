import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const txTypeEnum = pgEnum("tx_type", ["INCOME", "EXPENSE"]);
export const debtTypeEnum = pgEnum("debt_type", ["DEBT", "RECEIVABLE"]);
export const debtStatusEnum = pgEnum("debt_status", ["ACTIVE", "PAID"]);
export const budgetPeriodEnum = pgEnum("budget_period", ["MONTHLY", "YEARLY"]);
export const goalTypeEnum = pgEnum("goal_type", ["PERSONAL", "JOINT"]);
export const auditEventTypeEnum = pgEnum("audit_event_type", [
  "auth",
  "transaction",
  "security",
  "system",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "BUDGET_ALERT",
  "GOAL_REMINDER",
  "TRANSACTION_ALERT",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  initialBalance: numeric("initial_balance", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: txTypeEnum("type").notNull(),
  iconName: varchar("icon_name", { length: 64 }).default("Circle"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  type: txTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: debtTypeEnum("type").notNull(),
  personName: varchar("person_name", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: debtStatusEnum("status").default("ACTIVE").notNull(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  period: budgetPeriodEnum("period").default("MONTHLY").notNull(),
  limitAmount: numeric("limit_amount", { precision: 14, scale: 2 }).notNull(),
  currentSpending: numeric("current_spending", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  savedAmount: numeric("saved_amount", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  deadline: timestamp("deadline"),
  type: goalTypeEnum("type").default("PERSONAL").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalMembers = pgTable(
  "goal_members",
  {
    goalId: integer("goal_id")
      .references(() => goals.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    contributionAmount: numeric("contribution_amount", {
      precision: 14,
      scale: 2,
    })
      .default("0")
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.goalId, t.userId] }),
  }),
);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventType: auditEventTypeEnum("event_type").notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  filePath: text("file_path").notNull(),
  fileType: varchar("file_type", { length: 50 }).default("receipt").notNull(), // receipt, avatar
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// relations (opsional, untuk eager typed)
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  debts: many(debts),
  categories: many(categories),
  budgets: many(budgets),
  goals: many(goals),
  goalMemberships: many(goalMembers),
  badges: many(badges),
  passwordResets: many(passwordResets),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
  files: many(files),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  members: many(goalMembers),
}));

export const goalMembersRelations = relations(goalMembers, ({ one }) => ({
  goal: one(goals, {
    fields: [goalMembers.goalId],
    references: [goals.id],
  }),
  user: one(users, {
    fields: [goalMembers.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  user: one(users, {
    fields: [debts.userId],
    references: [users.id],
  }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [files.transactionId],
    references: [transactions.id],
  }),
}));
