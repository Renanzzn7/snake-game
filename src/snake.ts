
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const scoreElement = document.getElementById('score')!;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

type Point = { x: number; y: number };

class Snake {
  body: Point[];
  direction: Point;
  nextDirection: Point;

  constructor() {
    this.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
  }

  setDirection(dir: Point) {
    if (dir.x === -this.direction.x && dir.y === -this.direction.y) return;
    this.nextDirection = dir;
  }

  move() {
    this.direction = this.nextDirection;
    const head = this.body[0];
    const newHead = {
      x: (head.x + this.direction.x + tileCount) % tileCount,
      y: (head.y + this.direction.y + tileCount) % tileCount,
    };

    if (this.body.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      throw new Error('Game Over');
    }

    this.body.unshift(newHead);
    this.body.pop();
  }

  grow() {
    const tail = this.body[this.body.length - 1];
    this.body.push({ x: tail.x, y: tail.y });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0f9d58';
    ctx.fillRect(this.body[0].x * gridSize, this.body[0].y * gridSize, gridSize, gridSize);

    ctx.fillStyle = '#34a853';
    for (let i = 1; i < this.body.length; i++) {
      const segment = this.body[i];
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  }
}

class Food {
  position: Point;

  constructor(snakeBody: Point[]) {
    this.position = this.randomPosition(snakeBody);
  }

  randomPosition(snakeBody: Point[]): Point {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (snakeBody.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ea4335';
    ctx.beginPath();
    const radius = gridSize / 2.5;
    ctx.arc(
      this.position.x * gridSize + gridSize / 2,
      this.position.y * gridSize + gridSize / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

let snake = new Snake();
let food = new Food(snake.body);
let score = 0;
let gameOver = false;

function resetGame() {
  snake = new Snake();
  food = new Food(snake.body);
  score = 0;
  gameOver = false;
  scoreElement.textContent = `Score: ${score}`;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ea4335';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText('Pressione R para reiniciar', canvas.width / 2, canvas.height / 2 + 20);
    return;
  }

  setTimeout(() => {
    try {
      snake.move();
      if (snake.body[0].x === food.position.x && snake.body[0].y === food.position.y) {
        snake.grow();
        score++;
        scoreElement.textContent = `Score: ${score}`;
        food = new Food(snake.body);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      food.draw(ctx);
      snake.draw(ctx);
      requestAnimationFrame(gameLoop);
    } catch (e) {
      gameOver = true;
      gameLoop();
    }
  }, 100);
}

window.addEventListener('keydown', (e) => {
  if (gameOver && (e.key === 'r' || e.key === 'R')) {
    resetGame();
    return;
  }
  switch (e.key) {
    case 'ArrowUp': snake.setDirection({ x: 0, y: -1 }); break;
    case 'ArrowDown': snake.setDirection({ x: 0, y: 1 }); break;
    case 'ArrowLeft': snake.setDirection({ x: -1, y: 0 }); break;
    case 'ArrowRight': snake.setDirection({ x: 1, y: 0 }); break;
  }
});

resetGame();
