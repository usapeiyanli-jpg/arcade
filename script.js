const tasks = [
  "Clear inbox",
  "Ship tiny fix",
  "Plan next move",
  "Drink water",
  "Send update",
  "Review notes",
  "Close one tab",
  "Stretch break"
];

const colors = ["#52ff8f", "#ffd84d", "#00d9ff", "#ff7a2f", "#ff69c9", "#b8ff4d", "#8be0ff", "#ffef8a"];
const arena = document.querySelector("#arena");
const claw = document.querySelector("#claw");
const ticketsEl = document.querySelector("#tickets");
const streakEl = document.querySelector("#streak");
const rankEl = document.querySelector("#rank");
const currentTaskEl = document.querySelector("#currentTask");
const rewardPop = document.querySelector("#rewardPop");
const leftBtn = document.querySelector("#leftBtn");
const rightBtn = document.querySelector("#rightBtn");
const dropBtn = document.querySelector("#dropBtn");
const resetBtn = document.querySelector("#resetBtn");
const shopGrid = document.querySelector("#shopGrid");
const shopStatus = document.querySelector("#shopStatus");
const trophyShelf = document.querySelector("#trophyShelf");
const trophyCount = document.querySelector("#trophyCount");
const trophyStatus = document.querySelector("#trophyStatus");

const trophyNames = [
  "Task Sweep",
  "Focus Champion",
  "Inbox Vanquisher",
  "Momentum Master",
  "Jackpot Finisher",
  "Arcade Legend"
];

const cosmetics = [
  {
    id: "theme-sunrise",
    type: "theme",
    name: "Sunrise Cabinet",
    cost: 10,
    description: "A hot pink and gold arcade shell.",
    preview: "linear-gradient(90deg, #ff295c, #ffb238, #00d9ff)"
  },
  {
    id: "theme-mint",
    type: "theme",
    name: "Mint Voltage",
    cost: 25,
    description: "Fresh neon trim for earned momentum.",
    preview: "linear-gradient(90deg, #52ff8f, #00d9ff, #ff69c9)"
  },
  {
    id: "theme-royal",
    type: "theme",
    name: "Royal Jackpot",
    cost: 45,
    description: "Gold, purple, and prize-counter drama.",
    preview: "linear-gradient(90deg, #ffd84d, #6f38ff, #52ff8f)"
  },
  {
    id: "claw-chrome",
    type: "claw",
    name: "Chrome Claw",
    cost: 15,
    description: "A polished grabber for crisp catches.",
    preview: "linear-gradient(90deg, #ffffff, #9befff, #7d8bff)"
  },
  {
    id: "claw-gold",
    type: "claw",
    name: "Gold Claw",
    cost: 35,
    description: "Turns every drop into a jackpot move.",
    preview: "linear-gradient(90deg, #fff7a8, #ffd84d, #ff8c21)"
  },
  {
    id: "claw-neon",
    type: "claw",
    name: "Neon Claw",
    cost: 60,
    description: "A glowing claw for serious streaks.",
    preview: "linear-gradient(90deg, #ff69c9, #00d9ff, #52ff8f)"
  },
  {
    id: "prize-stars",
    type: "prize",
    name: "Star Capsules",
    cost: 20,
    description: "Adds star trim to every task prize.",
    preview: "linear-gradient(90deg, #ffd84d, #fff7a8, #ffd84d)"
  },
  {
    id: "prize-crowns",
    type: "prize",
    name: "Crown Capsules",
    cost: 40,
    description: "Makes tasks look like mini trophies.",
    preview: "linear-gradient(90deg, #ff7a2f, #ffd84d, #ff2f8f)"
  },
  {
    id: "prize-gems",
    type: "prize",
    name: "Gem Capsules",
    cost: 55,
    description: "A shiny prize style for big-ticket days.",
    preview: "linear-gradient(90deg, #00d9ff, #6f38ff, #52ff8f)"
  }
];

