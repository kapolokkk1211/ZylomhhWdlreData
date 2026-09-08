import fs from 'fs';

// ---- towns: Re-sheet attribution + KK's TH-map availability ----
const TOWNS = [
 ["kelan","克蘭村","Kelan Village","หมู่บ้านเคลัน","unverified","Starting continent — status on the TH map not confirmed"],
 ["welling","威靈村","Welling Village","หมู่บ้านเวลลิง","unverified",null],
 ["holy","基督村","Holy Village","หมู่บ้านโฮลี","unverified",null],
 ["australia","澳洲","Australia (Oslya)","ออสเตรเลีย","open","Lv 65 gate"],
 ["easter-island","復活島","Easter Island","เกาะอีสเตอร์","open","No level gate"],
 ["india","印度","India (Calcutta)","อินเดีย","open","Lv 105 gate"],
 ["antarctica","南極","Antarctica","แอนตาร์กติกา","open","Lv 85 gate"],
 ["maya","瑪雅","Maya","มายา","closed",null],
 ["inca","印加","Inca","อินคา","closed",null],
 ["athens","雅典","Athens","เอเธนส์","closed",null],
 ["china","中國","China","จีน","closed","Legacy transcriptions call this shop \"Fishing Village\""],
 ["changan","長安","Chang'an","ฉางอาน","closed",null],
 ["japan","日本","Japan","ญี่ปุ่น","closed","Legacy transcriptions call this shop \"Kyoto\""],
 ["korea","朝鮮","Korea","เกาหลี","closed",null],
 ["egypt","埃及","Egypt","อียิปต์","closed","The rank-18 town. Legacy transcriptions call it \"Cairo\""],
 ["bangkok","曼谷","Bangkok","กรุงเทพฯ","closed",null],
 ["whale-island","巨鯨島","Whale Island","เกาะวาฬยักษ์","closed","Also the source of the elemental Star Dust drops"],
 ["rome","羅馬","Rome","โรม","unverified","Legacy attribution only"],
 ["persia","波斯","Persia","เปอร์เซีย","unverified","Legacy attribution only"],
 ["universal-isle","宇宙島","Universal Isle","เกาะจักรวาล","unverified","Legacy attribution only"],
 ["yamataikoku","邪馬台國","Yamataikoku","ยามาไทโคขุ","unverified","Legacy attribution only"],
 ["hawaii","夏威夷","Hawaii","ฮาวาย","not-in-re","⚠️ The Re sheet has NO Hawaii shop. Every rank-18 refined material in Re comes from 高級煉金卷(RE版) / \"8-12購買\" instead. Legacy Hawaii rows are kept only as a legacy note."]
];

// ---- source constructors ----
const shop=(town,price,prov="legacy-wlohub")=>({type:"shop",town,price:price??null,provenance:prov});
const reshop=(town,price=null)=>({type:"shop",town,price,provenance:"re-sheet"});
const craft=(station,recipe=null)=>({type:"craft",station,recipe,provenance:"kb"});
const drop=(mob,lv=null,where=null)=>({type:"drop",mob,lv,where,provenance:"kb"});
const gather=(where)=>({type:"gather",where,provenance:"kb"});
const scroll=()=>({type:"scroll",note:"高級煉金卷(RE版) — Advanced Alchemy Scroll (Re) / \"8-12購買\", still unidentified",provenance:"re-sheet"});

const M=[];
const m=(family,rank,en,cn,sources,opt={})=>M.push({family,rank,en,cn,sources,...opt});

