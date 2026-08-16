const fs = require("fs");
const path = require("path");
const vm = require("vm");

const [, , csvPathArg, targetTotalArg, startSuffixArg = "a"] = process.argv;
if (!csvPathArg) {
  console.error(
    "Usage: node scripts/generate-nba-batches.js /path/to/nba-data-historical.csv [target-total] [start-suffix]",
  );
  process.exit(1);
}

const root = path.resolve(__dirname, "..");
const csvPath = path.resolve(csvPathArg);
const targetTotal = Number(targetTotalArg) || 500;
const batchSize = Number(process.env.NBA_BATCH_SIZE) || 100;
const minDebut = Number(process.env.NBA_MIN_DEBUT) || 1980;
const maxDebut = Number(process.env.NBA_MAX_DEBUT) || Infinity;
const pickStrategy = process.env.NBA_PICK_STRATEGY || "balanced";
const startSuffixCode = startSuffixArg.toLowerCase().charCodeAt(0);

const teamNames = {
  ATL: "Atlanta Hawks",
  BOS: "Boston Celtics",
  BRK: "Brooklyn Nets",
  NJN: "New Jersey Nets",
  BUF: "Buffalo Braves",
  CHA: "Charlotte Hornets",
  CHH: "Charlotte Hornets",
  CHO: "Charlotte Hornets",
  CHI: "Chicago Bulls",
  CLE: "Cleveland Cavaliers",
  DAL: "Dallas Mavericks",
  DEN: "Denver Nuggets",
  DET: "Detroit Pistons",
  GSW: "Golden State Warriors",
  HOU: "Houston Rockets",
  IND: "Indiana Pacers",
  KCK: "Kansas City Kings",
  LAC: "Los Angeles Clippers",
  SDC: "San Diego Clippers",
  LAL: "Los Angeles Lakers",
  MEM: "Memphis Grizzlies",
  VAN: "Vancouver Grizzlies",
  MIA: "Miami Heat",
  MIL: "Milwaukee Bucks",
  MIN: "Minnesota Timberwolves",
  NOH: "New Orleans Hornets",
  NOK: "New Orleans Hornets",
  NOP: "New Orleans Pelicans",
  NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder",
  SEA: "Seattle SuperSonics",
  ORL: "Orlando Magic",
  PHI: "Philadelphia 76ers",
  PHO: "Phoenix Suns",
  POR: "Portland Trail Blazers",
  SAC: "Sacramento Kings",
  SAS: "San Antonio Spurs",
  TOR: "Toronto Raptors",
  UTA: "Utah Jazz",
  WAS: "Washington Wizards",
  WSB: "Washington Bullets",
};

const teamColors = {
  "Atlanta Hawks": "#e03a3e",
  "Boston Celtics": "#007a33",
  "Brooklyn Nets": "#000000",
  "New Jersey Nets": "#00538c",
  "Buffalo Braves": "#e56020",
  "Charlotte Hornets": "#1d1160",
  "Chicago Bulls": "#ce1141",
  "Cleveland Cavaliers": "#6f263d",
  "Dallas Mavericks": "#00538c",
  "Denver Nuggets": "#0e2240",
  "Detroit Pistons": "#1d42ba",
  "Golden State Warriors": "#1d428a",
  "Houston Rockets": "#ce1141",
  "Indiana Pacers": "#fdbb30",
  "Kansas City Kings": "#5a2d81",
  "Los Angeles Clippers": "#c8102e",
  "San Diego Clippers": "#c8102e",
  "Los Angeles Lakers": "#552583",
  "Memphis Grizzlies": "#5d76a9",
  "Vancouver Grizzlies": "#5d76a9",
  "Miami Heat": "#98002e",
  "Milwaukee Bucks": "#00471b",
  "Minnesota Timberwolves": "#0c2340",
  "New Orleans Hornets": "#1d1160",
  "New Orleans Pelicans": "#0c2340",
  "New York Knicks": "#f58426",
  "Oklahoma City Thunder": "#007ac1",
  "Seattle SuperSonics": "#00653a",
  "Orlando Magic": "#0077c0",
  "Philadelphia 76ers": "#006bb6",
  "Phoenix Suns": "#e56020",
  "Portland Trail Blazers": "#e03a3e",
  "Sacramento Kings": "#5a2d81",
  "San Antonio Spurs": "#c4ced4",
  "Toronto Raptors": "#ce1141",
  "Utah Jazz": "#002b5c",
  "Washington Wizards": "#002b5c",
  "Washington Bullets": "#002b5c",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some(Boolean));
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(name) {
  return slugify(name).replace(/-/g, "");
}

function normalizePosition(position) {
  if (!position) return "G";
  if (position.includes("C")) return "C";
  if (position.includes("F")) return "F";
  return "G";
}

function mergeSeasons(seasons) {
  const sorted = [...new Set(seasons)].sort((a, b) => a - b);
  const ranges = [];

  for (const season of sorted) {
    const current = ranges[ranges.length - 1];
    if (current && season < current[1]) continue;
    if (current && season === current[1]) {
      current[1] = season + 1;
    } else {
      ranges.push([season, season + 1]);
    }
  }

  return ranges;
}

function loadExistingNba() {
  const sandbox = {
    window: { lineageSports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, "data/sports-manifest.js"), "utf8"), sandbox, {
    filename: "data/sports-manifest.js",
  });
  const scripts =
    process.env.NBA_BASE_ONLY === "1"
      ? ["data/nba/starter-pack.js", "data/nba/expansion-20260815.js"]
      : sandbox.window.lineageSportManifest.nba.scripts;
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
  }
  return sandbox.window.lineageSports.nba;
}

