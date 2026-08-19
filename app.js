const sports = window.lineageSports || {};
const sportManifest = window.lineageSportManifest || {};
const loadedSportScripts = new Set();
const sportSettings = {
  nhl: {
    label: "NHL",
    leagueName: "NHL",
    theme: "hockey",
    eyebrow: "Random hockey challenge",
    heroCopy: "Build a chain between two established NHL players. Every link must be a real teammate.",
    footer: "LINEAGE / HOCKEY",
    fullPoolTitle: "Established NHL careers",
    fullPoolCopy: "Endpoint minimums: 500+ skater / 200+ goalie games · Pre-1980–81 debut: 800+ / 400+",
    recentPoolTitle: "2010-present NHL careers",
    recentPoolCopy:
      "Start and target players debuted in 2010 or later and still meet endpoint games-played minimums. Any NHL player can be a connector.",
  },
  nba: {
    label: "NBA",
    leagueName: "NBA",
    theme: "basketball",
    eyebrow: "Random basketball challenge",
    heroCopy: "Build a chain between two established NBA players. Every link must be a real teammate.",
    footer: "LINEAGE / BASKETBALL",
    fullPoolTitle: "Established NBA careers",
    fullPoolCopy: "Endpoint minimum: 500+ NBA games. Hall of Fame legends can be included even with pre-1980 debuts.",
    recentPoolTitle: "2010-present NBA careers",
    recentPoolCopy:
      "Start and target players debuted in 2010 or later and still meet the NBA endpoint minimum. Any NBA player can be a connector.",
  },
  nfl: {
    label: "NFL",
    leagueName: "NFL",
    theme: "football",
    eyebrow: "Random football challenge",
    heroCopy: "Build a chain between two established NFL players. Every link must be a real teammate.",
    footer: "LINEAGE / FOOTBALL",
    fullPoolTitle: "Established NFL careers",
    fullPoolCopy: "Endpoint minimum: 100+ NFL games. Any NFL player in the pack can be used as a connector.",
    recentPoolTitle: "2010-present NFL careers",
    recentPoolCopy:
      "Start and target players debuted in 2010 or later and still meet the NFL endpoint minimum. Any NFL player can be a connector.",
  },
  mlb: {
    label: "MLB",
    leagueName: "MLB",
    theme: "baseball",
    eyebrow: "Random baseball challenge",
    heroCopy: "Build a chain between two established MLB players. Every link must be a real teammate.",
    footer: "LINEAGE / BASEBALL",
    fullPoolTitle: "Established MLB careers",
    fullPoolCopy: "Endpoint minimum: 500+ MLB games. Any MLB player in the pack can be used as a connector.",
    recentPoolTitle: "2010-present MLB careers",
    recentPoolCopy:
      "Start and target players debuted in 2010 or later and still meet the MLB endpoint minimum. Any MLB player can be a connector.",
  },
};
const puzzle = { start: null, target: null, par: null };
const state = {
  chain: [],
  hintsLeft: 3,
  hintsUsed: 0,
  seconds: 0,
  won: false,
  gaveUp: false,
  started: false,
  timerId: null,
};
let currentSport = "nhl";
let currentMode = localStorage.getItem("lineage-mode") === "recent" ? "recent" : "full";
let players = [];
let careerStats = {};
let playerById = {};
let endpointEligiblePlayers = { full: [], recent: [] };
let adjacencyById = null;
const puzzleCandidatesByMode = new Map();

