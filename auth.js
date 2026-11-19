/* LifeOS Clerk browser integration: no secret keys in frontend. */
(async()=>{
 const status=document.getElementById('authStatus'),gate=document.getElementById('authGate'),retry=document.getElementById('authRetry');
 const config=window.LIFEOS_CONFIG;
 const endpoint=()=>{try{return JSON.parse(localStorage.getItem('lifeos.ai.config')||'{}').url||config.workerUrl||''}catch{return config.workerUrl||''}};
 async function start(){
  retry.hidden=true;status.textContent='Loading secure sign-in…';
  try{
   if(!config.clerkPublishableKey)throw Error('Missing Clerk publishable key in config.js');


const encodedDomain = config.clerkPublishableKey
  .replace(/^pk_(test|live)_/, '');

const clerkDomain = atob(encodedDomain)
  .replace(/\$$/, '');


async function loadScript(url, publishableKey) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';

    if (publishableKey) {
      script.setAttribute('data-clerk-publishable-key', publishableKey);
    }

    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Clerk: ' + url));
    document.head.appendChild(script);
  });
}

if (!window.Clerk) {
  await loadScript(
    `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`
  );

  await loadScript(
    `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,
    config.clerkPublishableKey
  );
}

await window.Clerk.load({
  ui: { ClerkUI: window.__internal_ClerkUICtor }
});

   if(!window.Clerk.user){status.textContent='Sign in to your private LifeOS';window.Clerk.mountSignIn(document.getElementById('clerkSignIn'),{routing:'hash'});window.Clerk.addListener(({user})=>{if(user)location.reload()});return}
   window.Clerk.unmountSignIn(document.getElementById('clerkSignIn'));
   window.lifeosUserId=window.Clerk.user.id;
   window.lifeosEmail=window.Clerk.user.primaryEmailAddress?.emailAddress||'';
   window.lifeosToken=async()=>{const token=await window.Clerk.session?.getToken();if(!token)throw Error('Not signed in');return token};
   window.lifeosApi=async(path,method='GET',payload)=>{
    const base=endpoint();if(!base)throw Error('Configure the Cloudflare Worker URL in config.js or AI settings');
    const response=await fetch(base.replace(/\/$/,'')+path,{method,headers:{Authorization:'Bearer '+await window.lifeosToken(),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
    let data;try{data=await response.json()}catch{data={error:'Invalid server response'}};
    if(!response.ok){const error=Error(data.error||'Request failed ('+response.status+')');error.status=response.status;throw error}return data;
   };
   status.textContent='Loading your private cloud records…';
   const storageKey='lifeos.data.v1.'+window.lifeosUserId;
   try{const cloud=await window.lifeosApi('/sync');window.lifeosCloudRevision=cloud.revision||0;
     if(cloud.data)localStorage.setItem(storageKey,JSON.stringify(cloud.data));
     else localStorage.removeItem(storageKey);
   }catch(e){if(e.status===401||e.status===403)throw e;
     // Do not load stale local data silently when cloud unavailable.
     throw Error('Cloud connection required for first login: '+e.message)
   }
   for(const file of ['ai.js','app.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=file;s.onload=resolve;s.onerror=()=>reject(Error('Could not load '+file));document.body.appendChild(s)});
   gate.hidden=true;document.getElementById('app').hidden=false;
   document.getElementById('account').addEventListener('click',async()=>{if(confirm('Sign out of LifeOS?')){await window.Clerk.signOut();location.reload()}});
  }catch(e){status.textContent=e.message||'Could not initialize LifeOS';retry.hidden=false}
 }
 retry.addEventListener('click',()=>location.reload());
 await start();
})();
