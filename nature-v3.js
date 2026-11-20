/* LifeOS v3 · Living Nature. Only UI preferences and presentation; no app records or sync changes. */
(() => {
  'use strict';
  const STORAGE_KEY = 'lifeos.v3.nature.themePreference';
  const modes = [
    {id:'morning',name:'Kerala Green',label:'Morning',icon:'❧',background:'#eaf3e5',color:'#347848',period:'05:00 – 11:59',caption:'A greener beginning'},
    {id:'afternoon',name:'Ocean Blue',label:'Afternoon',icon:'≋',background:'#e5f1f8',color:'#2e7ca8',period:'12:00 – 16:59',caption:'Find your flow'},
    {id:'evening',name:'Golden Hour',label:'Evening',icon:'☼',background:'#fff0d3',color:'#b76e17',period:'17:00 – 20:59',caption:'Golden moments'},
    {id:'night',name:'Deep Indigo',label:'Night',icon:'✦',background:'#121f36',color:'#b3ccf0',period:'21:00 – 04:59',caption:'Find your quiet'}
  ];
  const byId = Object.fromEntries(modes.map(m => [m.id,m]));
  let preference = 'auto';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'auto' || byId[saved]) preference = saved;
  } catch (_) {}
  const autoMode = (date = new Date()) => {
    const h = date.getHours();
    return h >= 5 && h < 12 ? 'morning' : h < 17 && h >= 12 ? 'afternoon' : h >= 17 && h < 21 ? 'evening' : 'night';
  };
  let lastMode = null;
  const currentMode = () => preference === 'auto' ? autoMode() : preference;
  function syncControls() {
    document.querySelectorAll('[data-nature-mode]').forEach(button => {
      const active = button.dataset.natureMode === preference;
      button.setAttribute('aria-pressed',String(active));
    });
    const toggle = document.getElementById('theme');
    if (toggle) {
      toggle.textContent = '◐';
      toggle.setAttribute('aria-label',`Theme: ${byId[currentMode()].name}. Choose time-of-day appearance`);
      toggle.title = 'Choose nature theme';
    }
    const name = document.querySelector('.nature-note-title');
    const sub = document.querySelector('.nature-note-subtitle');
    const label = document.querySelector('.nature-note-label');
    if (name) name.textContent = byId[currentMode()].name;
    if (sub) sub.textContent = byId[currentMode()].caption;
    if (label) label.textContent = preference === 'auto' ? 'AUTO · LOCAL TIME' : 'MANUAL · YOUR THEME';
    const settingsCurrent = document.getElementById('natureCurrentTheme');
    if (settingsCurrent) settingsCurrent.textContent = `${byId[currentMode()].label} · ${byId[currentMode()].name}${preference==='auto'?' (automatic)':''}`;
  }
  function apply() {
    const selected = currentMode();
    if (!byId[selected]) return;
    document.body.dataset.lifeosTheme = selected;
    document.body.dataset.lifeosChoice = preference;
    document.documentElement.style.backgroundColor = byId[selected].background;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = byId[selected].background;
    if (lastMode !== selected) {
      lastMode = selected;
      document.dispatchEvent(new CustomEvent('lifeos:naturetheme', {detail:{mode:selected,preference}}));
    }
    syncControls();
  }
  function select(mode) {
    if (mode !== 'auto' && !byId[mode]) return;
    preference = mode;
    try { localStorage.setItem(STORAGE_KEY,mode); } catch (_) {}
    apply();
    const dialog = document.querySelector('#natureThemeDialog');
    if (dialog?.open) dialog.close();
  }
  const modeButton = (mode) => {
    if (mode === 'auto') return '<button type="button" class="nature-mode-option" data-nature-mode="auto"><span class="nature-swatch" style="--swatch-bg:var(--panel2);--swatch-ink:var(--accent)">◷</span><span><strong>Automatic</strong><small>Follow your local time</small></span></button>';
    const m = byId[mode];
    return `<button type="button" class="nature-mode-option" data-nature-mode="${m.id}"><span class="nature-swatch" style="--swatch-bg:${m.background};--swatch-ink:${m.color}">${m.icon}</span><span><strong>${m.name}</strong><small>${m.label}</small></span></button>`;
  };
  const choices = () => `<div class="nature-mode-grid">${['auto',...modes.map(m => m.id)].map(modeButton).join('')}</div>`;
  function openThemeMenu() {
    const dialog = document.getElementById('natureThemeDialog');
    if (!dialog) return;
    syncControls();
    if (!dialog.open) dialog.showModal();
  }
  function injectSettings() {
    const main = document.getElementById('main');
    if (!main || main.querySelector('#natureSettingsPanel')) return;
    const h = main.querySelector('.heading h1');
    if (!h || !/^Settings/.test(h.textContent.trim())) return;
    const card = document.createElement('section');
    card.id = 'natureSettingsPanel';
    card.className = 'card nature-settings-panel';
    card.innerHTML = '<div class="life-card-heading"><h2>Living Nature themes</h2><span class="life-soft-tag">LifeOS v3</span></div><p>Four monochromatic landscapes that follow the day. Choose a fixed look or let LifeOS transition automatically.</p><div class="nature-settings-choice"><span class="nature-settings-swatch" aria-hidden="true"></span><strong id="natureCurrentTheme"></strong><button class="secondary small" type="button" data-open-nature-theme>Change theme</button></div>';
    main.querySelector('.heading')?.insertAdjacentElement('afterend',card);
    syncControls();
  }
  function init() {
    const app = document.getElementById('app');
    if (app && !app.querySelector('.nature-ornament')) {
      const ornament = document.createElement('div');
      ornament.className = 'nature-ornament';
      ornament.setAttribute('aria-hidden','true');
      app.insertBefore(ornament,app.firstChild);
    }
    if (app && !app.querySelector('.nature-sidebar-note')) {
      const note = document.createElement('div');
      note.className = 'nature-sidebar-note';
      note.setAttribute('aria-label','Current appearance');
      note.innerHTML = '<span class="nature-note-label">AUTO · LOCAL TIME</span><strong class="nature-note-title">Kerala Green</strong><span class="nature-note-subtitle">A greener beginning</span>';
      app.querySelector('.top')?.insertBefore(note,app.querySelector('.topright'));
    }
    if (!document.getElementById('natureThemeDialog')) {
      const d = document.createElement('dialog');
      d.id = 'natureThemeDialog';
      d.className = 'nature-theme-dialog';
      d.setAttribute('aria-labelledby','natureDialogHeading');
      d.innerHTML = `<div class="nature-dialog-title"><div><p>LifeOS v3 · Living Nature</p><h2 id="natureDialogHeading">Choose your atmosphere</h2></div><button class="iconbtn" aria-label="Close theme chooser" data-close-nature-theme type="button">×</button></div>${choices()}<p class="nature-theme-footnote">Automatic mode uses your device's local time. Manual preferences stay on this device and never modify your LifeOS records.</p>`;
      document.body.appendChild(d);
      d.addEventListener('click',e => {if (e.target === d) d.close();});
    }
    const main = document.getElementById('main');
    if (main && window.MutationObserver) {
      const obs = new MutationObserver(() => injectSettings());
      obs.observe(main,{childList:true});
    }
    injectSettings();
    apply();
    window.addEventListener('pageshow',apply);
    document.addEventListener('visibilitychange',() => {if (!document.hidden) apply();});
  }
  document.addEventListener('click', e => {
    const option = e.target.closest('[data-nature-mode]');
    if (option) select(option.dataset.natureMode);
    if (e.target.closest('[data-open-nature-theme]')) openThemeMenu();
    if (e.target.closest('[data-close-nature-theme]')) document.querySelector('#natureThemeDialog')?.close();
  });
  // The theme artwork follows the scroll gently, without interfering with controls.
  let raf = 0;
  function onScroll() {
    if (raf || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const offset = Math.min(22,window.scrollY * .028);
      const app = document.getElementById('app');
      app?.style.setProperty('--nature-parallax',`${-offset}px`);
      app?.style.setProperty('--nature-angle',`${Math.min(42,window.scrollY*.045)}deg`);
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.setInterval(() => { if (preference === 'auto') apply(); },60_000);
  window.LifeOSNature = Object.freeze({apply,select,openThemeMenu,currentMode,autoMode,getPreference:()=>preference,modes});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