const existingNba = loadExistingNba();
const existingNames = new Set(existingNba.players.map((player) => normalizeName(player.name)));
const existingIds = new Set(existingNba.players.map((player) => player.id));
const needed = targetTotal - existingNba.players.length;

if (needed <= 0) {
  console.log(`NBA already has ${existingNba.players.length} players.`);
  process.exit(0);
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const header = rows.shift();
const column = Object.fromEntries(header.map((name, index) => [name, index]));
const byPlayer = new Map();

for (const row of rows) {
  if (row[column.type] !== "RS") continue;
  const teamId = row[column.team_id];
  if (teamId === "TOT") continue;

  const team = teamNames[teamId];
  if (!team) continue;

  const id = row[column.player_id];
  const name = row[column.name_common];
  const season = Number(row[column.year_id]) - 1;
  const games = Number(row[column.G]) || 0;
  const position = normalizePosition(row[column.pos]);

  if (!id || !name || !Number.isFinite(season)) continue;

  if (!byPlayer.has(id)) {
    byPlayer.set(id, {
      name,
      positions: new Map(),
      teams: new Map(),
      games: 0,
      war: 0,
      debut: season,
    });
  }

  const player = byPlayer.get(id);
  const war = Number(row[column["Raptor WAR"]]) || 0;
  player.games += games;
  player.war += war;
  player.debut = Math.min(player.debut, season);
  player.positions.set(position, (player.positions.get(position) || 0) + games);
  player.teams.set(team, [...(player.teams.get(team) || []), season]);
}

const candidates = [...byPlayer.entries()]
  .map(([sourceId, player]) => {
    const id = slugify(player.name);
    const position = [...player.positions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "G";
    const teams = [...player.teams.entries()]
      .flatMap(([team, seasons]) => mergeSeasons(seasons).map(([from, to]) => [team, from, to]))
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    const color = teamColors[teams[0]?.[0]] || "#334155";

    return {
      sourceId,
      id,
      name: player.name,
      normalizedName: normalizeName(player.name),
      position,
      color,
      teams,
      debut: player.debut,
      games: player.games,
      war: player.war,
      decade: Math.floor(player.debut / 10) * 10,
    };
  })
  .filter((player) => {
    if (player.debut < minDebut) return false;
    if (player.debut > maxDebut) return false;
    if (player.games < 500) return false;
    if (player.teams.length === 0) return false;
    if (existingNames.has(player.normalizedName)) return false;
    if (existingIds.has(player.id)) return false;
    return true;
  });

const selected = [];

if (pickStrategy === "impact") {
  selected.push(
    ...candidates
      .sort((a, b) => b.war - a.war || b.games - a.games || a.name.localeCompare(b.name))
      .slice(0, needed),
  );
} else {
  const buckets = new Map();
  for (const candidate of candidates.sort((a, b) => b.games - a.games || a.name.localeCompare(b.name))) {
    const key = `${candidate.decade}-${candidate.position}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(candidate);
  }

  const bucketKeys = [...buckets.keys()].sort();
  while (selected.length < needed && bucketKeys.some((key) => buckets.get(key).length)) {
    for (const key of bucketKeys) {
      const bucket = buckets.get(key);
      if (!bucket.length) continue;
      selected.push(bucket.shift());
      if (selected.length === needed) break;
    }
  }
}

if (selected.length < needed) {
  console.error(`Only found ${selected.length} eligible new NBA players; needed ${needed}.`);
  process.exit(1);
}

const chunks = [];
for (let index = 0; index < selected.length; index += batchSize) {
  chunks.push(selected.slice(index, index + batchSize));
}

for (const [index, chunk] of chunks.entries()) {
  const suffix = String.fromCharCode(startSuffixCode + index);
  const rowsName = `nbaGeneratedRows20260815${suffix.toUpperCase()}`;
  const sportName = `nbaGeneratedSport20260815${suffix.toUpperCase()}`;
  const filePath = path.join(root, `data/nba/generated-20260815-${suffix}.js`);
  const packedRows = chunk.map((player) => [
    player.id,
    player.name,
    player.position,
    player.color,
    player.teams,
    player.debut,
    player.games,
  ]);
  const content = `// Generated from FiveThirtyEight's nba-data-historical.csv.\nconst ${rowsName} = ${JSON.stringify(packedRows, null, 2)};\n\nconst ${sportName} = window.lineageSports.nba;\n${sportName}.players.push(\n  ...${rowsName}.map(([id, name, position, color, teams]) => ({\n    id,\n    name,\n    position,\n    color,\n    teams: teams.map(([team, from, to]) => ({ team, from, to })),\n  })),\n);\nObject.assign(\n  ${sportName}.careerStats,\n  Object.fromEntries(${rowsName}.map(([id, , , , , debut, games]) => [id, [debut, games]])),\n);\n`;
  fs.writeFileSync(filePath, content);
}

console.log(
  JSON.stringify(
    {
      existing: existingNba.players.length,
      added: selected.length,
      total: existingNba.players.length + selected.length,
      batches: chunks.map((chunk, index) => ({
        file: `data/nba/generated-20260815-${String.fromCharCode(startSuffixCode + index)}.js`,
        players: chunk.length,
      })),
    },
    null,
    2,
  ),
);
