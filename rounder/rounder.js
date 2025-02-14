const fileInput = document.querySelector("#file");
const fileNameDisplay = document.querySelector("#file-name");
const filePreview = document.querySelector("#file-preview");

const roundingInput = document.querySelector("#rounding");
const colorInput = document.querySelector("#color");
const imagePreviewContainer = document.querySelector("#image-preview");
const fileTypeSelect = document.querySelector("#file-type");
const saveButton = document.querySelector("#save");

const switchBtns = document.querySelectorAll(".switch-btn");
let currentUnit = "%";

const cornerBoxes = document.querySelectorAll(".corner-box");
const activeCorners = {
    "top-left": true,
    "top-right": true,
    "bottom-left": true,
    "bottom-right": true,
};

function handleUnitSwitch(event) {
    switchBtns.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
    currentUnit = event.target.dataset.unit;
    updatePreview();
}

switchBtns.forEach((btn) => btn.addEventListener("click", handleUnitSwitch));

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        let fileName = file.name;
        if (fileName.length > 20) {
            fileName = fileName.substring(0, 17) + "...";
        }
        fileNameDisplay.textContent = fileName;
        const reader = new FileReader();
        reader.onload = function (e) {
            filePreview.src = e.target.result;
            filePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        fileNameDisplay.textContent = "";
        filePreview.style.display = "none";
    }
});

function calculateRadius(value, width, height) {
    if (currentUnit === "px") {
        return { x: parseInt(value), y: parseInt(value) };
    } else if (currentUnit === "%") {
        const xVal = (parseInt(value) / 100) * width;
        const yVal = (parseInt(value) / 100) * height;
        return { x: xVal, y: yVal };
    } else {
        return { x: parseInt(value) * 16, y: parseInt(value) * 16 };
    }
}

function handleCornerToggle(event) {
    const corner = event.target.dataset.corner;
    activeCorners[corner] = !activeCorners[corner];
    event.target.classList.toggle("active");
    updatePreview();
}

cornerBoxes.forEach((box) => {
    box.addEventListener("click", handleCornerToggle);
});

function updatePreview() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreviewContainer.innerHTML = "";

            let canvas = document.getElementById("preview-canvas");
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.id = "preview-canvas";
                imagePreviewContainer.appendChild(canvas);
            }
            const ctx = canvas.getContext("2d", { alpha: true });
            const img = new Image();

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.maxWidth = "100%";
                canvas.style.height = "auto";

                const radius =
                    currentUnit === "%"
                        ? (parseInt(roundingInput.value) / 100) *
                          Math.min(canvas.width, canvas.height)
                        : calculateRadius(
                              roundingInput.value,
                              canvas.width,
                              canvas.height
                          ).x;

                if (fileTypeSelect.value === "jpeg") {
                    ctx.fillStyle = colorInput.value;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                const path = new Path2D();
                path.roundRect(0, 0, canvas.width, canvas.height, [
                    activeCorners["top-left"] ? radius : 0,
                    activeCorners["top-right"] ? radius : 0,
                    activeCorners["bottom-right"] ? radius : 0,
                    activeCorners["bottom-left"] ? radius : 0,
                ]);
                ctx.clip(path);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };

            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function updateBackgroundColorVisibility() {
    const selectedFileType = fileTypeSelect.value;
    const colorContainer = colorInput.parentElement;

    if (selectedFileType === "jpeg") {
        colorContainer.style.display = "block";
    } else {
        colorContainer.style.display = "none";
    }
}

function saveImage() {
    const previewCanvas = imagePreviewContainer.querySelector("canvas");
    if (!previewCanvas) return;

    const link = document.createElement("a");
    const fileName = fileNameDisplay.textContent || "-rounded";
    link.download = `${fileName}.${fileTypeSelect.value}`;
    link.href = previewCanvas.toDataURL(`image/${fileTypeSelect.value}`, 1.0);
    link.click();
}

fileInput.addEventListener("change", updatePreview);
roundingInput.addEventListener("input", updatePreview);
colorInput.addEventListener("input", updatePreview);
fileTypeSelect.addEventListener("change", () => {
    updateBackgroundColorVisibility();
    updatePreview();
});
saveButton.addEventListener("click", saveImage);

cornerBoxes.forEach((box) => {
    box.addEventListener("click", handleCornerToggle);
});

updateBackgroundColorVisibility();

function updateRoundingLimit() {
    if (currentUnit === "%") {
        roundingInput.max = "50";
        if (parseInt(roundingInput.value) > 50) {
            roundingInput.value = "50";
        }
    } else {
        roundingInput.max = "";
    }
    updatePreview();
}

switchBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        handleUnitSwitch(event);
        updateRoundingLimit();
    });
});

roundingInput.addEventListener("input", (event) => {
    if (currentUnit === "%" && parseInt(event.target.value) > 50) {
        event.target.value = "50";
    }
    updatePreview();
});
