import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const { data: generations } = await supabase
        .from('recipe_generations')
        .select('count')
        .eq('user_id', session.user.id)
        .maybeSingle();

      return {
        subscription,
        generationCount: generations?.count || 0
      };
    }
  });
};