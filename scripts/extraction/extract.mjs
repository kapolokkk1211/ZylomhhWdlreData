import fs from 'fs';
const src = fs.readFileSync('/root/.claude/projects/-home-claude/3aafb5f4-f1ec-5f5f-be8c-3207fd691f55/tool-results/artifact-127c7d61-1787563436-fd7f.html','utf8');

// pull the three JS literals out of the artifact
const grab = (name) => {
  const i = src.indexOf('const '+name+'=');
  if (i<0) throw new Error('missing '+name);
  const start = src.indexOf('{', i) >= 0 && src.indexOf('{', i) < src.indexOf('[', i)+1 ? src.indexOf('{', i) : src.indexOf('[', i);
  // naive balanced scan
  const open = src[start], close = open==='{'?'}':']';
  let d=0, inStr=false, q='';
  for (let j=start;j<src.length;j++){
    const c=src[j];
    if(inStr){ if(c==='\\'){j++;continue;} if(c===q) inStr=false; continue; }
    if(c==='"'||c==="'"){inStr=true;q=c;continue;}
    if(c===open)d++;
    else if(c===close){d--; if(d===0) return src.slice(start,j+1);}
  }
  throw new Error('unbalanced '+name);
};
const SL = eval('('+grab('SL')+')');
const FM = eval('('+grab('FM')+')');
const D  = eval('('+grab('D')+')');

// slot code: CN char -> stable english key
const slotKey = {};
for (const [cn,en] of Object.entries(SL)) slotKey[cn]=en.toLowerCase();
const famKey = {};
for (const [cn,en] of Object.entries(FM)) famKey[cn]=en;

const slug = (s)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

// stat parser: "ATK+6 DEF+6", "ATK+30, seal resist +5%", "SPD−99", "—"
function parseStats(raw){
  if(!raw||raw==='—') return {stats:[],note:null};
  const stats=[]; let note=null;
  const parts = raw.split(/,\s*/);
  const extra=[];
  for(const p of parts){
    const re=/(ATK|DEF|MATK|MDEF|SPD|HP|SP)\s*([+\-−])\s*(\d+)/g;
    let m, found=false;
    while((m=re.exec(p))){
      found=true;
      stats.push({stat:m[1], v:(m[2]==='+'?1:-1)*Number(m[3])});
    }
    if(!found) extra.push(p.trim());
  }
  if(extra.length) note=extra.join('; ');
  return {stats,note};
}

const seen = new Map();
const out = D.map(([fam,rank,lv,en,cn,slotCn,sec,statsRaw,recipe])=>{
  let id = `${slug(en)}-r${rank}`;
  if(seen.has(id)){ const n=seen.get(id)+1; seen.set(id,n); id=`${id}-${n}`; } else seen.set(id,1);
  const {stats,note}=parseStats(statsRaw);
  const unknownSec = sec.filter(s=>!famKey[s]);
  return {
    id,
    family: fam,
    secondary: sec.map(s=>famKey[s]||('?'+s)),
    rank, lv,
    slot: slotKey[slotCn] || ('?'+slotCn),
    name: { en, cn, th: null },
    stats,
    statsNote: note,
    statsRaw,
    recipe: { en: recipe, th: null },
    confidence: 'RE-reported',
    source: 'compendium-kucha',
    updated: '2026-09-07',
    _unknownSec: unknownSec.length?unknownSec:undefined
  };
});

fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/compounds.json', JSON.stringify(out,null,1));

// report
const famCount={}, slotCount={}, statSet=new Set(), unmapped=new Set();
for(const r of out){
  famCount[r.family]=(famCount[r.family]||0)+1;
  slotCount[r.slot]=(slotCount[r.slot]||0)+1;
  r.stats.forEach(s=>statSet.add(s.stat));
  if(r.slot.startsWith('?')) unmapped.add('slot:'+r.slot);
  r.secondary.forEach(s=>{if(s.startsWith('?'))unmapped.add('fam:'+s);});
}
console.log('rows:',out.length);
console.log('families:',Object.keys(famCount).length, JSON.stringify(famCount));
console.log('slots:',JSON.stringify(slotCount));
console.log('stats:',[...statSet].join(','));
console.log('UNMAPPED:',[...unmapped].join(' ')||'none');
console.log('rows with statsNote:',out.filter(r=>r.statsNote).length);
console.log('dup ids fixed:',[...seen.values()].filter(v=>v>1).length);
