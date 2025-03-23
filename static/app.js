document.addEventListener("DOMContentLoaded", () => {
  const paletteContainer = document.getElementById("palette-container");
  const generatePaletteBtn = document.getElementById("generate-palette");
  const downloadPaletteBtn = document.getElementById("download-palette");
  const generateGradientBtn = document.getElementById("generate-gradient");
  const downloadGradientBtn = document.getElementById("download-gradient");
  const gradientCanvas = document.getElementById("gradient-canvas");
  const gradientPreview = document.getElementById("gradient-preview");
  const addColorBtn = document.getElementById("add-color");
  const newColorInput = document.getElementById("new-color-hex");
  const copyAllColorsBtn = document.getElementById("copy-all-colors");
  const exportCssBtn = document.getElementById("export-css");
  const exportSassBtn = document.getElementById("export-sass");
  const exportJsonBtn = document.getElementById("export-json");
  const exportSvgBtn = document.getElementById("export-svg");
  const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
  const generateLoremBtn = document.getElementById("generate-lorem-text");
  const loremOutput = document.getElementById("lorem-output");
  const loremParagraphs = document.getElementById("lorem-paragraphs");

  let colors = [];
  let history = [];
  let currentHistoryIndex = -1;

  function getColorName(hex) {
    return "Custom";
  }

  function generatePalette() {
    colors = Array.from({ length: 5 }, () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);
    updateHistory();
    renderPalette();
  }

  function renderPalette() {
    paletteContainer.innerHTML = "";
    colors.forEach((color, index) => {
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = color;

      const hexLabel = document.createElement("p");
      hexLabel.textContent = color;

      const colorName = document.createElement("p");
      colorName.textContent = getColorName(color);
      colorName.style.marginTop = "5px";
      colorName.style.fontSize = "0.9rem";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-button";
      copyBtn.textContent = "Copy";
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(color);
        alert(`Copied ${color}`);
      };

      const randomizeBtn = document.createElement("button");
      randomizeBtn.className = "copy-button";
      randomizeBtn.style.bottom = "40px";
      randomizeBtn.textContent = "Randomize";
      randomizeBtn.onclick = (e) => {
        e.stopPropagation();
        colors[index] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        updateHistory();
        renderPalette();
      };

      colorBox.onclick = () => editColor(index);

      colorBox.appendChild(hexLabel);
      colorBox.appendChild(colorName);
      colorBox.appendChild(copyBtn);
      colorBox.appendChild(randomizeBtn);
      paletteContainer.appendChild(colorBox);
    });
  }

  function editColor(index) {
    const newHex = prompt("Enter new hex code:", colors[index]);
    if (newHex && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      colors[index] = newHex;
      updateHistory();
      renderPalette();
    } else if (newHex) {
      alert("Invalid hex code.");
    }
  }

  function addColor() {
    const newHex = newColorInput.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      colors.push(newHex);
      newColorInput.value = "";
      updateHistory();
      renderPalette();
    } else {
      alert("Please enter a valid hex code.");
    }
  }

  function downloadPaletteImage() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 100;
    canvas.width = colors.length * size;
    canvas.height = size;
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * size, 0, size, size);
    });
    const link = document.createElement("a");
    link.download = "palette.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  function generateGradient() {
    if (colors.length < 2) {
      alert("Generate at least 2 colors first.");
      return;
    }
    gradientPreview.classList.remove("hidden");
    gradientCanvas.width = 800;
    gradientCanvas.height = 100;
    const ctx = gradientCanvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, 0);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
    downloadGradientBtn.classList.remove("hidden");
  }

  function downloadGradientImage() {
    const link = document.createElement("a");
    link.download = "gradient.png";
    link.href = gradientCanvas.toDataURL();
    link.click();
  }

  function updateHistory() {
    history = history.slice(0, currentHistoryIndex + 1);
    history.push([...colors]);
    currentHistoryIndex++;
  }

  function copyAllColors() {
    navigator.clipboard.writeText(colors.join("\n"));
    alert("All colors copied to clipboard!");
  }

  function exportCss() {
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
    downloadTextFile("palette.css", css);
  }

  function exportSass() {
    const sass = colors.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
    downloadTextFile("palette.scss", sass);
  }

  function exportJson() {
    const json = JSON.stringify(colors, null, 2);
    downloadTextFile("palette.json", json);
  }

  function exportSvg() {
    const svg = `<svg width="${colors.length * 100}" height="100">\n${colors.map((c, i) => `  <rect x="${i * 100}" y="0" width="100" height="100" fill="${c}" />`).join("\n")}\n</svg>`;
    downloadTextFile("palette.svg", svg);
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
  }

  function generateLorem() {
    const paragraphs = loremParagraphs.value;

    // Validate input
    if (paragraphs < 1 || paragraphs > 10) {
      alert("Please enter a number between 1 and 10.");
      return;
    }

    // Send request to Flask backend
    fetch("/api/generate_lorem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paragraphs }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        loremOutput.value = data.lorem_text;
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to generate Lorem Ipsum. Please try again.");
      });
  }

  // Event Listeners
  addColorBtn.addEventListener("click", addColor);
  generatePaletteBtn.addEventListener("click", generatePalette);
  downloadPaletteBtn.addEventListener("click", downloadPaletteImage);
  generateGradientBtn.addEventListener("click", generateGradient);
  downloadGradientBtn.addEventListener("click", downloadGradientImage);
  copyAllColorsBtn.addEventListener("click", copyAllColors);
  exportCssBtn.addEventListener("click", exportCss);
  exportSassBtn.addEventListener("click", exportSass);
  exportJsonBtn.addEventListener("click", exportJson);
  exportSvgBtn.addEventListener("click", exportSvg);
  toggleDarkModeBtn.addEventListener("click", toggleDarkMode);
  generateLoremBtn.addEventListener("click", generateLorem);

  // Initialize the palette when the page loads
  generatePalette();
});
