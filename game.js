/**
 * SUPER HAWAII - The Game
 * Mario-style Parody Infinite Runner
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let score = 0;
let frameCount = 0;

// Entities
const player = {
    x: 50,
    y: 0,
    width: 0, // Set after sprite load
    height: 0,
    velocityY: 0,
    isJumping: false
};

let obstacles = [];
let particles = [];

// Physics
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9.5;
const GROUND_HEIGHT = 40;
const PIXEL_SIZE = 4; // Big chunky pixels
const GAME_SPEED_START = 7;
let gameSpeed = GAME_SPEED_START;

// --- PIXEL ART ASSETS (0 = Transparent) ---

// Player: "Cute Boy" (Red Cap, Blue Overallsish, Cute Eyes)
// 1=Skin(#ffcc99), 2=Red(#ee2200), 3=Blue(#0044ee), 4=Eye(#000000), 5=Hair(#553311), 6=Yellow(#ffcc00), 7=White(#fff)
const playerSprite = [
    [0, 0, 2, 2, 2, 2, 2, 0], // Red Cap
    [0, 2, 2, 2, 2, 2, 2, 2],
    [5, 5, 1, 1, 1, 1, 5, 0], // Hair/Skin
    [5, 1, 1, 4, 1, 1, 1, 0], // Face (Eye)
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 2, 2, 3, 3, 2, 2, 0], // Red Shirt / Blue
    [0, 2, 2, 3, 3, 2, 2, 0],
    [0, 3, 3, 3, 3, 3, 3, 0], // Pants
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 5, 5, 0, 0, 5, 5, 0]  // Shoes
];

// Obstacle: "Pixel Pineapple" (Cute)
// 1=Yellow(#ffcc00), 2=Green(#00aa00), 3=Brown(#663300), 4=Black(#000)
const pineappleSprite = [
    [0, 0, 2, 2, 0, 2, 0, 0], // Leaves
    [0, 2, 2, 2, 2, 2, 0, 0],
    [0, 0, 2, 2, 2, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0], // Body
    [1, 3, 1, 3, 1, 1, 1, 0],
    [1, 1, 4, 1, 4, 1, 1, 0], // Eyes!
    [1, 3, 1, 1, 1, 3, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0]
];

const COLORS = {
    player: { 1: '#ffcc99', 2: '#ff3333', 3: '#3366ff', 4: '#000', 5: '#663300', 6: '#ffcc00', 7: '#fff' },
    pineapple: { 1: '#ffcc00', 2: '#00aa00', 3: '#cc6600', 4: '#000' }
};

// --- INITIALIZATION ---

function resizeCanvas() {
    const parent = canvas.parentNode;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 320;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

player.width = playerSprite[0].length * PIXEL_SIZE;
player.height = playerSprite.length * PIXEL_SIZE;

// --- DRAWING FUNCTIONS ---

function drawPixelSprite(ctx, sprite, mapColor, x, y) {
    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            const pixel = sprite[r][c];
            if (pixel !== 0) {
                ctx.fillStyle = mapColor[pixel];
                ctx.fillRect(Math.floor(x + c * PIXEL_SIZE), Math.floor(y + r * PIXEL_SIZE), PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }
}

// Draw Diamond Head (Background Mountain)
function drawBackground(offset) {
    // Sky
    ctx.fillStyle = '#5c94fc'; // Classic Mario Sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds (Very slow parallax)
    ctx.fillStyle = '#ffffff';
    let cloudX = (frameCount * 0.2) % (canvas.width + 100);
    // Draw cloud 1
    ctx.fillRect(canvas.width - cloudX, 50, 60, 20);
    ctx.fillRect(canvas.width - cloudX + 15, 40, 30, 20);
    // Draw cloud 2
    ctx.fillRect(canvas.width - cloudX - 300, 80, 80, 25);

    // Diamond Head (Slow parallax)
    // A simple polygon shape
    const mountainX = (frameCount * 0.1) % (canvas.width + 400);
    const mx = canvas.width - mountainX + 100;

    ctx.fillStyle = '#66cc66'; // Green mountain
    ctx.beginPath();
    ctx.moveTo(mx, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(mx + 150, canvas.height - GROUND_HEIGHT - 120); // Peak 1
    ctx.lineTo(mx + 300, canvas.height - GROUND_HEIGHT - 80);  // Ridge
    ctx.lineTo(mx + 600, canvas.height - GROUND_HEIGHT);
    ctx.fill();

    // Honolulu City (Mid-background)
    // Scrolling slightly faster than mountain but slower than foreground
    const citySpeed = gameSpeed * 0.2;
    const cityOffset = (frameCount * citySpeed) % 200;

    ctx.fillStyle = '#e0e0e0'; // Light gray buildings

    // Draw sparse buildings (occasional appearance)
    const buildingWidth = 60;
    const totalBuildings = Math.ceil(canvas.width / buildingWidth) + 2;

    for (let i = 0; i < totalBuildings; i++) {
        let offset = (frameCount * citySpeed) % (buildingWidth * totalBuildings);
        let x = (i * buildingWidth) - offset;

        if (x < -buildingWidth) {
            x += (totalBuildings * buildingWidth);
        }

        // Calculate an index for randomness/sparseness
        let absoluteIndex = Math.floor((frameCount * citySpeed + x) / buildingWidth);

        // Draw clusters of buildings (e.g. A city appears every "long distance")
        // "modulo 40 < 8" means: Draw 8 buildings, then gap of 32.
        if ((absoluteIndex % 40) < 8) {
            // Add some randomness relative to the cluster
            let h = 40 + ((absoluteIndex * 7) % 5) * 20; // Varied heights

            ctx.fillRect(x, canvas.height - GROUND_HEIGHT - h, 40, h);

            // Windows
            ctx.fillStyle = '#87CEEB';
            if (absoluteIndex % 2 === 0) {
                ctx.fillRect(x + 5, canvas.height - GROUND_HEIGHT - h + 5, 10, 10);
                ctx.fillRect(x + 25, canvas.height - GROUND_HEIGHT - h + 5, 10, 10);
            }
            ctx.fillStyle = '#e0e0e0';
        }
    }

    // Palm Trees (Midground) (Slower than gameSpeed)
    // Just simple lines and circles to represent trees passing by
    const treeSpeed = gameSpeed * 0.5;
    const treeOffset = (frameCount * treeSpeed) % 400;

    ctx.fillStyle = '#8B4513'; // Trunk
    for (let i = 0; i < canvas.width / 200 + 2; i++) {
        let tx = (i * 200) - treeOffset;
        if (tx < -50) tx += canvas.width + 50;

        ctx.fillRect(tx, canvas.height - GROUND_HEIGHT - 60, 8, 60); // Trunk

        // Leaves
        ctx.fillStyle = '#00aa00';
        ctx.beginPath();
        ctx.arc(tx + 4, canvas.height - GROUND_HEIGHT - 60, 25, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#8B4513'; // Reset for next trunk
    }
}

function drawGround() {
    ctx.fillStyle = '#fcefa1'; // Sand Color
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

    // Sand details (dots) scrolling
    ctx.fillStyle = '#e6c86e';
    const dotOffset = (frameCount * gameSpeed) % 20;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i - dotOffset, canvas.height - GROUND_HEIGHT + 10, 4, 4);
    }

    // Top border of ground
    ctx.fillStyle = '#dcb95b';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 4);
}

// --- LOGIC ---

function initGame() {
    characterY = canvas.height - GROUND_HEIGHT - player.height;
    player.y = characterY;
    player.velocityY = 0;
    player.isJumping = false;

    score = 0;
    obstacles = [];
    gameSpeed = GAME_SPEED_START;
    gameRunning = true;
    frameCount = 0;

    spawnObstacle();
    loop();
}

function spawnObstacle() {
    // Increased frequency!
    const minTime = 800;
    const maxTime = 1800;
    const randomTime = Math.random() * (maxTime - minTime) + minTime;

    setTimeout(() => {
        if (!gameRunning) return;

        obstacles.push({
            x: canvas.width,
            y: canvas.height - GROUND_HEIGHT - (pineappleSprite.length * PIXEL_SIZE),
            width: pineappleSprite[0].length * PIXEL_SIZE,
            height: pineappleSprite.length * PIXEL_SIZE,
            passed: false
        });

        spawnObstacle();
    }, randomTime);
}

function update() {
    if (!gameRunning) return;

    frameCount++;

    // Player Physics
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    const floorY = canvas.height - GROUND_HEIGHT - player.height;
    if (player.y >= floorY) {
        player.y = floorY;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Move Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        // Collision
        // Hitbox padding (make it forgiving)
        const pad = 4;
        if (
            player.x + pad < obs.x + obs.width - pad &&
            player.x + player.width - pad > obs.x + pad &&
            player.y + pad < obs.y + obs.height - pad &&
            player.y + player.height - pad > obs.y + pad
        ) {
            gameOver();
        }

        // Score
        if (!obs.passed && player.x > obs.x + obs.width) {
            score++;
            obs.passed = true;
            if (score % 5 === 0) gameSpeed += 0.4;
        }
    }
}

function draw() {
    // Parallax Background
    drawBackground();
    drawGround();

    // Player
    // Bobbing animation for running
    let bounceY = 0;
    if (!player.isJumping) {
        bounceY = Math.sin(frameCount * 0.5) * 2;
    }
    drawPixelSprite(ctx, playerSprite, COLORS.player, player.x, player.y + bounceY);

    // Obstacles
    obstacles.forEach(obs => {
        drawPixelSprite(ctx, pineappleSprite, COLORS.pineapple, obs.x, obs.y);
    });

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = "20px 'Press Start 2P', cursive"; // Use new font
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${score}`, 20, 40);

    if (!gameRunning && frameCount > 0) {
        // Game Over
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = "30px 'Press Start 2P', cursive";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = "16px 'Press Start 2P', cursive";
        ctx.fillText("TAP TO RETRY", canvas.width / 2, canvas.height / 2 + 30);
    }
    else if (!gameRunning && frameCount === 0) {
        // Start Screen
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.font = "16px 'Press Start 2P', cursive";

        // Blink effect
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillText("PRESS START / TAP", canvas.width / 2, canvas.height / 2);
        }
        requestAnimationFrame(draw); // Keep drawing for blink effect
    }
}

function loop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(loop);
    }
}

function jump() {
    if (!gameRunning && frameCount > 0) {
        // Retry
        initGame();
        return;
    }
    if (!gameRunning && frameCount === 0) {
        // Start
        initGame();
        return;
    }

    if (!player.isJumping) {
        player.velocityY = JUMP_STRENGTH;
        player.isJumping = true;
    }
}

function gameOver() {
    gameRunning = false;
    draw();
}

// Input
canvas.addEventListener('mousedown', (e) => { e.preventDefault(); jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});

// Initial
draw(); // Start screen
