import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, title, description, category, targetValue, unit, deadline } = req.body;

    let finalUserId = userId;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(404).json({ success: false, error: "No user found" });
      }
      finalUserId = defaultUser.id;
    }

    const goal = await prisma.goal.create({
      data: {
        userId: finalUserId,
        title,
        description,
        category,
        targetValue: parseFloat(targetValue),
        currentValue: 0,
        unit,
        deadline: new Date(deadline),
      },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
}

export async function getGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;

    let finalUserId = userId as string;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.json({ success: true, data: [] });
      }
      finalUserId = defaultUser.id;
    }

    const goals = await prisma.goal.findMany({
      where: { userId: finalUserId },
      orderBy: { deadline: "asc" },
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.goal.delete({ where: { id } });
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
}
