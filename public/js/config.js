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

  // Jakie usługi są podłączone.
  // Konta i czat korzystają z Supabase, ale tylko gdy wpiszesz poniżej adres projektu i klucz publiczny.
  // Dopóki pola są puste, strona działa jak dotąd, w trybie demo (wiadomości tylko w przeglądarce).
  providers: {
    auth: 'supabase',  // 'none' | 'supabase'
    chat: 'supabase',  // 'local' | 'supabase'
    voice: 'none'      // 'none' | 'livekit' | 'daily' | ...
  },

  // Supabase → Project Settings → API. Oba pola są PUBLICZNE i mogą być w repozytorium.
  // NIGDY nie wpisuj tu klucza "service_role" (tajny).
  supabase: {
    url: '',      // np. 'https://abcdefghijkl.supabase.co'
    anonKey: ''   // długi klucz "anon" / "publishable"
  },

  // Tylko do testów na własnym komputerze: odblokowuje treści Premium bez płatności.
  // NIGDY nie ustawiaj true na publicznej stronie.
  devForcePremium: false
};
