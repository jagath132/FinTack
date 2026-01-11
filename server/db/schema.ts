import { pgTable, text, timestamp, doublePrecision, boolean, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
    id: text("id").primaryKey(), // Using text to match frontend generated IDs during migration
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    color: text("color").notNull(),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
    id: text("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    categoryId: text("category_id").references(() => categories.id).notNull(),
    name: text("name").notNull(),
    amount: doublePrecision("amount").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    date: timestamp("date").notNull(),
    description: text("description"),
    notes: text("notes"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
    id: text("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    categoryId: text("category_id").references(() => categories.id).notNull(),
    amount: doublePrecision("amount").notNull(),
    period: text("period", { enum: ["monthly", "yearly"] }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recurringTemplates = pgTable("recurring_templates", {
    id: text("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    categoryId: text("category_id").references(() => categories.id).notNull(),
    name: text("name").notNull(),
    amount: doublePrecision("amount").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    frequency: text("frequency", { enum: ["daily", "weekly", "monthly", "yearly"] }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    lastGenerated: timestamp("last_generated"),
    isActive: boolean("is_active").default(true).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
