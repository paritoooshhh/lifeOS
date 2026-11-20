/* LifeOS v3 presentation enhancements: no data model, sync, or scheduling changes. */
(() => {
  'use strict';
  const prefersLessMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !(prefersLessMotion?.matches);
  const main = document.getElementById('main');
  const nav = document.getElementById('nav');
  const region = document.getElementById('v3ToastRegion');
  let priorView = null;
  let priorProgress = null;
  let toastTimeout;
  let lastToast;

  function toast(message) {
    if (!region || !message) return;
    if (lastToast?.isConnected) lastToast.remove();
    if (toastTimeout) clearTimeout(toastTimeout);
    const node = document.createElement('div');
    node.className = 'v3-toast';
    node.setAttribute('role', 'status');
    const icon = document.createElement('span');
    icon.className = 'v3-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg class="v3-icon"><use href="#v3-check"></use></svg>';
    const msg = document.createElement('span');
    msg.textContent = String(message).slice(0, 180);
    node.append(icon, msg);
    region.appendChild(node);
    lastToast = node;
    toastTimeout = setTimeout(() => {
      node.classList.add('v3-exit');
      setTimeout(() => node.remove(), motionAllowed() ? 220 : 0);
    }, 3100);
  }

  function afterRender() {
    if (!main) return;
    const active = nav?.querySelector('button.active');
    const selectedDate = main.querySelector('#datePick')?.value || '';
    const viewKey = `${active?.dataset.tab || 'settings'}|${selectedDate}`;
    nav?.querySelectorAll('button[data-tab]').forEach(button => {
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    if (priorView !== null && priorView !== viewKey && motionAllowed()) {
      main.classList.remove('v3-page-enter');
      // New content is already rendered; animate the change without delaying input.
      void main.offsetWidth;
      main.classList.add('v3-page-enter');
    }
    priorView = viewKey;

    const ring = main.querySelector('.life-ring');
    if (ring) {
      const value = ring.style.getPropertyValue('--ring').trim();
      const parsed = /^\d+(?:\.\d+)?%$/.test(value) ? value : null;
      if (parsed) {
        if (motionAllowed() && priorProgress !== parsed) {
          ring.style.setProperty('--ring', priorProgress || '0%');
          requestAnimationFrame(() => requestAnimationFrame(() => {
            if (ring.isConnected) ring.style.setProperty('--ring', parsed);
          }));
        }
        priorProgress = parsed;
      }
    }
  }

  if (main && window.MutationObserver) {
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList' && m.target === main)) afterRender();
    });
    observer.observe(main, {childList:true});
  }

  // Apply the same gentle exit motion to both existing native HTML dialogs.
  // The original close() method is invoked afterward, preserving all native semantics.
  const nativeDialog = window.HTMLDialogElement?.prototype;
  if (nativeDialog && typeof nativeDialog.close === 'function') {
    const closeNative = nativeDialog.close;
    nativeDialog.close = function(returnValue) {
      const eligible = (this.id === 'modal' || this.id === 'timingReview') && this.open;
      if (!eligible || !motionAllowed()) return closeNative.call(this, returnValue);
      if (this.classList.contains('v3-closing')) return;
      this.classList.add('v3-closing');
      const dialog = this;
      setTimeout(() => {
        dialog.classList.remove('v3-closing');
        if (dialog.open) closeNative.call(dialog, returnValue);
      }, 185);
    };
  }

  for (const dialog of [document.getElementById('modal'), document.getElementById('timingReview')]) {
    if (!dialog) continue;
    dialog.addEventListener('cancel', event => {
      if (!motionAllowed()) return;
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialog.classList.remove('v3-closing');
    });
  }

  const timing = document.getElementById('timingReview');
  timing?.addEventListener('click', event => {
    const shortcut = event.target.closest('[data-tr-offset]');
    const step = event.target.closest('[data-tr-step]');
    if (shortcut) {
      timing.querySelectorAll('[data-tr-offset]').forEach(button =>
        button.classList.toggle('v3-selected', button === shortcut));
    }
    if (step && motionAllowed()) {
      step.classList.remove('v3-tap');
      void step.offsetWidth;
      step.classList.add('v3-tap');
    }
  });
  // A new review must never inherit a highlighted shortcut from the previous activity.
  timing?.addEventListener('close', () => {
    timing.querySelectorAll('[data-tr-offset]').forEach(button => button.classList.remove('v3-selected'));
  });

  window.LifeOSV3 = Object.freeze({toast});
})();
