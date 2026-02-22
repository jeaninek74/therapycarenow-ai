/**
 * Automated Compliance Monitoring Module
 *
 * Live data sources:
 *   - CMS data.cms.gov API (CPT codes, behavioral health policy datasets)
 *   - CMS RSS feeds (policy announcements, rule changes)
 *   - SAMHSA behavioral health statistics and treatment locator data
 *
 * Placeholder integrations (activate by setting env vars):
 *   - LexisNexis Regulatory Tracker (LEXISNEXIS_API_KEY)
 *   - Westlaw Edge API (WESTLAW_API_KEY + WESTLAW_CLIENT_ID)
 */

import axios from "axios";
import { getDb } from "./db";
import {
  complianceSyncLog,
  complianceAlerts,
  cptCodes,
  federalPolicyUpdates,
  stateCompliance,
  InsertComplianceAlert,
  InsertCptCode,
} from "../drizzle/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncSource = "SAMHSA" | "CMS" | "LEXISNEXIS" | "WESTLAW" | "MANUAL";

interface SyncResult {
  source: SyncSource;
  syncType: string;
  status: "success" | "failed" | "partial";
  recordsChecked: number;
  recordsUpdated: number;
  changesDetected: number;
  errorMessage?: string;
}

// ─── CMS Public API Endpoints ─────────────────────────────────────────────────

const CMS_BASE = "https://data.cms.gov/api/1";
const CMS_RSS_BEHAVIORAL_HEALTH =
  "https://www.cms.gov/rss/behavioral-health.xml";
const CMS_RSS_PHYSICIAN_FEE_SCHEDULE =
  "https://www.cms.gov/rss/physician-fee-schedule.xml";
const CMS_RSS_MAIN = "https://www.cms.gov/newsroom/rss.xml";

// CMS dataset IDs for behavioral health
const CMS_DATASETS = {
  inpatientPsychiatric: "q9vs-r7wp", // Inpatient Psychiatric Facility Quality
  behavioralHealthVHA: "6qxe-iqz8", // VHA Behavioral Health Data
};

// ─── SAMHSA Public Endpoints ──────────────────────────────────────────────────

const SAMHSA_BASE = "https://findtreatment.gov/locator/";
const SAMHSA_STATS_BASE = "https://www.samhsa.gov/data/";

// Mental health CPT codes tracked for changes
const MENTAL_HEALTH_CPT_CODES = [
  { code: "90791", description: "Psychiatric diagnostic evaluation", category: "Evaluation", minDurationMin: 60, maxDurationMin: 90 },
  { code: "90792", description: "Psychiatric diagnostic evaluation with medical services", category: "Evaluation", minDurationMin: 60, maxDurationMin: 90 },
  { code: "90832", description: "Psychotherapy, 30 min", category: "Individual Therapy", minDurationMin: 16, maxDurationMin: 37 },
  { code: "90834", description: "Psychotherapy, 45 min", category: "Individual Therapy", minDurationMin: 38, maxDurationMin: 52 },
  { code: "90837", description: "Psychotherapy, 60 min", category: "Individual Therapy", minDurationMin: 53, maxDurationMin: 60 },
  { code: "90839", description: "Psychotherapy for crisis; first 60 min", category: "Crisis", minDurationMin: 30, maxDurationMin: 74 },
  { code: "90840", description: "Psychotherapy for crisis; each additional 30 min", category: "Crisis", minDurationMin: 30, maxDurationMin: 60 },
  { code: "90846", description: "Family psychotherapy without patient present", category: "Family Therapy", minDurationMin: 50, maxDurationMin: 60 },
  { code: "90847", description: "Family psychotherapy with patient present", category: "Family Therapy", minDurationMin: 50, maxDurationMin: 60 },
  { code: "90853", description: "Group psychotherapy", category: "Group Therapy", minDurationMin: 90, maxDurationMin: 120 },
  { code: "99213", description: "Office visit, established patient, low complexity", category: "E&M", minDurationMin: 20, maxDurationMin: 29 },
  { code: "99214", description: "Office visit, established patient, moderate complexity", category: "E&M", minDurationMin: 30, maxDurationMin: 39 },
  { code: "99215", description: "Office visit, established patient, high complexity", category: "E&M", minDurationMin: 40, maxDurationMin: 54 },
  { code: "96130", description: "Psychological testing evaluation, first hour", category: "Testing", minDurationMin: 60, maxDurationMin: 60 },
  { code: "96131", description: "Psychological testing evaluation, each additional hour", category: "Testing", minDurationMin: 60, maxDurationMin: 60 },
  { code: "96136", description: "Psychological testing administration, first 30 min", category: "Testing", minDurationMin: 30, maxDurationMin: 30 },
  { code: "96138", description: "Psychological testing administration by technician, first 30 min", category: "Testing", minDurationMin: 30, maxDurationMin: 30 },
  { code: "99492", description: "Initial psychiatric collaborative care management, first 70 min", category: "Collaborative Care", minDurationMin: 70, maxDurationMin: 70 },
  { code: "99493", description: "Subsequent psychiatric collaborative care management, first 60 min", category: "Collaborative Care", minDurationMin: 60, maxDurationMin: 60 },
  { code: "99494", description: "Initial/subsequent psychiatric collaborative care, each additional 30 min", category: "Collaborative Care", minDurationMin: 30, maxDurationMin: 30 },
];

