import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const customerId = checkoutSession.customer as string;
        const subscriptionId = checkoutSession.subscription as string;
        const userId = checkoutSession.metadata?.userId;

        if (!userId || !customerId || !subscriptionId) {
          console.error('Missing data in checkout.session.completed event:', checkoutSession);
          return new Response('Missing data', { status: 400 });
        }

        // Retrieve the subscription to get details like current_period_start/end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' });

        if (insertError) {
          console.error('Error inserting/updating subscription:', insertError);
          throw new Error('Failed to insert/update subscription.');
        }

        // Update user's premium status
        const { error: updateProfileError } = await supabaseAdmin
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', userId);

        if (updateProfileError) {
          console.error('Error updating user premium status:', updateProfileError);
          throw new Error('Failed to update user premium status.');
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string);
        const supabaseUserId = (customer.metadata as any)?.supabase_user_id;

        if (!supabaseUserId) {
          console.error('Missing supabase_user_id in customer metadata for subscription event:', sub);
          return new Response('Missing user ID', { status: 400 });
        }

        const { error: updateSubError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: supabaseUserId,
            stripe_customer_id: sub.customer as string,
            stripe_subscription_id: sub.id,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' });

        if (updateSubError) {
          console.error('Error updating subscription status:', updateSubError);
          throw new Error('Failed to update subscription status.');
        }

        // Update user's premium status based on subscription status
        const isPremiumStatus = sub.status === 'active' || sub.status === 'trialing';
        const { error: updateProfileStatusError } = await supabaseAdmin
          .from('profiles')
          .update({ is_premium: isPremiumStatus })
          .eq('id', supabaseUserId);

        if (updateProfileStatusError) {
          console.error('Error updating user premium status from subscription event:', updateProfileStatusError);
          throw new Error('Failed to update user premium status from subscription event.');
        }
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Stripe Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});