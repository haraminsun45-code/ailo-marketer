import { spawn } from "node:child_process";
import path from "node:path";
import { loadCalendar, selectCalendarItem, slugFromBriefPath, updateCalendarItem } from "./calendar_utils.js";

const root = process.cwd();
const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith("--date="));
const dayArg = args.find((arg) => arg.startsWith("--day="));
const calendarArg = args.find((arg) => arg.startsWith("--calendar="));
const templateFlag = args.includes("--template");
const approveFlag = args.includes("--approve");
const draftOnly = args.includes("--draft-only") || !approveFlag;

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: root,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptPath} exited with code ${code}`));
    });
  });
}

const { filePath: calendarPath, file: calendarFile } = await loadCalendar(root, calendarArg?.replace("--calendar=", ""));
const item = selectCalendarItem(calendarFile.calendar, {
  day: dayArg?.replace("--day=", ""),
  date: dateArg?.replace("--date=", "")
});

if (!item) {
  throw new Error("No matching calendar item found.");
}

const slug = slugFromBriefPath(item.briefPath);
const draftJsonPath = `outputs/drafts/${slug}.json`;
const approvedJsonPath = `outputs/approved/${slug}.json`;
const channels = item.channels.join(",");

console.log(`Daily pipeline item: Day ${item.day} / ${item.date}`);
console.log(`Title: ${item.title}`);
console.log(`Channels: ${channels}`);
console.log(`Approval mode: ${approveFlag ? "approve-and-dry-run" : "draft-only-human-review"}`);

const draftArgs = [item.briefPath];
if (templateFlag) draftArgs.push("--template");

await runNodeScript(path.join("src", "generate_drafts.js"), draftArgs);

if (!draftOnly) {
  await runNodeScript(path.join("src", "approve_draft.js"), [draftJsonPath]);
  await runNodeScript(path.join("src", "publish_dry_run.js"), [approvedJsonPath, `--channels=${channels}`]);
} else {
  console.log("Human review required before approval or publishing dry run.");
}

const outputs = {
  draftJson: `outputs/drafts/${slug}.json`,
  draftMd: `outputs/drafts/${slug}.md`
};

if (!draftOnly) {
  outputs.approvedJson = `outputs/approved/${slug}.json`;
  outputs.approvedMd = `outputs/approved/${slug}.md`;
  outputs.dryRunJson = `analytics/${slug}.dry-run.json`;
  outputs.dryRunMd = `analytics/${slug}.dry-run.md`;
}

const nextStatus = draftOnly ? "draft_ready" : "dry_run_ready";
await updateCalendarItem(root, calendarPath, calendarFile, item, {
  status: nextStatus,
  lastRunMode: templateFlag ? "template" : "openai-or-template-fallback",
  lastRunChannels: item.channels,
  outputs
});
console.log(`Calendar status updated: Day ${item.day} -> ${nextStatus}`);
