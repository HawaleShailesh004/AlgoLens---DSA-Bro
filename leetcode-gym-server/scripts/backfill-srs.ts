/**
 * Backfill script to calculate easeFactor and lastInterval for existing logs
 * 
 * Run with: npx tsx scripts/backfill-srs.ts
 * 
 * This script:
 * 1. Finds all logs without easeFactor/lastInterval
 * 2. Groups logs by userId + slug
 * 3. Calculates SRS values based on review history
 * 4. Updates logs with calculated values
 */

import { PrismaClient } from "@prisma/client";
import { calculateSM2, getInitialSRS } from "../lib/srs";

const prisma = new PrismaClient();

async function backfillSRS() {
  console.log("Starting SRS backfill...");

  try {
    // Get all logs ordered by reviewedAt
    const allLogs = await prisma.log.findMany({
      orderBy: { reviewedAt: "asc" },
    });

    console.log(`Found ${allLogs.length} logs to process`);

    // Group logs by userId + slug
    const logsByProblem = new Map<string, typeof allLogs>();
    
    for (const log of allLogs) {
      const key = `${log.userId}:${log.slug}`;
      if (!logsByProblem.has(key)) {
        logsByProblem.set(key, []);
      }
      logsByProblem.get(key)!.push(log);
    }

    console.log(`Found ${logsByProblem.size} unique problems`);

    let updated = 0;
    let skipped = 0;

    // Process each problem's review history
    for (const [key, logs] of logsByProblem.entries()) {
      // Sort by reviewedAt to process chronologically
      logs.sort((a, b) => a.reviewedAt.getTime() - b.reviewedAt.getTime());

      let currentEaseFactor = 2.5;
      let currentLastInterval: number | null = null;

      for (const log of logs) {
        // Skip if already has SRS values
        if (log.easeFactor !== null && log.lastInterval !== null) {
          skipped++;
          continue;
        }

        // Calculate SRS values
        const srsResult = calculateSM2(
          log.confidence,
          currentEaseFactor,
          currentLastInterval
        );

        // Update log
        await prisma.log.update({
          where: { id: log.id },
          data: {
            easeFactor: srsResult.easeFactor,
            lastInterval: srsResult.interval,
            // Recalculate nextReviewAt if it's outdated
            nextReviewAt: srsResult.nextReviewAt,
          },
        });

        // Update for next iteration
        currentEaseFactor = srsResult.easeFactor;
        currentLastInterval = srsResult.interval;
        updated++;
      }
    }

    console.log(`\nBackfill complete!`);
    console.log(`- Updated: ${updated} logs`);
    console.log(`- Skipped: ${skipped} logs (already had SRS values)`);
  } catch (error) {
    console.error("Error during backfill:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  backfillSRS()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { backfillSRS };
