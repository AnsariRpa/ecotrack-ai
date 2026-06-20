import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { generateRecommendations } from "../services/aiCoachService.js";

export async function getCoachingAdvice(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;

    let finalUserId = userId as string;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(404).json({ success: false, error: "No user found" });
      }
      finalUserId = defaultUser.id;
    }

    // Fetch user activities from the last 7 days
    const startOf7DaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activities = await prisma.activity.findMany({
      where: {
        userId: finalUserId,
        date: { gte: startOf7DaysAgo },
      },
    });

    // Generate personalized advice
    const recommendations = generateRecommendations(activities);

    // Clean up old recommendations
    await prisma.recommendation.deleteMany({
      where: { userId: finalUserId },
    });

    const savedRecommendations = [];
    for (const rec of recommendations) {
      const saved = await prisma.recommendation.create({
        data: {
          userId: finalUserId,
          category: rec.category,
          title: rec.title,
          content: rec.content,
          potentialSaving: rec.potentialSaving,
        },
      });
      savedRecommendations.push(saved);
    }

    res.json({
      success: true,
      data: savedRecommendations,
    });
  } catch (error) {
    next(error);
  }
}
