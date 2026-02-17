/**
 * One-time migration: move all data from shailesh@gmail.com to a new account
 * and print the new credentials.
 *
 * Run from project root: node --env-file=.env scripts/migrate-to-new-account.js
 * Or (if Node < 20): set DATABASE_URL and run node scripts/migrate-to-new-account.js
 */

const { readFileSync, existsSync } = require("fs");
const { join } = require("path");

// Load .env from project root (simple parser)
const envPath = existsSync(join(__dirname, "..", ".env"))
  ? join(__dirname, "..", ".env")
  : join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const eq = line.indexOf("=");
      if (eq > 0) {
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
}

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const OLD_EMAIL = "shailesh@gmail.com";
const NEW_EMAIL = "shailesh.algolens@gmail.com";
const NEW_PASSWORD = "AlgoLens2025!ChangeMe";

async function main() {
  const prisma = new PrismaClient();

  const oldUser = await prisma.user.findUnique({
    where: { email: OLD_EMAIL },
    include: { logs: true },
  });

  if (!oldUser) {
    console.error("No user found with email:", OLD_EMAIL);
    process.exit(1);
  }

  const existingNew = await prisma.user.findUnique({
    where: { email: NEW_EMAIL },
  });
  if (existingNew) {
    console.error("New email already exists:", NEW_EMAIL);
    console.error("Use a different NEW_EMAIL in the script or change password for that account.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
  const newUser = await prisma.user.create({
    data: {
      email: NEW_EMAIL,
      password: hashedPassword,
    },
  });

  const count = await prisma.log.updateMany({
    where: { userId: oldUser.id },
    data: { userId: newUser.id },
  });

  console.log("\n--- Migration done ---");
  console.log("Moved", count.count, "log(s) from", OLD_EMAIL, "to new account.");
  console.log("\n--- NEW ACCOUNT CREDENTIALS (save these) ---");
  console.log("Email:", NEW_EMAIL);
  console.log("Password:", NEW_PASSWORD);
  console.log("\nSign in at your app login page, then change password if you want.");
  console.log("---\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
