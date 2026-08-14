const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);

for (const file of ["data/players.js", "data/career-stats.js"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(source, sandbox, { filename: file });
}

const batchesDir = path.join(root, "data", "batches");
if (fs.existsSync(batchesDir)) {
  for (const batchFile of fs.readdirSync(batchesDir).filter((file) => file.endsWith(".js")).sort()) {
    const file = path.join("data", "batches", batchFile);
    const source = fs.readFileSync(path.join(root, file), "utf8");
    vm.runInContext(source, sandbox, { filename: file });
  }
}

const players = sandbox.window.lineagePlayers;
const careerStats = sandbox.window.lineageCareerStats;

const errors = [];
const warnings = [];

function duplicates(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function formatSeason(year) {
  return `${year}-${String(year + 1).slice(-2)}`;
}

function findConnection(firstId, secondId) {
  const first = playerById.get(firstId);
  const second = playerById.get(secondId);
  if (!first || !second) return null;

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

if (!Array.isArray(players)) {
  errors.push("window.lineagePlayers must be an array.");
}

if (!careerStats || typeof careerStats !== "object" || Array.isArray(careerStats)) {
  errors.push("window.lineageCareerStats must be an object.");
}

const playerIds = players.map((player) => player.id);
const playerNames = players.map((player) => player.name);
const statIds = Object.keys(careerStats);
const playerIdSet = new Set(playerIds);
const statIdSet = new Set(statIds);
const playerById = new Map(players.map((player) => [player.id, player]));

for (const id of duplicates(playerIds)) errors.push(`Duplicate player id: ${id}`);
for (const name of duplicates(playerNames)) errors.push(`Duplicate player name: ${name}`);

for (const id of playerIds) {
  if (!statIdSet.has(id)) errors.push(`Missing careerStats row for player id: ${id}`);
}

for (const id of statIds) {
  if (!playerIdSet.has(id)) errors.push(`careerStats has extra id with no player: ${id}`);
}

for (const player of players) {
  if (!player.id || !player.name || !player.position || !Array.isArray(player.teams)) {
    errors.push(`Malformed player row: ${JSON.stringify(player)}`);
    continue;
  }

  for (const stint of player.teams) {
    if (!stint.team || !Number.isInteger(stint.from) || !Number.isInteger(stint.to)) {
      errors.push(`Malformed team stint for ${player.name}: ${JSON.stringify(stint)}`);
    } else if (stint.from >= stint.to) {
      errors.push(`${player.name} has bad range: ${stint.team} ${stint.from}-${stint.to}`);
    }
  }

  const stats = careerStats[player.id];
  if (!Array.isArray(stats) || stats.length !== 2 || !stats.every(Number.isFinite)) {
    errors.push(`Bad careerStats row for ${player.name}: ${JSON.stringify(stats)}`);
  }
}

const knownConnections = [
  ["hossa", "marc-savard", "Atlanta Thrashers"],
  ["jagr", "bergeron", "Boston Bruins"],
  ["stempniak", "scheifele", "Winnipeg Jets"],
  ["claude-lemieux", "brodeur", "New Jersey Devils"],
  ["dylan-demelo", "scheifele", "Winnipeg Jets"],
];

for (const [firstId, secondId, team] of knownConnections) {
  const connection = findConnection(firstId, secondId);
  if (!connection) {
    errors.push(`Expected ${firstId} and ${secondId} to be teammates on ${team}.`);
  } else if (connection.team !== team) {
    warnings.push(
      `Expected ${firstId}/${secondId} on ${team}; first detected overlap is ${connection.team} ${connection.season}.`,
    );
  }
}

const result = {
  players: players.length,
  stats: statIds.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) process.exit(1);
