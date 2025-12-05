"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix characters (katakana, numbers, symbols)
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()";
    const charArray = chars.split("");

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Animation
    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Green text
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        // Draw character
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Varying green shades for depth
        const brightness = Math.random();
        if (brightness > 0.9) {
          ctx.fillStyle = "#FFF"; // Bright white for leading chars
        } else if (brightness > 0.7) {
          ctx.fillStyle = "#0F0"; // Bright green
        } else {
          ctx.fillStyle = "#0A0"; // Darker green
        }

        ctx.fillText(char, x, y);

        // Reset drop when it goes off screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30"
      style={{ background: "transparent" }}
    />
  );
}

