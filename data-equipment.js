// ---------- PHB armor table (AC engine) ----------
// base AC, dexCap (99 = unlimited, 2 = medium, 0 = heavy), strReq, stealthDis
const ARMORS={
 none:      {n:'No armor',                base:10,dex:99},
 padded:    {n:'Padded (light)',          base:11,dex:99,sd:1},
 leather:   {n:'Leather (light)',         base:11,dex:99},
 studded:   {n:'Studded Leather (light)', base:12,dex:99},
 hide:      {n:'Hide (medium)',           base:12,dex:2},
 chainshirt:{n:'Chain Shirt (medium)',    base:13,dex:2},
 scale:     {n:'Scale Mail (medium)',     base:14,dex:2,sd:1},
 breastplate:{n:'Breastplate (medium)',   base:14,dex:2},
 halfplate: {n:'Half Plate (medium)',     base:15,dex:2,sd:1},
 ringmail:  {n:'Ring Mail (heavy)',       base:14,dex:0,sd:1},
 chainmail: {n:'Chain Mail (heavy)',      base:16,dex:0,str:13,sd:1},
 splint:    {n:'Splint (heavy)',          base:17,dex:0,str:15,sd:1},
 plate:     {n:'Plate (heavy)',           base:18,dex:0,str:15,sd:1}
};
// AC from equipped armor + DEX (capped) + shield + magic. Feature effects (+AC) are added on top by recalc.
function computedBaseAC(){
  const eq=S.equip||{};
  const a=ARMORS[eq.armor]||ARMORS.none;
  const dexB=Math.min(amod('dex'),a.dex===99?999:a.dex);
  return a.base+dexB+num(eq.armorMagic)+(eq.shield?2+num(eq.shieldMagic):0);
}

