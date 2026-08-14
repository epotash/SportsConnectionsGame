# Lineage

Lineage is a playable prototype for a sports connection game. Players connect two randomly selected NHL players by building a chain of athletes who were teammates during an overlapping NHL season.

## Play

The game is a static website, so it can be hosted directly with GitHub Pages.

## Run locally

Open `index.html` directly, or serve the directory locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish with GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then save.

GitHub will publish the game at `https://<username>.github.io/<repository>/`.

## Prototype scope

- Randomized matchups with valid multi-link paths
- Searchable curated player graph with 245+ established stars, role players, and goalies
- Any NHL player in the dataset can be used as a teammate link
- Tiered endpoint rules: players debuting in 1980–81 or later need 500+ games as skaters or 200+ as goalies; earlier players need 800+ or 400+, respectively
- Teammate validation with team and season proof
- Hints, undo, timer, par, sharing, and local stats
- Responsive desktop and mobile layout

The player graph is intentionally small for the prototype. A production version should source canonical roster data from a licensed sports data provider and validate every edge server-side.
