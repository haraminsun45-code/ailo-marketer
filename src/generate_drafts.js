import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createMarketingDraftWithOpenAI, loadDotEnv } from "./openai_client.js";

const root = process.cwd();
const args = process.argv.slice(2);
const useTemplateOnly = args.includes("--template");
const briefPath = args.find((arg) => !arg.startsWith("--")) ?? "content_briefs/001-why-freight-work-logs-should-be-automated.md";

const topicTitles = {
  "why-freight-work-logs-should-be-automated": "화물 운송 업무 로그를 자동화해야 하는 이유",
  "why-drivers-should-not-have-to-touch-apps-while-driving": "운전 중 앱 조작을 줄여야 하는 이유",
  "how-ocr-can-reduce-consignment-input-work": "인수증 OCR이 반복 입력을 줄이는 방법",
  "loading-verification-without-complicated-screens": "복잡한 화면 없이 상차 검증하기",
  "unloading-mistakes-and-destination-cargo-checks": "하차 실수와 목적지 화물 확인",
  "fixed-route-freight-vs-variable-freight-workflows": "고정노선과 변동 화물 워크플로우의 차이",
  "what-an-ai-operational-co-driver-means": "AI 운영 동승자는 무엇을 의미하나",
  "why-transportation-companies-need-workflow-visibility": "운송사에 업무 가시성이 필요한 이유",
  "low-risk-automation-vs-driver-confirmation": "저위험 자동화와 기사 확인의 기준",
  "why-voice-first-ux-matters-in-logistics": "물류 현장에서 음성 중심 UX가 중요한 이유"
};

function slugFromPath(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/^\d+-/, "");
}

