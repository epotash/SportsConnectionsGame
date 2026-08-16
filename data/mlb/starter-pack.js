const mlbStarterRaw = `
derek-jeter|Derek Jeter|SS|#132448|1995|2747|New York Yankees,1995,2015
alex-rodriguez|Alex Rodriguez|SS/3B|#132448|1994|2784|Seattle Mariners,1994,2001;Texas Rangers,2001,2004;New York Yankees,2004,2017
mariano-rivera|Mariano Rivera|P|#132448|1995|1115|New York Yankees,1995,2014
andy-pettitte|Andy Pettitte|P|#132448|1995|531|New York Yankees,1995,2004;Houston Astros,2004,2007;New York Yankees,2007,2011;New York Yankees,2012,2014
jorge-posada|Jorge Posada|C|#132448|1995|1829|New York Yankees,1995,2012
bernie-williams|Bernie Williams|CF|#132448|1991|2076|New York Yankees,1991,2007
hideki-matsui|Hideki Matsui|OF|#132448|2003|1236|New York Yankees,2003,2010;Los Angeles Angels,2010,2011;Oakland Athletics,2011,2012;Tampa Bay Rays,2012,2013
robinson-cano|Robinson Cano|2B|#132448|2005|2267|New York Yankees,2005,2014;Seattle Mariners,2014,2019;New York Mets,2019,2022;San Diego Padres,2022,2023;Atlanta Braves,2022,2023
cc-sabathia|CC Sabathia|P|#132448|2001|561|Cleveland Indians,2001,2008;Milwaukee Brewers,2008,2009;New York Yankees,2009,2020
mark-teixeira|Mark Teixeira|1B|#132448|2003|1862|Texas Rangers,2003,2007;Atlanta Braves,2007,2008;Los Angeles Angels,2008,2009;New York Yankees,2009,2017
curtis-granderson|Curtis Granderson|OF|#0c2340|2004|2057|Detroit Tigers,2004,2010;New York Yankees,2010,2014;New York Mets,2014,2017;Los Angeles Dodgers,2017,2018;Toronto Blue Jays,2018,2019;Milwaukee Brewers,2018,2019;Miami Marlins,2019,2020
ichiro-suzuki|Ichiro Suzuki|OF|#0c2c56|2001|2653|Seattle Mariners,2001,2012;New York Yankees,2012,2015;Miami Marlins,2015,2018;Seattle Mariners,2018,2020
ken-griffey-jr|Ken Griffey Jr.|CF|#0c2c56|1989|2671|Seattle Mariners,1989,2000;Cincinnati Reds,2000,2008;Chicago White Sox,2008,2009;Seattle Mariners,2009,2011
edgar-martinez|Edgar Martinez|DH|#0c2c56|1987|2055|Seattle Mariners,1987,2005
randy-johnson|Randy Johnson|P|#0c2c56|1988|618|Montreal Expos,1988,1989;Seattle Mariners,1989,1999;Houston Astros,1998,1999;Arizona Diamondbacks,1999,2005;New York Yankees,2005,2007;Arizona Diamondbacks,2007,2009;San Francisco Giants,2009,2010
felix-hernandez|Felix Hernandez|P|#0c2c56|2005|419|Seattle Mariners,2005,2020
nelson-cruz|Nelson Cruz|OF/DH|#0c2c56|2005|2055|Milwaukee Brewers,2005,2006;Texas Rangers,2006,2014;Baltimore Orioles,2014,2015;Seattle Mariners,2015,2019;Minnesota Twins,2019,2021;Tampa Bay Rays,2021,2022;Washington Nationals,2022,2023;San Diego Padres,2023,2024
david-ortiz|David Ortiz|DH|#bd3039|1997|2408|Minnesota Twins,1997,2003;Boston Red Sox,2003,2017
pedro-martinez|Pedro Martinez|P|#bd3039|1992|476|Los Angeles Dodgers,1992,1994;Montreal Expos,1994,1998;Boston Red Sox,1998,2005;New York Mets,2005,2009;Philadelphia Phillies,2009,2010
nomar-garciaparra|Nomar Garciaparra|SS|#bd3039|1996|1434|Boston Red Sox,1996,2004;Chicago Cubs,2004,2006;Los Angeles Dodgers,2006,2009;Oakland Athletics,2009,2010
manny-ramirez|Manny Ramirez|OF|#bd3039|1993|2302|Cleveland Indians,1993,2001;Boston Red Sox,2001,2008;Los Angeles Dodgers,2008,2011;Tampa Bay Rays,2011,2012
jonathan-papelbon|Jonathan Papelbon|P|#bd3039|2005|689|Boston Red Sox,2005,2012;Philadelphia Phillies,2012,2015;Washington Nationals,2015,2016
dustin-pedroia|Dustin Pedroia|2B|#bd3039|2006|1512|Boston Red Sox,2006,2020
mookie-betts|Mookie Betts|RF|#bd3039|2014|1382|Boston Red Sox,2014,2020;Los Angeles Dodgers,2020,2026
xander-bogaerts|Xander Bogaerts|SS|#bd3039|2013|1571|Boston Red Sox,2013,2023;San Diego Padres,2023,2026
chris-sale|Chris Sale|P|#bd3039|2010|398|Chicago White Sox,2010,2017;Boston Red Sox,2017,2024;Atlanta Braves,2024,2026
clayton-kershaw|Clayton Kershaw|P|#005a9c|2008|430|Los Angeles Dodgers,2008,2026
justin-turner|Justin Turner|3B|#005a9c|2009|1679|Baltimore Orioles,2009,2011;New York Mets,2010,2014;Los Angeles Dodgers,2014,2023;Boston Red Sox,2023,2024;Toronto Blue Jays,2024,2025;Seattle Mariners,2024,2025;Chicago Cubs,2025,2026
cody-bellinger|Cody Bellinger|OF/1B|#005a9c|2017|1037|Los Angeles Dodgers,2017,2023;Chicago Cubs,2023,2025;New York Yankees,2025,2026
corey-seager|Corey Seager|SS|#005a9c|2015|1045|Los Angeles Dodgers,2015,2022;Texas Rangers,2022,2026
max-scherzer|Max Scherzer|P|#ab0003|2008|473|Arizona Diamondbacks,2008,2010;Detroit Tigers,2010,2015;Washington Nationals,2015,2021;Los Angeles Dodgers,2021,2022;New York Mets,2022,2023;Texas Rangers,2023,2025;Toronto Blue Jays,2025,2026
freddie-freeman|Freddie Freeman|1B|#ce1141|2010|2080|Atlanta Braves,2010,2022;Los Angeles Dodgers,2022,2026
trea-turner|Trea Turner|SS|#ab0003|2015|1201|Washington Nationals,2015,2021;Los Angeles Dodgers,2021,2023;Philadelphia Phillies,2023,2026
shohei-ohtani|Shohei Ohtani|DH/P|#ba0021|2018|860|Los Angeles Angels,2018,2024;Los Angeles Dodgers,2024,2026
mike-trout|Mike Trout|CF|#ba0021|2011|1518|Los Angeles Angels,2011,2026
albert-pujols|Albert Pujols|1B|#c41e3a|2001|3080|St. Louis Cardinals,2001,2012;Los Angeles Angels,2012,2021;Los Angeles Dodgers,2021,2022;St. Louis Cardinals,2022,2023
yadier-molina|Yadier Molina|C|#c41e3a|2004|2224|St. Louis Cardinals,2004,2023
adam-wainwright|Adam Wainwright|P|#c41e3a|2005|478|St. Louis Cardinals,2005,2024
paul-goldschmidt|Paul Goldschmidt|1B|#a71930|2011|1928|Arizona Diamondbacks,2011,2019;St. Louis Cardinals,2019,2025;New York Yankees,2025,2026
nolan-arenado|Nolan Arenado|3B|#33006f|2013|1679|Colorado Rockies,2013,2021;St. Louis Cardinals,2021,2026
matt-holliday|Matt Holliday|OF|#33006f|2004|1903|Colorado Rockies,2004,2009;Oakland Athletics,2009,2010;St. Louis Cardinals,2009,2017;New York Yankees,2017,2018;Colorado Rockies,2018,2019
miguel-cabrera|Miguel Cabrera|1B/3B|#00a3e0|2003|2797|Florida Marlins,2003,2008;Detroit Tigers,2008,2024
justin-verlander|Justin Verlander|P|#0c2340|2005|526|Detroit Tigers,2005,2017;Houston Astros,2017,2023;New York Mets,2023,2024;Houston Astros,2023,2026
buster-posey|Buster Posey|C|#fd5a1e|2009|1371|San Francisco Giants,2009,2022
madison-bumgarner|Madison Bumgarner|P|#fd5a1e|2009|388|San Francisco Giants,2009,2020;Arizona Diamondbacks,2020,2023
brandon-crawford|Brandon Crawford|SS|#fd5a1e|2011|1682|San Francisco Giants,2011,2024;St. Louis Cardinals,2024,2025
barry-bonds|Barry Bonds|LF|#fd5a1e|1986|2986|Pittsburgh Pirates,1986,1993;San Francisco Giants,1993,2008
jeff-kent|Jeff Kent|2B|#fd5a1e|1992|2298|Toronto Blue Jays,1992,1993;New York Mets,1992,1996;Cleveland Indians,1996,1997;San Francisco Giants,1997,2003;Houston Astros,2003,2005;Los Angeles Dodgers,2005,2009
bryce-harper|Bryce Harper|OF/1B|#ab0003|2012|1695|Washington Nationals,2012,2019;Philadelphia Phillies,2019,2026
jayson-werth|Jayson Werth|OF|#e81828|2002|1583|Toronto Blue Jays,2002,2004;Los Angeles Dodgers,2004,2006;Philadelphia Phillies,2007,2011;Washington Nationals,2011,2018
ryan-howard|Ryan Howard|1B|#e81828|2004|1572|Philadelphia Phillies,2004,2017
chase-utley|Chase Utley|2B|#e81828|2003|1937|Philadelphia Phillies,2003,2015;Los Angeles Dodgers,2015,2019
jimmy-rollins|Jimmy Rollins|SS|#e81828|2000|2275|Philadelphia Phillies,2000,2015;Los Angeles Dodgers,2015,2016;Chicago White Sox,2016,2017
cole-hamels|Cole Hamels|P|#e81828|2006|423|Philadelphia Phillies,2006,2015;Texas Rangers,2015,2018;Chicago Cubs,2018,2020;Atlanta Braves,2020,2021
roy-halladay|Roy Halladay|P|#134a8e|1998|416|Toronto Blue Jays,1998,2010;Philadelphia Phillies,2010,2014
jose-altuve|Jose Altuve|2B|#eb6e1f|2011|1768|Houston Astros,2011,2026
carlos-correa|Carlos Correa|SS|#eb6e1f|2015|1110|Houston Astros,2015,2022;Minnesota Twins,2022,2026
george-springer|George Springer|OF|#eb6e1f|2014|1379|Houston Astros,2014,2021;Toronto Blue Jays,2021,2026
alex-bregman|Alex Bregman|3B|#eb6e1f|2016|1111|Houston Astros,2016,2025;Boston Red Sox,2025,2026
gerrit-cole|Gerrit Cole|P|#fdb827|2013|317|Pittsburgh Pirates,2013,2018;Houston Astros,2018,2020;New York Yankees,2020,2026
zack-greinke|Zack Greinke|P|#005a9c|2004|586|Kansas City Royals,2004,2011;Milwaukee Brewers,2011,2012;Los Angeles Angels,2012,2013;Los Angeles Dodgers,2013,2016;Arizona Diamondbacks,2016,2019;Houston Astros,2019,2022;Kansas City Royals,2022,2024
jose-bautista|Jose Bautista|RF|#134a8e|2004|1798|Baltimore Orioles,2004,2005;Tampa Bay Rays,2004,2005;Kansas City Royals,2004,2005;Pittsburgh Pirates,2004,2008;Toronto Blue Jays,2008,2018;Atlanta Braves,2018,2019;New York Mets,2018,2019;Philadelphia Phillies,2018,2019
josh-donaldson|Josh Donaldson|3B|#003831|2010|1384|Oakland Athletics,2010,2015;Toronto Blue Jays,2015,2019;Cleveland Indians,2018,2019;Atlanta Braves,2019,2020;Minnesota Twins,2020,2022;New York Yankees,2022,2023;Milwaukee Brewers,2023,2024
vladimir-guerrero-jr|Vladimir Guerrero Jr.|1B|#134a8e|2019|819|Toronto Blue Jays,2019,2026
bo-bichette|Bo Bichette|SS|#134a8e|2019|659|Toronto Blue Jays,2019,2026
joey-votto|Joey Votto|1B|#c6011f|2007|2056|Cincinnati Reds,2007,2024
brandon-phillips|Brandon Phillips|2B|#c6011f|2002|2121|Cleveland Indians,2002,2006;Cincinnati Reds,2006,2017;Atlanta Braves,2017,2018;Los Angeles Angels,2017,2018;Boston Red Sox,2018,2019
adrian-beltre|Adrian Beltre|3B|#005a9c|1998|2933|Los Angeles Dodgers,1998,2005;Seattle Mariners,2005,2010;Boston Red Sox,2010,2011;Texas Rangers,2011,2019
ivan-rodriguez|Ivan Rodriguez|C|#003278|1991|2543|Texas Rangers,1991,2003;Florida Marlins,2003,2004;Detroit Tigers,2004,2009;New York Yankees,2008,2009;Houston Astros,2009,2010;Texas Rangers,2009,2010;Washington Nationals,2010,2012
juan-soto|Juan Soto|OF|#ab0003|2018|1070|Washington Nationals,2018,2022;San Diego Padres,2022,2024;New York Yankees,2024,2025;New York Mets,2025,2026
fernando-tatis-jr|Fernando Tatis Jr.|RF|#2f241d|2019|575|San Diego Padres,2019,2026
manny-machado|Manny Machado|3B|#df4601|2012|1813|Baltimore Orioles,2012,2018;Los Angeles Dodgers,2018,2019;San Diego Padres,2019,2026
yu-darvish|Yu Darvish|P|#003278|2012|335|Texas Rangers,2012,2017;Los Angeles Dodgers,2017,2018;Chicago Cubs,2018,2021;San Diego Padres,2021,2026
jake-peavy|Jake Peavy|P|#2f241d|2002|388|San Diego Padres,2002,2009;Chicago White Sox,2009,2013;Boston Red Sox,2013,2014;San Francisco Giants,2014,2017
kris-bryant|Kris Bryant|3B/OF|#0e3386|2015|1037|Chicago Cubs,2015,2021;San Francisco Giants,2021,2022;Colorado Rockies,2022,2026
anthony-rizzo|Anthony Rizzo|1B|#0e3386|2011|1727|San Diego Padres,2011,2012;Chicago Cubs,2012,2021;New York Yankees,2021,2025
javier-baez|Javier Baez|SS|#0e3386|2014|1293|Chicago Cubs,2014,2021;New York Mets,2021,2022;Detroit Tigers,2022,2026
jon-lester|Jon Lester|P|#bd3039|2006|452|Boston Red Sox,2006,2014;Oakland Athletics,2014,2015;Chicago Cubs,2015,2021;Washington Nationals,2021,2022;St. Louis Cardinals,2021,2022
ben-zobrist|Ben Zobrist|UTIL|#092c5c|2006|1651|Tampa Bay Rays,2006,2015;Oakland Athletics,2015,2016;Kansas City Royals,2015,2016;Chicago Cubs,2016,2020
evan-longoria|Evan Longoria|3B|#092c5c|2008|1986|Tampa Bay Rays,2008,2018;San Francisco Giants,2018,2023;Arizona Diamondbacks,2023,2024
andrew-mccutchen|Andrew McCutchen|OF|#fdb827|2009|2161|Pittsburgh Pirates,2009,2018;San Francisco Giants,2018,2019;New York Yankees,2018,2019;Philadelphia Phillies,2019,2022;Milwaukee Brewers,2022,2023;Pittsburgh Pirates,2023,2026
giancarlo-stanton|Giancarlo Stanton|OF/DH|#00a3e0|2010|1599|Florida Marlins,2010,2012;Miami Marlins,2012,2018;New York Yankees,2018,2026
christian-yelich|Christian Yelich|OF|#00a3e0|2013|1481|Miami Marlins,2013,2018;Milwaukee Brewers,2018,2026
ozzie-albies|Ozzie Albies|2B|#ce1141|2017|914|Atlanta Braves,2017,2026
ronald-acuna-jr|Ronald Acuna Jr.|OF|#ce1141|2018|722|Atlanta Braves,2018,2026
austin-riley|Austin Riley|3B|#ce1141|2019|783|Atlanta Braves,2019,2026
chipper-jones|Chipper Jones|3B|#ce1141|1993|2499|Atlanta Braves,1993,2013
greg-maddux|Greg Maddux|P|#0e3386|1986|744|Chicago Cubs,1986,1993;Atlanta Braves,1993,2004;Chicago Cubs,2004,2006;Los Angeles Dodgers,2006,2007;San Diego Padres,2007,2008;Los Angeles Dodgers,2008,2009
tom-glavine|Tom Glavine|P|#ce1141|1987|682|Atlanta Braves,1987,2003;New York Mets,2003,2008;Atlanta Braves,2008,2009
john-smoltz|John Smoltz|P|#ce1141|1988|723|Atlanta Braves,1988,2009;Boston Red Sox,2009,2010;St. Louis Cardinals,2009,2010
francisco-lindor|Francisco Lindor|SS|#e31937|2015|1266|Cleveland Indians,2015,2021;New York Mets,2021,2026
jose-ramirez|Jose Ramirez|3B|#e31937|2013|1492|Cleveland Indians,2013,2022;Cleveland Guardians,2022,2026
jose-reyes|Jose Reyes|SS|#002d72|2003|1877|New York Mets,2003,2012;Miami Marlins,2012,2013;Toronto Blue Jays,2013,2015;Colorado Rockies,2015,2016;New York Mets,2016,2019
david-wright|David Wright|3B|#002d72|2004|1585|New York Mets,2004,2019
jacob-degrom|Jacob deGrom|P|#002d72|2014|224|New York Mets,2014,2023;Texas Rangers,2023,2026
pete-alonso|Pete Alonso|1B|#002d72|2019|846|New York Mets,2019,2026
`.trim();

const mlbStarterRows = mlbStarterRaw.split("\n").map((line) => {
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

window.lineageSports = window.lineageSports || {};
window.lineageSports.mlb = {
  id: "mlb",
  label: "MLB",
  players: mlbStarterRows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
  careerStats: Object.fromEntries(mlbStarterRows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
};
