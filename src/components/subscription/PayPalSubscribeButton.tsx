import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalSubscribeButton = () => {
  useEffect(() => {
    const loadPayPalScript = async () => {
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&vault=true";
      script.async = true;
      script.onload = () => {
        if (window.paypal) {
          window.paypal.Buttons({
            createSubscription: async (data: any, actions: any) => {
              return actions.subscription.create({
                'plan_id': 'YOUR_PAYPAL_PLAN_ID' // Monthly $9 plan ID
              });
            },
            onApprove: async (data: any) => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                  toast.error("Please log in to subscribe");
                  return;
                }

                const { error } = await supabase.from('subscriptions').insert({
                  user_id: session.user.id,
                  paypal_subscription_id: data.subscriptionID,
                  status: 'pending',
                  payment_provider: 'paypal'
                });

                if (error) throw error;
                
                toast.success("Subscription created successfully!");
              } catch (error) {
                console.error('Error saving subscription:', error);
                toast.error("Failed to save subscription");
              }
            }
          }).render('#paypal-button-container');
        }
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      const script = document.querySelector('script[src*="paypal"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="paypal-button-container" className="mb-4"></div>
      <p className="text-sm text-center text-muted-foreground">
        Subscribe for $9/month to unlock unlimited recipe generations
      </p>
    </div>
  );
};