import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const input = process.argv[2] ?? "field_logs/sample-operations.json";
const outDir = path.join(root, "insights");

const issueTopicMap = [
  {
    match: ["manual log", "worklog", "phone report"],
    issue: "반복 업무 로그와 전화 보고",
    topic: "화물 운송 업무 로그를 자동화해야 하는 이유",
    pillar: "업무 로그 자동화",
    angle: "수기 기록과 전화 보고가 기사 피로와 기록 누락을 만든다는 점을 보여준다."
  },
  {
    match: ["OCR", "consignment", "photo"],
    issue: "인수증 OCR 불확실성",
    topic: "인수증 OCR이 반복 입력을 줄이는 방법",
    pillar: "화물 검증",
    angle: "인수증 사진에서 화물 정보를 추출하되, 불확실한 결과는 기사 확인이 필요하다는 점을 강조한다."
  },
  {
    match: ["destination", "mismatch", "unloading"],
    issue: "목적지별 하차 검증",
    topic: "하차 실수와 목적지 화물 확인",
    pillar: "화물 검증",
    angle: "목적지별 화물 확인이 하차 실수와 불일치 위험을 줄일 수 있다는 점을 다룬다."
  },
  {
    match: ["voice", "screen"],
    issue: "화면 조작 감소와 음성 확인",
    topic: "물류 현장에서 음성 중심 UX가 중요한 이유",
    pillar: "음성 중심 UX",
    angle: "운전 중 화면 조작을 줄이고 짧은 음성 확인으로 업무 연속성을 높이는 방향을 제안한다."
  }
];

function normalize(text) {
  return text.toLowerCase();
}

function scoreTopic(logs, mapping) {
  const haystack = normalize(JSON.stringify(logs));
  return mapping.match.reduce((score, keyword) => {
    const regex = new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    return score + (haystack.match(regex) || []).length;
  }, 0);
}

function summarizePatterns(logs) {
  const issueCounts = new Map();
  const operationCounts = new Map();

  for (const log of logs) {
    operationCounts.set(log.operationType, (operationCounts.get(log.operationType) || 0) + 1);
    for (const issue of log.issues || []) {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
    }
  }

  return {
    totalLogs: logs.length,
    operationTypes: Object.fromEntries(operationCounts),
    repeatedIssues: [...issueCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([issue, count]) => ({ issue, count }))
  };
}

function recommendedTopics(logs) {
  return issueTopicMap
    .map((mapping) => ({
      ...mapping,
      score: scoreTopic(logs, mapping)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      rank: index + 1,
      topic: item.topic,
      pillar: item.pillar,
      sourceIssue: item.issue,
      score: item.score,
      recommendedAngle: item.angle,
      suggestedChannels: index === 0 ? ["blog", "threads"] : ["instagram", "shorts"]
    }));
}

const logs = JSON.parse(await readFile(path.join(root, input), "utf8"));
const analysis = {
  source: input,
  createdAt: new Date().toISOString(),
  patterns: summarizePatterns(logs),
  recommendedTopics: recommendedTopics(logs)
};

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "field-log-analysis.json"), JSON.stringify(analysis, null, 2), "utf8");

console.log("Field log analysis written: insights/field-log-analysis.json");
