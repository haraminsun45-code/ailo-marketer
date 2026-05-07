# API Publishing Notes

These notes are for later publisher implementation.

## Threads

Threads publishing uses the Threads API and requires Meta app setup, account authorization, and Threads-specific permissions.

Expected flow:

1. Create a post container.
2. Publish the container.
3. Store the published post ID.
4. Fetch insights later when available.

## Instagram

Instagram publishing requires a professional account and Meta app permissions.

Expected flow:

1. Make generated images or videos available through a public URL.
2. Create a media container.
3. Publish with `media_publish`.
4. Store the Instagram media ID.

For Reels, the media container should use `media_type=REELS`.

## YouTube Shorts

YouTube Shorts are uploaded through the YouTube Data API `videos.insert` endpoint. Shorts are determined by format and metadata rather than a separate Shorts-only API.

Expected flow:

1. Render vertical video.
2. Upload through YouTube Data API.
3. Include Shorts-friendly title, description, and tags.
4. Store the YouTube video ID.

## Naver Blog

Naver Blog automation depends on Naver OpenAPI permissions and account setup.

Expected flow:

1. Confirm blog writing permission for the account.
2. Authenticate through Naver Login.
3. Publish approved blog drafts.
4. Store the blog post URL.

## Implementation Rule

All publishers should support dry-run mode before real publishing.

## Model Generation

The draft generator uses the OpenAI Responses API directly through `fetch`, so it does not require the OpenAI npm package.

Required environment variable:

```text
OPENAI_API_KEY=
```

Optional environment variable:

```text
OPENAI_MODEL=gpt-5
```
