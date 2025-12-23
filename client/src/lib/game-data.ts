// Complete Blood on the Clocktower character data
export interface Character {
  id: string;
  name: string;
  edition: 'tb' | 'snv' | 'bmr' | 'experimental' | 'traveler';
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler';
  ability: string;
  firstNightOrder: number | null;  // null = doesn't wake
  otherNightOrder: number | null;
  setup: boolean;  // affects game setup (Baron, Godfather, etc.)
  reminders: string[];
  // Extended info
  flavorQuote: string;
  extendedSummary: string;  // Detailed rules explanation
  tipsAndTricks: string[];  // Array of tips for playing this role
  bluffingAs?: string[];    // For good characters - tips for evil players bluffing as this role
  fightingThe?: string[];   // For evil characters - tips for good players fighting this role
}

export interface Jinx {
  character1: string;
  character2: string;
  reason: string;
}

// ===================
// TROUBLE BREWING
// ===================

export const TROUBLE_BREWING: Character[] = [
  // TOWNSFOLK
  {
    id: 'washerwoman',
    name: 'Washerwoman',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
    firstNightOrder: 32,
    otherNightOrder: null,
    setup: false,
    reminders: ['Townsfolk', 'Wrong'],
    flavorQuote: "Bloodstains on a dinner jacket? No, this is cooking sherry. How careless.",
    extendedSummary: `The Washerwoman learns that a specific Townsfolk is in play, but not exactly who is playing them.

During the first night, the Washerwoman is woken, shown two players, and learns the character of one of them. They learn this only once and then learn nothing more.

You know that of the two players you are shown, one must be the Townsfolk you are shown. Importantly, this means that you know that the person you see is not the Drunk.`,
    tipsAndTricks: [
      "The Washerwoman is deceptively powerful. Even though you don't gain information on the evil players, you can confirm the identity of a good player. This player should be your focus for the game.",
      "When the Washerwoman is poisoned or is actually the Drunk, they will often get information that is easy to figure out is incorrect. If both players the Storyteller pointed at tell you they're a different character, you are likely the Drunk or poisoned.",
      "To find out which of the two players is the Townsfolk, either ask the group publicly or have a private conversation with each player individually. It is usually best to reveal what you know before the Townsfolk in question says who they are so they trust you more.",
      "Waiting until the final day to share your information can be very useful. If you can keep the Townsfolk that you know alive until the final day, then you know one player who is not the Demon!",
      "Talk to the Townsfolk player that you know, and secretly let them know that you know who they are. This way, you can form an alliance and defend each other.",
      "Beware of the Spy! They may register as a Townsfolk character to you. That player who you think is the Investigator may not be the Investigator after all.",
      "You can claim to be a more powerful character than you actually are. You start with all the information you're going to get, so if the Demon kills you, they aren't killing the Slayer or the Fortune Teller."
    ],
    bluffingAs: [
      "You would have received your information on night one, and so should have it from that point onward. You will have been shown two players and one Townsfolk token.",
      "Claim to be the Washerwoman and point to at least one evil player. Then, name a Townsfolk character (preferably one not in play). If that evil player is clever, they may claim to be that Townsfolk, making you both look good.",
      "If a good player claims to be a particular Townsfolk, you can claim to be the Washerwoman and confirm them. This helps them trust you, allowing you to lead them astray.",
      "The Washerwoman can be a difficult bluff because sometimes the Townsfolk you say is in play, isn't. If this happens, claim to be the Drunk or poisoned.",
      "If you are the Spy or have access to a Spy, they can be invaluable in providing accurate information to back up your story."
    ]
  },
  {
    id: 'librarian',
    name: 'Librarian',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)',
    firstNightOrder: 33,
    otherNightOrder: null,
    setup: false,
    reminders: ['Outsider', 'Wrong'],
    flavorQuote: "Shhhh! This is a library, not a chatroom. Technically, it's a crypt. But it's my crypt, and I'll organise it however I please.",
    extendedSummary: `The Librarian learns that a specific Outsider is in play, but not exactly who is playing them.

During the first night, the Librarian is woken, shown two players, and learns the character of one of them. They learn this only once and then learn nothing more.

However, a Librarian may learn that zero Outsiders are in play. This information can be extremely useful - it tells you that there is no Drunk (who thinks they are a Townsfolk), and no other Outsiders either.`,
    tipsAndTricks: [
      "If you learn a 'zero', it is a strong indicator that there are no Outsiders at all. Share this with the group, because any player claiming to be an Outsider is probably lying.",
      "If you learn that a particular Outsider is in play, find out which player that is. Either ask the group if there are any Outsiders, or ask the two players privately. Use this information to build trust - they will know you are good.",
      "Finding the Drunk is very helpful. Once you find which player is the Drunk, you know that they have been getting false information or their ability doesn't work. This can also help confirm which Townsfolk is NOT the Drunk.",
      "If you get a reading on one of your neighbors, you can share your information earlier. Even if evil knows who you are, the Demon will often prefer to attack players with more powerful abilities.",
      "The Spy may register as an Outsider to you. If you learn that one of two players is a particular Outsider and they both deny it, one of them might be the Spy.",
      "After the first night, you have all the information you're going to get. If you want to, you can bluff as a more powerful character to draw the Demon's attention away from characters with ongoing abilities."
    ],
    bluffingAs: [
      "You would have received your information on night one, and so should have it from that point onward. You will have been shown two players and one Outsider token, OR you will have been told 'zero'.",
      "A 'zero' claim can be very powerful for the evil team. If there are no Outsiders, any player claiming to be one seems suspicious. You can use this to throw suspicion on good players who come out as Outsiders.",
      "Alternatively, claim that a particular Outsider is in play and point to an evil player as being that Outsider. This can help legitimize their claim and make them seem trustworthy.",
      "If the Drunk is in play, you could help find out which player is drunk by claiming to know who the Drunk is, making them distrust their own information."
    ]
  },
  {
    id: 'investigator',
    name: 'Investigator',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'You start knowing that 1 of 2 players is a particular Minion.',
    firstNightOrder: 34,
    otherNightOrder: null,
    setup: false,
    reminders: ['Minion', 'Wrong'],
    flavorQuote: "It was Professor Plum, in the conservatory, with the lead pipe.",
    extendedSummary: `The Investigator learns that a specific Minion is in play, but not exactly who is playing them.

During the first night, the Investigator is woken, shown two players, and learns the character of one of them. They learn this only once and then learn nothing more.

One of the two players shown is the Minion you learn about. The other player could be anyone - Townsfolk, Outsider, or even another Minion. It's never the Demon.`,
    tipsAndTricks: [
      "Your information directly narrows down the location of an evil player. This is extremely powerful - one of the two players you were shown IS a Minion.",
      "You can safely tell one of the two players your information. You know that at least one of them is evil, but if you talk to both, you'll get different reactions that might help you figure out which is which.",
      "If one of your two players is executed and dies, and the game continues, you know they were either not evil or were a Minion. Either way, pay close attention to the other player.",
      "Knowing which Minion is in play can be very helpful. A Poisoner means someone's information might be wrong. A Spy means your information might have shown the Spy. A Baron means extra Outsiders. A Scarlet Woman means the Demon has a backup.",
      "Beware of the Spy and the Recluse! The Spy may register as a Townsfolk or Outsider to you, and the Recluse may register as the Minion.",
      "Since you have all your information after night one, you can bluff as a more powerful character to attract the Demon's attention away from active information roles."
    ],
    bluffingAs: [
      "You would have received your information on night one. You will have been shown two players and one Minion token.",
      "Claim that one of two players is a Minion and include an evil player as one of your two. If they are clever, they may claim to be a Townsfolk that 'clears' them, making you both look good.",
      "If you want to frame a good player, claim they are one of the two players you saw. The good team will be suspicious of them.",
      "Claiming to see a Minion that isn't actually in play will eventually cause problems if the real Minion is discovered. However, it can confuse the good team about what Minions are in play."
    ]
  },
  {
    id: 'chef',
    name: 'Chef',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'You start knowing how many pairs of evil players there are.',
    firstNightOrder: 35,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I've got a very delicate palate. I can tell when something is off.",
    extendedSummary: `The Chef knows how many evil players are sitting next to each other.

On the first night, the Chef learns a number. This is the number of pairs of adjacent evil players. A pair is two evil players sitting immediately next to each other in the circle.

For example: If the Imp is sitting next to the Poisoner, that is 1 pair. If all evil players are spread out with good players between them, that is 0 pairs. If the Imp, Baron, and Scarlet Woman are all sitting in a row, that is 2 pairs (Imp-Baron and Baron-Scarlet Woman).`,
    tipsAndTricks: [
      "A '0' means that all evil players are spread out around the circle with at least one good player between each of them. This is very useful information.",
      "A '1' or '2' means evil players are clustered together somewhere. Work with the Empath or other information roles to narrow down where that cluster might be.",
      "Combine your information with the Empath's - if the Empath is getting evil neighbors and you know evil is clustered, you can triangulate the location of the evil team.",
      "If you get a high number (2 or more), evil players are sitting in a group. Look for players who seem to be coordinating or defending each other.",
      "Remember that your number only tells you about seating, not identity. A '1' could mean any two evil players are adjacent.",
      "Beware of the Recluse! They might register as evil and be counted as part of a pair, throwing off your number."
    ],
    bluffingAs: [
      "You would have received your information on night one - just a single number representing evil pairs.",
      "Claiming '0' is often safest, as it gives little concrete information for the good team to work with while still sounding believable.",
      "If you know where evil players are sitting, claim a number that matches the actual seating to look legitimate.",
      "Claiming a high number when evil is actually spread out can cause the good team to waste time looking for a 'cluster' that doesn't exist."
    ]
  },
  {
    id: 'empath',
    name: 'Empath',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'Each night, you learn how many of your 2 alive neighbours are evil.',
    firstNightOrder: 36,
    otherNightOrder: 53,
    setup: false,
    reminders: [],
    flavorQuote: "I feel your pain. All of it.",
    extendedSummary: `The Empath keeps learning how many of their living neighbors are evil.

Each night, including the first, the Empath wakes to learn how many of their two alive neighbors are evil. Dead players are not counted - your neighbors are the closest alive players on either side of you.

As players die, your neighbors change. This means your information updates each night, which can help you deduce who is evil as the seating shifts.`,
    tipsAndTricks: [
      "A '0' means both your neighbors are good (or at least registering as good). This is powerful information - you can work closely with your neighbors.",
      "A '1' means one neighbor is evil. Work with the other neighbor to figure out which one it is.",
      "Track your number every night. When a neighbor dies and your number changes, that gives you information about whether they were evil.",
      "If a neighbor dies and your number goes down, they were probably evil. If it stays the same or goes up, look at your new neighbor.",
      "Share your information with your neighbors. If you're getting '0', they can trust you and each other. If you're getting '1' or '2', work together to figure out who is lying.",
      "Beware of the Recluse! They may register as evil to you, making your counts unreliable if they're your neighbor.",
      "The Spy may register as good, so a neighbor who appears innocent via your ability could still be evil."
    ],
    bluffingAs: [
      "You wake every night and get a number (0, 1, or 2) based on your living neighbors.",
      "This is one of the harder bluffs because your numbers must remain consistent as players die. Track who is alive on either side of you carefully.",
      "Claiming '0' early can build trust with your neighbors, but be prepared to explain if the numbers need to change.",
      "Claiming '1' and pointing suspicion at a good neighbor is effective but risky - if they're confirmed good, you look evil."
    ]
  },
  {
    id: 'fortuneteller',
    name: 'Fortune Teller',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.',
    firstNightOrder: 37,
    otherNightOrder: 54,
    setup: false,
    reminders: ['Red Herring'],
    flavorQuote: "I see a strangled man with blood on his chin. He is wearing a... No. Wait. A woman! It's a woman! And she is screaming.",
    extendedSummary: `The Fortune Teller detects who the Demon is, but sometimes their information is wrong.

Each night, the Fortune Teller chooses two players and learns if either of them is the Demon. However, one good player (the "Red Herring") is selected by the Storyteller at the start of the game. This player always registers as a Demon to the Fortune Teller.

If the Fortune Teller chooses the Demon or the Red Herring, they get a "Yes". If they choose neither, they get a "No". The challenge is figuring out which "Yes" readings are real Demons and which are the Red Herring.`,
    tipsAndTricks: [
      "Process of elimination is your friend. By choosing different pairs each night, you can eventually narrow down who the Demon might be - and who the Red Herring is.",
      "A 'Yes' result could mean you found the Demon OR the Red Herring. Multiple 'Yes' results on the same player across different pairings makes that player more likely to be the Demon.",
      "If you get a 'No', both players you chose are innocent (unless you're drunk or poisoned). This is useful information too.",
      "Share your results with trusted players, but be aware that revealing publicly makes it easy for evil to claim they're the Red Herring.",
      "Coordinate with other information roles. If an Empath says their neighbor is good but you got a 'Yes' on them, one of you might be wrong or they could be the Red Herring.",
      "The Recluse might register as the Demon to you, but this is fairly rare. The Red Herring is much more likely."
    ],
    bluffingAs: [
      "You wake each night and choose two players. You point at them and the Storyteller nods (Yes) or shakes their head (No).",
      "Claiming 'Yes' on players you want executed is a classic evil strategy. Be prepared to explain if they turn out to be innocent.",
      "The Red Herring provides a convenient excuse - if someone you accused turns out to be good, claim they were your Red Herring.",
      "Be consistent with your claimed results. Keep track of who you claim to have checked each night.",
      "If you're exposed as lying, claim you were drunk or poisoned on certain nights."
    ]
  },
  {
    id: 'undertaker',
    name: 'Undertaker',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'Each night*, you learn which character died by execution today.',
    firstNightOrder: null,
    otherNightOrder: 55,
    setup: false,
    reminders: ['Executed'],
    flavorQuote: "Toe-tags and cold slabs. That's the life.",
    extendedSummary: `The Undertaker learns which characters were executed.

Each night except the first, you learn the character of the player who was executed during the day. If no one was executed, you learn nothing that night.

You learn the actual character, not what the player claimed to be. This is powerful for catching liars - if someone claimed to be the Empath but you learn they were the Poisoner, you've confirmed an evil player.`,
    tipsAndTricks: [
      "Your information is extremely reliable when you're not drunk or poisoned. It tells you exactly who the executed player really was.",
      "If the executed player was lying about their character, you'll know. This is very useful for confirming or denying claims.",
      "Share your information with the group. If someone claimed to be the Monk but you learn they were actually the Baron, the town knows that player was evil.",
      "Coordinate with the town on who to execute. You can help verify executions, so executing suspicious players gives you valuable information.",
      "If your information doesn't match what the executed player claimed, they were either lying OR you are drunk/poisoned. Consider both possibilities.",
      "The Spy and Recluse can throw off your information - the Spy might register as a Townsfolk, and the Recluse might register as a Minion or Demon."
    ],
    bluffingAs: [
      "You wake each night after the first and are shown the character token of the executed player.",
      "Claiming the executed player was a different character than they claimed can create confusion and distrust.",
      "Confirming that an executed evil player was actually the Townsfolk they claimed helps protect remaining evil players.",
      "This is a harder bluff to maintain because your claims can be checked against what dead players said. Keep your story consistent."
    ]
  },
  {
    id: 'monk',
    name: 'Monk',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.',
    firstNightOrder: null,
    otherNightOrder: 12,
    setup: false,
    reminders: ['Protected'],
    flavorQuote: "'Twas a prayer of St Benedict that kept the beast at bay.",
    extendedSummary: `The Monk protects other players from the Demon.

Each night except the first, you choose a player other than yourself. That player cannot be killed by the Demon tonight. If the Demon tries to kill them, nothing happens - no one dies instead.

You cannot protect yourself. You must always choose another player. Your protection only works if you are alive and sober.`,
    tipsAndTricks: [
      "Protect players who have important ongoing abilities - the Empath, Fortune Teller, or Undertaker are great choices.",
      "Don't reveal who you are too early. If evil knows you're the Monk, they know who NOT to attack, or they might try to get you executed.",
      "Vary your protection targets. If you always protect the same player, the Demon will just attack someone else.",
      "If no one dies at night, it could be you! But it could also be a Soldier, or the Demon chose not to kill. Don't assume.",
      "Consider secretly telling one player that you're protecting them. This builds trust and they can vouch for you.",
      "Sometimes protecting a suspicious player can help clear them. If they were going to be killed but survived, the Demon isn't interested in them."
    ],
    bluffingAs: [
      "You wake each night (after the first) and point at a player to protect.",
      "If there's a night with no deaths, claim you protected whoever would have been the obvious target.",
      "This is a good bluff for a Poisoner - claim to have protected players while you're actually poisoning them.",
      "Claiming Monk can explain why certain players didn't die, covering for the Demon's actual target choices."
    ]
  },
  {
    id: 'ravenkeeper',
    name: 'Ravenkeeper',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'If you die at night, you are woken to choose a player: you learn their character.',
    firstNightOrder: null,
    otherNightOrder: 52,
    setup: false,
    reminders: [],
    flavorQuote: "My birds will find the truth, no matter where it hides.",
    extendedSummary: `The Ravenkeeper learns a player's character when they die at night.

If you are killed at night (by the Demon or any other means), you immediately wake up and choose any player. The Storyteller shows you that player's character token. You learn exactly what character they are.

This only triggers if you die at night. If you are executed during the day, you don't get to use your ability.`,
    tipsAndTricks: [
      "Choose someone you're most suspicious of, or someone whose information you want to verify.",
      "You can choose yourself to confirm your death was real (useful in games with the Zombuul or if you suspect shenanigans).",
      "Consider checking someone who claims to be a powerful Townsfolk. If they're telling the truth, you've confirmed an ally. If not, you've caught a liar.",
      "You can also use your ability to confirm a player you trust, giving the town someone to rally around after you're gone.",
      "The Demon will often avoid killing you if they know you're the Ravenkeeper. You can bluff as something else to get killed.",
      "Remember that the Spy might register as a Townsfolk and the Recluse might register as a Minion or Demon to your ability."
    ],
    bluffingAs: [
      "If you die at night, claim to have 'activated' as the Ravenkeeper and share fake information.",
      "You can claim you checked a player and learned they were the Demon or a Minion - very powerful for framing good players.",
      "Alternatively, confirm an evil player as the good character they claim to be, making them look more trustworthy.",
      "This bluff only works after you die, so plan ahead for what information you'll share."
    ]
  },
  {
    id: 'virgin',
    name: 'Virgin',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['No Ability'],
    flavorQuote: "I am pure. I have never sinned.",
    extendedSummary: `The Virgin may accidentally execute their accuser.

The first time you are nominated, if the player who nominated you is a Townsfolk, they die immediately. The nomination process ends, and no one else can be nominated that day.

If the nominator is an Outsider, Minion, or Demon, nothing happens. You lose your ability (it was used up) but no one dies. This makes the Virgin a test - if someone nominates the Virgin and nothing happens, they are not a Townsfolk.`,
    tipsAndTricks: [
      "Publicly reveal that you are the Virgin early. This way, Townsfolk know not to nominate you, and evil players might reveal themselves by nominating you.",
      "If someone nominates you and nothing happens, they are NOT a Townsfolk. They must be an Outsider, Minion, or Demon.",
      "Ask evil-looking players to nominate you. If they refuse, they might be worried about dying. If they do nominate you and nothing happens, you've confirmed they're not Townsfolk.",
      "Be careful - if a Townsfolk nominates you and dies, that's bad for the good team! Make sure people know you're the Virgin before nominations start.",
      "The Spy can nominate you and trigger your ability (because they can register as Townsfolk). This is the only way evil can accidentally die to your ability."
    ],
    bluffingAs: [
      "This is a very dangerous bluff! If the real Virgin exists and someone nominates you, your bluff is exposed.",
      "Only claim Virgin if you're confident the real Virgin isn't in the game or won't come forward.",
      "If you claim Virgin and are nominated, something needs to happen. Either a Minion dies (if you're the Spy and they're Townsfolk) or nothing happens and you're exposed as not actually being the Virgin.",
      "A good counter-bluff if exposed: claim you were the Drunk all along and thought you were the Virgin."
    ]
  },
  {
    id: 'slayer',
    name: 'Slayer',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['No Ability'],
    flavorQuote: "Die, foul beast!",
    extendedSummary: `The Slayer can kill the Demon with a single shot.

Once per game, during the day, you can publicly declare that you are the Slayer and point at a player. If that player is the Demon, they die immediately and good wins.

If the player is not the Demon, nothing visible happens. You cannot try again - your ability is used up whether you hit or miss.`,
    tipsAndTricks: [
      "Save your shot until you have good information. Missing doesn't prove the target is innocent - you could be drunk or poisoned.",
      "Coordinate with information roles before using your ability. The Fortune Teller or Investigator might have leads.",
      "Remember that a miss doesn't clear the target! You could have been drunk, poisoned, or they could be a Minion rather than the Demon.",
      "Publicly announce that you're the Slayer to get protection and advice from the town, but this also tips off the Demon.",
      "Consider slaying early if you have strong information. The Demon might try to kill you before you can use your ability.",
      "The Recluse might die to your ability (registering as the Demon). Be aware of this possibility."
    ],
    bluffingAs: [
      "Claim to be the Slayer and 'use' your ability on a player you want to seem innocent.",
      "When nothing happens (because they're not the Demon or you're not really the Slayer), this can clear an evil player.",
      "Alternatively, claim you used your ability and missed, explaining why you no longer have it.",
      "Good players also bluff as Slayer to waste Demon attacks, so this is a relatively believable claim."
    ]
  },
  {
    id: 'soldier',
    name: 'Soldier',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'You are safe from the Demon.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "As long as I have my faith, I am invincible.",
    extendedSummary: `The Soldier cannot be killed by the Demon.

You are completely immune to the Demon's kill ability. If the Demon chooses you at night, nothing happens - you don't die, and the Demon doesn't learn why their kill failed.

You can still die by execution or by other means (like the Gunslinger or a Gossip). Your protection is only against the Demon's attack.`,
    tipsAndTricks: [
      "Be careful about claiming Soldier too publicly. If evil knows who you are, they won't waste attacks on you - but they might push for your execution.",
      "Surviving a night attack doesn't prove you're the Soldier. It could be a Monk protecting you, or the Demon chose someone else.",
      "Consider bluffing as a more tempting target to waste Demon attacks. If you claim Fortune Teller, the Demon might try to kill you.",
      "Work with the Monk if you find them. They don't need to protect you, freeing them to protect other important players.",
      "If you're fairly certain you're the only reason for no death (no Monk, you didn't die), you might be able to claim and be trusted.",
      "Watch for players who are pushing hard to execute you - the evil team knows you can't be killed at night."
    ],
    bluffingAs: [
      "The Soldier is a good safe bluff because you never have to produce information.",
      "If you survive a night when you 'should have' died, claim Soldier to explain it.",
      "Evil players bluffing as Soldier can survive to the end game, since the 'Demon' won't be attacking them.",
      "Be prepared for skepticism - anyone can claim Soldier because the ability has no visible effect."
    ]
  },
  {
    id: 'mayor',
    name: 'Mayor',
    edition: 'tb',
    team: 'townsfolk',
    ability: 'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Let me be frank with you... I'm the Mayor.",
    extendedSummary: `The Mayor can win by peaceful means, or redirect death onto others.

If exactly three players are alive (including you) and no execution occurs that day, the good team wins immediately. This gives good an alternate win condition.

Additionally, if you are attacked by the Demon at night, the Storyteller may choose to kill a different player instead. This is not guaranteed but can happen.`,
    tipsAndTricks: [
      "On the final day with 3 players, push for no execution. If you can convince the town not to execute, good wins!",
      "The Demon knows a Mayor win is possible, so they'll want you dead. Stay hidden until you need to reveal.",
      "Your death-redirect ability is unreliable - it might save you, or it might not. Don't count on it.",
      "Come out as Mayor when it matters most - usually on the final day when your win condition is relevant.",
      "Coordinate with trusted players before the final day. They need to believe you're the Mayor and not execute.",
      "Beware of Minions who will try to get you executed before the final day. The Scarlet Woman especially wants you dead."
    ],
    bluffingAs: [
      "Claiming Mayor is extremely risky for evil. If it gets to 3 players and the town doesn't execute, evil wins anyway if you're really evil.",
      "As the Demon, claiming Mayor can prevent executions on the final day - the town might spare you hoping for a Mayor victory.",
      "If you claim Mayor and good doesn't execute at 3 players, evil wins because the real Mayor (if any) isn't in play.",
      "This bluff works best when there's no real Mayor - but you won't know for sure."
    ]
  },
  
  // OUTSIDERS
  {
    id: 'butler',
    name: 'Butler',
    edition: 'tb',
    team: 'outsider',
    ability: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.',
    firstNightOrder: 38,
    otherNightOrder: 56,
    setup: false,
    reminders: ['Master'],
    flavorQuote: "Yes, sir... No, sir... Certainly, sir.",
    extendedSummary: `The Butler may only vote when their Master votes.

Each night, you choose a player to be your Master. The next day, you may only raise your hand to vote if your Master also has their hand raised (or their vote has already been counted).

If your Master puts their hand down, you must put yours down too. You are responsible for managing this yourself - the Storyteller won't stop you from voting illegally. You can nominate freely; only voting is restricted.`,
    tipsAndTricks: [
      "Choose a Master you believe is good. If your Master is evil, you'll only be voting when it helps evil.",
      "Tell your Master that you've selected them. They might coordinate with you on votes, and their behavior can help you determine if they're trustworthy.",
      "You don't HAVE to vote just because your Master votes. Remember to only vote for players you believe are evil.",
      "Choosing a dead player as Master means you can only vote when they use their dead vote - which might be never or very rarely.",
      "If people are suspicious of you, offer to make them your Master tomorrow. This builds trust.",
      "Remember that exiles (voting on Travellers) are not affected by your ability - you can vote freely on those."
    ],
    bluffingAs: [
      "You wake each night (including night one) and choose a Master. The next day you can only vote if they are voting.",
      "The Butler is a great bluff because nobody can prove you're NOT the Butler - you just claim you can't vote unless your 'Master' votes.",
      "You can 'choose' a fellow evil player as Master, giving you an excuse to talk to them privately.",
      "Claim you switched Masters secretly if you need to vote against your stated Master's wishes.",
      "This bluff explains odd voting patterns - you can't vote because your Master isn't voting!"
    ]
  },
  {
    id: 'drunk',
    name: 'Drunk',
    edition: 'tb',
    team: 'outsider',
    ability: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: true,
    reminders: [],
    flavorQuote: "I'm only a *hic* social drinker, my dear. Admittedly, I am a heavy *burp* socializer.",
    extendedSummary: `The Drunk player thinks they are a Townsfolk, but they are not.

During setup, the Drunk token is replaced with a Townsfolk token. The player who draws that token is secretly the Drunk - they don't know this. The Storyteller knows.

The Drunk has no ability. When their 'Townsfolk' ability would work, it doesn't. If it gives information, the Storyteller can give false information. The Drunk registers as an Outsider, not as the Townsfolk they think they are.`,
    tipsAndTricks: [
      "You won't know you're the Drunk - you'll start with a Townsfolk token. Your only clue is that your information or ability doesn't work correctly.",
      "If your information seems obviously wrong or your ability fails when it shouldn't, you might be the Drunk.",
      "The town should work together to figure out who the Drunk is. If one person's information is consistently wrong, they're likely the Drunk.",
      "Drunk information is unreliable, not necessarily wrong. Sometimes the Storyteller tells you truth to avoid exposing you.",
      "Characters like the Slayer or Monk won't work at all if they're the Drunk. A Soldier will die to the Demon.",
      "The Librarian, Undertaker, and Ravenkeeper can all learn if a player is the Drunk (they see Drunk, not the Townsfolk)."
    ],
    bluffingAs: [
      "You can't directly claim to BE the Drunk - you wouldn't know you are one!",
      "Instead, bluff as a Townsfolk, give false information, then later 'realize' you might be the Drunk when your info is proven wrong.",
      "Claiming to be a Drunk Empath or Drunk Fortune Teller explains why your information was false - and gives you cover for lying.",
      "Insinuating a Drunk is in play makes good players distrust their own information.",
      "If a good player has damning information about your team, suggest they might be the Drunk."
    ]
  },
  {
    id: 'recluse',
    name: 'Recluse',
    edition: 'tb',
    team: 'outsider',
    ability: 'You might register as evil & as a Minion or Demon, even if dead.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Garn git ya darn grub ya mitts ofma lorn yasee. Grr. Natsy pikkins yonder southwise ye begittin afta ya! Git!",
    extendedSummary: `The Recluse might appear to be evil, but is actually good.

Whenever your alignment or character type would be detected by an ability, the Storyteller may choose to have you register as evil, or as a Minion or Demon. This applies even when you're dead.

A Recluse that registers as a Minion or Demon doesn't gain that character's ability - they just register that way. The Storyteller decides each time, and may give different results to different characters.`,
    tipsAndTricks: [
      "Tell everyone you're the Recluse as soon as possible! This helps explain why information roles might see you as evil.",
      "You will usually register as evil. Be suspicious of anyone who claims you appear good - they might be lying.",
      "Your existence can throw off the Chef, Empath, Investigator, and other information roles. Help them understand their info might include you.",
      "Don't get Slayed! The Slayer will probably kill you if they target you. This makes you look like the Demon.",
      "Being the Recluse is hard - you look evil but you're good. Accept that you might be executed, and try to prove your worth before then.",
      "If you're alive on the final day, you're a problem - everyone suspects you. Consider letting yourself be executed before then."
    ],
    bluffingAs: [
      "You never wake, learn anything, or act during the day.",
      "The Recluse is an excellent evil bluff! 'I'm not evil, I just register that way' explains why information roles think you're evil.",
      "This is especially good for the Spy - you're evil but might appear as Recluse to certain abilities.",
      "Claiming Recluse early and being 'helpful' can make you look like a confirmed Outsider.",
      "As the Recluse, you can claim your existence explains the Chef's high number or the Empath's evil neighbor."
    ]
  },
  {
    id: 'saint',
    name: 'Saint',
    edition: 'tb',
    team: 'outsider',
    ability: 'If you die by execution, your team loses.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Wisdom begets peace. Patience begets wisdom. Fear not, for the time shall come when fear too shall pass.",
    extendedSummary: `The Saint ends the game if they are executed.

If you die by execution, the game ends immediately. Good loses and evil wins.

If you die by any other means - the Demon killing you at night, for example - the game continues normally. Only execution triggers your ability. Note: if you're the Drunk and get executed, good still loses because you're actually the Drunk with this ability.`,
    tipsAndTricks: [
      "Do NOT get executed. This is your entire purpose. Make sure the good team knows you are the Saint!",
      "Come out publicly as the Saint as early as possible. Shout it from the rooftops if you have to.",
      "Find allies who can vouch for you. Get the Empath to confirm you're good, or the Fortune Teller to verify you're not the Demon.",
      "Evil will try to make you look like the Demon. Watch for players framing you with false information.",
      "If you're getting nominated and might be executed, beg, plead, and argue - your team loses if you die.",
      "Alternatively, stay quiet and bluff as a juicy Demon target. If you die at night, your ability doesn't trigger."
    ],
    bluffingAs: [
      "You never wake, learn anything, or act during the day - until you're executed, when the game ends.",
      "The Saint is one of the best evil bluffs in the game. The town will be terrified to execute you, even with evidence against you.",
      "Saint is excellent for the Poisoner - even with information pointing at you, they might not execute before the final day.",
      "Be prepared for Slayers! They can test you without triggering the Saint's ability.",
      "If you're executed and the game DOESN'T end, you need a backup bluff fast. Claim you were the Drunk all along.",
      "Two people claiming Saint creates a huge dilemma for good - they can't safely execute either one."
    ]
  },

  // MINIONS
  {
    id: 'poisoner',
    name: 'Poisoner',
    edition: 'tb',
    team: 'minion',
    ability: 'Each night, choose a player: they are poisoned tonight and tomorrow day.',
    firstNightOrder: 17,
    otherNightOrder: 7,
    setup: false,
    reminders: ['Poisoned'],
    flavorQuote: "Add compound Alpha to compound Beta... NOT TOO MUCH!",
    extendedSummary: `The Poisoner secretly disrupts character abilities.

Each night, you choose a player to poison. They are poisoned for that night and the entire next day, until dusk.

A poisoned player has no ability - it doesn't work. However, the Storyteller pretends it does. If they wake at night, they still wake. If they get information, the Storyteller may give false information. The poisoned player has no idea they're poisoned.`,
    tipsAndTricks: [
      "Target information roles for maximum chaos. A poisoned Fortune Teller or Empath will get wrong info and mislead the town.",
      "Coordinate with your Demon so you're not targeting the same players. Unless they're protected by a Monk - then poisoning them lets the Demon kill them!",
      "Characters like the Virgin, Slayer, or Mayor can be excellent targets - poison them when they're about to use their ability.",
      "Poisoning the Scarlet Woman when the Imp kills themselves means a different Minion (maybe you!) becomes the Imp.",
      "On night one, if you don't know who to poison, poison someone next to the Demon. A poisoned Empath neighbor is devastating.",
      "Spread your poison around. Poisoning different players makes the source of misinformation harder to identify than sticking to one target."
    ],
    fightingThe: [
      "On the first night, the Poisoner acts blindly, so first-night information is usually reliable.",
      "Information roles are prime targets. If an Empath or Fortune Teller has revealed, their info might be poisoned.",
      "Look for inconsistent patterns. If multiple players seem to have wrong information sporadically, a Poisoner is likely.",
      "Separating Poisoner effects from the Drunk is crucial. If ONLY one player has consistently wrong info, they might be the Drunk.",
      "Kill the Poisoner as soon as possible. Unlike other Minions, they cause ongoing damage every night.",
      "Remember that poisoned information is unreliable, not necessarily wrong. The Storyteller CAN give true info to a poisoned player."
    ]
  },
  {
    id: 'spy',
    name: 'Spy',
    edition: 'tb',
    team: 'minion',
    ability: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.',
    firstNightOrder: 49,
    otherNightOrder: 68,
    setup: false,
    reminders: [],
    flavorQuote: "Any brewmaster worth their liquor, knows no concoction pours trouble quicker, than one where spies seem double.",
    extendedSummary: `The Spy might appear to be a good character, but is actually evil. They also see the Grimoire.

Each night, you see the Storyteller's Grimoire, showing all characters, who is who, and all reminder tokens. You know EVERYTHING about the game state.

Additionally, you might register as good to abilities that detect alignment, and might register as a specific Townsfolk or Outsider to abilities that detect character type. The Storyteller decides each time.`,
    tipsAndTricks: [
      "You know everyone's character from night one. Use this to coordinate perfect bluffs for your evil team.",
      "Memorize who you need to: characters not in play (for bluffs), dangerous targets to avoid (Ravenkeeper, Soldier), and key info roles.",
      "You can bluff as Washerwoman, Librarian, etc. and give correct information about actual characters - making you look very trustworthy.",
      "Guide your Poisoner to poison the most dangerous characters. Guide your Demon to avoid the Soldier and Ravenkeeper.",
      "You often register as good. Use this to appear innocent to the Empath, Virgin, and other detection abilities.",
      "You can trigger the Virgin's ability (registering as Townsfolk). Getting 'killed' by the Virgin makes you look very trustworthy - use this to spread misinformation.",
      "The Undertaker and Ravenkeeper might see you as a Townsfolk. Use this if you're executed or killed."
    ],
    fightingThe: [
      "The Spy knows everything, so evil bluffs will be unusually accurate. Be wary of players with too much correct information.",
      "The Spy can appear as good in information. Double-check results that clear specific players.",
      "If someone seems to know too much about who is what character, they might be the Spy.",
      "The Spy can nominate the Virgin and die (appearing as Townsfolk). A 'confirmed' player who later seems evil might have been the Spy.",
      "Coordinate with your team privately. The Spy sees the Grimoire, not your whispered conversations.",
      "The Spy will guide evil targeting. If your Monk's protected player survives while other key roles die, the Spy might be directing the kills."
    ]
  },
  {
    id: 'scarletwoman',
    name: 'Scarlet Woman',
    edition: 'tb',
    team: 'minion',
    ability: "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)",
    firstNightOrder: null,
    otherNightOrder: 19,
    setup: false,
    reminders: ['Demon'],
    flavorQuote: "You have shown me the secrets of the Council of the Purple Flame. We have lain together in fire and in lust and in beastly commune, and I am forever your servant. But tonight, my dear, I am your master.",
    extendedSummary: `The Scarlet Woman becomes the Demon when the Demon dies.

If there are five or more players just before the Demon dies—that is, four or more players left alive after the Demon dies—then the Scarlet Woman immediately becomes the Demon, and the game continues as if nothing happened.

Travellers do not count as players when seeing if the Scarlet Woman's ability triggers.

If less than five players are alive when the Demon is executed, then the game ends and good wins.

If five or more players are alive when the Imp kills themself at night, the Scarlet Woman must become the new Imp.

If the Scarlet Woman becomes the Demon, they are that Demon in every way. Good wins if they are executed. They attack each night. They register as the Demon.`,
    tipsAndTricks: [
      "Stay alive! You are the backup plan. Play conservatively and don't draw too much attention to yourself early.",
      "Coordinate bluffs with your Demon to confirm each other. For example, claim to be the Washerwoman and 'confirm' the Demon's character claim.",
      "If the Imp is in danger, they can kill themselves at night to pass the Demonhood to you, making you look innocent.",
      "You don't register as a Demon, so characters like the Fortune Teller won't detect you. Use this to get 'confirmed' as good.",
      "Be bold about targeting your own Demon to make yourself look good - you can afford to because you're the backup plan."
    ],
    fightingThe: [
      "When the Scarlet Woman is in play, the Demon can be executed and the game continues. If you definitely killed the Imp but the game continues, suspect a Scarlet Woman.",
      "If the Imp kills themselves at night, the Demonhood must pass to the Scarlet Woman first before other Minions. Use this to narrow down where the new Demon is.",
      "The Scarlet Woman does not register as a Demon. The Fortune Teller won't detect them, and the Slayer won't kill them. Be wary of players overeager to be checked.",
      "If you know a Scarlet Woman is in play, leaving them alive can be strategic. On the final day with 3 players, you only need to decide: did the Demon pass to the Scarlet Woman or not?",
      "Unlike other Minions, the Scarlet Woman may deliberately try to get their Demon killed to look better. Watch for sudden allegiance changes when it drops below 5 players."
    ]
  },
  {
    id: 'baron',
    name: 'Baron',
    edition: 'tb',
    team: 'minion',
    ability: 'There are extra Outsiders in play. [+2 Outsiders]',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: true,
    reminders: [],
    flavorQuote: "This town has gone to the dogs, what? Cheap foreign labor... that's the ticket. Stuff them in the mine, I say.",
    extendedSummary: `The Baron changes the number of Outsiders present in the game.

During setup, two Townsfolk tokens are removed and two Outsider tokens are added. This happens before anyone draws their character.

The Baron has no active ability during the game. Your job is to survive, bluff, mislead, and help your Demon win. The extra Outsiders do your work for you by weakening the Townsfolk majority.`,
    tipsAndTricks: [
      "Your ability is done before the game starts. You're free to bluff, mislead, and cause chaos without worrying about an active power.",
      "Claim to be an Outsider! The extra Outsiders make this believable. If you and the real Outsiders all claim, the town doesn't know who's lying.",
      "Double up with an in-play Townsfolk to make them look suspicious. If you both claim Fortune Teller, the town distrusts both of you.",
      "Claiming Baron is in play (even when it isn't) makes the town think there's a Drunk, distrusting their own information.",
      "Be bold! You have nothing to lose. Get the Virgin to nominate you, get yourself executed - as long as the Demon survives, you're doing your job.",
      "The Imp can pass Demonhood to you if needed. Don't completely neglect your survival."
    ],
    fightingThe: [
      "Count the Outsider claims! If more Outsiders claim than should exist (even with Baron), someone is lying.",
      "The Baron effect is obvious - you'll notice extra Outsiders quickly. This tells you there's likely no Poisoner, Spy, or Scarlet Woman.",
      "If you believe a Baron is in play and trust all Outsider claims, know that 2 fewer Townsfolk exist than normal.",
      "The Librarian, Investigator, Ravenkeeper, and Undertaker can all help identify who the actual Outsiders are.",
      "Barons tend to be aggressive bluffers since their ability is passive. Look for players causing chaos.",
      "Remember: the Imp can starpass to the Baron. Don't ignore them just because they seem 'passive'."
    ]
  },

  // DEMONS
  {
    id: 'imp',
    name: 'Imp',
    edition: 'tb',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.',
    firstNightOrder: null,
    otherNightOrder: 24,
    setup: false,
    reminders: ['Dead'],
    flavorQuote: "I am the needle. You are the doll.",
    extendedSummary: `The Imp kills a player each night and can pass on the Demonhood by killing themselves.

Each night except the first, the Imp chooses a player to kill. That player dies.

If the Imp kills themselves at night, a Minion becomes the Imp. The Storyteller chooses which Minion, but it's usually the Scarlet Woman if one is alive.

The Imp is the most straightforward Demon - simple but effective. The starpass ability creates interesting gameplay where the Demon can move around the circle.`,
    tipsAndTricks: [
      "Kill players who are gathering too much accurate information, like the Empath or Fortune Teller.",
      "Avoid killing the Ravenkeeper or Soldier if you can identify them - one wastes your kill, the other reveals information.",
      "Coordinate with your Minions on who to kill and who to keep alive to support their bluffs.",
      "If you're under heavy suspicion, kill yourself to pass the Demonhood to a Minion. This makes you look innocent.",
      "Consider not killing sometimes (if you have a Poisoner) to make it look like a Monk or Soldier is in play."
    ],
    fightingThe: [
      "The Imp kills every night (except the first). Track the deaths and look for patterns in who the Demon is avoiding.",
      "If a player you suspected dies at night, they were probably not the Imp. Use night kills as information.",
      "Remember the Imp can starpass - if you execute someone and the game continues with 5+ players, either you got the wrong person or a Scarlet Woman caught it.",
      "The Imp knows their Minions from the first night. Look for players who seem to be coordinating or covering for each other.",
      "Powerful characters like the Slayer or Virgin can help confirm the Demon's identity. Use them wisely."
    ]
  },
];

