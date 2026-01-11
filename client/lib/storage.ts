import {
  Transaction,
  Category,
  Budget,
  RecurringTransactionTemplate,
  RecurringTransaction,
} from "./types";

const TOKEN_KEY = "fintrack_token";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      // Optional: handle unauthorized (redirect to login or clear token)
    }
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

/**
 * Initialize default categories (Handled by backend usually, but keeping signature)
 */
export async function initializeDefaultCategories(): Promise<void> {
  // In a real app, the backend would seed these for a new user.
  // We can call an endpoint or just let the backend handle it on signup.
}

/**
 * Transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/transactions");
}

export async function saveTransaction(transaction: Omit<Transaction, "id">): Promise<string> {
  const newTx = await apiFetch<Transaction>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
  return newTx.id;
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
  await apiFetch(`/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(transaction),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const all = await getAllTransactions();
  return all.find(t => t.id === id);
}

/**
 * Categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function saveCategory(category: Omit<Category, "id">): Promise<string> {
  const newCat = await apiFetch<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
  return newCat.id;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  await apiFetch(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(category),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const all = await getAllCategories();
  return all.find(c => c.id === id);
}

export async function getCategoriesByType(type: "income" | "expense"): Promise<Category[]> {
  const all = await getAllCategories();
  return all.filter(c => c.type === type);
}

/**
 * Budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  return apiFetch<Budget[]>("/api/budgets");
}

export async function saveBudget(budget: Omit<Budget, "id">): Promise<string> {
  const newBudget = await apiFetch<Budget>("/api/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });
  return newBudget.id;
}

export async function updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
  await apiFetch(`/api/budgets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(budget),
  });
}

export async function deleteBudget(id: string): Promise<void> {
  await apiFetch(`/api/budgets/${id}`, {
    method: "DELETE",
  });
}

export async function getBudgetById(id: string): Promise<Budget | undefined> {
  const all = await getAllBudgets();
  return all.find(b => b.id === id);
}

export async function getBudgetsByCategory(categoryId: string): Promise<Budget[]> {
  const all = await getAllBudgets();
  return all.filter(b => b.categoryId === categoryId);
}

/**
 * Recurring Transaction Templates
 */
export async function getAllRecurringTemplates(): Promise<RecurringTransactionTemplate[]> {
  return apiFetch<RecurringTransactionTemplate[]>("/api/recurring/templates");
}

export async function saveRecurringTemplate(template: Omit<RecurringTransactionTemplate, "id">): Promise<string> {
  const newTmpl = await apiFetch<RecurringTransactionTemplate>("/api/recurring/templates", {
    method: "POST",
    body: JSON.stringify(template),
  });
  return newTmpl.id;
}

export async function updateRecurringTemplate(id: string, template: Partial<RecurringTransactionTemplate>): Promise<void> {
  await apiFetch(`/api/recurring/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(template),
  });
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  await apiFetch(`/api/recurring/templates/${id}`, {
    method: "DELETE",
  });
}

export async function getRecurringTemplateById(id: string): Promise<RecurringTransactionTemplate | undefined> {
  const all = await getAllRecurringTemplates();
  return all.find(t => t.id === id);
}

/**
 * Generated Recurring Transactions
 */
export async function getAllRecurringTransactions(): Promise<RecurringTransaction[]> {
  // For now, mapping these to regular transactions or a specific view
  return [];
}

export async function saveRecurringTransaction(transaction: Omit<RecurringTransaction, "id">): Promise<string> {
  return Math.random().toString(36).substring(2, 11);
}

export async function deleteRecurringTransaction(id: string): Promise<void> { }

/**
 * Recurring Generation Logic (Often handled by cron on server)
 */
export async function generateRecurringTransactions(templateId: string): Promise<void> { }

export async function generateAllRecurringTransactions(): Promise<void> { }

/**
 * User Settings
 */
export interface UserSettings {
  displayName: string;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  darkMode: boolean;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  // This could be part of the user profile in PostgreSQL
  return {
    displayName: "User",
    emailNotifications: true,
    budgetAlerts: true,
    darkMode: false
  };
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> { }

/**
 * Data Management
 */
export async function getAllData(): Promise<{
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}> {
  return {
    transactions: await getAllTransactions(),
    categories: await getAllCategories(),
    budgets: await getAllBudgets(),
  };
}

export async function importData(
  transactions: Omit<Transaction, "id">[],
  categories: Omit<Category, "id">[],
): Promise<void> {
  for (const cat of categories) {
    await saveCategory(cat);
  }
  for (const txn of transactions) {
    await saveTransaction(txn);
  }
}

export async function resetAllData(): Promise<void> {
  // Clear local storage token and reset DB via API if implemented
  localStorage.removeItem(TOKEN_KEY);
  window.location.reload();
}

/**
 * Sample Data Initialization (Handled by backend logic or user action)
 */
export async function initializeSampleData(): Promise<void> { }

export async function initializeDefaultRecurringTemplates(): Promise<void> { }

export async function initializeSampleBudgets(): Promise<void> { }

// No auto-init on module load needed for API version
