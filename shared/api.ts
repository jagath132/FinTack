/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
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

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}
