(function () {
  'use strict';

  var CFG = window.KCO_CONFIG;
  var D = window.KCO_DATA;
  var S = window.KCO_I18N;
  var app = document.getElementById('app');
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
  var lang = load('lang', (navigator.language || '').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'pl');
  var ui = {
    plan: 'yearly',
    mic: false,
    banner: null,
    keepScroll: false,
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
    return v[lang === 'ko' ? 1 : 0];
  }
  function tf(key, vars) {
    var s = t(key);
    Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function L(o) { return o[lang]; }
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
  function isPremium() { return !!CFG.devForcePremium; }
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
    send: '<path d="M4 12l16-8-6 16-3-7z"/>'
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
    return lang === 'ko' ? (p.m + '/' + p.d + ' (' + DAYS_KO[p.dow] + ')') : (DAYS_PL[p.dow] + ' ' + pad(p.d) + '.' + pad(p.m));
  }
  function whenText(date, now) {
    var plus = ymd(date, SEOUL) > ymd(date, WARSAW) ? ' +1' : '';
    return dayLabel(date, now) + ' ' + fmtTime(date, WARSAW) + ' PL · ' + fmtTime(date, SEOUL) + plus + ' KR';
  }

  /* ---------- usługa czatu (dziś: tylko lokalnie; tu podłączysz prawdziwy backend) ---------- */
  var Chat = {
    history: function (key) {
      var seeds = (CFG.demo && D.seeds[key]) || [];
      return seeds.concat(load('msgs.' + key, []));
    },
    send: function (key, text) {
      var d = new Date();
      var msg = { mine: true, text: text, time: pad(d.getHours()) + ':' + pad(d.getMinutes()) };
      var list = load('msgs.' + key, []);
      list.push(msg);
      save('msgs.' + key, list.slice(-100));
      return msg;
    }
  };

  /* ---------- czat na żywo (Supabase): historia z bazy + nowe wiadomości od razu ---------- */
  var Live = { token: 0, ids: {}, channel: null };
  var MSG_COLS = 'id,user_id,author,text,created_at';

  function msgTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var n = new Date();
    if (d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()) return hm;
    return (lang === 'ko' ? (d.getMonth() + 1) + '/' + d.getDate() : pad(d.getDate()) + '.' + pad(d.getMonth() + 1)) + ' ' + hm;
  }
  function rowToMsg(row) {
    return { mine: !!(ui.user && row.user_id === ui.user.id), author: row.author, time: msgTime(row.created_at), text: row.text };
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
    var near = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) < 160;
    var empty = box.querySelector('[data-empty]');
    if (empty) empty.parentNode.removeChild(empty);
    box.insertAdjacentHTML('beforeend', msgHtml(rowToMsg(row)));
    if (force || near) window.scrollTo(0, document.body.scrollHeight);
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
        if (loaded) Live.add(p['new']); else pending.push(p['new']);
      })
      .subscribe();
    SB.client.from('messages').select(MSG_COLS).eq('channel', key).order('created_at', { ascending: false }).limit(100)
      .then(function (r) {
        if (token !== Live.token) return;
        if (r.error) return fail();
        var rows = (r.data || []).slice().reverse();
        box.innerHTML = '<p class="day-sep" data-empty>' + esc(t('chat.empty')) + '</p>';
        rows.forEach(function (row) { Live.add(row); });
        loaded = true;
        pending.forEach(function (row) { Live.add(row); });
        window.scrollTo(0, document.body.scrollHeight);
      }, fail);
  };
  Live.send = function (key, text) {
    var author = (load('name', '') || t('profile.guest')).slice(0, 30);
    return SB.client.from('messages').insert({ channel: key, author: author, text: text }).select(MSG_COLS).single()
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

  /* ---------- widoki: części wspólne ---------- */
  var HERO = '<img class="hero-logo" src="img/logo.png" alt="" width="148" height="148">' +
    '<div class="hero-title" aria-hidden="true">KOREAN CAFÉ</div>' +
    '<span class="hero-script" aria-hidden="true">online</span>' +
    '<div class="hero-hearts" aria-hidden="true">♥ ♥ ♥</div>';

  function langSeg() {
    return '<div class="seg" role="group" aria-label="' + esc(t('profile.lang')) + '">' +
      '<button type="button" data-action="lang" data-lang="pl" aria-pressed="' + (lang === 'pl') + '">Polski</button>' +
      '<button type="button" data-action="lang" data-lang="ko" aria-pressed="' + (lang === 'ko') + '">한국어</button></div>';
  }
  function legalLine() {
    return '<p class="fine">' + esc(t('legal.pre')) + '<a href="regulamin.html">' + esc(t('legal.terms')) + '</a>' +
      esc(t('legal.and')) + '<a href="prywatnosc.html">' + esc(t('legal.privacy')) + '</a>' + esc(t('legal.post')) + '</p>';
  }
  function nav(active) {
    var items = [
      ['chats', '#/kawiarnia', 'cup', 'nav.cafe'],
      ['live', '#/kawiarnia/live', 'people', 'nav.rooms'],
      ['events', '#/wydarzenia', 'calendar', 'nav.events'],
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
    app.innerHTML = html;
    document.documentElement.lang = lang;
    document.title = title + ' · Korean Cafe Online';
    if (keep) return;
    window.scrollTo(0, opts.bottom ? document.body.scrollHeight : 0);
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
    var html = '<main class="screen welcome" id="view" tabindex="-1">' +
      '<div class="head"><div class="brand"><div class="brand-mark"><img src="img/logo-96.png" alt="" width="46" height="46"></div><div><span class="brand-name">Korean Cafe Online</span><span class="brand-sub">' + esc(t('brand.sub')) + '</span></div></div>' + langSeg() + '</div>' +
      '<div class="hero">' + HERO.replace('alt=""', 'alt="' + esc(t('welcome.heroAlt')) + '"') + '</div>' +
      '<div class="welcome-copy"><span class="eyebrow">' + esc(t('welcome.eyebrow')) + '</span><h1>' + esc(t('welcome.h1')) + '</h1><p>' + esc(t('welcome.body')) + '</p></div>' +
      '<div class="chips"><span class="chip">' + esc(t('welcome.c1')) + '</span><span class="chip">' + esc(t('welcome.c2')) + '</span><span class="chip">' + esc(t('welcome.c3')) + '</span></div>' +
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
    return '<div class="filters">' +
      selectChip('lang', t('f.lang'), [['all', t('f.all')], ['KR', t('f.kr')], ['PL', t('f.pl')]]) +
      selectChip('level', t('f.level'), [['all', t('f.all')], ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1']]) +
      selectChip('topic', t('f.topic'), [['all', t('f.all')], ['language', t('f.topic.language')], ['culture', t('f.topic.culture')], ['life', t('f.topic.life')], ['dance', t('f.topic.dance')]]) +
      selectChip('age', t('f.age'), [['all', t('f.all')], ['18-25', '18–25'], ['26-35', '26–35'], ['36+', '36+']]) +
      '</div>';
  }
  function lockHtml() { return '<span class="lock" aria-label="' + esc(t('lobby.premium')) + '">' + ico('lock', 18) + '</span>'; }
  function chatRow(c) {
    var locked = c.premium && !isPremium();
    return '<a class="row" href="' + (locked ? '#/premium' : '#/czat/' + c.id) + '">' +
      '<span class="badge-sq">' + esc(c.badge) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(c.name)) + '</strong><small>' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + ' · ' + esc(L(c.desc)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowAlways(r) {
    var locked = r.premium && !isPremium();
    return '<a class="row" href="' + (locked ? '#/premium' : '#/room/' + r.id) + '">' +
      '<span class="badge-sq">' + esc(r.badge) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(r.name)) + '</strong><small>' + esc(t('live.open247')) + ' · ' + esc(L(r.level)) + ' · ' + esc(tf('live.max', { n: r.seats })) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowScheduled(x, now) {
    var r = x.r, locked = r.premium && !isPremium();
    var when = x.slot.live ? '<span class="live-badge"><i></i>' + esc(t('live.now')) + '</span>' : '<span class="row-time">' + esc(whenText(x.slot.start, now)) + '</span>';
    return '<a class="row" href="' + (locked ? '#/premium' : '#/room/' + r.id) + '">' +
      '<span class="row-text">' + when + '<strong>' + esc(L(r.name)) + '</strong><small>' + esc(O(r.name)) + ' · ' + esc(L(r.level)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function viewLobby(tab) {
    var now = new Date();
    var body;
    if (tab === 'chats') {
      var chats = D.channels.filter(matches);
      body = chats.length ? '<div class="list">' + chats.map(chatRow).join('') + '</div>' : '<p class="empty">' + esc(t('lobby.empty')) + '</p>';
    } else {
      var always = D.rooms.filter(function (r) { return r.always && matches(r); });
      var sched = D.rooms.filter(function (r) { return !r.always && matches(r); }).map(function (r) { return { r: r, slot: nextSlot(r, now) }; })
        .filter(function (x) { return x.slot; }).sort(function (a, b) { return a.slot.start - b.slot.start; });
      body = '';
      if (always.length) body += '<h2 class="section-title">' + esc(t('live.always')) + '</h2><div class="list">' + always.map(roomRowAlways).join('') + '</div>';
      if (sched.length) body += '<h2 class="section-title">' + esc(t('live.scheduled')) + '</h2><div class="list">' + sched.map(function (x) { return roomRowScheduled(x, now); }).join('') + '</div>';
      if (!always.length && !sched.length) body = '<p class="empty">' + esc(t('lobby.empty')) + '</p>';
      body += '<div class="dashed">' + ico('plus', 18) + esc(t('live.ownSoon')) + '</div>';
    }
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><div><h1 class="title">' + esc(t('lobby.title')) + '</h1><p class="subtitle">' + esc(t('lobby.sub')) + '</p></div>' +
      '<a class="pill-link" href="#/premium">' + ico('crown', 16) + esc(t('lobby.premium')) + '</a></div>' +
      '<div class="tabs" role="navigation">' +
      '<a class="tab" href="#/kawiarnia"' + (tab === 'chats' ? ' aria-current="page"' : '') + '>' + esc(t('tab.chats')) + '</a>' +
      '<a class="tab" href="#/kawiarnia/live"' + (tab === 'live' ? ' aria-current="page"' : '') + '>' + esc(t('tab.live')) + '</a></div>' +
      filtersHtml() + body + '</div>' + nav(tab === 'chats' ? 'chats' : 'live') + '</main>';
    show(html, t('lobby.title'));
  }

  /* ---------- wiadomości ---------- */
  function msgHtml(m) {
    var author = m.author || (m.mine ? (load('name', '') || t('room.you')) : '');
    var meta = esc(author) + (m.city ? ' · ' + esc(m.city) : '') + (m.time ? ' ' + esc(m.time) : '');
    if (m.fix) {
      return '<div class="bubble bubble-fix"><span class="meta">' + esc(t('chat.fix')) + ' · ' + meta + '</span><span class="txt">' + esc(m.text) + '</span><span class="tr">' + esc(L(m.fix)) + '</span></div>';
    }
    var tr = '';
    if (!m.mine && m.lang && m.lang !== lang && m.tr && m.tr[lang]) tr = '<span class="tr">' + esc(m.tr[lang]) + '</span>';
    return '<div class="bubble ' + (m.mine ? 'bubble-out' : 'bubble-in') + '"><span class="meta">' + meta + '</span><span class="txt">' + esc(m.text) + '</span>' + tr + '</div>';
  }
  function messagesHtml(key) {
    var list = Chat.history(key);
    if (!list.length) return '<p class="day-sep">' + esc(t('chat.empty')) + '</p>';
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

  /* ---------- widok: czat tekstowy ---------- */
  function viewChat(id) {
    var c = findBy(D.channels, id);
    if (!c) return notFound('chat.notFound');
    if (c.premium && !isPremium()) { navigate('#/premium', true); return; }
    var key = 'chat:' + id;
    var html = '<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/kawiarnia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(c.name)) + '</h1><span class="subtitle">' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + '</span></div></div>' +
      '<div class="strip"><span>' + esc(L(c.rule)) + '</span><span class="tag">' + esc(t('chat.tr')) + '</span></div>' +
      (SB.on ? '<div class="strip">' + esc(t('chat.live')) + '</div>' : (CFG.demo ? '<div class="strip">' + esc(t('demo.chat')) + '</div>' : '')) +
      ((SB.on && !ui.user) ? gateHtml() : messagesBlock(key) +
      '<form class="composer" data-form="msg" data-key="' + key + '">' +
      '<input class="composer-input" name="text" type="text" autocomplete="off" maxlength="500" placeholder="' + esc(t('chat.input')) + '" aria-label="' + esc(t('chat.input')) + '">' +
      '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button></form>') + '</main>';
    show(html, L(c.name), { bottom: true });
    if (SB.on && ui.user) Live.attach(key);
  }

  /* ---------- widok: room na żywo ---------- */
  function micHtml() {
    return '<button type="button" class="mic-btn" data-action="mic" aria-pressed="' + ui.mic + '" aria-label="' + esc(ui.mic ? t('room.mic.on') : t('room.mic.off')) + '">' + ico(ui.mic ? 'mic' : 'micoff') + '</button>';
  }
  function viewRoom(id) {
    var r = findBy(D.rooms, id);
    if (!r) return notFound('room.notFound');
    if (r.premium && !isPremium()) { navigate('#/premium', true); return; }
    var now = new Date();
    var status;
    if (r.always) status = '<span class="live-badge"><i></i>' + esc(t('live.open247')) + '</span>';
    else {
      var slot = nextSlot(r, now);
      status = slot && slot.live ? '<span class="live-badge"><i></i>' + esc(t('live.now')) + '</span>' : '<span class="when">' + esc(slot ? whenText(slot.start, now) : '') + '</span>';
    }
    var name = load('name', '') || t('profile.guest');
    var seats = '<div class="seat"><span class="avatar avatar-you">' + esc(name.charAt(0).toUpperCase()) + '</span><span class="seat-name">' + esc(name) + '</span><span class="seat-role">' + esc(t('room.you')) + '</span></div>' +
      '<div class="seat"><span class="avatar avatar-empty">' + ico('crown', 22) + '</span><span class="seat-empty">' + esc(t('room.moderator')) + '</span></div>';
    for (var i = 2; i < r.seats; i++) {
      seats += '<div class="seat"><span class="avatar avatar-empty">' + ico('plus', 22) + '</span><span class="seat-empty">' + esc(t('room.free')) + '</span></div>';
    }
    var topic = r.topicCard ? '<div class="topic-card"><span class="label-caps">' + esc(t('room.topicLabel')) + '</span><strong>' + esc(L(r.topicCard.title)) + ' · ' + esc(O(r.topicCard.title)) + '</strong><p>' + esc(r.topicCard.ko) + '<br>' + esc(r.topicCard.pl) + '</p></div>' : '';
    var key = 'room:' + id;
    var html = '<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/kawiarnia/live" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(r.name)) + '</h1><span class="subtitle">' + esc(O(r.name)) + ' · ' + esc(L(r.level)) + '</span></div>' + status + '</div>' +
      '<div class="seats">' + seats + '</div>' + topic +
      '<div class="strip">' + esc(t('demo.voice')) + '</div>' +
      ((SB.on && !ui.user) ? gateHtml() : messagesBlock(key) +
      '<form class="composer" data-form="msg" data-key="' + key + '">' +
      '<input class="composer-input" name="text" type="text" autocomplete="off" maxlength="500" placeholder="' + esc(t('room.input')) + '" aria-label="' + esc(t('room.input')) + '">' +
      '<button class="icon-btn icon-btn-accent" type="submit" aria-label="' + esc(t('chat.send')) + '">' + ico('send', 22) + '</button>' +
      '<span id="micWrap">' + micHtml() + '</span></form>') + '</main>';
    show(html, L(r.name));
    if (SB.on && ui.user) Live.attach(key);
  }

  /* ---------- widok: wydarzenia ---------- */
  function viewEvents(filter) {
    var now = new Date();
    var list = D.events.filter(function (e) { return filter === 'all' || e.premium; })
      .map(function (e) { return { e: e, slot: nextSlot(e, now) }; })
      .filter(function (x) { return x.slot; }).sort(function (a, b) { return a.slot.start - b.slot.start; });
    var cards = list.map(function (x) {
      var e = x.e, locked = e.premium && !isPremium();
      return '<article class="card"><div class="card-head"><span class="when">' + esc(whenText(x.slot.start, now)) + '</span>' +
        '<span class="tag' + (e.premium ? ' tag-premium' : '') + '">' + esc(e.premium ? t('ev.premium') : t('ev.free')) + '</span></div>' +
        '<h2>' + esc(L(e.name)) + '</h2><p class="subtitle">' + esc(O(e.name)) + ' · ' + esc(L(e.format)) + '</p>' +
        (locked ? '<a class="btn btn-ghost btn-sm" href="#/premium">' + ico('lock', 16) + esc(t('ev.unlock')) + '</a>'
          : '<button type="button" class="btn btn-primary btn-sm" data-action="ics" data-id="' + e.id + '">' + esc(t('ev.addCal')) + '</button>') + '</article>';
    }).join('');
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="head"><h1 class="title">' + esc(t('ev.title')) + '</h1></div>' +
      '<div class="tabs"><a class="tab" href="#/wydarzenia"' + (filter === 'all' ? ' aria-current="page"' : '') + '>' + esc(t('ev.all')) + '</a>' +
      '<a class="tab" href="#/wydarzenia/premium"' + (filter === 'premium' ? ' aria-current="page"' : '') + '>' + esc(t('ev.premium')) + '</a></div>' +
      (cards || '<p class="empty">' + esc(t('ev.empty')) + '</p>') + '</div>' + nav('events') + '</main>';
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
      '<div class="paywall-head"><span class="eyebrow">' + esc(t('pay.eyebrow')) + '</span><h1>' + esc(t('pay.h1')) + '</h1><p>' + esc(t('pay.lead')) + '</p></div>' +
      (banner ? '<div style="margin-top:16px">' + banner + '</div>' : '') +
      '<div class="tabs" style="margin-top:22px">' +
      '<button type="button" class="tab" data-action="plan" data-plan="monthly" aria-pressed="' + !yearly + '">' + esc(t('pay.monthly')) + '</button>' +
      '<button type="button" class="tab" data-action="plan" data-plan="yearly" aria-pressed="' + yearly + '">' + esc(t('pay.yearly')) + ' · ' + esc(tf('pay.save', { n: money(save), cur: cur })) + '</button></div>' +
      '<div class="price-card"><div class="price-row"><span class="price">' + esc(priceStr) + '</span><span class="subtitle">' + esc(yearly ? t('pay.perYear') : t('pay.perMonth')) + '</span></div><span class="price-note">' + esc(note) + '</span></div>' +
      '<ul class="benefits">' + benefits + '</ul>' +
      '<div class="paywall-actions"><button type="button" class="btn btn-primary" data-action="checkout">' + esc(tf('pay.cta', { n: CFG.trialDays })) + '</button>' +
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
    if (mode !== 'newpass' && ui.user) { navigate('#/profil', true); return; }
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
    var back = mode === 'newpass' ? '#/kawiarnia' : '#/profil';
    var html = '<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="' + back + '" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(t('auth.title.' + mode)) + '</h1></div></div>' +
      '<div class="content"><p class="subtitle">' + esc(t('auth.lead.' + mode)) + '</p>' +
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
      var to = ui.returnTo || '#/kawiarnia';
      ui.returnTo = null;
      navigate(to);
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
  function viewProfile() {
    var name = load('name', '');
    var level = load('level', '');
    var levels = [['', t('profile.levelNone')], ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']];
    var html = '<main class="screen" id="view" tabindex="-1"><div class="content">' +
      '<div class="profile-head"><span class="avatar avatar-you">' + esc((name || t('profile.guest')).charAt(0).toUpperCase()) + '</span>' +
      '<div><h1 class="title">' + esc(name || t('profile.title')) + '</h1><p class="subtitle">' + esc(t('profile.plan')) + '</p></div></div>' +
      accountHtml() +
      '<a class="plan-card" href="#/premium"><span class="plan-icon">' + ico('crown', 22) + '</span>' +
      '<span class="row-text"><strong>' + esc(t('profile.plan')) + '</strong><small>' + esc(t('profile.planCta')) + '</small></span>' + ico('chevron', 20) + '</a>' +
      '<div><p class="label-caps" style="padding-bottom:4px">' + esc(t('profile.settings')) + '</p>' +
      '<div class="setting setting-col"><label for="name">' + esc(t('profile.name')) + '</label>' +
      '<input class="field" id="name" data-pref="name" type="text" maxlength="30" autocomplete="nickname" placeholder="' + esc(t('profile.namePh')) + '" value="' + esc(name) + '"></div>' +
      '<div class="setting"><span>' + esc(t('profile.lang')) + '</span>' + langSeg() + '</div>' +
      '<div class="setting setting-col"><label for="level">' + esc(t('profile.level')) + '</label>' +
      '<select class="field" id="level" data-pref="level">' + levels.map(function (o) { return '<option value="' + o[0] + '"' + (level === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>' +
      '<div class="setting"><button type="button" class="link-btn" data-action="portal"><span>' + esc(t('profile.manage')) + '</span>' + ico('chevron', 20) + '</button></div>' +
      '<div class="setting"><a class="link-btn" href="regulamin.html"><span>' + esc(t('legal.terms')) + '</span>' + ico('chevron', 20) + '</a></div>' +
      '<div class="setting"><a class="link-btn" href="prywatnosc.html"><span>' + esc(t('legal.privacyNom')) + '</span>' + ico('chevron', 20) + '</a></div></div>' +
      '<p class="notice">' + esc(t(SB.on ? 'profile.noteRemote' : 'demo.account')) + '</p></div>' + nav('profile') + '</main>';
    show(html, t('profile.title'));
  }

  /* ---------- router ---------- */
  function route() {
    if (SB.on) Live.detach();
    var hash = currentHash();
    renderedHash = hash;
    var seg = hash.slice(1).split('/').filter(Boolean);
    var name = seg[0] || '';
    if (name !== '' && !load('age18', false)) { navigate('#/', true); return; }
    if (name !== '' && name !== 'nowe-haslo' && ui.recovery && ui.user) { navigate('#/nowe-haslo', true); return; }
    switch (name) {
      case '': return viewWelcome();
      case 'kawiarnia': return viewLobby(seg[1] === 'live' ? 'live' : 'chats');
      case 'czat': return viewChat(seg[1]);
      case 'room': return viewRoom(seg[1]);
      case 'wydarzenia': return viewEvents(seg[1] === 'premium' ? 'premium' : 'all');
      case 'premium': return viewPremium();
      case 'profil': return viewProfile();
      case 'logowanie': return viewAuth(seg[1] === 'rejestracja' ? 'register' : (seg[1] === 'reset' ? 'reset' : 'login'));
      case 'nowe-haslo': return viewAuth('newpass');
      default: navigate('#/kawiarnia', true);
    }
  }

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
      if (load('age18', false)) navigate('#/kawiarnia');
    } else if (a === 'lang') {
      lang = el.getAttribute('data-lang') === 'ko' ? 'ko' : 'pl';
      save('lang', lang);
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
    } else if (a === 'mic') {
      ui.mic = !ui.mic;
      var wrap = document.getElementById('micWrap');
      if (wrap) { wrap.innerHTML = micHtml(); var nb = wrap.querySelector('button'); if (nb) nb.focus(); }
    } else if (a === 'ics') {
      downloadIcs(el.getAttribute('data-id'));
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
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute('data-pref') === 'name') save('name', el.value.trim().slice(0, 30));
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.getAttribute('data-form') === 'auth') {
      e.preventDefault();
      if (SB.on) submitAuth(form);
      return;
    }
    if (form.getAttribute('data-form') !== 'msg') return;
    e.preventDefault();
    var input = form.elements.text;
    var text = input.value.trim();
    if (!text) return;
    var key = form.getAttribute('data-key');
    if (SB.on) {
      if (!ui.user) return;
      var sendBtn = form.querySelector('button[type="submit"]');
      sendBtn.disabled = true;
      Live.send(key, text).then(function (row) {
        input.value = '';
        Live.add(row, true);
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
    var msg = Chat.send(key, text);
    if (wasEmpty) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', msgHtml(msg));
    input.value = '';
    window.scrollTo(0, document.body.scrollHeight);
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
      if (!ui.authReady) return;
      // Wywołania po stronie Supabase wolno robić dopiero poza tą funkcją, dlatego setTimeout.
      if (event === 'PASSWORD_RECOVERY') setTimeout(function () { navigate('#/nowe-haslo'); }, 0);
      else if (changed) setTimeout(route, 0);
    });
    SB.client.auth.getSession().then(function (r) {
      var s = r && r.data && r.data.session;
      if (s && s.user && !ui.user) ui.user = { id: s.user.id, email: s.user.email || '' };
      start();
    }, start);
    setTimeout(start, 4000); // zapas: gdyby sprawdzanie sesji się zawiesiło, strona i tak się pokaże
  } else {
    route();
  }
})();
