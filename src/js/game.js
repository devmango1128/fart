window.onload = function() {
    const gameContainer = document.getElementById('gameContainer');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const bestScoreDisplay = document.getElementById('bestScore');
    const comboDisplay = document.getElementById('combo');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const finalScoreEl = document.getElementById('finalScore');
    const finalBestEl = document.getElementById('finalBest');
    const touchLeft = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');

    const PLAYER_W = 30;
    const PLAYER_H = 30;

    let selectedChar = '🏃';
    let playerX, poops, items, score, lives, level, combo;
    let gameRunning = false;
    let hasShield = false;
    let spawnTimer = 0;
    let itemTimer = 0;
    let animationId = null;
    let moveLeft = false;
    let moveRight = false;
    let lastTime = 0;
    let spawnInterval = 900;
    let fallSpeed = 3;

    // ===== Character Select =====
    const charOptions = document.querySelectorAll('.char-option');
    charOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            charOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedChar = opt.dataset.char;
        });
    });

    // Best score
    let bestScore = parseInt(localStorage.getItem('fartlab_best') || '0');
    if (bestScore > 0) {
        bestScoreDisplay.textContent = `BEST ${bestScore}`;
    }

    playerX = gameContainer.clientWidth / 2 - PLAYER_W / 2;
    player.style.left = `${playerX}px`;
    player.style.top = `${gameContainer.clientHeight - PLAYER_H - 40}px`;

    // ===== Start =====
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    function startGame() {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        resetGame();
        player.textContent = selectedChar;
        gameRunning = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
    }

    // ===== Reset =====
    function resetGame() {
        document.querySelectorAll('.poop, .item, .float-score, .hit-flash').forEach(el => el.remove());
        poops = [];
        items = [];
        score = 0;
        lives = 3;
        level = 1;
        combo = 0;
        hasShield = false;
        spawnTimer = 0;
        itemTimer = 0;
        spawnInterval = 900;
        fallSpeed = 3;
        playerX = gameContainer.clientWidth / 2 - PLAYER_W / 2;
        player.style.left = `${playerX}px`;
        player.classList.remove('shield', 'hit');
        scoreDisplay.textContent = '0';
        livesDisplay.textContent = '❤️❤️❤️';
        levelDisplay.textContent = 'Lv.1';
    }

    // ===== Spawn Poop =====
    function spawnPoop() {
        const poop = document.createElement('div');
        poop.classList.add('poop');

        const isBig = level >= 3 && Math.random() < 0.15;
        if (isBig) {
            poop.classList.add('big');
            poop.dataset.size = '35';
        } else {
            poop.dataset.size = '25';
        }
        poop.textContent = '💩';

        const size = parseInt(poop.dataset.size);
        poop.style.left = `${Math.random() * (gameContainer.clientWidth - size)}px`;
        poop.style.top = '-40px';
        poop.dataset.speed = String(fallSpeed + Math.random() * 1.5);
        gameContainer.appendChild(poop);
        poops.push(poop);
    }

    // ===== Spawn Item =====
    function spawnItem() {
        const item = document.createElement('div');
        item.classList.add('item');

        if (Math.random() < 0.5) {
            item.textContent = '⭐';
            item.dataset.type = 'star';
        } else {
            item.textContent = '🛡️';
            item.dataset.type = 'shield';
        }

        item.style.left = `${Math.random() * (gameContainer.clientWidth - 25)}px`;
        item.style.top = '-40px';
        item.dataset.speed = String(fallSpeed * 0.8);
        gameContainer.appendChild(item);
        items.push(item);
    }

    // ===== Update Level =====
    function updateLevel() {
        const newLevel = Math.floor(score / 10) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Lv.${level}`;
            fallSpeed = Math.min(6, 3 + (level - 1) * 0.3);
            spawnInterval = Math.max(500, 900 - (level - 1) * 40);
        }
    }

    // ===== Show Combo =====
    function showCombo() {
        if (combo >= 5 && combo % 5 === 0) {
            comboDisplay.textContent = `${combo} COMBO!`;
            comboDisplay.classList.remove('show');
            void comboDisplay.offsetWidth;
            comboDisplay.classList.add('show');
        }
    }

    // ===== Float Score =====
    function showFloatScore(x, y, text) {
        const el = document.createElement('div');
        el.classList.add('float-score');
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        gameContainer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    // ===== Hit Effects =====
    function showHitFlash() {
        const flash = document.createElement('div');
        flash.classList.add('hit-flash');
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    function screenShake() {
        gameContainer.classList.remove('shake');
        void gameContainer.offsetWidth;
        gameContainer.classList.add('shake');
        setTimeout(() => gameContainer.classList.remove('shake'), 400);
    }

    function playerHitAnim() {
        player.classList.remove('hit');
        void player.offsetWidth;
        player.classList.add('hit');
        setTimeout(() => player.classList.remove('hit'), 500);
    }

    function updateLives() {
        const hearts = [];
        for (let i = 0; i < lives; i++) hearts.push('❤️');
        livesDisplay.textContent = hearts.join('');
        if (lives === 0) livesDisplay.textContent = '💔';
    }

    // ===== Collision Check =====
    function checkCollision(el, margin) {
        const pr = player.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        return !(
            pr.top + margin > er.bottom ||
            pr.bottom - margin < er.top ||
            pr.left + margin > er.right ||
            pr.right - margin < er.left
        );
    }

    // ===== Move Player =====
    function movePlayer(dt) {
        const speed = 350 * dt;
        if (moveLeft && playerX > 0) {
            playerX = Math.max(0, playerX - speed);
        }
        if (moveRight && playerX < gameContainer.clientWidth - PLAYER_W) {
            playerX = Math.min(gameContainer.clientWidth - PLAYER_W, playerX + speed);
        }
        player.style.left = `${playerX}px`;
    }

    // ===== Game Loop =====
    function gameLoop(timestamp) {
        if (!gameRunning) return;

        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        // Spawn timers
        spawnTimer += dt * 1000;
        itemTimer += dt * 1000;

        if (spawnTimer >= spawnInterval) {
            spawnPoop();
            if (level >= 5 && Math.random() < 0.3) spawnPoop();
            spawnTimer = 0;
        }

        // Items spawn every 2s
        if (itemTimer >= 2000) {
            spawnItem();
            itemTimer = 0;
        }

        movePlayer(dt);

        // Move & check poops
        for (let i = poops.length - 1; i >= 0; i--) {
            const poop = poops[i];
            let y = parseFloat(poop.style.top);
            y += parseFloat(poop.dataset.speed) * dt * 60;
            poop.style.top = `${y}px`;

            if (y > gameContainer.clientHeight + 40) {
                poop.remove();
                poops.splice(i, 1);
                score++;
                combo++;
                scoreDisplay.textContent = score;
                updateLevel();
                showCombo();
            } else if (checkCollision(poop, 10)) {
                poop.remove();
                poops.splice(i, 1);

                if (hasShield) {
                    hasShield = false;
                    player.classList.remove('shield');
                    showFloatScore(playerX + 20, gameContainer.clientHeight - PLAYER_H - 80, '🛡️ 방어!');
                } else {
                    lives--;
                    combo = 0;
                    updateLives();
                    showHitFlash();
                    screenShake();
                    playerHitAnim();
                    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                }
            }
        }

        // Move & check items
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            let y = parseFloat(item.style.top);
            y += parseFloat(item.dataset.speed) * dt * 60;
            item.style.top = `${y}px`;

            if (y > gameContainer.clientHeight + 40) {
                item.remove();
                items.splice(i, 1);
            } else if (checkCollision(item, 5)) {
                const type = item.dataset.type;
                const ix = parseFloat(item.style.left);
                const iy = parseFloat(item.style.top);
                item.remove();
                items.splice(i, 1);

                if (type === 'star') {
                    score += 5;
                    scoreDisplay.textContent = score;
                    showFloatScore(ix, iy, '+5');
                    updateLevel();
                } else if (type === 'shield') {
                    hasShield = true;
                    player.classList.add('shield');
                    showFloatScore(ix, iy, '🛡️');
                }
            }
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    // ===== Game Over =====
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);

        finalScoreEl.textContent = score;

        const isNewRecord = score > bestScore;
        if (isNewRecord) {
            bestScore = score;
            localStorage.setItem('fartlab_best', String(bestScore));
        }

        finalBestEl.textContent = isNewRecord ? 'NEW RECORD!' : `BEST ${bestScore}`;
        finalBestEl.className = 'final-best' + (isNewRecord ? ' new-record' : '');
        bestScoreDisplay.textContent = `BEST ${bestScore}`;

        gameOverScreen.classList.remove('hidden');
    }

    // ===== Keyboard =====
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowLeft') moveLeft = true;
        if (e.key === 'ArrowRight') moveRight = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') moveLeft = false;
        if (e.key === 'ArrowRight') moveRight = false;
    });

    // ===== Touch =====
    touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); moveLeft = true; });
    touchLeft.addEventListener('touchend', (e) => { e.preventDefault(); moveLeft = false; });
    touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); moveRight = true; });
    touchRight.addEventListener('touchend', (e) => { e.preventDefault(); moveRight = false; });

    touchLeft.addEventListener('mousedown', () => { moveLeft = true; });
    touchLeft.addEventListener('mouseup', () => { moveLeft = false; });
    touchLeft.addEventListener('mouseleave', () => { moveLeft = false; });
    touchRight.addEventListener('mousedown', () => { moveRight = true; });
    touchRight.addEventListener('mouseup', () => { moveRight = false; });
    touchRight.addEventListener('mouseleave', () => { moveRight = false; });
}
