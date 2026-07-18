// TOOL SWITCHING
const navItems = document.querySelectorAll(".nav-item");
const toolCards = document.querySelectorAll(".tool-card");
const toolTitle = document.getElementById("tool-title");
const toolDesc = document.getElementById("tool-desc");

const toolInfo = {
  summarizer: {
    title: "AI Summarizer",
    desc: "Turn long text into a clean, short summary.",
  },
  paraphraser: {
    title: "AI Paraphraser",
    desc: "Rewrite text in a new way while keeping meaning.",
  },
  grammar: {
    title: "Grammar Fixer",
    desc: "Fix grammar, spelling, and clarity issues.",
  },
  email: {
    title: "Email Writer",
    desc: "Generate professional or casual emails instantly.",
  },
  study: {
    title: "Study Helper",
    desc: "Explain topics at any level of difficulty.",
  },
  length: {
    title: "Length Control",
    desc: "Shorten or expand text while keeping meaning.",
  },
  tone: {
    title: "Tone Changer",
    desc: "Rewrite text in any tone you choose.",
  },
};

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const target = item.getAttribute("data-target");

    toolCards.forEach((card) => {
      card.classList.remove("active");
      if (card.id === target) card.classList.add("active");
    });

    toolTitle.textContent = toolInfo[target].title;
    toolDesc.textContent = toolInfo[target].desc;
  });
});

function createRandomSpaceStars(count = 80) {
  const container = document.getElementById("spaceStars");
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "space-star";

    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const scale = 0.6 + Math.random() * 0.8;

    star.style.top = `${top}%`;
    star.style.left = `${left}%`;
    star.style.animationDelay = `${delay}s`;
    star.style.transform = `scale(${scale})`;

    container.appendChild(star);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createRandomSpaceStars(80);
});

// COPY BUTTONS
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const text = document.getElementById(targetId).value;
    navigator.clipboard.writeText(text);
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy"), 1200);
  });
});

// THEME TOGGLE
document.getElementById("themeToggle").addEventListener("click", () => {
  const body = document.body;
  const label = document.querySelector(".theme-label");
  const icon = document.querySelector(".theme-icon");

  if (body.getAttribute("data-theme") === "dark") {
    body.setAttribute("data-theme", "light");
    label.textContent = "Light";
    icon.textContent = "☀️";
  } else {
    body.setAttribute("data-theme", "dark");
    label.textContent = "Dark";
    icon.textContent = "🌙";
  }
});

// API CALL FUNCTION
async function runTool(endpoint, input, options = {}) {
  const loader = document.getElementById(`${endpoint}-loader`);
  const output = document.getElementById(`${endpoint}-output`);

  loader.classList.add("active");
  output.value = "";

  try {
    const response = await fetch(`http://localhost:3001/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, ...options }),
    });

    const data = await response.json();
    output.value = data.result || data.error || "No response.";
  } catch (err) {
    output.value = "Error connecting to backend.";
  }

  loader.classList.remove("active");
}

// SUMMARIZER
document.getElementById("summarizer-run").addEventListener("click", () => {
  const input = document.getElementById("summarizer-input").value;
  const length = document.getElementById("summarizer-length").value;
  runTool("summarizer", input, { length });
});

// PARAPHRASER
document.getElementById("paraphraser-run").addEventListener("click", () => {
  const input = document.getElementById("paraphraser-input").value;
  const tone = document.getElementById("paraphraser-tone").value;
  runTool("paraphraser", input, { tone });
});

// GRAMMAR FIXER
document.getElementById("grammar-run").addEventListener("click", () => {
  const input = document.getElementById("grammar-input").value;
  runTool("grammar", input);
});

// EMAIL WRITER
document.getElementById("email-run").addEventListener("click", () => {
  const input = document.getElementById("email-prompt").value;
  const type = document.getElementById("email-type").value;
  const tone = document.getElementById("email-tone").value;
  runTool("email", input, { type, tone });
});

// STUDY HELPER
document.getElementById("study-run").addEventListener("click", () => {
  const input = document.getElementById("study-input").value;
  const level = document.getElementById("study-level").value;
  const format = document.getElementById("study-format").value;
  runTool("study", input, { level, format });
});

// LENGTH CONTROL
document.getElementById("length-run").addEventListener("click", () => {
  const input = document.getElementById("length-input").value;
  const mode = document.getElementById("length-mode").value;
  runTool("length", input, { mode });
});

// TONE CHANGER
document.getElementById("tone-run").addEventListener("click", () => {
  const input = document.getElementById("tone-input").value;
  const mode = document.getElementById("tone-mode").value;
  runTool("tone", input, { mode });
});

