import { spawn } from "node:child_process";
import path from "node:path";
import { loadCalendar, selectCalendarItem, slugFromBriefPath, updateCalendarItem } from "./calendar_utils.js";

const root = process.cwd();
const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith("--date="));
const dayArg = args.find((arg) => arg.startsWith("--day="));
const calendarArg = args.find((arg) => arg.startsWith("--calendar="));
const templateFlag = args.includes("--template");

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

console.log(`Selected calendar item: Day ${item.day} / ${item.date}`);
console.log(`Title: ${item.title}`);
console.log(`Channels: ${item.channels.join(", ")}`);
console.log(`Brief: ${item.briefPath}`);

const draftArgs = [item.briefPath];
if (templateFlag) draftArgs.push("--template");

await runNodeScript(path.join("src", "generate_drafts.js"), draftArgs);

const slug = slugFromBriefPath(item.briefPath);
await updateCalendarItem(root, calendarPath, calendarFile, item, {
  status: "draft_ready",
  lastRunMode: templateFlag ? "template" : "openai-or-template-fallback",
  outputs: {
    draftJson: `outputs/drafts/${slug}.json`,
    draftMd: `outputs/drafts/${slug}.md`
  }
});
console.log(`Calendar status updated: Day ${item.day} -> draft_ready`);
