const mlbExpansion20260821DRaw = `
jose-canseco|Jose Canseco|OF/DH|#003831|1985|1887|Oakland Athletics,1985,1993;Texas Rangers,1992,1995;Boston Red Sox,1995,1996;Oakland Athletics,1997,1998;Toronto Blue Jays,1998,1999;Tampa Bay Devil Rays,1999,2000;New York Yankees,2000,2001;Chicago White Sox,2001,2002
juan-gonzalez|Juan Gonzalez|OF|#003278|1989|1689|Texas Rangers,1989,2000;Detroit Tigers,2000,2001;Cleveland Indians,2001,2002;Texas Rangers,2002,2004;Kansas City Royals,2004,2005;Cleveland Indians,2005,2006
gary-gaetti|Gary Gaetti|3B|#002b5c|1981|2507|Minnesota Twins,1981,1991;California Angels,1991,1993;Kansas City Royals,1993,1996;St. Louis Cardinals,1996,1999;Chicago Cubs,1999,2000;Boston Red Sox,2000,2001
robin-ventura|Robin Ventura|3B|#27251f|1989|2079|Chicago White Sox,1989,1999;New York Mets,1999,2002;New York Yankees,2002,2004;Los Angeles Dodgers,2003,2004
wally-joyner|Wally Joyner|1B|#ba0021|1986|2033|California Angels,1986,1992;Kansas City Royals,1992,1996;San Diego Padres,1996,2000;Atlanta Braves,2000,2001;Anaheim Angels,2001,2002
tim-wallach|Tim Wallach|3B|#003278|1980|2212|Montreal Expos,1980,1993;Los Angeles Dodgers,1993,1997;California Angels,1996,1997
kevin-tapani|Kevin Tapani|P|#ff5910|1989|361|New York Mets,1989,1990;Minnesota Twins,1989,1995;Los Angeles Dodgers,1995,1996;Chicago White Sox,1996,1997;Chicago Cubs,1997,2002
jim-abbott|Jim Abbott|P|#ba0021|1989|263|California Angels,1989,1993;New York Yankees,1993,1995;Chicago White Sox,1995,1996;California Angels,1995,1997;Milwaukee Brewers,1999,2000
wilson-alvarez|Wilson Alvarez|P|#003278|1989|355|Texas Rangers,1989,1990;Chicago White Sox,1991,1998;San Francisco Giants,1997,1998;Tampa Bay Devil Rays,1998,2003;Los Angeles Dodgers,2003,2006
shane-reynolds|Shane Reynolds|P|#eb6e1f|1992|306|Houston Astros,1992,2003;Atlanta Braves,2003,2004;Arizona Diamondbacks,2004,2005
darryl-kile|Darryl Kile|P|#eb6e1f|1991|359|Houston Astros,1991,1998;Colorado Rockies,1998,2000;St. Louis Cardinals,2000,2003
jose-mesa|Jose Mesa|P|#df4601|1987|1022|Baltimore Orioles,1987,1993;Cleveland Indians,1992,1999;San Francisco Giants,1998,1999;Seattle Mariners,1999,2000;Philadelphia Phillies,2001,2004;Pittsburgh Pirates,2004,2006;Colorado Rockies,2006,2007;Detroit Tigers,2007,2008;Philadelphia Phillies,2007,2008
steve-avery|Steve Avery|P|#ce1141|1990|297|Atlanta Braves,1990,1997;Boston Red Sox,1997,1999;Cincinnati Reds,1999,2000;Detroit Tigers,2003,2004
charles-nagy|Charles Nagy|P|#e31937|1990|318|Cleveland Indians,1990,2003;San Diego Padres,2003,2004
pete-harnisch|Pete Harnisch|P|#df4601|1988|356|Baltimore Orioles,1988,1991;Houston Astros,1991,1995;New York Mets,1995,1998;Milwaukee Brewers,1997,1998;Cincinnati Reds,1998,2002
`.trim();

const mlbExpansion20260821DRows = mlbExpansion20260821DRaw.split("\n").map((line) => {
  const [id, name, position, color, debut, games, teamsRaw] = line.split("|");
  return [
    id,
    name,
    position,
    color,
    teamsRaw.split(";").map((teamLine) => {
      const [team, from, to] = teamLine.split(",");
      return [team, Number(from), Number(to)];
    }),
    Number(debut),
    Number(games),
  ];
});

const mlbExpansionSport20260821D = window.lineageSports.mlb;
const existingMlbExpansion20260821DIds = new Set(mlbExpansionSport20260821D.players.map((player) => player.id));
const existingMlbExpansion20260821DNames = new Set(mlbExpansionSport20260821D.players.map((player) => player.name));
const newMlbExpansion20260821DIds = new Set();
const newMlbExpansion20260821DNames = new Set();
const uniqueMlbExpansion20260821DRows = mlbExpansion20260821DRows.filter(([id, name]) => {
  if (newMlbExpansion20260821DIds.size >= 15) {
    return false;
  }
  if (
    existingMlbExpansion20260821DIds.has(id) ||
    existingMlbExpansion20260821DNames.has(name) ||
    newMlbExpansion20260821DIds.has(id) ||
    newMlbExpansion20260821DNames.has(name)
  ) {
    return false;
  }
  newMlbExpansion20260821DIds.add(id);
  newMlbExpansion20260821DNames.add(name);
  return true;
});

mlbExpansionSport20260821D.players.push(
  ...uniqueMlbExpansion20260821DRows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  mlbExpansionSport20260821D.careerStats,
  Object.fromEntries(uniqueMlbExpansion20260821DRows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
