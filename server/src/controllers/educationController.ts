import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function getFacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;

    const facts = await prisma.educationHubFact.findMany({
      where: {
        category: category ? (category as string) : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: facts });
  } catch (error) {
    next(error);
  }
}