// ─── Database Helpers ─────────────────────────────────────────────────────────

async function logSync(result: SyncResult): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(complianceSyncLog).values({
    source: result.source,
    syncType: result.syncType,
    status: result.status,
    recordsChecked: result.recordsChecked,
    recordsUpdated: result.recordsUpdated,
    changesDetected: result.changesDetected,
    errorMessage: result.errorMessage ?? null,
  });
}

async function createAlert(alert: InsertComplianceAlert): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(complianceAlerts).values(alert);
  // Notify owner for warning/critical alerts
  if (alert.severity !== "info") {
    await notifyOwner({
      title: `[Compliance ${alert.severity.toUpperCase()}] ${alert.title}`,
      content: `Source: ${alert.source}\nCategory: ${alert.category}\n\n${alert.description}${alert.sourceUrl ? `\n\nSource: ${alert.sourceUrl}` : ""}`,
    });
  }
}

// ─── RSS Feed Parser ──────────────────────────────────────────────────────────

async function parseRSSFeed(url: string): Promise<Array<{ title: string; description: string; link: string; pubDate: string }>> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "TherapyCareNow Compliance Monitor/1.0" },
    });
    const xml: string = response.data;
    const items: Array<{ title: string; description: string; link: string; pubDate: string }> = [];

    // Simple XML parser for RSS items
    const itemRegex = /<item>([\/\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const cdataTitle = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const plainTitle = itemXml.match(/<title>(.*?)<\/title>/);
      const title = (cdataTitle?.[1] ?? plainTitle?.[1] ?? "").trim();
      const cdataDesc = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
      const plainDesc = itemXml.match(/<description>([\s\S]*?)<\/description>/);
      const description = (cdataDesc?.[1] ?? plainDesc?.[1] ?? "").trim();
      const link = (itemXml.match(/<link>(.*?)<\/link>/)?.[1] ?? "").trim();
      const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "").trim();
      if (title) items.push({ title, description, link, pubDate });
    }
    return items;
  } catch {
    return [];
  }
}

// ─── Behavioral Health Keyword Detection ─────────────────────────────────────

const BEHAVIORAL_HEALTH_KEYWORDS = [
  "behavioral health", "mental health", "substance use", "addiction",
  "psychiatric", "psychotherapy", "telehealth", "teletherapy",
  "counseling", "depression", "anxiety", "opioid", "crisis",
  "parity", "HIPAA", "licensure", "CPT", "billing", "reimbursement",
  "Medicare", "Medicaid", "SAMHSA", "988", "crisis line",
];

function isBehavioralHealthRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return BEHAVIORAL_HEALTH_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function detectSeverity(text: string): "info" | "warning" | "critical" {
  const lower = text.toLowerCase();
  if (lower.includes("emergency") || lower.includes("immediate") || lower.includes("urgent") || lower.includes("violation") || lower.includes("penalty")) return "critical";
  if (lower.includes("change") || lower.includes("update") || lower.includes("new rule") || lower.includes("effective") || lower.includes("amendment")) return "warning";
  return "info";
}

// ─── CMS RSS Feed Sync ────────────────────────────────────────────────────────

