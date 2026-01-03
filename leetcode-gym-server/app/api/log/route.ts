import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate next date based on confidence (Spaced Repetition Logic)
const getNextDate = (confidence: number) => {
  const days = confidence === 1 ? 1 : confidence === 2 ? 3 : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export async function POST(req: Request) {
  const { userId, slug, title, confidence } = await req.json();

  // 1. Ensure User Exists
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) user = await prisma.user.create({ data: { id: userId } });

  // 2. Log the "Workout"
  const log = await prisma.log.create({
    data: {
      userId,
      slug,
      title,
      difficulty: "Medium", // You can pass this too
      confidence,
      nextReviewAt: getNextDate(confidence),
      
    }
  });

  return NextResponse.json(log);
}

// GET: Fetch "Today's Workout" (Problems to review)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json([]);

  const dueLogs = await prisma.log.findMany({
    where: {
      userId,
      nextReviewAt: { gte: new Date() }
    },
    orderBy: { nextReviewAt: 'asc' },
    take: 5 
  });

  console.log(dueLogs);

  return NextResponse.json(dueLogs);
}