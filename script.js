const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score = 0;
let lives = 3;
let gameEnded = false;

const player = {
  width: 60,
  height: 25,
  x: canvas.width / 2 - 30,
  y: canvas.height - 60,
  speed: 7,
};

const keys = {};
const bullets = [];
const enemyBullets = [];
const particles = [];

let enemyDirection = 1;

const enemies = [];

for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 10; col++) {
    enemies.push({
      x: 80 + col * 70,
      y: 70 + row * 60,
      width: 40,
      height: 30,
      alive: true,
    });
  }
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.code === "Space") {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 12,
      speed: 8,
    });
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function explosion(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      life: 30,
      color,
    });
  }
}

function update() {
  if (gameEnded) return;

  if (keys["ArrowLeft"]) player.x -= player.speed;

  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  bullets.forEach((b, index) => {
    b.y -= b.speed;

    if (b.y < 0) bullets.splice(index, 1);
  });

  let hitEdge = false;

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;

    enemy.x += enemyDirection;

    if (enemy.x < 10 || enemy.x + enemy.width > canvas.width - 10)
      hitEdge = true;

    if (Math.random() < 0.0007) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 10,
        speed: 4,
      });
    }
  });

  if (hitEdge) {
    enemyDirection *= -1;

    enemies.forEach((enemy) => {
      enemy.y += 20;
    });
  }

  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemy.alive = false;

        score += 100;

        explosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          "#00ffff",
        );

        bullets.splice(bulletIndex, 1);

        document.getElementById("score").textContent = "Pontos: " + score;
      }
    });
  });

  enemyBullets.forEach((b, index) => {
    b.y += b.speed;

    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      lives--;

      explosion(player.x + player.width / 2, player.y, "#ff3b6b");

      document.getElementById("lives").textContent = "Vidas: " + lives;

      enemyBullets.splice(index, 1);

      if (lives <= 0) {
        gameOver();
      }
    }

    if (b.y > canvas.height) enemyBullets.splice(index, 1);
  });

  particles.forEach((p, index) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;

    if (p.life <= 0) particles.splice(index, 1);
  });

  const remaining = enemies.filter((e) => e.alive).length;

  if (remaining === 0) {
    score += 1000;

    document.getElementById("score").textContent = "Pontos: " + score;

    gameOver(true);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.moveTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  ctx.fillStyle = "#ff3b6b";
  ctx.shadowColor = "#ff3b6b";

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;

    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "#ffe600";
  ctx.shadowColor = "#ffe600";

  enemyBullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver(victory = false) {
  gameEnded = true;

  const panel = document.getElementById("gameOver");
  panel.style.display = "flex";

  document.querySelector(".game-over h1").textContent = victory
    ? "VOCÊ VENCEU!"
    : "GAME OVER";

  document.getElementById("finalScore").textContent =
    "Pontuação final: " + score;
}

function restart() {
  location.reload();
}

gameLoop();