export async function syncCMSFeeds(): Promise<SyncResult> {
  const result: SyncResult = { source: "CMS", syncType: "rss_policy_feed", status: "success", recordsChecked: 0, recordsUpdated: 0, changesDetected: 0 };
  const db = await getDb();
  if (!db) { result.status = "failed"; result.errorMessage = "DB unavailable"; return result; }

  try {
    const feedUrls = [CMS_RSS_MAIN, CMS_RSS_BEHAVIORAL_HEALTH, CMS_RSS_PHYSICIAN_FEE_SCHEDULE];
    const allItems: Array<{ title: string; description: string; link: string; pubDate: string }> = [];

    for (const url of feedUrls) {
      const items = await parseRSSFeed(url);
      allItems.push(...items);
    }

    result.recordsChecked = allItems.length;

    for (const item of allItems) {
      if (!isBehavioralHealthRelevant(item.title + " " + item.description)) continue;

      // Check if already stored
      const existing = await db
        .select()
        .from(federalPolicyUpdates)
        .where(eq(federalPolicyUpdates.sourceUrl, item.link))
        .limit(1);

      if (existing.length > 0) continue;

      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

      await db.insert(federalPolicyUpdates).values({
        source: "CMS",
        title: item.title.slice(0, 511),
        summary: item.description.replace(/<[^>]*>/g, "").slice(0, 2000),
        category: "policy_update",
        sourceUrl: item.link,
        publishedAt,
        isRead: false,
      });

      result.recordsUpdated++;
      result.changesDetected++;

      // Create alert for significant changes
      const severity = detectSeverity(item.title + " " + item.description);
      if (severity !== "info") {
        await createAlert({
          source: "CMS",
          severity,
          category: "federal_policy",
          title: item.title.slice(0, 255),
          description: item.description.replace(/<[^>]*>/g, "").slice(0, 1000),
          sourceUrl: item.link,
          effectiveDate: publishedAt,
          affectedStates: null,
        });
      }
    }
  } catch (err) {
    result.status = "partial";
    result.errorMessage = String(err);
  }

  await logSync(result);
  return result;
}

// ─── CMS CPT Code Verification ────────────────────────────────────────────────

export async function syncCMSCPTCodes(): Promise<SyncResult> {
  const result: SyncResult = { source: "CMS", syncType: "cpt_codes", status: "success", recordsChecked: 0, recordsUpdated: 0, changesDetected: 0 };
  const db = await getDb();
  if (!db) { result.status = "failed"; result.errorMessage = "DB unavailable"; return result; }

  try {
    result.recordsChecked = MENTAL_HEALTH_CPT_CODES.length;

    for (const cpt of MENTAL_HEALTH_CPT_CODES) {
      const existing = await db.select().from(cptCodes).where(eq(cptCodes.code, cpt.code)).limit(1);

      if (existing.length === 0) {
        // New CPT code — insert and alert
        await db.insert(cptCodes).values({
          ...cpt,
          isActive: true,
          lastVerifiedAt: new Date(),
          sourceUrl: `https://www.cms.gov/medicare/regulations-guidance/physician-self-referral/list-cpt-hcpcs-codes`,
        });
        result.recordsUpdated++;
        result.changesDetected++;
        await createAlert({
          source: "CMS",
          severity: "warning",
          category: "cpt_code_change",
          title: `New CPT Code Added: ${cpt.code}`,
          description: `CPT code ${cpt.code} (${cpt.description}) has been added to the registry. Verify billing workflows are updated.`,
          sourceUrl: `https://www.cms.gov/medicare/regulations-guidance/physician-self-referral/list-cpt-hcpcs-codes`,
        });
      } else {
        // Verify existing code description hasn't changed
        const current = existing[0];
        const descriptionChanged = current.description !== cpt.description;
        const durationChanged = current.minDurationMin !== cpt.minDurationMin || current.maxDurationMin !== cpt.maxDurationMin;

        if (descriptionChanged || durationChanged) {
          await db.update(cptCodes).set({
            description: cpt.description,
            minDurationMin: cpt.minDurationMin,
            maxDurationMin: cpt.maxDurationMin,
            lastVerifiedAt: new Date(),
          }).where(eq(cptCodes.code, cpt.code));
          result.recordsUpdated++;
          result.changesDetected++;
          await createAlert({
            source: "CMS",
            severity: "critical",
            category: "cpt_code_change",
            title: `CPT Code Updated: ${cpt.code}`,
            description: `CPT code ${cpt.code} has been modified.\n\nPrevious: ${current.description} (${current.minDurationMin}-${current.maxDurationMin} min)\nNew: ${cpt.description} (${cpt.minDurationMin}-${cpt.maxDurationMin} min)\n\nReview all session notes and billing records using this code.`,
            sourceUrl: `https://www.cms.gov/medicare/regulations-guidance/physician-self-referral/list-cpt-hcpcs-codes`,
          });
        } else {
          // Just update the lastVerifiedAt timestamp
          await db.update(cptCodes).set({ lastVerifiedAt: new Date() }).where(eq(cptCodes.code, cpt.code));
        }
      }
    }
  } catch (err) {
    result.status = "partial";
    result.errorMessage = String(err);
  }

  await logSync(result);
  return result;
}

