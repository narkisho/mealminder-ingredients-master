import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

const handleWebhook = async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Received PayPal webhook:', body);

    // Handle different webhook events
    switch (body.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(body.resource.billing_info.next_billing_time),
          })
          .eq('paypal_subscription_id', body.resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('paypal_subscription_id', body.resource.id);
        break;

      default:
        console.log(`Unhandled event type: ${body.event_type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method === 'POST') {
    return handleWebhook(req);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});