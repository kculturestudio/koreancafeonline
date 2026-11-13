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
    sound: '<path d="M4 10v4h4l5 4V6l-5 4zM16.5 9a4 4 0 0 1 0 6"/>'
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
        box.innerHTML = '<div class="empty-state" data-empty>' + mascot('chmurka') + '<p class="day-sep">' + esc(t('chat.empty')) + '</p></div>';
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

  /* ---------- postęp: XP, ziarna, streak i ćwiczenia. Lokalnie zawsze, na koncie (Supabase) po zalogowaniu ---------- */
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  var Prog = {
    stats: function () { return load('stats', { xp: 0, beans: 0, streak: 0, last: '' }); },
    // Nagroda za poprawną odpowiedź. Streak rośnie raz dziennie i zeruje się po przerwie dłuższej niż dzień.
    award: function (xp, beans) {
      var st = this.stats(), today = dayKey();
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
    snapshot: function () { return { stats: this.stats(), practice: load('practice', {}) }; },
    // Łączy dane z konta z lokalnymi: wyższe XP wygrywa, a w ćwiczeniach liczy się dalszy postęp.
    merge: function (remote) {
      if (!remote || typeof remote !== 'object') return;
      var ls = this.stats(), rs = remote.stats || {};
      var st = (rs.xp || 0) > ls.xp ? { xp: rs.xp || 0, beans: rs.beans || 0, streak: rs.streak || 0, last: rs.last || '' } : ls;
      save('stats', st);
      var lp = load('practice', {}), rp = remote.practice || {};
      Object.keys(rp).forEach(function (k) { if ((rp[k] || 0) > (lp[k] || 0)) lp[k] = rp[k]; });
      save('practice', lp);
    },
    pull: function () {
      if (!SB.on || !ui.user) return;
      var self = this;
      SB.client.from('progress').select('data').eq('user_id', ui.user.id).maybeSingle().then(function (r) {
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
  var HERO = '<img class="hero-logo" src="img/logo.png" alt="" width="132" height="132">' +
    '<div class="hero-title" aria-hidden="true">Korean Café Online</div>' +
    '<span class="hero-script" aria-hidden="true">한국 카페 온라인</span>';

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
      ['practice', '#/cwiczenia', 'pen', 'nav.practice'],
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
    var f = ui.filters, n = ['lang', 'level', 'topic', 'age'].filter(function (k) { return f[k] && f[k] !== 'all'; }).length;
    return '<button type="button" class="filter-toggle" data-action="filters-toggle" aria-expanded="' + (n > 0) + '" aria-controls="filters">' + ico('filter', 18) +
      '<span>' + esc(t('f.title')) + '</span>' + (n ? '<b class="filter-n">' + n + '</b>' : '') + '</button>' +
      '<div class="filters" id="filters"' + (n ? '' : ' hidden') + '>' +
      selectChip('lang', t('f.lang'), [['all', t('f.all')], ['KR', t('f.kr')], ['PL', t('f.pl')]]) +
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
    kotek: '<ellipse cx="60" cy="104" rx="34" ry="4" fill="#2B2B33" opacity=".08"/><path d="M15 46L17 21Q18 15 24 18L43 31Q60 27 77 31L96 18Q102 15 103 21L105 46Q110 54 109 68Q107 96 60 97Q13 96 11 68Q10 54 15 46Z" fill="#ECECF0" stroke="#2B2B33" stroke-width="4.5" stroke-linejoin="round"/><path d="M24 36l-1-9 9 6M96 36l1-9-9 6" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="38" cy="45" rx="14" ry="5" fill="#fff" opacity=".7" transform="rotate(-8 38 45)"/><ellipse cx="29" cy="76" rx="9" ry="5.5" fill="#FFB3C4" opacity=".75"/><ellipse cx="91" cy="76" rx="9" ry="5.5" fill="#FFB3C4" opacity=".75"/><circle cx="42" cy="66" r="5" fill="#2B2B33"/><circle cx="78" cy="66" r="5" fill="#2B2B33"/><circle cx="43.6" cy="64.3" r="1.5" fill="#fff"/><circle cx="79.6" cy="64.3" r="1.5" fill="#fff"/><path d="M54 73q3 4.5 6 0q3 4.5 6 0" fill="none" stroke="#2B2B33" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    chmurka: '<path d="M34 92a22 22 0 0 1-2-44 28 28 0 0 1 54-6 24 24 0 0 1 4 50z" fill="#E7E0FA" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><path d="M44 96l-8 14 22-14" fill="#E7E0FA" stroke="#4B3139" stroke-width="3.4" stroke-linejoin="round"/><circle cx="46" cy="66" r="3.6" fill="#4B3139"/><circle cx="74" cy="66" r="3.6" fill="#4B3139"/><ellipse cx="38" cy="76" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><ellipse cx="82" cy="76" rx="6.5" ry="4.2" fill="#F7B6C2" opacity=".85"/><path d="M54 78q6 6.5 12 0" fill="none" stroke="#4B3139" stroke-width="3.2" stroke-linecap="round"/>'
  };
  function mascot(name, cls) { return '<span class="mascot m-' + name + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' + (MASCOTS[name] || '') + '</svg></span>'; }
  /* spójny zestaw ikon: kontur w kolorze marki + pastelowe wypełnienia (zamiast emoji systemowych) */
  var GLYPH = {"sprout": "<path d=\"M16 27V15\" fill=\"none\"/><path d=\"M16 17C10 17 7 13 7 8c6 0 9 3 9 9z\" fill=\"#CFE3D6\"/><path d=\"M16 14c0-5 3-8 9-8 0 5-3 8-9 8z\" fill=\"#B9D6C3\"/>", "flower": "<g fill=\"#EBC3CB\"><circle cx=\"16\" cy=\"8.5\" r=\"5\"/><circle cx=\"23.5\" cy=\"14\" r=\"5\"/><circle cx=\"20.6\" cy=\"22.6\" r=\"5\"/><circle cx=\"11.4\" cy=\"22.6\" r=\"5\"/><circle cx=\"8.5\" cy=\"14\" r=\"5\"/></g><circle cx=\"16\" cy=\"16\" r=\"4.2\" fill=\"#E8D0A0\"/>", "dumpling": "<path d=\"M4 20c0-8 6-12 12-12s12 4 12 12c0 3-3 5-12 5S4 23 4 20z\" fill=\"#F7EEDD\"/><path d=\"M10 12l1 4M16 10v5M22 12l-1 4\" fill=\"none\"/>", "clapper": "<rect x=\"5\" y=\"12\" width=\"22\" height=\"15\" rx=\"3\" fill=\"#DCD3EA\"/><path d=\"M5 12l2-6 20 3-1 3z\" fill=\"#F7EEDD\"/><path d=\"M10 7.5l-2 4.5M16 8.5l-2 4.5M22 9.5l-2 4\" fill=\"none\"/>", "suitcase": "<rect x=\"5\" y=\"10\" width=\"22\" height=\"16\" rx=\"4\" fill=\"#CBDDE8\"/><path d=\"M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M5 17h22\" fill=\"none\"/>", "house": "<path d=\"M5 15L16 5l11 10\" fill=\"none\"/><path d=\"M8 13v13h16V13L16 6z\" fill=\"#EFD2B8\"/><rect x=\"13\" y=\"18\" width=\"6\" height=\"8\" rx=\"2\" fill=\"#F7EEDD\"/>", "note": "<path d=\"M12 22V7l13-3v15\" fill=\"none\"/><circle cx=\"9\" cy=\"22\" r=\"4\" fill=\"#EBC3CB\"/><circle cx=\"22\" cy=\"19\" r=\"4\" fill=\"#EBC3CB\"/>", "chat": "<path d=\"M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H15l-6 5v-5a3 3 0 0 1-3-3z\" fill=\"#E8D0A0\"/><path d=\"M11 12h10M11 16h6\" fill=\"none\"/>", "heart": "<path d=\"M16 27C6 20 4 14 4 10.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 2.5C28 14 26 20 16 27z\" fill=\"#EBC3CB\"/>", "pot": "<path d=\"M5 14h22v6a7 7 0 0 1-7 7h-8a7 7 0 0 1-7-7z\" fill=\"#CFE3D6\"/><path d=\"M3 14h26M13 10c0-3 3-2 3-5M19 10c0-3 3-2 3-5\" fill=\"none\"/>", "scroll": "<path d=\"M8 5h15a3 3 0 0 1 3 3v17a3 3 0 0 0 3 3H11a3 3 0 0 1-3-3z\" fill=\"#F7EEDD\"/><path d=\"M8 5a3 3 0 0 0-3 3v2h3M13 12h9M13 17h9\" fill=\"none\"/>", "box": "<path d=\"M5 11l11-6 11 6v12l-11 6-11-6z\" fill=\"#EFD2B8\"/><path d=\"M5 11l11 6 11-6M16 17v12\" fill=\"none\"/>", "bowl": "<path d=\"M4 15h24a12 11 0 0 1-24 0z\" fill=\"#F7EEDD\"/><path d=\"M10 13c0-3 4-3 4-6M17 13c0-3 4-3 4-6\" fill=\"none\"/><path d=\"M9 20c3 2 11 2 14 0\" fill=\"none\"/>", "cup": "<path d=\"M6 12h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z\" fill=\"#E8D0A0\"/><path d=\"M23 14h2.5a3 3 0 0 1 0 6H22M11 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4\" fill=\"none\"/>", "mic": "<rect x=\"11\" y=\"4\" width=\"10\" height=\"16\" rx=\"5\" fill=\"#DCD3EA\"/><path d=\"M7 15a9 9 0 0 0 18 0M16 24v4M12 28h8\" fill=\"none\"/>", "wave": "<circle cx=\"16\" cy=\"16\" r=\"11\" fill=\"#E8D0A0\"/><circle cx=\"12\" cy=\"14\" r=\"1.2\" fill=\"#4B3139\"/><circle cx=\"20\" cy=\"14\" r=\"1.2\" fill=\"#4B3139\"/><path d=\"M11.5 19c3 3 6 3 9 0\" fill=\"none\"/>", "sun": "<circle cx=\"16\" cy=\"16\" r=\"6\" fill=\"#E8D0A0\"/><path d=\"M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2 2M22.5 22.5l2 2M7.5 24.5l2-2M22.5 9.5l2-2\" fill=\"none\"/>"};
  function glyph(n, size) { size = size || 28; return '<svg class="glyph" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" stroke=\"#4B3139\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden="true">' + (GLYPH[n] || GLYPH.cup) + '</svg>'; }
  var EMOJI = { 'kr-a1': 'sprout', 'kr-adv': 'flower', 'pl-b1': 'dumpling', drama: 'clapper', 'korea-life': 'suitcase', 'poland-life': 'house', dance: 'note', 'temat-dnia': 'chat', fandomy: 'heart', gotowanie: 'pot', historia: 'scroll', 'przeprowadzka-kr': 'box', 'przeprowadzka-pl': 'box', jedzenie: 'bowl', start: 'cup', 'kpop-taniec': 'mic' };
  var SC_GLYPH = { cafe: 'cup', drama: 'clapper', intro: 'wave', weekend: 'sun', resto: 'bowl' };
  function emo(id) { return glyph(EMOJI[id] || 'cup'); }
  function lockHtml() { return '<span class="lock" aria-label="' + esc(t('lobby.premium')) + '">' + ico('lock', 18) + '</span>'; }
  function chatRow(c) {
    var locked = c.premium && !isPremium();
    return '<a class="row" href="' + (locked ? '#/premium' : '#/czat/' + c.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(c.id) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(c.name)) + '</strong><small>' + esc(c.badge) + ' · ' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + ' · ' + esc(L(c.desc)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowAlways(r) {
    var locked = r.premium && !isPremium();
    return '<a class="row" href="' + (locked ? '#/premium' : '#/room/' + r.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(r.id) + '</span>' +
      '<span class="row-text"><strong>' + esc(L(r.name)) + '</strong><small>' + esc(t('live.open247')) + ' · ' + esc(L(r.level)) + ' · ' + esc(tf('live.max', { n: r.seats })) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function roomRowScheduled(x, now) {
    var r = x.r, locked = r.premium && !isPremium();
    var when = x.slot.live ? '<span class="live-badge"><i></i>' + esc(t('live.now')) + '</span>' : '<span class="row-time">' + esc(whenText(x.slot.start, now)) + '</span>';
    return '<a class="row" href="' + (locked ? '#/premium' : '#/room/' + r.id) + '">' +
      '<span class="badge-sq" aria-hidden="true">' + emo(r.id) + '</span><span class="row-text">' + when + '<strong>' + esc(L(r.name)) + '</strong><small>' + esc(O(r.name)) + ' · ' + esc(L(r.level)) + '</small></span>' +
      (locked ? lockHtml() : '') + '</a>';
  }
  function viewLobby(tab) {
    var now = new Date();
    var body;
    if (tab === 'chats') {
      var chats = D.channels.filter(matches);
      body = chats.length ? '<div class="list">' + chats.map(chatRow).join('') + '</div>' : '<p class="empty">' + mascot('mochi') + esc(t('lobby.empty')) + '</p>';
    } else {
      var always = D.rooms.filter(function (r) { return r.always && matches(r); });
      var sched = D.rooms.filter(function (r) { return !r.always && matches(r); }).map(function (r) { return { r: r, slot: nextSlot(r, now) }; })
        .filter(function (x) { return x.slot; }).sort(function (a, b) { return a.slot.start - b.slot.start; });
      body = '';
      if (always.length) body += '<h2 class="section-title">' + esc(t('live.always')) + '</h2><div class="list">' + always.map(roomRowAlways).join('') + '</div>';
      if (sched.length) body += '<h2 class="section-title">' + esc(t('live.scheduled')) + '</h2><div class="list">' + sched.map(function (x) { return roomRowScheduled(x, now); }).join('') + '</div>';
      if (!always.length && !sched.length) body = '<p class="empty">' + mascot('mochi') + esc(t('lobby.empty')) + '</p>';
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
    var main = target === 'pl' ? x.pl : x.k, other = target === 'pl' ? x.k : x.pl;
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
    if (c.premium && !isPremium()) { navigate('#/premium', true); return; }
    var key = 'chat:' + id;
    var html = '<main class="screen" id="view" tabindex="-1">' +
      '<div class="topbar"><a class="icon-btn" href="#/kawiarnia" aria-label="' + esc(t('common.back')) + '">' + ico('back') + '</a>' +
      '<div class="topbar-text"><h1 class="topbar-title">' + esc(L(c.name)) + '</h1><span class="subtitle">' + esc(O(c.name)) + ' · ' + esc(L(c.level)) + '</span></div></div>' +
      '<div class="strip"><span>' + esc(L(c.rule)) + '</span><span class="tag">' + esc(t('chat.tr')) + '</span></div>' +
      (SB.on ? '<div class="strip">' + esc(t('chat.live')) + '</div>' : (CFG.demo ? '<div class="strip">' + esc(t('demo.chat')) + '</div>' : '')) +
      ((SB.on && !ui.user) ? gateHtml() : messagesBlock(key) + (c.practice ? promptHtml(c) : '') +
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
    return '<div class="topic-card daily"><span class="label-caps">' + esc(t('room.dailyLabel')) + ' · ' + esc(tf('room.dailyOf', { n: i + 1, m: r.daily.length })) + '</span>' +
      '<strong>' + esc(L(x.title)) + ' · ' + esc(O(x.title)) + '</strong>' +
      '<p lang="' + qLang + '">' + esc(x.q) + '</p><p class="muted" lang="' + trLang + '">' + esc(x.tr) + '</p>' +
      (starter ? '<p class="starter"><span class="label-caps">' + esc(t('room.starter')) + '</span> <span lang="' + qLang + '">' + esc(starter) + '</span></p>' : '') +
      (canType && starter ? '<button type="button" class="btn btn-ghost btn-sm" data-action="starter" data-text="' + esc(starter) + '">' + esc(t('room.useStarter')) + '</button>' : '') +
      '<small class="xp-line' + (dailyDone('room:' + r.id) ? ' done' : '') + '">' + esc(t(dailyDone('room:' + r.id) ? 'room.xpDone' : 'room.xpHint')) + '</small>' +
      '<small class="fine" style="text-align:left">' + esc(t(r.tz === SEOUL ? 'room.dailyNewKr' : 'room.dailyNew')) + '</small></div>';
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
    var topic = r.daily ? dailyCard(r, !(SB.on && !ui.user)) : r.topicCard ? '<div class="topic-card"><span class="label-caps">' + esc(t('room.topicLabel')) + '</span><strong>' + esc(L(r.topicCard.title)) + ' · ' + esc(O(r.topicCard.title)) + '</strong><p>' + esc(r.topicCard.ko) + '<br>' + esc(r.topicCard.pl) + '</p></div>' : '';
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
      '<div class="head"><h1 class="title">' + esc(t('ev.title')) + '</h1>' + mascot('mandu', 'm-head') + '</div>' +
      '<div class="tabs"><a class="tab" href="#/wydarzenia"' + (filter === 'all' ? ' aria-current="page"' : '') + '>' + esc(t('ev.all')) + '</a>' +
      '<a class="tab" href="#/wydarzenia/premium"' + (filter === 'premium' ? ' aria-current="page"' : '') + '>' + esc(t('ev.premium')) + '</a></div>' +
      (cards || '<p class="empty">' + mascot('mochi') + esc(t('ev.empty')) + '</p>') + '</div>' + nav('events') + '</main>';
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
      '<div class="paywall-actions"><div class="logo-row"><img class="logo-mini" src="img/logo-96.png" alt="" width="64" height="64"></div><button type="button" class="btn btn-primary" data-action="checkout">' + esc(tf('pay.cta', { n: CFG.trialDays })) + '</button>' +
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
      '<div class="content"><div class="logo-row"><img class="logo-mini" src="img/logo-96.png" alt="" width="64" height="64"></div><p class="subtitle logo-lead">' + esc(t('auth.lead.' + mode)) + '</p>' +
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
      accountHtml() + statsHtml() +
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
      '<p class="notice">' + esc(t(SB.on ? 'profile.noteRemote' : 'demo.account')) + '</p>' +
      '<div class="brand-stamp"><img class="logo-mini" src="img/logo-96.png" alt="" width="64" height="64"><span>Korean Café Online<small>K-Culture Studio · Fundacja Hanguk</small></span></div></div>' + nav('profile') + '</main>';
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
    return '<div class="pt-row ai"><div class="pt-k" lang="ko">' + esc(m.k) + '</div><small><span class="pt-by">' + esc(t('pt.cat')) + '</span> · ' + esc(m.pl) + '</small>' + '<button type="button" class="say" data-action="say" data-text="' + esc(m.k) + '" aria-label="' + esc(t('practice.listen')) + '">' + ico('sound', 18) + '</button></div>';
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
    var tr = (!mine && lang === 'pl') ? '<span class="tr">' + esc(e.p) + '</span>' : '';
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
    var tr = (!m.me && lang === 'pl' && m.p) ? '<span class="tr">' + esc(m.p) + '</span>' : '';
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
        (lang === 'pl' ? '<small>' + esc(cur.sampleTr) + '</small>' : '') + '</button></div>' +
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
      case 'cwiczenia': return seg[1] === 'rozmowa' ? viewPartner(seg[2]) : seg[1] === 'barista' ? viewBarista() : seg[1] === 'sciezka' ? kPath() : seg[1] === 'lekcja' ? viewLesson(seg[2], seg[3]) : seg[1] ? viewPracticeRoom(seg[1]) : viewPractice();
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
    } else if (a === 'p-pick') {
      var pr = findBy(D.practice, el.getAttribute('data-id'));
      var pi = +el.getAttribute('data-i'), pn = pr ? pProg(pr.id) : 0;
      if (pr && pn < pr.ex.length) {
        if (pi === pr.ex[pn].a) {
          ui.pWrong = null; pSet(pr.id, pn + 1);
          var last = pn + 1 >= pr.ex.length;
          Prog.award(last ? 7 : 2, last ? 3 : 1);
          if (last) toast(t('practice.done'));
        } else { ui.pWrong = pi; }
        ui.keepScroll = false;
        route();
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
    } else if (a === 'say') {
      try {
        var u = new SpeechSynthesisUtterance(el.getAttribute('data-text')); u.lang = 'ko-KR'; u.rate = .9;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      } catch (err) { /* brak syntezy mowy w tej przeglądarce */ }
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
      if (q) { q.hidden = !ui.hintOpen[hid]; if (!q.hidden) { try { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); } catch (err) { /* stary przeglądarkowy scroll */ } } }
      el.setAttribute('aria-expanded', String(ui.hintOpen[hid]));
    } else if (a === 'bar-hint') {
      var bi = document.querySelector('.composer-input');
      if (bi) { bi.value = el.getAttribute('data-text'); bi.focus(); }
    } else if (a === 'bar-again') {
      ui.bar = null; viewBarista();
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
    if (SB.on) {
      if (!ui.user) return;
      var sendBtn = form.querySelector('button[type="submit"]');
      sendBtn.disabled = true;
      Live.send(key, text).then(function (row) {
        input.value = '';
        Live.add(row, true);
        awardDaily(key, text);
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
    var msg = Chat.send(key, text);
    awardDaily(key, text);
    if (wasEmpty) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', msgHtml(msg));
    input.value = '';
    advancePrompt(chId);
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
