/* LifeOS Clerk browser integration: no secret keys in frontend. */
(async()=>{
 const status=document.getElementById('authStatus'),gate=document.getElementById('authGate'),retry=document.getElementById('authRetry');
 const config=window.LIFEOS_CONFIG;
 const endpoint=()=>{try{return JSON.parse(localStorage.getItem('lifeos.ai.config')||'{}').url||config.workerUrl||''}catch{return config.workerUrl||''}};
 async function start(){
  retry.hidden=true;status.textContent='Loading secure sign-in…';
  try{
   if(!config.clerkPublishableKey)throw Error('Missing Clerk publishable key in config.js');
   // Clerk publishes its browser bundles through this application's Frontend API.
   // Decode the ENTIRE base64 portion of pk_test_... (not split('_')[2]).
   const key=config.clerkPublishableKey;
   const encoded=key.replace(/^pk_(?:test|live)_/, '');
   let clerkDomain;
   try { clerkDomain=atob(encoded.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(encoded.length/4)*4,'=')).replace(/\$$/,''); }
   catch { throw Error('Invalid Clerk publishable key'); }
   if(!/^[a-z0-9.-]+\.clerk\.(?:accounts\.dev|com)$/.test(clerkDomain)) throw Error('Invalid Clerk frontend domain');
   const loadScript=(url,pk)=>new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src=url;
     script.async=true;
     script.crossOrigin='anonymous';
     if(pk)script.setAttribute('data-clerk-publishable-key',pk);
     script.onload=resolve;
     script.onerror=()=>reject(Error('Failed to load Clerk script: '+url));
     document.head.appendChild(script);
   });
   if(!window.Clerk){
     await loadScript(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);
     await loadScript(`https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,key);
   }
   if(!window.Clerk)throw Error('Clerk SDK did not initialize');
   await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
   if(!window.Clerk.user){status.textContent='Sign in to your private LifeOS';window.Clerk.mountSignIn(document.getElementById('clerkSignIn'),{routing:'hash'});window.Clerk.addListener(({user})=>{if(user)location.reload()});return}
   try{window.Clerk.unmountSignIn(document.getElementById('clerkSignIn'))}catch{}
   window.lifeosUserId=window.Clerk.user.id;
   window.lifeosEmail=window.Clerk.user.primaryEmailAddress?.emailAddress||'';
   window.lifeosToken=async()=>{const token=await window.Clerk.session?.getToken();if(!token)throw Error('Not signed in');return token};
   window.lifeosApi=async(path,method='GET',payload)=>{
    const base=endpoint();if(!base||base.includes('REPLACE-WITH-YOUR-WORKER'))throw Error('Set your real Cloudflare Worker URL in config.js');
    const response=await fetch(base.replace(/\/$/,'')+path,{method,headers:{Authorization:'Bearer '+await window.lifeosToken(),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
    let data;try{data=await response.json()}catch{data={error:'Invalid server response'}};
    if(!response.ok){const error=Error(data.error||'Request failed ('+response.status+')');error.status=response.status;throw error}return data;
   };
   status.textContent='Loading your private cloud records…';
   const storageKey='lifeos.data.v1.'+window.lifeosUserId;
   const dirtyKey='lifeos.cloud.dirty.'+window.lifeosUserId;
   try{const cloud=await window.lifeosApi('/sync');window.lifeosCloudRevision=cloud.revision||0;
     // Never overwrite offline changes awaiting upload.
     if(localStorage.getItem(dirtyKey)==='1'){
       if(!localStorage.getItem(storageKey))throw Error('Unsynced changes flag found without local data');
       window.lifeosHasPendingChanges=true;
     }else if(cloud.data)localStorage.setItem(storageKey,JSON.stringify(cloud.data));
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