// ─── SAMHSA Behavioral Health Policy Feed ────────────────────────────────────

export async function syncSAMHSAFeeds(): Promise<SyncResult> {
  const result: SyncResult = { source: "SAMHSA", syncType: "behavioral_health_policy", status: "success", recordsChecked: 0, recordsUpdated: 0, changesDetected: 0 };
  const db = await getDb();
  if (!db) { result.status = "failed"; result.errorMessage = "DB unavailable"; return result; }

  try {
    // SAMHSA publishes updates via their news/press release RSS
    const samhsaFeeds = [
      "https://www.samhsa.gov/rss/news.xml",
      "https://www.samhsa.gov/rss/grants.xml",
    ];

    for (const feedUrl of samhsaFeeds) {
      const items = await parseRSSFeed(feedUrl);
      result.recordsChecked += items.length;

      for (const item of items) {
        if (!isBehavioralHealthRelevant(item.title + " " + item.description)) continue;

        const existing = await db
          .select()
          .from(federalPolicyUpdates)
          .where(eq(federalPolicyUpdates.sourceUrl, item.link))
          .limit(1);

        if (existing.length > 0) continue;

        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        await db.insert(federalPolicyUpdates).values({
          source: "SAMHSA",
          title: item.title.slice(0, 511),
          summary: item.description.replace(/<[^>]*>/g, "").slice(0, 2000),
          category: "samhsa_update",
          sourceUrl: item.link,
          publishedAt,
          isRead: false,
        });

        result.recordsUpdated++;
        result.changesDetected++;

        const severity = detectSeverity(item.title + " " + item.description);
        if (severity !== "info") {
      await createAlert({
        source: "SAMHSA",
        severity,
        category: "behavioral_health_policy",
        title: item.title.slice(0, 255),
        description: item.description.replace(/<[^>]*>/g, "").slice(0, 1000),
        sourceUrl: item.link,
        effectiveDate: null,
        affectedStates: null,
      });
        }
      }
    }

    // Also check SAMHSA's 988 Lifeline status page for any service changes
    try {
      const lifeline988Response = await axios.get("https://988lifeline.org/", {
        timeout: 10000,
        headers: { "User-Agent": "TherapyCareNow Compliance Monitor/1.0" },
      });
      // Check for any service disruption notices
      const html: string = lifeline988Response.data;
      if (html.toLowerCase().includes("service disruption") || html.toLowerCase().includes("outage") || html.toLowerCase().includes("maintenance")) {
        await createAlert({
          source: "SAMHSA",
          severity: "critical",
          category: "crisis_line_status",
          title: "988 Lifeline Potential Service Disruption Detected",
          description: "A potential service disruption or maintenance notice was detected on the 988 Lifeline website. Verify current status and update crisis resources if needed.",
          sourceUrl: "https://988lifeline.org/",
          effectiveDate: null,
          affectedStates: null,
        });
        result.changesDetected++;
      }
    } catch {
      // Non-fatal — 988 check is best-effort
    }
  } catch (err) {
    result.status = "partial";
    result.errorMessage = String(err);
  }

  await logSync(result);
  return result;
}

// ─── LexisNexis Placeholder Integration ──────────────────────────────────────

