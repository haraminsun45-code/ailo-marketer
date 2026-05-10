import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCalendar, selectCalendarItem, slugFromBriefPath } from "./calendar_utils.js";
import { analyzeContentQuality } from "./quality_analyzer.js";
import { loadDotEnv, testOpenAIConnection } from "./openai_client.js";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const publicDir = path.join(root, "web");
const __filename = fileURLToPath(import.meta.url);
const nodeBin = process.execPath;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(text);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function safeRead(relativePath) {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root)) {
    throw new Error("Invalid path.");
  }
  return readFile(resolved, "utf8");
}

async function exists(relativePath) {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(relativePath) {
  if (!(await exists(relativePath))) return null;
  return JSON.parse(await safeRead(relativePath));
}

async function listCalendarFiles() {
  try {
    return (await readdir(path.join(root, "content_calendar")))
      .filter((file) => file.endsWith("-calendar.json"))
      .sort();
  } catch {
    return [];
  }
}

async function runScript(scriptName, args = []) {
  return new Promise((resolve) => {
    const child = spawn(nodeBin, [path.join("src", scriptName), ...args], {
      cwd: root
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function getCalendarData() {
  const calendarFiles = await listCalendarFiles();
  if (calendarFiles.length === 0) {
    return { calendarFiles, activeCalendar: null, items: [] };
  }

  const activeCalendar = calendarFiles.at(-1);
  const raw = await readFile(path.join(root, "content_calendar", activeCalendar), "utf8");
  const parsed = JSON.parse(raw);
  return { calendarFiles, activeCalendar, ...parsed };
}

async function getInsightsData() {
  const result = await runScript("analyze_field_logs.js", []);
  const analysisPath = "insights/field-log-analysis.json";
  const analysis = await readJsonIfExists(analysisPath);
  return {
    generated: result.code === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    analysis
  };
}

function koreanScore(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return (text.match(/[가-힣]/g) || []).length;
}

function chooseDraftForPreview({ item, approvedDrafts, draftDrafts }) {
  if (!approvedDrafts) return draftDrafts;
  if (!draftDrafts) return approvedDrafts;

  const useApproved = ["approved", "dry_run_ready", "published"].includes(item.status);
  const preferred = useApproved ? approvedDrafts : draftDrafts;
  const fallback = useApproved ? draftDrafts : approvedDrafts;

  return koreanScore(fallback) > koreanScore(preferred) * 1.2 ? fallback : preferred;
}

async function getItemData(query) {
  const { file } = await loadCalendar(root);
  const item = selectCalendarItem(file.calendar, {
    day: query.get("day"),
    date: query.get("date")
  });

  if (!item) {
    throw new Error("Calendar item not found.");
  }

  const slug = slugFromBriefPath(item.briefPath);
  const paths = {
    brief: item.briefPath,
    draftMd: `outputs/drafts/${slug}.md`,
    draftJson: `outputs/drafts/${slug}.json`,
    approvedMd: `outputs/approved/${slug}.md`,
    approvedJson: `outputs/approved/${slug}.json`,
    cardsJson: `outputs/cards/${slug}/cards.json`,
    dryRunMd: `analytics/${slug}.dry-run.md`,
    dryRunJson: `analytics/${slug}.dry-run.json`
  };

  const files = {};
  for (const [key, relativePath] of Object.entries(paths)) {
    files[key] = {
      path: relativePath,
      exists: await exists(relativePath)
    };
  }

  const previewPath = query.get("file");
  const view = query.get("view");
  let preview = null;
  if (view) {
    const approvedDrafts = await readJsonIfExists(paths.approvedJson);
    const draftDrafts = await readJsonIfExists(paths.draftJson);
    const drafts = chooseDraftForPreview({ item, approvedDrafts, draftDrafts });
    preview = drafts ? await channelPreview({ view, drafts, briefPath: paths.brief }) : await safeRead(paths.brief);
  } else if (previewPath) {
    preview = await safeRead(previewPath);
  } else if (files.dryRunMd.exists) {
    preview = await safeRead(paths.dryRunMd);
  } else if (files.draftMd.exists) {
    preview = await safeRead(paths.draftMd);
  } else {
    preview = await safeRead(paths.brief);
  }

  const quality = analyzeContentQuality({
    text: preview,
    channels: item.channels
  });

  return { item, slug, files, preview, quality };
}

async function channelPreview({ view, drafts, briefPath }) {
  if (view === "brief") return safeRead(briefPath);

  if (view === "blog") {
    return [
      `# ${drafts.blog.title}`,
      "",
      `Meta: ${drafts.blog.metaDescription}`,
      "",
      drafts.blog.body
    ].join("\n");
  }

  if (view === "instagram") {
    return [
      "# 인스타그램 캡션",
      "",
      "## 카드뉴스",
      "",
      ...drafts.instagram.carousel.map((slide, index) => `### ${index + 1}. ${slide.title}\n\n${slide.body}\n`),
      "## 캡션",
      "",
      drafts.instagram.caption,
      "",
      "## 해시태그",
      "",
      drafts.instagram.hashtags.join(" ")
    ].join("\n");
  }

  if (view === "threads") {
    return ["# Threads", "", ...drafts.threads.map((post, index) => `${index + 1}. ${post}\n`)].join("\n");
  }

  if (view === "shorts") {
    return [
      `# ${drafts.shorts.title}`,
      "",
      `길이: ${drafts.shorts.duration}`,
      "",
      "## 영상 훅",
      "",
      drafts.shorts.hook ?? "",
      "",
      "## 30초 대본",
      "",
      drafts.shorts.script30 ?? "",
      "",
      "## 60초 대본",
      "",
      drafts.shorts.script60 ?? "",
      "",
      "## 장면별 구성 / 자막 / 내레이션",
      "",
      ...drafts.shorts.scenes.map(
        (scene) =>
          `## ${scene.time}\n\n화면: ${scene.visual}\n\n자막: ${scene.subtitle}\n\n내레이션: ${scene.narration}\n`
      ),
      "## 화면 키워드",
      "",
      ...(drafts.shorts.onScreenKeywords ?? []).map((keyword) => `- ${keyword}`),
      "",
      "## B-roll 추천",
      "",
      ...(drafts.shorts.brollSuggestions ?? []).map((item) => `- ${item}`),
      "",
      "## 썸네일 문구",
      "",
      drafts.shorts.thumbnailText ?? "",
      "",
      "## 업로드 설명문",
      "",
      drafts.shorts.uploadDescription ?? "",
      "",
      "## 해시태그",
      "",
      (drafts.shorts.hashtags ?? []).join(" ")
    ].join("\n");
  }

  if (view === "cards") {
    const lines = ["# 이미지 카드", ""];
    if (!Array.isArray(drafts.imageCards) || drafts.imageCards.length === 0) {
      return "이미지 카드 기획이 아직 없습니다. 초안을 다시 생성하면 카드 기획과 SVG 파일이 함께 만들어집니다.";
    }
    for (const [index, card] of drafts.imageCards.entries()) {
      const filePath = `outputs/cards/${slugFromBriefPath(briefPath)}/card-${String(index + 1).padStart(2, "0")}.svg`;
      lines.push(`## 카드 ${index + 1}. ${card.eyebrow}`);
      lines.push("");
      lines.push(`- 규격: ${card.width}x${card.height}`);
      lines.push(`- 파일: ${filePath}`);
      lines.push(`- 헤드라인: ${card.headline}`);
      lines.push(`- 본문: ${card.body}`);
      lines.push(`- 하단 문구: ${card.footer}`);
      lines.push("");
    }
    return lines.join("\n");
  }

  return safeRead(briefPath);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/calendar") {
    sendJson(res, 200, await getCalendarData());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/item") {
    sendJson(res, 200, await getItemData(url.searchParams));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/insights") {
    sendJson(res, 200, await getInsightsData());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/insights/promote") {
    await getInsightsData();
    const body = await parseBody(req);
    const args = [];
    if (body.limit) args.push(`--limit=${body.limit}`);
    if (body.start) args.push(`--start=${body.start}`);
    const result = await runScript("promote_insights.js", args);
    sendJson(res, result.code === 0 ? 200 : 500, result);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/openai/status") {
    await loadDotEnv(path.join(root, ".env"));
    sendJson(res, 200, {
      hasKey: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || "gpt-5"
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/openai/test") {
    await loadDotEnv(path.join(root, ".env"));
    const result = await testOpenAIConnection();
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/calendar/generate") {
    const body = await parseBody(req);
    const args = [];
    if (body.start) args.push(`--start=${body.start}`);
    if (body.days) args.push(`--days=${body.days}`);
    const result = await runScript("generate_calendar.js", args);
    sendJson(res, result.code === 0 ? 200 : 500, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/run-daily") {
    const body = await parseBody(req);
    const args = [];
    if (body.day) args.push(`--day=${body.day}`);
    if (body.date) args.push(`--date=${body.date}`);
    if (body.template) args.push("--template");
    if (body.draftOnly) args.push("--draft-only");
    if (body.approve) args.push("--approve");
    const result = await runScript("run_daily_pipeline.js", args);
    sendJson(res, result.code === 0 ? 200 : 500, result);
    return;
  }

  sendJson(res, 404, { error: "API route not found." });
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const resolved = path.resolve(publicDir, `.${decodeURIComponent(pathname)}`);

  if (!resolved.startsWith(publicDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(resolved);
    const ext = path.extname(resolved);
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(body);
  } catch {
    sendText(res, 404, "Not found");
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined });
  }
}).listen(port, () => {
  console.log(`AILO Marketer dashboard running at http://localhost:${port}`);
  console.log(`Server file: ${__filename}`);
});
