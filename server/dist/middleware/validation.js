import { validationResult } from "express-validator";
export function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.type === "field" ? err.path : err.type,
                message: err.msg,
            })),
        });
    }
    next();
}
