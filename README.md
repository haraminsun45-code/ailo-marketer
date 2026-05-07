# AILO Marketer

AILO Marketer is a lightweight marketing content pipeline for AILO, an AI-powered logistics workflow assistant for freight drivers and transportation companies.

The first goal is simple:

1. Turn one marketing brief into channel-ready drafts.
2. Review drafts before publishing.
3. Prepare safe publisher modules for Threads, Instagram, Blog, and Shorts.
4. Keep a repeatable content archive for future analytics and reuse.

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

1. Write a brief in `content_briefs/`.
2. Run the draft generator.
3. Review generated drafts in `outputs/drafts/`.
4. Move approved content to `outputs/approved/`.
5. Publish manually or connect API credentials later.
6. Store dry-run publishing plans in `analytics/`.

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
npm run draft
```

By default, the script uses the sample brief at `content_briefs/001-driver-worklog-automation.md`.

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

The repository currently supports draft generation, approval copying, and dry-run publishing plans. Real API publishing should be enabled only after account permissions, app review, and token handling are confirmed.
