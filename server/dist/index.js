import app from "./app.js";
import { prisma } from "./db.js";
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`[EcoTrack AI Server] running on port ${PORT}`);
});
// Graceful shutdown handling for Cloud Run containers
const gracefulShutdown = async () => {
    console.log("Initiating graceful shutdown...");
    server.close(async () => {
        console.log("HTTP server closed.");
        await prisma.$disconnect();
        console.log("Database connections disconnected.");
        process.exit(0);
    });
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
