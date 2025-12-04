import { Transaction, Category } from "./types";
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
 * Data Management
 */
export async function getAllData(): Promise<{
  transactions: Transaction[];
  categories: Category[];
}> {
  const [transactions, categories] = await Promise.all([
    getAllTransactions(),
    getAllCategories(),
  ]);
  return {
    transactions,
    categories,
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

// Initialize on module load
if (typeof window !== "undefined") {
  initializeDefaultCategories();
}
