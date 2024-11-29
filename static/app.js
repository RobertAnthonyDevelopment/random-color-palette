document.addEventListener("DOMContentLoaded", () => {
    const paletteContainer = document.getElementById("palette-container");
    const generatePaletteBtn = document.getElementById("generate-palette");
    const downloadPaletteBtn = document.getElementById("download-palette");
    const generateGradientBtn = document.getElementById("generate-gradient");
    const downloadGradientBtn = document.getElementById("download-gradient");
    const gradientPreview = document.getElementById("gradient-preview");
    const gradientCanvas = document.getElementById("gradient-canvas");
    const addColorBtn = document.getElementById("add-color");
    const newColorInput = document.getElementById("new-color-hex");

    let colors = [];

    function renderPalette() {
        paletteContainer.innerHTML = ""; // Clear existing palette
        colors.forEach((color, index) => {
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color;
            colorBox.title = `Click to edit ${color}`;

            const colorCode = document.createElement("p");
            colorCode.textContent = color;
            colorCode.style.margin = "5px 0";

            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy";
            copyBtn.classList.add("copy-button");

            copyBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                copyToClipboard(color);
            });

            colorBox.addEventListener("click", () => editColor(index));

            colorBox.appendChild(colorCode);
            colorBox.appendChild(copyBtn);
            paletteContainer.appendChild(colorBox);
        });
    }

    function generatePalette() {
        colors = Array.from({ length: 5 }, () => {
            return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        });
        renderPalette();
    }

    function editColor(index) {
        const newHex = prompt("Enter a new hex code for this color:", colors[index]);
        if (newHex && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
            colors[index] = newHex;
            renderPalette();
        } else if (newHex) {
            alert("Invalid hex code. Please try again.");
        }
    }

    function addColor() {
        const newHex = newColorInput.value.trim();
        if (newHex && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
            colors.push(newHex);
            renderPalette();
            newColorInput.value = ""; // Clear input
        } else {
            alert("Invalid hex code. Please try again.");
        }
    }

    function downloadPaletteImage() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const boxSize = 100;

        canvas.width = colors.length * boxSize;
        canvas.height = boxSize;

        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.fillRect(index * boxSize, 0, boxSize, boxSize);
        });

        const link = document.createElement("a");
        link.download = "palette.png";
        link.href = canvas.toDataURL();
        link.click();
    }

    function generateGradient() {
        if (colors.length < 2) {
            alert("You need at least 2 colors to generate a gradient.");
            return;
        }
        gradientPreview.classList.remove("hidden");
        gradientCanvas.width = 800;
        gradientCanvas.height = 100;

        const ctx = gradientCanvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, 0);

        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
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

    function copyToClipboard(color) {
        navigator.clipboard.writeText(color).then(() => {
            alert(`Copied ${color} to clipboard!`);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    }

    generatePaletteBtn.addEventListener("click", generatePalette);
    downloadPaletteBtn.addEventListener("click", downloadPaletteImage);
    generateGradientBtn.addEventListener("click", generateGradient);
    downloadGradientBtn.addEventListener("click", downloadGradientImage);
    addColorBtn.addEventListener("click", addColor);

    generatePalette(); // Initial render
});
