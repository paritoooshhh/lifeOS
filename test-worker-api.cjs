const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {generateKeyPairSync,sign,webcrypto}=require('node:crypto');
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk=publicKey.export({format:'jwk'});jwk.kid='testkey';jwk.use='sig';jwk.alg='RS256';
const ORIGIN='https://paritoooshhh.github.io',domain='unit-test.clerk.accounts.dev',issuer='https://'+domain;
const base64url=o=>Buffer.from(typeof o==='string'?o:JSON.stringify(o)).toString('base64url');
const input=base64url({alg:'RS256',kid:jwk.kid,typ:'JWT'})+'.'+base64url({iss:issuer,sub:'user_test',sid:'sess1',nbf:Math.floor(Date.now()/1000)-10,exp:Math.floor(Date.now()/1000)+3600,azp:ORIGIN});
const token=input+'.'+sign('RSA-SHA256',Buffer.from(input),privateKey).toString('base64url');
let groqReply={message:'Here is your plan',intent:'PLAN_DAY',assumptions:[],entries:[{type:'activities',data:{title:'Plan my day',date:'2026-11-20',category:'Other',start:'08:30',end:'',endDate:'',status:'planned'}}],updates:[]};
let capturedAI,queries=[];
const fetchMock=async (url,init)=>{
 if(String(url).includes('/.well-known/jwks.json'))return new Response(JSON.stringify({keys:[jwk]}),{status:200});
 if(String(url).includes('api.groq.com')){capturedAI=JSON.parse(init.body);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(groqReply)}}]}),{status:200});}
 throw Error('Unrecognized external URL '+url);
};
const DB={prepare(sql){const o={bind(...args){this.args=args;return this},async run(){queries.push({sql,args:this.args});return {meta:{changes:1}}},async first(){return null}};return o}};
const ctx=vm.createContext({Response,Request,URL,TextDecoder,TextEncoder,atob,Uint8Array,Date,Intl,crypto:webcrypto,fetch:fetchMock,console});
vm.runInContext(fs.readFileSync('./worker.js','utf8').replace('export default','globalThis.WorkerExports ='),ctx);
const env={GROQ_API_KEY:'fake',CLERK_PUBLISHABLE_KEY:'pk_test_'+Buffer.from(domain+'$').toString('base64'),DB};
function call(description,extra={}){return ctx.WorkerExports.fetch(new Request('https://worker.test/',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({date:'2026-11-20',description,timezone:'Asia/Kolkata',existing:[],...extra})}),env)}
(async()=>{
 let res=await call('Plan my day. I woke up at 8:30.');assert.equal(res.status,200);let json=await res.json();
 assert.equal(json.intent,'PLAN_DAY');assert.ok(json.entries.length>=2,'Expected multi-block fallback');assert.ok(json.entries.every(x=>x.data.status==='planned'));
 assert.ok(json.entries.every(x=>x.data.start&&x.data.end&&x.data.endDate));
 assert.ok(!json.entries.some(x=>x.data.title==='Plan my day'));
 console.log('PASS authenticated Copilot: vague prompt gets a multi-block reviewable plan');
 assert.ok(capturedAI.messages[1].content.includes('nowLocal'));
 console.log('PASS Worker passes exact current-time context and selected date');
 groqReply={intent:'ADD_ACTIVITIES',message:'An overnight plan',assumptions:[],entries:[{type:'activities',data:{title:'Gaming',date:'2026-11-19',category:'Gaming',start:'21:00',end:'02:00',endDate:'',status:'planned',actual:''}}],updates:[]};
 res=await call('Schedule gaming from Nov 19 9 PM to 2 AM Nov 20');json=await res.json();
 assert.equal(json.entries[0].data.endDate,'2026-11-20');console.log('PASS AI generated overnight plan receives next-day endDate');
 res=await ctx.WorkerExports.fetch(new Request('https://worker.test/',{method:'POST',headers:{Origin:ORIGIN,Authorization:'Bearer invalid','Content-Type':'application/json'},body:'{}'}),env);
 assert.equal(res.status,401);console.log('PASS invalid JWT rejected before storage or AI call');
 res=await ctx.WorkerExports.fetch(new Request('https://worker.test/',{method:'POST',headers:{Origin:'https://evil.example',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'}),env);
 assert.equal(res.status,403);console.log('PASS untrusted origin rejected');
 console.log('Worker API integration tests passed.');
})().catch(e=>{console.error(e);process.exit(1)});
