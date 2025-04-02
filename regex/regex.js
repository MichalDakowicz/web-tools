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

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(
        /[&<>'"]/g,
        (tag) =>
            ({
                "&": "&",
                "<": "<",
                ">": ">",
                "'": "'",
                '"': '"',
            }[tag] || tag)
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const regexInput = document.getElementById("regexInput");
    const flagG = document.getElementById("flagG");
    const flagI = document.getElementById("flagI");
    const flagM = document.getElementById("flagM");
    const flagS = document.getElementById("flagS");
    const flagU = document.getElementById("flagU");
    const flagY = document.getElementById("flagY");
    const flagCheckboxes = [flagG, flagI, flagM, flagS, flagU, flagY];
    const testString = document.getElementById("testString");
    const highlightedText = document.getElementById("highlightedText");
    const matchInfo = document.getElementById("matchInfo");
    const regexError = document.getElementById("regexError");

    function testRegex() {
        const pattern = regexInput.value;
        const text = testString.value;
        let flags = "";
        flagCheckboxes.forEach((cb) => {
            if (cb.checked) {
                flags += cb.value;
            }
        });

        highlightedText.innerHTML = escapeHTML(text) || " ";
        matchInfo.innerHTML = "";
        regexError.textContent = "";
        regexError.classList.remove("visible");

        if (!pattern) {
            matchInfo.innerHTML =
                '<span class="no-matches">Enter a regular expression.</span>';
            return;
        }
        if (!text) {
            matchInfo.innerHTML =
                '<span class="no-matches">Enter a test string.</span>';
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            regexError.textContent = `Regex Error: ${e.message}`;
            regexError.classList.add("visible");
            matchInfo.innerHTML =
                '<span class="no-matches">Invalid Regex Pattern</span>';
            return;
        }

        let matches = [];
        let match;
        let execError = null;

        try {
            if (regex.global) {
                matches = Array.from(text.matchAll(regex));
            } else {
                match = regex.exec(text);
                if (match) {
                    matches.push(match);
                }
            }
        } catch (e) {
            console.error("Regex Execution Error:", e);
            execError = `Execution Error: ${e.message}. Might be too complex.`;
            regexError.textContent = execError;
            regexError.classList.add("visible");
        }

        if (execError) {
            matchInfo.innerHTML = `<span class="no-matches">${escapeHTML(
                execError
            )}</span>`;
        } else if (matches.length === 0) {
            matchInfo.innerHTML =
                '<span class="no-matches">No matches found.</span>';
        } else {
            let matchDetails = `Found ${matches.length} match${
                matches.length === 1 ? "" : "es"
            }:\n\n`;
            matches.forEach((m, index) => {
                matchDetails += `Match ${index + 1}: `;
                matchDetails += `<span class="match-full">${escapeHTML(
                    m[0]
                )}</span>\n`;
                matchDetails += `  <span class="match-index">Index: ${m.index}</span>\n`;
                if (m.groups) {
                    matchDetails += `  Groups (Named):\n`;
                    for (const groupName in m.groups) {
                        matchDetails += `    <span class="match-group-name">${escapeHTML(
                            groupName
                        )}</span>: <span class="match-group">${escapeHTML(
                            m.groups[groupName] || "undefined"
                        )}</span>\n`;
                    }
                }
                if (m.length > 1) {
                    matchDetails += `  Groups (Numbered):\n`;
                    for (let i = 1; i < m.length; i++) {
                        matchDetails += `    <span class="match-group-num">${i}</span>: <span class="match-group">${escapeHTML(
                            m[i] || "undefined"
                        )}</span>\n`;
                    }
                }
                matchDetails += `\n`;
            });
            matchInfo.innerHTML = matchDetails;
        }

        if (!execError && matches.length > 0) {
            let highlightedOutput = "";
            let lastIndex = 0;

            matches.forEach((m) => {
                highlightedOutput += escapeHTML(
                    text.substring(lastIndex, m.index)
                );
                highlightedOutput += `<span class="match-highlight">${escapeHTML(
                    m[0]
                )}</span>`;
                lastIndex = m.index + m[0].length;
            });

            highlightedOutput += escapeHTML(text.substring(lastIndex));

            highlightedText.innerHTML = highlightedOutput || " ";
        } else if (!execError) {
            highlightedText.innerHTML = escapeHTML(text) || " ";
        }
    }

    const debouncedTestRegex = debounce(testRegex, 300);

    regexInput.addEventListener("input", debouncedTestRegex);
    testString.addEventListener("input", debouncedTestRegex);
    flagCheckboxes.forEach((cb) => {
        cb.addEventListener("change", testRegex);
    });

    testRegex();
});
