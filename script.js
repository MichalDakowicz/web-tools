const darkModeToggle = document.querySelector("#dark-mode-toggle");
const body = document.body;

function toggleDarkMode(event) {
    if (event.target.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        body.classList.remove("dark-mode");
        localStorage.removeItem("darkMode");
    }
}

const darkMode = localStorage.getItem("darkMode");
if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", toggleDarkMode);

const homeButton = document.createElement("button");

function createHomeButton() {
    
    homeButton.innerHTML = `<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http:
    homeButton.addEventListener("click", goHome);
    document.body.appendChild(homeButton);
    homeButton.classList.add("home-button");
}

function goHome() {
    window.location.href = "../index.html";
}

createHomeButton();
