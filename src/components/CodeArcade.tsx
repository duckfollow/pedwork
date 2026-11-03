"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, X } from "lucide-react";
import { createGame, enterStage, levelSettings, LEVEL_NAMES, HEIGHT, turnSnake, updateGame, WIDTH, type ArcadeState, type Point, type Stage } from "@/lib/arcade/engine";
import styles from "@/app/portfolio.module.css";

const stages: Record<Stage, { name: string; number: string; hint: string; next: string }> = {
  space: { name: "SPACE INVADERS", number: "01", hint: "Move your mouse or drag to fly · Auto-fire is on · A / D or ← / → also work", next: "Your ship becomes a paddle. Keep the ball alive." },
  breakout: { name: "LETTER BREAKER", number: "02", hint: "Move your mouse or drag to steer the paddle · A / D or ← / → also work", next: "The paddle becomes a snake. Eat the letters. Grow the code." },
  snake: { name: "CODE SNAKE", number: "03", hint: "Arrow keys / WASD or the direction buttons · Collect all 8 letters of building", next: "Loop complete. Back to space for another round." },
};

function draw(ctx: CanvasRenderingContext2D, game: ArcadeState, reduced: boolean) {
  ctx.fillStyle = "#0b1116"; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 75; i++) {
    ctx.fillStyle = i % 5 ? "#405466" : "#92b5cb";
    const y = ((i * 97 + (reduced ? 0 : game.time * (8 + i % 15))) % HEIGHT);
    ctx.fillRect((i * 137 + 23) % WIDTH, y, i % 5 ? 1 : 2, i % 5 ? 1 : 2);
  }
  ctx.strokeStyle = "#192630"; ctx.lineWidth = 1;
  const settings = levelSettings(game);
  if (game.stage === "snake") {
    for (let x = 0; x <= WIDTH; x += 30) { ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 570); ctx.stroke(); }
    for (let y = 30; y <= 570; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    ctx.fillStyle = "#66516f";
    for (const cell of game.obstacles) {
      ctx.fillRect(cell.x * 30 + 2, cell.y * 30 + 32, 26, 26);
      ctx.fillStyle = "#c3a5cb"; ctx.font = "16px monospace"; ctx.textAlign = "center";
      ctx.fillText("#", cell.x * 30 + 15, cell.y * 30 + 51); ctx.fillStyle = "#66516f";
    }
    game.snake.forEach((cell, i) => {
      ctx.fillStyle = i === 0 ? "#e6a06d" : `rgba(163,211,178,${Math.max(0.35, 1 - i * 0.035)})`;
      ctx.fillRect(cell.x * 30 + 3, cell.y * 30 + 33, 24, 24);
      if (!i) { ctx.fillStyle = "#0b1116"; ctx.fillRect(cell.x * 30 + 10, cell.y * 30 + 40, 4, 4); ctx.fillRect(cell.x * 30 + 19, cell.y * 30 + 40, 4, 4); }
    });
    ctx.fillStyle = "#e6a06d"; ctx.font = "bold 25px monospace"; ctx.textAlign = "center";
    ctx.fillText(game.food.char, game.food.x * 30 + 15, game.food.y * 30 + 53);
    ctx.font = "14px monospace"; ctx.fillStyle = "#849aab";
    ctx.fillText(`COLLECT: ${settings.word.slice(0, game.eaten)}${"_".repeat(settings.word.length - game.eaten)}  ${game.eaten}/${settings.word.length}`, WIDTH / 2, 20);
  } else {
    for (const glyph of game.glyphs) {
      if (!glyph.alive) continue;
      ctx.fillStyle = game.stage === "space" ? "#122e30" : "#1b2337";
      ctx.strokeStyle = game.stage === "space" ? "#3d7666" : "#645985";
      ctx.fillRect(glyph.x - 24, glyph.y - 22, 48, 43); ctx.strokeRect(glyph.x - 24, glyph.y - 22, 48, 43);
      ctx.fillStyle = game.stage === "space" ? "#a3d3b2" : "#c7b5ef";
      ctx.font = "bold 25px monospace"; ctx.textAlign = "center"; ctx.fillText(glyph.char, glyph.x, glyph.y + 8);
      if (glyph.hp > 1) { ctx.fillStyle = "#e6a06d"; ctx.fillRect(glyph.x - 14, glyph.y + 15, 28, 2); }
    }
    if (game.stage === "space") {
      ctx.fillStyle = "#a3d3b2";
      for (const bullet of game.bullets) ctx.fillRect(bullet.x - 2, bullet.y - 10, 4, 16);
      ctx.fillStyle = "#e6a06d";
      for (const hazard of game.hazards) { ctx.beginPath(); ctx.arc(hazard.x, hazard.y, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.save(); ctx.translate(game.player.x, game.player.y);
      ctx.globalAlpha = game.invincible > 0 && !reduced ? 0.55 + Math.sin(game.time * 18) * 0.3 : 1;
      ctx.fillStyle = "#a3d3b2"; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(23, 19); ctx.lineTo(0, 10); ctx.lineTo(-23, 19); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#0b1116"; ctx.fillRect(-4, -6, 8, 15);
      ctx.fillStyle = "#e6a06d"; ctx.beginPath(); ctx.moveTo(-6, 19); ctx.lineTo(0, reduced ? 31 : 30 + Math.sin(game.time * 30) * 7); ctx.lineTo(6, 19); ctx.fill(); ctx.restore();
      ctx.font = "12px monospace"; ctx.fillStyle = "#526a7b"; ctx.textAlign = "center"; ctx.fillText("DODGE THE ORANGE SIGNALS", WIDTH / 2, 587);
    } else {
      ctx.fillStyle = "#a3d3b2"; ctx.fillRect(game.player.x - settings.paddleHalf, 510, settings.paddleHalf * 2, 12);
      ctx.fillStyle = "#e6a06d"; ctx.beginPath(); ctx.arc(game.ball.x, game.ball.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.font = "12px monospace"; ctx.fillStyle = "#526a7b"; ctx.textAlign = "center"; ctx.fillText("KEEP THE BALL IN PLAY · BREAK EVERY LETTER", WIDTH / 2, 587);
    }
  }
  if (!reduced) for (const particle of game.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / 0.65); ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

type Snapshot = Pick<ArcadeState, "stage" | "phase" | "score" | "lives" | "round" | "level">;
export default function CodeArcade({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ArcadeState>(createGame());
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot>({ stage: "space", phase: "ready", score: 0, lives: 3, round: 1, level: 1 });
  const pause = (value: boolean) => { pausedRef.current = value; setPaused(value); };
  const start = () => {
    const game = createGame(); enterStage(game, "space"); gameRef.current = game;
    pause(false); canvasRef.current?.focus();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0; let last = 0; let previousSnapshot = "";
    const held = new Set<string>();
    const key = (event: KeyboardEvent) => {
      const directions: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } };
      const value = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (directions[value] && gameRef.current.phase === "playing") {
        event.preventDefault(); held.add(value);
        if (!pausedRef.current) turnSnake(gameRef.current, directions[value]);
        gameRef.current.pointerActive = false;
      }
      if (value === "p" && !event.repeat) { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }
    };
    const release = (event: KeyboardEvent) => {
      held.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
      gameRef.current.axis = Number(held.has("ArrowRight") || held.has("d")) - Number(held.has("ArrowLeft") || held.has("a"));
    };
    const blur = () => { held.clear(); gameRef.current.axis = 0; pausedRef.current = true; setPaused(true); };
    const visibility = () => { if (document.hidden) blur(); };
    dialog?.addEventListener("keydown", key); dialog?.addEventListener("keyup", release);
    window.addEventListener("blur", blur); document.addEventListener("visibilitychange", visibility);
    const tick = (now: number) => {
      const game = gameRef.current;
      if (!pausedRef.current) {
        if (held.size) game.axis = Number(held.has("ArrowRight") || held.has("d")) - Number(held.has("ArrowLeft") || held.has("a"));
        else if (game.pointerActive) game.axis = 0;
        // Touch buttons set axis directly; keyboard release is handled below.
        updateGame(game, last ? (now - last) / 1000 : 0);
      }
      last = now;
      if (ctx) draw(ctx, game, preference.matches);
      const next = { stage: game.stage, phase: game.phase, score: game.score, lives: game.lives, round: game.round, level: game.level };
      const serialized = JSON.stringify(next);
      if (previousSnapshot !== serialized) { previousSnapshot = serialized; setSnapshot(next); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow;
      dialog?.removeEventListener("keydown", key); dialog?.removeEventListener("keyup", release);
      window.removeEventListener("blur", blur); document.removeEventListener("visibilitychange", visibility);
      dialog?.close();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  const direction = (point: Point) => {
    const game = gameRef.current;
    if (pausedRef.current) return;
    if (game.stage === "snake") turnSnake(game, point);
    else { game.pointerActive = false; game.axis = point.x; }
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (game.stage === "snake" || pausedRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    game.pointer = { x: (event.clientX - rect.left) * WIDTH / rect.width, y: (event.clientY - rect.top) * HEIGHT / rect.height };
    game.pointerActive = true;
  };
  const stage = stages[snapshot.stage];
  const levelName = LEVEL_NAMES[snapshot.stage][snapshot.level - 1];
  const progress = ["space", "breakout", "snake"].indexOf(snapshot.stage) * 3 + snapshot.level;
  const nextMessage = snapshot.level < 3
    ? `Next: level ${snapshot.level + 1} — ${LEVEL_NAMES[snapshot.stage][snapshot.level]}.`
    : `${stage.next} +1 life.`;
  const hint = snapshot.stage === "snake"
    ? `Arrow keys / WASD or direction buttons · Collect “${levelSettings(snapshot).word}” · Avoid walls and # blocks`
    : stage.hint;
  return createPortal(
    <dialog id="code-arcade" ref={dialogRef} className={styles.arcadeDialog} aria-labelledby="arcade-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className={styles.arcadeShell}>
        <header className={styles.arcadeHeader}>
          <div><span>pedwork / hidden arcade</span><h2 id="arcade-title">{stage.number} <strong>{stage.name}</strong></h2></div>
          <div className={styles.arcadeStats}><span>SCORE <b>{String(snapshot.score).padStart(5, "0")}</b></span><span>LIVES <b>{snapshot.lives}</b></span><span>LEVEL <b>{snapshot.level}/3</b></span></div>
          <div className={styles.arcadeActions}>
            <button type="button" aria-label={paused ? "Resume game" : "Pause game"} onClick={() => pause(!paused)}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
            <button type="button" aria-label="Exit arcade" onClick={onClose}><X size={19} /></button>
          </div>
        </header>
        <div className={styles.arcadeLevelStrip}>
          <span>{levelName}</span>
          <div aria-label={`Level ${progress} of 9, loop ${snapshot.round}`}>
            {Array.from({ length: 9 }, (_, index) => <i key={index} data-state={index + 1 < progress ? "done" : index + 1 === progress ? "current" : "locked"} />)}
          </div>
          <span>{progress} / 9</span>
        </div>
        <div className={styles.arcadeBoard}>
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} tabIndex={0} aria-label={`${stage.name}, level ${snapshot.level} of 3. ${hint}`} onPointerMove={move} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.focus(); move(event); }} />
          {(snapshot.phase !== "playing" || paused) && <div className={styles.arcadeOverlay}>
            {snapshot.phase === "ready" ? <>
              <span className={styles.arcadeKicker}>THE CODE HAS LEFT THE EDITOR.</span>
              <h3>Less friction.<br /><em>More playing.</em></h3>
              <p>Fly through the letters. Break the code.<br />Three games. Three levels each. One evolving arcade.</p>
              <div className={styles.arcadeSequence}><span>01 SHOOT</span><i>→</i><span>02 BOUNCE</span><i>→</i><span>03 GROW</span></div>
              <button type="button" onClick={start}><Play size={16} /> Launch arcade</button>
              <small>9 levels · Mouse / touch / keyboard · Esc to exit</small>
            </> : snapshot.phase === "gameover" ? <>
              <span className={styles.arcadeKicker}>BUILD. BREAK. TRY AGAIN.</span><h3>Nice run<span>.</span></h3><p>{snapshot.score} points · level {progress}/9 · loop {snapshot.round}</p><button type="button" onClick={start}><RotateCcw size={16} /> Play again</button><button type="button" className={styles.arcadeSecondary} onClick={onClose}>Back to the workshop</button>
            </> : paused ? <><span className={styles.arcadeKicker}>TAKE A BREATHER</span><h3>Paused<span>.</span></h3><button type="button" onClick={() => { pause(false); canvasRef.current?.focus(); }}><Play size={16} /> Resume</button></> : <>
              <span className={styles.arcadeKicker}>LEVEL {snapshot.level} CLEAR · +{200 * snapshot.level}</span><h3>{snapshot.level < 3 ? "Level up." : snapshot.stage === "snake" ? "One more loop?" : "Plot twist."}</h3><p>{nextMessage}</p>
            </>}
          </div>}
        </div>
        <footer className={styles.arcadeFooter}>
          <p>{hint}</p>
          <div className={styles.arcadeControls} aria-label="Game direction controls">
            {[{ label: "Move left", icon: ArrowLeft, x: -1, y: 0 }, { label: "Move up", icon: ArrowUp, x: 0, y: -1 }, { label: "Move down", icon: ArrowDown, x: 0, y: 1 }, { label: "Move right", icon: ArrowRight, x: 1, y: 0 }].map((item) => <button key={item.label} type="button" aria-label={item.label} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); direction(item); }} onPointerUp={() => { gameRef.current.axis = 0; }} onPointerCancel={() => { gameRef.current.axis = 0; }} onClick={(event) => {
                if (event.detail !== 0) return;
                if (gameRef.current.stage === "snake") direction(item);
                else {
                  gameRef.current.pointer = { x: gameRef.current.player.x + item.x * 80, y: gameRef.current.player.y };
                  gameRef.current.pointerActive = true;
                }
              }}><item.icon size={17} /></button>)}
          </div>
        </footer>
        <div className={styles.arcadeAnnouncement} role="status" aria-live="polite">{snapshot.phase === "transition" ? `Level ${snapshot.level} complete. ${nextMessage}` : `${stage.name}, level ${snapshot.level} of 3. ${snapshot.lives} lives remaining.`}</div>
      </div>
    </dialog>, document.body,
  );
}