// ---------- PHB weapon table ----------
// d=damage die, ty=type, fin=finesse (use best of STR/DEX), rng=ranged (DEX), ver=versatile die,
// thrown=throw range, reach, h2=two-handed, light
const WEAPONS={
 club:{n:'Club',d:'1d4',ty:'bludgeoning',light:1},
 dagger:{n:'Dagger',d:'1d4',ty:'piercing',fin:1,light:1,thrown:'20/60'},
 greatclub:{n:'Greatclub',d:'1d8',ty:'bludgeoning',h2:1},
 handaxe:{n:'Handaxe',d:'1d6',ty:'slashing',light:1,thrown:'20/60'},
 javelin:{n:'Javelin',d:'1d6',ty:'piercing',thrown:'30/120'},
 lighthammer:{n:'Light Hammer',d:'1d4',ty:'bludgeoning',light:1,thrown:'20/60'},
 mace:{n:'Mace',d:'1d6',ty:'bludgeoning'},
 quarterstaff:{n:'Quarterstaff',d:'1d6',ty:'bludgeoning',ver:'1d8'},
 sickle:{n:'Sickle',d:'1d4',ty:'slashing',light:1},
 spear:{n:'Spear',d:'1d6',ty:'piercing',thrown:'20/60',ver:'1d8'},
 lightcrossbow:{n:'Light Crossbow',d:'1d8',ty:'piercing',rng:'80/320'},
 dart:{n:'Dart',d:'1d4',ty:'piercing',fin:1,rng:'20/60'},
 shortbow:{n:'Shortbow',d:'1d6',ty:'piercing',rng:'80/320'},
 sling:{n:'Sling',d:'1d4',ty:'bludgeoning',rng:'30/120'},
 battleaxe:{n:'Battleaxe',d:'1d8',ty:'slashing',ver:'1d10'},
 flail:{n:'Flail',d:'1d8',ty:'bludgeoning'},
 glaive:{n:'Glaive',d:'1d10',ty:'slashing',h2:1,reach:1},
 greataxe:{n:'Greataxe',d:'1d12',ty:'slashing',h2:1},
 greatsword:{n:'Greatsword',d:'2d6',ty:'slashing',h2:1},
 halberd:{n:'Halberd',d:'1d10',ty:'slashing',h2:1,reach:1},
 lance:{n:'Lance',d:'1d12',ty:'piercing',reach:1},
 longsword:{n:'Longsword',d:'1d8',ty:'slashing',ver:'1d10'},
 maul:{n:'Maul',d:'2d6',ty:'bludgeoning',h2:1},
 morningstar:{n:'Morningstar',d:'1d8',ty:'piercing'},
 pike:{n:'Pike',d:'1d10',ty:'piercing',h2:1,reach:1},
 rapier:{n:'Rapier',d:'1d8',ty:'piercing',fin:1},
 scimitar:{n:'Scimitar',d:'1d6',ty:'slashing',fin:1,light:1},
 shortsword:{n:'Shortsword',d:'1d6',ty:'piercing',fin:1,light:1},
 trident:{n:'Trident',d:'1d6',ty:'piercing',thrown:'20/60',ver:'1d8'},
 warpick:{n:'War Pick',d:'1d8',ty:'piercing'},
 warhammer:{n:'Warhammer',d:'1d8',ty:'bludgeoning',ver:'1d10'},
 whip:{n:'Whip',d:'1d4',ty:'slashing',fin:1,reach:1},
 handcrossbow:{n:'Hand Crossbow',d:'1d6',ty:'piercing',rng:'30/120'},
 heavycrossbow:{n:'Heavy Crossbow',d:'1d10',ty:'piercing',rng:'100/400'},
 longbow:{n:'Longbow',d:'1d8',ty:'piercing',rng:'150/600'},
 unarmed:{n:'Unarmed Strike',d:'1',ty:'bludgeoning'}
};
// Damage types — used both for a custom weapon's own damage type and for damage-buff pills.
// Physical types stay muted/neutral (the norm); elemental/energy types get a distinct color so
// a buff visually reads as "extra", not baseline.
const DMG_TYPES=[['','— type —'],['acid','Acid'],['cold','Cold'],['fire','Fire'],['force','Force'],
 ['lightning','Lightning'],['necrotic','Necrotic'],['poison','Poison'],['psychic','Psychic'],
 ['radiant','Radiant'],['thunder','Thunder'],['bludgeoning','Bludgeoning'],['piercing','Piercing'],
 ['slashing','Slashing']];
const DMG_COLOR={acid:'#9ccb4a',cold:'#6fb8e0',fire:'#e0704a',force:'#8a8fe0',lightning:'#e0c94a',
 necrotic:'#9a7ab0',poison:'#6f9e63',psychic:'#c46fc0',radiant:'#e3c15c',thunder:'#7d8fa3',
 bludgeoning:'#a3906f',piercing:'#a3906f',slashing:'#a3906f'};
// Which ability governs an attack's to-hit AND damage. 'auto' follows the weapon's own rules
// (finesse → best of STR/DEX, ranged → DEX, else STR); custom weapons default to 'str' but any
// of these can be picked explicitly (spellcasting-stat weapons, Hex Warrior, homebrew, etc).
const ATK_STATS=[['auto','Auto'],['str','STR'],['dex','DEX'],
 ['con','CON'],['int','INT'],['wis','WIS'],['cha','CHA'],['none','None']];
