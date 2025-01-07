import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateRecipeFromImage, initializeGemini } from "@/services/gemini";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UploadTab } from "@/components/cooking/UploadTab";
import { CurrentRecipeTab } from "@/components/cooking/CurrentRecipeTab";
import { SavedRecipesTab } from "@/components/cooking/SavedRecipesTab";

const Cooking = () => {
  const [image, setImage] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user's recipes
  const { data: recipes, refetch: refetchRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const initAPI = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: { value }, error } = await supabase.functions.invoke('get-gemini-key');
        
        if (error || !value) {
          toast({
            title: "API Key Error",
            description: "Could not retrieve the API key. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        initializeGemini(value);
      } catch (error) {
        console.error("Error initializing:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize the cooking interface",
          variant: "destructive",
        });
      }
    };

    initAPI();
  }, [navigate, toast]);

  const saveRecipe = async () => {
    if (!recipe || !image) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save recipes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('recipes').insert({
        recipe_text: recipe,
        ingredients_image: image,
        user_id: session.user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe saved successfully!",
      });

      refetchRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateRecipe = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload an image of your ingredients first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const generatedRecipe = await generateRecipeFromImage(image, {
        skillLevel: "intermediate",
        timeAvailable: 30,
      });
      setRecipe(generatedRecipe);
    } catch (error) {
      toast({
        title: "Error generating recipe",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Cooking Assistant</h1>
        
        <Tabs defaultValue="upload" className="w-full max-w-3xl mx-auto">
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
            />
          </TabsContent>

          <TabsContent value="recipe" className="mt-6">
            {recipe && <CurrentRecipeTab recipe={recipe} onSave={saveRecipe} />}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <SavedRecipesTab recipes={recipes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Cooking;