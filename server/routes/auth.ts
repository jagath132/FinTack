import { Router } from "express";
import { db } from "../db";
import { users, categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, generateToken } from "../lib/auth";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const passwordHash = await hashPassword(password);
        const [newUser] = await db.insert(users).values({
            email,
            passwordHash,
            displayName: displayName || email.split("@")[0],
        }).returning({ id: users.id, email: users.email, displayName: users.displayName });

        // Seed default categories
        const defaults = [
            { id: "cat_1_" + newUser.id.substring(0, 4), name: "Salary", type: "income", color: "#10b981", icon: "DollarSign" },
            { id: "cat_2_" + newUser.id.substring(0, 4), name: "Groceries", type: "expense", color: "#f59e0b", icon: "ShoppingCart" },
            { id: "cat_3_" + newUser.id.substring(0, 4), name: "Utilities", type: "expense", color: "#ef4444", icon: "Zap" },
            { id: "cat_4_" + newUser.id.substring(0, 4), name: "Entertainment", type: "expense", color: "#ec4899", icon: "Film" },
            { id: "cat_5_" + newUser.id.substring(0, 4), name: "Dining Out", type: "expense", color: "#8b5cf6", icon: "Utensils" },
            { id: "cat_6_" + newUser.id.substring(0, 4), name: "Transportation", type: "expense", color: "#06b6d4", icon: "Car" },
        ];

        for (const cat of defaults) {
            await db.insert(categories).values({
                ...cat,
                userId: newUser.id,
                type: cat.type as "income" | "expense",
            });
        }

        const token = generateToken(newUser.id);
        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user.id);
        res.json({
            user: { id: user.id, email: user.email, displayName: user.displayName },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Current User
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.userId!),
            columns: {
                id: true,
                email: true,
                displayName: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
