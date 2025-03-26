document.addEventListener("DOMContentLoaded", () => {
    const wheel = document.getElementById("wheel");
    const segmentTextContainer = document.getElementById(
        "segmentTextContainer"
    );
    const spinButton = document.getElementById("spinButton");
    const resultText = document.getElementById("resultText");
    const segmentInput = document.getElementById("segmentInput");
    const updateWheelButton = document.getElementById("updateWheelButton");
    const wheelContainer = document.getElementById("wheelContainer"); 

    
    const defaultSegments = [
        { text: "Prize", color: "#8ce99a" },
        { text: "Try Again", color: "#ffc9c9" },
        { text: "Bonus Spin", color: "#ffd43b" },
        { text: "Big Win!", color: "#69db7c" },
        { text: "Nothing", color: "#ced4da" },
    ];
    const defaultColorPalette = [
        "#a5d8ff", 
        "#ffec99", 
        "#d0bfff", 
        "#ffc078", 
        "#96f2d7", 
        "#ffc9c9", 
        "#8ce99a", 
        "#e9ecef", 
        "#f8d7da", 
    ];
    const spinDuration = 5000; 
    const minFullSpins = 5; 
    

    let segments = []; 
    let numSegments = 0;
    let segmentAngle = 0;
    let currentRotation = 0;
    let isSpinning = false;

    
    function parseInput() {
        const lines = segmentInput.value
            .split("\n")
            .filter((line) => line.trim() !== "");
        const parsedSegments = [];
        let colorIndex = 0;

        if (lines.length < 2) {
            alert("Please enter at least 2 segments.");
            return null; 
        }

        lines.forEach((line) => {
            const parts = line.split(",");
            const text = parts[0].trim();
            let color = null;

            if (parts.length > 1) {
                const potentialColor = parts[1].trim();
                
                if (
                    /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(
                        potentialColor
                    )
                ) {
                    color = potentialColor;
                }
            }

            
            if (!color) {
                color =
                    defaultColorPalette[
                        colorIndex % defaultColorPalette.length
                    ];
                colorIndex++;
            }

            parsedSegments.push({ text: text, color: color });
        });

        return parsedSegments;
    }

    
    function createWheel() {
        if (segments.length < 2) return; 

        wheel.style.transform = "rotate(0deg)"; 
        currentRotation = 0; 
        segmentTextContainer.innerHTML = ""; 
        const gradientParts = [];

        numSegments = segments.length;
        segmentAngle = 360 / numSegments;

        segments.forEach((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const midAngle = startAngle + segmentAngle / 2;

            
            
            const textWrapper = document.createElement("div");
            textWrapper.classList.add("segment-text-wrapper");
            textWrapper.style.transform = `rotate(${midAngle}deg)`;

            
            const textEl = document.createElement("span"); 
            textEl.classList.add("segment-text");
            textEl.textContent = segment.text;
            
            

            textWrapper.appendChild(textEl);
            segmentTextContainer.appendChild(textWrapper);
            

            
            gradientParts.push(
                `${segment.color} ${startAngle}deg ${endAngle}deg`
            );
        });

        
        wheel.style.background = `conic-gradient(${gradientParts.join(", ")})`;

        
        resultText.textContent = "---";
        spinButton.disabled = false; 
    }

    
    function updateWheelHandler() {
        if (isSpinning) {
            alert("Cannot update wheel while spinning.");
            return;
        }
        const newSegments = parseInput();
        if (newSegments) {
            segments = newSegments; 
            createWheel();
        }
    }

    
    function spinWheel() {
        if (isSpinning || numSegments < 2) return;
        isSpinning = true;
        spinButton.disabled = true;
        resultText.textContent = "...";

        
        segmentAngle = 360 / numSegments;

        
        const randomExtraRotation = Math.random() * 360;
        const fullSpinsRotation = minFullSpins * 360;
        
        const slightOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
        const totalRotation =
            fullSpinsRotation + randomExtraRotation + slightOffset;

        
        currentRotation += totalRotation;
        wheel.style.transform = `rotate(${currentRotation}deg)`;

        
        wheel.addEventListener("transitionend", handleSpinEnd, { once: true });
    }

    function handleSpinEnd() {
        isSpinning = false;
        spinButton.disabled = false;

        
        const finalPhysicalAngle = currentRotation % 360;
        const normalizedAngle = (360 - finalPhysicalAngle) % 360;
        const winningIndex =
            Math.floor((normalizedAngle + 0.1) / segmentAngle) % numSegments;

        if (segments[winningIndex]) {
            
            const winningSegment = segments[winningIndex];
            resultText.textContent = winningSegment.text;
        } else {
            console.error(
                "Could not determine winning segment index:",
                winningIndex
            );
            resultText.textContent = "Error";
        }
    }

    
    spinButton.addEventListener("click", spinWheel);
    updateWheelButton.addEventListener("click", updateWheelHandler);

    
    function initialize() {
        
        segmentInput.value = defaultSegments
            .map((s) => `${s.text}, ${s.color}`)
            .join("\n");
        
        segments = parseInput();
        if (!segments) {
            
            segments = defaultSegments;
        }
        createWheel();
    }

    initialize();

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    if (darkModeToggle) {
        const observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class"
                ) {
                    
                    
                    
                    
                    if (!isSpinning) {
                        
                        createWheel();
                    }
                    break;
                }
            }
        });
        observer.observe(document.body, { attributes: true });
    }
});
