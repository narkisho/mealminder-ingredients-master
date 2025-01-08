import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Camera } from "lucide-react";
import { useState, useRef } from "react";

interface UploadTabProps {
  image: string | null;
  setImage: (image: string | null) => void;
  isLoading: boolean;
  onGenerateRecipe: () => void;
  additionalInstructions: string;
  onInstructionsChange: (value: string) => void;
}

export const UploadTab = ({ 
  image, 
  setImage, 
  isLoading, 
  onGenerateRecipe,
  additionalInstructions,
  onInstructionsChange 
}: UploadTabProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isMobile ? "environment" : "user"
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCapturing(true);
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
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {isCapturing ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button onClick={capturePhoto} variant="secondary">
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          {image ? (
            <div className="space-y-4">
              <img
                src={image}
                alt="Uploaded ingredients"
                className="max-h-64 mx-auto rounded-lg"
              />
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                  }}
                  variant="outline"
                >
                  Remove Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">
                Drag and drop an image here, or click to select a file
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                variant="outline"
                className="mt-4"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="additional-instructions" className="text-sm font-medium">
          Additional Instructions
        </label>
        <Textarea
          id="additional-instructions"
          placeholder="Add any additional instructions or notes here..."
          value={additionalInstructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="text-center">
        <Button
          onClick={onGenerateRecipe}
          disabled={!image || isLoading}
          className="w-full max-w-md"
        >
          {isLoading ? "Generating Recipe..." : "Generate Recipe"}
        </Button>
      </div>
    </div>
  );
};