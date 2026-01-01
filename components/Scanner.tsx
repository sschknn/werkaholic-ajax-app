import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, AlertCircle, RefreshCw, SwitchCamera, Image as ImageIcon, ScanLine, Radio, Check, CopyCheck, Power, Play, Pause, QrCode, Barcode } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { AdAnalysis } from '../types';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useAuth } from '../contexts/AuthContext';

interface ScannerProps {
  onAnalysisComplete: (result: AdAnalysis, image: string) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onAnalysisComplete, onCancel, isEmbedded = false }) => {
  const { user, checkSubscription, updateSubscription } = useAuth();
  const [mode, setMode] = useState<'upload' | 'camera'>('camera'); // Start with camera for live scanning
  const [scanType, setScanType] = useState<'product' | 'barcode'>('product');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<AdAnalysis | null>(null);
  const [isDuplicateScan, setIsDuplicateScan] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);

  // New: Manual Pause/Standby state
  const [isPaused, setIsPaused] = useState(false);

  // Error handling state
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Canvas drawing state
  const [isDrawing, setIsDrawing] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<any>({ plan: 'free', scansUsed: 0, resetDate: new Date().toISOString() });

  // Touch gesture state for mobile UX
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);

  // Track last successful scan to prevent duplicates
  const lastSuccessRef = useRef<{ title: string, time: number } | null>(null);

  // Stop camera when unmounting or switching modes
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  // Check subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      if (user) {
        const sub = await checkSubscription(user.uid);
        setSubscription(sub);
      } else {
        setSubscription({ plan: 'free', scansUsed: 0, resetDate: new Date().toISOString() });
      }
    };
    loadSubscription();
  }, [user, checkSubscription]);

  // Check if user has exceeded free plan limit
  const checkScanLimit = () => {
    if (subscription.plan === 'free' && subscription.scansUsed >= 11) {
      setError('Free-Version: 11 Scans pro Tag erreicht. Upgrade auf Pro für unbegrenzte Scans.');
      setIsQuotaExceeded(true);
      return false;
    }
    return true;
  };

  // Check if user is Pro
  const isProUser = subscription.plan === 'pro';

  // Increment scan counter
  const incrementScanCounter = async () => {
    if (user && subscription.plan === 'free') {
      const newCount = subscription.scansUsed + 1;
      console.log('Incrementing scan counter from', subscription.scansUsed, 'to', newCount);
      const newSub = { ...subscription, scansUsed: newCount };
      setSubscription(newSub);
      await updateSubscription(user.uid, newSub);
      console.log('Scan counter updated in Firestore');
    } else {
      console.log('Not incrementing counter: user=', !!user, 'plan=', subscription.plan);
    }
  };

  // Simplified camera initialization
  useEffect(() => {
    console.log('🎥 useEffect:', { mode, image: !!image, isPaused, isQuotaExceeded });

    // Always try to start camera when in camera mode
    if (mode === 'camera' && !image && !isPaused) {
      console.log('🎥 Starting camera from useEffect');
      // Small delay to ensure DOM is ready
      setTimeout(() => startCamera(), 100);
    }
  }, [mode]); // Only depend on mode to avoid infinite loops

  // Debug: Log video element visibility
  useEffect(() => {
    const checkVideoVisibility = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        const computedStyle = getComputedStyle(videoRef.current);
        console.log('🎥 VIDEO VISIBILITY CHECK:', {
          offsetWidth: videoRef.current.offsetWidth,
          offsetHeight: videoRef.current.offsetHeight,
          clientWidth: videoRef.current.clientWidth,
          clientHeight: videoRef.current.clientHeight,
          boundingRect: rect,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          zIndex: computedStyle.zIndex,
          position: computedStyle.position,
          top: computedStyle.top,
          left: computedStyle.left,
          width: computedStyle.width,
          height: computedStyle.height,
          srcObject: !!videoRef.current.srcObject,
          readyState: videoRef.current.readyState,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
          paused: videoRef.current.paused,
          muted: videoRef.current.muted
        });
      } else {
        console.log('🎥 VIDEO REF IS NULL');
      }
    };

    // Check immediately and after a delay
    checkVideoVisibility();
    setTimeout(checkVideoVisibility, 2000);
  }, [cameraActive, mode]);

  // Debug: Log canvas visibility and container CSS
  useEffect(() => {
    const checkCanvasAndContainerVisibility = () => {
      // Canvas visibility
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const canvasStyle = getComputedStyle(canvasRef.current);
        console.log('🎨 CANVAS VISIBILITY CHECK:', {
          offsetWidth: canvasRef.current.offsetWidth,
          offsetHeight: canvasRef.current.offsetHeight,
          boundingRect: canvasRect,
          display: canvasStyle.display,
          visibility: canvasStyle.visibility,
          opacity: canvasStyle.opacity,
          zIndex: canvasStyle.zIndex,
          className: canvasRef.current.className
        });
      } else {
        console.log('🎨 CANVAS REF IS NULL');
      }

      // Container CSS (the main scanner div)
      const scannerContainer = document.querySelector('[role="main"][aria-label="Produkt-Scanner"]') as HTMLElement;
      if (scannerContainer) {
        const containerRect = scannerContainer.getBoundingClientRect();
        const containerStyle = getComputedStyle(scannerContainer);
        console.log('📦 SCANNER CONTAINER CSS CHECK:', {
          offsetWidth: scannerContainer.offsetWidth,
          offsetHeight: scannerContainer.offsetHeight,
          clientWidth: scannerContainer.clientWidth,
          clientHeight: scannerContainer.clientHeight,
          boundingRect: containerRect,
          display: containerStyle.display,
          visibility: containerStyle.visibility,
          opacity: containerStyle.opacity,
          zIndex: containerStyle.zIndex,
          overflow: containerStyle.overflow,
          position: containerStyle.position
        });
      } else {
        console.log('📦 SCANNER CONTAINER NOT FOUND');
      }

      // Dashboard Card Container
      const cardContainer = document.querySelector('.min-h-\\[600px\\]') as HTMLElement;
      if (cardContainer) {
        const cardRect = cardContainer.getBoundingClientRect();
        const cardStyle = getComputedStyle(cardContainer);
        console.log('🃏 DASHBOARD CARD CSS CHECK:', {
          offsetWidth: cardContainer.offsetWidth,
          offsetHeight: cardContainer.offsetHeight,
          clientWidth: cardContainer.clientWidth,
          clientHeight: cardContainer.clientHeight,
          boundingRect: cardRect,
          display: cardStyle.display,
          visibility: cardStyle.visibility,
          opacity: cardStyle.opacity,
          zIndex: cardStyle.zIndex,
          overflow: cardStyle.overflow,
          position: cardStyle.position
        });
      } else {
        console.log('🃏 DASHBOARD CARD NOT FOUND');
      }
    };

    // Check after component mounts and when camera state changes
    setTimeout(checkCanvasAndContainerVisibility, 1000);
    setTimeout(checkCanvasAndContainerVisibility, 3000);
  }, [cameraActive, mode]);

  // Debug: Log component mount status
  useEffect(() => {
    console.log('🔧 SCANNER COMPONENT MOUNTED:', {
      isEmbedded,
      mode,
      cameraActive,
      isPaused,
      isQuotaExceeded,
      image: !!image
    });

    return () => {
      console.log('🔧 SCANNER COMPONENT UNMOUNTED');
    };
  }, []);

  // Canvas drawing loop
  useEffect(() => {
    if (isDrawing && videoRef.current && canvasRef.current) {
      const draw = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState === 4) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
        }
        if (isDrawing) {
          requestAnimationFrame(draw);
        }
      };
      draw();
    }
  }, [isDrawing]);

  const startCamera = async () => {

    // Force camera start regardless of complex conditions
    if (mode !== 'camera') {
      console.log('🎥 Not in camera mode, switching to camera');
      setMode('camera');
      return;
    }

    if (image) {
      console.log('🎥 Clearing image to start camera');
      setImage(null);
    }

    setError(null);
    setCameraActive(false);

    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('🔍 DEBUG: getUserMedia not supported');
        throw new Error("getUserMedia not supported");
      }

      // Request camera with fallback options
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (fallbackError) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true // Basic video request
        });
      }

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      console.log('🎥 STEP 4: Setting up video element...');
      const video = videoRef.current;

      // Clear any existing stream
      if (video.srcObject) {
        const oldStream = video.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
      }

      // Set up the stream
      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      console.log('🎥 STEP 5: Video properties:');
      console.log('🎥 - srcObject set:', !!video.srcObject);
      console.log('🎥 - muted:', video.muted);
      console.log('🎥 - autoplay:', video.autoplay);
      console.log('🎥 - playsInline:', video.playsInline);

      setCameraActive(true);
      setIsDrawing(true);

      // Wait for video to be ready with multiple fallbacks
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log('🎥 STEP 6: Video loading timeout - continuing anyway');
          // Don't reject, continue with what we have
          resolve();
        }, 5000); // Reduced timeout

        let hasLoaded = false;
        const markLoaded = () => {
          if (hasLoaded) return;
          hasLoaded = true;
          clearTimeout(timeout);
          console.log('🎥 STEP 6: Video metadata loaded');
          console.log('🎥 - Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          console.log('🎥 - Ready state:', video.readyState);
          resolve();
        };

        // Try multiple event listeners for robustness
        video.onloadedmetadata = markLoaded;
        video.onloadeddata = markLoaded;
        video.oncanplay = markLoaded;

        // Also check after a short delay if events don't fire
        setTimeout(() => {
          if (!hasLoaded && video.readyState >= 2) {
            console.log('🎥 STEP 6: Video ready via readyState check');
            markLoaded();
          }
        }, 1000);

        video.onerror = (error) => {
          clearTimeout(timeout);
          console.error('🎥 Video error:', error);
          // Still resolve to avoid breaking the camera
          resolve();
        };
      });

      console.log('🎥 STEP 8: Starting auto-scan...');
      startAutoScan();

      console.log('🎥 CAMERA START COMPLETE - SUCCESS!');
    } catch (err: any) {
      console.error("🔍 DEBUG: Camera Error:", err);
      console.error("🔍 DEBUG: Error name:", err.name);
      console.error("🔍 DEBUG: Error message:", err.message);

      let errorMessage = "Kamera konnte nicht gestartet werden.";
      if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
        errorMessage = "Kamera-Zugriff verweigert. Bitte erlaube den Kamera-Zugriff und lade die Seite neu.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Keine Kamera gefunden. Bitte stelle sicher, dass eine Kamera angeschlossen ist.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Kamera wird bereits von einer anderen Anwendung verwendet.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Kamera unterstützt die gewünschten Einstellungen nicht.";
      }

      setError(errorMessage + " Verwende Upload-Modus.");

      // Don't auto-switch to upload mode, let user decide
      // setMode('upload');
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setIsDrawing(false);
    }
  };

  const togglePause = () => {
    if (isQuotaExceeded) {
      setIsQuotaExceeded(false);
      setIsPaused(false);
      setError(null);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const startAutoScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (isQuotaExceeded || isPaused) return;

    setIsDuplicateScan(false);

    // Check every 18 seconds to avoid Rate Limits (429)
    scanIntervalRef.current = window.setInterval(() => {
      if (!isAnalyzing && mode === 'camera' && !image && !isPaused && !isQuotaExceeded) {
        attemptAutoCapture();
      }
    }, 18000);
  };

  const handleScanSuccess = (result: AdAnalysis, dataUrl: string, isManual: boolean = false) => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    // --- Duplicate Detection ---
    if (!isManual && lastSuccessRef.current) {
      const now = Date.now();
      const timeDiff = now - lastSuccessRef.current.time;

      if (timeDiff < 30000) { // 30 seconds cooldown
        const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9äöüß ]/g, '').trim();
        const lastTitle = clean(lastSuccessRef.current.title);
        const newTitle = clean(result.title);

        let isDuplicate = lastTitle === newTitle;

        if (!isDuplicate) {
          const wordsLast = new Set(lastTitle.split(' ').filter(w => w.length > 2));
          const wordsNew = new Set(newTitle.split(' ').filter(w => w.length > 2));

          if (wordsLast.size > 0 && wordsNew.size > 0) {
            let matchCount = 0;
            wordsLast.forEach(w => { if (wordsNew.has(w)) matchCount++; });
            const overlap = matchCount / Math.max(wordsLast.size, wordsNew.size);
            if (overlap > 0.6) isDuplicate = true;
          }
        }

        if (isDuplicate) {
          console.log("Duplicate detected, skipping...");
          setIsDuplicateScan(true);
          setTimeout(() => {
            setIsDuplicateScan(false);
            startAutoScan();
          }, 2000);
          return;
        }
      }
    }

    lastSuccessRef.current = { title: result.title, time: Date.now() };
    setLastScannedResult(result);
    setImage(dataUrl);

    const speakText = `Gefunden: ${result.title}. Geschätzter Wert: ${result.price_estimate}.`;
    speakResult(speakText);

    onAnalysisComplete(result, dataUrl);

    setTimeout(() => {
      setImage(null);
      setLastScannedResult(null);
      startAutoScan();
    }, 4000);
  };

  const attemptAutoCapture = useCallback(async () => {
    if (videoRef.current && canvasRef.current && !isAnalyzing && !isQuotaExceeded && !isPaused) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState !== 4) return;

      console.log('📸 ATTEMPT AUTO CAPTURE - drawImage called:', {
        videoReadyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('📸 drawImage called and executed');
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        console.log('📸 toDataURL called - dataUrl length:', dataUrl.length);

        setIsAnalyzing(true);
        try {
          const result = await analyzeImage(dataUrl);

          if (result.item_detected) {
            handleScanSuccess(result, dataUrl, false);
          } else {
            console.log("No valid item detected, scanning continues...");
          }
        } catch (e: any) {
          console.error("Silent scan error", e);

          const errStr = JSON.stringify(e) + (e.message || "");
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
            setIsQuotaExceeded(true);
            setIsPaused(true); // Force pause on error
            setError("⚠️ API-Limit erreicht. Scanner pausiert.");
            setIsAnalyzing(false);
            return;
          }
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  }, [isAnalyzing, mode, onAnalysisComplete, isQuotaExceeded, isPaused]);

  const handleManualCapture = async () => {
    if (isQuotaExceeded) {
      setError("API Limit erreicht. Bitte warten.");
      return;
    }

    if (!checkScanLimit()) {
      return;
    }

    if (videoRef.current && canvasRef.current && !isAnalyzing) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log('📸 MANUAL CAPTURE - drawImage called:', {
        videoReadyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('📸 MANUAL drawImage executed');
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('📸 MANUAL toDataURL executed - dataUrl length:', dataUrl.length);

        setIsAnalyzing(true);
        setError(null);
        setIsDuplicateScan(false);

        try {
          const result = await analyzeImage(dataUrl);
          if (result.item_detected) {
            await incrementScanCounter();
            handleScanSuccess(result, dataUrl, true);
          } else {
            setError("Kein Objekt erkannt.");
            setTimeout(() => setError(null), 3000);
          }
        } catch (err: any) {
          const errStr = JSON.stringify(err) + (err.message || "");
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
            setIsQuotaExceeded(true);
            setIsPaused(true);
            setError("⚠️ API-Limit erreicht.");
          } else {
            setError("Fehler bei der Analyse.");
            setTimeout(() => setError(null), 3000);
          }
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const speakResult = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setError(null);
        handleAnalyze(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanBarcode = async (imageData: string): Promise<string | null> => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      const img = new Image();
      img.src = imageData;

      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const result = await codeReader.decodeFromImage(img);
            resolve(result.getText());
          } catch (err) {
            if (err instanceof NotFoundException) {
              resolve(null);
            } else {
              console.error('Barcode scan error:', err);
              resolve(null);
            }
          }
        };
        img.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Barcode scanner initialization error:', error);
      return null;
    }
  };

  const handleAnalyze = async (imgToAnalyze?: string, isRetry = false) => {
    const targetImage = imgToAnalyze || image;
    if (!targetImage) return;

    if (!checkScanLimit()) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setBarcodeResult(null);
    setLastError(null);

    if (!isRetry) {
      setRetryCount(0);
    }

    try {
      if (scanType === 'barcode') {
        // Handle barcode scanning
        const barcodeText = await scanBarcode(targetImage);
        if (barcodeText) {
          setBarcodeResult(barcodeText);
          // Create a mock AdAnalysis for barcode results
          const mockResult: AdAnalysis = {
            item_detected: true,
            title: 'Barcode erkannt',
            price_estimate: 'N/A',
            condition: 'N/A',
            category: 'Barcode',
            description: `Erkannter Code: ${barcodeText}`,
            keywords: [scanType],
            reasoning: 'Barcode erfolgreich gescannt'
          };
          incrementScanCounter();
          onAnalysisComplete(mockResult, targetImage);
        } else {
          setError('Kein Barcode gefunden.');
        }
      } else {
        // Handle product analysis with retry logic
        const result = await analyzeImage(targetImage);
        await incrementScanCounter();
        onAnalysisComplete(result, targetImage);
        setRetryCount(0); // Reset on success
      }
    } catch (err: any) {
      const errStr = JSON.stringify(err) + (err.message || "");
      setLastError(errStr);

      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        setError("⚠️ API-Limit erreicht. Bitte später erneut versuchen.");
        setIsQuotaExceeded(true);
      } else if (retryCount < 2 && !isRetry) {
        // Auto-retry for network errors (max 2 retries)
        setRetryCount(prev => prev + 1);
        setError(`Analyse fehlgeschlagen. Versuche erneut... (${retryCount + 1}/3)`);
        setTimeout(() => handleAnalyze(targetImage, true), 2000);
        return;
      } else {
        setError("Fehler bei der Analyse. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Touch gesture handlers for mobile UX
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal swipes, ignore vertical ones
    if (isVerticalSwipe) return;

    if (isLeftSwipe) {
      // Swipe left: switch to upload mode
      setMode('upload');
    } else if (isRightSwipe) {
      // Swipe right: switch to camera mode
      setMode('camera');
    }
  };

  const resetScanner = () => {
    setImage(null);
    setError(null);
    setIsAnalyzing(false);
    setLastScannedResult(null);
    if (mode === 'camera') startCamera();
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden animate-fade-in relative transition-colors ${isEmbedded ? 'rounded-3xl' : ''}`}
      role="main"
      aria-label="Produkt-Scanner"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!isEmbedded && (
        <div className="p-4 border-b dark:border-slate-800 bg-slate-900 text-white z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {mode === 'camera' ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              {mode === 'camera' ? 'Live Scanner' : 'Foto Upload'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMode(mode === 'camera' ? 'upload' : 'camera')}
                className="text-slate-300 hover:text-white mr-2"
                title="Modus wechseln"
              >
                {mode === 'camera' ? <ImageIcon className="w-6 h-6" /> : <SwitchCamera className="w-6 h-6" />}
              </button>
              <button onClick={onCancel} className="text-slate-400 hover:text-white" title="Schließen">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scan Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setScanType('product')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${scanType === 'product'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              Produkt
            </button>
            <button
              onClick={() => setScanType('barcode')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${scanType === 'barcode'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Barcode className="w-4 h-4" />
              Barcode
            </button>
          </div>
        </div>
      )}

      {/* Embedded Header Controls */}
      {isEmbedded && (
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          {/* Scan Type Selector */}
          <div className="flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
              onClick={() => setScanType('product')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${scanType === 'product'
                ? 'bg-blue-600 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <Sparkles className="w-3 h-3" />
              Produkt
            </button>
            <button
              onClick={() => setScanType('barcode')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${scanType === 'barcode'
                ? 'bg-green-600 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <Barcode className="w-3 h-3" />
              Code
            </button>
          </div>

          {/* Status and Controls */}
          <div className="flex gap-2">
            <div className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-white/10 transition-colors ${isQuotaExceeded ? 'bg-red-500/80 text-white' :
              isPaused ? 'bg-amber-500/80 text-white' :
                'bg-black/40 text-white'
              }`}>
              {isQuotaExceeded ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Limit
                </>
              ) : isPaused ? (
                <>
                  <Pause className="w-3 h-3" />
                  Pause
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  Scan...
                </>
              ) : mode === 'camera' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </>
              ) : 'Upload'}
            </div>

            {/* Power/Pause Button - Disconnect Feature */}
            {mode === 'camera' && (
              <button
                onClick={togglePause}
                className={`backdrop-blur-md p-2 rounded-full transition-colors border border-white/10 ${isPaused || isQuotaExceeded ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                title={isPaused ? "Scanner starten" : "Scanner pausieren"}
              >
                {isPaused || isQuotaExceeded ? <Play className="w-4 h-4 fill-current" /> : <Power className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={() => setMode(mode === 'camera' ? 'upload' : 'camera')}
              className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition-colors border border-white/10"
              title="Modus wechseln"
            >
              {mode === 'camera' ? <ImageIcon className="w-4 h-4" /> : <SwitchCamera className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-900 relative overflow-hidden" style={{ height: '100%', minHeight: '600px' }}>

        {/* Paused State */}
        {(isPaused || isQuotaExceeded) && mode === 'camera' && !image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 text-white p-6 text-center animate-fade-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isQuotaExceeded ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
              <Power className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {isQuotaExceeded ? 'API Limit erreicht' : 'Scanner ist aus'}
            </h3>
            <p className="text-slate-400 mb-6 max-w-xs">
              {isQuotaExceeded
                ? 'Bitte warte einen Moment, bevor du fortfährst.'
                : 'Klicke auf Start, um den Live-Scanner zu aktivieren.'}
            </p>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {isQuotaExceeded ? 'Verbindung testen' : 'Scanner starten'}
            </button>
          </div>
        )}

        {/* Camera View */}
        {mode === 'camera' && !image && !isPaused && !isQuotaExceeded && (
          <div className="absolute inset-0 w-full h-full bg-black" style={{
            zIndex: 1,
            minHeight: '100%',
            height: '100vh',
            maxHeight: '100vh'
          }}>
            {/* Video Element with Better Error Handling */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                minHeight: '100%',
                maxHeight: '100vh',
                objectFit: 'cover',
                zIndex: 5,
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
              onLoadedMetadata={() => {
                console.log('🎥 Video metadata loaded');
              }}
              onCanPlay={() => {
                console.log('🎥 Video can play');
              }}
              onPlaying={() => {
                console.log('🎥 Video playing');
              }}
              onError={(e) => {
                console.error('🎥 Video error:', e);
              }}
            />

            {/* Fallback Visual When No Video */}
            {!cameraActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white z-10">
                <div className="text-center p-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <div className="text-lg font-bold mb-2">Kamera wird geladen...</div>
                  <div className="text-sm text-slate-400">Bitte Kamera-Berechtigung erteilen</div>
                  <button
                    onClick={() => startCamera()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                  >
                    Kamera starten
                  </button>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                minHeight: '100%',
                maxHeight: '100vh',
                objectFit: 'cover',
                zIndex: 6, // Higher than video (5)
                backgroundColor: '#000000',
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
            />



            {/* Radar Scanning Effect */}
            {!isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-lg m-4"></div>
                {/* Scanning Line */}
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 top-0 animate-[scan_5s_ease-in-out_infinite]"></div>

                {/* Crosshairs */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-60 h-60 border border-white/10 rounded-full animate-ping opacity-20"></div>
                  <ScanLine className="w-8 h-8 text-white/50 animate-pulse" />
                </div>

                {/* Duplicate Notification */}
                {isDuplicateScan && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md animate-fade-in flex items-center gap-2 shadow-lg">
                    <CopyCheck className="w-4 h-4" /> Bereits erfasst
                  </div>
                )}

              </div>
            )}

            {/* Manual Trigger Button */}
            <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
              <button
                onClick={handleManualCapture}
                disabled={isAnalyzing || isQuotaExceeded}
                className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label={isAnalyzing ? 'Analyse läuft' : 'Scan starten'}
                aria-disabled={isAnalyzing || isQuotaExceeded}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center relative pointer-events-none">
                  {isAnalyzing ? (
                    <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 animate-spin" aria-hidden="true" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white border-2 border-slate-300 rounded-full transition-transform hover:scale-95" aria-hidden="true"></div>
                  )}
                </div>
              </button>
              <span className="text-white/90 text-xs font-medium bg-black/50 px-2 sm:px-3 py-1 rounded-full backdrop-blur-md" aria-live="polite">
                {isQuotaExceeded ? 'Limit erreicht' : isAnalyzing ? 'Analysiere...' : 'Scan'}
              </span>
              {/* Swipe hint for mobile */}
              <div className="text-white/70 text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm lg:hidden">
                👆 Wischen zum Modus wechseln
              </div>
            </div>

            <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md flex items-center gap-2 border border-white/10 bg-black/50">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              REC
            </div>

            {/* Error Toast */}
            {error && (
              <div
                className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md animate-fade-in flex items-center gap-2 shadow-lg z-50 w-max max-w-[90%] text-center"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label="Fehlermeldung schließen"
                >
                  <X className="w-3 h-3" />
                </button>
                {(error.includes('API-Limit') || error.includes('Fehler')) && (
                  <button
                    onClick={() => {
                      setError(null);
                      if (mode === 'camera') startCamera();
                    }}
                    className="ml-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs transition-colors"
                    aria-label="Erneut versuchen"
                  >
                    <RefreshCw className="w-3 h-3 inline mr-1" />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Mode UI */}
        {mode === 'upload' && !image && (
          <div className="bg-slate-50 dark:bg-slate-900 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
            <div
              onClick={triggerFileSelect}
              className="border-3 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 sm:p-12 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer group text-center max-w-md w-full touch-manipulation"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 dark:text-white mb-2">Foto auswählen</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Tippe hier für Galerie</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label="Foto-Upload"
            />
          </div>
        )}

        {/* Preview / Analysis Overlay */}
        {image && (
          <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <img src={image} alt="Capture" className="w-full h-full object-cover bg-black/50 backdrop-blur-xl opacity-50" loading="lazy" />

              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 className="w-16 h-16 animate-spin text-blue-400 relative z-10" />
                  </div>
                  <p className="mt-6 text-xl font-light tracking-wide">Analysiere Objekt...</p>
                </div>
              )}

              {/* Success Overlay for Camera Mode */}
              {!isAnalyzing && mode === 'camera' && (lastScannedResult || barcodeResult) && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 text-center animate-fade-in">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl animate-bounce ${scanType === 'product' ? 'bg-green-500 shadow-green-500/40' :
                    scanType === 'qr' ? 'bg-purple-500 shadow-purple-500/40' :
                      'bg-blue-500 shadow-blue-500/40'
                    }`}>
                    <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>

                  {scanType === 'product' && lastScannedResult ? (
                    <>
                      <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight">{lastScannedResult.title}</h3>
                      <p className="text-3xl sm:text-4xl font-black text-blue-400 mb-6 sm:mb-8">{lastScannedResult.price_estimate}</p>
                    </>
                  ) : barcodeResult ? (
                    <>
                      <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight">
                        {scanType === 'qr' ? 'QR-Code erkannt' : 'Barcode erkannt'}
                      </h3>
                      <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 max-w-xs sm:max-w-sm">
                        <p className="text-white font-mono text-xs sm:text-sm break-all">{barcodeResult}</p>
                      </div>
                    </>
                  ) : null}

                  <p className="text-xs sm:text-sm text-slate-400 font-medium bg-black/30 px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8">
                    Wurde im Verlauf gespeichert
                  </p>

                  <div className="w-40 sm:w-48 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-white animate-[width_4s_linear] w-full origin-left transform" style={{ animationDuration: '4s', animationName: 'shrink' }}></div>
                  </div>
                  <style>{`
                           @keyframes shrink {
                             from { width: 100%; }
                             to { width: 0%; }
                           }
                        `}</style>
                </div>
              )}
            </div>

            {/* Action Bar for Preview (Only visible if upload mode) */}
            {!isAnalyzing && mode === 'upload' && (
              <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 flex flex-col gap-3 sm:gap-4 relative z-50">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs sm:text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> {error}
                  </div>
                )}
                <button
                  onClick={() => handleAnalyze()}
                  className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 touch-manipulation"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Jetzt Bewerten
                </button>
                <button
                  onClick={resetScanner}
                  className="w-full py-2 sm:py-3 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-2 touch-manipulation"
                >
                  <RefreshCw className="w-4 h-4" />
                  Neues Foto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div >
  );
};

export default Scanner;
