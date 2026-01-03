"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Download, RefreshCcw, Camera, AlertCircle, Stamp, MapPin, Loader2, Upload, ImageIcon, Palette, Circle, Share2, X } from "lucide-react";
import CameraPreview from "@/components/CameraPreview";
import ImageCropper from "@/components/ImageCropper";
import StampFrame from "@/components/StampFrame";
import { trackEvent } from "@/lib/gtag";

// PWA Install Prompt Event type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

type AppState = "idle" | "camera" | "preview" | "stamped";

interface LocationData {
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export default function StampCameraPage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [stampedImage, setStampedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"camera" | "upload">("camera");
  const [useOriginal, setUseOriginal] = useState(false);
  const [vintageColor, setVintageColor] = useState<"blue" | "sepia" | "green" | "red" | "purple">("blue");
  const [postmarkEnabled, setPostmarkEnabled] = useState(false);
  const [postmarkPosition, setPostmarkPosition] = useState<"bottom-right" | "bottom-left" | "top-right">("bottom-right");
  const [postmarkColor, setPostmarkColor] = useState<"blue" | "red" | "black">("blue");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Share state
  const [canShare, setCanShare] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // PWA state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check Web Share API support and detect mobile on mount
  useEffect(() => {
    // Check if Web Share API with files is supported
    const checkShareSupport = async () => {
      // Check if share API exists on navigator
      if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
        // Test if file sharing is supported
        const testFile = new File(["test"], "test.png", { type: "image/png" });
        const testData = { files: [testFile] };
        try {
          const supported = navigator.canShare(testData);
          setCanShare(supported);
        } catch {
          setCanShare(false);
        }
      } else {
        setCanShare(false);
      }
    };
    checkShareSupport();

    // Detect mobile/iOS device
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        const userAgent = navigator.userAgent || "";
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
        // Also check for touch capability as a fallback
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsMobile(isMobileDevice || (hasTouchScreen && window.innerWidth < 768) || isIOSDevice);
      }
    };
    checkMobile();

