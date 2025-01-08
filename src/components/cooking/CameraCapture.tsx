import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Camera } from "lucide-react";
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
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
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

    // Create a canvas with the same dimensions as the video
    const canvas = document.createElement('canvas');
    const actualWidth = video.videoWidth;
    const actualHeight = video.videoHeight;
    
    // Set canvas size to match video dimensions
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear the canvas and draw the video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Calculate the position of the click relative to the video dimensions
      const videoX = (x / rect.width) * actualWidth;
      const videoY = (y / rect.height) * actualHeight;
      
      // Draw a red circle at click position
      ctx.beginPath();
      ctx.arc(videoX, videoY, 10, 0, 2 * Math.PI);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Convert to base64 with proper compression
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onImageCapture(imageDataUrl);
      stopCamera();
    }
  };

  return (
    <div className="space-y-4">
      {isCapturing ? (
        <div className="relative">
          <div 
            onClick={handleVideoClick}
            className="cursor-crosshair"
            style={{ position: 'relative' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg object-cover"
              style={{ maxHeight: '80vh' }}
            />
            {showTargetOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-white bg-black/50 px-4 py-2 rounded">
                  Click anywhere on the image to capture
                </p>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button onClick={stopCamera} variant="destructive">
              Cancel
            </Button>
          </div>
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