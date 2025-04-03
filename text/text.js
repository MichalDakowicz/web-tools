document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const outputText = document.getElementById("outputText");

    const btnUppercase = document.getElementById("btnUppercase");
    const btnLowercase = document.getElementById("btnLowercase");
    const btnSentenceCase = document.getElementById("btnSentenceCase");
    const btnTitleCase = document.getElementById("btnTitleCase");
    const btnCapitalize = document.getElementById("btnCapitalize");
    const btnReverse = document.getElementById("btnReverse");
    const btnReverseWords = document.getElementById("btnReverseWords");
    const btnTrim = document.getElementById("btnTrim");

    const btnClear = document.getElementById("btnClear");
    const btnCopyOutput = document.getElementById("btnCopyOutput");

    const charCountSpan = document.getElementById("charCount");
    const wordCountSpan = document.getElementById("wordCount");
    const lineCountSpan = document.getElementById("lineCount");

    function toUppercase() {
        outputText.value = inputText.value.toUpperCase();
    }

    function toLowercase() {
        outputText.value = inputText.value.toLowerCase();
    }

    function toSentenceCase() {
        const text = inputText.value.toLowerCase();
        outputText.value = text.replace(
            /(^\w{1}|\.\s*\w{1}|!\s*\w{1}|\?\s*\w{1})/gm,
            (match) => match.toUpperCase()
        );
    }

    function toTitleCase() {
        const text = inputText.value.toLowerCase();
        outputText.value = text.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function toCapitalize() {
        const text = inputText.value;
        if (text.length > 0) {
            outputText.value =
                text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        } else {
            outputText.value = "";
        }
    }

    function reverseText() {
        outputText.value = inputText.value.split("").reverse().join("");
    }

    function reverseWords() {
        outputText.value = inputText.value.split(/\s+/).reverse().join(" ");
    }

    function trimWhitespace() {
        outputText.value = inputText.value.trim();
    }

    function clearAll() {
        inputText.value = "";
        outputText.value = "";
        updateStats();
    }

    function copyOutput() {
        if (outputText.value === "") return;

        navigator.clipboard
            .writeText(outputText.value)
            .then(() => {
                const originalText = btnCopyOutput.textContent;
                btnCopyOutput.textContent = "Copied!";
                setTimeout(() => {
                    btnCopyOutput.textContent = originalText;
                }, 1500);
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
                alert("Failed to copy text. Please try manually.");
            });
    }

    function updateStats() {
        const text = inputText.value;
        charCountSpan.textContent = text.length;
        wordCountSpan.textContent = (text.match(/\S+/g) || []).length;
        lineCountSpan.textContent =
            (text.match(/\n/g) || []).length + (text.length > 0 ? 1 : 0);
        if (text.length === 0) {
            wordCountSpan.textContent = 0;
            lineCountSpan.textContent = 0;
        }
    }

    btnUppercase.addEventListener("click", toUppercase);
    btnLowercase.addEventListener("click", toLowercase);
    btnSentenceCase.addEventListener("click", toSentenceCase);
    btnTitleCase.addEventListener("click", toTitleCase);
    btnCapitalize.addEventListener("click", toCapitalize);
    btnReverse.addEventListener("click", reverseText);
    btnReverseWords.addEventListener("click", reverseWords);
    btnTrim.addEventListener("click", trimWhitespace);

    btnClear.addEventListener("click", clearAll);
    btnCopyOutput.addEventListener("click", copyOutput);

    inputText.addEventListener("input", updateStats);

    updateStats();
});
