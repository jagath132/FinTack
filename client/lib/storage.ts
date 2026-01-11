import {
  Transaction,
  Category,
  Budget,
  RecurringTransactionTemplate,
  RecurringTransaction,
} from "./types";

const STORAGE_KEYS = {
  TRANSACTIONS: "fintrack_transactions",
  CATEGORIES: "fintrack_categories",
  BUDGETS: "fintrack_budgets",
  RECURRING_TEMPLATES: "fintrack_recurring_templates",
  RECURRING_TRANSACTIONS: "fintrack_recurring_transactions",
  USER_SETTINGS: "fintrack_user_settings",
};

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Initialize default categories if none exist
 */
export async function initializeDefaultCategories(): Promise<void> {
  const existing = await getAllCategories();
  if (existing.length === 0) {
    const defaults: Category[] = [
      { id: "cat_1", name: "Salary", type: "income", color: "#10b981", icon: "DollarSign", createdAt: new Date().toISOString() },
      { id: "cat_2", name: "Groceries", type: "expense", color: "#f59e0b", icon: "ShoppingCart", createdAt: new Date().toISOString() },
      { id: "cat_3", name: "Utilities", type: "expense", color: "#ef4444", icon: "Zap", createdAt: new Date().toISOString() },
      { id: "cat_4", name: "Entertainment", type: "expense", color: "#ec4899", icon: "Film", createdAt: new Date().toISOString() },
      { id: "cat_5", name: "Dining Out", type: "expense", color: "#8b5cf6", icon: "Utensils", createdAt: new Date().toISOString() },
      { id: "cat_6", name: "Transportation", type: "expense", color: "#06b6d4", icon: "Car", createdAt: new Date().toISOString() },
    ];
    saveToStorage(STORAGE_KEYS.CATEGORIES, defaults);
  }
}

/**
 * Transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  return getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
}

export async function saveTransaction(transaction: Omit<Transaction, "id">): Promise<string> {
  const data = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  const id = Math.random().toString(36).substring(2, 11);
  const newTransaction = { ...transaction, id };
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, [...data, newTransaction]);
  return id;
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
  const data = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  const updated = data.map(t => t.id === id ? { ...t, ...transaction } : t);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
}

export async function deleteTransaction(id: string): Promise<void> {
  const data = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.filter(t => t.id !== id));
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const data = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  return data.find(t => t.id === id);
}

/**
 * Categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
}

export async function saveCategory(category: Omit<Category, "id">): Promise<string> {
  const data = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  const id = Math.random().toString(36).substring(2, 11);
  const newCategory = { ...category, id };
  saveToStorage(STORAGE_KEYS.CATEGORIES, [...data, newCategory]);
  return id;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  const data = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  const updated = data.map(c => c.id === id ? { ...c, ...category } : c);
  saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const data = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  saveToStorage(STORAGE_KEYS.CATEGORIES, data.filter(c => c.id !== id));
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const data = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  return data.find(c => c.id === id);
}

export async function getCategoriesByType(type: "income" | "expense"): Promise<Category[]> {
  const data = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  return data.filter(c => c.type === type);
}

/**
 * Budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  return getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
}

export async function saveBudget(budget: Omit<Budget, "id">): Promise<string> {
  const data = getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  const id = Math.random().toString(36).substring(2, 11);
  const newBudget = { ...budget, id };
  saveToStorage(STORAGE_KEYS.BUDGETS, [...data, newBudget]);
  return id;
}

export async function updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
  const data = getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  const updated = data.map(b => b.id === id ? { ...b, ...budget } : b);
  saveToStorage(STORAGE_KEYS.BUDGETS, updated);
}

export async function deleteBudget(id: string): Promise<void> {
  const data = getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  saveToStorage(STORAGE_KEYS.BUDGETS, data.filter(b => b.id !== id));
}

export async function getBudgetById(id: string): Promise<Budget | undefined> {
  const data = getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  return data.find(b => b.id === id);
}

export async function getBudgetsByCategory(categoryId: string): Promise<Budget[]> {
  const data = getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  return data.filter(b => b.categoryId === categoryId);
}

/**
 * Recurring Transaction Templates
 */
export async function getAllRecurringTemplates(): Promise<RecurringTransactionTemplate[]> {
  return getFromStorage<RecurringTransactionTemplate>(STORAGE_KEYS.RECURRING_TEMPLATES);
}

export async function saveRecurringTemplate(template: Omit<RecurringTransactionTemplate, "id">): Promise<string> {
  const data = getFromStorage<RecurringTransactionTemplate>(STORAGE_KEYS.RECURRING_TEMPLATES);
  const id = Math.random().toString(36).substring(2, 11);
  const newTemplate = { ...template, id };
  saveToStorage(STORAGE_KEYS.RECURRING_TEMPLATES, [...data, newTemplate]);
  return id;
}

