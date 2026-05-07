import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const explicitFile = args.find((arg) => !arg.startsWith("--"));
const channelArg = args.find((arg) => arg.startsWith("--channels="));
const requestedChannels = channelArg
  ? channelArg.replace("--channels=", "").split(",").map((item) => item.trim()).filter(Boolean)
  : ["threads", "instagram", "blog", "shorts"];

const approvedDir = path.join(root, "outputs", "approved");
const analyticsDir = path.join(root, "analytics");

async function latestApprovedJson() {
  const files = (await readdir(approvedDir))
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No approved JSON drafts found. Run src/approve_draft.js first.");
  }

  return path.join(approvedDir, files.at(-1));
}

function formatThreads(drafts) {
  return drafts.threads.map((post, index) => ({
    postNumber: index + 1,
    text: post
  }));
}

function formatInstagram(drafts) {
  return {
    carousel: drafts.instagram.carousel.map((slide, index) => ({
      slideNumber: index + 1,
      title: slide.title,
      body: slide.body
    })),
    caption: drafts.instagram.caption,
    hashtags: drafts.instagram.hashtags
  };
}

function formatBlog(drafts) {
  return {
    title: drafts.blog.title,
    metaDescription: drafts.blog.metaDescription,
    body: drafts.blog.body
  };
}

function formatShorts(drafts) {
  return {
    title: drafts.shorts.title,
    duration: drafts.shorts.duration,
    scenes: drafts.shorts.scenes
  };
}

function buildDryRunPlan({ drafts, channels, sourceFile }) {
  const plan = {
    mode: "dry-run",
    sourceFile,
    createdAt: new Date().toISOString(),
    channels: {}
  };

  if (channels.includes("threads")) plan.channels.threads = formatThreads(drafts);
  if (channels.includes("instagram")) plan.channels.instagram = formatInstagram(drafts);
  if (channels.includes("blog")) plan.channels.blog = formatBlog(drafts);
  if (channels.includes("shorts")) plan.channels.shorts = formatShorts(drafts);

  return plan;
}

function toMarkdown(plan) {
  const lines = [
    "# AILO Publishing Dry Run",
    "",
    `Source: ${plan.sourceFile}`,
    `Created: ${plan.createdAt}`,
    ""
  ];

  if (plan.channels.threads) {
    lines.push("## Threads", "");
    for (const post of plan.channels.threads) {
      lines.push(`${post.postNumber}. ${post.text}`, "");
    }
  }

  if (plan.channels.instagram) {
    lines.push("## Instagram", "");
    for (const slide of plan.channels.instagram.carousel) {
      lines.push(`### Slide ${slide.slideNumber}: ${slide.title}`, "", slide.body, "");
    }
    lines.push("### Caption", "", plan.channels.instagram.caption, "", plan.channels.instagram.hashtags.join(" "), "");
  }

  if (plan.channels.blog) {
    lines.push("## Blog", "", `Title: ${plan.channels.blog.title}`, "", plan.channels.blog.body, "");
  }

  if (plan.channels.shorts) {
    lines.push("## Shorts", "", `Title: ${plan.channels.shorts.title}`, `Duration: ${plan.channels.shorts.duration}`, "");
    for (const scene of plan.channels.shorts.scenes) {
      lines.push(`### ${scene.time}`, "", `Visual: ${scene.visual}`, `Subtitle: ${scene.subtitle}`, `Narration: ${scene.narration}`, "");
    }
  }

  return lines.join("\n");
}

const inputFile = explicitFile ? path.join(root, explicitFile) : await latestApprovedJson();
const sourceName = path.basename(inputFile, ".json");
const drafts = JSON.parse(await readFile(inputFile, "utf8"));
const plan = buildDryRunPlan({
  drafts,
  channels: requestedChannels,
  sourceFile: path.relative(root, inputFile).replaceAll("\\", "/")
});

await mkdir(analyticsDir, { recursive: true });
await writeFile(path.join(analyticsDir, `${sourceName}.dry-run.json`), JSON.stringify(plan, null, 2), "utf8");
await writeFile(path.join(analyticsDir, `${sourceName}.dry-run.md`), toMarkdown(plan), "utf8");

console.log(`Dry-run plan written: analytics/${sourceName}.dry-run.json`);
console.log(`Dry-run plan written: analytics/${sourceName}.dry-run.md`);
