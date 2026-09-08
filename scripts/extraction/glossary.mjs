import fs from 'fs';
// [cn, en, th, thConfirmed(1=read off KK's live Thai client), enTag, note]
const G = {
 system: [
  ["合成","Compounding","การรวม",0,"EN-OFFICIAL","The probabilistic alchemy pot"],
  ["煉金術","Alchemy","วิชาเล่นแร่",0,"EN-OFFICIAL","The skill"],
  ["初階煉金術","Primary Alchemy","วิชาเล่นแร่ขั้นต้น",0,"EN-OFFICIAL","Tier 1. Max climb +4. Cheapest — use it to convert materials"],
  ["中階煉金術","Junior Alchemy","วิชาเล่นแร่ขั้นกลาง",1,"EN-OFFICIAL","Tier 2. Max climb +4"],
  ["高階煉金術","Superior Alchemy","วิชาเล่นแร่ขั้นสูง",0,"EN-OFFICIAL","Tier 3. Max climb +5. Save it for the final climb"],
  ["煉金百科 書1–書4","Alchemy Encyclopedia Vol. 1–4",null,0,"EN-OFFICIAL","Goes LAST in the recipe. +1…+4 rank and success rate. The expensive part of any recipe"],
  ["物等","Item rank","เลเวลไอเทม",1,"EN-OFFICIAL","= equip level ÷ 2. CONFIRMED in the live Thai client — read it straight off any tooltip"],
  ["物屬","Base material family","วัสดุโครงสร้าง",1,"EN-OFFICIAL","Which material family an item belongs to. Shown on the item tooltip"],
  ["主屬","Primary material","[หลัก]",1,"EN-LIT","Slot 1. Picks the result TABLE. Order matters"],
  ["內屬","Secondary material","[รอง]",1,"EN-LIT","Slots 2+. Picks the sub-line"],
  ["爬等","Rank climbing",null,0,"EN-LIT",null],
  ["洗材料","Washing materials",null,0,"EN-LIT","Converting one family into another at low rank"],
  ["喵型智能分解站","Smart Decomposition Station",null,0,"EN-LIT","Cat-shaped. Identifies an unknown item's family; down-converts gear; source of the elemental Star Dust"],
  ["祝福粉塵","Blessing Dust",null,0,"EN-LIT","Raises compound success rate. Abyss content, Lv50+"],
  ["鍛造","Forging",null,0,"EN-LIT","Cap raised 50 → 80 in Re"],
  ["附魔","Enchanting",null,0,"EN-LIT","Cap raised 15 → 30 in Re"],
  ["工作臺","Workbench",null,0,"EN-LIT","Deterministic manufacture — not the compounding pot"],
  ["合擊","Combo attack",null,0,"EN-LIT","2–2.5× EXP. The leveling engine"],
  ["夥伴","Companion",null,0,"EN-OFFICIAL",null],
  ["友好度","Friendship",null,0,"EN-OFFICIAL","Starts 60, +1/level, −1/death, leaves below 40"],
  ["無人機","Drone",null,0,"EN-LIT","Auto-gathers every 5 min, offline"],
  ["吸塵器","Vacuum",null,0,"EN-LIT","Auto-harvests gathering nodes"],
  ["遺忘卷軸","Scroll of Forgetting",null,0,"EN-OFFICIAL","Stat/skill respec"],
  ["星星","Stars",null,0,"EN-OFFICIAL","Account-capped currency"],
  ["交易所","Exchange",null,0,"EN-LIT","Cross-server marketplace"],
  ["轉職","Job change",null,0,"EN-OFFICIAL","Lv100"],
  ["轉生","Rebirth",null,0,"EN-LIT","For COMPANIONS in this game, Lv100"]
 ],
 ui: [
  [null,"Level Limit","ลิมิตเลเวล",1,"EN-LIT","The character level needed to equip. NOT the compounding rank"],
  [null,"Type","ประเภท",1,"EN-LIT",null],
  [null,"Durability","ความทนทาน",1,"EN-LIT",null],
  [null,"Craftable / Socketable","ได้คราฟ / ฝังประดับ",1,"EN-LIT",null],
  [null,"Start compounding","เริ่มรวม",1,"EN-LIT",null],
  [null,"Continuous compounding","ติ๊กเลือกรวมต่อเนื่อง",1,"EN-LIT",null],
  [null,"Custom filter","ตัวกรองกำหนดเอง",1,"EN-LIT",null],
  [null,"Raw materials first","วัตถุดิบก่อน",1,"EN-LIT","Sort option"],
  [null,"Recipe log","บันทึก",1,"EN-LIT",null],
  [null,"Possible output ranks","Lv ไอเทมที่มีโอกาสรวมได้",1,"EN-LIT","⭐ The pot shows the possible output rank range BEFORE you commit. Read it, adjust, then compound"],
  [null,"Guild Craftsman","ช่างฝีมือกิลด์",1,"EN-LIT",null],
  [null,"Guild Alchemist","นักเล่นแร่กิลด์",1,"EN-LIT",null],
  [null,"Star Light Dust (item type)","ฝุ่นแสงดาว",1,"EN-LIT",null],
  [null,"Hand protector (bracer slot)","ที่ปกป้องมือ",1,"EN-LIT",null],
  [null,"Protective gloves (glove slot)","ถุงมือป้องกัน",1,"EN-LIT",null]
 ],
 stats: [
  ["力量 STR","Strength",null,0,"EN-OFFICIAL",null],["體質 CON","Constitution",null,0,"EN-OFFICIAL",null],
  ["智力 INT","Intelligence",null,0,"EN-OFFICIAL",null],["智慧 WIS","Wisdom",null,0,"EN-OFFICIAL",null],
  ["敏捷 AGI","Agility",null,0,"EN-OFFICIAL",null],
  ["暴擊率","Crit rate",null,0,"EN-LIT","New in Re, undocumented"],
  ["火","Fire","ไฟ",0,"EN-OFFICIAL","lv×2.0 ATK growth (everyone else 1.4) but takes ×0.5 from water"],
  ["水","Water","น้ำ",0,"EN-OFFICIAL","Water→Fire is ×1.6 — the hardest counter in the game"],
  ["風","Wind","ลม",0,"EN-OFFICIAL",null],["地","Earth","ดิน",0,"EN-OFFICIAL",null],
  ["無屬性","Non-elemental",null,0,"EN-OFFICIAL","Ignores the element cycle"]
 ],
 jobs: [
  ["殺手","Killer",null,0,"EN-OFFICIAL","a.k.a. Assassin"],["武士","Samurai",null,0,"EN-OFFICIAL",null],
  ["騎士","Knight",null,0,"EN-OFFICIAL",null],["智者","Wit",null,0,"EN-OFFICIAL","a.k.a. Sage/Wizard"],
  ["牧師","Priest",null,0,"EN-OFFICIAL",null],["先知","Seer",null,0,"EN-OFFICIAL",null],
  ["封印","Seal",null,0,"EN-OFFICIAL","Status effect"],["土牆","Stone Wall",null,0,"EN-OFFICIAL","Blocks physical attacks"],
  ["改","\"Kai\" skill tier",null,0,"EN-LIT","Bigger single-target multiplier"],
  ["真","\"Shin/True\" skill tier",null,0,"EN-LIT","Converts to AoE + DEF penetration"]
 ],
 catalysts: [
  ["黑玉","Black Jade",null,0,"EN-OFFICIAL","Iceberg Ice Cave 3F"],
  ["狼牙","Wolf Fang",null,0,"EN-OFFICIAL","Snow Wolves, Antarctica. The most-used catalyst in the book"],
  ["無暇藍寶石","Flawless Sapphire",null,0,"EN-OFFICIAL",null],
  ["無暇紅寶石","Flawless Ruby",null,0,"EN-OFFICIAL",null],
  ["高密度鑽石","High-density Diamond",null,0,"EN-OFFICIAL",null],
  ["魔玉石","Magic Jade Stone",null,0,"EN-OFFICIAL","Rank 21, Crystal Furnace"],
  ["龍鱗魔髓","Dragon Scale Marrow",null,0,"EN-OFFICIAL",null],
  ["饅頭","Steamed Bun",null,0,"EN-OFFICIAL","+50 HP. The 99.9% workbench food conversion"]
 ]
};
const out={};
for(const [section,rows] of Object.entries(G)){
  out[section]=rows.map(([cn,en,th,c,tag,note])=>({name:{en,cn,th},thConfirmed:!!c,enTag:tag,note}));
}
fs.writeFileSync('data/glossary.json',JSON.stringify(out,null,1));
const all=Object.values(out).flat();
console.log('glossary entries:',all.length,'| sections:',Object.keys(out).join(', '));
console.log('with Thai:',all.filter(e=>e.name.th).length,'| Thai confirmed from client:',all.filter(e=>e.thConfirmed).length);
