import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { initializeGemini } from "@/services/gemini";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RecipeManager } from "@/components/cooking/RecipeManager";

const Cooking = () => {
  const navigate = useNavigate();

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
          toast.error("Could not retrieve the API key. Please try again later.");
          return;
        }

        initializeGemini(value);
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to initialize the cooking interface");
      }
    };

    initAPI();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container mx-auto px-4 py-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-text text-center mb-12">
            Your Personal Chef Assistant
          </h1>
          <p className="text-center text-lg text-muted-foreground mb-16">
            Upload your ingredients and let AI create the perfect recipe for you
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fade-in mt-12">
            <RecipeManager recipes={recipes} refetchRecipes={refetchRecipes} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cooking;