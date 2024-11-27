// Function to fetch a new color palette from the server
async function fetchPalette() {
    try {
        const response = await fetch('/generate_palette');
        if (!response.ok) {
            throw new Error('Failed to fetch palette');
        }
        const colors = await response.json();

        // Clear the existing palette
        const container = document.getElementById('palette-container');
        container.innerHTML = '';

        // Populate the container with new colors
        colors.forEach(color => {
            const box = document.createElement('div');
            box.className = 'color-box';
            box.style.backgroundColor = color;
            box.textContent = color;

            // Add click-to-copy functionality
            box.onclick = () => {
                navigator.clipboard.writeText(color);
                alert(`Copied ${color} to clipboard!`);
            };

            container.appendChild(box);
        });
    } catch (error) {
        console.error('Error fetching palette:', error);
        alert('Could not load colors. Please try again.');
    }
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', fetchPalette);

// Event listener for button click
document.getElementById('generate-palette').addEventListener('click', fetchPalette);

