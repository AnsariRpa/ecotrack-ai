import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(cors());
app.use(express.json());

// API routing
app.use("/api", apiRoutes);

// Resolve static path for React built files
const clientDistPath = path.resolve(__dirname, "../../client/dist");

// Serve static frontend files in production
app.use(express.static(clientDistPath));

// Catch-all route to serve React app for client-side routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Frontend assets not built yet. Run build process.");
    }
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
