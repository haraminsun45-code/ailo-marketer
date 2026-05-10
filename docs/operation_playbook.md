# AILO Marketing Operation Playbook

This playbook explains how to run the first version of the AILO marketing pipeline.

## Weekly Rhythm

Recommended starting cadence:

- Blog: 2 posts per week
- Threads: 1 thread per day
- Instagram: 3 carousel posts per week
- Shorts: 3 scripts per week, then produce videos from the best-performing topics

## Monthly Calendar

Generate a 30-day calendar and matching briefs:

```powershell
node src/generate_calendar.js --start=2026-05-07 --days=30
```

This creates:

- `content_calendar/YYYY-MM-DD-calendar.json`
- one brief per planned topic in `content_briefs/`

Use the calendar as the operating board. Each item starts as `planned`, then moves through `draft_ready`, `dry_run_ready`, `published`, and measured.

Existing brief files are preserved when you regenerate a calendar. Add `--force` only when you intentionally want to overwrite briefs from the built-in topic templates.

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
node src/generate_calendar.js
node src/run_daily_pipeline.js --day=1
```

The daily pipeline generates a draft by default and stops for human review. After a successful draft run, it updates the selected calendar item to `draft_ready` and records generated draft paths.

After a person reviews and approves the draft, run:

```powershell
node src/run_daily_pipeline.js --day=1 --approve
```

The `--approve` mode copies reviewed content to approved output and writes a channel-matched dry-run plan to `analytics/` without calling any external publishing API.

## Calendar Item Execution

Use day numbers when working through the monthly calendar:

```powershell
node src/run_calendar_item.js --day=7
```

Use dates when planning daily work:

```powershell
node src/run_calendar_item.js --date=2026-05-13
```

For local testing without an API key:

```powershell
node src/run_calendar_item.js --day=7 --template
```

## Daily Pipeline

Use this for normal daily operation:

```powershell
node src/run_daily_pipeline.js --day=7
```

This produces draft files only and waits for human review.

Use this when testing locally without an API key:

```powershell
node src/run_daily_pipeline.js --day=7 --template
```

Use this after a person has reviewed and approved the draft:

```powershell
node src/run_daily_pipeline.js --day=7 --template --approve
```

## Web Dashboard

Start the local dashboard:

```powershell
node src/server.js
```

Open:

```text
http://localhost:4173
```

The dashboard shows the calendar, selected brief, generated draft, approved content, and publishing dry-run output. It can also run the daily pipeline from the selected calendar item.

The target operating flow is:

```text
실제 현장 로그
-> AI가 반복 이슈와 패턴 분석
-> 콘텐츠 주제 추천
-> 브리프 생성
-> 채널별 콘텐츠 생성
-> 승인
-> 배포 확인
```

## Field Log Promotion

Use field logs to turn repeated operational issues into new planned content:

```powershell
npm run analyze:logs
npm run promote:insights
```

This reads `insights/field-log-analysis.json`, creates field-derived briefs in `content_briefs/`, and appends new `planned` items to the active calendar. The dashboard `브리프 생성` button runs the same flow from the current sample field log.

Dashboard steps:

1. Select a day from the left calendar.
2. Use `테스트 모드` for local testing.
3. Click `초안 생성` to create draft content and keep the item in human-review mode.
4. Check `브리프`, `블로그 초안`, `인스타그램 캡션`, `Threads`, and `숏폼 스크립트`.
5. Use `복사` to move a reviewed channel draft into a manual publishing workflow.
6. Click `승인 및 dry-run 생성` only after the draft is approved.

## Short-Form Video Package

The `숏폼 스크립트` tab is designed for YouTube Shorts, Instagram Reels, and TikTok production.

It includes:

- 숏폼 제목
- 영상 훅
- 30초 대본
- 60초 대본
- 장면별 구성
- 자막 문구
- 내레이션 스크립트
- 화면 키워드
- B-roll 추천
- 썸네일 문구
- 업로드 설명문
- 해시태그

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
