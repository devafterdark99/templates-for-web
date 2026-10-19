
    (() => {
      "use strict";

      const awards = [
        {
          title: "Human Plot Twist",
          reason: "For making absolutely no sense and somehow being the most entertaining person in the room.",
          winner: "Atharva",
          tag: "PURE CHAOS"
        },
        {
          title: "Attendance Survivor",
          reason: "For surviving deadlines, lectures, submissions and the mysterious academic calendar.",
          winner: "Atharva",
          tag: "COLLEGE LIFE"
        },
        {
          title: "Drama Department CEO",
          reason: "For delivering award-winning reactions to situations that absolutely did not need them.",
          winner: "Atharva",
          tag: "PURE CHAOS"
        },
        {
          title: "Professional Timepass",
          reason: "For turning a five-minute break into an entire side quest with absolutely no regrets.",
          winner: "Atharva",
          tag: "COLLEGE LIFE"
        },
        {
          title: "Certified Day-One Energy",
          reason: "For being part of the memories, random conversations and little moments that matter.",
          winner: "Atharva",
          tag: "WHOLESOME"
        },
        {
          title: "Certified Absolute Legend",
          reason: "For being unapologetically yourself. No competition. No runner-up. Just the legend.",
          winner: "Atharva",
          tag: "WHOLESOME"
        }
      ];

      const dialog = document.getElementById("awardDialog");
      const dialogTitle = document.getElementById("dialogTitle");
      const dialogDescription = document.getElementById("dialogDescription");
      const dialogWinner = document.getElementById("dialogWinner");
      const dialogKicker = document.getElementById("dialogKicker");
      const toast = document.getElementById("toast");

      let currentAwardIndex = 0;
      let soundEnabled = false;
      let toastTimer;

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
      }

      function playTone(frequency = 660, duration = 0.12) {
        if (!soundEnabled) return;

        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;

          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gain = context.createGain();

          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.045, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + duration);
          oscillator.onended = () => context.close();
        } catch (error) {
          // Audio is an optional enhancement; the rest of the page still works.
        }
      }

      function launchConfetti(amount = 65) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return;

        const colors = ["#f5d99a", "#d6b46a", "#fff4d4", "#a98137", "#b99556"];

        for (let i = 0; i < amount; i++) {
          const piece = document.createElement("i");
          piece.className = "confetti-piece";
          piece.setAttribute("aria-hidden", "true");
          piece.style.left = Math.random() * 100 + "vw";
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.setProperty("--drift", (Math.random() * 220 - 110) + "px");
          piece.style.setProperty("--duration", (2.2 + Math.random() * 2.2) + "s");
          piece.style.animationDelay = (Math.random() * 0.6) + "s";
          piece.style.width = (5 + Math.random() * 7) + "px";
          piece.style.height = (8 + Math.random() * 10) + "px";
          document.body.appendChild(piece);
          piece.addEventListener("animationend", () => piece.remove(), { once: true });
        }
      }

      function renderAward(award, index, custom = false) {
        currentAwardIndex = index;

        dialogKicker.textContent = custom
          ? "SPECIAL PEOPLE'S CHOICE AWARD"
          : "THE OFFICIAL ENVELOPE · " + String(index + 1).padStart(3, "0");

        dialogTitle.textContent = award.title;
        dialogDescription.textContent = award.reason;
        dialogWinner.textContent = award.winner;

        document.getElementById("nextAward").textContent = custom
          ? "BACK TO THE CEREMONY"
          : "OPEN ANOTHER ↗";

        dialog.dataset.custom = custom ? "true" : "false";
        dialog.dataset.title = award.title;
        dialog.dataset.reason = award.reason;
        dialog.dataset.winner = award.winner;

        if (!dialog.open) dialog.showModal();

        playTone(880, 0.22);
        setTimeout(() => playTone(1175, 0.32), 130);
        launchConfetti(custom ? 35 : 70);
      }

      function revealAward(index) {
        const award = awards[index];
        if (!award) return;

        const card = document.querySelector('.award-card[data-id="' + index + '"]');
        if (card) {
          card.classList.add("revealed");
          const button = card.querySelector(".reveal-btn");
          if (button) button.textContent = "REVEALED ✓";
        }

        renderAward(award, index);
      }

      function revealRandomAward() {
        const visibleCards = [...document.querySelectorAll(".award-card")]
          .filter(card => card.style.display !== "none");

        if (!visibleCards.length) {
          showToast("No awards in this category. Try another filter!");
          return;
        }

        const unrevealed = visibleCards.filter(card => {
          const button = card.querySelector(".reveal-btn");
          return button && !card.classList.contains("revealed");
        });

        const pool = unrevealed.length ? unrevealed : visibleCards;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        revealAward(Number(chosen.dataset.id));
      }

      document.querySelectorAll("[data-reveal]").forEach(button => {
        button.addEventListener("click", () => revealAward(Number(button.dataset.reveal)));
      });

      document.getElementById("randomAward").addEventListener("click", revealRandomAward);
      document.getElementById("surpriseHero").addEventListener("click", revealRandomAward);

      document.getElementById("closeDialog").addEventListener("click", () => dialog.close());

      dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
      });

      document.getElementById("nextAward").addEventListener("click", () => {
        if (dialog.dataset.custom === "true") {
          dialog.close();
          document.getElementById("nominations").scrollIntoView({ behavior: "smooth" });
          return;
        }

        const visibleCards = [...document.querySelectorAll(".award-card")]
          .filter(card => card.style.display !== "none");

        const unrevealed = visibleCards.filter(card => !card.classList.contains("revealed"));

        if (!unrevealed.length) {
          dialog.close();
          showToast("All visible envelopes opened. The legend has been fully documented. 🏆");
          return;
        }

        const next = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        revealAward(Number(next.dataset.id));
      });

      document.getElementById("shareAward").addEventListener("click", async () => {
        const result =
          "🏆 THE ATHARVA AWARDS 🏆\n" +
          "Award: " + dialog.dataset.title + "\n" +
          "Winner: " + dialog.dataset.winner + "\n" +
          dialog.dataset.reason + "\n\n" +
          "Officially recognised by The Birthday Lab.";

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(result);
          } else {
            const textarea = document.createElement("textarea");
            textarea.value = result;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand("copy");
            textarea.remove();
            if (!success) throw new Error("Copy unavailable");
          }
          showToast("Award result copied! Send it to the legend. ✦");
        } catch (error) {
          showToast("Copy isn't available here. You can select the award text and copy it manually.");
        }
      });

      document.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
          const filter = button.dataset.filter;
          document.querySelectorAll("[data-filter]").forEach(item => {
            item.classList.toggle("active", item === button);
          });

          let visibleCount = 0;
          document.querySelectorAll(".award-card").forEach(card => {
            const show = filter === "all" || card.dataset.category === filter;
            card.style.display = show ? "flex" : "none";
            if (show) visibleCount++;
          });

          document.getElementById("emptyState").classList.toggle("show", visibleCount === 0);
          playTone(500, 0.07);
        });
      });

      document.getElementById("customForm").addEventListener("submit", event => {
        event.preventDefault();

        const titleInput = document.getElementById("customTitle");
        const reasonInput = document.getElementById("customReason");
        const winnerInput = document.getElementById("customWinner");

        const title = titleInput.value.trim();
        const reason = reasonInput.value.trim();
        const winner = winnerInput.value.trim();

        if (!title || !reason || !winner) {
          showToast("Fill in all three fields to create the award.");
          return;
        }

        const customAward = {
          title,
          reason,
          winner,
          tag: "PEOPLE'S CHOICE"
        };

        const card = document.createElement("article");
        card.className = "award-card";
        card.dataset.category = "custom";
        card.style.display = "flex";

        const top = document.createElement("div");
        top.className = "card-top";

        const number = document.createElement("span");
        number.className = "card-number";
        number.textContent = "BONUS / " + String(document.querySelectorAll(".award-card").length + 1).padStart(3, "0");

        const symbol = document.createElement("span");
        symbol.className = "card-symbol";
        symbol.textContent = "✦";

        top.append(number, symbol);

        const tag = document.createElement("span");
        tag.className = "card-tag";
        tag.textContent = "PEOPLE'S CHOICE";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const description = document.createElement("p");
        description.textContent = reason;

        const bottom = document.createElement("div");
        bottom.className = "card-bottom";

        const nominee = document.createElement("div");
        nominee.className = "nominee";
        nominee.appendChild(document.createTextNode("NOMINEE"));

        const nomineeName = document.createElement("strong");
        nomineeName.className = "nominee-name";
        nomineeName.textContent = winner;
        nominee.appendChild(nomineeName);

        const revealButton = document.createElement("button");
        revealButton.className = "reveal-btn";
        revealButton.type = "button";
        revealButton.textContent = "OPEN ENVELOPE ↗";
        revealButton.addEventListener("click", () => renderAward(customAward, -1, true));

        bottom.append(nominee, revealButton);
        card.append(top, tag, heading, description, bottom);

        document.getElementById("awardGrid").appendChild(card);
        document.querySelectorAll("[data-filter]").forEach(button => {
          button.classList.toggle("active", button.dataset.filter === "all");
        });
        document.querySelectorAll(".award-card").forEach(item => {
          item.style.display = "flex";
        });
        document.getElementById("emptyState").classList.remove("show");

        event.target.reset();
        winnerInput.value = "Atharva";

        card.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("Bonus award added to the official ceremony! 🏆");
        playTone(740, 0.14);
      });

      document.getElementById("finaleButton").addEventListener("click", () => {
        launchConfetti(130);
        playTone(660, 0.2);
        setTimeout(() => playTone(880, 0.2), 170);
        setTimeout(() => playTone(1100, 0.35), 340);
        showToast("Happy Birthday, Atharva! Certified legend status: PERMANENT. ✦");
      });

      document.getElementById("soundToggle").addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        const button = document.getElementById("soundToggle");
        button.textContent = soundEnabled ? "♫" : "♩";
        button.setAttribute("aria-pressed", String(soundEnabled));
        button.title = soundEnabled ? "Ceremony sounds enabled" : "Ceremony sounds muted";
        showToast(soundEnabled ? "Ceremony sounds enabled." : "Ceremony sounds muted.");
        if (soundEnabled) playTone(880, 0.18);
      });

      // Reveal sections as they enter the viewport.
      const revealElements = document.querySelectorAll(".reveal");

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        revealElements.forEach(element => observer.observe(element));
      } else {
        revealElements.forEach(element => element.classList.add("visible"));
      }

      // Keyboard shortcuts: R opens a random award; Escape closes the dialog natively.
      document.addEventListener("keydown", event => {
        const tag = document.activeElement?.tagName;
        const typing = tag === "INPUT" || tag === "TEXTAREA";

        if (typing || event.ctrlKey || event.metaKey || event.altKey) return;

        if (event.key.toLowerCase() === "r" && !dialog.open) {
          revealRandomAward();
        }
      });
    })();
