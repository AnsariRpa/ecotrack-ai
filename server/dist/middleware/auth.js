/**
 * Firebase Authentication Middleware for EcoTrack AI
 *
 * Validates Firebase ID tokens on authenticated routes.
 * In development mode (no FIREBASE_PROJECT_ID env var), falls back to a
 * mock developer user so the app runs without any Firebase configuration.
 *
 * Production: Set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 */
// ── Firebase Admin Lazy Initialisation ──────────────────────────────────────
let adminApp = null; // eslint-disable-line @typescript-eslint/no-explicit-any
let authInstance = null; // eslint-disable-line @typescript-eslint/no-explicit-any
async function getFirebaseAuth() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId)
        return null;
    if (authInstance)
        return authInstance;
    try {
        // firebase-admin exports via both default and named, use the default export
        const adminModule = await import("firebase-admin");
        const admin = adminModule.default ?? adminModule;
        if (!adminApp) {
            // Support both service account JSON string and individual env vars
            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
            if (serviceAccountJson) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                adminApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId,
                });
            }
            else {
                // Individual env vars (Cloud Run IAM-managed credentials)
                const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
                const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
                if (clientEmail && privateKey) {
                    adminApp = admin.initializeApp({
                        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
                        projectId,
                    });
                }
                else {
                    // Application Default Credentials (Cloud Run automatic auth)
                    adminApp = admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                        projectId,
                    });
                }
            }
            console.log("[AuthMiddleware] Firebase Admin initialised for project:", projectId);
        }
        authInstance = admin.auth(adminApp);
        return authInstance;
    }
    catch (err) {
        console.error("[AuthMiddleware] Failed to initialise Firebase Admin:", err);
        return null;
    }
}
// ── Developer Fallback User ──────────────────────────────────────────────────
const DEV_USER = {
    uid: "dev-user-001",
    email: "dev@ecotrack.ai",
    name: "Developer User",
    provider: "dev",
};
// ── Auth Middleware ──────────────────────────────────────────────────────────
/**
 * Optional authentication middleware.
 * - With Firebase configured: validates Bearer token from Authorization header
 * - Without Firebase configured: attaches dev user, continues without blocking
 *
 * Routes that require authentication should call requireAuth after this.
 */
export async function authenticateUser(req, res, next) {
    const auth = await getFirebaseAuth();
    if (!auth) {
        // Development mode — attach mock user and continue
        req.user = DEV_USER;
        return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        // No token provided — attach dev user for backward compat with anonymous routes
        req.user = DEV_USER;
        return next();
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            provider: "firebase",
        };
        next();
    }
    catch (error) {
        console.warn("[AuthMiddleware] Invalid Firebase token:", error);
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
            message: "Invalid or expired authentication token",
        });
    }
}
/**
 * Guard middleware — requires a valid authenticated user (not dev fallback).
 * Use on routes that must be authenticated in production.
 */
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
            message: "Authentication required",
        });
    }
    next();
}
export { DEV_USER };
