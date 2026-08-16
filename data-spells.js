// ---------- Spell index (dnd5e.wikidot.com/spells) ----------
// Format: Name|Level|School|CastTime|Range|Duration|Components  (compact codes, decoded below)
const SP_SCHOOL={A:'Abjuration',C:'Conjuration',D:'Divination',E:'Enchantment',V:'Evocation',I:'Illusion',N:'Necromancy',T:'Transmutation'};
const SP_ICON={A:'🛡',C:'🌀',D:'🔮',E:'💫',V:'🔥',I:'🎭',N:'💀',T:'✨'};
const SP_TIME={A:'1 Action',B:'1 Bonus Action',R:'1 Reaction',M1:'1 Minute',M10:'10 Minutes',H1:'1 Hour',H8:'8 Hours',H12:'12 Hours',H24:'24 Hours',S:'Special'};
const SP_DUR={I:'Instantaneous',R1:'1 round',M1:'1 minute',M10:'10 minutes',H1:'1 hour',H6:'6 hours',H8:'8 hours',H24:'24 hours',D1:'1 day',D7:'7 days',D10:'10 days',D30:'30 days',UD:'Until dispelled',UT:'Until dispelled or triggered',SP:'Special',U1:'Up to 1 minute',U1h:'Up to 1 hour',U8h:'Up to 8 hours',I1h:'Instantaneous or 1 hour',C1:'Conc., up to 1 min',C10:'Conc., up to 10 min',C1h:'Conc., up to 1 hour',C2h:'Conc., up to 2 hours',C8h:'Conc., up to 8 hours',C24h:'Conc., up to 24 hours',C1d:'Conc., up to 1 day',C1r:'Conc., up to 1 round',C6r:'Conc., up to 6 rounds'};
const SPELL_RAW=`Acid Splash|0|C|A|60|I|VS
Blade Ward|0|A|A|Self|R1|VS
Booming Blade|0|V|A|Self 5ft|R1|SM
Chill Touch|0|N|A|120|R1|VS
Control Flames|0|T|A|60|I1h|S
Create Bonfire|0|C|A|60|C1|VS
Dancing Lights|0|V|A|120|C1|VSM
Druidcraft|0|T|A|30|I|VS
Eldritch Blast|0|V|A|120|I|VS
Encode Thoughts|0|E|A|Self|H8|S
Fire Bolt|0|V|A|120|I|VS
Friends|0|E|A|Self|C1|SM
Frostbite|0|V|A|60|I|VS
Green-Flame Blade|0|V|A|Self 5ft|I|SM
Guidance|0|D|A|Touch|C1|VS
Gust|0|T|A|30|I|VS
Infestation|0|C|A|30|I|VSM
Light|0|V|A|Touch|H1|VM
Lightning Lure|0|V|A|Self 15ft|I|V
Mage Hand|0|C|A|30|M1|VS
Magic Stone|0|T|B|Touch|M1|VS
Mending|0|T|M1|Touch|I|VSM
Message|0|T|A|120|R1|VSM
Mind Sliver|0|E|A|60|R1|V
Minor Illusion|0|I|A|30|M1|SM
Mold Earth|0|T|A|30|I1h|S
Poison Spray|0|C|A|10|I|VS
Prestidigitation|0|T|A|10|U1h|VS
Primal Savagery|0|T|A|Self|I|S
Produce Flame|0|C|A|Self|M10|VS
Ray of Frost|0|V|A|60|I|VS
Resistance|0|A|A|Touch|C1|VSM
Sacred Flame|0|V|A|60|I|VS
Sapping Sting|0|N|A|30|I|VS
Shape Water|0|T|A|30|I1h|S
Shillelagh|0|T|B|Touch|M1|VSM
Shocking Grasp|0|V|A|Touch|I|VS
Spare the Dying|0|N|A|Touch|I|VS
Sword Burst|0|C|A|Self 5ft|I|V
Thaumaturgy|0|T|A|30|U1|V
Thorn Whip|0|T|A|30|I|VSM
Thunderclap|0|V|A|Self 5ft|I|S
Toll the Dead|0|N|A|60|I|VS
True Strike|0|D|A|30|C1r|S
Vicious Mockery|0|E|A|60|I|V
Word of Radiance|0|V|A|5|I|VM
Absorb Elements|1|A|R|Self|R1|S
Alarm|1|A|M1r|30|H8|VSM
Animal Friendship|1|E|A|30|H24|VSM
Armor of Agathys|1|A|A|Self|H1|VSM
Arms of Hadar|1|C|A|Self 10ft|I|VS
Bane|1|E|A|30|C1|VSM
Beast Bond|1|D|A|Touch|C10|VSM
Bless|1|E|A|30|C1|VSM
Burning Hands|1|V|A|Self 15ft cone|I|VS
Catapult|1|T|A|60|I|S
Cause Fear|1|N|A|60|C1|VS
Ceremony|1|A|Ar|Touch|I|VSM
Chaos Bolt|1|V|A|120|I|VS
Charm Person|1|E|A|30|H1|VS
Chromatic Orb|1|V|A|90|I|VSM
Color Spray|1|I|A|Self 15ft cone|R1|VSM
Command|1|E|A|60|R1|V
Compelled Duel|1|E|B|30|C1|V
Comprehend Languages|1|D|Ar|Self|H1|VSM
Create or Destroy Water|1|T|A|30|I|VSM
Cure Wounds|1|V|A|Touch|I|VS
Detect Evil and Good|1|D|A|Self|C10|VS
Detect Magic|1|D|Ar|Self|C10|VS
Detect Poison and Disease|1|D|Ar|Self|C10|VSM
Disguise Self|1|I|A|Self|H1|VS
Dissonant Whispers|1|E|A|60|I|V
Distort Value|1|I|M1|Touch|H8|V
Divine Favor|1|V|B|Self|C1|VS
Earth Tremor|1|V|A|Self 10ft|I|VS
Ensnaring Strike|1|C|B|Self|C1|V
Entangle|1|C|A|90|C1|VS
Expeditious Retreat|1|T|B|Self|C10|VS
Faerie Fire|1|V|A|60|C1|V
False Life|1|N|A|Self|H1|VSM
Feather Fall|1|T|R|60|M1|VM
Find Familiar|1|C|H1r|10|I|VSM
Fog Cloud|1|C|A|120|C1h|VS
Frost Fingers|1|V|A|Self 15ft cone|I|VS
Gift of Alacrity|1|D|M1|Touch|H8|VS
Goodberry|1|T|A|Touch|I|VSM
Grease|1|C|A|60|M1|VSM
Guiding Bolt|1|V|A|120|R1|VS
Hail of Thorns|1|C|B|Self|C1|V
Healing Word|1|V|B|60|I|V
Hellish Rebuke|1|V|R|60|I|VS
Heroism|1|E|A|Touch|C1|VS
Hex|1|E|B|90|C1h|VSM
Hunter's Mark|1|D|B|90|C1h|V
Ice Knife|1|C|A|60|I|SM
Identify|1|D|M1r|Touch|I|VSM
Illusory Script|1|I|M1r|Touch|D10|SM
Inflict Wounds|1|N|A|Touch|I|VS
Jim's Magic Missile|1|V|A|120|I|VSM
Jump|1|T|A|Touch|M1|VSM
Longstrider|1|T|A|Touch|H1|VSM
Mage Armor|1|A|A|Touch|H8|VSM
Magic Missile|1|V|A|120|I|VS
Magnify Gravity|1|T|A|60|R1|VS
Protection from Evil and Good|1|A|A|Touch|C10|VSM
Purify Food and Drink|1|T|Ar|10|I|VS
Ray of Sickness|1|N|A|60|I|VS
Sanctuary|1|A|B|30|M1|VSM
Searing Smite|1|V|B|Self|C1|V
Shield|1|A|R|Self|R1|VS
Shield of Faith|1|A|B|60|C10|VSM
Silent Image|1|I|A|60|C10|VSM
Silvery Barbs|1|E|R|60|I|V
Sleep|1|E|A|90|M1|VSM
Snare|1|A|M1|Touch|H8|SM
Speak with Animals|1|D|Ar|Self|M10|VS
Tasha's Caustic Brew|1|V|A|Self 30ft line|C1|VSM
Tasha's Hideous Laughter|1|E|A|30|C1|VSM
Tenser's Floating Disk|1|C|Ar|30|H1|VSM
Thunderous Smite|1|V|B|Self|C1|V
Thunderwave|1|V|A|Self 15ft cube|I|VS
Unseen Servant|1|C|Ar|60|H1|VSM
Witch Bolt|1|V|A|30|C1|VSM
Wrathful Smite|1|V|B|Self|C1|V
Zephyr Strike|1|T|B|Self|C1|V
Aganazzar's Scorcher|2|V|A|30|I|VSM
Aid|2|A|A|30|H8|VSM
Air Bubble|2|C|A|60|H24|S
Alter Self|2|T|A|Self|C1h|VS
Animal Messenger|2|E|Ar|30|H24|VSM
Arcane Lock|2|A|A|Touch|UD|VSM
Augury|2|D|M1r|Self|I|VSM
Barkskin|2|T|A|Touch|C1h|VSM
Beast Sense|2|D|Ar|Touch|C1h|S
Blindness/Deafness|2|N|A|30|M1|V
Blur|2|I|A|Self|C1|V
Borrowed Knowledge|2|D|A|Self|H1|VSM
Branding Smite|2|V|B|Self|C1|V
Calm Emotions|2|E|A|60|C1|VS
Cloud of Daggers|2|C|A|60|C1|VSM
Continual Flame|2|V|A|Touch|UD|VSM
Cordon of Arrows|2|T|A|5|H8|VSM
Crown of Madness|2|E|A|120|C1|VS
Darkness|2|V|A|60|C10|VM
Darkvision|2|T|A|Touch|H8|VSM
Detect Thoughts|2|D|A|Self|C1|VSM
Dragon's Breath|2|T|B|Touch|C1|VSM
Dust Devil|2|C|A|60|C1|VSM
Earthbind|2|T|A|300|C1|V
Enhance Ability|2|T|A|Touch|C1h|VSM
Enlarge/Reduce|2|T|A|30|C1|VSM
Enthrall|2|E|A|60|M1|VS
Find Steed|2|C|M10|30|I|VS
Find Traps|2|D|A|120|I|VS
Flame Blade|2|V|B|Self|C10|VSM
Flaming Sphere|2|C|A|60|C1|VSM
Flock of Familiars|2|C|M1|Touch|C1h|VS
Fortune's Favor|2|D|M1|60|H1|VSM
Gentle Repose|2|N|Ar|Touch|D10|VSM
Gift of Gab|2|E|R|Self|I|VSM
Gust of Wind|2|V|A|Self 60ft line|C1|VSM
Healing Spirit|2|C|B|60|C1|VS
Heat Metal|2|T|A|60|C1|VSM
Hold Person|2|E|A|60|C1|VSM
Immovable Object|2|T|A|Touch|H1|VSM
Invisibility|2|I|A|Touch|C1h|VSM
Jim's Glowing Coin|2|E|A|60|M1|SM
Kinetic Jaunt|2|T|B|Self|C1|S
Knock|2|T|A|60|I|V
Lesser Restoration|2|A|A|Touch|I|VS
Levitate|2|T|A|60|C10|VSM
Locate Animals or Plants|2|D|Ar|Self|I|VSM
Locate Object|2|D|A|Self|C10|VSM
Magic Mouth|2|I|M1r|30|UD|VSM
Magic Weapon|2|T|B|Touch|C1h|VS
Maximillian's Earthen Grasp|2|T|A|30|C1|VSM
Melf's Acid Arrow|2|V|A|90|I|VSM
Mind Spike|2|D|A|60|C1h|S
Mirror Image|2|I|A|Self|M1|VS
Misty Step|2|C|B|Self|I|V
Moonbeam|2|V|A|120|C1|VSM
Nathair's Mischief|2|I|A|60|C1|SM
Nystul's Magic Aura|2|I|A|Touch|H24|VSM
Pass Without Trace|2|A|A|Self|C1h|VSM
Phantasmal Force|2|I|A|60|C1|VSM
Prayer of Healing|2|V|M10|30|I|V
Protection from Poison|2|A|A|Touch|H1|VS
Pyrotechnics|2|T|A|60|I|VS
Ray of Enfeeblement|2|N|A|60|C1|VS
Rime's Binding Ice|2|V|A|Self 30ft cone|I|SM
Rope Trick|2|T|A|Touch|H1|VSM
Scorching Ray|2|V|A|120|I|VS
See Invisibility|2|D|A|Self|H1|VSM
Shadow Blade|2|I|B|Self|C1|VS
Shatter|2|V|A|60|I|VSM
Silence|2|I|Ar|120|C10|VS
Skywrite|2|T|Ar|Sight|C1d|VS
Snilloc's Snowball Swarm|2|V|A|90|I|VSM
Spider Climb|2|T|A|Touch|C1h|VSM
Spike Growth|2|T|A|150|C10|VSM
Spiritual Weapon|2|V|B|60|M1|VS
Spray Of Cards|2|C|A|Self 15ft cone|I|VSM
Suggestion|2|E|A|30|C8h|VM
Summon Beast|2|C|A|90|C1h|VSM
Tasha's Mind Whip|2|E|A|90|R1|V
Vortex Warp|2|C|A|90|I|VS
Warding Bond|2|A|A|Touch|H1|VSM
Warding Wind|2|V|A|Self|C10|V
Warp Sense|2|D|A|Self|C1|VSM
Web|2|C|A|60|C1h|VSM
Wither and Bloom|2|N|A|60|I|VSM
Wristpocket|2|C|Ar|Self|C1h|S
Zone of Truth|2|E|A|60|M10|VS
Animate Dead|3|N|M1|10|I|VSM
Antagonize|3|E|A|30|I|VSM
Ashardalon's Stride|3|T|B|Self|C1|VS
Aura of Vitality|3|V|A|Self 30ft|C1|V
Beacon of Hope|3|A|A|30|C1|VS
Bestow Curse|3|N|A|Touch|C1|VS
Blinding Smite|3|V|B|Self|C1|V
Blink|3|T|A|Self|M1|VS
Call Lightning|3|C|A|120|C10|VS
Catnap|3|E|A|30|M10|SM
Clairvoyance|3|D|M10|1 mile|C10|VSM
Conjure Animals|3|C|A|60|C1h|VS
Conjure Barrage|3|C|A|Self 60ft cone|I|VSM
Counterspell|3|A|R|60|I|S
Create Food and Water|3|C|A|30|I|VS
Crusader's Mantle|3|V|A|Self|C1|V
Daylight|3|V|A|60|H1|VS
Dispel Magic|3|A|A|120|I|VS
Elemental Weapon|3|T|A|Touch|C1h|VS
Enemies Abound|3|E|A|120|C1|VS
Erupting Earth|3|T|A|120|I|VSM
Fast Friends|3|E|A|30|C1h|V
Fear|3|I|A|Self 30ft cone|C1|VSM
Feign Death|3|N|Ar|Touch|H1|VSM
Fireball|3|V|A|150|I|VSM
Flame Arrows|3|T|A|Touch|C1h|VS
Fly|3|T|A|Touch|C10|VSM
Galder's Tower|3|C|M10|30|H24|VSM
Gaseous Form|3|T|A|Touch|C1h|VSM
Glyph of Warding|3|A|H1|Touch|UT|VSM
Haste|3|T|A|30|C1|VSM
Hunger Of Hadar|3|C|A|150|C1|VSM
Hypnotic Pattern|3|I|A|120|C1|SM
Incite Greed|3|E|A|30|C1|VSM
Intellect Fortress|3|A|A|30|C1h|V
Leomund's Tiny Hut|3|V|M1r|Self 10ft dome|H8|VSM
Life Transference|3|N|A|30|I|VS
Lightning Arrow|3|T|B|Self|C1|VS
Lightning Bolt|3|V|A|Self 100ft line|I|VSM
Magic Circle|3|A|M1|10|H1|VSM
Major Image|3|I|A|120|C10|VSM
Mass Healing Word|3|V|B|60|I|V
Meld into Stone|3|T|Ar|Touch|H8|VS
Melf's Minute Meteors|3|V|A|Self 120ft|C10|VSM
Motivational Speech|3|E|M1|60|H1|V
Nondetection|3|A|A|Touch|H8|VSM
Phantom Steed|3|I|M1r|30|H1|VS
Plant Growth|3|T|A|150|I|VS
Protection from Energy|3|A|A|Touch|C1h|VS
Pulse Wave|3|V|A|Self 30ft cone|I|VS
Remove Curse|3|A|A|Touch|I|VS
Revivify|3|N|A|Touch|I|VSM
Sending|3|V|A|Unlimited|R1|VSM
Sleet Storm|3|C|A|150|C1|VSM
Slow|3|T|A|120|C1|VSM
Speak with Dead|3|N|A|10|M10|VSM
Speak with Plants|3|T|A|Self 30ft|M10|VS
Spirit Guardians|3|C|A|Self 15ft|C10|VSM
Spirit Shroud|3|N|B|Self|C1|VS
Stinking Cloud|3|C|A|90|C1|VSM
Summon Fey|3|C|A|90|C1h|VSM
Summon Lesser Demons|3|C|A|60|C1h|VSM
Summon Shadowspawn|3|C|A|90|C1h|VSM
Summon Undead|3|N|A|90|C1h|VSM
Thunder Step|3|C|A|90|I|V
Tidal Wave|3|C|A|120|I|VSM
Tiny Servant|3|T|M1|Touch|H8|VS
Tongues|3|D|A|Touch|H1|VM
Vampiric Touch|3|N|A|Self|C1|VS
Wall of Sand|3|V|A|90|C10|VSM
Wall of Water|3|V|A|60|C10|VSM
Water Breathing|3|T|Ar|30|H24|VSM
Water Walk|3|T|Ar|30|H1|VSM
Wind Wall|3|V|A|120|C1|VSM
Arcane Eye|4|D|A|30|C1h|VSM
Aura of Life|4|A|A|Self 30ft|C10|V
Aura of Purity|4|A|A|Self 30ft|C10|V
Banishment|4|A|A|60|C1|VSM
Blight|4|N|A|30|I|VS
Charm Monster|4|E|A|30|H1|VS
Compulsion|4|E|A|30|C1|VS
Confusion|4|E|A|90|C1|VSM
Conjure Minor Elementals|4|C|M1|90|C1h|VS
Conjure Woodland Beings|4|C|A|60|C1h|VSM
Control Water|4|T|A|300|C10|VSM
Death Ward|4|A|A|Touch|H8|VS
Dimension Door|4|C|A|500|I|V
Divination|4|D|Ar|Self|I|VSM
Dominate Beast|4|E|A|60|C1|VS
Elemental Bane|4|T|A|90|C1|VS
Evard's Black Tentacles|4|C|A|90|C1|VSM
Fabricate|4|T|M10|120|I|VS
Find Greater Steed|4|C|M10|30|I|VS
Fire Shield|4|V|A|Self|M10|VSM
Freedom of Movement|4|A|A|Touch|H1|VSM
Galder's Speedy Courier|4|C|A|10|M10|VSM
Gate Seal|4|A|M1|60|H24|VSM
Giant Insect|4|T|A|30|C10|VS
Grasping Vine|4|C|B|30|C1|VS
Gravity Sinkhole|4|V|A|120|I|VSM
Greater Invisibility|4|I|A|Touch|C1|VS
Guardian of Faith|4|C|A|30|H8|V
Guardian of Nature|4|T|B|Self|C1|V
Hallucinatory Terrain|4|I|M10|300|H24|VSM
Ice Storm|4|V|A|300|I|VSM
Leomund's Secret Chest|4|C|A|Touch|I|VSM
Locate Creature|4|D|A|Self|C1h|VSM
Mordenkainen's Faithful Hound|4|C|A|30|H8|VSM
Mordenkainen's Private Sanctum|4|A|M10|120|H24|VSM
Otiluke's Resilient Sphere|4|V|A|30|C1|VSM
Phantasmal Killer|4|I|A|120|C1|VS
Polymorph|4|T|A|60|C1h|VSM
Raulothim's Psychic Lance|4|E|A|120|I|V
Shadow Of Moil|4|N|A|Self|C1|VSM
Sickening Radiance|4|V|A|120|C10|VS
Spirit Of Death|4|N|A|60|C1h|VSM
Staggering Smite|4|V|B|Self|C1|V
Stone Shape|4|T|A|Touch|I|VSM
Stoneskin|4|A|A|Touch|C1h|VSM
Storm Sphere|4|V|A|150|C1|VS
Summon Aberration|4|C|A|90|C1h|VSM
Summon Construct|4|C|A|90|C1h|VSM
Summon Elemental|4|C|A|90|C1h|VSM
Summon Greater Demon|4|C|A|60|C1h|VSM
Vitriolic Sphere|4|V|A|150|I|VSM
Wall of Fire|4|V|A|120|C1|VSM
Watery Sphere|4|C|A|90|C1|VSM
Animate Objects|5|T|A|120|C1|VS
Antilife Shell|5|A|A|Self 10ft|C1h|VS
Awaken|5|T|H8|Touch|I|VSM
Banishing Smite|5|A|B|Self|C1|V
Bigby's Hand|5|V|A|120|C1|VSM
Circle of Power|5|A|A|Self 30ft|C10|V
Cloudkill|5|C|A|120|C10|VS
Commune|5|D|M1r|Self|M1|VSM
Commune with Nature|5|D|M1r|Self|I|VS
Cone of Cold|5|V|A|Self 60ft cone|I|VSM
Conjure Elemental|5|C|M1|90|C1h|VSM
Conjure Volley|5|C|A|150|I|VSM
Contact Other Plane|5|D|M1r|Self|M1|V
Contagion|5|N|A|Touch|D7|VS
Control Winds|5|T|A|300|C1h|VS
Creation|5|I|M1|30|SP|VSM
Danse Macabre|5|N|A|60|C1h|VS
Dawn|5|V|A|60|C1|VSM
Destructive Wave|5|V|A|Self 30ft|I|V
Dispel Evil and Good|5|A|A|Self|C1|VSM
Dominate Person|5|E|A|60|C1|VS
Dream|5|I|M1|Special|H8|VSM
Enervation|5|N|A|60|C1|VS
Far Step|5|C|B|Self|C1|V
Flame Strike|5|V|A|60|I|VSM
Geas|5|E|M1|60|D30|V
Greater Restoration|5|A|A|Touch|I|VSM
Hallow|5|V|H24|Touch|UD|VSM
Hold Monster|5|E|A|90|C1|VSM
Holy Weapon|5|V|B|Touch|C1h|VS
Immolation|5|V|A|90|C1|V
Infernal Calling|5|C|M1|90|C1h|VSM
Insect Plague|5|C|A|300|C10|VSM
Legend Lore|5|D|M10|Self|I|VSM
Maelstrom|5|V|A|120|C1|VSM
Mass Cure Wounds|5|V|A|60|I|VS
Mislead|5|I|A|Self|C1h|S
Modify Memory|5|E|A|30|C1|VS
Negative Energy Flood|5|N|A|60|I|VM
Passwall|5|T|A|30|H1|VSM
Planar Binding|5|A|H1|60|H24|VSM
Raise Dead|5|N|H1|Touch|I|VSM
Rary's Telepathic Bond|5|D|Ar|30|H1|VSM
Reincarnate|5|T|H1|Touch|I|VSM
Scrying|5|D|M10|Self|C10|VSM
Seeming|5|I|A|30|H8|VS
Skill Empowerment|5|T|A|Touch|C1h|VS
Steel Wind Strike|5|C|A|30|I|SM
Summon Celestial|5|C|A|90|C1h|VSM
Summon Draconic Spirit|5|C|A|60|C1h|VSM
Swift Quiver|5|T|B|Touch|C1|VSM
Synaptic Static|5|E|A|120|I|VS
Telekinesis|5|T|A|60|C10|VS
Teleportation Circle|5|C|M1|10|R1|VM
Temporal Shunt|5|T|R|120|R1|VS
Transmute Rock|5|T|A|120|I|VSM
Tree Stride|5|C|A|Self|C1|VS
Wall of Force|5|V|A|120|C10|VSM
Wall of Light|5|V|A|120|C10|VSM
Wall of Stone|5|V|A|120|C10|VSM
Wrath of Nature|5|V|A|120|C1|VS
Arcane Gate|6|C|A|500|C10|VS
Blade Barrier|6|V|A|90|C10|VS
Bones of the Earth|6|T|A|120|I|VS
Chain Lightning|6|V|A|150|I|VSM
Circle of Death|6|N|A|150|I|VSM
Contingency|6|V|M10|Self|D10|VSM
Create Homunculus|6|T|H1|Touch|I|VSM
Create Undead|6|N|M1|10|I|VSM
Disintegrate|6|T|A|60|I|VSM
Drawmij's Instant Summons|6|C|M1r|Touch|UD|VSM
Druid Grove|6|A|M10|Touch|H24|VSM
Eyebite|6|N|A|Self|C1|VS
Find the Path|6|D|M1|Self|C1d|VSM
Fizban's Platinum Shield|6|A|B|60|C1|VSM
Flesh to Stone|6|T|A|60|C1|VSM
Forbiddance|6|A|M10r|Touch|D1|VSM
Globe of Invulnerability|6|A|A|Self 10ft|C1|VSM
Gravity Fissure|6|V|A|Self 100ft line|I|VSM
Guards and Wards|6|A|M10|Touch|H24|VSM
Harm|6|N|A|60|I|VS
Heal|6|V|A|60|I|VS
Heroes' Feast|6|C|M10|30|I|VSM
Investiture of Flame|6|T|A|Self|C10|VS
Investiture of Ice|6|T|A|Self|C10|VS
Investiture of Stone|6|T|A|Self|C10|VS
Investiture of Wind|6|T|A|Self|C10|VS
Magic Jar|6|N|M1|Self|UD|VSM
Mass Suggestion|6|E|A|60|H24|VM
Mental Prison|6|I|A|60|C1|S
Move Earth|6|T|A|120|C2h|VSM
Otiluke's Freezing Sphere|6|V|A|300|I|VSM
Otto's Irresistible Dance|6|E|A|30|C1|V
Planar Ally|6|C|A|60|I|VS
Primordial Ward|6|A|A|Self|C1|VS
Programmed Illusion|6|I|A|120|UD|VSM
Scatter|6|C|A|30|I|V
Soul Cage|6|N|S|60|H8|VSM
Summon Fiend|6|C|A|90|C1h|VSM
Sunbeam|6|V|A|Self 60ft line|C1|VSM
Tasha's Otherworldly Guise|6|T|B|Self|C1|VSM
Tenser's Transformation|6|T|A|Self|C10|VSM
Transport via Plants|6|C|A|10|R1|VS
True Seeing|6|D|A|Touch|H1|VSM
Wall of Ice|6|V|A|120|C10|VSM
Wall of Thorns|6|C|A|120|C10|VSM
Wind Walk|6|T|M1|30|H8|VSM
Word of Recall|6|C|A|5|I|V
Conjure Celestial|7|C|M1|90|C1h|VS
Create Magen|7|T|H1|Touch|I|VSM
Crown of Stars|7|V|A|Self|H1|VS
Delayed Blast Fireball|7|V|A|150|C1|VSM
Divine Word|7|V|B|30|I|V
Draconic Transformation|7|T|B|Self|C1|VSM
Dream of the Blue Veil|7|C|M10|20|H6|VSM
Etherealness|7|T|A|Self|U8h|VS
Finger of Death|7|N|A|60|I|VS
Fire Storm|7|V|A|150|I|VS
Forcecage|7|V|A|100|H1|VSM
Mirage Arcane|7|I|M10|Sight|D10|VS
Mordenkainen's Magnificent Mansion|7|C|M1|300|H24|VSM
Mordenkainen's Sword|7|V|A|60|C1|VSM
Plane Shift|7|C|A|Touch|I|VSM
Power Word: Pain|7|E|A|60|I|V
Prismatic Spray|7|V|A|Self 60ft cone|I|VS
Project Image|7|I|A|500 miles|C1d|VSM
Regenerate|7|T|M1|Touch|H1|VSM
Resurrection|7|N|H1|Touch|I|VSM
Reverse Gravity|7|T|A|100|C1|VSM
Sequester|7|T|A|Touch|UD|VSM
Simulacrum|7|I|H12|Touch|UD|VSM
Symbol|7|A|M1|Touch|UT|VSM
Teleport|7|C|A|10|I|V
Temple of the Gods|7|C|H1|120|H24|VSM
Tether Essence|7|N|A|60|C1h|VSM
Whirlwind|7|V|A|300|C1|VM
Abi-Dalzim's Horrid Wilting|8|N|A|150|I|VSM
Animal Shapes|8|T|A|30|C24h|VS
Antimagic Field|8|A|A|Self 10ft|C1h|VSM
Antipathy/Sympathy|8|E|H1|60|D10|VSM
Clone|8|N|H1|Touch|I|VSM
Control Weather|8|T|M10|Self 5mi|C8h|VSM
Dark Star|8|V|A|150|C1|VSM
Demiplane|8|C|A|60|H1|S
Dominate Monster|8|E|A|60|C1h|VS
Earthquake|8|V|A|500|C1|VSM
Feeblemind|8|E|A|150|I|VSM
Glibness|8|T|A|Self|H1|V
Holy Aura|8|A|A|Self|C1|VSM
Illusory Dragon|8|I|A|120|C1|S
Incendiary Cloud|8|C|A|150|C1|VS
Maddening Darkness|8|V|A|150|C10|VM
Maze|8|C|A|60|C10|VS
Mighty Fortress|8|C|M1|1 mile|I|VSM
Mind Blank|8|A|A|Touch|H24|VS
Power Word: Stun|8|E|A|60|I|VS
Reality Break|8|C|A|60|C1|VSM
Sunburst|8|V|A|150|I|VSM
Telepathy|8|V|A|Unlimited|H24|VSM
Tsunami|8|C|M1|Sight|C6r|VS
Astral Projection|9|V|H1|10|SP|VSM
Blade of Disaster|9|C|B|60|C1|VS
Foresight|9|D|M1|Touch|H8|VSM
Gate|9|C|A|60|C1|VSM
Imprisonment|9|A|M1|30|UD|VSM
Invulnerability|9|A|A|Self|C10|VSM
Mass Heal|9|V|A|60|I|VS
Mass Polymorph|9|T|A|120|C1h|VSM
Meteor Swarm|9|V|A|1 mile|I|VS
Power Word: Heal|9|V|A|Touch|I|VS
Power Word: Kill|9|E|A|60|I|V
Prismatic Wall|9|A|A|60|M10|VS
Psychic Scream|9|E|A|90|I|S
Ravenous Void|9|V|A|1000|C1|VSM
Shapechange|9|T|A|Self|C1h|VSM
Storm of Vengeance|9|C|A|Sight|C1|VS
Time Ravage|9|N|A|90|I|VSM
Time Stop|9|T|A|Self|I|V
True Polymorph|9|T|A|30|C1h|VSM
True Resurrection|9|N|H1|Touch|I|VSM
Weird|9|I|A|120|C1|VS
Wish|9|C|A|Self|I|V`;
const SPELL_DB={};
SPELL_RAW.split('\n').forEach(line=>{
  const [n,lv,sc,t,rg,du,cp]=line.split('|');
  SPELL_DB[n.toLowerCase()]={n,lv:+lv,sc,t,rg,du,cp};
});
function spellSlug(name){
  return name.toLowerCase().replace(/[’']/g,'').replace(/[:/]/g,' ').trim().replace(/[^a-z0-9]+/g,'-');
}
// Readable text pills under the spell name — cast type (Action / Bonus Action / Reaction /
// longer cast), plus Concentration and Ritual when they apply. Replaced the old school-icon +
// single-letter tags, which forced players to memorize a private emoji code; words cost a bit
// more width but read instantly at the table.
function spellPillsHTML(name){
  const sp=SPELL_DB[(name||'').trim().toLowerCase()];
  if(!sp) return '';
  const ritual=sp.t.endsWith('r');
  const base=ritual?sp.t.slice(0,-1):sp.t;
  const cls=base==='A'?'pill-action':base==='B'?'pill-bonus':base==='R'?'pill-react':'pill-cast';
  const conc=(SP_DUR[sp.du]||'').startsWith('Conc');
  return `<span class="sp-pill ${cls}">${esc(SP_TIME[base]||base)}</span>`+
    (conc?'<span class="sp-pill pill-conc">Concentration</span>':'')+
    (ritual?'<span class="sp-pill pill-ritual">Ritual</span>':'');
}
// Default text for the editable meta line: "1 Action · 60 ft · Concentration, up to 1 hour".
// Auto-filled when a spell is picked, then the player owns the text.
function spellMetaDefault(name){
  const sp=SPELL_DB[(name||'').trim().toLowerCase()];
  if(!sp) return '';
  const ritual=sp.t.endsWith('r');
  const t=(SP_TIME[ritual?sp.t.slice(0,-1):sp.t]||'')+(ritual?' (Ritual)':'');
  const rg=/^\d+$/.test(sp.rg)?sp.rg+' ft':sp.rg;
  return [t,rg,SP_DUR[sp.du]||''].filter(Boolean).join(' · ');
}
// Splits the single meta string back into [time, range, duration] so the Spells tab's glance
// strip can give each its own labeled cell instead of one dash-joined line. Lossless in the other
// direction too — [t,r,d].filter(Boolean).join(' · ') reconstructs whatever was there before,
// even if a row was hand-typed as one odd fragment with no ' · ' separators at all (it just lands
// entirely in the first cell).
function splitMeta(meta){
  const parts=(meta||'').split(' · ');
  return [parts[0]||'', parts[1]||'', parts.slice(2).join(' · ')];
}
// Pulls the "how do I resolve this" line out of the free-text description, without needing a new
// data field per spell: a save/attack/check phrase and a dice-plus-damage-type phrase, both
// already present in ordinary rules text. Heuristic, not a parser — good on plainly written text,
// occasionally silent or wrong on an oddly phrased one. Read-only surfacing, never touches desc.
function spellRulesCallout(desc){
  const text=desc||'';
  const ABBR={str:'STR',dex:'DEX',con:'CON',int:'INT',wis:'WIS',cha:'CHA'};
  let resolve=null;
  // This app's own one-line spell summaries (SPELL_DESC_RAW) mark saves as "(Dex save)" or
  // "(Dex half)" — that shorthand is what's actually in the data, not SRD prose like "Dexterity
  // saving throw", so it's what gets matched. Attack-roll spells don't follow a consistent enough
  // phrase in this corpus to detect reliably, so those are left to the damage line alone.
  const sv=text.match(/\((str|dex|con|int|wis|cha)\s+(save|half)\)/i);
  if(sv){
    const half=sv[2].toLowerCase()==='half';
    resolve={kind:'save',glyph:'🛡',label:ABBR[sv[1].toLowerCase()]+' Save'+(half?' · half on success':'')};
  }
  let damage=null;
  const dm=text.match(/(\d+d\d+(?:\s*\+\s*\d+)?)\s*(fire|cold|acid|force|radiant|necrotic|poison|psychic|thunder|lightning|bludgeoning|piercing|slashing)?/i);
  if(dm){
    const type=dm[2]?(dm[2][0].toUpperCase()+dm[2].slice(1).toLowerCase()):(/heal|regain/i.test(text)?'Healing':'');
    damage={label:dm[1]+(type?' '+type:''),heal:type==='Healing'};
  }
  return {resolve,damage};
}
// Default text for the editable description box — one-line summary from SPELL_DESC below.
function spellDescDefault(name){
  const sp=SPELL_DB[(name||'').trim().toLowerCase()];
  return (sp&&sp.d)||'';
}
// Tap-open extras: what the always-visible card no longer needs to repeat — school, components,
// wrong-level warning, and the link to the full rules text.
function spellDetailHTML(name,rowLevel){
  const sp=SPELL_DB[(name||'').trim().toLowerCase()];
  if(!sp) return '';
  const lvlTxt=sp.lv===0?'Cantrip':'Level '+sp.lv;
  const warn=(rowLevel!==undefined&&rowLevel!==sp.lv)?`<span class="sd-warn">⚠ placed as a ${lvlTxt} spell here</span>`:'';
  const facts=[['Level',lvlTxt],['School',SP_SCHOOL[sp.sc]],['Components',sp.cp.split('').join(', ')]];
  return `<div class="sd-facts">${facts.map(([k,v])=>`<span class="sd-fact"><b>${k}</b>${esc(v)}</span>`).join('')}</div>`+
    `<a class="sd-link" href="https://dnd5e.wikidot.com/spell:${spellSlug(sp.n)}" target="_blank" rel="noopener">Read full description ↗</a>${warn}`;
}
// ---------- Short summaries (Name|summary) — auto-fill the editable description box ----------
const SPELL_DESC_RAW=`Acid Splash|Hurl acid at one or two adjacent creatures; 1d6 acid damage (Dex save).
Blade Ward|Resistance to bludgeoning, piercing, and slashing weapon damage until your next turn.
Booming Blade|Melee attack; target is sheathed in thunder and takes 1d8 if it willingly moves.
Chill Touch|Ghostly hand deals 1d8 necrotic and blocks healing until your next turn.
Control Flames|Manipulate nonmagical flame - expand, extinguish, brighten, or shape it.
Create Bonfire|Conjure a bonfire in a 5-ft cube; 1d8 fire damage (Dex save).
Dancing Lights|Create up to four floating lights you can move around.
Druidcraft|Minor nature effects - predict weather, bloom a flower, light a candle.
Eldritch Blast|Beam of crackling energy; 1d10 force damage, more beams at higher character levels.
Encode Thoughts|Pull a thought or memory into a visible, shareable thought strand.
Fire Bolt|Hurl a mote of fire; 1d10 fire damage, ignites flammable objects.
Friends|Advantage on Charisma checks against one non-hostile creature; it realizes afterward.
Frostbite|1d6 cold damage and disadvantage on the target's next weapon attack (Con save).
Green-Flame Blade|Melee attack; fire leaps to a second creature within 5 ft of the target.
Guidance|Target adds 1d4 to one ability check of its choice.
Gust|Push a creature 5 ft, shove a light object, or stir a breeze.
Infestation|1d6 poison damage and target moves 5 ft in a random direction (Con save).
Light|Touched object sheds bright light in a 20-ft radius.
Lightning Lure|Pull a creature 10 ft toward you; 1d8 lightning if it ends within 5 ft.
Mage Hand|Spectral hand manipulates objects, opens doors, carries up to 10 lb.
Magic Stone|Imbue up to three pebbles as magical thrown weapons (1d6 + spell mod).
Mending|Repair a single break or tear in an object.
Message|Whisper a message to a creature within range; only it hears and can reply.
Mind Sliver|1d6 psychic damage and target subtracts 1d4 from its next save (Int save).
Minor Illusion|Create a sound or a small static image for 1 minute.
Mold Earth|Excavate, shape, or decorate loose earth in a 5-ft cube.
Poison Spray|Puff of toxic gas; 1d12 poison damage (Con save).
Prestidigitation|Minor magical tricks - sparks, cleaning, flavoring, small marks.
Primal Savagery|Acidic claws or fangs; melee attack for 1d10 acid damage.
Produce Flame|Flame in your palm - light, or hurl it for 1d8 fire damage.
Ray of Frost|1d8 cold damage and target's speed drops by 10 ft.
Resistance|Target adds 1d4 to one saving throw of its choice.
Sacred Flame|Radiant flame descends; 1d8 radiant damage, ignores cover (Dex save).
Sapping Sting|1d4 necrotic damage and the target falls prone (Con save).
Shape Water|Move, shape, freeze, or color water in a 5-ft cube.
Shillelagh|Your club or staff attacks with your spellcasting mod and deals 1d8.
Shocking Grasp|Melee 1d8 lightning damage; target can't take reactions this turn.
Spare the Dying|Stabilize a dying creature at 0 HP.
Sword Burst|Ring of spectral blades; 1d6 force damage to creatures within 5 ft (Dex save).
Thaumaturgy|Minor divine wonders - booming voice, tremors, flickering flames.
Thorn Whip|Vine whip; 1d6 piercing and pull the target 10 ft closer.
Thunderclap|Crack of thunder; 1d6 thunder damage to all creatures within 5 ft (Con save).
Toll the Dead|1d8 necrotic - 1d12 if the target is already wounded (Wis save).
True Strike|Gain advantage on your next attack against the studied target.
Vicious Mockery|Magical insults; 1d4 psychic damage and disadvantage on next attack (Wis save).
Word of Radiance|1d6 radiant damage to chosen creatures within 5 ft (Con save).
Absorb Elements|Reaction: resist incoming elemental damage; add 1d6 of it to your next melee hit.
Alarm|Ward an area; get a mental or audible alert when a creature enters.
Animal Friendship|Charm a beast into friendliness for 24 hours (Wis save).
Armor of Agathys|Gain 5 temp HP; melee attackers take 5 cold damage while it lasts.
Arms of Hadar|Dark tendrils; 2d6 necrotic to all within 10 ft, no reactions (Str save).
Bane|Up to three creatures subtract 1d4 from attacks and saves (Cha save).
Beast Bond|Telepathic link with a beast; it gains advantage near you in combat.
Bless|Up to three creatures add 1d4 to attacks and saving throws.
Burning Hands|15-ft cone of flame; 3d6 fire damage (Dex half).
Catapult|Hurl a loose object at a creature; 3d8 bludgeoning (Dex save).
Cause Fear|Target becomes frightened of you (Wis save).
Ceremony|Ritual rites - atonement, bless water, coming of age, dedication, funeral, wedding.
Chaos Bolt|2d8 + 1d6 of a random damage type; can leap to additional targets.
Charm Person|A humanoid regards you as a friendly acquaintance (Wis save).
Chromatic Orb|3d8 damage of a type you choose - acid, cold, fire, lightning, poison, or thunder.
Color Spray|Dazzling colors blind 6d10 HP worth of creatures until your next turn.
Command|One-word command a creature must obey - halt, flee, drop, grovel (Wis save).
Compelled Duel|Target has disadvantage attacking anyone but you (Wis save).
Comprehend Languages|Understand any spoken or written language you hear or touch.
Create or Destroy Water|Create or destroy up to 10 gallons of water.
Cure Wounds|Touch heals 1d8 + spellcasting modifier HP.
Detect Evil and Good|Sense aberrations, celestials, elementals, fey, fiends, and undead within 30 ft.
Detect Magic|Sense magic within 30 ft; see auras and learn schools of magic.
Detect Poison and Disease|Sense poisons, poisonous creatures, and diseases within 30 ft.
Disguise Self|Illusory change to appearance, clothing, armor, weapons, and carried gear.
Dissonant Whispers|3d6 psychic damage; target must use its reaction to flee you (Wis save).
Distort Value|Make an object appear far more or less valuable than it is.
Divine Favor|Your weapon attacks deal +1d4 radiant damage.
Earth Tremor|Tremor within 10 ft; 1d6 bludgeoning, knocks prone, breaks ground (Dex save).
Ensnaring Strike|Next weapon hit wraps the target in thorny vines - restrained, 1d6/turn (Str save).
Entangle|Grasping weeds restrain creatures in a 20-ft square (Str save).
Expeditious Retreat|Dash as a bonus action every turn.
Faerie Fire|Outline creatures in glowing light; attacks against them gain advantage (Dex save).
False Life|Gain 1d4+4 temporary hit points.
Feather Fall|Up to five falling creatures drift down slowly and land unharmed.
Find Familiar|Summon a spirit familiar in animal form - shares senses, delivers touch spells.
Fog Cloud|20-ft-radius sphere of fog heavily obscures the area.
Frost Fingers|15-ft cone of cold; 2d8 cold damage, freezes water (Con half).
Gift of Alacrity|Target adds 1d8 to initiative rolls for 8 hours.
Goodberry|Ten berries; each heals 1 HP and feeds a creature for a day.
Grease|10-ft square turns slick; creatures fall prone (Dex save).
Guiding Bolt|4d6 radiant damage; the next attack on the target has advantage.
Hail of Thorns|Next ranged hit bursts into thorns - 1d10 piercing around the target (Dex half).
Healing Word|Heal 1d4 + modifier at range as a bonus action.
Hellish Rebuke|Reaction: your attacker erupts in flame - 2d10 fire damage (Dex half).
Heroism|Target is immune to fright and gains your modifier in temp HP each turn.
Hex|Curse a target - your hits deal +1d6 necrotic; disadvantage on one ability's checks.
Hunter's Mark|Add 1d6 damage to each weapon hit against the marked target.
Ice Knife|Thrown ice shard; 1d10 piercing, then bursts for 2d6 cold nearby (Dex save).
Identify|Learn a magic item's properties and how to use them.
Illusory Script|Write a message only intended readers can understand.
Inflict Wounds|Touch channels necrotic energy for 3d10 damage.
Jim's Magic Missile|Three darts that require attack rolls; 2d4 force each, can crit.
Jump|Target's jump distance triples.
Longstrider|Target's speed increases by 10 ft.
Mage Armor|Unarmored target's AC becomes 13 + Dex modifier.
Magic Missile|Three darts hit automatically for 1d4+1 force each.
Magnify Gravity|10-ft sphere of crushing gravity; 2d8 force, speed halved (Con save).
Protection from Evil and Good|Warded vs aberrations, celestials, elementals, fey, fiends, undead - they attack at disadvantage and can't charm, frighten, or possess you.
Purify Food and Drink|Remove poison and disease from food and drink.
Ray of Sickness|2d8 poison damage; target may be poisoned (Con save).
Sanctuary|Attackers must pass a Wis save to target the warded creature.
Searing Smite|Next hit deals +1d6 fire and ignites the target - 1d6/turn (Con save).
Shield|Reaction: +5 AC until your next turn; negates magic missile.
Shield of Faith|Target gains +2 AC.
Silent Image|Purely visual illusion up to a 15-ft cube; move it with an action.
Silvery Barbs|Reaction: force a reroll on a success and give someone else advantage.
Sleep|5d8 HP worth of creatures fall unconscious, weakest first.
Snare|Hidden magical trap hoists and restrains the first creature to step in.
Speak with Animals|Comprehend and verbally communicate with beasts.
Tasha's Caustic Brew|30-ft line of acid; coated creatures take 2d4 acid each turn (Dex save).
Tasha's Hideous Laughter|Target collapses laughing - prone and incapacitated (Wis save).
Tenser's Floating Disk|Floating force disk carries up to 500 lb and follows you.
Thunderous Smite|Next hit deals +2d6 thunder and can push the target 10 ft and knock it prone.
Thunderwave|15-ft cube of thunder; 2d8 damage and pushed 10 ft (Con save).
Unseen Servant|Invisible force performs simple tasks on command.
Witch Bolt|1d12 lightning; keep the arc going for 1d12 automatically each turn.
Wrathful Smite|Next hit deals +1d6 psychic; target is frightened of you (Wis save).
Zephyr Strike|Movement does not provoke opportunity attacks. One attack can gain advantage and +1d8 force damage.
Aganazzar's Scorcher|30-ft line of roaring flame; 3d8 fire damage (Dex half).
Aid|Up to three creatures gain +5 max HP and current HP for 8 hours.
Air Bubble|Surround a creature's head with fresh, breathable air.
Alter Self|Change your appearance, grow natural weapons, or adapt to water.
Animal Messenger|A tiny beast carries a short spoken message to a place you describe.
Arcane Lock|Magically seal a door, chest, or lock; +10 DC to break or pick.
Augury|Receive an omen about a plan - weal, woe, both, or neither.
Barkskin|Target's AC can't be lower than 16.
Beast Sense|See and hear through a touched beast's senses.
Blindness/Deafness|Blind or deafen a creature; Con save each turn to shake it off.
Blur|Your form wavers - attackers have disadvantage against you.
Borrowed Knowledge|Gain proficiency in one skill of your choice for 1 hour.
Branding Smite|Next hit deals +2d6 radiant; target glows and can't turn invisible.
Calm Emotions|Suppress charm and fear, or cool hostility, in a 20-ft sphere.
Cloud of Daggers|5-ft cube of spinning blades; 4d4 slashing to anything inside.
Continual Flame|Permanent, heatless torch flame on an object.
Cordon of Arrows|Plant four pieces of ammunition to ward an area; 1d6 to intruders.
Crown of Madness|Charmed humanoid must attack creatures you choose (Wis save).
Darkness|15-ft sphere of magical darkness even darkvision can't pierce.
Darkvision|Touched creature sees in the dark to 60 ft for 8 hours.
Detect Thoughts|Read surface thoughts; probe deeper with a contested save.
Dragon's Breath|Touched creature can exhale a 15-ft cone of a chosen element (3d6).
Dust Devil|Whirlwind of grit pushes creatures and deals 1d8 bludgeoning (Str save).
Earthbind|Yank a flying creature 60 ft downward each turn (Str save).
Enhance Ability|Advantage on one ability's checks, plus a small perk by ability.
Enlarge/Reduce|Double or halve a creature's size; 1d4 more or less weapon damage.
Enthrall|Creatures have disadvantage noticing anyone but you (Wis save).
Find Steed|Summon an intelligent spirit mount that can share your spells.
Find Traps|Sense whether any traps are present within line of sight.
Flame Blade|Fiery scimitar appears in your hand; melee 3d6 fire damage.
Flaming Sphere|5-ft ball of fire you steer into enemies; 2d6 fire (Dex half).
Flock of Familiars|Summon up to three temporary familiars at once.
Fortune's Favor|Gift of luck: reroll one attack, check, or save within 1 hour.
Gentle Repose|A corpse can't decay or rise as undead for 10 days.
Gift of Gab|Magically unsay the last 6 seconds of your own speech.
Gust of Wind|60-ft line of strong wind pushes creatures 15 ft back (Str save).
Healing Spirit|Nature spirit heals 1d6 to creatures passing through its space.
Heat Metal|A metal object glows red-hot; 2d8 fire, holders drop it or suffer.
Hold Person|Paralyze a humanoid; Wis save each turn to break free.
Immovable Object|Touched object becomes magically fixed in place.
Invisibility|Target turns invisible until it attacks or casts a spell.
Jim's Glowing Coin|Enchanted coin distracts creatures that fail a Wis save.
Kinetic Jaunt|+10 ft speed, no opportunity attacks, walk through creatures' spaces.
Knock|Loudly open a locked, barred, or stuck object.
Lesser Restoration|End one disease or condition - blinded, deafened, paralyzed, or poisoned.
Levitate|Target floats up to 20 ft off the ground (Con save).
Locate Animals or Plants|Learn the direction of the nearest beast or plant of a kind within 5 miles.
Locate Object|Sense the direction of a familiar object within 1,000 ft.
Magic Mouth|An object delivers a recorded message when a trigger occurs.
Magic Weapon|Touched weapon becomes a +1 magic weapon.
Maximillian's Earthen Grasp|Earthen hand grabs and squeezes - restrained, 2d6 bludgeoning (Str save).
Melf's Acid Arrow|Acid bolt; 4d4 acid on hit and 2d4 more next turn.
Mind Spike|3d8 psychic damage; you always know the target's location (Wis half).
Mirror Image|Three illusory duplicates draw attacks away from you.
Misty Step|Bonus action: teleport up to 30 ft to a spot you can see.
Moonbeam|5-ft-radius column of pale light; 2d10 radiant each turn inside (Con half).
Nathair's Mischief|A cube of random fey mischief - charms, blinds, or trips each round.
Nystul's Magic Aura|Falsify an object's or creature's magical aura or creature type.
Pass Without Trace|+10 to the group's Stealth checks; you can't be tracked.
Phantasmal Force|Illusion only the target perceives as real; can deal 1d6 psychic per turn.
Prayer of Healing|Up to six creatures heal 2d8 + modifier over a 10-minute prayer.
Protection from Poison|Neutralize one poison; target gains advantage on saves vs poison and resistance to poison damage.
Pyrotechnics|Turn a flame into blinding fireworks or thick choking smoke.
Ray of Enfeeblement|Target deals half damage with Strength-based weapon attacks.
Rime's Binding Ice|30-ft cone of ice; 3d8 cold and frozen in place until the ice is broken (Con save).
Rope Trick|Create an extradimensional hiding space at the upper end of a rope.
Scorching Ray|Three rays of fire; 2d6 fire damage per hit.
See Invisibility|See invisible creatures and objects, and into the Ethereal Plane.
Shadow Blade|Sword of solid shadow; 2d8 psychic, advantage in dim light or darkness.
Shatter|Painful ringing burst in a 10-ft sphere; 3d8 thunder (Con half).
Silence|20-ft sphere of total silence; blocks sound and verbal spells.
Skywrite|Spell out words with clouds in the sky.
Snilloc's Snowball Swarm|Flurry of snowballs; 3d6 cold in a 5-ft sphere (Dex half).
Spider Climb|Target walks on walls and ceilings with hands free.
Spike Growth|Hidden spikes in a 20-ft radius; 2d4 per 5 ft moved, difficult terrain.
Spiritual Weapon|Floating spectral weapon attacks as a bonus action (1d8 + mod).
Spray Of Cards|Fling a 15-ft cone of magical cards that damage and can blind (Dex save).
Suggestion|Magically compel a reasonable-sounding course of action (Wis save).
Summon Beast|Summon a bestial spirit - air, land, or water - that fights for you.
Tasha's Mind Whip|3d6 psychic; target loses its reaction and most of its turn (Int save).
Vortex Warp|Teleport another creature up to 90 ft to a spot you can see (Con save).
Warding Bond|Bond with an ally: it gains +1 AC and saves plus resistance; you share its pain.
Warding Wind|Whirling wind around you - deafens, blocks gases, hinders ranged attacks.
Warp Sense|Detect the presence and recent use of portals nearby.
Web|20-ft cube of sticky webs restrains creatures (Dex save).
Wither and Bloom|2d6 necrotic in a 10-ft sphere; one ally spends a Hit Die to heal.
Wristpocket|Flick a touched object into an extradimensional pocket.
Zone of Truth|Creatures in a 15-ft sphere can't speak a deliberate lie (Cha save).
Animate Dead|Raise a skeleton or zombie servant from remains.
Antagonize|4d4 psychic; the target's reaction is spent attacking a creature you pick (Wis save).
Ashardalon's Stride|+20 ft speed; flames scorch creatures you pass by.
Aura of Vitality|Healing aura; restore 2d6 to one creature each turn for a minute.
Beacon of Hope|Allies gain advantage on Wis and death saves, and healing on them is maximized.
Bestow Curse|Curse a creature - disadvantage, wasted turns, or +1d8 necrotic from your attacks.
Blinding Smite|Next hit deals +3d8 radiant and blinds the target (Con save).
Blink|Each turn, 50% chance to vanish to the Ethereal Plane until your next turn.
Call Lightning|Storm cloud hurls a bolt each turn; 3d10 lightning (Dex half).
Catnap|Up to three creatures gain a short rest's benefit in 10 minutes.
Clairvoyance|Invisible sensor lets you see or hear a familiar distant location.
Conjure Animals|Summon fey beasts - e.g. eight wolves - that obey your commands.
Conjure Barrage|60-ft cone of duplicated weapon or ammo; 3d8 damage (Dex half).
Counterspell|Reaction: interrupt and negate another creature's spellcasting.
Create Food and Water|Conjure bland food and clean water for fifteen people.
Crusader's Mantle|Allies within 30 ft deal +1d4 radiant on weapon hits.
Daylight|60-ft sphere of brilliant light; dispels lower-level magical darkness.
Dispel Magic|End spells of 3rd level or lower on a target; check to end higher ones.
Elemental Weapon|Weapon becomes +1 and deals +1d4 of a chosen element.
Enemies Abound|Target sees every creature as an enemy and attacks at random (Int save).
Erupting Earth|20-ft cube of churning stone; 3d12 bludgeoning, ground becomes difficult (Dex half).
Fast Friends|Compel a humanoid to helpfully carry out your requests (Wis save).
Fear|30-ft cone of terror; creatures drop what they hold and flee (Wis save).
Feign Death|Put a willing creature into a deathlike coma.
Fireball|20-ft-radius explosion of flame; 8d6 fire damage (Dex half).
Flame Arrows|Twelve pieces of ammunition deal +1d6 fire on hit.
Fly|Touched creature gains a 60 ft flying speed.
Galder's Tower|Conjure a modest two-story stone tower, furnished as you like.
Gaseous Form|Target becomes a misty cloud with a 10 ft fly speed.
Glyph of Warding|Hidden glyph triggers a stored spell or a 5d8 elemental blast.
Haste|Double speed, +2 AC, one extra limited action; lethargy when it ends.
Hunger Of Hadar|20-ft sphere of void - blinding darkness, 2d6 cold inside, 2d6 acid leaving.
Hypnotic Pattern|Twisting colors charm and incapacitate creatures in a 30-ft cube (Wis save).
Incite Greed|Creatures are drawn helplessly toward your displayed gem (Wis save).
Intellect Fortress|Resistance to psychic damage; advantage on Int, Wis, and Cha saves.
Leomund's Tiny Hut|Immobile 10-ft dome shelters up to nine creatures for 8 hours.
Life Transference|Take 4d8 necrotic damage; heal a creature for twice that.
Lightning Arrow|Next ranged attack becomes a bolt - 4d8 lightning, bursts around the target.
Lightning Bolt|100-ft line of lightning; 8d6 damage (Dex half).
Magic Circle|Warding cylinder vs a chosen creature type - it can't enter, charm, or frighten.
Major Image|Full sight-sound-smell illusion up to a 20-ft cube.
Mass Healing Word|Bonus action: up to six creatures heal 1d4 + modifier.
Meld into Stone|Step into a stone surface and hide within it.
Melf's Minute Meteors|Six tiny meteors orbit you; fling two per turn for 2d6 fire each.
Motivational Speech|Rousing oration: up to five creatures gain temp HP and courage.
Nondetection|Hide a target from divination magic and scrying for 8 hours.
Phantom Steed|Conjure a quasi-real horse with 100 ft speed for an hour.
Plant Growth|Instantly overgrow an area into thicket, or enrich farmland for a year.
Protection from Energy|Resistance to acid, cold, fire, lightning, or thunder.
Pulse Wave|30-ft cone of force; 6d6 damage and pull or push targets 15 ft (Con save).
Remove Curse|End all curses afflicting a creature or object.
Revivify|Return a creature dead less than a minute to life with 1 HP.
Sending|Send a 25-word telepathic message to anyone, anywhere; they can reply.
Sleet Storm|40-ft radius of driving sleet - blinding, slick ice, breaks concentration.
Slow|Up to six creatures: halved speed, -2 AC and Dex saves, limited actions (Wis save).
Speak with Dead|Ask a corpse five questions it must answer.
Speak with Plants|Talk with plants; ask them to help or hinder.
Spirit Guardians|Protective spirits swirl 15 ft around you; 3d8 radiant or necrotic, slows enemies.
Spirit Shroud|Your attacks within 10 ft deal +1d8 and block healing; slows nearby foes.
Stinking Cloud|20-ft sphere of nauseating gas; creatures retch and lose their action (Con save).
Summon Fey|Summon a fey spirit - fuming, mirthful, or tricksy - to fight for you.
Summon Lesser Demons|Summon several random minor demons that attack whatever is closest.
Summon Shadowspawn|Summon a shadow spirit - fury, despair, or fear - to fight for you.
Summon Undead|Summon an undead spirit - ghostly, putrid, or skeletal - to fight for you.
Thunder Step|Teleport 90 ft, leaving a 3d10 thunderclap behind (Con save).
Tidal Wave|Crashing wave; 4d8 bludgeoning and knocked prone (Dex half).
Tiny Servant|Animate a tiny object into an obedient servant.
Tongues|Understand and be understood in any spoken language.
Vampiric Touch|Melee 3d6 necrotic; you heal half the damage dealt.
Wall of Sand|30-ft wall of swirling sand - blocks sight, bogs down movement.
Wall of Water|30-ft wall of water - ranged attacks hindered, fire halved, cold freezes it.
Water Breathing|Up to ten creatures can breathe underwater for 24 hours.
Water Walk|Up to ten creatures walk on water and other liquids.
Wind Wall|Wall of roaring wind - deflects arrows and gases; 3d8 bludgeoning (Str half).
Arcane Eye|Invisible floating eye you see through; flies 30 ft per turn.
Aura of Life|30-ft aura: resistance to necrotic; allies at 0 HP wake with 1 HP.
Aura of Purity|30-ft aura: immunity to disease, resistance to poison, advantage vs conditions.
Banishment|Banish a creature to another plane of existence (Cha save).
Blight|Drain life; 8d8 necrotic - devastating to plant creatures (Con half).
Charm Monster|Any creature regards you as a friendly acquaintance (Wis save).
Compulsion|Force creatures to dash in a direction you choose each turn (Wis save).
Confusion|Creatures act randomly - babble, wander, or strike out (Wis save).
Conjure Minor Elementals|Summon a handful of minor elementals that obey you.
Conjure Woodland Beings|Summon fey creatures - such as pixies - that obey you.
Control Water|Flood, part, redirect, or whirlpool a huge volume of water.
Death Ward|The first time the target would drop to 0 HP, it drops to 1 instead.
Dimension Door|Teleport yourself and one willing ally up to 500 ft.
Divination|Ask a deity one question about events within seven days.
Dominate Beast|Seize telepathic control of a beast's actions (Wis save).
Elemental Bane|Target loses resistance to a chosen element and takes +2d6 from it (Con save).
Evard's Black Tentacles|20-ft square of grasping tentacles - restrained, 3d6 bludgeoning (Dex save).
Fabricate|Instantly craft finished goods from raw materials.
Find Greater Steed|Summon a superior mount - griffon, pegasus, dire wolf, and more.
Fire Shield|Wreathe yourself in flame - resist fire or cold; melee attackers take 2d8.
Freedom of Movement|Ignore difficult terrain, paralysis, and restraints; slip any grapple.
Galder's Speedy Courier|Conjure a spirit that delivers a small package to a distant recipient.
Gate Seal|Seal an area against portals and planar gates.
Giant Insect|Grow centipedes, spiders, or wasps into giant obedient versions.
Grasping Vine|A vine lashes out and pulls a creature 20 ft toward it (Dex save).
Gravity Sinkhole|20-ft sphere implodes; 5d10 force and pulled to the center (Con save).
Greater Invisibility|Target stays invisible even while attacking or casting.
Guardian of Faith|Spectral guardian; 20 radiant to enemies that come close (Dex half).
Guardian of Nature|Become a Primal Beast or Great Tree with combat boons.
Hallucinatory Terrain|Make terrain look, sound, and smell like other terrain.
Ice Storm|Hail hammers a 20-ft cylinder; 2d8 bludgeoning + 4d6 cold (Dex half).
Leomund's Secret Chest|Hide a chest on the Ethereal Plane; recall it at will.
Locate Creature|Sense the direction of a familiar creature within 1,000 ft.
Mordenkainen's Faithful Hound|Invisible watchdog barks at intruders and bites for 4d8.
Mordenkainen's Private Sanctum|Secure an area against sound, sight, scrying, and teleportation.
Otiluke's Resilient Sphere|Immobile sphere of force traps or protects a creature.
Phantasmal Killer|Living nightmare; 4d10 psychic each turn while the target stays frightened (Wis save).
Polymorph|Transform a creature into a beast of equal or lower CR.
Raulothim's Psychic Lance|Lance of psychic power; 7d6 and incapacitated - can target a named unseen foe (Int save).
Shadow Of Moil|Shadows veil you - resist radiant; melee attackers take 2d8 necrotic.
Sickening Radiance|30-ft sphere of sickly light; 4d10 radiant plus mounting exhaustion (Con save).
Spirit Of Death|Summon a reaper spirit that fights at your command.
Staggering Smite|Next hit deals +4d6 psychic; target reels - disadvantage, no reactions.
Stone Shape|Reshape a stone object or carve a passage through stone.
Stoneskin|Resistance to nonmagical bludgeoning, piercing, and slashing damage.
Storm Sphere|20-ft sphere of storm winds; 2d6 bludgeoning inside, hurl 4d6 lightning bolts.
Summon Aberration|Summon an aberrant spirit - beholderkin, slaad, or star spawn.
Summon Construct|Summon a construct spirit - clay, metal, or stone - to fight for you.
Summon Elemental|Summon an elemental spirit - air, earth, fire, or water.
Summon Greater Demon|Summon a powerful demon that obeys only while you hold control.
Vitriolic Sphere|20-ft sphere of acid; 10d4 now and 5d4 next turn (Dex save).
Wall of Fire|Towering wall of flame; 5d8 fire to creatures inside or too close.
Watery Sphere|Rolling sphere of water engulfs and restrains creatures (Str save).
Animate Objects|Bring up to ten objects to life to fight for you.
Antilife Shell|10-ft shimmering barrier that no living creature can cross.
Awaken|Grant a beast or plant intelligence, speech, and 30 days of devotion.
Banishing Smite|Next hit deals +5d10 force; banishes a target under 50 HP.
Bigby's Hand|Large hand of force - punch (4d8), shove, grasp, or block.
Circle of Power|30-ft aura: advantage on saves vs magic; a success means no damage at all.
Cloudkill|20-ft sphere of poison fog that creeps forward; 5d8 poison (Con half).
Commune|Ask your deity three yes-or-no questions.
Commune with Nature|Learn key facts about the surrounding land within 3 miles.
Cone of Cold|60-ft cone of frost; 8d8 cold damage (Con half).
Conjure Elemental|Summon an elemental bound to obey your commands.
Conjure Volley|Duplicated ammunition rains over a 40-ft radius; 8d8 (Dex half).
Contact Other Plane|Risky contact with extraplanar intelligence; five one-word answers.
Contagion|Inflict a crippling disease - blinding sickness, flesh rot, slimy doom, and more.
Control Winds|Command the winds in a huge cube - gusts, downdrafts, or updrafts.
Creation|Conjure a temporary object of vegetable or mineral matter.
Danse Macabre|Raise up to five corpses as empowered skeletons or zombies.
Dawn|30-ft cylinder of dawn light; 4d10 radiant each turn, movable (Con save).
Destructive Wave|Thunder erupts around you; 5d6 thunder + 5d6 radiant or necrotic, knocks prone.
Dispel Evil and Good|Extraplanar creatures falter against you; break their enchantments or banish them.
Dominate Person|Seize telepathic control of a humanoid's actions (Wis save).
Dream|Shape a distant creature's dreams - or send 3d6 psychic nightmares.
Enervation|Tether of necrotic energy; 4d8 per turn, healing you for half (Dex save).
Far Step|Teleport 60 ft as a bonus action, every turn for a minute.
Flame Strike|Pillar of divine fire; 4d6 fire + 4d6 radiant (Dex half).
Geas|Bind a creature to your command - 5d10 psychic per day for disobeying.
Greater Restoration|Undo exhaustion, charm, petrification, curses, or ability drain.
Hallow|Consecrate an area - fiends and undead barred, plus a lasting effect you choose.
Hold Monster|Paralyze any creature; Wis save each turn to break free.
Holy Weapon|Weapon deals +2d8 radiant and sheds light; ends in a blinding burst.
Immolation|Flames engulf a target; 8d6 fire, then 4d6 each turn (Dex save).
Infernal Calling|Summon an uncontrolled devil; bargain or bully it into service.
Insect Plague|20-ft sphere of biting locusts; 4d10 piercing, difficult terrain.
Legend Lore|Learn the legends and lore of a person, place, or object.
Maelstrom|30-ft whirlpool; 6d6 bludgeoning and drags creatures toward the center.
Mass Cure Wounds|Up to six creatures heal 3d8 + modifier.
Mislead|Turn invisible while an illusory double walks and talks for you.
Modify Memory|Rewrite a creature's memory of the last 24 hours.
Negative Energy Flood|5d12 necrotic; creatures killed rise as zombies (Con half).
Passwall|Open a passage through wood, plaster, or stone.
Planar Binding|Bind a celestial, elemental, fey, or fiend to your service for a day.
Raise Dead|Return a creature dead up to 10 days to life.
Rary's Telepathic Bond|Link up to eight creatures in telepathic contact for an hour.
Reincarnate|Return a dead humanoid to life - in a new random body.
Scrying|Spy on a distant creature through an invisible sensor (Wis save).
Seeming|Disguise multiple creatures with illusory appearances for 8 hours.
Skill Empowerment|Target gains expertise in one skill it's proficient with.
Steel Wind Strike|Flash between up to five foes, striking each for 6d10 force.
Summon Celestial|Summon a celestial spirit - avenger or defender - to fight for you.
Summon Draconic Spirit|Summon a draconic spirit with a breath weapon and resistances.
Swift Quiver|Your quiver refills itself; two ranged attacks as a bonus action each turn.
Synaptic Static|20-ft sphere of psychic feedback; 8d6 and -1d6 on attacks and checks (Int save).
Telekinesis|Move creatures or 1,000-lb objects with your mind, turn after turn.
Teleportation Circle|Open a portal to a permanent teleportation circle you know.
Temporal Shunt|Reaction: hurl an attacker or caster forward in time, erasing its turn.
Transmute Rock|Turn rock to mud, or mud to rock, in a 40-ft cube.
Tree Stride|Step into one tree and out of another within 500 ft, every turn.
Wall of Force|Invisible, indestructible wall no attack or spell can breach.
Wall of Light|Wall of blazing light - blinds and deals 4d8 radiant; fire beams from it.
Wall of Stone|Raise a wall of solid stone that can become permanent.
Wrath of Nature|Awaken trees, vines, rocks, and roots to assail your enemies.
Arcane Gate|Create two linked teleportation portals up to 500 ft apart.
Blade Barrier|Wall of whirling blades; 6d10 slashing to creatures crossing it (Dex half).
Bones of the Earth|Six stone pillars erupt from the ground, lifting or pinning creatures.
Chain Lightning|A bolt arcs to strike up to four targets; 10d8 lightning each (Dex half).
Circle of Death|60-ft-radius sphere of negative energy; 8d6 necrotic (Con half).
Contingency|Store a spell on yourself that casts itself when a set condition occurs.
Create Homunculus|Craft a loyal homunculus companion from your own blood.
Create Undead|Raise up to three ghouls - or mightier undead at higher levels.
Disintegrate|10d6+40 force damage; a creature reduced to 0 HP turns to dust (Dex save).
Drawmij's Instant Summons|Mark an item; summon it to your hand from anywhere.
Druid Grove|Ward a grove with mists, winds, grasping undergrowth, and guardians.
Eyebite|Your gaze puts one creature per turn to sleep, to flight, or to sickness.
Find the Path|Know the shortest route to a fixed location you've visited.
Fizban's Platinum Shield|Movable shield of platinum light: cover, elemental resistances, evasion.
Flesh to Stone|Petrify a creature over successive failed Con saves.
Forbiddance|Ward a large area against teleportation; 5d10 to chosen creature types.
Globe of Invulnerability|10-ft sphere that blocks all spells of 5th level and lower.
Gravity Fissure|100-ft line of gravitational collapse; 8d8 force, pulls in bystanders (Con save).
Guards and Wards|Fill a stronghold with fog, locked doors, webs, and other defenses.
Harm|Ravaging disease; 14d6 necrotic and max HP reduced to match (Con half).
Heal|Restore 70 HP and cure blindness, deafness, and disease.
Heroes' Feast|Grand feast - immunity to fear and poison, +2d10 max HP for a day.
Investiture of Flame|Become fire - immune to it, scorch nearby foes, hurl 4d8 flame lines.
Investiture of Ice|Become ice - immune to cold, chill the ground, breathe 4d6 frost cones.
Investiture of Stone|Become stone - resist weapons, quake the ground, glide through earth.
Investiture of Wind|Become wind - fly 60 ft, foil ranged attacks, exhale 2d10 gusts.
Magic Jar|Cast your soul into a vessel and possess humanoid bodies.
Mass Suggestion|Magically suggest a course of action to up to twelve creatures (Wis save).
Mental Prison|Illusory cell; 5d10 psychic, and 10d10 more to break out (Int save).
Move Earth|Reshape dirt, sand, or clay terrain over hours of work.
Otiluke's Freezing Sphere|Enormous frost burst; 10d6 cold, freezes water solid (Con half).
Otto's Irresistible Dance|Target capers helplessly - no movement, attacks against it advantaged (Wis to end).
Planar Ally|Your deity lends an otherworldly ally - for a negotiated price.
Primordial Ward|Resistance to acid, cold, fire, lightning, and thunder; trade it for one turn of immunity.
Programmed Illusion|Preset an illusion that performs when its trigger occurs.
Scatter|Fling up to five creatures 120 ft through the air to spots you choose (Wis save).
Soul Cage|Trap a dying humanoid's soul; spend it for healing, answers, or spying.
Summon Fiend|Summon a fiendish spirit - demon, devil, or yugoloth - to fight for you.
Sunbeam|Re-aimable 60-ft beam of sunlight; 6d8 radiant and blinds (Con save).
Tasha's Otherworldly Guise|Assume a fiendish or celestial form - flight, immunities, +2 AC, spell-powered strikes.
Tenser's Transformation|Become a warrior - 50 temp HP, extra attacks, advantage; at a price.
Transport via Plants|Step into one large plant and out of another anywhere on the plane.
True Seeing|Truesight 120 ft - pierce illusions, invisibility, and the Ethereal.
Wall of Ice|Raise a wall of solid ice; 10d6 cold to creatures caught in its path.
Wall of Thorns|Wall of tangled brush; 7d8 piercing, agonizing to push through.
Wind Walk|Your party becomes cloud mist with a 300 ft flying speed.
Word of Recall|Instantly teleport your party to a prepared sanctuary.
Conjure Celestial|Summon a celestial being that obeys your commands.
Create Magen|Transform an inanimate mannequin into a loyal magen construct.
Crown of Stars|Seven star-motes orbit your head; hurl them for 4d12 radiant each.
Delayed Blast Fireball|Plant a growing bead of fire; 12d6+ when it finally detonates (Dex half).
Divine Word|Divine thunder - deafens, blinds, stuns, or kills by HP; banishes extraplanar foes.
Draconic Transformation|Become part dragon - blindsight, spectral wings, 6d8 breath weapon.
Dream of the Blue Veil|Ritual journey to another world of the Material Plane.
Etherealness|Step into the Ethereal Plane and drift unseen through the living world.
Finger of Death|7d8+30 necrotic; slain humanoids rise as zombies under your command (Con half).
Fire Storm|Sheets of flame in ten connected cubes; 7d10 fire (Dex half).
Forcecage|Trap creatures in an invisible cage of force; even teleporting out is hard.
Mirage Arcane|Transform a square mile of terrain - an illusion with physical presence.
Mordenkainen's Magnificent Mansion|Extradimensional mansion staffed with servants and a feast.
Mordenkainen's Sword|Floating blade of force attacks each turn for 3d10.
Plane Shift|Transport your group to another plane - or shove a foe through (Cha save).
Power Word: Pain|A creature with 100 HP or fewer is wracked by crippling pain.
Prismatic Spray|60-ft cone of eight colored rays, each with a different deadly effect.
Project Image|Project an illusory double of yourself up to 500 miles away.
Regenerate|Heal 4d8+15, regrow severed limbs, and keep healing for an hour.
Resurrection|Return a creature dead up to a century to life.
Reverse Gravity|50-ft cylinder where everything falls upward.
Sequester|Hide a creature or object - invisible, undetectable, in timeless stasis.
Simulacrum|Sculpt an obedient snow-duplicate of a creature with half its HP.
Symbol|Inscribe a devastating glyph - death, stunning, fear, discord, and more.
Teleport|Instantly transport your party anywhere on the plane; accuracy varies.
Temple of the Gods|Conjure a temple that bars chosen creatures and strengthens the faithful.
Tether Essence|Bind two creatures' fates - damage and healing strike both (Con save).
Whirlwind|Roaming cyclone; 10d6 bludgeoning, flings creatures skyward.
Abi-Dalzim's Horrid Wilting|Wring the moisture from everything; 12d8 necrotic (Con half).
Animal Shapes|Transform any number of allies into powerful beasts, re-shaping at will.
Antimagic Field|10-ft sphere where spells and magic items simply stop working.
Antipathy/Sympathy|Make an object or area repel or irresistibly attract a creature type.
Clone|Grow an inert duplicate body; your soul moves into it when you die.
Control Weather|Reshape the region's weather - temperature, wind, and precipitation.
Dark Star|Sphere of crushing gravity and silence; 8d10 force, disintegrates the slain.
Demiplane|Open a door to a 30-ft extradimensional room you can revisit.
Dominate Monster|Seize telepathic control of any creature's actions (Wis save).
Earthquake|Seismic upheaval - fissures, toppled structures, creatures thrown prone.
Feeblemind|4d6 psychic; the target's Intelligence and Charisma collapse to 1 (Int save).
Glibness|For an hour, treat any Charisma check below 15 as 15; lies read as truth.
Holy Aura|Allies within 30 ft: advantage on saves, attackers at disadvantage; blinds fiends.
Illusory Dragon|Shadowy dragon illusion - frightens foes, breathes 7d6 of a chosen energy.
Incendiary Cloud|20-ft sphere of burning embers; 10d8 fire, drifts with the wind (Dex half).
Maddening Darkness|60-ft sphere of howling darkness; 8d8 psychic (Wis half).
Maze|Banish a creature into a labyrinth demiplane; Int check to escape.
Mighty Fortress|Raise a fortified stone castle, turrets, and garrison from the earth.
Mind Blank|Immune to psychic damage, mind reading, charm - even wish can't find you.
Power Word: Stun|A creature with 150 HP or fewer is stunned outright.
Reality Break|Shatter a creature's grip on reality - random severe effects each turn (Wis save).
Sunburst|60-ft-radius flash of sunlight; 12d6 radiant and blinds (Con save).
Telepathy|Unlimited-range telepathic link with a willing creature for 24 hours.
Tsunami|300-ft wall of water crashes forward; 6d10 bludgeoning, sweeps creatures along.
Astral Projection|Project yourself and companions into the Astral Plane on silver cords.
Blade of Disaster|Rift-blade strikes twice a turn for 4d12 force, critting on 18-20.
Foresight|Target can't be surprised, has advantage on everything; attackers don't.
Gate|Open a portal to a precise spot on another plane; call beings by true name.
Imprisonment|Eternally trap a creature - buried, chained, slumbering, or shrunken.
Invulnerability|You are immune to all damage for the duration.
Mass Heal|Distribute 700 HP of healing; cures blindness, deafness, and disease.
Mass Polymorph|Transform up to ten creatures into beasts.
Meteor Swarm|Four meteors fall; 20d6 fire + 20d6 bludgeoning each (Dex half).
Power Word: Heal|Fully heal a creature and strip away nearly every condition.
Power Word: Kill|A creature with 100 HP or fewer simply dies.
Prismatic Wall|Seven-layered wall of light; every color is a different lethal barrier.
Psychic Scream|Ten creatures take 14d6 psychic and are stunned; heads may burst.
Ravenous Void|Sphere of hungry gravity that pulls in and annihilates everything.
Shapechange|Become any creature of your level's CR or lower, swapping at will.
Storm of Vengeance|Miles-wide storm - thunder, acid rain, lightning, hail, and gale winds.
Time Ravage|Age a creature to death's doorstep; 10d12 necrotic (Con half).
Time Stop|Take 1d4+1 turns in a row while time stands still.
True Polymorph|Permanently transform a creature or object into anything else.
True Resurrection|Restore any creature dead up to 200 years - no body required.
Weird|Phantasmal horrors frighten all in 30 ft; 4d10 psychic each turn (Wis save).
Wish|The mightiest spell - duplicate any 8th-level spell, or rewrite reality.`;
SPELL_DESC_RAW.split('\n').forEach(line=>{
  const i=line.indexOf('|');
  const e=SPELL_DB[line.slice(0,i).toLowerCase()];
  if(e) e.d=line.slice(i+1);
});


