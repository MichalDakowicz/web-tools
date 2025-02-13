const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const equation = document.getElementById("equation");
const graphBtn = document.getElementById("graph-btn");

canvas.width = 600;
canvas.height = 400;

const xScale = 50;
const yScale = 50;
const xOffset = canvas.width / 2;
const yOffset = canvas.height / 2;

let zoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
const colors = ["#ff6666", "#66ff66", "#6666ff", "#ff66ff", "#66ffff"];
let functions = [];

function latexToJavaScript(latex) {
    let prevLatex;
    do {
        prevLatex = latex;

        latex = latex
            .replace(/\\sin\{([^{}]+)\}/g, "Math.sin($1)")
            .replace(/\\cos\{([^{}]+)\}/g, "Math.cos($1)")
            .replace(/\\tan\{([^{}]+)\}/g, "Math.tan($1)")
            .replace(/\\sqrt\{([^{}]+)\}/g, "Math.sqrt($1)")
            .replace(/\\exp\{([^{}]+)\}/g, "Math.exp($1)")
            .replace(/\\ln\{([^{}]+)\}/g, "Math.log($1)")
            .replace(/\\log\{([^{}]+)\}/g, "Math.log10($1)");

        latex = latex.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "(($1)/($2))");
    } while (latex !== prevLatex);

    return latex
        .replace(/\\pi/g, "Math.PI")
        .replace(/\\sin\(/g, "Math.sin(")
        .replace(/\\cos\(/g, "Math.cos(")
        .replace(/\\tan\(/g, "Math.tan(")
        .replace(/\\sqrt\(/g, "Math.sqrt(")
        .replace(/\\exp\(/g, "Math.exp(")
        .replace(/\\ln\(/g, "Math.log(")
        .replace(/\\log\(/g, "Math.log10(");
}

function updateLatexPreview(latex) {
    const preview = document.getElementById("latex-preview");
    preview.innerHTML = `\\[${latex}\\]`;
    MathJax.typesetPromise([preview]);
}

function drawGridLabels() {
    ctx.font = "12px Arial";
    ctx.fillStyle = document.body.classList.contains("dark-mode")
        ? "#fff"
        : "#000";

    for (
        let x = -Math.floor(canvas.width / xScale / 2);
        x <= Math.floor(canvas.width / xScale / 2);
        x++
    ) {
        const pixelX = x * xScale * zoom + xOffset + panX;
        ctx.fillText(x.toString(), pixelX, yOffset + 20);
    }

    for (
        let y = -Math.floor(canvas.height / yScale / 2);
        y <= Math.floor(canvas.height / yScale / 2);
        y++
    ) {
        const pixelY = -y * yScale * zoom + yOffset + panY;
        ctx.fillText(y.toString(), xOffset - 20, pixelY);
    }
}

function calculateGridSpacing(zoom) {
    const baseSpacing = 50;
    const unitSize = baseSpacing * zoom;

    const spacingSteps = [
        0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000,
        2500, 5000, 10000, 25000, 50000, 100000,
    ];

    let spacing = spacingSteps[0];
    for (let step of spacingSteps) {
        const minSpacing = zoom > 1 ? 40 : 60;
        if (step * unitSize >= minSpacing) {
            break;
        }
        spacing = step;
    }

    return spacing;
}

function formatNumber(num) {
    if (Math.abs(num) >= 1) {
        return Number(num.toFixed(0));
    }
    return Number(num.toFixed(1));
}

function drawGrid() {
    const isDark = document.body.classList.contains("dark-mode");
    ctx.strokeStyle = isDark ? "#444" : "#ddd";
    ctx.lineWidth = 1;

    const spacing = calculateGridSpacing(zoom);
    const pixelSpacing = spacing * xScale * zoom;

    const startX = Math.floor((-panX - canvas.width / 2) / pixelSpacing);
    const endX = Math.ceil((-panX + canvas.width / 2) / pixelSpacing);
    const startY = Math.floor((-panY - canvas.height / 2) / pixelSpacing);
    const endY = Math.ceil((-panY + canvas.height / 2) / pixelSpacing);

    for (let i = startX; i <= endX; i++) {
        const x = i * pixelSpacing + panX + xOffset;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let i = startY; i <= endY; i++) {
        const y = i * pixelSpacing + panY + yOffset;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = isDark ? "#666" : "#000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, yOffset + panY);
    ctx.lineTo(canvas.width, yOffset + panY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xOffset + panX, 0);
    ctx.lineTo(xOffset + panX, canvas.height);
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = isDark ? "#888" : "#000";

    for (let i = startX; i <= endX; i++) {
        const x = i * pixelSpacing + panX + xOffset;
        const value = formatNumber(i * spacing);
        ctx.fillText(value.toString(), x - 10, yOffset + panY + 20);
    }

    for (let i = startY; i <= endY; i++) {
        const y = i * pixelSpacing + panY + yOffset;
        const value = formatNumber(-i * spacing);
        ctx.fillText(value.toString(), xOffset + panX - 30, y + 4);
    }
}

function prepareMathExpression(expr) {
    return expr.replace(/\^/g, "**");
}

function plotFunction(latex, color) {
    const errorDisplay = document.getElementById("error-display");
    if (errorDisplay) {
        errorDisplay.textContent = "";
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    try {
        const jsEquation = latexToJavaScript(latex);
        for (let pixelX = 0; pixelX < canvas.width; pixelX++) {
            const x = (pixelX - xOffset - panX) / xScale / zoom;
            const result = eval(jsEquation.replace(/x/g, `(${x})`));
            const y = -result * yScale * zoom + yOffset + panY;

            if (pixelX === 0) {
                ctx.moveTo(pixelX, y);
            } else {
                ctx.lineTo(pixelX, y);
            }
        }
        ctx.stroke();
    } catch (error) {
        console.error("Invalid equation:", error);
        if (errorDisplay) {
            errorDisplay.textContent = "Error in equation: " + error.message;
        }
    }
}

function redrawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    functions.forEach((func, index) => {
        plotFunction(func, colors[index % colors.length]);
    });
}

canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    const newZoom = zoom * zoomFactor;

    if (newZoom > 0.000001 && newZoom < 1000000) {
        zoom = newZoom;
        redrawGraph();
    }
});

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        redrawGraph();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

graphBtn.addEventListener("click", () => {
    const func = equation.value;
    if (func) {
        functions.push(func);
        equation.value = "";
        redrawGraph();
        updateFunctionList();
    }
});

function updateFunctionList() {
    const list = document.getElementById("function-list");
    list.innerHTML = "";

    functions.forEach((func, index) => {
        const div = document.createElement("div");
        div.className = "function-item";

        const colorBox = document.createElement("div");
        colorBox.className = "color-indicator";
        colorBox.style.backgroundColor = colors[index % colors.length];

        const text = document.createElement("div");
        text.className = "latex-equation";
        text.innerHTML = `\\[${func}\\]`;

        const editSection = document.createElement("div");
        editSection.className = "edit-section";
        editSection.innerHTML = "✎";
        editSection.onclick = () => editFunction(index);

        const removeSection = document.createElement("div");
        removeSection.className = "remove-section";
        removeSection.innerHTML = "×";
        removeSection.onclick = () => deleteFunction(index);

        div.appendChild(colorBox);
        div.appendChild(text);
        div.appendChild(editSection);
        div.appendChild(removeSection);
        list.appendChild(div);
    });

    MathJax.typesetPromise();
}

let editingIndex = -1;
const editModal = document.getElementById("edit-modal");
const editEquation = document.getElementById("edit-equation");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");

function editFunction(index) {
    editingIndex = index;
    editEquation.value = functions[index];
    editModal.classList.add("active");
    updateEditPreview(functions[index]);
}

function updateEditPreview(latex) {
    const preview = document.getElementById("edit-preview");
    preview.innerHTML = `\\[${latex}\\]`;
    MathJax.typesetPromise([preview]);
}

editEquation.addEventListener("input", (e) => {
    updateEditPreview(e.target.value);
});

saveEditBtn.addEventListener("click", () => {
    if (editingIndex !== -1) {
        functions[editingIndex] = editEquation.value;
        editModal.classList.remove("active");
        redrawGraph();
        updateFunctionList();
    }
});

cancelEditBtn.addEventListener("click", () => {
    editModal.classList.remove("active");
});

editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
        editModal.classList.remove("active");
    }
});

editEquation.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        saveEditBtn.click();
    }
    if (e.key === "Escape") {
        cancelEditBtn.click();
    }
});

