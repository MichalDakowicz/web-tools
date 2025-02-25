const options = [];
let spinCount = 0;
const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B89B3",
    "#E79F6D",
];
let currentAngle = 0;
let isSpinning = false;
let currentTimeout = null; // Add this with other state variables at the top

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("viewBox", "-1 -1 2 2");
svg.style.transform = "rotate(-90deg)";
document.getElementById("wheel-svg").appendChild(svg);

// Load saved options
const savedOptions = localStorage.getItem("fortuneOptions");
if (savedOptions) {
    options.push(...JSON.parse(savedOptions));
    updateWheel();
    updateOptionsList();
}

function updateWheel() {
    svg.innerHTML = "";
    const total = options.length;
    if (total === 0) return;

    const angleStep = (2 * Math.PI) / Math.max(total, 1);

    // Calculate font size based on number of options
    const baseFontSize = 0.15;
    const fontSize = Math.min(baseFontSize, baseFontSize * (10 / total));

    options.forEach((option, i) => {
        const segment = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep;

        const x1 = Math.cos(startAngle);
        const y1 = Math.sin(startAngle);
        const x2 = Math.cos(endAngle);
        const y2 = Math.sin(endAngle);

        const d = `M 0 0 L ${x1} ${y1} A 1 1 0 0 1 ${x2} ${y2} Z`;
        segment.setAttribute("d", d);
        segment.setAttribute("fill", colors[i % colors.length]);
        svg.appendChild(segment);

        // Add text with adjusted positioning and rotation
        const textAngle = startAngle + angleStep / 2;
        const textDistance = total > 10 ? 0.75 : 0.65; // Move text further out if many options
        const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );
        const x = Math.cos(textAngle) * textDistance;
        const y = Math.sin(textAngle) * textDistance;

        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("text-anchor", "middle");

        // Adjust text rotation based on position
        let rotation = 90 + (textAngle * 180) / Math.PI;
        if (textAngle > Math.PI) {
            rotation += 180;
        }

        text.setAttribute("transform", `rotate(${rotation} ${x} ${y})`);
        text.textContent = option;
        text.style.fontSize = `${fontSize}px`;
        text.style.fill = "#000";
        svg.appendChild(text);
    });
}

function submitOption() {
    const input = document.getElementById("option");
    const value = input.value.trim();
    if (value && !options.includes(value)) {
        options.push(value);
        localStorage.setItem("fortuneOptions", JSON.stringify(options));
        updateWheel();
        updateOptionsList();
        input.value = "";
        input.focus(); // Auto focus the input after submission
    }
}

// Replace the add-option click event listener
document.getElementById("add-option").addEventListener("click", submitOption);

// Add keydown event listener for Enter key
document.getElementById("option").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        submitOption();
    }
});

document.getElementById("clear-options").addEventListener("click", () => {
    options.length = 0;
    localStorage.removeItem("fortuneOptions");
    updateWheel();
    updateOptionsList();
});

function updateOptionsList() {
    const list = document.getElementById("options-list");
    list.innerHTML = options
        .map(
            (option) =>
                `<div class="option-item">${option} <button onclick="removeOption('${option}')">×</button></div>`
        )
        .join("");
}

function removeOption(option) {
    const index = options.indexOf(option);
    if (index > -1) {
        options.splice(index, 1);
        localStorage.setItem("fortuneOptions", JSON.stringify(options));
        updateWheel();
        updateOptionsList();
    }
}

function showPopup(text) {
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popup-text");
    popupText.textContent = text;
    popup.classList.add("show");
}

document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("popup").classList.remove("show");
});

document.getElementById("popup").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
        event.target.classList.remove("show");
    }
});

document.getElementById("spin-btn").addEventListener("click", () => {
    if (options.length < 1) return;

    const baseSpins = 5;
    const additionalSpins = Math.min(spinCount * 2, 10);
    const spins = baseSpins + additionalSpins;
    const extraSpinAngle = Math.random() * 360;
    const totalAngle = spins * 360 + extraSpinAngle;

    if (isSpinning) {
        // Skip to end of animation
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }
        svg.style.transition = "none";
        svg.style.transform = `rotate(${-90 + currentAngle + totalAngle}deg)`;
        isSpinning = false;
        currentAngle = (currentAngle + totalAngle) % 360;
        const winningIndex = Math.floor(
            ((360 - (currentAngle % 360)) / 360) * Math.max(options.length, 1)
        );
        showPopup(`${options[winningIndex]}`);
        return;
    }

    isSpinning = true;
    spinCount++;

    svg.style.transition = "none";
    svg.style.transform = `rotate(${-90 + currentAngle}deg)`;
    svg.offsetHeight;

    const duration = 4 + Math.min(spinCount, 3);
    svg.style.transition = `transform ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    svg.style.transform = `rotate(${-90 + currentAngle + totalAngle}deg)`;

    currentTimeout = setTimeout(() => {
        isSpinning = false;
        currentAngle = (currentAngle + totalAngle) % 360;
        const winningIndex = Math.floor(
            ((360 - (currentAngle % 360)) / 360) * Math.max(options.length, 1)
        );
        showPopup(`${options[winningIndex]}`);
        currentTimeout = null;
    }, duration * 1000);
});

function addNumberRange() {
    const start = parseInt(document.getElementById("range-start").value) || 1;
    const end = parseInt(document.getElementById("range-end").value) || 10;

    if (start > end) return;

    for (let i = start; i <= end; i++) {
        if (!options.includes(i.toString())) {
            options.push(i.toString());
        }
    }

    localStorage.setItem("fortuneOptions", JSON.stringify(options));
    updateWheel();
    updateOptionsList();
}

function addLetterRange() {
    const start = document.getElementById("letter-start").value.toLowerCase();
    const end = document.getElementById("letter-end").value.toLowerCase();

    if (!start.match(/[a-z]/) || !end.match(/[a-z]/)) return;

    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0);

    if (startCode > endCode) return;

    for (let i = startCode; i <= endCode; i++) {
        const letter = String.fromCharCode(i);
        if (!options.includes(letter)) {
            options.push(letter);
        }
    }

    localStorage.setItem("fortuneOptions", JSON.stringify(options));
    updateWheel();
    updateOptionsList();
}

// Add after other event listeners
document
    .getElementById("add-number-range")
    .addEventListener("click", addNumberRange);
document
    .getElementById("add-letter-range")
    .addEventListener("click", addLetterRange);

// Add input validation for letter inputs
["letter-start", "letter-end"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
    });
});
