(() => {
  const slider = document.getElementById('slider');
  const column = document.querySelector('.column');
  const pages = [...slider.querySelectorAll('.page')];
  const total = pages.length - 1;
  const pad = (n) => String(n).padStart(2, '0');

  const pagerNow = document.querySelector('.pager__now');
  const pagerBar = document.querySelector('.pager__bar i');
  const railNow = document.querySelector('.rail-side__now');
  const railName = document.querySelector('.rail-side__name');
  document.querySelector('.pager__all').textContent = pad(total);

  pages.forEach((page) => {
    page.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--i', i));
  });

  let current = 0;
  const activate = (index) => {
    current = index;
    const page = pages[index];
    pages.forEach((p) => p.classList.toggle('is-active', p === page));
    column.dataset.tone = page.dataset.tone;
    pagerNow.textContent = pad(index);
    if (pagerBar) pagerBar.style.setProperty('--p', total ? index / total : 0);
    if (railNow) railNow.textContent = pad(index);
    if (railName) railName.textContent = page.dataset.label;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) activate(pages.indexOf(e.target));
    });
  }, { root: slider, threshold: 0.6 });
  pages.forEach((p) => io.observe(p));
  activate(0);

  const indexFromScroll = () => {
    if (!slider.clientHeight) return null;
    return Math.max(0, Math.min(pages.length - 1, Math.round(slider.scrollTop / slider.clientHeight)));
  };
  let syncing = false;
  slider.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    requestAnimationFrame(() => {
      syncing = false;
      const i = indexFromScroll();
      if (i !== null && i !== current) activate(i);
    });
  }, { passive: true });
  window.addEventListener('load', () => {
    const i = indexFromScroll();
    if (i !== null && i !== current) activate(i);
  });

  const go = (index) => {
    const i = Math.max(0, Math.min(pages.length - 1, index));
    pages[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let locked = false, acc = 0, accTimer = null;
  const insideScroll = (target, dy) => {
    const pg = target.closest && target.closest('.page--scroll');
    const box = pg && pg.querySelector('.page__inner');
    if (!box) return null;
    const now = performance.now();
    const can = dy > 0 ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0;
    if (can) { box.__t = now; return 'scroll'; }
    if (box.__t && now - box.__t < 450) { box.__t = now; return 'hold'; }
    return null;
  };
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    const inside = insideScroll(e.target, e.deltaY);
    if (inside === 'scroll') return;
    if (inside === 'hold') { e.preventDefault(); return; }
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.target.closest && e.target.closest('.route__track')) return;
    e.preventDefault();
    if (locked) return;
    acc += e.deltaY;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => { acc = 0; }, 220);
    if (Math.abs(acc) < 12) return;
    locked = true;
    go(current + (acc > 0 ? 1 : -1));
    acc = 0;
    setTimeout(() => { locked = false; }, 950);
  }, { passive: false });

  let tY = null, tAtEnd = false, tAtTop = false, tBox = null;
  window.addEventListener('touchstart', (e) => {
    const pg = e.target.closest && e.target.closest('.page--scroll');
    tBox = pg && pg.querySelector('.page__inner');
    if (!tBox) { tY = null; return; }
    tY = e.touches[0].clientY;
    tAtEnd = tBox.scrollTop + tBox.clientHeight >= tBox.scrollHeight - 2;
    tAtTop = tBox.scrollTop <= 1;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (tY === null || !tBox) return;
    const dy = e.changedTouches[0].clientY - tY;
    const nowEnd = tBox.scrollTop + tBox.clientHeight >= tBox.scrollHeight - 2;
    if (dy < -50 && tAtEnd && nowEnd) go(current + 1);
    else if (dy > 50 && tAtTop && tBox.scrollTop <= 1) go(current - 1);
    tY = null;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); go(current + 1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.check').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });
})();
