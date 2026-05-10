import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function slugFromBriefPath(briefPath) {
  return path.basename(briefPath, path.extname(briefPath)).replace(/^\d+-/, "");
}

export async function latestCalendarPath(root, explicitCalendarPath) {
  if (explicitCalendarPath) {
    return path.join(root, explicitCalendarPath);
  }

  const files = (await readdir(path.join(root, "content_calendar")))
    .filter((file) => file.endsWith("-calendar.json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No calendar file found. Run src/generate_calendar.js first.");
  }

  return path.join(root, "content_calendar", files.at(-1));
}

export async function loadCalendar(root, explicitCalendarPath) {
  const filePath = await latestCalendarPath(root, explicitCalendarPath);
  const file = JSON.parse(await readFile(filePath, "utf8"));
  return { filePath, file };
}

export async function saveCalendar(root, filePath, file) {
  const normalizedPath = path.resolve(filePath);
  if (!normalizedPath.startsWith(path.resolve(root))) {
    throw new Error("Calendar path is outside the project root.");
  }

  await writeFile(normalizedPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export function selectCalendarItem(calendar, { day, date }) {
  if (day !== undefined) {
    return calendar.find((item) => item.day === Number(day));
  }

  const requestedDate = date ?? todayIsoDate();
  return calendar.find((item) => item.date === requestedDate) ?? calendar.find((item) => item.status === "planned");
}

export async function updateCalendarItem(root, filePath, file, selectedItem, patch) {
  const index = file.calendar.findIndex((item) => item.day === selectedItem.day && item.date === selectedItem.date);
  if (index === -1) {
    throw new Error("Selected calendar item is no longer present.");
  }

  file.calendar[index] = {
    ...file.calendar[index],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  await saveCalendar(root, filePath, file);
  return file.calendar[index];
}
