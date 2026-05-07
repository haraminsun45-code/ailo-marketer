# AILO Marketing Operation Playbook

This playbook explains how to run the first version of the AILO marketing pipeline.

## Weekly Rhythm

Recommended starting cadence:

- Blog: 2 posts per week
- Threads: 1 thread per day
- Instagram: 3 carousel posts per week
- Shorts: 3 scripts per week, then produce videos from the best-performing topics

## Content Pillars

Use these pillars to keep AILO's marketing consistent.

### Driver Pain

Topics about repetitive logs, screen fatigue, phone calls, paper documents, loading checks, unloading mistakes, and route reporting.

### Workflow Automation

Topics about how operational events can be recorded automatically and how low-risk actions can move without driver input.

### Cargo Verification

Topics about OCR, consignment documents, loading confirmation, unloading confirmation, destination cargo checks, and mismatch prevention.

### Transportation Company Operations

Topics about visibility, centralized logs, vehicle management, safety management, and digitized operation history.

### Voice-First UX

Topics about reducing screen interaction and designing software around real driving conditions.

## Approval Flow

1. Generate drafts into `outputs/drafts/`.
2. Review tone, claims, and practical realism.
3. Edit the draft if needed.
4. Move approved content into `outputs/approved/`.
5. Publish manually or through a connected publisher.
6. Record performance in `analytics/`.

Commands:

```powershell
node src/generate_drafts.js
node src/approve_draft.js outputs/drafts/driver-worklog-automation.json
node src/publish_dry_run.js
```

The dry-run publisher writes platform-ready plans to `analytics/` without calling any external API.

## Draft Generation Modes

Use OpenAI-powered generation for normal work after `.env` is configured.

Use template mode when:

- testing the pipeline without an API key
- checking file paths and output structure
- creating a predictable baseline draft

Command:

```powershell
node src/generate_drafts.js --template
```

## Review Checklist

- Is the content grounded in a real freight workflow?
- Does it avoid exaggerated AI claims?
- Does it make AILO sound like an operational assistant, not a chatbot?
- Is the message short enough for the target channel?
- Does the content respect driver safety?
- Is any high-risk operational claim phrased carefully?

## Topic Backlog

Start with these topics:

1. Why freight work logs should be automated
2. Why drivers should not have to touch apps while driving
3. How OCR can reduce consignment input work
4. Loading verification without complicated screens
5. Unloading mistakes and destination cargo checks
6. Fixed-route freight workflows vs variable freight workflows
7. Why voice-first UX matters in logistics
8. What an AI operational co-driver means
9. Low-risk automation vs driver confirmation
10. Why transportation companies need better workflow visibility

## Practical Rule

Every content piece should answer one question:

> What part of freight work becomes easier, safer, or more reliable with AILO?
