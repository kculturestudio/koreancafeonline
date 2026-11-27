/* Brama "Coming soon": dopóki ktoś nie wpisze hasła testerów, cała strona pokazuje tylko ekran "Coming soon".
   Hasło sprawdza serwer Netlify (Edge Function), więc nie da się go podejrzeć w kodzie strony.
   Hasło ustawiasz w Netlify: Site configuration → Environment variables → GATE_PASSWORD.
   Zmiana hasła wylogowuje z bramy wszystkich (ich ciasteczko przestaje pasować).
   Bramę wyłączysz, usuwając ten plik (albo ustawiając GATE_OFF=true). */

const COOKIE = 'kco_brama';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dni
const LOGIN_PATH = '/__brama';
const LOGOUT_PATH = '/__brama/wyloguj';
const PUBLIC_FILES = new Set(['/img/logo-160.png', '/favicon.svg', '/robots.txt']);

function env(name) {
  try { return globalThis.Netlify && Netlify.env.get(name); } catch (e) { return undefined; }
}

async function tokenFor(pw) {
  const data = new TextEncoder().encode('kco-brama-v1:' + pw);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function readCookie(req, name) {
  const all = req.headers.get('cookie') || '';
  for (const part of all.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

function page(error) {
  const msg = error
    ? '<p class="err" role="alert">' + error + '</p>'
    : '';
  const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Korean Cafe Online · Coming soon</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: light; --ink: #2A2A2E; --blush: #E6AEBB; --blush-deep: #A5546A; --ivory: #FBF7F2; --line: #E7E1DA; --muted: #5F626C; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--ivory); color: var(--ink);
    font: 16px/1.5 "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px 16px; }
  main { width: 100%; max-width: 380px; text-align: center; }
  img { width: 112px; height: 112px; border-radius: 50%; }
  h1 { font-size: 30px; margin: 18px 0 4px; letter-spacing: .01em; }
  .ko { color: var(--blush-deep); font-weight: 700; margin: 0 0 14px; }
  p.lead { color: var(--muted); margin: 0 0 28px; }
  form { display: grid; gap: 10px; text-align: left; }
  label { font-size: 14px; font-weight: 700; }
  input { width: 100%; font: inherit; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: #fff; color: var(--ink); }
  input:focus { outline: 2px solid var(--blush); outline-offset: 1px; }
  button { font: inherit; font-weight: 700; padding: 12px 14px; border: 0; border-radius: 999px; background: var(--ink); color: #fff; cursor: pointer; }
  .err { color: #B3261E; font-weight: 600; margin: 0; }
  small { display: block; margin-top: 22px; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<main>
  <img src="/img/logo-160.png" alt="Korean Cafe Online">
  <h1>Coming soon</h1>
  <p class="ko">곧 만나요 · Wkrótce otwieramy</p>
  <p class="lead">Korean Cafe Online jest w fazie testów. Wejście tylko dla testerów i administratorów.</p>
  <form method="post" action="${LOGIN_PATH}">
    <label for="pw">Hasło dostępu</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required maxlength="200" autofocus>
    ${msg}
    <button type="submit">Wejdź</button>
  </form>
  <small>K-Culture Studio · Fundacja Hanguk</small>
</main>
</body>
</html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
    }
  });
}

export default async function brama(request, context) {
  const url = new URL(request.url);
  // Wylogowanie z bramy: kasuje ciasteczko i wraca na ekran Coming soon (przycisk „Wyloguj” w Profilu).
  if (url.pathname === LOGOUT_PATH) {
    return new Response(null, {
      status: 303,
      headers: {
        location: '/',
        'cache-control': 'no-store',
        'set-cookie': COOKIE + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'
      }
    });
  }
  if (env('GATE_OFF') === 'true') return context.next();
  const password = String(env('GATE_PASSWORD') || '').trim(); // spacje na końcu (np. po wklejeniu) nie liczą się

  if (url.pathname === LOGIN_PATH && request.method === 'POST') {
    if (!password) return page('Brama nie ma jeszcze ustawionego hasła (GATE_PASSWORD w Netlify).');
    let given = '';
    try { const form = await request.formData(); given = String(form.get('password') || '').trim(); } catch (e) { given = ''; }
    const [a, b] = await Promise.all([tokenFor(given), tokenFor(password)]);
    if (!same(a, b)) return page('Nieprawidłowe hasło. Sprawdź wielkość liter.');
    return new Response(null, {
      status: 303,
      headers: {
        location: '/#/logowanie',
        'cache-control': 'no-store',
        'set-cookie': COOKIE + '=' + b + '; Path=/; Max-Age=' + MAX_AGE + '; HttpOnly; Secure; SameSite=Lax'
      }
    });
  }

  if (password && same(readCookie(request, COOKIE), await tokenFor(password))) {
    if (url.pathname === LOGIN_PATH) return Response.redirect(new URL('/#/logowanie', url), 303);
    return context.next();
  }
  if (PUBLIC_FILES.has(url.pathname)) return context.next();
  return page('');
}

// Wszystko poza funkcjami Netlify (webhook Stripe musi działać bez hasła).
export const config = { path: '/*', excludedPath: ['/.netlify/*'] };
