/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number;
  categoryId: string;
  type: TransactionType;
  description: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string; // hex color
  icon?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: "monthly" | "yearly";
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for ongoing budgets
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  templateId: string; // Links to the original template
  date: string; // ISO date string
  amount: number;
  categoryId: string;
  type: TransactionType;
  description: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  isGenerated: boolean; // Whether this was auto-generated
}

export interface RecurringTransactionTemplate {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  description: string;
  notes?: string;
  tags?: string[];
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
  lastGenerated?: string; // ISO date string
  isActive: boolean;
  createdAt: string;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}
