import { Router } from "express";
import { db } from "../db";
import { budgets } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const data = await db.query.budgets.findMany({
            where: eq(budgets.userId, req.userId!),
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching budgets" });
    }
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id, categoryId, amount, period, startDate, endDate } = req.body;

        const [newItem] = await db.insert(budgets).values({
            id: id || Math.random().toString(36).substring(2, 11),
            userId: req.userId!,
            categoryId,
            amount,
            period,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        }).returning();

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating budget" });
    }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (body.startDate) body.startDate = new Date(body.startDate);
        if (body.endDate) body.endDate = new Date(body.endDate);

        const [updated] = await db.update(budgets)
            .set(body)
            .where(and(eq(budgets.id, id), eq(budgets.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ message: "Budget not found" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating budget" });
    }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await db.delete(budgets)
            .where(and(eq(budgets.id, id), eq(budgets.userId, req.userId!)))
            .returning();

        if (!deleted) return res.status(404).json({ message: "Budget not found" });
        res.json({ message: "Budget deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget" });
    }
});

export default router;
