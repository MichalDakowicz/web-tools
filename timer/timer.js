document.addEventListener("DOMContentLoaded", function () {
    let timerInterval = null;
    let elapsedTime = 0;
    let startTime = 0;

    const timeDisplay = document.getElementById("timeDisplay");
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");

    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return `
            ${String(hours).padStart(2, "0")}<small>h</small> 
            ${String(minutes).padStart(2, "0")}<small>min</small> 
            ${String(seconds).padStart(2, "0")}<small>s</small> 
            ${String(milliseconds).padStart(3, "0")}<small>ms</small>
        `;
    }

    function updateDisplay() {
        timeDisplay.innerHTML = formatTime(elapsedTime);
    }

    function startTimer() {
        if (timerInterval !== null) return;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(function () {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 50);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function resetTimer() {
        pauseTimer();
        elapsedTime = 0;
        updateDisplay();
    }

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    updateDisplay();
});
