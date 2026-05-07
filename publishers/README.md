# Publishers

Publisher modules will live here.

The MVP starts in dry-run mode because each platform requires account setup, app review, access tokens, and sometimes public media URLs.

## Planned Publishers

- `threads`: text threads and media posts through Threads API.
- `instagram`: carousel posts and Reels through Instagram Graph API.
- `youtube`: Shorts upload through YouTube Data API.
- `naver-blog`: blog publishing through Naver OpenAPI if account permissions allow it.

## Safety Rule

Generated content should be reviewed before publishing. AILO marketing is still defining its voice, so the pipeline should optimize for repeatability without removing human approval too early.

## Current Dry-Run Command

```powershell
node src/publish_dry_run.js
```

Optional channel selection:

```powershell
node src/publish_dry_run.js --channels=threads,instagram
```