/* ===== COPPER ===== */
m("Copper",1,"Copper Ore","銅礦",[drop("Earth Rock Monster",3,"Kelan Cave"),gather("Kama Cave"),gather("Australia")]);
m("Copper",2,"Stone Axe","石斧",[reshop("kelan"),shop("kelan",20)],{cheapest:true});
m("Copper",2,"Copper Sand / Copper","銅沙",[craft("Melting Furnace")]);
m("Copper",3,"Bronze Hand Claw","青銅手爪",[reshop("kelan"),shop("kelan",60)]);
m("Copper",3,"Bronze Sword","青銅劍",[reshop("welling"),shop("welling",30)]);
m("Copper",3,"Copper Block","銅塊",[craft("Melting Furnace")]);
m("Copper",4,"Copper Material","銅材",[shop("welling",70),craft("Melting Furnace")]);
m("Copper",4,"Hand Axe / Adze","手斧",[reshop("holy"),shop("holy",70)]);
m("Copper",5,"Bronze Material","青銅材",[craft("Hot Kiln","Copper Ore + Tin Ore + Firewood ×2")]);
m("Copper",6,"Copper Plate","銅板",[craft("Anvil","Copper Material ×1")]);
m("Copper",8,"Blade Pike","刃矛",[reshop("maya"),shop("maya",200)]);
m("Copper",12,"Strange Rock Axe","奇岩斧",[reshop("easter-island")]);
m("Copper",12,"Copper Bracers","銅護腕",[shop("changan",370)]);
m("Copper",15,"Bronze Trident","三叉銅戟",[reshop("china"),shop("china",510)]);
m("Copper",16,"Copper-Woven Rope Shoes","銅編繩鞋",[reshop("korea"),shop("korea",560)]);
m("Copper",18,"Copper Mage Crown","銅法冠",[reshop("egypt"),shop("egypt",660)],{best:true});

/* ===== IRON ===== */
m("Iron",2,"Capacitance / Resistance","電容/電阻",[shop("universal-isle",30)],{cheapest:true});
m("Iron",3,"Iron Ore","鐵礦",[drop("Steel Ant",31),drop("Little Steel Beetle",52),drop("Little Ant",4),gather("Australia")]);
m("Iron",4,"Iron Sand","鐵沙",[shop("holy",70),drop("Blue Snowman",68)]);
m("Iron",4,"Iron Sword","鐵劍",[reshop("holy"),shop("holy",70)]);
m("Iron",5,"Iron Block","鐵塊",[craft("Melting Furnace")]);
m("Iron",6,"Iron Fillet","鐵片",[craft("Melting Furnace","Iron Ore ×2 + Firewood ×3")]);
m("Iron",7,"Iron Material","鐵材",[craft("Melting Furnace","Iron Ore ×2 + Firewood ×2")]);
m("Iron",9,"Twin-Edge Iron Axe","雙刃鐵斧",[reshop("australia")]);
m("Iron",10,"Cold Iron Blade","冷鐵刀",[reshop("australia")]);
m("Iron",11,"Indian Curved Blade","印度彎刀",[reshop("india"),shop("india",320)]);
m("Iron",14,"Great Sword","大劍",[reshop("china"),shop("china",460)]);
m("Iron",14,"Iron Bracers","鐵護腕",[shop("maya",460)]);
m("Iron",15,"Samurai Blade / Samurai Gold Helm","武士刀/武者金兜",[reshop("japan"),shop("japan",510)]);
m("Iron",16,"Tough Leather Armor","韌皮甲",[reshop("easter-island")],{note:"Best high-rank iron behind no level gate — and Easter Island is open on TH"});
m("Iron",17,"Iron Hemp Shoes","鐵麻鞋",[reshop("egypt"),shop("egypt",610)],{best:true});

/* ===== STEEL ===== */
m("Steel",8,"Steel Material","鋼材",[craft("Hot Kiln","Iron Material ×3 + Charcoal ×2 + Firewood ×4")],{note:"No shop, no drop, no gather. Kiln only"});
m("Steel",9,"Full-Moon Twin Claws","圓月雙爪",[reshop("bangkok"),shop("bangkok",240)],{cheapest:true});
m("Steel",10,"Copper-Skin Heavy Boots","銅皮重靴",[reshop("maya"),shop("maya",280)],{confidence:"RE-verified",note:"The \"rank-10 steel\""});
m("Steel",13,"Bloody Claw","血腥之爪",[reshop("antarctica"),shop("antarctica",410)],{note:"Antarctica is OPEN on TH — the best reachable steel right now"});
m("Steel",15,"Poison Fang","毒刃牙",[reshop("china"),shop("china",510)]);
m("Steel",18,"Sea Blue Scale Armor","海藍鱗甲",[reshop("egypt"),shop("egypt",660)],{best:true});