export async function updateRecurringTemplate(id: string, template: Partial<RecurringTransactionTemplate>): Promise<void> {
  const data = getFromStorage<RecurringTransactionTemplate>(STORAGE_KEYS.RECURRING_TEMPLATES);
  const updated = data.map(t => t.id === id ? { ...t, ...template } : t);
  saveToStorage(STORAGE_KEYS.RECURRING_TEMPLATES, updated);
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  const data = getFromStorage<RecurringTransactionTemplate>(STORAGE_KEYS.RECURRING_TEMPLATES);
  saveToStorage(STORAGE_KEYS.RECURRING_TEMPLATES, data.filter(t => t.id !== id));
}

export async function getRecurringTemplateById(id: string): Promise<RecurringTransactionTemplate | undefined> {
  const data = getFromStorage<RecurringTransactionTemplate>(STORAGE_KEYS.RECURRING_TEMPLATES);
  return data.find(t => t.id === id);
}

/**
 * Generated Recurring Transactions
 */
export async function getAllRecurringTransactions(): Promise<RecurringTransaction[]> {
  return getFromStorage<RecurringTransaction>(STORAGE_KEYS.RECURRING_TRANSACTIONS);
}

export async function saveRecurringTransaction(transaction: Omit<RecurringTransaction, "id">): Promise<string> {
  const data = getFromStorage<RecurringTransaction>(STORAGE_KEYS.RECURRING_TRANSACTIONS);
  const id = Math.random().toString(36).substring(2, 11);
  const newTransaction = { ...transaction, id };
  saveToStorage(STORAGE_KEYS.RECURRING_TRANSACTIONS, [...data, newTransaction]);
  return id;
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  const data = getFromStorage<RecurringTransaction>(STORAGE_KEYS.RECURRING_TRANSACTIONS);
  saveToStorage(STORAGE_KEYS.RECURRING_TRANSACTIONS, data.filter(t => t.id !== id));
}

/**
 * Recurring Generation Logic
 */
export async function generateRecurringTransactions(templateId: string): Promise<void> {
  const template = await getRecurringTemplateById(templateId);
  if (!template || !template.isActive) return;

  const now = new Date();
  const startDate = new Date(template.startDate);
  let lastGenerated = template.lastGenerated ? new Date(template.lastGenerated) : startDate;

  // Mock generation logic: simply update lastGenerated and create one transaction
  if (lastGenerated < now) {
    await saveTransaction({
      name: template.name,
      amount: template.amount,
      type: template.type,
      categoryId: template.categoryId,
      date: now.toISOString(),
      description: `Generated from template: ${template.name}`,
      createdAt: now.toISOString()
    });

    await updateRecurringTemplate(templateId, { lastGenerated: now.toISOString() });
  }
}

export async function generateAllRecurringTransactions(): Promise<void> {
  const templates = await getAllRecurringTemplates();
  for (const template of templates) {
    if (template.isActive) {
      await generateRecurringTransactions(template.id);
    }
  }
}

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
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  return data ? JSON.parse(data) : {
    displayName: "User",
    emailNotifications: true,
    budgetAlerts: true,
    darkMode: false
  };
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getUserSettings();
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ ...current, ...settings }));
}

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
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  await initializeDefaultCategories();
}

/**
 * Sample Data
 */
export async function initializeSampleData(): Promise<void> {
  const transactions = await getAllTransactions();
  if (transactions.length === 0) {
    const cats = await getAllCategories();
    if (cats.length > 0) {
      await saveTransaction({
        name: "Initial Balance",
        amount: 5000,
        type: "income",
        categoryId: cats[0].id,
        date: new Date().toISOString(),
        description: "Initial balance for testing",
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function initializeDefaultRecurringTemplates(): Promise<void> {
  const templates = await getAllRecurringTemplates();
  if (templates.length === 0) {
    const cats = await getAllCategories();
    if (cats.length > 0) {
      await saveRecurringTemplate({
        name: "Monthly Rent",
        amount: 1500,
        type: "expense",
        categoryId: cats.find(c => c.name === "Utilities")?.id || cats[0].id,
        frequency: "monthly",
        startDate: new Date().toISOString(),
        isActive: true,
        description: "Monthly recurring rent payment",
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function initializeSampleBudgets(): Promise<void> {
  const budgets = await getAllBudgets();
  if (budgets.length === 0) {
    const cats = await getAllCategories();
    for (const cat of cats) {
      if (cat.type === "expense") {
        await saveBudget({
          categoryId: cat.id,
          amount: 500,
          period: "monthly",
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    }
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  const initialized = localStorage.getItem("fintrack_initialized");
  if (!initialized) {
    (async () => {
      await initializeDefaultCategories();
      await initializeSampleData();
      await initializeDefaultRecurringTemplates();
      await initializeSampleBudgets();
      localStorage.setItem("fintrack_initialized", "true");
    })();
  }
}
