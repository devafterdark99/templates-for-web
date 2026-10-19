
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const dialog = $("#siteDialog");
  let toastTimer;
  let historyStack = ["home"];
  let historyIndex = 0;

  const pages = {
    home: {
      url: "https://user.is.a.legend/",
      status: "DONE — 4 suspicious links detected.",
      label: "PERSONAL HOMEPAGE / 001",
      title: "THE ONE.<br>THE ONLY.<br><span>USER!</span>",
      description: "Loading legendary content since first semester...",
      emoji: ["★", "✦", "♥"],
      links: [
        ["[ ABOUT THE LEGEND ]", "about"],
        ["[ HALL OF FAME ]", "awards"],
        ["[ MEME DATABASE ]", "memes"],
        ["[ ??? SECRET ??? ]", "secret"]
      ]
    },
    about: {
      url: "https://user.wiki/about",
      status: "PAGE LOADED — LEGENDARY STATUS VERIFIED.",
      label: "WIKI / USER PROFILE",
      title: "THE LEGEND<br><span>WIKI.</span>",
      description: "Species: college legend. Natural habitat: campus and hostel. Special ability: making ordinary moments memorable. Weakness: birthday surprises.",
      emoji: ["🧠", "★", "☕"],
      links: [["[ VIEW AWARDS ]", "awards"], ["[ BACK HOME ]", "home"]]
    },
    awards: {
      url: "https://hall.of.fame/user",
      status: "AWARDS ARCHIVE LOADED — NO JURY WAS CONSULTED.",
      label: "HALL OF FAME / TROPHIES",
      title: "THE GREAT<br><span>AWARDS.</span>",
      description: "Awarded: Lifetime Achievement in Existing. Excellence in Roommate Behaviour. Most Likely to Be Involved in Unnecessary Bakchodi. Jury's decision is final.",
      emoji: ["🏆", "🥇", "👑"],
      links: [["[ VIEW PROFILE ]", "about"], ["[ SECRET FILE ]", "secret"]]
    },
    memes: {
      url: "https://memes.archive/user",
      status: "MEME ARCHIVE OPEN — BRAIN CELLS MAY BE AT RISK.",
      label: "MEME DATABASE / RESTRICTED",
      title: "MEME<br><span>ARCHIVE.</span>",
      description: "Recovered files include random college incidents, cursed screenshots and inside jokes that require a minimum of two semesters of context.",
      emoji: ["😂", "💀", "📁"],
      links: [["[ VIEW AWARDS ]", "awards"], ["[ BACK HOME ]", "home"]]
    },
    secret: {
      url: "https://you.found.the.secret/",
      status: "SECRET PAGE FOUND — YOU WERE WARNED.",
      label: "RESTRICTED / EASTER EGG 001",
      title: "YOU FOUND<br><span>THE SECRET.</span>",
      description: "Congratulations. You clicked a suspicious button on a birthday website. This officially qualifies as your most important achievement of the day. Reward: one imaginary trophy and unlimited friendship points.",
      emoji: ["🔐", "✦", "🎁"],
      links: [["[ BACK TO HOME ]", "home"], ["[ HALL OF FAME ]", "awards"]]
    },
    error: {
      url: "https://404.internet/oh-no",
      status: "ERROR 404 — TOO MUCH LEGEND, NOT ENOUGH SERVER.",
      label: "ERROR / 404",
      title: "OOPS.<br><span>IT BROKE.</span>",
      description: "The requested page has been temporarily relocated to another dimension. Possible cause: User exceeded the maximum permitted legend level. Suggested fix: return to the homepage.",
      emoji: ["💥", "⚠", "🛠"],
      links: [["[ TRY AGAIN ]", "error"], ["[ ESCAPE TO HOME ]", "home"]]
    }
  };

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
  }

  function openDialog() {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  function renderPage(name, addHistory = true) {
    const page = pages[name] || pages.home;

    $("#browserContent").innerHTML = `
      <div class="browser-kicker">★ ${page.label} ★</div>
      <div class="browser-heading">${page.title}</div>
      <div class="browser-description">${page.description}</div>
      <div class="pixel-art">
        ${page.emoji.map((emoji, i) => `<div class="pixel-star" style="animation-delay:${i * -.5}s">${emoji}</div>`).join("")}
      </div>
      <div class="browser-links">
        ${page.links.map(([label, target]) => `<button class="browser-link" data-page="${target}">${label}</button>`).join("")}
      </div>
    `;

    $("#address").textContent = page.url;
    $("#browserStatus").textContent = page.status;

    $("#browserContent").querySelectorAll("[data-page]").forEach(button => {
      button.addEventListener("click", () => renderPage(button.dataset.page));
    });

    if (addHistory) {
      historyStack = historyStack.slice(0, historyIndex + 1);
      historyStack.push(name);
      historyIndex++;
    }

    toast("PAGE LOADED // " + name.toUpperCase());
  }

  // Make every browser-like website card interactive.
  $$("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      renderPage(button.dataset.page);
      $("#browser").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  $("#browserBack").addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex--;
      renderPage(historyStack[historyIndex], false);
    } else {
      toast("YOU ARE ALREADY AT THE START.");
    }
  });

  $("#browserForward").addEventListener("click", () => {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      renderPage(historyStack[historyIndex], false);
    } else {
      toast("NO MORE PAGES IN THIS DIRECTION.");
    }
  });

  $("#browserRefresh").addEventListener("click", () => {
    const current = historyStack[historyIndex] || "home";
    renderPage(current, false);
    toast("PAGE REFRESHED ✓");
  });

  $("#enterInternet").addEventListener("click", () => {
    $("#browser").scrollIntoView({ behavior: "smooth", block: "center" });
    toast("WELCOME ONLINE, LEGEND ★");
  });

  const dialogContent = {
    about: {
      label: "WIKI / USER PROFILE",
      title: "THE LEGEND WIKI.",
      text: "This page is a playful profile placeholder. Add User's real interests, funniest habits, college stories and iconic quotes to make it personal."
    },
    awards: {
      label: "AWARDS ARCHIVE",
      title: "HALL OF FAME.",
      text: "Officially recognised for: surviving college, roommate-level access, elite nonsense and making memories that deserve their own trophy ceremony."
    },
    memes: {
      label: "MEME DATABASE",
      title: "RESTRICTED CONTENT.",
      text: "This archive is ready for your real inside jokes, meme references, funny screenshots and the kind of context that only your friend group understands."
    },
    secret: {
      label: "EASTER EGG / 001",
      title: "YOU FOUND THE SECRET!",
      text: "The internet has selected you for a rare reward: +999 friendship points. In the final birthday version, this can reveal a hidden letter or surprise."
    },
    error: {
      label: "SYSTEM ERROR / 404",
      title: "LEGEND LEVEL TOO HIGH.",
      text: "The server could not process this much personality. Please restart your browser, drink water and try being slightly less iconic."
    },
    surprise: {
      label: "SPECIAL DELIVERY / 10 DEC",
      title: "HAPPY BIRTHDAY, USER!",
      text: "This is the preview of the final birthday surprise. Replace this message with your own wishes, shared memories and the reveal for your physical gift."
    }
  };

  function showInfo(name) {
    const item = dialogContent[name] || dialogContent.secret;
    $("#dialogLabel").textContent = item.label;
    $("#dialogTitle").textContent = item.title;
    $("#dialogText").textContent = item.text;
    openDialog();
  }

  $$("[data-close]").forEach(button => button.addEventListener("click", closeDialog));

  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });

  $("#dialogAction").addEventListener("click", () => {
    closeDialog();
    toast("TRANSACTION COMPLETE // FRIENDSHIP XP +100");
  });

  $("#surpriseButton").addEventListener("click", () => showInfo("surprise"));

  $("#guestbookForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#guestName").value.trim();
    const message = $("#guestMessage").value.trim();

    if (!name || !message) {
      toast("PLEASE FILL IN BOTH FIELDS.");
      return;
    }

    const empty = $("#guestbookList .guest-empty");
    if (empty) empty.remove();

    const entry = document.createElement("article");
    entry.className = "guest-entry";

    const strong = document.createElement("strong");
    strong.textContent = "★ " + name;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    entry.append(strong, paragraph);
    $("#guestbookList").prepend(entry);

    $("#guestbookForm").reset();
    toast("GUESTBOOK SIGNED SUCCESSFULLY ★");
  });

  // Reveal content as the visitor scrolls.
  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Small keyboard easter egg: press L to find the legend's secret.
  document.addEventListener("keydown", event => {
    const tag = event.target.tagName;
    if (["INPUT", "TEXTAREA"].includes(tag) || event.ctrlKey || event.altKey || event.metaKey) return;

    if (event.key.toLowerCase() === "l") {
      showInfo("secret");
    }

    if (event.key === "Escape" && dialog.open) closeDialog();
  });
})();
