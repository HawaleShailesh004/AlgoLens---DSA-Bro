import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { authBodySchema } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = authBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Validation failed", details: msg },
      { status: 400 }
    );
  }

  const { type, email, password } = parsed.data;

  try {
    if (type === "signup") {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });
      const token = await signToken(user.id, user.email);
      return NextResponse.json({
        id: user.id,
        email: user.email,
        token,
      });
    }

    if (type === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
      const token = await signToken(user.id, user.email);
      return NextResponse.json({
        id: user.id,
        email: user.email,
        token,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    console.error("Auth error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
