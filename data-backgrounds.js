// ---------- Backgrounds (PHB + SCAG/XGE + Curse of Strahd, dnd5e.wikidot.com/background:<name>) ----------
// BACKGROUNDS: id -> {name, skills:[2 skill ids], tools:[proficiency strings incl. "your choice"
// placeholders], languages:count of "your choice" languages (display/note only — never auto-added,
// see BACKGROUND_LIB comment below), gold:flat gp, silver (optional):flat sp for the rare background
// that starts with pocket change instead of gold, equipment:{items:[[itemName,qty],...],packs:[...]},
// featureName: cross-ref into BACKGROUND_LIB, flavor: one-line cosmetic blurb.
// skillNote (optional): several SCAG/XGE/Ravenloft backgrounds grant one fixed skill plus "your
// choice of X/Y/Z" for the second (a few, like Urban Bounty Hunter or Haunted One, are a free
// choice of 2 from a list) — `skills` always holds a concrete, sensible default pair so the
// mechanical grant stays simple (same one-array shape as every PHB background), and skillNote
// spells out the real choice in the text summary so the player knows to adjust it on the Skills
// tab if they want something else.
// No `group` field like RACES has — the 28 backgrounds here have no canonical grouping to sort by.
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
   featureName:'City Secrets',flavor:'Grew up on the streets, and never forgot how they work.'},
 // ---- SCAG / XGE ----
 anthropologist:{name:'Anthropologist',skills:['insight','religion'],tools:[],languages:2,gold:10,
   equipment:{items:[['Leather-Bound Diary',1],['Ink & Pen',1],["Traveler's Clothes",1],['Sentimental Trinket',1]],packs:[]},
   featureName:'Adept Linguist',flavor:'Studied foreign peoples and cultures up close, and picked up their tongues along the way.'},
 archaeologist:{name:'Archaeologist',skills:['history','survival'],tools:["Cartographer's Tools or Navigator's Tools (your choice)"],languages:1,gold:25,
   equipment:{items:[['Map or Chart',1],['Lantern, Bullseye',1],["Miner's Pick",1],["Traveler's Clothes",1],['Shovel',1],['Tent (two-person)',1],['Sentimental Trinket',1]],packs:[]},
   featureName:'Historical Knowledge',flavor:'Dug up relics and ruins for a living, one collapsing tomb at a time.'},
 citywatch:{name:'City Watch',skills:['athletics','insight'],tools:[],languages:2,gold:10,
   equipment:{items:[['Uniform',1],['Signal Whistle',1],['Manacles',1]],packs:[]},
   featureName:"Watcher's Eye",flavor:"Kept the peace on a city's streets, on the right side of the law — mostly."},
 clancrafter:{name:'Clan Crafter',skills:['history','insight'],tools:["One type of artisan's tools (your choice)"],languages:1,gold:5,
   equipment:{items:[["Artisan's Tools",1],['Chisel',1],["Traveler's Clothes",1],['Gemstone',1]],packs:[]},
   featureName:'Respect of the Stout Folk',flavor:'Trained under dwarven masters and earned a maker\'s mark of your own.'},
 cloisteredscholar:{name:'Cloistered Scholar',skills:['history','religion'],
   skillNote:'second skill is your choice of Arcana, Nature, or Religion — Religion picked here by default',
   tools:[],languages:2,gold:10,
   equipment:{items:[["Scholar's Robes",1],['Ink & Pen',1],['Parchment (sheet)',5],['Book',1]],packs:[]},
   featureName:'Library Access',flavor:"Spent years buried in a cloister's library, chasing one narrow field of study."},
 courtier:{name:'Courtier',skills:['insight','persuasion'],tools:[],languages:2,gold:5,
   equipment:{items:[['Fine Clothes',1]],packs:[]},
   featureName:'Court Functionary',flavor:"Learned to navigate a noble court's favors, rivalries, and unspoken rules."},
 factionagent:{name:'Faction Agent',skills:['insight','persuasion'],
   skillNote:'second skill should be an Intelligence, Wisdom, or Charisma skill matching your faction — Persuasion picked here by default',
   tools:[],languages:2,gold:15,
   equipment:{items:[['Faction Badge',1],['Book',1],['Common Clothes',1]],packs:[]},
   featureName:'Safe Haven',flavor:'An operative for a larger organization, with a network of contacts to show for it.'},
 fartraveler:{name:'Far Traveler',skills:['insight','perception'],tools:['One musical instrument or gaming set (your choice)'],languages:1,gold:5,
   equipment:{items:[["Traveler's Clothes",1],['Musical Instrument',1],['Map or Chart',1],['Jewelry (Small Piece)',1]],packs:[]},
   featureName:'All Eyes on You',flavor:'Came from a distant land few in Faerûn have ever seen.'},
 inheritor:{name:'Inheritor',skills:['survival','history'],
   skillNote:'second skill is your choice of Arcana, History, or Religion — History picked here by default',
   tools:['One gaming set or musical instrument (your choice)'],languages:1,gold:15,
   equipment:{items:[['Sentimental Trinket',1],["Traveler's Clothes",1],['Musical Instrument',1]],packs:[]},
   featureName:'Inheritance',flavor:'Carries an inheritance whose true nature is still unfolding.'},
 knightoftheorder:{name:'Knight of the Order',skills:['persuasion','religion'],
   skillNote:"second skill matches your order's focus: Arcana, History, Nature, or Religion — Religion picked here by default",
   tools:['One gaming set or musical instrument (your choice)'],languages:1,gold:10,
   equipment:{items:[["Traveler's Clothes",1],['Signet Ring',1]],packs:[]},
   featureName:'Knightly Regard',flavor:'Sworn to a knightly order bound by a shared cause.'},
 mercenaryveteran:{name:'Mercenary Veteran',skills:['athletics','persuasion'],tools:['One gaming set (your choice)','Vehicles (land)'],languages:0,gold:10,
   equipment:{items:[['Uniform',1],['Insignia of Rank',1],['Dice Set',1]],packs:[]},
   featureName:'Mercenary Life',flavor:'Fought for coin in a mercenary company before adventuring on your own terms.'},
 urbanbountyhunter:{name:'Urban Bounty Hunter',skills:['insight','stealth'],
   skillNote:'both skills are your choice from Deception, Insight, Persuasion, and Stealth — Insight & Stealth picked here by default',
   tools:["Thieves' Tools",'One gaming set or musical instrument (your choice)'],languages:0,gold:20,
   equipment:{items:[['Common Clothes',1]],packs:[]},
   featureName:'Ear to the Ground',flavor:"Made a living tracking people down through a city's underworld or high society."},
 uthgardttribemember:{name:'Uthgardt Tribe Member',skills:['athletics','survival'],tools:["One musical instrument or artisan's tools (your choice)"],languages:1,gold:10,
   equipment:{items:[['Hunting Trap',1],['Totemic Token',1],["Traveler's Clothes",1]],packs:[]},
   featureName:'Uthgardt Heritage',flavor:'Raised by an Uthgardt tribe, steeped in the lore of the North.'},
 waterdhaviannoble:{name:'Waterdhavian Noble',skills:['history','persuasion'],tools:['One gaming set or musical instrument (your choice)'],languages:1,gold:20,
   equipment:{items:[['Fine Clothes',1],['Signet Ring',1],['Scroll of Pedigree',1],['Flask of Common Wine',1]],packs:[]},
   featureName:'Kept in Style',flavor:'Born into one of Waterdeep\'s noble houses, credit line included.'},
 // ---- Curse of Strahd / Van Richten's Guide to Ravenloft ----
 hauntedone:{name:'Haunted One',skills:['investigation','survival'],
   skillNote:'both skills are your choice from Arcana, Investigation, Religion, and Survival — Investigation & Survival picked here by default',
   tools:[],languages:2,gold:0,silver:1,
   equipment:{items:[['Chest',1],['Crowbar',1],['Hammer',1],['Wooden Stake',3],['Holy Symbol',1],['Holy Water (flask)',1],
     ['Manacles',1],['Mirror, Steel',1],['Oil (flask)',1],['Tinderbox',1],['Torch',3],['Sentimental Trinket',1],['Common Clothes',1]],packs:[]},
   featureName:'Heart of Darkness',flavor:'Faced something unimaginable, and came back marked by it.'}
};
const BACKGROUND_ORDER=Object.keys(BACKGROUNDS);
const BACKGROUND_ICON={acolyte:'🙏',charlatan:'🎭',criminal:'🥷',entertainer:'🎻',folkhero:'🔨',
 guildartisan:'⚒',hermit:'🕯',noble:'👑',outlander:'🏕',sage:'📜',sailor:'⚓',soldier:'🎖',urchin:'🐭',
 anthropologist:'🧭',archaeologist:'⛏',citywatch:'🔔',clancrafter:'🛠',cloisteredscholar:'📗',
 courtier:'🎩',factionagent:'🕵',fartraveler:'🧳',inheritor:'🗝',knightoftheorder:'⚜',
 mercenaryveteran:'🗡',urbanbountyhunter:'🎯',uthgardttribemember:'🪶',waterdhaviannoble:'🏛',
 hauntedone:'🧛'};

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
 {n:'City Secrets',g:'Urchin',d:'You know the shortcuts, sewers, and hidden passages of cities. Outside combat, you and companions you lead can travel between two points in a city at double speed.'},

 {n:'Skill Proficiencies (Anthropologist)',g:'Anthropologist',d:'Insight, Religion.',fx:[{t:'skill',skills:['insight','religion'],grant:'prof'}]},
 {n:'Adept Linguist',g:'Anthropologist',d:'After observing a group speak a language you don\'t know for at least a day, you learn enough words, expressions, and gestures to communicate on a rudimentary level.'},

 {n:'Skill Proficiencies (Archaeologist)',g:'Archaeologist',d:'History, Survival.',fx:[{t:'skill',skills:['history','survival'],grant:'prof'}]},
 {n:'Historical Knowledge',g:'Archaeologist',d:'On entering ruins or dungeons, you can identify who built them and their original purpose, and you can appraise the monetary value of antiquities over a century old.'},

 {n:'Skill Proficiencies (City Watch)',g:'City Watch',d:'Athletics, Insight.',fx:[{t:'skill',skills:['athletics','insight'],grant:'prof'}]},
 {n:"Watcher's Eye",g:'City Watch',d:'You can readily find the local watch outpost or other law enforcement, and identify the local criminal dens — though the watch will greet you more warmly than the criminals will.'},

 {n:'Skill Proficiencies (Clan Crafter)',g:'Clan Crafter',d:'History, Insight.',fx:[{t:'skill',skills:['history','insight'],grant:'prof'}]},
 {n:'Respect of the Stout Folk',g:'Clan Crafter',d:'You have free room and board in any place where shield dwarves or gold dwarves dwell, and locals vie to offer you and your companions their finest hospitality.'},

 {n:'Skill Proficiencies (Cloistered Scholar)',g:'Cloistered Scholar',d:'History, plus Arcana, Nature, or Religion (your choice).',fx:[{t:'skill',skills:['history','religion'],grant:'prof'}]},
 {n:'Library Access',g:'Cloistered Scholar',d:"You have free and easy access to your cloister's library, and other libraries across the Realms extend you the same professional courtesy as a fellow scholar."},

 {n:'Skill Proficiencies (Courtier)',g:'Courtier',d:'Insight, Persuasion.',fx:[{t:'skill',skills:['insight','persuasion'],grant:'prof'}]},
 {n:'Court Functionary',g:'Courtier',d:'You have access to the records and operations of any noble court or government you encounter, and understand who holds influence, how to request favors, and the current political conflicts at play.'},

 {n:'Skill Proficiencies (Faction Agent)',g:'Faction Agent',d:'Insight, plus an Intelligence, Wisdom, or Charisma skill matching your faction (your choice).',fx:[{t:'skill',skills:['insight','persuasion'],grant:'prof'}]},
 {n:'Safe Haven',g:'Faction Agent',d:'You have access to a secret network of supporters and operatives — secret signs identify them, and they can offer hidden safe houses, free lodging, or information, though they won\'t risk their lives or identities for you.'},

 {n:'Skill Proficiencies (Far Traveler)',g:'Far Traveler',d:'Insight, Perception.',fx:[{t:'skill',skills:['insight','perception'],grant:'prof'}]},
 {n:'All Eyes on You',g:'Far Traveler',d:'Your foreign accent, mannerisms, and appearance mark you as an object of fascination, giving you access to people and places normally restricted to outsiders.'},

 {n:'Skill Proficiencies (Inheritor)',g:'Inheritor',d:'Survival, plus Arcana, History, or Religion (your choice).',fx:[{t:'skill',skills:['survival','history'],grant:'prof'}]},
 {n:'Inheritance',g:'Inheritor',d:'You carry an inheritance of real significance — work with your DM on its story, its true nature, and how it might hook into the campaign as it unfolds.'},

 {n:'Skill Proficiencies (Knight of the Order)',g:'Knight of the Order',d:'Persuasion, plus Arcana, History, Nature, or Religion matching your order\'s focus (your choice).',fx:[{t:'skill',skills:['persuasion','religion'],grant:'prof'}]},
 {n:'Knightly Regard',g:'Knight of the Order',d:'Your order and sympathetic communities provide you shelter, meals, and healing when appropriate, and may occasionally offer riskier help, like rallying to your aid in a fight.'},

 {n:'Skill Proficiencies (Mercenary Veteran)',g:'Mercenary Veteran',d:'Athletics, Persuasion.',fx:[{t:'skill',skills:['athletics','persuasion'],grant:'prof'}]},
 {n:'Mercenary Life',g:'Mercenary Veteran',d:'You know mercenary companies by their emblems and leadership, can find where mercenaries gather in any region you speak the language, and can find paid work between adventures to maintain a comfortable lifestyle.'},

 {n:'Skill Proficiencies (Urban Bounty Hunter)',g:'Urban Bounty Hunter',d:'Two of your choice from Deception, Insight, Persuasion, and Stealth.',fx:[{t:'skill',skills:['insight','stealth'],grant:'prof'}]},
 {n:'Ear to the Ground',g:'Urban Bounty Hunter',d:'You have frequent contact with the segment of society your quarries move through, and can develop a reliable local contact in any city who supplies intelligence on the people and places there.'},

 {n:'Skill Proficiencies (Uthgardt Tribe Member)',g:'Uthgardt Tribe Member',d:'Athletics, Survival.',fx:[{t:'skill',skills:['athletics','survival'],grant:'prof'}]},
 {n:'Uthgardt Heritage',g:'Uthgardt Tribe Member',d:'You forage twice as effectively in the wild, and can call on the hospitality of your tribe and its allies — druid circles, nomadic elf tribes, the Harpers, and priesthoods of the First Circle among them.'},

 {n:'Skill Proficiencies (Waterdhavian Noble)',g:'Waterdhavian Noble',d:'History, Persuasion.',fx:[{t:'skill',skills:['history','persuasion'],grant:'prof'}]},
 {n:'Kept in Style',g:'Waterdhavian Noble',d:'Your name and signet cover most of your expenses in Waterdeep and the North on credit — the innkeepers bill your family estate — covering a comfortable lifestyle, or offsetting a costlier one.'},

 {n:'Skill Proficiencies (Haunted One)',g:'Haunted One',d:'Two of your choice from Arcana, Investigation, Religion, and Survival.',fx:[{t:'skill',skills:['investigation','survival'],grant:'prof'}]},
 {n:'Heart of Darkness',g:'Haunted One',d:"Those who look into your eyes can see you've faced unimaginable horror. Commoners treat you with deference and offer aid, and unless you've proven dangerous, they'll fight alongside you against your enemies."}
];
