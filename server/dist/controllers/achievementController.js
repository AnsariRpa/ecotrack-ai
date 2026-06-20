import { prisma } from "../db.js";
export async function getAchievements(req, res, next) {
    try {
        const { userId } = req.query;
        let finalUserId = userId;
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
    }
    catch (error) {
        next(error);
    }
}
