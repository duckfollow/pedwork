"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Download, RefreshCcw, Camera, AlertCircle, Stamp, MapPin, Loader2, Upload, ImageIcon, Palette } from "lucide-react";
import CameraPreview from "@/components/CameraPreview";
import ImageCropper from "@/components/ImageCropper";
import StampFrame from "@/components/StampFrame";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request geolocation on mount (non-blocking)
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Try to reverse geocode to get city/country
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
              // Fallback to coordinates
              setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
            }
          } else {
            // Fallback to coordinates if reverse geocoding fails
            setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } catch {
          // Fallback to coordinates if reverse geocoding fails
          setLocationText(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
        
        setIsLoadingLocation(false);
      },
      (err) => {
        setIsLoadingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location unavailable");
        } else {
          setLocationError("Could not get location");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const handleStartCamera = () => {
    setError(null);
    setSourceType("camera");
    setAppState("camera");
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
    setAppState("idle");
  };

  const handleDownload = () => {
    if (!stampedImage) return;

    const link = document.createElement("a");
    link.download = `photo-stamp-${Date.now()}.png`;
    link.href = stampedImage;
    link.click();
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
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
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
                    onClick={() => setUseOriginal(false)}
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
                    onClick={() => setUseOriginal(true)}
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
                        onClick={() => setVintageColor(c.id as typeof vintageColor)}
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
              </div>

              {/* Stamp Preview */}
              <StampFrame 
                imageSrc={croppedImage} 
                location={locationText}
                useOriginal={useOriginal}
                vintageColor={vintageColor}
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm w-full sm:w-auto justify-center"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {sourceType === "camera" ? "Retake" : "Choose Another"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!stampedImage}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:shadow-none transition-all active:scale-95 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download Stamp
                </button>
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
    </main>
  );
}
