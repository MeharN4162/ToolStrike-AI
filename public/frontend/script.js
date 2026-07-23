// TOOL SWITCHING
const navItems = document.querySelectorAll(".nav-item");
const toolCards = document.querySelectorAll(".tool-card");
const toolTitle = document.getElementById("tool-title");
const toolDesc = document.getElementById("tool-desc");
const mobileToolSelect = document.getElementById("mobile-tool-select");
const toast = document.getElementById("toast");
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

function downloadMarkdown(tool, title, text) {
  const content = `# ${title} Result\n\n${text}\n`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `toolstrike-${tool}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPdf(title, text) {
  const win = window.open("", "_blank");
  if (!win) {
    showToast("Allow pop-ups to export as PDF");
    return;
  }
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
    <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.6;color:#111;padding:0 20px;}h1{font-family:sans-serif;}</style>
    </head><body><h1>${title}</h1><p>${escaped}</p>
    <script>window.onload = () => window.print();<\/script>
    </body></html>`);
  win.document.close();
}

// HISTORY (per tool, stored locally)
const HISTORY_LIMIT = 15;

function historyKey(tool) {
  return `toolstrike-history-${tool}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function loadHistory(tool) {
  try {
    return JSON.parse(localStorage.getItem(historyKey(tool))) || [];
  } catch {
    return [];
  }
}

function saveHistoryEntry(tool, input, output) {
  if (!input || !output) return;
  const entries = loadHistory(tool);
  entries.unshift({ time: Date.now(), input, output });
  localStorage.setItem(historyKey(tool), JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
}

function formatHistoryTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function renderHistoryPanel(tool, panel, inputBox, outputBox) {
  const entries = loadHistory(tool);
  panel.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No past results yet for this tool.";
    panel.appendChild(empty);
    return;
  }

  const clearRow = document.createElement("div");
  clearRow.className = "history-clear-row";
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.textContent = "Clear history";
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(historyKey(tool));
    renderHistoryPanel(tool, panel, inputBox, outputBox);
    showToast("History cleared");
  });
  clearRow.appendChild(clearBtn);
  panel.appendChild(clearRow);

  entries.forEach((entry) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "history-entry";
    const snippet = entry.input.slice(0, 60).replace(/\s+/g, " ");
    const truncated = entry.input.length > 60 ? "…" : "";
    item.innerHTML = `<span class="history-time">${escapeHtml(formatHistoryTime(entry.time))}</span><span class="history-snippet">${escapeHtml(snippet)}${truncated}</span>`;
    item.addEventListener("click", () => {
      if (inputBox) {
        inputBox.value = entry.input;
        inputBox.dispatchEvent(new Event("input"));
      }
      outputBox.value = entry.output;
      updateEditorCount(outputBox);
      panel.classList.remove("open");
      showToast("Restored from history");
    });
    panel.appendChild(item);
  });
}

// WORD-LEVEL DIFF (for Grammar Fixer)
function computeWordDiff(oldText, newText) {
  const oldWords = oldText.split(/(\s+)/).filter((w) => w.length);
  const newWords = newText.split(/(\s+)/).filter((w) => w.length);
  const m = oldWords.length;
  const n = newWords.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = oldWords[i] === newWords[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldWords[i] === newWords[j]) {
      result.push({ type: "equal", text: oldWords[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: oldWords[i] });
      i++;
    } else {
      result.push({ type: "added", text: newWords[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: oldWords[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", text: newWords[j] });
    j++;
  }
  return result;
}

function renderDiff(oldText, newText, container) {
  container.innerHTML = "";
  computeWordDiff(oldText, newText).forEach((part) => {
    const span = document.createElement("span");
    if (part.type === "removed") span.className = "diff-removed";
    else if (part.type === "added") span.className = "diff-added";
    span.textContent = `${part.text} `;
    container.appendChild(span);
  });
}

// AMBIENT STAGE — drifting glow orbs + "generating" status while a tool runs
function spawnAmbientOrbs(count = 5) {
  const stage = document.getElementById("ambientStage");
  if (!stage) return;
  const colors = [
    "rgba(139, 147, 255, 0.55)",
    "rgba(94, 230, 255, 0.55)",
    "rgba(79, 70, 229, 0.5)",
    "rgba(14, 165, 233, 0.5)",
  ];

  for (let i = 0; i < count; i++) {
    const orb = document.createElement("div");
    orb.className = "ambient-orb";
    const size = 50 + Math.random() * 90;
    orb.style.top = `${5 + Math.random() * 75}%`;
    orb.style.width = `${size}px`;
    orb.style.height = `${size}px`;
    orb.style.background = colors[i % colors.length];
    orb.style.animationDuration = `${9 + Math.random() * 10}s`;
    orb.style.animationDelay = `${Math.random() * 8}s`;
    stage.appendChild(orb);
  }
}

let ambientTypeTimer = null;

function typeAmbientText(text) {
  const el = document.getElementById("ambientText");
  if (!el) return;
  clearInterval(ambientTypeTimer);
  el.textContent = "";
  let i = 0;
  ambientTypeTimer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(ambientTypeTimer);
  }, 22);
}

function setAmbientBusy(message) {
  const ambientLoader = document.getElementById("ambientLoader");
  if (ambientLoader) ambientLoader.classList.add("active");
  typeAmbientText(message);
}

function clearAmbientBusy() {
  clearInterval(ambientTypeTimer);
  const ambientLoader = document.getElementById("ambientLoader");
  if (ambientLoader) ambientLoader.classList.remove("active");
  const el = document.getElementById("ambientText");
  if (el) el.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => spawnAmbientOrbs(5));

document.querySelectorAll(".prompt-box, .answer-box").forEach((textarea) => {
  const section = textarea.closest(".panel-section");
  const isAnswer = textarea.classList.contains("answer-box");
  if (isAnswer) {
    textarea.placeholder = "Your AI result will appear here...";
  }
  const tool = isAnswer ? textarea.id.replace("-output", "") : null;
  const wrapper = textarea.closest(".output-wrapper");

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

  // SHOW DIFFERENCE (Grammar Fixer only) — sits left of Expand
  if (tool === "grammar") {
    const diffView = document.getElementById("grammar-diff");
    const diffToggle = document.createElement("button");
    diffToggle.type = "button";
    diffToggle.className = "editor-btn";
    diffToggle.id = "grammar-diff-toggle";
    diffToggle.textContent = "Show Difference";
    diffToggle.addEventListener("click", () => {
      const grammarInput = document.getElementById("grammar-input");
      if (!textarea.value) {
        showToast("Fix some text first");
        return;
      }
      const showing = diffView.classList.toggle("visible");
      textarea.style.display = showing ? "none" : "";
      if (showing) renderDiff(grammarInput.value, textarea.value, diffView);
      diffToggle.textContent = showing ? "Hide Difference" : "Show Difference";
    });
    toolbar.appendChild(diffToggle);
  }

  const expandButton = document.createElement("button");
  expandButton.type = "button";
  expandButton.className = "editor-btn";
  expandButton.textContent = "Expand";
  expandButton.addEventListener("click", () => {
    section.classList.toggle("editor-expanded");
    expandButton.textContent = section.classList.contains("editor-expanded") ? "Collapse" : "Expand";
  });
  toolbar.appendChild(expandButton);

  let historyPanel = null;

  if (!isAnswer) {
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
    const inputBox = textarea.closest(".tool-card")?.querySelector(".prompt-box");

    // DOWNLOAD MENU (txt / markdown / pdf)
    const downloadWrap = document.createElement("div");
    downloadWrap.className = "download-menu";

    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.className = "editor-btn";
    downloadButton.textContent = "Download ▾";
    downloadWrap.appendChild(downloadButton);

    const downloadOptions = document.createElement("div");
    downloadOptions.className = "download-options";
    [
      { label: "As .txt", ext: "txt" },
      { label: "As Markdown", ext: "md" },
      { label: "As PDF", ext: "pdf" },
    ].forEach(({ label, ext }) => {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.textContent = label;
      opt.addEventListener("click", () => {
        if (!textarea.value) {
          showToast("Nothing to export yet");
          downloadOptions.classList.remove("open");
          return;
        }
        const title = toolInfo[tool]?.title || tool;
        if (ext === "txt") downloadText(`toolstrike-${tool}.txt`, textarea.value);
        else if (ext === "md") downloadMarkdown(tool, title, textarea.value);
        else downloadPdf(title, textarea.value);
        downloadOptions.classList.remove("open");
        showToast(`Exporting as ${ext.toUpperCase()}`);
      });
      downloadOptions.appendChild(opt);
    });
    downloadWrap.appendChild(downloadOptions);

    downloadButton.addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelectorAll(".download-options.open, .history-panel.open").forEach((el) => {
        if (el !== downloadOptions) el.classList.remove("open");
      });
      downloadOptions.classList.toggle("open");
    });

    toolbar.appendChild(downloadWrap);

    // HISTORY
    const historyButton = document.createElement("button");
    historyButton.type = "button";
    historyButton.className = "editor-btn";
    historyButton.textContent = "History";
    toolbar.appendChild(historyButton);

    historyPanel = document.createElement("div");
    historyPanel.className = "history-panel";

    historyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !historyPanel.classList.contains("open");
      document.querySelectorAll(".download-options.open, .history-panel.open").forEach((el) => {
        if (el !== historyPanel) el.classList.remove("open");
      });
      if (willOpen) {
        renderHistoryPanel(tool, historyPanel, inputBox, textarea);
        historyPanel.classList.add("open");
      } else {
        historyPanel.classList.remove("open");
      }
    });
  }

  const insertTarget = wrapper || textarea;
  insertTarget.insertAdjacentElement("afterend", toolbar);
  if (historyPanel) {
    toolbar.insertAdjacentElement("afterend", historyPanel);
  }
});

document.addEventListener("click", () => {
  document.querySelectorAll(".download-options.open, .history-panel.open").forEach((el) => el.classList.remove("open"));
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
const AMBIENT_MIN_VISIBLE_MS = 1600;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTool(endpoint, input, options = {}) {
  const loader = document.getElementById(`${endpoint}-loader`);
  const output = document.getElementById(`${endpoint}-output`);
  const runButton = document.getElementById(`${endpoint}-run`);

  if (!loader || !output) return;

  loader.classList.add("active");
  output.value = "";
  output.classList.remove("output-complete");
  if (runButton) runButton.disabled = true;

  setAmbientBusy(`Generating your ${toolInfo[endpoint]?.title || endpoint} result…`);
  const startedAt = Date.now();

  try {
    const response = await fetch(`https://toolstrike-ai-backend.onrender.com/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, ...options }),
    });

    const data = await response.json();

    const elapsed = Date.now() - startedAt;
    if (elapsed < AMBIENT_MIN_VISIBLE_MS) await wait(AMBIENT_MIN_VISIBLE_MS - elapsed);

    output.value = data.result || data.error || "No response.";
    updateEditorCount(output);
    output.classList.add("output-complete");

    if (data.result) {
      saveHistoryEntry(endpoint, input, data.result);

      if (endpoint === "grammar") {
        const diffView = document.getElementById("grammar-diff");
        const diffToggle = document.getElementById("grammar-diff-toggle");
        if (diffView && diffToggle) {
          diffView.classList.remove("visible");
          output.style.display = "";
          diffToggle.textContent = "Show Difference";
        }
      }
    }
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    if (elapsed < AMBIENT_MIN_VISIBLE_MS) await wait(AMBIENT_MIN_VISIBLE_MS - elapsed);
    output.value = "Error connecting to backend.";
    updateEditorCount(output);
  } finally {
    loader.classList.remove("active");
    if (runButton) runButton.disabled = false;
    clearAmbientBusy();
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

