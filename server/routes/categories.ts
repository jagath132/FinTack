import { Router } from "express";
import { db } from "../db";
import { categories } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all categories for user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const data = await db.query.categories.findMany({
            where: eq(categories.userId, req.userId!),
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

// Create category
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id, name, type, color, icon } = req.body;

        const [newItem] = await db.insert(categories).values({
            id: id || Math.random().toString(36).substring(2, 11),
            userId: req.userId!,
            name,
            type,
            color,
            icon,
        }).returning();

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating category" });
    }
});

// Update category
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const [updated] = await db.update(categories)
            .set(body)
            .where(and(eq(categories.id, id), eq(categories.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ message: "Category not found" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating category" });
    }
});

// Delete category
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await db.delete(categories)
            .where(and(eq(categories.id, id), eq(categories.userId, req.userId!)))
            .returning();

        if (!deleted) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category" });
    }
});

export default router;
