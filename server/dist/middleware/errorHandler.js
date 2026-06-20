export function errorHandler(err, req, res, next) {
    console.error("[Error Handler]:", err);
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        error: {
            status,
            message,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        },
    });
}