function extractSection(markdown, title) {
  const pattern = new RegExp(`## ${title}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  return markdown.match(pattern)?.[1]?.trim() ?? "";
}

function extractAnySection(markdown, titles) {
  for (const title of titles) {
    const section = extractSection(markdown, title);
    if (section) return section;
  }
  return "";
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

function hasKorean(text) {
  return /[가-힣]/.test(text);
}

function koreanOr(text, fallback) {
  const compacted = compact(text);
  return hasKorean(compacted) ? compacted : fallback;
}

function titleForBrief() {
  const slug = slugFromPath(briefPath);
  if (topicTitles[slug]) return topicTitles[slug];
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function imageCardsForDraft({ title, problem, angle, cta }) {
  return [
    {
      format: "instagram-square",
      width: 1080,
      height: 1080,
      eyebrow: "WHY",
      headline: title,
      body: "운전자는 운행에 집중하고, 반복 기록은 AILO가 정리합니다.",
      footer: "운전자는 운행만, 기록은 AILO가",
      theme: "deep"
    },
    {
      format: "instagram-square",
      width: 1080,
      height: 1080,
      eyebrow: "AS-IS / TO-BE",
      headline: "기록 업무를 줄이면 운행 흐름이 달라집니다",
      body: `AS-IS  운전 중 수기 기록 · 사진 누락 · 종이 분실\nTO-BE  GPS 기록 · 사진 확인 · 카톡 전송 · 업무 이력 정리`,
      footer: "낮은 위험은 자동화, 중요한 확인은 기사에게",
      theme: "compare"
    },
    {
      format: "instagram-square",
      width: 1080,
      height: 1080,
      eyebrow: "HOW TO",
      headline: "버튼 한 번, 필요한 순간엔 짧은 확인",
      body: `1. 업무 시작\n2. 상차·하차 흐름 기록\n3. 필요한 사진만 촬영\n4. 완료 로그를 한 번에 정리`,
      footer: "복잡한 화면보다 현장 흐름에 맞춘 업무 기록",
      theme: "steps"
    },
    {
      format: "instagram-square",
      width: 1080,
      height: 1080,
      eyebrow: "FIELD PAIN",
      headline: "반복 입력은 작아 보여도 매일 쌓입니다",
      body: problem,
      footer: "AILO Content Ops · draft card",
      theme: "plain"
    },
    {
      format: "instagram-square",
      width: 1080,
      height: 1080,
      eyebrow: "AILO",
      headline: "기록은 자동으로, 확인은 더 선명하게",
      body: `${angle}\n\n${cta}`,
      footer: "곧 더 적은 조작으로 운송 업무를 정리합니다",
      theme: "cta"
    }
  ];
}

function buildDrafts(brief) {
  const title = titleForBrief();
  const coreMessage = koreanOr(
    extractAnySection(brief, ["핵심 메시지", "Core Message"]),
    "화물 운송 현장의 반복 기록은 기사에게 계속 화면 조작을 요구하기보다 업무 흐름 안에서 자연스럽게 남아야 합니다."
  );
  const problem = koreanOr(
    extractAnySection(brief, ["문제", "Problem"]),
    "상차, 하차, 인수증 확인, 전화 보고, 완료 로그가 따로 움직이면 운전자는 운전 중에도 앱과 문서를 반복해서 확인하게 됩니다."
  );
  const angle = koreanOr(
    extractAnySection(brief, ["AILO 관점", "AILO Angle"]),
    "AILO는 저위험 업무 기록은 자동화하고, 화물 검증처럼 확인이 필요한 순간에는 기사에게 짧고 명확하게 묻는 방식으로 설계됩니다."
  );
  const proofPoints = extractAnySection(brief, ["근거 포인트", "Proof Points"])
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter((line) => line && hasKorean(line));
  const cta = koreanOr(
    extractAnySection(brief, ["CTA"]),
    "AILO는 실제 운송 흐름 안에서 불필요한 조작을 줄이고, 필요한 확인은 놓치지 않는 hands-free 업무 assistant를 만들고 있습니다."
  );
  const bullets = proofPoints.length
    ? proofPoints
    : [
        "반복 입력과 전화 보고 시간을 줄일 수 있습니다.",
        "운송사는 더 일관된 업무 로그를 확보할 수 있습니다.",
        "기사는 운전과 현장 확인에 더 집중할 수 있습니다."
      ];

  const drafts = {
    threads: [
      `${title}에 대해 이야기할 때 핵심은 기술이 아니라 현장 부담입니다.`,
      problem,
      "작은 기록 하나도 상차, 하차, 인수증, 보고 단계마다 반복되면 운전자에게는 피로가 됩니다.",
      coreMessage,
      angle,
      "모든 판단을 자동화하자는 뜻은 아닙니다. 낮은 위험의 기록은 줄이고, 중요한 확인은 더 선명하게 만드는 것이 목표입니다.",
      cta
    ],
    instagram: {
      carousel: [
        {
          title: "반복 기록은 업무 흐름을 느리게 만듭니다",
          body: "운전, 상차, 하차, 전화 보고 사이에 앱 입력이 계속 끼어들면 현장 집중도가 떨어집니다."
        },
        {
          title: "자동화할 일과 확인할 일을 나눕니다",
          body: "시간 기록이나 상태 전환처럼 위험이 낮은 일은 자동화하고, 화물 검증은 기사 확인을 남깁니다."
        },
        {
          title: "AILO는 업무 흐름을 따라갑니다",
          body: "출근, 이동, 상차, 하차, 완료 기록을 하나의 운송 타임라인으로 정리합니다."
        },
        {
          title: "화면 조작보다 짧은 확인",
          body: "필요한 순간에는 긴 메뉴 대신 짧은 음성 또는 단순 확인으로 처리합니다."
        },
        {
          title: "기사는 운전에 집중합니다",
          body: "AILO가 반복 기록을 맡고, 기사는 실제 화물과 안전에 집중할 수 있게 만듭니다."
        }
      ],
      caption:
        `${title}. ${problem} AILO는 반복 기록을 줄이고, 검증이 필요한 순간만 명확하게 확인하는 운송 업무 흐름을 지향합니다.`,
      hashtags: ["#AILO", "#화물운송", "#물류AI", "#운송관리", "#업무자동화", "#화물기사", "#현장물류"]
    },
    blog: {
      title,
      metaDescription: `${title}에 대해 AILO가 바라보는 현장 문제와 hands-free 운송 업무 자동화 방향을 정리합니다.`,
      body: [
        `# ${title}`,
        "",
        "화물 운송 업무는 운전만으로 끝나지 않습니다. 상차, 하차, 인수증 확인, 전화 보고, 완료 로그처럼 작은 기록이 계속 이어집니다.",
        "",
        "## 현장의 문제",
        "",
        problem,
        "",
        "이 과정이 여러 앱과 문서, 전화로 나뉘면 운전자는 실제 운송보다 기록을 따라가는 데 더 많은 주의를 쓰게 됩니다.",
        "",
        "## AILO의 접근",
        "",
        coreMessage,
        "",
        angle,
        "",
        "## 자동화와 확인의 기준",
        "",
        "AILO는 모든 판단을 무조건 자동화하지 않습니다. 시간 기록, 상태 전환, 이력 정리처럼 위험이 낮은 업무는 자동으로 처리하고, 화물 불일치나 OCR 불확실성처럼 검증이 필요한 순간은 기사에게 확인을 요청합니다.",
        "",
        "## 기대 효과",
        "",
        ...bullets.map((point) => `- ${point}`),
        "",
        "목표는 물류 현장에 더 많은 버튼을 추가하는 것이 아닙니다. 실제 운송 흐름 안에서 불필요한 조작을 줄이고, 중요한 확인만 남기는 것입니다.",
        "",
        cta
      ].join("\n")
    },
    shorts: {
      title: `${title}, 왜 필요할까?`,
      duration: "35-45초",
      hook: "화물기사는 운전만 하는 것이 아닙니다. 매 운행마다 기록과 확인을 함께 처리합니다.",
      script30:
        `화물 운송 현장에서는 상차, 하차, 인수증 확인, 전화 보고, 완료 로그가 계속 이어집니다. ${problem} AILO는 저위험 기록은 자동화하고, 검증이 필요한 순간에는 기사에게 짧게 확인을 요청합니다. 목표는 더 많은 앱 조작이 아니라, 운전자가 운전과 현장 확인에 집중하게 만드는 것입니다.`,
      script60:
        `화물 운송 업무는 운전만으로 끝나지 않습니다. 상차 상태를 남기고, 하차를 확인하고, 인수증을 처리하고, 운송사에 보고하는 과정이 계속 이어집니다. 이런 기록이 여러 앱과 전화, 종이 문서에 흩어지면 운전자는 운전 중에도 업무 흐름을 계속 기억해야 합니다. AILO는 이 반복을 줄이는 방향으로 설계됩니다. 위험이 낮은 기록은 자동으로 남기고, 화물 검증처럼 중요한 순간에는 기사에게 짧고 명확하게 확인을 요청합니다. 핵심은 자동화와 사람의 확인을 나누는 것입니다. ${cta}`,
      scenes: [
        {
          time: "0-3s",
          visual: "운전석 주변에 메모와 문서가 놓인 장면",
          subtitle: "운전만으로 끝나지 않는 화물 운송",
          narration: "화물기사는 운전만 하는 것이 아닙니다."
        },
        {
          time: "3-10s",
          visual: "상차, 하차, 인수증, 보고 항목이 빠르게 전환",
          subtitle: "상차. 하차. 인수증. 보고.",
          narration: "운행마다 작은 기록과 확인이 계속 이어집니다."
        },
        {
          time: "10-22s",
          visual: "운송 타임라인이 자동으로 채워지는 UI",
          subtitle: "AILO가 반복 기록을 정리합니다",
          narration: "AILO는 저위험 업무 로그를 운송 흐름 안에서 자동으로 정리합니다."
        },
        {
          time: "22-34s",
          visual: "화물 검증 확인 문구가 짧게 표시되는 장면",
          subtitle: "중요한 확인은 기사에게 묻습니다",
          narration: "검증이 필요한 순간에는 짧고 명확하게 확인을 요청합니다."
        },
        {
          time: "34-45s",
          visual: "도로를 주행하는 화물차와 완료된 업무 로그",
          subtitle: "운전자는 운전에 집중. AILO는 업무 흐름을 처리.",
          narration: "반복 기록은 줄이고, 중요한 확인은 놓치지 않는 것이 AILO의 방향입니다."
        }
      ],
      onScreenKeywords: ["업무 로그 자동화", "상차/하차 기록", "화물 검증", "화면 조작 감소", "AILO"],
      brollSuggestions: [
        "운전석에서 알림이 쌓이는 장면",
        "상차 현장에서 화물을 확인하는 장면",
        "인수증 사진을 촬영하는 장면",
        "자동으로 채워지는 업무 타임라인 UI",
        "도로를 주행하는 화물차"
      ],
      thumbnailText: "화물 업무 로그, 자동화가 필요할까?",
      uploadDescription: `${title}에 대한 AILO의 관점을 짧은 영상 스크립트로 정리했습니다.`,
      hashtags: ["#AILO", "#화물운송", "#물류AI", "#업무자동화", "#화물기사", "#숏폼", "#릴스"]
    }
  };

  drafts.imageCards = imageCardsForAiloAgent({ title, problem, angle, cta });
  return drafts;
}

