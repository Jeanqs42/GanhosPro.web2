import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@^16.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializa o cliente Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No Stripe signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event;

    try {
      // Constrói o evento do webhook e verifica a assinatura
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '' // Chave secreta do webhook
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializa o cliente Supabase com a chave de serviço (admin) para atualizar perfis
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    let userId: string | undefined;
    let isPremium = false;
    let subscriptionStatus: string | null = null;

    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        userId = checkoutSession.metadata?.user_id; // Obtém o ID do usuário do metadata
        if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
          isPremium = subscription.status === 'active' || subscription.status === 'trialing';
          subscriptionStatus = subscription.status;
        } else if (checkoutSession.mode === 'payment') {
          // Se for um pagamento único (não uma assinatura), defina como premium ativo
          isPremium = true;
          subscriptionStatus = 'active_one_time';
        }
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // Em um cenário real, você teria o customer_id do Stripe no perfil do usuário
        // Para simplificar, vamos tentar buscar o user_id do metadata do customer
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        userId = (customer as Stripe.Customer).metadata?.user_id; 

        isPremium = subscription.status === 'active' || subscription.status === 'trialing';
        subscriptionStatus = subscription.status;
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return new Response(JSON.stringify({ received: true, message: `Unhandled event type: ${event.type}` }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (userId) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_premium: isPremium, subscription_status: subscriptionStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`User ${userId} premium status updated to ${isPremium}, subscription status to ${subscriptionStatus}`);
    } else {
      console.warn('User ID not found in Stripe event metadata or customer object.');
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});