"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type VintageColor = "blue" | "sepia" | "green" | "red" | "purple";
type PostmarkPosition = "bottom-right" | "bottom-left" | "top-right";
type PostmarkColor = "blue" | "red" | "black";

interface PostmarkOptions {
  enabled: boolean;
  position: PostmarkPosition;
  color: PostmarkColor;
}

interface StampFrameProps {
  imageSrc: string;
  location?: string | null;
  useOriginal?: boolean;
  vintageColor?: VintageColor;
  postmark?: PostmarkOptions;
  onStampReady?: (stampDataUrl: string) => void;
}

// Paper texture path
const PAPER_TEXTURE_PATH = "/images/Paper_Texture.png";

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

// Postmark ink colors
const postmarkColors: Record<PostmarkColor, string> = {
  blue: "rgba(20, 40, 80, 0.75)",
  red: "rgba(120, 30, 30, 0.75)",
  black: "rgba(30, 30, 30, 0.75)",
};

export default function StampFrame({ 
  imageSrc, 
  location, 
  useOriginal = false, 
  vintageColor = "blue", 
  postmark,
  onStampReady 
}: StampFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const previousImageSrcRef = useRef<string | null>(null);
  const paperTextureRef = useRef<HTMLImageElement | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // Load paper texture on mount
  useEffect(() => {
    const textureImg = new Image();
    textureImg.crossOrigin = "anonymous";
    textureImg.onload = () => {
      paperTextureRef.current = textureImg;
      setTextureLoaded(true);
    };
    textureImg.onerror = () => {
      console.warn("Failed to load paper texture, continuing without it");
      setTextureLoaded(true); // Continue without texture
    };
    textureImg.src = PAPER_TEXTURE_PATH;
  }, []);

  // Render the stamp using cached image
  const renderWithImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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

      // ===== PAPER TEXTURE OVERLAY =====
      // Apply subtle paper texture to make photo feel printed on real paper
      if (paperTextureRef.current) {
        ctx.save();
        
        // Create a temporary canvas for the texture overlay
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = photoSize;
        textureCanvas.height = photoSize;
        const textureCtx = textureCanvas.getContext("2d");
        
        if (textureCtx) {
          const texture = paperTextureRef.current;
          
          // Tile the texture seamlessly across the photo area
          // This ensures proper scaling for different resolutions
          const texturePattern = textureCtx.createPattern(texture, "repeat");
          if (texturePattern) {
            textureCtx.fillStyle = texturePattern;
            textureCtx.fillRect(0, 0, photoSize, photoSize);
          } else {
            // Fallback: scale texture to fit if pattern creation fails
            textureCtx.drawImage(texture, 0, 0, photoSize, photoSize);
          }
          
          // Apply slight blur for softness (0.4px for subtle effect)
          ctx.filter = "blur(0.4px)";
          
          // Use overlay blend mode - affects highlights more than shadows
          ctx.globalCompositeOperation = "overlay";
          
          // Subtle opacity: 8% for clean, premium look
          ctx.globalAlpha = 0.08;
          
          // Draw texture over the photo area
          ctx.drawImage(textureCanvas, photoX, photoY);
          
          // Reset context
          ctx.filter = "none";
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
        }
        
        ctx.restore();
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

      // ===== POSTMARK (Half-circle design - clipped to stamp) =====
      if (postmark?.enabled) {
        // Increased size by ~20%
        const postmarkRadius = 110;
        const innerRadius = 85;
        
        // Position at stamp edge - postmark center at edge so half is visible
        // But will be clipped to stay within stamp boundary
        let postmarkX: number;
        let postmarkY: number;
        let rotation: number;
        let arcStart: number;
        let arcEnd: number;
        
        switch (postmark.position) {
          case "bottom-left":
            // Position at left edge, show RIGHT half of circle
            postmarkX = -10;
            postmarkY = photoY + photoSize - 40;
            rotation = 15 * (Math.PI / 180);
            arcStart = -0.55 * Math.PI;  // Right half
            arcEnd = 0.55 * Math.PI;
            break;
          case "top-right":
            // Position at right edge, show LEFT half of circle
            postmarkX = stampWidth + 10;
            postmarkY = photoY + 50;
            rotation = -12 * (Math.PI / 180);
            arcStart = 0.45 * Math.PI;  // Left half
            arcEnd = 1.55 * Math.PI;
            break;
          case "bottom-right":
          default:
            // Position at right edge, show LEFT half of circle
            postmarkX = stampWidth + 10;
            postmarkY = photoY + photoSize - 30;
            rotation = -12 * (Math.PI / 180);
            arcStart = 0.45 * Math.PI;  // Left half
            arcEnd = 1.55 * Math.PI;
            break;
        }
        
        const arcSpan = arcEnd - arcStart;
        
        const inkColor = postmarkColors[postmark.color];
        
        ctx.save();
        
        // Create clipping region using the stamp's perforated boundary
        // This ensures postmark never renders outside the stamp
        ctx.beginPath();
        const clipTopOffset = (stampWidth - topScallops * perfSpacing) / 2 + perfSpacing / 2;
        for (let i = 0; i < topScallops; i++) {
          const x = clipTopOffset + i * perfSpacing;
          if (i === 0) {
            ctx.moveTo(x - perfRadius, 0);
          }
          ctx.arc(x, 0, perfRadius, Math.PI, 0, true);
          if (i < topScallops - 1) {
            ctx.lineTo(clipTopOffset + (i + 1) * perfSpacing - perfRadius, 0);
          }
        }
        // Right edge
        const clipLeftOffset = (stampHeight - leftScallops * perfSpacing) / 2 + perfSpacing / 2;
        ctx.lineTo(stampWidth, clipLeftOffset - perfRadius);
        for (let i = 0; i < leftScallops; i++) {
          const y = clipLeftOffset + i * perfSpacing;
          ctx.arc(stampWidth, y, perfRadius, -Math.PI / 2, Math.PI / 2, true);
          if (i < leftScallops - 1) {
            ctx.lineTo(stampWidth, clipLeftOffset + (i + 1) * perfSpacing - perfRadius);
          }
        }
        // Bottom edge
        ctx.lineTo(clipTopOffset + (topScallops - 1) * perfSpacing + perfRadius, stampHeight);
        for (let i = topScallops - 1; i >= 0; i--) {
          const x = clipTopOffset + i * perfSpacing;
          ctx.arc(x, stampHeight, perfRadius, 0, Math.PI, true);
          if (i > 0) {
            ctx.lineTo(clipTopOffset + (i - 1) * perfSpacing + perfRadius, stampHeight);
          }
        }
        // Left edge
        ctx.lineTo(0, clipLeftOffset + (leftScallops - 1) * perfSpacing + perfRadius);
        for (let i = leftScallops - 1; i >= 0; i--) {
          const y = clipLeftOffset + i * perfSpacing;
          ctx.arc(0, y, perfRadius, Math.PI / 2, -Math.PI / 2, true);
          if (i > 0) {
            ctx.lineTo(0, clipLeftOffset + (i - 1) * perfSpacing + perfRadius);
          }
        }
        ctx.closePath();
        ctx.clip();
        
        ctx.translate(postmarkX, postmarkY);
        ctx.rotate(rotation);
        
        // Apply blur for softer edges
        ctx.filter = "blur(0.7px)";
        
        // Use multiply blend mode for natural ink absorption
        ctx.globalCompositeOperation = "multiply";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // === Draw multiple passes for ink absorption effect ===
        
        // Pass 1: Soft outer glow/bleed (very faint) - increased stroke for larger size
        ctx.strokeStyle = inkColor;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, postmarkRadius, arcStart + 0.1, arcEnd - 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, arcStart + 0.1, arcEnd - 0.1);
        ctx.stroke();
        
        // Pass 2: Main stroke with reduced opacity - proportionally thicker
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, postmarkRadius, arcStart, arcEnd);
        ctx.stroke();
        
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, arcStart, arcEnd);
        ctx.stroke();
        
        // Pass 3: Variable intensity along the arc (simulates uneven ink)
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
          const segmentStart = arcStart + (arcSpan / 8) * i;
          const segmentEnd = segmentStart + (arcSpan / 8);
          const intensity = 0.35 + Math.random() * 0.2; // 35-55% opacity variation
          
          ctx.globalAlpha = intensity;
          ctx.beginPath();
          ctx.arc(0, 0, postmarkRadius, segmentStart, segmentEnd);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, innerRadius, segmentStart, segmentEnd);
          ctx.stroke();
        }
        
        // Fade effect at arc ends (gradual fade-out)
        for (let fade = 0; fade < 5; fade++) {
          const fadeAlpha = 0.08 - fade * 0.015;
          ctx.globalAlpha = Math.max(0.01, fadeAlpha);
          ctx.lineWidth = 3.5 - fade * 0.5;
          
          // Start fade
          ctx.beginPath();
          ctx.arc(0, 0, postmarkRadius, arcStart - 0.02 * fade, arcStart + 0.08);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, innerRadius, arcStart - 0.02 * fade, arcStart + 0.08);
          ctx.stroke();
          
          // End fade
          ctx.beginPath();
          ctx.arc(0, 0, postmarkRadius, arcEnd - 0.08, arcEnd + 0.02 * fade);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, innerRadius, arcEnd - 0.08, arcEnd + 0.02 * fade);
          ctx.stroke();
        }
        
        // Reset filter for text
        ctx.filter = "none";
        ctx.globalCompositeOperation = "multiply";
        
        // Date text curved along visible arc - larger font for bigger postmark
        ctx.fillStyle = inkColor;
        ctx.font = "bold 13px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const postmarkDate = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).toUpperCase();
        
        const dateChars = postmarkDate.split("");
        const dateArcRadius = (postmarkRadius + innerRadius) / 2;
        
        // Calculate text start angle based on position (center of visible arc, upper portion)
        const arcCenter = (arcStart + arcEnd) / 2;
        const isLeftHalf = postmark.position !== "bottom-left"; // bottom-left shows right half
        const dateStartAngle = isLeftHalf 
          ? arcCenter - 0.35  // Upper portion of left half
          : arcCenter - 0.35; // Upper portion of right half
        const dateCharSpacing = 0.08;
        
        dateChars.forEach((char, i) => {
          const angle = dateStartAngle + i * dateCharSpacing;
          if (angle >= arcStart + 0.1 && angle <= arcEnd - 0.1) {
            const charOpacity = 0.45 + Math.random() * 0.15;
            ctx.globalAlpha = charOpacity;
            
            const x = Math.cos(angle) * dateArcRadius;
            const y = Math.sin(angle) * dateArcRadius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
          }
        });
        
        // Location text curved along visible bottom portion of arc
        if (location) {
          const locText = location.toUpperCase();
          const locChars = locText.length > 14 ? locText.substring(0, 14).split("") : locText.split("");
          const locArcRadius = (postmarkRadius + innerRadius) / 2;
          
          // Position at lower portion of visible arc
          const locStartAngle = isLeftHalf
            ? arcCenter + 0.35  // Lower portion of left half
            : arcCenter + 0.35; // Lower portion of right half
          const locCharSpacing = 0.07;
          
          ctx.font = "bold 12px 'Courier New', monospace";
          locChars.forEach((char, i) => {
            const angle = locStartAngle - i * locCharSpacing;
            if (angle >= arcStart + 0.1 && angle <= arcEnd - 0.1) {
              const charOpacity = 0.4 + Math.random() * 0.15;
              ctx.globalAlpha = charOpacity;
              
              const x = Math.cos(angle) * locArcRadius;
              const y = Math.sin(angle) * locArcRadius;
              
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(angle - Math.PI / 2);
              ctx.fillText(char, 0, 0);
              ctx.restore();
            }
          });
        }
        
        // Ink absorption texture (paper grain effect)
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 100; i++) {
          const angle = arcStart + Math.random() * arcSpan;
          const dist = innerRadius - 15 + Math.random() * (postmarkRadius - innerRadius + 30);
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const size = Math.random() * 1.8 + 0.3;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Additional texture for paper absorption simulation
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 40; i++) {
          const angle = arcStart + Math.random() * arcSpan;
          const dist = innerRadius + Math.random() * (postmarkRadius - innerRadius);
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.filter = "none";
        
        ctx.restore();
      }

      setIsReady(true);

      // Notify parent with the stamp data URL
      if (onStampReady) {
        const stampData = canvas.toDataURL("image/png", 1.0);
        onStampReady(stampData);
      }
  }, [location, useOriginal, vintageColor, postmark, onStampReady, textureLoaded]);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    // If the image source hasn't changed and we have a cached image, just re-render
    if (imageSrc === previousImageSrcRef.current && loadedImageRef.current) {
      renderWithImage(loadedImageRef.current);
      return;
    }

    // New image source - need to load it
    setIsReady(false);
    previousImageSrcRef.current = imageSrc;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      loadedImageRef.current = img;
      renderWithImage(img);
    };

    img.onerror = () => {
      console.error("Failed to load image for stamp");
    };

    img.src = imageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  // Re-render when settings change (without loading indicator)
  // Note: We use a ref check instead of isReady state to avoid infinite loops
  useEffect(() => {
    if (loadedImageRef.current && previousImageSrcRef.current) {
      renderWithImage(loadedImageRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, useOriginal, vintageColor, postmark, textureLoaded]);

  return (
    <div className="relative w-full max-w-md mx-auto" suppressHydrationWarning>
      <canvas
        ref={canvasRef}
        className={`w-full h-auto transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        suppressHydrationWarning
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-square">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
