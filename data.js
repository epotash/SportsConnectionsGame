// Compatibility layer for older local links. Prefer sport-specific data packs before app.js.
window.lineageSports = window.lineageSports || {};
window.lineageSports.nhl = {
  id: "nhl",
  label: "NHL",
  players: window.lineagePlayers || [],
  careerStats: window.lineageCareerStats || {},
};
window.players = window.lineageSports.nhl.players;
window.careerStats = window.lineageSports.nhl.careerStats;
