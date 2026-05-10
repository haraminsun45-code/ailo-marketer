# AILO Marketer

AILO Marketer is a lightweight marketing content pipeline for AILO, an AI-powered logistics workflow assistant for freight drivers and transportation companies.

The first goal is simple:

1. Turn one marketing brief into channel-ready drafts.
2. Review drafts before publishing.
3. Prepare safe publisher modules for Threads, Instagram, Blog, and Shorts.
4. Keep a repeatable content archive for future analytics and reuse.

## Operating Principle

AILO is an early-stage startup, so every workflow should be designed for the lowest practical cost.

- Prefer local scripts, reusable templates, and dry runs before paid APIs or external services.
- Use OpenAI generation only when it clearly saves time over the built-in template workflow.
- Keep publishing semi-automated: the system drafts, checks, organizes, and prepares; a person reviews, edits, approves, and decides what actually goes live.
- Avoid full automation for brand, safety, legal, operational, or customer-facing decisions.
- Add paid tools, scheduled jobs, and direct publishing integrations only after the manual process proves repeatable and valuable.

## Pipeline

```text
content_briefs/
  -> prompts/
  -> src/generate_drafts.js
  -> outputs/drafts/
  -> outputs/approved/
  -> publishers/
  -> analytics/
```

## Remote Work

This project includes a Codespaces setup so work can continue from a browser or mobile device when the laptop is not available.

Start here:

```text
docs/codespaces_setup.md
```

## MVP Workflow

1. Generate or write a content calendar.
2. Create briefs in `content_briefs/`.
3. Run the draft generator.
4. Review and edit generated drafts in `outputs/drafts/`.
5. Move only human-approved content to `outputs/approved/`.
6. Publish manually first, then connect API credentials only when the workflow is proven.
7. Store dry-run publishing plans in `analytics/`.

## AILO Content Principles

- Practical, field-oriented, and grounded in real freight operations.
- Voice-first workflow automation, not generic chatbot messaging.
- Short, calm, useful communication.
- Drivers focus on driving. AILO handles the workflow.
- Avoid unrealistic AI claims and excessive futuristic language.

## Channels

- Threads: short narrative thread for awareness and problem framing.
- Instagram: carousel copy, caption, hashtags.
- Blog: SEO-oriented long-form article.
- Shorts: 30-45 second script, scene beats, subtitles.

## Quick Start

```powershell
npm install
npm run calendar
npm run draft
```

Run the local web dashboard:

```powershell
node src/server.js
```

Then open:

```text
http://localhost:4173
```

On Windows, you can also double-click:

```text
start-dashboard.bat
```

Dashboard flow:

1. Select a day from the left calendar.
2. Keep `테스트 모드` checked when testing without an API key.
3. Click `초안 생성` for the normal low-cost, human-review workflow.
4. Review the `브리프`, `블로그 초안`, `인스타그램 캡션`, `Threads`, and `숏폼 스크립트` tabs.
5. Use `복사` to copy the current channel preview for manual posting or editing.
6. Click `승인 및 dry-run 생성` only after a person approves the draft.
7. Publish manually after the dry-run plan is reviewed.

By default, the script uses the sample brief at `content_briefs/001-driver-worklog-automation.md`.

Generate a 30-day content calendar:

```powershell
node src/generate_calendar.js
```

Generate a calendar from a specific start date:

```powershell
node src/generate_calendar.js --start=2026-05-07 --days=30
```

Calendar generation preserves existing brief files by default so reviewed or edited briefs are not overwritten. To regenerate matching briefs from the built-in topic templates, add `--force`.

Generate drafts from a calendar item:

```powershell
node src/run_calendar_item.js --day=2 --template
```

or by date:

```powershell
node src/run_calendar_item.js --date=2026-05-08 --template
```

Without `--template`, the script uses OpenAI generation when `OPENAI_API_KEY` is available and falls back to the local template generator if needed.

Run the daily pipeline for one calendar item:

```powershell
node src/run_daily_pipeline.js --day=2 --template
```

By default, this generates drafts only and updates the selected calendar item to `draft_ready`. This is the normal low-cost, human-review workflow.

After a person reviews and accepts the draft, explicitly approve it and create a channel-matched dry-run plan:

```powershell
node src/run_daily_pipeline.js --day=2 --template --approve
```

The `--approve` mode copies reviewed content to `outputs/approved/`, writes dry-run publishing files in `analytics/`, updates the item to `dry_run_ready`, and still does not call any external publishing API.

Analyze field logs and promote recommended topics into new planned calendar items:

```powershell
npm run analyze:logs
npm run promote:insights
```

If `npm` is not available in the local shell, run the script with Node directly:

```powershell
node src/generate_drafts.js
```

To force the built-in template generator without calling OpenAI:

```powershell
node src/generate_drafts.js --template
```

To generate from another brief:

```powershell
node src/generate_drafts.js content_briefs/your-brief.md
```

Approve a reviewed draft:

```powershell
node src/approve_draft.js outputs/drafts/driver-worklog-automation.json
```

Create a publishing dry run from the latest approved draft:

```powershell
node src/publish_dry_run.js
```

Create a dry run for selected channels:

```powershell
node src/publish_dry_run.js --channels=threads,instagram
```

## Operating Guide

- See `docs/operation_playbook.md` for weekly cadence, content pillars, approval flow, and topic backlog.
- See `docs/api_publishing_notes.md` for platform-specific publishing notes.
- See `docs/codespaces_setup.md` to move this project to GitHub Codespaces and continue from browser or mobile.

## Environment

Create `.env` later when connecting model and publishing APIs.

For lowest-cost operation, leave `.env` empty and use `--template` mode while testing the content process. Add `OPENAI_API_KEY` only when AI generation is worth the usage cost.

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5
THREADS_ACCESS_TOKEN=
THREADS_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_ACCESS_TOKEN=
```

You can copy `.env.example` to `.env` and fill in only `OPENAI_API_KEY` for the first AI-powered draft workflow.

If `OPENAI_API_KEY` is missing or the API call fails, the generator falls back to the local template generator so the workflow still produces drafts.

## Publishing Status

The repository currently supports draft generation, approval copying, and dry-run publishing plans. Real API publishing should remain off by default and should be enabled only after account permissions, app review, token handling, cost, and human approval checkpoints are confirmed.
