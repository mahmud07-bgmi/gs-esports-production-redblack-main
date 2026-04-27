const SHEET_ID = "1gyzPFtG3ubxzrqGEtQI-dr4aiExDU6Fx0tzFS2W4iG8";
const STORAGE_KEY = "bgmi_slot_overlay_state";

const TEAMS_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Teams&tqx=out:json`;

const bgImg = document.getElementById("bgImg");
const teamLogo = document.getElementById("teamLogo");
const topLogo = document.getElementById("topLogo");
const teamName = document.getElementById("teamName");

function safeValue(cell) {
  return cell && cell.v !== null && cell.v !== undefined ? cell.v : "";
}

function textValue(cell) {
  return String(safeValue(cell)).trim();
}

function numberValue(cell, fallback = 0) {
  const n = Number(safeValue(cell));
  return Number.isFinite(n) ? n : fallback;
}

function parseGViz(text) {
  return JSON.parse(text.substring(47).slice(0, -2));
}

function getSelectedSlot() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Number(saved.selectedSlot) || 1;
  } catch {
    return 1;
  }
}

function getBgBySlot(slot) {
  return `assets/${slot}.png`;
}

async function init() {
  const selectedSlot = getSelectedSlot();

  try {
    bgImg.src = getBgBySlot(selectedSlot);

    const res = await fetch(TEAMS_URL, { cache: "no-store" });
    const text = await res.text();
    const json = parseGViz(text);
    const teams = json.table.rows || [];

    const selectedTeam = teams.find(
      row => numberValue(row.c[0], 0) === selectedSlot
    );

    if (selectedTeam) {
      const name = textValue(selectedTeam.c[2]);
      const logo = textValue(selectedTeam.c[3]);

      teamName.textContent = name || `SLOT ${selectedSlot}`;

      if (logo) {
        teamLogo.src = logo;
        teamLogo.style.display = "block";

        topLogo.src = logo;
        topLogo.style.display = "block";
      } else {
        teamLogo.removeAttribute("src");
        teamLogo.style.display = "none";

        topLogo.removeAttribute("src");
        topLogo.style.display = "none";
      }
    } else {
      teamName.textContent = `SLOT ${selectedSlot}`;

      teamLogo.removeAttribute("src");
      teamLogo.style.display = "none";

      topLogo.removeAttribute("src");
      topLogo.style.display = "none";
    }

  } catch (err) {
    console.error(err);

    bgImg.src = getBgBySlot(selectedSlot);
    teamName.textContent = "OBS LOAD ERROR";

    teamLogo.removeAttribute("src");
    teamLogo.style.display = "none";

    topLogo.removeAttribute("src");
    topLogo.style.display = "none";
  }
}

init();
setInterval(init, 1000);
