import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { createActivity, getActivities, deleteActivity, getDashboardSummary, } from "../controllers/activityController.js";
import { createGoal, getGoals, deleteGoal } from "../controllers/goalController.js";
import { getAchievements } from "../controllers/achievementController.js";
import { getCoachingAdvice } from "../controllers/coachController.js";
import { getFacts } from "../controllers/educationController.js";
const router = Router();
// Dashboard Summary
router.get("/summary", getDashboardSummary);
// Activities Routing
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
// Goals Routing
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
// Achievements Routing
router.get("/achievements", getAchievements);
// Coach Routing
router.get("/coach/advice", getCoachingAdvice);
// Education Routing
router.get("/education", getFacts);
export default router;
