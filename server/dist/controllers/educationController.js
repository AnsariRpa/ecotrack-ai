import { prisma } from "../db.js";
export async function getFacts(req, res, next) {
    try {
        const { category } = req.query;
        const facts = await prisma.educationHubFact.findMany({
            where: {
                category: category ? category : undefined,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: facts });
    }
    catch (error) {
        next(error);
    }
}
