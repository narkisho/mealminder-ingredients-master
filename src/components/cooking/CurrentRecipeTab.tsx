import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { FormattedRecipe } from "./FormattedRecipe";

interface CurrentRecipeTabProps {
  recipe: string;
  image: string | null;
  onSave: () => void;
  onDelete: () => void;
}

export const CurrentRecipeTab = ({ recipe, image, onSave, onDelete }: CurrentRecipeTabProps) => {
  return (
    <div className="space-y-6">
      <FormattedRecipe recipe={recipe} image={image} />
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <Button 
          onClick={onSave} 
          className="w-full sm:flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Save Recipe
        </Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
          className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};