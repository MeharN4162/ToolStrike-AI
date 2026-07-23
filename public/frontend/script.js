// TOOL SWITCHING
const navItems = document.querySelectorAll(".nav-item");
const toolCards = document.querySelectorAll(".tool-card");
const toolTitle = document.getElementById("tool-title");
const toolDesc = document.getElementById("tool-desc");
const mobileToolSelect = document.getElementById("mobile-tool-select");
const toast = document.getElementById("toast");
const ambientStage = document.querySelector(".ambient-stage");
const ambientMessage = document.getElementById("ambient-message");
const editorCounters = new WeakMap();

const toolInfo = {
  summarizer: {
    title: "Summarizer",
    desc: "Turn long text into a clean, short summary.",
  },
  paraphraser: {
    title: "Paraphraser",
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

// ⭐ FINAL FIX — UNIVERSAL TOOL SWITCHER
function openTool(tool) {
  // Switch active tool-card
  toolCards.forEach((card) => {
    card.classList.toggle("active", card.id === tool);
  });

  // Switch active sidebar item
  navItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-target") === tool);
  });

  // Update header
  toolTitle.textContent = toolInfo[tool].title;
  toolDesc.textContent = toolInfo[tool].desc;
  if (mobileToolSelect) mobileToolSelect.value = tool;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
}

function showAmbientMessage(message) {
  if (!ambientMessage) return;
  ambientMessage.classList.remove("ambient-message-visible");
  window.requestAnimationFrame(() => {
    ambientMessage.textContent = message;
    ambientMessage.classList.add("ambient-message-visible");
  });
}

function chooseMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Sidebar click switching
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-target");
    openTool(target);
  });
});

if (mobileToolSelect) {
  mobileToolSelect.addEventListener("change", () => openTool(mobileToolSelect.value));
}

// ⭐ HASH SWITCHING — WORKS WITH DAILY HUB
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash && toolInfo[hash]) {
    openTool(hash);
  }
});

// SPACE STARS
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

  if (ambientStage) {
    const spawnAmbientNode = () => {
      const node = document.createElement("span");
      node.className = "ambient-node ambient-node-random";
      node.style.left = `${8 + Math.random() * 84}%`;
      node.style.top = `${18 + Math.random() * 58}%`;
      const size = 4 + Math.random() * 5;
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.animationDuration = `${3.2 + Math.random() * 2.4}s`;
      node.style.animationDelay = `${Math.random() * 0.4}s`;
      ambientStage.appendChild(node);
      window.setTimeout(() => node.remove(), 6000);
      window.setTimeout(spawnAmbientNode, 900 + Math.random() * 2600);
    };

    window.setTimeout(spawnAmbientNode, 700 + Math.random() * 1800);
  }
});

// DISPLAY RESULT
function displayResult(text) {
  const activeTool = document.querySelector(".tool-card.active");
  const outputBox = activeTool.querySelector(".answer-box");
  outputBox.value = text;
}

// COPY BUTTONS
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const text = document.getElementById(targetId).value;
    navigator.clipboard.writeText(text);
    btn.textContent = "Copied";
    showToast("Output copied to clipboard");
    setTimeout(() => (btn.textContent = "Copy"), 1200);
  });
});

// EDITOR CONTROLS
function formatCount(value) {
  const characters = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return `${words} words · ${characters} characters`;
}

