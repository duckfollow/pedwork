"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, RotateCcw } from "lucide-react";

interface CameraPreviewProps {
  onCapture: (imageData: string) => void;
  isActive: boolean;
  onError: (error: string) => void;
}

export default function CameraPreview({
  onCapture,
  isActive,
  onError,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current) return;
    if (!isMountedRef.current) return;
    
    isStartingRef.current = true;
    setIsLoading(true);
    
    // Stop existing camera first
    stopCamera();
    
    // Small delay to ensure camera is fully released
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!isMountedRef.current) {
      isStartingRef.current = false;
      return;
    }

    try {
      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      
      if (!isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }
      
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if component is still mounted
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        isStartingRef.current = false;
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Video load error"));
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error("Video load timeout")), 5000);
        });

        if (!isMountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          isStartingRef.current = false;
          return;
        }

        try {
          await video.play();
        } catch (playError) {
          // Ignore AbortError - it just means the play was interrupted
          if (playError instanceof Error && playError.name !== "AbortError") {
            throw playError;
          }
        }

        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    } catch (err) {
      if (!isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }
      
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          onError("Camera access denied. Please allow camera permissions.");
        } else if (err.name === "NotFoundError") {
          onError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          onError("Camera is already in use by another application.");
        } else if (err.name === "OverconstrainedError") {
          // Try again without facing mode constraint
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            
            if (!isMountedRef.current) {
              fallbackStream.getTracks().forEach((track) => track.stop());
              isStartingRef.current = false;
              return;
            }

            streamRef.current = fallbackStream;
            const video = videoRef.current;
            if (video) {
              video.srcObject = fallbackStream;
              await video.play();
              setIsLoading(false);
            }
          } catch {
            onError("Could not access camera.");
          }
        } else if (err.name === "AbortError") {
          // Silently ignore abort errors
        } else {
          onError(`Camera error: ${err.message}`);
        }
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [onError, stopCamera]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Handle camera start/stop based on isActive
  useEffect(() => {
    if (isActive) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setIsLoading(true);
    }
  }, [isActive]); // Only depend on isActive, not facingMode or startCamera

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas to square dimensions using the smaller dimension
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Calculate offset to center crop
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // If using front camera, flip horizontally
    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    // Draw centered square crop
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    // Convert to data URL
    const imageData = canvas.toDataURL("image/png", 1.0);
    onCapture(imageData);
  };

  const toggleCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    await startCamera(newMode);
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-2xl bg-zinc-900">
      {/* Loading State */}
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner guides */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/60" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-400/60" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-400/60" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/60" />
      </div>

      {/* Controls Overlay */}
      {!isLoading && isActive && (
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-6">
          {/* Switch Camera Button */}
          {hasMultipleCameras && (
            <button
              onClick={toggleCamera}
              className="w-12 h-12 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-zinc-700/80 transition-all active:scale-95"
              aria-label="Switch camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95 ring-4 ring-white/20"
            aria-label="Capture photo"
          >
            <Camera className="w-7 h-7" />
          </button>

          {/* Spacer for symmetry */}
          {hasMultipleCameras && <div className="w-12" />}
        </div>
      )}
    </div>
  );
}
