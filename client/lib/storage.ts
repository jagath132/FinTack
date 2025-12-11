import {
  Transaction,
  Category,
  Budget,
  RecurringTransactionTemplate,
  RecurringTransaction,
} from "./types";
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  writeBatch,
} from "firebase/firestore";

/**
 * Initialize default categories if none exist
 */
async function initializeDefaultCategories(): Promise<void> {
  const existing = await getAllCategories();
  if (existing.length === 0) {
    const defaults: Omit<Category, "id">[] = [
      {
        name: "Salary",
        type: "income",
        color: "#10b981",
        icon: "DollarSign",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bonus",
        type: "income",
        color: "#34d399",
        icon: "TrendingUp",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Freelance",
        type: "income",
        color: "#6ee7b7",
        icon: "Briefcase",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Groceries",
        type: "expense",
        color: "#f59e0b",
        icon: "ShoppingCart",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Utilities",
        type: "expense",
        color: "#ef4444",
        icon: "Zap",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Entertainment",
        type: "expense",
        color: "#ec4899",
        icon: "Film",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Dining Out",
        type: "expense",
        color: "#8b5cf6",
        icon: "Utensils",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Transportation",
        type: "expense",
        color: "#06b6d4",
        icon: "Car",
        createdAt: new Date().toISOString(),
      },
    ];
    for (const cat of defaults) {
      await addDoc(collection(db, "categories"), cat);
    }
  }
}

/**
 * Transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Transaction,
    );
  } catch {
    return [];
  }
}

export async function saveTransaction(
  transaction: Omit<Transaction, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "transactions"), transaction);
    return docRef.id;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw new Error(
      `Failed to save transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction>,
): Promise<void> {
  const docRef = doc(db, "transactions", id);
  await updateDoc(docRef, transaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, "transactions", id));
}

export async function getTransactionById(
  id: string,
): Promise<Transaction | undefined> {
  const docRef = doc(db, "transactions", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Transaction;
  }
  return undefined;
}

/**
 * Categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Category,
    );
  } catch {
    return [];
  }
}

export async function saveCategory(
  category: Omit<Category, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "categories"), category);
    return docRef.id;
  } catch (error) {
    console.error("Error saving category:", error);
    throw new Error(
      `Failed to save category: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateCategory(
  id: string,
  category: Partial<Category>,
): Promise<void> {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, category);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

export async function getCategoryById(
  id: string,
): Promise<Category | undefined> {
  const docRef = doc(db, "categories", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Category;
  }
  return undefined;
}

export async function getCategoriesByType(
  type: "income" | "expense",
): Promise<Category[]> {
  const q = query(collection(db, "categories"), where("type", "==", type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Category,
  );
}

/**
 * Budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "budgets"));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Budget,
    );
  } catch {
    return [];
  }
}

export async function saveBudget(budget: Omit<Budget, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "budgets"), budget);
    return docRef.id;
  } catch (error) {
    console.error("Error saving budget:", error);
    throw new Error(
      `Failed to save budget: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateBudget(
  id: string,
  budget: Partial<Budget>,
): Promise<void> {
  const docRef = doc(db, "budgets", id);
  await updateDoc(docRef, budget);
}

export async function deleteBudget(id: string): Promise<void> {
  await deleteDoc(doc(db, "budgets", id));
}

export async function getBudgetById(id: string): Promise<Budget | undefined> {
  const docRef = doc(db, "budgets", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Budget;
  }
  return undefined;
}

export async function getBudgetsByCategory(
  categoryId: string,
): Promise<Budget[]> {
  const q = query(
    collection(db, "budgets"),
    where("categoryId", "==", categoryId),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Budget,
  );
}

/**
 * Recurring Transaction Templates
 */
export async function getAllRecurringTemplates(): Promise<
  RecurringTransactionTemplate[]
> {
  try {
    const querySnapshot = await getDocs(collection(db, "recurringTemplates"));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RecurringTransactionTemplate,
    );
  } catch {
    return [];
  }
}