/* ===== PURE IRON ===== */
m("PureIron",4,"Pure Iron Ore","赤鐵礦",[drop("Red Rock Monster",4),drop("Steel Ant",31),drop("Red Chameleon",65)]);
m("PureIron",5,"Pure Iron Sand","赤鐵沙",[craft("Melting Furnace")]);
m("PureIron",6,"Pure Iron Block","赤鐵塊",[craft("Melting Furnace")]);
m("PureIron",10,"Pure Iron Heavy Boots","赤煉重鞋",[reshop("india"),shop("india",280)]);
m("PureIron",15,"Pure Iron Sabre","赤鐵軍刀",[reshop("changan"),shop("changan",510)]);
m("PureIron",18,"Refined Pure Iron Material","粹煉赤鐵材",[scroll(),shop("hawaii",null,"legacy-wlohub")],{best:true});

/* ===== TITANIUM ===== */
m("Titan",10,"Titanium Metal","鈦金屬",[gather("Pleasure Island (2242,435)")],{note:"No monster drops"});
m("Titan",11,"Black Pike Blade","黑矛刃",[reshop("athens"),shop("athens",320)],{cheapest:true});
m("Titan",15,"Titanium Alloy","鈦合金",[craft("Melting Furnace","Charcoal ×5 + Sulfur ×2 + Steel ×3 + Gold Sand ×2 + White Silvery ×1")]);
m("Titan",16,"Grey Wolf Bracers","灰狼護腕",[reshop("bangkok",560),shop("bangkok",560)],{best:true,priceConfirmed:true});
m("Titan",18,"Refined Active Titanium","粹鍊活性鈦",[scroll(),shop("hawaii",null,"legacy-wlohub")]);

/* ===== SILVER ===== */
m("Silver",5,"White Feather Earrings","白羽耳環",[craft("compounding","Silver + Feather")],{confidence:"KK-tested",note:"KK read this off a live tooltip: rank 5, equip Lv 10"});
m("Silver",8,"Silvery Ore","銀礦",[drop("Green Chameleon",66,"Cairo"),gather("Maya Forest")]);
m("Silver",9,"Pure Silver Earring","純銀耳環",[reshop("easter-island"),shop("easter-island",240)],{cheapest:true,note:"Easter Island is open on TH"});
m("Silver",10,"Silvery Block","銀塊",[craft("Hot Kiln")]);
m("Silver",14,"Silver Blade Claw","銀製刃爪",[reshop("korea"),shop("korea",460)],{best:true});
m("Silver",18,"Refined Pure Silver","粹煉銀塊",[scroll(),shop("hawaii",null,"legacy-wlohub")]);

/* ===== GOLD / PLATINUM / TIN / ALUM / LEAD ===== */
m("Gold",9,"Turquoise Staff","綠松石杖",[shop("athens",240)],{cheapest:true});
m("Gold",11,"Gem Necklace","寶石項鍊",[reshop("india"),shop("india",320)],{note:"The gold ladder entry point"});
m("Gold",11,"Gold Ore","金礦",[gather("Pleasure Island")]);
m("Gold",12,"Gold Sand","金沙",[craft("Hot Kiln")]);
m("Gold",13,"Gold Block","金塊",[craft("Hot Kiln")]);
m("Gold",18,"Gold Dragon Greatblade","金龍大刀",[reshop("whale-island")],{best:true});
m("Gold",18,"Refined Gold Block","粹煉金塊",[scroll(),shop("hawaii",null,"legacy-wlohub")]);
m("Platinum",7,"Silver Sandals","白銀履鞋",[reshop("inca"),shop("inca",170)],{cheapest:true,note:"⚠️ Platinum family, NOT silver"});
m("Platinum",14,"Silver Ring","白銀戒指",[reshop("korea"),shop("korea",460)],{best:true,note:"⚠️ Platinum family, NOT silver"});
m("Platinum",18,"Refined White Silver","粹煉白銀",[scroll(),shop("hawaii",null,"legacy-wlohub")]);
m("Tin",2,"Tin Ore","錫礦",[drop("Rock Monster",3),drop("Waterrock Chameleon",66)]);
m("Tin",3,"Tin Sand","錫沙",[drop("Red Snowman",66)]);
m("Tin",4,"Tin Block","錫塊",[craft("Melting Furnace")]);
m("Tin",5,"Tin Material","錫材",[craft("Melting Furnace")]);
m("Tin",9,"Tin Staff","錫杖",[reshop("australia"),shop("australia",240)],{cheapest:true,note:"Tin/Jade dual family. Australia is open on TH"});
m("Tin",12,"Jade Green Tin Staff","翡翠錫杖",[reshop("antarctica"),shop("antarctica",370)]);
m("Tin",18,"Forest Spirit Staff","森靈法杖",[reshop("egypt"),shop("egypt",660)],{best:true});
m("Alum",3,"Aluminium Ore","鋁礦",[drop("Rock Monster",3)],{note:"No shop sells aluminium at any rank"});
m("Alum",5,"Aluminium Block","鋁塊",[craft("Melting Furnace")]);
m("Alum",6,"Aluminium Plate","鋁板",[craft("Anvil")]);
m("Alum",7,"Hard Aluminium Plate","硬鋁板",[craft("Anvil")]);
m("Alum",16,"Airship Steering Device","飛船轉舵裝置",[craft("Rope Saw")]);
m("Lead",2,"Galena","方鉛礦",[drop("Rock Monster Quest",42)],{note:"No shop sells lead at any rank"});
m("Lead",3,"Galena Sand","鉛礦沙",[drop("Green Snowman",67)]);
m("Lead",4,"Lead Block","鉛塊",[craft("Melting Furnace")]);
m("Lead",5,"Lead Plate","鉛鋼",[craft("Anvil")]);
m("Lead",6,"Zinc Block","亞鉛塊",[craft("Melting Furnace")]);

