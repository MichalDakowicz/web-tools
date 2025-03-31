document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageInput");
    const fileInputWrapper = document.querySelector(".file-input-wrapper");
    const fileInputText = document.getElementById("fileInputText");
    const apiKeyInput = document.getElementById("apiKey");
    const processBtn = document.getElementById("processBtn");
    const loadingSpinner = document.getElementById("loading");
    const imagePreview = document.getElementById("imagePreview");
    const latexOutput = document.getElementById("latexOutput");
    const copyBtn = document.getElementById("copyBtn");
    const mathPreview = document.getElementById("mathPreview");

    checkMathJaxLoaded();

    if (localStorage.getItem("mathpixApiKey")) {
        apiKeyInput.value = localStorage.getItem("mathpixApiKey");
        validateForm();
    }

    fileInput.addEventListener("change", handleFileSelect);
    apiKeyInput.addEventListener("input", validateForm);
    fileInputWrapper.addEventListener("click", () => fileInput.click());
    processBtn.addEventListener("click", processImage);
    copyBtn.addEventListener("click", copyLatex);

    fileInputWrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileInputWrapper.classList.add("dragover");
    });

    fileInputWrapper.addEventListener("dragleave", () => {
        fileInputWrapper.classList.remove("dragover");
    });

    fileInputWrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        fileInputWrapper.classList.remove("dragover");

        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Please select an image file");
            fileInput.value = "";
            return;
        }

        fileInputText.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);

        validateForm();
    }

    function validateForm() {
        const hasFile = fileInput.files.length > 0;
        const hasApiKey = apiKeyInput.value.trim() !== "";

        processBtn.disabled = !(hasFile && hasApiKey);

        if (hasApiKey) {
            localStorage.setItem("mathpixApiKey", apiKeyInput.value.trim());
        }
    }

    async function processImage() {
        const file = fileInput.files[0];
        const apiKey = apiKeyInput.value.trim();

        if (!file || !apiKey) return;

        loadingSpinner.classList.remove("hidden");
        processBtn.disabled = true;

        try {
            const base64Image = await fileToBase64(file);
            const base64Data = base64Image.split(",")[1];

            const result = await callMathpixApi(base64Data, apiKey);

            if (result && result.latex) {
                latexOutput.value = result.latex;
                copyBtn.disabled = false;

                mathPreview.innerHTML = "";
                const mathElement = document.createElement("div");
                mathElement.textContent = `$$${result.latex}$$`;
                mathPreview.appendChild(mathElement);

                renderMathJax();
            } else {
                latexOutput.value =
                    "Error: Could not recognize LaTeX from image.";
                mathPreview.innerHTML = "<p>No preview available</p>";
                copyBtn.disabled = true;
            }
        } catch (error) {
            console.error("Error processing image:", error);
            latexOutput.value = `Error: ${error.message}`;
            mathPreview.innerHTML = "<p>No preview available</p>";
            copyBtn.disabled = true;
        } finally {
            loadingSpinner.classList.add("hidden");
            processBtn.disabled = false;
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    async function callMathpixApi(base64Image, apiKey) {
        const url = "https://api.mathpix.com/v3/latex";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    app_id: "mathpix-ocr-tool",
                    app_key: apiKey,
                },
                body: JSON.stringify({
                    src: `data:image/jpeg;base64,${base64Image}`,
                    formats: ["latex"],
                    data_options: {
                        include_latex: true,
                        include_asciimath: false,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `API error: ${response.status}`
                );
            }

            return await response.json();
        } catch (error) {
            throw new Error(`API call failed: ${error.message}`);
        }
    }

    function copyLatex() {
        latexOutput.select();
        document.execCommand("copy");

        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="copy-text">Copied!</span>';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    function checkMathJaxLoaded() {
        setTimeout(() => {
            if (!window.MathJax || !window.MathJax.typesetPromise) {
                console.log(
                    "MathJax not loaded properly, trying alternative CDN..."
                );

                const script = document.createElement("script");
                script.src =
                    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
                script.async = true;
                document.head.appendChild(script);

                const notification = document.createElement("div");
                notification.className = "mathjax-notification";
                notification.textContent = "Loading math rendering engine...";
                document.querySelector(".container").prepend(notification);

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
            } else {
                console.log("MathJax loaded successfully");
            }
        }, 2000);
    }

    function renderMathJax() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([mathPreview]).catch((err) => {
                console.error("MathJax typesetting failed:", err);
                mathPreview.innerHTML +=
                    '<div class="error-message">Formula rendering failed. Raw LaTeX displayed.</div>';
            });
        } else {
            console.warn("MathJax not available for rendering");

            mathPreview.innerHTML += `
                <div class="mathjax-fallback">
                    <p><strong>MathJax could not load. Raw LaTeX:</strong></p>
                    <pre>${latexOutput.value}</pre>
                </div>
            `;
        }
    }
});
