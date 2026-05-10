import { readFile } from "node:fs/promises";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export async function loadDotEnv(filePath = ".env") {
  try {
    const raw = await readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export async function createMarketingDraftWithOpenAI({ brief, brandVoice, channelFormats }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-5";
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: [
        "당신은 AILO의 마케팅 콘텐츠 전략가입니다.",
        "모든 콘텐츠 본문, 제목, 장면 설명, 자막, 내레이션, 캡션, 메타 설명, 해시태그는 한국어로 작성합니다.",
        "예외적으로 브랜드명 AILO와 플랫폼명 Threads, Instagram, Shorts는 그대로 사용할 수 있습니다.",
        "AILO는 챗봇이 아니라 화물 운송 업무 흐름을 돕는 운영 assistant입니다.",
        "과장된 AI 표현과 위험한 운전 암시를 피합니다. 문장은 차분하고 짧고 실무적으로 작성합니다.",
        "요청한 구조와 일치하는 유효한 JSON만 반환합니다."
      ].join("\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "아래 브리프를 바탕으로 채널별 AILO 마케팅 초안을 작성하세요.",
                "모든 탭에 표시될 내용은 한국어여야 합니다.",
                "영어 문장이 브리프에 포함되어 있어도 한국어로 자연스럽게 재작성하세요.",
                "",
                "BRAND VOICE:",
                brandVoice,
                "",
                "CHANNEL FORMATS:",
                channelFormats,
                "",
                "BRIEF:",
                brief
              ].join("\n")
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ailo_marketing_drafts",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["threads", "instagram", "blog", "shorts"],
            properties: {
              threads: {
                type: "array",
                minItems: 5,
                maxItems: 8,
                items: { type: "string" }
              },
              instagram: {
                type: "object",
                additionalProperties: false,
                required: ["carousel", "caption", "hashtags"],
                properties: {
                  carousel: {
                    type: "array",
                    minItems: 5,
                    maxItems: 7,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["title", "body"],
                      properties: {
                        title: { type: "string" },
                        body: { type: "string" }
                      }
                    }
                  },
                  caption: { type: "string" },
                  hashtags: {
                    type: "array",
                    minItems: 5,
                    maxItems: 10,
                    items: { type: "string" }
                  }
                }
              },
              blog: {
                type: "object",
                additionalProperties: false,
                required: ["title", "metaDescription", "body"],
                properties: {
                  title: { type: "string" },
                  metaDescription: { type: "string" },
                  body: { type: "string" }
                }
              },
              shorts: {
                type: "object",
                additionalProperties: false,
                required: [
                  "title",
                  "duration",
                  "hook",
                  "script30",
                  "script60",
                  "scenes",
                  "onScreenKeywords",
                  "brollSuggestions",
                  "thumbnailText",
                  "uploadDescription",
                  "hashtags"
                ],
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
                  hook: { type: "string" },
                  script30: { type: "string" },
                  script60: { type: "string" },
                  scenes: {
                    type: "array",
                    minItems: 4,
                    maxItems: 6,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["time", "visual", "subtitle", "narration"],
                      properties: {
                        time: { type: "string" },
                        visual: { type: "string" },
                        subtitle: { type: "string" },
                        narration: { type: "string" }
                      }
                    }
                  },
                  onScreenKeywords: {
                    type: "array",
                    minItems: 4,
                    maxItems: 8,
                    items: { type: "string" }
                  },
                  brollSuggestions: {
                    type: "array",
                    minItems: 4,
                    maxItems: 8,
                    items: { type: "string" }
                  },
                  thumbnailText: { type: "string" },
                  uploadDescription: { type: "string" },
                  hashtags: {
                    type: "array",
                    minItems: 5,
                    maxItems: 10,
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    })
  }).catch((error) => {
    const cause = error.cause?.message ? ` (${error.cause.message})` : "";
    throw new Error(`OpenAI network request failed${cause}.`);
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? `OpenAI API request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const text = payload.output_text;
  if (!text) {
    throw new Error("OpenAI response did not include output_text.");
  }

  return JSON.parse(text);
}

export async function testOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      model: process.env.OPENAI_MODEL || "gpt-5",
      message: "OPENAI_API_KEY is not set."
    };
  }

  const model = process.env.OPENAI_MODEL || "gpt-5";
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: "Reply with exactly: AILO_OPENAI_OK"
    })
  }).catch((error) => {
    const cause = error.cause?.message ? ` (${error.cause.message})` : "";
    throw new Error(`OpenAI network request failed${cause}.`);
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      model,
      message: payload?.error?.message ?? `OpenAI API request failed with status ${response.status}.`
    };
  }

  return {
    ok: true,
    model,
    message: payload?.output_text || "OpenAI connection succeeded."
  };
}
