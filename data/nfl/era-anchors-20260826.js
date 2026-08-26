const nflEraAnchors20260826Raw = `
tom-brady|Tom Brady|QB|#002244|2000|335|New England Patriots,2000,2020;Tampa Bay Buccaneers,2020,2023
rob-gronkowski|Rob Gronkowski|TE|#002244|2010|143|New England Patriots,2010,2019;Tampa Bay Buccaneers,2020,2022
julian-edelman|Julian Edelman|WR|#002244|2009|137|New England Patriots,2009,2021
devin-mccourty|Devin McCourty|DB|#002244|2010|205|New England Patriots,2010,2023
logan-mankins|Logan Mankins|OL|#002244|2005|161|New England Patriots,2005,2014;Tampa Bay Buccaneers,2014,2016
larry-fitzgerald|Larry Fitzgerald|WR|#97233f|2004|263|Arizona Cardinals,2004,2021
patrick-peterson|Patrick Peterson|DB|#97233f|2011|201|Arizona Cardinals,2011,2021;Minnesota Vikings,2021,2023;Pittsburgh Steelers,2023,2024
calais-campbell|Calais Campbell|DL|#97233f|2008|244|Arizona Cardinals,2008,2017;Jacksonville Jaguars,2017,2020;Baltimore Ravens,2020,2023;Atlanta Falcons,2023,2024;Miami Dolphins,2024,2025;Arizona Cardinals,2025,2026
jason-witten|Jason Witten|TE|#003594|2003|271|Dallas Cowboys,2003,2018;Dallas Cowboys,2019,2020;Las Vegas Raiders,2020,2021
tony-romo|Tony Romo|QB|#003594|2004|156|Dallas Cowboys,2004,2017
tyron-smith|Tyron Smith|OL|#003594|2011|166|Dallas Cowboys,2011,2024;New York Jets,2024,2025
eli-manning|Eli Manning|QB|#0b2265|2004|236|New York Giants,2004,2020
justin-tuck|Justin Tuck|DL|#0b2265|2005|147|New York Giants,2005,2014;Oakland Raiders,2014,2016
brandon-jacobs|Brandon Jacobs|RB|#0b2265|2005|109|New York Giants,2005,2012;San Francisco 49ers,2012,2013;New York Giants,2013,2014
ben-roethlisberger|Ben Roethlisberger|QB|#ffb612|2004|249|Pittsburgh Steelers,2004,2022
hines-ward|Hines Ward|WR|#ffb612|1998|217|Pittsburgh Steelers,1998,2012
troy-polamalu|Troy Polamalu|DB|#ffb612|2003|158|Pittsburgh Steelers,2003,2015
terrell-suggs|Terrell Suggs|LB|#241773|2003|244|Baltimore Ravens,2003,2019;Arizona Cardinals,2019,2020;Kansas City Chiefs,2019,2020
haloti-ngata|Haloti Ngata|DL|#241773|2006|180|Baltimore Ravens,2006,2015;Detroit Lions,2015,2018;Philadelphia Eagles,2018,2019
joe-flacco|Joe Flacco|QB|#241773|2008|198|Baltimore Ravens,2008,2019;Denver Broncos,2019,2020;New York Jets,2020,2023;Cleveland Browns,2023,2024;Indianapolis Colts,2024,2025;Cleveland Browns,2025,2026
reggie-wayne|Reggie Wayne|WR|#002c5f|2001|211|Indianapolis Colts,2001,2015
marvin-harrison|Marvin Harrison|WR|#002c5f|1996|190|Indianapolis Colts,1996,2009
robert-mathis|Robert Mathis|LB|#002c5f|2003|192|Indianapolis Colts,2003,2017
t-y-hilton|T.Y. Hilton|WR|#002c5f|2012|143|Indianapolis Colts,2012,2022;Dallas Cowboys,2022,2023
philip-rivers|Philip Rivers|QB|#0080c6|2004|244|San Diego Chargers,2004,2017;Los Angeles Chargers,2017,2020;Indianapolis Colts,2020,2021
antonio-gates|Antonio Gates|TE|#0080c6|2003|236|San Diego Chargers,2003,2017;Los Angeles Chargers,2017,2019
cam-newton|Cam Newton|QB|#0085ca|2011|148|Carolina Panthers,2011,2020;New England Patriots,2020,2021;Carolina Panthers,2021,2022
thomas-davis|Thomas Davis|LB|#0085ca|2005|199|Carolina Panthers,2005,2019;Los Angeles Chargers,2019,2020;Washington Football Team,2020,2021
matt-ryan|Matt Ryan|QB|#a71930|2008|234|Atlanta Falcons,2008,2022;Indianapolis Colts,2022,2023
julio-jones|Julio Jones|WR|#a71930|2011|155|Atlanta Falcons,2011,2021;Tennessee Titans,2021,2022;Tampa Bay Buccaneers,2022,2023;Philadelphia Eagles,2023,2024
todd-herremans|Todd Herremans|OL|#004c54|2005|135|Philadelphia Eagles,2005,2015;Indianapolis Colts,2015,2016
tra-thomas|Tra Thomas|OL|#004c54|1998|174|Philadelphia Eagles,1998,2009;Jacksonville Jaguars,2009,2010;San Diego Chargers,2010,2011
lavar-arrington|LaVar Arrington|LB|#5a1414|2000|85|Washington Football Team,2000,2006;New York Giants,2006,2007
shaun-ohara|Shaun O'Hara|OL|#ff3c00|2000|151|Cleveland Browns,2000,2004;New York Giants,2004,2011
lofa-tatupu|Lofa Tatupu|LB|#002244|2005|84|Seattle Seahawks,2005,2011
justin-smith|Justin Smith|DL|#fb4f14|2001|221|Cincinnati Bengals,2001,2008;San Francisco 49ers,2008,2015
`.trim();

const nflEraAnchors20260826Rows = nflEraAnchors20260826Raw.split("\n").map((line) => {
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

const nflEraAnchorsSport20260826 = window.lineageSports.nfl;
const existingNflEraAnchorIds20260826 = new Set(nflEraAnchorsSport20260826.players.map((player) => player.id));
const existingNflEraAnchorNames20260826 = new Set(nflEraAnchorsSport20260826.players.map((player) => player.name));
const newNflEraAnchorIds20260826 = new Set();
const newNflEraAnchorNames20260826 = new Set();
const uniqueNflEraAnchors20260826Rows = nflEraAnchors20260826Rows.filter(([id, name]) => {
  if (
    existingNflEraAnchorIds20260826.has(id) ||
    existingNflEraAnchorNames20260826.has(name) ||
    newNflEraAnchorIds20260826.has(id) ||
    newNflEraAnchorNames20260826.has(name)
  ) {
    return false;
  }
  newNflEraAnchorIds20260826.add(id);
  newNflEraAnchorNames20260826.add(name);
  return true;
});

nflEraAnchorsSport20260826.players.push(
  ...uniqueNflEraAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  nflEraAnchorsSport20260826.careerStats,
  Object.fromEntries(uniqueNflEraAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
