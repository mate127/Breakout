// Definiranje canvas elementa i konteksta crtanja
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Definiranje dimenzija canvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Konstante igre
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 10;
const BRICK_WIDTH = canvas.width / BRICK_COLUMNS - 5;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

// Palica
let paddle = {
    x: canvas.width / 2 - 150 / 2,
    y: canvas.height - 50,
    width: 150,
    height: 20,
    dx: 0,
    speed: 8
};

// Loptica
let ball = {
    x: canvas.width / 2,
    y: paddle.y - 10,
    radius: 10,
    speed: 5,
    dx: 5 * (Math.random() > 0.5 ? 1 : -1),
    dy: -5
};

// Cigle
let bricks = [];
for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
}

// Varijable rezultata
let score = 0;
let bestScore = localStorage.getItem("breakoutBestScore") || 0;

// Detektiranje sudara
function detectCollision() {
    // Sudar loptice i zida
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
    if (ball.y - ball.radius < 0) ball.dy *= -1;

    // Sudar loptice i palice
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y
    )
    {
        ball.dy *= -1;
        ball.y = paddle.y - ball.radius;
    }

    // Sudar loptice i cigle
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            let brick = bricks[r][c];
            if (brick.status) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + BRICK_WIDTH &&
                    ball.y > brick.y &&
                    ball.y < brick.y + BRICK_HEIGHT
                )
                // Postavljanje statusa na 0 jer je cigla pogođena i ažuriranje rezultata 
                {
                    ball.dy *= -1;
                    brick.status = 0;
                    score++;
                }
            }
        }
    }
}

// Crtanje elemenata
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Palica
    ctx.fillStyle = "red";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Loptica
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Cigle
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            // Nacrtat će se samo one cigle kojima je status 1, tj. one koje nisu još pogođene
            if (bricks[r][c].status) {
                let brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING / 2;
                let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING / 2;
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;
                ctx.fillStyle = "blue";
                ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            }
        }
    }

    // Rezultat
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
    ctx.fillText(`Best: ${bestScore}`, canvas.width - 150, 60);
}

// Ažuriranje
function update() {
    paddle.x += paddle.dx;

    // Provjera je li palica unutar zidova
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // Kretanje loptice
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Provjera sudara
    detectCollision();

    // Provjera kraja igre ako loptica padne ispod palice
    if (ball.y - ball.radius > canvas.height) {
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("breakoutBestScore", bestScore);
        }
        alert("GAME OVER");
        document.location.reload();
    }

    // Pobjeda
    if (score === BRICK_ROWS * BRICK_COLUMNS) {
        alert("YOU WIN!");
        document.location.reload();
    }
}

// Upravljanje tipkama
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;
    if (e.key === "ArrowRight") paddle.dx = paddle.speed;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") paddle.dx = 0;
});

// Glavna petlja igre
function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

// Početak igre
gameLoop();
