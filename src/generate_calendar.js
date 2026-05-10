import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const startArg = args.find((arg) => arg.startsWith("--start="));
const daysArg = args.find((arg) => arg.startsWith("--days="));
const forceFlag = args.includes("--force");
const startDate = startArg ? startArg.replace("--start=", "") : new Date().toISOString().slice(0, 10);
const totalDays = daysArg ? Number(daysArg.replace("--days=", "")) : 30;

const topics = [
  {
    title: "Why freight work logs should be automated",
    displayTitle: "화물 운송 업무 로그를 자동화해야 하는 이유",
    pillar: "기사 업무 부담",
    coreMessage:
      "화물기사는 운전, 상차, 하차, 전화 대응을 처리하면서 반복되는 업무 이벤트를 일일이 수기로 기록하지 않아도 되어야 합니다.",
    problem:
      "수기 업무 로그는 피로, 기록 누락, 운송 중 불필요한 화면 조작을 만듭니다.",
    angle:
      "AILO는 낮은 위험의 업무 이벤트는 자동으로 기록하고, 검증이 필요한 순간에만 기사 확인을 요청합니다.",
    proofPoints: [
      "출근과 운행 시작은 자동 기록될 수 있습니다.",
      "상차와 하차 상태는 하나의 업무 타임라인으로 정리될 수 있습니다.",
      "운송사는 더 정리된 운행 이력을 확보할 수 있습니다."
    ],
    cta: "AILO는 실제 운송 환경을 위한 hands-free 화물 업무 assistant를 만들고 있습니다."
  },
  {
    title: "Why drivers should not have to touch apps while driving",
    displayTitle: "운전 중 앱 조작을 줄여야 하는 이유",
    pillar: "음성 중심 UX",
    coreMessage:
      "화물 운송 소프트웨어는 운행 중 메뉴를 늘리는 것이 아니라 화면 조작을 줄여야 합니다.",
    problem:
      "기사는 도로에 집중해야 하는 동안에도 앱 확인, 전화 응답, 위치 확인, 진행 보고를 요구받습니다.",
    angle:
      "AILO는 업무 흐름 자체를 UI로 보고, 가능한 순간에는 짧은 음성 중심 상호작용을 사용합니다.",
    proofPoints: [
      "음성 확인은 터치 조작을 줄입니다.",
      "자동 업무 단계 전환은 메뉴 탐색을 줄입니다.",
      "짧은 안내는 긴 챗봇 대화보다 현장에 적합합니다."
    ],
    cta: "운전자는 운전에 집중하고, AILO가 업무 흐름을 처리합니다."
  },
  {
    title: "How OCR can reduce consignment input work",
    displayTitle: "인수증 OCR이 반복 입력을 줄이는 방법",
    pillar: "화물 검증",
    coreMessage:
      "인수증은 반복 입력 없이 구조화된 업무 데이터로 바뀌어야 합니다.",
    problem:
      "기사와 운영자는 종이 문서, 사진, 분리된 양식에서 화물 정보를 다시 입력하는 일을 반복합니다.",
    angle:
      "AILO는 OCR 기반 인수증 처리로 화물 정보를 요약하고 상차 검증을 지원합니다.",
    proofPoints: [
      "OCR은 화물명, 수량, 목적지를 추출할 수 있습니다.",
      "AILO는 화물 정보를 음성으로 요약할 수 있습니다.",
      "불확실한 OCR 결과는 기사 확인을 요청해야 합니다."
    ],
    cta: "AILO는 화물 문서를 운송 업무 데이터로 바꾸는 것을 돕습니다."
  },
  {
    title: "Loading verification without complicated screens",
    displayTitle: "복잡한 화면 없이 상차 검증하기",
    pillar: "화물 검증",
    coreMessage:
      "상차 검증은 단순하고 음성 친화적이며 실제 인수증 흐름과 연결되어야 합니다.",
    problem:
      "상차 현장은 바쁘고 복잡합니다. 복잡한 앱 화면은 기사를 늦추고 실수를 늘릴 수 있습니다.",
    angle:
      "AILO는 관련 화물 요약을 읽어주고, 상차 검증이 필요한 순간에만 확인을 요청합니다.",
    proofPoints: [
      "상차 전 화물 항목을 요약할 수 있습니다.",
      "기사 확인은 짧고 실무적으로 유지할 수 있습니다.",
      "상차 기록은 운행 타임라인의 일부가 됩니다."
    ],
    cta: "AILO는 상차 검증을 화면 업무로 만들지 않고 지원합니다."
  },
  {
    title: "Unloading mistakes and destination cargo checks",
    displayTitle: "하차 실수와 목적지 화물 확인",
    pillar: "화물 검증",
    coreMessage:
      "하차 검증은 올바른 목적지에서 올바른 화물을 확인하도록 도와야 합니다.",
    problem:
      "계약화물과 다중 목적지 운송에서는 하차 중 화물 불일치 위험이 생길 수 있습니다.",
    angle:
      "AILO는 목적지별 화물을 식별하고, 필요한 하차 정보를 알맞은 단계에서 읽어줍니다.",
    proofPoints: [
      "목적지별 화물 요약은 혼동을 줄입니다.",
      "하차 확인은 업무 로그에 기록될 수 있습니다.",
      "불일치 가능성이 있는 순간에는 기사 확인이 필요합니다."
    ],
    cta: "AILO는 실제 화물 운송 흐름에서 화물 불일치 위험을 줄이도록 설계됩니다."
  },
  {
    title: "Fixed-route freight vs variable freight workflows",
    displayTitle: "고정노선과 계약화물 워크플로우의 차이",
    pillar: "업무 자동화",
    coreMessage:
      "고정노선과 계약화물은 서로 다른 수준의 자동화와 유연성이 필요합니다.",
    problem:
      "하나의 고정된 업무 흐름은 반복 운행 노선과 변동성이 큰 계약화물을 모두 처리하기 어렵습니다.",
    angle:
      "AILO는 예측 가능한 고정노선과 유연성이 필요한 계약화물 업무 흐름을 구분합니다.",
    proofPoints: [
      "고정노선은 사전 등록된 경로 정보를 활용할 수 있습니다.",
      "계약화물은 유연한 음성 기반 업무 생성이 필요합니다.",
      "두 방식 모두 일관된 업무 로그를 남겨야 합니다."
    ],
    cta: "AILO는 운송 형태에 맞춰 업무 흐름을 조정합니다."
  },
  {
    title: "What an AI operational co-driver means",
    displayTitle: "AI 업무 동승자는 무엇을 의미하나",
    pillar: "업무 자동화",
    coreMessage:
      "AILO는 일반 챗봇이 아니라 화물 운송 업무 흐름에 참여하는 운영 assistant입니다.",
    problem:
      "많은 AI 도구는 질문에 답하지만, 화물 운송 현장은 반복되는 실제 업무 단계의 지원이 필요합니다.",
    angle:
      "AILO는 조용한 업무 동승자처럼 기록을 처리하고, 필요한 확인을 요청하며, 업무 흐름을 이어갑니다.",
    proofPoints: [
      "assistant는 화물 업무 상태를 따라갑니다.",
      "낮은 위험의 이벤트는 자동 처리될 수 있습니다.",
      "위험도가 높은 검증은 기사 확인으로 남겨야 합니다."
    ],
    cta: "AILO는 대화만 하는 것이 아니라 운송 업무에 참여합니다."
  },
  {
    title: "Why transportation companies need workflow visibility",
    displayTitle: "운송사에 업무 가시성이 필요한 이유",
    pillar: "운송사 운영",
    coreMessage:
      "운송사는 기사에게 보고 부담을 더하지 않으면서 중앙화된 운행 이력이 필요합니다.",
    problem:
      "전화 보고, 종이 기록, 흩어진 앱 기록은 차량과 경로별 상황을 파악하기 어렵게 만듭니다.",
    angle:
      "AILO는 기사 업무 이벤트를 운송사가 볼 수 있는 구조화된 운영 이력으로 바꿉니다.",
    proofPoints: [
      "업무 로그는 중앙화될 수 있습니다.",
      "상하차 확인은 운영 가시성을 높입니다.",
      "정리된 기록은 안전 관리와 차량 관리를 지원합니다."
    ],
    cta: "AILO는 기사 부담을 늘리지 않고 운송 업무 디지털화를 돕습니다."
  },
  {
    title: "Low-risk automation vs driver confirmation",
    displayTitle: "저위험 자동화와 기사 확인의 기준",
    pillar: "업무 자동화",
    coreMessage:
      "좋은 물류 AI는 어떤 행동을 자동화하고 어떤 행동은 기사 확인이 필요한지 구분해야 합니다.",
    problem:
      "과도한 자동화는 위험할 수 있지만, 모든 것을 기사에게 확인시키는 방식도 피로를 만듭니다.",
    angle:
      "AILO는 시간 기록과 업무 단계 전환 같은 낮은 위험의 업무는 자동화하고, 검증 민감도가 높은 업무는 확인을 요청합니다.",
    proofPoints: [
      "시간 기록과 로그는 자동화될 수 있습니다.",
      "화물 불일치는 기사 확인이 필요합니다.",
      "OCR 불확실성은 명확하게 드러나야 합니다."
    ],
    cta: "AILO는 자동화와 운영 책임 사이의 균형을 지향합니다."
  },
  {
    title: "Why voice-first UX matters in logistics",
    displayTitle: "물류 현장에서 음성 중심 UX가 중요한 이유",
    pillar: "음성 중심 UX",
    coreMessage:
      "화물 운송 환경에서 음성 중심 UX는 새로운 장식이 아니라 화면 의존도를 줄이는 실용적인 방식입니다.",
    problem:
      "기사는 이동 중인 차량, 상하차 현장, 네트워크가 불안정한 지역, 시간에 쫓기는 업무 환경에서 일합니다.",
    angle:
      "AILO는 짧고 차분하며 실무적인 음성 상호작용으로 업무 연속성을 지원합니다.",
    proofPoints: [
      "짧은 안내는 주의 분산을 줄입니다.",
      "음성 상호작용은 hands-free 운영을 지원합니다.",
      "업무 상태를 이해하면 긴 명령어가 줄어듭니다."
    ],
    cta: "AILO는 실제 운송 조건을 기준으로 업무 흐름을 설계합니다."
  }
];

