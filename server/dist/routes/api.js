/**
 * API Router — EcoTrack AI
 *
 * Wires all routes with validation middleware and optional Firebase auth.
 * Includes the new /analytics/forecast and /analytics/summary endpoints.
 */
import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateUser } from "../middleware/auth.js";
import { createActivity, getActivities, deleteActivity, getDashboardSummary, } from "../controllers/activityController.js";
import { createGoal, getGoals, deleteGoal } from "../controllers/goalController.js";
import { getAchievements } from "../controllers/achievementController.js";
import { getCoachingAdvice } from "../controllers/coachController.js";
import { getFacts } from "../controllers/educationController.js";
import { getForecast, getAnalyticsSummary } from "../controllers/analyticsController.js";
const router = Router();
// ── Global Auth Middleware ────────────────────────────────────────────────────
// Attaches req.user to all routes. Falls back to dev user when Firebase is unconfigured.
router.use(authenticateUser);
// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/summary", getDashboardSummary);
// ── Activities ────────────────────────────────────────────────────────────────
router.post("/activities", [
    body("category")
        .isIn(["transportation", "food", "energy", "waste"])
        .withMessage("Category must be one of: transportation, food, energy, waste"),
    body("type").notEmpty().withMessage("Activity type is required"),
    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number"),
    body("date").optional().isISO8601().withMessage("Date must be a valid ISO8601 date"),
    validateRequest,
], createActivity);
router.get("/activities", getActivities);
router.delete("/activities/:id", deleteActivity);
// ── Goals ─────────────────────────────────────────────────────────────────────
router.post("/goals", [
    body("title").trim().notEmpty().withMessage("Goal title is required"),
    body("category")
        .isIn(["transportation", "food", "energy", "waste", "overall"])
        .withMessage("Goal category must be transportation, food, energy, waste, or overall"),
    body("targetValue")
        .isFloat({ gt: 0 })
        .withMessage("Target value must be a positive number"),
    body("unit").notEmpty().withMessage("Unit is required"),
    body("deadline")
        .isISO8601()
        .withMessage("Deadline must be a valid ISO8601 date")
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error("Deadline must be in the future");
        }
        return true;
    }),
    validateRequest,
], createGoal);
router.get("/goals", getGoals);
router.delete("/goals/:id", deleteGoal);
// ── Achievements ──────────────────────────────────────────────────────────────
router.get("/achievements", getAchievements);
// ── AI Coach ──────────────────────────────────────────────────────────────────
router.get("/coach/advice", getCoachingAdvice);
// ── Analytics & Forecasting (Gemini-powered) ─────────────────────────────────
router.get("/analytics/forecast", getForecast);
router.get("/analytics/summary", getAnalyticsSummary);
// ── Education ─────────────────────────────────────────────────────────────────
router.get("/education", getFacts);
export default router;
