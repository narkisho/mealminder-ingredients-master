import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "./FileUpload";
import { GenerateRecipeButton } from "./GenerateRecipeButton";

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
      <FileUpload
        image={image}
        onImageChange={setImage}
        onFileSelect={handleFileUpload}
      />

      <div className="text-center">
        <GenerateRecipeButton
          isLoading={isLoading}
          onGenerate={onGenerateRecipe}
          disabled={!image}
          className="mx-auto"
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
    </div>
  );
};