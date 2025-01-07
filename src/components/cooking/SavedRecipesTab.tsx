import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface SavedRecipesTabProps {
  recipes: Tables<"recipes">[] | undefined;
}

export const SavedRecipesTab = ({ recipes }: SavedRecipesTabProps) => {
  return (
    <div className="grid gap-4">
      {recipes?.map((savedRecipe) => (
        <Card key={savedRecipe.id}>
          <CardHeader>
            <CardTitle>Recipe from {new Date(savedRecipe.created_at).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {savedRecipe.ingredients_image && (
              <img
                src={savedRecipe.ingredients_image}
                alt="Ingredients"
                className="max-h-48 rounded-lg mb-4"
              />
            )}
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: savedRecipe.recipe_text.replace(/\n/g, "<br/>") }} />
            </div>
          </CardContent>
        </Card>
      ))}
      {recipes?.length === 0 && (
        <p className="text-center text-muted-foreground">No saved recipes yet.</p>
      )}
    </div>
  );
};