/* ===== WOOD ===== */
m("Wood",1,"Wood / Charcoal / Firewood","木/木炭/柴薪",[drop("Senior Banyan Tree Spirit",17),craft("Stone Knife")]);
m("Wood",2,"Ordinary Wood","普通木材",[shop("kelan",30),craft("Stone Knife")],{cheapest:true});
m("Wood",3,"Lauan Wood","柳安木",[shop("holy",50),craft("Stone Knife")]);
m("Wood",3,"Mage's Wand / Lauan Wood Club","法師魔杖/柳安木棒",[reshop("kelan"),shop("kelan",30)]);
m("Wood",4,"Oak Wood","橡木",[shop("maya",70),craft("Stone Knife")],{note:"Feeds the rank-21 Vertical Wing"});
m("Wood",4,"Wizard's Wand","巫師魔杖",[reshop("welling"),shop("welling",40)]);
m("Wood",5,"Cypress Wood","檜木",[shop("japan",100),craft("Stone Knife")]);
m("Wood",6,"Mast","船桅",[craft("Bench Saw","Lauan ×4")]);
m("Wood",7,"Great Cypress Club / Main Mast","大檜木棒/主桅",[reshop("inca"),shop("inca",170)]);
m("Wood",10,"Fine Wood","上等木材",[shop("athens",280)]);
m("Wood",14,"Dragon Staff","龍杖",[reshop("china"),shop("china",460)],{note:"Heavily used mid-tier wood ingredient"});
m("Wood",14,"Vine Bamboo Hat / Wooden Clogs","藤斗笠/木屐",[reshop("japan")]);
m("Wood",17,"Wooden Mallet","木槌",[reshop("whale-island")],{best:true});
m("Wood",19,"Wooden Pedals","木踏板",[craft("Rope Saw","Oak Wood ×2 + Wooden Winch")]);
m("Wood",21,"Vertical Wing / Level Wing","垂直翼/水平翼",[craft("Bench Saw","Oak Wood ×2, 6 minutes")],{star:true,note:"⭐ The cheapest rank-21 material of any family"});

