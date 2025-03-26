function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this,
            args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const plotDiv = document.getElementById("plot");
    const functionInputsContainer = document.getElementById("functionInputs");
    const addFunctionBtn = document.getElementById("addFunctionBtn");
    const plotBtn = document.getElementById("plotBtn");
    const xMinInput = document.getElementById("xMin");
    const xMaxInput = document.getElementById("xMax");
    const numPointsInput = document.getElementById("numPoints");
    const plotErrorDiv = document.getElementById("plotError");
    const plotInfoDiv = document.getElementById("plotInfo");
    const functionInputTemplate = document.getElementById(
        "functionInputTemplate"
    );
    const constantsInput = document.getElementById("constantsInput");
    const saveImageBtn = document.getElementById("saveImageBtn");
    const copyImageBtn = document.getElementById("copyImageBtn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    const useDegreesCheckbox = document.getElementById("useDegrees");

    let functionCount = 0;

    const debouncedPlotGraph = debounce(plotGraph, 500);

    function simpleLatexToMathjs(latexStr) {
        let mathStr = latexStr.trim();

        mathStr = mathStr.replace(/\\sqrt\((.*?)\)/g, "sqrt($1)");
        mathStr = mathStr.replace(/\\sqrt\{(.*?)\}/g, "sqrt($1)");

        mathStr = mathStr.replace(/\\sin\((.*?)\)/g, "sin($1)");
        mathStr = mathStr.replace(/\\sin\{(.*?)\}/g, "sin($1)");

        mathStr = mathStr.replace(/\\cos\((.*?)\)/g, "cos($1)");
        mathStr = mathStr.replace(/\\cos\{(.*?)\}/g, "cos($1)");

        mathStr = mathStr.replace(/\\tan\((.*?)\)/g, "tan($1)");
        mathStr = mathStr.replace(/\\tan\{(.*?)\}/g, "tan($1)");

        mathStr = mathStr.replace(/\\arcsin\((.*?)\)/g, "asin($1)");
        mathStr = mathStr.replace(/\\arcsin\{(.*?)\}/g, "asin($1)");
        mathStr = mathStr.replace(/\\arccos\((.*?)\)/g, "acos($1)");
        mathStr = mathStr.replace(/\\arccos\{(.*?)\}/g, "acos($1)");
        mathStr = mathStr.replace(/\\arctan\((.*?)\)/g, "atan($1)");
        mathStr = mathStr.replace(/\\arctan\{(.*?)\}/g, "atan($1)");

        mathStr = mathStr.replace(/\\ln\((.*?)\)/g, "log($1)");
        mathStr = mathStr.replace(/\\ln\{(.*?)\}/g, "log($1)");
        mathStr = mathStr.replace(/\\log_{?(\d+)}?\((.*?)\)/g, "log($2, $1)");
        mathStr = mathStr.replace(/\\log_{?(\d+)}?\{(.*?)\}/g, "log($2, $1)");
        mathStr = mathStr.replace(/\\log\((.*?)\)/g, "log($1, 10)");
        mathStr = mathStr.replace(/\\log\{(.*?)\}/g, "log($1, 10)");

        mathStr = mathStr.replace(/\\exp\((.*?)\)/g, "exp($1)");
        mathStr = mathStr.replace(/\\exp\{(.*?)\}/g, "exp($1)");

        mathStr = mathStr.replace(/\\abs\((.*?)\)/g, "abs($1)");
        mathStr = mathStr.replace(/\\abs\{(.*?)\}/g, "abs($1)");

        mathStr = mathStr.replace(/\\frac{(.*?)}{(.*?)}/g, "($1)/($2)");

        mathStr = mathStr.replace(/\\cdot/g, "*");
        mathStr = mathStr.replace(/\\times/g, "*");
        mathStr = mathStr.replace(/\\div/g, "/");
        mathStr = mathStr.replace(/\\pi/g, "pi");
        mathStr = mathStr.replace(/\\e/g, "e");

        mathStr = mathStr.replace(/\^\{(.*?)\}/g, "^($1)");
        mathStr = mathStr.replace(/\^(\w|\d+(?:\.\d+)?)(?!\()/g, "^($1)");

        mathStr = mathStr.replace(/{([a-zA-Z_][a-zA-Z0-9_]*)}/g, "$1");
        mathStr = mathStr.replace(/{(\d+(?:\.\d+)?)}/g, "$1");
        mathStr = mathStr.replace(/−/g, "-");

        return mathStr;
    }

    function addFunctionInputRow(initialValue = "", initialColor = null) {
        functionCount++;
        const templateContent = functionInputTemplate.content.cloneNode(true);
        const newRow = templateContent.querySelector(".function-row");
        const funcInput = newRow.querySelector(".function-input");
        const colorInput = newRow.querySelector(".color-input");
        const renderedLatexSpan = newRow.querySelector(".rendered-latex");
        const removeBtn = newRow.querySelector(".remove-btn");

        funcInput.value = initialValue;
        if (!initialColor) {
            const defaultColors = [
                "#1f77b4",
                "#ff7f0e",
                "#2ca02c",
                "#d62728",
                "#9467bd",
                "#8c564b",
                "#e377c2",
                "#7f7f7f",
                "#bcbd22",
                "#17becf",
            ];
            colorInput.value =
                defaultColors[(functionCount - 1) % defaultColors.length];
        } else {
            colorInput.value = initialColor;
        }

        const updatePreview = () => {
            try {
                if (typeof katex !== "undefined") {
                    katex.render(funcInput.value || "", renderedLatexSpan, {
                        throwOnError: false,
                        displayMode: false,
                        output: "html",
                    });
                }
            } catch (e) {}
        };
        funcInput.addEventListener("input", updatePreview);
        funcInput.addEventListener("input", debouncedPlotGraph);
        setTimeout(updatePreview, 100);

        colorInput.addEventListener("input", plotGraph);

        removeBtn.addEventListener("click", () => {
            newRow.remove();
            plotGraph();
        });

        functionInputsContainer.appendChild(newRow);
        plotGraph();
    }

    function plotGraph() {
        plotErrorDiv.textContent = "";
        const traces = [];
        let isValidInput = true;
        const useDegrees = useDegreesCheckbox.checked;
        const isDarkMode = document.body.classList.contains("dark-mode");

        const colors = {
            bg: isDarkMode ? "#333333" : "#ffffff",
            paper: isDarkMode ? "#333333" : "#ffffff",
            text: isDarkMode ? "#eeeeee" : "#000000",
            grid: isDarkMode ? "#666666" : "#dddddd",
            zeroLine: isDarkMode ? "#aaaaaa" : "#999999",
            axisLine: isDarkMode ? "#aaaaaa" : "#000000",
        };

        const constantsScope = {};
        try {
            const constantLines = constantsInput.value.split("\n");
            constantLines.forEach((line) => {
                line = line.trim();
                if (line && !line.startsWith("#")) {
                    const parts = line.split("=");
                    if (parts.length === 2) {
                        const key = parts[0].trim();
                        const valueStr = simpleLatexToMathjs(parts[1].trim());
                        if (key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                            constantsScope[key] = math.evaluate(valueStr);
                        } else {
                            throw new Error(`Invalid constant name: ${key}`);
                        }
                    } else if (line) {
                        throw new Error(`Invalid constant definition: ${line}`);
                    }
                }
            });
        } catch (err) {
            plotErrorDiv.textContent = `Error parsing constants: ${err.message}`;
            isValidInput = false;
        }

        const evaluationScopeBase = { ...constantsScope };
        const trigFuncs = [
            "sin",
            "cos",
            "tan",
            "asin",
            "acos",
            "atan",
            "atan2",
        ];
        trigFuncs.forEach((f) => {
            evaluationScopeBase[f] = useDegrees ? math[f + "d"] : math[f];
        });
        evaluationScopeBase.pi = Math.PI;
        evaluationScopeBase.e = Math.E;
        evaluationScopeBase.sqrt = math.sqrt;
        evaluationScopeBase.log = math.log;
        evaluationScopeBase.abs = math.abs;
        evaluationScopeBase.exp = math.exp;

        const xMin = parseFloat(xMinInput.value);
        const xMax = parseFloat(xMaxInput.value);
        const numPoints = parseInt(numPointsInput.value);

        if (
            isNaN(xMin) ||
            isNaN(xMax) ||
            isNaN(numPoints) ||
            numPoints < 2 ||
            xMin >= xMax
        ) {
            plotErrorDiv.textContent =
                "Invalid graph settings (X Min, X Max, Points). Min < Max, Points >= 2.";
            isValidInput = false;
        }

        const xValues = [];
        if (isValidInput) {
            const step = (xMax - xMin) / (numPoints - 1);
            for (let i = 0; i < numPoints; i++) {
                xValues.push(xMin + i * step);
            }
        }

        const functionRows =
            functionInputsContainer.querySelectorAll(".function-row");
        let errorMessages = [];

        functionRows.forEach((row, index) => {
            const inputElement = row.querySelector(".function-input");
            const colorElement = row.querySelector(".color-input");
            const originalExpression = inputElement.value.trim();

            if (!originalExpression) return;

            const mathjsExpression = simpleLatexToMathjs(originalExpression);
            let compiledExpr;

            try {
                compiledExpr = math.compile(mathjsExpression);
            } catch (err) {
                errorMessages.push(
                    `Func ${
                        index + 1
                    } (${originalExpression}): Syntax Error - ${
                        err.message
                    } (Tried: "${mathjsExpression}")`
                );
                return;
            }

            const yValues = [];
            let evaluationErrors = 0;

            if (xValues.length > 0) {
                for (const x of xValues) {
                    try {
                        const currentScope = { ...evaluationScopeBase, x: x };
                        let y = compiledExpr.evaluate(currentScope);

                        if (typeof y === "object" && y.isComplex) {
                            y = null;
                        }
                        if (!isFinite(y)) {
                            y = null;
                        }
                        yValues.push(y);
                    } catch (err) {
                        if (evaluationErrors < 3) {
                            console.warn(
                                `Eval error "${originalExpression}" x=${x}: ${err.message}`
                            );
                            errorMessages.push(
                                `Func ${
                                    index + 1
                                } (${originalExpression}): Eval near x=${x.toFixed(
                                    2
                                )} (Mode: ${useDegrees ? "Deg" : "Rad"})`
                            );
                        }
                        evaluationErrors++;
                        yValues.push(null);
                    }
                }
                if (evaluationErrors >= 3) {
                    errorMessages.push(
                        `Func ${
                            index + 1
                        } (${originalExpression}): ... further eval errors.`
                    );
                }
            }

            traces.push({
                x: xValues,
                y: yValues,
                mode: "lines",
                type: "scatter",
                name: originalExpression,
                line: { color: colorElement.value, width: 2 },
                connectgaps: false,
            });
        });

        if (errorMessages.length > 0) {
            plotErrorDiv.innerHTML = errorMessages.join("<br>");
        }

        const layout = {
            plot_bgcolor: colors.bg,
            paper_bgcolor: colors.paper,
            font: { color: colors.text },
            xaxis: {
                title: "x",
                range: [xMin, xMax],
                gridcolor: colors.grid,
                zerolinecolor: colors.zeroLine,
                linecolor: colors.axisLine,
                zeroline: true,
                zerolinewidth: 1,
            },
            yaxis: {
                title: "y",
                autorange: true,
                gridcolor: colors.grid,
                zerolinecolor: colors.zeroLine,
                linecolor: colors.axisLine,
                zeroline: true,
                zerolinewidth: 1,
            },
            hovermode: "closest",
            legend: {
                font: { color: colors.text },
                bgcolor: isDarkMode
                    ? "rgba(51,51,51,0.7)"
                    : "rgba(255,255,255,0.7)",
                bordercolor: colors.grid,
                borderwidth: 1,
            },
            margin: { l: 50, r: 30, b: 40, t: 40 },
        };

        if (typeof Plotly !== "undefined") {
            Plotly.react(plotDiv, traces, layout).catch((err) => {
                console.error("Plotly error: ", err);
                plotErrorDiv.textContent = `Plotting library error: ${err.message}`;
            });
        } else {
            plotErrorDiv.textContent =
                "Plotting library (Plotly.js) failed to load.";
        }
    }

    saveImageBtn.addEventListener("click", () => {
        if (typeof Plotly !== "undefined" && plotDiv) {
            const isDarkMode = document.body.classList.contains("dark-mode");
            const layoutUpdate = plotDiv.layout;
            const filename =
                (layoutUpdate && layoutUpdate.title && layoutUpdate.title.text
                    ? layoutUpdate.title.text
                          .replace(/[^a-z0-9_]+/gi, "_")
                          .toLowerCase()
                    : "graph_export") + ".png";

            const saveOptions = {
                format: "png",
                filename: filename,
                width: plotDiv.clientWidth || 800,
                height: plotDiv.clientHeight || 600,
            };

            Plotly.downloadImage(plotDiv, saveOptions).catch((err) => {
                console.error("Error downloading image:", err);
                plotErrorDiv.textContent = `Error downloading image: ${err.message}`;
            });
        } else {
            plotErrorDiv.textContent =
                "Cannot save image: Plotting library/div not ready.";
        }
    });

    copyImageBtn.addEventListener("click", () => {
        if (typeof Plotly !== "undefined" && plotDiv) {
            Plotly.toImage(plotDiv, { format: "png" }).then((dataUrl) => {
                navigator.clipboard
                    .write([
                        new ClipboardItem({
                            "image/png": fetch(dataUrl)
                                .then((res) => res.blob())
                                .then(
                                    (blob) =>
                                        new Blob([blob], { type: "image/png" })
                                ),
                        }),
                    ])
                    .then(() => {
                        plotInfoDiv.textContent = "Image copied to clipboard.";
                    })
                    .catch((err) => {
                        console.error("Error copying image:", err);
                        plotErrorDiv.textContent = `Error copying image: ${err.message}`;
                    });
            });
        } else {
            plotErrorDiv.textContent =
                "Cannot copy image: Plotting library/div not ready.";
        }
    });

    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", plotGraph);
    }

    addFunctionBtn.addEventListener("click", () => addFunctionInputRow());

    xMinInput.addEventListener("change", plotGraph);
    xMaxInput.addEventListener("change", plotGraph);
    numPointsInput.addEventListener("change", plotGraph);
    useDegreesCheckbox.addEventListener("change", plotGraph);

    constantsInput.addEventListener("input", debouncedPlotGraph);

    if (plotBtn) {
        plotBtn.textContent = "Refresh Plot";
        plotBtn.addEventListener("click", plotGraph);
    }

    function initialize() {
        addFunctionInputRow("");

        if (typeof Plotly !== "undefined") {
            plotGraph();
        } else {
            setTimeout(() => {
                if (typeof Plotly !== "undefined") {
                    plotGraph();
                } else {
                    plotErrorDiv.textContent =
                        "Plotting library failed to load.";
                }
            }, 500);
        }
    }

    initialize();
});
