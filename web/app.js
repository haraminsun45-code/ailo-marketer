const state = {
  calendar: [],
  selectedDay: null,
  selectedView: "brief",
  loading: false
};

const els = {
  calendarList: document.querySelector("#calendarList"),
  activeDate: document.querySelector("#activeDate"),
  activeTitle: document.querySelector("#activeTitle"),
  calendarCount: document.querySelector("#calendarCount"),
  activeChannels: document.querySelector("#activeChannels"),
  activeStatus: document.querySelector("#activeStatus"),
  openaiStatus: document.querySelector("#openaiStatus"),
  openaiModel: document.querySelector("#openaiModel"),
  fileTabs: document.querySelector("#fileTabs"),
  insightsGrid: document.querySelector("#insightsGrid"),
  previewLabel: document.querySelector("#previewLabel"),
  previewPath: document.querySelector("#previewPath"),
  previewContent: document.querySelector("#previewContent"),
  runLog: document.querySelector("#runLog"),
  runStatus: document.querySelector("#runStatus"),
  seoScore: document.querySelector("#seoScore"),
  brandTone: document.querySelector("#brandTone"),
  repetitionRatio: document.querySelector("#repetitionRatio"),
  aiRisk: document.querySelector("#aiRisk"),
  readingDifficulty: document.querySelector("#readingDifficulty"),
  channelFit: document.querySelector("#channelFit"),
  ctaStatus: document.querySelector("#ctaStatus"),
  startDate: document.querySelector("#startDate"),
  daysCount: document.querySelector("#daysCount"),
  templateMode: document.querySelector("#templateMode"),
  generateCalendarBtn: document.querySelector("#generateCalendarBtn"),
  promoteInsightsBtn: document.querySelector("#promoteInsightsBtn"),
  refreshInsightsBtn: document.querySelector("#refreshInsightsBtn"),
  testOpenaiBtn: document.querySelector("#testOpenaiBtn"),
  runDraftBtn: document.querySelector("#runDraftBtn"),
  approveBtn: document.querySelector("#approveBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  copyPreviewBtn: document.querySelector("#copyPreviewBtn")
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function setBusy(isBusy) {
  state.loading = isBusy;
  for (const element of [
    els.generateCalendarBtn,
    els.promoteInsightsBtn,
    els.runDraftBtn,
    els.approveBtn,
    els.refreshBtn,
    els.copyPreviewBtn
  ]) {
    element.disabled = isBusy;
  }
  els.runStatus.textContent = isBusy ? "실행 중" : "대기 중";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = [data.error, data.stderr, data.stdout].filter(Boolean).join("\n");
    throw new Error(message || "Request failed");
  }
  return data;
}

function renderCalendar() {
  els.calendarList.innerHTML = "";
  els.calendarCount.textContent = String(state.calendar.length);

  for (const item of state.calendar) {
    const button = document.createElement("button");
    button.className = `calendar-item ${item.day === state.selectedDay ? "is-selected" : ""}`;
    button.innerHTML = `
      <strong>${item.day}. ${toKoreanTitle(item.title)}</strong>
      <span>${item.date} / ${formatChannels(item.channels)}</span>
      <em class="status-badge ${statusClass(item.status)}">${formatStatus(item.status)}</em>
    `;
    button.addEventListener("click", () => selectDay(item.day));
    els.calendarList.append(button);
  }
}

function renderFileTabs(files) {
  const labels = [
    ["brief", "브리프"],
    ["blog", "블로그"],
    ["instagram", "인스타그램"],
    ["threads", "Threads"],
    ["shorts", "숏폼"],
    ["cards", "이미지 카드"]
  ];

  els.fileTabs.innerHTML = "";
  const hasDraft = files.draftJson.exists || files.approvedJson.exists;
  for (const [view, label] of labels) {
    const button = document.createElement("button");
    const exists = view === "brief" ? files.brief.exists : hasDraft;
    button.className = `file-tab ${exists ? "exists" : ""} ${state.selectedView === view ? "is-active" : ""}`;
    button.textContent = label;
    button.disabled = !exists;
    button.addEventListener("click", () => loadItem(state.selectedDay, view));
    els.fileTabs.append(button);
  }
}

function renderItem(data) {
  const { item, files, preview, quality } = data;
  state.selectedDay = item.day;
  state.selectedView = state.selectedView || "brief";

  els.activeDate.textContent = `Day ${item.day} / ${item.date}`;
  els.activeTitle.textContent = toKoreanTitle(item.title);
  els.activeChannels.textContent = formatChannels(item.channels);
  els.activeStatus.textContent = formatStatus(item.status);
  els.previewLabel.textContent = "채널 미리보기";
  els.previewPath.textContent = labelForView(state.selectedView);
  els.previewContent.textContent = preview;
  renderCalendar();
  renderFileTabs(files);
  renderQuality(quality);
}

function setQualityValue(id, value, level) {
  const element = els[id];
  const card = element.closest(".quality-card");
  card.classList.remove("good", "warn", "bad");
  if (level) card.classList.add(level);
  element.textContent = value;
}

function scoreLevel(value, reverse = false) {
  if (reverse) {
    if (value <= 15) return "good";
    if (value <= 35) return "warn";
    return "bad";
  }
  if (value >= 80) return "good";
  if (value >= 60) return "warn";
  return "bad";
}

function renderQuality(quality) {
  if (!quality) return;
  setQualityValue("seoScore", String(quality.seoScore), scoreLevel(quality.seoScore));
  setQualityValue("brandTone", `${quality.brandTone}%`, scoreLevel(quality.brandTone));
  setQualityValue("repetitionRatio", `${quality.repetitionRatio}%`, scoreLevel(quality.repetitionRatio, true));
  setQualityValue("aiRisk", `${quality.aiRisk}%`, scoreLevel(quality.aiRisk, true));
  setQualityValue("readingDifficulty", quality.readingDifficulty, quality.readingDifficulty === "높음" ? "warn" : "good");
  setQualityValue("channelFit", formatChannelFit(quality.channelFit), null);
  setQualityValue("ctaStatus", quality.ctaMissing ? "부족" : "확인", quality.ctaMissing ? "bad" : "good");
}

async function loadCalendar() {
  const data = await api("/api/calendar");
  state.calendar = data.calendar || [];
  if (!state.selectedDay && state.calendar.length > 0) {
    const today = todayIso();
    state.selectedDay = state.calendar.find((item) => item.date === today)?.day || state.calendar[0].day;
  }
  renderCalendar();
  if (state.selectedDay) await loadItem(state.selectedDay);
}

async function loadInsights() {
  try {
    const data = await api("/api/insights");
    renderInsights(data.analysis);
  } catch (error) {
    els.insightsGrid.innerHTML = `<div class="insight-card"><strong>분석 실패</strong><p>${error.message}</p></div>`;
  }
}

async function loadOpenAiStatus() {
  try {
    const data = await api("/api/openai/status");
    els.openaiStatus.textContent = data.hasKey ? "API 키 감지됨" : "API 키 없음";
    els.openaiModel.textContent = `모델: ${data.model}`;
  } catch (error) {
    els.openaiStatus.textContent = "상태 확인 실패";
    els.openaiModel.textContent = error.message;
  }
}

async function testOpenAi() {
  setBusy(true);
  try {
    const result = await api("/api/openai/test", { method: "POST", body: JSON.stringify({}) });
    els.openaiStatus.textContent = "연동 성공";
    els.openaiModel.textContent = `모델: ${result.model}`;
    els.runLog.textContent = result.message;
  } catch (error) {
    els.openaiStatus.textContent = "연동 실패";
    els.runLog.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

function renderInsights(analysis) {
  if (!analysis?.recommendedTopics?.length) {
    els.insightsGrid.innerHTML = `<div class="insight-card"><strong>추천 주제 없음</strong><p>현장 로그를 추가하면 반복 이슈 기반 주제가 표시됩니다.</p></div>`;
    return;
  }

  els.insightsGrid.innerHTML = "";
  for (const item of analysis.recommendedTopics.slice(0, 3)) {
    const card = document.createElement("div");
    card.className = "insight-card";
    card.innerHTML = `
      <strong>${item.rank}. ${toKoreanTitle(item.topic)}</strong>
      <p>${item.recommendedAngle}</p>
      <span>${item.sourceIssue} / 점수 ${item.score}</span>
    `;
    els.insightsGrid.append(card);
  }
}

async function loadItem(day, view) {
  state.selectedDay = day;
  if (view) state.selectedView = view;

  const query = new URLSearchParams({ day: String(day) });
  query.set("view", state.selectedView || "brief");
  const data = await api(`/api/item?${query.toString()}`);
  renderItem(data);
}

async function generateCalendar() {
  setBusy(true);
  try {
    const start = els.startDate.value || todayIso();
    const days = Number(els.daysCount.value || 30);
    const result = await api("/api/calendar/generate", {
      method: "POST",
      body: JSON.stringify({ start, days })
    });
    els.runLog.textContent = `${result.stdout}\n${result.stderr}`.trim();
    state.selectedDay = 1;
    await loadCalendar();
  } catch (error) {
    els.runLog.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

async function promoteInsights() {
  setBusy(true);
  try {
    const result = await api("/api/insights/promote", {
      method: "POST",
      body: JSON.stringify({ limit: 3 })
    });
    els.runLog.textContent = `${result.stdout}\n${result.stderr}`.trim();
    await loadCalendar();
    await loadInsights();
  } catch (error) {
    els.runLog.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

async function runDaily({ approve = false } = {}) {
  if (!state.selectedDay) return;
  setBusy(true);
  try {
    const result = await api("/api/run-daily", {
      method: "POST",
      body: JSON.stringify({
        day: state.selectedDay,
        template: els.templateMode.checked,
        draftOnly: !approve,
        approve
      })
    });
    els.runLog.textContent = `${result.stdout}\n${result.stderr}`.trim();
    state.selectedView = "blog";
    await loadItem(state.selectedDay);
  } catch (error) {
    els.runLog.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

async function copyPreview() {
  try {
    await navigator.clipboard.writeText(els.previewContent.textContent);
    els.copyPreviewBtn.textContent = "복사됨";
    setTimeout(() => {
      els.copyPreviewBtn.textContent = "복사";
    }, 1200);
  } catch (error) {
    els.runLog.textContent = `복사 실패: ${error.message}`;
  }
}

function selectDay(day) {
  state.selectedView = "brief";
  loadItem(day).catch((error) => {
    els.runLog.textContent = error.message;
  });
}

function labelForView(view) {
  const map = {
    brief: "브리프",
    blog: "블로그",
    instagram: "인스타그램",
    threads: "Threads",
    shorts: "숏폼",
    cards: "이미지 카드"
  };
  return map[view] || view;
}

function formatChannels(channels = []) {
  const map = {
    blog: "블로그",
    threads: "Threads",
    instagram: "인스타그램",
    shorts: "숏폼"
  };
  return channels.map((channel) => map[channel] || channel).join(", ");
}

function formatChannelFit(channelFit = {}) {
  return Object.entries(channelFit)
    .map(([channel, fit]) => `${formatChannels([channel])} ${fit}`)
    .join(" · ");
}

function formatStatus(status) {
  const map = {
    planned: "예정",
    draft_ready: "초안 완료",
    approved: "승인 완료",
    dry_run_ready: "배포 확인",
    published: "배포 완료"
  };
  return map[status] || status || "예정";
}

function statusClass(status) {
  const map = {
    draft_ready: "is-draft",
    approved: "is-approved",
    dry_run_ready: "is-ready",
    published: "is-published"
  };
  return map[status] || "is-planned";
}

function toKoreanTitle(title) {
  const map = {
    "Why freight work logs should be automated": "화물 운송 업무 로그를 자동화해야 하는 이유",
    "Why drivers should not have to touch apps while driving": "운전 중 앱 조작을 줄여야 하는 이유",
    "How OCR can reduce consignment input work": "인수증 OCR이 반복 입력을 줄이는 방법",
    "Loading verification without complicated screens": "복잡한 화면 없이 상차 검증하기",
    "Unloading mistakes and destination cargo checks": "하차 실수와 목적지 화물 확인",
    "Fixed-route freight vs variable freight workflows": "고정노선과 변동 화물 워크플로우의 차이",
    "What an AI operational co-driver means": "AI 운영 동승자는 무엇을 의미하나",
    "Why transportation companies need workflow visibility": "운송사에 업무 가시성이 필요한 이유",
    "Low-risk automation vs driver confirmation": "저위험 자동화와 기사 확인의 기준",
    "Why voice-first UX matters in logistics": "물류 현장에서 음성 중심 UX가 중요한 이유"
  };
  return map[title] || title;
}

els.startDate.value = todayIso();
els.generateCalendarBtn.addEventListener("click", generateCalendar);
els.promoteInsightsBtn.addEventListener("click", promoteInsights);
els.refreshInsightsBtn.addEventListener("click", loadInsights);
els.testOpenaiBtn.addEventListener("click", testOpenAi);
els.runDraftBtn.addEventListener("click", () => runDaily({ approve: false }));
els.approveBtn.addEventListener("click", () => runDaily({ approve: true }));
els.refreshBtn.addEventListener("click", () => loadCalendar());
els.copyPreviewBtn.addEventListener("click", copyPreview);

loadCalendar().catch((error) => {
  els.previewContent.textContent = error.message;
});
loadInsights();
loadOpenAiStatus();
