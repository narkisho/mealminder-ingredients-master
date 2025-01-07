import { Button } from "@/components/ui/button";

interface CurrentRecipeTabProps {
  recipe: string;
  onSave: () => void;
}

export const CurrentRecipeTab = ({ recipe, onSave }: CurrentRecipeTabProps) => {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: recipe.replace(/\n/g, "<br/>") }} />
      </div>
      <Button onClick={onSave} className="w-full">Save Recipe</Button>
    </div>
  );
};