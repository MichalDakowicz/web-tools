document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const formatSelect = document.getElementById("formatSelect");
    const convertBtn = document.getElementById("convertBtn");
    const outputMessage = document.getElementById("outputMessage");
    const downloadContainer = document.getElementById("downloadContainer");
    const previewContainer = document.getElementById("previewContainer");
    const fileInputWrapper = document.querySelector(".file-input-wrapper");
    const fileInputText = document.querySelector(".file-input-text");
    const fileInputSubtext = document.querySelector(".file-input-subtext");

    let currentFile = null;
    let isConverting = false;

    const formatLabels = {
        // Images
        "image/jpeg": "JPEG",
        "image/png": "PNG",
        "image/webp": "WebP",
        "image/bmp": "BMP",
        "image/gif": "GIF",
        // Text/Data
        "text/plain": "Plain Text (.txt)",
        "text/html": "HTML",
        "application/json": "JSON",
        "text/csv": "CSV",
        "text/markdown": "Markdown (.md)",
        // Documents
        "application/pdf": "PDF",
        // Video (Output limited by MediaRecorder)
        "video/mp4": "MP4 Video",
        "video/webm": "WebM Video",
        // Audio (Output limited by MediaRecorder)
        "audio/mpeg": "MP3 Audio",
        "audio/wav": "WAV Audio",
        "audio/ogg": "Ogg Audio",
        "audio/webm": "WebM Audio",
        "audio/aac": "AAC Audio",
        "audio/flac": "FLAC Audio",

        // Special Targets (Not real MIME types, used internally)
        "internal/pdf-to-text": "Extract Text from PDF",
        "internal/json-to-csv": "JSON to CSV",
        "internal/csv-to-json": "CSV to JSON",
        "internal/md-to-html": "Markdown to HTML",
        "internal/html-to-md": "HTML to Markdown (Basic)",
    };

    const fileExtensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/gif": "gif",
        "text/plain": "txt",
        "text/html": "html",
        "application/json": "json",
        "text/csv": "csv",
        "text/markdown": "md",
        "application/pdf": "pdf",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "audio/ogg": "ogg",
        "audio/webm": "webm",
        "internal/pdf-to-text": "txt",
        "internal/json-to-csv": "csv",
        "internal/csv-to-json": "json",
        "internal/md-to-html": "html",
        "internal/html-to-md": "md",
    };

    const formatOptions = {
        // Images
        "image/jpeg": ["image/png", "image/webp", "image/bmp", "image/gif"],
        "image/png": ["image/jpeg", "image/webp", "image/bmp", "image/gif"],
        "image/webp": ["image/jpeg", "image/png", "image/bmp", "image/gif"],
        "image/bmp": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "image/gif": ["image/jpeg", "image/png", "image/webp", "image/bmp"],

        // Text/Data
        "text/plain": [
            "text/html",
            "application/json",
            "text/csv",
            "text/markdown",
        ],
        "text/html": ["text/plain", "internal/html-to-md"],
        "application/json": ["text/plain", "internal/json-to-csv"],
        "text/csv": ["text/plain", "internal/csv-to-json", "application/json"],
        "text/markdown": ["text/html", "internal/md-to-html"],

        // PDF
        "application/pdf": ["image/png", "image/jpeg", "internal/pdf-to-text"],

        // Video (Input recognition, Output limited)
        "video/mp4": ["video/webm"],
        "video/webm": ["video/mp4"],
        "video/ogg": ["video/webm", "video/mp4"],
        "video/quicktime": ["video/webm", "video/mp4"],
        "video/x-msvideo": ["video/webm", "video/mp4"],
        "video/x-ms-wmv": ["video/webm", "video/mp4"],

        // Audio (Input recognition, Output limited)
        "audio/mpeg": ["audio/webm", "audio/ogg"],
        "audio/wav": ["audio/webm", "audio/ogg"],
        "audio/ogg": ["audio/webm"],
        "audio/webm": ["audio/ogg"],
        "audio/aac": ["audio/webm", "audio/ogg"],
        "audio/flac": ["audio/webm", "audio/ogg"],
        "audio/x-m4a": ["audio/webm", "audio/ogg"],
    };

    setupEventListeners();
    updateSupportedTypesText();

    function setupEventListeners() {
        fileInputWrapper.addEventListener("dragover", handleDragOver);
        fileInputWrapper.addEventListener("dragleave", handleDragLeave);
        fileInputWrapper.addEventListener("drop", handleDrop);
        fileInputWrapper.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", handleFileSelection);

        formatSelect.addEventListener("change", () => {
            convertBtn.disabled =
                isConverting || !formatSelect.value || !currentFile;
        });

        convertBtn.addEventListener("click", () => {
            if (!isConverting && currentFile && formatSelect.value) {
                convertFile();
            }
        });
    }

    function updateSupportedTypesText() {
        const supportedInputs = new Set();
        Object.keys(formatOptions).forEach((mimeType) => {
            const label = formatLabels[mimeType] || mimeType;
            if (label.includes("Audio")) supportedInputs.add("Audio");
            else if (label.includes("Video")) supportedInputs.add("Video");
            else if (label.includes("Image")) supportedInputs.add("Images");
            else if (mimeType.includes("pdf")) supportedInputs.add("PDF");
            else if (mimeType.includes("csv")) supportedInputs.add("CSV");
            else if (mimeType.includes("json")) supportedInputs.add("JSON");
            else if (mimeType.includes("html")) supportedInputs.add("HTML");
            else if (mimeType.includes("markdown"))
                supportedInputs.add("Markdown");
            else if (mimeType.includes("text")) supportedInputs.add("Text");
        });
        fileInputSubtext.textContent = `Supports: ${[...supportedInputs].join(
            ", "
        )}. Client-side conversion limitations apply, especially for media.`;
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (!isConverting) {
            fileInputWrapper.classList.add("dragover");
        }
    }

    function handleDragLeave(e) {
        e.preventDefault();
        fileInputWrapper.classList.remove("dragover");
    }

    function handleDrop(e) {
        e.preventDefault();
        fileInputWrapper.classList.remove("dragover");
        if (isConverting) return;

        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            const event = new Event("change", { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }

    function handleFileSelection() {
        resetOutputUI();

        if (fileInput.files.length === 0) {
            currentFile = null;
            fileInputText.textContent =
                "Drop your file here or click to browse";
            formatSelect.innerHTML =
                '<option value="">Select format...</option>';
            formatSelect.disabled = true;
            convertBtn.disabled = true;
            return;
        }

        currentFile = fileInput.files[0];
        const fileType = currentFile.type || detectMimeType(currentFile.name);
        const fileName = currentFile.name;

        fileInputText.textContent = `Selected: ${fileName} (${formatFileSize(
            currentFile.size
        )})`;
        outputMessage.textContent = `File selected: ${fileName}. Type: ${
            fileType || "unknown"
        }`;

        populateFormatOptions(fileType);

        convertBtn.disabled = !formatSelect.value || !currentFile;
    }

    function detectMimeType(filename) {
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimeMap = {
            txt: "text/plain",
            md: "text/markdown",
            csv: "text/csv",
            json: "application/json",
            html: "text/html",
            htm: "text/html",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            bmp: "image/bmp",
            webp: "image/webp",
            svg: "image/svg+xml",
            pdf: "application/pdf",
            mp4: "video/mp4",
            webm: "video/webm",
            ogg: "video/ogg",
            ogv: "video/ogg",
            mov: "video/quicktime",
            avi: "video/x-msvideo",
            wmv: "video/x-ms-wmv",
            mp3: "audio/mpeg",
            wav: "audio/wav",
            oga: "audio/ogg",
            aac: "audio/aac",
            flac: "audio/flac",
            m4a: "audio/x-m4a",
        };
        return mimeMap[ext] || "";
    }

    function populateFormatOptions(inputFileType) {
        formatSelect.innerHTML =
            '<option value="">Select target format...</option>';
        const availableFormats = formatOptions[inputFileType] || [];

        if (availableFormats.length > 0) {
            availableFormats.forEach((format) => {
                const option = document.createElement("option");
                option.value = format;
                option.textContent = formatLabels[format] || format;
                formatSelect.appendChild(option);
            });
            formatSelect.disabled = false;
        } else {
            outputMessage.textContent = `No conversion options available for file type: ${
                inputFileType || "unknown"
            }`;
            formatSelect.disabled = true;
        }
    }

    async function convertFile() {
        const targetFormat = formatSelect.value;
        if (!currentFile || !targetFormat || isConverting) return;

        isConverting = true;
        setUIState(true);
        outputMessage.textContent = `Converting ${currentFile.name} to ${formatLabels[targetFormat]}... Please wait.`;
        downloadContainer.innerHTML = "";
        previewContainer.innerHTML = "";

        try {
            const inputType =
                currentFile.type || detectMimeType(currentFile.name);

            if (targetFormat.startsWith("image/")) {
                if (inputType.startsWith("image/")) {
                    await convertImage(currentFile, targetFormat);
                } else if (inputType === "application/pdf") {
                    await convertPdfToImage(currentFile, targetFormat);
                } else {
                    throw new Error(
                        `Cannot convert from ${inputType} to an image format directly.`
                    );
                }
            } else if (targetFormat === "internal/pdf-to-text") {
                await convertPdfToText(currentFile);
            } else if (targetFormat === "internal/csv-to-json") {
                await convertCsvToJson(currentFile);
            } else if (targetFormat === "internal/json-to-csv") {
                await convertJsonToCsv(currentFile);
            } else if (targetFormat === "internal/md-to-html") {
                await convertMarkdownToHtml(currentFile);
            } else if (targetFormat === "internal/html-to-md") {
                await convertHtmlToMarkdown(currentFile);
            } else if (
                targetFormat.startsWith("text/") ||
                targetFormat === "application/json"
            ) {
                await convertToText(currentFile, targetFormat);
            } else if (targetFormat.startsWith("video/")) {
                await convertVideo(currentFile, targetFormat);
            } else if (targetFormat.startsWith("audio/")) {
                await convertAudio(currentFile, targetFormat);
            } else {
                throw new Error(
                    `Conversion to ${targetFormat} is not supported.`
                );
            }
        } catch (error) {
            console.error("Conversion Error:", error);
            outputMessage.textContent = `Conversion failed: ${error.message}. Try a different format or file.`;
            displayResult(null, targetFormat);
        } finally {
            setUIState(false);
            isConverting = false;
        }
    }

    function readFileAs(file, type = "dataURL") {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);

            switch (type) {
                case "arrayBuffer":
                    reader.readAsArrayBuffer(file);
                    break;
                case "text":
                    reader.readAsText(file);
                    break;
                case "dataURL":
                default:
                    reader.readAsDataURL(file);
                    break;
            }
        });
    }

    async function convertImage(file, targetFormat) {
        outputMessage.textContent = "Processing image...";
        const dataUrl = await readFileAs(file, "dataURL");
        const img = await loadImage(dataUrl);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, targetFormat, 0.9);
        });

        if (!blob)
            throw new Error(
                "Canvas could not create blob. Target format might be unsupported."
            );

        displayResult(blob, targetFormat);
    }

    async function convertPdfToImage(file, targetFormat) {
        if (typeof pdfjsLib === "undefined") {
            throw new Error("PDF processing library (pdf.js) is not loaded.");
        }
        outputMessage.textContent = "Loading PDF (page 1)...";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const arrayBuffer = await readFileAs(file, "arrayBuffer");
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (pdf.numPages === 0) throw new Error("PDF has no pages.");

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        outputMessage.textContent = "Rendering PDF page to image...";
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext).promise;

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, targetFormat, 0.9);
        });

        if (!blob)
            throw new Error("Failed to create image blob from PDF canvas.");

        displayResult(blob, targetFormat);
    }

    async function convertPdfToText(file) {
        if (typeof pdfjsLib === "undefined") {
            throw new Error("PDF processing library (pdf.js) is not loaded.");
        }
        outputMessage.textContent = "Loading PDF...";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const arrayBuffer = await readFileAs(file, "arrayBuffer");
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";

        outputMessage.textContent = `Extracting text from ${pdf.numPages} pages...`;
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => item.str)
                .join(" ");
            fullText += pageText + "\n\n";
        }

        const blob = new Blob([fullText], { type: "text/plain" });
        displayResult(blob, "internal/pdf-to-text");
    }

    async function convertCsvToJson(file) {
        outputMessage.textContent = "Converting CSV to JSON...";
        const text = await readFileAs(file, "text");
        const lines = text.trim().split(/\r?\n/);

        if (lines.length < 1) throw new Error("CSV file appears empty.");

        const headers = lines[0].split(",").map((h) => h.trim());
        const jsonArray = lines.slice(1).map((line) => {
            const values = line.split(",");
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim() || "";
                return obj;
            }, {});
        });

        const result = JSON.stringify(jsonArray, null, 2);
        const blob = new Blob([result], { type: "application/json" });
        displayResult(blob, "internal/csv-to-json");
    }

    async function convertJsonToCsv(file) {
        outputMessage.textContent = "Converting JSON to CSV...";
        const text = await readFileAs(file, "text");
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Invalid JSON file: " + e.message);
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error(
                "JSON must be a non-empty array of objects for CSV conversion."
            );
        }

        const headers = Object.keys(data[0]);
        let csvContent = headers.join(",") + "\n";

        data.forEach((obj) => {
            const row = headers.map((header) => {
                let value = obj[header];
                if (typeof value === "string") {
                    value = value.replace(/"/g, '""');
                    if (value.includes(",")) {
                        value = `"${value}"`;
                    }
                } else if (value === null || value === undefined) {
                    value = "";
                }
                return value;
            });
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv" });
        displayResult(blob, "internal/json-to-csv");
    }

    async function convertMarkdownToHtml(file) {
        if (typeof marked === "undefined") {
            throw new Error(
                "Markdown library (marked.js) is not loaded. Please include it in your HTML."
            );
        }
        outputMessage.textContent = "Converting Markdown to HTML...";
        const markdownText = await readFileAs(file, "text");
        const htmlResult = marked.parse(markdownText);

        const blob = new Blob([htmlResult], { type: "text/html" });
        displayResult(blob, "internal/md-to-html");
    }

    async function convertHtmlToMarkdown(file) {
        outputMessage.textContent = "Converting HTML to text (basic)...";
        const htmlText = await readFileAs(file, "text");

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const textResult = doc.body.textContent || "";

        const blob = new Blob([textResult], { type: "text/plain" });
        displayResult(blob, "text/plain");
    }

    async function convertToText(file, targetFormat) {
        outputMessage.textContent = `Converting to ${formatLabels[targetFormat]}...`;
        const content = await readFileAs(file, "text");
        let result = content;

        if (file.type === "text/plain" && targetFormat === "text/html") {
            result = `<!DOCTYPE html><html><head><title>Converted Text</title></head><body><pre>${content
                .replace(/</g, "<")
                .replace(/>/g, ">")}</pre></body></html>`;
        }

        const blob = new Blob([result], { type: targetFormat });
        displayResult(blob, targetFormat);
    }

    async function convertVideo(file, targetFormat) {
        outputMessage.textContent = `Processing video for ${formatLabels[targetFormat]} conversion... (This can be slow and might have limitations)`;
        alert(
            "Warning: Client-side video conversion has limitations.\n- Output format support depends heavily on your browser (often WebM or MP4).\n- Conversion can be slow and may fail for large/complex files.\n- Quality might be reduced.\n- Audio might be lost in some cases.\nProceeding with best effort..."
        );

        let supportedTargetFormat = targetFormat;
        if (!MediaRecorder.isTypeSupported(targetFormat)) {
            console.warn(
                `MediaRecorder does not support ${targetFormat}. Trying alternatives.`
            );
            if (MediaRecorder.isTypeSupported("video/webm")) {
                supportedTargetFormat = "video/webm";
                outputMessage.textContent += `\nWarning: ${formatLabels[targetFormat]} not supported, attempting WebM conversion.`;
            } else if (MediaRecorder.isTypeSupported("video/mp4")) {
                supportedTargetFormat = "video/mp4";
                outputMessage.textContent += `\nWarning: ${formatLabels[targetFormat]} not supported, attempting MP4 conversion.`;
            } else {
                throw new Error(
                    `Your browser's MediaRecorder supports neither ${formatLabels[targetFormat]} nor common fallbacks (WebM/MP4). Conversion failed.`
                );
            }
        }

        const video = document.createElement("video");
        video.style.position = "absolute";
        video.style.left = "-9999px";
        video.muted = true;
        document.body.appendChild(video);

        try {
            const videoUrl = URL.createObjectURL(file);
            video.src = videoUrl;

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = () =>
                    reject(
                        new Error(
                            "Failed to load video metadata. File might be corrupt or unsupported."
                        )
                    );
                setTimeout(
                    () => reject(new Error("Timeout loading video metadata.")),
                    15000
                );
            });

            outputMessage.textContent = "Encoding video frames...";

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");

            const stream = canvas.captureStream(25);
            let finalStream = stream;
            try {
                const audioContext = new (window.AudioContext ||
                    window.webkitAudioContext)();
                const sourceNode = audioContext.createMediaElementSource(video);
                const destNode = audioContext.createMediaStreamDestination();
                sourceNode.connect(destNode);
                sourceNode.connect(audioContext.destination);
                const audioTrack = destNode.stream.getAudioTracks()[0];
                if (audioTrack) {
                    stream.addTrack(audioTrack);
                    console.log("Audio track added to stream.");
                }
            } catch (audioError) {
                console.warn(
                    "Could not add audio track to video stream:",
                    audioError
                );
                outputMessage.textContent +=
                    "\nWarning: Audio track could not be added.";
            }

            const recorder = new MediaRecorder(stream, {
                mimeType: supportedTargetFormat,
                videoBitsPerSecond: 2000000,
            });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            const conversionPromise = new Promise((resolve, reject) => {
                recorder.onstop = () => {
                    if (chunks.length === 0) {
                        reject(
                            new Error(
                                "MediaRecorder produced no data. Conversion failed."
                            )
                        );
                    } else {
                        const blob = new Blob(chunks, { type: targetFormat });
                        resolve(blob);
                    }
                };
                recorder.onerror = (e) =>
                    reject(new Error(`MediaRecorder error: ${e.error.name}`));
            });

            recorder.start();
            await video.play();

            let frameCount = 0;
            const drawFrame = () => {
                if (video.paused || video.ended) {
                    if (recorder.state === "recording") {
                        setTimeout(() => {
                            if (recorder.state === "recording") recorder.stop();
                        }, 100);
                    }
                    return;
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                frameCount++;
                requestAnimationFrame(drawFrame);
            };

            drawFrame();

            await new Promise((resolve) => {
                video.onended = resolve;
            });

            if (recorder.state === "recording") {
                recorder.stop();
            }

            const resultBlob = await conversionPromise;
            displayResult(resultBlob, targetFormat);
        } catch (error) {
            console.error("Video conversion error:", error);
            throw new Error(`Video processing failed: ${error.message}`);
        } finally {
            if (video.src) URL.revokeObjectURL(video.src);
            video.remove();
        }
    }

    async function convertAudio(file, targetFormat) {
        outputMessage.textContent = `Processing audio for ${formatLabels[targetFormat]} conversion... (Browser limitations apply)`;
        alert(
            "Warning: Client-side audio conversion has limitations.\n- Output format support depends on your browser (often WebM or Ogg).\n- Conversion might fail for certain input codecs or large files.\n- MP3/WAV output is generally NOT supported directly.\nProceeding with best effort..."
        );

        let supportedTargetFormat = targetFormat;
        if (!MediaRecorder.isTypeSupported(targetFormat)) {
            console.warn(
                `MediaRecorder does not support ${targetFormat}. Trying alternatives.`
            );
            if (MediaRecorder.isTypeSupported("audio/webm")) {
                supportedTargetFormat = "audio/webm";
                outputMessage.textContent += `\nWarning: ${formatLabels[targetFormat]} not supported, attempting WebM audio conversion.`;
            } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
                supportedTargetFormat = "audio/ogg";
                outputMessage.textContent += `\nWarning: ${formatLabels[targetFormat]} not supported, attempting Ogg audio conversion.`;
            } else {
                throw new Error(
                    `Your browser's MediaRecorder supports neither ${formatLabels[targetFormat]} nor common fallbacks (WebM/Ogg). Conversion failed.`
                );
            }
        }

        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        const arrayBuffer = await readFileAs(file, "arrayBuffer");

        try {
            outputMessage.textContent = "Decoding audio data...";
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const bufferSource = offlineContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(offlineContext.destination);
            bufferSource.start(0);

            outputMessage.textContent = "Rendering audio...";
            const renderedBuffer = await offlineContext.startRendering();

            const mediaStreamDest = audioContext.createMediaStreamDestination();
            const renderedSource = audioContext.createBufferSource();
            renderedSource.buffer = renderedBuffer;
            renderedSource.connect(mediaStreamDest);

            const recorder = new MediaRecorder(mediaStreamDest.stream, {
                mimeType: supportedTargetFormat,
                audioBitsPerSecond: 128000,
            });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            const recordPromise = new Promise((resolve, reject) => {
                recorder.onstop = () => {
                    if (chunks.length === 0) {
                        reject(
                            new Error("Audio MediaRecorder produced no data.")
                        );
                    } else {
                        const blob = new Blob(chunks, { type: targetFormat });
                        resolve(blob);
                    }
                };
                recorder.onerror = (e) =>
                    reject(
                        new Error(`Audio MediaRecorder error: ${e.error.name}`)
                    );
            });

            outputMessage.textContent = "Encoding audio...";
            recorder.start();
            renderedSource.start(0);

            setTimeout(() => {
                if (recorder.state === "recording") {
                    recorder.stop();
                }
                renderedSource.stop();
            }, renderedBuffer.duration * 1000 + 200);

            const resultBlob = await recordPromise;
            displayResult(resultBlob, targetFormat);
        } catch (error) {
            console.error("Audio conversion error:", error);
            if (
                error instanceof DOMException &&
                error.name === "EncodingError"
            ) {
                throw new Error(
                    `Could not decode audio file. The format might be unsupported by your browser (${
                        file.type || "unknown type"
                    }).`
                );
            }
            throw new Error(`Audio processing failed: ${error.message}`);
        } finally {
            await audioContext.close();
        }
    }

    function displayResult(blob, format) {
        resetOutputUI();

        if (!blob) {
            outputMessage.textContent =
                outputMessage.textContent ||
                "Conversion failed. Please check console for errors."; // Keep existing error or set default
            return;
        }

        const actualFormat = format.startsWith("internal/")
            ? format
            : blob.type || format;
        const fileName = getOutputFileName(currentFile.name, actualFormat);
        const url = URL.createObjectURL(blob);

        outputMessage.textContent = "Conversion complete!";

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.className = "download-btn";
        downloadLink.textContent = `Download ${fileName} (${formatFileSize(
            blob.size
        )})`;
        downloadContainer.appendChild(downloadLink);

        addPreviewElement(url, format, blob.type);
    }

    function addPreviewElement(url, targetFormat, actualBlobType) {
        previewContainer.innerHTML = "";
        const previewType = targetFormat.startsWith("internal/")
            ? actualBlobType
            : targetFormat;

        try {
            if (previewType.startsWith("image/")) {
                const img = document.createElement("img");
                img.src = url;
                img.alt = "Converted image preview";
                img.className = "preview-image";
                previewContainer.appendChild(img);
            } else if (previewType.startsWith("video/")) {
                const video = document.createElement("video");
                video.src = url;
                video.controls = true;
                video.className = "preview-video";
                previewContainer.appendChild(video);
            } else if (previewType.startsWith("audio/")) {
                const audio = document.createElement("audio");
                audio.src = url;
                audio.controls = true;
                audio.className = "preview-audio";
                previewContainer.appendChild(audio);
            } else if (
                previewType.startsWith("text/") ||
                previewType === "application/json" ||
                previewType === "application/pdf"
            ) {
                const previewFrame = document.createElement("iframe");
                previewFrame.src = url;
                previewFrame.className = "preview-frame";
                previewFrame.onerror = () => {
                    previewContainer.innerHTML =
                        "<p>Preview could not be loaded (possible browser restriction or format issue).</p>";
                };
                previewContainer.appendChild(previewFrame);
            } else {
                previewContainer.innerHTML = `<p>Preview not available for this file type (${previewType}).</p>`;
            }
        } catch (e) {
            console.error("Error creating preview:", e);
            previewContainer.innerHTML = "<p>Error generating preview.</p>";
        }
    }

    function setUIState(isBusy) {
        fileInput.disabled = isBusy;
        formatSelect.disabled =
            isBusy || !currentFile || formatSelect.options.length <= 1;
        convertBtn.disabled = isBusy || !currentFile || !formatSelect.value;
        fileInputWrapper.style.cursor = isBusy ? "not-allowed" : "pointer";
        fileInputWrapper.style.opacity = isBusy ? 0.7 : 1;
    }

    function resetOutputUI() {
        outputMessage.textContent = "";
        downloadContainer.innerHTML = "";
        previewContainer.innerHTML = "";
    }

    function getOutputFileName(originalName, targetFormatOrInternal) {
        const nameParts = originalName.split(".");
        const baseName =
            nameParts.length > 1
                ? nameParts.slice(0, -1).join(".")
                : originalName;
        const extension = fileExtensions[targetFormatOrInternal] || "converted";
        return `${baseName}.${extension}`;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) =>
                reject(new Error("Failed to load image: " + e.message));
            img.src = src;
        });
    }
});
