
/*
 * THE CREATIVE LAB — Main Controller
 * A reusable showcase for interactive web concepts.
 * No birthday-specific or recipient-specific content.
 */

const LAB_CONFIG = {
  collectionYear: new Date().getFullYear()
};

const themes = {
  gamer: {
    name: "Pixel Playground",
    subtitle: "PLAYER ONE. WORLD READY.",
    description:
      "A pixel-inspired interactive experience featuring game-style visuals, playful levels and mini-games.",
    page: "themes/gamers-universe.html"
  },

  os: {
    name: "Personal Desktop",
    subtitle: "A WORLD OF YOUR OWN.",
    description:
      "A desktop-inspired interface with custom apps, floating windows, secret files and playful interactions.",
    page: "themes/user-os.html"
  },

  classified: {
    name: "The Case Files",
    subtitle: "THE DETAILS ARE CLASSIFIED.",
    description:
      "An interactive investigation concept featuring evidence, dossiers, hidden clues and narrative reveals.",
    page: "themes/project-user.html"
  },

  internet: {
    name: "Internet After Hours",
    subtitle: "WELCOME TO THE WEIRD WEB.",
    description:
      "A retro web-inspired playground featuring nostalgic interfaces, stickers, bold typography and playful details.",
    page: "themes/internet-legend.html"
  },

  awards: {
    name: "The Spotlight",
    subtitle: "EVERY DETAIL DESERVES A MOMENT.",
    description:
      "A cinematic presentation concept featuring editorial layouts, dramatic visuals and polished transitions.",
    page: "themes/user-awards.html"
  },

  quest: {
    name: "The Story Map",
    subtitle: "EVERY CLICK OPENS A NEW CHAPTER.",
    description:
      "An illustrated interactive journey with milestones, checkpoints, discoveries and story-driven navigation.",
    page: "themes/users-quest.html"
  }
};

const elements = {
  selectionName: document.getElementById("selectionName"),
  selectionHint: document.getElementById("selectionHint"),
  lockButton: document.getElementById("lockChoice"),
  dialog: document.getElementById("choiceDialog"),
  dialogTheme: document.getElementById("dialogTheme"),
  dialogCopy: document.getElementById("dialogCopy"),
  closeChoice: document.getElementById("closeChoice"),
  finishChoice: document.getElementById("finishChoice"),
  toast: document.getElementById("toast"),
  headerDate: document.getElementById("headerDate"),
  footerYear: document.getElementById("footerYear")
};

const STORAGE_KEY = "creativeLabSelection";

let selectedId = null;
let toastTimer = null;
let lastFocusedElement = null;

/* STORAGE */

function readChoice() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && themes[saved] ? saved : null;
  } catch (error) {
    return null;
  }
}

function storeChoice(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
    return true;
  } catch (error) {
    return false;
  }
}

/* NOTIFICATIONS */

function showToast(message) {
  if (!elements.toast) return;

  clearTimeout(toastTimer);

  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

/* PAGE DETAILS */

function updatePageDetails() {
  if (elements.footerYear) {
    elements.footerYear.textContent = String(LAB_CONFIG.collectionYear);
  }

  if (elements.headerDate) {
    elements.headerDate.textContent = "DIGITAL PLAYGROUND";
  }

  const cards = document.querySelectorAll(".theme-card");

  const count = document.getElementById("conceptCount");

  if (count) {
    count.textContent = String(cards.length).padStart(2, "0");
  }
}

/* THEME SELECTION */

function selectTheme(id, shouldPersist = true) {
  const theme = themes[id];

  if (!theme) return;

  selectedId = id;

  document.querySelectorAll(".theme-card").forEach(card => {
    const isSelected = card.dataset.id === id;

    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-selected", String(isSelected));

    const button = card.querySelector(".choose-button");

    if (button) {
      button.textContent = isSelected ? "✓" : "＋";

      button.setAttribute(
        "aria-label",
        isSelected
          ? `Selected: ${theme.name}`
          : `Select ${themes[card.dataset.id]?.name || "this concept"}`
      );

      button.setAttribute("aria-pressed", String(isSelected));
    }
  });

  if (elements.selectionName) {
    elements.selectionName.textContent = theme.name.toUpperCase();
  }

  if (elements.selectionHint) {
    elements.selectionHint.textContent =
      "Good choice. Explore more concepts or confirm your selection.";
  }

  if (elements.lockButton) {
    elements.lockButton.disabled = false;
  }

  if (shouldPersist && !storeChoice(id)) {
    showToast("Selection active for this session. Browser storage is unavailable.");
  }
}

/* CONFIRMATION DIALOG */

function openConfirmation() {
  if (!selectedId || !themes[selectedId]) {
    showToast("Choose a concept first.");
    return;
  }

  if (!elements.dialog) return;

  const theme = themes[selectedId];

  if (elements.dialogTheme) {
    elements.dialogTheme.textContent = theme.name;
  }

  if (elements.dialogCopy) {
    elements.dialogCopy.textContent =
      `${theme.subtitle} ${theme.description} Your selection is saved in this browser only.`;
  }

  lastFocusedElement = document.activeElement;

  if (typeof elements.dialog.showModal === "function") {
    elements.dialog.showModal();
  } else {
    showToast(`${theme.name} selected.`);
  }
}

function closeConfirmation() {
  if (elements.dialog?.open) {
    elements.dialog.close();
  }
}

function finishConfirmation() {
  if (!selectedId || !themes[selectedId]) return;

  const theme = themes[selectedId];

  closeConfirmation();

  if (elements.selectionHint) {
    elements.selectionHint.textContent =
      "Selection confirmed. You can still explore and switch concepts.";
  }

  showToast(`${theme.name} — selection confirmed.`);
}

/* THEME BUTTONS */

function setupThemeSelection() {
  document.querySelectorAll("[data-select]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const id = button.dataset.select;

      if (!themes[id]) return;

      selectTheme(id);
      showToast(`${themes[id].name} selected.`);
    });
  });
}

/* DIALOG EVENTS */

function setupDialog() {
  elements.lockButton?.addEventListener("click", openConfirmation);
  elements.closeChoice?.addEventListener("click", closeConfirmation);
  elements.finishChoice?.addEventListener("click", finishConfirmation);

  elements.dialog?.addEventListener("click", event => {
    if (event.target === elements.dialog) {
      closeConfirmation();
    }
  });

  elements.dialog?.addEventListener("close", () => {
    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus({ preventScroll: true });
    } else {
      elements.lockButton?.focus({ preventScroll: true });
    }
  });
}

/* NAVIGATION */

function setupNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (targetId !== "#top") {
        history.replaceState(null, "", targetId);
      } else {
        history.replaceState(null, "", window.location.pathname);
      }
    });
  });
}

/* INITIALISE */

function initialiseLab() {
  updatePageDetails();
  setupThemeSelection();
  setupDialog();
  setupNavigation();

  const savedId = readChoice();

  if (savedId) {
    selectTheme(savedId, false);

    if (elements.selectionHint) {
      elements.selectionHint.textContent =
        "Your previous selection has been restored. Change it whenever you like.";
    }
  }
}

initialiseLab();
