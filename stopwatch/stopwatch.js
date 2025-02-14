document.addEventListener("DOMContentLoaded", function () {
    

    let swInterval = null;
    let targetTime = 0;
    let remainingTime = 0;

    const swDisplay = document.getElementById("swDisplay");
    const swMinutes = document.getElementById("swMinutes");
    const swSeconds = document.getElementById("swSeconds");
    const swStart = document.getElementById("swStart");
    const swPause = document.getElementById("swPause");
    const swReset = document.getElementById("swReset");

    const beepSound = new Audio("beep.mp3");

    function formatStopwatch(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return `
      ${String(minutes).padStart(2, "0")}<small>m</small> 
      ${String(seconds).padStart(2, "0")}<small>s</small> 
      ${String(milliseconds).padStart(3, "0")}<small>ms</small>
    `;
    }

    function updateSwDisplay() {
        swDisplay.innerHTML = formatStopwatch(remainingTime);
    }

    function startStopwatch() {
        if (swInterval !== null) return;
        const mins = parseInt(swMinutes.value, 10) || 0;
        const secs = parseInt(swSeconds.value, 10) || 0;
        if (remainingTime === 0) {
            remainingTime = mins * 60000 + secs * 1000;
        }
        targetTime = Date.now() + remainingTime;
        swInterval = setInterval(() => {
            remainingTime = Math.max(targetTime - Date.now(), 0);
            updateSwDisplay();
            if (remainingTime === 0) {
                clearInterval(swInterval);
                swInterval = null;
                beepSound.play();
            }
        }, 50);
    }

    function pauseStopwatch() {
        if (swInterval !== null) {
            clearInterval(swInterval);
            swInterval = null;
        }
    }

    function resetStopwatch() {
        pauseStopwatch();
        remainingTime = 0;
        updateSwDisplay();
    }

    swStart.addEventListener("click", startStopwatch);
    swPause.addEventListener("click", pauseStopwatch);
    swReset.addEventListener("click", resetStopwatch);

    updateSwDisplay();
});
