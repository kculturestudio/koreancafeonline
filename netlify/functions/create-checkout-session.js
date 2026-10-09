// Tworzy sesję płatności Stripe Checkout dla subskrypcji (miesięcznej lub rocznej).
// Wymagane zmienne środowiskowe (Netlify → Site configuration → Environment variables):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY
const Stripe = require('stripe');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_MONTHLY || !STRIPE_PRICE_YEARLY) {
    return json(500, { error: 'Payments are not configured' });
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Invalid JSON' }); }

  const prices = { monthly: STRIPE_PRICE_MONTHLY, yearly: STRIPE_PRICE_YEARLY };
  const price = prices[body.plan];
  if (!price) return json(400, { error: 'Unknown plan' });

  // Netlify ustawia URL automatycznie (adres głównej domeny strony).
  const siteUrl = (process.env.URL || process.env.SITE_URL || '').replace(/\/$/, '');
  if (!siteUrl) return json(500, { error: 'Missing site URL' });

  const trialDays = parseInt(process.env.STRIPE_TRIAL_DAYS || '7', 10);

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : undefined,
      allow_promotion_codes: true,
      locale: body.lang === 'ko' ? 'ko' : 'pl',
      success_url: siteUrl + '/?checkout=success&session_id={CHECKOUT_SESSION_ID}#/premium',
      cancel_url: siteUrl + '/?checkout=cancel#/premium'
    });
    return json(200, { url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return json(500, { error: 'Could not create checkout session' });
  }
};
