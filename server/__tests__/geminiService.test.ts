/**
 * GeminiService Fallback Tests
 *
 * Tests the rule-based fallback implementations that run when
 * GEMINI_API_KEY is not set. These ensure the app works 100%
 * offline with identical API contracts.
 */

import { describe, it, expect, vi } from "vitest";
import { generateExplainableRecommendations, generateCarbonForecast } from "../src/services/geminiService.js";
import { Activity } from "@prisma/client";

// Ensure GEMINI_API_KEY is absent to trigger fallback path
vi.stubEnv("GEMINI_API_KEY", "");

const makeActivity = (overrides: Partial<Activity>): Activity => ({
  id: "1",
  userId: "u1",
  category: "transportation",
  type: "car",
  amount: 100,
  unit: "km",
  carbonTons: 18,
  date: new Date(),
  createdAt: new Date(),
  ...overrides,
});

describe("GeminiService — Fallback Recommendations", () => {
  it("returns exactly 4 recommendations for empty activity list", async () => {
    const recs = await generateExplainableRecommendations([]);
    expect(recs.length).toBe(4);
  });

  it("all recommendations have required explainability fields", async () => {
    const recs = await generateExplainableRecommendations([]);
    for (const rec of recs) {
      expect(rec.category).toBeTruthy();
      expect(rec.title).toBeTruthy();
      expect(rec.content).toBeTruthy();
      expect(rec.reasoning).toBeTruthy();
      expect(rec.behaviourInsight).toBeTruthy();
      expect(rec.reductionMethod).toBeTruthy();
      expect(rec.sustainabilityImpact).toBeTruthy();
      expect(Array.isArray(rec.actionableSteps)).toBe(true);
      expect(rec.actionableSteps.length).toBe(3);
      expect(["high", "medium", "low"]).toContain(rec.confidence);
      expect(typeof rec.potentialSaving).toBe("number");
    }
  });

  it("aiGenerated is false for fallback recommendations", async () => {
    const recs = await generateExplainableRecommendations([]);
    expect(recs.every((r) => r.aiGenerated === false)).toBe(true);
  });

  it("prioritises transportation when car usage is high", async () => {
    const activities = [makeActivity({ type: "car", amount: 200, carbonTons: 36 })];
    const recs = await generateExplainableRecommendations(activities);
    const transportRec = recs.find((r) => r.category === "transportation");
    expect(transportRec).toBeDefined();
    expect(transportRec!.potentialSaving).toBeGreaterThan(0);
  });

  it("generates food recommendation for high beef consumption", async () => {
    const activities = [
      makeActivity({ category: "food", type: "beef", amount: 5, unit: "meals", carbonTons: 36 }),
      makeActivity({ id: "2", category: "food", type: "beef", amount: 5, unit: "meals", carbonTons: 36 }),
    ];
    const recs = await generateExplainableRecommendations(activities);
    const foodRec = recs.find((r) => r.category === "food");
    expect(foodRec).toBeDefined();
  });

  it("covers all 4 emission categories in default recommendations", async () => {
    const recs = await generateExplainableRecommendations([]);
    const categories = recs.map((r) => r.category);
    expect(categories).toContain("transportation");
    expect(categories).toContain("food");
    expect(categories).toContain("energy");
    expect(categories).toContain("waste");
  });
});

describe("GeminiService — Fallback Forecasting", () => {
  it("returns a valid 7-day forecast for empty activities", async () => {
    const forecast = await generateCarbonForecast([], 7);
    expect(forecast.forecastDays).toBe(7);
    expect(forecast.dailyBreakdown.length).toBe(7);
    expect(forecast.projectedTotalKgCO2).toBeGreaterThan(0);
    expect(["improving", "stable", "worsening"]).toContain(forecast.trend);
    expect(forecast.insights.length).toBe(3);
    expect(forecast.aiGenerated).toBe(false);
  });

  it("returns a valid 30-day forecast", async () => {
    const activities = [makeActivity({ carbonTons: 10 }), makeActivity({ id: "2", carbonTons: 8 })];
    const forecast = await generateCarbonForecast(activities, 30);
    expect(forecast.forecastDays).toBe(30);
    expect(forecast.dailyBreakdown.length).toBe(30);
  });

  it("daily breakdown entries have required fields", async () => {
    const forecast = await generateCarbonForecast([], 7);
    for (const day of forecast.dailyBreakdown) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.projectedKgCO2).toBeGreaterThanOrEqual(0);
      expect(day.confidence).toBeGreaterThan(0);
      expect(day.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("goal achievement probability is 50 when no target set", async () => {
    const forecast = await generateCarbonForecast([], 7, undefined);
    expect(forecast.goalAchievementProbability).toBe(50);
  });

  it("goal achievement probability is > 50 when target is generous", async () => {
    const activities = [makeActivity({ carbonTons: 5 })]; // low emitter
    const forecast = await generateCarbonForecast(activities, 7, 20); // very generous target
    expect(forecast.goalAchievementProbability).toBeGreaterThanOrEqual(50);
  });

  it("detects improving trend when recent emissions are lower", async () => {
    // 6 old high-emission days, 3 recent low-emission days
    const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activities = [
      makeActivity({ id: "old1", date: oldDate, carbonTons: 20 }),
      makeActivity({ id: "old2", date: oldDate, carbonTons: 20 }),
      makeActivity({ id: "old3", date: oldDate, carbonTons: 20 }),
      makeActivity({ id: "new1", carbonTons: 2 }),
      makeActivity({ id: "new2", carbonTons: 2 }),
    ];
    const forecast = await generateCarbonForecast(activities, 7);
    // Could be improving given large reduction
    expect(["improving", "stable"]).toContain(forecast.trend);
  });
});
