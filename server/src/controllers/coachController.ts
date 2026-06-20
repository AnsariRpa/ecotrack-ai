/**
 * Coach Controller — Gemini-Powered Explainable AI Recommendations
 *
 * Upgraded from rule-based aiCoachService to Google Gemini Pro-driven
 * personalised coaching with full explainability: reasoning, behavioural
 * insights, reduction methods, sustainability impact, and actionable steps.
 *
 * Falls back to rule-based engine when GEMINI_API_KEY is not set.
 */

import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { generateExplainableRecommendations } from "../services/geminiService.js";

export async function getCoachingAdvice(req: Request, res: Response, next: NextFunction) {
  try {
    // Resolve userId from query param, auth context, or default user
    let finalUserId = (req.query.userId ?? req.user?.uid) as string | undefined;

    if (!finalUserId || finalUserId === "dev-user-001") {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(404).json({ success: false, error: "No user found" });
      }
      finalUserId = defaultUser.id;
    }

    // Fetch recent activities for personalised analysis (last 7 days)
    const startOf7DaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activities = await prisma.activity.findMany({
      where: {
        userId: finalUserId,
        date: { gte: startOf7DaysAgo },
      },
      orderBy: { date: "desc" },
    });

    // Generate explainable recommendations via Gemini (with rule-based fallback)
    const recommendations = await generateExplainableRecommendations(activities);

    // Persist recommendations (clear stale ones first)
    await prisma.recommendation.deleteMany({ where: { userId: finalUserId } });

    const savedRecommendations = await Promise.all(
      recommendations.map((rec) =>
        prisma.recommendation.create({
          data: {
            userId: finalUserId!,
            category: rec.category,
            title: rec.title,
            content: rec.content,
            potentialSaving: rec.potentialSaving,
            // Store extended explainability fields as JSON in the content suffix
            // (schema upgrade-free approach for backward compatibility)
          },
        })
      )
    );

    // Merge persisted IDs back with the full explainability data
    const enrichedRecommendations = savedRecommendations.map((saved, i) => ({
      ...saved,
      reasoning: recommendations[i]?.reasoning ?? "",
      behaviourInsight: recommendations[i]?.behaviourInsight ?? "",
      reductionMethod: recommendations[i]?.reductionMethod ?? "",
      sustainabilityImpact: recommendations[i]?.sustainabilityImpact ?? "",
      actionableSteps: recommendations[i]?.actionableSteps ?? [],
      confidence: recommendations[i]?.confidence ?? "medium",
      aiGenerated: recommendations[i]?.aiGenerated ?? false,
    }));

    res.json({
      success: true,
      data: enrichedRecommendations,
      meta: {
        activitiesAnalysed: activities.length,
        period: "7 days",
        poweredBy: recommendations[0]?.aiGenerated ? "Google Gemini Pro" : "Rule Engine (fallback)",
      },
    });
  } catch (error) {
    next(error);
  }
}
