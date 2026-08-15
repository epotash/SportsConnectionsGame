# Player Data

Player data is split so the game can keep growing without turning `app.js` into a giant file.

- `players.js` contains the NHL baseline `window.lineagePlayers` rows.
- `career-stats.js` contains NHL `window.lineageCareerStats`, used only for endpoint eligibility.
- `batches/*.js` can add large NHL groups without making the base files harder to scan.
- `nba/starter-pack.js` contains the first NBA sport pack as `window.lineageSports.nba`.
- `data.js` registers the existing NHL data as `window.lineageSports.nhl`.
- Team ranges are `[from, to)`, where `from` is the season start year.
- A deadline stint in 2007-08 is `{ team: "Team Name", from: 2007, to: 2008 }`.
- Any player in the selected sport pack can be used as a connector.
- Games-played thresholds only decide whether a player can appear as a matchup endpoint.

After adding players, run:

```sh
node scripts/validate-data.js
```
