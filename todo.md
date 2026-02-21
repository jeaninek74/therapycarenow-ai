# TherapyCareNow AI — Project TODO

## Phase 1: Database Schema & Design System
- [x] Design system: color palette, typography, global CSS (calm/reassuring theme)
- [x] Database schema: users, user_profiles, consents, audit_events
- [x] Database schema: crisis_resources (all 50 states)
- [x] Database schema: providers, provider_specialties, provider_insurance
- [x] Database schema: employers, eap_resources
- [x] Database schema: free_resources (all 50 states)
- [x] Database schema: triage_sessions
- [x] Run db:push to apply migrations

## Phase 2: Backend — Core Engines
- [x] Triage engine: deterministic 5-question risk classification (EMERGENCY/URGENT/ROUTINE)
- [x] POST /triage endpoint with audit logging
- [x] Crisis Mode state machine: returns crisis_mode_payload on EMERGENCY
- [x] Crisis resource router: GET /resources/crisis?state=XX (always includes 911/988)
- [x] Free resource router: GET /resources/free?state=XX
- [x] OpenAI moderation gateway: screens all input before AI calls
- [x] AI support assistant endpoint: POST /ai/support (strict system prompt, no diagnosis)
- [x] AI response filter: blocks disallowed content, returns safe templates
- [x] Provider search endpoint: GET /providers/search with filters + ranking
- [x] Provider profile endpoint: GET /providers/:id
- [x] Benefits wallet: POST /profile/insurance, POST /profile/employer
- [x] EAP lookup: GET /eap/lookup?employer=Name
- [x] Consent workflow: store consent type + timestamp before saving benefits
- [x] Audit logging: event type, risk level, timestamp only (no raw text)

## Phase 3: Data Layer — All 50 States
- [x] Seed crisis resources: 911, 988 call/text/chat for all 50 states
- [x] Seed state-specific crisis hotlines and resources (all 50 states)
- [x] Seed EAP employer directory (initial curated dataset)
- [x] Seed free/low-cost resources by state (community clinics, hotlines, sliding scale)
- [x] Seed provider directory (initial dataset with specialties and insurance)
- [x] State compliance data: therapy regulations for all 50 states

## Phase 4: Frontend — All User Flows
- [x] Landing/Home page: Get Help Now + Find a Therapist CTAs, calm design
- [x] Persistent "Get Help Now" button visible on every screen (NavBar + EmergencyFAB)
- [x] Triage flow: 5-question deterministic flow, submits to backend
- [x] Crisis Mode screen: 911/988 actions (call/text/chat), local resources by state
- [x] Urgent Options screen: 988 options, EAP card, Find Therapist CTA
- [x] Routine Options screen: Find Therapist, Free Help, Benefits Wallet
- [x] Find a Therapist flow: filters (insurance, telehealth, specialty, cost), results
- [x] Provider Profile page: specialties, insurance, contact, disclaimer
- [x] Benefits Wallet: insurance entry, employer entry, EAP lookup results, consent flow
- [x] Free & Low-Cost Help: state-based resource list with categories
- [x] AI Support Assistant: optional chat (non-crisis only), moderation gated
- [x] Settings page: privacy policy, terms, state compliance info, account management
- [x] State picker component (all 50 states)
- [x] Loading states, error boundaries, empty states throughout

## Phase 5: Testing & Quality
- [x] Vitest: triage engine deterministic logic (all 8 test cases — 25 tests total passing)
- [x] Vitest: router tests for triage, crisis, providers, auth, benefits
- [x] Vitest: auth logout cookie clearing
- [ ] Vitest: AI moderation blocks self-harm statements (requires live API)
- [ ] Vitest: audit logging stores no raw text (integration test)

## Phase 6: Security & Compliance
- [x] HIPAA audit log: no raw crisis text stored (only event type, risk level, timestamp)
- [x] Secrets handling via environment variables only
- [x] Privacy policy and terms pages
- [x] Data minimization enforcement in all logging paths
- [x] AI disabled in Crisis Mode (CrisisMode page has no AI component)
- [x] Consent required before saving benefits data

## Enhancement 1: Expanded Provider Directory
- [x] Bulk-import tRPC endpoint (admin only) for JSON provider ingestion (up to 500/batch)
- [x] Admin bulk-import UI panel with JSON paste and result feedback
- [x] getProviderStats query helper for admin analytics
- [x] bulkImportProviders DB helper with error tracking

## Enhancement 2: Geolocation Auto-Detection
- [x] useGeolocation hook with 50-state bounding box detection
- [x] Auto-detect on triage start screen with graceful fallback to StatePicker
- [x] Show detected state name with confirmation UI
- [x] Fallback to manual StatePicker on denied/unavailable/error

## Enhancement 3: Admin Dashboard
- [x] Admin dashboard at /admin (role-gated to admin users)
- [x] Audit event breakdown bar chart (event type × count)
- [x] Triage volume metrics (total, emergency, urgent, routine)
- [x] Risk level pie chart
- [x] Top states by triage volume bar chart
- [x] Provider directory stats (total, by state, by license type)
- [x] Recent audit events feed (HIPAA-safe: no raw text)
- [x] Admin link in NavBar for admin-role users
- [x] Bulk import tab in admin dashboard

## Enhancement 4: Auto-Admin Promotion & Richer Provider Dataset
- [x] Auto-promote platform owner to admin role on first login (already in db.ts via ENV.ownerOpenId — verified)
- [x] Add admin promotion instructions to Settings page for owner
- [x] Seed expanded provider dataset: 154 providers across all 50 states (3+ per state, diverse specialties and license types)

## Enhancement 5: Crisis Activation Owner Notifications
- [x] Wire notifyOwner on crisis_mode_triggered audit event (HIPAA-safe: no PHI, only event type + state + timestamp)
- [x] Add notification for moderation-triggered crisis mode
- [x] Show notification status in admin dashboard recent events
