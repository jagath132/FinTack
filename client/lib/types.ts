/**
 * TypeScript interfaces for Financial Management App
 */

export type TransactionType = 'income' | 'expense';

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

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  expenseByCategory: Record<string, number>;
  monthlyTrend: Array<{ month: string; income: number; expenses: number }>;
}

export interface CSVImportData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ColumnMapping {
  [appColumn: string]: string; // maps app column name to CSV column name
}
