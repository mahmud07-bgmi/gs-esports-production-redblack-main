const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1gyzPFtG3ubxzrqGEtQI-dr4aiExDU6Fx0tzFS2W4iG8/';
const SHEET_GID = '692081236';
const REFRESH_EVERY = 2000;

/* CHARACTER IMAGE CODE SE */
const CHARACTER_IMAGE = "assets/c2.png";

function getGvizUrl(sheetUrl, gid) {
  const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;
  const sheetId = match[1];
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&headers=1&tq=SELECT%20*`;
}

function normalizeHeader(text) {
  return String(text).toLowerCase().trim().replace(/\s+/g, '_');
}

function parseRows(table) {
  const headers = table.cols.map(col => normalizeHeader(col.label));
  return table.rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row.c[i] ? row.c[i].v : '';
    });
    return obj;
  });
}

function toBool(value) {
  return value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1';
}

function updateOverlay(data) {
  const overlay = document.getElementById('first-pick-overlay');
  const playerName = document.getElementById('playerName');
  const characterImg = document.getElementById('characterImg');

  if (!data || !toBool(data.show_pick)) {
    overlay.style.display = 'none';
    return;
  }

  playerName.textContent = data.player_name || "PLAYER NAME";

  characterImg.src = CHARACTER_IMAGE;
  characterImg.onerror = function () {
    this.src = 'assets/c2.png';
  };

  overlay.style.display = 'block';
}

function fetchData() {
  const url = getGvizUrl(SHEET_URL, SHEET_GID);
  if (!url) return;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(
        text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
      );

      if (!json.table) return;

      const rows = parseRows(json.table);
      if (!rows.length) return;

      updateOverlay(rows[0]);
    })
    .catch(err => {
      console.error('First Pick fetch error:', err);
    });
}

fetchData();
setInterval(fetchData, REFRESH_EVERY);
