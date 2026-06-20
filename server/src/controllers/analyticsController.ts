/**
 * Analytics Controller — Carbon Forecasting Endpoint
 *
 * Provides AI-driven (Gemini) or rule-based carbon emission forecasts
 * for 7-day and 30-day windows. Integrates with the Gemini AI service
 * to analyse historical trends and project future emissions.
 *
 * Route: GET /api/analytics/forecast?days=7|30&userId=<id>
 */

import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { generateCarbonForecast } from "../services/geminiService.js";

export async function getForecast(req: Request, res: Response, next: NextFunction) {
  try {
    const rawDays = parseInt(req.query.days as string, 10);
    const forecastDays: 7 | 30 = rawDays === 30 ? 30 : 7;

    // Resolve userId from query param, auth token, or default user
    let finalUserId = (req.query.userId ?? req.user?.uid) as string | undefined;

    if (!finalUserId || finalUserId === "dev-user-001") {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(404).json({ success: false, error: "No user found" });
      }
      finalUserId = defaultUser.id;
    }

    // Fetch historical activities for trend analysis (last 30 days)
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activities = await prisma.activity.findMany({
      where: {
        userId: finalUserId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Fetch the user's active goal to calculate achievement probability
    const activeGoal = await prisma.goal.findFirst({
      where: {
        userId: finalUserId,
        deadline: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const targetKgCO2PerDay = activeGoal
      ? activeGoal.targetValue / 30 // approximate monthly target to daily
      : undefined;

    // Generate forecast using Gemini AI (with rule-based fallback)
    const forecast = await generateCarbonForecast(activities, forecastDays, targetKgCO2PerDay);

    res.json({
      success: true,
      data: {
        forecast,
        activeGoal: activeGoal
          ? {
              id: activeGoal.id,
              title: activeGoal.title,
              targetValue: activeGoal.targetValue,
              unit: activeGoal.unit,
              deadline: activeGoal.deadline,
            }
          : null,
        historicalDataPoints: activities.length,
        analysedPeriodDays: 30,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/summary — Aggregated emission breakdown by category/period
 */
export async function getAnalyticsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    let finalUserId = (req.query.userId ?? req.user?.uid) as string | undefined;

    if (!finalUserId || finalUserId === "dev-user-001") {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(404).json({ success: false, error: "No user found" });
      }
      finalUserId = defaultUser.id;
    }

    const periods = { "7d": 7, "30d": 30, "90d": 90 };
    const results: Record<string, unknown> = {};

    for (const [label, days] of Object.entries(periods)) {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const activities = await prisma.activity.findMany({
        where: { userId: finalUserId, date: { gte: startDate } },
      });

      const byCategory = activities.reduce(
        (acc, act) => {
          acc[act.category] = (acc[act.category] ?? 0) + act.carbonTons;
          return acc;
        },
        {} as Record<string, number>
      );

      results[label] = {
        totalKgCO2: activities.reduce((s, a) => s + a.carbonTons, 0),
        activityCount: activities.length,
        byCategory,
      };
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}
