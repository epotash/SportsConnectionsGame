const state = {
  jobs: [],
  candidates: [],
  activeTable: "jobs",
  config: null,
};

const els = {
  acceptedCount: document.querySelector("#acceptedCount"),
  candidateCount: document.querySelector("#candidateCount"),
  sourceCount: document.querySelector("#sourceCount"),
  statusText: document.querySelector("#statusText"),
  scanButton: document.querySelector("#scanButton"),
  refreshButton: document.querySelector("#refreshButton"),
  acceptedTab: document.querySelector("#acceptedTab"),
  auditTab: document.querySelector("#auditTab"),
  searchInput: document.querySelector("#searchInput"),
  tableHead: document.querySelector("#tableHead"),
  tableBody: document.querySelector("#tableBody"),
  emptyState: document.querySelector("#emptyState"),
  scanLog: document.querySelector("#scanLog"),
};

const jobColumns = [
  ["title", "Title"],
  ["company", "Company"],
  ["location", "Location"],
  ["source", "Source"],
  ["role_family", "Role"],
  ["entry_level_score", "Score"],
  ["posted_at", "Posted"],
  ["url", "Link"],
];

const candidateColumns = [
  ["title", "Title"],
  ["company", "Company"],
  ["source", "Source"],
  ["role_family", "Role"],
  ["entry_level_score", "Score"],
  ["accepted", "Status"],
  ["rejection_reason", "Reason"],
  ["query", "Query"],
  ["search_location", "Search Location"],
  ["url", "Link"],
];

function setStatus(text) {
  els.statusText.textContent = text;
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function loadData() {
  setStatus("Loading");
  const [config, jobs, candidates] = await Promise.all([
    getJson("/api/config"),
    getJson("/api/jobs?limit=500"),
    getJson("/api/candidates"),
  ]);
  state.config = config;
  state.jobs = jobs.jobs;
  state.candidates = candidates.candidates;
  updateStats();
  renderTable();
  setStatus("Ready");
}

function updateStats() {
  const sources = new Set([...state.jobs, ...state.candidates].map((row) => row.source).filter(Boolean));
  els.acceptedCount.textContent = state.jobs.length;
  els.candidateCount.textContent = state.candidates.length;
  els.sourceCount.textContent = state.config?.enabled_providers?.length || sources.size;
}

function filteredRows() {
  const rows = state.activeTable === "jobs" ? state.jobs : state.candidates;
  const term = els.searchInput.value.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) =>
    [row.title, row.company, row.location, row.source, row.role_family, row.query, row.rejection_reason]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
}

function renderTable() {
  const columns = state.activeTable === "jobs" ? jobColumns : candidateColumns;
  const rows = filteredRows();
  els.tableHead.innerHTML = `<tr>${columns.map(([, label]) => `<th>${label}</th>`).join("")}</tr>`;
  els.tableBody.replaceChildren();

  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const [key] of columns) {
      const td = document.createElement("td");
      td.append(formatCell(key, row[key], row));
      tr.append(td);
    }
    els.tableBody.append(tr);
  }

  els.emptyState.hidden = rows.length > 0;
}

function formatCell(key, value, row) {
  if (key === "url") {
    const link = document.createElement("a");
    link.href = value || "#";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = value ? "Open" : "";
    return link;
  }

  if (key === "accepted") {
    const pill = document.createElement("span");
    const accepted = Number(value) === 1;
    pill.className = `pill${accepted ? "" : " rejected"}`;
    pill.textContent = accepted ? "Accepted" : "Rejected";
    return pill;
  }

  const span = document.createElement("span");
  if (key === "entry_level_score") span.className = "score";
  if (key === "remote") {
    span.textContent = Number(value) === 1 ? "Yes" : "No";
  } else {
    span.textContent = value || "";
  }
  return span;
}

function setActiveTable(table) {
  state.activeTable = table;
  els.acceptedTab.classList.toggle("active", table === "jobs");
  els.auditTab.classList.toggle("active", table === "candidates");
  renderTable();
}

async function scan() {
  els.scanButton.disabled = true;
  setStatus("Scanning");
  els.scanLog.textContent = "Scanning live providers...";
  try {
    const payload = await getJson("/api/scan", { method: "POST" });
    els.scanLog.replaceChildren(
      ...payload.summaries.map((summary) => {
        const line = document.createElement("div");
        const status = summary.error ? `error: ${summary.error}` : "ok";
        line.textContent =
          `${summary.provider} | ${summary.query} | ${summary.location}: ` +
          `fetched=${summary.fetched} matched=${summary.matched} ` +
          `new=${summary.new_unique} ${status}`;
        return line;
      })
    );
    await loadData();
  } catch (error) {
    setStatus("Error");
    els.scanLog.textContent = error.message;
  } finally {
    els.scanButton.disabled = false;
  }
}

els.scanButton.addEventListener("click", scan);
els.refreshButton.addEventListener("click", loadData);
els.acceptedTab.addEventListener("click", () => setActiveTable("jobs"));
els.auditTab.addEventListener("click", () => setActiveTable("candidates"));
els.searchInput.addEventListener("input", renderTable);

loadData().catch((error) => {
  setStatus("Error");
  els.scanLog.textContent = error.message;
});

