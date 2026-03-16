# Audit: Sensing Sub-system Reachability from Text Chat Path (US85A)

**Date:** 2026-03-16
**Status:** COMPLETE — Sub-systems not found in codebase

## Finding

None of the five files specified in the audit exist in this repository on any branch:

| File | Exists? |
|---|---|
| `server/routes/chat-routes.ts` | NO |
| `server/services/sensing-layer/index.ts` | NO |
| `server/services/sensing-layer/fast-sense.ts` | NO |
| `server/services/sensing-layer/guidance-injector.ts` | NO |
| `server/routes/custom-llm-routes.ts` | NO |

A full-text grep across the entire repository for `sensing`, `narrative web`, `resonance`,
`IBM tracking`, `CSS trajectory`, `processUtterance`, `processFastUtterance`, and
`formatSessionPicture` returned **zero results**.

## Q1–Q7 Answers

All seven questions are **unanswerable** because the referenced files and sub-systems
are not present in this repository.

## Summary Table

| Sub-system | Reaches voice path | Reaches text chat path |
|---|---|---|
| Narrative web / resonance | N/A — does not exist | N/A — does not exist |
| IBM tracking | N/A — does not exist | N/A — does not exist |
| CSS trajectory accumulation (multi-turn) | N/A — does not exist | N/A — does not exist |
| formatSessionPicture with resonance arg | N/A — does not exist | N/A — does not exist |

## Actual Server Structure

```
server/
  auth.ts
  index.ts
  routes.ts
  storage.ts
  vite.ts
  crons/x-post-cron.ts
  jobs/weekly-recap-cron.ts
  services/
    custom-email-service.ts
    skill-graph-loader.ts
    weekly-recap-service.ts
    xpost-service.ts
```

This is a lead-generation funnel application (iVASA Inner Landscape Assessment),
not a conversational AI system with sensing layers.
