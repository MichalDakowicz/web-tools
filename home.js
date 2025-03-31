const cards = document.querySelectorAll(".card");

function setEqualHeight() {
    let maxHeight = 0;

    cards.forEach((card) => {
        const cardHeight = card.offsetHeight;
        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });

    cards.forEach((card) => {
        card.style.height = `${maxHeight}px`;
    });
}
setEqualHeight();
setTimeout(() => {
    setEqualHeight();
}, 1000);
