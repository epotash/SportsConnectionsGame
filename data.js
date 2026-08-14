// Compatibility layer for older local links. Prefer loading data/players.js and data/career-stats.js before app.js.
window.players = window.lineagePlayers || [];
window.careerStats = window.lineageCareerStats || {};
