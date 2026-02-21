import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the DB to avoid real DB calls in unit tests
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getUserProfile: vi.fn().mockResolvedValue(null),
  upsertUserProfile: vi.fn().mockResolvedValue(undefined),
  recordConsent: vi.fn().mockResolvedValue(undefined),
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
  saveTriageSession: vi.fn().mockResolvedValue(undefined),
  getCrisisResources: vi.fn().mockResolvedValue([]),
  getFreeResources: vi.fn().mockResolvedValue([]),
  searchProviders: vi.fn().mockResolvedValue([]),
  getProviderById: vi.fn().mockResolvedValue(null),
  lookupEAP: vi.fn().mockResolvedValue(null),
  getStateCompliance: vi.fn().mockResolvedValue(null),
  getAllStateCompliance: vi.fn().mockResolvedValue([]),
}));

vi.mock("./aiGuardrails", () => ({
  moderateContent: vi.fn().mockResolvedValue({ flagged: false, categories: {} }),
  generateSupportResponse: vi.fn().mockResolvedValue({ content: "Test response", blocked: false }),
}));

function makeCtx(user?: TrpcContext["user"]): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Triage Router", () => {
  it("classifies EMERGENCY when immediateDanger=true", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.triage.submit({
      immediateDanger: true,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
  });

  it("classifies EMERGENCY when harmSelf=true", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.triage.submit({
      immediateDanger: false,
      harmSelf: true,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
  });

  it("classifies URGENT when needHelpSoon=true", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.triage.submit({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: true,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("URGENT");
    expect(result.crisisMode).toBe(false);
  });

  it("classifies ROUTINE when all answers are false", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.triage.submit({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("ROUTINE");
    expect(result.crisisMode).toBe(false);
  });

  it("returns questions list", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.triage.getQuestions();
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe("immediateDanger");
  });
});

describe("Crisis Router", () => {
  it("returns crisis resources (empty when DB unavailable)", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.crisis.getResources({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts stateCode filter", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.crisis.getResources({ stateCode: "CA" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Provider Router", () => {
  it("returns providers list", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.providers.search({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts telehealth filter", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.providers.search({ telehealth: true });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("returns null user when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const user: TrpcContext["user"] = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(makeCtx(user));
    const result = await caller.auth.me();
    expect(result?.openId).toBe("test-user");
  });

  it("clears session cookie on logout", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("Free Resources Router", () => {
  it("returns free resources list", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.freeResources.getResources({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Benefits Router — requires auth", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.benefits.getProfile()).rejects.toThrow();
  });
});