const els = {
  chain: document.querySelector("#chain"),
  search: document.querySelector("#playerSearch"),
  results: document.querySelector("#searchResults"),
  hintDisplay: document.querySelector("#hintDisplay"),
  feedback: document.querySelector("#pickerFeedback"),
  timer: document.querySelector("#timer"),
  linkCount: document.querySelector("#linkCount"),
  progress: document.querySelector("#progressBar"),
  undo: document.querySelector("#undoButton"),
  hint: document.querySelector("#hintButton"),
  giveUp: document.querySelector("#giveUpButton"),
  hintCount: document.querySelector("#hintCount"),
  winDialog: document.querySelector("#winDialog"),
  helpDialog: document.querySelector("#helpDialog"),
  sportButtons: document.querySelectorAll("[data-sport]"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  poolTitle: document.querySelector("#poolTitle"),
  poolCopy: document.querySelector("#poolCopy"),
  eyebrow: document.querySelector("#sportEyebrow"),
  heroCopy: document.querySelector("#heroCopy"),
  footerLeague: document.querySelector("#footerLeague"),
  helpTitle: document.querySelector("#helpTitle"),
  helpLeagueCopy: document.querySelector("#helpLeagueCopy"),
  helpModeCopy: document.querySelector("#helpModeCopy"),
  ruleOneCopy: document.querySelector("#ruleOneCopy"),
};

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isEndpointEligible(player) {
  const [debut, gamesPlayed] = careerStats[player.id] || [];
  if (currentSport === "nba") return gamesPlayed >= 500;
  if (currentSport === "nfl") return gamesPlayed >= 100;
  if (currentSport === "mlb") return gamesPlayed >= 500;

  const debutedBefore1980 = debut < 1980;
  const minimumGames = player.position === "G"
    ? debutedBefore1980 ? 400 : 200
    : debutedBefore1980 ? 800 : 500;
  return gamesPlayed >= minimumGames;
}

function isRecentEndpoint(player) {
  const [debut] = careerStats[player.id] || [];
  return debut >= 2010;
}

function activeSettings() {
  return sportSettings[currentSport] || sportSettings.nhl;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const version = window.lineageAssetVersion || "dev";
    const script = document.createElement("script");
    script.src = `${src}?v=${version}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.append(script);
  });
}

async function ensureSportLoaded(sportId) {
  const manifest = sportManifest[sportId];
  if (!manifest) return Boolean(sports[sportId]);

  for (const src of manifest.scripts || []) {
    if (loadedSportScripts.has(src)) continue;
    await loadScript(src);
    loadedSportScripts.add(src);
  }
  return Boolean(sports[sportId]);
}

function loadSport(sportId) {
  currentSport = sports[sportId] ? sportId : "nhl";
  const sport = sports[currentSport] || sports.nhl;
  players = sport.players || [];
  careerStats = sport.careerStats || {};
  playerById = Object.fromEntries(players.map((player) => [player.id, player]));
  endpointEligiblePlayers = {
    full: players.filter(isEndpointEligible),
    recent: players.filter((player) => isEndpointEligible(player) && isRecentEndpoint(player)),
  };
  adjacencyById = null;
  puzzleCandidatesByMode.clear();
  localStorage.setItem("lineage-sport", currentSport);
}

function lastName(player) {
  return player.name.split(" ").at(-1);
}

function eligibilityLabel(player) {
  if (!isEndpointEligible(player)) return `${activeSettings().leagueName} player`;
  const [debut] = careerStats[player.id];
  if (currentSport === "nba") return "500+ NBA games";
  if (currentSport === "nfl") return "100+ NFL games";
  if (currentSport === "mlb") return "500+ MLB games";
  if (player.position === "G") return debut < 1980 ? "400+ NHL games" : "200+ NHL games";
  return debut < 1980 ? "800+ NHL games" : "500+ NHL games";
}

function formatSeason(year) {
  if (currentSport === "mlb") return String(year);
  return `${year}–${String(year + 1).slice(-2)}`;
}

function debutLabel(player) {
  const [debut] = careerStats[player.id] || [];
  return Number.isInteger(debut) ? formatSeason(debut) : "an unknown season";
}

function teamCount(player) {
  return new Set(player.teams.map((stint) => stint.team)).size;
}

function findConnection(firstId, secondId) {
  const first = playerById[firstId];
  const second = playerById[secondId];

  for (const a of first.teams) {
    for (const b of second.teams) {
      const overlapStart = Math.max(a.from, b.from);
      const overlapEnd = Math.min(a.to, b.to);
      if (a.team === b.team && overlapStart < overlapEnd) {
        return { team: a.team, season: formatSeason(overlapStart) };
      }
    }
  }
  return null;
}

function getAdjacency() {
  if (adjacencyById) return adjacencyById;

  const adjacencySets = new Map(players.map((player) => [player.id, new Set()]));
  const rostersByTeamSeason = new Map();

  for (const player of players) {
    for (const stint of player.teams) {
      for (let season = stint.from; season < stint.to; season += 1) {
        const key = `${stint.team}::${season}`;
        if (!rostersByTeamSeason.has(key)) rostersByTeamSeason.set(key, new Set());
        rostersByTeamSeason.get(key).add(player.id);
      }
    }
  }

  for (const rosterSet of rostersByTeamSeason.values()) {
    const roster = Array.from(rosterSet);
    for (let firstIndex = 0; firstIndex < roster.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < roster.length; secondIndex += 1) {
        const firstId = roster[firstIndex];
        const secondId = roster[secondIndex];
        adjacencySets.get(firstId).add(secondId);
        adjacencySets.get(secondId).add(firstId);
      }
    }
  }

  adjacencyById = new Map(
    Array.from(adjacencySets, ([id, neighborsForPlayer]) => [id, Array.from(neighborsForPlayer)]),
  );
  return adjacencyById;
}

function neighbors(id) {
  return getAdjacency().get(id) || [];
}

function shortestDistances(startId) {
  const queue = [startId];
  const distances = new Map([[startId, 0]]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    for (const neighbor of neighbors(current)) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, distances.get(current) + 1);
        queue.push(neighbor);
      }
    }
  }
  return distances;
}

function shortestPath(startId, targetId) {
  const queue = [startId];
  const previous = new Map([[startId, null]]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    if (current === targetId) {
      const path = [];
      let cursor = targetId;
      while (cursor) {
        path.unshift(cursor);
        cursor = previous.get(cursor);
      }
      return path;
    }

    for (const neighbor of neighbors(current)) {
      if (!previous.has(neighbor)) {
        previous.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
  return null;
}

function endpointPoolForMode(mode = currentMode) {
  return endpointEligiblePlayers[mode] || endpointEligiblePlayers.full;
}

function getPuzzleCandidates(mode = currentMode) {
  if (puzzleCandidatesByMode.has(mode)) return puzzleCandidatesByMode.get(mode);

  const candidates = [];
  const endpointIds = endpointPoolForMode(mode).map((player) => player.id);
  const endpointSet = new Set(endpointIds);

  for (const start of endpointIds) {
    const distances = shortestDistances(start);
    for (const [target, links] of distances) {
      if (start !== target && endpointSet.has(target) && links >= 3 && links <= 5) {
        candidates.push({ start, target, par: links });
      }
    }
  }
  puzzleCandidatesByMode.set(mode, candidates);
  return candidates;
}

function chooseRandomPuzzle() {
  const endpointPlayers = endpointPoolForMode();
  const previousKey = `${puzzle.start}:${puzzle.target}`;
  if (endpointPlayers.length < 2) return null;

  for (let attempt = 0; attempt < 2500; attempt += 1) {
    const start = endpointPlayers[Math.floor(Math.random() * endpointPlayers.length)];
    const target = endpointPlayers[Math.floor(Math.random() * endpointPlayers.length)];
    if (!start || !target || start.id === target.id) continue;
    if (`${start.id}:${target.id}` === previousKey) continue;

    const path = shortestPath(start.id, target.id);
    const links = (path?.length || 0) - 1;
    if (links >= 3 && links <= 5) {
      return { start: start.id, target: target.id, par: links };
    }
  }

  const candidates = getPuzzleCandidates();
  if (!candidates.length) {
    const [start, target] = endpointPlayers;
    if (!start || !target) return null;
    const path = shortestPath(start.id, target.id);
    return { start: start.id, target: target.id, par: Math.max((path?.length || 2) - 1, 1) };
  }

  const freshCandidates = candidates.filter((candidate) => `${candidate.start}:${candidate.target}` !== previousKey);
  return freshCandidates[Math.floor(Math.random() * freshCandidates.length)] || candidates[0];
}

function updatePuzzleCopy() {
  const start = playerById[puzzle.start];
  const target = playerById[puzzle.target];
  document.querySelector("#challengeTitle").innerHTML = `${lastName(start)} <span>to</span> ${lastName(target)}`;
  document.querySelector("#parCount").textContent = puzzle.par;
  document.querySelector("#objectiveCopy").textContent =
    `Connect ${start.name} to ${target.name} using any ${activeSettings().leagueName} players who shared a roster.`;
}

function updateModeCopy() {
  const settings = activeSettings();
  document.body.dataset.sport = currentSport;
  els.sportButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.sport === currentSport);
    button.setAttribute("aria-pressed", String(button.dataset.sport === currentSport));
  });
  els.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === currentMode);
    button.setAttribute("aria-pressed", String(button.dataset.mode === currentMode));
  });

  els.eyebrow.innerHTML = `<span></span> ${settings.eyebrow}`;
  els.heroCopy.textContent = settings.heroCopy;
  els.footerLeague.textContent = settings.footer;
  els.helpTitle.textContent = `Connect two ${settings.leagueName} players through teammates.`;
  els.helpLeagueCopy.textContent = settings.leagueName;
  els.helpModeCopy.textContent =
    `Full mode uses the whole endpoint pool. 2010-present mode only chooses start and target players who debuted in 2010 or later. Any ${settings.leagueName} player can still be used as a link.`;
  els.ruleOneCopy.textContent = `Pick any ${settings.leagueName} teammate of the last player in your chain.`;

  if (currentMode === "recent") {
    els.poolTitle.textContent = settings.recentPoolTitle;
    els.poolCopy.textContent = settings.recentPoolCopy;
    return;
  }

  els.poolTitle.textContent = settings.fullPoolTitle;
  els.poolCopy.textContent = settings.fullPoolCopy;
}

function playerEntry(player, index, isTarget = false) {
  const previousId = state.chain[index - 1];
  const proof = previousId ? findConnection(previousId, player.id) : null;
  const wrapper = document.createElement("div");
  wrapper.className = `chain-entry${isTarget ? " target-entry" : ""}`;
  if (isTarget && isRoundOver()) wrapper.classList.add("reached");
  if (state.gaveUp) wrapper.classList.add("revealed-entry");
  wrapper.innerHTML = `
    <div class="avatar" style="--avatar:${player.color}">${initials(player.name)}</div>
    <div class="player-copy">
      <strong>${player.name}</strong>
      <span>${player.position} · ${eligibilityLabel(player)}</span>
    </div>
    <span class="endpoint-tag">${index === 0 ? "Start" : isTarget ? "Target" : `Link ${index}`}</span>
    ${proof ? `<span class="proof">${proof.team} · ${proof.season}</span>` : ""}
  `;
  return wrapper;
}

function isRoundOver() {
  return state.won || state.gaveUp;
}

function renderChain() {
  els.chain.replaceChildren();
  state.chain.forEach((id, index) => {
    els.chain.append(playerEntry(playerById[id], index, id === puzzle.target));
  });

  if (!isRoundOver()) {
    els.chain.append(playerEntry(playerById[puzzle.target], state.chain.length, true));
  }

  const links = state.chain.length - 1;
  els.linkCount.textContent = links;
  els.progress.style.width = `${Math.min((links / puzzle.par) * 100, 100)}%`;
  els.undo.disabled = links === 0 || isRoundOver();
  els.giveUp.disabled = isRoundOver();
  els.search.disabled = isRoundOver();
}

function renderSearchResults(query = "") {
  if (isRoundOver()) return;
  const normalized = normalizeText(query.trim());
  if (!normalized) {
    els.results.classList.remove("open");
    els.search.setAttribute("aria-expanded", "false");
    return;
  }

  const matches = players
    .filter((player) => !state.chain.includes(player.id))
    .filter((player) => normalizeText(player.name).includes(normalized))
    .slice(0, 7);

  els.results.innerHTML = matches.length
    ? matches
        .map(
          (player) => `
            <button class="result-item" type="button" role="option" data-player-id="${player.id}">
              <span class="avatar" style="--avatar:${player.color}">${initials(player.name)}</span>
              <span><strong>${player.name}</strong><span>${player.position} · ${eligibilityLabel(player)}</span></span>
            </button>
          `,
        )
        .join("")
    : '<div class="result-item"><span>No players found</span></div>';

  els.results.classList.add("open");
  els.search.setAttribute("aria-expanded", "true");
}

function beginTimer() {
  if (state.started) return;
  state.started = true;
  state.timerId = window.setInterval(() => {
    state.seconds += 1;
    els.timer.textContent = formatTime(state.seconds);
  }, 1000);
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function setFeedback(message, type = "error") {
  els.feedback.textContent = message;
  els.feedback.className = `picker-feedback${type === "hint" ? " hint" : ""}`;
}

function setHint(message) {
  els.hintDisplay.textContent = message;
  els.hintDisplay.classList.toggle("open", Boolean(message));
}

function formatPath(path) {
  return path.map((id) => playerById[id].name).join(" → ");
}

function setShortestPathCopy(path) {
  const links = Math.max(path.length - 1, 0);
  document.querySelector("#shortestPathCopy").textContent =
    `${links} ${links === 1 ? "link" : "links"}: ${formatPath(path)}`;
}

function addPlayer(id) {
  if (isRoundOver()) return;
  beginTimer();
  const previousId = state.chain[state.chain.length - 1];
  const connection = findConnection(previousId, id);

  els.search.value = "";
  els.results.classList.remove("open");
  if (!connection) {
    setFeedback(`${playerById[id].name} was not teammates with ${playerById[previousId].name}.`);
    return;
  }

  setFeedback("");
  setHint("");
  state.chain.push(id);
  if (id === puzzle.target) finishGame();
  renderChain();
  els.search.focus();
}

function finishGame() {
  state.won = true;
  state.gaveUp = false;
  window.clearInterval(state.timerId);
  saveResult();

  const links = state.chain.length - 1;
  const bestPath = shortestPath(puzzle.start, puzzle.target) || [...state.chain];
  els.winDialog.classList.remove("give-up-dialog");
  document.querySelector("#dialogKicker").textContent = "Connection complete";
  document.querySelector("#winLinks").textContent = links;
  document.querySelector("#winTime").textContent = formatTime(state.seconds);
  document.querySelector("#winHints").textContent = state.hintsUsed;
  setShortestPathCopy(bestPath);
  document.querySelector("#winTitle").textContent = links <= puzzle.par ? "That’s a beauty." : "Connection complete.";
  document.querySelector("#winSummary").textContent =
    links <= puzzle.par
      ? `You matched par and linked ${lastName(playerById[puzzle.start])} to ${lastName(playerById[puzzle.target])} in ${links} moves.`
      : `You found your own route from ${lastName(playerById[puzzle.start])} to ${lastName(playerById[puzzle.target])} in ${links} moves.`;

  window.setTimeout(() => els.winDialog.showModal(), 450);
}

function showHint() {
  if (!state.hintsLeft || isRoundOver()) return;
  beginTimer();
  const current = state.chain[state.chain.length - 1];
  const path = shortestPath(current, puzzle.target);
  if (!path || path.length < 2) {
    setFeedback("");
    setHint("No hint path could be found from here.");
    return;
  }

  const hintNumber = state.hintsUsed + 1;
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  const next = playerById[path[1]];
  const connection = findConnection(current, next.id);
  const teams = teamCount(next);
  const teamText = `${teams} ${teams === 1 ? "team" : "teams"}`;
  const hints = [
    `Next step: look for a ${next.position} who debuted in ${debutLabel(next)} and has ${teamText} in the database.`,
    connection
      ? `Team clue: ${playerById[current].name} connects to the next player through the ${connection.team}.`
      : `Team clue: the next player has ${teamText} in the database.`,
    connection
      ? `Strong clue: they shared the ${connection.team} in ${connection.season}, and the player’s last name starts with “${lastName(next)[0]}”.`
      : `Strong clue: the player’s last name starts with “${lastName(next)[0]}”.`,
  ];
  const message = hints[Math.min(hintNumber - 1, hints.length - 1)];
  setFeedback("");
  setHint(message);
  els.hintCount.textContent = `${state.hintsLeft} left`;
  els.hint.disabled = state.hintsLeft === 0;
}

function giveUp() {
  if (isRoundOver()) return;
  const path = shortestPath(puzzle.start, puzzle.target);
  if (!path) {
    setFeedback("No path could be found for this matchup.");
    return;
  }

  state.gaveUp = true;
  window.clearInterval(state.timerId);
  state.chain = path;
  saveGiveUp();
  setFeedback("Shortest path revealed.", "hint");
  renderChain();

  const links = path.length - 1;
  els.winDialog.classList.add("give-up-dialog");
  document.querySelector("#dialogKicker").textContent = "Round ended";
  document.querySelector("#winLinks").textContent = links;
  document.querySelector("#winTime").textContent = formatTime(state.seconds);
  document.querySelector("#winHints").textContent = state.hintsUsed;
  setShortestPathCopy(path);
  document.querySelector("#winTitle").textContent = "Shortest path revealed.";
  document.querySelector("#winSummary").textContent =
    `The best route from ${lastName(playerById[puzzle.start])} to ${lastName(playerById[puzzle.target])} was ${links} ${links === 1 ? "link" : "links"}.`;

  window.setTimeout(() => els.winDialog.showModal(), 300);
}

function startNewPuzzle() {
  window.clearInterval(state.timerId);
  const nextPuzzle = chooseRandomPuzzle();
  if (!nextPuzzle) {
    setFeedback("No matchup could be generated for this player pool.");
    document.querySelector("#challengeTitle").innerHTML = "No <span>matchup</span> found";
    return;
  }
  Object.assign(puzzle, nextPuzzle);
  Object.assign(state, {
    chain: [puzzle.start],
    hintsLeft: 3,
    hintsUsed: 0,
    seconds: 0,
    won: false,
    gaveUp: false,
    started: false,
    timerId: null,
  });
  els.timer.textContent = "00:00";
  els.search.value = "";
  els.search.disabled = false;
  els.hintCount.textContent = "3 left";
  els.hint.disabled = false;
  els.giveUp.disabled = false;
  els.winDialog.classList.remove("give-up-dialog");
  document.querySelector("#dialogKicker").textContent = "Connection complete";
  setFeedback("");
  setHint("");
  updateModeCopy();
  updatePuzzleCopy();
  renderChain();
  if (els.winDialog.open) els.winDialog.close();
}

function setMode(mode) {
  if (!endpointEligiblePlayers[mode]) return;
  currentMode = mode;
  localStorage.setItem("lineage-mode", currentMode);
  startNewPuzzle();
}

async function setSport(sportId) {
  if (sportId === currentSport) return;
  const button = Array.from(els.sportButtons).find((sportButton) => sportButton.dataset.sport === sportId);
  if (button) button.disabled = true;
  const loaded = await ensureSportLoaded(sportId).catch(() => false);
  if (button) button.disabled = false;
  if (!loaded) {
    setFeedback(`Could not load ${sportSettings[sportId]?.leagueName || "that sport"} data.`);
    return;
  }
  if (!sports[sportId] || sportId === currentSport) return;
  loadSport(sportId);
  startNewPuzzle();
  renderStats();
}

function statsKey() {
  return `lineage-stats-${currentSport}`;
}

function readStats() {
  try {
    return JSON.parse(localStorage.getItem(statsKey())) || { played: 0, won: 0, best: null, streak: 0 };
  } catch {
    return { played: 0, won: 0, best: null, streak: 0 };
  }
}

function saveResult() {
  const stats = readStats();
  const links = state.chain.length - 1;
  stats.played += 1;
  stats.won += 1;
  stats.streak += 1;
  stats.best = stats.best === null ? links : Math.min(stats.best, links);
  localStorage.setItem(statsKey(), JSON.stringify(stats));
  renderStats();
}

function saveGiveUp() {
  const stats = readStats();
  stats.played += 1;
  stats.streak = 0;
  localStorage.setItem(statsKey(), JSON.stringify(stats));
  renderStats();
}

function renderStats() {
  const stats = readStats();
  document.querySelector("#playedStat").textContent = stats.played;
  document.querySelector("#winStat").textContent = stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%";
  document.querySelector("#bestStat").textContent = stats.best ?? "—";
  document.querySelector("#streakCount").textContent = stats.streak;
}

function shareResult() {
  if (!state.won) return;
  const boxes = state.chain.slice(1).map(() => "🟩").join("");
  const text =
    `${activeSettings().footer}\n${lastName(playerById[puzzle.start])} → ${lastName(playerById[puzzle.target])}\n` +
    `${boxes}\n${state.chain.length - 1} links · ${formatTime(state.seconds)}`;
  if (navigator.share) {
    navigator.share({ title: "Lineage", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      document.querySelector("#shareButton").textContent = "Copied!";
    });
  }
}

els.search.addEventListener("input", (event) => renderSearchResults(event.target.value));
els.search.addEventListener("focus", () => {
  if (els.search.value) renderSearchResults(els.search.value);
});
els.results.addEventListener("click", (event) => {
  const button = event.target.closest("[data-player-id]");
  if (button) addPlayer(button.dataset.playerId);
});
els.undo.addEventListener("click", () => {
  if (state.chain.length > 1 && !state.won) {
    state.chain.pop();
    setFeedback("");
    renderChain();
  }
});
els.hint.addEventListener("click", showHint);
els.giveUp.addEventListener("click", giveUp);
els.sportButtons.forEach((button) => {
  button.addEventListener("click", () => setSport(button.dataset.sport));
});
els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
document.querySelector("#howToPlayButton").addEventListener("click", () => els.helpDialog.showModal());
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
document.querySelector("#playAgainButton").addEventListener("click", startNewPuzzle);
document.querySelector("#newMatchupButton").addEventListener("click", startNewPuzzle);
document.querySelector("#shareButton").addEventListener("click", shareResult);
document.querySelector("#resetStatsButton").addEventListener("click", () => {
  localStorage.removeItem(statsKey());
  renderStats();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("#playerPicker")) {
    els.results.classList.remove("open");
    els.search.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== els.search) {
    event.preventDefault();
    els.search.focus();
  }
  if (event.key === "Escape") els.results.classList.remove("open");
});

async function init() {
  const preferredSport = localStorage.getItem("lineage-sport") || "nhl";
  await ensureSportLoaded(preferredSport).catch(() => false);
  loadSport(sports[preferredSport] ? preferredSport : "nhl");
  startNewPuzzle();
  renderStats();
}

init();
