const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const indexFile = path.join(root, "index.html");
const manifestFile = path.join(root, "data", "sports-manifest.js");
const checkOnly = process.argv.includes("--check");
const explicitVersion = process.argv.find((arg) => /^\d{8}[a-z]?$/.test(arg));

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function listJsFiles(dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(dir, file));
}

function loadManifest() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(manifestFile, "utf8"), sandbox, { filename: manifestFile });
  return sandbox.window.lineageSportManifest || {};
}

function currentVersion(indexHtml) {
  const match = indexHtml.match(/lineageAssetVersion\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("Could not find window.lineageAssetVersion in index.html.");
  return match[1];
}

function nextVersion(version) {
  const match = version.match(/^(\d{8})([a-z]?)$/);
  if (!match) throw new Error(`Unexpected cache version: ${version}`);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;

  if (match[1] !== datePart) return datePart;
  if (!match[2]) return `${datePart}b`;
  return `${datePart}${String.fromCharCode(match[2].charCodeAt(0) + 1)}`;
}

function assertManifestIncludesAllSportFiles() {
  const manifest = loadManifest();
  const errors = [];

  for (const sportId of ["nhl", "nba", "nfl", "mlb"]) {
    const expected = new Set(listJsFiles(path.join("data", sportId)));
    const registered = new Set((manifest[sportId]?.scripts || []).filter((script) => script.startsWith(`data/${sportId}/`)));

    for (const file of expected) {
      if (!registered.has(file)) errors.push(`${file} exists but is not listed in data/sports-manifest.js.`);
    }

    for (const file of registered) {
      if (!expected.has(file)) errors.push(`${file} is listed in data/sports-manifest.js but does not exist.`);
    }
  }

  if (errors.length) {
    throw new Error(`Manifest check failed:\n- ${errors.join("\n- ")}`);
  }
}

function assertIndexVersionsAreConsistent(indexHtml, version) {
  const versions = new Set([...indexHtml.matchAll(/\?v=([^"&]+)/g)].map((match) => match[1]));
  versions.add(currentVersion(indexHtml));

  if (versions.size !== 1 || !versions.has(version)) {
    throw new Error(`index.html has mixed cache versions: ${[...versions].join(", ")}`);
  }
}

function assertIndexIncludesAllBatchFiles(indexHtml) {
  const loadedScripts = new Set(
    [...indexHtml.matchAll(/<script\s+src="([^"?]+)(?:\?[^"]*)?"/g)].map((match) => match[1]),
  );
  const errors = [];

  for (const file of listJsFiles(path.join("data", "batches"))) {
    if (!loadedScripts.has(file)) errors.push(`${file} exists but is not loaded by index.html.`);
  }

  if (errors.length) {
    throw new Error(`Index script check failed:\n- ${errors.join("\n- ")}`);
  }
}

function bumpIndexVersion(fromVersion, toVersion) {
  const indexHtml = fs.readFileSync(indexFile, "utf8");
  const bumped = indexHtml
    .replaceAll(`?v=${fromVersion}`, `?v=${toVersion}`)
    .replace(`lineageAssetVersion = "${fromVersion}"`, `lineageAssetVersion = "${toVersion}"`);

  fs.writeFileSync(indexFile, bumped);
  return bumped;
}

function runValidation() {
  const result = childProcess.spawnSync(process.execPath, ["scripts/validate-data.js"], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    throw new Error("Data validation failed.");
  }
}

try {
  const indexHtml = fs.readFileSync(indexFile, "utf8");
  const fromVersion = currentVersion(indexHtml);
  const toVersion = explicitVersion || nextVersion(fromVersion);

  assertManifestIncludesAllSportFiles();
  assertIndexIncludesAllBatchFiles(indexHtml);

  if (checkOnly) {
    assertIndexVersionsAreConsistent(indexHtml, fromVersion);
  } else {
    const bumped = bumpIndexVersion(fromVersion, toVersion);
    assertIndexVersionsAreConsistent(bumped, toVersion);
  }

  runValidation();

  console.log(
    checkOnly
      ? `Publish check passed. Current cache version is ${fromVersion}.`
      : `Publish prep passed. Cache version bumped from ${fromVersion} to ${toVersion}.`,
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
