
/* LifeOS authentication and cloud synchronization */

(async () => {
  const status = document.getElementById('authStatus');
  const gate = document.getElementById('authGate');
  const retry = document.getElementById('authRetry');
  const config = window.LIFEOS_CONFIG || {};

  const APP_URL = 'https://paritoooshhh.github.io/lifeOS/';

  const endpoint = () => {
    if (config.workerUrl && !config.workerUrl.includes('REPLACE-WITH-YOUR-WORKER')) {
      return config.workerUrl;
    }

    try {
      return JSON.parse(
        localStorage.getItem('lifeos.ai.config') || '{}'
      ).url || '';
    } catch {
      return '';
    }
  };

  const loadScript = (url, pk) => new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';

    if (pk) {
      script.setAttribute('data-clerk-publishable-key', pk);
    }

    script.onload = resolve;
    script.onerror = () => reject(
      new Error('Failed to load Clerk script: ' + url)
    );

    document.head.appendChild(script);
  });

  async function start() {
    retry.hidden = true;
    status.textContent = 'Loading secure sign-in…';

    try {
      if (!config.clerkPublishableKey) {
        throw new Error('Missing Clerk publishable key in config.js');
      }

      const key = config.clerkPublishableKey;

      const encoded = key.replace(/^pk_(?:test|live)_/, '');

      let clerkDomain;

      try {
        clerkDomain = atob(
          encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(encoded.length / 4) * 4, '=')
        ).replace(/\$$/, '');
      } catch {
        throw new Error('Invalid Clerk publishable key');
      }

      if (!/^[a-z0-9.-]+$/.test(clerkDomain)) {
        throw new Error('Invalid Clerk frontend domain');
      }

      if (!window.Clerk) {
        await loadScript(
          `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`
        );

        await loadScript(
          `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,
          key
        );
      }

      if (!window.Clerk) {
        throw new Error('Clerk SDK did not initialize');
      }

      await window.Clerk.load({
        ui: {
          ClerkUI: window.__internal_ClerkUICtor
        },
        signInFallbackRedirectUrl: APP_URL,
        signUpFallbackRedirectUrl: APP_URL,
        signInForceRedirectUrl: APP_URL,
        signUpForceRedirectUrl: APP_URL
      });

      if (!window.Clerk.user) {
        status.textContent = 'Sign in to your private LifeOS';

        window.Clerk.mountSignIn(
          document.getElementById('clerkSignIn'),
          {
            routing: 'hash',
            fallbackRedirectUrl: APP_URL,
            forceRedirectUrl: APP_URL
          }
        );

        window.Clerk.addListener(({ user }) => {
          if (user) {
            window.location.replace(APP_URL);
          }
        });

        return;
      }

      try {
        window.Clerk.unmountSignIn(
          document.getElementById('clerkSignIn')
        );
      } catch {}

      window.lifeosUserId = window.Clerk.user.id;

      window.lifeosEmail =
        window.Clerk.user.primaryEmailAddress?.emailAddress || '';

      window.lifeosToken = async () => {
        const token = await window.Clerk.session?.getToken();

        if (!token) {
          throw new Error('Not signed in');
        }

        return token;
      };

      window.lifeosApi = async (path, method = 'GET', payload) => {
        const base = endpoint();

        if (!base) {
          throw new Error(
            'Set your Cloudflare Worker URL in config.js'
          );
        }

        const response = await fetch(
          base.replace(/\/$/, '') + path,
          {
            method,
            headers: {
              Authorization: 'Bearer ' + await window.lifeosToken(),
              ...(payload !== undefined
                ? { 'Content-Type': 'application/json' }
                : {})
            },
            body: payload !== undefined
              ? JSON.stringify(payload)
              : undefined
          }
        );

        let data;

        try {
          data = await response.json();
        } catch {
          data = {
            error: 'Invalid server response'
          };
        }

        if (!response.ok) {
          const error = new Error(
            data.error || 'Request failed (' + response.status + ')'
          );

          error.status = response.status;
          throw error;
        }

        return data;
      };

      status.textContent = 'Loading your private cloud records…';

      const storageKey =
        'lifeos.data.v1.' + window.lifeosUserId;

      const dirtyKey =
        'lifeos.cloud.dirty.' + window.lifeosUserId;

      try {
        const cloud = await window.lifeosApi('/sync');

        window.lifeosCloudRevision = cloud.revision || 0;

        if (localStorage.getItem(dirtyKey) === '1') {
          if (!localStorage.getItem(storageKey)) {
            throw new Error(
              'Unsynced changes flag found without local data'
            );
          }

          window.lifeosHasPendingChanges = true;
        } else if (cloud.data) {
          localStorage.setItem(
            storageKey,
            JSON.stringify(cloud.data)
          );
        } else {
          localStorage.removeItem(storageKey);
        }

      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          throw error;
        }

        throw new Error(
          'Cloud connection required: ' + error.message
        );
      }

      for (const file of ['ai.js', 'app.js']) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');

          script.src = file;
          script.onload = resolve;
          script.onerror = () => reject(
            new Error('Could not load ' + file)
          );

          document.body.appendChild(script);
        });
      }

      gate.hidden = true;
      document.getElementById('app').hidden = false;

      document.getElementById('account').addEventListener(
        'click',
        async () => {
          if (!confirm('Sign out of LifeOS?')) {
            return;
          }

          try {
            await window.Clerk.signOut({
              redirectUrl: APP_URL
            });

            window.location.replace(APP_URL);
          } catch (error) {
            alert('Sign out failed: ' + error.message);
          }
        }
      );

    } catch (error) {
      console.error('LifeOS initialization failed:', error);

      status.textContent =
        error.message || 'Could not initialize LifeOS';

      retry.hidden = false;
    }
  }

  retry.addEventListener('click', () => {
    window.location.reload();
  });

  await start();
})();
