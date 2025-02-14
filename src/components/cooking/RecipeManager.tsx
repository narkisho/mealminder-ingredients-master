import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadTab } from "./UploadTab";
import { CurrentRecipeTab } from "./CurrentRecipeTab";
import { SavedRecipesTab } from "./SavedRecipesTab";
import { generateRecipeFromImage } from "@/services/gemini";
import { SubscriptionModal } from "../subscription/SubscriptionModal";
import { useSubscription } from "./hooks/useSubscription";

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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: subscriptionData } = useSubscription();

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
      setActiveTab("upload");
      setRecipe(null);
      setImage(null);
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

    // Check subscription status and generation count
    if (!subscriptionData?.subscription?.status && 
        (subscriptionData?.generationCount || 0) >= 3) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const generatedRecipe = await generateRecipeFromImage(image, {
        skillLevel: "intermediate",
        timeAvailable: 30,
        additionalInstructions: additionalInstructions,
      });

      // Update generation count
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('recipe_generations')
          .update({ count: (subscriptionData?.generationCount || 0) + 1 })
          .eq('user_id', session.user.id);
      }

      setRecipe(generatedRecipe);
      setActiveTab("recipe");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
        <TabsList className="flex flex-col w-full max-w-xs mx-auto gap-1 bg-transparent p-0 mb-12 relative z-10">
          <TabsTrigger 
            value="upload" 
            className="w-full py-2 px-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Upload Ingredients
          </TabsTrigger>
          <TabsTrigger 
            value="recipe" 
            disabled={!recipe}
            className="w-full py-2 px-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Current Recipe
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="w-full py-2 px-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Saved Recipes
          </TabsTrigger>
        </TabsList>

        <div className="relative z-0">
          <TabsContent value="upload" className="mt-8">
            <UploadTab
              image={image}
              setImage={setImage}
              isLoading={isLoading}
              onGenerateRecipe={handleGenerateRecipe}
              additionalInstructions={additionalInstructions}
              onInstructionsChange={setAdditionalInstructions}
            />
          </TabsContent>

          <TabsContent value="recipe" className="mt-8">
            {recipe && (
              <CurrentRecipeTab 
                recipe={recipe} 
                image={image}
                onSave={handleSaveRecipe} 
                onDelete={handleDeleteCurrentRecipe}
              />
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-8">
            <SavedRecipesTab 
              recipes={recipes} 
              onEditRecipe={handleEditRecipe} 
              refetchRecipes={refetchRecipes}
            />
          </TabsContent>
        </div>
      </Tabs>

      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal}
      />
    </>
  );
};