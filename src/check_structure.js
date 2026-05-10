import { access } from "node:fs/promises";
import path from "node:path";

const requiredPaths = [
  "README.md",
  "package.json",
  ".env.example",
  "start-dashboard.bat",
  "start-dashboard.ps1",
  ".devcontainer/devcontainer.json",
  "field_logs/sample-operations.json",
  "insights/.gitkeep",
  "content_calendar/.gitkeep",
  "content_briefs/001-driver-worklog-automation.md",
  "prompts/brand_voice.md",
  "prompts/channel_formats.md",
  "docs/operation_playbook.md",
  "docs/api_publishing_notes.md",
  "docs/codespaces_setup.md",
  "src/calendar_utils.js",
  "src/analyze_field_logs.js",
  "src/promote_insights.js",
  "src/generate_calendar.js",
  "src/run_calendar_item.js",
  "src/run_daily_pipeline.js",
  "src/generate_drafts.js",
  "src/server.js",
  "src/quality_analyzer.js",
  "src/approve_draft.js",
  "src/publish_dry_run.js",
  "src/openai_client.js",
  "src/check_structure.js",
  "publishers/README.md",
  "analytics/README.md",
  "outputs/drafts/.gitkeep",
  "outputs/approved/.gitkeep",
  "web/index.html",
  "web/styles.css",
  "web/app.js"
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
