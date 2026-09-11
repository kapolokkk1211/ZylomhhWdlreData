import fs from 'fs';
import { UI } from '../lib/ui.js';
const J=f=>JSON.parse(fs.readFileSync('content/data/'+f,'utf8'));
const comp=J('compounds.json'), mats=J('materials.json'), codes=J('codes.json'),
      towns=J('towns.json'), gloss=J('glossary.json'), quests=J('quests.json'),
      feedback=J('feedback.json'), pets=J('companions.json'), srcs=J('sources.json');
const fams=new Set(codes.families.map(f=>f.key)), slots=new Set(codes.slots.map(s=>s.key)),
      stats=new Set(codes.stats.map(s=>s.key)), confs=new Set(codes.confidence.map(c=>c.key)),
      townKeys=new Set(towns.map(t=>t.key)),
      qtypes=new Set((codes.questTypes||[]).map(t=>t.key)),
      qkinds=new Set(['wiki','cnwiki','guide','reguide','index','baha','board','search']);
const err=[],warn=[];
const ids=new Set();
for(const r of comp){
  if(ids.has(r.id))err.push('dup compound id '+r.id); ids.add(r.id);
  if(!fams.has(r.family))err.push('bad family '+r.family+' @'+r.id);
  r.secondary.forEach(s=>{if(!fams.has(s))err.push('bad secondary '+s+' @'+r.id)});
  if(!slots.has(r.slot))err.push('bad slot '+r.slot+' @'+r.id);
  if(!confs.has(r.confidence))err.push('bad confidence '+r.confidence+' @'+r.id);
  r.stats.forEach(s=>{if(!stats.has(s.stat))err.push('bad stat '+s.stat+' @'+r.id)});
  if(typeof r.rank!=='number'||r.rank<0)err.push('bad rank @'+r.id);
  if(r.lv>0&&r.lv!==r.rank*2)warn.push(`rank≠lv/2: ${r.name.en} r${r.rank} lv${r.lv}`);
  if(r.slot==='material'&&r.lv!==0)warn.push('material with lv @'+r.id);
}
const mids=new Set();
for(const r of mats){
  if(mids.has(r.id))err.push('dup material id '+r.id); mids.add(r.id);
  if(!fams.has(r.family))err.push('bad family '+r.family+' @'+r.id);
  if(!confs.has(r.confidence))err.push('bad confidence @'+r.id);
  r.sources.forEach(s=>{
    if(s.type==='shop'&&!townKeys.has(s.town))err.push('bad town '+s.town+' @'+r.id);
    if(!['shop','craft','drop','gather','scroll'].includes(s.type))err.push('bad source type '+s.type+' @'+r.id);
  });
}
const qids=new Set();
for(const r of quests){
  if(qids.has(r.id))err.push('dup quest id '+r.id); qids.add(r.id);
  if(!qtypes.has(r.type))err.push('bad quest type '+r.type+' @'+r.id);
  if(!confs.has(r.confidence))err.push('bad confidence @'+r.id);
  if(!r.name?.en||!r.name?.th)err.push('quest missing a name language @'+r.id);
  if(r.thConfirmed&&!r.name.th)err.push('quest thConfirmed without a Thai name @'+r.id);
  for(const k of ['req','reward','detail','note']){
    const v=r[k]; if(v&&(!v.en||!v.th))warn.push(`quest ${k} missing a language: ${r.id}`);
  }
  if(!Array.isArray(r.sources)||r.sources.length===0)err.push('quest with no source link @'+r.id);
  else for(const s of r.sources){
    if(!qkinds.has(s.kind))err.push('bad source kind '+s.kind+' @'+r.id);
    if(!/^https:\/\//.test(s.url||''))err.push('source url is not https @'+r.id);
  }
}

// The report page silently shows "not connected yet" if these are blank, so check the shape.
for(const k of ['formUrl','embedUrl']){
  const v=feedback[k];
  if(v && !/^https:\/\/docs\.google\.com\/forms\//.test(v))err.push(`feedback.${k} is not a Google Forms URL`);
}
if(feedback.formUrl&&!feedback.embedUrl)warn.push('feedback.formUrl is set but embedUrl is not — the form will not show on the page');
if(feedback.embedUrl&&!/embedded=true/.test(feedback.embedUrl))warn.push('feedback.embedUrl is missing ?embedded=true');

// Every family label must be one the Thai client actually shows. KK photographed the
// client's own วัสดุหลัก list; a family whose Thai is not on it is either misworded or
// does not exist in the Thai client. The exceptions are named in codes.json.
{
  const shown=new Set(codes.clientFamilyLabels?.labels||[]);
  const known=new Set(Object.keys(codes.clientFamilyLabels?.notYetMatched||{}));
  for(const f of codes.families){
    const th=f.name.th;
    if(!th) { err.push('family with no Thai name: '+f.key); continue; }
    if(!shown.has(th)&&!known.has(f.key)) err.push(`family ${f.key} "${th}" is not a label the Thai client shows`);
  }
}

// Companions. Chinese must survive on every gear name — the guide's whole point is that a
// player can match our rows against a Taiwan guide, and the Thai names are translations.
{
  const pids=new Set(); const ST=['STR','CON','INT','WIS','AGI'];
  for(const c of pets){
    if(pids.has(c.id))err.push('dup companion id '+c.id); pids.add(c.id);
    if(!c.name?.en||!c.name?.cn||!c.name?.th)err.push('companion missing a name language @'+c.id);
    if(!['quest','mall'].includes(c.source))err.push('bad companion source @'+c.id);
    if(!['phys','magic','hybrid','gun','bow'].includes(c.type))err.push('bad companion type @'+c.id);
    if(!['human','beast'].includes(c.form))err.push('bad companion form @'+c.id);
    if(!confs.has(c.confidence))err.push('bad confidence @'+c.id);
    for(const g of [c.exclusive,c.rebirthExclusive]) if(g&&!g.cn)err.push('companion gear with no 中文 @'+c.id);
    if(c.floors) for(const k of Object.keys(c.floors)) if(!ST.includes(k))err.push(`bad floor stat ${k} @${c.id}`);
    if(c.thConfirmed&&c.id!=='lynx')warn.push(`companion ${c.id} claims a confirmed Thai name — only ลิงคส์ is confirmed`);
  }
}

// spot checks against the knowledge base
const find=(en,rank)=>comp.find(r=>r.name.en===en&&r.rank===rank);
const spot=[
 ['Sky Bow r14 = Titan + Grass/Water, ATK+10 SPD+18',()=>{const r=find('Sky Bow',14);return r&&r.family==='Titan'&&r.lv===28&&r.stats.some(s=>s.stat==='SPD'&&s.v===18)}],
 ['Light Bracers r19 = Alum + Gold, ATK+19',()=>{const r=find('Light Bracers',19);return r&&r.family==='Alum'&&r.secondary.includes('Gold')}],
 ['Steel Blade r6 = KK-tested, Thai name set',()=>{const r=find('Steel Blade',6);return r&&r.confidence==='KK-tested'&&r.name.th==='มีดเหล็กกล้า'}],
 ['Star Essence r22 exists in the Star family',()=>!!comp.find(r=>r.family==='Star'&&r.rank===22)],
 ['Wolf Fang is a rank-20 Bone drop from Snow Wolf lv60',()=>{const m=mats.find(x=>x.name.en==='Wolf Fang');return m&&m.rank===20&&m.family==='Bone'&&m.sources[0].mob.includes('Snow Wolf')}],
 ['Ancestor skill quest is RE-verified and needs 前往南極',()=>{const q=quests.find(x=>x.id==='skill-ancestor');return q&&q.type==='skill'&&q.confidence==='RE-verified'&&q.req.en.includes('Antarctica')}],
 ['Every quest links out; 100+ link to a wiki page',()=>quests.every(q=>q.sources.length)&&quests.filter(q=>q.sources.some(s=>s.kind==='wiki')).length>=100],
 ['All five Thai quest tags present',()=>['เควสหลัก','เควสรอง','เควสขุนพล','เควสดวงดาว','เควสสกิล'].every(t=>codes.questTypes.some(x=>x.name.th===t))],
 ['China Fishing Village and Bangkok opened in the 2026-09 patch',()=>['china','bangkok'].every(k=>towns.find(t=>t.key===k)?.thStatus==='open')],
 ['Every family label matches the Thai client, bar Feather (client mistranslation)',()=>{
   const shown=new Set(codes.clientFamilyLabels.labels);
   const known=new Set(Object.keys(codes.clientFamilyLabels.notYetMatched));
   return codes.families.filter(f=>!shown.has(f.name.th)&&!known.has(f.key)).length===0;
 }],
 ['Mall companions all rebirth at 130 points via the pill',()=>pets.filter(c=>c.source==='mall').every(c=>c.rebirthPoints===130)],
 ['Mary I’s WIS floor is 41 — the example the guide turns on',()=>pets.find(c=>c.id==='mary1')?.floors?.WIS===41],
 ['Every exclusive item has a Thai name and a slot',()=>{
   const SLOTS=new Set(['blade','sword','wand','club','gun','bow','claw','weapon','accessory','head','hand']);
   return pets.every(c=>['exclusive','rebirthExclusive'].every(k=>{
     const g=c[k]; if(!g) return true;
     return !!g.th && !!g.cn && SLOTS.has(g.slot) && typeof g.slotConfirmed==='boolean';
   }));
 }],
 ['Every slot key the data uses has a label in both languages',()=>{
   const used=new Set(); pets.forEach(c=>['exclusive','rebirthExclusive'].forEach(k=>c[k]&&used.add(c[k].slot)));
   return ['en','th'].every(L=>[...used].every(k=>!!UI[L].companions.slots[k]));
 }],
 ['Every companion has a Thai rebirth-skill name',()=>pets.every(c=>!c.rebirthSkill||!!c.rebirthSkillTh)],
 ['The two flagged slot conflicts still carry their note',()=>['ares','nemea'].every(id=>pets.find(c=>c.id===id)?.exclusive?.slotNote?.th)],
 ['Every companion has skills, each with a Chinese and a Thai name',()=>pets.every(c=>
   Array.isArray(c.skills)&&c.skills.length>=2&&c.skills.every(s=>!!s.cn&&!!s.th))],
 ['The rebirth skill closes each skill list and matches the row',()=>pets.every(c=>{
   if(!c.rebirthSkill) return true;
   const last=c.skills[c.skills.length-1];
   return last.rebirth===true&&last.cn===c.rebirthSkill&&last.th===c.rebirthSkillTh;
 })],
 ['Every target-pattern key has a label in both languages',()=>{
   const used=new Set(); pets.forEach(c=>c.skills.forEach(s=>s.way&&used.add(s.way)));
   return ['en','th'].every(L=>[...used].every(k=>!!UI[L].companions.ways[k]));
 }],
 ['WLOHUB-sourced skill detail is flagged legacy, and only where it exists',()=>pets.every(c=>
   c.skills.every(s=>((s.sp!=null||s.way||s.desc)?s.legacy===true:!s.legacy)))],
 ['Lynx\u2019s spotlight no longer carries its own copy of the skills',()=>!pets.find(c=>c.id==='lynx').extra.skills],
 ['Every companion source link is https and described in both languages',()=>srcs.companions.every(x=>
   /^https:\/\//.test(x.url)&&!!x.title&&['en','cn'].includes(x.lang)
   &&['en','th'].every(L=>!!UI[L].companions.sourceNotes[x.id]))],
 ['Both compendium sheets are linked — the English one and the Chinese original',()=>
   ['compendium-en','compendium-cn'].every(id=>srcs.companions.some(x=>x.id===id))],
 ['Only ลิงคส์ has a client-confirmed Thai companion name',()=>pets.filter(c=>c.thConfirmed).map(c=>c.id).join()==='lynx'],
 ['Seagull Feather is the KK-confirmed rank-4 Feather, sold nowhere',()=>{
   const m=mats.find(x=>x.id==='feather-r4-seagull-feather');
   return m&&m.rank===4&&m.family==='Feather'&&m.confidence==='KK-tested'&&m.thConfirmed
     &&m.name.th==='ขนนกนางนวล'&&!m.sources.some(s=>s.type==='shop');
 }],
 ['A material may have no 中文 name, but never a Thai one it has not earned',()=>mats.every(m=>
   !m.thConfirmed||!!m.name.th)],
 ['No Star (ประกายดาว) material is sold in any shop — KK confirmed 2026-09-10',
   ()=>!mats.some(m=>m.family==='Star'&&m.sources.some(s=>s.type==='shop'))],
 ['Madagascar is on the town list',()=>!!towns.find(t=>t.key==='madagascar')],
 ['Hawaii is flagged not-in-re',()=>towns.find(t=>t.key==='hawaii').thStatus==='not-in-re'],
 ['Every family with rank-1 content has a row on the compound page',()=>{
   const seen=new Set(); for(const m of mats) seen.add(m.family+':'+m.rank);
   for(const c of comp) seen.add(c.family+':'+c.rank);
   return ['Copper:1','Wood:1','Grass:1','Flower:1','Feather:1','Coal:1','Gum:1','Leaf:1','Leather:1','WaterUndrinkable:1','Cluster:1'].every(k=>seen.has(k));
 }],
 ['Every rank-21 key material present (Wood/Diamond/MagicJade)',()=>['Wood','Diamond','MagicJade'].every(f=>mats.some(m=>m.family===f&&m.rank===21))],
];
console.log('=== SCHEMA ===');
const noSrc=mats.filter(m=>!m.sources.length).length;
console.log('compounds',comp.length,'| companions',pets.length,'| materials',mats.length,`(${noSrc} with no source yet)`,'| quests',quests.length,'| towns',towns.length,
 '| glossary',Object.values(gloss).flat().length,'| families',codes.families.length);
console.log('errors:',err.length); err.slice(0,20).forEach(e=>console.log('  ✗',e));
console.log('warnings:',warn.length); warn.slice(0,10).forEach(w=>console.log('  ⚠',w));
console.log('\n=== SPOT CHECKS ===');
spot.forEach(([name,fn])=>{let ok=false;try{ok=fn()}catch(e){}console.log(ok?'  ✓':'  ✗',name)});
console.log('\n=== COVERAGE ===');
const th=comp.filter(r=>r.name.th).length;
console.log(`Thai item names: ${th}/${comp.length} (${(th/comp.length*100).toFixed(1)}%) — tier 3 work, expected low`);
console.log('Thai structural codes:',
  codes.families.filter(f=>f.name.th).length+'/'+codes.families.length,'families,',
  codes.slots.filter(s=>s.name.th).length+'/'+codes.slots.length,'slots,',
  codes.stats.filter(s=>s.name.th).length+'/'+codes.stats.length,'stats — tier 2 DONE');
console.log('Confirmed from KK’s client:',
  codes.families.filter(f=>f.thConfirmed).length,'families,',
  codes.slots.filter(s=>s.thConfirmed).length,'slots,',
  Object.values(gloss).flat().filter(g=>g.thConfirmed).length,'glossary terms');
const byConf=comp.reduce((a,r)=>(a[r.confidence]=(a[r.confidence]||0)+1,a),{});
console.log('compounds by confidence:',JSON.stringify(byConf));
// Read the open list from towns.json rather than hardcoding it — the TH map gets patched.
const openTowns=new Set(towns.filter(t=>t.thStatus==='open').map(t=>t.key));
const reachable=mats.filter(m=>m.sources.some(s=>s.type==='shop'&&openTowns.has(s.town)));
console.log(`materials buyable on the TH map today: ${reachable.length}/${mats.length} · open shop towns: ${[...openTowns].join(', ')}`);
console.log('\nEXIT',err.length?'FAIL':'PASS');
process.exit(err.length?1:0);
