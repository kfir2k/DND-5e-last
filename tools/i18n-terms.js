// Hebrew rules glossary, in a form tools/i18n-check.js can enforce. One entry per concept:
//   say   the Hebrew term to use everywhere
//   en    when the English source matches this, the Hebrew must contain `has` (a stem, so inflections pass)
//   has   regex the Hebrew translation must match
// The check only warns; a human decides. Keep `say` and `has` in step, and change a term HERE (then
// search/replace it across i18n-he-*.js) rather than ad hoc in a single entry.
//
// Damage types, conditions and the six abilities are NOT listed: the checker reads those straight from
// the UI dictionary in i18n-he.js, so one translation per word exists in the whole app.
module.exports=[
  // --- the action economy
  {say:'פעולת בונוס', en:/\bbonus actions?\b/i, has:/פעולת בונוס|פעולות בונוס/},
  {say:'תגובה',       en:/\breactions?\b/i, has:/תגוב/},
  {say:'פעולה',       en:/\b(an?|your|the|one|that|this) actions?\b/i, has:/פעול/},
  {say:'תור',         en:/\b(your|its|their|the target's|each) turns?\b/i, has:/תור/},
  {say:'סבב',         en:/\brounds?\b(?! (up|down)\b)/i, has:/סבב/},
  {say:'יוזמה',       en:/\binitiative\b/i, has:/יוזמ/},
  // --- rolls
  {say:'הטלת הצלה',   en:/\bsaving throws?\b/i, has:/הצל/},
  {say:'בדיקת תכונה', en:/\bability checks?\b/i, has:/בדיק/},
  {say:'הטלת התקפה',  en:/\battack rolls?\b/i, has:/התקפ/},
  {say:'יתרון',       en:/\badvantage\b/i, has:/יתרון/},
  {say:'חיסרון',      en:/\bdisadvantage\b/i, has:/חיסרון/},
  {say:'DC',          en:/\bDC\b/, has:/DC/},
  // --- spellcasting
  {say:'ריכוז',       en:/\bconcentration\b/i, has:/ריכוז/},
  {say:'טקס',         en:/\britual\b/i, has:/טקס/},
  {say:'קנטריפ',      en:/\bcantrips?\b/i, has:/קנטריפ/},
  {say:'משבצת כישוף', en:/\bspell slots?\b|\bslot level\b|\bslots?\b/i, has:/משבצ/},
  {say:'כישוף',       en:/\bspells?\b(?! out)/i, has:/כישוף|כישופ/},
  // --- life & resources
  {say:'נקודות חיים', en:/\b(hit points|HP)\b/i, has:/נקודות ה?חיים|נקודת חיים|HP/},
  {say:'קוביית חיים', en:/\bhit dic?e\b/i, has:/קובי(ית|ות) חיים/},
  {say:'מנוחה קצרה',  en:/\bshort rest\b/i, has:/מנוחה קצרה/},
  {say:'מנוחה ארוכה', en:/\blong rest\b/i, has:/מנוחה ה?ארוכה|קצרה\/ה?ארוכה|קצרות\/ארוכות/},
  {say:'בונוס מיומנות', en:/\bproficiency bonus\b/i, has:/בונוס מיומנות|מיומנות/},
  {say:'מיומנות',     en:/\bproficien(t|cy|cies)\b/i, has:/מיומנ/},
  {say:'מומחיות',     en:/\bexpertise\b/i, has:/מומחי/},
  // --- monk
  {say:'קי',            en:/\bki\b/i, has:/(^|[^א-ת])[הולכבמש]?קי(?![א-ת])/},
  {say:'אומנויות לחימה', en:/\bmartial arts\b/i, has:/אומנויות לחימה/},
  {say:'מטר מכות',      en:/\bflurry of blows\b/i, has:/מטר מכות/},
  {say:'הגנה סבלנית',   en:/\bpatient defense\b/i, has:/הגנה סבלנית/},
  {say:'צעד הרוח',      en:/\bstep of the wind\b/i, has:/צעד הרוח/},
  {say:'ראיית עיוור',   en:/\bblindsight\b/i, has:/ראיית עיוור/},
  // --- warlock
  {say:'כרצון',         en:/\bat will\b/i, has:/כרצון/},
  // --- sorcerer
  {say:'נקודות כשפים',  en:/\bsorcery points?\b/i, has:/נקודות כשפים|נקודת כשפים/},
  {say:'מטא-קסם',       en:/\bmetamagic\b/i, has:/מטא-קסם/},
  // --- defences
  {say:'עמידות',      en:/\bresistan(ce|t)\b/i, has:/עמיד/},
  {say:'חסינות',      en:/\bimmun(e|ity)\b/i, has:/חסינ|חסין/},
  {say:'פגיעות',      en:/\bvulnerab(le|ility)\b/i, has:/פגיע/},
  {say:'שריון',       en:/\barmor\b/i, has:/שריון/},
  // --- senses & environment
  {say:'ראיית חושך',  en:/\bdarkvision\b/i, has:/ראיית חושך/},
  {say:'אור עמום',    en:/\bdim light\b/i, has:/אור עמום/},
  {say:'אור בהיר',    en:/\bbright light\b/i, has:/אור בהיר/},
  {say:'שטח קשה',     en:/\bdifficult terrain\b/i, has:/שטח קשה/},
  // --- targets
  {say:'יצור',        en:/\bcreatures?\b/i, has:/יצור|יצורים|יצורי/},
  {say:'חפץ',         en:/\bobjects?\b(?! of fascination)/i, has:/חפץ|חפצ/},
  // --- shapes & units (the numbers themselves are checked separately)
  {say:'רגל',         en:/\b\d+[- ]?(ft|feet|foot)\b\.?/i, has:/רגל|רגליים/},
  {say:'רדיוס',       en:/\bradius\b/i, has:/רדיוס/},
  {say:'חרוט',        en:/\bcone\b/i, has:/חרוט/},
  {say:'דקה',         en:/\b(\d+|one|a|per) min(ute)?s?\b/i, has:/דק/},
];