export async function saveRecurringTemplate(
  template: Omit<RecurringTransactionTemplate, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "recurringTemplates"), template);
    return docRef.id;
  } catch (error) {
    console.error("Error saving recurring template:", error);
    throw new Error(
      `Failed to save recurring template: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateRecurringTemplate(
  id: string,
  template: Partial<RecurringTransactionTemplate>,
): Promise<void> {
  const docRef = doc(db, "recurringTemplates", id);
  await updateDoc(docRef, template);
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  await deleteDoc(doc(db, "recurringTemplates", id));
}

export async function getRecurringTemplateById(
  id: string,
): Promise<RecurringTransactionTemplate | undefined> {
  const docRef = doc(db, "recurringTemplates", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as RecurringTransactionTemplate;
  }
  return undefined;
}

/**
 * Recurring Transactions (Generated)
 */
export async function getAllRecurringTransactions(): Promise<
  RecurringTransaction[]
> {
  try {
    const querySnapshot = await getDocs(
      collection(db, "recurringTransactions"),
    );
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RecurringTransaction,
    );
  } catch {
    return [];
  }
}

export async function saveRecurringTransaction(
  transaction: Omit<RecurringTransaction, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(
      collection(db, "recurringTransactions"),
      transaction,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving recurring transaction:", error);
    throw new Error(
      `Failed to save recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, "recurringTransactions", id));
}

/**
 * Generate recurring transactions for a template
 */
