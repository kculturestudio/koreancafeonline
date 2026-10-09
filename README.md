# Korean Cafe Online · 한국 카페 온라인

Wirtualna kawiarnia PL/KR: czaty 24/7, roomy na żywo, wydarzenia i subskrypcja (Stripe). Strona statyczna (HTML/CSS/JS bez kroku budowania) plus dwie funkcje Netlify do płatności.

## Co jest w paczce

```
public/                      strona (to Netlify publikuje)
  index.html, css/, js/      aplikacja
  js/config.js               ustawienia (ceny do wyświetlania, usługi, tryb demo)
  js/data.js                 czaty, roomy, wydarzenia, przykładowe wiadomości
  js/teksty.js                 wszystkie teksty interfejsu PL/KR
  regulamin.html, prywatnosc.html   SZKIELETY do uzupełnienia
netlify/functions/           płatności Stripe (checkout + webhook)
netlify.toml                 konfiguracja, nagłówki bezpieczeństwa
.env.example                 lista zmiennych środowiskowych
```

## Co działa już teraz, a co jest demem

| Działa naprawdę | Jeszcze demo |
| --- | --- |
| Nawigacja, przełącznik PL/한국어, filtry (język, poziom, temat, wiek) | Czat: wiadomości widzisz tylko Ty (zapis w przeglądarce) |
| Godziny roomów i wydarzeń przeliczane na czas Seulu (z uwagą na zmianę czasu) | Roomy: brak głosu i prawdziwych uczestników |
| „Dodaj do kalendarza” (plik .ics) | Konta i logowanie: brak |
| Potwierdzenie 18+, imię i poziom zapisane w przeglądarce | Dostęp Premium: nie jest nigdzie egzekwowany |
| Płatność subskrypcji w Stripe (po konfiguracji niżej) | Przycisk „Zarządzaj subskrypcją” (po wpisaniu `portalUrl` otwiera portal Stripe) |

**Ważne:** dopóki nie ma logowania i bazy (krok 2), klient, który zapłaci, nie dostanie dostępu do treści Premium. Używaj więc Stripe w trybie testowym i nie ogłaszaj publicznie płatności przed krokiem 2.

## Uruchomienie lokalnie

```bash
npm install
npx netlify dev        # strona + funkcje na http://localhost:8888
```

Samą stronę (bez płatności) możesz otworzyć też prostym serwerem: `npx serve public`.

## Wdrożenie na Netlify

**Zalecane (Git, razem z płatnościami):**
1. Wrzuć folder do repozytorium na GitHubie.
2. Netlify → *Add new site* → *Import from Git* → wybierz repo. Ustawienia czyta `netlify.toml` (publish: `public`).
3. *Site configuration → Environment variables*: dodaj zmienne z `.env.example`.
4. Deploy. Własna domena: *Domain management*.

**Szybki test bez płatności:** przeciągnij sam folder `public` na https://app.netlify.com/drop. Funkcje Stripe tak się nie wdrożą, więc przycisk płatności pokaże komunikat o niedostępności.

## Stripe: subskrypcja krok po kroku

1. Załóż konto Stripe i przełącz na **tryb testowy**.
2. *Product catalog*: utwórz produkt „Korean Cafe Premium” z dwiema cenami cyklicznymi: miesięczną i roczną (zgodnie z `prices` w `config.js`, np. 29 zł i 249 zł). Skopiuj ich ID (`price_...`).
3. W Netlify ustaw: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`.
4. *Developers → Webhooks*: dodaj endpoint `https://TWOJA-DOMENA/.netlify/functions/stripe-webhook` ze zdarzeniami `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Skopiuj *Signing secret* do `STRIPE_WEBHOOK_SECRET`.
5. *Settings → Billing → Customer portal*: włącz portal i wklej jego link do `portalUrl` w `config.js`.
6. Przetestuj kartą testową `4242 4242 4242 4242`. Dopiero po kroku 2 przejdź na klucze produkcyjne.
7. Podatki: sprawdź z księgową VAT dla usług cyfrowych (Stripe Tax może pomóc) i fakturowanie.

## Krok 2: konta, prawdziwy czat i głos (do zrobienia przed startem)

Polecany zestaw, który dobrze współpracuje z Netlify:
- **Supabase** (logowanie e-mailem, baza, Realtime): konta użytkowników, historia czatu, tabela `subscriptions` zasilana przez `stripe-webhook.js`. Egzekwowanie Premium robisz regułami dostępu w bazie (Row Level Security), nie w kodzie strony.
- **LiveKit** lub **Daily** (rozmowy głosowe w roomach): token dostępu generowany przez funkcję Netlify po sprawdzeniu, czy użytkownik ma prawo wejść.
- Po podłączeniu: w `config.js` ustaw `demo: false` i `providers`, a w `app.js` podmień obiekt `Chat` (jedno miejsce) na wywołania Supabase. Dopisz adresy usług do `connect-src` w `netlify.toml`.

## Przed publicznym startem (lista kontrolna)

- Regulamin i Polityka prywatności: uzupełnij szkielety (RODO, dane sprzedawcy, prawo odstąpienia dla treści cyfrowych).
- Moderacja: zgłaszanie nadużyć, blokowanie, rola moderatora w roomach. Strona wymaga potwierdzenia 18+, ale bez kont nie da się tego egzekwować.
- Czcionki Google: ładowane z serwerów Google (przekazują adres IP). Jeśli chcesz tego uniknąć, pobierz Noto Sans KR i Noto Serif KR i hostuj je lokalnie.
- Ikony PWA: `manifest.webmanifest` używa SVG. Dla instalacji na wszystkich telefonach dodaj ikony PNG 192×192 i 512×512.
- Godziny roomów i wydarzeń: podawane w `data.js` w czasie warszawskim. Wspólne okno z Koreą to mniej więcej 12:00–15:00 w Polsce (19:00–22:00 w Seulu); wieczorne godziny polskie wypadają w Korei w nocy.

## Jak zmieniać treści

- Nowy czat lub room: dopisz pozycję w `public/js/data.js`.
- Zmiana tekstów: `public/js/teksty.js` (pierwszy element to polski, drugi koreański).
- Ceny na ekranie: `public/js/config.js` (prawdziwe ceny zmieniasz w Stripe).