/* ===== GRASS / FLOWER / LEAF / NYLON ===== */
m("Grass",1,"Harl Grass / Linen Thread","草/亞麻線",[drop("Cirrus",41),drop("Tender Cirrus",35),craft("Spinning Wheel")]);
m("Grass",2,"Common / Paper / Vine Grass","普通草/紙草/藤草",[drop("Cirrus",41)]);
m("Grass",3,"Straw Sandals","草鞋",[shop("welling",30)],{cheapest:true});
m("Grass",6,"Priest Hat","神職帽",[reshop("maya"),shop("maya",130)]);
m("Grass",6,"Purple Grass","紫草",[shop("changan",130)]);
m("Grass",10,"Emerald Headband","翠綠頭帶",[reshop("bangkok"),shop("bangkok",280)]);
m("Grass",13,"Red Flower Qipao","紅花旗袍",[reshop("changan",400)],{priceConfirmed:true});
m("Grass",16,"Black Witch Hat","黑巫法帽",[reshop("whale-island")],{best:true});
m("Grass",18,"Fine Grass","上等草",[shop("hawaii",null,"legacy-wlohub")],{note:"⚠️ Legacy only — no Hawaii shop exists in Re. Use the alchemy scroll route"});
m("Flower",1,"Cotton / Cotton Thread","棉/棉線",[drop("Cirrus",41),drop("Yellow Triceratops",69),craft("Spinning Wheel")]);
m("Flower",2,"Headband","頭帶",[shop("welling",20)],{cheapest:true});
m("Flower",5,"Light Cloth Robe","輕布衣",[reshop("holy"),shop("holy",100)]);
m("Flower",12,"Water Mage Gloves","水法手套",[reshop("easter-island"),shop("easter-island",370)]);
m("Flower",13,"Qipao / Warm Cloth Robe","旗袍/保暖布衣",[reshop("china"),reshop("antarctica"),shop("china",410)]);
m("Flower",15,"White Spirit Gloves / Cotton Silk Robe","白靈手套/棉綢法袍",[reshop("japan"),reshop("korea"),shop("korea",510)]);
m("Flower",16,"Silk Qipao","蠶絲旗袍",[reshop("japan"),shop("japan",560)],{best:true});
m("Leaf",6,"Grain Grass Laurel / Big Fruit Leaf","禾草桂冠/大果葉",[reshop("holy"),shop("holy",130),shop("athens",130)],{cheapest:true});
m("Leaf",10,"Green Leaf Cloth Robe","綠葉布衣",[reshop("bangkok"),shop("bangkok",280)],{best:true});
m("Nylon",2,"Nylon","尼龍",[craft("Hot Kiln","Coal Ball + Fresh Water")]);
m("Nylon",6,"Charcoal Powder","木炭粉",[craft("Kitchen Range","Coal ×20")],{note:"Cheap deterministic nylon"});
m("Nylon",12,"Yellow Horse Shoes","黃馬鞋",[reshop("changan",370)],{priceConfirmed:true});
m("Nylon",14,"Ninja Suit","忍者服",[reshop("japan",460)],{priceConfirmed:true});
m("Nylon",16,"Masked Suit","蒙面裝",[reshop("japan",560)],{best:true,priceConfirmed:true});

