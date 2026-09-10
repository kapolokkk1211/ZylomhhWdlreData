# -*- coding: utf-8 -*-
"""Attach a skill list to every companion.

Two sources, deliberately kept apart:
  * The Re-era compendium (星飄) gives the skill *names* and max levels for all 25.
    That is the list a Thai player actually sees, so it is the spine.
  * WLOHUB gives SP cost, target pattern and a description — but from the LEGACY game,
    so it only covers 12 of ours and its numbers are pre-Re. It enriches, never overrides.
Anything WLOHUB could not supply is simply absent rather than guessed.
"""
import json, io, re

# ---- compendium: id -> (skill1, skill2)  (the rebirth skill already lives on the row) ----
COMP = {
 'rocca':    ['五芒星閃‧改10', '羅剎彎刀8'],
 'xiaolan':  ['孤星8', '土岩之牆10'],
 'niss':     ['天雷12', '回魔咒10'],
 'sarles':   ['怒狼狂擊15', '水鏡之盾10'],
 'cliff':    ['影殺‧改12', '旋擊8'],
 'magellan': ['狂岩擊‧改12', '護盾術10'],
 'elin':     ['狂亂擊8', '等離子機關槍12'],
 'kanako':   ['神樂12', '回復術10'],
 'rinne':    ['襲風斬8↓襲風斬‧改8', '咒縛術10↓咒縛術‧改10'],
 'yanling':  ['火靈斬8', '熾焰武力10'],
 'shasha':   ['水之刃‧改12', '冰凍術10'],
 'nakira':   ['真‧風切術18', '麻痺術10'],
 'ares':     ['火爆狂爪8', '噴火8'],
 'lynx':     ['冰晶貓拳8↓冰晶貓拳‧改', '呼嚕10↓呼嚕‧改12'],
 'mary1':    ['火焰處刑8↓火焰處刑‧改8', '焰蝶燃魄10↓焰蝶燃魄‧改10'],
 'imhotep':  ['蟲群之怒8↓蟲群之怒‧改8', '弒魂突刺10↓弒魂突刺‧改10'],
 'ashin':    ['迷蹤幻影1↓迷蹤幻影‧改1', '風刃詭步10↓風刃詭步‧改10'],
 'pearl':    ['珍珠轟擊6↓珍珠轟擊‧改6', '全糖少冰12↓全糖少冰‧改'],
 'anheduana':['月華龍捲10↓月華龍捲‧改10', '讚美詩12↓讚美詩‧改12'],
 'nemea':    ['風雷怒嘯8↓風雷怒嘯‧改8', '雷爪風暴10↓雷爪風暴‧改10'],
 'tomoe':    ['焰命流‧斷炎8↓焰命流‧斷炎‧改8', '焰命流‧鳳輪10↓焰命流‧鳳輪‧改'],
 'leonardo': ['真空引爆8↓真空引爆‧改8', '高壓衝擊10↓高壓衝擊‧改10'],
 'ragusa':   ['冰霜龍襲8↓冰霜龍襲‧改8', '龍鎧逆麟6↓龍鎧逆麟‧改6'],
 'augustus': ['不敗征服10↓不敗征服‧改10', '律令裁決10↓律令裁決‧改10'],
 'gibil':    ['熾熱靈光10↓熾熱靈光‧改10', '虛妄灼燒12↓虛妄灼燒‧改12'],
}

