document.addEventListener("DOMContentLoaded", function () {
    const textInput = document.getElementById("textInput");
    const morseInput = document.getElementById("morseInput");
    const errorMessage = document.getElementById("errorMessage");

    const morseCodeDict = {
        A: ".-",
        B: "-...",
        C: "-.-.",
        D: "-..",
        E: ".",
        F: "..-.",
        G: "--.",
        H: "....",
        I: "..",
        J: ".---",
        K: "-.-",
        L: ".-..",
        M: "--",
        N: "-.",
        O: "---",
        P: ".--.",
        Q: "--.-",
        R: ".-.",
        S: "...",
        T: "-",
        U: "..-",
        V: "...-",
        W: ".--",
        X: "-..-",
        Y: "-.--",
        Z: "--..",
        1: ".----",
        2: "..---",
        3: "...--",
        4: "....-",
        5: ".....",
        6: "-....",
        7: "--...",
        8: "---..",
        9: "----.",
        0: "-----",
        " ": "/", 
        ".": ".-.-.-",
        ",": "--..--",
        "?": "..--..",
        "'": ".----.",
        "!": "-.-.--",
        "/": "-..-.",
        "(": "-.--.",
        ")": "-.--.-",
        "&": ".-...",
        ":": "---...",
        ";": "-.-.-.",
        "=": "-...-",
        "+": ".-.-.",
        "-": "-....-",
        _: "..--.-",
        '"': ".-..-.",
        $: "...-..-",
        "@": ".--.-.",
    };

    const textCodeDict = Object.entries(morseCodeDict).reduce(
        (acc, [key, value]) => {
            acc[value] = key;
            return acc;
        },
        {}
    );

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

    function clearError() {
        if (errorMessage.style.display !== "none") {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
        }
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    function convertTextToMorse() {
        const text = textInput.value.toUpperCase().trim();
        let morse = "";
        try {
            morse = text
                .split("")
                .map((char) => {
                    if (morseCodeDict[char]) {
                        return morseCodeDict[char];
                    } else if (char === "\n") {
                        return "/"; 
                    } else if (char.trim() === "") {
                        return morseCodeDict[" "]; 
                    } else {
                        if (text.length > 0) {
                            throw new Error(`Invalid character: ${char}`);
                        }
                        return null; 
                    }
                })
                .filter((code) => code !== null)
                .join(" ");

            clearError();

            if (morseInput.value !== morse) {
                morseInput.value = morse;
            }
        } catch (e) {
            displayError(`Conversion error: ${e.message}`);
        }
    }

    function convertMorseToText() {
        const morse = morseInput.value.trim();
        let text = "";

        try {
            if (morse === "") {
                if (textInput.value !== "") {
                    textInput.value = "";
                }
                clearError();
                return;
            }

            const words = morse.split("/");

            text = words
                .map((word) => {
                    return word
                        .trim()
                        .split(/\s+/)
                        .map((code) => {
                            if (textCodeDict[code]) {
                                return textCodeDict[code];
                            } else if (code === "") {
                                return "";
                            } else {
                                throw new Error(
                                    `Invalid Morse code sequence: ${code}`
                                );
                            }
                        })
                        .join("");
                })
                .join(" "); 

            clearError();

            if (textInput.value !== text) {
                textInput.value = text;
            }
        } catch (e) {
            displayError(`Conversion error: ${e.message}`);
        }
    }

    const debounceTime = 300;
    textInput.addEventListener(
        "input",
        debounce(convertTextToMorse, debounceTime)
    );
    morseInput.addEventListener(
        "input",
        debounce(convertMorseToText, debounceTime)
    );
});
