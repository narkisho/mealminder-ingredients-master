import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CameraCapture } from "./CameraCapture";
import { FileUpload } from "./FileUpload";

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

  return (
    <div className="space-y-6">
      {!image && <CameraCapture onImageCapture={setImage} />}
      
      <FileUpload
        image={image}
        onImageChange={setImage}
        onFileSelect={handleFileUpload}
      />

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