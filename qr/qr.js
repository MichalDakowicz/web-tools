document.getElementById("qrGenerate").addEventListener("click", () => {
    const qrCodeContainer = document.getElementById("qrCode");
    qrCodeContainer.innerHTML = "";
    const text = document.getElementById("qrInput").value;
    if (!text) return;
    new QRCode(qrCodeContainer, {
        text: text,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
    });
});

document.getElementById("downloadQRCode").addEventListener("click", () => {
    const canvas = document.getElementById("qrCode").querySelector("canvas");
    if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "qrcode.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
