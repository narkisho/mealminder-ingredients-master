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
          width: { ideal: isMobile ? window.innerWidth : 1280 },
          height: { ideal: isMobile ? window.innerHeight : 720 },
          aspectRatio: isMobile ? window.innerWidth / window.innerHeight : 16/9
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
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

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !showTargetOverlay) return;

    const video = videoRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvas = document.createElement('canvas');
    const actualWidth = video.videoWidth;
    const actualHeight = video.videoHeight;
    
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const videoX = (x / rect.width) * actualWidth;
      const videoY = (y / rect.height) * actualHeight;
      
      ctx.beginPath();
      ctx.arc(videoX, videoY, 10, 0, 2 * Math.PI);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onImageCapture(imageDataUrl);
      stopCamera();
    }
  };

  return (
    <div className="space-y-4">
      {isCapturing ? (
        <div className={`relative ${isMobile ? 'fixed inset-0 z-50 bg-black' : ''}`}>
          <div 
            onClick={handleVideoClick}
            className="cursor-crosshair relative h-full"
          >
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
                    Tap anywhere to capture
                  </p>
                </div>
              </div>
            )}
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