const channelPatterns = [
  ["blog", "threads"],
  ["instagram", "shorts"],
  ["threads"],
  ["instagram"],
  ["blog"],
  ["threads", "shorts"],
  ["instagram", "threads"]
];

function addDays(dateString, offset) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function briefMarkdown(entry) {
  return [
    `# 브리프: ${entry.displayTitle}`,
    "",
    "## 핵심 메시지",
    "",
    entry.coreMessage,
    "",
    "## 대상",
    "",
    "- 화물기사",
    "- 운송사",
    "- 물류 운영 관리자",
    "",
    "## 문제",
    "",
    entry.problem,
    "",
    "## AILO 관점",
    "",
    entry.angle,
    "",
    "## 근거 포인트",
    "",
    ...entry.proofPoints.map((point) => `- ${point}`),
    "",
    "## 톤",
    "",
    "차분하고 실무적이며 현장 중심. 과도하게 미래지향적으로 보이지 않게 작성.",
    "",
    "## CTA",
    "",
    entry.cta
  ].join("\n");
}

async function writeFileIfMissing(filePath, content) {
  if (forceFlag) {
    await writeFile(filePath, content, "utf8");
    return true;
  }

  try {
    await access(filePath);
    return false;
  } catch {
    await writeFile(filePath, content, "utf8");
    return true;
  }
}