// ===================
// BAD MOON RISING
// ===================

export const BAD_MOON_RISING: Character[] = [
  // TOWNSFOLK
  {
    id: 'grandmother',
    name: 'Grandmother',
    edition: 'bmr',
    team: 'townsfolk',
    ability: 'You start knowing a good player & their character. If the Demon kills them, you die too.',
    firstNightOrder: 39,
    otherNightOrder: null,
    setup: false,
    reminders: ['Grandchild'],
    flavorQuote: "Take a jacket, it's cold outside. Drink some soup, grow up big and strong. Never play with the Ouija board. Always keep a flashlight by your bed. Don't go into the forest after dark, and you'll be just fine.",
    extendedSummary: `The Grandmother knows a good player, but has bound their fates together.

On the first night, you learn one good player and their character. This is your Grandchild.

If the Demon kills your Grandchild at night, you die too. If your Grandchild dies by any other means (execution, Assassin, etc.), you survive.`,
    tipsAndTricks: [
      "Your Grandchild is confirmed good! Work closely with them and share information.",
      "Revealing publicly makes your Grandchild a Demon target - be strategic about coming out.",
      "If your Grandchild has a powerful ability (like Exorcist), they might stay hidden while you verify them privately.",
      "Your death when your Grandchild is killed gives information - the town knows that person was killed by the Demon.",
      "Consider claiming a different role publicly while coordinating privately with your Grandchild.",
      "If you're still alive, your Grandchild probably hasn't been killed by the Demon yet."
    ],
    bluffingAs: [
      "You wake night one and are shown a player and their character token.",
      "Claiming Grandmother is risky - if your claimed Grandchild dies and you don't, you're exposed.",
      "Pair up with a fellow evil player. Claim them as your Grandchild to make them look trustworthy.",
      "If you claim a good player as your Grandchild and they die without you dying, claim you were drunk or poisoned."
    ]
  },
  {
    id: 'sailor',
    name: 'Sailor',
    edition: 'bmr',
    team: 'townsfolk',
    ability: 'Each night, choose an alive player: either you or they are drunk until dusk. You can\'t die.',
    firstNightOrder: 10,
    otherNightOrder: 4,
    setup: false,
    reminders: ['Drunk'],
    flavorQuote: "YO-HO! YO-HO! A pirate's life for me... Drink up me hearties, YO-HO!",
    extendedSummary: `The Sailor is protected from death but causes drunkenness.

Each night, you choose an alive player. Either you or that player becomes drunk until dusk. The Storyteller decides who gets drunk.

While you are sober, you cannot die - not by Demon attack, execution, or any other means. If you are drunk, you CAN die.`,
    tipsAndTricks: [
      "You are incredibly hard to kill! Use this to be bold and aggressive.",
      "Choose suspicious players - if the Storyteller makes them drunk, it might disrupt evil abilities.",
      "If you choose yourself, the Storyteller must make you drunk (no one else to choose). Only do this if you want to die.",
      "Your protection is powerful, but you can be drunk by other effects. If a Sailor is acting drunk, they might be vulnerable.",
      "Consider staying hidden. If evil knows who you are, they won't waste kills on you.",
      "You can confirm you're the Sailor by surviving a situation where you should have died."
    ],
    bluffingAs: [
      "You wake each night and point at a player. Then either you or they become drunk.",
      "Sailor is a great bluff to explain surviving when you shouldn't have.",
      "Claim you made specific players drunk to explain information discrepancies.",
      "Be careful - if you claim Sailor and then die, your bluff is exposed."
    ]
  },
  { id: 'chambermaid', name: 'Chambermaid', edition: 'bmr', team: 'townsfolk', ability: 'Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.', firstNightOrder: 50, otherNightOrder: 69, setup: false, reminders: [], flavorQuote: '"I see all that happens in these halls."', extendedSummary: 'Each night, choose 2 players. You learn how many of them woke tonight due to their own ability (0, 1, or 2). Does not count being woken by other abilities.', tipsAndTricks: ['Confirm night-active roles like Monk', 'Zero might mean players are lying about roles', 'Track patterns across multiple nights'], bluffingAs: ['Claim numbers that confirm evil players', 'Complex to fake consistently'] },
  { id: 'exorcist', name: 'Exorcist', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn\'t wake tonight.', firstNightOrder: null, otherNightOrder: 21, setup: false, reminders: ['Chosen'], flavorQuote: '"The power of good compels you!"', extendedSummary: 'Each night except the first, choose a player (different from last night). If you choose the Demon, they learn you are the Exorcist and cannot kill tonight.', tipsAndTricks: ['No death means you hit the Demon', 'Demon knows who you are after you hit them', 'Rotate choices to eventually find Demon'], bluffingAs: ['Claim you caused a death-free night', 'Demon can confirm or deny your claims'] },
  { id: 'innkeeper', name: 'Innkeeper', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose 2 players: they can\'t die tonight, but 1 is drunk until dusk.', firstNightOrder: null, otherNightOrder: 9, setup: false, reminders: ['Protected', 'Drunk'], flavorQuote: '"Come in, come in! The fire is warm."', extendedSummary: 'Each night except the first, choose 2 players. They cannot die tonight. However, one of them becomes drunk until dusk (Storyteller chooses which).', tipsAndTricks: ['Protect key players from Demon', 'One of your choices gets false info', 'Balance protection with drunking drawback'], bluffingAs: ['Explain why certain players survived', 'Claim responsibility for info discrepancies'] },
  { id: 'gambler', name: 'Gambler', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose a player & guess their character: if you guess wrong, you die.', firstNightOrder: null, otherNightOrder: 3, setup: false, reminders: ['Dead'], flavorQuote: '"All in."', extendedSummary: 'Each night except the first, choose a player and guess their character. If you guess correctly, nothing happens. If you guess wrong, you die.', tipsAndTricks: ['Guess confirmed players to stay safe', 'Correct guess confirms identity', 'High risk ability - use carefully'], bluffingAs: ['Claim correct guesses on specific players', 'Death explains why you stop claiming'] },
  { id: 'gossip', name: 'Gossip', edition: 'bmr', team: 'townsfolk', ability: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.', firstNightOrder: null, otherNightOrder: 37, setup: false, reminders: ['Dead'], flavorQuote: '"Did you hear? Did you hear?"', extendedSummary: 'Each day, you may make a public statement. That night, if your statement was true, a player dies (Storyteller chooses who). False statements cause no death.', tipsAndTricks: ['Make obviously false statements to avoid kills', 'True statements kill - be careful with facts', 'Use as information by tracking which statements killed'], bluffingAs: ['Claim Gossip to explain random deaths', 'Complex ability to fake'] },
  { id: 'courtier', name: 'Courtier', edition: 'bmr', team: 'townsfolk', ability: 'Once per game, at night, choose a character: they are drunk for 3 nights & 3 days.', firstNightOrder: 18, otherNightOrder: 8, setup: false, reminders: ['Drunk 1', 'Drunk 2', 'Drunk 3', 'No Ability'], flavorQuote: '"I know exactly what to say."', extendedSummary: 'Once per game, choose a character (not a player). That character becomes drunk for 3 days and 3 nights. Works on any character in play.', tipsAndTricks: ['Drunk the Demon to prevent kills', 'Target evil characters for maximum impact', 'Save for when you identify a threat'], bluffingAs: ['Claim to have drunked specific characters', 'Explain why certain abilities malfunctioned'] },
  { id: 'professor', name: 'Professor', edition: 'bmr', team: 'townsfolk', ability: 'Once per game, at night*, choose a dead player: if they are a Townsfolk, they are resurrected.', firstNightOrder: null, otherNightOrder: 43, setup: false, reminders: ['Alive', 'No Ability'], flavorQuote: '"I have studied the dark arts, but only for good."', extendedSummary: 'Once per game, at night (not the first), choose a dead player. If they were a Townsfolk, they come back to life. If not Townsfolk, nothing happens.', tipsAndTricks: ['Resurrect confirmed Townsfolk', 'Failed resurrection reveals non-Townsfolk', 'Powerful ability - choose wisely'], bluffingAs: ['Claim failed resurrection on Outsider/evil', 'Hard to fake successful resurrection'] },
  { id: 'minstrel', name: 'Minstrel', edition: 'bmr', team: 'townsfolk', ability: 'When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Everyone Drunk'], flavorQuote: '"A song for the fallen..."', extendedSummary: 'When a Minion is executed, all players except Travellers become drunk until dusk the next day. Minstrel is also drunk. This is passive.', tipsAndTricks: ['Executing Minion causes mass drunkenness', 'Demon attacks still happen while drunk', 'Plan around potential drunk day'], bluffingAs: ['Claim Minstrel to explain mass confusion', 'Passive ability is easy to claim'] },
  { id: 'tealady', name: 'Tea Lady', edition: 'bmr', team: 'townsfolk', ability: 'If both your alive neighbours are good, they can\'t die.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Protected'], flavorQuote: '"Would you like a cup of tea?"', extendedSummary: 'If both your alive neighbours are good, they cannot die by any means. If one neighbour is evil, this protection is lost.', tipsAndTricks: ['Sit between trusted good players', 'Your neighbours being alive is strong', 'Evil will try to break your chain'], bluffingAs: ['Explain why neighbours survived', 'Requires knowledge of neighbour alignments'] },
  { id: 'pacifist', name: 'Pacifist', edition: 'bmr', team: 'townsfolk', ability: 'Executed good players might not die.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Violence is never the answer."', extendedSummary: 'When a good player is executed, they might not die. The Storyteller decides. This is passive and always active while you are alive and sober.', tipsAndTricks: ['Good players might survive execution', 'Creates uncertainty around executions', 'Evil will want you dead'], bluffingAs: ['Explain why executed players survived', 'Passive - easy to claim'] },
  { id: 'fool', name: 'Fool', edition: 'bmr', team: 'townsfolk', ability: 'The first time you die, you don\'t.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['No Ability'], flavorQuote: '"La la la!"', extendedSummary: 'The first time you would die (by any cause), you do not die. You appear to die but survive. After this, you die normally.', tipsAndTricks: ['You get one free death', 'Coming out can waste Demon attacks', 'Execution survival is very suspicious'], bluffingAs: ['Explain surviving night attack', 'Only works for first death'] },

  // OUTSIDERS
  { id: 'tinker', name: 'Tinker', edition: 'bmr', team: 'outsider', ability: 'You might die at any time.', firstNightOrder: null, otherNightOrder: 48, setup: false, reminders: ['Dead'], flavorQuote: '"I wonder what this button does..."', extendedSummary: 'The Storyteller may kill you at any time - day or night, for any reason or no reason. Your death can happen suddenly without warning.', tipsAndTricks: ['Your random death confuses investigations', 'Come out so team knows deaths may be random', 'Storyteller usually kills you at dramatic moments'], bluffingAs: ['Cannot reliably bluff Tinker', 'Your death pattern must be unpredictable'] },
  { id: 'moonchild', name: 'Moonchild', edition: 'bmr', team: 'outsider', ability: 'When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.', firstNightOrder: null, otherNightOrder: 49, setup: false, reminders: ['Dead'], flavorQuote: '"The moon speaks to me."', extendedSummary: 'When you die (and learn it), immediately choose a living player publicly. That night, if your choice was a good player, they die.', tipsAndTricks: ['Choose someone you think is evil', 'Wrong guess kills a good player', 'Death trigger is immediate and public'], bluffingAs: ['Risky - wrong choice kills good player', 'Creates pressure on your target'] },
  { id: 'goon', name: 'Goon', edition: 'bmr', team: 'outsider', ability: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Drunk'], flavorQuote: '"I do what I\'m told."', extendedSummary: 'Each night, the first player to target you with an ability becomes drunk until dusk. You become their alignment (good or evil).', tipsAndTricks: ['Your alignment can flip to evil', 'Drunking abilities that target you', 'Complex interactions - track carefully'], bluffingAs: ['Explain alignment confusion', 'Complex ability to fake'] },
  { id: 'lunatic', name: 'Lunatic', edition: 'bmr', team: 'outsider', ability: 'You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.', firstNightOrder: 7, otherNightOrder: 22, setup: true, reminders: ['Attack 1', 'Attack 2', 'Attack 3'], flavorQuote: '"I am the night!"', extendedSummary: 'You are told you are the Demon and "kill" each night, but you are actually the Lunatic. The real Demon knows who you are and sees your choices.', tipsAndTricks: ['Your kills do not happen', 'Real Demon uses your choices as info', 'When you realize, help good team'], bluffingAs: ['Cannot bluff Lunatic - you would not know', 'Demon can claim to be Lunatic'] },

  // MINIONS
  { id: 'godfather', name: 'Godfather', edition: 'bmr', team: 'minion', ability: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]', firstNightOrder: 20, otherNightOrder: 38, setup: true, reminders: ['Dead', 'Died Today'], flavorQuote: '"I\'ll make you an offer you can\'t refuse."', extendedSummary: 'You start knowing which Outsiders are in play. On nights after an Outsider dies that day, you choose a player to kill. Setup modifies Outsider count by 1.', tipsAndTricks: ['Kill on nights after Outsider deaths', 'Use Outsider knowledge strategically', 'Second kill makes for deadly nights'], fightingThe: ['Track Outsider deaths and night kills', 'Second kill on some nights suggests Godfather', 'Outsider count may be modified'] },
  { id: 'devilsadvocate', name: 'Devil\'s Advocate', edition: 'bmr', team: 'minion', ability: 'Each night, choose a living player (different to last night): if executed tomorrow, they don\'t die.', firstNightOrder: 21, otherNightOrder: 13, setup: false, reminders: ['Survives'], flavorQuote: '"I am simply presenting the other side."', extendedSummary: 'Each night, choose a player (different from last night). If that player is executed tomorrow, they survive the execution.', tipsAndTricks: ['Protect Demon from execution', 'Protect yourself if suspected', 'Failed executions create confusion'], fightingThe: ['Execute same player twice', 'Surviving execution is suspicious', 'DA must switch targets each night'] },
  { id: 'assassin', name: 'Assassin', edition: 'bmr', team: 'minion', ability: 'Once per game, at night*, choose a player: they die, even if for some reason they could not.', firstNightOrder: null, otherNightOrder: 36, setup: false, reminders: ['Dead', 'No Ability'], flavorQuote: '"Silent. Deadly. Professional."', extendedSummary: 'Once per game, at night (not the first), choose a player. They die, bypassing all protection. Kills through Sailor, Tea Lady, etc.', tipsAndTricks: ['Save for protected targets', 'Bypass all death prevention', 'Coordinate with Demon timing'], fightingThe: ['One unstoppable kill from Assassin', 'Protected player dying suggests Assassin', 'Only works once per game'] },
  { id: 'mastermind', name: 'Mastermind', edition: 'bmr', team: 'minion', ability: 'If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"All according to plan."', extendedSummary: 'If the Demon dies by execution (which would end the game), play continues for one more day. Whoever is executed on that day - their team loses.', tipsAndTricks: ['Insurance against Demon execution', 'Extra day creates pressure', 'Evil can win even after Demon dies'], fightingThe: ['Mastermind gives evil extra day', 'Be careful who you execute after Demon', 'No execution on Mastermind day wins for good'] },

  // DEMONS
  {
    id: 'zombuul',
    name: 'Zombuul',
    edition: 'bmr',
    team: 'demon',
    ability: 'Each night*, if no-one died today, choose a player: they die. The 1st time you die, you live but register as dead.',
    firstNightOrder: null,
    otherNightOrder: 25,
    setup: false,
    reminders: ['Dead', 'Died Today'],
    flavorQuote: "The undead do not rest. They do not think. They do not plan or wish or dream. But you may rest, and think, and dream... and see what you shall become.",
    extendedSummary: `The Zombuul secretly survives their first death, and only kills on deathless days.

You only kill at night if no player died during the previous day (by execution, ability, or otherwise).

The first time you die, you don't actually die. You appear dead - you're added to the dead players, you close your eyes during the day - but you're actually alive. You continue to wake at night and kill. You only truly die the SECOND time you die.`,
    tipsAndTricks: [
      "If the town executes every day, you can never kill at night. But this puts pressure on them.",
      "Your first 'death' is fake. You can let yourself be executed early, appearing to be cleared, then continue killing as a 'dead' player.",
      "Coordinate with Minions. After your fake death, they need to keep suspicion off you.",
      "You register as dead after your first death - Empath, Fortune Teller, and other abilities see you as dead.",
      "Consider killing important players on nights after no one died, when you get the chance.",
      "If you're 'dead' and the game continues, try to blend in with the dead players."
    ],
    fightingThe: [
      "Execute someone every day! This prevents the Zombuul from ever killing at night.",
      "The Zombuul might already be 'dead'. Track dead players carefully for suspicious behavior.",
      "If executions happen daily but there are still night deaths, something strange is happening - maybe the Zombuul.",
      "The game continuing after executing the Zombuul the first time reveals the Zombuul. Execute them again!",
      "Dead players can still be the Zombuul. Don't ignore suspicious behavior from 'dead' players."
    ]
  },
  {
    id: 'pukka',
    name: 'Pukka',
    edition: 'bmr',
    team: 'demon',
    ability: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.',
    firstNightOrder: 27,
    otherNightOrder: 26,
    setup: false,
    reminders: ['Poisoned', 'Dead'],
    flavorQuote: "Ssshhhhhhh... ssshhhhhhh... don't fight it... let it wash through you... ssshhhhhhh...",
    extendedSummary: `The Pukka poisons its victims, who die later.

Each night (including the first), you choose a player to poison. They are poisoned immediately.

The previously poisoned player (from last night) dies and becomes healthy. This creates a one-night delay between poisoning and death.`,
    tipsAndTricks: [
      "Night 1: You poison someone. No one dies. Night 2: You poison someone new. Your first victim dies.",
      "Players who die were poisoned the PREVIOUS night. Their abilities last night were malfunctioning.",
      "Poison an Empath or Fortune Teller the night before they claim - their 'confirming' information will be wrong.",
      "Your delayed death creates alibis. You could be far away from someone when they die.",
      "Consider poisoning the same person twice - they get poisoned, healed when they'd die, then poisoned again.",
      "The Innkeeper and Sailor can protect people from death but not from poison. Use this to your advantage."
    ],
    fightingThe: [
      "The player who died was poisoned YESTERDAY. Their information from yesterday might be false.",
      "Night 1 has no death. The first death is night 2 (from night 1 poisoning).",
      "Players are poisoned for roughly 24 hours before death. Consider what they claimed during that time.",
      "The Courtier can drunk the Pukka - the currently poisoned player stays poisoned but won't die.",
      "Sailors don't die, but if poisoned, they're still poisoned. Kill the Pukka to stop the poisoning."
    ]
  },
  {
    id: 'shabaloth',
    name: 'Shabaloth',
    edition: 'bmr',
    team: 'demon',
    ability: 'Each night*, choose 2 players: they die. A dead player you chose last night might be regurgitated.',
    firstNightOrder: null,
    otherNightOrder: 27,
    setup: false,
    reminders: ['Dead', 'Alive'],
    flavorQuote: "Feed me, feed me, FEED ME! Puddings and pies and pastries and muffins and jelly and porridge and pork and lamb and BLOOD!",
    extendedSummary: `The Shabaloth kills twice per night but might bring back a victim.

Each night except the first, you choose two players. They both die.

One player you killed the previous night might be regurgitated - coming back to life. The Storyteller chooses who and whether this happens.`,
    tipsAndTricks: [
      "Two kills per night makes for fast, brutal games. Be aggressive!",
      "Regurgitation is unpredictable. The Storyteller might bring back a victim to keep the game interesting.",
      "Kill threatening players quickly. With two kills, you can eliminate multiple threats per night.",
      "Players who come back are useful - they might have information from being dead.",
      "The double-kill means games last fewer nights. Push hard for evil before good organizes.",
      "Coordinate kills with Minions to avoid wasting both attacks on protected players."
    ],
    fightingThe: [
      "Two deaths per night means Shabaloth! Identify this early.",
      "Someone coming back to life is Shabaloth regurgitation. This confirms the Demon type.",
      "Fast games favor evil. Execute quickly and efficiently.",
      "Regurgitated players are confirmed good (they were killed by Demon). Trust them.",
      "The Innkeeper protecting two players might save both from Shabaloth attacks."
    ]
  },
  {
    id: 'po',
    name: 'Po',
    edition: 'bmr',
    team: 'demon',
    ability: 'Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.',
    firstNightOrder: null,
    otherNightOrder: 28,
    setup: false,
    reminders: ['Dead', 'Dead', 'Dead', '3 Attacks'],
    flavorQuote: "I am the monster under the bed. I am the wolf at your door. I am every shadow, every cold night, every unpleasant glance in every crowded room. But I'm not scary. Oh, no. YOU are.",
    extendedSummary: `The Po can choose to not kill, then kill three players the next night.

Each night except the first, you may choose a player to kill - or choose no one.

If you chose no one last night, tonight you MUST choose three players. They all die. This creates huge swings in body count.`,
    tipsAndTricks: [
      "Night 2: Skip. Night 3: Triple kill. This is devastating but predictable.",
      "Vary your pattern. Sometimes kill normally to throw off suspicion.",
      "A triple kill on critical night can end the game immediately.",
      "Don't skip too early - you want enough players that triple kill doesn't immediately end the game.",
      "Coordinate with Minions. They can protect you during the 'charging' night when you don't kill.",
      "If you skip and good executes well that day, your triple kill might not be enough. Time it carefully."
    ],
    fightingThe: [
      "No death might mean Po is 'charging' for a triple kill!",
      "After a no-death night, brace for three deaths the next night.",
      "Execute aggressively on no-death days. You need to hit the Po before the triple kill.",
      "The Po might kill 1 normally instead of charging. Don't assume every no-death is Po.",
      "Protection abilities might save some players, but three attacks is hard to fully block.",
      "Count deaths carefully. 0-3-1-3 pattern strongly suggests Po."
    ]
  },
];

// ===================
// SECTS & VIOLETS
// ===================

export const SECTS_AND_VIOLETS: Character[] = [
  // TOWNSFOLK
  { id: 'clockmaker', name: 'Clockmaker', edition: 'snv', team: 'townsfolk', ability: 'You start knowing how many steps from the Demon to its nearest Minion.', firstNightOrder: 40, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Tick, tock, tick, tock."', extendedSummary: 'On night one, you learn the distance (in seats) from the Demon to their nearest Minion, going either direction around the circle.', tipsAndTricks: ['Low number means Demon and Minion sit close', 'Use seating chart to narrow possibilities', 'Combine with other info for triangulation'], bluffingAs: ['Claim numbers that fit evil positions', 'High numbers spread suspicion widely'] },
  { id: 'dreamer', name: 'Dreamer', edition: 'snv', team: 'townsfolk', ability: 'Each night, choose a player (not yourself or Travellers): you learn 1 good and 1 evil character, 1 of which is correct.', firstNightOrder: 41, otherNightOrder: 57, setup: false, reminders: [], flavorQuote: '"I saw it in a dream..."', extendedSummary: 'Each night, choose a player. You learn a good character and an evil character - one is their actual character, one is false.', tipsAndTricks: ['Process of elimination over multiple nights', 'Track which characters keep appearing', 'Coordinate with others for cross-reference'], bluffingAs: ['Create plausible pairs', 'Include real characters in your pairs'] },
  { id: 'snakecharmer', name: 'Snake Charmer', edition: 'snv', team: 'townsfolk', ability: 'Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.', firstNightOrder: 19, otherNightOrder: 10, setup: false, reminders: ['Poisoned'], flavorQuote: '"Come to me, little one."', extendedSummary: 'Each night, choose a player. If they are the Demon, you swap characters and alignments with them - they become good Snake Charmer, you become evil Demon (but poisoned).', tipsAndTricks: ['Hit the Demon and you become the Demon', 'Now-good Demon was evil, might act evil', 'Your new Demon status is poisoned initially'], bluffingAs: ['Risky ability to claim', 'Hitting Demon changes everything'] },
  { id: 'mathematician', name: 'Mathematician', edition: 'snv', team: 'townsfolk', ability: 'Each night, you learn how many players\' abilities worked abnormally (possibly due to another ability) since dawn today.', firstNightOrder: 51, otherNightOrder: 70, setup: false, reminders: ['Abnormal'], flavorQuote: '"The numbers never lie."', extendedSummary: 'Each night, you learn how many abilities malfunctioned since dawn (due to drunk, poison, etc). High numbers mean interference is happening.', tipsAndTricks: ['Zero means no interference today', 'High numbers suggest Poisoner or drunk', 'Track patterns to find source of interference'], bluffingAs: ['Claim low numbers to seem like no evil interference', 'Numbers are hard to verify'] },
  { id: 'flowergirl', name: 'Flowergirl', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn if a Demon voted today.', firstNightOrder: null, otherNightOrder: 58, setup: false, reminders: ['Demon Voted', 'Demon Not Voted'], flavorQuote: '"Flowers for the dead?"', extendedSummary: 'Each night except the first, you learn whether the Demon raised their hand to vote on any execution today (Yes or No).', tipsAndTricks: ['Yes means Demon voted at least once', 'Cross-reference with voting records', 'No means Demon abstained all day'], bluffingAs: ['Claim Yes or No based on voting observed', 'Can frame or clear players'] },
  { id: 'townCrier', name: 'Town Crier', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn if a Minion nominated today.', firstNightOrder: null, otherNightOrder: 59, setup: false, reminders: ['Minion Nominated', 'Minion Not Nominated'], flavorQuote: '"Hear ye! Hear ye!"', extendedSummary: 'Each night except the first, you learn whether any Minion made a nomination today (Yes or No).', tipsAndTricks: ['Yes means at least one Minion nominated', 'Track who nominated and cross-reference', 'Minions might avoid nominating'], bluffingAs: ['Claim based on nomination patterns', 'Yes is safer claim'] },
  { id: 'oracle', name: 'Oracle', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn how many dead players are evil.', firstNightOrder: null, otherNightOrder: 60, setup: false, reminders: [], flavorQuote: '"The spirits whisper truths."', extendedSummary: 'Each night except the first, you learn how many dead players are evil. Helps identify if executed players were evil.', tipsAndTricks: ['Track count as players die', 'Increasing count means evil dying', 'Stable count means good dying'], bluffingAs: ['Claim counts that match expectations', 'Hard to fake as game progresses'] },
  { id: 'savant', name: 'Savant', edition: 'snv', team: 'townsfolk', ability: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"I understand now."', extendedSummary: 'Once per day, you may privately visit the Storyteller. They tell you two statements - one true, one false. You must determine which is which.', tipsAndTricks: ['Privately get customized information', 'Compare statements to deduce truth', 'Powerful but uncertain info source'], bluffingAs: ['Make up plausible statement pairs', 'Private nature makes it easy to lie'] },
  { id: 'seamstress', name: 'Seamstress', edition: 'snv', team: 'townsfolk', ability: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.', firstNightOrder: 42, otherNightOrder: 61, setup: false, reminders: ['No Ability'], flavorQuote: '"I can see through the seams."', extendedSummary: 'Once per game, choose two players at night. You learn if they are the same alignment (both good or both evil) or different.', tipsAndTricks: ['Use on suspicious players', 'Different means one good, one evil', 'Same means both good or both evil'], bluffingAs: ['Claim alignment matches you "found"', 'One-shot ability is easy to fake'] },
  { id: 'philosopher', name: 'Philosopher', edition: 'snv', team: 'townsfolk', ability: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.', firstNightOrder: 1, otherNightOrder: 1, setup: false, reminders: ['Is the Philosopher', 'Drunk'], flavorQuote: '"I think, therefore I am."', extendedSummary: 'Once per game, choose a good character to gain their ability. If that exact character is in play, they become drunk while you have the ability.', tipsAndTricks: ['Gain any good ability you want', 'Drunks the real character if in play', 'Very flexible power'], bluffingAs: ['Claim to have become specific role', 'Explains having two abilities'] },
  { id: 'artist', name: 'Artist', edition: 'snv', team: 'townsfolk', ability: 'Once per game, during the day, privately ask the Storyteller any yes/no question.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['No Ability'], flavorQuote: '"Let me paint you a picture."', extendedSummary: 'Once per game, during the day, privately ask the Storyteller any yes/no question. They will answer truthfully.', tipsAndTricks: ['Ask carefully worded questions', 'One question must count', 'Consider what info helps most'], bluffingAs: ['Claim you asked specific question', 'Private interaction easy to lie about'] },
  { id: 'juggler', name: 'Juggler', edition: 'snv', team: 'townsfolk', ability: 'On your 1st day, publicly guess up to 5 players\' characters. That night, you learn how many you got correct.', firstNightOrder: null, otherNightOrder: 62, setup: false, reminders: ['Correct'], flavorQuote: '"Watch carefully!"', extendedSummary: 'On day 1, publicly guess up to 5 player-character combinations. That night, you learn how many guesses were correct (0-5).', tipsAndTricks: ['Day 1 only - guess carefully', 'More guesses means more info', 'Public guesses give town info'], bluffingAs: ['Claim number of correct guesses', 'Day 1 timing is fixed'] },
  { id: 'sage', name: 'Sage', edition: 'snv', team: 'townsfolk', ability: 'If the Demon kills you, you learn that it is 1 of 2 players.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Knowledge comes with death."', extendedSummary: 'If you die at night due to Demon attack, you learn 2 players - one of them is the Demon. Information comes with your death.', tipsAndTricks: ['Death gives you Demon info', 'Share info when you die', 'Demon may avoid killing you'], bluffingAs: ['Claim Sage when dead with Demon guess', 'Need to die to "activate"'] },

  // OUTSIDERS
  { id: 'mutant', name: 'Mutant', edition: 'snv', team: 'outsider', ability: 'If you are "mad" about being an Outsider, you might be executed.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"I am... different."', extendedSummary: 'If you act like or claim to be an Outsider (are "mad" about it), the Storyteller might execute you. You must pretend to be Townsfolk or not claim at all.', tipsAndTricks: ['Cannot claim Outsider safely', 'Must play as if you are Townsfolk', 'Execution threat is real'], bluffingAs: ['Hard role to directly claim', 'Mutant hides, not announces'] },
  { id: 'sweetheart', name: 'Sweetheart', edition: 'snv', team: 'outsider', ability: 'When you die, 1 player is drunk from now on.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Drunk'], flavorQuote: '"My heart was too pure."', extendedSummary: 'When you die (by any means), the Storyteller chooses one player to become drunk for the rest of the game.', tipsAndTricks: ['Your death drunks someone permanently', 'Could drunk good or evil player', 'Death has consequences'], bluffingAs: ['Claim after death to explain drunk', 'Outsider with death trigger'] },
  { id: 'barber', name: 'Barber', edition: 'snv', team: 'outsider', ability: 'If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.', firstNightOrder: null, otherNightOrder: 40, setup: false, reminders: ['Haircuts Tonight'], flavorQuote: '"A little off the top?"', extendedSummary: 'If you die (day or night), the Demon may choose 2 players that night to swap characters. Cannot swap another Demon.', tipsAndTricks: ['Your death enables character swaps', 'Demon can create chaos', 'Swaps happen night of your death'], bluffingAs: ['Explain character confusion', 'Claim when characters seem swapped'] },
  { id: 'klutz', name: 'Klutz', edition: 'snv', team: 'outsider', ability: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Oops!"', extendedSummary: 'When you die and learn it, you must publicly choose an alive player. If they are evil, good loses immediately. Choose carefully.', tipsAndTricks: ['Dying triggers lose condition risk', 'Must choose good player to not lose', 'Be very careful who you pick'], bluffingAs: ['Dangerous ability to have', 'Claim explains pressure on choice'] },

  // MINIONS
  { id: 'evilTwin', name: 'Evil Twin', edition: 'snv', team: 'minion', ability: 'You & an opposing player know each other. If the good player is executed, evil wins. Good can\'t win if you both live.', firstNightOrder: 23, otherNightOrder: null, setup: true, reminders: ['Twin'], flavorQuote: '"We are one."', extendedSummary: 'You and a good player are Twins and know each other. If the good Twin is executed, evil wins. Good cannot win while both Twins live.', tipsAndTricks: ['Your Twin is your shield', 'Executing good Twin wins for evil', 'Both must die for good to win normally'], fightingThe: ['Identify which Twin is evil', 'Both Twins must eventually die', 'Never execute blindly between Twins'] },
  { id: 'witch', name: 'Witch', edition: 'snv', team: 'minion', ability: 'Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.', firstNightOrder: 24, otherNightOrder: 14, setup: false, reminders: ['Cursed'], flavorQuote: '"I\'ll get you, my pretty!"', extendedSummary: 'Each night, curse a player. If they nominate anyone tomorrow, they die immediately. At 3 players, you lose this ability.', tipsAndTricks: ['Silence good players through fear', 'Kills happen on nomination', 'Lose ability at 3 players'], fightingThe: ['Death on nomination means Witch', 'Track who nominated before deaths', 'Safe at 3 players remaining'] },
  { id: 'cerenovus', name: 'Cerenovus', edition: 'snv', team: 'minion', ability: 'Each night, choose a player & a good character: they are "mad" they are this character tomorrow, or might be executed.', firstNightOrder: 25, otherNightOrder: 15, setup: false, reminders: ['Mad'], flavorQuote: '"Believe what I tell you to believe."', extendedSummary: 'Each night, choose a player and a good character. Tomorrow, they must pretend to be that character or risk execution by Storyteller.', tipsAndTricks: ['Force players to lie', 'Creates conflicting claims', 'Madness causes chaos'], fightingThe: ['Conflicting claims might be madness', 'Ask why someone changed their story', 'Cerenovus forces false claims'] },
  { id: 'pitHag', name: 'Pit-Hag', edition: 'snv', team: 'minion', ability: 'Each night*, choose a player & a character they become (if not-in-play). If a Demon is made, deaths tonight are arbitrary.', firstNightOrder: null, otherNightOrder: 16, setup: false, reminders: [], flavorQuote: '"Let me fix that for you."', extendedSummary: 'Each night except first, change a player into a new character (not already in play). If you create a new Demon, all deaths that night are Storyteller\'s choice.', tipsAndTricks: ['Change characters at will', 'Can create new Demon', 'Disrupts ability expectations'], fightingThe: ['Characters might change overnight', 'Role claims may become outdated', 'Pit-Hag creates chaos'] },

  // DEMONS
  {
    id: 'fangGu',
    name: 'Fang Gu',
    edition: 'snv',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]',
    firstNightOrder: null,
    otherNightOrder: 29,
    setup: true,
    reminders: ['Dead', 'Once'],
    flavorQuote: "The soulless eyes of the Fang Gu stare unblinking from the darkness, hunting, patient, eternal. Tonight, the village will know despair.",
    extendedSummary: `The Fang Gu can jump into an Outsider when it kills them.

Each night except the first, you choose a player to kill. If you kill an Outsider, something special happens: they become the new Fang Gu (evil), and you die.

This jump only happens once. After it triggers, you're dead and the new Fang Gu continues normally. Setup adds +1 Outsider to the game.`,
    tipsAndTricks: [
      "Avoid killing Outsiders early - you don't want to jump until you're ready or in danger.",
      "If you're about to be executed, deliberately target an Outsider to escape death and continue as them.",
      "The new Fang Gu inherits your knowledge but is now a different player. Coordinate beforehand!",
      "Extra Outsider in setup means more potential Fang Gu targets - but also makes Outsider claims more believable.",
      "After the jump, you're dead but can still vote once. The new Fang Gu must continue without drawing suspicion.",
      "Kill the Outsider you trust most if you need to jump - they'll continue as evil."
    ],
    fightingThe: [
      "The Fang Gu can jump to an Outsider! Watch for a dead Fang Gu followed by suspicious Outsider behavior.",
      "There's one extra Outsider in setup. This affects Outsider claim counting.",
      "If you suspect Fang Gu jumped, the new Demon is someone who claimed Outsider.",
      "A dead Demon but game continuing could be Fang Gu (or Scarlet Woman in other games).",
      "Executing known Outsiders safely tests if they've become the Fang Gu."
    ]
  },
  {
    id: 'vigormortis',
    name: 'Vigormortis',
    edition: 'snv',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbour. [-1 Outsider]',
    firstNightOrder: null,
    otherNightOrder: 30,
    setup: true,
    reminders: ['Dead', 'Has Ability', 'Poisoned'],
    flavorQuote: "Even in death, they serve. The Vigormortis binds the souls of the damned to its terrible will.",
    extendedSummary: `The Vigormortis empowers its Minions through death.

Each night except the first, you kill a player. If you kill a Minion, they keep their ability even while dead, AND they poison one of their living Townsfolk neighbors.

Setup removes 1 Outsider from the game.`,
    tipsAndTricks: [
      "Killing your own Minions is powerful! They keep their ability AND poison a neighbor.",
      "A dead Witch can still curse. A dead Evil Twin situation gets very complicated.",
      "The poison effect spreads - each dead Minion poisons one neighbor, potentially multiple poisoned Townsfolk.",
      "Kill Minions strategically when their ability would be most useful dead.",
      "Fewer Outsiders means fewer Outsider claims are valid - use this knowledge.",
      "Coordinate with Minions about when you'll kill them for maximum chaos."
    ],
    fightingThe: [
      "Dead Minions might still have their abilities! The Witch curse can come from the grave.",
      "Unexplained poison (bad info from multiple players) might mean Vigormortis.",
      "One fewer Outsider than expected in setup - adjust your Outsider counting.",
      "Track dead Minion neighbors - they're likely poisoned.",
      "Kill the Vigormortis fast before it can empower dead Minions."
    ]
  },
  {
    id: 'noDashii',
    name: 'No Dashii',
    edition: 'snv',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. Your 2 Townsfolk neighbours are poisoned.',
    firstNightOrder: null,
    otherNightOrder: 31,
    setup: false,
    reminders: ['Dead', 'Poisoned'],
    flavorQuote: "The corruption spreads in whispers, in doubts, in the spaces between certainty. No Dashii feeds on trust itself.",
    extendedSummary: `The No Dashii poisons its Townsfolk neighbors just by existing.

Each night except the first, you kill a player normally. Additionally, your two nearest Townsfolk neighbors (skipping Outsiders, Minions, and the Demon) are poisoned permanently while you live.

The poison ends when you die.`,
    tipsAndTricks: [
      "Your neighbors get false information! This creates a cloud of misinformation around you.",
      "Sit between information-heavy roles if possible - poisoned Empath or Fortune Teller causes chaos.",
      "Your poison is positional. If good identifies two adjacent players with bad info, they might find you.",
      "When one poisoned neighbor dies, a new Townsfolk becomes your neighbor and gets poisoned.",
      "The poison is invisible - victims don't know they're poisoned.",
      "Killing your poisoned neighbors clears the evidence, but creates more poisoned neighbors."
    ],
    fightingThe: [
      "Two Townsfolk near the No Dashii are ALWAYS poisoned. Look for clusters of bad info.",
      "If two adjacent players both seem wrong, the No Dashii might be near them.",
      "The poison spreads positionally. Find the center of the misinformation.",
      "Outsiders and evil players between the Demon and Townsfolk create larger poison gaps.",
      "Kill the No Dashii to end all the positional poison at once."
    ]
  },
  {
    id: 'vortox',
    name: 'Vortox',
    edition: 'snv',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. Townsfolk abilities yield false info. Each day, if no-one is executed, evil wins.',
    firstNightOrder: null,
    otherNightOrder: 32,
    setup: false,
    reminders: ['Dead'],
    flavorQuote: "In the realm of the Vortox, all truths become lies, all certainties crumble. Nothing is real.",
    extendedSummary: `The Vortox inverts all Townsfolk information and demands daily executions.

Each night except the first, you kill normally. ALL Townsfolk abilities that provide information give FALSE information instead.

Additionally, if any day ends without an execution, evil wins immediately.`,
    tipsAndTricks: [
      "Every Townsfolk is giving false information! Use this to your advantage.",
      "The 'must execute' rule creates pressure - good can never safely skip a day.",
      "Give false information matching what Townsfolk might learn - it will seem to 'confirm' you.",
      "Minions aren't affected - they give true information. This can be suspicious!",
      "Outsiders give true information too. Watch for this discrepancy.",
      "The execution pressure helps you - good is forced to kill and might hit each other."
    ],
    fightingThe: [
      "If Vortox, ALL Townsfolk information is inverted. 'No' means 'Yes', evil reads good, etc.",
      "You MUST execute every day or evil wins instantly. Never skip an execution!",
      "If information seems consistently wrong across multiple Townsfolk, suspect Vortox.",
      "Outsider and Minion information is still true - compare against Townsfolk claims.",
      "Once you suspect Vortox, flip all Townsfolk information and re-evaluate."
    ]
  },
];

// ===================
// TRAVELLERS
// ===================

export const TRAVELLERS: Character[] = [
  // Trouble Brewing Travellers
  { id: 'scapegoat', name: 'Scapegoat', edition: 'traveler', team: 'traveler', ability: 'If a player of your alignment is executed, you might be executed instead.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"It was all my fault."', extendedSummary: 'If a player of your alignment is executed, the Storyteller may execute you instead. You take their place on the chopping block.', tipsAndTricks: ['You can save your team from execution', 'Alignment determines who you save', 'Storyteller chooses when to activate'], bluffingAs: ['Traveller - enters game later'] },
  { id: 'gunslinger', name: 'Gunslinger', edition: 'traveler', team: 'traveler', ability: 'Each day, after the 1st vote has been tallied, you may choose a player that voted: they die.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"This town ain\'t big enough for the two of us."', extendedSummary: 'Each day, after the first vote is counted, you may kill any player who voted in that vote. Very aggressive ability.', tipsAndTricks: ['Kill players who vote suspiciously', 'Powerful but dangerous', 'Use to eliminate evil voters'], bluffingAs: ['Traveller ability'] },
  { id: 'beggar', name: 'Beggar', edition: 'traveler', team: 'traveler', ability: 'You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Spare some change?"', extendedSummary: 'You need vote tokens to vote. Dead players giving you their token reveals their alignment. You cannot be drunk or poisoned.', tipsAndTricks: ['Collect vote tokens from dead', 'Learn alignments through tokens', 'Always sober and healthy'], bluffingAs: ['Traveller role'] },
  { id: 'bureaucrat', name: 'Bureaucrat', edition: 'traveler', team: 'traveler', ability: 'Each night, choose a player (not yourself): their vote counts as 3 votes tomorrow.', firstNightOrder: 2, otherNightOrder: 2, setup: false, reminders: ['3 Votes'], flavorQuote: '"Please fill out form 27B stroke 6."', extendedSummary: 'Each night, choose a player. Their vote counts as 3 votes tomorrow, making them very influential in executions.', tipsAndTricks: ['Empower trusted players', 'Triple votes swing executions', 'Can help good or evil'], bluffingAs: ['Traveller'] },
  { id: 'thief', name: 'Thief', edition: 'traveler', team: 'traveler', ability: 'Each night, choose a player (not yourself): their vote counts negatively tomorrow.', firstNightOrder: 3, otherNightOrder: 3, setup: false, reminders: ['Negative Vote'], flavorQuote: '"What\'s yours is mine."', extendedSummary: 'Each night, choose a player. Their vote counts as -1 tomorrow, subtracting from vote totals instead of adding.', tipsAndTricks: ['Negate evil votes', 'Powerful vote manipulation', 'Negative votes reduce totals'], bluffingAs: ['Traveller ability'] },
  
  // Bad Moon Rising Travellers
  { id: 'apprentice', name: 'Apprentice', edition: 'traveler', team: 'traveler', ability: 'On your 1st night, you gain a Townsfolk ability (if good) or a Minion ability (if evil).', firstNightOrder: 4, otherNightOrder: null, setup: false, reminders: ['Is the Apprentice'], flavorQuote: '"Teach me, master."', extendedSummary: 'On your first night, you gain a Townsfolk ability (if good) or Minion ability (if evil). You have this ability for the rest of the game.', tipsAndTricks: ['Gain powerful ability permanently', 'Alignment determines ability type', 'Flexible role'], bluffingAs: ['Traveller with gained ability'] },
  { id: 'matron', name: 'Matron', edition: 'traveler', team: 'traveler', ability: 'Each day, you may choose up to 3 sets of 2 players to swap seats. Players may not leave their seats to talk in private.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Children, settle down!"', extendedSummary: 'Each day, swap up to 3 pairs of player seats. Players cannot leave seats for private conversations.', tipsAndTricks: ['Control seating arrangements', 'Prevent private talks', 'Affects neighbor-based abilities'], bluffingAs: ['Traveller role'] },
  { id: 'judge', name: 'Judge', edition: 'traveler', team: 'traveler', ability: 'Once per game, if another player nominated, you may choose to force the current execution to pass or fail.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['No Ability'], flavorQuote: '"Order in the court!"', extendedSummary: 'Once per game, after another player nominates, you can force that execution to either succeed or fail, regardless of votes.', tipsAndTricks: ['Override any execution vote', 'Save or condemn at will', 'One-time powerful ability'], bluffingAs: ['Traveller'] },
  { id: 'bishop', name: 'Bishop', edition: 'traveler', team: 'traveler', ability: 'Only the Storyteller can nominate. At least 1 opposing player is executed each day.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"The will of God shall be done."', extendedSummary: 'Only Storyteller nominates while you live. At least one player of opposing alignment to you must be executed each day.', tipsAndTricks: ['Removes player nominations', 'Forced opposing executions', 'Very game-changing'], bluffingAs: ['Traveller role'] },
  { id: 'voudon', name: 'Voudon', edition: 'traveler', team: 'traveler', ability: 'Only dead players may vote. They do not need a vote token to do so. Dead players can vote up to 3 times.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"The dead speak through me."', extendedSummary: 'Only dead players vote (no tokens needed). Each dead player can vote up to 3 times during the game.', tipsAndTricks: ['Dead control votes', 'Living cannot vote', 'Changes game dynamics entirely'], bluffingAs: ['Traveller'] },

  // Sects & Violets Travellers
  { id: 'barista', name: 'Barista', edition: 'traveler', team: 'traveler', ability: 'Each night, until dusk, 1) a player becomes sober, healthy & gets true info, or 2) their ability works twice. The Storyteller chooses.', firstNightOrder: 5, otherNightOrder: 5, setup: false, reminders: ['Sober & Healthy', 'Acts Twice'], flavorQuote: '"Double shot?"', extendedSummary: 'Each night, Storyteller picks either: make one player sober and healthy with true info, OR make their ability work twice.', tipsAndTricks: ['Enhance player abilities', 'Cure drunk/poison or double power', 'Storyteller chooses effect'], bluffingAs: ['Traveller role'] },
  { id: 'harlot', name: 'Harlot', edition: 'traveler', team: 'traveler', ability: 'Each night*, choose a living player: if they agree, you learn their character, but you both might die.', firstNightOrder: null, otherNightOrder: 6, setup: false, reminders: ['Dead'], flavorQuote: '"Come with me, darling."', extendedSummary: 'Each night, choose a player. If they agree to your visit, you learn their character but either or both of you might die.', tipsAndTricks: ['Risky character learning', 'Both can die from visit', 'Player must agree'], bluffingAs: ['Traveller'] },
  { id: 'butcher', name: 'Butcher', edition: 'traveler', team: 'traveler', ability: 'Each day, after the 1st execution, you may nominate again.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Who\'s next?"', extendedSummary: 'After the first execution each day, you may make one additional nomination. Enables double executions.', tipsAndTricks: ['Two executions possible', 'Speeds up game', 'Use wisely'], bluffingAs: ['Traveller ability'] },
  { id: 'bonecollector', name: 'Bone Collector', edition: 'traveler', team: 'traveler', ability: 'Once per game, at night*, choose a dead player: they regain their ability until dusk.', firstNightOrder: null, otherNightOrder: 42, setup: false, reminders: ['No Ability', 'Has Ability'], flavorQuote: '"I collect memories."', extendedSummary: 'Once per game, revive a dead player ability until dusk. They can use their ability one more time.', tipsAndTricks: ['Resurrect powerful abilities', 'One-time use', 'Choose wisely'], bluffingAs: ['Traveller'] },
  { id: 'deviant', name: 'Deviant', edition: 'traveler', team: 'traveler', ability: 'If you were funny today, you can\'t die by exile.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Ha ha ha!"', extendedSummary: 'If you made people laugh today (Storyteller judges), you cannot be exiled. Humor protects you.', tipsAndTricks: ['Be entertaining to survive', 'Exile protection through comedy', 'Storyteller judges humor'], bluffingAs: ['Traveller role'] },
];

// ===================
// JINXES
// ===================

export const JINXES: Jinx[] = [
  // Spy jinxes
  { character1: 'spy', character2: 'magician', reason: 'When the Spy sees the Grimoire, the Demon and Magician\'s character tokens are swapped.' },
  { character1: 'spy', character2: 'poppy_grower', reason: 'If the Poppy Grower is in play, the Spy does not see the Grimoire until the Poppy Grower dies.' },
  { character1: 'spy', character2: 'damsel', reason: 'Only 1 jinxed character can be in play.' },
  { character1: 'spy', character2: 'heretic', reason: 'Only 1 jinxed character can be in play.' },
  
  // Widow jinxes
  { character1: 'widow', character2: 'magician', reason: 'When the Widow sees the Grimoire, the Demon and Magician\'s character tokens are swapped.' },
  { character1: 'widow', character2: 'poppy_grower', reason: 'If the Poppy Grower is in play, the Widow does not see the Grimoire until the Poppy Grower dies.' },
  { character1: 'widow', character2: 'damsel', reason: 'Only 1 jinxed character can be in play.' },
  { character1: 'widow', character2: 'heretic', reason: 'Only 1 jinxed character can be in play.' },
  
  // Recluse jinxes
  { character1: 'recluse', character2: 'spy', reason: 'Only 1 jinxed character can be in play.' },
  
  // Lunatic jinxes
  { character1: 'lunatic', character2: 'mathematician', reason: 'The Mathematician learns if the Lunatic\'s ability worked correctly, but not if the Demon\'s did.' },
  
  // Godfather jinxes
  { character1: 'godfather', character2: 'heretic', reason: 'Only 1 jinxed character can be in play.' },
  
  // Pit-Hag jinxes
  { character1: 'pitHag', character2: 'heretic', reason: 'A Heretic cannot be created.' },
  { character1: 'pitHag', character2: 'damsel', reason: 'If the Pit-Hag creates a Damsel, the Storyteller chooses which player it is.' },
  
  // Fang Gu jinxes
  { character1: 'fangGu', character2: 'scarletwoman', reason: 'If the Fang Gu chooses an Outsider and dies, the Scarlet Woman does not become the Fang Gu.' },
  
  // Vigormortis jinxes
  { character1: 'vigormortis', character2: 'scarletwoman', reason: 'If the Vigormortis kills the Scarlet Woman, she does not become poisoned.' },
  
  // Evil Twin jinxes
  { character1: 'evilTwin', character2: 'magician', reason: 'The Demon learns a Good Twin rather than a Minion.' },
];

// ===================
// OFFICIAL SCRIPTS
// ===================

export const OFFICIAL_SCRIPTS = [
  {
    id: 'tb',
    name: 'Trouble Brewing',
    author: 'The Pandemonium Institute',
    description: 'The classic introductory script. Balanced and beginner-friendly with clear-cut roles and straightforward abilities.',
    isOfficial: true,
    characters: TROUBLE_BREWING.map(c => c.id),
  },
  {
    id: 'bmr',
    name: 'Bad Moon Rising',
    author: 'The Pandemonium Institute', 
    description: 'A deadly script where death comes often. Features resurrection, protection, and a focus on the night phase.',
    isOfficial: true,
    characters: BAD_MOON_RISING.map(c => c.id),
  },
  {
    id: 'snv',
    name: 'Sects & Violets',
    author: 'The Pandemonium Institute',
    description: 'A mad script focused on information, madness, and manipulation. Features character-swapping and mental pressure.',
    isOfficial: true,
    characters: SECTS_AND_VIOLETS.map(c => c.id),
  },
];

// ===================
// COMBINED DATA
// ===================

export const ALL_CHARACTERS: Character[] = [
  ...TROUBLE_BREWING,
  ...BAD_MOON_RISING,
  ...SECTS_AND_VIOLETS,
  ...TRAVELLERS,
];

// Helper function to get character by ID
export function getCharacterById(id: string): Character | undefined {
  return ALL_CHARACTERS.find(c => c.id === id);
}

// Helper function to get all jinxes for a character
export function getJinxesForCharacter(characterId: string): Jinx[] {
  return JINXES.filter(j => j.character1 === characterId || j.character2 === characterId);
}

// Helper function to check for jinxes between two characters
export function getJinxBetween(char1Id: string, char2Id: string): Jinx | undefined {
  return JINXES.find(j => 
    (j.character1 === char1Id && j.character2 === char2Id) ||
    (j.character1 === char2Id && j.character2 === char1Id)
  );
}

// Helper function to get characters by edition
export function getCharactersByEdition(edition: string): Character[] {
  return ALL_CHARACTERS.filter(c => c.edition === edition);
}

// Helper function to get characters by team
export function getCharactersByTeam(team: string): Character[] {
  return ALL_CHARACTERS.filter(c => c.team === team);
}
