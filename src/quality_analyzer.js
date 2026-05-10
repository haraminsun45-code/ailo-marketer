const brandTerms = ["AILO", "업무", "운송", "화물", "운전", "기록", "검증", "흐름", "상차", "하차"];
const aiRiskTerms = ["혁신적인", "완벽한", "놀라운", "최고의", "무조건", "모든 문제", "AI가 알아서"];
const ctaTerms = ["AILO", "확인", "시작", "문의", "만들고", "집중", "처리"];

function sentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?。！？])\s+|[.!?。！？]\s*/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function countMatches(text, terms) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

function repetitionRatio(text) {
  const list = sentences(text).map((sentence) => sentence.toLowerCase());
  if (list.length === 0) return 0;

  const normalized = list.map((sentence) =>
    sentence
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .split(/\s+/)
      .slice(0, 12)
      .join(" ")
  );
  const unique = new Set(normalized);
  return clamp(((normalized.length - unique.size) / normalized.length) * 100);
}

function readingDifficulty(text) {
  const list = sentences(text);
  if (list.length === 0) return "낮음";

  const avgLength = list.reduce((sum, sentence) => sum + sentence.length, 0) / list.length;
  if (avgLength < 55) return "낮음";
  if (avgLength < 95) return "보통";
  return "높음";
}

function channelFit(text, channels = []) {
  const fits = {};
  for (const channel of channels) {
    if (channel === "threads") {
      const threadCount = (text.match(/^\d+\./gm) || []).length;
      fits[channel] = threadCount >= 5 && threadCount <= 8 ? "높음" : "보통";
    } else if (channel === "instagram") {
      const slideCount = (text.match(/Slide|슬라이드|카드|###/g) || []).length;
      fits[channel] = slideCount >= 4 ? "높음" : "보통";
    } else if (channel === "blog") {
      const headings = (text.match(/^##\s/gm) || []).length;
      fits[channel] = text.length > 900 && headings >= 2 ? "높음" : "보통";
    } else if (channel === "shorts") {
      const scenes = (text.match(/\d+-\d+s|초|Narration|내레이션|장면/g) || []).length;
      fits[channel] = scenes >= 4 ? "높음" : "보통";
    }
  }
  return fits;
}

export function analyzeContentQuality({ text, channels }) {
  const safeText = typeof text === "string" ? text : JSON.stringify(text ?? "");
  const lengthScore = safeText.length > 700 ? 30 : safeText.length > 350 ? 22 : 12;
  const headingScore = Math.min((safeText.match(/^##\s/gm) || []).length * 8, 24);
  const keywordScore = Math.min(countMatches(safeText, brandTerms) * 5, 30);
  const ctaScore = countMatches(safeText.slice(-500), ctaTerms) > 0 ? 16 : 0;
  const seoScore = clamp(lengthScore + headingScore + keywordScore + ctaScore);

  const brandTone = clamp(58 + countMatches(safeText, brandTerms) * 5 - countMatches(safeText, aiRiskTerms) * 8);
  const repeatRatio = repetitionRatio(safeText);
  const aiRisk = clamp(countMatches(safeText, aiRiskTerms) * 18 + Math.max(0, repeatRatio - 18));
  const ctaMissing = countMatches(safeText.slice(-700), ctaTerms) === 0;

  return {
    seoScore,
    brandTone,
    repetitionRatio: repeatRatio,
    aiRisk,
    readingDifficulty: readingDifficulty(safeText),
    channelFit: channelFit(safeText, channels),
    ctaMissing
  };
}
