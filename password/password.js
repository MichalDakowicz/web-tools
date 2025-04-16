document.addEventListener("DOMContentLoaded", function () {
    const passwordOutput = document.getElementById("passwordOutput");
    const copyButton = document.getElementById("copyButton");
    const copyMessage = document.getElementById("copyMessage");
    const lengthSlider = document.getElementById("lengthSlider");
    const lengthValue = document.getElementById("lengthValue");
    const includeUppercase = document.getElementById("includeUppercase");
    const includeLowercase = document.getElementById("includeLowercase");
    const includeNumbers = document.getElementById("includeNumbers");
    const includeSymbols = document.getElementById("includeSymbols");
    const generateButton = document.getElementById("generateButton");
    const optionsError = document.getElementById("optionsError");

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?`~";

    function updateLengthValue() {
        lengthValue.textContent = lengthSlider.value;
    }

    function displayOptionsError(message) {
        optionsError.textContent = message;
        optionsError.classList.add("visible");
    }

    function clearOptionsError() {
        optionsError.textContent = "";
        optionsError.classList.remove("visible");
    }

    function generatePassword() {
        clearOptionsError();
        const length = parseInt(lengthSlider.value);
        let charset = "";
        let requiredChars = [];

        if (includeUppercase.checked) {
            charset += uppercaseChars;
            requiredChars.push(
                uppercaseChars[
                    Math.floor(Math.random() * uppercaseChars.length)
                ]
            );
        }
        if (includeLowercase.checked) {
            charset += lowercaseChars;
            requiredChars.push(
                lowercaseChars[
                    Math.floor(Math.random() * lowercaseChars.length)
                ]
            );
        }
        if (includeNumbers.checked) {
            charset += numberChars;
            requiredChars.push(
                numberChars[Math.floor(Math.random() * numberChars.length)]
            );
        }
        if (includeSymbols.checked) {
            charset += symbolChars;
            requiredChars.push(
                symbolChars[Math.floor(Math.random() * symbolChars.length)]
            );
        }

        if (charset === "") {
            displayOptionsError("Please select at least one character type.");
            passwordOutput.value = "";
            return;
        }
        if (length < requiredChars.length) {
            displayOptionsError(
                `Length must be at least ${requiredChars.length} to include all selected types.`
            );
            passwordOutput.value = "";
            return;
        }

        let password = "";
        const remainingLength = length - requiredChars.length;

        for (let i = 0; i < remainingLength; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        let passwordArray = (password + requiredChars.join("")).split("");

        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [
                passwordArray[j],
                passwordArray[i],
            ];
        }

        passwordOutput.value = passwordArray.join("");
    }

    function copyPassword() {
        const password = passwordOutput.value;
        if (!password) return;

        navigator.clipboard
            .writeText(password)
            .then(() => {
                copyMessage.textContent = "Copied!";
                copyMessage.classList.add("visible");
                setTimeout(() => {
                    copyMessage.classList.remove("visible");
                }, 1500);
            })
            .catch((err) => {
                console.error("Failed to copy password: ", err);
                alert("Failed to copy. Please select and copy manually.");
            });
    }

    lengthSlider.addEventListener("input", updateLengthValue);
    generateButton.addEventListener("click", generatePassword);
    copyButton.addEventListener("click", copyPassword);

    [
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        lengthSlider,
    ].forEach((el) => {
        el.addEventListener("change", generatePassword);
    });

    updateLengthValue();
});
