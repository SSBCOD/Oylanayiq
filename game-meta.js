const GAMES = [
  { id: 'nomad', name: 'Keruen Zholy', maxLevels: 10 },
  { id: 'tamga', name: 'Tamba Shesher', maxLevels: 10 },
  { id: 'labirint', name: 'Otyrar Labirinti', maxLevels: 10 },
  { id: 'qamal', name: 'Qorgan', maxLevels: 10 },
  { id: 'estek', name: 'Zhady', maxLevels: 10 },
  { id: 'altyn', name: 'Altyn Adam', maxLevels: 10 },
  { id: 'dialog', name: 'Ulagat', maxLevels: 10 },
  { id: 'baiterek', name: 'Baiterek Zharys', maxLevels: 10 },
  { id: 'expo', name: 'San Alemi', maxLevels: 10 },
  { id: 'cyber', name: 'Kiberqalqan', maxLevels: 10 },
  { id: 'qala', name: 'Qala Bileti', maxLevels: 10 },
  { id: 'soztorr', name: 'Soztorr', maxLevels: 10 }
];

const GAME_IDS = GAMES.map(g => g.id);
const GAMES_META = Object.fromEntries(GAMES.map(g => [g.id, { name: g.name, maxLevels: g.maxLevels }]));

module.exports = { GAMES, GAME_IDS, GAMES_META };
