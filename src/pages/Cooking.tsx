import { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateRecipeFromImage, initializeGemini } from "@/services/gemini";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Cooking = () => {
  const [image, setImage] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initAPI = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'GEMINI_API_KEY')
          .single();

        if (error || !data) {
          toast({
            title: "API Key Required",
            description: "Please set up your Gemini API key in the project settings",
            variant: "destructive",
          });
          return;
        }

        initializeGemini(data.value);
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

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Generate recipe
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Ingredients</TabsTrigger>
            <TabsTrigger value="recipe" disabled={!recipe}>Recipe</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {image ? (
                <div className="space-y-4">
                  <img
                    src={image}
                    alt="Uploaded ingredients"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                    variant="outline"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg">
                    Drag and drop an image here, or click to select a file
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: JPG, PNG
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={handleGenerateRecipe}
                disabled={!image || isLoading}
                className="w-full max-w-md"
              >
                {isLoading ? "Generating Recipe..." : "Generate Recipe"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recipe" className="mt-6">
            {recipe && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: recipe.replace(/\n/g, "<br/>") }} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Cooking;