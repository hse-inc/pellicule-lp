(() => {
  const column = document.querySelector('.column');
  const slider = document.getElementById('slider');
  const pages = [...slider.querySelectorAll('.page')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

  const PER = 30, LINE_GAP = 90, BLOCK_GAP = 160;
  const phrases = (text) => {
    const raw = seg ? [...seg.segment(text)].map((x) => x.segment) : [text];
    const out = []; let cur = '';
    raw.forEach((w) => {
      if (cur && (/^[「『（]/.test(w) || cur.length >= 10)) { out.push(cur); cur = ''; }
      cur += w;
      if (/[、。！？」』）!?]$/.test(cur)) { out.push(cur); cur = ''; }
    });
    if (cur) out.push(cur);
    return out;
  };
  pages.forEach((pg) => {
    let t = pg.id === 'p3' ? 1500 : 450;
    const wrapEl = (el) => { const t0 = t; wrap(el); el.style.setProperty('--lt', t0 + 'ms'); el.style.setProperty('--ld', Math.max(300, t - t0 + 300) + 'ms'); };
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          phrases(n.textContent).forEach((w) => {
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const ph = document.createElement('span'); ph.className = 'ph';
            [...w].forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'c'; c.textContent = ch; c.style.setProperty('--ct', t + 'ms');
              t += PER; ph.appendChild(c);
            });
            frag.appendChild(ph);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.matches('.q2')) return;
          if (n.matches('svg')) { n.style.setProperty('--st', t + 'ms'); return; }
          if (n.matches('.tagx')) { n.style.setProperty('--st', (t + 200) + 'ms'); return; }
          if (n.matches('.stamp')) { n.style.setProperty('--st', (t + 500) + 'ms'); return; }
          const t0 = t;
          wrap(n);
          if (n.matches('.ln')) { n.style.setProperty('--lt', t0 + 'ms'); n.style.setProperty('--ld', Math.max(300, t - t0 + 300) + 'ms'); t += LINE_GAP; }
          if (n.matches('.mk')) n.style.setProperty('--t2', t + 'ms');
        }
      });
    };
    pg.querySelectorAll('.page__inner > *').forEach((el) => {
      if (el.matches('.enlab')) { t += 500; return; }
      if (el.matches('.shot')) {
        el.querySelectorAll('.shot__tags li').forEach((li, k) => { t = Math.max(t, 2200 + k * 250); li.querySelectorAll('.kara').forEach((x) => { wrapEl(x); }); });
        t += BLOCK_GAP; return;
      }
      if (el.matches('.levels')) {
        const base = t;
        const l1 = el.querySelector('.climb__l--1'), l4 = el.querySelector('.climb__l--4'), l5 = el.querySelector('.climb__l--5');
        const sched = [base];
        t = base + 450; wrapEl(l1);
        sched[1] = Math.max(t + 900, base + 1800); sched[2] = sched[1] + 1600; sched[3] = sched[2] + 1600;
        t = sched[3] + 450; wrapEl(l4);
        sched[4] = t + 1100;
        t = sched[4] + 450; wrapEl(l5);
        el.dataset.sched = sched.join(',');
        t += BLOCK_GAP; return;
      }
      if (el.matches('.diary')) {
        const base = t;
        const l1 = el.querySelector('.climb__l--1'), l4 = el.querySelector('.climb__l--4'), l5 = el.querySelector('.climb__l--5');
        const sched = [base];
        t = base + 400; wrapEl(l1);
        sched[1] = Math.max(t + 1000, base + 2000); sched[2] = sched[1] + 1800; sched[3] = sched[2] + 1800;
        t = sched[3] + 400; wrapEl(l4);
        sched[4] = Math.max(t + 1000, sched[3] + 2000);
        t = sched[4] + 400; wrapEl(l5);
        el.dataset.sched = sched.join(',');
        t += BLOCK_GAP; return;
      }
      if (el.matches('.climb')) {
        el.style.setProperty('--cs', t + 'ms');
        const base = t;
        const l1 = el.querySelector('.climb__l--1'), l4 = el.querySelector('.climb__l--4'), l5 = el.querySelector('.climb__l--5');
        const sched = [base];
        t = base + 150; wrapEl(l1);
        sched[1] = t + 700; sched[2] = sched[1] + 800; sched[3] = sched[2] + 800;
        t = sched[3] + 150; wrapEl(l4);
        sched[4] = t + 700;
        t = sched[4] + 150; wrapEl(l5);
        el.dataset.sched = sched.join(',');
        t += BLOCK_GAP; return;
      }
      if (el.matches('.gallery')) {
        el.style.setProperty('--gt', t + 'ms'); el.dataset.gt = t;
        t += 700 + BLOCK_GAP; return;
      }
      if (el.matches('.film')) {
        el.querySelectorAll('.film__f').forEach((f, k) => { t = Math.max(t, 2000 + k * 250); f.querySelectorAll('.kara').forEach((x) => { wrapEl(x); }); });
        t += BLOCK_GAP; return;
      }
      const seq = (x) => {
        if (x.matches('.page__label')) return;
        if (x.matches('.kara')) { wrap(x); return; }
        if (x.matches('.blk')) { x.dataset.gt = t; t += 450; }
        [...x.children].forEach(seq);
      };
      seq(el);
      if (el.matches('.stairs')) t += 300;
      t += BLOCK_GAP;
    });
  });

  const g = new URLSearchParams(location.search).get('g') || 'flow';
  const climb = document.querySelector('.climb');
  if (climb && g === 'scroll') {
    document.documentElement.classList.add('g-scroll');
    const box = document.createElement('div'); box.className = 'climb__box';
    climb.parentNode.insertBefore(box, climb); box.appendChild(climb);
    const hint = document.createElement('span'); hint.className = 'climb__hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = 'SCROLL ↑ LEVEL UP';
    box.parentNode.insertBefore(hint, box);
    const me = climb.querySelector('.climb__me'); const stops = [...climb.querySelectorAll('.climb__stop')].reverse();
    box.scrollTop = box.scrollHeight;
    box.addEventListener('scroll', () => {
      const p = 1 - box.scrollTop / Math.max(1, box.scrollHeight - box.clientHeight);
      const lv = Math.min(4, Math.round(p * 4));
      me.style.bottom = 'calc(0.95em + ' + (lv * 25 * 0.92) + '%)';
      stops.forEach((st, i) => { st.querySelector('b').style.background = i < lv + 1 ? (i === 3 ? '#0563ae' : i === 4 ? '#f26923' : '#dfe9f5') : '#fff'; st.querySelector('b').style.color = i >= 3 && i <= lv ? '#fff' : ''; });
    }, { passive: true });
  }
  if (climb && g === 'flow') {
    document.documentElement.classList.add('g-flow');
    const pg = climb.closest('.page');
    const stops = [...climb.querySelectorAll('.climb__stop')].reverse();
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout); timers = [];
      stops.forEach((st) => st.classList.remove('is-on', 'is-done'));
      const sched = (climb.dataset.sched || '').split(',').map(Number);
      stops.forEach((st, i) => {
        timers.push(setTimeout(() => {
          stops.forEach((x, j) => { x.classList.toggle('is-on', j === i); x.classList.toggle('is-done', j < i); });
        }, sched[i] || 900 + i * 800));
      });
    };
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
    stops.forEach((st, i) => st.addEventListener('click', () => { timers.forEach(clearTimeout); stops.forEach((x, j) => { x.classList.toggle('is-on', j === i); x.classList.toggle('is-done', j < i); }); }));
  }

  const diary = document.querySelector('.diary');
  if (diary) {
    const pg = diary.closest('.page');
    const cards = [...diary.querySelectorAll('.diary__c')];
    const no = diary.querySelector('.diary__no'), lv = diary.querySelector('.diary__pill em');
    const set = (a) => {
      cards.forEach((c, i) => { const off = i - a; c.style.setProperty('--off', off); c.style.setProperty('--abs', Math.min(2, Math.abs(off))); c.style.visibility = Math.abs(off) > 2 ? 'hidden' : ''; });
      no.textContent = String(a + 1).padStart(2, '0'); lv.textContent = a + 1;
    };
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout); timers = []; set(0);
      const sched = (diary.dataset.sched || '').split(',').map(Number);
      sched.forEach((ms, i) => { if (i) timers.push(setTimeout(() => set(i), ms)); });
    };
    set(0);
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
    cards.forEach((c, i) => c.addEventListener('click', () => { timers.forEach(clearTimeout); set(i); }));
  }

  const lvBox = document.querySelector('.levels');
  if (lvBox) {
    const pg = lvBox.closest('.page');
    const num = lvBox.querySelector('.levels__num'), tag = lvBox.querySelector('.levels__tag');
    const L = { 1: lvBox.querySelector('.climb__l--1'), 4: lvBox.querySelector('.climb__l--4'), 5: lvBox.querySelector('.climb__l--5') };
    const COL = ['#212121', '#212121', '#212121', '#0563ae', '#f26923'];
    const TAG = ['', '', '', '課長', '部長'];
    const set = (i, anim) => {
      lvBox.style.setProperty('--lv-c', COL[i]);
      const old = num.querySelector('.levels__n:not(.is-out)');
      const nb = document.createElement('b'); nb.className = 'levels__n'; nb.textContent = String(i + 1).padStart(2, '0');
      if (anim && old) { old.classList.add('is-out'); setTimeout(() => old.remove(), 600); nb.classList.add('is-in'); } else { num.innerHTML = ''; }
      num.appendChild(nb);
      tag.textContent = TAG[i]; tag.classList.toggle('is-on', !!TAG[i]);
      const cur = i >= 4 ? 5 : i >= 3 ? 4 : 1;
      Object.entries(L).forEach(([k, el]) => { k = +k; el.classList.toggle('is-wait', k > cur); el.classList.toggle('is-past', k < cur); });
    };
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout); timers = []; set(0, false);
      const sched = (lvBox.dataset.sched || '').split(',').map(Number);
      sched.forEach((ms, i) => { if (i) timers.push(setTimeout(() => set(i, true), ms)); });
    };
    set(0, false);
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
  }

  const gal = document.querySelector('.gallery');
  if (gal) {
    const pg = gal.closest('.page');
    const cards = [...gal.querySelectorAll('.diary__c')]; const N = cards.length;
    let a = 0, timer = null;
    const set = () => cards.forEach((c, i) => {
      let off = i - a; if (off > N / 2) off -= N; if (off < -N / 2) off += N;
      c.style.setProperty('--off', off); c.style.setProperty('--abs', Math.min(2, Math.abs(off))); c.style.visibility = Math.abs(off) > 2 ? 'hidden' : '';
    });
    set();
    let wait = null;
    const run = () => { clearInterval(timer); clearTimeout(wait); a = 0; set(); if (!reduce) wait = setTimeout(() => { timer = setInterval(() => { a = (a + 1) % N; set(); }, 2200); }, (+gal.dataset.gt || 0) + 600); };
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); else { clearInterval(timer); clearTimeout(wait); } }).observe(pg, { attributes: true, attributeFilter: ['class'] });
  }

  const lv = document.getElementById('p3');
  if (lv) {
    const boom = document.createElement('p');
    boom.className = 'boom'; boom.setAttribute('aria-hidden', 'true');
    boom.innerHTML = '<span class="boom__n">ん？</span>';
    lv.appendChild(boom);
  }

  const later = new Map();
  const reveal = (pg) => {
    hide(pg);
    const ts = [];
    pg.querySelectorAll('.mk, .gallery, .blk').forEach((el) => {
      const ms = parseFloat(el.matches('.gallery, .blk') ? el.dataset.gt : el.style.getPropertyValue('--t2')) || 0;
      ts.push(setTimeout(() => el.classList.add('is-on'), reduce ? 0 : ms));
    });
    later.set(pg, ts);
  };
  const hide = (pg) => {
    (later.get(pg) || []).forEach(clearTimeout); later.delete(pg);
    pg.querySelectorAll('.mk.is-on, .gallery.is-on, .blk.is-on').forEach((el) => el.classList.remove('is-on'));
  };

  function makeBook(al, pg) {
    const srcs = [...al.querySelectorAll('li img')].map((im) => im.getAttribute('src'));
    const book = document.createElement('div'); book.className = 'book';
    book.innerHTML = '<span class="book__rings"></span>' + srcs.map((src, i) =>
      '<div class="book__leaf" style="--n:' + i + '"><div class="book__face book__front"><figure class="book__ph"><img src="' + src + '" alt="" decoding="async"></figure>'
      + '<span class="book__no">' + String(i + 1).padStart(2, '0') + '</span></div><div class="book__face book__back"></div></div>').join('');
    al.appendChild(book);
    const leaves = [...book.querySelectorAll('.book__leaf')];
    let k = 0, timer = null, wait = null;
    const flip = () => {
      if (k >= leaves.length - 1) {
        book.classList.add('is-reset'); leaves.forEach((l) => l.classList.remove('is-turned')); k = 0;
        void book.offsetWidth; book.classList.remove('is-reset'); return;
      }
      leaves[k].classList.add('is-turned'); k += 1;
    };
    const stop = () => { clearTimeout(wait); clearInterval(timer); book.classList.add('is-reset'); leaves.forEach((l) => l.classList.remove('is-turned')); k = 0; void book.offsetWidth; book.classList.remove('is-reset'); };
    const loop = () => { clearInterval(timer); timer = setInterval(flip, 2600); };
    const run = () => { stop(); if (reduce) return; wait = setTimeout(() => { flip(); loop(); }, (+al.dataset.gt || 0) + 1600); };
    book.addEventListener('click', () => { clearTimeout(wait); flip(); loop(); });
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); else stop(); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
  }

  document.querySelectorAll('.album').forEach((al) => {
    const pg = al.closest('.page');
    const mode = new URLSearchParams(location.search).get('album') || pg.dataset.album || 'book';
    pg.dataset.album = mode;
    if (mode === 'book') { makeBook(al, pg); return; }
    const cards = [...al.querySelectorAll('li')];
    cards.forEach((c, i) => c.style.setProperty('--i', i));
    let k = -1, timer = null, wait = null;
    const show = (i) => { k = i; cards.forEach((c, j) => c.classList.toggle('is-front', j === i)); al.classList.toggle('has-front', i >= 0); };
    const stop = () => { clearTimeout(wait); clearInterval(timer); show(-1); };
    const loop = () => { clearInterval(timer); timer = setInterval(() => show((k + 1) % cards.length), 2600); };
    const run = () => { stop(); if (reduce) return; wait = setTimeout(() => { show(0); loop(); }, (+al.dataset.gt || 0) + cards.length * 110 + 900); };
    cards.forEach((c, i) => c.addEventListener('click', () => { clearTimeout(wait); show(k === i ? -1 : i); loop(); }));
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); else stop(); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
  });

  const form = document.querySelector('.entry');
  if (form) {
    const fields = [...form.querySelectorAll('.entry__f')];
    form.addEventListener('focusin', (e) => { const f = e.target.closest('.entry__f'); fields.forEach((x) => x.classList.toggle('is-focus', x === f)); });
    form.addEventListener('focusout', (e) => { const f = e.target.closest('.entry__f'); if (f && !f.contains(e.relatedTarget)) f.classList.remove('is-focus'); });
    const msg = form.querySelector('.entry__msg');
    form.querySelector('.entry__send').addEventListener('click', () => {
      const miss = [...form.querySelectorAll('[required]')].filter((el) => !el.value.trim());
      fields.forEach((f) => f.classList.remove('is-miss'));
      miss.forEach((el) => el.closest('.entry__f').classList.add('is-miss'));
      msg.textContent = miss.length ? '必須の項目を入力してください。' : '送信先は準備中です。';
      if (miss.length) miss[0].focus();
    });
    form.addEventListener('submit', (e) => e.preventDefault());
  }

  const sync = () => {
    pages.forEach((pg) => {
      const on = pg.classList.contains('is-active');
      if (on && !pg.classList.contains('play')) { void pg.offsetWidth; pg.classList.add('play'); reveal(pg); }
      if (!on && pg.classList.contains('play')) { pg.classList.remove('play'); hide(pg); }
    });
    column.dataset.page = pages[0].classList.contains('is-active') ? 'top' : '';
  };
  pages.forEach((pg) => new MutationObserver(sync).observe(pg, { attributes: true, attributeFilter: ['class'] }));
  sync();

  pages.forEach((pg, k) => {
    const next = pages[k + 1];
    if (!next || pg.id === 'top') return;
    const a = document.createElement('a');
    a.className = 'nextbtn';
    a.href = '#' + next.id;
    a.setAttribute('aria-label', '次のページへ進む');
    a.innerHTML = '<span aria-hidden="true"><small>NEXT</small>' + next.dataset.stop + '</span>'
      + '<span class="nextbtn__arrow" aria-hidden="true"><i>↓</i></span>';
    a.addEventListener('click', (e) => { e.preventDefault(); next.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    pg.appendChild(a);
  });

  const loader = document.querySelector('.loader');
  if (loader) {
    const num = loader.querySelector('.loader__num');
    const start = performance.now();
    const minMs = reduce ? 0 : 1600;
    let loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    const tick = (now) => {
      const p = Math.min(1, (now - start) / Math.max(1, minMs));
      const shown = loaded ? p : Math.min(p, 0.9);
      num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      if (shown < 1) { requestAnimationFrame(tick); return; }
      setTimeout(() => { loader.classList.add('is-done'); setTimeout(() => loader.remove(), 700); }, reduce ? 0 : 400);
    };
    requestAnimationFrame(tick);
  }
})();
