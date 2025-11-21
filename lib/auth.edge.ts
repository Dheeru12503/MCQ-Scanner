import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function verifyTokenEdge(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as { userId: string };
    } catch {
        return null;
    }
}
