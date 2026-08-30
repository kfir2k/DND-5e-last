// ---------- Backgrounds (PHB, dnd5e.wikidot.com/background:<name>) ----------
// BACKGROUNDS: id -> {name, skills:[2 skill ids], tools:[proficiency strings incl. "your choice"
// placeholders], languages:count of "your choice" languages (display/note only — never auto-added,
// see BACKGROUND_LIB comment below), gold:flat gp, equipment:{items:[[itemName,qty],...],packs:[...]},
// featureName: cross-ref into BACKGROUND_LIB, flavor: one-line cosmetic blurb.
// No `group` field like RACES has — the 13 SRD backgrounds have no canonical grouping to sort by.
const BACKGROUNDS={
 acolyte:{name:'Acolyte',skills:['insight','religion'],tools:[],languages:2,gold:15,
   equipment:{items:[['Holy Symbol',1],['Prayer Book',1],['Incense (block)',5],['Vestments',1],['Common Clothes',1]],packs:[]},
   featureName:'Shelter of the Faithful',flavor:'Devoted to a temple, trusted to speak and act in its name.'},
 charlatan:{name:'Charlatan',skills:['deception','sleight'],tools:['Disguise Kit','Forgery Kit'],languages:0,gold:15,
   equipment:{items:[['Fine Clothes',1],['Disguise Kit',1],['Dice Set',1]],packs:[]},
   featureName:'False Identity',flavor:'A practiced liar with a second identity ready to wear.'},
 criminal:{name:'Criminal',skills:['deception','stealth'],tools:["Thieves' Tools",'One gaming set (your choice)'],languages:0,gold:15,
   equipment:{items:[['Crowbar',1],['Common Clothes',1]],packs:[]},
   featureName:'Criminal Contact',flavor:'A former (or current) member of the criminal underworld.'},
 entertainer:{name:'Entertainer',skills:['acrobatics','performance'],tools:['Disguise Kit','One musical instrument (your choice)'],languages:0,gold:15,
   equipment:{items:[['Musical Instrument',1],["Admirer's Favor",1],['Costume',1]],packs:[]},
   featureName:'By Popular Demand',flavor:'A performer who can always find a stage — or a tavern that will do.'},
 folkhero:{name:'Folk Hero',skills:['animal','survival'],tools:["One type of artisan's tools (your choice)",'Vehicles (land)'],languages:0,gold:10,
   equipment:{items:[["Artisan's Tools",1],['Shovel',1],['Iron Pot',1],['Common Clothes',1]],packs:[]},
   featureName:'Rustic Hospitality',flavor:'A commoner who stood up against injustice and became a local legend.'},
 guildartisan:{name:'Guild Artisan',skills:['insight','persuasion'],tools:["One type of artisan's tools (your choice)"],languages:1,gold:15,
   equipment:{items:[["Artisan's Tools",1],['Letter of Introduction',1],["Traveler's Clothes",1]],packs:[]},
   featureName:'Guild Membership',flavor:'A respected member of a trade guild, with all the connections that entails.'},
 hermit:{name:'Hermit',skills:['medicine','religion'],tools:['Herbalism Kit'],languages:1,gold:5,
   equipment:{items:[['Scroll Case',1],['Blanket',1],['Common Clothes',1],['Herbalism Kit',1]],packs:[]},
   featureName:'Discovery',flavor:'Spent a long stretch in seclusion, and came back with something to show for it.'},
 noble:{name:'Noble',skills:['history','persuasion'],tools:['One gaming set (your choice)'],languages:1,gold:25,
   equipment:{items:[['Fine Clothes',1],['Signet Ring',1],['Scroll of Pedigree',1]],packs:[]},
   featureName:'Position of Privilege',flavor:'Born to wealth, power, or influence — and people can tell.'},
 outlander:{name:'Outlander',skills:['athletics','survival'],tools:['One musical instrument (your choice)'],languages:1,gold:10,
   equipment:{items:[['Quarterstaff',1],['Hunting Trap',1],['Trophy',1],["Traveler's Clothes",1]],packs:[]},
   featureName:'Wanderer',flavor:'Raised in the wilds, far from civilization and its comforts.'},
 sage:{name:'Sage',skills:['arcana','history'],tools:[],languages:2,gold:10,
   equipment:{items:[['Ink & Pen',1],['Small Knife',1],['Old Letter',1],['Common Clothes',1]],packs:[]},
   featureName:'Researcher',flavor:"Spent years in study, and knows where to look for what you don't know yet."},
 sailor:{name:'Sailor',skills:['athletics','perception'],tools:["Navigator's Tools",'Vehicles (water)'],languages:0,gold:10,
   equipment:{items:[['Belaying Pin',1],['Rope, Silk (50 ft)',1],['Lucky Charm',1],['Common Clothes',1]],packs:[]},
   featureName:"Ship's Passage",flavor:'Spent years crewing a ship, and still has friends who owe favors.'},
 soldier:{name:'Soldier',skills:['athletics','intimidation'],tools:['One gaming set (your choice)','Vehicles (land)'],languages:0,gold:10,
   equipment:{items:[['Insignia of Rank',1],['Trophy',1],['Dice Set',1],['Common Clothes',1]],packs:[]},
   featureName:'Military Rank',flavor:'Trained and fought as part of an organized military force.'},
 urchin:{name:'Urchin',skills:['sleight','stealth'],tools:['Disguise Kit',"Thieves' Tools"],languages:0,gold:10,
   equipment:{items:[['Small Knife',1],['Map or Chart',1],['Pet Mouse',1],['Sentimental Trinket',1],['Common Clothes',1]],packs:[]},
   featureName:'City Secrets',flavor:'Grew up on the streets, and never forgot how they work.'}
};
const BACKGROUND_ORDER=Object.keys(BACKGROUNDS);
const BACKGROUND_ICON={acolyte:'🙏',charlatan:'🎭',criminal:'🥷',entertainer:'🎻',folkhero:'🔨',
 guildartisan:'⚒',hermit:'🕯',noble:'👑',outlander:'🏕',sage:'📜',sailor:'⚓',soldier:'🎖',urchin:'🐭'};

