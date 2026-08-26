const nhlTenYearAnchors20260826Raw = `
henri-richard|Henri Richard|C|hsl(0 80% 42%)|1955|1256|Montreal Canadiens,1955,1975
maurice-richard|Maurice Richard|RW|hsl(0 80% 42%)|1942|978|Montreal Canadiens,1942,1960
jacques-plante|Jacques Plante|G|hsl(0 80% 42%)|1952|837|Montreal Canadiens,1952,1963;New York Rangers,1963,1965;St. Louis Blues,1968,1970;Toronto Maple Leafs,1970,1973;Boston Bruins,1972,1973
guy-lapointe|Guy Lapointe|D|hsl(0 80% 42%)|1968|894|Montreal Canadiens,1968,1982;St. Louis Blues,1982,1984;Boston Bruins,1984,1985
jacques-laperriere|Jacques Laperriere|D|hsl(0 80% 42%)|1962|691|Montreal Canadiens,1962,1974
butch-bouchard|Butch Bouchard|D|hsl(0 80% 42%)|1941|785|Montreal Canadiens,1941,1956
bernie-geoffrion|Bernie Geoffrion|RW|hsl(0 80% 42%)|1950|883|Montreal Canadiens,1950,1964;New York Rangers,1966,1968
doug-harvey|Doug Harvey|D|hsl(0 80% 42%)|1947|1113|Montreal Canadiens,1947,1961;New York Rangers,1961,1963;Detroit Red Wings,1963,1964;St. Louis Blues,1968,1969
harry-howell|Harry Howell|D|hsl(205 70% 35%)|1952|1411|New York Rangers,1952,1969;Oakland Seals,1969,1971;Los Angeles Kings,1970,1973
andy-bathgate|Andy Bathgate|RW|hsl(205 70% 35%)|1952|1069|New York Rangers,1952,1964;Toronto Maple Leafs,1963,1965;Detroit Red Wings,1965,1967;Pittsburgh Penguins,1967,1968;Vancouver Canucks,1970,1971
eddie-giacomin|Eddie Giacomin|G|hsl(205 70% 35%)|1965|609|New York Rangers,1965,1976;Detroit Red Wings,1975,1978
ron-greschner|Ron Greschner|D|hsl(205 70% 35%)|1974|981|New York Rangers,1974,1990
ron-ellis|Ron Ellis|RW|hsl(214 75% 38%)|1963|1034|Toronto Maple Leafs,1963,1981
george-armstrong|George Armstrong|RW|hsl(214 75% 38%)|1949|1188|Toronto Maple Leafs,1949,1971
tim-horton|Tim Horton|D|hsl(214 75% 38%)|1949|1446|Toronto Maple Leafs,1949,1970;New York Rangers,1970,1971;Pittsburgh Penguins,1971,1972;Buffalo Sabres,1972,1974
johnny-bower|Johnny Bower|G|hsl(214 75% 38%)|1953|552|New York Rangers,1953,1954;Toronto Maple Leafs,1958,1970
ted-kennedy|Ted Kennedy|C|hsl(214 75% 38%)|1942|696|Toronto Maple Leafs,1942,1957
gordie-howe|Gordie Howe|RW|hsl(0 70% 45%)|1946|1767|Detroit Red Wings,1946,1971;Hartford Whalers,1979,1980
marcel-pronovost|Marcel Pronovost|D|hsl(0 70% 45%)|1949|1206|Detroit Red Wings,1949,1965;Toronto Maple Leafs,1965,1970
keith-magnuson|Keith Magnuson|D|hsl(0 0% 12%)|1969|589|Chicago Blackhawks,1969,1980
mike-ramsey|Mike Ramsey|D|hsl(214 90% 45%)|1979|1070|Buffalo Sabres,1979,1993;Pittsburgh Penguins,1992,1994;Detroit Red Wings,1994,1997
lindy-ruff|Lindy Ruff|D|hsl(214 90% 45%)|1979|691|Buffalo Sabres,1979,1989;New York Rangers,1989,1991
bobby-orr|Bobby Orr|D|hsl(42 82% 48%)|1966|657|Boston Bruins,1966,1976;Chicago Blackhawks,1976,1979
barclay-plager|Barclay Plager|D|hsl(215 70% 42%)|1967|614|St. Louis Blues,1967,1977
bob-plager|Bob Plager|D|hsl(215 70% 42%)|1964|644|New York Rangers,1964,1967;St. Louis Blues,1967,1978
`.trim();

const nhlTenYearAnchors20260826Rows = nhlTenYearAnchors20260826Raw.split("\n").map((line) => {
  const [id, name, position, color, debut, games, teamsRaw] = line.split("|");
  return [
    id,
    name,
    position,
    color,
    teamsRaw.split(";").map((teamLine) => {
      const [team, from, to] = teamLine.split(",");
      return { team, from: Number(from), to: Number(to) };
    }),
    Number(debut),
    Number(games),
  ];
});

const existingNhlTenYearAnchorIds20260826 = new Set(window.lineagePlayers.map((player) => player.id));
const existingNhlTenYearAnchorNames20260826 = new Set(window.lineagePlayers.map((player) => player.name));
const uniqueNhlTenYearAnchors20260826Rows = nhlTenYearAnchors20260826Rows.filter(
  ([id, name]) => !existingNhlTenYearAnchorIds20260826.has(id) && !existingNhlTenYearAnchorNames20260826.has(name),
);

window.lineagePlayers.push(
  ...uniqueNhlTenYearAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams,
  })),
);

Object.assign(
  window.lineageCareerStats,
  Object.fromEntries(uniqueNhlTenYearAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