function imageCardsForAiloAgent({ title, problem, angle, cta }) {
  return [
    {
      format: "instagram-vertical",
      width: 1080,
      height: 1350,
      eyebrow: "기사님 관점",
      headline: "기록 때문에 운행 흐름이 끊기지 않도록",
      body: problem,
      footer: "현실적인 화물 운송 업무를 위한 AI 보조",
      theme: "plain"
    },
    {
      format: "instagram-vertical",
      width: 1080,
      height: 1350,
      eyebrow: "팀 신뢰",
      headline: "팀 자체가 브랜드가 되는 운송 네트워크",
      body: "부산 야간 냉동팀 · 기사 12명 · 평점 4.9 · 무사고 280일 · 심야배송 특화",
      footer: "신뢰를 말이 아니라 기록으로 보여줍니다",
      theme: "compare"
    },
    {
      format: "instagram-vertical",
      width: 1080,
      height: 1350,
      eyebrow: "AILO 업무 보조",
      headline: "AI는 기사님을 대신하는 게 아니라 업무 흐름을 보조합니다",
      body: angle,
      footer: "운전과 판단은 기사님이, 기록과 정리는 AILO가",
      theme: "deep"
    },
    {
      format: "instagram-vertical",
      width: 1080,
      height: 1350,
      eyebrow: "신뢰 데이터",
      headline: "평점, 운행 이력, 무사고 기록이 팀의 명성이 됩니다",
      body: "검증된 팀 기반 운송 네트워크에서는 누가 어떤 운송을 잘해왔는지가 중요한 자산이 됩니다.",
      footer: "팀의 실력이 데이터로 남는 구조",
      theme: "steps"
    },
    {
      format: "instagram-vertical",
      width: 1080,
      height: 1350,
      eyebrow: "이건 우리를 위한 AI",
      headline: title,
      body: cta,
      footer: "과한 게임이 아니라, 실제 운송 문화를 위한 플랫폼",
      theme: "cta"
    }
  ];
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const lines = [];
  for (const paragraph of String(text ?? "").split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (!words.length) lines.push("");
  }
  return lines;
}