// Quick-add damage buffs — spells/effects that add extra damage on a hit. "dice" is a reminder
// to fold into your physical roll (shown in the formula, not auto-rolled); "flat" is added to
// the numeric total automatically since it needs no rolling.
const BUFF_PRESETS=[
 {n:"Hunter's Mark",dice:'1d6',flat:0,type:'',conc:true},
 {n:'Hex',dice:'1d6',flat:0,type:'necrotic',conc:true},
 {n:'Elemental Weapon +1',dice:'',flat:1,type:'',conc:true},
 {n:'Elemental Weapon +2',dice:'',flat:2,type:'',conc:true},
 {n:'Elemental Weapon +3',dice:'',flat:3,type:'',conc:true},
 {n:'Magic Weapon',dice:'',flat:1,type:'',conc:true},
 {n:'Bardic Inspiration',dice:'1d6',flat:0,type:''},
 {n:"Divine Smite (1st level)",dice:'2d8',flat:0,type:'radiant'},
 {n:'Sneak Attack',dice:'1d6',flat:0,type:''},
 {n:'Rage',dice:'',flat:2,type:''}
];
// Compute everything about one attack row: which weapon (or custom), which ability governs it,
// the to-hit total + a plain-language breakdown, the damage formula, and — if the player has
// typed in what they rolled on the die — the actual final damage number for this swing.
function atkSummary(a){
  const w = a.weapon && a.weapon!=='custom' ? WEAPONS[a.weapon] : null;
  const isCustom = !w;
  let statKey = a.dmgStat||'auto';
  if(statKey==='auto') statKey = w ? (w.fin?(amod('dex')>=amod('str')?'dex':'str'):(w.rng?'dex':'str')) : 'str';
  const P=num(S.profBonus);
  const abMod = statKey==='none' ? 0 : amod(statKey);
  // Magic +N applies to both to-hit and damage (a +1 weapon works that way); Misc atk and
  // Misc dmg are separate DM-boost fields so something that only affects one side of the
  // attack (a to-hit buff that doesn't add damage, or vice versa) doesn't have to fake the other.
  const magic=num(a.magic), miscAtk=num(a.miscAtk), miscDmg=num(a.miscDmg);
  const toHit = abMod+P+magic+miscAtk;
  const breakdown=[`d20`,`prof ${fmt(P)}`,statKey!=='none'?`${statKey.toUpperCase()} ${fmt(abMod)}`:'',
    magic?`magic ${fmt(magic)}`:'',miscAtk?`atk misc ${fmt(miscAtk)}`:''].filter(Boolean).join(' + ');
  const buffs=a.buffs||[];
  const activeBuffs=buffs.filter(b=>b.on);
  const buffFlat=activeBuffs.reduce((n,b)=>n+num(b.flat),0);
  const rollableBuffs=activeBuffs.filter(b=>(b.dice||'').trim());
  const buffReminder=rollableBuffs.map(b=>` +${b.dice}${b.type?' '+b.type:''}`).join('');
  // Buff dice aren't rolled by the app (no RNG) — each rollable active buff gets its own roll
  // input in the Damage box, and whatever the player enters there is added straight into Final.
  const buffRolled=rollableBuffs.reduce((n,b)=>{
    const r=(b.rolled===''||b.rolled==null) ? null : Number(b.rolled);
    return n+((r!=null && !isNaN(r)) ? r : 0);
  },0);
  const die=a.die || (w?w.d:'1d6');
  const dmgType = w?w.ty:(a.dmgType||'');
  const dmgMod = abMod+magic+miscDmg+buffFlat;
  const dmgBreakdown=[statKey!=='none'?`${statKey.toUpperCase()} ${fmt(abMod)}`:'',magic?`magic ${fmt(magic)}`:'',
    miscDmg?`dmg misc ${fmt(miscDmg)}`:'',buffFlat?`buffs ${fmt(buffFlat)}`:''].filter(Boolean).join(' + ');
  const dmg = `${die}${dmgMod?fmt(dmgMod):''}${dmgType?' '+dmgType:''}${buffReminder}`;
  const rolled = (a.rolled===''||a.rolled==null) ? null : Number(a.rolled);
  const finalDamage = (rolled!=null && !isNaN(rolled)) ? rolled+dmgMod+buffRolled : null;
  const props=w?[w.ver?'versatile '+w.ver:'',w.rng?'range '+w.rng:'',w.thrown?'thrown '+w.thrown:'',
    w.reach?'reach':'',w.h2?'two-handed':'',w.light?'light':'',w.fin?'finesse':''].filter(Boolean).join(', '):'';
  return {bonus:fmt(toHit),dmg,toHit,breakdown,dmgBreakdown,statKey,dmgMod,finalDamage,die,dmgType,isCustom,w,props};
}

