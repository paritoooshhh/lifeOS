/* LifeOS v2 conversational proposal review. No model can persist data without user approval. */
let aiPrompt='',aiDraft=null,aiBusy=false,aiError='';
const AI_TYPES=['activities','logs','learning','workouts','relationships','expenses'];
const AI_FIELDS={activities:['title','date','category','start','end','endDate','priority','status','actual','notes'],logs:['title','date','category','start','end','endDate','actual','notes'],learning:['subject','topic','date','actual','status','revision','resource','notes'],workouts:['date','type','exercise','sets','reps','weight','bodyweight','actual','recovery','pr','notes'],relationships:['person','date','kind','actual','notes'],expenses:['amount','date','category','method','description']};
const aiSettings=()=>{try{const o=JSON.parse(localStorage.getItem('lifeos.ai.config')||'{}');return {...o,url:o.url||window.LIFEOS_CONFIG.workerUrl}}catch{return {url:window.LIFEOS_CONFIG.workerUrl}}};
function aiConfigure(){let old=aiSettings(),url=prompt('Cloudflare Worker HTTPS URL',old.url||window.LIFEOS_CONFIG.workerUrl||'');if(url===null)return;url=url.trim().replace(/\/$/,'');if(!/^https:\/\/[\w.-]+(?:\/[\w/-]*)?$/.test(url)){alert('Enter a valid HTTPS Worker URL');return}localStorage.setItem('lifeos.ai.config',JSON.stringify({url}));alert('Endpoint saved. Clerk handles sign-in.');render()}
function aiView(){
 const config=aiSettings(),proposal=aiDraft;
 const promptSection=`<p class="sub">Ask naturally. Copilot uses your selected date, current clock, and existing planned activities. New entries and updates need approval before saving. Private data is sent to your configured Worker and its AI provider.</p><div class="copilot-prompts"><button class="secondary small" data-ai-template="Plan my day. I woke up at 8:30. Suggest a realistic day around my existing commitments.">Plan my day</button><button class="secondary small" data-ai-template="Reorganize my unfinished activities today. Preserve fixed commitments and allow breaks.">Replan today</button><button class="secondary small" data-ai-template="Suggest two focus blocks for technical work today, with realistic breaks.">Focus blocks</button></div><div class="field"><label for="aiPrompt">Tell LifeOS what you need</label><textarea id="aiPrompt" rows="5" placeholder="Plan my day, I woke up at 8:30…">${esc(aiPrompt)}</textarea></div><div class="flex">${btn(aiBusy?'Thinking…':'✦ Generate proposal','aiGenerate','primary')}${btn('Configure AI endpoint','aiConfigure')}</div><p class="sub">${config.url?'Worker configured':'Configure the Worker endpoint first'} · Groq account limits apply</p>${aiError?`<div class="notice" role="alert">${esc(aiError)}</div>`:''}`;
 let review=empty('Copilot proposals and answers will appear here. Nothing is applied automatically.');
 if(proposal){
  const assumptions=(proposal.assumptions||[]).length?`<div class="notice"><strong>Assumptions</strong><ul>${proposal.assumptions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'';
  const updates=(proposal.updates||[]).map((u,i)=>{const x=db.activities.find(a=>a.id===u.id),when=u.action==='move'?`${esc(u.date)} ${esc(u.start)}–${esc(u.end)} (${esc(u.endDate)})`:u.action;return `<div class="ai-suggestion"><label class="flex"><input type="checkbox" data-ai-update-index="${i}" checked><strong>Change existing activity</strong></label><strong>${esc(x?.title||'Activity')}</strong><small>${esc(when)} · Review before applying</small></div>`}).join('');
  const entries=(proposal.entries||[]).map((item,i)=>`<div class="ai-suggestion"><label class="flex"><input type="checkbox" data-ai-index="${i}" checked><strong>${esc(item.type)}</strong></label><strong>${esc(item.data.title||item.data.topic||item.data.exercise||item.data.description||item.data.person||'Entry')}</strong><small>${esc(item.data.date||date)} · ${esc(item.data.start||'Flexible')}${item.data.end?'–'+esc(item.data.end):''}${item.data.endDate&&item.data.endDate!==item.data.date?' ('+esc(item.data.endDate)+')':''}</small><details><summary>Review or edit fields</summary>${AI_FIELDS[item.type].map(k=>`<div class="field"><label>${esc(k)}</label><input data-ai-field="${i}:${k}" value="${esc(item.data[k]??'')}"></div>`).join('')}</details></div>`).join('');
  review=`<p class="sub">${esc(proposal.message||'Review before saving.')}</p>${proposal.intent?`<span class="life-soft-tag">${esc(proposal.intent.replaceAll('_',' ').toLowerCase())}</span>`:''}${assumptions}${entries}${updates}${entries||updates?btn('Apply selected changes','aiApply','primary'):empty('No changes proposed. You can ask a follow-up or try another request.')}`;
 }
 return heading('LifeOS Copilot','Understand the intention. Review the proposal. Apply only what you approve.')+`<div class="grid">${section('Talk to LifeOS',promptSection,'span7')}${section('Review proposed changes',review,'span5')}</div>`;
}
async function aiGenerate(){
 if(aiBusy)return;
 const config=aiSettings();if(!config.url){aiError='Configure the Cloudflare Worker endpoint first.';render();return}
 if(!aiPrompt.trim()){aiError='Describe your request first.';render();return}
 aiBusy=true;aiDraft=null;aiError='';render();
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);let response;
  const existing=db.activities.filter(x=>x.date===date||(x.endDate&&x.endDate>=date&&x.date<=date)).slice(0,30).map(x=>({id:x.id,title:x.title,date:x.date,start:x.start||'',end:x.end||'',endDate:x.endDate||'',status:x.status,category:x.category}));
  const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Kolkata';
  try{response=await fetch(config.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+await window.lifeosToken()},body:JSON.stringify({description:aiPrompt,date,timezone,existing}),signal:controller.signal})}finally{clearTimeout(timer)}
  if(response.status===401)throw Error('Session expired. Please sign in again.');
  if(!response.ok){const result=await response.json().catch(()=>({}));throw Error(result.error?`${result.error}${result.detail?': '+result.detail:''}`:`AI service returned ${response.status}`)}
  const result=await response.json();if(!Array.isArray(result.entries))throw Error('Unexpected Copilot response');
  const planning=/\b(plan|schedule|organize|organise|structure|replan)\b/i.test(aiPrompt);
  const clean=result.entries.filter(x=>AI_TYPES.includes(x.type)&&x.data&&typeof x.data==='object')
   .filter(x=>!(planning&&x.type==='activities'&&/^(?:plan|schedule|organize|organise)(?: my| the| a)? day\.?$/i.test(String(x.data.title||'').trim())))
   .slice(0,30).map(x=>({type:x.type,data:{...x.data,...(x.type==='activities'?{status:'planned',actual:''}:{})}}));
  aiDraft={intent:result.intent,message:result.message||'',assumptions:Array.isArray(result.assumptions)?result.assumptions:[],entries:clean,updates:Array.isArray(result.updates)?result.updates.filter(x=>x&&typeof x.id==='string').slice(0,20):[]};
 }catch(error){aiError=error.name==='AbortError'?'AI request timed out. Please retry.':error.message||'Could not reach AI service'}finally{aiBusy=false;render()}
}
function aiApply(){
 if(!aiDraft)return;
 const selected=[...document.querySelectorAll('[data-ai-index]:checked')].map(x=>Number(x.dataset.aiIndex));
 const selectedUpdates=[...document.querySelectorAll('[data-ai-update-index]:checked')].map(x=>Number(x.dataset.aiUpdateIndex));
 if(!selected.length&&!selectedUpdates.length){alert('Select an entry or update.');return}
 const approved=[],changes=[];
 for(const i of selected){
  const item=aiDraft.entries[i];if(!item)continue;
  let obj={};for(const k of AI_FIELDS[item.type]){const el=document.querySelector(`[data-ai-field="${i}:${k}"]`);obj[k]=el?el.value:''}
  obj=numberFields(obj);
  if(!LifeOSTime.validDate(obj.date)){alert('Check the date for '+item.type);return}
  if((obj.start&&!LifeOSTime.validTime(obj.start))||(obj.end&&!LifeOSTime.validTime(obj.end))){alert('Check time format HH:MM');return}
  if(['activities','logs'].includes(item.type)){
   if(Boolean(obj.start)!==Boolean(obj.end)){alert('Add both start and end times, or clear both for a flexible entry.');return}
   if(obj.start){if(!obj.endDate)obj.endDate=obj.end<obj.start?addDays(obj.date,1):obj.date;if(!LifeOSTime.scheduledInterval(obj)){alert('End date/time must follow start: '+obj.title);return}}
  }
  if(['activities','logs'].includes(item.type)&&(!obj.title||!categories.includes(obj.category))){alert('Check title and category');return}
  if(item.type==='activities'){obj.status='planned';obj.actual=0;obj.timingSource='';obj.durationConfidence='unknown'}
  if(item.type==='expenses'&&(!Number.isFinite(obj.amount)||obj.amount<=0||!expenseCats.includes(obj.category))){alert('Check expense amount/category');return}
  if(['logs','learning','workouts','relationships'].includes(item.type)&&(!Number.isFinite(obj.actual)||obj.actual<0)){alert('Check duration');return}
  if(item.type==='learning'&&(!obj.subject||!obj.topic)){alert('Learning requires subject and topic');return}
  approved.push({type:item.type,data:{id:id(),...obj}});
 }
 for(const i of selectedUpdates){const u=aiDraft.updates[i],existing=db.activities.find(x=>x.id===u?.id);if(!existing){alert('One of the proposed activities no longer exists. Generate again.');return}
  if(u.action==='complete'||u.action==='skip'){changes.push({existing,action:u.action});continue}
  if(u.action==='move'&&existing.status==='planned'&&LifeOSTime.scheduledInterval(u)){changes.push({existing,action:'move',proposal:u});continue}
  alert('AI suggested an unsupported or unsafe update. Generate again.');return;
 }
 // Deterministic conflict scan across existing protected activities and other newly approved blocks.
 const displaced=new Set(changes.filter(x=>x.action==='move').map(x=>x.existing.id));
 const newPlans=approved.filter(x=>x.type==='activities').map(x=>x.data);
 const moves=changes.filter(x=>x.action==='move').map(x=>({...x.existing,...x.proposal}));
 const candidate=[...newPlans,...moves];const baseline=db.activities.filter(x=>!displaced.has(x.id)&&!['skipped'].includes(x.status));
 for(const p of candidate){const a=LifeOSTime.scheduledInterval(p);if(!a)continue;for(const b of [...baseline,...candidate.filter(z=>z!==p)]){const other=LifeOSTime.scheduledInterval(b);if(other&&a.start<other.end&&other.start<a.end){alert('Time conflict: “'+p.title+'” overlaps “'+b.title+'”. Edit the proposal or your existing schedule before applying.');return}}}
 if(!confirm(`Apply ${approved.length} new entries and ${changes.length} updates to your personal LifeOS?`))return;
 for(const x of approved)db[x.type].push(x.data);
 for(const c of changes){if(c.action==='move'){Object.assign(c.existing,{date:c.proposal.date,start:c.proposal.start,end:c.proposal.end,endDate:c.proposal.endDate})}else updateActivityStatus(c.existing.id,c.action==='complete'?'completed':'skipped',{deferSave:true})}
 aiDraft=null;aiPrompt='';save();tab='ai';render();
}