let clawX = 50;
let tickets = 0;
let streak = 0;
let isDropping = false;
let ownedCosmetics = new Set();
let equippedCosmetics = {
  theme: "",
  claw: "",
  prize: ""
};
let trophies = [];

function setClawX(value) {
  clawX = Math.max(10, Math.min(90, value));
  claw.style.setProperty("--x", clawX);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function restockTasks() {
  arena.innerHTML = "";
  const spread = shuffle(tasks);
  const slots = [
    [2, 64], [24, 78], [48, 63], [70, 77],
    [12, 43], [36, 46], [60, 38], [78, 52]
  ];

  spread.forEach((text, index) => {
    const task = document.createElement("button");
    task.type = "button";
    task.className = "task";
    task.textContent = text;
    task.dataset.task = text;
    task.style.background = colors[index % colors.length];
    task.style.left = `${slots[index][0]}%`;
    task.style.top = `${slots[index][1]}%`;
    task.style.transform = `rotate(${(index % 2 ? 1 : -1) * (4 + index)}deg)`;
    task.addEventListener("click", () => {
      const rect = task.getBoundingClientRect();
      const glassRect = document.querySelector(".glass").getBoundingClientRect();
      const glassCenter = ((rect.left + rect.width / 2 - glassRect.left) / glassRect.width) * 100;
      setClawX(glassCenter);
      currentTaskEl.textContent = `Aiming for: ${text}`;
    });
    arena.appendChild(task);
  });

  currentTaskEl.textContent = "Line up the claw and catch a task.";
}

function rankForTickets(score) {
  if (score >= 120) return "Legend";
  if (score >= 75) return "Champion";
  if (score >= 35) return "Hot Streak";
  return "Rookie";
}

function updateTicketDisplay() {
  ticketsEl.textContent = tickets;
  rankEl.textContent = rankForTickets(tickets);
  renderShop();
}

function updateScore(points, taskName) {
  tickets += points;
  streak += 1;
  streakEl.textContent = streak;
  currentTaskEl.textContent = `${taskName} finished. You earn ${points} tickets.`;
  updateTicketDisplay();
}

function renderTrophies() {
  trophyCount.textContent = `${trophies.length} ${trophies.length === 1 ? "trophy" : "trophies"}`;
  trophyShelf.innerHTML = "";

  if (!trophies.length) {
    const empty = document.createElement("div");
    empty.className = "empty-trophy";
    empty.textContent = "No trophies yet";
    trophyShelf.appendChild(empty);
    return;
  }

  trophies.forEach((trophy, index) => {
    const card = document.createElement("article");
    card.className = "trophy";
    card.style.animationDelay = `${Math.min(index * 0.04, 0.2)}s`;

    const cup = document.createElement("div");
    cup.className = "trophy-cup";

    const label = document.createElement("span");
    label.textContent = trophy;

    card.append(cup, label);
    trophyShelf.prepend(card);
  });
}

function awardTrophy() {
  const name = trophyNames[trophies.length % trophyNames.length];
  const edition = Math.floor(trophies.length / trophyNames.length) + 1;
  const trophyName = edition > 1 ? `${name} ${edition}` : name;
  const bonus = 25 + Math.min(trophies.length * 5, 50);

  trophies.push(trophyName);
  tickets += bonus;
  trophyStatus.textContent = `${trophyName} earned for clearing the machine. Bonus: ${bonus} tickets.`;
  currentTaskEl.textContent = `Machine cleared. You win the ${trophyName} trophy.`;
  rewardPop.textContent = `Trophy won! +${bonus}`;
  rewardPop.classList.remove("show");
  void rewardPop.offsetWidth;
  rewardPop.classList.add("show");
  updateTicketDisplay();
  renderTrophies();
}

function applyCosmetics() {
  const applied = Object.values(equippedCosmetics).filter(Boolean);
  document.body.className = applied.join(" ");
}

function buyCosmetic(item) {
  if (ownedCosmetics.has(item.id)) {
    equippedCosmetics[item.type] = item.id;
    applyCosmetics();
    shopStatus.textContent = `${item.name} equipped.`;
    renderShop();
    return;
  }

  if (tickets < item.cost) {
    shopStatus.textContent = `${item.name} needs ${item.cost - tickets} more tickets.`;
    return;
  }

  tickets -= item.cost;
  ownedCosmetics.add(item.id);
  equippedCosmetics[item.type] = item.id;
  applyCosmetics();
  updateTicketDisplay();
  shopStatus.textContent = `${item.name} unlocked and equipped.`;
}

function buttonText(item) {
  if (equippedCosmetics[item.type] === item.id) return "Equipped";
  if (ownedCosmetics.has(item.id)) return "Equip";
  return `Buy ${item.cost}`;
}

function renderShop() {
  shopGrid.innerHTML = "";

  cosmetics.forEach((item) => {
    const card = document.createElement("article");
    const isEquipped = equippedCosmetics[item.type] === item.id;
    card.className = `shop-card${isEquipped ? " equipped" : ""}`;

    const preview = document.createElement("div");
    preview.className = "shop-preview";
    preview.style.background = item.preview;

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    title.textContent = item.name;
    description.textContent = item.description;
    copy.append(title, description);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = buttonText(item);
    button.disabled = isEquipped;
    button.addEventListener("click", () => buyCosmetic(item));

    card.append(preview, copy, button);
    shopGrid.appendChild(card);
  });
}

function nearestTask() {
  const clawRect = claw.getBoundingClientRect();
  const clawCenter = clawRect.left + clawRect.width / 2;
  const candidates = [...arena.querySelectorAll(".task")].map((task) => {
    const rect = task.getBoundingClientRect();
    const taskCenter = rect.left + rect.width / 2;
    return {
      task,
      distance: Math.abs(clawCenter - taskCenter)
    };
  });

  return candidates
    .filter((item) => item.distance < 58)
    .sort((a, b) => a.distance - b.distance)[0]?.task;
}

function showReward(taskName, points) {
  rewardPop.textContent = `+${points} tickets!`;
  rewardPop.classList.remove("show");
  void rewardPop.offsetWidth;
  rewardPop.classList.add("show");
  updateScore(points, taskName);
}

function dropClaw() {
  if (isDropping) return;

  isDropping = true;
  dropBtn.disabled = true;
  claw.style.setProperty("--y", 198);

  window.setTimeout(() => {
    claw.classList.add("grabbing");
    const caught = nearestTask();

    if (caught) {
      const taskName = caught.dataset.task;
      const points = 10 + Math.min(streak * 3, 20);
      caught.classList.add("caught");
      caught.style.left = "82%";
      caught.style.top = "84%";
      caught.style.transform = "scale(0.45) rotate(12deg)";

      window.setTimeout(() => {
        caught.remove();
        showReward(taskName, points);
        finishDrop();
        if (!arena.querySelector(".task")) {
          awardTrophy();
          window.setTimeout(restockTasks, 1300);
        }
      }, 460);
    } else {
      streak = 0;
      streakEl.textContent = streak;
      currentTaskEl.textContent = "So close. Nudge the claw and try again.";
      finishDrop();
    }
  }, 520);
}

function finishDrop() {
  claw.style.setProperty("--y", 72);
  window.setTimeout(() => {
    claw.classList.remove("grabbing");
    dropBtn.disabled = false;
    isDropping = false;
  }, 520);
}

leftBtn.addEventListener("click", () => setClawX(clawX - 8));
rightBtn.addEventListener("click", () => setClawX(clawX + 8));
dropBtn.addEventListener("click", dropClaw);
resetBtn.addEventListener("click", () => {
  streak = 0;
  streakEl.textContent = streak;
  restockTasks();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setClawX(clawX - 8);
  if (event.key === "ArrowRight") setClawX(clawX + 8);
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    dropClaw();
  }
});

restockTasks();
renderShop();
renderTrophies();
