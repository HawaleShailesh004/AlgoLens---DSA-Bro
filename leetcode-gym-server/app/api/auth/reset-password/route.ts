import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, newPassword } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (new Date() > record.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json(
      { error: "Reset link has expired. Request a new one." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });
  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return NextResponse.json({ message: "Password updated. You can sign in now." });
}
