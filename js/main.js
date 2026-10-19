const themes = {
  gamer: { name: "The Gamer's Universe", subtitle: "PLAYER ONE. BIRTHDAY MODE.", page: "themes/gamers-universe.html" },
  os: { name: "ATHARVA.EXE", subtitle: "BOOTING UP YOUR BIRTHDAY.", page: "themes/user-os.html" },
  classified: { name: "Project Atharva", subtitle: "TOP SECRET. EXTREMELY SUSPECT.", page: "themes/project-user.html" },
  internet: { name: "Internet Legend '26", subtitle: "CERTIFIED INTERNET MENACE.", page: "themes/internet-legend.html" },
  awards: { name: "The Atharva Awards", subtitle: "ONE LEGEND. ZERO CHILL.", page: "themes/user-awards.html" },
  quest: { name: "The Friendship Quest", subtitle: "ONE FRIENDSHIP. MANY SIDE QUESTS.", page: "themes/users-quest.html" }
};

const selectionName = document.getElementById("selectionName");
const selectionHint = document.getElementById("selectionHint");
const lockButton = document.getElementById("lockChoice");
const dialog = document.getElementById("choiceDialog");
const toast = document.getElementById("toast");
let selectedId = null;
let toastTimer;

function readChoice() {
  try { return localStorage.getItem("birthdayLabChoice"); }
  catch { return null; }
}
function storeChoice(id) {
  try { localStorage.setItem("birthdayLabChoice", id); }
  catch { /* Selection still works without browser storage. */ }
}
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function selectTheme(id, persist = true) {
  if (!themes[id]) return;
  selectedId = id;
  document.querySelectorAll(".theme-card").forEach(card => {
    const active = card.dataset.id === id;
    card.classList.toggle("selected", active);
    const button = card.querySelector(".choose-button");
    if (button) button.textContent = active ? "✓" : "＋";
  });
  selectionName.textContent = themes[id].name.toUpperCase();
  selectionHint.textContent = "That's a strong contender. You can still change your mind.";
  lockButton.disabled = false;
  if (persist) storeChoice(id);
}
document.querySelectorAll("[data-select]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    selectTheme(button.dataset.select);
    showToast(`${themes[button.dataset.select].name} selected.`);
  });
});
const saved = readChoice();
if (saved && themes[saved]) selectTheme(saved, false);

lockButton.addEventListener("click", () => {
  if (!selectedId) return;
  document.getElementById("dialogTheme").textContent = themes[selectedId].name;
  document.getElementById("dialogCopy").textContent =
    `${themes[selectedId].subtitle} Your preference is saved in this browser. It has not been sent to Ayush.`;
  dialog.showModal();
});
document.getElementById("closeChoice").addEventListener("click", () => dialog.close());
document.getElementById("finishChoice").addEventListener("click", () => {
  dialog.close();
  selectionHint.textContent = "Choice locked in! Go tell Ayush which universe you picked.";
  showToast("Choice locked in. Now tell Ayush!");
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