function palette(theme) {
  const themes = {
    deep: { bg: "#12251f", panel: "#e6f1ec", accent: "#62b99d", ink: "#f8fbf8", sub: "#c6d8d1" },
    compare: { bg: "#f4f7f4", panel: "#ffffff", accent: "#2c62a3", ink: "#17221e", sub: "#66736d" },
    steps: { bg: "#eef4f0", panel: "#143329", accent: "#d1a33a", ink: "#15211d", sub: "#5e6d67" },
    plain: { bg: "#ffffff", panel: "#edf3ef", accent: "#16735d", ink: "#17221e", sub: "#66736d" },
    cta: { bg: "#17352b", panel: "#ffffff", accent: "#b8dcce", ink: "#f8fbf8", sub: "#d8e7e1" }
  };
  return themes[theme] || themes.plain;
}

function textLines(lines, { x, y, size, fill, weight = 700, lineHeight }) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`
    )
    .join("\n");
}

function cardToSvg(card, index) {
  const colors = palette(card.theme);
  const isVertical = card.height > card.width;
  const headline = wrapText(card.headline, isVertical ? 13 : 15).slice(0, isVertical ? 5 : 4);
  const body = wrapText(card.body, isVertical ? 24 : 27).slice(0, isVertical ? 11 : 10);
  const isLight = ["compare", "plain", "steps"].includes(card.theme);
  const bodyFill = isLight ? colors.sub : colors.sub;
  const headlineFill = isLight ? colors.ink : colors.ink;
  const panelFill = card.theme === "deep" || card.theme === "cta" ? "#ffffff" : colors.panel;
  const panelOpacity = card.theme === "deep" || card.theme === "cta" ? "0.08" : "1";
  const margin = 64;
  const panelWidth = card.width - margin * 2;
  const panelHeight = card.height - margin * 2;
  const eyebrowY = margin + 146;
  const headlineY = margin + (isVertical ? 300 : 272);
  const dividerY = margin + (isVertical ? 770 : 586);
  const bodyY = dividerY + 74;
  const footerY = card.height - margin - 62;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">
  <rect width="100%" height="100%" fill="${colors.bg}"/>
  <rect x="${margin}" y="${margin}" width="${panelWidth}" height="${panelHeight}" rx="34" fill="${panelFill}" fill-opacity="${panelOpacity}" stroke="${colors.accent}" stroke-width="3"/>
  <text x="96" y="${margin + 74}" font-size="30" font-weight="800" letter-spacing="8" fill="${colors.accent}">AILO CONTENT OPS</text>
  <text x="96" y="${eyebrowY}" font-size="42" font-weight="900" letter-spacing="6" fill="${colors.accent}">${escapeXml(card.eyebrow)}</text>
  ${textLines(headline, { x: 96, y: headlineY, size: isVertical ? 70 : 74, fill: headlineFill, weight: 900, lineHeight: isVertical ? 86 : 88 })}
  <rect x="96" y="${dividerY}" width="${card.width - 192}" height="2" fill="${colors.accent}" opacity="0.8"/>
  ${textLines(body, { x: 96, y: bodyY, size: 34, fill: bodyFill, weight: 650, lineHeight: 54 })}
  <text x="96" y="${footerY}" font-size="28" font-weight="800" fill="${colors.accent}">${escapeXml(card.footer)}</text>
  <text x="${card.width - 152}" y="${footerY}" text-anchor="end" font-size="26" font-weight="900" fill="${colors.accent}">${String(index).padStart(2, "0")}</text>
</svg>`;
}

