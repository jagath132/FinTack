import { Router } from "express";
import { db } from "../db";
import { recurringTemplates } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/templates", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const data = await db.query.recurringTemplates.findMany({
            where: eq(recurringTemplates.userId, req.userId!),
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching templates" });
    }
});

router.post("/templates", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id, name, amount, type, categoryId, frequency, startDate, description } = req.body;

        const [newItem] = await db.insert(recurringTemplates).values({
            id: id || Math.random().toString(36).substring(2, 11),
            userId: req.userId!,
            categoryId,
            name,
            amount,
            type,
            frequency,
            startDate: new Date(startDate),
            description,
            isActive: true,
        }).returning();

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating template" });
    }
});

router.patch("/templates/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (body.startDate) body.startDate = new Date(body.startDate);
        if (body.lastGenerated) body.lastGenerated = new Date(body.lastGenerated);

        const [updated] = await db.update(recurringTemplates)
            .set(body)
            .where(and(eq(recurringTemplates.id, id), eq(recurringTemplates.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ message: "Template not found" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating template" });
    }
});

router.delete("/templates/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await db.delete(recurringTemplates)
            .where(and(eq(recurringTemplates.id, id), eq(recurringTemplates.userId, req.userId!)))
            .returning();

        if (!deleted) return res.status(404).json({ message: "Template not found" });
        res.json({ message: "Template deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting template" });
    }
});

export default router;
