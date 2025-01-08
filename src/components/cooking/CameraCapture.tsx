import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Camera, X } from "lucide-react";
import { useState, useRef } from "react";

interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void;
}

export const CameraCapture = ({ onImageCapture }: CameraCaptureProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTargetOverlay, setShowTargetOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: 16/9
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Wait for video to be loaded before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      }
      setIsCapturing(true);
      setShowTargetOverlay(true);
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: isMobile 
          ? "Unable to access camera. Please check camera permissions in your device settings."
          : "Unable to access camera. Please check browser permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setShowTargetOverlay(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Set canvas size to match video's intrinsic size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and draw the current video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add a marker in the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Convert to base64 with proper compression
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onImageCapture(imageDataUrl);
    stopCamera();
  };

  return (
    <div className="space-y-4">
      {isCapturing ? (
        <div className={`relative ${isMobile ? 'fixed inset-0 z-50 bg-black' : ''}`}>
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`${isMobile ? 'h-full w-full' : 'w-full rounded-lg'} object-cover`}
              style={{ 
                maxHeight: isMobile ? '100vh' : '80vh',
                transform: isMobile ? 'scaleX(-1)' : 'none'
              }}
            />
            {showTargetOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="absolute -inset-4 border-2 border-white/50 rounded-lg" />
                  <p className="text-white bg-black/50 px-4 py-2 rounded text-sm">
                    Click the button below to capture
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button
                onClick={captureImage}
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                Capture Photo
              </Button>
            </div>
          </div>
          <Button
            onClick={stopCamera}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={startCamera}
          variant="outline"
          className="w-full"
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      )}
    </div>
  );
};