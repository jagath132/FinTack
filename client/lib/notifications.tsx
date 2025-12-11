import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import {
  getAllBudgets,
  getAllRecurringTemplates,
  getAllTransactions,
} from "./storage";
import { Budget, RecurringTransactionTemplate, Transaction } from "./types";

interface Notification {
  id: string;
  type: "budget" | "recurring" | "summary";
  title: string;
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  checkForAlerts: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({
  children,
}: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Show toast for immediate alerts
    if (
      notification.severity === "warning" ||
      notification.severity === "error"
    ) {
      toast.warning(notification.title, {
        description: notification.message,
      });
    } else {
      toast.info(notification.title, {
        description: notification.message,
      });
    }
  };

  const checkForAlerts = async () => {
    try {
      const [budgets, templates, transactions] = await Promise.all([
        getAllBudgets(),
        getAllRecurringTemplates(),
        getAllTransactions(),
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Check budget alerts
      budgets.forEach((budget) => {
        const categoryTransactions = transactions.filter(
          (t) =>
            t.categoryId === budget.categoryId &&
            t.type === "expense" &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear,
        );

        const spent = categoryTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );
        const percentage = (spent / budget.amount) * 100;

        if (percentage >= 100) {
          // Over budget
          const existingAlert = notifications.find(
            (n) =>
              n.type === "budget" &&
              n.message.includes(budget.categoryId) &&
              n.message.includes("over budget"),
          );

          if (!existingAlert) {
            addNotification({
              type: "budget",
              title: "Budget Exceeded",
              message: `You've exceeded your budget for this category.`,
              severity: "error",
            });
          }
        } else if (percentage >= 80) {
          // Approaching budget limit
          const existingAlert = notifications.find(
            (n) =>
              n.type === "budget" &&
              n.message.includes(budget.categoryId) &&
              n.message.includes("approaching"),
          );

          if (!existingAlert) {
            addNotification({
              type: "budget",
              title: "Budget Alert",
              message: `You're approaching your budget limit for this category.`,
              severity: "warning",
            });
          }
        }
      });

      // Check upcoming recurring transactions
      templates.forEach((template) => {
        if (!template.isActive) return;

        const nextOccurrence = getNextOccurrence(template);
        const daysUntil = Math.ceil(
          (nextOccurrence.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntil <= 3 && daysUntil >= 0) {
          const existingAlert = notifications.find(
            (n) =>
              n.type === "recurring" &&
              n.message.includes(template.name) &&
              n.message.includes("due"),
          );

          if (!existingAlert) {
            addNotification({
              type: "recurring",
              title: "Upcoming Transaction",
              message: `${template.name} is due ${daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}.`,
              severity: "info",
            });
          }
        }
      });

      // Monthly summary (first day of month)
      if (now.getDate() === 1) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthTransactions = transactions.filter((t) => {
          const txnDate = new Date(t.date);
          return (
            txnDate.getMonth() === lastMonth.getMonth() &&
            txnDate.getFullYear() === lastMonth.getFullYear()
          );
        });

        const income = lastMonthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = lastMonthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const existingSummary = notifications.find(
          (n) =>
            n.type === "summary" &&
            n.timestamp.getMonth() === now.getMonth() &&
            n.timestamp.getFullYear() === now.getFullYear(),
        );

        if (!existingSummary) {
          addNotification({
            type: "summary",
            title: "Monthly Summary",
            message: `Last month: ₹${income.toLocaleString()} income, ₹${expenses.toLocaleString()} expenses.`,
            severity: "info",
          });
        }
      }
    } catch (error) {
      console.error("Error checking for alerts:", error);
    }
  };

  // Helper function for recurring templates
  const getNextOccurrence = (template: RecurringTransactionTemplate): Date => {
    const startDate = new Date(template.startDate);
    const lastGenerated = template.lastGenerated
      ? new Date(template.lastGenerated)
      : startDate;
    const now = new Date();

    if (lastGenerated >= now) return lastGenerated;

    let nextDate = new Date(lastGenerated);

    switch (template.frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  };

  // Check for alerts on component mount and periodically
  useEffect(() => {
    checkForAlerts();

    // Check every hour
    const interval = setInterval(checkForAlerts, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    checkForAlerts,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
