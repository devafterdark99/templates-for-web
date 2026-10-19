
    (() => {
      "use strict";

      const quests = [
        {
          title: "Once Upon a Semester",
          icon: "🏡",
          category: "ORIGIN STORY",
          xp: 100,
          badge: "THE EXPLORER",
          description:
            "Every legendary friendship has an origin story.\n\n" +
            "DEMO MEMORY: The first semester, the first conversations, the beginning of a friendship that would eventually collect far too many inside jokes.\n\n" +
            "YOUR MISSION: Add the real story of how you two met, your first proper conversation, or the moment you realised this person was going to be part of your life.",
          prompt: "Optional memory: remember where the adventure began."
        },
        {
          title: "The Friendship Forest",
          icon: "🌲",
          category: "MEMORY COLLECTION",
          xp: 150,
          badge: "MEMORY KEEPER",
          description:
            "The forest is full of tiny memories that seem ordinary until you look back.\n\n" +
            "DEMO MEMORY: Random conversations, shared jokes, late-night talks and all those little moments that somehow become the best stories.\n\n" +
            "YOUR MISSION: Think of one moment that still makes you laugh or smile. The best memories don't need to be huge to matter.",
          prompt: "Optional memory: add your favourite small moment."
        },
        {
          title: "The Academic Alliance",
          icon: "🎓",
          category: "COLLEGE KINGDOM",
          xp: 125,
          badge: "SURVIVOR",
          description:
            "Welcome to the kingdom of deadlines, assignments and lectures that could have been emails.\n\n" +
            "DEMO MEMORY: Academic survival, teamwork, random breaks and the occasional assignment-related miracle.\n\n" +
            "YOUR MISSION: Recall a college disaster that became funny later. Bonus points if both of you somehow survived it.",
          prompt: "Optional memory: add a legendary college incident."
        },
        {
          title: "Chaos Valley",
          icon: "⚡",
          category: "HIGH CHAOS ZONE",
          xp: 175,
          badge: "CHAOS MASTER",
          description:
            "Warning: logic may disappear. Side effects include uncontrollable laughter and conversations that make absolutely no sense outside the friend group.\n\n" +
            "DEMO MEMORY: Inside jokes, ridiculous situations, dramatic reactions and classic 'you had to be there' moments.\n\n" +
            "YOUR MISSION: Pick the most chaotic inside joke you share. Keep the explanation short — if it needs a 20-minute explanation, it qualifies.",
          prompt: "Optional memory: write the inside joke that deserves an award."
        },
        {
          title: "Always on Your Team",
          icon: "🔥",
          category: "CAMPFIRE MOMENT",
          xp: 200,
          badge: "DAY-ONE LEGEND",
          description:
            "The quest slows down here. No boss fight, no timer and no complicated instructions.\n\n" +
            "DEMO MEMORY: Appreciating the person behind the jokes — someone who has become part of the memories, the random updates and the everyday adventure.\n\n" +
            "YOUR MISSION: Think of one thing you genuinely appreciate about your friend. It doesn't have to be dramatic. Honest is enough.",
          prompt: "Optional memory: add something you appreciate about this friendship."
        }
      ];

      const treasureText =
        "DEAR LEGEND,\n\n" +
        "If you've made it this far, you've officially completed the Friendship Quest.\n\n" +
        "The best part of this adventure was never the XP, the badges or the treasure chest. It was all the ridiculous little moments that turned into stories worth keeping.\n\n" +
        "Here's to more adventures, more nonsense, more memories and more chapters that haven't been written yet.\n\n" +
        "Quest complete, User! 🏆\n\n" +
        "Quest status: LEGENDARY.\n" +
        "Friendship status: STILL IN PROGRESS. ♡";

      const completed = new Set();
      const claimedBonus = new Set();
      let activeQuest = null;
      let bonusCount = 0;
      let toastTimer;

      const $ = selector => document.querySelector(selector);
      const $$ = selector => [...document.querySelectorAll(selector)];

      const dialog = $("#questDialog");
      const toast = $("#toast");

      function xpTotal() {
        return [...completed].reduce((total, id) => total + quests[id].xp, 0);
      }

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
      }

      function confetti(amount = 65) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const colors = ["#f6d88f", "#e7b85d", "#b6d3a2", "#f8eed3", "#69b6a0"];

        for (let i = 0; i < amount; i++) {
          const piece = document.createElement("i");
          piece.className = "confetti-piece";
          piece.setAttribute("aria-hidden", "true");
          piece.style.left = Math.random() * 100 + "vw";
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.setProperty("--drift", (Math.random() * 180 - 90) + "px");
          piece.style.setProperty("--duration", (2.3 + Math.random() * 2) + "s");
          piece.style.animationDelay = (Math.random() * .45) + "s";
          piece.style.width = (5 + Math.random() * 7) + "px";
          piece.style.height = (8 + Math.random() * 10) + "px";

          document.body.appendChild(piece);
          piece.addEventListener("animationend", () => piece.remove(), { once: true });
        }
      }

      function openQuest(id) {
        if (id < 0 || id >= quests.length) return;

        activeQuest = id;
        const quest = quests[id];
        const isComplete = completed.has(id);

        $("#dialogIcon").textContent = quest.icon;
        $("#dialogKicker").textContent =
          "CHECKPOINT / " + String(id + 1).padStart(3, "0") + " · " + quest.category;
        $("#dialogTitle").textContent = quest.title;
        $("#dialogDescription").textContent = quest.description;
        $("#dialogReward").textContent = "+" + quest.xp + " XP · " + quest.badge;
        $("#completeQuest").textContent = isComplete ? "QUEST COMPLETED ✓" : "COMPLETE QUEST ✓";
        $("#completeQuest").disabled = isComplete;
        $("#completeQuest").style.opacity = isComplete ? ".6" : "1";
        $("#treasureMessage").classList.remove("show");
        $("#treasureMessage").textContent = "";

        if (!dialog.open) dialog.showModal();
      }

      function openTreasure() {
        if (completed.size < quests.length) {
          const remaining = quests.length - completed.size;
          showToast("The treasure is locked! Complete " + remaining + " more checkpoint" + (remaining === 1 ? "" : "s") + ". 🔒");
          $("#quests").scrollIntoView({ behavior: "smooth" });
          return;
        }

        activeQuest = null;
        $("#dialogIcon").textContent = "🏆";
        $("#dialogKicker").textContent = "FINAL CHECKPOINT · TREASURE UNLOCKED";
        $("#dialogTitle").textContent = "You made it, legend.";
        $("#dialogDescription").textContent =
          "Every checkpoint cleared. Every badge earned. The last treasure is ready to be opened.";
        $("#dialogReward").textContent = "LEGEND STATUS · PERMANENT";
        $("#completeQuest").textContent = "REVEAL THE TREASURE ✦";
        $("#completeQuest").disabled = false;
        $("#completeQuest").style.opacity = "1";
        $("#treasureMessage").classList.remove("show");
        $("#treasureMessage").textContent = "";
        if (!dialog.open) dialog.showModal();
      }

      function renderProgress() {
        const count = completed.size;
        const xp = xpTotal();
        const percentage = Math.round(count / quests.length * 100);

        $("#questStat").textContent = count + " / " + quests.length;
        $("#xpStat").textContent = xp + " XP";
        $("#badgeStat").textContent = count + " / " + quests.length;
        $("#rankStat").textContent =
          count === 5 ? "LEGEND" :
          count >= 3 ? "ADVENTURER" :
          count >= 1 ? "EXPLORER" : "ROOKIE";

        $("#progressText").textContent = percentage + "% COMPLETE";
        $("#progressFill").style.width = percentage + "%";
        $("#progressBar").setAttribute("aria-valuenow", percentage);

        $("#treasureProgressText").textContent =
          count + " OF " + quests.length + " CHECKPOINTS COMPLETED";
        $("#treasureProgressFill").style.width = percentage + "%";

        $("#inventoryCount").textContent = count + (completed.size === quests.length ? 1 : 0);
        $("#questCount").textContent =
          (quests.length - count) + " main quests remaining ✦";

        $$(".quest-card[data-id]").forEach(card => {
          const id = Number(card.dataset.id);
          const isComplete = completed.has(id);
          card.classList.toggle("complete", isComplete);

          const button = card.querySelector(".quest-open");
          if (button) button.textContent = isComplete ? "COMPLETED ✓" : "EXPLORE ↗";
        });

        $$(".map-node[data-quest]").forEach(node => {
          const id = Number(node.dataset.quest);
          const isComplete = completed.has(id);
          node.classList.toggle("completed", isComplete);
          node.setAttribute("aria-label", quests[id].title + (isComplete ? ", completed" : ", not completed"));
          node.title = quests[id].title + (isComplete ? " ✓" : "");
          node.textContent = isComplete ? "✓" : quests[id].icon;
        });

        $$(".collectible[data-badge]").forEach(item => {
          const badge = item.dataset.badge;
          const unlocked = badge === "treasure"
            ? count === quests.length
            : completed.has(Number(badge));

          item.classList.toggle("unlocked", unlocked);
        });

        const treasureUnlocked = count === quests.length;
        $("#treasureMapNode").classList.toggle("locked", !treasureUnlocked);
        $("#treasureMapNode").classList.toggle("completed", treasureUnlocked);
        $("#treasureMapNode").textContent = treasureUnlocked ? "🏆" : "🔒";
        $("#treasureMapNode").setAttribute(
          "aria-label",
          treasureUnlocked ? "Open the unlocked hidden treasure" : "Hidden treasure locked; complete all quests"
        );

        $("#treasureIcon").textContent = treasureUnlocked ? "🏆" : "🔒";
        $("#treasureButton").textContent = treasureUnlocked ? "OPEN THE TREASURE ✦" : "TREASURE LOCKED 🔒";
        $("#treasureDescription").textContent = treasureUnlocked
          ? "All five checkpoints cleared. Your final reward is ready."
          : "Five checkpoints stand between you and the hidden treasure. Complete the adventure to unlock the final surprise.";

        if (count === quests.length) {
          $("#treasureButton").classList.add("treasure-ready");
        }
      }

      function completeActiveQuest() {
        if (activeQuest === null) {
          $("#treasureMessage").textContent = treasureText;
          $("#treasureMessage").classList.add("show");
          $("#completeQuest").textContent = "TREASURE REVEALED ✓";
          $("#completeQuest").disabled = true;
          confetti(120);
          showToast("Legendary treasure unlocked. Quest complete, User! 🏆");
          return;
        }

        if (completed.has(activeQuest)) {
          showToast("You've already cleared this checkpoint!");
          return;
        }

        const id = activeQuest;
        completed.add(id);
        renderProgress();

        $("#completeQuest").textContent = "QUEST COMPLETED ✓";
        $("#completeQuest").disabled = true;
        $("#completeQuest").style.opacity = ".6";

        const quest = quests[id];
        $("#dialogDescription").textContent =
          "QUEST CLEARED! ✦\n\n" +
          quest.description +
          "\n\nREWARD CLAIMED: +" + quest.xp + " XP and the " + quest.badge + " badge.";

        confetti(45);
        showToast("Quest cleared! +" + quest.xp + " XP · " + quest.badge + " unlocked!");
      }

      $$(".quest-open[data-open]").forEach(button => {
        button.addEventListener("click", () => openQuest(Number(button.dataset.open)));
      });

      $$(".map-node[data-quest]").forEach(button => {
        button.addEventListener("click", () => openQuest(Number(button.dataset.quest)));
      });

      $("#treasureMapNode").addEventListener("click", openTreasure);
      $("#treasureButton").addEventListener("click", openTreasure);

      $("#completeQuest").addEventListener("click", completeActiveQuest);

      $("#closeDialog").addEventListener("click", () => dialog.close());
      $("#closeDialogSecondary").addEventListener("click", () => dialog.close());

      dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
      });

      $("#randomQuest").addEventListener("click", () => {
        const remaining = quests
          .map((quest, index) => index)
          .filter(index => !completed.has(index));

        if (!remaining.length) {
          openTreasure();
          return;
        }

        openQuest(remaining[Math.floor(Math.random() * remaining.length)]);
      });

      $("#bonusQuest").addEventListener("click", () => {
        bonusCount++;
        showToast("Side quest accepted! Plan a new adventure together. 🧭");
        confetti(20);
      });

      // Filter quest cards without changing completion status.
      $$(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
          const filter = button.dataset.filter;

          $$(".filter-btn").forEach(item => {
            item.classList.toggle("active", item === button);
          });

          $$(".quest-card").forEach(card => {
            const matches = filter === "all" || card.dataset.category === filter;
            card.hidden = !matches;
          });
        });
      });

      function showInventory() {
        $("#inventory").scrollIntoView({ behavior: "smooth" });
        showToast(
          completed.size === 0
            ? "Your inventory is empty. Complete a quest to earn your first badge!"
            : "You've collected " + completed.size + " of 5 quest badges."
        );
      }

      $("#inventoryButton").addEventListener("click", showInventory);
      $("#viewInventory").addEventListener("click", showInventory);

      // Animate content as it enters the viewport.
      const revealElements = $$(".reveal");

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: .08 });

        revealElements.forEach(element => observer.observe(element));
      } else {
        revealElements.forEach(element => element.classList.add("visible"));
      }

      // Keyboard shortcuts: 1–5 open main quests, T opens treasure.
      document.addEventListener("keydown", event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        if (dialog.open && event.key === "Escape") return;

        if (/^[1-5]$/.test(event.key) && !dialog.open) {
          openQuest(Number(event.key) - 1);
        }

        if (event.key.toLowerCase() === "t" && !dialog.open) {
          openTreasure();
        }
      });

      renderProgress();
    })();