function updateEditorCount(textarea) {
  const counter = editorCounters.get(textarea);
  if (counter) counter.textContent = formatCount(textarea.value);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll(".prompt-box, .answer-box").forEach((textarea) => {
  const section = textarea.closest(".panel-section");
  if (textarea.classList.contains("answer-box")) {
    textarea.placeholder = "Your AI result will appear here...";
  }
  const toolbar = document.createElement("div");
  toolbar.className = "editor-toolbar";

  const counter = document.createElement("span");
  counter.className = "editor-count";
  editorCounters.set(textarea, counter);
  const updateCount = () => {
    counter.textContent = formatCount(textarea.value);
  };
  textarea.addEventListener("input", updateCount);
  updateCount();
  toolbar.appendChild(counter);

  const expandButton = document.createElement("button");
  expandButton.type = "button";
  expandButton.className = "editor-btn";
  expandButton.textContent = "Expand";
  expandButton.addEventListener("click", () => {
    section.classList.toggle("editor-expanded");
    expandButton.textContent = section.classList.contains("editor-expanded") ? "Collapse" : "Expand";
  });
  toolbar.appendChild(expandButton);

  if (textarea.classList.contains("prompt-box")) {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "editor-btn";
    clearButton.textContent = "Clear";
    clearButton.addEventListener("click", () => {
      textarea.value = "";
      textarea.dispatchEvent(new Event("input"));
      textarea.focus();
      showToast("Editor cleared");
    });
    toolbar.appendChild(clearButton);
  } else {
    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.className = "editor-btn";
    downloadButton.textContent = "Download";
    downloadButton.addEventListener("click", () => {
      const tool = textarea.id.replace("-output", "");
      downloadText(`toolstrike-${tool}.txt`, textarea.value);
      showToast("Download started");
    });
    toolbar.appendChild(downloadButton);
  }

  textarea.insertAdjacentElement("afterend", toolbar);
});

document.querySelectorAll(".prompt-box").forEach((textarea) => {
  textarea.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      const runButton = textarea.closest(".tool-card")?.querySelector(".primary-btn");
      if (runButton && !runButton.disabled) runButton.click();
    }
  });
});

// THEME TOGGLE
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  const savedTheme = localStorage.getItem("toolstrike-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.body.setAttribute("data-theme", savedTheme);
  }

  const updateThemeLabel = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const label = document.querySelector(".theme-label");
    if (label) label.textContent = isDark ? "Dark" : "Light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  };

  updateThemeLabel();
  themeToggle.addEventListener("click", () => {
    const body = document.body;

    if (body.getAttribute("data-theme") === "dark") {
      body.setAttribute("data-theme", "light");
      localStorage.setItem("toolstrike-theme", "light");
    } else {
      body.setAttribute("data-theme", "dark");
      localStorage.setItem("toolstrike-theme", "dark");
    }
    updateThemeLabel();
    showToast(`${body.getAttribute("data-theme") === "dark" ? "Dark" : "Light"} theme enabled`);
  });
}

// API CALL FUNCTION
async function runTool(endpoint, input, options = {}) {
  const loader = document.getElementById(`${endpoint}-loader`);
  const output = document.getElementById(`${endpoint}-output`);
  const runButton = document.getElementById(`${endpoint}-run`);

  if (!loader || !output) return;

  loader.classList.add("active");
  output.value = "";
  output.classList.remove("output-complete");
  if (runButton) runButton.disabled = true;

  const thinkingTimer = window.setTimeout(() => {
    showAmbientMessage(chooseMessage(["Thinking it through...", "Shaping your result...", "Finding the clearest wording..."]));
  }, 700);
  showAmbientMessage(chooseMessage(["Preparing your result...", "Reading the brief...", "Working on it..."]));

  try {
    const response = await fetch(`https://toolstrike-ai-backend.onrender.com/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, ...options }),
    });

    const data = await response.json();
    output.value = data.result || data.error || "No response.";
    updateEditorCount(output);
    output.classList.add("output-complete");
    showAmbientMessage(data.result ? chooseMessage(["Done. Nice and clean.", "Result ready.", "Success. Your output is ready."]) : "The tool returned a response.");
  } catch (err) {
    output.value = "Error connecting to backend.";
    updateEditorCount(output);
    showAmbientMessage("The connection had a hiccup. Try again.");
  } finally {
    window.clearTimeout(thinkingTimer);
    loader.classList.remove("active");
    if (runButton) runButton.disabled = false;
  }
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
