import fs from 'fs';
import {F,S,D} from './star_data.mjs';
const norm={RedIron:'PureIron'};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function parseStats(raw){
  if(!raw||raw==='—')return{stats:[],note:null};
  const stats=[];const extra=[];
  for(const p of raw.split(/\s*·\s*|,\s*/)){
    const re=/(ATK|DEF|MATK|MDEF|SPD|HP|SP)\s*([+\-−])\s*(\d+)/g;let m,f=false;
    while((m=re.exec(p))){f=true;stats.push({stat:m[1],v:(m[2]==='+'?1:-1)*Number(m[3])})}
    if(!f&&p.trim())extra.push(p.trim());
  }
  return {stats,note:extra.length?extra.join('; '):null};
}
const BANDS=[[0,10,"Dust tier — Star + Flower / Copper"],[11,20,"Early — Star + Grass / Iron"],
[21,30,"Mid — Star + Wood / Pure Iron, then the Stardust set"],[31,40,"High — two secondaries per piece"],
[41,50,"Constellation & Firmament — three secondaries"],[51,60,"Endgame — four secondaries, random stats"]];
const seen=new Map();const anomalies=[];
const rows=D.map(([rank,lv,en,cn,slotCn,sec,statsRaw,recipe,line])=>{
  let id=`star-${slug(en)}-r${rank}`;
  if(seen.has(id)){const n=seen.get(id)+1;seen.set(id,n);id+='-'+n}else seen.set(id,1);
  const {stats,note}=parseStats(statsRaw);
  const lvAnomaly=lv>0&&lv!==rank*2;
  if(lvAnomaly)anomalies.push(`${en} (r${rank}): lv ${lv}, expected ${rank*2}`);
  return {id,family:'Star',secondary:sec.map(s=>norm[F[s]]||F[s]||('?'+s)),rank,lv,
    slot:(S[slotCn]||('?'+slotCn)).toLowerCase(),name:{en,cn,th:null},
    stats,statsNote:note,statsRaw,recipe:{en:recipe||null,th:null},
    line,band:(BANDS.find(b=>rank>=b[0]&&rank<=b[1])||[])[2]||null,
    randomStats:/RANDOM/.test(statsRaw),confidence:'RE-reported',source:'star-codex-kucha',
    familyCoverage:'complete',lvAnomaly:lvAnomaly||undefined,updated:'2026-09-07'};
});
const comp=JSON.parse(fs.readFileSync('data/compounds.json','utf8'));
const merged=comp.filter(r=>r.family!=='Star').concat(rows);
fs.writeFileSync('data/compounds.json',JSON.stringify(merged,null,1));
console.log('star rows:',rows.length,'| total compounds:',merged.length);
console.log('lines:',JSON.stringify(rows.reduce((a,r)=>(a[r.line]=(a[r.line]||0)+1,a),{})));
console.log('unmapped:',[...new Set(rows.flatMap(r=>[r.slot,...r.secondary]).filter(x=>x.startsWith('?')))].join(',')||'none');
console.log('ANOMALIES ('+anomalies.length+'):');anomalies.forEach(a=>console.log('  -',a));
