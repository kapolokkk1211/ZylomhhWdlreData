import fs from 'fs';
const p='data/compounds.json';
const rows=JSON.parse(fs.readFileSync(p,'utf8'));
// Items KK has read off the live Thai client (07-name-glossary, 2026-08-21)
const CONFIRMED={
 'steel-blade-r6':{th:'มีดเหล็กกล้า',note:'Confirmed in KK’s Thai client: เลเวลไอเทม 6, ลิมิตเลเวล 12, ประเภท ใบมีด, ATK+6 DEF+6. Structure material เหล็กกล้า (Steel) + ไม้ (Wood).'}
};
let n=0;
for(const r of rows){
  const c=CONFIRMED[r.id];
  if(c){r.name.th=c.th;r.thConfirmed=true;r.confidence='KK-tested';r.note=c.note;n++}
}
fs.writeFileSync(p,JSON.stringify(rows,null,1));
console.log('KK-confirmed rows patched:',n);
