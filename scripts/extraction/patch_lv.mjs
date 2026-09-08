import fs from 'fs';
const p='data/compounds.json';const rows=JSON.parse(fs.readFileSync(p,'utf8'));
let n=0;
for(const r of rows){ if(r.lv>0&&r.lv!==r.rank*2){r.lvAnomaly=true;n++} else delete r.lvAnomaly; }
fs.writeFileSync(p,JSON.stringify(rows,null,1));
console.log('rows flagged lvAnomaly:',n,'— rank should equal lv/2; these disagree in the source sheet');
