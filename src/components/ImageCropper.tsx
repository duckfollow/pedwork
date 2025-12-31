"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  outputSize?: number;
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  outputSize = 600,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const cropImage = useCallback(async () => {
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set output size
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calculate dimensions for center crop
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Draw cropped and scaled image
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        outputSize,
        outputSize
      );

      // Return cropped image
      const croppedData = canvas.toDataURL("image/png", 1.0);
      onCropComplete(croppedData);
      setIsProcessing(false);
    };

    img.onerror = () => {
      console.error("Failed to load image for cropping");
      setIsProcessing(false);
    };

    img.src = imageSrc;
  }, [imageSrc, onCropComplete, outputSize]);

  useEffect(() => {
    if (imageSrc) {
      cropImage();
    }
  }, [imageSrc, cropImage]);

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
      {isProcessing && <span>Processing...</span>}
    </div>
  );
}

