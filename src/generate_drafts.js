import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createMarketingDraftWithOpenAI, loadDotEnv } from "./openai_client.js";

const root = process.cwd();
const args = process.argv.slice(2);
const useTemplateOnly = args.includes("--template");
const briefPath = args.find((arg) => !arg.startsWith("--")) ?? "content_briefs/001-driver-worklog-automation.md";

function slugFromPath(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/^\d+-/, "");
}

function extractSection(markdown, title) {
  const pattern = new RegExp(`## ${title}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  return markdown.match(pattern)?.[1]?.trim() ?? "";
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

function buildDrafts(brief) {
  const coreMessage = compact(extractSection(brief, "Core Message"));
  const problem = compact(extractSection(brief, "Problem"));
  const angle = compact(extractSection(brief, "AILO Angle"));
  const proofPoints = extractSection(brief, "Proof Points")
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
  const cta = compact(extractSection(brief, "CTA"));

  return {
    threads: [
      "Freight operations still ask drivers to manage too many records while they are working.",
      problem,
      "Loading, unloading, calls, documents, and completion reports often sit in separate manual steps.",
      coreMessage,
      angle,
      "AILO's rule is simple: automate low-risk logs, then ask the driver only when confirmation matters.",
      cta
    ].filter(Boolean),
    instagram: {
      carousel: [
        {
          title: "Drivers should record less",
          body: "Freight work already requires driving, loading, unloading, and communication."
        },
        {
          title: "Manual logs create friction",
          body: "Work logs, consignment checks, calls, and photos often force repeated screen interaction."
        },
        {
          title: "AILO follows the workflow",
          body: "Clock-in, movement, loading, unloading, and completion can become one operational timeline."
        },
        {
          title: "Confirm only what matters",
          body: "Cargo verification, OCR uncertainty, and destination mismatch should still ask for driver confirmation."
        },
        {
          title: "Driving stays first",
          body: "AILO handles repetitive workflow records so drivers can focus on the road and cargo."
        }
      ],
      caption:
        "Freight operations still rely on repetitive manual records. AILO is building a hands-free workflow assistant that automates low-risk logs and asks for confirmation only when operational verification matters.",
      hashtags: ["#AILO", "#LogisticsAI", "#FreightTech", "#WorkflowAutomation", "#Transportation", "#DriverSafety"]
    },
    blog: {
      title: "Why Freight Work Logs Should Be Automated",
      metaDescription:
        "A practical look at freight workflow logging, driver screen fatigue, and AILO's approach to hands-free operation records.",
      body: [
        "# Why Freight Work Logs Should Be Automated",
        "",
        "Freight operations do not only depend on trucks and routes. They also depend on repeated records: clock-in, movement, loading, unloading, reports, consignment checks, and completion history.",
        "",
        "## The Operational Problem",
        "",
        problem,
        "",
        "These small steps create fatigue for drivers and incomplete visibility for transportation companies.",
        "",
        "## AILO's Approach",
        "",
        coreMessage,
        "",
        angle,
        "",
        "## Automation With Confirmation",
        "",
        "AILO should not automate every decision. Low-risk events such as timestamps, workflow transitions, and operation history can be processed automatically. Verification-sensitive moments such as cargo mismatch, OCR uncertainty, and unloading confirmation should ask the driver.",
        "",
        "## Expected Impact",
        "",
        ...proofPoints.map((point) => `- ${point}`),
        "",
        "The goal is not to add more buttons to a logistics app. The goal is to reduce unnecessary interaction inside real freight workflows.",
        "",
        cta
      ].join("\n")
    },
    shorts: {
      title: "Why freight work logs need automation",
      duration: "35-45 seconds",
      scenes: [
        {
          time: "0-3s",
          visual: "Driver seat with paperwork and phone notifications",
          subtitle: "Freight work has a hidden burden",
          narration: "Freight drivers do more than drive. They also record the workflow."
        },
        {
          time: "3-10s",
          visual: "Loading, unloading, calls, and manual log entry",
          subtitle: "Loading. Unloading. Calls. Logs.",
          narration: "Each step often becomes another manual input."
        },
        {
          time: "10-22s",
          visual: "A workflow timeline fills automatically",
          subtitle: "AILO records the operational flow",
          narration: "AILO is designed to record low-risk workflow events automatically."
        },
        {
          time: "22-34s",
          visual: "Cargo verification prompt appears",
          subtitle: "Important checks still need confirmation",
          narration: "When cargo verification matters, AILO asks the driver clearly and briefly."
        },
        {
          time: "34-45s",
          visual: "Truck driving with a completed work log",
          subtitle: "Drivers focus on driving. AILO handles the workflow.",
          narration: "Drivers focus on driving. AILO handles the workflow."
        }
      ]
    }
  };
}

function toMarkdown(drafts) {
  return [
    "# Generated AILO Marketing Draft",
    "",
    "## Threads",
    "",
    ...drafts.threads.map((post, index) => `${index + 1}. ${post}`),
    "",
    "## Instagram",
    "",
    ...drafts.instagram.carousel.map((slide, index) => `### Slide ${index + 1}: ${slide.title}\n\n${slide.body}\n`),
    "### Caption",
    "",
    drafts.instagram.caption,
    "",
    drafts.instagram.hashtags.join(" "),
    "",
    "## Blog",
    "",
    drafts.blog.body,
    "",
    "## Shorts",
    "",
    `Title: ${drafts.shorts.title}`,
    "",
    ...drafts.shorts.scenes.map(
      (scene) =>
        `### ${scene.time}\n\nVisual: ${scene.visual}\n\nSubtitle: ${scene.subtitle}\n\nNarration: ${scene.narration}\n`
    )
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

console.log(`Generation source: ${source}`);
console.log(`Drafts generated: outputs/drafts/${slug}.json`);
console.log(`Drafts generated: outputs/drafts/${slug}.md`);
