const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const equation = document.getElementById('equation');
const graphBtn = document.getElementById('graph-btn');

// Set canvas size
canvas.width = 600;
canvas.height = 400;

// Graph settings
const xScale = 50; // pixels per unit
const yScale = 50;
const xOffset = canvas.width / 2;
const yOffset = canvas.height / 2;

// Add new graph settings
let zoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
// Adjust colors array for better visibility in dark mode
const colors = [
    '#ff6666',   // Brighter red
    '#66ff66',   // Brighter green
    '#6666ff',   // Brighter blue
    '#ff66ff',   // Brighter magenta
    '#66ffff'    // Brighter cyan
];
let functions = [];

function drawGridLabels() {
    ctx.font = '12px Arial';
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#fff' : '#000';
    
    // X-axis labels
    for (let x = -Math.floor(canvas.width/xScale/2); x <= Math.floor(canvas.width/xScale/2); x++) {
        const pixelX = x * xScale * zoom + xOffset + panX;
        ctx.fillText(x.toString(), pixelX, yOffset + 20);
    }
    
    // Y-axis labels
    for (let y = -Math.floor(canvas.height/yScale/2); y <= Math.floor(canvas.height/yScale/2); y++) {
        const pixelY = -y * yScale * zoom + yOffset + panY;
        ctx.fillText(y.toString(), xOffset - 20, pixelY);
    }
}

function calculateGridSpacing(zoom) {
    // Base grid spacing of 50 pixels
    const baseSpacing = 50;
    const unitSize = baseSpacing * zoom;
    
    // More steps for zoomed in view, fewer for zoomed out
    const spacingSteps = [
        0.1, 0.2, 0.25,  // More granular steps when zoomed in
        0.5,
        1, 2, 2.5,      // Additional intermediate steps
        5,
        10, 25,         // Tens
        50,
        100, 250,       // Hundreds
        500,
        1000, 2500,     // Thousands
        5000,
        10000, 25000,   // Ten thousands
        50000,
        100000          // Max value
    ];
    
    // Find appropriate spacing with different thresholds for zooming in/out
    let spacing = spacingSteps[0];
    for (let step of spacingSteps) {
        // Use smaller minimum spacing when zoomed in (zoom > 1)
        const minSpacing = zoom > 1 ? 40 : 60;
        if (step * unitSize >= minSpacing) {
            break;
        }
        spacing = step;
    }
    
    return spacing;
}

function formatNumber(num) {
    // Simple fixed decimal formatting, no scientific notation
    if (Math.abs(num) >= 1) {
        return Number(num.toFixed(0));
    }
    return Number(num.toFixed(1));
}

function drawGrid() {
    const isDark = document.body.classList.contains('dark-mode');
    // Lighter grid lines for dark mode
    ctx.strokeStyle = isDark ? '#444' : '#ddd';
    ctx.lineWidth = 1;

    // Calculate adaptive grid spacing
    const spacing = calculateGridSpacing(zoom);
    const pixelSpacing = spacing * xScale * zoom;
    
    // Calculate visible range
    const startX = Math.floor((-panX - canvas.width/2) / (pixelSpacing));
    const endX = Math.ceil((-panX + canvas.width/2) / (pixelSpacing));
    const startY = Math.floor((-panY - canvas.height/2) / (pixelSpacing));
    const endY = Math.ceil((-panY + canvas.height/2) / (pixelSpacing));

    // Draw vertical lines
    for (let i = startX; i <= endX; i++) {
        const x = i * pixelSpacing + panX + xOffset;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = startY; i <= endY; i++) {
        const y = i * pixelSpacing + panY + yOffset;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Brighter axes for dark mode
    ctx.strokeStyle = isDark ? '#666' : '#000';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, yOffset + panY);
    ctx.lineTo(canvas.width, yOffset + panY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(xOffset + panX, 0);
    ctx.lineTo(xOffset + panX, canvas.height);
    ctx.stroke();

    // Brighter text for dark mode
    ctx.font = '12px Arial';
    ctx.fillStyle = isDark ? '#888' : '#000';
    
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
    // Replace ^ with ** for exponentiation
    return expr.replace(/\^/g, '**');
}

function plotFunction(equation, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    try {
        const processedEquation = prepareMathExpression(equation);
        for (let pixelX = 0; pixelX < canvas.width; pixelX++) {
            const x = ((pixelX - xOffset - panX) / xScale / zoom);
            const result = eval(processedEquation.replace(/x/g, `(${x})`));
            const y = -result * yScale * zoom + yOffset + panY;

            if (pixelX === 0) {
                ctx.moveTo(pixelX, y);
            } else {
                ctx.lineTo(pixelX, y);
            }
        }
        ctx.stroke();
    } catch (error) {
        console.error('Invalid equation:', error);
    }
}

function redrawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    functions.forEach((func, index) => {
        plotFunction(func, colors[index % colors.length]);
    });
}

// Event listeners for zoom and pan
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05; // More gradual zoom
    const newZoom = zoom * zoomFactor;
    
    // Limit zoom range to prevent floating point issues
    if (newZoom > 0.000001 && newZoom < 1000000) {
        zoom = newZoom;
        redrawGraph();
    }
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        redrawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

graphBtn.addEventListener('click', () => {
    const func = equation.value;
    if (func) {
        functions.push(func);
        equation.value = '';
        redrawGraph();
        updateFunctionList();
    }
});

// Add function management
function updateFunctionList() {
    const list = document.getElementById('function-list');
    list.innerHTML = '';
    
    functions.forEach((func, index) => {
        const div = document.createElement('div');
        div.className = 'function-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'color-indicator';
        colorBox.style.backgroundColor = colors[index % colors.length];
        
        const text = document.createElement('span');
        text.textContent = func;
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => editFunction(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'remove-btn';
        deleteBtn.onclick = () => deleteFunction(index);
        
        div.appendChild(colorBox);
        div.appendChild(text);
        div.appendChild(editBtn);
        div.appendChild(deleteBtn);
        list.appendChild(div);
    });
}

function editFunction(index) {
    const newFunc = prompt('Edit function:', functions[index]);
    if (newFunc !== null) {
        functions[index] = newFunc;
        redrawGraph();
        updateFunctionList();
    }
}

function deleteFunction(index) {
    functions.splice(index, 1);
    redrawGraph();
    updateFunctionList();
}

// Add keyboard support
equation.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        graphBtn.click();
    }
});

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
    redrawGraph();
});

// Initial draw
redrawGraph();
