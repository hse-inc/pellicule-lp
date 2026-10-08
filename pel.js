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
    let t = 450;
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
      if (el.matches('.film')) {
        el.querySelectorAll('.film__f').forEach((f, k) => { t = Math.max(t, 2000 + k * 250); f.querySelectorAll('.kara').forEach((x) => { wrapEl(x); }); });
        t += BLOCK_GAP; return;
      }
      const targets = el.matches('.kara') ? [el] : [...el.querySelectorAll('.kara')];
      targets.forEach(wrap);
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
    const run = () => { clearInterval(timer); a = 0; set(); if (!reduce) timer = setInterval(() => { a = (a + 1) % N; set(); }, 2200); };
    new MutationObserver(() => { if (pg.classList.contains('play')) run(); else clearInterval(timer); }).observe(pg, { attributes: true, attributeFilter: ['class'] });
  }

  const sync = () => {
    pages.forEach((pg) => {
      const on = pg.classList.contains('is-active');
      if (on && !pg.classList.contains('play')) { void pg.offsetWidth; pg.classList.add('play'); }
      if (!on && pg.classList.contains('play')) pg.classList.remove('play');
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
