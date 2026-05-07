import { access } from "node:fs/promises";
import path from "node:path";

const requiredPaths = [
  "README.md",
  "package.json",
  ".env.example",
  ".devcontainer/devcontainer.json",
  "content_briefs/001-driver-worklog-automation.md",
  "prompts/brand_voice.md",
  "prompts/channel_formats.md",
  "docs/operation_playbook.md",
  "docs/api_publishing_notes.md",
  "docs/codespaces_setup.md",
  "src/generate_drafts.js",
  "src/approve_draft.js",
  "src/publish_dry_run.js",
  "src/openai_client.js",
  "src/check_structure.js",
  "publishers/README.md",
  "analytics/README.md",
  "outputs/drafts/.gitkeep",
  "outputs/approved/.gitkeep"
];

const missing = [];

for (const item of requiredPaths) {
  try {
    await access(path.join(process.cwd(), item));
  } catch {
    missing.push(item);
  }
}

if (missing.length > 0) {
  console.error("Missing required paths:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Structure check passed.");