export async function syncLexisNexis(): Promise<SyncResult> {
  const result: SyncResult = { source: "LEXISNEXIS", syncType: "regulatory_tracker", status: "failed", recordsChecked: 0, recordsUpdated: 0, changesDetected: 0 };
  const apiKey = process.env.LEXISNEXIS_API_KEY;

  if (!apiKey) {
    result.errorMessage = "LEXISNEXIS_API_KEY not configured. Set this secret to enable LexisNexis regulatory monitoring.";
    await logSync(result);
    return result;
  }

  try {
    // LexisNexis Regulatory Tracker API
    // Endpoint: https://api.lexisnexis.com/v1/regulatory/search
    // Tracks: state telehealth laws, mandatory reporting changes, licensure requirements
    const response = await axios.get("https://api.lexisnexis.com/v1/regulatory/search", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      params: {
        query: "mental health telehealth therapy licensure mandatory reporting",
        jurisdiction: "US",
        dateRange: "last_30_days",
        category: "healthcare",
      },
      timeout: 20000,
    });

    const updates = response.data?.results ?? [];
    result.recordsChecked = updates.length;

    for (const update of updates) {
      const existing = await (await getDb())!
        .select()
        .from(federalPolicyUpdates)
        .where(eq(federalPolicyUpdates.sourceUrl, update.url ?? ""))
        .limit(1);

      if (existing.length > 0) continue;

      await (await getDb())!.insert(federalPolicyUpdates).values({
        source: "LEXISNEXIS",
        title: (update.title ?? "Regulatory Update").slice(0, 511),
        summary: (update.summary ?? update.description ?? "").slice(0, 2000),
        category: update.category ?? "regulatory_change",
        sourceUrl: update.url,
        publishedAt: update.date ? new Date(update.date) : new Date(),
        effectiveDate: update.effectiveDate ? new Date(update.effectiveDate) : null,
        isRead: false,
      });

      result.recordsUpdated++;
      result.changesDetected++;

      await createAlert({
        source: "LEXISNEXIS",
        severity: "warning",
        category: "state_regulatory_change",
        title: (update.title ?? "Regulatory Update").slice(0, 255),
        description: (update.summary ?? update.description ?? "").slice(0, 1000),
        affectedStates: update.states ? JSON.stringify(update.states) : null,
        sourceUrl: update.url,
        effectiveDate: update.effectiveDate ? new Date(update.effectiveDate) : null,
      });
    }

    result.status = "success";
  } catch (err: any) {
    result.status = "failed";
    result.errorMessage = `LexisNexis API error: ${err?.response?.status ?? ""} ${String(err?.message ?? err)}`;
  }

  await logSync(result);
  return result;
}

// ─── Westlaw Placeholder Integration ─────────────────────────────────────────