// ---------- Background trait library (searchable, same pick pattern as RACE_LIB) ----------
// Exactly 2 entries per background: one carries the skill-grant `fx` (so it can be auto-synced or
// searched independently), one is the flavor-only signature feature — kept as two separate cards
// so deleting/editing the feature text can never silently drop the skill proficiencies with it.
// `g` matches BACKGROUNDS[id].name exactly, same convention RACE_LIB uses against RACES[id].name.
const BACKGROUND_LIB=[
 {n:'Skill Proficiencies (Acolyte)',g:'Acolyte',d:'Insight, Religion.',fx:[{t:'skill',skills:['insight','religion'],grant:'prof'}]},
 {n:'Shelter of the Faithful',g:'Acolyte',d:'You and your allies can receive free healing and care at a temple, shrine, or other established presence of your faith (you still cover material components). Your faith\'s hierarchy also offers you modest support.'},

 {n:'Skill Proficiencies (Charlatan)',g:'Charlatan',d:'Deception, Sleight of Hand.',fx:[{t:'skill',skills:['deception','sleight'],grant:'prof'}]},
 {n:'False Identity',g:'Charlatan',d:"You have a second identity with documentation, established acquaintances, and disguises. You can also forge documents, given an example of the handwriting or paper you're copying."},

 {n:'Skill Proficiencies (Criminal)',g:'Criminal',d:'Deception, Stealth.',fx:[{t:'skill',skills:['deception','stealth'],grant:'prof'}]},
 {n:'Criminal Contact',g:'Criminal',d:'You have a reliable contact who acts as your liaison to a network of other criminals, letting you send and receive messages over long distances through the underworld.'},

 {n:'Skill Proficiencies (Entertainer)',g:'Entertainer',d:'Acrobatics, Performance.',fx:[{t:'skill',skills:['acrobatics','performance'],grant:'prof'}]},
 {n:'By Popular Demand',g:'Entertainer',d:"You can always find a place to perform — an inn, a tavern, a circus, even a noble's court — earning free lodging and food in exchange for nightly performances."},

 {n:'Skill Proficiencies (Folk Hero)',g:'Folk Hero',d:'Animal Handling, Survival.',fx:[{t:'skill',skills:['animal','survival'],grant:'prof'}]},
 {n:'Rustic Hospitality',g:'Folk Hero',d:"Common folk will hide, feed, and shelter you unless you've shown yourself dangerous to them — they'll stall pursuers but won't risk their lives for you."},

 {n:'Skill Proficiencies (Guild Artisan)',g:'Guild Artisan',d:'Insight, Persuasion.',fx:[{t:'skill',skills:['insight','persuasion'],grant:'prof'}]},
 {n:'Guild Membership',g:'Guild Artisan',d:'Fellow guild members offer lodging, food, and support, and the guild will back you politically against reasonable accusations. Requires 5 gp in monthly dues to stay in good standing.'},

 {n:'Skill Proficiencies (Hermit)',g:'Hermit',d:'Medicine, Religion.',fx:[{t:'skill',skills:['medicine','religion'],grant:'prof'}]},
 {n:'Discovery',g:'Hermit',d:'Your seclusion led you to a unique discovery — a cosmic truth, a forgotten fact, or a lost relic. Work with your DM to decide what it is and how it echoes through the campaign.'},

 {n:'Skill Proficiencies (Noble)',g:'Noble',d:'History, Persuasion.',fx:[{t:'skill',skills:['history','persuasion'],grant:'prof'}]},
 {n:'Position of Privilege',g:'Noble',d:'People assume you have the right to be wherever you are. Common folk defer to you, and other nobles treat you as a peer, granting an audience if you need one.'},

 {n:'Skill Proficiencies (Outlander)',g:'Outlander',d:'Athletics, Survival.',fx:[{t:'skill',skills:['athletics','survival'],grant:'prof'}]},
 {n:'Wanderer',g:'Outlander',d:'You have an excellent memory for maps and geography, and can always find food and fresh water for yourself and up to five companions in the wild.'},

 {n:'Skill Proficiencies (Sage)',g:'Sage',d:'Arcana, History.',fx:[{t:'skill',skills:['arcana','history'],grant:'prof'}]},
 {n:'Researcher',g:'Sage',d:"When you don't know a piece of lore, you often know where to find it — a library, a university, or a specific sage — even if you have to go looking for it."},

 {n:'Skill Proficiencies (Sailor)',g:'Sailor',d:'Athletics, Perception.',fx:[{t:'skill',skills:['athletics','perception'],grant:'prof'}]},
 {n:"Ship's Passage",g:'Sailor',d:'You can secure free passage for yourself and your companions on a sailing ship, calling in a favor from your old crew or connections — schedule and route are up to the captain.'},

 {n:'Skill Proficiencies (Soldier)',g:'Soldier',d:'Athletics, Intimidation.',fx:[{t:'skill',skills:['athletics','intimidation'],grant:'prof'}]},
 {n:'Military Rank',g:'Soldier',d:'Soldiers loyal to your former military organization recognize your authority and defer to you if lower-ranked; you can also invoke your rank to access friendly military installations.'},

 {n:'Skill Proficiencies (Urchin)',g:'Urchin',d:'Sleight of Hand, Stealth.',fx:[{t:'skill',skills:['sleight','stealth'],grant:'prof'}]},
 {n:'City Secrets',g:'Urchin',d:'You know the shortcuts, sewers, and hidden passages of cities. Outside combat, you and companions you lead can travel between two points in a city at double speed.'}
];
