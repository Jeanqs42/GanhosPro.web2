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
    // Inicializa o cliente Supabase para obter o usuário autenticado
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verifica se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { priceId, mode } = await req.json(); // Recebe o ID do preço do Stripe e o modo (ex: 'subscription')

    if (!priceId || !mode) {
      return new Response(JSON.stringify({ error: 'Missing priceId or mode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializa o cliente Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Cria a sessão de checkout do Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{
        price: priceId, // ID do preço do Stripe (ex: price_12345)
        quantity: 1,
      }],
      mode: mode,
      success_url: `${Deno.env.get('APP_BASE_URL')}/app/premium?success=true`, // URL de sucesso
      cancel_url: `${Deno.env.get('APP_BASE_URL')}/app/premium?canceled=true`,   // URL de cancelamento
      metadata: {
        user_id: user.id, // Armazena o ID do usuário para vincular a assinatura
      },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});