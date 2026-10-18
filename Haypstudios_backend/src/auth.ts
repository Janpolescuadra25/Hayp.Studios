import express from "express";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import rateLimit from "express-rate-limit";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "vsession";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "";
const OWNER_PASSWORD_HASH = process.env.OWNER_PASSWORD_HASH ?? "";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

const secretKey = () => new TextEncoder().encode(SESSION_SECRET);

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function readSessionCookie(req: express.Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return rest.join("=");
  }
  return null;
}

export async function requireOwner(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const token = readSessionCookie(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    await jwtVerify(token, secretKey());
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}

export function createAuthRouter(): express.Router {
  const router = express.Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: "too many attempts" },
  });

  router.post("/login", loginLimiter, async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!OWNER_EMAIL || !OWNER_PASSWORD_HASH || !SESSION_SECRET) {
      return res.status(500).json({ error: "auth not configured" });
    }
    const emailOk = safeEqual(email.toLowerCase(), OWNER_EMAIL.toLowerCase());
    const passwordOk = emailOk && (await bcrypt.compare(password, OWNER_PASSWORD_HASH));
    if (!emailOk || !passwordOk) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const token = await new SignJWT({ role: "owner" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
      .sign(secretKey());
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_SECONDS * 1000,
      path: "/",
    });
    return res.json({ ok: true });
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ ok: true });
  });

  router.get("/session", async (req, res) => {
    const token = readSessionCookie(req);
    if (!token) return res.json({ authenticated: false });
    try {
      await jwtVerify(token, secretKey());
      return res.json({ authenticated: true });
    } catch {
      return res.json({ authenticated: false });
    }
  });

  router.get("/ping", requireOwner, (_req, res) => {
    return res.json({ pong: true, owner: OWNER_EMAIL });
  });

  return router;
}
