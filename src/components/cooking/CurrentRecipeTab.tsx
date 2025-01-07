import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CurrentRecipeTabProps {
  recipe: string;
  onSave: () => void;
  additionalInstructions: string;
  onInstructionsChange: (value: string) => void;
}

export const CurrentRecipeTab = ({ 
  recipe, 
  onSave, 
  additionalInstructions,
  onInstructionsChange 
}: CurrentRecipeTabProps) => {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: recipe.replace(/\n/g, "<br/>") }} />
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
      <Button onClick={onSave} className="w-full">Save Recipe</Button>
    </div>
  );
};