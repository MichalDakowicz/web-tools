document.addEventListener("DOMContentLoaded", function () {
    const jsonInput = document.getElementById("jsonInput");
    const jsonOutput = document.getElementById("jsonOutput");
    const jsonOutputDisplay = document.getElementById("jsonOutputDisplay");
    const jsonHighlightOutput = document.getElementById("jsonHighlightOutput");
    const formatButton = document.getElementById("formatButton");
    const clearButton = document.getElementById("clearButton");
    const copyButton = document.getElementById("copyButton");
    const statusMessage = document.getElementById("statusMessage");
    const inputLineNumbers = document.getElementById("inputLineNumbers");
    const outputLineNumbers = document.getElementById("outputLineNumbers");

    function displayStatus(message, type = "info") {
        statusMessage.textContent = message;
        statusMessage.className = "status-box";
        if (type === "success" || type === "error") {
            statusMessage.classList.add(type);
        }
        statusMessage.style.display = message ? "block" : "none";
    }

    function updateLineNumbers(textarea, linesDiv) {
        const text = textarea.value || textarea.textContent || "";
        const lineCount = text.split("\n").length;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < lineCount; i++) {
            const div = document.createElement("div");
            div.textContent = i + 1;
            fragment.appendChild(div);
        }
        linesDiv.innerHTML = "";
        linesDiv.appendChild(fragment);
        if (linesDiv.innerHTML === "") {
            linesDiv.innerHTML = "<div>1</div>";
        }
        if (textarea.id === "jsonInput") {
            linesDiv.scrollTop = textarea.scrollTop;
        } else if (jsonOutputDisplay) {
            linesDiv.scrollTop = jsonOutputDisplay.scrollTop;
        }
    }

    function syncScroll(source, target) {
        target.scrollTop = source.scrollTop;
    }

    function clearErrorHighlight() {
        const highlighted = inputLineNumbers.querySelector(".error-line");
        if (highlighted) {
            highlighted.classList.remove("error-line");
        }
    }

    function highlightErrorLine(position) {
        clearErrorHighlight();
        const text = jsonInput.value;
        let lineNum = 1;
        for (let i = 0; i < position && i < text.length; i++) {
            if (text[i] === "\n") {
                lineNum++;
            }
        }
        const targetLineDiv = inputLineNumbers.querySelector(
            `div:nth-child(${lineNum})`
        );
        if (targetLineDiv) {
            targetLineDiv.classList.add("error-line");
        }
    }

    function formatAndValidateJson() {
        const rawJson = jsonInput.value.trim();
        displayStatus("");
        clearErrorHighlight();
        jsonOutput.value = ""; 
        jsonHighlightOutput.textContent = ""; 

        updateLineNumbers(jsonInput, inputLineNumbers); 
        updateLineNumbers(jsonOutputDisplay, outputLineNumbers);

        if (!rawJson) {
            return;
        }

        try {
            const parsedJson = JSON.parse(rawJson);
            const formattedJson = JSON.stringify(parsedJson, null, 2);

            jsonOutput.value = formattedJson; 
            jsonHighlightOutput.textContent = formattedJson; 

            Prism.highlightElement(jsonHighlightOutput);

            displayStatus("Valid JSON formatted successfully!", "success");
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            displayStatus(`Invalid JSON: ${error.message}`, "error");
            jsonOutput.value = ""; 
            jsonHighlightOutput.textContent = ""; 

            const match = error.message.match(/at position (\d+)/);
            if (match && match[1]) {
                const position = parseInt(match[1], 10);
                highlightErrorLine(position);
            }
        } finally {
            updateLineNumbers(jsonInput, inputLineNumbers);
            updateLineNumbers(jsonOutputDisplay, outputLineNumbers);
        }
    }

    function clearInput() {
        jsonInput.value = "";
        jsonOutput.value = "";
        jsonHighlightOutput.textContent = "";
        displayStatus("");
        clearErrorHighlight();
        updateLineNumbers(jsonInput, inputLineNumbers);
        updateLineNumbers(jsonOutputDisplay, outputLineNumbers);
    }

    function copyOutput() {
        const outputValue = jsonOutput.value;
        if (!outputValue) return;

        navigator.clipboard
            .writeText(outputValue)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1500);
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                alert("Failed to copy text. Please try manually.");
            });
    }

    formatButton.addEventListener("click", formatAndValidateJson);
    clearButton.addEventListener("click", clearInput);
    copyButton.addEventListener("click", copyOutput);

    jsonInput.addEventListener("input", () =>
        updateLineNumbers(jsonInput, inputLineNumbers)
    );
    jsonInput.addEventListener("scroll", () =>
        syncScroll(jsonInput, inputLineNumbers)
    );

    jsonOutputDisplay.addEventListener("scroll", () =>
        syncScroll(jsonOutputDisplay, outputLineNumbers)
    );

    window.addEventListener("resize", () => {
        updateLineNumbers(jsonInput, inputLineNumbers);
        updateLineNumbers(jsonOutputDisplay, outputLineNumbers);
    });

    updateLineNumbers(jsonInput, inputLineNumbers);
    updateLineNumbers(jsonOutputDisplay, outputLineNumbers);
});
