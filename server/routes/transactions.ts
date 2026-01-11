import { Router } from "express";
import { db } from "../db";
import { transactions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all transactions for current user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const data = await db.query.transactions.findMany({
            where: eq(transactions.userId, req.userId!),
            orderBy: (transactions, { desc }) => [desc(transactions.date)],
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

// Create transaction
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id, name, amount, type, categoryId, date, description, notes, tags } = req.body;

        const [newTx] = await db.insert(transactions).values({
            id: id || Math.random().toString(36).substring(2, 11),
            userId: req.userId!,
            categoryId,
            name,
            amount,
            type,
            date: new Date(date),
            description,
            notes,
            tags,
        }).returning();

        res.status(201).json(newTx);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating transaction" });
    }
});

// Update transaction
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (body.date) body.date = new Date(body.date);

        const [updated] = await db.update(transactions)
            .set(body)
            .where(and(eq(transactions.id, id), eq(transactions.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ message: "Transaction not found" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating transaction" });
    }
});

// Delete transaction
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await db.delete(transactions)
            .where(and(eq(transactions.id, id), eq(transactions.userId, req.userId!)))
            .returning();

        if (!deleted) return res.status(404).json({ message: "Transaction not found" });
        res.json({ message: "Transaction deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting transaction" });
    }
});

export default router;