    // Check if running as installed PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = ('standalone' in window.navigator) && (window.navigator as Navigator & { standalone?: boolean }).standalone;
      setIsPWA(isStandalone || !!isIOSStandalone);
    };
    checkPWA();
  }, []);

  // PWA Install Prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install prompt after user has interacted with the app
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed event
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsPWA(true);
      trackEvent("pwa_installed", "install", "photo_stamp");
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle shared images from other apps (PWA Share Target)
  useEffect(() => {
    // Check for shared image in sessionStorage (set by service worker)
    const sharedImage = sessionStorage.getItem('sharedImage');
    if (sharedImage) {
      setCapturedImage(sharedImage);
      setSourceType('upload');
      setAppState('preview');
      sessionStorage.removeItem('sharedImage');
      trackEvent("pwa_share_received", "share_target", "photo_stamp");
    }

    // Listen for shared images from service worker
    const handleSharedImage = (event: CustomEvent<string>) => {
      setCapturedImage(event.detail);
      setSourceType('upload');
      setAppState('preview');
      trackEvent("pwa_share_received", "share_target", "photo_stamp");
    };

    window.addEventListener('sharedImage', handleSharedImage as EventListener);

    // Handle URL action parameters (for shortcuts)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'camera') {
      setSourceType('camera');
      setAppState('camera');
    } else if (action === 'upload') {
      fileInputRef.current?.click();
    }

    return () => {
      window.removeEventListener('sharedImage', handleSharedImage as EventListener);
    };
  }, []);

  // Handle PWA install
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      trackEvent("pwa_install_accepted", "install", "photo_stamp");
    } else {
      trackEvent("pwa_install_dismissed", "install", "photo_stamp");
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwaPromptDismissed', 'true');
  };

  // Ref to track if location request is in progress (avoids stale closure issues)
  const isRequestingLocationRef = useRef(false);

  // Request geolocation on mount
  useEffect(() => {
    // Check if geolocation is available
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Geolocation not supported");
      return;
    }

    // Prevent duplicate requests
    if (isRequestingLocationRef.current) return;
    isRequestingLocationRef.current = true;
    setIsLoadingLocation(true);
    setLocationError(null);

    let didComplete = false;
    let watchId: number | null = null;

    // Manual timeout fallback for Safari
    const timeoutId = window.setTimeout(() => {
      if (!didComplete) {
        didComplete = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        setIsLoadingLocation(false);
        setLocationError("Location request timed out");
        isRequestingLocationRef.current = false;
      }
    }, 20000);

    const handleSuccess = async (position: GeolocationPosition) => {
      if (didComplete) return;
      didComplete = true;
      window.clearTimeout(timeoutId);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });

      // Try to reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          const city = data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      data.address?.municipality ||
                      data.address?.county;
          const country = data.address?.country;
          
          if (city && country) {
            setLocation({ city, country, lat: latitude, lng: longitude });
            setLocationText(`${city}, ${country}`);
          } else if (country) {
            setLocation({ country, lat: latitude, lng: longitude });
            setLocationText(country);
          } else {
            setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } else {
          setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
      } catch {
        setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
      }
      
      setIsLoadingLocation(false);
      isRequestingLocationRef.current = false;
    };

    const handleError = (err: GeolocationPositionError) => {
      if (didComplete) return;
      didComplete = true;
      window.clearTimeout(timeoutId);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      
      setIsLoadingLocation(false);
      isRequestingLocationRef.current = false;
      
      if (err.code === 1) { // PERMISSION_DENIED
        setLocationError("Location access denied");
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        setLocationError("Location unavailable");
      } else if (err.code === 3) { // TIMEOUT
        setLocationError("Location request timed out");
      } else {
        setLocationError("Could not get location");
      }
    };

    // Use watchPosition for better Safari compatibility
    // Safari sometimes ignores getCurrentPosition but works with watchPosition
    try {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    } catch {
      didComplete = true;
      window.clearTimeout(timeoutId);
      setIsLoadingLocation(false);
      setLocationError("Geolocation error");
      isRequestingLocationRef.current = false;
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Manual retry function for user interaction
  const requestLocation = useCallback(() => {
    if (isRequestingLocationRef.current) return;
    
    // Reset state
    setLocationError(null);
    isRequestingLocationRef.current = true;
    setIsLoadingLocation(true);

    let didComplete = false;

    const timeoutId = window.setTimeout(() => {
      if (!didComplete) {
        didComplete = true;
        setIsLoadingLocation(false);
        setLocationError("Location request timed out");
        isRequestingLocationRef.current = false;
      }
    }, 20000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (didComplete) return;
        didComplete = true;
        window.clearTimeout(timeoutId);

        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          
          if (response.ok) {
            const data = await response.json();
            const city = data.address?.city || 
                        data.address?.town || 
                        data.address?.village || 
                        data.address?.municipality ||
                        data.address?.county;
            const country = data.address?.country;
            
            if (city && country) {
              setLocation({ city, country, lat: latitude, lng: longitude });
              setLocationText(`${city}, ${country}`);
            } else if (country) {
              setLocation({ country, lat: latitude, lng: longitude });
              setLocationText(country);
            } else {
              setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
            }
          } else {
            setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } catch {
          setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
        
        setIsLoadingLocation(false);
        isRequestingLocationRef.current = false;
      },
      (err) => {
        if (didComplete) return;
        didComplete = true;
        window.clearTimeout(timeoutId);
        
        setIsLoadingLocation(false);
        isRequestingLocationRef.current = false;
        
        if (err.code === 1) {
          setLocationError("Location access denied");
        } else if (err.code === 2) {
          setLocationError("Location unavailable");
        } else {
          setLocationError("Could not get location");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, []);

  const handleStartCamera = () => {
    setError(null);
    setSourceType("camera");
    setAppState("camera");
    trackEvent("stamp_camera_open", "camera", "photo_stamp");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);
    setSourceType("upload");

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      setAppState("preview");
      trackEvent("stamp_image_upload", "upload", "photo_stamp");
    };
    reader.onerror = () => {
      setError("Failed to read image file");
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    setAppState("preview");
    trackEvent("stamp_photo_capture", "camera", "photo_stamp");
  }, []);

  const handleCropComplete = useCallback((croppedData: string) => {
    setCroppedImage(croppedData);
    setAppState("stamped");
  }, []);

  const handleStampReady = useCallback((stampData: string) => {
    setStampedImage(stampData);
  }, []);

  const handleRetake = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setStampedImage(null);
    if (sourceType === "camera") {
      setAppState("camera");
    } else {
      setAppState("idle");
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setStampedImage(null);
    setError(null);
    setUseOriginal(false);
    setVintageColor("blue");
    setPostmarkEnabled(false);
    setPostmarkPosition("bottom-right");
    setPostmarkColor("blue");
    setAppState("idle");
  };

  const handleDownload = async () => {
    if (!stampedImage) return;

    setIsDownloading(true);

    try {
      // Convert base64 to blob for sharing/saving
      const response = await fetch(stampedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo-stamp-${Date.now()}.png`, { type: "image/png" });

      // On mobile with Web Share API support, use share to save to photos
      if (isMobile && canShare) {
        try {
          await navigator.share({
            title: "Photo Stamp",
            text: locationText ? `My Photo Stamp from ${locationText}` : "My Photo Stamp",
            files: [file],
          });
          trackEvent("stamp_download", "mobile_share", "photo_stamp");
          setIsDownloading(false);
          return;
        } catch (err) {
          // User cancelled share or it failed - try fallback
          if (err instanceof Error && err.name === "AbortError") {
            setIsDownloading(false);
            return;
          }
        }
      }

      // On iOS without share support, show save modal with image
      if (isMobile) {
        // iOS Safari: Show modal with image for long-press saving
        setShowSaveModal(true);
        trackEvent("stamp_download", "mobile_modal", "photo_stamp");
        setIsDownloading(false);
        return;
      }

      // Desktop: Use traditional download link
      const link = document.createElement("a");
      link.download = `photo-stamp-${Date.now()}.png`;
      link.href = stampedImage;
      link.click();
      trackEvent("stamp_download", "desktop", "photo_stamp");
    } catch (err) {
      console.error("Download error:", err);
      // Fallback to basic download
      const link = document.createElement("a");
      link.download = `photo-stamp-${Date.now()}.png`;
      link.href = stampedImage;
      link.click();
      trackEvent("stamp_download", "fallback", "photo_stamp");
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate IG Story version (9:16 aspect ratio)
  const generateStoryImage = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!stampedImage) {
        reject(new Error("No stamp image available"));
        return;
      }

      // Load both the stamp image and background image
      const stampImg = new Image();
      const bgImg = new Image();
      let stampLoaded = false;
      let bgLoaded = false;

      const tryRender = () => {
        if (!stampLoaded || !bgLoaded) return;

        // IG Story dimensions: 1080x1920 (9:16)
        const storyWidth = 1080;
        const storyHeight = 1920;
        
        const canvas = document.createElement("canvas");
        canvas.width = storyWidth;
        canvas.height = storyHeight;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Draw crumpled paper background (cover the entire canvas)
        const bgAspect = bgImg.width / bgImg.height;
        const canvasAspect = storyWidth / storyHeight;
        let bgDrawWidth: number;
        let bgDrawHeight: number;
        let bgDrawX: number;
        let bgDrawY: number;

        if (bgAspect > canvasAspect) {
          // Background is wider, fit by height
          bgDrawHeight = storyHeight;
          bgDrawWidth = bgDrawHeight * bgAspect;
          bgDrawX = (storyWidth - bgDrawWidth) / 2;
          bgDrawY = 0;
        } else {
          // Background is taller, fit by width
          bgDrawWidth = storyWidth;
          bgDrawHeight = bgDrawWidth / bgAspect;
          bgDrawX = 0;
          bgDrawY = (storyHeight - bgDrawHeight) / 2;
        }
        
        ctx.drawImage(bgImg, bgDrawX, bgDrawY, bgDrawWidth, bgDrawHeight);

        // ===== HAND-DRAWN DOODLE YEAR OVERLAY =====
        // Render current year with playful sketchy hand-drawn style
        ctx.save();
        
        const currentYear = new Date().getFullYear().toString();
        
        // Create a temporary canvas for the doodle year
        const yearCanvas = document.createElement("canvas");
        yearCanvas.width = storyWidth;
        yearCanvas.height = storyHeight;
        const yearCtx = yearCanvas.getContext("2d");
        
        if (yearCtx) {
          // Draw the crumpled paper texture as base for blending
          yearCtx.drawImage(bgImg, bgDrawX, bgDrawY, bgDrawWidth, bgDrawHeight);
          
          yearCtx.globalCompositeOperation = "multiply";
          
          // Position: slightly offset for editorial feel
          const baseX = storyWidth / 2 - 320;
          const baseY = storyHeight / 2 - 40;
          const digitSpacing = 165;
          
          // Ink color - muted brown/gray for nostalgic feel
          const inkColor = "rgba(55, 45, 40, 1)";
          
          // Helper function to draw a sketchy line with varying thickness
          const drawSketchyLine = (
            x1: number, y1: number, 
            x2: number, y2: number, 
            baseWidth: number,
            passes: number = 3
          ) => {
            for (let pass = 0; pass < passes; pass++) {
              yearCtx.beginPath();
              yearCtx.strokeStyle = inkColor;
              // Vary thickness for hand-drawn feel
              yearCtx.lineWidth = baseWidth * (0.6 + Math.random() * 0.8);
              yearCtx.lineCap = "round";
              yearCtx.lineJoin = "round";
              
              // Add slight jitter to start/end points
              const jitter = 3;
              const sx = x1 + (Math.random() - 0.5) * jitter;
              const sy = y1 + (Math.random() - 0.5) * jitter;
              const ex = x2 + (Math.random() - 0.5) * jitter;
              const ey = y2 + (Math.random() - 0.5) * jitter;
              
              // Draw with slight curve for organic feel
              const midX = (sx + ex) / 2 + (Math.random() - 0.5) * 8;
              const midY = (sy + ey) / 2 + (Math.random() - 0.5) * 8;
              
              yearCtx.moveTo(sx, sy);
              yearCtx.quadraticCurveTo(midX, midY, ex, ey);
              yearCtx.globalAlpha = 0.15 + Math.random() * 0.2;
              yearCtx.stroke();
            }
          };
          
          // Helper function to draw a sketchy curve
          const drawSketchyCurve = (
            cx: number, cy: number,
            radius: number,
            startAngle: number,
            endAngle: number,
            baseWidth: number
          ) => {
            const steps = 12;
            const angleStep = (endAngle - startAngle) / steps;
            
            for (let pass = 0; pass < 3; pass++) {
              yearCtx.beginPath();
              yearCtx.strokeStyle = inkColor;
              yearCtx.lineWidth = baseWidth * (0.5 + Math.random() * 0.7);
              yearCtx.lineCap = "round";
              yearCtx.globalAlpha = 0.12 + Math.random() * 0.18;
              
              const radiusJitter = radius + (Math.random() - 0.5) * 6;
              
              for (let i = 0; i <= steps; i++) {
                const angle = startAngle + i * angleStep;
                const r = radiusJitter + (Math.random() - 0.5) * 8;
                const x = cx + Math.cos(angle) * r + (Math.random() - 0.5) * 4;
                const y = cy + Math.sin(angle) * r + (Math.random() - 0.5) * 4;
                
                if (i === 0) {
                  yearCtx.moveTo(x, y);
                } else {
                  yearCtx.lineTo(x, y);
                }
              }
              yearCtx.stroke();
            }
          };
          
          // Draw each digit with doodle style
          const drawDoodleDigit = (digit: string, x: number, y: number, size: number) => {
            const w = size * 0.6;  // width
            const h = size;       // height
            const sw = size * 0.08; // stroke width base
            
            // Add slight rotation for playful feel
            yearCtx.save();
            yearCtx.translate(x + w/2, y + h/2);
            yearCtx.rotate((Math.random() - 0.5) * 0.08);
            yearCtx.translate(-(x + w/2), -(y + h/2));
            
            switch (digit) {
              case '0':
                // Oval shape with imperfect curves
                drawSketchyCurve(x + w/2, y + h/2, Math.min(w, h) * 0.45, 0, Math.PI * 2, sw);
                drawSketchyCurve(x + w/2, y + h/2, Math.min(w, h) * 0.42, 0.2, Math.PI * 2.2, sw * 0.7);
                break;
                
              case '1':
                // Vertical line with small serif/flag
                drawSketchyLine(x + w * 0.3, y + h * 0.15, x + w * 0.55, y + h * 0.05, sw);
                drawSketchyLine(x + w * 0.5, y + h * 0.05, x + w * 0.5, y + h * 0.95, sw * 1.2);
                drawSketchyLine(x + w * 0.25, y + h * 0.95, x + w * 0.75, y + h * 0.95, sw);
                break;
                
              case '2':
                // Curved top, diagonal, base
                drawSketchyCurve(x + w * 0.5, y + h * 0.25, w * 0.4, -Math.PI * 0.8, Math.PI * 0.3, sw);
                drawSketchyLine(x + w * 0.8, y + h * 0.35, x + w * 0.15, y + h * 0.92, sw);
                drawSketchyLine(x + w * 0.1, y + h * 0.95, x + w * 0.9, y + h * 0.95, sw * 1.1);
                break;
                
              case '3':
                // Two curves
                drawSketchyCurve(x + w * 0.45, y + h * 0.25, w * 0.38, -Math.PI * 0.7, Math.PI * 0.4, sw);
                drawSketchyCurve(x + w * 0.45, y + h * 0.72, w * 0.42, -Math.PI * 0.4, Math.PI * 0.7, sw);
                break;
                
              case '4':
                // Angled lines
                drawSketchyLine(x + w * 0.65, y + h * 0.05, x + w * 0.1, y + h * 0.6, sw);
                drawSketchyLine(x + w * 0.08, y + h * 0.62, x + w * 0.92, y + h * 0.62, sw);
                drawSketchyLine(x + w * 0.65, y + h * 0.05, x + w * 0.65, y + h * 0.95, sw * 1.1);
                break;
                
              case '5':
                // Top, curve down
                drawSketchyLine(x + w * 0.8, y + h * 0.08, x + w * 0.2, y + h * 0.08, sw);
                drawSketchyLine(x + w * 0.2, y + h * 0.08, x + w * 0.18, y + h * 0.42, sw);
                drawSketchyCurve(x + w * 0.5, y + h * 0.65, w * 0.42, -Math.PI * 0.5, Math.PI * 0.75, sw);
                break;
                
              case '6':
                // Curved with loop
                drawSketchyCurve(x + w * 0.5, y + h * 0.35, w * 0.35, -Math.PI * 0.2, Math.PI * 1.2, sw);
                drawSketchyCurve(x + w * 0.5, y + h * 0.68, w * 0.38, 0, Math.PI * 2, sw);
                break;
                
              case '7':
                // Top bar and diagonal
                drawSketchyLine(x + w * 0.1, y + h * 0.08, x + w * 0.9, y + h * 0.08, sw * 1.1);
                drawSketchyLine(x + w * 0.85, y + h * 0.08, x + w * 0.35, y + h * 0.95, sw);
                // Optional cross stroke
                drawSketchyLine(x + w * 0.35, y + h * 0.5, x + w * 0.7, y + h * 0.48, sw * 0.6);
                break;
                
              case '8':
                // Two loops
                drawSketchyCurve(x + w * 0.5, y + h * 0.28, w * 0.35, 0, Math.PI * 2, sw);
                drawSketchyCurve(x + w * 0.5, y + h * 0.7, w * 0.4, 0, Math.PI * 2, sw);
                break;
                
              case '9':
                // Loop and tail
                drawSketchyCurve(x + w * 0.5, y + h * 0.32, w * 0.38, 0, Math.PI * 2, sw);
                drawSketchyCurve(x + w * 0.5, y + h * 0.65, w * 0.35, -Math.PI * 0.2, Math.PI * 1.2, sw);
                break;
            }
            
            yearCtx.restore();
          };
          
          // Draw each digit of the year
          currentYear.split('').forEach((digit, index) => {
            const digitX = baseX + index * digitSpacing + (Math.random() - 0.5) * 10;
            const digitY = baseY + (Math.random() - 0.5) * 15;
            drawDoodleDigit(digit, digitX, digitY, 280);
          });
          
          // Add ink bleed/splatter effects
          yearCtx.globalCompositeOperation = "multiply";
          yearCtx.globalAlpha = 0.06;
          yearCtx.fillStyle = inkColor;
          
          for (let i = 0; i < 60; i++) {
            const x = baseX + Math.random() * (digitSpacing * 4 + 100) - 50;
            const y = baseY + Math.random() * 320 - 20;
            const size = Math.random() * 4 + 1;
            yearCtx.beginPath();
            yearCtx.arc(x, y, size, 0, Math.PI * 2);
            yearCtx.fill();
          }
          
          // Add subtle ink texture variation
          yearCtx.globalCompositeOperation = "destination-out";
          yearCtx.globalAlpha = 0.1;
          for (let i = 0; i < 100; i++) {
            const x = baseX + Math.random() * (digitSpacing * 4);
            const y = baseY + Math.random() * 280;
            yearCtx.beginPath();
            yearCtx.arc(x, y, Math.random() * 3 + 0.5, 0, Math.PI * 2);
            yearCtx.fill();
          }
          
          yearCtx.globalCompositeOperation = "source-over";
          yearCtx.globalAlpha = 1;
        }
        
        // Composite doodle year onto main canvas with multiply blend
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.22; // Low opacity for subtle nostalgic effect
        ctx.filter = "blur(0.5px)"; // Slight blur for ink bleed
        ctx.drawImage(yearCanvas, 0, 0);
        ctx.filter = "none";
        
        // Reset composite mode
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        
        ctx.restore();

        // Calculate stamp size - make it prominent but leave breathing room
        // Stamp should be about 85% of width, centered
        const stampMaxWidth = storyWidth * 0.85;
        const stampMaxHeight = storyHeight * 0.55; // Leave room for safe areas
        
        const stampAspectRatio = stampImg.width / stampImg.height;
        let stampWidth: number;
        let stampHeight: number;
        
        if (stampAspectRatio > stampMaxWidth / stampMaxHeight) {
          stampWidth = stampMaxWidth;
          stampHeight = stampWidth / stampAspectRatio;
        } else {
          stampHeight = stampMaxHeight;
          stampWidth = stampHeight * stampAspectRatio;
        }

        // Center stamp, slightly above center for visual balance
        const stampX = (storyWidth - stampWidth) / 2;
        const stampY = (storyHeight - stampHeight) / 2 - 50;

        // Add shadow behind stamp
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;
        
        // Draw stamp
        ctx.drawImage(stampImg, stampX, stampY, stampWidth, stampHeight);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add decorative text at bottom
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.textAlign = "center";
        ctx.fillText("✦ PHOTO STAMP BY pedwork.co ✦", storyWidth / 2, storyHeight - 120);
        
        if (locationText) {
          ctx.font = "18px 'Courier New', monospace";
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillText(`From ${locationText}`, storyWidth / 2, storyHeight - 85);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create image blob"));
          }
        }, "image/png", 1.0);
      };

      stampImg.onload = () => {
        stampLoaded = true;
        tryRender();
      };
      
      stampImg.onerror = () => {
        reject(new Error("Failed to load stamp image"));
      };

      bgImg.onload = () => {
        bgLoaded = true;
        tryRender();
      };

      bgImg.onerror = () => {
        reject(new Error("Failed to load background image"));
      };
      
      stampImg.src = stampedImage;
      bgImg.src = "/images/Crumpled-white-paper-texture-background-768x512.jpg";
    });
  }, [stampedImage, locationText]);

  // Share to Instagram Story
  const handleShareToIG = async () => {
    if (!stampedImage) return;
    
    setIsGeneratingStory(true);
    setShareError(null);
    
    try {
      const storyBlob = await generateStoryImage();
      const storyFile = new File([storyBlob], `photo-stamp-story-${Date.now()}.png`, {
        type: "image/png",
      });

      if (canShare) {
        await navigator.share({
          title: "Photo Stamp by pedwork.co",
          text: locationText ? `Memories from ${locationText}` : "My Photo Stamp",
          files: [storyFile],
        });
        trackEvent("stamp_share_ig", "web_share", "photo_stamp");
      } else {
        // Fallback: Download the story image
        const url = URL.createObjectURL(storyBlob);
        const link = document.createElement("a");
        link.download = `photo-stamp-story-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setShareError("Download complete! Open Instagram and share to your Story.");
        trackEvent("stamp_share_ig", "fallback_download", "photo_stamp");
      }
    } catch (err) {
      if (err instanceof Error) {
        // User cancelled share - not an error
        if (err.name === "AbortError") {
          // Do nothing
        } else {
          setShareError(err.message);
        }
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Download story image directly
  const handleDownloadStory = async () => {
    if (!stampedImage) return;
    
    setIsGeneratingStory(true);
    setShareError(null);
    
    try {
      const storyBlob = await generateStoryImage();
      const url = URL.createObjectURL(storyBlob);
      const link = document.createElement("a");
      link.download = `photo-stamp-story-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      trackEvent("stamp_download", "story", "photo_stamp");
    } catch (err) {
      if (err instanceof Error) {
        setShareError(err.message);
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAppState("idle");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30">
              <Stamp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight mb-3">
            Photo Stamp
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md mx-auto">
            Transform your photos into vintage-style postage stamps
          </p>
          
          {/* Location Status */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm" suppressHydrationWarning>
            {isLoadingLocation ? (
              <span className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting location...
              </span>
            ) : locationText ? (
              <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
                {locationText}
              </span>
            ) : locationError ? (
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Enable location for personalized stamps</span>
              </button>
            ) : null}
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-medium">
                Error
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          {/* Idle State - Start Screen */}
          {appState === "idle" && (
            <div className="text-center animate-fade-in-up">
              <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl shadow-amber-900/5 dark:shadow-black/20 border border-amber-100 dark:border-zinc-700">
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  {/* Decorative stamp outline */}
                  <svg
                    viewBox="0 0 120 120"
                    className="w-full h-full text-amber-400"
                  >
                    <defs>
                      <pattern
                        id="perforation"
                        patternUnits="userSpaceOnUse"
                        width="12"
                        height="12"
                      >
                        <circle cx="6" cy="0" r="3" fill="currentColor" />
                      </pattern>
                    </defs>
                    {/* Stamp shape with perforations */}
                    <rect
                      x="10"
                      y="10"
                      width="100"
                      height="100"
                      rx="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                    />
                    <rect
                      x="18"
                      y="18"
                      width="84"
                      height="84"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                  <ImageIcon className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
                  Create Your Photo Stamp
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Take a photo or upload an image to create a vintage stamp
                  {locationText && (
                    <span className="block mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                      📍 From {locationText}
                    </span>
                  )}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleStartCamera}
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 active:scale-95 w-full sm:w-auto justify-center"
                  >
                    <Camera className="w-5 h-5" />
                    Camera
                  </button>
                  <button
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold rounded-xl border-2 border-zinc-200 dark:border-zinc-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-600 transition-all duration-300 active:scale-95 w-full sm:w-auto justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { icon: "📸", label: "Capture" },
                  { icon: "✂️", label: "Crop 1:1" },
                  { icon: "📮", label: "Stamp" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur rounded-xl p-4 text-center"
                  >
                    <span className="text-2xl mb-2 block">{feature.icon}</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Camera State */}
          {appState === "camera" && (
            <div className="animate-fade-in-up">
              <CameraPreview
                onCapture={handleCapture}
                onError={handleError}
                isActive={appState === "camera"}
              />
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Instead
                </button>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Processing/Preview State */}
          {appState === "preview" && capturedImage && (
            <div className="animate-fade-in-up text-center">
              <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-amber-100 dark:border-zinc-700">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Creating your stamp...
                </p>
              </div>
              {/* Hidden cropper that processes the image */}
              <ImageCropper
                imageSrc={capturedImage}
                onCropComplete={handleCropComplete}
              />
            </div>
          )}

          {/* Stamped Result State */}
          {appState === "stamped" && croppedImage && (
            <div className="animate-fade-in-up">
              {/* Style Toggle */}
              <div className="flex flex-col items-center gap-3 mb-4">
                {/* Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUseOriginal(false);
                      trackEvent("stamp_style_change", "vintage", "photo_stamp");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useOriginal
                        ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-md"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    Vintage
                  </button>
                  <button
                    onClick={() => {
                      setUseOriginal(true);
                      trackEvent("stamp_style_change", "original", "photo_stamp");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useOriginal
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Original
                  </button>
                </div>

                {/* Color Picker - only show for Vintage mode */}
                {!useOriginal && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Color:</span>
                    {[
                      { id: "blue", color: "bg-blue-600", ring: "ring-blue-600" },
                      { id: "sepia", color: "bg-amber-700", ring: "ring-amber-700" },
                      { id: "green", color: "bg-emerald-700", ring: "ring-emerald-700" },
                      { id: "red", color: "bg-red-700", ring: "ring-red-700" },
                      { id: "purple", color: "bg-purple-700", ring: "ring-purple-700" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setVintageColor(c.id as typeof vintageColor);
                          trackEvent("stamp_color_change", c.id, "photo_stamp");
                        }}
                        className={`w-7 h-7 rounded-full ${c.color} transition-all hover:scale-110 ${
                          vintageColor === c.id
                            ? `ring-2 ${c.ring} ring-offset-2 ring-offset-white dark:ring-offset-zinc-900`
                            : "opacity-60 hover:opacity-100"
                        }`}
                        aria-label={`${c.id} color`}
                      />
                    ))}
                  </div>
                )}

                {/* Postmark Toggle */}
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => {
                      const newState = !postmarkEnabled;
                      setPostmarkEnabled(newState);
                      trackEvent("stamp_postmark_toggle", newState ? "on" : "off", "photo_stamp");
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      postmarkEnabled
                        ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <Circle className="w-4 h-4" />
                    Postmark
                  </button>
                  
                  {postmarkEnabled && (
                    <>
                      {/* Position Selector */}
                      <div className="flex items-center gap-1">
                        {[
                          { id: "bottom-right", label: "↘" },
                          { id: "bottom-left", label: "↙" },
                          { id: "top-right", label: "↗" },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setPostmarkPosition(pos.id as typeof postmarkPosition)}
                            className={`w-7 h-7 rounded text-sm font-bold transition-all ${
                              postmarkPosition === pos.id
                                ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                            }`}
                            aria-label={pos.id}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Postmark Color */}
                      <div className="flex items-center gap-1">
                        {[
                          { id: "blue", color: "bg-blue-900" },
                          { id: "red", color: "bg-red-900" },
                          { id: "black", color: "bg-zinc-900" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setPostmarkColor(c.id as typeof postmarkColor)}
                            className={`w-6 h-6 rounded-full ${c.color} transition-all hover:scale-110 ${
                              postmarkColor === c.id
                                ? "ring-2 ring-zinc-400 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"
                                : "opacity-50 hover:opacity-100"
                            }`}
                            aria-label={`${c.id} postmark`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stamp Preview */}
              <StampFrame 
                imageSrc={croppedImage} 
                location={locationText}
                useOriginal={useOriginal}
                vintageColor={vintageColor}
                postmark={{
                  enabled: postmarkEnabled,
                  position: postmarkPosition,
                  color: postmarkColor,
                }}
                onStampReady={handleStampReady} 
              />

              {/* Location indicator */}
              {locationText && (
                <div className="text-center mt-4">
                  <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    Stamped from {locationText}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-4 mt-6">
                {/* Primary Actions Row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                  <button
                    onClick={handleRetake}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm w-full sm:w-auto justify-center"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {sourceType === "camera" ? "Retake" : "Choose Another"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!stampedImage || isDownloading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:shadow-none transition-all active:scale-95 w-full sm:w-auto justify-center"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {isMobile ? "Save to Photos" : "Download"}
                      </>
                    )}
                  </button>
                </div>

                {/* Share to IG Story Section */}
                <div className="w-full pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleShareToIG}
                      disabled={!stampedImage || isGeneratingStory}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 disabled:shadow-none transition-all active:scale-95 w-full sm:w-auto justify-center"
                    >
                      {isGeneratingStory ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5" />
                          Share to IG Story
                        </>
                      )}
                    </button>
                    
                    {/* Hint text for non-share browsers */}
                    {!canShare && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        Downloads 9:16 image for Instagram Story
                      </p>
                    )}
                    
                    {/* Download story as alternative */}
                    {canShare && (
                      <button
                        onClick={handleDownloadStory}
                        disabled={!stampedImage || isGeneratingStory}
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline underline-offset-4 transition-colors disabled:opacity-50"
                      >
                        Or download story image
                      </button>
                    )}
                    
                    {/* Share error/success message */}
                    {shareError && (
                      <p className={`text-sm text-center px-4 py-2 rounded-lg ${
                        shareError.includes("complete") 
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" 
                          : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                      }`}>
                        {shareError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset Link */}
              <div className="text-center mt-6">
                <button
                  onClick={handleReset}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm underline underline-offset-4 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 md:mt-16 text-zinc-500 dark:text-zinc-500 text-sm animate-fade-in-up delay-300">
          <p>All processing happens locally in your browser</p>
          <p className="mt-1 text-zinc-400 dark:text-zinc-600">
            No images are uploaded to any server
          </p>
        </footer>
      </div>

      {/* Mobile Save Modal - for iOS/mobile photo gallery saving */}
      {showSaveModal && stampedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSaveModal(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
                Save to Photos
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Press and hold the image below, then tap <strong>&quot;Add to Photos&quot;</strong> or <strong>&quot;Save Image&quot;</strong>
              </p>
            </div>

            {/* Image to save */}
            <div className="relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stampedImage}
                alt="Photo Stamp - Press and hold to save"
                className="w-full h-auto"
                style={{ touchAction: "none" }}
              />
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-800/40 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 text-lg">👆</span>
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">How to save:</p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300">
                    <li>Press and hold the image above</li>
                    <li>Tap &quot;Add to Photos&quot; or &quot;Save Image&quot;</li>
                    <li>Find it in your photo gallery!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Alternative: Try share again */}
            {canShare && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(stampedImage);
                    const blob = await response.blob();
                    const file = new File([blob], `photo-stamp-${Date.now()}.png`, { type: "image/png" });
                    await navigator.share({
                      title: "Photo Stamp",
                      files: [file],
                    });
                    setShowSaveModal(false);
                  } catch {
                    // Ignore if cancelled
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share to Save
              </button>
            )}

            {/* Done button */}
            <button
              onClick={() => setShowSaveModal(false)}
              className="w-full mt-3 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Prompt Banner */}
      {showInstallPrompt && !isPWA && deferredPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-bottom">
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-zinc-700 p-4">
            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Stamp className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">
                  Install Photo Stamp
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Add to home screen for quick access & offline use
                </p>
                
                {/* Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstallPWA}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="px-4 py-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={dismissInstallPrompt}
                className="flex-shrink-0 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions (for Safari) */}
      {isMobile && !isPWA && !showInstallPrompt && !deferredPrompt && appState === "idle" && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => {
              const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
              if (isIOS) {
                alert('To install Photo Stamp:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
              }
            }}
            className="w-full max-w-md mx-auto block text-center text-xs text-zinc-500 dark:text-zinc-400 py-2 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            💡 Add to Home Screen for the best experience
          </button>
        </div>
      )}
    </main>
  );
}