async function writeImageCards(drafts, slug) {
  if (!Array.isArray(drafts.imageCards)) return [];
  const outDir = path.join(root, "outputs", "cards", slug);
  await mkdir(outDir, { recursive: true });
  const written = [];
  for (const [index, card] of drafts.imageCards.entries()) {
    const fileName = `card-${String(index + 1).padStart(2, "0")}.svg`;
    const relativePath = path.join("outputs", "cards", slug, fileName).replace(/\\/g, "/");
    await writeFile(path.join(outDir, fileName), cardToSvg(card, index + 1), "utf8");
    written.push(relativePath);
  }
  await writeFile(path.join(outDir, "cards.json"), JSON.stringify({ cards: drafts.imageCards, files: written }, null, 2), "utf8");
  return written;
}

function toMarkdown(drafts) {
  return [
    "# AILO 마케팅 초안",
    "",
    "## Threads",
    "",
    ...drafts.threads.map((post, index) => `${index + 1}. ${post}`),
    "",
    "## 인스타그램",
    "",
    ...drafts.instagram.carousel.map((slide, index) => `### 카드 ${index + 1}: ${slide.title}\n\n${slide.body}\n`),
    "### 캡션",
    "",
    drafts.instagram.caption,
    "",
    drafts.instagram.hashtags.join(" "),
    "",
    "## 블로그",
    "",
    drafts.blog.body,
    "",
    "## 숏폼",
    "",
    `제목: ${drafts.shorts.title}`,
    "",
    `훅: ${drafts.shorts.hook ?? ""}`,
    "",
    "### 30초 대본",
    "",
    drafts.shorts.script30 ?? "",
    "",
    "### 60초 대본",
    "",
    drafts.shorts.script60 ?? "",
    "",
    ...drafts.shorts.scenes.map(
      (scene) =>
        `### ${scene.time}\n\n화면: ${scene.visual}\n\n자막: ${scene.subtitle}\n\n내레이션: ${scene.narration}\n`
    ),
    "### 화면 키워드",
    "",
    ...(drafts.shorts.onScreenKeywords ?? []).map((keyword) => `- ${keyword}`),
    "",
    "### B-roll 제안",
    "",
    ...(drafts.shorts.brollSuggestions ?? []).map((item) => `- ${item}`),
    "",
    `썸네일: ${drafts.shorts.thumbnailText ?? ""}`,
    "",
    "### 업로드 설명문",
    "",
    drafts.shorts.uploadDescription ?? "",
    "",
    (drafts.shorts.hashtags ?? []).join(" "),
    "",
    "## 이미지 카드",
    "",
    ...(drafts.imageCards ?? []).flatMap((card, index) => [
      `### 카드 ${index + 1}: ${card.eyebrow}`,
      "",
      card.headline,
      "",
      card.body,
      "",
      `Footer: ${card.footer}`,
      ""
    ])
  ].join("\n");
}

