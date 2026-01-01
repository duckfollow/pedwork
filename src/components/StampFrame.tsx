"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type VintageColor = "blue" | "sepia" | "green" | "red" | "purple";

interface StampFrameProps {
  imageSrc: string;
  location?: string | null;
  useOriginal?: boolean;
  vintageColor?: VintageColor;
  onStampReady?: (stampDataUrl: string) => void;
}

// Color palettes for different vintage styles
const colorPalettes: Record<VintageColor, { dark: [number, number, number]; light: [number, number, number]; border: string; text: string }> = {
  blue: {
    dark: [10, 22, 40],
    light: [74, 126, 184],
    border: "#1e3a5f",
    text: "#1e3a5f",
  },
  sepia: {
    dark: [45, 30, 15],
    light: [180, 140, 100],
    border: "#5c4033",
    text: "#5c4033",
  },
  green: {
    dark: [10, 35, 25],
    light: [70, 140, 100],
    border: "#1a4d3a",
    text: "#1a4d3a",
  },
  red: {
    dark: [50, 15, 15],
    light: [180, 80, 80],
    border: "#7c2d2d",
    text: "#7c2d2d",
  },
  purple: {
    dark: [30, 20, 45],
    light: [130, 90, 160],
    border: "#4a3260",
    text: "#4a3260",
  },
};

