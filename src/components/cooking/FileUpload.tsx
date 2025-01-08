import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload = ({ image, onImageChange, onFileSelect }: FileUploadProps) => {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-white/50 backdrop-blur-sm"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      {image ? (
        <div className="space-y-4">
          <img
            src={image}
            alt="Uploaded ingredients"
            className="max-h-64 mx-auto rounded-lg shadow-md"
          />
          <div className="flex justify-center space-x-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(null);
              }}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="w-12 h-12 mx-auto text-primary/60" />
          <p className="text-lg font-display">
            Drag/Drop an Image Here, or Click to Select or Take a Photo
          </p>
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG
          </p>
        </div>
      )}
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
};