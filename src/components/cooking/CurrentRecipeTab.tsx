import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CurrentRecipeTabProps {
  recipe: string;
  onSave: () => void;
  onDelete: () => void;
}

export const CurrentRecipeTab = ({ recipe, onSave, onDelete }: CurrentRecipeTabProps) => {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: recipe.replace(/\n/g, "<br/>") }} />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} className="flex-1">Save Recipe</Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};