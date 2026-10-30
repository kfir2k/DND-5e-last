// Hebrew for weapons (WEAPONS in data-equipment.js): the names, the special-property texts, and the
// one-line stat summary shown under each weapon in the weapon picker ("1d4 piercing — Finesse, Light,
// Thrown 20/60 ft."). Same [English, Hebrew] pairs as the other i18n-he-*.js files; the names match
// the weapon words already used inside the feature and spell translations (גרזן קרב, חרב ארוכה…).
// Checked by tools/i18n-check.js (group "weapons").
heAdd([
  // ---- the picker's group headings ("martial" = צבאי, as in the class proficiency texts) ----
  ['Simple Melee','נשק פשוט — קרב קרוב'],
  ['Simple Ranged','נשק פשוט — טווח'],
  ['Martial Melee','נשק צבאי — קרב קרוב'],
  ['Martial Ranged','נשק צבאי — טווח'],
  // ---- Simple melee ----
  ['Club','אלה'],
  ['Dagger','פגיון'],
  ['Greatclub','אלה גדולה'],
  ['Handaxe','גרזן יד'],
  ['Javelin','כידון'],
  ['Light Hammer','פטיש קל'],
  ['Mace','מקבת'],
  ['Quarterstaff','מטה'],
  ['Sickle','מגל'],
  ['Spear','חנית'],
  // ---- Simple ranged ----
  ['Light Crossbow','קשת מוצלבת קלה'],
  ['Dart','חץ הטלה'],
  ['Shortbow','קשת קצרה'],
  ['Sling','קלע'],
  // ---- Martial melee ----
  ['Battleaxe','גרזן קרב'],
  ['Flail','מורג קרב'],
  ['Glaive','גלייב'],
  ['Greataxe','גרזן גדול'],
  ['Greatsword','חרב גדולה'],
  ['Halberd','הלברד'],
  ['Lance','רומח פרשים'],
  ['Longsword','חרב ארוכה'],
  ['Maul','פטיש כבד'],
  ['Morningstar','כוכב שחר'],
  ['Pike','רומח ארוך'],
  ['Rapier','סיף'],
  ['Scimitar','חרב מעוקלת'],
  ['Shortsword','חרב קצרה'],
  ['Trident','קלשון'],
  ['War Pick','מכוש קרב'],
  ['Warhammer','פטיש מלחמה'],
  ['Whip','שוט'],
  // ---- Martial ranged ----
  ['Blowgun','צינור נשיפה'],
  ['Hand Crossbow','קשת מוצלבת יד'],
  ['Heavy Crossbow','קשת מוצלבת כבדה'],
  ['Longbow','קשת ארוכה'],
  ['Net','רשת'],
  ['Unarmed Strike','מכה ללא נשק'],

  // ---- Special-property texts (the "Special" tag's tooltip) ----
  ["Disadvantage attacking a target within 5 ft.; requires two hands to wield unless you're mounted.",
   'חיסרון בהתקפה על מטרה בטווח 5 רגל; דורש שתי ידיים, אלא אם רוכבים על בהמת רכיבה.'],
  ['A Large or smaller target hit is restrained until freed (its own action, DC 10 STR check) or the net takes 5 slashing damage (AC 10), destroying the net. No effect on formless or Huge+ creatures.',
   'מטרה בגודל גדול או קטן יותר שנפגעת נעשית כבולה עד שהיא משתחררת (בפעולה שלה, בדיקת כוח DC 10) או עד שהרשת סופגת 5 נזק חותך (AC 10) ונהרסת. אין השפעה על יצורים חסרי צורה או בגודל ענק ומעלה.'],
]);

// The picker's stat line: "<dice> <damage type>[ — <property tags>]", or "no damage — …" for the net.
// Every tag must be one of the known properties, or the line is left in English as a whole.
(function(){
  const TYPE={bludgeoning:'מוחץ',piercing:'דוקר',slashing:'חותך'};
  const TAG={Finesse:'עדינות',Light:'קל',Heavy:'כבד','Two-Handed':'שתי ידיים',Reach:'טווח הישג',Loading:'טעינה',Special:'מיוחד'};
  const tag=t=>{
    if(TAG[t]) return TAG[t];
    let m=/^Versatile \((\d+d\d+)\)$/.exec(t); if(m) return `רב-שימושי (${m[1]})`;
    m=/^Thrown (\d+\/\d+) ft\.$/.exec(t); if(m) return `נזרק ${m[1]} רגל`;
    m=/^Ammunition \((\d+\/\d+) ft\.\)$/.exec(t); if(m) return `תחמושת (${m[1]} רגל)`;
    return null;
  };
  const tags=s=>{ const out=s.split(', ').map(tag); return out.includes(null)?null:out.join(', '); };
  I18N_HE_RX.push(
    [/^(\d+(?:d\d+)?) (bludgeoning|piercing|slashing)(?: — (.+))?$/,m=>{
      if(!m[3]) return `${m[1]} ${TYPE[m[2]]}`;
      const t=tags(m[3]); return t==null?null:`${m[1]} ${TYPE[m[2]]} — ${t}`;
    }],
    [/^no damage(?: — (.+))?$/,m=>{
      if(!m[1]) return 'ללא נזק';
      const t=tags(m[1]); return t==null?null:`ללא נזק — ${t}`;
    }],
  );
})();