export async function generateRecurringTransactions(
  templateId: string,
): Promise<void> {
  const template = await getRecurringTemplateById(templateId);
  if (!template || !template.isActive) return;

  const now = new Date();
  const startDate = new Date(template.startDate);
  const endDate = template.endDate ? new Date(template.endDate) : null;
  const lastGenerated = template.lastGenerated
    ? new Date(template.lastGenerated)
    : startDate;

  // Don't generate if we've already generated up to today
  if (lastGenerated >= now) return;

  // Don't generate if end date has passed
  if (endDate && endDate < now) return;

  const transactionsToGenerate: Omit<RecurringTransaction, "id">[] = [];
  let currentDate = new Date(lastGenerated);

  // Move to next occurrence based on frequency
  switch (template.frequency) {
    case "daily":
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case "weekly":
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case "monthly":
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case "yearly":
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
  }

  // Generate transactions until we reach today or end date
  while (currentDate <= now && (!endDate || currentDate <= endDate)) {
    transactionsToGenerate.push({
      templateId: template.id,
      date: currentDate.toISOString(),
      amount: template.amount,
      categoryId: template.categoryId,
      type: template.type,
      description: template.description,
      notes: template.notes,
      tags: template.tags,
      createdAt: new Date().toISOString(),
      isGenerated: true,
    });

    // Move to next occurrence
    switch (template.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }

  // Save generated transactions
  if (transactionsToGenerate.length > 0) {
    const savePromises = transactionsToGenerate.map((t) =>
      saveRecurringTransaction(t),
    );
    await Promise.all(savePromises);

    // Update last generated date
    await updateRecurringTemplate(templateId, {
      lastGenerated:
        transactionsToGenerate[transactionsToGenerate.length - 1].date,
    });
  }
}

/**
 * Generate all recurring transactions
 */
export async function generateAllRecurringTransactions(): Promise<void> {
  const templates = await getAllRecurringTemplates();
  const generatePromises = templates.map((template) =>
    generateRecurringTransactions(template.id),
  );
  await Promise.all(generatePromises);
}

/**
 * Data Management
 */
export async function getAllData(): Promise<{
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}> {
  const [transactions, categories, budgets] = await Promise.all([
    getAllTransactions(),
    getAllCategories(),
    getAllBudgets(),
  ]);
  return {
    transactions,
    categories,
    budgets,
  };
}

export async function importData(
  transactions: Omit<Transaction, "id">[],
  categories: Omit<Category, "id">[],
): Promise<void> {
  // Get existing data to delete
  const [transSnapshot, catSnapshot] = await Promise.all([
    getDocs(collection(db, "transactions")),
    getDocs(collection(db, "categories")),
  ]);

  // Delete existing
  const deletePromises = [
    ...transSnapshot.docs.map((doc) => deleteDoc(doc.ref)),
    ...catSnapshot.docs.map((doc) => deleteDoc(doc.ref)),
  ];
  await Promise.all(deletePromises);

  // Add new
  const addPromises = [
    ...transactions.map((t) => addDoc(collection(db, "transactions"), t)),
    ...categories.map((c) => addDoc(collection(db, "categories"), c)),
  ];
  await Promise.all(addPromises);
}

export async function resetAllData(): Promise<void> {
  // Delete all
  const transSnapshot = await getDocs(collection(db, "transactions"));
  const catSnapshot = await getDocs(collection(db, "categories"));
  const deletePromises = [
    ...transSnapshot.docs.map((doc) => deleteDoc(doc.ref)),
    ...catSnapshot.docs.map((doc) => deleteDoc(doc.ref)),
  ];
  await Promise.all(deletePromises);

  // Initialize defaults
  await initializeDefaultCategories();
}

// Initialize sample data for demonstration
async function initializeSampleData(): Promise<void> {
  const existingTransactions = await getAllTransactions();
  if (existingTransactions.length === 0) {
    const categories = await getAllCategories();

    // Helper function to get category ID by name
    const getCategoryId = (name: string) => {
      return categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id || "";
    };

    // Sample transactions for the last 6 months
    const now = new Date();
    const sampleTransactions: Omit<Transaction, "id">[] = [];

    // Generate transactions for each month
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

      // Monthly salary (income)
      sampleTransactions.push({
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString(),
        amount: 75000,
        categoryId: getCategoryId("Salary"),
        type: "income",
        description: "Monthly Salary",
        notes: "Regular monthly salary payment",
        createdAt: new Date().toISOString(),
      });

      // Bonus (occasional income)
      if (monthOffset === 2 || monthOffset === 5) { // March and June
        sampleTransactions.push({
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString(),
          amount: 25000,
          categoryId: getCategoryId("Bonus"),
          type: "income",
          description: "Performance Bonus",
          notes: "Quarterly performance bonus",
          createdAt: new Date().toISOString(),
        });
      }

      // Freelance work (variable income)
      if (monthOffset !== 1 && monthOffset !== 4) { // Skip Feb and May
        sampleTransactions.push({
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20).toISOString(),
          amount: Math.floor(Math.random() * 30000) + 15000, // Random between 15k-45k
          categoryId: getCategoryId("Freelance"),
          type: "income",
          description: "Freelance Project",
          notes: "Web development project payment",
          createdAt: new Date().toISOString(),
        });
      }

      // Rent payment (fixed expense)
      sampleTransactions.push({
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString(),
        amount: 15000,
        categoryId: getCategoryId("Utilities"),
        type: "expense",
        description: "Monthly Rent",
        notes: "Apartment rent payment",
        createdAt: new Date().toISOString(),
      });

      // Groceries (weekly expenses - 4 per month)
      for (let week = 1; week <= 4; week++) {
        const groceryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), week * 7);
        if (groceryDate.getMonth() === monthDate.getMonth()) {
          sampleTransactions.push({
            date: groceryDate.toISOString(),
            amount: Math.floor(Math.random() * 3000) + 2000, // Random between 2k-5k
            categoryId: getCategoryId("Groceries"),
            type: "expense",
            description: "Weekly Groceries",
            notes: "Supermarket shopping",
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Utilities (monthly)
      sampleTransactions.push({
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString(),
        amount: 2500,
        categoryId: getCategoryId("Utilities"),
        type: "expense",
        description: "Electricity Bill",
        notes: "Monthly electricity consumption",
        createdAt: new Date().toISOString(),
      });

      // Entertainment (various)
      const entertainmentExpenses = [
        { desc: "Movie Tickets", amount: 800, note: "Cinema tickets for weekend" },
        { desc: "Restaurant Dinner", amount: 1200, note: "Dinner at local restaurant" },
        { desc: "Concert Tickets", amount: 2500, note: "Music concert tickets" },
        { desc: "Online Gaming", amount: 1500, note: "Monthly gaming subscription" },
      ];

      entertainmentExpenses.forEach((expense, index) => {
        if (Math.random() > 0.3) { // 70% chance of occurring
          const expenseDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1);
          sampleTransactions.push({
            date: expenseDate.toISOString(),
            amount: expense.amount,
            categoryId: getCategoryId("Entertainment"),
            type: "expense",
            description: expense.desc,
            notes: expense.note,
            createdAt: new Date().toISOString(),
          });
        }
      });

      // Transportation
      const transportExpenses = [
        { desc: "Fuel", amount: 3000, note: "Car fuel refill" },
        { desc: "Uber Ride", amount: 250, note: "Ride to office" },
        { desc: "Bus Pass", amount: 800, note: "Monthly bus pass" },
        { desc: "Car Maintenance", amount: 5000, note: "Car service and maintenance" },
      ];

      transportExpenses.forEach((expense) => {
        if (Math.random() > 0.4) { // 60% chance
          const expenseDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1);
          sampleTransactions.push({
            date: expenseDate.toISOString(),
            amount: expense.amount,
            categoryId: getCategoryId("Transportation"),
            type: "expense",
            description: expense.desc,
            notes: expense.note,
            createdAt: new Date().toISOString(),
          });
        }
      });

      // Dining out (2-3 times per month)
      for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
        const diningDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1);
        sampleTransactions.push({
          date: diningDate.toISOString(),
          amount: Math.floor(Math.random() * 1000) + 500, // 500-1500
          categoryId: getCategoryId("Dining Out"),
          type: "expense",
          description: "Restaurant Meal",
          notes: "Dinner/lunch at restaurant",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Add all sample transactions
    for (const transaction of sampleTransactions) {
      if (transaction.categoryId) {
        try {
          await addDoc(collection(db, "transactions"), transaction);
        } catch (error) {
          console.error("Error creating sample transaction:", error);
        }
      }
    }
  }
}

// Initialize default recurring templates
async function initializeDefaultRecurringTemplates(): Promise<void> {
  const existing = await getAllRecurringTemplates();
  if (existing.length === 0) {
    const categories = await getAllCategories();
    const salaryCategory = categories.find(
      (c) => c.name.toLowerCase() === "salary",
    );
    const rentCategory = categories.find(
      (c) => c.name.toLowerCase() === "utilities",
    );
    const entertainmentCategory = categories.find(
      (c) => c.name.toLowerCase() === "entertainment",
    );
    const transportCategory = categories.find(
      (c) => c.name.toLowerCase() === "transportation",
    );

    const defaults: Omit<RecurringTransactionTemplate, "id">[] = [
      {
        name: "Monthly Salary",
        amount: 75000,
        categoryId: salaryCategory?.id || "",
        type: "income",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Monthly salary payment",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Rent Payment",
        amount: 15000,
        categoryId: rentCategory?.id || "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Monthly rent payment",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Netflix Subscription",
        amount: 649,
        categoryId: entertainmentCategory?.id || "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Netflix monthly subscription",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Gym Membership",
        amount: 2000,
        categoryId: entertainmentCategory?.id || "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Monthly gym membership fee",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Electricity Bill",
        amount: 2500,
        categoryId: rentCategory?.id || "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Monthly electricity bill",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Car Fuel",
        amount: 3000,
        categoryId: transportCategory?.id || "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString(),
        description: "Monthly car fuel expense",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // Only add templates for categories that exist
    for (const template of defaults) {
      if (template.categoryId) {
        try {
          await addDoc(collection(db, "recurringTemplates"), template);
        } catch (error) {
          console.error("Error creating default recurring template:", error);
        }
      }
    }
  }
}

// Initialize sample budgets
async function initializeSampleBudgets(): Promise<void> {
  const existing = await getAllBudgets();
  if (existing.length === 0) {
    const categories = await getAllCategories();

    const sampleBudgets: Omit<Budget, "id">[] = [
      {
        categoryId: categories.find(c => c.name.toLowerCase() === "groceries")?.id || "",
        amount: 15000, // Monthly budget
        period: "monthly",
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        categoryId: categories.find(c => c.name.toLowerCase() === "entertainment")?.id || "",
        amount: 8000,
        period: "monthly",
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        categoryId: categories.find(c => c.name.toLowerCase() === "dining out")?.id || "",
        amount: 6000,
        period: "monthly",
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        categoryId: categories.find(c => c.name.toLowerCase() === "transportation")?.id || "",
        amount: 10000,
        period: "monthly",
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    // Only add budgets for categories that exist
    for (const budget of sampleBudgets) {
      if (budget.categoryId) {
        try {
          await addDoc(collection(db, "budgets"), budget);
        } catch (error) {
          console.error("Error creating sample budget:", error);
        }
      }
    }
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  initializeDefaultCategories();
  initializeSampleData();
  initializeDefaultRecurringTemplates();
  initializeSampleBudgets();
}
