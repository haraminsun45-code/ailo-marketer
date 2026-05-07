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
        "You are AILO's marketing content strategist.",
        "Create practical, field-oriented Korean marketing drafts for freight drivers and transportation companies.",
        "AILO is not a chatbot. AILO is an operational AI co-driver and workflow assistant.",
        "Avoid exaggerated AI claims. Avoid unsafe driving implications. Keep copy calm, short, and realistic.",
        "Return only valid JSON that matches the requested structure."
      ].join("\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Create channel-ready AILO marketing drafts from this brief.",
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
                required: ["title", "duration", "scenes"],
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
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
                  }
                }
              }
            }
          }
        }
      }
    })
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
