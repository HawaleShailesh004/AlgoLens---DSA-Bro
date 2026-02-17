import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "algolens-gym-secret-change-in-production"
);

const JWT_ISSUER = "algolens-gym";
const JWT_AUDIENCE = "algolens-gym";
const JWT_EXPIRY = "7d";

export type JWTPayload = { sub: string; email: string };

export async function signToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    const sub = payload.sub as string;
    const email = (payload.email as string) || "";
    if (!sub) return null;
    return { sub, email };
  } catch {
    return null;
  }
}

/** Get userId from Authorization: Bearer <token>. Returns null if missing/invalid. */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  const payload = await verifyToken(token);
  return payload?.sub ?? null;
}
