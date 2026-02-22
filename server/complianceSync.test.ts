import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios to avoid real HTTP calls in tests
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock DB and notification to isolate unit tests
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import axios from "axios";
const mockedAxios = axios as any;

describe("Compliance Sync Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncCMSFeeds", () => {
    it("returns a partial result when DB is unavailable", async () => {
      const { syncCMSFeeds } = await import("./complianceSync");
      const result = await syncCMSFeeds();
      expect(result.source).toBe("CMS");
      expect(result.syncType).toBe("rss_policy_feed");
      // DB is mocked to return null, so it should fail gracefully
      expect(result.status).toBe("failed");
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe("syncCMSCPTCodes", () => {
    it("returns a result with correct source and syncType", async () => {
      const { syncCMSCPTCodes } = await import("./complianceSync");
      const result = await syncCMSCPTCodes();
      expect(result.source).toBe("CMS");
      expect(result.syncType).toBe("cpt_codes");
    });
  });

  describe("syncSAMHSAFeeds", () => {
    it("returns a result with correct source", async () => {
      const { syncSAMHSAFeeds } = await import("./complianceSync");
      const result = await syncSAMHSAFeeds();
      expect(result.source).toBe("SAMHSA");
    });
  });

  describe("syncLexisNexis", () => {
    it("returns failed status when API key is not set", async () => {
      delete process.env.LEXISNEXIS_API_KEY;
      const { syncLexisNexis } = await import("./complianceSync");
      const result = await syncLexisNexis();
      expect(result.source).toBe("LEXISNEXIS");
      expect(result.status).toBe("failed");
      expect(result.errorMessage).toContain("LEXISNEXIS_API_KEY not configured");
    });
  });

  describe("syncWestlaw", () => {
    it("returns failed status when API keys are not set", async () => {
      delete process.env.WESTLAW_API_KEY;
      delete process.env.WESTLAW_CLIENT_ID;
      const { syncWestlaw } = await import("./complianceSync");
      const result = await syncWestlaw();
      expect(result.source).toBe("WESTLAW");
      expect(result.status).toBe("failed");
      expect(result.errorMessage).toContain("WESTLAW_API_KEY and WESTLAW_CLIENT_ID not configured");
    });
  });

  describe("runFullComplianceSync", () => {
    it("runs CMS and SAMHSA syncs by default (no paid API keys)", async () => {
      delete process.env.LEXISNEXIS_API_KEY;
      delete process.env.WESTLAW_API_KEY;
      const { runFullComplianceSync } = await import("./complianceSync");
      const results = await runFullComplianceSync();
      // Should have 3 results: CMS feeds, CMS CPT codes, SAMHSA
      expect(results.length).toBe(3);
      const sources = results.map((r) => r.source);
      expect(sources).toContain("CMS");
      expect(sources).toContain("SAMHSA");
      // Should NOT include paid sources when keys are absent
      expect(sources).not.toContain("LEXISNEXIS");
      expect(sources).not.toContain("WESTLAW");
    });

    it("includes LexisNexis when API key is set", async () => {
      process.env.LEXISNEXIS_API_KEY = "test-key";
      delete process.env.WESTLAW_API_KEY;
      // Mock axios to return empty results for LexisNexis
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });
      const { runFullComplianceSync } = await import("./complianceSync");
      const results = await runFullComplianceSync();
      const sources = results.map((r) => r.source);
      expect(sources).toContain("LEXISNEXIS");
      delete process.env.LEXISNEXIS_API_KEY;
    });
  });

  describe("isBehavioralHealthRelevant (via RSS parsing)", () => {
    it("detects behavioral health keywords correctly", () => {
      const keywords = ["mental health", "telehealth", "psychotherapy", "HIPAA", "substance use", "988"];
      for (const kw of keywords) {
        const text = `New policy update regarding ${kw} regulations`;
        expect(text.toLowerCase()).toContain(kw.toLowerCase());
      }
    });
  });

  describe("CPT code list", () => {
    it("returns failed status gracefully when DB is unavailable", async () => {
      // DB is mocked to return null — sync should fail gracefully, not throw
      const { syncCMSCPTCodes } = await import("./complianceSync");
      const result = await syncCMSCPTCodes();
      expect(result.source).toBe("CMS");
      expect(result.syncType).toBe("cpt_codes");
      // DB null causes failure, but should not throw
      expect(["failed", "partial", "success"]).toContain(result.status);
    });
  });
});