# ---- Thai + English for every skill name that appears above, plus the rebirth skills ----
TH = {
 '五芒星閃':('ดาวห้าแฉกเปล่งประกาย','Five Star Hit'),
 '羅剎彎刀':('ดาบโค้งอสูร','Tulwar'),
 '孤星':('ดาวโดดเดี่ยว','Star'),
 '土岩之牆':('กำแพงดินหิน','Stone Wall'),
 '天雷':('ฟ้าผ่าสวรรค์','Sky Thunder'),
 '回魔咒':('คาถาคืนพลังเวท','Magic Recovery'),
 '怒狼狂擊':('หมาป่าเกรี้ยวกราดจู่โจม','Fury Strike'),
 '水鏡之盾':('โล่กระจกน้ำ','Water Shield'),
 '影殺':('ลอบสังหารเงา','Shadow Hit'),
 '旋擊':('หมุนฟาด','Rolling Air'),
 '狂岩擊':('ทุบหินคลั่ง','Boulder Hit'),
 '護盾術':('วิชาโล่ป้องกัน','Shield Defense'),
 '狂亂擊':('รัวกระสุนคลั่ง','Chaotic Attack'),
 '等離子機關槍':('ปืนกลพลาสมา','Iron-Scatter Gun'),
 '神樂':('ระบำบวงสรวง','Ice Arrow'),
 '回復術':('วิชาฟื้นฟู','Recovery'),
 '襲風斬':('ฟันลมจู่โจม','Wind Assault'),
 '咒縛術':('วิชาพันธนาการ','Cord Spell'),
 '火靈斬':('ฟันวิญญาณเพลิง','Fire Strike'),
 '熾焰武力':('พลังรบเปลวเพลิง','Fiery Attack'),
 '水之刃':('ใบมีดสายน้ำ','Water Hit'),
 '冰凍術':('วิชาเยือกแข็ง','Freeze Spell'),
 '真‧風切術':('แท้ · วิชาลมกรีด','Wind Cut Beating'),
 '麻痺術':('วิชาอัมพาต','Coma Spell'),
 '火爆狂爪':('กรงเล็บเพลิงคลั่ง','Blazing Fury Claw'),
 '噴火':('พ่นไฟ','Fire Breath'),
 '冰晶貓拳':('หมัดแมวเกล็ดน้ำแข็ง','Ice Crystal Cat Punch'),
 '呼嚕':('ครางฮึ่ม','Purr'),
 '火焰處刑':('ประหารด้วยเปลวเพลิง','Flame Execution'),
 '焰蝶燃魄':('ผีเสื้อเพลิงเผาวิญญาณ','Flame Butterfly Soulburn'),
 '蟲群之怒':('โทสะแห่งฝูงแมลง','Wrath of the Swarm'),
 '弒魂突刺':('แทงทะลวงสังหารวิญญาณ','Soulslaying Thrust'),
 '迷蹤幻影':('ภาพลวงไร้ร่องรอย','Vanishing Mirage'),
 '風刃詭步':('ใบมีดลมย่างก้าวลวง','Windblade Feint'),
 '珍珠轟擊':('ระเบิดไข่มุก','Pearl Barrage'),
 '全糖少冰':('หวานเต็มน้ำแข็งน้อย','Full Sugar Less Ice'),
 '月華龍捲':('พายุหมุนแสงจันทร์','Moonlight Tornado'),
 '讚美詩':('บทเพลงสรรเสริญ','Hymn'),
 '風雷怒嘯':('คำรามลมสายฟ้า','Thunderwind Roar'),
 '雷爪風暴':('พายุกรงเล็บสายฟ้า','Thunderclaw Storm'),
 '焰命流‧斷炎':('สายเพลิงชีวิต · ตัดเปลวไฟ','Flamelife Style · Flamecutter'),
 '焰命流‧鳳輪':('สายเพลิงชีวิต · กงล้อหงส์','Flamelife Style · Phoenix Wheel'),
 '真空引爆':('จุดระเบิดสุญญากาศ','Vacuum Detonation'),
 '高壓衝擊':('แรงอัดกระแทก','High-Pressure Impact'),
 '冰霜龍襲':('มังกรน้ำแข็งจู่โจม','Frost Dragon Assault'),
 '龍鎧逆麟':('เกล็ดต้องห้ามเกราะมังกร','Dragonmail Reverse Scale'),
 '不敗征服':('พิชิตไร้พ่าย','Undefeated Conquest'),
 '律令裁決':('คำพิพากษาตามกฎ','Decree of Judgement'),
 '熾熱靈光':('แสงวิญญาณแผดเผา','Searing Aura'),
 '虛妄灼燒':('เผาไหม้มายา','Illusory Immolation'),
}

