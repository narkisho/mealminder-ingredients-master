import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadTab } from "./UploadTab";
import { CurrentRecipeTab } from "./CurrentRecipeTab";
import { SavedRecipesTab } from "./SavedRecipesTab";
import { generateRecipeFromImage } from "@/services/gemini";

interface RecipeManagerProps {
  recipes: Tables<"recipes">[] | undefined;
  refetchRecipes: () => void;
}

export const RecipeManager = ({ recipes, refetchRecipes }: RecipeManagerProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const handleDeleteCurrentRecipe = () => {
    setRecipe(null);
    setImage(null);
    setAdditionalInstructions("");
    setActiveTab("upload");
    toast("Recipe deleted successfully");
  };

  const handleSaveRecipe = async () => {
    if (!recipe || !image) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please log in to save recipes");
        return;
      }

      const { error } = await supabase.from('recipes').insert({
        recipe_text: recipe + (additionalInstructions ? `\n\nAdditional Instructions:\n${additionalInstructions}` : ''),
        ingredients_image: image,
        user_id: session.user.id
      });

      if (error) throw error;

      toast.success("Recipe saved successfully!");
      setAdditionalInstructions("");
      refetchRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    }
  };

  const handleEditRecipe = (savedRecipe: Tables<"recipes">) => {
    setImage(savedRecipe.ingredients_image);
    
    const parts = savedRecipe.recipe_text.split('\n\nAdditional Instructions:\n');
    setRecipe(parts[0]);
    setAdditionalInstructions(parts[1] || '');
    
    setActiveTab("upload");
    toast.success("Recipe loaded for editing");
  };

  const handleGenerateRecipe = async () => {
    if (!image) {
      toast.error("Please upload an image of your ingredients first");
      return;
    }

    setIsLoading(true);
    try {
      const generatedRecipe = await generateRecipeFromImage(image, {
        skillLevel: "intermediate",
        timeAvailable: 30,
        additionalInstructions: additionalInstructions,
      });
      setRecipe(generatedRecipe);
      setActiveTab("recipe");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload Ingredients</TabsTrigger>
        <TabsTrigger value="recipe" disabled={!recipe}>Current Recipe</TabsTrigger>
        <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-6">
        <UploadTab
          image={image}
          setImage={setImage}
          isLoading={isLoading}
          onGenerateRecipe={handleGenerateRecipe}
          additionalInstructions={additionalInstructions}
          onInstructionsChange={setAdditionalInstructions}
        />
      </TabsContent>

      <TabsContent value="recipe" className="mt-6">
        {recipe && (
          <CurrentRecipeTab 
            recipe={recipe} 
            onSave={handleSaveRecipe} 
            onDelete={handleDeleteCurrentRecipe}
          />
        )}
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        <SavedRecipesTab recipes={recipes} onEditRecipe={handleEditRecipe} />
      </TabsContent>
    </Tabs>
  );
};