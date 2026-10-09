# Korean Cafe Online · 한국 카페 온라인

Wirtualna kawiarnia PL/KR: czaty 24/7, roomy na żywo, wydarzenia i subskrypcja (Stripe). Strona statyczna (HTML/CSS/JS bez kroku budowania) plus dwie funkcje Netlify do płatności.

## Co jest w paczce

```
public/                      strona (to Netlify publikuje)
  index.html, css/, js/      aplikacja
  img/                       logo i ikony
  css/styles.css             wygląd (paleta kolorów na górze, w :root)
  js/config.js               ustawienia (ceny do wyświetlania, usługi, tryb demo)
  js/data.js                 czaty, roomy, wydarzenia, przykładowe wiadomości
  js/teksty.js               wszystkie teksty interfejsu PL/KR
  regulamin.html, prywatnosc.html   SZKIELETY do uzupełnienia
netlify/functions/           płatności Stripe (checkout + webhook)
supabase/schema.sql          baza wiadomości czatu (wklejasz raz w Supabase)
public/js/vendor/supabase.js biblioteka Supabase (gotowy plik, nie edytuj)
netlify.toml                 konfiguracja, nagłówki bezpieczeństwa
.env.example                 lista zmiennych środowiskowych
```

## Co działa już teraz, a co jest demem

| Działa naprawdę | Jeszcze demo |
| --- | --- |
| Nawigacja, przełącznik PL/한국어, filtry (język, poziom, temat, wiek) | Czat: bez Supabase wiadomości widzisz tylko Ty (zapis w przeglądarce); z Supabase (krok 2) czat jest prawdziwy |
| Godziny roomów i wydarzeń przeliczane na czas Seulu (z uwagą na zmianę czasu) | Roomy: brak głosu i prawdziwych uczestników |
| „Dodaj do kalendarza” (plik .ics) | Konta i logowanie: działają po podłączeniu Supabase (krok 2) |
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

## Krok 2a: konta i prawdziwy czat (Supabase)

Kod jest już w repozytorium. Do uruchomienia potrzebujesz tylko darmowego projektu w Supabase. Dopóki nie wpiszesz jego danych w `config.js`, strona działa jak dotąd, w trybie demo.

1. Wejdź na https://supabase.com, załóż konto i kliknij *New project* (wybierz region w UE, np. Frankfurt). Zapisz hasło do bazy w bezpiecznym miejscu.
2. W projekcie otwórz *SQL Editor* → *New query*, wklej całą zawartość pliku `supabase/schema.sql` i kliknij *Run*. To tworzy tabelę wiadomości, reguły dostępu (każdy zalogowany czyta, pisać można tylko jako ty sam) i włącza wiadomości na żywo.
3. *Project Settings → API*: skopiuj **Project URL** i klucz **anon / publishable**. Oba są publiczne. Klucza `service_role` nigdy nigdzie nie wklejaj.
4. W `public/js/config.js` wpisz je w pole `supabase.url` i `supabase.anonKey`, a `demo` ustaw na `false`. Zapisz, wypchnij na GitHuba. Netlify wdroży się sam.
5. *Authentication → URL Configuration*: jako **Site URL** wpisz adres strony (np. `https://koreancafeonline.netlify.app`) i dodaj go też do **Redirect URLs**. Bez tego linki z e-maili (potwierdzenie konta, reset hasła) nie wrócą na stronę.
6. *Authentication → Sign In / Providers → Email*: zostaw włączone logowanie e-mailem. Opcja *Confirm email* włączona = nowa osoba musi kliknąć link z maila, zanim wejdzie (polecane na start publiczny).

Jak to działa: logowanie e-mailem i hasłem, reset hasła przez e-mail, historia czatu zapisana w bazie, nowe wiadomości pojawiają się u wszystkich od razu. Rozmowy są wspólne (każdy zalogowany widzi wiadomości w danym czacie).

Dobrze wiedzieć:
- Link z maila otwieraj w tej samej przeglądarce i na tym samym urządzeniu, na którym zakładasz konto lub prosisz o reset hasła. Z innego urządzenia konto i tak zostanie potwierdzone, ale po kliknięciu trzeba zalogować się ręcznie.
- Wbudowana wysyłka maili Supabase ma bardzo niski limit (kilka maili na godzinę). Przed startem podłącz własny SMTP (*Authentication → Emails → SMTP Settings*), np. Resend lub Brevo.
- Nazwy w czacie nie są unikalne: ktoś może wpisać to samo imię co inna osoba albo „Moderator”. Przed publicznym startem dodaj tabelę profili z unikalnymi nazwami i rolą moderatora.
- Wiadomości można na razie usuwać tylko ręcznie (*Table Editor → messages*). Przycisk „zgłoś” i blokowanie osób to następny krok (lista kontrolna niżej).
- Premium nadal nie jest egzekwowane. Następny krok: tabela `subscriptions` zasilana przez `stripe-webhook.js` i reguła w bazie.

## Krok 2b: głos w roomach (do zrobienia przed startem)

- **LiveKit** lub **Daily** (rozmowy głosowe w roomach): token dostępu generowany przez funkcję Netlify po sprawdzeniu, czy użytkownik ma prawo wejść.
- Po podłączeniu dopisz adresy usługi do `connect-src` w `netlify.toml` i ustaw `providers.voice` w `config.js`.

## Etap 1: Korean Café, Fandom Chat, odpowiedzi i edycja (wymaga bazy)

Nowe sekcje (Start, Nauka, Korean Café, Fandom Chat) korzystają z Supabase. Zanim zaczną działać:

1. Supabase → *SQL Editor* → wklej `supabase/schema-v2.sql` → *Run* (po wcześniejszym `schema.sql`; można uruchomić ponownie).
2. Załóż konto w aplikacji, a potem w tym samym edytorze uruchom (z Twoim adresem e-mail), żeby zostać administratorem:
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TWOJ@EMAIL.PL');`
3. Stoliki i fandomy (ARMY, STAY, MULTISTAN) pojawią się od razu. Liczby członków, wolne miejsca i ostatnia aktywność są liczone z bazy.

Role: `member` (domyślnie), `moderator` (może usuwać cudze wiadomości), `admin`.

## Przed publicznym startem (lista kontrolna)

- Regulamin i Polityka prywatności: uzupełnij szkielety (RODO, dane sprzedawcy, prawo odstąpienia dla treści cyfrowych).
- Moderacja: zgłaszanie nadużyć, blokowanie, rola moderatora w roomach. Strona wymaga potwierdzenia 18+, ale to tylko oświadczenie w przeglądarce, a konta nie weryfikują wieku.
- Czcionki Google (Fredoka, Jua, Nunito, Noto Sans KR, Pacifico): ładowane z serwerów Google (przekazują adres IP). Jeśli chcesz tego uniknąć, pobierz je i hostuj lokalnie.
- Ikony PWA: gotowe w `public/img/` (z Twojego logo). Jeśli zmienisz logo, podmień pliki `logo.png`, `logo-96.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
- Godziny roomów i wydarzeń: podawane w `data.js` w czasie warszawskim. Wspólne okno z Koreą to mniej więcej 12:00–15:00 w Polsce (19:00–22:00 w Seulu); wieczorne godziny polskie wypadają w Korei w nocy.

## Jak zmieniać treści

- Nowy czat lub room: dopisz pozycję w `public/js/data.js`.
- Zmiana tekstów: `public/js/teksty.js` (pierwszy element to polski, drugi koreański).
- Ceny na ekranie: `public/js/config.js` (prawdziwe ceny zmieniasz w Stripe).