# ---- WLOHUB enrichment, keyed by the Chinese base name so a rename cannot mis-attach ----
# (SP, target pattern, Thai description, English description)
WLO = {
 '五芒星閃': (37,'near','ห้าดาวฟาดต่อเนื่อง สี่ครั้งแรกเบา ครั้งที่ห้าแรงมากจนอาจสังหารเป้าหมายทันที', 'Five hits in a star shape; the first four are light, the fifth can kill the target outright.'),
 '羅剎彎刀': (18,'dist','ขว้างดาบโค้งขนาดใหญ่แบบบูมเมอแรงใส่เป้าหมาย', 'Throws a huge boomerang-like blade at the target.'),
 '孤星':     (55,'dist','แยกพื้นดินด้วยพลังยก สกิลโจมตีเพียงอย่างเดียวของเสี่ยวหลาน', 'Cracks the ground with lifting force — Xiaolan’s only attack skill.'),
 '土岩之牆': (110,'aid','กำแพงกันการโจมตีกายภาพ ลดความเสียหายให้พวกพ้องหนึ่งเทิร์น', 'A wall against physical attacks; shields one ally for a single turn.'),
 '天雷':     (110,'dist','ฟ้าผ่าสายฟ้าสีน้ำเงินลงใส่เป้าหมาย ยิ่งเลเวลสกิลสูงยิ่งโดนหลายเป้า', 'Blue lightning called down on the target; hits more targets as the grade rises.'),
 '回魔咒':   (26,'aid','คืน SP ให้ปาร์ตี้ในหนึ่งเทิร์น ระดับสูงสุดครอบคลุมได้ถึงสามปาร์ตี้', 'Recovers the party’s SP in one round; at max grade it reaches three parties.'),
 '怒狼狂擊': (30,'near','', ''),
 '水鏡之盾': (35,'aid','', ''),
 '影殺':     (44,'near','สังหารเป้าหมายจากด้านหลัง', 'Kills the target from behind.'),
 '旋擊':     (13,'near','โจมตีด้วยกระแสลมหมุน', 'Attacks with a swirling current.'),
 '狂岩擊':   (23,'near','ทำลายทุกอย่างด้วยก้อนหิน', 'Destroys everything with rock.'),
 '護盾術':   (15,'aid','เพิ่มพลังป้องกันชั่วคราว', 'Raises defence briefly.'),
 '狂亂擊':   (26,'near','โจมตีรัวหลายครั้งแต่แรงน้อย ราว 30–100 ต่อครั้งกับศัตรูเลเวลใกล้กัน', 'Many weak hits — around 30–100 damage each against same-level creatures.'),
 '等離子機關槍': (75,'dist','ยิงทะลุแนวตรง 3 เป้าหมาย ความเสียหาย 400+ แต่กิน SP หนักมาก', 'Hits three targets in a line for 400+, at a heavy SP cost.'),
 '神樂':     (32,'near','โจมตีเป้าหมายด้วยลูกศรน้ำแข็ง', 'Hurts the target with ice arrows.'),
 '回復術':   (62,'aid','ฟื้นฟู HP ต่อเนื่อง', 'Recovers HP continuously.'),
 '襲風斬':   (None,'near','', ''),
 '咒縛術':   (47,'dist','พันธนาการศัตรูด้วยลำแสงเวทมนตร์', 'Traps the enemy with magic beams.'),
 '火靈斬':   (28,'single','ฟันหลายครั้งแล้วจบด้วยการระเบิด', 'Multiple cuts followed by an explosion.'),
 '熾焰武力': (31,'buff','เพิ่มพลังโจมตีให้เป้าหมาย', 'Increases the target’s attack.'),
 '水之刃':   (20,'near','', ''),
 '冰凍術':   (49,'dist','', ''),
 '真‧風切術': (21,'dist','', ''),
 '麻痺術':   (81,'aid','', ''),
}

WAY = {
 'near':  ('ระยะประชิด','Near attack'),
 'dist':  ('ระยะไกล','Distance'),
 'aid':   ('สกิลสนับสนุน','Aid skill'),
 'buff':  ('เพิ่มค่าสถานะ','Stat buff'),
 'single':('เป้าหมายเดียว','Single target'),
}

def split(entry):
    """'襲風斬8↓襲風斬‧改8' -> [('襲風斬','8'), ('襲風斬‧改','8')]"""
    out = []
    for part in entry.split('↓'):
        part = part.strip()
        m = re.match(r'^(.*?)(\d+)?$', part)
        name, lv = m.group(1).strip(), m.group(2)
        out.append((name, lv))
    return out

def th_of(cn):
    if cn in TH: return TH[cn]
    base = cn.replace('‧改', '')
    if base in TH:
        th, en = TH[base]
        return (th + ' ‧ ปรับปรุง', en + ' · Kai')
    raise SystemExit('no Thai for skill: ' + cn)

rows = json.load(io.open('content/data/companions.json', encoding='utf-8'))
missing = []
for r in rows:
    entries = COMP.get(r['id'])
    if not entries:
        missing.append(r['id']); continue
    skills = []
    for entry in entries:
        forms = split(entry)
        base_cn = forms[0][0]
        th, en = th_of(base_cn)
        sk = {'cn': base_cn, 'th': th, 'en': en, 'max': forms[0][1]}
        if len(forms) > 1:
            up_cn, up_lv = forms[1]
            upth, upen = th_of(up_cn)
            sk['up'] = {'cn': up_cn, 'th': upth, 'en': upen, 'max': up_lv}
        w = WLO.get(base_cn)
        if w:
            sp, way, desc, desc_en = w
            if sp: sk['sp'] = sp
            if way: sk['way'] = way
            if desc: sk['desc'] = {'th': desc, 'en': desc_en or desc}
            sk['legacy'] = True   # the SP/target/description are pre-Re numbers
        skills.append(sk)
    # the rebirth skill closes the list, flagged so the UI can mark it
    if r.get('rebirthSkill'):
        skills.append({'cn': r['rebirthSkill'], 'th': r.get('rebirthSkillTh'), 'rebirth': True})
    r['skills'] = skills
    # lynx's spotlight prose carried its own copy; the shared list replaces it
    if r.get('extra') and 'skills' in r['extra']:
        del r['extra']['skills']

if missing: raise SystemExit('no compendium skills for: ' + ', '.join(missing))
io.open('content/data/companions.json','w',encoding='utf-8').write(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')

n = sum(len(r['skills']) for r in rows)
enr = sum(1 for r in rows for s in r['skills'] if s.get('legacy'))
print('companions %d · skill entries %d · enriched from WLOHUB %d' % (len(rows), n, enr))
print('ways used:', sorted({s['way'] for r in rows for s in r['skills'] if s.get('way')}))
