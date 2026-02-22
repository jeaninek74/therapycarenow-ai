/**
 * Compliance Sync Scheduler
 * Runs a full compliance sync daily at 2:00 AM UTC.
 * Imported and started from server/_core/index.ts.
 */

import { runFullComplianceSync } from "./complianceSync";

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;

function msUntilNextRun(targetHourUTC: number): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), targetHourUTC, 0, 0, 0));
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function runAndReschedule(): Promise<void> {
  console.log("[ComplianceScheduler] Running scheduled compliance sync...");
  try {
    const results = await runFullComplianceSync();
    const totalChanges = results.reduce((sum, r) => sum + r.changesDetected, 0);
    console.log(`[ComplianceScheduler] Sync complete. Total changes detected: ${totalChanges}`);
  } catch (err) {
    console.error("[ComplianceScheduler] Sync failed:", err);
  }
  // Schedule next run in 24 hours
  schedulerTimer = setTimeout(runAndReschedule, 24 * 60 * 60 * 1000);
}

export function startComplianceScheduler(): void {
  const delayMs = msUntilNextRun(2); // 2:00 AM UTC
  const hoursUntilNext = Math.round(delayMs / 1000 / 60 / 60 * 10) / 10;
  console.log(`[ComplianceScheduler] Scheduled. Next sync in ${hoursUntilNext}h (daily at 02:00 UTC).`);
  schedulerTimer = setTimeout(runAndReschedule, delayMs);
}

export function stopComplianceScheduler(): void {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
    console.log("[ComplianceScheduler] Stopped.");
  }
}
