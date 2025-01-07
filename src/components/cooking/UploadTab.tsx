import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
        ) : (
          <div className="space-y-4">
            <p className="text-lg">
              Drag and drop an image here, or click to select a file
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
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

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