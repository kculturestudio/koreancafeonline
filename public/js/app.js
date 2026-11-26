(function () {
  'use strict';

  var CFG = window.KCO_CONFIG;
  CFG.lite = true;
  var D = window.KCO_DATA;
  var S = window.KCO_I18N;
  var app = document.getElementById('app');
  /* przewijany obszar: w widokach czatu to #chatbody (góra i dół strony stoją w miejscu), poza nimi cała strona */
  function sc() { return document.getElementById('chatbody') || app; }
  var toastEl = document.getElementById('toast');
  var WARSAW = 'Europe/Warsaw';
  var SEOUL = 'Asia/Seoul';
  var DAYS_PL = ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  var DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

  /* ---------- storage ---------- */
  // Pamięć podręczna na czas sesji: strona działa też wtedy, gdy przeglądarka blokuje localStorage.
  var mem = {};
  function load(key, def) {
    if (Object.prototype.hasOwnProperty.call(mem, key)) return mem[key];
    try {
      var v = localStorage.getItem('kco.' + key);
      return v === null ? def : JSON.parse(v);
    } catch (e) { return def; }
  }
  function save(key, value) {
    mem[key] = value;
    try { localStorage.setItem('kco.' + key, JSON.stringify(value)); } catch (e) { /* zapis zablokowany: zostaje tylko pamięć sesji */ }
  }

  /* ---------- state ---------- */
  var EN = window.KCO_EN || {};
  EN['Ćwicz gotowe scenariusze z kotkiem'] = 'Practice ready-made scenarios with the cat';
  EN['Czego się uczysz'] = 'What are you learning'; EN['Uczę się koreańskiego'] = 'Learning Korean'; EN['Uczę się polskiego'] = 'Learning Polish';
  EN['Ćwicz z kotkiem'] = 'Practice with the cat'; EN['Gotowe scenariusze rozmów, krok po kroku'] = 'Ready-made conversation scenarios, step by step';
  EN['Wydarzenia: lekcje polskiego'] = 'Events: Polish lessons'; EN['Lekcje na żywo z nauczycielem, dla Koreańczyków uczących się polskiego.'] = 'Live lessons with a teacher, for Koreans learning Polish.';
  EN['Pogaduszki są za darmo, a każdy stolik ma 7 dni za darmo. Premium (29 zł/mies.) otwiera wszystkie kluby (K-dramy, K-pop taniec, Polski dla Koreańczyków) i wydarzenia.'] = 'Chats are free, and every table has 7 free days. Premium (29 PLN/mo) opens all clubs (K-drama, K-pop dance, Polish for Koreans) and events.';
  EN['Rozmowy po polsku! Klub w ramach Premium: Koreańczycy piszą, Polacy poprawiają.'] = 'Polish conversation! A Premium club: Koreans write, Poles correct.';
  EN['Szukasz rozmów po polsku? Dołącz do klubu Rozmowy po polsku (Premium).'] = 'Looking for conversation in Polish? Join the Polish conversation club (Premium).';
  EN['Skontaktuj się z nami'] = 'Contact us'; EN['Jak działa nasza kawiarnia?'] = 'How does our café work?';
  EN['Informacje'] = 'Information'; EN['O Korean Cafe Online'] = 'About Korean Cafe Online'; EN['Koncepcja, subskrypcja, czaty i wydarzenia'] = 'Concept, subscription, chats and events';
  EN['Profil'] = 'Profile'; EN['Aplikacja'] = 'App'; EN['O aplikacji'] = 'About'; EN['Dla testujących'] = 'For testers'; EN['Tak, zresetuj'] = 'Yes, reset'; EN['Anuluj'] = 'Cancel';
  EN['Zresetować demo? Dane z tej przeglądarki zostaną usunięte.'] = 'Reset the demo? Data in this browser will be deleted.';
  EN['Wszystkie kluby, wydarzenia na żywo i tłumaczenia w czacie'] = 'All clubs, live events and chat translations';
  EN['Start'] = 'Start'; EN['Zacznij od krótkiego dopasowania: 2 minuty o tym, czego się uczysz.'] = 'Start with a short match: 2 minutes about what you are learning.';
  EN['Odpowiedz na wiadomość'] = 'Reply to this message'; EN['Anuluj odpowiedź'] = 'Cancel reply'; EN['Odpowiedź dla'] = 'Replying to'; EN['Popraw tę wiadomość'] = 'Correct this message'; EN['Poprawka dla'] = 'Correction for'; EN['Zmień coś w wiadomości, żeby wysłać poprawkę.'] = 'Change something in the message to send a correction.'; EN['Poprawka od'] = 'Correction by'; EN['Dlaczego'] = 'Why'; EN['Prompt na dziś'] = "Today's prompt"; EN['Czat'] = 'Chat'; EN['Informacje'] = 'Info'; EN['Dlaczego? (opcjonalnie)'] = 'Why? (optional)';
  function T(pl) { return (lang === 'en' && EN.hasOwnProperty(pl)) ? EN[pl] : pl; }
  var DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* Angielski: teksty, które nie przechodzą przez t()/L(), tłumaczymy po wyrenderowaniu (poza treściami do nauki z lang="pl"/"ko"). */
  var xBusy = false, XATTR = ['placeholder', 'aria-label', 'title', 'alt'];
  function xlateStr(v) {
    if (EN.hasOwnProperty(v)) return EN[v];
    var tr = v.trim();
    if (tr && tr !== v && EN.hasOwnProperty(tr)) return v.replace(tr, EN[tr]);
    return null;
  }
  function xlate(root) {
    if (lang !== 'en' || !root || xBusy) return;
    xBusy = true;
    try {
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
      while ((n = w.nextNode())) list.push(n);
      list.forEach(function (tn) {
        var par = tn.parentNode;
        if (!par || (par.closest && par.closest('script,style,[lang="pl"],[lang="ko"]'))) return;
        var r = xlateStr(tn.nodeValue);
        if (r !== null) tn.nodeValue = r;
      });
      var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label],[title],[alt]') : [];
      Array.prototype.forEach.call(els, function (el) {
        if (el.closest('[lang="pl"],[lang="ko"]') && el.tagName !== 'INPUT') return;
        XATTR.forEach(function (a) {
          var v = el.getAttribute(a);
          if (v) { var r = xlateStr(v); if (r !== null) el.setAttribute(a, r); }
        });
      });
    } finally { xBusy = false; }
  }
  (function () {
    function start() {
      if (typeof MutationObserver === 'undefined') return;
      new MutationObserver(function (muts) {
        if (lang !== 'en' || xBusy) return;
        muts.forEach(function (m) {
          if (m.type === 'childList') Array.prototype.forEach.call(m.addedNodes, function (nd) { if (nd.nodeType === 1) xlate(nd); else if (nd.nodeType === 3 && nd.parentNode) xlate(nd.parentNode); });
          else if (m.type === 'characterData' && m.target.parentNode) xlate(m.target.parentNode);
        });
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  })();
  var lang = load('lang', 'pl');
  if (lang !== 'pl' && lang !== 'ko' && lang !== 'en') lang = 'pl';
  /* EN: treści lekcji i rozmów (KC_LEKCJE, KC_ROZMOWY) tłumaczymy w danych przy starcie; zmiana języka z/na EN odświeża stronę. */
  function xData(o) {
    if (o === null || typeof o !== 'object') return;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string') { if (EN.hasOwnProperty(v)) o[k] = EN[v]; }
      else xData(v);
    });
  }
  if (lang === 'en') { try { xData(window.KC_LEKCJE); xData(window.KC_ROZMOWY); } catch (e) { /* brak danych */ } }
  var ui = {
    plan: 'monthly',
    mic: false,
    banner: null,
    keepScroll: false,
    pWrong: null,
    filters: load('filters', { lang: 'all', level: 'all', topic: 'all', age: 'all' })
  };
  (function readCheckoutResult() {
    var q = new URLSearchParams(window.location.search).get('checkout');
    if (q === 'success' || q === 'cancel') {
      ui.banner = q;
      try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch (e) { /* ignore */ }
    }
  })();

  /* ---------- konta i czat na żywo: Supabase (włącza się, gdy w config.js są adres i klucz) ---------- */
  var SB = (function () {
    var sc = CFG.supabase || {};
    var pr = CFG.providers || {};
    var lib = window.supabase;
    if (pr.auth !== 'supabase' || pr.chat !== 'supabase' || !sc.url || !sc.anonKey || !lib || !lib.createClient) return { on: false };
    try {
      return {
        on: true,
        client: lib.createClient(sc.url, sc.anonKey, {
          auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        })
      };
    } catch (e) { return { on: false }; }
  })();
  ui.user = null;            // { id, email } po zalogowaniu
  ui.authReady = !SB.on;     // true, gdy wiadomo już, czy ktoś jest zalogowany
  ui.returnTo = null;        // dokąd wrócić po zalogowaniu
  ui.recovery = false;       // true, gdy ktoś wszedł z linku "zmień hasło"

  /* ---------- helpers ---------- */
  function t(key) {
    var v = S[key];
    if (!v) return key;
    return lang === 'ko' ? v[1] : T(v[0]);
  }
  function tf(key, vars) {
    var s = t(key);
    Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function L(o) { return lang === 'en' ? T(o.pl) : o[lang]; }
  function O(o) { return o[lang === 'ko' ? 'pl' : 'ko']; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function findBy(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }
  function hasSeason() { var tb = load('tables', {}); return D.tables.some(function (x) { return x.kind === 'season' && tb[x.id] && tb[x.id].joined; }); }
  function isBeta() { return !!load('beta', false); }
  function isPremium() { if (isBeta()) return true; if (CFG.lite) return false; return !!CFG.devForcePremium || !!load('demoPremium', false) || hasSeason(); }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.hidden = true; }, 3500);
  }

  /* ---------- nawigacja: adres w #hash, z zapasem w pamięci, gdy przeglądarka blokuje zmianę adresu ---------- */
  var memHash = null;
  var renderedHash = null;
  function currentHash() { return memHash !== null ? memHash : (location.hash || '#/'); }
  function navigate(h, replace) {
    try { if (replace) location.replace(h); else location.hash = h; } catch (e) { /* ramka bez dostępu do adresu */ }
    memHash = (location.hash === h) ? null : h;
    route();
  }

  var ICONS = {
    me: '<path d="M4.5 10V4.8a.6.6 0 0 1 1-.4L9 6.8a9 9 0 0 1 6 0l3.5-2.4a.6.6 0 0 1 1 .4V10c.9 1.1 1.3 2.4 1.3 3.8 0 3.8-3.4 6-7.3 6s-7.3-2.2-7.3-6c0-1.4.4-2.7 1.3-3.8z"/><circle cx="9.3" cy="13" r=".7" fill="currentColor"/><circle cx="14.7" cy="13" r=".7" fill="currentColor"/><path d="M10.7 15.6q1.3 1.1 2.6 0"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    cup: '<path d="M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.5 0 4.5 2 4.5 4.5"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
    crown: '<path d="M4 8l4 4 4-7 4 7 4-4-2 11H6z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    micoff: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    pen: '<path d="M4 20l1-4L17 4l3 3L8 19zM14.5 6.5l3 3"/>',
    sound: '<path d="M4 10v4h4l5 4V6l-5 4zM16.5 9a4 4 0 0 1 0 6"/>',
    reply: '<path d="M10 7L4 12l6 5"/><path d="M4 12h9a7 7 0 0 1 7 7"/>'
  };
  function ico(name, size) {
    size = size || 24;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg>';
  }

  /* ---------- czas: godziny w Warszawie przeliczane na Seul ---------- */
  function parts(date, tz) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    var o = {};
    f.formatToParts(date).forEach(function (x) { o[x.type] = x.value; });
    var y = +o.year, m = +o.month, d = +o.day;
    return { y: y, m: m, d: d, hh: +o.hour, mm: +o.minute, ss: +o.second, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
  }
  function tzOffsetMin(date, tz) {
    var p = parts(date, tz);
    return (Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - (date.getTime() - date.getUTCMilliseconds())) / 60000;
  }
  function zonedToUtc(y, m, d, hh, mm, tz) {
    var guess = Date.UTC(y, m - 1, d, hh, mm);
    var off = tzOffsetMin(new Date(guess), tz);
    var result = guess - off * 60000;
    var off2 = tzOffsetMin(new Date(result), tz);
    if (off2 !== off) result = guess - off2 * 60000;
    return new Date(result);
  }
  function fmtTime(date, tz) {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(date);
  }
  function ymd(date, tz) { var p = parts(date, tz); return p.y * 10000 + p.m * 100 + p.d; }
  function nextSlot(item, now) {
    var p = parts(now, WARSAW);
    var hm = item.time.split(':');
    for (var i = -1; i <= 7; i++) {
      var dt = new Date(Date.UTC(p.y, p.m - 1, p.d + i));
      if (item.dow.indexOf(dt.getUTCDay()) < 0) continue;
      var start = zonedToUtc(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), +hm[0], +hm[1], WARSAW);
      var end = new Date(start.getTime() + item.dur * 60000);
      if (end > now) return { start: start, end: end, live: start <= now };
    }
    return null;
  }
  function dayLabel(date, now) {
    var p = parts(date, WARSAW), n = parts(now, WARSAW);
    var diff = Math.round((Date.UTC(p.y, p.m - 1, p.d) - Date.UTC(n.y, n.m - 1, n.d)) / 86400000);
    if (diff === 0) return t('when.today');
    if (diff === 1) return t('when.tomorrow');
    return lang === 'ko' ? (p.m + '/' + p.d + ' (' + DAYS_KO[p.dow] + ')') : lang === 'en' ? (DAYS_EN[p.dow] + ' ' + p.d + ' ' + MON_EN[p.m - 1]) : (DAYS_PL[p.dow] + ' ' + pad(p.d) + '.' + pad(p.m));
  }
  function whenText(date, now) {
    var plus = ymd(date, SEOUL) > ymd(date, WARSAW) ? ' +1' : '';
    return dayLabel(date, now) + ' ' + fmtTime(date, WARSAW) + ' PL · ' + fmtTime(date, SEOUL) + plus + ' KR';
  }

  /* ---------- usługa czatu (dziś: tylko lokalnie; tu podłączysz prawdziwy backend) ---------- */
  /* dane widoczne dla wszystkich w kawiarni: miasto i zainteresowania (imię jest osobno) */
  function pubProfile() {
    return { city: String(load('city', '') || '').trim().slice(0, 40), interests: String(load('interests', '') || '').trim().slice(0, 80) };
  }
  function interestsHtml(str) {
    var a = String(str || '').split(/[,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4);
    return a.length ? '<span class="who-int">' + a.map(esc).join(' · ') + '</span>' : '';
  }
  var Chat = {
    history: function (key) {
      var seeds = (CFG.demo && D.seeds[key]) || [];
      return seeds.concat(load('msgs.' + key, []));
    },
    send: function (key, text, reply) {
      var d = new Date();
      var pub = pubProfile();
      var msg = { mine: true, text: text, city: pub.city, interests: pub.interests, time: pad(d.getHours()) + ':' + pad(d.getMinutes()) };
      if (reply) msg.reply = reply;
      var list = load('msgs.' + key, []);
      list.push(msg);
      save('msgs.' + key, list.slice(-100));
      return msg;
    }
  };

  /* ---------- odpowiadanie na wiadomości ----------
     Odpowiedź niesie krótki cytat (autor + początek wiadomości). Na koncie (Supabase) cytat jest zapisany na początku tekstu
     między niewidocznymi znakami, więc nie trzeba zmieniać bazy. Strona rozpakowuje go przy wyświetlaniu. */
  var RSEP = '\u2063';
  function replyClip(s, n) {
    s = String(s || '').split(RSEP).join('').split(FSEP).join('').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
  var FSEP = '\u2064'; // poprawka: inny znak niż przy zwykłej odpowiedzi
  function packReply(text, r) {
    if (!r) return text;
    return r.fix ? FSEP + r.a + FSEP + r.t + FSEP + (r.why || '') + FSEP + text : RSEP + r.a + RSEP + r.t + RSEP + text;
  }
  function unpackReply(text) {
    var fp = String(text == null ? '' : text).split(FSEP);
    if (fp.length >= 5 && fp[0] === '') return { reply: { a: fp[1], t: fp[2], fix: true, why: fp[3] }, text: fp.slice(4).join(FSEP) };
    if (fp.length >= 4 && fp[0] === '') return { reply: { a: fp[1], t: fp[2], fix: true }, text: fp.slice(3).join(FSEP) };
    var p = String(text == null ? '' : text).split(RSEP);
    if (p.length >= 4 && p[0] === '') return { reply: { a: p[1], t: p[2] }, text: p.slice(3).join(RSEP) };
    return { text: String(text == null ? '' : text) };
  }
  function replyOverhead(r) { return r ? 3 + r.a.length + r.t.length + (r.fix ? 1 + (r.why || '').length : 0) : 0; }
  function clearReply() {
    var wasFix = !!(ui.reply && ui.reply.fix);
    ui.reply = null;
    var f = document.querySelector('form.composer.has-reply');
    if (!f) return;
    if (wasFix && f.elements.text) f.elements.text.value = '';
    var bar = f.querySelector('.reply-bar');
    if (bar) bar.parentNode.removeChild(bar);
    f.classList.remove('has-reply');
    if (f.elements.text) f.elements.text.maxLength = 500;
  }
  function setReply(form, r, kind) {
    var fix = kind === 'fix';
    var a = replyClip(r.a, 30), tx = replyClip(r.t, fix ? 120 : 60);
    clearReply();
    ui.reply = { key: form.getAttribute('data-key'), a: a, t: tx, fix: fix, full: String(r.t || '') };
    var bar = document.createElement('div');
    bar.className = 'reply-bar';
    bar.innerHTML = ico(fix ? 'pen' : 'reply', 16) + '<span class="reply-txt"><b>' + (fix ? esc(t('chat.fixTo')) + ' ' : '') + esc(a) + '</b>' + esc(tx) + '</span>' +
      '<button type="button" class="reply-x" data-action="reply-cancel" aria-label="' + esc(t('chat.replyCancel')) + '">' + ico('close', 16) + '</button>' +
      (fix ? '<input class="reply-why" name="why" type="text" maxlength="100" autocomplete="off" placeholder="' + esc(t('chat.fixWhyPh')) + '" aria-label="' + esc(t('chat.fixWhyPh')) + '">' : '');
    form.insertBefore(bar, form.firstChild);
    form.classList.add('has-reply');
    var inp = form.elements.text;
    if (inp) {
      inp.maxLength = Math.max(40, 500 - replyOverhead(ui.reply) - (fix ? 101 : 0));
      if (fix) inp.value = ui.reply.full.slice(0, inp.maxLength);
      inp.focus({ preventScroll: true });
      if (fix) { try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { /* ignore */ } }
    }
  }

  /* ---------- czat na żywo (Supabase): historia z bazy + nowe wiadomości od razu ---------- */
  var Live = { token: 0, ids: {}, channel: null };
  var MSG_COLS = 'id,user_id,author,city,interests,text,created_at';

  function msgTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var n = new Date();
    if (d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()) return hm;
    return (lang === 'ko' ? (d.getMonth() + 1) + '/' + d.getDate() : lang === 'en' ? d.getDate() + ' ' + MON_EN[d.getMonth()] : pad(d.getDate()) + '.' + pad(d.getMonth() + 1)) + ' ' + hm;
  }
  function rowToMsg(row) {
    var u = unpackReply(row.text);
    return { mine: !!(ui.user && row.user_id === ui.user.id), author: row.author, city: row.city || '', interests: row.interests || '', time: msgTime(row.created_at), text: u.text, reply: u.reply };
  }
  Live.detach = function () {
    Live.token++;
    if (Live.channel) { try { SB.client.removeChannel(Live.channel); } catch (e) { /* ignore */ } }
    Live.channel = null;
    Live.ids = {};
  };
  Live.add = function (row, force) {
    if (!row || Live.ids[row.id]) return;
    var box = document.getElementById('messages');
    if (!box) return;
    Live.ids[row.id] = true;
    var scr = sc();
    var near = scr.scrollHeight - (scr.scrollTop + scr.clientHeight) < 160;
    var empty = box.querySelector('[data-empty]');
    if (empty) empty.parentNode.removeChild(empty);
    box.insertAdjacentHTML('beforeend', msgHtml(rowToMsg(row)));
    if (force || near) scr.scrollTop = scr.scrollHeight;
  };
  Live.attach = function (key) {
    Live.detach();
    var token = Live.token;
    var box = document.getElementById('messages');
    if (!box || !ui.user) return;
    var loaded = false;
    var pending = [];
    function fail() { if (token === Live.token) box.innerHTML = '<p class="day-sep">' + esc(t('chat.loadError')) + '</p>'; }
    // najpierw nasłuch, potem pobranie historii, żeby żadna wiadomość nie przepadła pomiędzy
    Live.channel = SB.client.channel('msgs:' + key)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'channel=eq.' + key }, function (p) {
        if (token !== Live.token) return;
        if (loaded) { Live.add(p['new']); var dd = document.querySelector('.screen[data-tdtab="info"] .tdtab-dot'); if (dd) dd.hidden = false; } else pending.push(p['new']);
      })
      .subscribe();
    SB.client.from('messages').select(MSG_COLS).eq('channel', key).order('created_at', { ascending: false }).limit(100)
      .then(function (r) {
        if (token !== Live.token) return;
        if (r.error) return fail();
        var rows = (r.data || []).slice().reverse();
        box.innerHTML = '<div class="empty-state" data-empty>' + mascot('chmurka') + '<p class="day-sep">' + esc(t('chat.empty')) + '</p></div>';
        rows.forEach(function (row) { Live.add(row); });
        loaded = true;
        pending.forEach(function (row) { Live.add(row); });
        sc().scrollTop = sc().scrollHeight;
      }, fail);
  };
  Live.send = function (key, text) {
    var author = (load('name', '') || t('profile.guest')).slice(0, 30);
    var pub = pubProfile();
    return SB.client.from('messages').insert({ channel: key, author: author, city: pub.city || null, interests: pub.interests || null, text: text }).select(MSG_COLS).single()
      .then(function (r) {
        if (r.error) throw r.error;
        return r.data;
      });
  };

  /* ---------- logowanie ---------- */
  function siteUrl() { return window.location.origin + window.location.pathname; }
  function authErr(err) {
    var c = (err && err.code) || '';
    var m = String((err && err.message) || '').toLowerCase();
    if (c === 'invalid_credentials' || m.indexOf('invalid login') >= 0) return t('auth.err.invalid');
    if (c === 'email_not_confirmed' || m.indexOf('not confirmed') >= 0) return t('auth.err.unconfirmed');
    if (c === 'user_already_exists' || m.indexOf('already registered') >= 0) return t('auth.err.exists');
    if (c === 'weak_password') return t('auth.err.weak');
    if (c === 'over_request_rate_limit' || c === 'over_email_send_rate_limit' || (err && err.status === 429)) return t('auth.err.rate');
    return t('auth.err.generic');
  }
  var Auth = {
    login: function (email, pw) { return SB.client.auth.signInWithPassword({ email: email, password: pw }); },
    register: function (email, pw, name) {
      return SB.client.auth.signUp({ email: email, password: pw, options: { data: { name: name }, emailRedirectTo: siteUrl() } });
    },
    reset: function (email) { return SB.client.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() }); },
    setPassword: function (pw) { return SB.client.auth.updateUser({ password: pw }); },
    logout: function () { return SB.client.auth.signOut(); }
  };

  /* ---------- postęp: XP, ziarna, streak i ćwiczenia. Lokalnie zawsze, na koncie (Supabase) po zalogowaniu ---------- */
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  var Prog = {
    stats: function () { return load('stats', { xp: 0, beans: 0, streak: 0, last: '' }); },
    // Nagroda za poprawną odpowiedź. Streak rośnie raz dziennie i zeruje się po przerwie dłuższej niż dzień.
    award: function (xp, beans) {
      var st = this.stats(), today = dayKey();
      var act = load('active', {}); act[today] = 1; save('active', act);
      if (st.last !== today) {
        var y = new Date(); y.setDate(y.getDate() - 1);
        st.streak = st.last === dayKey(y) ? st.streak + 1 : 1;
        st.last = today;
      }
      st.xp += xp; st.beans += beans;
      save('stats', st);
      this.push();
    },
    level: function () { return 1 + Math.floor(this.stats().xp / 100); },
    snapshot: function () { return { stats: this.stats(), practice: load('practice', {}), lada: load('lada', null) }; },
    // Łączy dane z konta z lokalnymi: wyższe XP wygrywa, a w ćwiczeniach liczy się dalszy postęp.
    merge: function (remote) {
      if (!remote || typeof remote !== 'object') return;
      var ls = this.stats(), rs = remote.stats || {};
      var st = (rs.xp || 0) > ls.xp ? { xp: rs.xp || 0, beans: rs.beans || 0, streak: rs.streak || 0, last: rs.last || '' } : ls;
      save('stats', st);
      var lp = load('practice', {}), rp = remote.practice || {};
      Object.keys(rp).forEach(function (k) { if ((rp[k] || 0) > (lp[k] || 0)) lp[k] = rp[k]; });
      save('practice', lp);
      // Lada: wygrywa nowsza wersja (pole at), a zapisana na koncie zastępuje pustą lokalną.
      var ll = load('lada', null), rl = remote.lada;
      if (rl && typeof rl === 'object' && rl.done && (!ll || !ll.done || (rl.at || 0) > (ll.at || 0))) {
        save('lada', rl); if (rl.level) save('level', rl.level); ui.lada = null;
      }
    },
    pull: function () {
      if (!SB.on || !ui.user) return Promise.resolve();
      var self = this;
      return SB.client.from('progress').select('data').eq('user_id', ui.user.id).maybeSingle().then(function (r) {
        if (r && r.data && r.data.data) self.merge(r.data.data);
        self.push(true);
        if (/^#\/(cwiczenia|profil)/.test(currentHash())) { ui.keepScroll = true; route(); }
      }, function () { /* offline: zostaje zapis lokalny */ });
    },
    push: function (now) {
      if (!SB.on || !ui.user) return;
      var self = this;
      clearTimeout(this._t);
      this._t = setTimeout(function () {
        SB.client.from('progress').upsert({ user_id: ui.user.id, data: self.snapshot(), updated_at: new Date().toISOString() }).then(function () {}, function () {});
      }, now ? 0 : 800);
    }
  };

  /* ---------- widoki: części wspólne ---------- */
  var HERO = '<img class="hero-logo" src="img/logo-160.png" alt="" width="132" height="132">' +
    '<div class="hero-title" aria-hidden="true">Korean Café Online</div>' +
    '<span class="hero-script" aria-hidden="true">한국 카페 온라인</span>';

  function langSeg() {
    return '<div class="seg" role="group" aria-label="' + esc(t('profile.lang')) + '">' +
      '<button type="button" data-action="lang" data-lang="pl" aria-pressed="' + (lang === 'pl') + '">Polski</button>' +
      '<button type="button" data-action="lang" data-lang="en" aria-pressed="' + (lang === 'en') + '">English</button>' +
      '<button type="button" data-action="lang" data-lang="ko" aria-pressed="' + (lang === 'ko') + '">한국어</button></div>';
  }
  function legalLine() {
    return '<p class="fine">' + esc(t('legal.pre')) + '<a href="regulamin.html">' + esc(t('legal.terms')) + '</a>' +
      esc(t('legal.and')) + '<a href="prywatnosc.html">' + esc(t('legal.privacy')) + '</a>' + esc(t('legal.post')) + '</p>';
  }
  function nav(active) {
    var items = [
      ['chats', '#/kawiarnia', 'cup', 'nav.cafe'],
      ['tables', '#/stoliki', 'people', 'nav.rooms'],
      ['events', '#/wydarzenia', 'calendar', 'nav.events'],
      ['practice', '#/cwiczenia', 'pen', 'nav.practice'],
      ['profile', '#/profil', 'user', 'nav.profile']
    ];
    return '<nav class="nav" aria-label="' + esc(t('nav.label')) + '">' + items.map(function (i) {
      return '<a href="' + i[1] + '"' + (active === i[0] ? ' aria-current="page"' : '') + '>' + ico(i[2]) + '<span>' + esc(t(i[3])) + '</span></a>';
    }).join('') + '</nav>';
  }
  function show(html, title, opts) {
    opts = opts || {};
    var keep = ui.keepScroll;
    ui.keepScroll = false;
    ui.reply = null;
    app.innerHTML = html;
    xlate(app);
    document.documentElement.lang = lang;
    document.title = title + ' · Korean Cafe Online';
    if (keep) return;
    app.scrollTop = 0;
    var s0 = sc(); if (s0 !== app) s0.scrollTop = opts.bottom ? s0.scrollHeight : 0; else if (opts.bottom) app.scrollTop = app.scrollHeight;
    var v = document.getElementById('view');
    if (v) v.focus({ preventScroll: true });
  }
  function notFound(key) {
    show('<main class="screen" id="view" tabindex="-1"><div class="content"><p class="empty">' + esc(t(key)) + '</p>' +
      '<a class="btn btn-ghost btn-sm" href="#/kawiarnia">' + esc(t('common.back')) + '</a></div></main>', 'Korean Cafe Online');
  }

  /* ---------- widok: powitanie ---------- */
  function viewWelcome() {
    var ok = !!load('age18', false);
    var html = '<main class="screen welcome welcome-min" id="view" tabindex="-1">' +
      '<div class="head welcome-lang">' + langSeg() + '</div>' +
      '<div class="hero">' + HERO.replace('alt=""', 'alt="' + esc(t('welcome.heroAlt')) + '"') + '</div>' +
      '<p class="welcome-tag">' + esc(t('welcome.h1')) + '</p>' +
      '<div class="welcome-actions">' +
      '<label class="check"><input type="checkbox" id="age18"' + (ok ? ' checked' : '') + '><span>' + esc(t('welcome.age')) + '</span></label>' +
      '<button type="button" class="btn btn-primary" id="enter" data-action="enter"' + (ok ? '' : ' disabled') + '>' + esc(t('welcome.cta')) + '</button>' +
      legalLine() +
      '<p class="fine">' + esc(t('welcome.trial')) + '</p></div></main>';
    show(html, 'Korean Cafe Online');
  }

  /* ---------- widok: kawiarnia (czaty 24/7 + roomy na żywo) ---------- */
  function matches(item) {
    var f = ui.filters;
    if (f.lang !== 'all' && item.lang !== f.lang && item.lang !== 'MIX') return false;
    if (f.level !== 'all' && item.levels.indexOf(f.level) < 0) return false;
    if (f.topic !== 'all' && item.topic !== f.topic) return false;
    if (f.age !== 'all' && item.ages.indexOf(f.age) < 0) return false;
    return true;
  }
  function selectChip(name, label, opts) {
    var cur = ui.filters[name];
    return '<label class="chip-select"><span class="sr-only">' + esc(label) + '</span><select data-filter="' + name + '" aria-label="' + esc(label) + '">' +
      opts.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (cur === o[0] ? ' selected' : '') + '>' + esc(label + ': ' + o[1]) + '</option>';
      }).join('') + '</select></label>';
  }
  function filtersHtml() {
    var f = ui.filters, n = ['level', 'topic', 'age'].filter(function (k) { return f[k] && f[k] !== 'all'; }).length;
    return '<button type="button" class="filter-toggle" data-action="filters-toggle" aria-expanded="' + (n > 0) + '" aria-controls="filters">' + ico('filter', 18) +
      '<span>' + esc(t('f.title')) + '</span>' + (n ? '<b class="filter-n">' + n + '</b>' : '') + '</button>' +
      '<div class="filters" id="filters"' + (n ? '' : ' hidden') + '>' +
      selectChip('level', t('f.level'), [['all', t('f.all')], ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']]) +
      selectChip('topic', t('f.topic'), [['all', t('f.all')], ['language', t('f.topic.language')], ['culture', t('f.topic.culture')], ['life', t('f.topic.life')], ['dance', t('f.topic.dance')]]) +
      selectChip('age', t('f.age'), [['all', t('f.all')], ['18-25', '18–25'], ['26-35', '26–35'], ['36+', '36+']]) +
      '</div>';
  }
  /* Emotki przy pokojach i czatach (po id), domyślnie filiżanka. */
  /* maskotki: własne, proste postaci w pastelach (kubek, pierożek, mochi, chmurka) */
  var MASCOTS = {
    kubek: '<path d="M86 52h8a13 13 0 0 1 0 26h-9" fill="none" stroke="#4B3139" stroke-width="3.4" stroke-linecap="round"/><path d="M24 44h66v30a30 30 0 0 1-30 30h-6a30 30 0 0 1-30-30z" fill="#F3E7CF" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><path d="M48 32c-5 6 5 9 0 15M66 30c-5 6 5 9 0 15" fill="none" stroke="#C9A978" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="70" r="3.6" fill="#4B3139"/><circle cx="74" cy="70" r="3.6" fill="#4B3139"/><ellipse cx="38" cy="80" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><ellipse cx="82" cy="80" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><path d="M54 82q6 6.5 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/>',
    mandu: '<path d="M14 76c0-30 20-46 46-46s46 16 46 46c0 14-12 22-46 22S14 90 14 76z" fill="#FFF4E0" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><path d="M38 34q6-8 12 0q6-8 12 0q6-8 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2 2)"/><circle cx="46" cy="70" r="3.6" fill="#4B3139"/><circle cx="74" cy="70" r="3.6" fill="#4B3139"/><ellipse cx="38" cy="80" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><ellipse cx="82" cy="80" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><path d="M54 82q6 6.5 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/>',
    mochi: '<path d="M60 22c28 0 46 18 46 42 0 22-16 36-46 36S14 86 14 64c0-24 18-42 46-42z" fill="#FBD9DF" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><path d="M60 22c-6-8-2-14 6-14" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/><path d="M66 8c10-2 14 6 8 12-5 4-10 0-8-12z" fill="#CFEBDD" stroke="#4B3139" stroke-width="3" stroke-linejoin="round"/><circle cx="46" cy="62" r="3.6" fill="#4B3139"/><circle cx="74" cy="62" r="3.6" fill="#4B3139"/><ellipse cx="38" cy="72" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><ellipse cx="82" cy="72" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><path d="M54 74q6 6.5 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/>',
    chmurka: '<path d="M34 92a22 22 0 0 1-2-44 28 28 0 0 1 54-6 24 24 0 0 1 4 50z" fill="#E7E0FA" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><path d="M44 96l-8 14 22-14" fill="#E7E0FA" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><circle cx="46" cy="66" r="3.6" fill="#4B3139"/><circle cx="74" cy="66" r="3.6" fill="#4B3139"/><ellipse cx="38" cy="76" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><ellipse cx="82" cy="76" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><path d="M54 78q6 6.5 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/>'
  };
  function mascot(name, cls) { if (name === 'kotek') return window.MascotGuide.avatar(cls); return '<span class="mascot m-' + name + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' + (MASCOTS[name] || '') + '</svg></span>'; }
  /* spójny zestaw ikon: kontur w kolorze marki + pastelowe wypełnienia (zamiast emoji systemowych) */
  var GLYPH = {"book": "<path d=\"M16 9c-3-3-8-4-11-3v17c3-1 8 0 11 3z\" fill=\"#EBC3CB\"/><path d=\"M16 9c3-3 8-4 11-3v17c-3-1-8 0-11 3z\" fill=\"#F7EEDD\"/><path d=\"M16 9v17\" fill=\"none\"/>", "news": "<rect x=\"5\" y=\"6\" width=\"22\" height=\"20\" rx=\"3\" fill=\"#DCD3EA\"/><path d=\"M10 12h12M10 17h12M10 21h7\" fill=\"none\"/>", "sprout": "<path d=\"M16 27V15\" fill=\"none\"/><path d=\"M16 17C10 17 7 13 7 8c6 0 9 3 9 9z\" fill=\"#CFE3D6\"/><path d=\"M16 14c0-5 3-8 9-8 0 5-3 8-9 8z\" fill=\"#B9D6C3\"/>", "flower": "<g fill=\"#EBC3CB\"><circle cx=\"16\" cy=\"8.5\" r=\"5\"/><circle cx=\"23.5\" cy=\"14\" r=\"5\"/><circle cx=\"20.6\" cy=\"22.6\" r=\"5\"/><circle cx=\"11.4\" cy=\"22.6\" r=\"5\"/><circle cx=\"8.5\" cy=\"14\" r=\"5\"/></g><circle cx=\"16\" cy=\"16\" r=\"4.2\" fill=\"#E8D0A0\"/>", "dumpling": "<path d=\"M4 20c0-8 6-12 12-12s12 4 12 12c0 3-3 5-12 5S4 23 4 20z\" fill=\"#F7EEDD\"/><path d=\"M10 12l1 4M16 10v5M22 12l-1 4\" fill=\"none\"/>", "clapper": "<rect x=\"5\" y=\"12\" width=\"22\" height=\"15\" rx=\"3\" fill=\"#DCD3EA\"/><path d=\"M5 12l2-6 20 3-1 3z\" fill=\"#F7EEDD\"/><path d=\"M10 7.5l-2 4.5M16 8.5l-2 4.5M22 9.5l-2 4\" fill=\"none\"/>", "suitcase": "<rect x=\"5\" y=\"10\" width=\"22\" height=\"16\" rx=\"4\" fill=\"#CBDDE8\"/><path d=\"M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M5 17h22\" fill=\"none\"/>", "house": "<path d=\"M5 15L16 5l11 10\" fill=\"none\"/><path d=\"M8 13v13h16V13L16 6z\" fill=\"#EFD2B8\"/><rect x=\"13\" y=\"18\" width=\"6\" height=\"8\" rx=\"2\" fill=\"#F7EEDD\"/>", "note": "<path d=\"M12 22V7l13-3v15\" fill=\"none\"/><circle cx=\"9\" cy=\"22\" r=\"4\" fill=\"#EBC3CB\"/><circle cx=\"22\" cy=\"19\" r=\"4\" fill=\"#EBC3CB\"/>", "chat": "<path d=\"M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H15l-6 5v-5a3 3 0 0 1-3-3z\" fill=\"#E8D0A0\"/><path d=\"M11 12h10M11 16h6\" fill=\"none\"/>", "heart": "<path d=\"M16 27C6 20 4 14 4 10.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 2.5C28 14 26 20 16 27z\" fill=\"#EBC3CB\"/>", "pot": "<path d=\"M5 14h22v6a7 7 0 0 1-7 7h-8a7 7 0 0 1-7-7z\" fill=\"#CFE3D6\"/><path d=\"M3 14h26M13 10c0-3 3-2 3-5M19 10c0-3 3-2 3-5\" fill=\"none\"/>", "scroll": "<path d=\"M8 5h15a3 3 0 0 1 3 3v17a3 3 0 0 0 3 3H11a3 3 0 0 1-3-3z\" fill=\"#F7EEDD\"/><path d=\"M8 5a3 3 0 0 0-3 3v2h3M13 12h9M13 17h9\" fill=\"none\"/>", "box": "<path d=\"M5 11l11-6 11 6v12l-11 6-11-6z\" fill=\"#EFD2B8\"/><path d=\"M5 11l11 6 11-6M16 17v12\" fill=\"none\"/>", "bowl": "<path d=\"M4 15h24a12 11 0 0 1-24 0z\" fill=\"#F7EEDD\"/><path d=\"M10 13c0-3 4-3 4-6M17 13c0-3 4-3 4-6\" fill=\"none\"/><path d=\"M9 20c3 2 11 2 14 0\" fill=\"none\"/>", "cup": "<path d=\"M6 12h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z\" fill=\"#E8D0A0\"/><path d=\"M23 14h2.5a3 3 0 0 1 0 6H22M11 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4\" fill=\"none\"/>", "mic": "<rect x=\"11\" y=\"4\" width=\"10\" height=\"16\" rx=\"5\" fill=\"#DCD3EA\"/><path d=\"M7 15a9 9 0 0 0 18 0M16 24v4M12 28h8\" fill=\"none\"/>", "wave": "<circle cx=\"16\" cy=\"16\" r=\"11\" fill=\"#E8D0A0\"/><circle cx=\"12\" cy=\"14\" r=\"1.2\" fill=\"#4B3139\"/><circle cx=\"20\" cy=\"14\" r=\"1.2\" fill=\"#4B3139\"/><path d=\"M11.5 19c3 3 6 3 9 0\" fill=\"none\"/>", "sun": "<circle cx=\"16\" cy=\"16\" r=\"6\" fill=\"#E8D0A0\"/><path d=\"M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2 2M22.5 22.5l2 2M7.5 24.5l2-2M22.5 9.5l2-2\" fill=\"none\"/>"};
  function glyph(n, size) { size = size || 28; return '<svg class="glyph" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" stroke=\"#4B3139\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden="true">' + (GLYPH[n] || GLYPH.cup) + '</svg>'; }
  var EMOJI = { aktualnosci: 'news', 'pl-a1': 'sprout', tips: 'book', 'kr-a1': 'sprout', 'kr-adv': 'flower', 'pl-b1': 'dumpling', drama: 'clapper', 'drama-stolik': 'clapper', 'wakacje-kr': 'suitcase', 'wakacje-eu': 'sun', 'korea-life': 'suitcase', 'poland-life': 'house', dance: 'note', 'temat-dnia': 'chat', fandomy: 'heart', gotowanie: 'pot', historia: 'scroll', 'zycie-praca-pl': 'house', 'zycie-praca-kr': 'suitcase', 'studia-pl': 'book', 'studia-kr': 'scroll', 'przeprowadzka-kr': 'box', 'przeprowadzka-pl': 'box', jedzenie: 'bowl', start: 'cup', 'kpop-taniec': 'mic' };
  var SC_GLYPH = { cafe: 'cup', drama: 'clapper', intro: 'wave', weekend: 'sun', resto: 'bowl' };
  function emo(id) { return glyph(EMOJI[id] || 'cup'); }
  var CLUB_GLYPH = { fandoms: 'heart', 'book-club': 'book', 'kdrama-club': 'clapper', 'kpop-dance': 'mic', 'cooking-club': 'pot', 'polish-for-koreans': 'chat' };
  function clubEmo(x) { return (x.kind === 'club' && CLUB_GLYPH[x.hobbyId]) ? '<span class="badge-sq club-emo" aria-hidden="true">' + glyph(CLUB_GLYPH[x.hobbyId], 22) + '</span>' : ''; }
  function gateHref(id) { var gx = tableOf(id); return (CFG.lite && !(gx && gx.live)) ? '#/wkrotce/' + id : '#/premium'; }
  function isSoonT(x) { return !!CFG.lite && !isBeta() && ((x.kind === 'club' && !x.live && !isPremium()) || !!x.soon); }
  function kindTag(x) { return x.mentor ? t('tb.tag.mentor') : t('tb.tag.' + x.kind); }
  function lockHtml(x) { if (CFG.lite && !(x && x.live)) return '<span class="soon-tag">' + esc(t('soon.tag')) + '</span>'; return '<span class="lock" aria-label="' + esc(t('lobby.premium')) + '">' + ico('lock', 18) + '</span>'; }
  function chatRow(c) {
    var locked = c.premium && !isPremium();
    return '<a class="row" href="' + (locked ? gateHref(c.id) : '#/czat/' + c.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(c.id) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(c.name)) + '</strong><small>' + esc(c.badge) + ' · ' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + ' · ' + esc(L(c.desc)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowAlways(r) {
    var locked = r.premium && !isPremium();
    return '<a class="row" href="' + (locked ? gateHref(r.id) : '#/room/' + r.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(r.id) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(r.name)) + '</strong><small>' + esc(t('live.open247')) + ' · ' + esc(L(r.level)) + ' · ' + esc(tf('live.max', { n: r.seats })) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowScheduled(x, now) {
    var r = x.r, locked = r.premium && !isPremium();
    var when = x.slot.live ? '<span class="live-badge"><i></i>' + esc(t('live.now')) + '</span>' : '<span class="row-time">' + esc(whenText(x.slot.start, now)) + '</span>';
    return '<a class="row" href="' + (locked ? gateHref(r.id) : '#/room/' + r.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(r.id) + '</span><span class="row-text">' + when + '<strong>' + esc(L(r.name)) + '</strong><small>' + esc(O(r.name)) + ' · ' + esc(L(r.level)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  /* przełącznik „Uczę się koreańskiego / polskiego": wspólny dla Pogaduszek i Stolików */
  function whoLearn() { return load('lobbyL', '') || (learnLang() === 'pl' ? 'pl' : 'ko'); }
  function whoSeg(isKo) {
    return '<div class="tabs lobby-seg" role="group" aria-label="' + esc(t('lobby.whoLabel')) + '">' +
      '<button type="button" class="tab" data-action="lobbylang" data-l="ko" aria-pressed="' + isKo + '">' + esc(t('lobby.whoKo')) + '</button>' +
      '<button type="button" class="tab" data-action="lobbylang" data-l="pl" aria-pressed="' + !isKo + '">' + esc(t('lobby.whoPl')) + '</button></div>';
  }
  function viewLobby(tab) {
    if (tab === 'live') { navigate('#/stoliki', true); return; }
    var isKo = whoLearn() === 'ko';
    var seg = whoSeg(isKo);
    var chat = D.channels.filter(function (c) { return c.id === (isKo ? 'kr-a1' : 'pl-a1'); }).map(chatRow).join('');
    var corner = '<div class="corner corner-a1 corner-chats"><div class="cc-head"><span class="row-text"><strong>' + esc(t('corner.title')) + '</strong><small>' + esc(t('corner.body')) + '</small></span>' + mascot('mochi', 'm-corner') + '</div>' +
      '<div class="list">' + chat + D.channels.filter(function (c) { return c.id === 'tips'; }).map(chatRow).join('') +
      '<a class="row" href="#/cwiczenia"><span class="badge-sq" aria-hidden="true">' + mascot('kotek', 'm-sum') + '</span><span class="row-text"><strong>' + esc(t('corner.practiceT')) + '</strong><small>' + esc(t('corner.practiceS')) + '</small></span></a></div></div>';
    var next = isKo
      ? '<div class="corner corner-a1"><span class="row-text"><strong>' + esc(t('lobby.mentorTitle')) + '</strong><small>' + esc(t('lobby.mentorBody')) + '</small><span class="corner-links"><a class="chip-btn" href="#/stolik/sezon-beginner">' + esc(t('lobby.mentorCta')) + '</a></span></span>' + mascot('mochi', 'm-corner') + '</div>'
      : '<a class="corner" href="#/stolik/sezon-polish-for-koreans"><span class="row-text"><strong>' + esc(t('lobby.plTitle')) + '</strong><small>' + esc(t('lobby.plBody')) + '</small></span>' + ico('chevron', 20) + '</a>';
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('lobby.title')) + '</h1><p class="subtitle">' + esc(t('lobby.sub')) + '</p></div>' +
      '<a class="pill-link" href="#/premium">' + ico('crown', 16) + esc(t('lobby.premium')) + '</a></div>' +
      (isBeta() ? '<div class="strip strip-flat">' + esc(t('beta.on')) + '</div>' : '') + seg + corner + next +
      '<a class="corner" href="#/stoliki"><span class="row-text"><strong>' + esc(t('lobby.toTables')) + '</strong><small>' + esc(t('lobby.toTablesBody')) + '</small></span>' + ico('chevron', 20) + '</a>' +
      guideHtml(false) + '<a class="btn btn-ghost lobby-contact" href="https://fundacjahanguk.pl" target="_blank" rel="noopener">' + esc(t('lobby.contact')) + '</a></div>' + nav('chats') + '</main>';
    show(html, t('lobby.title'));
  }

  /* ---------- wiadomości ---------- */
  function msgHtml(m) {
    var author = m.author || (m.mine ? (load('name', '') || t('room.you')) : '');
    var meta = esc(author) + (m.city ? ' · ' + esc(m.city) : '') + (m.time ? ' ' + esc(m.time) : '');
    var ints = interestsHtml(m.interests);
    if (m.fix) {
      return '<div class="bubble bubble-fix"><span class="meta">' + esc(t('chat.fix')) + ' · ' + meta + '</span>' + ints + '<span class="txt">' + esc(m.text) + '</span><span class="tr">' + esc(L(m.fix)) + '</span></div>';
    }
    var tr = '';
    if (!m.mine && m.lang && m.lang !== lang && m.tr) {
      var trt = lang === 'en' ? (m.lang === 'ko' ? T(m.tr.pl || '') : (EN.hasOwnProperty(m.text) ? EN[m.text] : '')) : m.tr[lang];
      if (trt) tr = '<span class="tr">' + esc(trt) + '</span>';
    }
    var quote = m.reply ? '<span class="quote" role="button" tabindex="0" data-action="goto-reply"><b>' + esc(m.reply.a) + '</b>' + (m.reply.fix ? '<s>' + esc(m.reply.t) + '</s>' : esc(m.reply.t)) + '</span>' : '';
    var rbtn = '<button type="button" class="reply-btn" data-action="reply" title="' + esc(t('chat.reply')) + '" aria-label="' + esc(t('chat.reply')) + '">' + ico('reply', 16) + '</button>';
    var fbtn = (!m.mine && !(m.reply && m.reply.fix)) ? '<button type="button" class="fix-btn" data-action="fix" title="' + esc(t('chat.fixBtn')) + '" aria-label="' + esc(t('chat.fixBtn')) + '">' + ico('pen', 16) + '</button>' : '';
    if (m.reply && m.reply.fix) {
      return '<div class="bubble bubble-fix" data-a="' + esc(author) + '" data-t="' + esc(m.text) + '">' + rbtn + '<span class="meta">' + esc(t('chat.fixBy')) + ' · ' + meta + '</span>' + ints + quote + '<span class="txt"' + (m.lang ? ' lang="' + m.lang + '"' : '') + '>' + esc(m.text) + '</span>' + (m.reply.why ? '<span class="tr">' + esc(t('chat.fixWhy')) + ': ' + esc(m.reply.why) + '</span>' : '') + '</div>';
    }
    return '<div class="bubble ' + (m.mine ? 'bubble-out' : 'bubble-in') + '" data-a="' + esc(author) + '" data-t="' + esc(m.text) + '">' + fbtn + rbtn + '<span class="meta">' + meta + '</span>' + ints + quote + '<span class="txt"' + (m.lang ? ' lang="' + m.lang + '"' : '') + '>' + esc(m.text) + '</span>' + tr + '</div>';
  }
  function messagesHtml(key) {
    var list = Chat.history(key);
    if (!list.length) return '<div class="empty-state">' + mascot('chmurka') + '<p class="day-sep">' + esc(t('chat.empty')) + '</p></div>';
    return list.map(msgHtml).join('');
  }
  // Lista wiadomości: lokalna (demo) albo pusta ramka, którą po narysowaniu widoku wypełnia Live.attach.
  function messagesBlock(key) {
    var inner = SB.on ? '<p class="day-sep">' + esc(t('chat.loading')) + '</p>' : messagesHtml(key);
    return '<div class="messages" id="messages" aria-live="polite">' + inner + '</div>';
  }
  // Zamiast pola do pisania, gdy czat jest na koncie, a nikt nie jest zalogowany.
  function gateHtml() {
    return '<div class="content gate"><h2 class="section-title">' + esc(t('chat.loginTitle')) + '</h2>' +
      '<p class="subtitle">' + esc(t('chat.loginBody')) + '</p>' +
      '<button type="button" class="btn btn-primary" data-action="login">' + esc(t('auth.title.login')) + '</button>' +
      '<button type="button" class="btn btn-ghost" data-action="register">' + esc(t('auth.title.register')) + '</button></div>';
  }

  /* Prompt pytania nad polem wiadomości (czat z polem practice): jedno pytanie naraz, po wysłaniu wiadomości pojawia się następne. */
  function promptHtml(c) {
    var n = c.practice.length, i = (ui.qi && ui.qi[c.id]) || 0, x = c.practice[i % n];
    // Język docelowy czatu: pytanie pokazujemy w nim, a tłumaczenie tylko osobom z interfejsem w drugim języku.
    var target = c.lang === 'KR' ? 'ko' : 'pl';
    var main = target === 'pl' ? x.pl : x.k, other = lang === 'en' ? T(x.pl) : (target === 'pl' ? x.k : x.pl);
    var open = !!(ui.hintOpen && ui.hintOpen[c.id]);
    return '<div class="qprompt" id="qprompt" data-ch="' + c.id + '"' + (open ? '' : ' hidden') + '>' + mascot('kotek', 'm-cat') + '<div class="q-bubble"><span class="label-caps">' + esc(t('chat.qLabel')) + ' · ' + ((i % n) + 1) + '/' + n + '</span>' +
      '<span class="q-k" lang="' + target + '">' + esc(main) + '</span>' + (lang !== target ? '<span class="q-pl">' + esc(other) + '</span>' : '') +
      '<span class="q-btns"><button type="button" class="chip-btn chip-main" data-action="starter" data-text="' + esc(main) + '">' + esc(t('chat.ask')) + '</button>' +
      (x.starter ? '<button type="button" class="chip-btn" data-action="starter" data-text="' + esc(x.starter.replace(/___/g, '…')) + '">' + esc(t('chat.answer')) + '</button>' : '') +
      '<button type="button" class="chip-btn" data-action="next-q" data-ch="' + c.id + '">' + esc(t('chat.nextQ')) + '</button></span></div></div>';
  }
  /* przycisk „Hint" w polu wiadomości: pytanie pokazuje się dopiero po kliknięciu, a po wysłaniu wiadomości znów się chowa */
  function hintBtn(c) {
    var open = !!(ui.hintOpen && ui.hintOpen[c.id]);
    return '<button type="button" class="hint-btn" data-action="hint-toggle" data-ch="' + c.id + '" aria-expanded="' + open + '" aria-controls="qprompt">' + ico('bulb', 18) + '<span>' + esc(t('chat.hint')) + '</span></button>';
  }
  /* ten sam mechanizm co w kącikach A1: przycisk w polu wiadomości rozwija prompt, po wysłaniu wiadomości prompt znów się chowa */
  function thintBtn() {
    return '<button type="button" class="hint-btn" data-action="thint" aria-expanded="false" aria-controls="tprompt">' + ico('bulb', 18) + '<span>' + esc(t('chat.hint')) + '</span></button>';
  }
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.getAttribute && f.getAttribute('data-form') === 'msg') {
      var tp = document.getElementById('tprompt'); if (tp) tp.hidden = true;
      var hb = document.querySelector('[data-action="thint"]'); if (hb) hb.setAttribute('aria-expanded', 'false');
    }
  });
  function advancePrompt(chId, keepOpen) {
    var c = findBy(D.channels, chId);
    if (!c || !c.practice) return;
    ui.qi = ui.qi || {};
    ui.qi[chId] = ((ui.qi[chId] || 0) + 1) % c.practice.length;
    ui.hintOpen = ui.hintOpen || {};
    if (!keepOpen) ui.hintOpen[chId] = false;
    var hb = document.querySelector('.hint-btn');
    if (hb) hb.setAttribute('aria-expanded', String(!!ui.hintOpen[chId]));
    var el = document.getElementById('qprompt');
    if (el) { el.outerHTML = promptHtml(c); }
  }
  /* ---------- widok: czat tekstowy ---------- */
  function viewChat(id) {
    var c = findBy(D.channels, id);
    if (!c) return notFound('chat.notFound');
    if (c.premium && !isPremium()) { navigate(gateHref(id), true); return; }
    var key = 'chat:' + id;
    var html = '<main class="screen" id="view" tabindex="-1"><header class="chathead">' +
      '<div class="topbar"><a class="icon-btn" href="#/kawiarnia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(c.name)) + '</h1><span class="subtitle">' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + '</span></div></div></header>' +
      '<div class="chatbody" id="chatbody"><div class="strip"><span>' + esc(L(c.rule)) + '</span><span class="tag">' + esc(t('chat.tr')) + '</span></div>' +
      (SB.on ? '<div class="strip">' + esc(t('chat.live')) + '</div>' : (CFG.demo ? '<div class="strip">' + esc(t('demo.chat')) + '</div>' : '')) +
      ((SB.on && !ui.user) ? gateHtml() + '</div>' : messagesBlock(key) + '</div>' + (c.practice ? promptHtml(c) : '') +
      '<form class="composer" data-form="msg" data-key="' + key + '">' + (c.practice ? hintBtn(c) : '') +
      '<input class="composer-input" name="text" type="text" autocomplete="off" maxlength="500" placeholder="' + esc(t('chat.input')) + '" aria-label="' + esc(t('chat.input')) + '">' +
      '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button></form>') + '</main>';
    show(html, L(c.name), { bottom: true });
    if (SB.on && ui.user) Live.attach(key);
  }

  /* Temat dnia: ten sam dla wszystkich w danym dniu (czas warszawski), zmienia się o północy. */
  function dailyIndex(r, now) {
    var v = ymd(now, r.tz || WARSAW), y = Math.floor(v / 10000), m = Math.floor(v / 100) % 100, d = v % 100;
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000) % r.daily.length;
  }
  /* XP za odpowiedź na pytanie dnia: raz dziennie na stolik, min. 5 słów (żeby nie zbierać punktów „tak/nie") */
  function dailyDone(key) { return (load('dailyDone', {})[key] || '') === dayKey(); }
  function awardDaily(key, text) {
    if (key.indexOf('table:') === 0) return awardTable(text);
    if (key.indexOf('room:') !== 0 || dailyDone(key)) return;
    var r = findBy(D.rooms, key.slice(5));
    if (!r || !r.daily || text.split(/\s+/).length < 5) return;
    var d = load('dailyDone', {}); d[key] = dayKey(); save('dailyDone', d);
    Prog.award(10, 1);
    toast(t('room.xpEarned'));
    var xl = document.querySelector('.xp-line'); if (xl) { xl.classList.add('done'); xl.textContent = t('room.xpDone'); }
  }
  function dailyCard(r, canType) {
    var i = dailyIndex(r, new Date()), x = r.daily[i];
    var starter = x.starter ? x.starter.replace(/___/g, '…') : '';
    // Stolik KR: pytanie po koreańsku; stolik PL i mieszane (MIX): pytanie po polsku, tłumaczenie po koreańsku.
    var qLang = r.lang === 'KR' ? 'ko' : 'pl', trLang = qLang === 'ko' ? 'pl' : 'ko';
    var dn = dailyDone('room:' + r.id);
    return kittyPrompt(t('room.dailyLabel') + ' · ' + tf('room.dailyOf', { n: i + 1, m: r.daily.length }), x.q, qLang,
      lang === 'en' ? T(qLang === 'ko' ? x.tr : x.q) : x.tr, lang === 'en' ? '' : trLang,
      (canType && starter) ? '<button type="button" class="chip-btn chip-main" data-action="starter" data-text="' + esc(starter) + '">' + esc(t('room.useStarter')) + '</button>' : '',
      '<small class="xp-line' + (dn ? ' done' : '') + '">' + esc(t(dn ? 'room.xpDone' : 'room.xpHint')) + '</small>');
  }
  /* ---------- widok: room na żywo ---------- */
  function micHtml() {
    return '<button type="button" class="mic-btn" data-action="mic" aria-pressed="' + ui.mic + '" aria-label="' + esc(ui.mic ? t('room.mic.on') : t('room.mic.off')) + '">' + ico(ui.mic ? 'mic' : 'micoff') + '</button>';
  }
  // Przedsprzedaż: wklej link do płatności (Stripe/Przelewy24/PayU) w PAY.url, a panel pojawi się sam.
  var PAY = { url: '' };
  function viewSoon(id) {
    var r = findBy(D.rooms, id), c = findBy(D.channels, id), tb = tableOf(id), ev = findBy(D.events, id);
    var x = r || c || tb || ev;
    if (!x) return notFound('room.notFound');
    var wl = !!load('waitlist', {})[id];
    var name = L(x.name), back = r ? '#/stoliki' : (c ? '#/kawiarnia' : (tb ? (tb.kind === 'club' ? '#/wydarzenia/kluby' : '#/stoliki') : '#/wydarzenia/premium'));
    var icon = r ? '<span class="badge-sq club-emo" aria-hidden="true">' + emo(id) + '</span>' : (tb ? clubEmo(tb) : '');
    var teaser = '';
    if (r && r.daily && r.daily[0]) teaser = '<strong>' + esc(L(r.daily[0].title)) + '</strong><br>' + esc(r.daily[0].q);
    else if (tb && tb.prompts && tb.prompts.show) teaser = esc(L(tb.prompts.show));
    else if (ev && ev.format) teaser = esc(L(ev.format));
    var html = '<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="' + back + '" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + icon + esc(name) + '</h1><span class="subtitle">' + esc(O(x.name)) + '</span></div></div>' +
      '<div class="content"><section class="panel"><span class="tag tag-ok">' + esc(t('soon.tag')) + '</span>' +
      '<h2>' + esc(t('soon.title')) + '</h2><p class="subtitle">' + esc(t('soon.body')) + '</p>' +
      (teaser ? '<p class="subtitle"><span class="label-caps">' + esc(t('soon.peek')) + '</span><br>' + teaser + '</p>' : '') + '</section>' +
      (wl ? '<section class="panel"><p class="subtitle"><strong>' + esc(t('tb.onList')) + '</strong> ' + esc(t('soon.thanks')) + '</p></section>' :
      '<form class="soon-form panel" data-form="soon" data-id="' + id + '" novalidate>' +
      '<label class="label-caps" for="soon-email">' + esc(t('soon.email')) + '</label>' +
      '<input class="composer-input" id="soon-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="120" placeholder="' + esc(t('soon.emailPh')) + '">' +
      '<span class="label-caps">' + esc(t('soon.priceQ')) + '</span>' +
      ['soon.p1', 'soon.p2', 'soon.p3', 'soon.p4', 'soon.p5'].map(function (k, i) { return '<label class="soon-opt"><input type="radio" name="price" value="' + k + '"' + (i === 4 ? ' checked' : '') + '> <span>' + esc(t(k)) + '</span></label>'; }).join('') +
      '<label class="label-caps" for="soon-level">' + esc(t('soon.levelQ')) + '</label>' +
      '<select class="composer-input" id="soon-level" name="level"><option value="">' + esc(t('soon.choose')) + '</option>' + ['soon.l1', 'soon.l2', 'soon.l3', 'soon.l4'].map(function (k) { return '<option value="' + k + '">' + esc(t(k)) + '</option>'; }).join('') + '</select>' +
      '<span class="label-caps">' + esc(t('soon.practiceQ')) + '</span>' +
      ['soon.a1', 'soon.a2', 'soon.a3', 'soon.a4'].map(function (k) { return '<label class="soon-opt"><input type="checkbox" name="practice" value="' + k + '"> <span>' + esc(t(k)) + '</span></label>'; }).join('') +
      '<label class="soon-opt"><input type="checkbox" name="consent" value="1"> <span>' + esc(t('soon.consent')) + '</span></label>' +
      '<p class="subtitle soon-err" role="alert" hidden>' + esc(t('soon.emailErr')) + '</p>' +
      '<button type="submit" class="btn btn-primary">' + esc(t('tb.waitlist')) + '</button>' +
      '<p class="subtitle">' + esc(t('soon.privacy')) + '</p></form>') +
      (tb ? plClubCard(tb) : '') +
      (PAY.url ? '<section class="panel"><h2>' + esc(t('pay.title')) + '</h2><p class="subtitle">' + esc(t('pay.body')) + '</p>' +
      '<a class="btn btn-primary" href="' + esc(PAY.url) + '" target="_blank" rel="noopener">' + esc(t('pay.btn')) + '</a>' +
      '<p class="subtitle">' + esc(t('pay.note')) + '</p></section>' : '') +
      '<a class="corner" href="#/stoliki"><span class="row-text"><strong>' + esc(t('soon.start')) + '</strong><small>' + esc(t('soon.startBody')) + '</small></span>' + ico('chevron', 20) + '</a>' +
      '</div>' + nav('tables') + '</main>';
    show(html, name);
  }
  function viewRoom(id) {
    var r = findBy(D.rooms, id);
    if (!r) return notFound('room.notFound');
    if (r.premium && !isPremium()) { navigate(gateHref(id), true); return; }
    var now = new Date();
    var status;
    if (r.always) status = '<span class="live-badge"><i></i>' + esc(t('live.open247')) + '</span>';
    else {
      var slot = nextSlot(r, now);
      status = slot && slot.live ? '<span class="live-badge"><i></i>' + esc(t('live.now')) + '</span>' : '<span class="when">' + esc(slot ? whenText(slot.start, now) : '') + '</span>';
    }
    var name = load('name', '') || t('profile.guest');
    var seats = '<div class="seat"><span class="avatar avatar-you">' + esc(name.charAt(0).toUpperCase()) + '</span><span class="seat-name">' + esc(name) + '</span><span class="seat-role">' + esc(t('room.you')) + (pubProfile().city ? ' · ' + esc(pubProfile().city) : '') + '</span></div>' +
      '<div class="seat"><span class="avatar avatar-empty">' + ico('crown', 22) + '</span><span class="seat-empty">' + esc(t('room.moderator')) + '</span></div>';
    for (var i = 2; i < r.seats; i++) {
      seats += '<div class="seat"><span class="avatar avatar-empty">' + ico('plus', 22) + '</span><span class="seat-empty">' + esc(t('room.free')) + '</span></div>';
    }
    var topic = r.daily ? dailyCard(r, !(SB.on && !ui.user)) : r.topicCard ? '<div class="topic-card"><span class="label-caps">' + esc(t('room.topicLabel')) + '</span><strong>' + esc(L(r.topicCard.title)) + ' · ' + esc(O(r.topicCard.title)) + '</strong><p>' + esc(r.topicCard.ko) + '<br>' + esc(r.topicCard.pl) + '</p></div>' : '';
    var key = 'room:' + id;
    var html = '<main class="screen" id="view" tabindex="-1"><header class="chathead">' +
      '<div class="topbar"><a class="icon-btn" href="#/stoliki" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(r.name)) + '</h1><span class="subtitle">' + esc(O(r.name)) + ' · ' + esc(L(r.level)) + '</span></div>' + status + '</div></header>' +
      '<div class="chatbody" id="chatbody"><div class="seats">' + seats + '</div>' + (r.daily ? '' : topic) +
      '<div class="strip">' + esc(t('demo.voice')) + '</div>' +
      ((SB.on && !ui.user) ? gateHtml() + '</div>' : messagesBlock(key) + '</div>' + (r.daily ? '<div class="tdprompt-body" id="tprompt" hidden>' + topic + '</div>' : '') +
      '<form class="composer" data-form="msg" data-key="' + key + '">' + (r.daily ? thintBtn() : '') +
      '<input class="composer-input" name="text" type="text" autocomplete="off" maxlength="500" placeholder="' + esc(t('room.input')) + '" aria-label="' + esc(t('room.input')) + '">' +
      '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button>' +
      '<span id="micWrap">' + micHtml() + '</span></form>') + '</main>';
    show(html, L(r.name));
    if (SB.on && ui.user) Live.attach(key);
  }

  /* ---------- widok: wydarzenia ---------- */
  function viewEvents(filter) {
    var now = new Date();
    var list = ((filter === 'clubs' || filter === 'live') ? [] : D.events.filter(function (e) { return filter === 'all' || e.premium; }))
      .map(function (e) { return { e: e, slot: nextSlot(e, now) }; })
      .filter(function (x) { return x.slot; });
    if (filter === 'live') {
      D.rooms.filter(function (r) { return !r.always; }).forEach(function (r) {
        var sl = nextSlot(r, now); if (sl) list.push({ room: r, slot: sl });
      });
      var rs = load('rsvp', {});
      Object.keys(rs).forEach(function (id) {
        var tb = tableOf(id), o = tb && D.liveOpts[rs[id].i];
        if (o) list.push({ rsvp: tb, slot: liveSlot(o) });
      });
    }
    list.sort(function (a, b) { return a.slot.start - b.slot.start; });
    var cards = list.map(function (x) {
      if (x.room) return roomRowScheduled({ r: x.room, slot: x.slot }, now);
      if (x.rsvp) return '<article class="card"><div class="card-head"><span class="when">' + esc(whenText(x.slot.start, now)) + '</span><span class="tag tag-ok">' + esc(t('ev.mine')) + '</span></div>' +
        '<h2>' + esc(L(x.rsvp.name)) + '</h2><p class="subtitle">' + esc(t('lv.title')) + ' · 25 min</p>' +
        '<button type="button" class="btn btn-primary btn-sm" data-action="rsvp-ics" data-id="' + x.rsvp.id + '">' + esc(t('lv.ics')) + '</button></article>';
      var e = x.e, locked = e.premium && !isPremium();
      return '<article class="card"><div class="card-head"><span class="when">' + esc(whenText(x.slot.start, now)) + '</span>' +
        '<span class="tag' + (e.premium ? ' tag-premium' : '') + '">' + esc(e.premium ? t('ev.premium') : t('ev.free')) + '</span></div>' +
        '<h2>' + esc(L(e.name)) + '</h2><p class="subtitle">' + esc(O(e.name)) + ' · ' + esc(L(e.format)) + '</p>' +
        (locked ? '<a class="btn btn-ghost btn-sm" href="' + gateHref(e.id) + '">' + (CFG.lite ? '' : ico('lock', 16)) + esc(t(CFG.lite ? 'soon.cta' : 'ev.unlock')) + '</a>'
          : '<button type="button" class="btn btn-primary btn-sm" data-action="ics" data-id="' + e.id + '">' + esc(t('ev.addCal')) + '</button>') + '</article>';
    }).join('');
    var nowRoom = list.filter(function (x) { return x.room && x.slot.start <= now; })[0];
    var nowHtml = (filter === 'live' && nowRoom) ? '<a class="corner" href="#/room/' + nowRoom.room.id + '"><span class="row-text"><strong>' + esc(t('ev.nowTag')) + ': ' + esc(L(nowRoom.room.name)) + '</strong></span>' + ico('chevron', 20) + '</a>' : '';
    var ritual = filter === 'live' ? '<section class="pcard"><span class="label-caps">' + esc(t('ev.ritual')) + '</span><ul class="ritual">' + ['10:00', '11:00', '12:30'].map(function (tm) {
      var sl = nextSlot({ time: tm, dow: [6], dur: D.liveDur }, now); return '<li>' + esc(whenText(sl.start, now)) + '</li>'; }).join('') + '</ul><p class="ptr">' + esc(t('hall.why')) + '</p></section>' : '';
    var liveTables = filter === 'live' ? '<h2 class="section-title">' + esc(t('ev.liveTables')) + '</h2><p class="subtitle">' + esc(t('ev.liveTablesSub')) + '</p><div class="list">' + D.tables.filter(function (x) { return x.kind === 'season' && /^level-/.test(x.hobbyId); }).map(tableCard).join('') + '</div>' : '';
    var clubsHtml = filter === 'clubs' ? '<p class="subtitle">' + esc(t('ev.clubsSub')) + '</p>' + tableSection('tb.sec.clubs', D.tables.filter(function (x) { return x.kind === 'club'; })) : '';
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><h1 class="title">' + esc(t('ev.title')) + '</h1>' + mascot('mandu', 'm-head') + '</div>' +
      '<div class="tabs"><a class="tab" href="#/wydarzenia"' + (filter === 'live' ? ' aria-current="page"' : '') + '>' + esc(t('ev.live')) + '</a>' +
      '<a class="tab" href="#/wydarzenia/kluby"' + (filter === 'clubs' ? ' aria-current="page"' : '') + '>' + esc(t('ev.clubs')) + '</a>' +
      '<a class="tab" href="#/wydarzenia/premium"' + (filter === 'premium' ? ' aria-current="page"' : '') + '>' + esc(t('ev.premium')) + '</a></div>' +
      nowHtml + ritual + clubsHtml + (filter === 'clubs' ? '' : (cards || (filter === 'live' ? '' : '<p class="empty">' + mascot('mochi') + esc(t('ev.empty')) + '</p>'))) + liveTables + '</div>' + nav('events') + '</main>';
    show(html, t('ev.title'));
  }
  function downloadIcs(id) {
    var e = findBy(D.events, id);
    if (!e) return;
    var slot = nextSlot(e, new Date());
    if (!slot) return;
    function f(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function esc2(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
    var text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Korean Cafe Online//PL', 'BEGIN:VEVENT',
      'UID:' + e.id + '-' + f(slot.start) + '@koreancafeonline', 'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(slot.start), 'DTEND:' + f(slot.end),
      'SUMMARY:' + esc2(e.name.pl + ' / ' + e.name.ko), 'DESCRIPTION:' + esc2(t('ev.calDesc')),
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = e.id + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- widok: subskrypcja ---------- */
  function money(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '').replace('.', lang === 'pl' ? ',' : '.'); }
  function viewPremium() {
    var P = CFG.prices, yearly = ui.plan === 'yearly';
    var cur = P.monthly.currency;
    var save = P.monthly.amount * 12 - P.yearly.amount;
    var price = yearly ? P.yearly : P.monthly;
    var priceStr = money(price.amount) + ' ' + price.currency;
    var note = yearly ? tf('pay.noteYearly', { n: money(P.yearly.amount / 12), cur: cur }) : t('pay.noteMonthly');
    var foot = tf(yearly ? 'pay.footYearly' : 'pay.footMonthly', { n: CFG.trialDays, price: priceStr });
    var banner = ui.banner === 'success' ? '<div class="banner">' + esc(t('pay.success')) + '</div>' :
      ui.banner === 'cancel' ? '<div class="banner banner-warn">' + esc(t('pay.cancel')) + '</div>' : '';
    var benefits = ['pay.b1', 'pay.b2', 'pay.b3', 'pay.b4'].map(function (k) { return '<li>' + ico('check', 22) + '<span>' + esc(t(k)) + '</span></li>'; }).join('');
    var html = '<main class="screen paywall" id="view" tabindex="-1">' +
      '<div class="paywall-top"><a class="icon-btn" href="#/kawiarnia" aria-label="' + esc(t('common.close')) + '">' + ico('close') + '</a></div>' +
      '<div class="paywall-head">' + mascot('kubek', 'm-hero') + '<span class="eyebrow">' + esc(t('pay.eyebrow')) + '</span><h1>' + esc(t('pay.h1')) + '</h1><p>' + esc(t('pay.lead')) + '</p></div>' +
      (banner ? '<div style="margin-top:16px">' + banner + '</div>' : '') +
      '<div class="tabs" style="margin-top:22px">' +
      '<button type="button" class="tab" data-action="plan" data-plan="monthly" aria-pressed="' + !yearly + '">' + esc(t('pay.monthly')) + '</button>' +
      '<button type="button" class="tab" data-action="plan" data-plan="yearly" aria-pressed="' + yearly + '">' + esc(t('pay.yearly')) + ' · ' + esc(tf('pay.save', { n: money(save), cur: cur })) + '</button></div>' +
      '<div class="price-card"><div class="price-row"><span class="price">' + esc(priceStr) + '</span><span class="subtitle">' + esc(yearly ? t('pay.perYear') : t('pay.perMonth')) + '</span></div><span class="price-note">' + esc(note) + '</span></div>' +
      '<ul class="benefits">' + benefits + '</ul>' +
      '<div class="paywall-actions"><div class="logo-row"><img class="logo-mini" src="img/logo-160.png" alt="" width="64" height="64"></div><button type="button" class="btn btn-primary" data-action="checkout">' + esc(tf('pay.cta', { n: CFG.trialDays })) + '</button>' +
      '<p class="fine">' + esc(foot) + '</p>' +
      '<div class="links"><a href="regulamin.html">' + esc(t('legal.terms')) + '</a><a href="prywatnosc.html">' + esc(t('legal.privacyNom')) + '</a></div></div></main>';
    show(html, t('pay.h1'));
  }
  function checkout(btn) {
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('pay.loading');
    fetch(CFG.checkoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: ui.plan, lang: lang })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || !j.url) throw new Error(j.error || 'error');
        return j;
      });
    }).then(function (j) {
      window.location.href = j.url;
    }).catch(function () {
      toast(t('pay.error'));
      btn.disabled = false;
      btn.textContent = label;
    });
  }

  /* ---------- widok: logowanie, rejestracja, reset hasła, nowe hasło ---------- */
  function authField(id, name, labelKey, type, autocomplete, extra) {
    return '<div class="setting setting-col"><label for="' + id + '">' + esc(t(labelKey)) + '</label>' +
      '<input class="field" id="' + id + '" name="' + name + '" type="' + type + '" autocomplete="' + autocomplete + '"' + (extra || '') + '></div>';
  }
  function viewAuth(mode) {
    if (!SB.on) { navigate('#/profil', true); return; }
    if (mode !== 'newpass' && ui.user) { navigate(homeHash(), true); return; }
    if (mode === 'newpass' && !ui.user) { navigate('#/logowanie', true); return; }
    var fields = '';
    if (mode === 'register') fields += authField('a-name', 'name', 'profile.name', 'text', 'nickname', ' maxlength="30" placeholder="' + esc(t('profile.namePh')) + '"');
    if (mode !== 'newpass') fields += authField('a-email', 'email', 'auth.email', 'email', 'email', ' inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254"');
    if (mode !== 'reset') {
      fields += authField('a-pass', 'password', mode === 'newpass' ? 'auth.passwordNew' : 'auth.password', 'password',
        mode === 'login' ? 'current-password' : 'new-password',
        mode === 'login' ? ' maxlength="72"' : ' maxlength="72" placeholder="' + esc(t('auth.passwordHint')) + '"');
    }
    var links = '';
    if (mode === 'login') {
      links = '<a href="#/logowanie/reset">' + esc(t('auth.forgot')) + '</a><a href="#/logowanie/rejestracja">' + esc(t('auth.toRegister')) + '</a>';
    } else if (mode === 'register') {
      links = '<a href="#/logowanie">' + esc(t('auth.toLogin')) + '</a>';
    } else if (mode === 'reset') {
      links = '<a href="#/logowanie">' + esc(t('auth.backToLogin')) + '</a>';
    }
    var back = mode === 'newpass' ? '#/kawiarnia' : (mode === 'login' ? '' : '#/logowanie');
    var html = '<main class="screen" id="view" tabindex="-1">' +
      (back ? '<div class="topbar"><a class="icon-btn" href="' + back + '" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(t('auth.title.' + mode)) + '</h1></div></div>' : '') +
      '<div class="content">' + (back ? '' : '<div class="head welcome-lang">' + langSeg() + '</div>') + '<div class="logo-row"><img class="logo-mini" src="img/logo-160.png" alt="" width="64" height="64"></div>' + (back ? '' : '<h1 class="title auth-title">' + esc(t('auth.title.' + mode)) + '</h1>') + '<p class="subtitle logo-lead">' + esc(t('auth.lead.' + mode)) + '</p>' +
      '<form class="auth-form" data-form="auth" data-mode="' + mode + '" novalidate>' + fields +
      '<p id="authMsg" role="alert" hidden></p>' +
      '<button class="btn btn-primary" type="submit">' + esc(t('auth.submit.' + mode)) + '</button></form>' +
      (links ? '<div class="links">' + links + '</div>' : '') + '</div></main>';
    show(html, t('auth.title.' + mode));
  }
  function submitAuth(form) {
    var mode = form.getAttribute('data-mode');
    var email = form.elements.email ? form.elements.email.value.trim() : '';
    var pw = form.elements.password ? form.elements.password.value : '';
    var name = form.elements.name ? form.elements.name.value.trim() : '';
    var btn = form.querySelector('button[type="submit"]');
    var msg = document.getElementById('authMsg');
    var label = btn.textContent;
    function say(text, ok) {
      msg.textContent = text;
      msg.className = 'banner' + (ok ? '' : ' banner-warn');
      msg.hidden = false;
    }
    function finish(user) {
      var meta = user && user.user_metadata;
      if (!load('name', '') && meta && meta.name) save('name', String(meta.name).slice(0, 30));
      var to = ui.returnTo;
      ui.returnTo = null;
      Prog.pull().then(null, function () {}).then(function () { navigate(to || homeHash()); });
    }
    if (mode !== 'newpass' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say(t('auth.err.email'));
    if (mode === 'register' && (name.length < 2 || name.length > 30)) return say(t('auth.err.name'));
    if ((mode === 'register' || mode === 'newpass') && pw.length < 8) return say(t('auth.err.weak'));
    if (mode === 'login' && !pw) return say(t('auth.err.invalid'));
    btn.disabled = true;
    btn.textContent = t('auth.working');
    msg.hidden = true;
    var job;
    if (mode === 'login') {
      job = Auth.login(email, pw).then(function (r) {
        if (r.error) throw r.error;
        finish(r.data.user);
      });
    } else if (mode === 'register') {
      job = Auth.register(email, pw, name).then(function (r) {
        if (r.error) throw r.error;
        save('name', name);
        if (r.data.session) finish(r.data.user);
        else say(t('auth.checkEmail'), true);
      });
    } else if (mode === 'reset') {
      job = Auth.reset(email).then(function (r) {
        if (r.error && authErr(r.error) === t('auth.err.rate')) throw r.error;
        say(t('auth.resetSent'), true);
      });
    } else {
      job = Auth.setPassword(pw).then(function (r) {
        if (r.error) throw r.error;
        ui.recovery = false;
        toast(t('auth.passSaved'));
        navigate('#/kawiarnia');
      });
    }
    job.catch(function (err) {
      say(authErr(err));
    }).then(function () {
      btn.disabled = false;
      btn.textContent = label;
    });
  }

  /* ---------- widok: profil ---------- */
  function accountHtml() {
    if (!SB.on) return '';
    if (!ui.user) return '<button type="button" class="btn btn-primary btn-sm" data-action="login">' + esc(t('profile.login')) + '</button>';
    return '<div class="setting setting-col"><span class="label-caps">' + esc(t('profile.account')) + '</span>' +
      '<span>' + esc(tf('profile.loggedAs', { email: ui.user.email })) + '</span>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="logout">' + esc(t('profile.logout')) + '</button></div>';
  }
  /* Profil → Informacje: rozwijane objaśnienia konceptu kawiarni, subskrypcji, czatów i wydarzeń */
  function infoHtml() {
    var I = [
      { t: { pl: 'Koncepcja: kafejka internetowa', ko: '콘셉트: 인터넷 카페', en: 'The idea: an internet café' },
        b: [{ pl: 'Nasza kawiarnia jest inspirowana dawnymi kafejkami internetowymi: wchodzisz, siadasz przy stoliku i rozmawiasz z ludźmi tak długo, jak masz ochotę.', ko: '우리 카페는 예전 인터넷 카페에서 영감을 받았어요. 들어와서 테이블에 앉아 원하는 만큼 사람들과 이야기해요.', en: 'Our café is inspired by old internet cafés: you walk in, sit at a table and chat with people for as long as you like.' },
            { pl: 'Zamiast komputerów są czaty i stoliki, a zamiast przypadkowych rozmów: ludzie na Twoim poziomie, którzy uczą się języka tak jak Ty.', ko: '컴퓨터 대신 채팅과 테이블이 있고, 낯선 사람 대신 나와 같은 수준으로 언어를 배우는 사람들이 있어요.', en: 'Instead of computers there are chats and tables, and instead of random strangers, people at your level who are learning a language like you.' }] },
      { t: { pl: 'Korzyści z subskrypcji', ko: '구독 혜택', en: 'Subscription benefits' },
        b: [{ pl: 'Premium (29 zł/mies.) otwiera:', ko: '프리미엄(월 29 zł)으로 이용할 수 있어요:', en: 'Premium (29 PLN/mo) unlocks:' },
            { pl: '• wszystkie kluby (K-dramy, K-pop taniec, Rozmowy po polsku i kolejne)\n• wydarzenia tematyczne na żywo\n• tłumaczenia PL/KR w czacie\n• materiały do nauki i słówka tygodnia', ko: '• 모든 클럽(K-드라마, 케이팝 댄스, 폴란드어 대화 등)\n• 주제별 라이브 이벤트\n• 채팅 PL/KR 번역\n• 학습 자료와 이번 주 단어', en: '• all clubs (K-drama, K-pop dance, Polish conversation and more)\n• live themed events\n• PL/KR translations in chat\n• study materials and words of the week' },
            { pl: 'Każdy stolik możesz wypróbować przez 7 dni za darmo. Subskrypcję anulujesz w dowolnym momencie.', ko: '모든 테이블은 7일 무료로 체험할 수 있어요. 구독은 언제든 해지할 수 있어요.', en: 'You can try every table free for 7 days. Cancel your subscription any time.' }] },
      { t: { pl: 'Jak działa kawiarnia', ko: '카페는 이렇게 운영돼요', en: 'How the café works' },
        b: ['gd.t1', 'gd.t2', 'gd.t3', 'gd.t4'].map(function (k) { return { pl: S[k][0] + ': ' + S[k + 'b'][0], ko: S[k][1] + ': ' + S[k + 'b'][1], en: T(S[k][0]) + ': ' + T(S[k + 'b'][0]) }; }) },
      { t: { pl: 'Opcje czatów', ko: '채팅 종류', en: 'Chat options' },
        b: [{ pl: '• Pogaduszki: otwarte czaty bez presji. Kącik A1 (Koreański i Polski dla początkujących) i Study tips.\n• Stoliki: stała grupa 4–6 osób, sezon trwa 4 tygodnie, pierwsze 7 dni za darmo.\n• Stoliki dnia 24/7: Temat dnia jest za darmo, reszta wymaga Premium.\n• Kluby: wspólne zainteresowanie bez stałej grupy (Premium).', ko: '• 수다방: 부담 없는 오픈 채팅. A1 코너(초급 한국어·폴란드어)와 공부 꿀팁.\n• 테이블: 4~6명 고정 그룹, 시즌은 4주, 첫 7일 무료.\n• 24시간 오늘의 테이블: 오늘의 주제는 무료, 나머지는 프리미엄.\n• 클럽: 고정 그룹 없이 공통 관심사로 모여요(프리미엄).', en: '• Chats: open, pressure-free chats. A1 corner (Korean and Polish for beginners) and Study tips.\n• Tables: a fixed group of 4–6, a 4-week season, first 7 days free.\n• Daily tables 24/7: Topic of the day is free, the rest needs Premium.\n• Clubs: a shared interest without a fixed group (Premium).' }] },
      { t: { pl: 'Wydarzenia z klubów', ko: '클럽 이벤트', en: 'Club events' },
        b: [{ pl: 'Kluby spotykają się cyklicznie wokół jednego tematu, np. K-dramy, K-pop taniec czy rozmowy po polsku. Terminy znajdziesz w zakładce Wydarzenia i dodasz je do kalendarza.', ko: '클럽은 K-드라마, 케이팝 댄스, 폴란드어 대화처럼 한 가지 주제로 정기적으로 모여요. 일정은 이벤트 탭에서 확인하고 캘린더에 추가할 수 있어요.', en: 'Clubs meet regularly around one topic, such as K-drama, K-pop dance or Polish conversation. Find the dates in the Events tab and add them to your calendar.' }] },
      { t: { pl: 'Wydarzenia biletowane', ko: '티켓 이벤트', en: 'Ticketed events' },
        b: [{ pl: 'Jednorazowe wydarzenia na żywo z osobnym biletem, np. trening inspirowany workoutem Jungkooka, warsztat K-pop dance czy wspólne gotowanie tteokbokki.', ko: '별도 티켓으로 참여하는 일회성 라이브 이벤트예요. 예: 정국 운동 루틴에서 영감받은 트레이닝, 케이팝 댄스 워크숍, 떡볶이 함께 요리하기.', en: 'One-off live events with a separate ticket, for example a workout inspired by Jungkook, a K-pop dance workshop or cooking tteokbokki together.' }] },
      { t: { pl: 'Lekcje polskiego', ko: '폴란드어 수업', en: 'Polish lessons' },
        b: [{ pl: 'Lekcje na żywo z nauczycielem dla Koreańczyków uczących się polskiego: 60 minut, trzy poziomy (początkujący, średnio zaawansowani, zaawansowani). Znajdziesz je w Stolikach w widoku „Uczę się polskiego" i w Wydarzeniach.', ko: '폴란드어를 배우는 한국인을 위한 라이브 수업이에요. 60분, 세 가지 레벨(초급, 중급, 고급). 테이블 탭의 "폴란드어를 배워요"와 이벤트 탭에서 볼 수 있어요.', en: 'Live lessons with a teacher for Koreans learning Polish: 60 minutes, three levels (beginner, intermediate, advanced). Find them in Tables under "Learning Polish" and in Events.' }] }
    ];
    function LI(o) { return o[lang] || o.pl; }
    return '<details class="panel info-about"><summary><span class="ia-text"><strong>' + esc(t('profile.about')) + '</strong><small>' + esc(t('profile.aboutSub')) + '</small></span></summary>' +
      I.map(function (x) {
        return '<section class="ia-sec"><h3>' + esc(LI(x.t)) + '</h3>' +
          x.b.map(function (b) { return '<p>' + esc(LI(b)).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</section>';
      }).join('') + '</details>';
  }
  /* Profil: tydzień jako kropki w nagłówku (zamiast osobnego kafla) */
  function headWeekHtml() {
    var a = load('active', {}), s = weekStart(), n = weeklyCount(), fz = freezeState(), froze = frozenThisWeek(), dots = '';
    var names = lang === 'ko' ? ['월', '화', '수', '목', '금', '토', '일'] : lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    for (var i = 0; i < 7; i++) {
      var d = new Date(s); d.setDate(s.getDate() + i);
      dots += '<div class="' + (a[dayKey(d)] ? 'on' : '') + (dayKey(d) === dayKey() ? ' today' : '') + '"><i></i><span>' + names[i] + '</span></div>';
    }
    var ok = n >= 3 || froze;
    return '<div class="ph-week"><div class="ph-week-head"><b>' + esc(t('wr.title')) + '</b><span class="tag' + (ok ? ' tag-ok' : '') + '">' + esc(froze ? t('wr.frozen') : tf('wr.count', { n: Math.min(n, 3) })) + '</span></div>' +
      '<div class="wdots">' + dots + '</div><div class="ph-week-foot"><span>' + esc(t(ok ? 'wr.ok' : 'wr.rule')) + '</span>' +
      '<button type="button" class="chip-btn" data-action="freeze"' + (froze || fz.n < 1 ? ' disabled' : '') + '>' + esc(t('wr.freeze')) + ' · ' + esc(fz.n > 0 ? tf('wr.freezeLeft', { n: fz.n }) : t('wr.none')) + '</button></div></div>';
  }
  function journeyOpen() { return !(ladaDone() && joinedTables().length > 0 && myMsgCount() >= 5 && Object.keys(load('rsvp', {})).length > 0 && joinedTables().some(function (x) { return x.kind === 'season'; })); }
  /* Profil → Twoja Lada: odpowiedzi z Lady (zapisane na koncie), z przyciskiem do zmiany */
  function ladaCardHtml() {
    var l = load('lada', null);
    if (!l || !l.done) return '<section class="panel lada-card"><div class="panel-head"><h2>' + esc(t('lada.card')) + '</h2></div>' +
      '<p class="subtitle">' + esc(t('lada.cardEmpty')) + '</p><a class="btn btn-primary btn-sm" href="#/lada">' + esc(t('lada.cardStart')) + '</a></section>';
    var hob = (l.hobbies || []).map(function (id) { var h = null; HOBBIES.forEach(function (x) { if (x[0] === id) h = x; }); return h ? (lang === 'ko' ? h[2] : T(h[1])) : ''; }).filter(Boolean);
    var slotK = { am: 'lada.slot.am', pm: 'lada.slot.pm', eve: 'lada.slot.eve' };
    var sl = (l.slots || []).map(function (x) { return slotK[x] ? t(slotK[x]) : ''; }).filter(Boolean);
    var none = t('lada.none');
    var rows = [
      [t('lada.q1'), l.dir ? t('lada.dir.' + l.dir) : none],
      [t('lada.q2'), l.level || none],
      [t('lada.q3'), hob.length ? hob.join(', ') : none],
      [t('lada.q4'), sl.length ? sl.join(', ') : none]
    ];
    return '<section class="panel lada-card"><div class="panel-head"><h2>' + esc(t('lada.card')) + '</h2>' +
      '<a class="chip-btn" href="#/lada/edycja">' + esc(t('lada.change')) + '</a></div><dl class="lada-sum">' +
      rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="fine left">' + esc(t(SB.on && ui.user ? 'lada.cardSynced' : 'lada.cardLocal')) + '</p></section>';
  }
  function viewProfile() {
    var name = load('name', '');
    var level = load('level', '');
    var levels = [['', t('profile.levelNone')], ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']];
    var st0 = Prog.stats(), beta = isBeta();
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<section class="ph" aria-label="' + esc(t('profile.title')) + '"><div class="ph-top"><span class="avatar avatar-you">' + glyph('cup', 34) + '</span>' +
      '<div class="ph-text"><span class="ph-plan">' + esc(t('profile.plan')) + '</span><h1 class="title">' + esc(name || t('profile.guest')) + '</h1></div>' + '</div>' +
      '<div class="ph-xp"><div class="ph-xp-row"><b>' + esc(t('stats.level')) + ' ' + Prog.level() + (level ? ' · ' + esc(level) : '') + '</b><span>' + (Prog.stats().xp % 100) + ' / 100 XP</span></div>' +
      '<div class="ph-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (Prog.stats().xp % 100) + '"><i style="width:' + (Prog.stats().xp % 100) + '%"></i></div></div>' +
      '<div class="ph-stats" role="group" aria-label="' + esc(t('stats.label')) + '">' + [[Prog.stats().xp, t('stats.xp')], [Prog.stats().streak, t('stats.streak')], [Prog.stats().beans, t('stats.beans')]].map(function (x) {
        return '<div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>'; }).join('') + '</div></section>' +
      ladaCardHtml() + journeyHtml() + infoHtml() + weeklyHtml() + '<a class="plan-card plan-gold" href="#/premium"><span class="plan-icon">' + ico('crown', 22) + '</span>' +
      '<span class="row-text"><strong>Premium</strong><small>' + esc(t('profile.planCta')) + '</small></span>' + ico('chevron', 20) + '</a>' +
      accountHtml() +
      '<div class="pset"><p class="label-caps">' + esc(t('profile.settings')) + '</p><div class="pset-card">' +
      '<label class="pset-row" for="name"><span>' + esc(t('profile.name')) + '</span>' +
      '<input class="pset-input" id="name" data-pref="name" type="text" maxlength="30" autocomplete="nickname" placeholder="' + esc(t('profile.namePh')) + '" value="' + esc(name) + '"></label>' +
      '<label class="pset-row" for="city"><span>' + esc(t('profile.city')) + '</span>' +
      '<input class="pset-input" id="city" data-pref="city" type="text" maxlength="40" autocomplete="address-level2" placeholder="' + esc(t('profile.cityPh')) + '" value="' + esc(load('city', '')) + '"></label>' +
      '<label class="pset-row" for="interests"><span>' + esc(t('profile.interests')) + '</span>' +
      '<input class="pset-input" id="interests" data-pref="interests" type="text" maxlength="80" placeholder="' + esc(t('profile.interestsPh')) + '" value="' + esc(load('interests', '')) + '"></label>' +
      '<div class="pset-row"><span>' + esc(t('profile.lang')) + '</span>' + langSeg() + '</div>' +
      '<label class="pset-row" for="level"><span>' + esc(t('profile.level')) + '</span>' +
      '<select class="pset-input" id="level" data-pref="level">' + levels.map(function (o) { return '<option value="' + o[0] + '"' + (level === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>' +
      ('<button type="button" class="pset-row pset-link" data-action="mg-tips-toggle" aria-pressed="' + (load('mgTips', true) !== false) + '"><span>' + esc(t('mg.set.tips')) + '</span><b>' + (load('mgTips', true) !== false ? 'ON' : 'OFF') + '</b></button>') +
      ('<button type="button" class="pset-row pset-link" data-action="mg-dock-toggle" aria-pressed="' + MG.isPersistent() + '"><span>' + esc(t('mg.set.dock')) + '</span><b>' + (MG.isPersistent() ? 'ON' : 'OFF') + '</b></button>') +
      ('<button type="button" class="pset-row pset-link" data-action="beta-toggle" aria-pressed="' + isBeta() + '"><span>' + esc(t('profile.beta')) + '</span><b>' + (isBeta() ? 'ON' : 'OFF') + '</b></button>' ) +
      '<button type="button" class="pset-row pset-link" data-action="reset-demo"><span>' + esc(t('profile.reset')) + '</span>' + ico('chevron', 18) + '</button>' +
      '<button type="button" class="pset-row pset-link" data-action="portal"><span>' + esc(t('profile.manage')) + '</span>' + ico('chevron', 18) + '</button>' +
      '<a class="pset-row pset-link" href="regulamin.html"><span>' + esc(t('legal.terms')) + '</span>' + ico('chevron', 18) + '</a>' +
      '<a class="pset-row pset-link" href="prywatnosc.html"><span>' + esc(t('legal.privacyNom')) + '</span>' + ico('chevron', 18) + '</a></div>' +
      '<p class="pset-note">' + esc(t('profile.publicNote')) + '</p></div>' +
      '<p class="notice">' + esc(t(SB.on ? 'profile.noteRemote' : 'demo.account')) + '</p>' +
      '<div class="brand-stamp"><img class="logo-mini" src="img/logo-160.png" alt="" width="64" height="64"><span>Korean Café Online<small>K-Culture Studio · Fundacja Hanguk</small></span></div></div>' + nav('profile') + '</main>';
    show(html, t('profile.title'));
  }

  /* ---------- ćwiczenia rozmów: odpowiadasz po koreańsku, scenariusze z data.js ---------- */
  function statsHtml() {
    var st = Prog.stats();
    return '<div class="stats" role="group" aria-label="' + esc(t('stats.label')) + '">' +
      [[st.xp, t('stats.xp')], [st.streak, t('stats.streak')], [st.beans, t('stats.beans')], [Prog.level(), t('stats.level')]].map(function (x) {
        return '<div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
      }).join('') + '</div>';
  }
  function pProg(id) { var p = load('practice', {}); return p[id] || 0; }
  function pSet(id, n) { var p = load('practice', {}); p[id] = n; save('practice', p); Prog.push(); }

  /* ---------- Lekcje kawiarniane (port z Korean Cafe Luxe): historia, słówka, gramatyka, ćwiczenia, scenki; kotek-barista ---------- */
  var KL = window.KC_LEKCJE || null;
  var K_ORDER = KL ? Object.keys(KL.LESSONS) : [];
  var K_GOAL = 30;
  function kStars(id) { return pProg('k:' + id); }
  function kDayXp() { var d = load('kafeDay', { k: '', xp: 0 }); return d.k === dayKey() ? d.xp : 0; }
  function kAddDayXp(n) { save('kafeDay', { k: dayKey(), xp: kDayXp() + n }); }
  function kNext() { for (var i = 0; i < K_ORDER.length; i++) if (!kStars(K_ORDER[i])) return K_ORDER[i]; return K_ORDER[0]; }
  function kShuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function kPrep(s) {
    var c = {}; for (var k in s) c[k] = s[k];
    if (c.opts) c.o = kShuffle(c.opts.map(function (t0, i) { return { t: t0, ok: i === c.a }; }));
    if (c.bank) c.b = kShuffle(c.bank);
    return c;
  }
  function kOpen(id, mode) {
    if (!KL) return null;
    var sid = KL.LESSONS[id] ? id : K_ORDER[0], ls = KL.LESSONS[sid];
    var own = ls.steps.filter(function (x) { return x.t !== 'choice'; });
    var all = own.filter(function (x) { return x.t === 'build'; }).concat(own.filter(function (x) { return x.t === 'scene'; }), KL.EXTRA[sid] || []).map(kPrep);
    var learn = ls.words.map(function (w, i) { return { t: 'learn', w: w, n: i + 1 }; });
    var steps = mode === 'words' || mode === 'listen' ? learn
      : mode === 'practice' ? all
      : [{ t: 'story', s: KL.STORY[sid] }].concat(learn, [{ t: 'grammar' }], all);
    return { id: sid, mode: mode || '', ls: ls, steps: steps, i: 0, xp: 0, beans: 0, combo: 0, mistakes: 0, ans: [], sel: -1, fb: null, tr: false, res: null };
  }
  function kCat(mood) { return mascot('kotek', 'm-kcat' + (mood ? ' ' + mood : '')); }
  function kTrBtn(shown, label) { return '<button type="button" class="chip-btn" data-action="k-tr">' + esc(t(shown ? 'lek.hideTr' : 'lek.showTr')) + '</button>'; }
  function kSay(txt) { return '<button type="button" class="say" data-action="say" data-text="' + esc(String(txt).replace(/[“”]/g, '')) + '" aria-label="' + esc(t('lek.listen')) + '">' + ico('sound', 18) + '</button>'; }

  function kStepBody(K, s) {
    var ls = K.ls;
    if (s.t === 'story') {
      return '<span class="label-caps">' + esc(t('lek.story')) + ' · ' + esc(ls.lvl) + '</span><h2 class="k-h">' + esc(ls.title) + '</h2>' +
        '<p class="k-story">' + s.s.kr + '</p><div class="k-act">' + kSay(s.s.kr) + kTrBtn(K.tr) + '</div>' +
        (K.tr ? '<p class="k-tr">' + s.s.pl + '</p>' : '');
    }
    if (s.t === 'learn') {
      return '<span class="label-caps">' + esc(tf('lek.newWord', { n: s.n, m: ls.words.length })) + '</span>' +
        '<div class="k-wcard"><div class="k-hg" lang="ko">' + s.w.k + '</div><div class="k-rm">' + esc(s.w.r) + '</div><div class="k-pl">' + esc(s.w.p) + '</div>' + kSay(s.w.k) + '</div>';
    }
    if (s.t === 'grammar') {
      var g = ls.grammar;
      return '<span class="label-caps">' + esc(t('lek.grammar')) + '</span><h2 class="k-h">' + g.h + '</h2><p class="k-lead">' + g.lead + '</p>' +
        '<div class="k-formula">' + g.formula.map(function (f) { return '<span class="' + (f.c ? 'k-' + f.c : 'k-op') + '">' + f.t + '</span>'; }).join('') + '</div>' +
        g.ex.map(function (e) { return '<div class="k-ex"><span class="k-k" lang="ko">' + e[0] + '</span><span class="k-m">' + esc(e[1]) + '</span>' + kSay(e[0]) + '</div>'; }).join('') +
        '<div class="k-note"><span class="label-caps">' + esc(t('lek.fromCafe')) + '</span><span>' + esc(ls.note) + '</span></div>';
    }
    if (s.t === 'scene' || s.t === 'choice') {
      var head = s.t === 'scene' ? '<div class="k-scene"><div class="k-who">' + esc(s.who) + '</div><div class="k-line" lang="ko">' + s.line + '</div>' + kSay(s.line) + kTrBtn(K.tr) + (K.tr ? '<div class="k-tr">' + esc(s.tr) + '</div>' : '') + '</div>' : '';
      var opts = s.o.map(function (o, i) {
        var cls = 'k-opt';
        if (K.fb) { if (o.ok) cls += ' right'; else if (i === K.sel) cls += ' wrong'; }
        return '<button type="button" class="' + cls + '" data-action="k-pick" data-i="' + i + '"' + (K.fb ? ' disabled' : '') + '><span class="k-ix">' + 'ABCD'.charAt(i) + '</span><span lang="ko">' + esc(o.t) + '</span></button>';
      }).join('');
      return '<span class="label-caps">' + esc(t(s.t === 'scene' ? 'lek.scene' : 'lek.exercise')) + '</span>' + head + '<h2 class="k-h">' + esc(s.q) + '</h2>' + (s.big ? '<div class="k-big" lang="ko">' + s.big + '</div>' : '') + '<div class="k-opts">' + opts + '</div>';
    }
    if (s.t === 'build') {
      var slots = K.ans.map(function (i) { return '<button type="button" class="k-blk on" data-action="k-unblk" data-i="' + i + '"' + (K.fb ? ' disabled' : '') + ' lang="ko">' + esc(s.b[i]) + '</button>'; }).join('');
      var bank = s.b.map(function (w, i) { return '<button type="button" class="k-blk' + (K.ans.indexOf(i) >= 0 ? ' used' : '') + '" data-action="k-blk" data-i="' + i + '"' + (K.fb ? ' disabled' : '') + ' lang="ko">' + esc(w) + '</button>'; }).join('');
      return '<span class="label-caps">' + esc(t('lek.build')) + '</span><h2 class="k-h">' + esc(s.q) + '</h2><div class="k-slots">' + slots + '</div><div class="k-bank">' + bank + '</div>';
    }
    return '';
  }
  function kFoot(K, s) {
    if (K.fb) {
      var ok = K.fb.ok;
      return '<div class="k-foot ' + (ok ? 'ok' : 'bad') + '">' + kCat(ok ? 'happy' : 'oops') + '<div class="k-say"><strong>' + esc(ok ? tf('lek.good', { n: K.fb.gain }) : t('lek.almost')) + '</strong><p>' + (ok ? '' : esc(tf('lek.correct', { s: '' }))) + K.fb.msg + '</p></div>' +
        '<button type="button" class="btn btn-primary" data-action="k-next">' + esc(t('lek.next')) + '</button></div>';
    }
    if (s.t === 'build') return '<div class="k-foot">' + kCat() + '<span class="k-say"></span><button type="button" class="btn btn-primary" data-action="k-check"' + (K.ans.length ? '' : ' disabled') + '>' + esc(t('lek.check')) + '</button></div>';
    if (s.t === 'choice' || s.t === 'scene') return '<div class="k-foot">' + kCat() + '<span class="k-say">' + esc(t('lek.pick')) + '</span></div>';
    var lbl = s.t === 'story' ? 'lek.lets' : s.t === 'grammar' ? 'lek.toEx' : 'lek.next';
    return '<div class="k-foot">' + kCat() + '<span class="k-say"></span><button type="button" class="btn btn-primary" data-action="k-next">' + esc(t(lbl)) + '</button></div>';
  }
  function viewLesson(id, mode) {
    if (!KL) return notFound('lek.noData');
    var K = ui.k;
    if (!K || K.id !== id || K.mode !== (mode || '') || K.res) K = ui.k = kOpen(id, mode);
    kRender();
  }
  function kRender() {
    setTimeout(mgLesson, 40);
    var K = ui.k, back = '<a class="icon-btn" href="#/cwiczenia/sciezka" aria-label="' + esc(t('lek.close')) + '">' + ico('close') + '</a>';
    if (K.res) {
      var r = K.res, star = function (n) { return '<span class="k-star' + (n <= r.stars ? ' on' : '') + '">★</span>'; };
      show('<main class="screen k-screen" id="view" tabindex="-1"><div class="k-top">' + back + '<span class="k-bar"><i style="width:100%"></i></span></div><div class="k-body k-res">' +
        kCat('happy') + '<span class="label-caps">' + esc(t(K.mode ? 'lek.miniDone' : 'lek.done')) + '</span><div class="k-stars">' + [1, 2, 3].map(star).join('') + '</div>' +
        '<h2 class="k-h">' + esc(t(r.perfect ? 'lek.perfect' : r.stars === 2 ? 'lek.good2' : 'lek.ok')) + '</h2>' +
        '<div class="k-rstats"><div><b>+' + r.xp + '</b><span>XP</span></div><div><b>+' + r.beans + '</b><span>' + esc(t('stats.beans')) + '</span></div><div><b>' + r.acc + '%</b><span>' + esc(t('lek.acc')) + '</span></div></div>' +
        '<div class="k-words">' + K.ls.words.map(function (w) { return '<span lang="ko">' + w.k + '</span>'; }).join('') + '</div>' +
        (K.mode ? '' : '<p class="fine">' + esc(t('lek.newWords')) + '</p>') +
        '<div class="k-res-act"><button type="button" class="btn btn-ghost" data-action="k-again">' + esc(t('lek.again')) + '</button><a class="btn btn-primary" href="#/cwiczenia/sciezka">' + esc(t('lek.toPath')) + '</a></div></div></main>', K.ls.title);
      return;
    }
    var s = K.steps[K.i];
    show('<main class="screen k-screen" id="view" tabindex="-1"><div class="k-top">' + back + '<span class="k-bar"><i style="width:' + Math.round(100 * K.i / K.steps.length) + '%"></i></span><span class="k-combo">' + (K.combo >= 2 ? 'x' + K.combo : '') + '</span></div>' +
      '<div class="k-body">' + kStepBody(K, s) + '</div>' + kFoot(K, s) + '</main>', K.ls.title);
  }
  function kGrade(ok, msg) {
    var K = ui.k, gain = 0;
    if (ok) { K.combo++; gain = 5 + (K.combo >= 3 ? 2 : 0); K.xp += gain; K.beans += 1; } else { K.combo = 0; K.mistakes++; }
    K.fb = { ok: ok, msg: msg, gain: gain };
    kRender();
  }
  function kFinish() {
    var K = ui.k, mini = !!K.mode;
    K.xp += mini ? 3 : 5; K.beans += mini ? 2 : 5;
    var perfect = K.mistakes === 0;
    if (perfect) K.beans += 5;
    var total = K.steps.filter(function (x) { return x.t === 'choice' || x.t === 'scene' || x.t === 'build'; }).length;
    var stars = perfect ? 3 : K.mistakes <= 1 ? 2 : 1;
    Prog.award(K.xp, K.beans);
    kAddDayXp(K.xp);
    if (!mini) pSet('k:' + K.id, Math.max(kStars(K.id), stars));
    K.res = { xp: K.xp, beans: K.beans, perfect: perfect, stars: stars, acc: total ? Math.round(100 * (total - K.mistakes) / total) : 100 };
    kRender();
  }
  function kPath() {
    if (!KL) return notFound('lek.noData');
    ui.k = null;
    var nxt = kNext();
    var lv = KL.LEVELS.map(function (f) {
      var dn = f.units.filter(function (u) { return kStars(u.id); }).length;
      return '<details class="k-lvl"' + (f.units.some(function (u) { return u.id === nxt; }) ? ' open' : '') + '><summary><span class="k-rn">' + f.n + '</span><span class="k-nm"><b>' + esc(f.role) + '</b><small>' + esc(f.sub) + '</small></span><span class="k-cefr">' + f.cefr + ' · ' + dn + '/' + f.units.length + '</span></summary><p class="k-lvl-story">' + esc(f.story) + '</p>' +
        f.units.map(function (u) {
          var st = kStars(u.id);
          return '<a class="k-unit" href="#/cwiczenia/lekcja/' + u.id + '"><span class="k-ut"><b>' + esc(u.t) + '</b><small lang="ko">' + esc(u.g) + '</small></span><span class="k-go">' + (st ? '★'.repeat(st) : ico('chevron', 18)) + '</span></a>';
        }).join('') + '</details>';
    }).join('');
    show('<main class="screen" id="view" tabindex="-1"><div class="content"><div class="topbar topbar-flat"><a class="icon-btn" href="#/cwiczenia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(t('lek.path')) + '</h1><span class="subtitle">' + esc(t('lek.pathSub')) + '</span></div></div>' + lv + '</div>' + nav('practice') + '</main>', t('lek.path'));
  }
  function kFeature() {
    if (!KL) return '';
    var id = kNext(), ls = KL.LESSONS[id], xp = Math.min(kDayXp(), K_GOAL), pct = Math.round(100 * xp / K_GOAL), done = kDayXp() >= K_GOAL;
    function q(mode, key) { return '<a class="k-quick" href="#/cwiczenia/lekcja/' + id + '/' + mode + '"><span>' + esc(t(key)) + '</span></a>'; }
    return '<section class="k-feat">' + mascot('kotek', 'm-kfeat') + '<div class="k-feat-text"><span class="label-caps">' + esc(t('lek.cap')) + '</span>' +
      '<p class="k-hello">' + esc(t('lek.hello')) + '</p><h2 class="k-h">' + esc(ls.title) + '</h2>' +
      '<div class="k-chips"><span>' + esc(t('lek.words5')) + '</span><span lang="ko">' + esc(ls.gram) + '</span><span>' + esc(t('lek.min')) + '</span></div>' +
      '<a class="btn btn-primary" href="#/cwiczenia/lekcja/' + id + '">' + esc(t(kStars(id) ? 'lek.replay' : 'lek.start')) + '</a>' +
      '<div class="k-goal"><span>' + esc(t('lek.goal')) + ' · ' + xp + '/' + K_GOAL + ' XP</span><span class="k-gbar"><i style="width:' + pct + '%"></i></span><small>' + esc(t(done ? 'lek.goalOk' : 'lek.goalLeft')) + '</small></div></div>' +
      '<div class="k-quicks">' + q('words', 'lek.mode.words') + q('listen', 'lek.mode.listen') + q('practice', 'lek.mode.practice') + '</div></section>' +
      '<a class="row" href="#/cwiczenia/sciezka"><span class="badge-sq" aria-hidden="true">🗺️</span><span class="row-text"><strong>' + esc(t('lek.path')) + '</strong><small>' + esc(t('lek.pathRow')) + '</small></span>' + ico('chevron', 20) + '</a>';
  }
  /* ---------- Rozmowy z Kotkiem (wg promptu partnera rozmów v2, docs/prompt-partner-rozmow.md) ---------- */
  var SCN = window.KC_ROZMOWY || [];
  var PT_TARGET = 8;
  var PT_REACT = [['좋아요!', 'Świetnie!'], ['그렇군요!', 'Rozumiem!'], ['아, 그렇군요.', 'Ach, rozumiem.'], ['재미있네요!', 'Ciekawe!'], ['잘했어요!', 'Dobrze Ci poszło!']];
  var PT_PAST = { '만나요': '만났어요', '먹어요': '먹었어요', '봐요': '봤어요', '가요': '갔어요', '마셔요': '마셨어요', '와요': '왔어요', '사요': '샀어요', '읽어요': '읽었어요', '들어요': '들었어요', '쉬어요': '쉬었어요', '놀아요': '놀았어요', '보내요': '보냈어요', '일어나요': '일어났어요', '자요': '잤어요' };
  var PT_TIME = /(어제|그저께|어젯밤|아까|지난\s?[가-힣]+)/;
  function ptFinal(ch) { return (ch.charCodeAt(0) - 0xAC00) % 28 !== 0; }
  /* delikatna korekta: jedna na wiadomość, krótkie wyjaśnienie po polsku */
  function ptFix(text) {
    var tm = text.match(PT_TIME), fixed = null, why = '', changed = false;
    if (tm) {
      var out = text.replace(/[가-힣]+요/g, function (w) {
        if (/[았었했]어요$|였어요$|[았었했]습니다$/.test(w)) return w;
        var r = PT_PAST[w] || (/[가-힣]해요$/.test(w) && w.length > 2 ? w.replace(/해요$/, '했어요') : null);
        if (r && !changed) { changed = true; why = 'Mówisz o przeszłości (' + tm[1] + '), więc używamy czasu przeszłego: ' + w + ' → ' + r + '.'; return r; }
        return w;
      });
      if (changed) fixed = out;
    }
    if (!fixed) {
      var m1 = text.match(/([가-힣])이에요/);
      if (m1 && !ptFinal(m1[1])) { fixed = text.replace(m1[0], m1[1] + '예요'); why = 'Po samogłosce (' + m1[1] + ') używamy 예요, a nie 이에요.'; }
      var m2 = !fixed && text.match(/([가-힣])예요/);
      if (m2 && ptFinal(m2[1])) { fixed = text.replace(m2[0], m2[1] + '이에요'); why = 'Po spółgłosce (' + m2[1] + ') używamy 이에요, a nie 예요.'; }
    }
    return fixed ? { from: text, k: fixed, why: why } : null;
  }
  function ptScn(id) { return findBy(SCN, id); }
  function ptNew(id) {
    var sc = ptScn(id); if (!sc) return null;
    return { id: id, sc: sc, qi: 0, n: 0, fixes: [], lens: [], done: false, log: [{ who: 'ai', k: sc.q[0][0], pl: sc.q[0][1] }] };
  }
  function ptSend(text) {
    var P = ui.pt, sc = P.sc; if (!P || P.done) return;
    P.log.push({ who: 'me', k: text });
    if (text.replace(/\s/g, '').length <= 4) { P.log.push({ who: 'ai', k: '조금 더 이야기해 주세요.', pl: 'Powiedz trochę więcej.' }); return; }
    P.n++; P.lens.push(text.length);
    Prog.award(2, 0);
    var fx = ptFix(text);
    if (fx) { P.fixes.push(fx); P.log.push({ who: 'fix', k: fx.k, why: fx.why }); }
    var r = PT_REACT[(P.n - 1) % PT_REACT.length];
    if (P.n >= PT_TARGET || P.qi + 1 >= sc.q.length) {
      P.done = true; Prog.award(10, 3);
      P.log.push({ who: 'ai', k: r[0] + ' 오늘 이야기 정말 즐거웠어요!', pl: r[1] + ' Dzisiejsza rozmowa była naprawdę miła!' });
      P.log.push({ who: 'sum' });
      return;
    }
    P.qi++;
    var q = sc.q[P.qi];
    P.log.push({ who: 'ai', k: r[0] + ' ' + q[0], pl: r[1] + ' ' + q[1] });
  }
  function ptHint() {
    var P = ui.pt, q = P.sc.q[P.qi];
    P.log.push({ who: 'hint', pl: q[1], ex: q[2], exPl: q[3] });
  }
  function ptAssess(P) {
    var avg = P.lens.length ? P.lens.reduce(function (a, b) { return a + b; }, 0) / P.lens.length : 0;
    var lvl = avg >= 16 && P.fixes.length <= 1 ? 'A2' : avg >= 9 ? 'A1+' : 'A1';
    var txt = lvl === 'A2' ? 'Odpowiadasz pełnymi, dłuższymi zdaniami i prawie bez błędów. To solidne A2.'
      : lvl === 'A1+' ? 'Budujesz poprawne, krótkie zdania. Spróbuj dodać „bo…” (-아/어서) albo drugie zdanie, a będzie A2.'
      : 'Odpowiadasz krótko. To dobry start na poziomie A1; następnym razem dodaj jedno zdanie więcej.';
    return { lvl: lvl, txt: txt, avg: Math.round(avg) };
  }
  function ptSumHtml(P) {
    var a = ptAssess(P), fx = P.fixes.slice(0, 3);
    return '<div class="pt-sum"><span class="label-caps">' + esc(t('pt.sum')) + '</span>' +
      '<h3>' + esc(t('pt.sumExpr')) + '</h3><ul>' + P.sc.expr.map(function (e) { return '<li><b lang="ko">' + esc(e[0]) + '</b> <span>' + esc(e[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<h3>' + esc(t('pt.sumFix')) + '</h3>' + (fx.length ? '<ul>' + fx.map(function (f) { return '<li><s lang="ko">' + esc(f.from) + '</s> → <b lang="ko">' + esc(f.k) + '</b></li>'; }).join('') + '</ul>' : '<p>' + esc(t('pt.sumNoFix')) + '</p>') +
      '<h3>' + esc(t('pt.sumLevel')) + ': <em>' + a.lvl + '</em></h3><p>' + esc(a.txt) + '</p></div>';
  }
  function ptMsgHtml(m) {
    if (m.who === 'me') return '<div class="pt-row me"><div class="pt-me" lang="ko">' + esc(m.k) + '</div><small>' + esc(t('pt.you')) + '</small></div>';
    if (m.who === 'fix') return '<div class="pt-fix"><span class="label-caps">' + esc(t('pt.fix')) + '</span><div class="pt-k" lang="ko">' + esc(m.k) + '</div><p>' + esc(t('pt.why')) + ': ' + esc(m.why) + '</p></div>';
    if (m.who === 'hint') return '<div class="pt-hint"><span class="label-caps">' + esc(t('pt.hintLabel')) + '</span><p>' + esc(m.pl) + '</p><p>' + esc(t('pt.example')) + ': <b lang="ko">' + esc(m.ex) + '</b> <span>(' + esc(m.exPl) + ')</span></p></div>';
    if (m.who === 'sum') return '';
    return '<div class="pt-row ai"><div class="pt-k" lang="ko">' + esc(m.k) + '</div><small>' + esc(m.pl) + '</small>' + '<button type="button" class="say" data-action="say" data-text="' + esc(m.k) + '" aria-label="' + esc(t('practice.listen')) + '">' + ico('sound', 18) + '</button></div>';
  }
  function viewPartner(id) {
    if (!ui.pt || ui.pt.id !== id) ui.pt = ptNew(id);
    var P = ui.pt; if (!P) return notFound('practice.notFound');
    var sc = P.sc, log = P.log.map(ptMsgHtml).join('') + (P.done ? ptSumHtml(P) : '');
    var foot = P.done
      ? '<div class="content pdone"><button type="button" class="btn btn-primary" data-action="pt-again" data-id="' + id + '">' + esc(t('pt.again')) + '</button><a class="btn btn-ghost" href="#/cwiczenia">' + esc(t('pt.back')) + '</a></div>'
      : '<form class="composer" data-form="partner"><button type="button" class="hint-btn" data-action="pt-hint">' + ico('bulb', 18) + '<span>' + esc(t('pt.hint')) + '</span></button>' +
        '<input class="composer-input" name="text" type="text" lang="ko" autocomplete="off" maxlength="300" placeholder="' + esc(t('pt.input')) + '" aria-label="' + esc(t('pt.input')) + '">' +
        '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button></form>';
    show('<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/cwiczenia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(t('pt.scenario')) + ': ' + esc(L(sc.name)) + '</h1><span class="subtitle">' + esc(tf('pt.progress', { n: Math.min(P.n, PT_TARGET), m: PT_TARGET })) + '</span></div><span class="pt-lvl">' + esc(sc.level) + '</span></div>' +
      '<div class="messages pt-log" aria-live="polite">' + log + '<p class="pt-note">' + mascot('kotek', 'm-kcat') + '<span>' + esc(t('pt.note')) + '</span></p></div>' + foot + nav('practice') + '</main>', L(sc.name), { bottom: true });
  }
  function viewPractice() {
    ui.k = null;
    var rows = SCN.map(function (sc) {
      return '<a class="row" href="#/cwiczenia/rozmowa/' + sc.id + '"><span class="badge-sq" aria-hidden="true">' + glyph(SC_GLYPH[sc.id] || 'cup') + '</span>' +
        '<span class="row-text"><strong>' + esc(L(sc.name)) + '</strong><small>' + esc(O(sc.name)) + ' · ' + esc(L(sc.desc)) + '</small></span><span class="row-time">' + esc(sc.level) + '</span></a>';
    }).join('');
    show('<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('pt.title')) + '</h1><p class="subtitle">' + esc(t('pt.sub')) + '</p></div>' + mascot('kotek', 'm-head') + '</div>' +
      '<span class="label-caps pt-sec">' + esc(t('pt.talk')) + '</span><div class="list">' + rows + '</div>' +
      '<span class="label-caps pt-sec">' + esc(t('pt.lessons')) + '</span>' + kFeature() +
      '<p class="fine">' + esc(t('pt.demo')) + '</p></div>' + nav('practice') + '</main>', t('pt.title'));
  }
  function pBubble(e, mine) {
    var tr = (!mine && lang !== 'ko') ? '<span class="tr">' + esc(T(e.p)) + '</span>' : '';
    var say = mine ? '' : '<button type="button" class="say" data-action="say" data-text="' + esc(e.k) + '" aria-label="' + esc(t('practice.listen')) + '">' + ico('sound', 18) + '</button>';
    return '<div class="bubble ' + (mine ? 'bubble-out' : 'bubble-in') + '"><span class="meta">' + esc(mine ? t('room.you') : e.u) + '</span>' +
      '<span class="txt" lang="ko">' + esc(e.k) + '</span>' + tr + say + '</div>';
  }
  function viewPracticeRoom(id) {
    var r = findBy(D.practice, id);
    if (!r) return notFound('practice.notFound');
    var n = Math.min(pProg(id), r.ex.length), done = n >= r.ex.length, html = '';
    r.ex.forEach(function (e, i) {
      if (i > n) return;
      html += pBubble(e, false);
      if (i < n) html += pBubble({ k: e.o[e.a] }, true);
    });
    var foot;
    if (done) {
      foot = '<div class="content pdone"><h2 class="section-title">' + esc(t('practice.done')) + '</h2><p class="subtitle">' + esc(t('practice.doneSub')) + '</p>' +
        '<button type="button" class="btn btn-primary" data-action="p-again" data-id="' + id + '">' + esc(t('practice.again')) + '</button>' +
        '<a class="btn btn-ghost" href="#/cwiczenia">' + esc(t('practice.rooms')) + '</a></div>';
    } else {
      var cur = r.ex[n];
      foot = '<div class="content popts"><span class="label-caps">' + esc(t('practice.pick')) + '</span>' +
        (ui.pWrong !== null && ui.pWrong !== undefined ? '<p class="phint" role="alert">' + esc(t('practice.wrong')) + '</p>' : '') +
        cur.o.map(function (o, i) {
          return '<button type="button" class="popt' + (ui.pWrong === i ? ' bad' : '') + '" lang="ko" data-action="p-pick" data-id="' + id + '" data-i="' + i + '">' + esc(o) + '</button>';
        }).join('') + '</div>';
    }
    show('<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/cwiczenia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(r.name)) + '</h1><span class="subtitle">' + esc(O(r.name)) + ' · ' + esc(r.level) + ' · ' + esc(tf('practice.progress', { n: n, m: r.ex.length })) + '</span></div></div>' +
      '<div class="messages" aria-live="polite">' + html + '</div>' + foot + nav('practice') + '</main>', L(r.name), { bottom: true });
  }

  /* ---------- rozmowa z baristą: zamawiamy americano ---------- */
  var HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;
  function barSteps() { return D.barista.steps; }
  function barStart() {
    var st = barSteps();
    ui.bar = { log: [{ me: false, k: st[0].q, p: st[0].tr }], done: {}, cur: 0, finished: false };
  }
  function barSay(k, p) { ui.bar.log.push({ me: false, k: k, p: p }); }
  function barReply(text) {
    var b = ui.bar, st = barSteps(), cur = st[b.cur];
    b.log.push({ me: true, k: text });
    if (cur.kind === 2) { b.finished = true; barSay('또 오세요!', 'Zapraszamy ponownie!'); return; }
    var hasHangul = HANGUL.test(text);
    if (cur.kind !== 1 && !hasHangul) { barSay('한국어로 말해 주세요.', t('barista.nudge')); return; }
    var ok = {};
    if (cur.kind === 1) ok[b.cur] = true;
    else {
      // wskazane słowa kluczowe rozpoznajemy dla bieżącego i kolejnych pytań (można odpowiedzieć na kilka naraz)
      for (var i = b.cur; i < st.length; i++) {
        if (st[i].kind === 0 && st[i].keys && new RegExp(st[i].keys).test(text)) ok[i] = true;
      }
      if (!ok[b.cur] && cur.yn && /네|예|응|아니|괜찮|좋아요|필요/.test(text)) ok[b.cur] = true;
    }
    if (!ok[b.cur]) { barSay('죄송해요, 다시 한 번 말씀해 주시겠어요?', t('barista.sorry')); return; }
    Object.keys(ok).forEach(function (k) { b.done[k] = true; });
    var next = b.cur + 1;
    while (next < st.length && b.done[next]) next++;
    b.cur = next;
    barSay('네, 알겠습니다! ' + st[next].q, 'Dobrze! ' + st[next].tr);
  }
  function barBubble(m) {
    var tr = (!m.me && lang !== 'ko' && m.p) ? '<span class="tr">' + esc(T(m.p)) + '</span>' : '';
    var say = m.me ? '' : '<button type="button" class="say" data-action="say" data-text="' + esc(m.k) + '" aria-label="' + esc(t('practice.listen')) + '">' + ico('sound', 18) + '</button>';
    return '<div class="bubble ' + (m.me ? 'bubble-out' : 'bubble-in') + '"><span class="meta">' + esc(m.me ? t('room.you') : D.barista.barista) + '</span>' +
      '<span class="txt" lang="ko">' + esc(m.k) + '</span>' + tr + say + '</div>';
  }
  function viewBarista() {
    if (!ui.bar) barStart();
    var b = ui.bar, st = barSteps(), cur = st[b.cur], B = D.barista;
    var foot;
    if (b.finished) {
      foot = '<div class="content pdone"><h2 class="section-title">' + esc(t('barista.done')) + '</h2><p class="subtitle">' + esc(t('barista.doneSub')) + '</p>' +
        '<button type="button" class="btn btn-primary" data-action="bar-again">' + esc(t('barista.again')) + '</button>' +
        '<a class="btn btn-ghost" href="#/cwiczenia">' + esc(t('practice.rooms')) + '</a></div>';
    } else {
      foot = '<div class="bar-hint"><span class="label-caps">' + esc(t('barista.hint')) + '</span>' +
        '<button type="button" class="popt" lang="ko" data-action="bar-hint" data-text="' + esc(cur.sample) + '"><span>' + esc(cur.sample) + '</span>' +
        (lang !== 'ko' ? '<small>' + esc(T(cur.sampleTr)) + '</small>' : '') + '</button></div>' +
        '<form class="composer" data-form="barista"><input class="composer-input" name="text" type="text" lang="ko" autocomplete="off" maxlength="200" placeholder="' + esc(t('barista.input')) + '" aria-label="' + esc(t('barista.input')) + '">' +
        '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('barista.send')) + '">' + ico('send', 22) + '</button></form>';
    }
    show('<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/cwiczenia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(B.name)) + '</h1><span class="subtitle">' + esc(O(B.name)) + ' · ' + esc(B.badge) + '</span></div></div>' +
      '<div class="messages" aria-live="polite">' + b.log.map(barBubble).join('') + '</div>' + foot + nav('practice') + '</main>', L(B.name), { bottom: true });
    var inp = document.querySelector('.composer-input');
    if (inp && ui.barFocus) { inp.focus({ preventScroll: true }); }
    ui.barFocus = false;
  }

  /* ---------- struktura z analizy UX: Lada, Stoliki, rytm tygodnia, Sala live ---------- */
  var HOBBIES = [
    ['fandoms', 'Fandomy', '팬덤'],
    ['book-club', 'Klub książki', '북클럽'],
    ['kdrama-club', 'Klub K-dram', 'K-드라마 클럽'],
    ['current-affairs', 'Current Affairs', '시사'],
    ['polish-for-koreans', 'Polski dla Koreańczyków', '한국인을 위한 폴란드어'],
    ['kpop-dance', 'K-pop taniec', '케이팝 댄스'],
    ['cooking-club', 'Klub gotowania', '요리 클럽']
  ];
  var RH = { 1: 'show', 2: 'choose', 3: 'mission', 4: 'ask', 5: 'voice', 6: 'live', 0: 'live' };
  function ladaState() {
    if (!ui.lada) ui.lada = Object.assign({ dir: '', level: '', hobbies: [], slots: [] }, load('lada', {}) || {});
    return ui.lada;
  }
  function ladaDone() { var l = load('lada', null); return !!(l && l.done); }
  function tableOf(id) { return findBy(D.tables, id); }
  function weekStart(d) { d = d || new Date(); var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function weeklyCount() {
    var a = load('active', {}), s = weekStart(), n = 0;
    for (var i = 0; i < 7; i++) { var d = new Date(s); d.setDate(s.getDate() + i); if (a[dayKey(d)]) n++; }
    return n;
  }
  function freezeState() {
    var m = dayKey().slice(0, 7), f = load('freeze', { m: m, n: 2, w: '' });
    if (f.m !== m) f = { m: m, n: 2, w: f.w };
    return f;
  }
  function frozenThisWeek() { return freezeState().w === dayKey(weekStart()); }
  function myMsgCount() {
    var n = 0;
    D.channels.forEach(function (c) { n += load('msgs.chat:' + c.id, []).length; });
    D.rooms.forEach(function (r) { n += load('msgs.room:' + r.id, []).length; });
    D.tables.forEach(function (x) { n += load('msgs.table:' + x.id, []).length; });
    return n;
  }
  function joinedTables() { var tb = load('tables', {}); return D.tables.filter(function (x) { return tb[x.id] && tb[x.id].joined; }); }

  /* Twoja droga: Lada → Pogaduszki → Próbny → Sezon → Live */
  function journeyHtml() {
    var jt = joinedTables(), rs = load('rsvp', {});
    var tbH = jt.length ? '#/stolik/' + jt[0].id : '#/stoliki';
    var st = [
      { k: 'jr.s1', done: ladaDone(), href: '#/lada' },
      { k: 'jr.s2', done: jt.length > 0, href: '#/stoliki' },
      { k: 'jr.s3', done: myMsgCount() >= 5, href: tbH },
      { k: 'jr.s4', done: Object.keys(rs).length > 0, href: tbH },
      { k: 'jr.s5', done: jt.some(function (x) { return x.kind === 'season'; }), href: '#/stoliki' }
    ];
    var now = -1;
    for (var i = 0; i < st.length; i++) { if (!st[i].done) { now = i; break; } }
    var items = st.map(function (s, i) {
      return '<li class="' + (s.done ? 'done' : (i === now ? 'now' : '')) + '"' + (i === now ? ' aria-current="step"' : '') + '><b>' + (s.done ? ico('check', 16) : (i + 1)) + '</b><span>' + esc(t(s.k)) + '</span></li>';
    }).join('');
    var hint = now < 0 ? '<p>' + esc(t('jr.done')) + '</p>' : '<a class="jr-link" href="' + st[now].href + '">' + esc(t('jr.hint' + (now + 1))) + ' ' + ico('chevron', 14) + '</a>';
    return '<section class="journey" aria-label="' + esc(t('jr.title')) + '"><span class="label-caps">' + esc(t('jr.title')) + '</span><ol>' + items + '</ol>' + hint + '</section>';
  }

  /* Tydzień: wystarczą 3 dni z 7, do tego 2 zamrożenia w miesiącu */
  function weeklyHtml() {
    var a = load('active', {}), s = weekStart(), n = weeklyCount(), fz = freezeState(), froze = frozenThisWeek(), dots = '';
    var names = lang === 'ko' ? ['월', '화', '수', '목', '금', '토', '일'] : lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    for (var i = 0; i < 7; i++) {
      var d = new Date(s); d.setDate(s.getDate() + i);
      dots += '<div class="' + (a[dayKey(d)] ? 'on' : '') + (dayKey(d) === dayKey() ? ' today' : '') + '"><i></i><span>' + names[i] + '</span></div>';
    }
    var ok = n >= 3 || froze;
    return '<section class="panel weekly"><div class="panel-head"><h2>' + esc(t('wr.title')) + '</h2><span class="tag' + (ok ? ' tag-ok' : '') + '">' + esc(froze ? t('wr.frozen') : tf('wr.count', { n: Math.min(n, 3) })) + '</span></div>' +
      '<div class="wdots">' + dots + '</div><p class="fine left">' + esc(t(ok ? 'wr.ok' : 'wr.rule')) + '</p>' +
      '<button type="button" class="chip-btn" data-action="freeze"' + (froze || fz.n < 1 ? ' disabled' : '') + '>' + esc(t('wr.freeze')) + ' · ' + esc(fz.n > 0 ? tf('wr.freezeLeft', { n: fz.n }) : t('wr.none')) + '</button></section>';
  }

  /* ---------- Lada ---------- */
  function optBtn(action, val, label, on) {
    return '<button type="button" class="opt" data-action="' + action + '" data-v="' + esc(val) + '" aria-pressed="' + (!!on) + '">' + esc(label) + '</button>';
  }
  function homeHash() { return ladaDone() ? '#/kawiarnia' : '#/lada'; }
  function viewLada() {
    var edit = currentHash() === '#/lada/edycja';
    ui.ladaEdit = edit;
    var S0 = ladaState();
    var dir = optBtn('lada-dir', 'ko', t('lada.dir.ko'), S0.dir === 'ko') + optBtn('lada-dir', 'pl', t('lada.dir.pl'), S0.dir === 'pl');
    var lv = ['A1', 'A2', 'B1', 'B2', 'C1'].map(function (x) { return optBtn('lada-lvl', x, x, S0.level === x); }).join('');
    var hb = HOBBIES.map(function (h) { return optBtn('lada-hob', h[0], lang === 'ko' ? h[2] : T(h[1]), S0.hobbies.indexOf(h[0]) >= 0); }).join('');
    var sl = [['am', 'lada.slot.am'], ['pm', 'lada.slot.pm'], ['eve', 'lada.slot.eve']].map(function (s) { return optBtn('lada-slot', s[0], t(s[1]), S0.slots.indexOf(s[0]) >= 0); }).join('');
    var ready = !!(S0.dir && S0.level);
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('lada.title')) + '</h1><p class="subtitle">' + esc(t('lada.sub')) + '</p></div>' + mascot('mandu', 'm-head') + '</div>' +
      '<section class="panel"><h2>1. ' + esc(t('lada.q1')) + '</h2><div class="opt-grid">' + dir + '</div></section>' +
      '<section class="panel"><h2>2. ' + esc(t('lada.q2')) + '</h2><div class="opt-grid">' + lv + '</div></section>' +
      '<section class="panel"><h2>3. ' + esc(t('lada.q3')) + '</h2><div class="opt-grid">' + hb + '</div></section>' +
      '<section class="panel"><h2>4. ' + esc(t('lada.q4')) + '</h2><div class="opt-grid">' + sl + '</div><p class="fine left">' + esc(t('lada.slotNote')) + '</p></section>' +
      '<button type="button" class="btn btn-primary" data-action="lada-done"' + (ready ? '' : ' aria-disabled="true"') + '>' + esc(t(edit ? 'lada.save' : 'lada.done')) + '</button>' +
      (ready ? '' : '<p class="fine">' + esc(t('lada.need')) + '</p>') +
      (edit ? '<a class="btn btn-ghost btn-sm" href="#/profil">' + esc(t('lada.cancel')) + '</a>' : '<a class="btn btn-ghost btn-sm" href="#/kawiarnia">' + esc(t('lada.skip')) + '</a>') + '</div>' + nav(edit ? 'profile' : 'chats') + '</main>';
    show(html, t('lada.title'));
  }

  /* ---------- Stoliki ---------- */
  function tScore(x) {
    var l = ladaState(), s = 0;
    if (x.kind === 'trial' || /^level-/.test(x.hobbyId)) return (l.level && x.levels.indexOf(l.level) >= 0) ? 3 : 0;
    if (l.hobbies.indexOf(x.hobbyId) >= 0) s += 2;
    if (l.level && x.levels.indexOf(l.level) >= 0) s += 1;
    return s;
  }
  function seatDots(n, m) { var h = ''; for (var i = 0; i < m; i++) h += '<i' + (i < n ? ' class="on"' : '') + '></i>'; return '<span class="dots" aria-hidden="true">' + h + '</span>'; }
  function isForming(x) { return x.kind === 'season' && !!x.min && x.members.length < x.min; }
  function tableCard(x) {
    var tb = load('tables', {}), joined = !!(tb[x.id] && tb[x.id].joined), sc = tScore(x), full = x.members.length >= x.seats;
    var club = x.kind === 'club', soonT = isSoonT(x), locked = club && !x.free && !isPremium(), wl = !!load('waitlist', {})[x.id], forming = isForming(x);
    var stage = club ? t('tb.clubOpen') : (forming ? tf('tb.forming', { n: x.members.length + (wl ? 1 : 0), m: x.min }) : (x.kind === 'trial' ? tf('tb.day', { n: x.day }) : tf('tb.week', { n: x.week })));
    var flag = joined ? '<span class="tag tag-ok">' + esc(t('tb.joined')) + '</span>' : (wl ? '<span class="tag tag-ok">' + esc(t('tb.onList')) + '</span>' : (ladaDone() && sc >= 2 ? '<span class="tag tag-match">' + esc(t('tb.match')) + '</span>' : ''));
    var meta = club ? '<span>' + esc(t(x.free ? 'tb.clubFree' : ((x.live || isPremium()) ? 'tb.clubPremium' : 'tb.clubMeta'))) + '</span>' + (locked ? lockHtml(x) : '') : seatDots(x.members.length, x.seats) + '<span>' + esc(full ? t('tb.full') : tf('tb.seats', { n: x.members.length, m: x.seats })) + '</span>' + (soonT ? '<span class="soon-tag">' + esc(t('soon.tag')) + '</span>' : '');
    return '<a class="card tcard" href="' + (soonT ? '#/wkrotce/' + x.id : (locked ? gateHref(x.id) : '#/stolik/' + x.id)) + '"><div class="card-head"><span class="tag tag-' + x.kind + '">' + esc(kindTag(x)) + '</span>' + flag + '</div>' +
      '<h2>' + clubEmo(x) + esc(L(x.name)) + '</h2><p class="subtitle">' + esc(O(x.name)) + ' · ' + esc(L(x.level)) + ' · ' + esc(stage) + '</p>' +
      '<div class="tmeta">' + meta + '</div></a>';
  }
  function tableSection(titleKey, list) {
    return list.length ? '<h2 class="section-title">' + esc(t(titleKey)) + '</h2><div class="list">' + list.map(tableCard).join('') + '</div>' : '';
  }
  /* Dopasowanie po Ladzie: stolik próbny wg poziomu + propozycje tematyczne wg zainteresowań */
  function plClubCard(x) {
    var c = tableOf('sezon-polish-for-koreans');
    if (!c || !x || x.id === c.id) return '';
    return '<section class="panel"><h2>' + esc(t('tb.plClub')) + '</h2><p class="subtitle">' + esc(t('tb.plClubSub')) + '</p><div class="list">' + tableCard(c) + '</div></section>';
  }
  function guideHtml(toggle) {
    var items = [['gd.t1', 'gd.t1b'], ['gd.t2', 'gd.t2b'], ['gd.t3', 'gd.t3b'], ['gd.t4', 'gd.t4b']].map(function (g) { return '<p class="subtitle"><strong>' + esc(t(g[0])) + '</strong><br>' + esc(t(g[1])) + '</p>'; }).join('');
    return toggle
      ? '<details class="panel"><summary><strong>' + esc(t('gd.title')) + '</strong></summary>' + items + '</details>'
      : '<section class="panel"><h2>' + esc(t('gd.title')) + '</h2>' + items + '</section>';
  }
  function viewMatch() {
    var today = findBy(D.rooms, 'temat-dnia');
    var corners = (ladaState().dir === 'pl' ? ['pl-a1', 'kr-a1', 'tips'] : ['kr-a1', 'pl-a1', 'tips']).map(function (id) { return findBy(D.channels, id); }).filter(Boolean);
    var l = ladaState(), mine = joinedTables().filter(function (x) { return x.kind === 'trial'; })[0];
    var topics = D.tables.filter(function (x) { return x.kind === 'season' && !/^level-/.test(x.hobbyId); })
      .sort(function (a, b) { return tScore(b) - tScore(a); }).slice(0, 3);
    var yours = mine
      ? '<section class="panel"><span class="label-caps">' + esc(t('mt.yours')) + '</span><div class="list">' + tableCard(mine) + '</div></section>'
      : '<section class="panel"><p class="subtitle">' + esc(t('mt.none')) + '</p></section>';
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('mt.title')) + '</h1><p class="subtitle">' + esc(tf('mt.sub', { lv: l.level || '' })) + '</p></div>' + mascot('mandu', 'm-head') + '</div>' +
      (mine ? '<a class="btn btn-primary" href="#/stolik/' + mine.id + '">' + esc(t('mt.open')) + '</a>' : '') +
      yours +
      (topics.length ? '<h2 class="section-title">' + esc(t('mt.topics')) + '</h2><p class="subtitle">' + esc(t('mt.topicsSub')) + '</p><div class="list">' + topics.map(tableCard).join('') + '</div>' : '') +
      (corners.length ? '<h2 class="section-title">' + esc(t('mt.corners')) + '</h2><p class="subtitle">' + esc(t('mt.cornersSub')) + '</p><div class="list">' + corners.map(chatRow).join('') + '</div>' : '') +
      (today ? '<h2 class="section-title">' + esc(t('mt.today')) + '</h2><p class="subtitle">' + esc(t('mt.todaySub')) + '</p><div class="list">' + roomRowAlways(today) + '</div>' : '') +
      guideHtml(false) +
      '<a class="btn btn-ghost btn-sm" href="#/stoliki">' + esc(t('mt.all')) + '</a></div>' + nav('tables') + '</main>';
    show(html, t('mt.title'));
  }
  /* Lekcje polskiego (wydarzenia na żywo) w zakładce Stoliki, widok „Uczę się polskiego" */
  function plLessonsHtml() {
    var now = new Date();
    var items = D.events.filter(function (e) { return /^polski-/.test(e.id); }).map(function (e) { return { e: e, slot: nextSlot(e, now) }; })
      .filter(function (x) { return x.slot; }).sort(function (a, b) { return a.slot.start - b.slot.start; });
    if (!items.length) return '';
    return '<h2 class="section-title">' + esc(t('tb.plLessons')) + '</h2><p class="subtitle">' + esc(t('tb.plLessonsSub')) + '</p>' +
      items.map(function (x) {
        var e = x.e, locked = e.premium && !isPremium();
        return '<article class="card"><div class="card-head"><span class="when">' + esc(whenText(x.slot.start, now)) + '</span>' +
          '<span class="tag' + (e.premium ? ' tag-premium' : '') + '">' + esc(e.premium ? t('ev.premium') : t('ev.free')) + '</span></div>' +
          '<h2>' + esc(L(e.name)) + '</h2><p class="subtitle">' + esc(O(e.name)) + ' · ' + esc(L(e.format)) + '</p>' +
          (locked ? '<a class="btn btn-ghost btn-sm" href="' + gateHref(e.id) + '">' + (CFG.lite ? '' : ico('lock', 16)) + esc(t(CFG.lite ? 'soon.cta' : 'ev.unlock')) + '</a>'
            : '<button type="button" class="btn btn-primary btn-sm" data-action="ics" data-id="' + e.id + '">' + esc(t('ev.addCal')) + '</button>') + '</article>';
      }).join('');
  }
  function viewTables() {
    var tb = load('tables', {});
    var isKoW = whoLearn() === 'ko';
    ui.filters.lang = isKoW ? 'KR' : 'PL';
    var fl = ui.filters;
    var tOk = function (x) {
      if (tb[x.id] && tb[x.id].joined) return true;
      if (fl.level !== 'all' && x.levels && x.levels.indexOf(fl.level) < 0) return false;
      var TT = { kpop: 'dance', 'kpop-dance': 'dance', kdrama: 'culture', 'kdrama-club': 'culture', fandoms: 'culture', 'book-club': 'culture', food: 'culture', 'cooking-club': 'culture', travel: 'life', history: 'life', life: 'life', language: 'language', 'polish-for-koreans': 'language' };
      var xl = x.lang || (x.hobbyId === 'polish-for-koreans' || /polski/.test(x.id) ? 'PL' : (/rozmowy-kr/.test(x.id) ? 'KR' : 'MIX'));
      var xt = x.topic || (/^level-/.test(x.hobbyId) ? 'language' : TT[x.hobbyId]);
      if (fl.lang !== 'all' && xl !== 'MIX' && xl !== fl.lang) return false;
      if (fl.topic !== 'all' && xt && xt !== fl.topic) return false;
      if (fl.age !== 'all' && x.ages && x.ages.indexOf(fl.age) < 0) return false;
      return true;
    };
    var list = D.tables.slice().filter(tOk).sort(function (a, b) { return tScore(b) - tScore(a); });
    var lvChips = filtersHtml();
    var isMine = function (x) { return !!(tb[x.id] && tb[x.id].joined); };
    var open = D.rooms.filter(function (r) { return r.always && matches(r); });
    var body = '';
    if (!ladaDone()) body += '<a class="corner" href="#/lada"><span class="row-text"><strong>' + esc(t('lada.cta')) + '</strong><small>' + esc(t('lada.ctaBody')) + '</small></span>' + ico('chevron', 20) + '</a>';
    body +=
      lvChips +
      (fl.lang === 'PL' && tableOf('sezon-polish-for-koreans') ? '<h2 class="section-title">' + esc(t('tb.plClub')) + '</h2><p class="subtitle">' + esc(t('tb.plClubSub')) + '</p><div class="list">' + tableCard(tableOf('sezon-polish-for-koreans')) + '</div>' : '') +
      (fl.lang === 'PL' ? plLessonsHtml() : '') +
      (isKoW ? (      tableSection('tb.sec.mine', list.filter(isMine)) +
      (fl.lang === 'PL' ? '' : tableSection('tb.sec.free', list.filter(function (x) { return x.free && x.kind === 'season' && !isMine(x); }))) +
      tableSection('tb.sec.trial', list.filter(function (x) { return x.kind === 'trial' && !isMine(x); })) +
      tableSection('tb.sec.seasonLevel', list.filter(function (x) { return x.kind === 'season' && /^level-/.test(x.hobbyId) && !isMine(x); }))) : '') +
      '<h2 class="section-title">' + esc(t('tb.sec.open')) + '</h2><p class="subtitle">' + esc(t('tb.open.sub')) + '</p><div class="list">' + open.map(roomRowAlways).join('') + '</div>';
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('tb.title')) + '</h1><p class="subtitle">' + esc(t('tb.sub')) + '</p></div>' +
      '<a class="pill-link" href="#/premium">' + ico('crown', 16) + esc(t('lobby.premium')) + '</a></div>' +
      (CFG.demo ? '<div class="strip strip-flat">' + esc(t('demo.tables')) + '</div>' : '') + whoSeg(isKoW) + body + '</div>' + nav('tables') + '</main>';
    show(html, t('tb.title'));
  }

  /* ---------- szczegóły stolika ---------- */
  function todayType() { return RH[parts(new Date(), WARSAW).dow]; }
  function learnLang() { var l = load('lada', null); return l && l.dir === 'pl' ? 'pl' : (l && l.dir === 'ko' ? 'ko' : (lang === 'ko' ? 'pl' : 'ko')); }
  function weeksHtml(cur) {
    var out = '';
    for (var i = 1; i <= 4; i++) out += '<div class="' + (i === cur ? 'on' : (i < cur ? 'past' : '')) + '"><b>' + i + '</b><span>' + esc(t('wk.' + i)) + '</span></div>';
    return '<div class="weeks" role="group" aria-label="' + esc(t('td.season')) + '">' + out + '</div>';
  }
  function rhythmHtml(curDow) {
    var order = [1, 2, 3, 4, 5, 6, 0], names = lang === 'ko' ? DAYS_KO : lang === 'en' ? DAYS_EN : DAYS_PL;
    return '<div class="rhythm" role="list" aria-label="' + esc(t('rh.title')) + '">' + order.map(function (d) {
      return '<div role="listitem" class="' + (d === curDow ? 'today' : '') + '"><b>' + esc(names[d]) + '</b><span>' + esc(t('rh.' + RH[d] + '.s')) + '</span></div>';
    }).join('') + '</div>';
  }
  function xpLine() {
    var d = load('tblXp', { day: '', n: 0 });
    if (d.day !== dayKey()) d = { day: dayKey(), n: 0 };
    return d.n > 0 ? tf('xp.today', { n: d.n }) : t('xp.hint');
  }
  /* prosty prompt w stylu kotka z czatu: kotek + mały dymek (etykieta, pytanie, tłumaczenie, przyciski) */
  var KEMO = { '': '💭' };
  function kEmoInit() { var m = { show: '📸', choose: '⚖️', mission: '🎯', ask: '❓', voice: '🎙️', live: '🌿' }; Object.keys(m).forEach(function (k) { KEMO[t('rh.' + k)] = m[k]; }); }
  function kittyPrompt(label, main, mainLang, tr, trLang, btns, extra) {
    return '<div class="qprompt kprompt">' + mascot('kotek', 'm-cat') + '<div class="q-bubble">' +
      '<span class="q-k"' + (mainLang ? ' lang="' + mainLang + '"' : '') + '>' + esc(main) + '</span>' +
      (tr ? '<span class="q-pl"' + (trLang ? ' lang="' + trLang + '"' : '') + '>' + esc(tr) + '</span>' : '') +
      (btns ? '<span class="q-btns">' + btns + '</span>' : '') + (extra || '') + '</div></div>';
  }
  function promptCard(x, canType) {
    var dow = parts(new Date(), WARSAW).dow, typ = RH[dow], learn = learnLang(), other = learn === 'ko' ? 'pl' : 'ko';
    var lv = load('level', ''), useFrame = !lv || lv === 'A1' || lv === 'A2';
    var label = t('rh.' + typ); kEmoInit();
    if (typ === 'live') return kittyPrompt(label, t('pr.weekend'), '', '', '', '');
    var pr = x.prompts[typ], fr = D.frames[typ][learn], btns = '';
    if (canType && useFrame) btns += '<button type="button" class="chip-btn chip-main" data-action="starter" data-text="' + esc(fr.replace(/___/g, '…')) + '">' + esc(t('pr.useFrame')) + '</button>';
    if (typ === 'voice') btns += '<button type="button" class="chip-btn" data-action="voice">' + ico('mic', 16) + ' ' + esc(t('pr.voiceBtn')) + '</button>';
    return kittyPrompt(label, pr[learn], learn, lang === 'en' ? T(pr.pl) : pr[other], lang === 'en' ? '' : other, btns);
  }
  function warmHtml(x) {
    var w = x.warmth, good = w >= 70;
    return '<section class="panel"><div class="panel-head"><h2>' + esc(t('td.warm')) + '</h2><span class="tag' + (good ? ' tag-ok' : '') + '">' + esc(t(good ? 'td.warm.good' : 'td.warm.ok')) + '</span></div>' +
      '<div class="warm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><i style="width:' + w + '%"></i></div>' +
      '<p class="fine left">' + esc(tf('td.warmNote', { n: w })) + '</p></section>';
  }
  function liveSlot(o) { return nextSlot({ time: o.time, dow: [o.dow], dur: D.liveDur }, new Date()); }
  function liveCard(x, joined) {
    var now = new Date(), pick = load('rsvp', {})[x.id], opts = D.liveOpts.map(function (o, i) {
      var sl = liveSlot(o), on = !!(pick && pick.i === i);
      return '<button type="button" class="slot" data-action="rsvp" data-id="' + x.id + '" data-i="' + i + '" aria-pressed="' + on + '"' + (joined ? '' : ' disabled') + '><span>' + esc(whenText(sl.start, now)) + '</span>' + (on ? ico('check', 18) : '') + '</button>';
    }).join('');
    var head = '<div class="panel-head"><h2>' + esc(t('lv.title')) + '</h2><span class="tag">25 min</span></div><p class="subtitle">' + esc(t('lv.sub')) + '</p>' + (x.kind === 'season' ? '<p class="fine left">' + esc(t('lv.monthly')) + '</p>' : '');
    if (x.kind === 'season' && x.week < 3) return '<section class="panel livec">' + head + '</section>';
    var done = pick ? '<p class="reserved">' + ico('check', 18) + '<span>' + esc(t('lv.voted')) + '</span></p><p class="fine left">' + esc(t('lv.remind')) + '</p>' +
      '<div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-action="rsvp-ics" data-id="' + x.id + '">' + esc(t('lv.ics')) + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="rsvp-clear" data-id="' + x.id + '">' + esc(t('lv.change')) + '</button></div>' : '';
    return '<section class="panel livec">' + head + (pick ? '' : '<h3 class="mini">' + esc(t('lv.vote')) + '</h3>') + '<div class="slots">' + opts + '</div>' + done +
      '<div class="plan"><span class="label-caps">' + esc(t('lv.plan')) + '</span><ol><li>' + esc(t('lv.p1')) + '</li><li>' + esc(t('lv.p2')) + '</li><li>' + esc(t('lv.p3')) + '</li></ol><p class="fine left">' + esc(t('lv.r1')) + ' ' + esc(t('lv.times')) + '.</p></div></section>';
  }
  function membersHtml(x, joined) {
    var seats = x.members.map(function (i) {
      var p = D.people[i], host = i === x.host;
      return '<div class="seat"><span class="avatar">' + esc(p.n.charAt(0)) + '</span><span class="seat-name">' + esc(p.n) + '</span><span class="seat-city">' + esc(p.c) + '</span><span class="seat-int">' + esc(lang === 'ko' ? p.w.ko : T(p.w.pl)) + '</span>' + (host ? '<span class="seat-role">' + esc(t('tb.host')) + '</span>' : '') + '</div>';
    }).join('');
    if (joined) {
      var nm = load('name', '') || t('profile.guest');
      seats += '<div class="seat"><span class="avatar avatar-you">' + esc(nm.charAt(0).toUpperCase()) + '</span><span class="seat-name">' + esc(nm) + '</span><span class="seat-role">' + esc(t('tb.you')) + '</span></div>';
    }
    return '<section class="panel"><div class="panel-head"><h2>' + esc(t('tb.members')) + '</h2><span class="tag">' + (x.members.length + (joined ? 1 : 0)) + ' / ' + x.seats + '</span></div><div class="members">' + seats + '</div><p class="fine left">' + esc(t('tb.noDm')) + '</p></section>';
  }
  function stayHtml(x, joined) {
    if (x.kind !== 'trial') return '';
    return '<section class="panel stay"><h2>' + esc(t('tb.stay')) + '</h2><p class="subtitle">' + esc(t('tb.stayBody')) + '</p>' +
      (joined ? '<a class="btn btn-ghost btn-sm" href="#/premium">' + esc(t('tb.stayCta')) + '</a>' : '') + '</section>';
  }
  function couponPct() { var xp = load('tblXpTotal', 0); return xp >= 100 ? 20 : (xp >= 50 ? 10 : 0); }
  function rewardHtml(x, joined) {
    if (!joined) return '';
    if (x.kind === 'trial') {
      var xp = load('tblXpTotal', 0), pc = couponPct();
      return '<section class="panel"><div class="panel-head"><h2>' + esc(t('rw.trialTitle')) + '</h2><span class="tag' + (pc ? ' tag-ok' : '') + '">' + esc(tf('rw.xp', { n: Math.min(xp, 100) })) + '</span></div>' +
        '<div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(xp, 100) + '"><i style="width:' + Math.min(xp, 100) + '%"></i></div>' +
        '<p class="fine left">' + esc(t('rw.trialBody')) + '</p><p class="reward-line">' + esc(pc ? tf('rw.coupon', { n: pc }) : t('rw.none')) + '</p></section>';
    }
    return '<section class="panel"><div class="panel-head"><h2>' + esc(t('rw.seasonTitle')) + '</h2><span class="tag">' + esc(tf('rw.week', { n: x.week })) + '</span></div><p class="fine left">' + esc(t('rw.seasonBody')) + '</p></section>';
  }
  function isPractical(x) { return x.kind === 'season' && !!x.min; }
  function eventsCard(x) {
    return '<section class="panel"><div class="panel-head"><h2>' + esc(t('ev.funnelTitle')) + '</h2></div><p class="subtitle">' + esc(t('ev.funnelBody')) + '</p>' +
      '<a class="btn btn-primary btn-sm" href="#/wydarzenia/premium">' + esc(t('ev.funnelCta')) + '</a></section>';
  }
  function benefitsHtml(x) {
    if (x.kind !== 'season') return '';
    return '<section class="panel"><h2>' + esc(t('bn.title')) + '</h2><ul class="benefits">' + [1, 2, 3, 4, 5].map(function (i) { return '<li>' + ico('check', 16) + '<span>' + esc(t(i === 3 && isPractical(x) ? 'bn.3e' : 'bn.' + i)) + '</span></li>'; }).join('') + '</ul></section>';
  }
  function viewTable(id) {
    var x = tableOf(id);
    if (!x) return notFound('tb.notFound');
    if (isSoonT(x)) { navigate('#/wkrotce/' + id, true); return; }
    var tb = load('tables', {}), key = 'table:' + id;
    var club = x.kind === 'club', forming = isForming(x), wl = !!load('waitlist', {})[x.id];
    var joined = club ? (!!x.free || isPremium()) : !!(tb[x.id] && tb[x.id].joined);
    var gate = SB.on && !ui.user;
    var canType = joined && !gate;
    var timeline = (club || forming) ? '' : x.kind === 'season' ? weeksHtml(x.week) : '<div class="weeks trial"><div class="on"><b>' + x.day + '/7</b><span>' + esc(tf('tb.day', { n: x.day })) + '</span></div></div>';
    var join = plClubCard(x) + (joined || x.mentor || x.paid ? '' : '<section class="panel"><p class="subtitle">' + esc(t(club ? 'tb.clubLocked' : (forming ? 'tb.formingBody' : 'tb.preview'))) + '</p></section>') + ((x.mentor || x.paid) ? '<section class="panel"><p class="subtitle">' + esc(t(x.mentor ? 'tb.mentorInfo' : 'tb.paidInfo')) + '</p></section>' : '');
    var composer = !joined
      ? (club ? '<div class="composer"><a class="btn btn-primary" href="#/premium">' + esc(t('tb.clubUnlock')) + '</a></div>'
        : forming ? '<div class="composer"><button type="button" class="btn btn-primary" data-action="waitlist" data-id="' + x.id + '"' + (wl ? ' disabled' : '') + '>' + esc(t(wl ? 'tb.onList' : 'tb.waitlist')) + '</button></div>'
        : (!isBeta() && (x.mentor || x.paid)) ? '<div class="composer"><a class="btn btn-primary" href="#/wkrotce/' + x.id + '">' + esc(t(x.mentor ? 'tb.mentorCta' : 'tb.paidCta')) + '</a></div>'
        : '<div class="composer"><button type="button" class="btn btn-primary" data-action="join" data-id="' + x.id + '">' + esc(t('tb.joinBeta')) + '</button></div>')
      : (gate ? gateHtml() : '<form class="composer" data-form="msg" data-key="' + key + '">' + thintBtn() +
        '<input class="composer-input" name="text" type="text" autocomplete="off" maxlength="500" placeholder="' + esc(t('room.input')) + '" aria-label="' + esc(t('room.input')) + '">' +
        '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button></form>');
    var tab0 = 'chat';
    var promptH = promptCard(x, canType);
    var P1 = rhythmHtml(parts(new Date(), WARSAW).dow) + '<small class="xp-line">' + esc(xpLine()) + '</small>';
    var body = club ? P1 + warmHtml(x) + weeklyHtml() + eventsCard(x)
      : forming ? benefitsHtml(x) + P1 + membersHtml(x, false)
      : stayHtml(x, joined) + benefitsHtml(x) + rewardHtml(x, joined) + P1 + warmHtml(x) + weeklyHtml() + (isPractical(x) ? eventsCard(x) : liveCard(x, joined)) + membersHtml(x, joined);
    var html = '<main class="screen" id="view" tabindex="-1" data-tdtab="' + tab0 + '"><header class="chathead">' +
      '<div class="topbar"><a class="icon-btn" href="' + (club ? '#/wydarzenia/kluby' : '#/stoliki') + '" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + clubEmo(x) + esc(L(x.name)) + '</h1><span class="subtitle">' + esc(O(x.name)) + ' · ' + esc(L(x.level)) + '</span></div>' +
      '<span class="tag tag-' + x.kind + '">' + esc(kindTag(x)) + '</span></div>' +
      '<div class="tabs tdtabs">' +
      '<button type="button" class="tab" data-action="tdtab" data-tab="chat" aria-pressed="' + (tab0 === 'chat') + '">' + esc(t('tb.tabChat')) + '<span class="tdtab-dot" hidden aria-hidden="true"></span></button>' +
      '<button type="button" class="tab" data-action="tdtab" data-tab="info" aria-pressed="' + (tab0 === 'info') + '">' + esc(t('tb.tabInfo')) + '</button></div>' +
      '</header>' +
      '<div class="chatbody" id="chatbody"><div class="content tdc" data-pane="info">' + (CFG.demo ? '<div class="strip strip-flat">' + esc(t('demo.tables')) + '</div>' : '') + join + timeline + body +
      (joined && !club ? '<button type="button" class="btn btn-ghost btn-sm" data-action="leave" data-id="' + x.id + '">' + esc(t('tb.leave')) + '</button>' : '') + '</div>' +
      messagesBlock(key) + '</div>' +
      (canType ? '<div class="tdprompt-body" id="tprompt" hidden>' + promptH + '</div>' : '<details class="tdprompt tdprompt-low"><summary><span class="tdsum">' + mascot('kotek', 'm-sum') + esc(t('tb.promptToggle')) + '</span></summary><div class="tdprompt-body">' + promptH + '</div></details>') + composer + '</main>';
    show(html, L(x.name), { bottom: tab0 === 'chat' });
    if (SB.on && ui.user) Live.attach(key);
  }

  /* XP za odpowiedź przy stoliku: min. 4 słowa, 3 nagradzane wpisy dziennie (10, 4, 2), bonus +5 za pytanie do stolika */
  function awardTable(text) {
    if (text.split(/\s+/).filter(Boolean).length < 4) return;
    var d = load('tblXp', { day: '', n: 0, bonus: false, cap: false });
    if (d.day !== dayKey()) d = { day: dayKey(), n: 0, bonus: false, cap: false };
    if (d.n >= 3) { if (!d.cap) { d.cap = true; toast(t('xp.cap')); } save('tblXp', d); return; }
    var base = [10, 4, 2][d.n], bonus = 0;
    if (!d.bonus && /[?？]/.test(text)) { bonus = 5; d.bonus = true; }
    d.n++;
    save('tblXp', d);
    save('tblXpTotal', load('tblXpTotal', 0) + base + bonus);
    Prog.award(base + bonus, d.n === 1 ? 1 : 0);
    toast(bonus ? tf('xp.earnedBonus', { n: base + bonus }) : tf('xp.earned', { n: base }));
    var xl = document.querySelector('.xp-line'); if (xl) { xl.classList.add('done'); xl.textContent = tf('xp.today', { n: d.n }); }
  }

  /* kalendarz z przypomnieniami 24 h i 1 h przed rozmową stolika */
  function downloadRsvpIcs(id) {
    var x = tableOf(id), rs = load('rsvp', {})[id];
    if (!x || !rs || !D.liveOpts[rs.i]) return;
    var slot = liveSlot(D.liveOpts[rs.i]);
    function f(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function e2(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
    function alarm(trig) { return ['BEGIN:VALARM', 'TRIGGER:' + trig, 'ACTION:DISPLAY', 'DESCRIPTION:' + e2(x.name.pl + ' / ' + x.name.ko), 'END:VALARM']; }
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Korean Cafe Online//PL', 'BEGIN:VEVENT',
      'UID:table-' + x.id + '-' + f(slot.start) + '@koreancafeonline', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(slot.start), 'DTEND:' + f(slot.end),
      'SUMMARY:' + e2(x.name.pl + ' / ' + x.name.ko + ' (live)'), 'DESCRIPTION:' + e2(t('lv.sub'))]
      .concat(alarm('-P1D'), alarm('-PT1H'), ['END:VEVENT', 'END:VCALENDAR']);
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'stolik-' + x.id + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- Sala live ---------- */
  function viewHall() {
    var now = new Date(), rs = load('rsvp', {});
    var mine = Object.keys(rs).map(function (id) {
      var x = tableOf(id), o = x && D.liveOpts[rs[id].i];
      return o ? { x: x, slot: liveSlot(o) } : null;
    }).filter(Boolean).sort(function (a, b) { return a.slot.start - b.slot.start; });
    var mineHtml = mine.length ? '<div class="list">' + mine.map(function (m) {
      return '<div class="row"><span class="badge-sq" aria-hidden="true">' + emo(m.x.hobbyId === 'kpop-dance' ? 'kpop-taniec' : 'cup') + '</span><span class="row-text"><span class="row-time">' + esc(whenText(m.slot.start, now)) + '</span><strong>' + esc(L(m.x.name)) + '</strong></span>' +
        '<button type="button" class="chip-btn" data-action="rsvp-ics" data-id="' + m.x.id + '">' + esc(t('lv.ics')) + '</button></div>';
    }).join('') + '</div>' : '<div class="dashed">' + esc(t('hall.noMine')) + '</div><a class="btn btn-ghost btn-sm" href="#/stoliki">' + esc(t('hall.toTables')) + '</a>';
    var times = ['10:00', '11:00', '12:30'].map(function (tm) {
      var sl = nextSlot({ time: tm, dow: [6], dur: D.liveDur }, now);
      return '<li>' + esc(whenText(sl.start, now)) + '</li>';
    }).join('');
    var sched = D.rooms.filter(function (r) { return !r.always; }).map(function (r) { return { r: r, slot: nextSlot(r, now) }; })
      .filter(function (x) { return x.slot; }).sort(function (a, b) { return a.slot.start - b.slot.start; });
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('hall.title')) + '</h1><p class="subtitle">' + esc(t('hall.sub')) + '</p></div>' + mascot('mandu', 'm-head') + '</div>' +
      '<section class="pcard"><span class="label-caps">' + esc(t('hall.ritual')) + '</span><ul class="ritual">' + times + '</ul><p class="ptr">' + esc(t('hall.why')) + '</p></section>' +
      '<h2 class="section-title">' + esc(t('hall.mine')) + '</h2>' + mineHtml +
      (sched.length ? '<h2 class="section-title">' + esc(t('hall.sched')) + '</h2><div class="list">' + sched.map(function (x) { return roomRowScheduled(x, now); }).join('') + '</div>' : '') +
      '<a class="btn btn-ghost btn-sm" href="#/wydarzenia">' + esc(t('hall.events')) + '</a></div>' + nav('hall') + '</main>';
    show(html, t('hall.title'));
  }

  /* ---------- router ---------- */
  function route() {
    if (SB.on) Live.detach();
    var hash = currentHash();
    renderedHash = hash;
    mgRoute(hash);
    var seg = hash.slice(1).split('/').filter(Boolean);
    var name = seg[0] || '';
    // Logowanie obowiązkowe: bez konta widać tylko ekrany logowania, rejestracji i resetu hasła.
    if (SB.on && !ui.user && name !== 'logowanie' && name !== 'nowe-haslo') { navigate('#/logowanie', true); return; }
    if (name === '') { navigate(homeHash(), true); return; }
    if (name !== '' && name !== 'nowe-haslo' && ui.recovery && ui.user) { navigate('#/nowe-haslo', true); return; }
    switch (name) {
      case 'kawiarnia': return viewLobby(seg[1] === 'live' ? 'live' : 'chats');
      case 'lada': return viewLada();
      case 'stoliki': return viewTables();
      case 'dopasowanie': return viewMatch();
      case 'stolik': return viewTable(seg[1]);
      case 'sala': navigate('#/wydarzenia', true); return;
      case 'czat': return viewChat(seg[1]);
      case 'room': return viewRoom(seg[1]);
      case 'cwiczenia': return seg[1] === 'rozmowa' ? viewPartner(seg[2]) : seg[1] === 'barista' ? viewBarista() : seg[1] === 'sciezka' ? kPath() : seg[1] === 'lekcja' ? viewLesson(seg[2], seg[3]) : seg[1] ? viewPracticeRoom(seg[1]) : viewPractice();
      case 'wydarzenia': return viewEvents(seg[1] === 'premium' ? 'premium' : (seg[1] === 'kluby' ? 'clubs' : 'live'));
      case 'beta':
        if (seg[1] === 'kawa-beta') { save('beta', true); toast(t('beta.toast')); navigate('#/kawiarnia', true); return; }
        return notFound('room.notFound');
      case 'wkrotce': return viewSoon(seg[1]);
      case 'premium': return viewPremium();
      case 'profil': return viewProfile();
      case 'logowanie': return viewAuth(seg[1] === 'rejestracja' ? 'register' : (seg[1] === 'reset' ? 'reset' : 'login'));
      case 'nowe-haslo': return viewAuth('newpass');
      default: navigate(homeHash(), true);
    }
  }

  /* ---------- Kotek-przewodnik (MascotGuide): kiedy i co mówi ---------- */
  var MG = window.MascotGuide;
  var mgFirst = true;
  function mgIsQ(s) { return s.t === 'choice' || s.t === 'scene' || s.t === 'build'; }
  function mgQHint(s) { return t(s.t === 'build' ? 'mg.q.build' : s.t === 'scene' ? 'mg.q.scene' : 'mg.q.choice'); }
  function mgTour() {
    MG.tour([
      { state: 'announcement', message: t('mg.tour1') },
      { state: 'explanation', message: t('mg.tour2'), target: '.nav a[href="#/cwiczenia"]' },
      { state: 'encouragement', message: t('mg.tour3'), actions: [
        { label: t('mg.dockYes'), primary: true, onClick: function () { MG.setPersistent(true); } },
        { label: t('mg.dockNo') }
      ] }
    ]);
  }
  /* podpowiedź na życzenie (dotknięcie przycisku Kotka): zależy od tego, co użytkownik właśnie robi */
  function mgContext() {
    var h = currentHash(), K = ui.k;
    if (K && h.indexOf('#/cwiczenia/lekcja/') === 0) {
      if (K.res) return { state: 'encouragement', message: t('mg.lessonDone') };
      var s = K.steps[K.i];
      if (K.fb) return K.fb.ok ? { state: 'success', message: t('mg.pOk') } : { state: 'correction', message: t('mg.oops1') };
      if (mgIsQ(s)) return { state: 'hint', message: mgQHint(s) };
      if (s.t === 'grammar') return { state: 'explanation', message: t('mg.grammar'), target: '.k-formula' };
      if (s.t === 'learn') return { state: 'explanation', message: t('mg.words') };
      return { state: 'announcement', message: tf('mg.lessonStart', { t: K.ls.title }) };
    }
    if (h === '#/cwiczenia') return { state: 'explanation', message: t('mg.practiceHub') };
    if (h.indexOf('#/cwiczenia/sciezka') === 0) return { state: 'explanation', message: t('mg.path') };
    return null;
  }
  function mgRoute(hash) {
    MG.onRoute(hash);
    clearTimeout(mgRoute._t);
    mgRoute._t = setTimeout(function () {
      if (renderedHash !== hash) return;
      if (mgFirst) {
        mgFirst = false;
        if (hash === '#/kawiarnia' && !ui.user) {
          var nm = load('name', '');
          MG.show({ state: 'welcome', once: 'welcome', size: 'lg',
            message: nm ? tf('mg.welcomeN', { n: nm }) : t('mg.welcome'),
            actions: [{ label: t('mg.tourYes'), primary: true, onClick: mgTour }, { label: t('mg.tourNo') }] });
          return;
        }
      }
      if (hash === '#/cwiczenia') MG.show({ state: 'explanation', once: 'hub', message: t('mg.practiceHub'), duration: 12000 });
      else if (hash === '#/cwiczenia/sciezka') MG.show({ state: 'explanation', once: 'path', message: t('mg.path'), duration: 12000 });
    }, 700);
  }
  function mgIdle() {
    var K = ui.k;
    if (!K || K.res || K.fb) return;
    var s = K.steps[K.i];
    if (mgIsQ(s)) MG.show({ state: 'hint', message: mgQHint(s), duration: 12000 });
  }
  function mgLesson() {
    var K = ui.k;
    if (!K || currentHash().indexOf('#/cwiczenia/lekcja/') !== 0) return;
    var key = K.res ? 'res' : K.i + (K.fb ? (K.fb.ok ? 'o' : 'x') : '');
    var same = K._mg === key;
    K._mg = key;
    if (K.res) {
      var done = K_ORDER.filter(function (id) { return kStars(id); }).length;
      if (!K.mode && done === 1) MG.show({ replace: true, state: 'success', message: t('mg.firstDone'), duration: 9000 });
      else if (K.res.perfect) MG.show({ replace: true, state: 'success', message: t('mg.perfect'), duration: 9000 });
      else MG.show({ replace: true, state: 'encouragement', message: t('mg.lessonDone'), duration: 9000 });
      return;
    }
    var s = K.steps[K.i];
    if (same) {                                    // ta sama chwila (np. dołożony klocek): tylko odnawiamy licznik bezczynności
      if (mgIsQ(s) && !K.fb) MG.schedule({ state: 'hint', message: mgQHint(s), duration: 12000 }, 15000);
      return;
    }
    MG.cancelScheduled();
    var o = null;
    if (K.fb) {
      if (K.fb.ok) {
        K._run = 0;
        if (K.combo === 3 || K.combo === 5 || K.combo === 8) o = { state: 'success', message: tf('mg.combo', { n: K.combo }), duration: 3200 };
      } else {
        K._run = (K._run || 0) + 1;
        if (K._run >= 2) o = { state: 'encouragement', message: t('mg.keepGoing'), duration: 6500 };
        else if (K.mistakes === 1) o = { state: 'correction', message: t('mg.oops1'), duration: 7500 };
      }
    } else if (s.t === 'story') {
      if (!K.mode) o = { state: 'announcement', message: tf('mg.lessonStart', { t: K.ls.title }), duration: 9000 };
    } else if (s.t === 'learn') {
      if (s.n === 1) o = { state: 'explanation', message: t('mg.words'), duration: 11000 };
    } else if (s.t === 'grammar') {
      o = { state: 'explanation', message: t('mg.grammar'), duration: 12000, target: '.k-formula' };
    } else if (mgIsQ(s)) {
      if (!K._q) { K._q = true; o = { state: 'explanation', message: mgQHint(s), duration: 12000 }; }
      else MG.schedule({ state: 'hint', message: mgQHint(s), duration: 12000 }, 15000);
    }
    if (o) { o.replace = true; MG.show(o); } else MG.hide('step');
  }
  function mgPractice() {
    var r = ui.mgP; ui.mgP = null;
    if (!r) return;
    if (r === 'bad') MG.show({ replace: true, state: 'correction', message: t('mg.pWrong'), duration: 7000 });
    else if (r === 'done') MG.show({ replace: true, state: 'success', message: t('mg.pDone'), duration: 5000 });
    else MG.show({ replace: true, state: 'success', message: t('mg.pOk'), duration: 1800, size: 'sm' });
  }
  MG.configure({
    t: t,
    enabled: function () { return load('mgTips', true) !== false; },
    persistent: !!load('mgDock', false),
    onPersistent: function (v) { save('mgDock', v); },
    contextTip: mgContext
  });

  /* ---------- zdarzenia ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#/"]');
    if (link && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      navigate(link.getAttribute('href'));
      return;
    }
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');
    if (a === 'enter') {
      if (load('age18', false)) navigate(load('lada', null) ? '#/kawiarnia' : '#/lada');
    } else if (a === 'lang') {
      var nl = el.getAttribute('data-lang'); var prevLang = lang; lang = nl === 'ko' ? 'ko' : (nl === 'en' ? 'en' : 'pl');
      save('lang', lang);
      if ((prevLang === 'en') !== (lang === 'en')) { location.reload(); return; }
      ui.keepScroll = true;
      route();
      var again = document.querySelector('[data-action="lang"][data-lang="' + lang + '"]');
      if (again) again.focus();
    } else if (a === 'plan') {
      ui.plan = el.getAttribute('data-plan') === 'monthly' ? 'monthly' : 'yearly';
      ui.keepScroll = true;
      route();
      var pb = document.querySelector('[data-plan="' + ui.plan + '"]');
      if (pb) pb.focus();
    } else if (a === 'checkout') {
      checkout(el);
    } else if (a === 'reply') {
      var rb = el.closest('.bubble'), rf = document.querySelector('form.composer[data-form="msg"]');
      if (rb && rf) setReply(rf, { a: rb.getAttribute('data-a'), t: rb.getAttribute('data-t') });
    } else if (a === 'lobbylang') {
      var wl = el.getAttribute('data-l') === 'pl' ? 'pl' : 'ko';
      save('lobbyL', wl);
      ui.filters.lang = wl === 'pl' ? 'PL' : 'KR'; save('filters', ui.filters);
      route();
    } else if (a === 'tdtab') {
      var tm = document.getElementById('view'), tn = el.getAttribute('data-tab') === 'info' ? 'info' : 'chat';
      if (tm) {
        tm.setAttribute('data-tdtab', tn);
        Array.prototype.forEach.call(tm.querySelectorAll('.tdtabs .tab'), function (b) { b.setAttribute('aria-pressed', String(b === el)); });
        var tdot = tm.querySelector('.tdtab-dot'); if (tdot && tn === 'chat') tdot.hidden = true;
        var s1 = sc(); s1.scrollTop = tn === 'chat' ? s1.scrollHeight : 0;
      }
    } else if (a === 'fix') {
      var fb = el.closest('.bubble'), ff = document.querySelector('form.composer[data-form="msg"]');
      if (fb && ff) setReply(ff, { a: fb.getAttribute('data-a'), t: fb.getAttribute('data-t') }, 'fix');
    } else if (a === 'goto-reply') {
      var qb = el.closest('.bubble'), qa = el.querySelector('b'), qt = qa ? el.textContent.slice(qa.textContent.length) : '';
      var cur = qb ? qb.previousElementSibling : null, hit = null;
      while (cur) {
        if (cur.classList.contains('bubble') && replyClip(cur.getAttribute('data-a'), 30) === (qa ? qa.textContent : '') && (replyClip(cur.getAttribute('data-t'), 60) === qt || replyClip(cur.getAttribute('data-t'), 120) === qt)) { hit = cur; break; }
        cur = cur.previousElementSibling;
      }
      if (hit) {
        hit.scrollIntoView({ block: 'center', behavior: 'smooth' });
        hit.classList.remove('flash'); void hit.offsetWidth; hit.classList.add('flash');
      }
    } else if (a === 'reply-cancel') {
      clearReply();
      var rin = document.querySelector('form.composer[data-form="msg"] .composer-input'); if (rin) rin.focus({ preventScroll: true });
    } else if (a === 'mic') {
      ui.mic = !ui.mic;
      var wrap = document.getElementById('micWrap');
      if (wrap) { wrap.innerHTML = micHtml(); var nb = wrap.querySelector('button'); if (nb) nb.focus(); }
    } else if (a === 'p-pick') {
      var pr = findBy(D.practice, el.getAttribute('data-id'));
      var pi = +el.getAttribute('data-i'), pn = pr ? pProg(pr.id) : 0;
      if (pr && pn < pr.ex.length) {
        if (pi === pr.ex[pn].a) {
          ui.pWrong = null; pSet(pr.id, pn + 1);
          var last = pn + 1 >= pr.ex.length;
          Prog.award(last ? 7 : 2, last ? 3 : 1);
          if (last) toast(t('practice.done'));
          ui.mgP = last ? 'done' : 'ok';
        } else { ui.pWrong = pi; ui.mgP = 'bad'; }
        ui.keepScroll = false;
        route();
        mgPractice();
        var nb = document.querySelector('.popts .popt, .pdone .btn');
        if (nb) nb.focus({ preventScroll: true });
      }
    } else if (a === 'p-again') {
      ui.pWrong = null; pSet(el.getAttribute('data-id'), 0); route();
    } else if (a === 'pt-hint') {
      if (ui.pt && !ui.pt.done) { ptHint(); viewPartner(ui.pt.id); }
    } else if (a === 'pt-again') {
      ui.pt = ptNew(el.getAttribute('data-id')); viewPartner(ui.pt.id);
    } else if (a === 'k-tr') {
      if (ui.k) { ui.k.tr = !ui.k.tr; ui.keepScroll = true; kRender(); }
    } else if (a === 'k-next') {
      var K = ui.k; if (!K) return;
      K.i++; K.fb = null; K.ans = []; K.tr = false;
      if (K.i >= K.steps.length) kFinish(); else kRender();
    } else if (a === 'k-pick') {
      var K1 = ui.k; if (!K1 || K1.fb) return;
      var st1 = K1.steps[K1.i], oi = +el.getAttribute('data-i');
      K1.sel = oi; kGrade(!!st1.o[oi].ok, st1.ok);
    } else if (a === 'k-blk') {
      var K2 = ui.k; if (!K2 || K2.fb) return;
      var bi = +el.getAttribute('data-i'); if (K2.ans.indexOf(bi) < 0) { K2.ans.push(bi); ui.keepScroll = true; kRender(); }
    } else if (a === 'k-unblk') {
      var K3 = ui.k; if (!K3 || K3.fb) return;
      var ub = +el.getAttribute('data-i'); K3.ans = K3.ans.filter(function (x) { return x !== ub; }); ui.keepScroll = true; kRender();
    } else if (a === 'k-check') {
      var K4 = ui.k; if (!K4 || K4.fb || !K4.ans.length) return;
      var st4 = K4.steps[K4.i];
      kGrade(K4.ans.map(function (x) { return st4.b[x]; }).join('|') === st4.a.join('|'), st4.ok);
    } else if (a === 'k-again') {
      if (ui.k) { var m0 = ui.k.mode, i0 = ui.k.id; ui.k = kOpen(i0, m0); kRender(); }
    } else if (a === 'mg-tips-toggle') {
      save('mgTips', load('mgTips', true) === false); if (load('mgTips', true) === false) MG.hide('api'); ui.keepScroll = true; route();
    } else if (a === 'mg-dock-toggle') {
      MG.setPersistent(!MG.isPersistent()); ui.keepScroll = true; route();
    } else if (a === 'say') {
      try {
        var u = new SpeechSynthesisUtterance(el.getAttribute('data-text')); u.lang = 'ko-KR'; u.rate = .9;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      } catch (err) { /* brak syntezy mowy w tej przeglądarce */ }
    } else if (a === 'thint') {
      var tpr = document.getElementById('tprompt');
      if (tpr) { tpr.hidden = !tpr.hidden; el.setAttribute('aria-expanded', String(!tpr.hidden)); }
    } else if (a === 'tb-lvl') {
      ui.tbLvl = el.getAttribute('data-v') || ''; ui.keepScroll = true; viewTables();
    } else if (a === 'lada-dir') {
      ladaState().dir = el.getAttribute('data-v'); viewLada();
    } else if (a === 'lada-lvl') {
      ladaState().level = el.getAttribute('data-v'); viewLada();
    } else if (a === 'lada-hob' || a === 'lada-slot') {
      var ls = ladaState(), arr = a === 'lada-hob' ? ls.hobbies : ls.slots, hv = el.getAttribute('data-v'), hi = arr.indexOf(hv);
      if (hi >= 0) arr.splice(hi, 1); else arr.push(hv);
      ui.keepScroll = true; viewLada();
    } else if (a === 'lada-done') {
      var ld = ladaState();
      if (!ld.dir || !ld.level) { toast(t('lada.need')); return; }
      ld.done = true; ld.at = Date.now(); save('lada', ld); save('level', ld.level); Prog.push(true);
      if (ui.ladaEdit) { ui.lada = null; toast(t('lada.saved')); navigate('#/profil'); return; }
      var tbs = load('tables', {}), best = null;
      D.tables.forEach(function (x) {
        if (x.kind !== 'trial' || x.members.length >= x.seats) return;
        if (!best || tScore(x) > tScore(best)) best = x;
      });
      if (best && tScore(best) > 0 && !joinedTables().length) {
        tbs[best.id] = { joined: true, at: dayKey(), auto: true }; save('tables', tbs);
        toast(tf('lada.assigned', { n: L(best.name) }));
      }
      navigate('#/dopasowanie');
    } else if (a === 'soon-wl') {
      var sm = load('waitlist', {}); sm[el.getAttribute('data-id')] = true; save('waitlist', sm);
      toast(t('soon.toast')); ui.keepScroll = true; viewSoon(el.getAttribute('data-id'));
    } else if (a === 'waitlist') {
      var wm = load('waitlist', {}); wm[el.getAttribute('data-id')] = true; save('waitlist', wm);
      toast(t('tb.waitlistToast')); ui.keepScroll = true; viewTable(el.getAttribute('data-id'));
    } else if (a === 'join') {
      var jt = tableOf(el.getAttribute('data-id'));
      if (!jt) return;
      var demoSeason = jt.kind === 'season' && !isPremium() && CFG.demo;
      if (jt.kind === 'season' && !isPremium() && !CFG.demo) { navigate('#/premium'); return; }
      var jm = load('tables', {});
      if (jt.kind === 'trial' && D.tables.some(function (o) { return o.id !== jt.id && o.kind === 'trial' && jm[o.id] && jm[o.id].joined; })) { toast(t('tb.oneTrial')); return; }
      jm[jt.id] = { joined: true, at: dayKey() }; save('tables', jm);
      toast(t(demoSeason ? 'tb.demoSeason' : 'tb.joinedToast')); viewTable(jt.id);
    } else if (a === 'leave') {
      var lm = load('tables', {}); delete lm[el.getAttribute('data-id')]; save('tables', lm);
      viewTable(el.getAttribute('data-id'));
    } else if (a === 'rsvp') {
      var rm = load('rsvp', {}); rm[el.getAttribute('data-id')] = { i: +el.getAttribute('data-i'), at: dayKey() }; save('rsvp', rm);
      ui.keepScroll = true; viewTable(el.getAttribute('data-id'));
    } else if (a === 'rsvp-clear') {
      var cm = load('rsvp', {}); delete cm[el.getAttribute('data-id')]; save('rsvp', cm);
      ui.keepScroll = true; viewTable(el.getAttribute('data-id'));
    } else if (a === 'rsvp-ics') {
      downloadRsvpIcs(el.getAttribute('data-id'));
    } else if (a === 'freeze') {
      var fz = freezeState();
      if (fz.n > 0 && !frozenThisWeek()) { fz.n--; fz.w = dayKey(weekStart()); save('freeze', fz); toast(t('wr.frozenToast')); ui.keepScroll = true; route(); }
    } else if (a === 'voice') {
      toast(t('pr.voiceSoon'));
    } else if (a === 'starter') {
      var inp = document.querySelector('.composer-input');
      if (inp) { inp.value = el.getAttribute('data-text'); inp.focus(); }
    } else if (a === 'next-q') {
      advancePrompt(el.getAttribute('data-ch'), true);
    } else if (a === 'filters-toggle') {
      var fb = document.getElementById('filters'); if (fb) { fb.hidden = !fb.hidden; el.setAttribute('aria-expanded', String(!fb.hidden)); }
    } else if (a === 'hint-toggle') {
      var hid = el.getAttribute('data-ch'), q = document.getElementById('qprompt');
      ui.hintOpen = ui.hintOpen || {};
      ui.hintOpen[hid] = !ui.hintOpen[hid];
      if (q) { q.hidden = !ui.hintOpen[hid]; if (!q.hidden) { try { sc().scrollTo({ top: sc().scrollHeight, behavior: 'smooth' }); } catch (err) { /* stary przeglądarkowy scroll */ } } }
      el.setAttribute('aria-expanded', String(ui.hintOpen[hid]));
    } else if (a === 'bar-hint') {
      var bi = document.querySelector('.composer-input');
      if (bi) { bi.value = el.getAttribute('data-text'); bi.focus(); }
    } else if (a === 'bar-again') {
      ui.bar = null; viewBarista();
    } else if (a === 'ics') {
      downloadIcs(el.getAttribute('data-id'));
    } else if (a === 'beta-toggle') {
      var bt = !isBeta(); save('beta', bt); toast(t(bt ? 'profile.betaOn' : 'profile.betaOff')); ui.keepScroll = true; route();
    } else if (a === 'premium-demo') {
      var pd = !load('demoPremium', false); save('demoPremium', pd); toast(t(pd ? 'profile.premiumDemoOn' : 'profile.premiumDemoOff')); ui.keepScroll = true; route();
    } else if (a === 'reset-ask') {
      ui.resetAsk = true; ui.keepScroll = true; route();
    } else if (a === 'reset-cancel') {
      ui.resetAsk = false; ui.keepScroll = true; route();
    } else if (a === 'reset-demo') {
      ui.resetAsk = false;
      var keep = load('lang', 'pl');
      Object.keys(mem).forEach(function (k) { delete mem[k]; });
      try {
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf('kco.') === 0) localStorage.removeItem(k); });
      } catch (e2) { /* brak dostępu do pamięci przeglądarki */ }
      save('lang', keep);
      ui.lada = null; ui.pt = null; ui.k = null; ui.hintOpen = {}; ui.qi = {};
      ui.filters = { lang: 'all', level: 'all', topic: 'all', age: 'all' };
      toast(t('profile.resetDone'));
      navigate('#/lada');
    } else if (a === 'portal') {
      if (CFG.portalUrl) window.location.href = CFG.portalUrl;
      else toast(t('profile.manageNone'));
    } else if ((a === 'login' || a === 'register') && SB.on) {
      ui.returnTo = currentHash();
      navigate(a === 'login' ? '#/logowanie' : '#/logowanie/rejestracja');
    } else if (a === 'logout' && SB.on) {
      Auth.logout().then(function () { toast(t('profile.loggedOut')); });
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'age18') {
      save('age18', el.checked);
      var b = document.getElementById('enter');
      if (b) b.disabled = !el.checked;
    } else if (el.hasAttribute && el.hasAttribute('data-filter')) {
      var name = el.getAttribute('data-filter');
      ui.filters[name] = el.value;
      save('filters', ui.filters);
      ui.keepScroll = true;
      route();
      var again = document.querySelector('[data-filter="' + name + '"]');
      if (again) again.focus();
    } else if (el.getAttribute && el.getAttribute('data-pref') === 'level') {
      save('level', el.value);
      var pl = load('lada', null);
      if (pl && pl.done && el.value && /^(A1|A2|B1|B2|C1)$/.test(el.value)) { pl.level = el.value; pl.at = Date.now(); save('lada', pl); ui.lada = null; Prog.push(true); }
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    var pref = el.getAttribute && el.getAttribute('data-pref');
    if (pref === 'name') save('name', el.value.trim().slice(0, 30));
    else if (pref === 'city') save('city', el.value.trim().slice(0, 40));
    else if (pref === 'interests') save('interests', el.value.trim().slice(0, 80));
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.getAttribute('data-form') === 'soon') {
      e.preventDefault();
      var em = (form.elements.email.value || '').trim(), pr = form.elements.price.value, sid = form.getAttribute('data-id'), lv = form.elements.level.value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) || !lv || !form.elements.consent.checked) { form.querySelector('.soon-err').hidden = false; return; }
      var fp = new URLSearchParams();
      fp.append('entry.1001231479', em); fp.append('entry.376811799', S[pr][0]); fp.append('entry.648865449', sid);
      fp.append('entry.1813474870', S[lv][0]);
      Array.prototype.forEach.call(form.querySelectorAll('input[name=practice]:checked'), function (c) { fp.append('entry.1674084296', S[c.value][0]); });
      fp.append('entry.112658128', S['soon.consent'][0]);
      try { fetch('https://docs.google.com/forms/d/e/1FAIpQLSfg4nVk8Bpz822cKjwcb_XlLaWqxv_CdsETACaoDEAvLDTSqg/formResponse', { method: 'POST', mode: 'no-cors', body: fp }).catch(function () {}); } catch (err) {}
      var wm = load('waitlist', {}); wm[sid] = true; save('waitlist', wm);
      toast(t('soon.toast')); ui.keepScroll = true; viewSoon(sid);
      return;
    }
    if (form.getAttribute('data-form') === 'auth') {
      e.preventDefault();
      if (SB.on) submitAuth(form);
      return;
    }
    if (form.getAttribute('data-form') === 'partner') {
      e.preventDefault();
      var pt = form.elements.text.value.trim();
      if (!pt || !ui.pt || ui.pt.done) return;
      ptSend(pt);
      viewPartner(ui.pt.id);
      var pin = document.querySelector('.composer-input'); if (pin) pin.focus({ preventScroll: true });
      return;
    }
    if (form.getAttribute('data-form') === 'barista') {
      e.preventDefault();
      var bt = form.elements.text.value.trim();
      if (!bt || !ui.bar || ui.bar.finished) return;
      barReply(bt);
      ui.barFocus = true;
      viewBarista();
      return;
    }
    if (form.getAttribute('data-form') !== 'msg') return;
    e.preventDefault();
    var input = form.elements.text;
    var text = input.value.trim();
    if (!text) return;
    var key = form.getAttribute('data-key');
    var chId = key.indexOf('chat:') === 0 ? key.slice(5) : '';
    var rep = (ui.reply && ui.reply.key === key && form.classList.contains('has-reply')) ? { a: ui.reply.a, t: ui.reply.t, fix: !!ui.reply.fix } : null;
    if (rep && rep.fix) { var wi = form.querySelector('.reply-why'); rep.why = wi ? replyClip(wi.value, 100) : ''; }
    if (rep && rep.fix && text === String(ui.reply.full || '').trim()) { toast(t('chat.fixSame')); return; }
    if (rep) text = text.slice(0, 500 - replyOverhead(rep));
    if (SB.on) {
      if (!ui.user) return;
      var sendBtn = form.querySelector('button[type="submit"]');
      sendBtn.disabled = true;
      Live.send(key, packReply(text, rep)).then(function (row) {
        input.value = '';
        clearReply();
        Live.add(row, true);
        if (!(rep && rep.fix)) awardDaily(key, text);
        advancePrompt(chId);
      }).catch(function (err) {
        toast(t(err && err.code === 'P0001' ? 'chat.sendFast' : 'chat.sendError'));
      }).then(function () {
        sendBtn.disabled = false;
        input.focus();
      });
      return;
    }
    var box = document.getElementById('messages');
    var wasEmpty = Chat.history(key).length === 0;
    var msg = Chat.send(key, text, rep);
    clearReply();
    if (!(rep && rep.fix)) awardDaily(key, text);
    if (wasEmpty) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', msgHtml(msg));
    input.value = '';
    advancePrompt(chId);
    sc().scrollTop = sc().scrollHeight;
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('data-action') === 'goto-reply') { e.preventDefault(); e.target.click(); }
  });

  window.addEventListener('hashchange', function () {
    if (memHash === null && location.hash === renderedHash) return; // ten widok już narysowany
    memHash = null;
    route();
  });

  /* ---------- start ---------- */
  if (SB.on) {
    // Po kliknięciu linku z e-maila adres wraca z parametrem ?code=... (biblioteka sama go wymienia na sesję).
    var cleanAuthUrl = function () {
      var q = new URLSearchParams(window.location.search);
      if (q.get('error_code') || q.get('error_description')) toast(t('auth.err.link'));
      if (q.has('code') || q.has('error') || q.has('error_code') || q.has('error_description')) {
        try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch (e) { /* ignore */ }
      }
    };
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      ui.authReady = true;
      cleanAuthUrl();
      route();
    };
    SB.client.auth.onAuthStateChange(function (event, session) {
      var u = session && session.user ? { id: session.user.id, email: session.user.email || '' } : null;
      var changed = (u ? u.id : null) !== (ui.user ? ui.user.id : null);
      ui.user = u;
      if (event === 'PASSWORD_RECOVERY') ui.recovery = true;
      if (event === 'SIGNED_OUT') ui.recovery = false;
      if (changed && u) setTimeout(function () { Prog.pull(); }, 0);
      if (!ui.authReady) return;
      // Wywołania po stronie Supabase wolno robić dopiero poza tą funkcją, dlatego setTimeout.
      if (event === 'PASSWORD_RECOVERY') setTimeout(function () { navigate('#/nowe-haslo'); }, 0);
      else if (changed) setTimeout(route, 0);
    });
    SB.client.auth.getSession().then(function (r) {
      var s = r && r.data && r.data.session;
      if (s && s.user && !ui.user) ui.user = { id: s.user.id, email: s.user.email || '' };
      start();
      Prog.pull();
    }, start);
    setTimeout(start, 4000); // zapas: gdyby sprawdzanie sesji się zawiesiło, strona i tak się pokaże
  } else {
    route();
  }
})();

/* klawiatura na telefonie: pole pisania nad klawiatura */
(function () {
  var vv = window.visualViewport;
  if (!vv) return;
  function fit() {
    var kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--kb', (-kb) + 'px');
  }
  vv.addEventListener('resize', fit);
  vv.addEventListener('scroll', fit);
})();