function buildCalendar() {
  return Array.from({ length: totalDays }, (_, index) => {
    const topic = topics[index % topics.length];
    const date = addDays(startDate, index);
    const slug = `${String(index + 1).padStart(3, "0")}-${slugify(topic.title)}`;

    return {
      day: index + 1,
      date,
      title: topic.title,
      pillar: topic.pillar,
      channels: channelPatterns[index % channelPatterns.length],
      briefPath: `content_briefs/${slug}.md`,
      status: "planned"
    };
  });
}

const calendar = buildCalendar();
const calendarDir = path.join(root, "content_calendar");
const briefsDir = path.join(root, "content_briefs");
const calendarFile = path.join(calendarDir, `${startDate}-calendar.json`);

await mkdir(calendarDir, { recursive: true });
await mkdir(briefsDir, { recursive: true });

let briefsWritten = 0;
let briefsSkipped = 0;

for (const item of calendar) {
  const topic = topics[(item.day - 1) % topics.length];
  const written = await writeFileIfMissing(path.join(root, item.briefPath), briefMarkdown(topic));
  if (written) briefsWritten += 1;
  else briefsSkipped += 1;
}

await writeFile(calendarFile, JSON.stringify({ startDate, totalDays, calendar }, null, 2), "utf8");

console.log(`Calendar generated: content_calendar/${startDate}-calendar.json`);
console.log(`Briefs written: ${briefsWritten}`);
console.log(`Briefs preserved: ${briefsSkipped}`);
