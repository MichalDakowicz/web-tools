const cards = document.querySelectorAll('.card');

function setEqualHeight() {
    let maxHeight = 0;

    cards.forEach(card => {
        const cardHeight = card.offsetHeight;
        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });

    cards.forEach(card => {
        card.style.height = `${maxHeight}px`;
    });
}

window.addEventListener('load', setEqualHeight);
window.addEventListener('resize', setEqualHeight);