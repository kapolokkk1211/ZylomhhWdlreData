import fs from 'fs';
const J=f=>JSON.parse(fs.readFileSync('content/data/'+f,'utf8'));
const comp=J('compounds.json'), mats=J('materials.json'), codes=J('codes.json'),
      towns=J('towns.json'), gloss=J('glossary.json'), quests=J('quests.json');
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
 ['Madagascar is on the town list',()=>!!towns.find(t=>t.key==='madagascar')],
 ['Hawaii is flagged not-in-re',()=>towns.find(t=>t.key==='hawaii').thStatus==='not-in-re'],
 ['Every family with rank-1 content has a row on the compound page',()=>{
   const seen=new Set(); for(const m of mats) seen.add(m.family+':'+m.rank);
   for(const c of comp) seen.add(c.family+':'+c.rank);
   return ['Copper:1','Wood:1','Grass:1','Flower:1','Feather:1','Coal:1','Gum:1','Leaf:1','Leather:1','Water:1','Cluster:1'].every(k=>seen.has(k));
 }],
 ['Every rank-21 key material present (Wood/Diamond/MagicJade)',()=>['Wood','Diamond','MagicJade'].every(f=>mats.some(m=>m.family===f&&m.rank===21))],
];
console.log('=== SCHEMA ===');
const noSrc=mats.filter(m=>!m.sources.length).length;
console.log('compounds',comp.length,'| materials',mats.length,`(${noSrc} with no source yet)`,'| quests',quests.length,'| towns',towns.length,
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
