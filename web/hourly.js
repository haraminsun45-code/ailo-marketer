const STORAGE_KEY = "hourly-work-log-v2";
const DEFAULT_RATE = 10800;
const STANDARD_DAILY_HOURS = 8;
const STANDARD_WEEKLY_HOURS = 40;
const NIGHT_START = 22;
const NIGHT_END = 6;

const els = {
  monthInput: document.querySelector("#monthInput"),
  dateInput: document.querySelector("#dateInput"),
  jobInput: document.querySelector("#jobInput"),
  startInput: document.querySelector("#startInput"),
  endInput: document.querySelector("#endInput"),
  breakInput: document.querySelector("#breakInput"),
  rateInput: document.querySelector("#rateInput"),
  adjustInput: document.querySelector("#adjustInput"),
  deductionInput: document.querySelector("#deductionInput"),
  weeklyHolidayInput: document.querySelector("#weeklyHolidayInput"),
  allowanceInput: document.querySelector("#allowanceInput"),
  memoInput: document.querySelector("#memoInput"),
  entryForm: document.querySelector("#entryForm"),
  calendarGrid: document.querySelector("#calendarGrid"),
  recordList: document.querySelector("#recordList"),
  totalHours: document.querySelector("#totalHours"),
  totalPay: document.querySelector("#totalPay"),
  weeklyPay: document.querySelector("#weeklyPay"),
  yearlyPay: document.querySelector("#yearlyPay"),
  netPay: document.querySelector("#netPay"),
  workDays: document.querySelector("#workDays"),
  clearMonthBtn: document.querySelector("#clearMonthBtn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn")
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthFromDate(date) {
  return date.slice(0, 7);
}

function money(value) {
  return `${new Intl.NumberFormat("ko-KR").format(Math.round(value))}원`;
}

function hours(value) {
  return `${Number(value.toFixed(2))}시간`;
}

function timeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToHours(minutes) {
  return minutes / 60;
}

function isWeekday(dateString) {
  const day = new Date(`${dateString}T00:00:00`).getDay();
  return day >= 1 && day <= 5;
}

function calculateWorkedHours({ start, end, breakMinutes, adjustHours }) {
  let startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;

  const rawMinutes = Math.max(0, endMinutes - startMinutes);
  const paidMinutes = Math.max(0, rawMinutes - Number(breakMinutes || 0));
  return Math.max(0, minutesToHours(paidMinutes) + Number(adjustHours || 0));
}

function calculateNightHours({ start, end, breakMinutes }) {
  let startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;

  let nightMinutes = 0;
  for (let minute = startMinutes; minute < endMinutes; minute += 15) {
    const hour = Math.floor((minute % (24 * 60)) / 60);
    if (hour >= NIGHT_START || hour < NIGHT_END) nightMinutes += 15;
  }

  const breakShare = Math.min(nightMinutes, Number(breakMinutes || 0));
  return minutesToHours(Math.max(0, nightMinutes - breakShare));
}

function calculatePay(record) {
  const basePay = record.finalHours * record.rate;
  const overtimeHours = Math.max(0, record.finalHours - STANDARD_DAILY_HOURS);
  const nightHours = record.includeAllowance ? record.nightHours : 0;
  const overtimeExtra = record.includeAllowance ? overtimeHours * record.rate * 0.5 : 0;
  const nightExtra = record.includeAllowance ? nightHours * record.rate * 0.5 : 0;
  return basePay + overtimeExtra + nightExtra;
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function selectedMonthRecords() {
  const month = els.monthInput.value;
  return loadRecords()
    .filter((record) => monthFromDate(record.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function summarize(records) {
  const totalHours = records.reduce((sum, record) => sum + record.finalHours, 0);
  const grossPay = records.reduce((sum, record) => sum + calculatePay(record), 0);
  const weeklyHolidayPay = shouldAddWeeklyHoliday(records) ? estimateWeeklyHolidayPay(records) : 0;
  const monthlyPay = grossPay + weeklyHolidayPay;
  const deductionRate = Number(els.deductionInput.value || 0) / 100;
  const netPay = monthlyPay * (1 - deductionRate);
  const weeklyPay = monthlyPay / Math.max(1, weeksInMonth(els.monthInput.value));
  const yearlyPay = monthlyPay * 12;

  return { totalHours, grossPay, weeklyHolidayPay, monthlyPay, weeklyPay, yearlyPay, netPay };
}

function weeksInMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(year, monthIndex, 0).getDate();
  return Math.ceil(lastDay / 7);
}

function shouldAddWeeklyHoliday(records) {
  return els.weeklyHolidayInput.checked && records.some((record) => record.finalHours > 0);
}

function estimateWeeklyHolidayPay(records) {
  const byWeek = new Map();
  for (const record of records) {
    const weekKey = getWeekKey(record.date);
    byWeek.set(weekKey, (byWeek.get(weekKey) || 0) + record.finalHours);
  }

  const rate = getAverageRate(records);
  let pay = 0;
  for (const weeklyHours of byWeek.values()) {
    if (weeklyHours >= 15) {
      pay += Math.min(8, weeklyHours / 5) * rate;
    }
  }
  return pay;
}

function getWeekKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const monday = new Date(date);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function getAverageRate(records) {
  const totalHours = records.reduce((sum, record) => sum + record.finalHours, 0);
  if (!totalHours) return DEFAULT_RATE;
  return records.reduce((sum, record) => sum + record.finalHours * record.rate, 0) / totalHours;
}

function renderStats(records) {
  const summary = summarize(records);
  els.totalHours.textContent = hours(summary.totalHours);
  els.totalPay.textContent = money(summary.monthlyPay);
  els.weeklyPay.textContent = money(summary.weeklyPay);
  els.yearlyPay.textContent = money(summary.yearlyPay);
  els.netPay.textContent = money(summary.netPay);
  els.workDays.textContent = `${records.length}일`;
}

function renderCalendar(records) {
  const recordMap = new Map(records.map((record) => [record.date, record]));
  const [year, month] = els.monthInput.value.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;

  els.calendarGrid.innerHTML = "";
  for (let i = 0; i < leading; i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-day is-blank";
    els.calendarGrid.append(blank);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${els.monthInput.value}-${String(day).padStart(2, "0")}`;
    const record = recordMap.get(date);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `calendar-day ${isWeekday(date) ? "is-workday" : "is-weekend"} ${record ? "has-record" : ""}`;
    cell.innerHTML = `
      <strong>${day}</strong>
      <span>${record ? hours(record.finalHours) : isWeekday(date) ? "근무일" : "휴무"}</span>
      ${record ? `<em>${money(calculatePay(record))}</em>` : ""}
    `;
    cell.addEventListener("click", () => {
      if (record) fillForm(record);
      else {
        els.dateInput.value = date;
        els.adjustInput.value = "0";
        els.memoInput.value = "";
      }
    });
    els.calendarGrid.append(cell);
  }
}

function renderRecords(records) {
  if (records.length === 0) {
    els.recordList.innerHTML = `<p class="empty">아직 이 달 기록이 없습니다.</p>`;
    return;
  }

  els.recordList.innerHTML = "";
  for (const record of records) {
    const row = document.createElement("article");
    row.className = "record";
    row.innerHTML = `
      <div>
        <strong>${record.date}</strong>
        <span>${record.jobName}</span>
      </div>
      <div>
        <strong>${record.start} ~ ${record.end} / ${hours(record.finalHours)}</strong>
        <span>휴게 ${record.breakMinutes}분 · 조정 ${record.adjustHours >= 0 ? "+" : ""}${hours(record.adjustHours)}${record.memo ? " · " + record.memo : ""}</span>
      </div>
      <div class="record-pay">
        <strong>${money(calculatePay(record))}</strong>
        <button type="button" data-edit="${record.id}">수정</button>
        <button type="button" data-delete="${record.id}">삭제</button>
      </div>
    `;
    els.recordList.append(row);
  }
}

function render() {
  const records = selectedMonthRecords();
  renderStats(records);
  renderCalendar(records);
  renderRecords(records);
}

function fillForm(record) {
  els.dateInput.value = record.date;
  els.jobInput.value = record.jobName;
  els.startInput.value = record.start;
  els.endInput.value = record.end;
  els.breakInput.value = record.breakMinutes;
  els.rateInput.value = record.rate;
  els.adjustInput.value = record.adjustHours;
  els.deductionInput.value = record.deductionRate;
  els.weeklyHolidayInput.checked = record.includeWeeklyHoliday;
  els.allowanceInput.checked = record.includeAllowance;
  els.memoInput.value = record.memo || "";
}

function upsertRecord(newRecord) {
  const records = loadRecords();
  const existingIndex = records.findIndex((record) => record.date === newRecord.date && record.jobName === newRecord.jobName);
  if (existingIndex >= 0) records[existingIndex] = { ...records[existingIndex], ...newRecord };
  else records.push(newRecord);
  saveRecords(records);
}

function handleSubmit(event) {
  event.preventDefault();
  const base = {
    date: els.dateInput.value,
    jobName: els.jobInput.value.trim() || "기본 근무지",
    start: els.startInput.value,
    end: els.endInput.value,
    breakMinutes: Number(els.breakInput.value || 0),
    rate: Number(els.rateInput.value || DEFAULT_RATE),
    adjustHours: Number(els.adjustInput.value || 0),
    deductionRate: Number(els.deductionInput.value || 0),
    includeWeeklyHoliday: els.weeklyHolidayInput.checked,
    includeAllowance: els.allowanceInput.checked,
    memo: els.memoInput.value.trim()
  };
  const finalHours = calculateWorkedHours(base);
  const nightHours = calculateNightHours(base);

  upsertRecord({
    id: crypto.randomUUID(),
    ...base,
    finalHours,
    nightHours
  });

  els.adjustInput.value = "0";
  els.memoInput.value = "";
  render();
}

function clearMonth() {
  const month = els.monthInput.value;
  saveRecords(loadRecords().filter((record) => monthFromDate(record.date) !== month));
  render();
}

function exportCsv() {
  const records = selectedMonthRecords();
  const header = ["날짜", "직장", "출근", "퇴근", "휴게분", "인정시간", "시급", "예상급여", "메모"];
  const rows = records.map((record) => [
    record.date,
    record.jobName,
    record.start,
    record.end,
    record.breakMinutes,
    record.finalHours,
    record.rate,
    Math.round(calculatePay(record)),
    record.memo
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hourly-${els.monthInput.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll("[data-adjust]").forEach((button) => {
  button.addEventListener("click", () => {
    const current = Number(els.adjustInput.value || 0);
    els.adjustInput.value = String(current + Number(button.dataset.adjust));
  });
});

els.entryForm.addEventListener("submit", handleSubmit);
els.monthInput.addEventListener("change", render);
els.deductionInput.addEventListener("input", render);
els.weeklyHolidayInput.addEventListener("change", render);
els.allowanceInput.addEventListener("change", render);
els.clearMonthBtn.addEventListener("click", clearMonth);
els.exportCsvBtn.addEventListener("click", exportCsv);
els.recordList.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) {
    const record = loadRecords().find((item) => item.id === editId);
    if (record) fillForm(record);
  }
  if (deleteId) {
    saveRecords(loadRecords().filter((record) => record.id !== deleteId));
    render();
  }
});

const today = todayIso();
els.dateInput.value = today;
els.monthInput.value = monthFromDate(today);
els.rateInput.value = String(DEFAULT_RATE);
render();
