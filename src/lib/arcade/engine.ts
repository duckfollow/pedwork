export const WIDTH = 960;
export const HEIGHT = 600;
export type Stage = "space" | "breakout" | "snake";
export type Phase = "ready" | "playing" | "transition" | "gameover";
export type Point = { x: number; y: number };
type Glyph = Point & { char: string; alive: boolean; baseX: number; hp: number };
type Particle = Point & { vx: number; vy: number; life: number; color: string };
export type ArcadeState = {
  stage: Stage; phase: Phase; score: number; lives: number; round: number; level: number;
  time: number; wait: number; shot: number; hazardClock: number; invincible: number;
  player: Point; pointer: Point; pointerActive: boolean; axis: number;
  glyphs: Glyph[]; bullets: Point[]; hazards: Point[]; particles: Particle[];
  ball: Point & { vx: number; vy: number; docked: number };
  snake: Point[]; direction: Point; queued: Point; snakeClock: number;
  food: Point & { char: string }; eaten: number; obstacles: Point[];
};
export const LEVEL_NAMES: Record<Stage, string[]> = {
  space: ["First contact", "Signal storm", "Armored alphabet"],
  breakout: ["Warm-up bounce", "Narrow escape", "Hard-coded"],
  snake: ["Small bites", "Mind the gaps", "Keep building"],
};
export function levelSettings(game: Pick<ArcadeState, "level" | "round">) {
  const level = game.level;
  return {
    paddleHalf: [76, 62, 50][level - 1],
    ballSpeed: Math.min(520, [330, 390, 450][level - 1] + (game.round - 1) * 15),
    snakeStep: Math.max(0.09, [0.18, 0.15, 0.125][level - 1] - (game.round - 1) * 0.005),
    word: ["build", "building", "keepbuilding"][level - 1],
  };
}
export function makeObstacles(level: number): Point[] {
  if (level === 1) return [];
  const cells: Point[] = [];
  for (const y of [4, 5, 6, 12, 13, 14]) cells.push({ x: 16, y });
  if (level === 3) for (const x of [4, 5, 6, 7, 24, 25, 26, 27]) {
    cells.push({ x, y: 4 }, { x, y: 13 });
  }
  return cells;
}
export function makeGlyphs(stage: Stage, level = 1): Glyph[] {
  const columns = stage === "space" ? 8 : 10;
  const phrases = stage === "space"
    ? ["HELLOWORLDBUILDIT", "LESSFRICTIONMOREBUILDING", "CONSTDEVELOPERBUILDWITHCURIOSITY()"]
    : ["BOUNCEBREAKREPEAT!!", "LESSFRICTIONMOREBUILDING{}();", "CONSTDEVELOPERBUILDWITHCURIOSITYOPEN_SOURCE"];
  const gap = stage === "space" ? 88 : 76;
  return Array.from(phrases[level - 1]).map((char, i) => {
    const x = (WIDTH - (columns - 1) * gap) / 2 + (i % columns) * gap;
    return { char, x, baseX: x, y: 100 + Math.floor(i / columns) * 57, alive: true, hp: level === 3 && i % 3 === 0 ? 2 : 1 };
  });
}
export function createGame(): ArcadeState {
  return {
    stage: "space", phase: "ready", score: 0, lives: 3, round: 1, level: 1,
    time: 0, wait: 0, shot: 0, hazardClock: 0, invincible: 0,
    player: { x: WIDTH / 2, y: 520 }, pointer: { x: WIDTH / 2, y: 520 }, pointerActive: false, axis: 0,
    glyphs: makeGlyphs("space"), bullets: [], hazards: [], particles: [],
    ball: { x: WIDTH / 2, y: 490, vx: 225, vy: -310, docked: 0.8 },
    snake: [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 9 }],
    direction: { x: 1, y: 0 }, queued: { x: 1, y: 0 }, snakeClock: 0,
    food: { x: 16, y: 9, char: "b" }, eaten: 0, obstacles: [],
  };
}
export function turnSnake(game: ArcadeState, direction: Point) {
  if (direction.x === -game.direction.x && direction.y === -game.direction.y) return;
  game.queued = direction;
}
function burst(game: ArcadeState, x: number, y: number, color = "#a3d3b2") {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 150;
    game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.65, color });
  }
}
function resetSnake(game: ArcadeState) {
  game.snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 9 }];
  game.direction = { x: 1, y: 0 }; game.queued = { x: 1, y: 0 }; game.snakeClock = 0;
  placeFood(game);
}
function placeFood(game: ArcadeState) {
  const free: Point[] = [];
  for (let y = 0; y < 18; y++) for (let x = 0; x < 32; x++) {
    if (!game.snake.some((cell) => cell.x === x && cell.y === y) && !game.obstacles.some((cell) => cell.x === x && cell.y === y)) free.push({ x, y });
  }
  const cell = free[Math.floor(Math.random() * free.length)] ?? { x: 16, y: 9 };
  game.food = { ...cell, char: levelSettings(game).word[game.eaten] };
}
export function enterStage(game: ArcadeState, stage: Stage, level = 1) {
  game.level = level; game.axis = 0;
  game.stage = stage; game.phase = "playing"; game.wait = 0;
  game.bullets = []; game.hazards = []; game.shot = 0; game.hazardClock = 0;
  game.invincible = 1.2; game.player = { x: WIDTH / 2, y: 520 };
  game.pointer = { ...game.player }; game.pointerActive = false;
  game.glyphs = makeGlyphs(stage, level);
  game.obstacles = stage === "snake" ? makeObstacles(level) : [];
  game.ball = newBall(game, WIDTH / 2, 0.8);
  game.eaten = 0; resetSnake(game);
}
function newBall(game: ArcadeState, x: number, docked: number) {
  const speed = levelSettings(game).ballSpeed;
  return { x, y: 490, vx: speed * 0.5, vy: -speed * Math.sqrt(0.75), docked };
}
function hitGlyph(game: ArcadeState, glyph: Glyph, points: number) {
  glyph.hp--;
  if (glyph.hp <= 0) { glyph.alive = false; game.score += points; burst(game, glyph.x, glyph.y); }
  else { game.score += 5; burst(game, glyph.x, glyph.y, "#e6a06d"); }
}
function loseLife(game: ArcadeState) {
  if (game.invincible > 0) return;
  game.lives--; game.invincible = 1.5;
  burst(game, game.player.x, game.player.y, "#e6a06d");
  if (game.lives <= 0) { game.phase = "gameover"; return; }
  if (game.stage === "breakout") {
    game.ball = newBall(game, game.player.x, 0.9);
  } else if (game.stage === "snake") resetSnake(game);
}
function complete(game: ArcadeState) { game.phase = "transition"; game.wait = 2.3; game.score += 200 * game.level; }
export function updateGame(game: ArcadeState, elapsed: number) {
  const dt = Math.min(elapsed, 0.033);
  game.time += dt;
  game.particles = game.particles.filter((p) => {
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0;
  });
  if (game.phase === "transition") {
    game.wait -= dt;
    if (game.wait <= 0) {
      if (game.level < 3) enterStage(game, game.stage, game.level + 1);
      else {
        game.lives = Math.min(5, game.lives + 1);
        if (game.stage === "snake") { game.round++; enterStage(game, "space"); }
        else enterStage(game, game.stage === "space" ? "breakout" : "snake");
      }
    }
    return;
  }
  if (game.phase !== "playing") return;
  game.invincible = Math.max(0, game.invincible - dt);
  if (game.stage !== "snake") {
    const goal = game.pointerActive ? game.pointer.x : game.player.x + game.axis * 600 * dt;
    game.player.x += (goal - game.player.x) * (game.pointerActive ? Math.min(1, dt * 20) : 1);
    game.player.x = Math.max(55, Math.min(WIDTH - 55, game.player.x));
    if (game.stage === "space") game.player.y += ((game.pointerActive ? Math.max(330, Math.min(565, game.pointer.y)) : 520) - game.player.y) * Math.min(1, dt * 20);
  }
  if (game.stage === "space") {
    game.shot -= dt;
    if (game.shot <= 0) { game.bullets.push({ x: game.player.x, y: game.player.y - 22 }); game.shot = 0.14; }
    for (const glyph of game.glyphs) glyph.x = glyph.baseX + Math.sin(game.time * (0.55 + game.level * 0.2) + glyph.y) * (12 + game.level * 9);
    game.bullets = game.bullets.filter((bullet) => {
      bullet.y -= 720 * dt;
      const hit = game.glyphs.find((g) => g.alive && Math.abs(g.x - bullet.x) < 25 && Math.abs(g.y - bullet.y) < 23);
      if (hit) { hitGlyph(game, hit, 10); return false; }
      return bullet.y > -20;
    });
    game.hazardClock += dt;
    if (game.hazardClock > Math.max(0.6, 1.9 - game.level * 0.3 - (game.round - 1) * 0.1)) {
      game.hazardClock = 0;
      const alive = game.glyphs.filter((g) => g.alive);
      const source = alive[Math.floor(Math.random() * alive.length)];
      if (source) game.hazards.push({ x: source.x, y: source.y + 25 });
    }
    game.hazards = game.hazards.filter((hazard) => {
      hazard.y += (110 + game.level * 30 + (game.round - 1) * 15) * dt;
      if (Math.abs(hazard.x - game.player.x) < 22 && Math.abs(hazard.y - game.player.y) < 23) { loseLife(game); return false; }
      return hazard.y < HEIGHT + 20;
    });
    if (game.phase === "playing" && game.glyphs.every((g) => !g.alive)) complete(game);
  } else if (game.stage === "breakout") {
    const ball = game.ball;
    const settings = levelSettings(game);
    const catchWidth = settings.paddleHalf + 7;
    if (ball.docked > 0) { ball.docked -= dt; ball.x = game.player.x; ball.y = 490; return; }
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < 10 || ball.x > WIDTH - 10) { ball.x = Math.max(10, Math.min(WIDTH - 10, ball.x)); ball.vx *= -1; }
    if (ball.y < 10) { ball.y = 10; ball.vy = Math.abs(ball.vy); }
    if (ball.vy > 0 && ball.y >= 500 && ball.y <= 520 && Math.abs(ball.x - game.player.x) < catchWidth) {
      const offset = (ball.x - game.player.x) / catchWidth;
      const horizontal = offset * settings.ballSpeed * 0.78;
      // A centered catch must not trap the ball in a perfectly vertical column.
      ball.vx = Math.abs(horizontal) < 85 ? (Math.sign(ball.vx) || 1) * 85 : horizontal;
      ball.vy = -Math.sqrt(settings.ballSpeed ** 2 - ball.vx ** 2); ball.y = 499;
      burst(game, ball.x, 510, "#e6a06d");
    }
    const hit = game.glyphs.find((g) => g.alive && Math.abs(g.x - ball.x) < 31 && Math.abs(g.y - ball.y) < 23);
    if (hit) {
      hitGlyph(game, hit, 15);
      // Separate the ball from an armored block so one impact is only one hit.
      ball.y = hit.y + (ball.vy < 0 ? 24 : -24);
      ball.vy *= -1;
    }
    if (ball.y > HEIGHT + 10) { game.invincible = 0; loseLife(game); }
    if (game.phase === "playing" && game.glyphs.every((g) => !g.alive)) complete(game);
  } else {
    game.snakeClock += dt;
    if (game.snakeClock < levelSettings(game).snakeStep) return;
    game.snakeClock = 0; game.direction = { ...game.queued };
    const head = { x: game.snake[0].x + game.direction.x, y: game.snake[0].y + game.direction.y };
    const eats = head.x === game.food.x && head.y === game.food.y;
    const body = eats ? game.snake : game.snake.slice(0, -1);
    if (head.x < 0 || head.x >= 32 || head.y < 0 || head.y >= 18 || body.some((cell) => cell.x === head.x && cell.y === head.y) || game.obstacles.some((cell) => cell.x === head.x && cell.y === head.y)) {
      // Every collision costs a life; invincibility is only for the shooter.
      game.invincible = 0; loseLife(game); return;
    }
    game.snake.unshift(head);
    if (eats) {
      game.score += 30; game.eaten++; burst(game, head.x * 30 + 15, head.y * 30 + 45);
      if (game.eaten >= levelSettings(game).word.length) complete(game); else placeFood(game);
    } else game.snake.pop();
  }
}
