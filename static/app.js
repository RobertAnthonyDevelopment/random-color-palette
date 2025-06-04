document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    paletteContainer: document.getElementById("palette-container"),
    generatePaletteBtn: document.getElementById("generate-palette"),
    downloadPaletteBtn: document.getElementById("download-palette"),
    generateGradientBtn: document.getElementById("generate-gradient"),
    downloadGradientBtn: document.getElementById("download-gradient"),
    gradientCanvas: document.getElementById("gradient-canvas"),
    gradientPreview: document.getElementById("gradient-preview"),
    addColorBtn: document.getElementById("add-color"),
    newColorInput: document.getElementById("new-color-hex"),
    copyAllColorsBtn: document.getElementById("copy-all-colors"),
    exportCssBtn: document.getElementById("export-css"),
    exportSassBtn: document.getElementById("export-sass"),
    exportJsonBtn: document.getElementById("export-json"),
    exportSvgBtn: document.getElementById("export-svg"),
    exportTailwindBtn: document.getElementById("export-tailwind"),
    toggleDarkModeBtn: document.getElementById("toggle-dark-mode"),
    generateLoremBtn: document.getElementById("generate-lorem-text"),
    loremOutput: document.getElementById("lorem-output"),
    loremParagraphs: document.getElementById("lorem-paragraphs"),
    undoBtn: document.getElementById("undo-action"),
    redoBtn: document.getElementById("redo-action"),
    clearPaletteBtn: document.getElementById("clear-palette"),
    notification: document.getElementById("notification"),
    notificationMessage: document.getElementById("notification-message")
  };

  const state = {
    colors: [],
    history: [],
    currentHistoryIndex: -1,
    isGenerating: false
  };

  // --- Utilities ---
  const utils = {
    showNotification: (message, duration = 2400) => {
      elements.notificationMessage.textContent = message;
      elements.notification.classList.add("show");
      setTimeout(() => {
        elements.notification.classList.remove("show");
      }, duration);
    },
    generateRandomHex: () =>
      `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
    getContrastColor: (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? "#000" : "#fff";
    },
    isValidHex: (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex),
    debounce: (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }
  };

  // --- Core Color Actions ---
  const colorFunctions = {
    generatePalette: () => {
      state.colors = Array.from({ length: 5 }, utils.generateRandomHex);
      stateManagement.updateHistory();
      renderPalette();
      utils.showNotification("New palette generated");
    },
    addColor: () => {
      const newHex = elements.newColorInput.value.trim();
      if (!utils.isValidHex(newHex)) {
        utils.showNotification("Enter a valid hex code (e.g. #FF5733)");
        return;
      }
      state.colors.push(newHex);
      elements.newColorInput.value = "";
      stateManagement.updateHistory();
      renderPalette();
      utils.showNotification("Color added");
    },
    clearPalette: () => {
      if (state.colors.length === 0) {
        utils.showNotification("Palette is already empty");
        return;
      }
      state.colors = [];
      stateManagement.updateHistory();
      renderPalette();
      utils.showNotification("Palette cleared");
    },
    editColor: (index) => {
      const currentColor = state.colors[index];
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentColor;
      input.style.cssText = "width: 120px; padding: 0.4rem; font-size: 1rem; border-radius: 0.4rem; border: 1.5px solid #e4e4e4; margin-top:0.6rem;";
      setTimeout(() => { input.focus(); input.select(); }, 100);

      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed; left:0; top:0; width:100vw; height:100vh;
        background: rgba(44,56,80,0.12); display:flex; align-items:center; justify-content:center; z-index:2002;`;
      const box = document.createElement("div");
      box.style.cssText = "background:#fff;padding:2rem 2.2rem 1.6rem 2.2rem;border-radius:1rem;box-shadow:0 4px 32px 0 rgba(0,0,0,0.17);display:flex;flex-direction:column;align-items:center;";
      const label = document.createElement("div");
      label.textContent = "Edit color hex:";
      label.style.cssText = "margin-bottom:0.35rem;font-weight:500;font-size:1rem;letter-spacing:0.01em;";
      const buttons = document.createElement("div");
      buttons.style.cssText = "margin-top:1.1rem;display:flex;gap:1rem;justify-content:center;width:100%;";
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "btn-primary";
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.className = "btn-secondary";
      buttons.appendChild(saveBtn);
      buttons.appendChild(cancelBtn);
      box.appendChild(label);
      box.appendChild(input);
      box.appendChild(buttons);
      modal.appendChild(box);
      document.body.appendChild(modal);

      const closeModal = () => document.body.removeChild(modal);
      cancelBtn.onclick = closeModal;
      saveBtn.onclick = () => {
        const newHex = input.value.trim();
        if (!utils.isValidHex(newHex)) {
          input.style.borderColor = "#ef4444";
          input.focus();
          return;
        }
        state.colors[index] = newHex;
        stateManagement.updateHistory();
        renderPalette();
        utils.showNotification("Color updated");
        closeModal();
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") saveBtn.onclick();
        if (e.key === "Escape") closeModal();
      };
      modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    },
    randomizeColor: (index) => {
      state.colors[index] = utils.generateRandomHex();
      stateManagement.updateHistory();
      renderPalette();
      utils.showNotification("Color randomized");
    },
    removeColor: (index) => {
      if (state.colors.length <= 1) {
        utils.showNotification("You need at least 1 color");
        return;
      }
      state.colors.splice(index, 1);
      stateManagement.updateHistory();
      renderPalette();
      utils.showNotification("Color removed");
    },
    copyColor: (color) => {
      navigator.clipboard.writeText(color);
      utils.showNotification(`Copied ${color}`);
    }
  };

  // --- Undo/Redo & History ---
  const stateManagement = {
    updateHistory: () => {
      state.history = state.history.slice(0, state.currentHistoryIndex + 1);
      state.history.push([...state.colors]);
      state.currentHistoryIndex = state.history.length - 1;
      stateManagement.updateUndoRedoButtons();
    },
    undo: () => {
      if (state.currentHistoryIndex > 0) {
        state.currentHistoryIndex--;
        state.colors = [...state.history[state.currentHistoryIndex]];
        renderPalette();
        stateManagement.updateUndoRedoButtons();
      }
    },
    redo: () => {
      if (state.currentHistoryIndex < state.history.length - 1) {
        state.currentHistoryIndex++;
        state.colors = [...state.history[state.currentHistoryIndex]];
        renderPalette();
        stateManagement.updateUndoRedoButtons();
      }
    },
    updateUndoRedoButtons: () => {
      elements.undoBtn.disabled = state.currentHistoryIndex <= 0;
      elements.redoBtn.disabled = state.currentHistoryIndex >= state.history.length - 1;
      elements.clearPaletteBtn.disabled = state.colors.length === 0;
    }
  };

  // --- Export & Utility ---
  const exportFunctions = {
    downloadPaletteImage: () => {
      if (state.colors.length === 0) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 100;
      canvas.width = state.colors.length * size;
      canvas.height = size;

      state.colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * size, 0, size, size);
      });

      const link = document.createElement("a");
      link.download = `palette-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
      utils.showNotification("Palette image downloaded");
    },
    generateGradient: () => {
      if (state.colors.length < 2) {
        utils.showNotification("You need at least 2 colors to generate a gradient");
        return;
      }
      elements.gradientPreview.classList.remove("hidden");

      // Responsive canvas width based on parent
      const width = elements.gradientPreview.offsetWidth - 32; // 32px for padding
      elements.gradientCanvas.width = width > 0 ? width : 600;
      elements.gradientCanvas.height = 60;
      const ctx = elements.gradientCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, elements.gradientCanvas.width, 0);

      state.colors.forEach((color, i) => {
        gradient.addColorStop(i / (state.colors.length - 1), color);
      });

      ctx.clearRect(0, 0, elements.gradientCanvas.width, elements.gradientCanvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, elements.gradientCanvas.width, elements.gradientCanvas.height);
      elements.downloadGradientBtn.classList.remove("hidden");
    },
    downloadGradientImage: () => {
      const link = document.createElement("a");
      link.download = `gradient-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = elements.gradientCanvas.toDataURL();
      link.click();
      utils.showNotification("Gradient image downloaded");
    },
    copyAllColors: () => {
      navigator.clipboard.writeText(state.colors.join("\n"));
      utils.showNotification("All colors copied");
    },
    exportCss: () => {
      const css = `:root {\n${state.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
      exportFunctions.downloadTextFile("palette.css", css);
    },
    exportSass: () => {
      const sass = state.colors.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
      exportFunctions.downloadTextFile("palette.scss", sass);
    },
    exportJson: () => {
      const json = JSON.stringify({
        palette: state.colors,
        generatedAt: new Date().toISOString()
      }, null, 2);
      exportFunctions.downloadTextFile("palette.json", json);
    },
    exportSvg: () => {
      const svg = `<svg width="${state.colors.length * 100}" height="100" xmlns="http://www.w3.org/2000/svg">\n${state.colors.map((c, i) => `  <rect x="${i * 100}" y="0" width="100" height="100" fill="${c}" />`).join("\n")}\n</svg>`;
      exportFunctions.downloadTextFile("palette.svg", svg);
    },
    exportTailwind: () => {
      const tailwindConfig = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${state.colors.map((c, i) => `        "color-${i + 1}": "${c}",`).join("\n")}\n      }\n    }\n  }\n}`;
      exportFunctions.downloadTextFile("tailwind.config.js", tailwindConfig);
    },
    downloadTextFile: (filename, content) => {
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      utils.showNotification(`${filename} downloaded`);
    }
  };

  // --- Lorem Ipsum ---
  const loremFunctions = {
    generateLorem: async () => {
      const paragraphs = elements.loremParagraphs.value;
      if (paragraphs < 1 || paragraphs > 10) {
        utils.showNotification("Please enter a number between 1 and 10");
        return;
      }
      try {
        state.isGenerating = true;
        elements.generateLoremBtn.disabled = true;
        elements.generateLoremBtn.innerHTML = '<span class="loading"></span> Generating...';
        const response = await fetch("/api/generate_lorem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paragraphs })
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        elements.loremOutput.value = data.lorem_text;
        utils.showNotification("Lorem Ipsum generated");
      } catch (error) {
        utils.showNotification("Failed to generate Lorem Ipsum");
      } finally {
        state.isGenerating = false;
        elements.generateLoremBtn.disabled = false;
        elements.generateLoremBtn.textContent = "Generate";
      }
    }
  };

  // --- Render Palette ---
  const renderPalette = () => {
    elements.paletteContainer.innerHTML = "";
    state.colors.forEach((color, index) => {
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = color;

      const hexLabel = document.createElement("p");
      hexLabel.textContent = color;
      hexLabel.style.color = utils.getContrastColor(color);

      const nameLabel = document.createElement("p");
      nameLabel.textContent = `Color ${index + 1}`;
      nameLabel.style.color = utils.getContrastColor(color);
      nameLabel.style.marginTop = "0.3rem";

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "color-btn-group";

      // Copy
      const copyBtn = document.createElement("button");
      copyBtn.className = "color-btn";
      copyBtn.textContent = "Copy";
      copyBtn.setAttribute("aria-label", `Copy ${color}`);
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        colorFunctions.copyColor(color);
      };

      // Randomize
      const randomizeBtn = document.createElement("button");
      randomizeBtn.className = "color-btn";
      randomizeBtn.textContent = "Randomize";
      randomizeBtn.setAttribute("aria-label", `Randomize ${color}`);
      randomizeBtn.onclick = (e) => {
        e.stopPropagation();
        colorFunctions.randomizeColor(index);
      };

      // Remove
      const removeBtn = document.createElement("button");
      removeBtn.className = "color-btn remove-btn";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", `Remove ${color}`);
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        colorFunctions.removeColor(index);
      };

      buttonGroup.appendChild(copyBtn);
      buttonGroup.appendChild(removeBtn);
      buttonGroup.appendChild(randomizeBtn);

      colorBox.appendChild(hexLabel);
      colorBox.appendChild(nameLabel);
      colorBox.appendChild(buttonGroup);

      colorBox.onclick = (e) => {
        if (e.target === colorBox || e.target === hexLabel || e.target === nameLabel) {
          colorFunctions.editColor(index);
        }
      };

      elements.paletteContainer.appendChild(colorBox);
    });

    elements.downloadPaletteBtn.disabled = state.colors.length === 0;
    elements.clearPaletteBtn.disabled = state.colors.length === 0;
    stateManagement.updateUndoRedoButtons();
  };

  // --- Event Listeners ---
  const setupEventListeners = () => {
    elements.addColorBtn.addEventListener("click", colorFunctions.addColor);
    elements.generatePaletteBtn.addEventListener("click", colorFunctions.generatePalette);
    elements.downloadPaletteBtn.addEventListener("click", exportFunctions.downloadPaletteImage);
    elements.generateGradientBtn.addEventListener("click", exportFunctions.generateGradient);
    elements.downloadGradientBtn.addEventListener("click", exportFunctions.downloadGradientImage);
    elements.copyAllColorsBtn.addEventListener("click", exportFunctions.copyAllColors);
    elements.exportCssBtn.addEventListener("click", exportFunctions.exportCss);
    elements.exportSassBtn.addEventListener("click", exportFunctions.exportSass);
    elements.exportJsonBtn.addEventListener("click", exportFunctions.exportJson);
    elements.exportSvgBtn.addEventListener("click", exportFunctions.exportSvg);
    elements.exportTailwindBtn.addEventListener("click", exportFunctions.exportTailwind);
    elements.toggleDarkModeBtn.addEventListener("click", toggleDarkMode);
    elements.generateLoremBtn.addEventListener("click", loremFunctions.generateLorem);
    elements.undoBtn.addEventListener("click", stateManagement.undo);
    elements.redoBtn.addEventListener("click", stateManagement.redo);
    elements.clearPaletteBtn.addEventListener("click", colorFunctions.clearPalette);

    elements.newColorInput.addEventListener("input", utils.debounce(() => {
      const value = elements.newColorInput.value.trim();
      if (value && !value.startsWith("#")) {
        elements.newColorInput.value = `#${value}`;
      }
    }, 300));
  };

  // --- Dark Mode ---
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    utils.showNotification(`Dark mode ${isDark ? "enabled" : "disabled"}`);
  };

  // --- Init ---
  const init = () => {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }
    colorFunctions.generatePalette();
    setupEventListeners();
  };

  init();
});
