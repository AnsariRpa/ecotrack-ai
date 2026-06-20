import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function getAchievements(req: Request, res: Response, next: NextFunction) {
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

    const achievements = await prisma.achievement.findMany({
      where: { userId: finalUserId },
      orderBy: { unlockedAt: "desc" },
    });

    res.json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
}
