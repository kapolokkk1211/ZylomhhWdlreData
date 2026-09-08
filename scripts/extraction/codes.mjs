import fs from 'fs';
// c = Thai string confirmed from KK's live Thai client (07-name-glossary); otherwise a translation
const F = [
 ["Steel","鋼","Steel","เหล็กกล้า",1,"ore",0],
 ["Iron","鐵","Iron","เหล็ก",1,"ore",0],
 ["Copper","銅","Copper","ทองแดง",1,"ore",0],
 ["PureIron","赤鐵","Pure Iron","เหล็กแดง",0,"ore",1],
 ["Alum","鋁","Aluminium","อะลูมิเนียม",1,"ore",1],
 ["Titan","鈦","Titanium","ไทเทเนียม",0,"ore",0],
 ["Gold","金","Gold","ทอง",1,"ore",1],
 ["Silver","銀","Silver","เงิน",1,"ore",0],
 ["Platinum","白銀","Platinum","แพลตินัม",0,"ore",1],
 ["Tin","錫","Tin","ดีบุก",0,"ore",0],
 ["Lead","鉛","Lead","ตะกั่ว",0,"ore",1],
 ["Rock","岩石","Rock","หิน",0,"ore",1],
 ["Wood","木","Wood","ไม้",1,"plant",0],
 ["Grass","草","Grass","หญ้า",1,"plant",0],
 ["Flower","花","Flower","ดอกไม้",1,"plant",0],
 ["Leaf","葉","Leaf","ใบไม้",0,"plant",1],
 ["Nylon","尼龍","Nylon","ไนลอน",0,"plant",1],
 ["Leather","皮","Leather","หนัง",0,"animal",0],
 ["Fur","毛皮","Fur","ขนสัตว์",0,"animal",1],
 ["Feather","羽毛","Feather","ขนนก",1,"animal",1],
 ["Bone","獸骨","Beast Bone","กระดูกสัตว์",0,"animal",1],
 ["Shell","硬殼","Hard Shell","เปลือกแข็ง",0,"animal",1],
 ["Crystal","水晶","Crystal","คริสตัล",0,"gem",1],
 ["Gem","寶石","Gem","อัญมณี",0,"gem",1],
 ["Diamond","鑽石","Diamond","เพชร",0,"gem",1],
 ["Jade","玉","Jade","หยก",0,"gem",1],
 ["MagicJade","魔玉","Magic Jade","หยกเวทมนตร์",0,"gem",1],
 ["Cluster","結晶","Crystal Cluster","ผลึก",0,"gem",1],
 ["Gum","膠質","Gum","ยาง",0,"other",1],
 ["Water","水","Water","น้ำ",0,"other",1],
 ["Coal","煤","Coal","ถ่านหิน",0,"mineral",1],
 ["Sulfur","硫磺","Sulfur","กำมะถัน",0,"mineral",1],
 ["Silicon","矽","Silicon","ซิลิคอน",0,"mineral",1],
 ["Star","星耀","Starlight","ประกายดาว",1,"star",0]
];
const S = [
 ["blade","刀","Blade","ใบมีด",1],["sword","劍","Sword","ดาบ",0],["claw","爪","Claw","กรงเล็บ",0],
 ["spear","槍","Spear","หอก",0],["axe","斧","Axe","ขวาน",0],["hammer","槌","Hammer","ค้อน",0],
 ["bow","弓","Bow","ธนู",0],["staff","杖","Staff","ไม้เท้า",0],["fan","魔","Fan","พัด",0],
 ["armor","衣","Armor","เสื้อเกราะ",0],["helm","帽","Helm","หมวก",0],["boots","鞋","Boots","รองเท้า",0],
 ["bracer","腕","Bracer","ที่ปกป้องมือ",1],["accessory","特","Accessory","อุปกรณ์พิเศษ",1],
 ["material","物","Material","วัตถุดิบ",1]
];
const ST = [
 ["ATK","攻擊力","ATK","พลังโจมตี",0],["DEF","防禦力","DEF","พลังป้องกัน",0],
 ["MATK","魔攻","MATK","พลังโจมตีเวท",0],["MDEF","魔防","MDEF","พลังป้องกันเวท",0],
 ["SPD","速度","SPD","ความเร็ว",0],["HP","生命","HP","พลังชีวิต",0],["SP","魔力","SP","พลังเวท",0]
];
const CONF = [
 ["RE-verified","Verified in Re","ยืนยันแล้วใน Re","Confirmed by a source about Re: Star Ark itself"],
 ["RE-reported","Reported","มีรายงาน","From the Re community sheet or TW guide sites — likely right, not personally verified"],
 ["LEGACY","Legacy WLO","ข้อมูลเกมเก่า","From Wonderland Online 2004. Same engine, but numbers may be re-tuned"],
 ["INFER","Inferred","คาดการณ์","Cross-referenced inference, not directly sourced"],
 ["KK-tested","Tested in-game","ทดสอบเองในเกม","KK confirmed it in the live Thai client. Highest confidence"]
];
const COMPLETE={Steel:0,Iron:0,Copper:0,PureIron:1,Alum:1,Titan:0,Gold:1,Silver:0,Platinum:1,Tin:0,
Lead:1,Wood:0,Grass:0,Flower:0,Leaf:1,Leather:0,Fur:1,Crystal:1,Gem:1,Diamond:1,MagicJade:1,
Jade:1,Rock:1,Bone:1,Cluster:1,Nylon:1,Feather:1,Shell:1,Gum:1};

const mk=(a,extra=()=>({}))=>a.map(([key,cn,en,th,c,...rest])=>({key,name:{en,cn,th},thConfirmed:!!c,...extra(key,rest)}));

const codes={
 families: mk(F,(k,[group])=>({group:group[0],
   coverage: k==='Star' ? 'separate' : (COMPLETE[k]?'complete':'partial-to-rank-30'),
   note: k==='Star' ? 'Re-exclusive family. Not in legacy Wonderland Online. Data lives in the Star Family Codex, not the compendium.' : null})),
 slots: mk(S),
 stats: mk(ST),
 confidence: CONF.map(([key,en,th,desc])=>({key,name:{en,th},desc}))
};
fs.writeFileSync('data/codes.json',JSON.stringify(codes,null,1));

// stamp family coverage onto each compound row
const rows=JSON.parse(fs.readFileSync('data/compounds.json','utf8'));
const cov=Object.fromEntries(codes.families.map(f=>[f.key,f.coverage]));
for(const r of rows){ r.familyCoverage=cov[r.family]||'unknown'; }
fs.writeFileSync('data/compounds.json',JSON.stringify(rows,null,1));

console.log('families',codes.families.length,'slots',codes.slots.length,'stats',codes.stats.length);
console.log('th confirmed:', codes.families.filter(f=>f.thConfirmed).length+'/'+codes.families.length,'families,',
  codes.slots.filter(s=>s.thConfirmed).length+'/'+codes.slots.length,'slots');
console.log('rows stamped:',rows.length,'partial-family rows:',rows.filter(r=>r.familyCoverage!=='complete').length);
