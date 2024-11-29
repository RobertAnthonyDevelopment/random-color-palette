document.addEventListener("DOMContentLoaded", () => {
    const paletteContainer = document.getElementById("palette-container");
    const generatePaletteBtn = document.getElementById("generate-palette");
    const addColorBtn = document.getElementById("add-color");
    const newColorInput = document.getElementById("new-color-hex");
    const accessibilityCheckBtn = document.getElementById("accessibility-check");
    const accessibilityResults = document.getElementById("accessibility-results");

    let colors = [];

    function fetchPalette() {
        fetch("/api/get_palette")
            .then((response) => response.json())
            .then((data) => {
                colors = data;
                renderPalette();
            })
            .catch((error) => console.error("Error fetching palette:", error));
    }

    function savePalette() {
        fetch("/api/save_palette", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ colors }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => console.error("Error saving palette:", error));
    }

    function renderPalette() {
        paletteContainer.innerHTML = "";
        colors.forEach((color, index) => {
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color;
            colorBox.innerText = color;
            colorBox.title = `Click to edit ${color}`;
            colorBox.addEventListener("click", () => editColor(index));
            paletteContainer.appendChild(colorBox);
        });
    }

    function generatePalette() {
        colors = Array.from({ length: 5 }, () => {
            return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        });
        renderPalette();
        savePalette();
    }

    function editColor(index) {
        const newHex = prompt("Enter a new hex code for this color:", colors[index]);
        if (newHex && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
            colors[index] = newHex;
            renderPalette();
            savePalette();
        } else if (newHex) {
            alert("Invalid hex code. Please try again.");
        }
    }

    function addColor() {
        const newHex = newColorInput.value.trim();
        if (newHex && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
            colors.push(newHex);
            renderPalette();
            savePalette();
            newColorInput.value = "";
        } else {
            alert("Invalid hex code. Please try again.");
        }
    }

    function runAccessibilityCheck() {
        let violations = 0;
        colors.forEach((color) => {
            const contrast = calculateContrast(color, "#ffffff");
            if (contrast < 4.5) {
                violations++;
            }
        });
        accessibilityResults.innerText = `Violations Found: ${violations}`;
    }

    function calculateContrast(fgColor, bgColor) {
        const fgRgb = hexToRgb(fgColor);
        const bgRgb = hexToRgb(bgColor);
        const fgLuminance = calculateLuminance(fgRgb);
        const bgLuminance = calculateLuminance(bgRgb);
        const ratio = fgLuminance > bgLuminance
            ? (fgLuminance + 0.05) / (bgLuminance + 0.05)
            : (bgLuminance + 0.05) / (fgLuminance + 0.05);
        return ratio;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function calculateLuminance(rgb) {
        const [r, g, b] = rgb.map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    generatePaletteBtn.addEventListener("click", generatePalette);
    addColorBtn.addEventListener("click", addColor);
    accessibilityCheckBtn.addEventListener("click", runAccessibilityCheck);

    fetchPalette();
});
