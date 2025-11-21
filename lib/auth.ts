import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Compare passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Generate JWT
export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT
export function verifyToken(token: string): { userId: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded;
    } catch {
        return null;
    }
}

// Get userId from request (NO NextRequest needed)
export function getUserIdFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie"); // Raw cookie header
    if (!cookieHeader) return null;

    // Parse cookies manually
    const cookies: Record<string, string> = Object.fromEntries(
        cookieHeader.split("; ").map(cookie => cookie.split("="))
    );

    const token = cookies.token;
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded?.userId || null;
}
