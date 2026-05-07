import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const input = process.argv[2] ?? "outputs/drafts/driver-worklog-automation.json";
const draftPath = path.join(root, input);
const parsed = path.parse(draftPath);
const markdownPath = path.join(parsed.dir, `${parsed.name}.md`);
const approvedDir = path.join(root, "outputs", "approved");

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(approvedDir, { recursive: true });
await copyFile(draftPath, path.join(approvedDir, `${parsed.name}.json`));

if (await exists(markdownPath)) {
  await copyFile(markdownPath, path.join(approvedDir, `${parsed.name}.md`));
}

console.log(`Approved draft copied: outputs/approved/${parsed.name}.json`);
