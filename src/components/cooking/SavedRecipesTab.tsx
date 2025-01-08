import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SavedRecipesTabProps {
  recipes: Tables<"recipes">[] | undefined;
  onEditRecipe: (recipe: Tables<"recipes">) => void;
}

export const SavedRecipesTab = ({ recipes, onEditRecipe }: SavedRecipesTabProps) => {
  const { toast } = useToast();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    } finally {
      setRecipeToDelete(null);
    }
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="grid gap-4">
      {recipes?.map((savedRecipe) => (
        <Card key={savedRecipe.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recipe from {formatDateTime(savedRecipe.created_at)}</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onEditRecipe(savedRecipe)}
              >
                Edit Recipe
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setRecipeToDelete(savedRecipe.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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

      <AlertDialog open={!!recipeToDelete} onOpenChange={() => setRecipeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your recipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => recipeToDelete && handleDeleteRecipe(recipeToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};