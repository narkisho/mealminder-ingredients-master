import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { initializeGemini } from "@/services/gemini";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RecipeManager } from "@/components/cooking/RecipeManager";
import { ProfilePreferences } from "@/components/cooking/ProfilePreferences";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary text-center">
              Your Personal Chef Assistant
            </h1>
            <p className="text-center text-lg text-muted-foreground mt-4">
              Upload your ingredients and let AI create the perfect recipe for you
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 animate-fade-in">
            <RecipeManager recipes={recipes} refetchRecipes={refetchRecipes} />
          </div>

          <Collapsible className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white/80 backdrop-blur-sm rounded-t-lg shadow-sm hover:bg-white/90 transition-colors">
              <span className="text-lg font-semibold">Cooking Preferences</span>
              <ChevronDown className="h-5 w-5 transition-transform duration-200 ease-in-out transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-b-lg overflow-hidden">
              <ProfilePreferences />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>
    </div>
  );
};

export default Cooking;