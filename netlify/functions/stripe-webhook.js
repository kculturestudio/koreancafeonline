// Odbiera zdarzenia ze Stripe (płatność, odnowienie, anulowanie).
// Wymagane zmienne: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// W Stripe Dashboard → Developers → Webhooks dodaj endpoint:
//   https://TWOJA-DOMENA/.netlify/functions/stripe-webhook
// ze zdarzeniami: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return { statusCode: 500, body: 'Webhook is not configured' };

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const signature = event.headers['stripe-signature'];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Invalid Stripe signature:', err.message);
    return { statusCode: 400, body: 'Invalid signature' };
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const obj = stripeEvent.data.object;
      // TODO (krok 2 w README): zapisz w bazie (np. Supabase), że ten klient ma lub straci dostęp Premium.
      //   - checkout.session.completed: obj.customer, obj.customer_details.email, obj.subscription
      //   - customer.subscription.updated / deleted: obj.customer, obj.status ('active', 'trialing', 'canceled', ...)
      console.log('Stripe event:', stripeEvent.type, 'customer:', obj.customer, 'status:', obj.status || 'n/a');
      break;
    }
    default:
      break;
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
