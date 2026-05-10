import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadCalendar, saveCalendar } from "./calendar_utils.js";

const root = process.cwd();
const args = process.argv.slice(2);
const calendarArg = args.find((arg) => arg.startsWith("--calendar="));
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const startArg = args.find((arg) => arg.startsWith("--start="));
const sourceArg = args.find((arg) => arg.startsWith("--source="));

const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : 3;
const sourcePath = sourceArg?.replace("--source=", "") ?? "insights/field-log-analysis.json";

function addDays(dateString, offset) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function slugify(text, fallback) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function topicParticle(text) {
  const last = text.trim().at(-1);
  if (!last) return "는";
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "는";
  return (code - 0xac00) % 28 === 0 ? "는" : "은";
}

function briefMarkdown(topic, analysis) {
  const repeatedIssues = analysis.patterns.repeatedIssues
    .slice(0, 4)
    .map((item) => `- ${item.issue} (${item.count}회)`);

  return [
    `# 브리프: ${topic.topic}`,
    "",
    "## 핵심 메시지",
    "",
    `${topic.sourceIssue}${topicParticle(topic.sourceIssue)} 실제 운송 흐름에서 반복적으로 나타나는 운영 마찰입니다. AILO는 이 문제를 더 많은 앱 조작이 아니라 업무 흐름 자동화와 필요한 순간의 짧은 확인으로 줄여야 합니다.`,
    "",
    "## 대상",
    "",
    "- 화물기사",
    "- 운송사",
    "- 물류 운영 관리자",
    "",
    "## 문제",
    "",
    topic.recommendedAngle,
    "",
    "## 현장 근거",
    "",
    ...repeatedIssues,
    "",
    "## AILO 관점",
    "",
    "AILO는 낮은 위험의 기록과 상태 전환은 자동으로 처리하고, 화물 검증이나 불확실성이 있는 순간에는 기사에게 짧고 명확한 확인을 요청합니다.",
    "",
    "## 근거 포인트",
    "",
    `- 분석 소스: ${analysis.source}`,
    `- 추천 점수: ${topic.score}`,
    `- 관련 운영 이슈: ${topic.sourceIssue}`,
    "- 현장 로그에서 반복되는 마찰을 콘텐츠 주제로 전환합니다.",
    "",
    "## 톤",
    "",
    "차분하고 실무적이며 현장 중심. 과도한 AI 표현보다 실제 운송 업무의 불편과 개선 방향을 우선합니다.",
    "",
    "## CTA",
    "",
    "AILO는 실제 운송 현장의 반복 이슈를 줄이는 hands-free 화물 업무 assistant를 만들고 있습니다."
  ].join("\n");
}

function nextStartDate(calendar, explicitStart) {
  if (explicitStart) return explicitStart;
  const dates = calendar.map((item) => item.date).sort();
  return addDays(dates.at(-1), 1);
}

const analysisFile = path.join(root, sourcePath);
if (!(await exists(analysisFile))) {
  throw new Error(`Insight analysis not found: ${sourcePath}. Run src/analyze_field_logs.js first.`);
}

const analysis = JSON.parse(await readFile(analysisFile, "utf8"));
const topics = (analysis.recommendedTopics ?? []).slice(0, limit);

if (topics.length === 0) {
  throw new Error("No recommended topics found in insight analysis.");
}

const { filePath: calendarPath, file: calendarFile } = await loadCalendar(root, calendarArg?.replace("--calendar=", ""));
const briefsDir = path.join(root, "content_briefs");
await mkdir(briefsDir, { recursive: true });

const startDate = nextStartDate(calendarFile.calendar, startArg?.replace("--start=", ""));
const currentMaxDay = Math.max(...calendarFile.calendar.map((item) => item.day));
const existingBriefs = new Set(calendarFile.calendar.map((item) => item.briefPath));
const existingInsightIssues = new Set(
  calendarFile.calendar
    .filter((item) => item.origin === "field_log_insight")
    .map((item) => item.sourceIssue)
    .filter(Boolean)
);
const appended = [];

for (const [index, topic] of topics.entries()) {
  if (existingInsightIssues.has(topic.sourceIssue)) {
    continue;
  }

  const day = currentMaxDay + appended.length + 1;
  const date = addDays(startDate, appended.length);
  const fallbackSlug = `insight-${String(topic.rank ?? index + 1).padStart(2, "0")}`;
  const briefPath = `content_briefs/${String(day).padStart(3, "0")}-field-${slugify(topic.topic, fallbackSlug)}.md`;

  if (existingBriefs.has(briefPath)) {
    continue;
  }

  await writeFile(path.join(root, briefPath), briefMarkdown(topic, analysis), "utf8");

  const item = {
    day,
    date,
    title: topic.topic,
    pillar: topic.pillar,
    channels: topic.suggestedChannels,
    briefPath,
    status: "planned",
    origin: "field_log_insight",
    sourceIssue: topic.sourceIssue,
    insightScore: topic.score,
    createdAt: new Date().toISOString()
  };

  calendarFile.calendar.push(item);
  appended.push(item);
}

calendarFile.totalDays = calendarFile.calendar.length;
calendarFile.updatedAt = new Date().toISOString();
await saveCalendar(root, calendarPath, calendarFile);

console.log(`Insight briefs promoted: ${appended.length}`);
for (const item of appended) {
  console.log(`- Day ${item.day} / ${item.date}: ${item.briefPath}`);
}
