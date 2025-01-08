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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Cooking Assistant</h1>
        <RecipeManager recipes={recipes} refetchRecipes={refetchRecipes} />
      </main>
    </div>
  );
};

export default Cooking;