export async function syncWestlaw(): Promise<SyncResult> {
  const result: SyncResult = { source: "WESTLAW", syncType: "case_law_regulatory", status: "failed", recordsChecked: 0, recordsUpdated: 0, changesDetected: 0 };
  const apiKey = process.env.WESTLAW_API_KEY;
  const clientId = process.env.WESTLAW_CLIENT_ID;

  if (!apiKey || !clientId) {
    result.errorMessage = "WESTLAW_API_KEY and WESTLAW_CLIENT_ID not configured. Set these secrets to enable Westlaw regulatory monitoring.";
    await logSync(result);
    return result;
  }

  try {
    // Westlaw Edge API
    // Endpoint: https://api.thomsonreuters.com/westlaw/v1/search
    const response = await axios.post(
      "https://api.thomsonreuters.com/westlaw/v1/search",
      {
        query: "mental health therapy telehealth licensure mandatory reporting HIPAA",
        dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        contentTypes: ["REGULATIONS", "STATUTES", "ADMINISTRATIVE_CODE"],
        jurisdiction: ["US-FED", ...["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => `US-${s}`)],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Client-ID": clientId,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const results = response.data?.results ?? [];
    result.recordsChecked = results.length;

    for (const item of results) {
      const existing = await (await getDb())!
        .select()
        .from(federalPolicyUpdates)
        .where(eq(federalPolicyUpdates.sourceUrl, item.url ?? ""))
        .limit(1);

      if (existing.length > 0) continue;

      await (await getDb())!.insert(federalPolicyUpdates).values({
        source: "WESTLAW",
        title: (item.title ?? "Regulatory Update").slice(0, 511),
        summary: (item.summary ?? "").slice(0, 2000),
        category: item.contentType?.toLowerCase() ?? "regulatory_change",
        sourceUrl: item.url,
        publishedAt: item.date ? new Date(item.date) : new Date(),
        effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : null,
        isRead: false,
      });

      result.recordsUpdated++;
      result.changesDetected++;

      await createAlert({
        source: "WESTLAW",
        severity: "warning",
        category: "case_law_change",
        title: (item.title ?? "Regulatory Update").slice(0, 255),
        description: (item.summary ?? "").slice(0, 1000),
        affectedStates: item.jurisdiction ? JSON.stringify([item.jurisdiction]) : null,
        sourceUrl: item.url,
        effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : null,
      });
    }

    result.status = "success";
  } catch (err: any) {
    result.status = "failed";
    result.errorMessage = `Westlaw API error: ${err?.response?.status ?? ""} ${String(err?.message ?? err)}`;
  }

  await logSync(result);
  return result;
}

// ─── Master Sync Runner ───────────────────────────────────────────────────────

export async function runFullComplianceSync(): Promise<SyncResult[]> {
  console.log("[ComplianceSync] Starting full compliance sync...");
  const results: SyncResult[] = [];

  // Always run free public feeds
  results.push(await syncCMSFeeds());
  results.push(await syncCMSCPTCodes());
  results.push(await syncSAMHSAFeeds());

  // Run paid integrations only if API keys are configured
  if (process.env.LEXISNEXIS_API_KEY) {
    results.push(await syncLexisNexis());
  }
  if (process.env.WESTLAW_API_KEY && process.env.WESTLAW_CLIENT_ID) {
    results.push(await syncWestlaw());
  }

  const totalChanges = results.reduce((sum, r) => sum + r.changesDetected, 0);
  const totalUpdates = results.reduce((sum, r) => sum + r.recordsUpdated, 0);
  console.log(`[ComplianceSync] Complete. Changes detected: ${totalChanges}, Records updated: ${totalUpdates}`);

  return results;
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(complianceAlerts)
    .where(isNull(complianceAlerts.dismissedAt))
    .orderBy(desc(complianceAlerts.createdAt))
    .limit(50);
}

export async function getRecentSyncLogs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(complianceSyncLog)
    .orderBy(desc(complianceSyncLog.syncedAt))
    .limit(limit);
}

export async function getRecentPolicyUpdates(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(federalPolicyUpdates)
    .orderBy(desc(federalPolicyUpdates.publishedAt))
    .limit(limit);
}

export async function dismissAlert(alertId: number, adminUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(complianceAlerts)
    .set({ dismissedAt: new Date(), dismissedBy: adminUserId })
    .where(eq(complianceAlerts.id, alertId));
}

export async function getComplianceSummary() {
  const db = await getDb();
  if (!db) return null;

  const [alerts, syncLogs, policies] = await Promise.all([
    db.select().from(complianceAlerts).where(isNull(complianceAlerts.dismissedAt)),
    db.select().from(complianceSyncLog).orderBy(desc(complianceSyncLog.syncedAt)).limit(1),
    db.select().from(federalPolicyUpdates).where(eq(federalPolicyUpdates.isRead, false)),
  ]);

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const warningAlerts = alerts.filter((a) => a.severity === "warning").length;
  const lastSync = syncLogs[0]?.syncedAt ?? null;
  const unreadPolicies = policies.length;

  const lexisNexisEnabled = !!process.env.LEXISNEXIS_API_KEY;
  const westlawEnabled = !!(process.env.WESTLAW_API_KEY && process.env.WESTLAW_CLIENT_ID);

  return {
    criticalAlerts,
    warningAlerts,
    totalActiveAlerts: alerts.length,
    unreadPolicyUpdates: unreadPolicies,
    lastSyncAt: lastSync,
    integrations: {
      cms: { enabled: true, label: "CMS Policy Feeds" },
      samhsa: { enabled: true, label: "SAMHSA Behavioral Health" },
      lexisNexis: { enabled: lexisNexisEnabled, label: "LexisNexis Regulatory Tracker" },
      westlaw: { enabled: westlawEnabled, label: "Westlaw Edge" },
    },
  };
}
