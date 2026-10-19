const demos = {
  gamer: {
    title: "LEVEL UP! +100 XP",
    text: "Achievement unlocked: You opened the preview. In the final version, we can build real mini-games, collectibles and a birthday boss battle."
  },
  os: {
    title: "SYSTEM CHECK: LEGENDARY",
    text: "All systems operational. Roommate.exe is using 98% of available chaos. Secret birthday files are still being compiled."
  },
  classified: {
    title: "CASE FILE UPDATED",
    text: "New evidence discovered: subject is an excellent friend with suspiciously chaotic behaviour. Clearance level: ROOMMATE."
  },
  internet: {
    title: "VISITOR #000001",
    text: "Congratulations! You are officially the first visitor. Your internet aura has increased by 4.2 questionable points."
  },
  awards: {
    title: "AND THE AWARD GOES TO…",
    text: "The award for Most Likely to Be Roasted on His Birthday goes to… ATHARVA! Please hold your acceptance speech."
  },
  quest: {
    title: "SIDE QUEST UNLOCKED",
    text: "Quest: Tell Ayush which theme you like. Reward: one extremely personalised birthday website. Difficulty: easy, hopefully."
  }
};
const page = document.querySelector("[data-page]");
const dialog = document.getElementById("themeDemo");
if (page && dialog) {
  const data = demos[page.dataset.page] || demos.gamer;
  document.querySelectorAll("[data-demo]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("demoTitle").textContent = data.title;
      document.getElementById("demoText").textContent = data.text;
      dialog.showModal();
    });
  });
  document.getElementById("closeDemo").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}