/* ===== BEAST ===== */
m("Leather",2,"Beast Hide Robe","獸皮衣",[reshop("kelan"),shop("kelan",30)],{cheapest:true});
m("Leather",2,"Beast Hide","獸皮",[drop("squirrels / wolves / bears / chameleons / foxes",null,"everywhere")]);
m("Leather",4,"Advanced Beast Hide Robe","進階獸皮衣",[reshop("welling"),shop("welling",70)]);
m("Leather",5,"Insect Hide Bracers","蟲皮護腕",[reshop("holy"),shop("holy",100)]);
m("Leather",5,"Chameleon Skin","變色龍皮",[drop("chameleons",51)]);
m("Leather",6,"Snake Skin / Dinosaur Hide","蛇皮/恐龍皮",[drop("snakes",67),drop("Stegosaurus",65)]);
m("Leather",8,"Fang Bracers","牙護腕",[reshop("inca"),shop("inca",200)]);
m("Leather",10,"Hunting Leather Boots","狩獵皮靴",[reshop("australia"),shop("australia",280)],{note:"Australia is open on TH"});
m("Leather",11,"Reinforced Leather Gloves","強化皮手套",[reshop("australia"),shop("australia",320)]);
m("Leather",15,"Silver Dragon Scale Armor / Galloping Horse Boots","銀龍鱗甲/奔馬靴",[reshop("athens"),reshop("japan"),shop("japan",510)]);
m("Leather",16,"Leather Armor","皮鎧",[shop("easter-island",560)]);
m("Leather",18,"Wind Demon Gloves","風魔手套",[reshop("egypt"),shop("egypt",660)],{best:true});
m("Fur",3,"Sheepskin","羊皮",[drop("Sheep",45)]);
m("Fur",6,"White Fox Fur","白狐毛皮",[drop("Snow Fox",65,"Iceberg"),drop("Silver Fox",66,"Iceberg")]);
m("Fur",13,"Fur Boots","毛皮靴",[reshop("antarctica"),shop("antarctica",410)],{best:true,note:"Skin/Fur dual. Antarctica is open on TH"});
m("Bone",4,"Beast Bone","獸骨",[drop("Wild Wolf",15),drop("Wild Wolf",30)]);
m("Bone",6,"Dinosaur Fang","恐龍牙",[drop("Velociraptor",59)]);
m("Bone",11,"Black Bone Axe","黑骨斧",[reshop("athens"),shop("athens",320)],{cheapest:true,best:true});
m("Bone",16,"Dragon Fang","龍牙",[drop("Velociraptor",59)]);
m("Bone",20,"Wolf Fang","狼牙",[drop("Snow Wolf",60,"Antarctica")],{star:true,note:"⭐ The single most-used catalyst in the recipe book. Antarctica is open on TH"});
m("Bone",20,"Snake Fang","蛇牙",[drop("snakes",50)]);
m("Feather",1,"Funny Feather","趣味羽毛",[drop("Chicken",13),drop("Vulture",51)],{cheapest:true});
m("Feather",6,"Swallow Feather","燕羽",[shop("persia",130)]);
m("Feather",10,"Eagle Feather","鷹羽",[shop("yamataikoku",280)]);

/* ===== STONE & GEMS ===== */
m("Rock",3,"Obsidian","黑曜石",[shop("rome",50)],{cheapest:true});
m("Rock",6,"Granite","花崗岩",[shop("china",130)]);
m("Rock",9,"Spirit Stone Staff","靈石法杖",[reshop("easter-island"),shop("easter-island",240)]);
m("Rock",14,"Giant Stone Hammer","巨石槌",[reshop("korea"),shop("korea",460)],{best:true});
m("Coal",1,"Coal Ore","煤礦",[drop("Little Ant",3),drop("Rock Skin Ant",30),gather("Kelan Cave")]);
m("Coal",4,"Coal","煤",[craft("Melting Furnace")]);
m("Coal",7,"Coal Block","煤塊",[craft("Melting Furnace")]);
m("Sulfur",2,"Sulfur","硫磺",[gather("Kelan Cave (1922,1255)")],{note:"No shop, no drop"});
m("Silicon",5,"Quartz","石英",[drop("Mori Statue",76),gather("Australia"),gather("Subway")]);
m("Crystal",5,"Pink Crystal","粉晶",[drop("Earth Rock Monster",3)],{cheapest:true,note:"Lv3 mob drops a rank-5 gem — the cheapest crystal in the game"});
m("Crystal",9,"Blue Crystal Mage Staff","藍水晶法杖",[reshop("athens"),shop("athens",240)]);
m("Crystal",14,"Radiance Earring","光輝耳環",[reshop("changan"),shop("changan",460)],{best:true});
m("Jade",5,"White Jade","白玉",[gather("Iceberg (3622,2215)")]);
m("Jade",6,"Red Jade","紅玉",[gather("Iceberg (3622,2215)")]);
m("Jade",7,"White Jade Powder","白玉粉",[craft("Anvil")]);
m("Jade",10,"Delicate White Jade","精緻白玉",[craft("Grinding Equipment")]);
m("Jade",12,"Delicate Red Jade","精緻紅玉",[craft("Grinding Equipment")]);
m("Jade",14,"Water Jade","水玉",[reshop("whale-island")]);
m("Gem",5,"Emerald","翠玉",[shop("yamataikoku",100)],{cheapest:true});
m("Gem",9,"Green Jewel Staff","綠寶石之杖",[reshop("athens"),shop("athens",240)]);
m("Gem",12,"Pure Sapphire","純藍寶石",[craft("Crystal Furnace")]);
m("Gem",13,"Pure Ruby","純紅寶石",[craft("Crystal Furnace")]);
m("Gem",16,"Flawless Sapphire","無暇藍寶石",[craft("Crystal Furnace")],{star:true,note:"Real bottleneck — buy from players"});
m("Gem",17,"Flawless Ruby","無暇紅寶石",[craft("Crystal Furnace")],{star:true});
m("Diamond",8,"Gem Necklace / Diamond Necklace","鑽石項鍊",[reshop("bangkok"),shop("bangkok",200)],{cheapest:true,note:"Absurdly cheap for a gem family"});
m("Diamond",14,"Delicate Diamond","精緻鑽石",[craft("Crystal Furnace")]);
m("Diamond",16,"Stag Earring","雄鹿耳環",[reshop("whale-island")]);
m("Diamond",21,"Pure Diamond","無暇鑽石",[craft("Crystal Furnace")],{star:true,note:"⭐ One of only three rank-21 materials"});
m("MagicJade",14,"Dragon Staff","龍杖",[reshop("china"),shop("china",460)],{cheapest:true});
m("MagicJade",18,"Magic Crystal Powder","魔晶粉",[shop("hawaii",null,"legacy-wlohub")],{note:"⚠️ Legacy only — use the alchemy scroll route in Re"});
m("MagicJade",21,"Magic Jade Stone","魔玉石",[craft("Crystal Furnace")],{star:true,note:"⭐ One of only three rank-21 materials"});

