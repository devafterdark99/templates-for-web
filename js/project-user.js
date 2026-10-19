
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const dialogs = {
    caseDialog: $("#caseDialog"),
    evidenceDialog: $("#evidenceDialog"),
    terminalDialog: $("#terminalDialog")
  };

  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  $("#openCase").addEventListener("click", () => openDialog(dialogs.caseDialog));
  $("#openTerminal").addEventListener("click", () => openDialog(dialogs.terminalDialog));

  $$("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeDialog(dialogs[button.dataset.close]));
  });

  Object.values(dialogs).forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  $("#goEvidence").addEventListener("click", () => {
    closeDialog(dialogs.caseDialog);
    document.querySelector("#evidence").scrollIntoView({ behavior: "smooth" });
    toast("INVESTIGATION LOG UPDATED // EVIDENCE BOARD READY");
  });

  const evidence = {
    friendship: {
      label: "EVIDENCE FILE / 001",
      title: "THE ORIGIN STORY.",
      text: "The record begins in first semester. Somewhere between college life, shared experiences and random nonsense, a normal acquaintance became a proper friend. Add your real origin story and favourite early memory here.",
      status: "STATUS: FRIENDSHIP ESTABLISHED"
    },
    roommate: {
      label: "EVIDENCE FILE / 002",
      title: "HOME BASE.",
      text: "Current roommate status confirmed. Daily life provides an ongoing stream of stories, chaos and moments that would make absolutely no sense to an outsider. Add your funniest hostel or room memory here.",
      status: "STATUS: ROOMMATE CLEARANCE VERIFIED"
    },
    chaos: {
      label: "EVIDENCE FILE / 003",
      title: "UNEXPLAINED INCIDENTS.",
      text: "Several incidents have been flagged as highly suspicious. The investigator is advised to add the legendary jokes, weirdest college moments and most unhinged shared stories. Evidence quality: questionable. Entertainment value: excellent.",
      status: "STATUS: CHAOS LEVEL ELEVATED"
    },
    memories: {
      label: "RESTRICTED FILE / 004",
      title: "MEMORY VAULT.",
      text: "Clearance required. In the finished birthday build, this file can reveal actual photos, screenshots, a memory timeline or a private collection of your favourite moments.",
      status: "STATUS: PREVIEW ACCESS ONLY"
    },
    birthday: {
      label: "RESTRICTED FILE / 005",
      title: "OPERATION 10-DEC.",
      text: "A birthday operation has been scheduled for December 10, 2026. The final version could reveal a personalised birthday message, the physical gift clue or a surprise page after a puzzle is solved.",
      status: "STATUS: OPERATION IN PREPARATION"
    },
    classified: {
      label: "RESTRICTED FILE / 006",
      title: "REDACTED INTEL.",
      text: "Some information is being withheld until the final birthday experience is ready. Replace this placeholder with an inside joke, a secret note or a final reveal that only User will understand.",
      status: "STATUS: CLASSIFIED BY THE INVESTIGATOR"
    }
  };

  $$("[data-evidence]").forEach(card => {
    card.addEventListener("click", () => {
      const item = evidence[card.dataset.evidence];
      if (!item) return;
      $("#evidenceLabel").textContent = item.label;
      $("#evidenceTitle").textContent = item.title;
      $("#evidenceText").textContent = item.text;
      $("#evidenceStatus").textContent = item.status;
      openDialog(dialogs.evidenceDialog);
      toast("EVIDENCE RETRIEVED // " + item.label);
    });
  });

  $("#checkPasscode").addEventListener("click", () => {
    const input = $("#passcode");
    const result = $("#terminalResult");
    const code = input.value.trim().toLowerCase();

    if (!code) {
      result.textContent = "> ERROR: ENTER A KEYWORD FIRST.";
      input.focus();
      return;
    }

    // Demo only: there is no secret authentication or real security here.
    if (["user", "birthday", "10 december", "10-dec", "roommate"].includes(code)) {
      result.style.color = "var(--green)";
      result.textContent = "> ACCESS GRANTED. DEMO TERMINAL UNLOCKED ✓";
      toast("DEMO ACCESS GRANTED // NICE TRY, INVESTIGATOR");
    } else {
      result.style.color = "var(--orange)";
      result.textContent = "> ACCESS DENIED. CLUE NOT RECOGNIZED.";
      toast("ACCESS DENIED // CHECK YOUR CLUE");
    }
  });

  $("#passcode").addEventListener("keydown", event => {
    if (event.key === "Enter") $("#checkPasscode").click();
  });

  // Scroll reveal with a fallback for browsers without IntersectionObserver.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Add a small live clock to the system status without relying on external services.
  const updateClock = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    document.title = "PROJECT USER // CLASSIFIED";
    const foot = document.querySelector(".visual-bottom span");
    if (foot) foot.textContent = "LOCAL SYSTEM // " + date;
  };
  updateClock();
})();