async function generateDrafts(brief) {
  if (useTemplateOnly) {
    return { drafts: buildDrafts(brief), source: "template" };
  }

  await loadDotEnv(path.join(root, ".env"));

  if (!process.env.OPENAI_API_KEY) {
    return { drafts: buildDrafts(brief), source: "template-no-api-key" };
  }

  try {
    const brandVoice = await readFile(path.join(root, "prompts", "brand_voice.md"), "utf8");
    const channelFormats = await readFile(path.join(root, "prompts", "channel_formats.md"), "utf8");
    const drafts = await createMarketingDraftWithOpenAI({ brief, brandVoice, channelFormats });
    return { drafts, source: `openai:${process.env.OPENAI_MODEL || "gpt-5"}` };
  } catch (error) {
    console.warn(`OpenAI generation failed: ${error.message}`);
    console.warn("Falling back to template generator.");
    return { drafts: buildDrafts(brief), source: "template-fallback" };
  }
}

const brief = await readFile(path.join(root, briefPath), "utf8");
const { drafts, source } = await generateDrafts(brief);
const slug = slugFromPath(briefPath);
const outDir = path.join(root, "outputs", "drafts");

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, `${slug}.json`), JSON.stringify(drafts, null, 2), "utf8");
await writeFile(path.join(outDir, `${slug}.md`), toMarkdown(drafts), "utf8");
const cardFiles = await writeImageCards(drafts, slug);

console.log(`Generation source: ${source}`);
console.log(`Drafts generated: outputs/drafts/${slug}.json`);
console.log(`Drafts generated: outputs/drafts/${slug}.md`);
for (const cardFile of cardFiles) console.log(`Image card generated: ${cardFile}`);
