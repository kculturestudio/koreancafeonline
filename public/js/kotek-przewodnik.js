/* ===================================================================
   MascotGuide: wielokrotnego użytku komponent kotka-przewodnika.
   Używa oryginalnego obrazka maskotki (bez przerysowywania), animowanego wyłącznie CSS-em.
   API:
     MascotGuide.configure({ t, enabled, persistent, onPersistent, contextTip })
     MascotGuide.show({ state, message, title, position, size, dismissible, duration,
                        actions, target, once, priority, container, force, scope, onDismiss })
     MascotGuide.hide(reason)   MascotGuide.tour(steps)   MascotGuide.schedule(opts, ms)
     MascotGuide.setPersistent(bool)   MascotGuide.avatar(cls)   MascotGuide.onRoute(hash)
   Stany: welcome, explanation, hint, success, correction, encouragement, announcement
   =================================================================== */
(function () {
  'use strict';

  var SRC = 'img/kotek.png';

  var CSS = [
    '.mg-img{display:block;width:100%;height:100%;background:url(' + SRC + ') center/contain no-repeat;transform-origin:50% 90%}',
    '.mascot.mg-fill{width:100%;height:100%;display:block}',
    '.mascot .mg-img{transition:transform .2s cubic-bezier(.3,1.5,.5,1)}',
    '.mascot.m-kotek:hover .mg-img{transform:scale(1.08)}',
    '.k-foot .m-kcat.happy .mg-img,.k-res .m-kcat .mg-img{animation:mg-bounce .9s ease-out .1s 2}',
    '.k-foot .m-kcat.oops .mg-img{animation:mg-tilt-r .6s ease-out forwards}',
    '.k-foot .btn{width:auto;flex:none;min-width:104px}',
    '.mg-stage{position:fixed;left:0;right:0;top:0;bottom:0;z-index:60;pointer-events:none}',
    '.mg-frame{position:relative;max-width:480px;height:100%;margin:0 auto}',
    '.mg-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.mg{--mg-size:68px;--mg-edge:#E9B9C3;--mg-tint:#FBE3E8;--mg-ink:#8F3F55;position:absolute;display:flex;align-items:flex-end;gap:8px;max-width:calc(100% - 20px);pointer-events:none;font-family:var(--sans,"Nunito",sans-serif);font-size:14px;color:#4B3139}',
    '.mg>*{pointer-events:auto}',
    '.mg[data-pos="bottom-left"]{left:10px;bottom:var(--mg-bottom,84px)}',
    '.mg[data-pos="bottom-right"]{right:10px;bottom:var(--mg-bottom,84px);flex-direction:row-reverse}',
    '.mg[data-pos="top-left"]{left:10px;top:calc(10px + env(safe-area-inset-top,0px))}',
    '.mg[data-pos="top-right"]{right:10px;top:calc(10px + env(safe-area-inset-top,0px));flex-direction:row-reverse}',
    '.mg[data-pos="inline"]{position:relative;max-width:100%;margin:8px 0}',
    '.mg[data-state="welcome"]{--mg-edge:#E9B9C3;--mg-tint:#FBE3E8;--mg-ink:#8F3F55}',
    '.mg[data-state="explanation"]{--mg-edge:#CFC4EE;--mg-tint:#EEE9FB;--mg-ink:#4B3A7A}',
    '.mg[data-state="hint"]{--mg-edge:#EBD08F;--mg-tint:#FFF1C9;--mg-ink:#7A5A12}',
    '.mg[data-state="success"]{--mg-edge:#A9DCC3;--mg-tint:#DDF3E8;--mg-ink:#1F6B4A}',
    '.mg[data-state="correction"]{--mg-edge:#F0B6A8;--mg-tint:#FDE6E0;--mg-ink:#8E3A2C}',
    '.mg[data-state="encouragement"]{--mg-edge:#F2C79A;--mg-tint:#FFE9D3;--mg-ink:#8A4B14}',
    '.mg[data-state="announcement"]{--mg-edge:#B9D2EE;--mg-tint:#E3EEFB;--mg-ink:#2F5A8A}',
    '.mg.is-in[data-pos^="bottom"],.mg.is-in[data-pos="inline"]{animation:mg-in-b .4s cubic-bezier(.2,.9,.3,1) both}',
    '.mg.is-in[data-pos^="top"]{animation:mg-in-t .4s cubic-bezier(.2,.9,.3,1) both}',
    '.mg.is-out{animation:mg-out .22s ease-in both;pointer-events:none}',
    '.mg-av{flex:none;width:var(--mg-size);height:var(--mg-size);padding:0;border:0;background:none;cursor:pointer;border-radius:50%;transition:transform .2s cubic-bezier(.3,1.5,.5,1);-webkit-tap-highlight-color:transparent}',
    '.mg-av:hover,.mg-av:focus-visible{transform:scale(1.1)}',
    '.mg-av:active{transform:scale(.95)}',
    '.mg-av:focus-visible{outline:3px solid rgba(165,84,106,.55);outline-offset:2px}',
    '.mg-av.boing{animation:mg-boing .45s ease-out}',
    '.mg-float{display:block;width:100%;height:100%;animation:mg-float 3.8s ease-in-out infinite;filter:drop-shadow(0 6px 8px rgba(122,75,0,.2))}',
    '.mg[data-tilt="l"] .mg-img{animation:mg-tilt .6s .2s ease-out forwards}',
    '.mg[data-tilt="r"] .mg-img{animation:mg-tilt-r .6s .2s ease-out forwards}',
    '.mg[data-state="success"] .mg-img{animation:mg-bounce .9s ease-out .15s 2}',
    '.mg-bubble{position:relative;min-width:0;width:max-content;max-width:min(290px,calc(100vw - var(--mg-size) - 44px));background:#fff;border:1.5px solid var(--mg-edge);border-radius:18px 18px 18px 6px;padding:10px 36px 11px 13px;box-shadow:0 12px 26px -12px rgba(122,75,0,.4);margin-bottom:6px}',
    '.mg[data-pos$="right"] .mg-bubble{border-radius:18px 18px 6px 18px}',
    '.mg-bubble::before{content:"";position:absolute;left:-7px;bottom:16px;width:12px;height:12px;background:#fff;border-left:1.5px solid var(--mg-edge);border-bottom:1.5px solid var(--mg-edge);transform:rotate(45deg);border-radius:0 0 0 4px}',
    '.mg[data-pos$="right"] .mg-bubble::before{left:auto;right:-7px;border-left:0;border-bottom:0;border-right:1.5px solid var(--mg-edge);border-top:1.5px solid var(--mg-edge);border-radius:0 4px 0 0}',
    '.mg-label{display:inline-block;margin-bottom:5px;padding:2px 9px;border-radius:999px;background:var(--mg-tint);color:var(--mg-ink);font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}',
    '.mg-title{margin:0 0 2px;font-size:15px;font-weight:800;line-height:1.25}',
    '.mg-text{margin:0;font-size:14px;line-height:1.4;font-weight:600}',
    '.mg-x{position:absolute;top:5px;right:5px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:#7A6350;cursor:pointer}',
    '.mg-x:hover{background:var(--mg-tint)}',
    '.mg-x:focus-visible,.mg-btn:focus-visible{outline:3px solid rgba(165,84,106,.55);outline-offset:1px}',
    '.mg-x svg{width:14px;height:14px;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;fill:none}',
    '.mg-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}',
    '.mg-btn{display:inline-flex;align-items:center;min-height:34px;padding:0 13px;border-radius:999px;border:1.5px solid var(--mg-edge);background:var(--mg-tint);color:#4B3139;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer;text-decoration:none}',
    '.mg-btn.primary{background:#4B3139;border-color:#4B3139;color:#fff}',
    '.mg-btn:active{transform:scale(.96)}',
    '.mg-spot{position:relative;z-index:1;border-radius:14px;animation:mg-ring 1.6s ease-out infinite}',
    '@keyframes mg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
    '@keyframes mg-in-b{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}',
    '@keyframes mg-in-t{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:none}}',
    '@keyframes mg-out{to{opacity:0;transform:translateY(10px)}}',
    '@keyframes mg-bounce{0%,100%{transform:translateY(0) scale(1)}30%{transform:translateY(-14px) scale(1.04,.97)}55%{transform:translateY(0) scale(.97,1.03)}75%{transform:translateY(-5px)}}',
    '@keyframes mg-tilt{from{transform:rotate(0)}to{transform:rotate(-8deg)}}',
    '@keyframes mg-tilt-r{from{transform:rotate(0)}to{transform:rotate(6deg)}}',
    '@keyframes mg-boing{0%{transform:scale(1)}40%{transform:scale(1.2)}100%{transform:scale(1)}}',
    '@keyframes mg-ring{0%{box-shadow:0 0 0 0 rgba(165,84,106,.55)}100%{box-shadow:0 0 0 14px rgba(165,84,106,0)}}',
    '@keyframes mg-fade{from{opacity:0}to{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.mg-float,.mg-img,.mg-spot,.k-foot .m-kcat .mg-img,.k-res .m-kcat .mg-img{animation:none!important}.mg.is-in,.mg.is-in[data-pos]{animation:mg-fade .2s both!important}.mg.is-out{animation:mg-fade .01s reverse both!important}.mg-av,.mascot .mg-img{transition:none}.mg-av.boing{animation:none}}'
  ].join('\n');

  var STATES = {
    welcome: { pri: 2, tilt: '', auto: 0 },
    explanation: { pri: 1, tilt: 'l', auto: 0 },
    hint: { pri: 2, tilt: 'l', auto: 0 },
    success: { pri: 3, tilt: '', auto: 4200 },
    correction: { pri: 3, tilt: 'r', auto: 0 },
    encouragement: { pri: 1, tilt: '', auto: 6500 },
    announcement: { pri: 2, tilt: '', auto: 0 }
  };
  var SIZES = { sm: 48, md: 68, lg: 96 };

  var cfg = { t: function (k) { return k; }, enabled: function () { return true; }, persistent: false, onPersistent: null, contextTip: null, root: null };
  var stage = null, frame = null, live = null;
  var cur = null;            // aktualny dymek: { opts, el, timer, hash }
  var dockEl = null;
  var sched = null;
  var spotted = [];
  var memOnce = {};

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function T(k) { try { return cfg.t(k); } catch (e) { return k; } }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function hashNow() { return location.hash || '#/'; }

  /* ---------- pamięć "pokaż raz na sesję" ---------- */
  function seen(key) {
    if (!key) return false;
    try { var o = JSON.parse(sessionStorage.getItem('kco.mg.once') || '{}'); return !!o[key]; } catch (e) { return !!memOnce[key]; }
  }
  function mark(key) {
    if (!key) return;
    memOnce[key] = 1;
    try { var o = JSON.parse(sessionStorage.getItem('kco.mg.once') || '{}'); o[key] = 1; sessionStorage.setItem('kco.mg.once', JSON.stringify(o)); } catch (e) { /* pamięć sesji zablokowana */ }
  }

  /* ---------- infrastruktura ---------- */
  function ensure() {
    if (stage) return;
    var st = document.createElement('style');
    st.id = 'mg-style';
    st.textContent = CSS;
    document.head.appendChild(st);
    stage = document.createElement('div');
    stage.className = 'mg-stage';
    frame = document.createElement('div');
    frame.className = 'mg-frame';
    live = document.createElement('div');
    live.className = 'mg-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    stage.appendChild(frame);
    stage.appendChild(live);
    (cfg.root || document.body).appendChild(stage);
    window.addEventListener('resize', reflow);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cur && cur.opts.dismissible !== false && cur.opts.position !== 'inline') hide('user');
    });
  }
  function size(o) { var s = o.size; return typeof s === 'number' ? s : (SIZES[s] || SIZES.md); }
  function avatar(cls) {
    return '<span class="mascot m-kotek' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><span class="mg-img"></span></span>';
  }

  /* odstęp od dołu: omijamy przyklejony do dołu pasek (menu, stopka lekcji, pole pisania) */
  function clearance() {
    try {
      var vh = window.innerHeight, x = Math.round(window.innerWidth / 2);
      var el = document.elementFromPoint(x, vh - 4);
      var top = vh, hops = 0;
      while (el && el !== document.body && hops < 8) {
        if (el.closest && el.closest('.mg-stage')) return 84;
        var r = el.getBoundingClientRect();
        if (r.bottom >= vh - 3 && r.height > 0 && r.height < vh * 0.4) top = Math.min(top, r.top);
        else if (r.height >= vh * 0.4) break;
        el = el.parentElement; hops++;
      }
      return Math.max(12, vh - top + 10);
    } catch (e) { return 84; }
  }
  function reflow() {
    if (!frame) return;
    var c = clearance() + 'px';
    var els = frame.querySelectorAll('.mg');
    for (var i = 0; i < els.length; i++) els[i].style.setProperty('--mg-bottom', c);
  }

  function spot(sel) {
    unspot();
    if (!sel) return;
    try {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length && i < 3; i++) { els[i].classList.add('mg-spot'); spotted.push(els[i]); }
    } catch (e) { /* zły selektor */ }
  }
  function unspot() { spotted.forEach(function (e) { e.classList.remove('mg-spot'); }); spotted = []; }

  function say(text) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = text; }, 30); } }

  /* ---------- budowa dymka ---------- */
  function build(o) {
    var st = STATES[o.state] || STATES.encouragement;
    var el = document.createElement('div');
    el.className = 'mg';
    el.setAttribute('data-state', o.state);
    el.setAttribute('data-pos', o.position);
    if (st.tilt || o.tilt) el.setAttribute('data-tilt', o.tilt || st.tilt);
    el.style.setProperty('--mg-size', size(o) + 'px');
    var acts = (o.actions || []).map(function (a, i) {
      var cls = 'mg-btn' + (a.primary ? ' primary' : '');
      return a.href
        ? '<a class="' + cls + '" href="' + esc(a.href) + '" data-mg-act="' + i + '">' + esc(a.label) + '</a>'
        : '<button type="button" class="' + cls + '" data-mg-act="' + i + '">' + esc(a.label) + '</button>';
    }).join('');
    el.innerHTML =
      '<button type="button" class="mg-av" aria-label="' + esc(T('mg.open')) + '"><span class="mg-float">' + avatar('mg-fill') + '</span></button>' +
      '<div class="mg-bubble">' +
      '<span class="mg-label">' + esc(o.label || T('mg.label.' + o.state)) + '</span>' +
      (o.title ? '<p class="mg-title">' + esc(o.title) + '</p>' : '') +
      '<p class="mg-text">' + esc(o.message) + '</p>' +
      (acts ? '<div class="mg-actions">' + acts + '</div>' : '') +
      (o.dismissible !== false ? '<button type="button" class="mg-x" aria-label="' + esc(T('mg.close')) + '"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg></button>' : '') +
      '</div>';
    return el;
  }

  function wire(el, o) {
    var x = el.querySelector('.mg-x');
    if (x) x.addEventListener('click', function () { hide('user'); });
    var av = el.querySelector('.mg-av');
    av.addEventListener('click', function () {
      av.classList.remove('boing'); void av.offsetWidth; av.classList.add('boing');
      var b = el.querySelector('.mg-bubble');
      if (b) b.hidden = !b.hidden;   // dotknięcie kotka zwija i rozwija dymek
    });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mg-act]');
      if (!b) return;
      var a = (o.actions || [])[+b.getAttribute('data-mg-act')];
      if (!a) return;
      var c0 = cur;
      if (a.onClick) a.onClick();
      if (a.keep !== true && !a.next && cur === c0) hide('action');   // jeśli akcja pokazała nowy dymek, nie chowamy go
    });
    el.addEventListener('pointerenter', function () { if (cur && cur.el === el) clearTimeout(cur.timer); });
    el.addEventListener('pointerleave', function () { if (cur && cur.el === el) arm(2600); });
    el.addEventListener('focusin', function () { if (cur && cur.el === el) clearTimeout(cur.timer); });
  }

  function arm(ms) {
    if (!cur) return;
    clearTimeout(cur.timer);
    var d = cur.opts.duration;
    if (d === undefined || d === 'auto') d = (STATES[cur.opts.state] || {}).auto || 0;
    if (cur.opts.actions && cur.opts.actions.length && cur.opts.duration === undefined) d = 0;
    if (!d) return;
    cur.timer = setTimeout(function () { hide('auto'); }, ms || Math.max(d, Math.min(14000, cur.opts.message.length * 55)));
  }

  /* ---------- API publiczne ---------- */
  function show(opts) {
    ensure();
    var o = {};
    for (var k in opts) o[k] = opts[k];
    o.state = STATES[o.state] ? o.state : 'encouragement';
    o.position = o.position || 'bottom-left';
    o.priority = o.priority === undefined ? STATES[o.state].pri : o.priority;
    o.message = String(o.message || '');
    if (!o.message) return null;
    if (!o.force && !cfg.enabled()) return null;
    if (o.once && seen(o.once)) return null;
    if (cur && !o.force && !o.replace && cur.opts.priority > o.priority && cur.el.isConnected && !cur.el.classList.contains('is-out')) return null;
    if (cur) removeNow();
    if (o.once) mark(o.once);
    var host = frame;
    if (o.container) {
      host = typeof o.container === 'string' ? document.querySelector(o.container) : o.container;
      if (!host) return null;
      o.position = 'inline';
    }
    var el = build(o);
    host.appendChild(el);
    wire(el, o);
    el.classList.add('is-in');
    cur = { opts: o, el: el, timer: 0, hash: o.scope || hashNow() };
    setDock(false);
    if (o.position !== 'inline') reflow();
    spot(o.target);
    say(o.message);
    arm();
    return { hide: function () { if (cur && cur.el === el) hide('api'); } };
  }

  function removeNow() {
    if (!cur) return;
    clearTimeout(cur.timer);
    if (cur.el.parentNode) cur.el.parentNode.removeChild(cur.el);
    cur = null;
    unspot();
  }

  function hide(reason) {
    if (!cur) return;
    var c = cur, o = c.opts;
    clearTimeout(c.timer);
    cur = null;
    unspot();
    c.el.classList.add('is-out');
    setTimeout(function () { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); if (!cur) setDock(true); }, reduced() ? 20 : 230);
    if (reason === 'user' && o.onDismiss) { try { o.onDismiss(); } catch (e) { /* ignore */ } }
  }

  function schedule(opts, ms) {
    cancelScheduled();
    sched = setTimeout(function () { sched = null; show(opts); }, ms);
  }
  function cancelScheduled() { if (sched) { clearTimeout(sched); sched = null; } }

  /* zwykły przewodnik po interfejsie: kilka kroków pod rząd */
  function tour(steps) {
    var i = 0;
    function go() {
      var s = steps[i];
      if (!s) { hide('api'); return; }
      var last = i === steps.length - 1;
      var o = {}; for (var k in s) o[k] = s[k];
      o.force = true; o.once = null; o.duration = 0;
      o.actions = s.actions || [{ label: T(last ? 'mg.done' : 'mg.next'), primary: true, next: !last, onClick: last ? null : function () { i++; go(); } }];
      show(o);
    }
    go();
  }

  /* przycisk stały (opcjonalny): sam kotek w rogu, dotknięcie daje wskazówkę do bieżącego ekranu */
  function setDock(on) {
    if (!stage) return;
    if (on && cfg.persistent && !cur) {
      if (dockEl && dockEl.isConnected) return;
      dockEl = document.createElement('div');
      dockEl.className = 'mg mg-dock';
      dockEl.setAttribute('data-pos', 'bottom-left');
      dockEl.setAttribute('data-state', 'encouragement');
      dockEl.style.setProperty('--mg-size', SIZES.sm + 'px');
      dockEl.innerHTML = '<button type="button" class="mg-av" aria-label="' + esc(T('mg.open')) + '"><span class="mg-float">' + avatar('mg-fill') + '</span></button>';
      frame.appendChild(dockEl);
      dockEl.classList.add('is-in');
      reflow();
      dockEl.querySelector('.mg-av').addEventListener('click', function () {
        var tip = cfg.contextTip && cfg.contextTip();
        if (!tip) tip = { state: 'encouragement', message: T('mg.help.default'), actions: [{ label: T('mg.toPractice'), href: '#/cwiczenia', primary: true }] };
        tip.force = true; tip.once = null; tip.duration = tip.duration === undefined ? 0 : tip.duration;
        show(tip);
      });
    } else if (!on && dockEl) {
      if (dockEl.parentNode) dockEl.parentNode.removeChild(dockEl);
      dockEl = null;
    }
  }
  function setPersistent(v) {
    cfg.persistent = !!v;
    if (cfg.onPersistent) cfg.onPersistent(cfg.persistent);
    ensure();
    setDock(cfg.persistent && !cur);
  }

  /* po zmianie ekranu chowamy dymek, który dotyczył poprzedniego */
  function onRoute(hash) {
    cancelScheduled();
    if (cur && cur.opts.position !== 'inline' && cur.hash !== hash && !cur.opts.sticky) hide('route');
    else if (cur) setTimeout(reflow, 60);
    else setTimeout(reflow, 60);
  }

  function configure(c) {
    for (var k in c) cfg[k] = c[k];
    ensure();
    setDock(cfg.persistent && !cur);
  }

  window.MascotGuide = {
    configure: configure, show: show, hide: hide, tour: tour, schedule: schedule, cancelScheduled: cancelScheduled,
    setPersistent: setPersistent, isPersistent: function () { return !!cfg.persistent; }, avatar: avatar,
    onRoute: onRoute, reflow: reflow, STATES: Object.keys(STATES), isShowing: function () { return !!cur; }
  };
})();