function deleteFunction(index) {
    functions.splice(index, 1);
    redrawGraph();
    updateFunctionList();
}

equation.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        graphBtn.click();
    }
});

equation.addEventListener("input", (e) => {
    updateLatexPreview(e.target.value);
});

document.getElementById("dark-mode-toggle").addEventListener("change", (e) => {
    document.body.classList.toggle("dark-mode", e.target.checked);
    redrawGraph();
});

async function drawLegend(ctx, functions, colors) {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.backgroundColor = document.body.classList.contains(
        "dark-mode"
    )
        ? "#444"
        : "#f8f8f8";
    tempDiv.style.padding = "20px";
    document.body.appendChild(tempDiv);

    const renderedEquations = [];
    for (const func of functions) {
        const eqDiv = document.createElement("div");
        eqDiv.style.display = "inline-block";
        eqDiv.style.color = document.body.classList.contains("dark-mode")
            ? "#fff"
            : "#000";
        eqDiv.innerHTML = `\\[${func}\\]`;
        tempDiv.appendChild(eqDiv);
        renderedEquations.push(eqDiv);
    }

    await MathJax.typesetPromise();

    const padding = 5; 
    const lineHeight = 25;
    const boxWidth = 15;
    const boxPadding = 5;

    let maxWidth = 0;
    let maxHeight = 0;
    renderedEquations.forEach((eq) => {
        const mjxContainer = eq.querySelector(".MathJax");
        if (mjxContainer) {
            maxWidth = Math.max(maxWidth, mjxContainer.offsetWidth);
            maxHeight = Math.max(maxHeight, mjxContainer.offsetHeight);
        }
    });

    const legendWidth = maxWidth + boxWidth + padding * 8;
    const legendHeight = functions.length * lineHeight + padding * 2;

    const isDark = document.body.classList.contains("dark-mode");
    ctx.fillStyle = isDark ? "#444" : "#f8f8f8";
    ctx.strokeStyle = isDark ? "#666" : "#ccc";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(padding, padding, legendWidth, legendHeight, 5);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < functions.length; i++) {
        const yCenter = padding + i * lineHeight + lineHeight / 2;

        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(padding * 2, yCenter - boxWidth / 2, boxWidth, boxWidth);

        const container = renderedEquations[i].querySelector(".MathJax");
        if (container) {
            container.style.color = isDark ? "#fff" : "#000";
            const xml = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${
                    container.offsetWidth
                }" height="${container.offsetHeight}">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml">
                            <style>
                                .mjx-math, .mjx-chtml { color: ${
                                    isDark ? "#fff" : "#000"
                                } !important; }
                            </style>
                            ${container.outerHTML}
                        </div>
                    </foreignObject>
                </svg>
            `;

            const img = new Image();
            await new Promise((resolve) => {
                img.onload = resolve;
                img.src =
                    "data:image/svg+xml;base64," +
                    btoa(unescape(encodeURIComponent(xml)));
            });

            ctx.drawImage(
                img,
                padding * 3 + boxWidth,
                yCenter - img.height / 2
            );
        }
    }

    document.body.removeChild(tempDiv);
}

document.getElementById("save-image").addEventListener("click", async () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.fillStyle = document.body.classList.contains("dark-mode")
        ? "#333"
        : "#fff";
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);

    tempCtx.drawImage(canvas, 0, 0);

    if (functions.length > 0) {
        await drawLegend(tempCtx, functions, colors);
    }

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `graph-${timestamp}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
});

redrawGraph();
