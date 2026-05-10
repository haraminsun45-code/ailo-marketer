import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--")) ?? "how-ocr-can-reduce-consignment-input-work";
const draftPath = path.join(root, "outputs", "drafts", `${slug}.json`);
const outDir = path.join(root, "outputs", "card-variants", slug);

const draft = JSON.parse(await readFile(draftPath, "utf8"));

const copy = {
  title: draft.blog?.title ?? "화물 운송 업무를 더 신뢰 있게 기록하는 방법",
  pain:
    draft.threads?.[1] ??
    "기사님과 운영자는 운행 중에도 기록, 사진, 위치, 보고를 반복해서 챙겨야 합니다.",
  angle:
    draft.blog?.metaDescription ??
    "AILO는 기사님 중심의 AI 업무 보조와 팀 기반 신뢰 시스템을 운송 흐름 안에 연결합니다."
};

const variants = [
  {
    id: "01-driver-trust",
    name: "Driver Trust",
    format: "1080x1350",
    bg: "#f4f6f3",
    ink: "#1d2824",
    muted: "#63716b",
    accent: "#16735d",
    panel: "#ffffff",
    label: "기사님 중심",
    headline: "운행은 기사님이, 기록 흐름은 AILO가 보조합니다",
    body: copy.pain,
    footer: "현실적인 화물 운송 업무 보조"
  },
  {
    id: "02-team-brand",
    name: "Team Brand",
    format: "1080x1350",
    bg: "#14261f",
    ink: "#f8fbf8",
    muted: "#c9d8d2",
    accent: "#b8dcce",
    panel: "#1e3a31",
    label: "팀 자체가 브랜드",
    headline: "부산 야간 냉동팀처럼 신뢰가 보이는 팀",
    body: "기사 12명 · 평점 4.9 · 무사고 280일 · 심야배송 특화\n팀의 운행 기록이 곧 팀의 명성이 됩니다.",
    footer: "검증된 팀 기반 운송 네트워크"
  },
  {
    id: "03-control-tower",
    name: "Control Tower",
    format: "1080x1350",
    bg: "#f7f9fb",
    ink: "#17212b",
    muted: "#637184",
    accent: "#2c62a3",
    panel: "#ffffff",
    label: "실시간 GPS 관제",
    headline: "위치, 기록, 팀 상태를 한 흐름으로 봅니다",
    body: "운행 위치와 업무 로그가 분리되면 운영 판단이 늦어집니다.\nAILO는 팀 단위 운송 흐름을 더 명확하게 보여줍니다.",
    footer: "운송사와 기사님 모두를 위한 가시성"
  },
  {
    id: "04-reputation-data",
    name: "Reputation Data",
    format: "1080x1350",
    bg: "#fffaf0",
    ink: "#241f18",
    muted: "#6f675c",
    accent: "#9b6b16",
    panel: "#ffffff",
    label: "명성 경제",
    headline: "신뢰는 말보다 기록으로 쌓입니다",
    body: "평점, 무사고 기간, 정시율, 특화 운송 이력.\n좋은 팀의 경험이 데이터로 남고 다시 기회가 됩니다.",
    footer: "팀의 실력이 시장에서 보이게"
  },
  {
    id: "05-vehicle-identity",
    name: "Vehicle Identity",
    format: "1080x1350",
    bg: "#f3f2f6",
    ink: "#211f2a",
    muted: "#6a6575",
    accent: "#6d5ea8",
    panel: "#ffffff",
    label: "차량 커스터마이징",
    headline: "차량과 팀의 전문성이 하나의 프로필이 됩니다",
    body: "냉동, 야간, 장거리, 정밀 배송처럼 팀과 차량의 강점이 명확하게 보이면 더 맞는 운송이 연결됩니다.",
    footer: "과한 게임화가 아니라 현실적인 정체성"
  },
  {
    id: "06-cafe-wide",
    name: "Cafe Wide",
    format: "1200x675",
    bg: "#ffffff",
    ink: "#17221e",
    muted: "#5f6c66",
    accent: "#b45445",
    panel: "#f5f7f4",
    label: "화물차 기사님께",
    headline: copy.title,
    body: "이건 우리를 위한 AI다. 기사님의 운행 경험과 팀의 신뢰가 기록으로 남는 운송 플랫폼.",
    footer: "네이버 카페 와이드형"
  }
];

function dims(format) {
  const [width, height] = format.split("x").map(Number);
  return { width, height };
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

function textBlock(lines, { x, y, size, fill, weight = 700, lineHeight }) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`
    )
    .join("\n");
}

function svgFor(variant) {
  const { width, height } = dims(variant.format);
  const isWide = width > height;
  const margin = isWide ? 54 : 70;
  const innerWidth = width - margin * 2;
  const headlineSize = isWide ? 58 : 70;
  const bodySize = isWide ? 28 : 34;
  const headlineMax = isWide ? 18 : 13;
  const bodyMax = isWide ? 34 : 24;
  const headline = wrapText(variant.headline, headlineMax).slice(0, isWide ? 3 : 5);
  const body = wrapText(variant.body, bodyMax).slice(0, isWide ? 4 : 8);
  const labelY = margin + 70;
  const headlineY = isWide ? margin + 180 : margin + 285;
  const bodyY = isWide ? margin + 392 : margin + 800;
  const footerY = height - margin - 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${variant.bg}"/>
  <rect x="${margin}" y="${margin}" width="${innerWidth}" height="${height - margin * 2}" rx="30" fill="${variant.panel}" stroke="${variant.accent}" stroke-width="3"/>
  <circle cx="${width - margin - 58}" cy="${margin + 58}" r="28" fill="${variant.accent}"/>
  <text x="${width - margin - 58}" y="${margin + 68}" text-anchor="middle" font-size="24" font-weight="900" fill="${variant.bg}">A</text>
  <text x="${margin + 38}" y="${labelY}" font-size="${isWide ? 26 : 30}" font-weight="900" letter-spacing="5" fill="${variant.accent}">${escapeXml(variant.label)}</text>
  ${textBlock(headline, { x: margin + 38, y: headlineY, size: headlineSize, fill: variant.ink, weight: 900, lineHeight: headlineSize + 16 })}
  <rect x="${margin + 38}" y="${bodyY - 66}" width="${innerWidth - 76}" height="2" fill="${variant.accent}" opacity="0.7"/>
  ${textBlock(body, { x: margin + 38, y: bodyY, size: bodySize, fill: variant.muted, weight: 650, lineHeight: bodySize + 20 })}
  <text x="${margin + 38}" y="${footerY}" font-size="${isWide ? 24 : 28}" font-weight="800" fill="${variant.accent}">${escapeXml(variant.footer)}</text>
  <text x="${width - margin - 38}" y="${footerY}" text-anchor="end" font-size="${isWide ? 22 : 24}" font-weight="900" fill="${variant.accent}">${escapeXml(variant.name)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
const files = [];
for (const variant of variants) {
  const filePath = path.join(outDir, `${variant.id}.svg`);
  await writeFile(filePath, svgFor(variant), "utf8");
  files.push(path.relative(root, filePath).replace(/\\/g, "/"));
}

await writeFile(path.join(outDir, "variants.json"), JSON.stringify({ slug, variants, files }, null, 2), "utf8");

console.log(`Card variants generated: ${outDir}`);
for (const file of files) console.log(file);
