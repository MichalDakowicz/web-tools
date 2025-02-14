document.addEventListener("DOMContentLoaded", function () {
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) {
            hex = hex.split("").map(ch => ch + ch).join("");
        }
        if (hex.length !== 6) return null;
        const r = parseInt(hex.substr(0, 2), 16),
              g = parseInt(hex.substr(2, 2), 16),
              b = parseInt(hex.substr(4, 2), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    function rgbToHex(rgb) {
        const result = rgb.match(/\d{1,3}/g);
        if (!result || result.length !== 3) return null;
        const r = parseInt(result[0]).toString(16).padStart(2, "0"),
              g = parseInt(result[1]).toString(16).padStart(2, "0"),
              b = parseInt(result[2]).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
    }

    const colorPicker = document.getElementById("colorPicker");
    const hexInput = document.getElementById("hexInput");
    const rgbInput = document.getElementById("rgbInput");

    function updateFieldsFromPicker() {
        const hex = colorPicker.value;
        hexInput.value = hex;
        rgbInput.value = hexToRgb(hex);
    }
    colorPicker.addEventListener("input", updateFieldsFromPicker);

    hexInput.addEventListener("input", function () {
        let hex = hexInput.value.trim();
        if (hex.startsWith("#")) hex = hex.slice(1);
        if (/^[0-9A-Fa-f]{1,6}$/.test(hex)) {
            if (hex.length === 3 || hex.length === 6) {
                const normalizedHex = "#" + (hex.length === 3 ? hex.split("").map(ch => ch + ch).join("") : hex);
                const rgb = hexToRgb(normalizedHex);
                if (rgb) {
                    rgbInput.value = rgb;
                    colorPicker.value = normalizedHex;
                }
            }
        }
    });

    rgbInput.addEventListener("input", function () {
        const rgb = rgbInput.value.trim();
        const hex = rgbToHex(rgb); 
        if (hex) {
            hexInput.value = hex;
            colorPicker.value = hex;
        }
    });

    updateFieldsFromPicker();
});