/* ===== STAR (Re-exclusive) ===== */
m("Star",11,"Star Ring Longsword","星環長劍",[reshop("australia")],{cheapest:true,note:"Australia is open on TH — the entry point into the Re-only Star family"});
m("Star",13,"Star Ring Battle Dress","星環戰衣",[reshop("india")]);
m("Star",17,"Star Ring Helm","星環頭盔",[reshop("japan")],{best:true,note:"Highest buyable Star material"});
m("Star",2,"Star Dust (elemental) 星耀之塵","星耀之塵·空/水/火/地/風",[drop("Smart Decomposition Station (喵型智能分解站)",null,"Whale Island area")],{note:"Thai: ผงดาราแห่งธาตุ… — rank 2, family ประกายดาว. Also washable on Superior Alchemy targeting rank 3"});

// ---- assemble ----
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const seen=new Map();
const out=M.map(r=>{
  let id=`${slug(r.family)}-r${r.rank}-${slug(r.en).slice(0,40)}`;
  if(seen.has(id)){const n=seen.get(id)+1;seen.set(id,n);id+='-'+n}else seen.set(id,1);
  return {
    id, family:r.family, rank:r.rank,
    name:{en:r.en, cn:r.cn, th:null},
    sources:r.sources,
    flags:{
      cheapestOfFamily:!!r.cheapest,
      highestBuyable:!!r.best,
      keyMaterial:!!r.star,
      priceConfirmedRe:!!r.priceConfirmed
    },
    confidence:r.confidence||"RE-reported",
    note:r.note||null,
    updated:"2026-09-07"
  };
});
fs.writeFileSync('data/materials.json',JSON.stringify(out,null,1));
fs.writeFileSync('data/towns.json',JSON.stringify(TOWNS.map(([key,cn,en,th,status,note])=>({key,name:{en,cn,th},thStatus:status,note})),null,1));

// checks
const towns=new Set(TOWNS.map(t=>t[0]));
const bad=new Set();
out.forEach(r=>r.sources.forEach(s=>{if(s.type==='shop'&&!towns.has(s.town))bad.add(s.town)}));
const fams=new Set(JSON.parse(fs.readFileSync('data/codes.json','utf8')).families.map(f=>f.key));
const badFam=[...new Set(out.map(r=>r.family))].filter(f=>!fams.has(f));
console.log('materials:',out.length,'towns:',TOWNS.length);
console.log('families covered:',new Set(out.map(r=>r.family)).size);
console.log('unknown towns:',[...bad].join(',')||'none');
console.log('families not in codes.json:',badFam.join(',')||'none');
console.log('open-on-TH shop rows:',out.filter(r=>r.sources.some(s=>s.type==='shop'&&['australia','easter-island','india','antarctica'].includes(s.town))).length);
