const player = document.getElementById('player');
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('score');

let score = 0;
let playerPosition = { x: gameContainer.clientWidth / 2, y: gameContainer.clientHeight - 100 };
let poops = [];
let gameInterval;

// Adjust player position based on window resize
function resizeGame() {
    playerPosition.x = gameContainer.clientWidth / 2;
    playerPosition.y = gameContainer.clientHeight - 100;
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
}
window.addEventListener('resize', resizeGame);
resizeGame();

// Generate poop
function createPoop() {
    const poop = document.createElement('div');
    poop.classList.add('poop');
    poop.style.left = `${Math.random() * (gameContainer.clientWidth - 30)}px`;
    poop.style.top = `-30px`;
    gameContainer.appendChild(poop);
    poops.push(poop);
}

// Move poop and check for collision
function movePoops() {
    poops.forEach((poop, index) => {
        const poopTop = parseFloat(poop.style.top);
        if (poopTop > gameContainer.clientHeight) {
            gameContainer.removeChild(poop);
            poops.splice(index, 1);
        } else {
            poop.style.top = `${poopTop + 5}px`;

            // Check for collision
            const poopRect = poop.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            if (
                poopRect.left < playerRect.right &&
                poopRect.right > playerRect.left &&
                poopRect.top < playerRect.bottom &&
                poopRect.bottom > playerRect.top
            ) {
                alert('Game Over!');
                clearInterval(gameInterval);
                resetGame();
            }
        }
    });
}

// Update game
function updateGame() {
    movePoops();
    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
}

// Reset game
function resetGame() {
    score = 0;
    scoreDisplay.textContent = `Score: 0`;
    poops.forEach(poop => gameContainer.removeChild(poop));
    poops = [];
    resizeGame();
    gameInterval = setInterval(updateGame, 100);
}

// Control player movement
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && playerPosition.x > 0) {
        playerPosition.x -= 10;
    }
    if (e.key === 'ArrowRight' && playerPosition.x < gameContainer.clientWidth - 80) {
        playerPosition.x += 10;
    }
    player.style.left = `${playerPosition.x}px`;
});

// Start game
gameInterval = setInterval(updateGame, 100);
setInterval(createPoop, 1000);