export default function StampFrame({ imageSrc, location, useOriginal = false, vintageColor = "blue", onStampReady }: StampFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  const renderStamp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Stamp dimensions - reduced padding for ~78% photo coverage
      const photoSize = 500;
      const borderWidth = 28;
      const textAreaTop = 32;
      const textAreaBottom = location ? 32 : 24;
      const textAreaLeft = 28;
      const textAreaRight = 28;
      
      const innerWidth = photoSize + textAreaLeft + textAreaRight;
      const innerHeight = photoSize + textAreaTop + textAreaBottom;
      
      const stampWidth = innerWidth + borderWidth * 2;
      const stampHeight = innerHeight + borderWidth * 2;
      
      // Perforation settings - larger, fewer perforations for calmer look
      const perfRadius = 10;
      const perfSpacing = 26;
      
      // Shadow settings
      const shadowOffsetX = 8;
      const shadowOffsetY = 10;
      const shadowBlur = 15;
      const shadowPadding = shadowOffsetX + shadowBlur + 5;

      // Canvas size includes shadow space
      canvas.width = stampWidth + shadowPadding;
      canvas.height = stampHeight + shadowPadding;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate number of perforations
      const topScallops = Math.floor(stampWidth / perfSpacing);
      const leftScallops = Math.floor(stampHeight / perfSpacing);
      
      // Helper function to create perforated path
      const createPerforatedPath = (offsetX: number, offsetY: number) => {
        ctx.beginPath();
        
        // Top edge perforations - centered
        const topOffset = (stampWidth - topScallops * perfSpacing) / 2 + perfSpacing / 2;
        for (let i = 0; i < topScallops; i++) {
          const x = offsetX + topOffset + i * perfSpacing;
          ctx.moveTo(x + perfRadius, offsetY);
          ctx.arc(x, offsetY, perfRadius, 0, Math.PI, false);
        }
        
        // Bottom edge perforations - centered
        for (let i = 0; i < topScallops; i++) {
          const x = offsetX + topOffset + i * perfSpacing;
          ctx.moveTo(x - perfRadius, offsetY + stampHeight);
          ctx.arc(x, offsetY + stampHeight, perfRadius, Math.PI, 0, false);
        }
        
        // Left edge perforations - centered
        const leftOffsetVal = (stampHeight - leftScallops * perfSpacing) / 2 + perfSpacing / 2;
        for (let i = 0; i < leftScallops; i++) {
          const y = offsetY + leftOffsetVal + i * perfSpacing;
          ctx.moveTo(offsetX, y - perfRadius);
          ctx.arc(offsetX, y, perfRadius, -Math.PI / 2, Math.PI / 2, false);
        }
        
        // Right edge perforations - centered
        for (let i = 0; i < leftScallops; i++) {
          const y = offsetY + leftOffsetVal + i * perfSpacing;
          ctx.moveTo(offsetX + stampWidth, y + perfRadius);
          ctx.arc(offsetX + stampWidth, y, perfRadius, Math.PI / 2, -Math.PI / 2, false);
        }
        
        // Main stamp body
        ctx.rect(offsetX, offsetY, stampWidth, stampHeight);
      };
      
      // Draw shadow first
      ctx.save();
      createPerforatedPath(shadowOffsetX, shadowOffsetY);
      ctx.clip("evenodd");
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.filter = `blur(${shadowBlur}px)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
      ctx.restore();
      
      // Create clipping path with perforated edges for main stamp
      ctx.save();
      createPerforatedPath(0, 0);
      ctx.clip("evenodd");
      
      // Fill stamp background - vintage paper cream color
      ctx.fillStyle = "#f5f0e6";
      ctx.fillRect(0, 0, stampWidth, stampHeight);

      // Add subtle paper texture
      const imageData = ctx.getImageData(0, 0, stampWidth, stampHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      // Inner frame coordinates
      const frameX = borderWidth;
      const frameY = borderWidth;
      const frameWidth = innerWidth;
      const frameHeight = innerHeight;

      // Get color palette
      const palette = colorPalettes[vintageColor];
      
      // Border color - adapts based on mode
      const borderColor = useOriginal ? "#78716c" : palette.border;

      // Draw single decorative inner border - closer to edge
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(frameX + 3, frameY + 3, frameWidth - 6, frameHeight - 6);

      // Photo area
      const photoX = frameX + textAreaLeft;
      const photoY = frameY + textAreaTop;

      // Draw photo
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = photoSize;
      tempCanvas.height = photoSize;
      const tempCtx = tempCanvas.getContext("2d");
      
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0, photoSize, photoSize);
        
        // Apply duotone effect only if not using original
        if (!useOriginal) {
          const photoData = tempCtx.getImageData(0, 0, photoSize, photoSize);
          const pData = photoData.data;
          
          const [darkR, darkG, darkB] = palette.dark;
          const [lightR, lightG, lightB] = palette.light;
          
          for (let i = 0; i < pData.length; i += 4) {
            // Convert to grayscale
            const gray = pData[i] * 0.299 + pData[i + 1] * 0.587 + pData[i + 2] * 0.114;
            
            // Map to color range (dark to light)
            const t = gray / 255;
            pData[i] = Math.floor(darkR + t * (lightR - darkR));       // R
            pData[i + 1] = Math.floor(darkG + t * (lightG - darkG));   // G
            pData[i + 2] = Math.floor(darkB + t * (lightB - darkB));   // B
          }
          
          tempCtx.putImageData(photoData, 0, 0);
        }
        
        ctx.drawImage(tempCanvas, photoX, photoY);
      }

      // Draw thin border around photo
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2);

      // Text styling
      const textColor = useOriginal ? "#57534e" : palette.text;
      
      // ===== TITLE: Short Date at top center =====
      const date = new Date();
      const shortDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).toUpperCase();
      
      const titleY = frameY + textAreaTop / 2 + 2;
      const titleX = frameX + frameWidth / 2;
      
      // Draw date with letter spacing
      ctx.save();
      ctx.font = "bold 16px 'Georgia', serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const letterSpacing = 2;
      let totalWidth = 0;
      for (const char of shortDate) {
        totalWidth += ctx.measureText(char).width + letterSpacing;
      }
      totalWidth -= letterSpacing;
      
      let currentX = titleX - totalWidth / 2;
      for (const char of shortDate) {
        ctx.fillText(char, currentX + ctx.measureText(char).width / 2, titleY);
        currentX += ctx.measureText(char).width + letterSpacing;
      }
      ctx.restore();

      // ===== SUBTITLE: Location at bottom =====
      if (location) {
        const subtitle = location.toUpperCase();
        const subtitleY = frameY + frameHeight - textAreaBottom / 2;
        
        ctx.save();
        ctx.font = "12px 'Georgia', serif";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Truncate if too long
        const maxWidth = frameWidth - 20;
        let displayText = subtitle;
        if (ctx.measureText(subtitle).width > maxWidth) {
          while (ctx.measureText(displayText + "...").width > maxWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
          }
          displayText += "...";
        }
        
        ctx.fillText(displayText, titleX, subtitleY);
        ctx.restore();
      } else {
        // Show "PHOTO STAMP" when no location
        ctx.font = "12px 'Georgia', serif";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PHOTO STAMP", titleX, frameY + frameHeight - textAreaBottom / 2);
      }

      // Corner accents - subtle and small
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 1;
      const cornerSize = 8;
      const cornerOffset = 8;
      
      // Top left
      ctx.beginPath();
      ctx.moveTo(frameX + cornerOffset + cornerSize, frameY + cornerOffset);
      ctx.lineTo(frameX + cornerOffset, frameY + cornerOffset);
      ctx.lineTo(frameX + cornerOffset, frameY + cornerOffset + cornerSize);
      ctx.stroke();
      
      // Top right
      ctx.beginPath();
      ctx.moveTo(frameX + frameWidth - cornerOffset - cornerSize, frameY + cornerOffset);
      ctx.lineTo(frameX + frameWidth - cornerOffset, frameY + cornerOffset);
      ctx.lineTo(frameX + frameWidth - cornerOffset, frameY + cornerOffset + cornerSize);
      ctx.stroke();
      
      // Bottom left
      ctx.beginPath();
      ctx.moveTo(frameX + cornerOffset + cornerSize, frameY + frameHeight - cornerOffset);
      ctx.lineTo(frameX + cornerOffset, frameY + frameHeight - cornerOffset);
      ctx.lineTo(frameX + cornerOffset, frameY + frameHeight - cornerOffset - cornerSize);
      ctx.stroke();
      
      // Bottom right
      ctx.beginPath();
      ctx.moveTo(frameX + frameWidth - cornerOffset - cornerSize, frameY + frameHeight - cornerOffset);
      ctx.lineTo(frameX + frameWidth - cornerOffset, frameY + frameHeight - cornerOffset);
      ctx.lineTo(frameX + frameWidth - cornerOffset, frameY + frameHeight - cornerOffset - cornerSize);
      ctx.stroke();

      // Subtle aging effect - reduced
      ctx.globalAlpha = 0.02;
      ctx.fillStyle = "#8B7355";
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * stampWidth;
        const y = Math.random() * stampHeight;
        const size = Math.random() * 15 + 3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      setIsReady(true);

      // Notify parent with the stamp data URL
      if (onStampReady) {
        const stampData = canvas.toDataURL("image/png", 1.0);
        onStampReady(stampData);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for stamp");
    };

    img.src = imageSrc;
  }, [imageSrc, location, useOriginal, vintageColor, onStampReady]);

  useEffect(() => {
    if (imageSrc) {
      setIsReady(false);
      renderStamp();
    }
  }, [imageSrc, renderStamp]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <canvas
        ref={canvasRef}
        className={`w-full h-auto transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-square">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
