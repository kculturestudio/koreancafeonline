/* Ustawienia strony. Tu NIE wpisuj żadnych kluczy tajnych (tylko wartości publiczne). */
window.KCO_CONFIG = {
  // true = pokazuje przykładowe wiadomości i informacje "tryb demo".
  // Ustaw false, gdy podłączysz prawdziwy czat i logowanie (zob. README).
  demo: true,

  // Gdzie strona wysyła prośbę o utworzenie płatności (Netlify Function).
  checkoutEndpoint: '/.netlify/functions/create-checkout-session',

  // Link do portalu klienta Stripe (Stripe Dashboard → Settings → Billing → Customer portal).
  // Zostaw pusty, jeśli jeszcze go nie masz.
  portalUrl: '',

  // Ceny tylko do WYŚWIETLANIA. Prawdziwe ceny ustawiasz w Stripe (ID cen w zmiennych środowiskowych).
  prices: {
    monthly: { amount: 29, currency: 'zł' },
    yearly: { amount: 249, currency: 'zł' }
  },
  trialDays: 7,

  // Jakie usługi są podłączone. Dziś: tylko lokalne demo.
  providers: {
    auth: 'none',   // 'none' | 'supabase' | ...
    chat: 'local',  // 'local' | 'supabase' | ...
    voice: 'none'   // 'none' | 'livekit' | 'daily' | ...
  },

  // Tylko do testów na własnym komputerze: odblokowuje treści Premium bez płatności.
  // NIGDY nie ustawiaj true na publicznej stronie.
  devForcePremium: false
};
