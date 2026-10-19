
    (() => {
      "use strict";

      const $ = (id) => document.getElementById(id);

      const canvas = $("gameCanvas");
      const ctx = canvas.getContext("2d");

      const W = canvas.width;
      const H = canvas.height;
      const FLOOR = 355;
      const WORLD_END = 2900;

      let state = "ready";
      let animationId = 0;
      let lastTime = 0;
      let elapsed = 0;
      let score = 0;
      let coinsCollected = 0;
      let lives = 3;
      let xp = 0;
      let highestScore = 0;
      let toastTimer = null;
      let jumpQueued = false;
      let bossInspected = false;

      const keys = { left: false, right: false };
      const touchKeys = { left: false, right: false };

      const player = {
        x: 65,
        y: FLOOR - 38,
        w: 25,
        h: 32,
        vx: 0,
        vy: 0,
        speed: 3.5,
        jump: -85,
        onGround: true,
        invincible: 0,
        facing: 1
      };

      let cameraX = 0;
      let coins = [];
      let spikes = [];
      let particles = [];
      let platforms = [];
      let scenery = [];
      let portal = { x: WORLD_END - 110, y: FLOOR - 78, w: 46, h: 78 };

      const unlocked = new Set();

      function resetWorld() {
        player.x = 65;
        player.y = FLOOR - player.h;
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
        player.invincible = 0;
        player.facing = 1;

        cameraX = 0;
        elapsed = 0;
        score = 0;
        coinsCollected = 0;
        lives = 3;
        jumpQueued = false;
        particles = [];

        coins = [
          { x: 260, y: 275, got: false },
          { x: 390, y: 245, got: false },
          { x: 600, y: 285, got: false },
          { x: 790, y: 240, got: false },
          { x: 1120, y: 265, got: false },
          { x: 1420, y: 225, got: false },
          { x: 1770, y: 265, got: false },
          { x: 2070, y: 235, got: false }
        ];

        spikes = [
          { x: 465, w: 42 },
          { x: 900, w: 48 },
          { x: 1240, w: 55 },
          { x: 1560, w: 42 },
          { x: 1870, w: 56 },
          { x: 2240, w: 48 },
          { x: 2500, w: 60 }
        ];

        platforms = [
          { x: 315, y: 302, w: 100, h: 14 },
          { x: 710, y: 295, w: 115, h: 14 },
          { x: 1020, y: 300, w: 120, h: 14 },
          { x: 1350, y: 285, w: 110, h: 14 },
          { x: 1660, y: 300, w: 115, h: 14 },
          { x: 1970, y: 285, w: 120, h: 14 },
          { x: 2340, y: 300, w: 125, h: 14 }
        ];

        scenery = [];
        for (let i = 0; i < 90; i++) {
          scenery.push({
            x: i * 43 + ((i * 37) % 19),
            y: 35 + ((i * 71) % 185),
            size: i % 5 === 0 ? 3 : 2,
            phase: i % 7
          });
        }

        updateHud();
        render();
      }

      function formatScore(n) {
        return String(Math.max(0, Math.floor(n))).padStart(4, "0");
      }

      function updateHud() {
        $("scoreValue").textContent = formatScore(score);
        $("coinValue").textContent = coinsCollected + " / " + coins.length;
        $("livesValue").textContent = lives > 0 ? "♥ ".repeat(lives).trim() : "0";
        $("xpValue").textContent = String(xp).padStart(3, "0") + " XP";
        $("profileXP").textContent = String(xp).padStart(3, "0");
        $("profileLevel").textContent = String(Math.floor(xp / 150) + 1).padStart(2, "0");

        if (coinsCollected > 0) setQuest("questCoin", true);
        if (score >= 500) unlock("score", "achScore", "Score Hunter", "500 points. Your high-score era begins.");
      }

      function setQuest(id, complete) {
        $(id).textContent = complete ? "✓" : "○";
        $(id).style.borderColor = complete ? "#83ff9b" : "";
      }

      function unlock(id, elementId, title, description) {
        if (unlocked.has(id)) return;
        unlocked.add(id);
        $(elementId).textContent = "✓";
        $(elementId).style.color = "#83ff9b";
        showToast("ACHIEVEMENT UNLOCKED!", title + " — " + description);
        addXP(25);
      }

      function addXP(amount) {
        xp += amount;
        updateHud();
      }

      function showToast(title, message) {
        $("toastTitle").textContent = title;
        $("toastText").textContent = message;
        $("toast").classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2800);
      }

      function setOverlay(icon, title, text, buttonLabel, callback) {
        $("overlayIcon").textContent = icon;
        $("overlayTitle").textContent = title;
        $("overlayText").textContent = text;
        $("overlayStart").textContent = buttonLabel;
        $("overlayStart").onclick = callback;
        $("gameOverlay").classList.remove("hidden");
      }

      function hideOverlay() {
        $("gameOverlay").classList.add("hidden");
      }

      function startGame() {
        cancelAnimationFrame(animationId);
        resetWorld();
        state = "playing";
        $("pauseButton").disabled = false;
        $("pauseButton").textContent = "Ⅱ PAUSE";
        $("questPlay").textContent = "✓";
        $("achStart").textContent = "✓";
        $("achStart").style.color = "#83ff9b";
        addXP(10);
        hideOverlay();
        lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
        $("arcade").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function pauseGame() {
        if (state === "playing") {
          state = "paused";
          cancelAnimationFrame(animationId);
          $("pauseButton").textContent = "▶ RESUME";
          setOverlay("Ⅱ", "GAME PAUSED", "Take a breath, legend. Your coins aren't going anywhere.", "▶ RESUME", resumeGame);
        } else if (state === "paused") {
          resumeGame();
        }
      }

      function resumeGame() {
        if (state !== "paused") return;
        state = "playing";
        hideOverlay();
        $("pauseButton").textContent = "Ⅱ PAUSE";
        lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
      }

      function endGame(won) {
        state = won ? "won" : "over";
        cancelAnimationFrame(animationId);
        $("pauseButton").disabled = true;

        if (won) {
          score += lives * 100 + coinsCollected * 50;
          highestScore = Math.max(highestScore, score);
          addXP(100);
          setQuest("questWin", true);
          unlock("win", "achWin", "GG EZ", "Level complete. The legend is real.");
          updateHud();

          setOverlay(
            "🏆",
            "LEVEL COMPLETE!",
            "PORTAL CONQUERED! You scored " + score + " points and collected " + coinsCollected + " coins. The next world is still loading...",
            "↻ PLAY AGAIN",
            startGame
          );
        } else {
          setOverlay(
            "💀",
            "GAME OVER",
            "The valley won this round. Score: " + score + ". Every legend needs a comeback arc.",
            "↻ TRY AGAIN",
            startGame
          );
        }
      }

      function loseLife() {
        if (player.invincible > 0 || state !== "playing") return;
        lives--;
        player.invincible = 1.5;
        player.vy = -5;
        player.vx = -player.facing * 2;
        spawnBurst(player.x + player.w / 2, player.y + player.h / 2, "#ff4d9d", 12);
        showToast("OUCH!", lives > 0 ? "Careful! " + lives + " life/lives left." : "No lives left. Game over incoming.");
        updateHud();

        if (lives <= 0) endGame(false);
      }

      function spawnBurst(x, y, color, amount) {
        for (let i = 0; i < amount; i++) {
          particles.push({
            x, y,
            vx: (Math.random() - .5) * 5,
            vy: (Math.random() - .5) * 5,
            life: .35 + Math.random() * .45,
            maxLife: .8,
            color,
            size: 2 + Math.random() * 4
          });
        }
      }

      function rectsOverlap(a, b) {
        return a.x < b.x + b.w &&
          a.x + a.w > b.x &&
          a.y < b.y + b.h &&
          a.y + a.h > b.y;
      }

      function update(dt) {
        elapsed += dt;

        const movingLeft = keys.left || touchKeys.left;
        const movingRight = keys.right || touchKeys.right;

        if (movingLeft) {
          player.vx = -player.speed;
          player.facing = -1;
        } else if (movingRight) {
          player.vx = player.speed;
          player.facing = 1;
        } else {
          player.vx *= .78;
          if (Math.abs(player.vx) < .15) player.vx = 0;
        }

        if (jumpQueued && player.onGround) {
          player.vy = player.jump;
          player.onGround = false;
          spawnBurst(player.x + player.w / 2, player.y + player.h, "#45f6e8", 5);
        }
        jumpQueued = false;

        player.x += player.vx;
        player.x = Math.max(0, Math.min(WORLD_END - player.w, player.x));

        player.vy += 38 * dt;
        player.y += player.vy * dt;
        player.onGround = false;

        const playerRect = {
          x: player.x,
          y: player.y,
          w: player.w,
          h: player.h
        };

        if (player.y + player.h >= FLOOR) {
          player.y = FLOOR - player.h;
          player.vy = 0;
          player.onGround = true;
        }

        for (const p of platforms) {
          const previousBottom = player.y + player.h - player.vy * dt;
          if (
            player.vy >= 0 &&
            player.x + player.w > p.x &&
            player.x < p.x + p.w &&
            previousBottom <= p.y + 3 &&
            player.y + player.h >= p.y &&
            player.y < p.y
          ) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
          }
        }

        if (player.invincible > 0) player.invincible -= dt;

        for (const coin of coins) {
          if (coin.got) continue;
          const coinRect = { x: coin.x - 9, y: coin.y - 9, w: 18, h: 18 };
          if (rectsOverlap(playerRect, coinRect)) {
            coin.got = true;
            coinsCollected++;
            score += 100;
            addXP(15);
            spawnBurst(coin.x, coin.y, "#ffe66d", 12);
            showToast("COIN COLLECTED! +100", "Shiny object acquired. Your XP is looking healthier.");
            updateHud();
            unlock("coin", "achCoin", "Shiny Object Syndrome", "Your first coin. A collector is born.");
          }
        }

        for (const spike of spikes) {
          const spikeRect = { x: spike.x, y: FLOOR - 21, w: spike.w, h: 21 };
          if (rectsOverlap(playerRect, spikeRect)) {
            loseLife();
            break;
          }
        }

        if (player.invincible > 0 && player.x < 0) player.x = 0;

        if (player.x > portal.x + portal.w) {
          endGame(true);
          return;
        }

        cameraX = Math.max(0, Math.min(WORLD_END - W, player.x - W * .34));

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          p.vx *= .98;
          p.vy += 5 * dt;
        }
        particles = particles.filter(p => p.life > 0);

        score += dt * 2;
        updateHud();
      }

      function drawPixelRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), w, h);
      }

      function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#101832");
        gradient.addColorStop(.6, "#202453");
        gradient.addColorStop(1, "#131b34");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Starfield parallax.
        for (const star of scenery) {
          const sx = ((star.x - cameraX * .18) % W + W) % W;
          const sy = star.y;
          ctx.globalAlpha = .45 + Math.sin(elapsed * 2 + star.phase) * .25;
          drawPixelRect(sx, sy, star.size, star.size, "#d9e5ff");
        }
        ctx.globalAlpha = 1;

        // Distant pixel mountains.
        for (let i = -1; i < 8; i++) {
          const mx = i * 180 - (cameraX * .3 % 180);
          ctx.fillStyle = "#292d66";
          ctx.beginPath();
          ctx.moveTo(mx, FLOOR);
          ctx.lineTo(mx + 90, 105 + (i % 3) * 18);
          ctx.lineTo(mx + 180, FLOOR);
          ctx.closePath();
          ctx.fill();
        }

        for (let i = -1; i < 12; i++) {
          const bx = i * 100 - (cameraX * .55 % 100);
          drawPixelRect(bx, FLOOR - 60, 45, 60, "#191f48");
          drawPixelRect(bx + 8, FLOOR - 78, 29, 18, "#191f48");
          drawPixelRect(bx + 13, FLOOR - 52, 6, 9, "#45f6e8");
          drawPixelRect(bx + 26, FLOOR - 32, 6, 9, "#9b7bff");
        }

        // Ground.
        drawPixelRect(0, FLOOR, W, H - FLOOR, "#14223a");
        drawPixelRect(0, FLOOR, W, 8, "#45f6e8");
        drawPixelRect(0, FLOOR + 8, W, 3, "#267d8b");

        for (let x = -((cameraX % 32)); x < W; x += 32) {
          drawPixelRect(x, FLOOR + 20, 15, 4, "#1e3150");
          drawPixelRect(x + 15, FLOOR + 37, 13, 4, "#1e3150");
        }
      }

      function drawCoins() {
        for (const coin of coins) {
          if (coin.got) continue;
          const x = coin.x - cameraX;
          const y = coin.y + Math.sin(elapsed * 5 + coin.x) * 4;

          ctx.shadowColor = "#ffe66d";
          ctx.shadowBlur = 15;
          drawPixelRect(x - 7, y - 10, 14, 20, "#f4b942");
          drawPixelRect(x - 4, y - 7, 8, 14, "#ffe66d");
          drawPixelRect(x - 2, y - 4, 4, 8, "#fff4a5");
          ctx.shadowBlur = 0;
        }
      }

      function drawPlatforms() {
        for (const p of platforms) {
          const x = p.x - cameraX;
          if (x < -p.w || x > W) continue;
          drawPixelRect(x, p.y, p.w, p.h, "#4d4a9b");
          drawPixelRect(x, p.y, p.w, 4, "#9b7bff");
          for (let j = 8; j < p.w; j += 20) {
            drawPixelRect(x + j, p.y + 7, 7, 3, "#6d65be");
          }
        }
      }

      function drawSpikes() {
        for (const spike of spikes) {
          const x = spike.x - cameraX;
          if (x < -spike.w || x > W) continue;
          const count = Math.max(1, Math.floor(spike.w / 14));
          for (let i = 0; i < count; i++) {
            ctx.fillStyle = "#ff4d9d";
            ctx.beginPath();
            ctx.moveTo(x + i * 14, FLOOR);
            ctx.lineTo(x + i * 14 + 7, FLOOR - 22);
            ctx.lineTo(x + i * 14 + 14, FLOOR);
            ctx.fill();
            drawPixelRect(x + i * 14 + 5, FLOOR - 7, 4, 4, "#ffb1d4");
          }
        }
      }

      function drawPortal() {
        const x = portal.x - cameraX;
        if (x < -100 || x > W + 100) return;

        ctx.save();
        ctx.shadowColor = "#45f6e8";
        ctx.shadowBlur = 25 + Math.sin(elapsed * 4) * 8;
        ctx.strokeStyle = "#45f6e8";
        ctx.lineWidth = 5;
        ctx.strokeRect(x, portal.y, portal.w, portal.h);
        ctx.fillStyle = "rgba(69,246,232,.15)";
        ctx.fillRect(x + 5, portal.y + 5, portal.w - 10, portal.h - 10);
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("EXIT", x + portal.w / 2, portal.y - 12);
        ctx.textAlign = "left";
      }

      function drawPlayer() {
        const x = player.x - cameraX;
        const y = player.y;

        if (player.invincible > 0 && Math.floor(elapsed * 12) % 2 === 0) return;

        // Shadow.
        ctx.globalAlpha = .2;
        drawPixelRect(x - 3, FLOOR - 3, player.w + 6, 4, "#000000");
        ctx.globalAlpha = 1;

        // Pixel character.
        drawPixelRect(x + 3, y, 19, 7, "#ff78b5");
        drawPixelRect(x, y + 6, 25, 18, "#ff4d9d");
        drawPixelRect(x + 4, y + 24, 7, 8, "#ffe66d");
        drawPixelRect(x + 16, y + 24, 7, 8, "#ffe66d");

        // Face.
        const eyeX = player.facing === 1 ? x + 15 : x + 5;
        drawPixelRect(eyeX, y + 11, 4, 4, "#ffffff");
        drawPixelRect(eyeX + (player.facing === 1 ? 1 : 0), y + 12, 2, 2, "#17203e");

        // Backpack.
        drawPixelRect(player.facing === 1 ? x - 4 : x + 20, y + 11, 6, 11, "#9b7bff");

        if (!player.onGround) {
          drawPixelRect(x + 4, y + 33, 5, 3, "#45f6e8");
          drawPixelRect(x + 17, y + 33, 5, 3, "#45f6e8");
        }
      }

      function drawParticles() {
        for (const p of particles) {
          ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
          drawPixelRect(p.x - cameraX, p.y, p.size, p.size, p.color);
        }
        ctx.globalAlpha = 1;
      }

      function drawProgress() {
        const progress = Math.max(0, Math.min(1, player.x / portal.x));
        drawPixelRect(18, 18, 180, 6, "#293654");
        drawPixelRect(18, 18, 180 * progress, 6, "#45f6e8");
        ctx.fillStyle = "#dce6ff";
        ctx.font = "10px monospace";
        ctx.fillText("LEVEL PROGRESS " + Math.floor(progress * 100) + "%", 18, 39);
      }

      function render() {
        ctx.clearRect(0, 0, W, H);
        drawBackground();
        drawPlatforms();
        drawSpikes();
        drawCoins();
        drawPortal();
        drawPlayer();
        drawParticles();
        drawProgress();
      }

      function loop(timestamp) {
        if (state !== "playing") return;

        const dt = Math.min((timestamp - lastTime) / 1000, .032);
        lastTime = timestamp;

        update(dt);
        render();

        if (state === "playing") {
          animationId = requestAnimationFrame(loop);
        }
      }

      function openModal(eyebrow, title, html) {
        $("modalEyebrow").textContent = eyebrow;
        $("modalTitle").textContent = title;
        $("modalContent").innerHTML = html;
        $("infoModal").hidden = false;
      }

      function showInstructions() {
        openModal(
          "PLAYER MANUAL / V1.0",
          "How to play",
          `<p><strong style="color:#45f6e8">OBJECTIVE</strong><br>Reach the glowing EXIT portal on the right side of the level.</p>
           <p><strong style="color:#ffe66d">COLLECT</strong><br>Every coin adds 100 points and 15 XP. There are 8 coins in the valley.</p>
           <p><strong style="color:#ff4d9d">SURVIVE</strong><br>Avoid the pink spikes. You start with 3 lives. Losing all 3 ends the run.</p>
           <p><strong style="color:#9b7bff">CONTROLS</strong><br>A / D or arrow keys to move. Space, W or Up Arrow to jump. On mobile, use the touch buttons under the game.</p>
           <p>Tip: build up some speed, time your jumps and don't forget the coins above platforms.</p>`
        );
      }

      function showAchievements() {
        const list = [
          ["🎮", "Press Start", unlocked.has("start") || state !== "ready"],
          ["🪙", "Shiny Object Syndrome", unlocked.has("coin")],
          ["🏆", "GG EZ", unlocked.has("win")],
          ["💯", "Score Hunter", unlocked.has("score")]
        ];

        openModal(
          "PLAYER RECORD / ACHIEVEMENTS",
          "Hall of legends",
          list.map(item =>
            `<div class="achievement">
              <div class="achievement-icon">${item[0]}</div>
              <div>
                <strong>${item[1]}</strong>
                <small>${item[2] ? "UNLOCKED · NICE WORK, LEGEND." : "LOCKED · KEEP PLAYING TO UNLOCK."}</small>
              </div>
            </div>`
          ).join("")
        );
      }

      function inspectBoss() {
        bossInspected = true;
        setQuest("questBoss", true);
        addXP(10);
        showToast("BOSS INTEL ACQUIRED", "Roommate boss scanned. Difficulty: emotionally unfair.");
        openModal(
          "FINAL STAGE / CLASSIFIED",
          "The Roommate Boss",
          `<div class="achievement">
             <div class="achievement-icon">☠</div>
             <div><strong>THE ROOMMATE</strong><small>THREAT LEVEL: ABSOLUTELY UNNECESSARY</small></div>
           </div>
           <p><strong style="color:#ff4d9d">KNOWN ABILITIES</strong></p>
           <p>• Steals the last snack without warning.<br>• Says “bas 5 minute” and disappears for an hour.<br>• Has a suspiciously high chaos stat.<br>• Can turn a normal day into a side quest.</p>
           <p>Weakness: friendship, food and a well-timed birthday surprise.</p>
           <p style="color:#45f6e8">MORE BOSS DETAILS UNLOCK IN THE FULL BIRTHDAY BUILD.</p>`
        );
      }

      $("heroStart").addEventListener("click", startGame);
      $("overlayStart").addEventListener("click", startGame);
      $("howToPlay").addEventListener("click", showInstructions);
      $("pauseButton").addEventListener("click", pauseGame);
      $("restartButton").addEventListener("click", () => {
        if (state === "ready") {
          startGame();
        } else {
          startGame();
        }
      });

      $("viewAchievements").addEventListener("click", showAchievements);
      $("bossButton").addEventListener("click", inspectBoss);
      $("modalClose").addEventListener("click", () => $("infoModal").hidden = true);

      $("infoModal").addEventListener("click", (event) => {
        if (event.target === $("infoModal")) $("infoModal").hidden = true;
      });

      window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) {
          event.preventDefault();
        }

        if (key === "arrowleft" || key === "a") keys.left = true;
        if (key === "arrowright" || key === "d") keys.right = true;

        if (
          key === " " || key === "arrowup" || key === "w"
        ) {
          if (!event.repeat) jumpQueued = true;
        }

        if (key === "escape") {
          if (!$("infoModal").hidden) {
            $("infoModal").hidden = true;
          } else if (state === "playing" || state === "paused") {
            pauseGame();
          }
        }
      });

      window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        if (key === "arrowleft" || key === "a") keys.left = false;
        if (key === "arrowright" || key === "d") keys.right = false;
      });

      window.addEventListener("blur", () => {
        keys.left = false;
        keys.right = false;
        touchKeys.left = false;
        touchKeys.right = false;
        if (state === "playing") pauseGame();
      });

      document.querySelectorAll("[data-control]").forEach(button => {
        const control = button.dataset.control;

        const startControl = (event) => {
          event.preventDefault();
          if (control === "jump") {
            jumpQueued = true;
          } else {
            touchKeys[control] = true;
          }
        };

        const stopControl = (event) => {
          event.preventDefault();
          if (control !== "jump") touchKeys[control] = false;
        };

        button.addEventListener("pointerdown", startControl);
        button.addEventListener("pointerup", stopControl);
        button.addEventListener("pointercancel", stopControl);
        button.addEventListener("pointerleave", stopControl);
        button.addEventListener("contextmenu", event => event.preventDefault());
      });

      // Initial attract screen: animate the scenery before the first game.
      resetWorld();
      render();

      // Cosmetic idle animation on the canvas before starting.
      function idleLoop(timestamp) {
        if (state !== "ready") return;
        elapsed = timestamp / 1000;
        render();
        animationId = requestAnimationFrame(idleLoop);
      }
      animationId = requestAnimationFrame(idleLoop);
    })();
