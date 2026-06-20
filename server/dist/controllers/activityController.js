import { prisma } from "../db.js";
import { calculateEmissions, getUnitForType } from "../services/calculationService.js";
// Helper to check and unlock achievements
async function checkAndUnlockAchievements(userId) {
    const unlockedBadges = [];
    // Get all user activities
    const activities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { date: "asc" },
    });
    // 1. Check PLANT_PIONEER (10 vegetarian/vegan meals)
    const plantMealsCount = activities.filter((act) => act.category === "food" && (act.type === "vegan" || act.type === "vegetarian")).length;
    if (plantMealsCount >= 10) {
        const existing = await prisma.achievement.findUnique({
            where: { userId_badgeCode: { userId, badgeCode: "PLANT_PIONEER" } },
        });
        if (!existing) {
            await prisma.achievement.create({
                data: {
                    userId,
                    badgeCode: "PLANT_PIONEER",
                    name: "Plant-Based Pioneer",
                    description: "Logged 10 vegan or vegetarian meals.",
                    icon: "🌿",
                },
            });
            unlockedBadges.push("Plant-Based Pioneer 🌿");
        }
    }
    // 2. Check GREEN_COMMUTER (5 consecutive days of walking, bike, bus, train)
    const transitDates = new Set();
    activities.forEach((act) => {
        if (act.category === "transportation" &&
            ["walking", "bike", "bus", "train"].includes(act.type)) {
            transitDates.add(act.date.toISOString().split("T")[0]);
        }
    });
    const sortedDates = Array.from(transitDates).sort();
    let streak = 0;
    let maxStreak = 0;
    let prevDate = null;
    for (const dateStr of sortedDates) {
        const currDate = new Date(dateStr);
        if (!prevDate) {
            streak = 1;
        }
        else {
            const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streak += 1;
            }
            else if (diffDays > 1) {
                streak = 1;
            }
        }
        prevDate = currDate;
        if (streak > maxStreak) {
            maxStreak = streak;
        }
    }
    if (maxStreak >= 5) {
        const existing = await prisma.achievement.findUnique({
            where: { userId_badgeCode: { userId, badgeCode: "GREEN_COMMUTER" } },
        });
        if (!existing) {
            await prisma.achievement.create({
                data: {
                    userId,
                    badgeCode: "GREEN_COMMUTER",
                    name: "Green Commuter",
                    description: "Logged a walking, cycling, or train activity for 5 consecutive days.",
                    icon: "🚲",
                },
            });
            unlockedBadges.push("Green Commuter 🚲");
        }
    }
    // 3. Check ENERGY_SAVER (Logged AC or electricity under budget)
    // Let's unlock if total electricity in past 30 days is under 300 kWh and they have at least 5 logs
    const elecLogs = activities.filter((act) => act.category === "energy" && act.type === "electricity");
    const totalElec = elecLogs.reduce((sum, act) => sum + act.amount, 0);
    if (elecLogs.length >= 10 && totalElec < 300) {
        const existing = await prisma.achievement.findUnique({
            where: { userId_badgeCode: { userId, badgeCode: "ENERGY_SAVER" } },
        });
        if (!existing) {
            await prisma.achievement.create({
                data: {
                    userId,
                    badgeCode: "ENERGY_SAVER",
                    name: "Energy Saver",
                    description: "Logged 10+ electricity activities keeping consumption under 300 kWh.",
                    icon: "⚡",
                },
            });
            unlockedBadges.push("Energy Saver ⚡");
        }
    }
    return unlockedBadges;
}
// Recalculates all active goals' current values
async function recalculateGoalProgress(userId) {
    const activeGoals = await prisma.goal.findMany({
        where: { userId, isCompleted: false },
    });
    for (const goal of activeGoals) {
        // Sum matching activities since goal creation date
        const activities = await prisma.activity.findMany({
            where: {
                userId,
                category: goal.category === "overall" ? undefined : goal.category,
                date: { gte: goal.createdAt },
            },
        });
        let sum = 0;
        if (goal.unit === "km") {
            sum = activities.filter((act) => act.category === "transportation" && act.type !== "walking" && act.type !== "bike").reduce((acc, act) => acc + act.amount, 0);
        }
        else if (goal.unit === "meals") {
            sum = activities.filter((act) => act.category === "food" && (act.type === "vegan" || act.type === "vegetarian")).reduce((acc, act) => acc + act.amount, 0);
        }
        else if (goal.unit === "kWh") {
            sum = activities.filter((act) => act.category === "energy" && act.type === "electricity").reduce((acc, act) => acc + act.amount, 0);
        }
        else if (goal.unit === "kg") {
            sum = activities.filter((act) => act.category === "waste" && act.type === "recycling").reduce((acc, act) => acc + act.amount, 0);
        }
        else {
            // Default to carbon reduction sum
            sum = activities.reduce((acc, act) => acc + act.carbonTons, 0);
        }
        const isCompleted = goal.targetValue > 0 && goal.unit === "km"
            ? sum <= goal.targetValue // for driving, less is better
            : sum >= goal.targetValue; // for positive habits (recycling/vegan meals)
        await prisma.goal.update({
            where: { id: goal.id },
            data: {
                currentValue: Math.round(sum * 100) / 100,
                isCompleted: isCompleted,
            },
        });
    }
}
export async function createActivity(req, res, next) {
    try {
        const { userId, category, type, amount, date } = req.body;
        // Default user if none specified (for simple local dev)
        let finalUserId = userId;
        if (!finalUserId) {
            const defaultUser = await prisma.user.findFirst();
            if (!defaultUser) {
                return res.status(404).json({ success: false, error: "No users found. Please seed the database." });
            }
            finalUserId = defaultUser.id;
        }
        const carbonTons = calculateEmissions(category, type, amount);
        const unit = getUnitForType(category, type);
        const activity = await prisma.activity.create({
            data: {
                userId: finalUserId,
                category,
                type,
                amount,
                unit,
                carbonTons,
                date: date ? new Date(date) : new Date(),
            },
        });
        // Update goals & achievements
        await recalculateGoalProgress(finalUserId);
        const unlockedBadges = await checkAndUnlockAchievements(finalUserId);
        res.status(201).json({
            success: true,
            data: activity,
            unlockedBadges,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getActivities(req, res, next) {
    try {
        const { userId, category, limit } = req.query;
        let finalUserId = userId;
        if (!finalUserId) {
            const defaultUser = await prisma.user.findFirst();
            if (!defaultUser) {
                return res.status(204).json({ success: true, data: [] });
            }
            finalUserId = defaultUser.id;
        }
        const activities = await prisma.activity.findMany({
            where: {
                userId: finalUserId,
                category: category ? category : undefined,
            },
            orderBy: { date: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });
        res.json({ success: true, data: activities });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteActivity(req, res, next) {
    try {
        const { id } = req.params;
        const activity = await prisma.activity.findUnique({ where: { id } });
        if (!activity) {
            return res.status(404).json({ success: false, error: "Activity not found" });
        }
        await prisma.activity.delete({ where: { id } });
        // Update goals
        await recalculateGoalProgress(activity.userId);
        res.json({ success: true, message: "Activity deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}
export async function getDashboardSummary(req, res, next) {
    try {
        const { userId } = req.query;
        let finalUserId = userId;
        if (!finalUserId) {
            const defaultUser = await prisma.user.findFirst();
            if (!defaultUser) {
                return res.status(404).json({ success: false, error: "No user found. Seed the database." });
            }
            finalUserId = defaultUser.id;
        }
        // Get current date boundaries
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const userActivities = await prisma.activity.findMany({
            where: { userId: finalUserId },
        });
        // Compute scores
        const todayScore = userActivities
            .filter((act) => act.date >= startOfToday)
            .reduce((sum, act) => sum + act.carbonTons, 0);
        const weeklyScore = userActivities
            .filter((act) => act.date >= startOf7DaysAgo)
            .reduce((sum, act) => sum + act.carbonTons, 0);
        const monthlyScore = userActivities
            .filter((act) => act.date >= startOf30DaysAgo)
            .reduce((sum, act) => sum + act.carbonTons, 0);
        // Calculate rating based on average daily emissions in the last 7 days
        const dailyAverage7Days = weeklyScore / 7;
        let rating = "A";
        if (dailyAverage7Days > 12)
            rating = "B";
        if (dailyAverage7Days > 22)
            rating = "C";
        if (dailyAverage7Days > 35)
            rating = "D";
        if (dailyAverage7Days > 50)
            rating = "E";
        // Category Breakdown (past 30 days)
        const recent30DaysLogs = userActivities.filter((act) => act.date >= startOf30DaysAgo);
        const categoryTotals = {
            transportation: 0,
            food: 0,
            energy: 0,
            waste: 0,
        };
        recent30DaysLogs.forEach((act) => {
            if (categoryTotals[act.category] !== undefined) {
                categoryTotals[act.category] += act.carbonTons;
            }
        });
        // Format category totals, ensure positive values (e.g. recycling might be negative, we can keep it as net emission or show offset)
        const breakdown = Object.entries(categoryTotals).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Math.max(0, Math.round(value * 100) / 100),
        }));
        // Goal stats
        const totalGoals = await prisma.goal.count({ where: { userId: finalUserId } });
        const completedGoals = await prisma.goal.count({ where: { userId: finalUserId, isCompleted: true } });
        const goalCompletionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        // Badges count
        const badgeCount = await prisma.achievement.count({ where: { userId: finalUserId } });
        // Recent 5 activities
        const recentActivities = await prisma.activity.findMany({
            where: { userId: finalUserId },
            orderBy: { date: "desc" },
            take: 5,
        });
        res.json({
            success: true,
            data: {
                scores: {
                    daily: Math.round(todayScore * 100) / 100,
                    weekly: Math.round(weeklyScore * 100) / 100,
                    monthly: Math.round(monthlyScore * 100) / 100,
                },
                rating,
                breakdown,
                goals: {
                    total: totalGoals,
                    completed: completedGoals,
                    percentage: goalCompletionPercentage,
                },
                badgeCount,
                recentActivities,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
