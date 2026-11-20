/* LifeOS v2 time and evidence utilities. No external dependencies. */
(function(root){
 'use strict';
 const DAY_MS=86400000;
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00'))&&new Date(s+'T12:00:00').getFullYear()===Number(s.slice(0,4))&&new Date(s+'T12:00:00').getMonth()+1===Number(s.slice(5,7))&&new Date(s+'T12:00:00').getDate()===Number(s.slice(8,10));
 const validTime=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
 function plusDays(day,n){const d=new Date(day+'T12:00:00');if(!validDate(day)||!Number.isInteger(n))return '';d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 function localStamp(day,time){if(!validDate(day)||!validTime(time))return NaN;return new Date(`${day}T${time}:00`).getTime();}
 function scheduledInterval(activity){
  if(!activity||!validDate(activity.date)||!validTime(activity.start)||!validTime(activity.end))return null;
  const start=localStamp(activity.date,activity.start);
  const resolvedEnd=activity.endDate||((activity.end<activity.start)?plusDays(activity.date,1):activity.date);
  const end=localStamp(resolvedEnd,activity.end);
  if(!validDate(resolvedEnd)||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return null;
  return {start,end,startDate:activity.date,endDate:resolvedEnd};
 }
 function sliceMinutes(start,end,day){
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||!validDate(day))return 0;
  const dayStart=new Date(day+'T00:00:00').getTime(), dayEnd=new Date(plusDays(day,1)+'T00:00:00').getTime();
  return Math.max(0,(Math.min(end,dayEnd)-Math.max(start,dayStart))/60000);
 }
 function plannedMinutes(activity,day){const interval=scheduledInterval(activity);return interval?Math.round(sliceMinutes(interval.start,interval.end,day)):0;}
 function observedIntervals(activity){
  if(!activity)return [];
  if(Array.isArray(activity.timingIntervals)){
   return activity.timingIntervals.filter(x=>x&&x.start&&x.end).map(x=>({start:Date.parse(x.start),end:Date.parse(x.end)})).filter(x=>Number.isFinite(x.start)&&Number.isFinite(x.end)&&x.end>x.start);
  }
  if(activity.timingSource==='explicit_timer'&&activity.actualStartAt&&activity.actualEndAt){const start=Date.parse(activity.actualStartAt),end=Date.parse(activity.actualEndAt);return Number.isFinite(start)&&Number.isFinite(end)&&end>start?[{start,end}]:[]}
  return [];
 }
 function measuredMinutes(activity,day){return Math.round(observedIntervals(activity).reduce((sum,x)=>sum+sliceMinutes(x.start,x.end,day),0));}
 function actualMinutes(activity,day){
  if(!activity||!validDate(day))return 0;
  if(activity.status&&activity.status!=='completed'&&activity.collection!=='logs')return 0;
  const intervals=observedIntervals(activity);
  if(intervals.length)return measuredMinutes(activity,day);
  const actual=Number(activity.actual);
  if(!Number.isFinite(actual)||actual<=0)return 0;
  // Manually confirmed start/end are stronger evidence than scheduled windows.
  if(activity.timingSource==='user_adjusted'&&activity.actualStartAt&&activity.actualEndAt){const a=Date.parse(activity.actualStartAt),b=Date.parse(activity.actualEndAt);if(Number.isFinite(a)&&Number.isFinite(b)&&b>a)return Math.round(sliceMinutes(a,b,day));}
  // Legacy logs can safely be split when their explicit wall interval equals their recorded duration.
  const span=scheduledInterval(activity);
  if(span&&Math.abs((span.end-span.start)/60000-actual)<0.6)return Math.round(sliceMinutes(span.start,span.end,day));
  // For unknown interval distribution, do not fabricate second-day placement.
  return activity.date===day?actual:0;
 }
 function statusMetrics(activities){let done=0,planned=0,skipped=0,active=0;for(const a of activities){if(a.status==='completed')done++;else if(a.status==='skipped')skipped++;else if(a.status==='in_progress'||a.status==='paused')active++;else planned++;}return {done,planned,skipped,active,total:activities.length,percent:activities.length?Math.round(100*done/activities.length):0};}
 function scheduleVariance(activity){
  if(!activity||activity.status!=='completed'||!activity.completedAt)return null;
  const span=scheduledInterval(activity),finished=Date.parse(activity.actualEndAt||activity.completedAt);
  if(!span||!Number.isFinite(finished))return null;
  // A completion tap made before an activity starts or long after it ended is a bookkeeping action, not a timing observation.
  if(finished<span.start||finished>span.end+5*60000)return null;
  return Math.round((span.end-finished)/60000);
 }
 const api={DAY_MS,validDate,validTime,plusDays,localStamp,scheduledInterval,sliceMinutes,plannedMinutes,observedIntervals,measuredMinutes,actualMinutes,statusMetrics,scheduleVariance};
 root.LifeOSTime=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
