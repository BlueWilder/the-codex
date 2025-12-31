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
  howToRun?: string;        // Storyteller instructions for running this character
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
    ],
    howToRun: "While preparing the first night, put the Washerwoman's TOWNSFOLK reminder token by any Townsfolk character token, and put the Washerwoman's WRONG reminder token by any other character token.\n\nDuring the first night, wake the Washerwoman and point to the players marked TOWNSFOLK and WRONG. Show the character token marked TOWNSFOLK to the Washerwoman. Put the Washerwoman to sleep. Remove the Washerwoman's reminder tokens when convenient."
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
    ],
    howToRun: "While preparing the first night, put the Librarian's OUTSIDER reminder token by any Outsider character token, and put the Librarian's WRONG reminder token by any other character token.\n\nDuring the first night, wake the Librarian and point to the players marked OUTSIDER and WRONG. Show the character token marked OUTSIDER to the Librarian. Put the Librarian to sleep. Remove the Librarian's reminder tokens when convenient."
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
    ],
    howToRun: "While preparing the first night, put the Investigator's MINION reminder token by any Minion character token, and put the Investigator's WRONG reminder token by any other character token.\n\nDuring the first night, wake the Investigator and point to the players marked MINION and WRONG. Show the character token marked MINION to the Investigator. Put the Investigator to sleep. Remove the Investigator's reminder tokens when convenient."
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
    ],
    howToRun: "During the first night, wake the Chef. Show the Chef fingers (0, 1, 2, etc.) equaling the number of pairs of neighboring evil players. Put the Chef to sleep."
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
    ],
    howToRun: "Each night, wake the Empath. Show them fingers (0, 1, or 2) equaling the number of evil players neighbouring the Empath. Put the Empath to sleep."
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
    ],
    howToRun: "While preparing the first night, put the Fortune Teller's RED HERRING reminder token by any good character token, marking that player as the Red Herring.\n\nEach night, wake the Fortune Teller. The Fortune Teller points at any two players. If either chosen player is a Demon or the Red Herring, nod your head yes. Otherwise, shake your head no. Put the Fortune Teller to sleep.\n\nIn smaller games, making the Fortune Teller their own Red Herring is sometimes advised, as the Fortune Teller gets more information that way."
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
    ],
    howToRun: "If a player dies by execution, put the Undertaker's DIED TODAY reminder token by the dead player's character token.\n\nEach night except the first, if any player died by execution today, wake the Undertaker. Show the character token marked DIED TODAY to the Undertaker. Put the Undertaker to sleep. Remove the Undertaker's reminder token when convenient.\n\nIn Trouble Brewing, there can only be one execution per day, and every execution causes a player to die. In other editions, there may be more than one execution per day (in which case the Storyteller chooses which character to show the Undertaker) or the execution does not cause a death (in which case the Undertaker learns nothing)."
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
    ],
    howToRun: "Each night except the first, wake the Monk. The Monk points at any player except themself. (If the Monk points at themself, shake your head no and prompt them to point at another player.) Put the Monk to sleep. Put the Monk's SAFE reminder token by the chosen player's character token.\n\nIf the Demon attacks the player marked SAFE, the player remains alive. At dawn, declare that no one died at night. (Do not say why.)\n\nAt dawn, remove the SAFE reminder token.\n\nIn other editions, Demons may have abilities other than killing. The Monk's protection also prevents all other harmful effects of the Demon's ability, such as poisoning or turning the protected player evil."
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
    ],
    howToRun: "If the Ravenkeeper died tonight, wake them. They point at any player. Show the chosen player's character token to the Ravenkeeper. Put the Ravenkeeper to sleep.\n\nWe advise you to discourage or even ban players from talking about what they are doing at night as they are doing it."
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
    ],
    howToRun: "If the first player to ever nominate the Virgin is a Townsfolk, immediately declare that the nominating player is executed. That player dies—put a shroud on their character token in the Grimoire. The Virgin loses their ability—put the Virgin's NO ABILITY reminder token by the Virgin token. End the nomination process and proceed to the night phase. (No one else can be executed today.)\n\nIf the first player to ever nominate the Virgin is not a Townsfolk, continue the vote as normal. The Virgin loses their ability—put the Virgin's NO ABILITY reminder token by the Virgin token."
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
    ],
    howToRun: "During the day, the Slayer can declare that they wish to use their ability. If so, the Slayer points at any player. If the chosen player is an alive Demon, declare that the chosen player dies—put a shroud on their character token in the Grimoire. If the chosen player is not an alive Demon, say \"Nothing happens.\" Either way, the Slayer loses their ability—put the Slayer's NO ABILITY reminder token by the Slayer token.\n\nIf a player is bluffing as the Slayer and declares they wish to use their ability, act as if they were indeed the Slayer—allow time for discussion, let them make the decision, and act like you're fiddling with tokens in your Grimoire, then say \"Nothing happens.\"\n\nWhen the Slayer declares that they wish to use their ability, give the group a minute or two to discuss who the Slayer should choose. This allows the group to feel responsible for the win (or the loss!), but the Slayer always makes the final choice."
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
    ],
    howToRun: "During the night, if the Demon attacks the Soldier, the Soldier remains alive. (At dawn, declare that no one died at night.)\n\nIn other editions, Demons may have abilities other than killing. The Soldier is also protected from all other harmful effects of the Demon's ability, such as poisoning or turning the Soldier evil."
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
    ],
    howToRun: "During the night, if the Mayor would die, you choose if the Mayor actually dies, or if the Mayor remains alive and another character dies instead—put the Demon's DEAD reminder token by that character token instead of the Mayor, and put a shroud on that character token instead of the Mayor.\n\nAt dawn, declare that the player marked DEAD died at night. (Do not say how they died.)\n\nAt dusk, if exactly three players are alive and no player was executed today, declare that the game ends and good wins.\n\nWe recommend you keep the Mayor alive until the final day, since it is most fun for the players that way. On rare occasions, if the group is overwhelmingly convinced early in the game that the Mayor is the Mayor, let the Mayor die so that evil has a chance to win."
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
    ],
    howToRun: "Each night, wake the Butler. The Butler points at any player. Put the Butler to sleep. Put the Butler's MASTER reminder token by the chosen player's character token.\n\nDuring the day, if the Butler raises their hand to vote, count their vote only if the player marked MASTER has their hand raised to vote too. (If the Master has their hand down, the Butler's vote doesn't count.)"
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
    ],
    howToRun: "During setup, put the Drunk's IS THE DRUNK reminder token by any Townsfolk character token. Swap that character token with the Drunk token. Put the swapped-out character token in the bag, instead of a Townsfolk character that would normally be in the bag.\n\nThe Drunk player thinks they are the Townsfolk that was swapped out. Wake them when that Townsfolk would normally wake to act. Wake them to give them false information, or let them act but have their ability do nothing or something else."
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
    ],
    howToRun: "The Recluse might register as evil, or as a Minion or Demon, to abilities that detect or affect evil, Minions, or Demons. You choose whether to do this on a case by case basis. The Recluse should usually register as evil, a Minion, or a Demon about half the time."
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
    ],
    howToRun: "If the Saint dies by execution, declare that the game ends and evil wins."
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
    ],
    howToRun: "Each night, wake the Poisoner. The Poisoner points at any player. Put the Poisoner to sleep. Put the Poisoner's POISONED reminder token by the chosen player's character token. The chosen player is poisoned.\n\nAt the start of each night, remove the POISONED reminder token."
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
    ],
    howToRun: "While preparing the first night, you may show any good character token to the players who have abilities that detect or affect Outsiders or Townsfolk.\n\nWhenever a Spy is in play, you may show the Spy's grimoire to the Spy during the night.\n\nThe Spy may register as good and as a Townsfolk or Outsider, even if dead. You may show good tokens for them to abilities that detect good or Townsfolk or Outsiders."
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
    ],
    howToRun: "If the Demon dies and there are five or more players alive (including Travellers), declare that the Scarlet Woman becomes the Demon. Replace the Scarlet Woman token with the Imp token. Wake the new Imp and show them the YOU ARE token, then the Imp token."
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
    ],
    howToRun: "While setting up the game, before putting character tokens in the bag, remove two Townsfolk tokens and add two Outsider tokens."
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
    ],
    howToRun: "Each night except the first, wake the Imp. The Imp points at any player. Put the Imp to sleep. The chosen player dies—put the Imp's DEAD reminder token by their character token and put a shroud on it.\n\nIf the Imp chose themselves: The Imp dies. Put a shroud on the Imp. Wake each other Minion. Show them the YOU ARE token, then the Imp token, then point at the chosen Minion. Put the new Imp to sleep."
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
    ],
    howToRun: "When preparing the first night, choose a Grandchild by marking any good character with the GRANDCHILD reminder.\n\nDuring the first night, wake the Grandmother and show them the character token marked GRANDCHILD, then point at the Grandchild player, then put the Grandmother to sleep.\n\nIf the Demon kills the Grandchild, the Grandmother dies—mark them with the DEAD reminder."
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
    ],
    howToRun: "Each night, wake the Sailor. They point at any player. Put the Sailor to sleep. Either the Sailor or this chosen player becomes drunk—mark them with the DRUNK reminder.\n\nIf the sober Sailor would die, the Sailor remains alive. If the sober Sailor is executed, declare that this player is executed but remains alive. (Do not say why.)"
  },
  { id: 'chambermaid', name: 'Chambermaid', edition: 'bmr', team: 'townsfolk', ability: 'Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.', firstNightOrder: 50, otherNightOrder: 69, setup: false, reminders: [], flavorQuote: '"I see all that happens in these halls."', extendedSummary: 'Each night, choose 2 players. You learn how many of them woke tonight due to their own ability (0, 1, or 2). Does not count being woken by other abilities.', tipsAndTricks: ['Confirm night-active roles like Monk', 'Zero might mean players are lying about roles', 'Track patterns across multiple nights'], bluffingAs: ['Claim numbers that confirm evil players', 'Complex to fake consistently'], howToRun: "Each night, wake the Chambermaid. They point at any two alive players except themself. Show the Chambermaid fingers (0, 1, or 2) equaling the number of chosen characters who woke tonight. Put the Chambermaid to sleep.\n\nDo not wake the Chambermaid if there are not two players alive to be chosen (due to the Mastermind, Zombuul, etc.)." },
  { id: 'exorcist', name: 'Exorcist', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn\'t wake tonight.', firstNightOrder: null, otherNightOrder: 21, setup: false, reminders: ['Chosen'], flavorQuote: '"The power of good compels you!"', extendedSummary: 'Each night except the first, choose a player (different from last night). If you choose the Demon, they learn you are the Exorcist and cannot kill tonight.', tipsAndTricks: ['No death means you hit the Demon', 'Demon knows who you are after you hit them', 'Rotate choices to eventually find Demon'], bluffingAs: ['Claim you caused a death-free night', 'Demon can confirm or deny your claims'], howToRun: "Each night except the first, wake the Exorcist. They point at any player. Mark the chosen player's character token with the CHOSEN reminder. Put the Exorcist to sleep.\n\nIf the Exorcist chose the Demon, wake the Demon. Show them the THIS CHARACTER SELECTED YOU info token and the Exorcist token, then point at the Exorcist player. Put the Demon to sleep. Later tonight, do not wake the Demon.\n\nA Demon chosen by the Exorcist will not wake to use their Demon ability, but will still wake if they need to due to other characters' abilities." },
  { id: 'innkeeper', name: 'Innkeeper', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose 2 players: they can\'t die tonight, but 1 is drunk until dusk.', firstNightOrder: null, otherNightOrder: 9, setup: false, reminders: ['Protected', 'Drunk'], flavorQuote: '"Come in, come in! The fire is warm."', extendedSummary: 'Each night except the first, choose 2 players. They cannot die tonight. However, one of them becomes drunk until dusk (Storyteller chooses which).', tipsAndTricks: ['Protect key players from Demon', 'One of your choices gets false info', 'Balance protection with drunking drawback'], bluffingAs: ['Explain why certain players survived', 'Claim responsibility for info discrepancies'], howToRun: "Each night except the first, wake the Innkeeper. They point at any two players. Put the Innkeeper to sleep. Mark the two chosen players with SAFE reminders. One of the chosen players becomes drunk—mark them with the DRUNK reminder. The players marked SAFE cannot die tonight.\n\nAt dawn, remove the SAFE reminders.\n\nAt dusk, remove the DRUNK reminder." },
  { id: 'gambler', name: 'Gambler', edition: 'bmr', team: 'townsfolk', ability: 'Each night*, choose a player & guess their character: if you guess wrong, you die.', firstNightOrder: null, otherNightOrder: 3, setup: false, reminders: ['Dead'], flavorQuote: '"All in."', extendedSummary: 'Each night except the first, choose a player and guess their character. If you guess correctly, nothing happens. If you guess wrong, you die.', tipsAndTricks: ['Guess confirmed players to stay safe', 'Correct guess confirms identity', 'High risk ability - use carefully'], bluffingAs: ['Claim correct guesses on specific players', 'Death explains why you stop claiming'], howToRun: "Each night except the first, wake the Gambler. They point at any player, then point at any character icon on their character sheet. Put the Gambler to sleep. If the chosen player is a different character from the chosen character icon, the Gambler dies—mark them with the DEAD reminder." },
  { id: 'gossip', name: 'Gossip', edition: 'bmr', team: 'townsfolk', ability: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.', firstNightOrder: null, otherNightOrder: 37, setup: false, reminders: ['Dead'], flavorQuote: '"Did you hear? Did you hear?"', extendedSummary: 'Each day, you may make a public statement. That night, if your statement was true, a player dies (Storyteller chooses who). False statements cause no death.', tipsAndTricks: ['Make obviously false statements to avoid kills', 'True statements kill - be careful with facts', 'Use as information by tracking which statements killed'], bluffingAs: ['Claim Gossip to explain random deaths', 'Complex ability to fake'], howToRun: "Each day, if the Gossip makes a definite, true public statement, put the Gossip's DEAD reminder in the center of the left side of the Grimoire as a reminder to yourself to place it tonight.\n\nEach night except the first, if the Gossip made a definite, true public statement today, you choose any player. The chosen player dies—mark them with the DEAD reminder.\n\nWhen choosing a player to die due to the Gossip ability, we recommend that you choose a character that will actually die, not one protected from death by an ability (like the Fool or Tea Lady). The Gossip gains knowledge when their statement caused a death." },
  { id: 'courtier', name: 'Courtier', edition: 'bmr', team: 'townsfolk', ability: 'Once per game, at night, choose a character: they are drunk for 3 nights & 3 days.', firstNightOrder: 18, otherNightOrder: 8, setup: false, reminders: ['Drunk 1', 'Drunk 2', 'Drunk 3', 'No Ability'], flavorQuote: '"I know exactly what to say."', extendedSummary: 'Once per game, choose a character (not a player). That character becomes drunk for 3 days and 3 nights. Works on any character in play.', tipsAndTricks: ['Drunk the Demon to prevent kills', 'Target evil characters for maximum impact', 'Save for when you identify a threat'], bluffingAs: ['Claim to have drunked specific characters', 'Explain why certain abilities malfunctioned'], howToRun: "Each night, wake the Courtier. They either shake their head no or point at any character icon on their character sheet. Put the Courtier to sleep.\n\nIf the Courtier chose a character icon and that character is in play, the player of the chosen character becomes drunk for three nights and three days. Tonight, mark them with the Courtier's DRUNK 1 reminder. The next night, replace the DRUNK 1 reminder with the DRUNK 2 reminder. The next night, replace the DRUNK 2 reminder with the DRUNK 3 reminder. At dusk on the next night, remove the DRUNK 3 reminder, and the Courtier loses their ability—mark them with the NO ABILITY reminder and remove their night token from the night sheet.\n\nAfter the Courtier chooses a character to make drunk, do not wake the Courtier for the rest of the game." },
  { id: 'professor', name: 'Professor', edition: 'bmr', team: 'townsfolk', ability: 'Once per game, at night*, choose a dead player: if they are a Townsfolk, they are resurrected.', firstNightOrder: null, otherNightOrder: 43, setup: false, reminders: ['Alive', 'No Ability'], flavorQuote: '"I have studied the dark arts, but only for good."', extendedSummary: 'Once per game, at night (not the first), choose a dead player. If they were a Townsfolk, they come back to life. If not Townsfolk, nothing happens.', tipsAndTricks: ['Resurrect confirmed Townsfolk', 'Failed resurrection reveals non-Townsfolk', 'Powerful ability - choose wisely'], bluffingAs: ['Claim failed resurrection on Outsider/evil', 'Hard to fake successful resurrection'], howToRun: "Each night except the first, wake the Professor. The Professor either shakes their head no or points to a dead player. Put the Professor to sleep.\n\nIf the Professor chose a dead Townsfolk, the chosen player becomes alive again—mark them with the Professor's ALIVE reminder and remove their shroud. (They wake later tonight if they normally would. If they wake on the first night only, they wake now to use their ability.) At dawn, after declaring which players died, declare which player is alive again. (Do not say why.) The Professor loses their ability—mark them with the NO ABILITY reminder and remove their night token from the night sheet." },
  { id: 'minstrel', name: 'Minstrel', edition: 'bmr', team: 'townsfolk', ability: 'When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Everyone Drunk'], flavorQuote: '"A song for the fallen..."', extendedSummary: 'When a Minion is executed, all players except Travellers become drunk until dusk the next day. Minstrel is also drunk. This is passive.', tipsAndTricks: ['Executing Minion causes mass drunkenness', 'Demon attacks still happen while drunk', 'Plan around potential drunk day'], bluffingAs: ['Claim Minstrel to explain mass confusion', 'Passive ability is easy to claim'], howToRun: "During the day, if a Minion dies by execution, all other players except Travellers become drunk—put the Minstrel's EVERYONE IS DRUNK reminder in the center of the left side of the Grimoire.\n\nAt dusk tomorrow, all players made drunk by the Minstrel become sober—remove the EVERYONE IS DRUNK reminder." },
  { id: 'tealady', name: 'Tea Lady', edition: 'bmr', team: 'townsfolk', ability: 'If both your alive neighbours are good, they can\'t die.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Protected'], flavorQuote: '"Would you like a cup of tea?"', extendedSummary: 'If both your alive neighbours are good, they cannot die by any means. If one neighbour is evil, this protection is lost.', tipsAndTricks: ['Sit between trusted good players', 'Your neighbours being alive is strong', 'Evil will try to break your chain'], bluffingAs: ['Explain why neighbours survived', 'Requires knowledge of neighbour alignments'], howToRun: "If both alive neighbours of the Tea Lady are good, mark those neighbours' character tokens with the Tea Lady's CANNOT DIE reminders. If either alive neighbour of the Tea Lady is evil, remove these reminders. Update these reminders immediately based on this condition throughout the entire game (such as if a player's alignment changes).\n\nIf a player marked CANNOT DIE would die, they remain alive. If a player marked CANNOT DIE is executed, declare that the marked player is executed but remains alive. (Do not say why.)" },
  { id: 'pacifist', name: 'Pacifist', edition: 'bmr', team: 'townsfolk', ability: 'Executed good players might not die.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Violence is never the answer."', extendedSummary: 'When a good player is executed, they might not die. The Storyteller decides. This is passive and always active while you are alive and sober.', tipsAndTricks: ['Good players might survive execution', 'Creates uncertainty around executions', 'Evil will want you dead'], bluffingAs: ['Explain why executed players survived', 'Passive - easy to claim'], howToRun: "If a good character is executed, declare either that they die or they remain alive. (Do not say why.) Then, begin the night phase. (Whether the player lived or died, this was the one execution for the day.)\n\nTriggering the Pacifist ability once per game is usually about right. You can trigger it more if you feel it is appropriate. On rare occasions, to make the Pacifist look suspicious, you can never trigger it." },
  { id: 'fool', name: 'Fool', edition: 'bmr', team: 'townsfolk', ability: 'The first time you die, you don\'t.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['No Ability'], flavorQuote: '"La la la!"', extendedSummary: 'The first time you would die (by any cause), you do not die. You appear to die but survive. After this, you die normally.', tipsAndTricks: ['You get one free death', 'Coming out can waste Demon attacks', 'Execution survival is very suspicious'], bluffingAs: ['Explain surviving night attack', 'Only works for first death'], howToRun: "If the Fool would die, they remain alive. (But they die if they are drunk or poisoned.) If the Fool was executed, declare that the player was executed but remains alive. (Do not say why.)\n\nEither way, the Fool loses their ability—mark them with the NO ABILITY reminder." },

  // OUTSIDERS
  { id: 'tinker', name: 'Tinker', edition: 'bmr', team: 'outsider', ability: 'You might die at any time.', firstNightOrder: null, otherNightOrder: 48, setup: false, reminders: ['Dead'], flavorQuote: '"I wonder what this button does..."', extendedSummary: 'The Storyteller may kill you at any time - day or night, for any reason or no reason. Your death can happen suddenly without warning.', tipsAndTricks: ['Your random death confuses investigations', 'Come out so team knows deaths may be random', 'Storyteller usually kills you at dramatic moments'], bluffingAs: ['Cannot reliably bluff Tinker', 'Your death pattern must be unpredictable'], howToRun: "The Tinker might die at any time. You choose when. Kill them when it is dramatically appropriate, or when it would be funny. Consider not killing them until the Demon has attacked them, so that there is some continuity in who dies at night." },
  { id: 'moonchild', name: 'Moonchild', edition: 'bmr', team: 'outsider', ability: 'When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.', firstNightOrder: null, otherNightOrder: 49, setup: false, reminders: ['Dead'], flavorQuote: '"The moon speaks to me."', extendedSummary: 'When you die (and learn it), immediately choose a living player publicly. That night, if your choice was a good player, they die.', tipsAndTricks: ['Choose someone you think is evil', 'Wrong guess kills a good player', 'Death trigger is immediate and public'], bluffingAs: ['Risky - wrong choice kills good player', 'Creates pressure on your target'], howToRun: "If the Moonchild died during the night, mark them with the DEAD reminder. At dawn, wake them and let them point at any player. Mark that player with the Moonchild's reminder.\n\nIf the Moonchild was good when they died, and they chose a good player, that good player dies. Announce this death." },
  { id: 'goon', name: 'Goon', edition: 'bmr', team: 'outsider', ability: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Drunk'], flavorQuote: '"I do what I\'m told."', extendedSummary: 'Each night, the first player to target you with an ability becomes drunk until dusk. You become their alignment (good or evil).', tipsAndTricks: ['Your alignment can flip to evil', 'Drunking abilities that target you', 'Complex interactions - track carefully'], bluffingAs: ['Explain alignment confusion', 'Complex ability to fake'], howToRun: "Each night, if the Goon was targeted by a player who chose them tonight, mark that player with the Goon's DRUNK reminder. Also mark the Goon with the TURNS EVIL reminder if they were good.\n\nAt dusk, if the Goon is marked TURNS EVIL, they become evil. Remove the TURNS EVIL reminder. Remove any DRUNK reminders as normal at dawn." },
  { id: 'lunatic', name: 'Lunatic', edition: 'bmr', team: 'outsider', ability: 'You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.', firstNightOrder: 7, otherNightOrder: 22, setup: true, reminders: ['Attack 1', 'Attack 2', 'Attack 3'], flavorQuote: '"I am the night!"', extendedSummary: 'You are told you are the Demon and "kill" each night, but you are actually the Lunatic. The real Demon knows who you are and sees your choices.', tipsAndTricks: ['Your kills do not happen', 'Real Demon uses your choices as info', 'When you realize, help good team'], bluffingAs: ['Cannot bluff Lunatic - you would not know', 'Demon can claim to be Lunatic'], howToRun: "While setting up the game, put the Lunatic token in the Grimoire instead of a Demon token, then put that Demon token in front of the Lunatic player like a character reminder.\n\nDuring the first night, wake the Lunatic and act as if they are the Demon. Show them the THIS IS YOU info token and the Demon token. Point to their fake Minions. Show them three not-in-play characters as bluffs.\n\nEach night, wake the Lunatic and act as if they are the Demon. Allow them to choose players as if they are attacking. The Demon may or may not kill the players the Lunatic chose, at the Storyteller's discretion." },

  // MINIONS
  { id: 'godfather', name: 'Godfather', edition: 'bmr', team: 'minion', ability: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]', firstNightOrder: 20, otherNightOrder: 38, setup: true, reminders: ['Dead', 'Died Today'], flavorQuote: '"I\'ll make you an offer you can\'t refuse."', extendedSummary: 'You start knowing which Outsiders are in play. On nights after an Outsider dies that day, you choose a player to kill. Setup modifies Outsider count by 1.', tipsAndTricks: ['Kill on nights after Outsider deaths', 'Use Outsider knowledge strategically', 'Second kill makes for deadly nights'], fightingThe: ['Track Outsider deaths and night kills', 'Second kill on some nights suggests Godfather', 'Outsider count may be modified'], howToRun: "While setting up the game, put an Outsider token in the bag instead of a Townsfolk token.\n\nDuring the first night, wake the Godfather. Show them the character tokens of all the Outsiders in play. Put the Godfather to sleep.\n\nIf an Outsider died today, mark them with the Godfather's DIED TODAY reminder. That night, wake the Godfather. They point at any player. Put the Godfather to sleep. The chosen player dies—mark them with the DEAD reminder. Remove the DIED TODAY reminder." },
  { id: 'devilsadvocate', name: 'Devil\'s Advocate', edition: 'bmr', team: 'minion', ability: 'Each night, choose a living player (different to last night): if executed tomorrow, they don\'t die.', firstNightOrder: 21, otherNightOrder: 13, setup: false, reminders: ['Survives'], flavorQuote: '"I am simply presenting the other side."', extendedSummary: 'Each night, choose a player (different from last night). If that player is executed tomorrow, they survive the execution.', tipsAndTricks: ['Protect Demon from execution', 'Protect yourself if suspected', 'Failed executions create confusion'], fightingThe: ['Execute same player twice', 'Surviving execution is suspicious', 'DA must switch targets each night'], howToRun: "Each night, wake the Devil's Advocate. They point at any player. Put the Devil's Advocate to sleep. Mark that player with the SURVIVES EXECUTION reminder.\n\nIf a player marked SURVIVES EXECUTION is executed, declare that the player is executed but remains alive. (Do not say why.) At dusk, remove the SURVIVES EXECUTION reminder." },
  { id: 'assassin', name: 'Assassin', edition: 'bmr', team: 'minion', ability: 'Once per game, at night*, choose a player: they die, even if for some reason they could not.', firstNightOrder: null, otherNightOrder: 36, setup: false, reminders: ['Dead', 'No Ability'], flavorQuote: '"Silent. Deadly. Professional."', extendedSummary: 'Once per game, at night (not the first), choose a player. They die, bypassing all protection. Kills through Sailor, Tea Lady, etc.', tipsAndTricks: ['Save for protected targets', 'Bypass all death prevention', 'Coordinate with Demon timing'], fightingThe: ['One unstoppable kill from Assassin', 'Protected player dying suggests Assassin', 'Only works once per game'], howToRun: "Each night except the first, wake the Assassin. The Assassin either shakes their head no or points at any player. Put the Assassin to sleep.\n\nIf the Assassin chose a player, that player dies, even if they would not normally die. This is a once per game ability. Mark them with the Assassin's DEAD reminder. Mark the Assassin with their NO ABILITY reminder and remove their night token from the night sheet." },
  { id: 'mastermind', name: 'Mastermind', edition: 'bmr', team: 'minion', ability: 'If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"All according to plan."', extendedSummary: 'If the Demon dies by execution (which would end the game), play continues for one more day. Whoever is executed on that day - their team loses.', tipsAndTricks: ['Insurance against Demon execution', 'Extra day creates pressure', 'Evil can win even after Demon dies'], fightingThe: ['Mastermind gives evil extra day', 'Be careful who you execute after Demon', 'No execution on Mastermind day wins for good'], howToRun: "If the Demon dies by execution and the game would end, continue playing the game. (The Demon remains dead.) The good team must successfully execute a second time to win; if they fail to do so, evil wins at the end of that day's execution." },

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
    ],
    howToRun: "The first time the Zombuul would die, they remain alive but register as dead. Add a shroud to their character token as a reminder. The Zombuul can then be executed again to truly die.\n\nEach night, if no player died today, wake the Zombuul. They point at any player. That player dies—mark them with the DEAD reminder. Put the Zombuul to sleep."
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
    ],
    howToRun: "Each night, wake the Pukka. They point at any player. Put the Pukka to sleep. Mark that player with the POISONED reminder. The previously poisoned player dies—move the DEAD reminder to them. Remove the old POISONED reminder.\n\nThe Pukka poisons players at night, and those players die the following night."
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
    ],
    howToRun: "Each night except the first, wake the Shabaloth. They point at two players. Put the Shabaloth to sleep. Both players die—mark them with DEAD reminders.\n\nAt any time during the night (including during or after the Demon phase), the Shabaloth may choose to regurgitate a player who died at night. If so, that player becomes alive again—remove their shroud."
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
    ],
    howToRun: "Each night except the first, wake the Po. They point at zero, one, two, or three players. Put the Po to sleep.\n\nIf the Po chose no one last night, they may choose three players tonight. Otherwise, they may choose one player. The chosen players die—mark them with DEAD reminders.\n\nIf the Po chose no one, mark them with the 3 ATTACKS reminder."
  },
];

// ===================
// SECTS & VIOLETS
// ===================

export const SECTS_AND_VIOLETS: Character[] = [
  // TOWNSFOLK
  { id: 'clockmaker', name: 'Clockmaker', edition: 'snv', team: 'townsfolk', ability: 'You start knowing how many steps from the Demon to its nearest Minion.', firstNightOrder: 40, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Tick, tock, tick, tock."', extendedSummary: 'On night one, you learn the distance (in seats) from the Demon to their nearest Minion, going either direction around the circle.', tipsAndTricks: ['Low number means Demon and Minion sit close', 'Use seating chart to narrow possibilities', 'Combine with other info for triangulation'], bluffingAs: ['Claim numbers that fit evil positions', 'High numbers spread suspicion widely'], howToRun: "During the first night, wake the Clockmaker. Show fingers (1, 2, etc.) equaling the distance in players from the Demon to the nearest Minion, starting with the player neighboring the Demon closer to that Minion. Put the Clockmaker to sleep." },
  { id: 'dreamer', name: 'Dreamer', edition: 'snv', team: 'townsfolk', ability: 'Each night, choose a player (not yourself or Travellers): you learn 1 good and 1 evil character, 1 of which is correct.', firstNightOrder: 41, otherNightOrder: 57, setup: false, reminders: [], flavorQuote: '"I saw it in a dream..."', extendedSummary: 'Each night, choose a player. You learn a good character and an evil character - one is their actual character, one is false.', tipsAndTricks: ['Process of elimination over multiple nights', 'Track which characters keep appearing', 'Coordinate with others for cross-reference'], bluffingAs: ['Create plausible pairs', 'Include real characters in your pairs'], howToRun: "Each night, wake the Dreamer. They point at any player. If the chosen player's character is a Townsfolk or Outsider, show their character token and any Minion or Demon token to the Dreamer. If the chosen player's character is a Minion or Demon, show their character token and any Townsfolk or Outsider token to the Dreamer. Then, put the Dreamer to sleep.\n\nIf the Dreamer chooses an evil player, you can help the evil team if you show the Dreamer the good character that this evil player is bluffing as, or if you show a more secretive character such as the Snake Charmer, Sage, Mutant, or Klutz." },
  { id: 'snakecharmer', name: 'Snake Charmer', edition: 'snv', team: 'townsfolk', ability: 'Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.', firstNightOrder: 19, otherNightOrder: 10, setup: false, reminders: ['Poisoned'], flavorQuote: '"Come to me, little one."', extendedSummary: 'Each night, choose a player. If they are the Demon, you swap characters and alignments with them - they become good Snake Charmer, you become evil Demon (but poisoned).', tipsAndTricks: ['Hit the Demon and you become the Demon', 'Now-good Demon was evil, might act evil', 'Your new Demon status is poisoned initially'], bluffingAs: ['Risky ability to claim', 'Hitting Demon changes everything'], howToRun: "Each night, wake the Snake Charmer. They point at any player.\n\nIf that player is not the Demon, nothing happens. Put the Snake Charmer to sleep.\n\nIf that player is the Demon, the old Snake Charmer changes into the new (evil) Demon, and the old Demon changes into the new (good) Snake Charmer—swap the Snake Charmer token and the Demon's token. The new Snake Charmer is poisoned—mark them with the POISONED reminder. Wake the new Demon and show them the YOU ARE info token, a thumbs-down, the YOU ARE token, then the Demon's token. (This shows they are now evil and the Demon.) Put the new Demon to sleep. Wake the new Snake Charmer and show them the YOU ARE info token, a thumbs-up, the YOU ARE info token, then the Snake Charmer token. (This shows they are now good and the Snake Charmer.) Put the new Snake Charmer to sleep." },
  { id: 'mathematician', name: 'Mathematician', edition: 'snv', team: 'townsfolk', ability: 'Each night, you learn how many players\' abilities worked abnormally (possibly due to another ability) since dawn today.', firstNightOrder: 51, otherNightOrder: 70, setup: false, reminders: ['Abnormal'], flavorQuote: '"The numbers never lie."', extendedSummary: 'Each night, you learn how many abilities malfunctioned since dawn (due to drunk, poison, etc). High numbers mean interference is happening.', tipsAndTricks: ['Zero means no interference today', 'High numbers suggest Poisoner or drunk', 'Track patterns to find source of interference'], bluffingAs: ['Claim low numbers to seem like no evil interference', 'Numbers are hard to verify'], howToRun: "Each time a character's ability works abnormally due to another character's ability, mark them with an ABNORMAL reminder.\n\nEach night, wake the Mathematician. Show fingers (0, 1, 2, etc.) equaling the number of characters with ABNORMAL reminders. Put the Mathematician to sleep. Remove all ABNORMAL reminders." },
  { id: 'flowergirl', name: 'Flowergirl', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn if a Demon voted today.', firstNightOrder: null, otherNightOrder: 58, setup: false, reminders: ['Demon Voted', 'Demon Not Voted'], flavorQuote: '"Flowers for the dead?"', extendedSummary: 'Each night except the first, you learn whether the Demon raised their hand to vote on any execution today (Yes or No).', tipsAndTricks: ['Yes means Demon voted at least once', 'Cross-reference with voting records', 'No means Demon abstained all day'], bluffingAs: ['Claim Yes or No based on voting observed', 'Can frame or clear players'], howToRun: "Each dawn, mark the Flowergirl with the DEMON NOT VOTED reminder, and remove the DEMON VOTED reminder, if any.\n\nEach day, if the Demon votes for any execution, replace the DEMON NOT VOTED reminder with the DEMON VOTED reminder.\n\nEach night except the first, wake the Flowergirl. If the Flowergirl is marked DEMON NOT VOTED, shake your head no. If the Flowergirl is marked DEMON VOTED, nod your head yes. Then, put the Flowergirl to sleep.\n\nIf you forget whether the Demon voted or not, wake the Demon at night and ask by showing them the DID YOU VOTE TODAY? info token. They must answer honestly, then go to sleep." },
  { id: 'townCrier', name: 'Town Crier', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn if a Minion nominated today.', firstNightOrder: null, otherNightOrder: 59, setup: false, reminders: ['Minion Nominated', 'Minion Not Nominated'], flavorQuote: '"Hear ye! Hear ye!"', extendedSummary: 'Each night except the first, you learn whether any Minion made a nomination today (Yes or No).', tipsAndTricks: ['Yes means at least one Minion nominated', 'Track who nominated and cross-reference', 'Minions might avoid nominating'], bluffingAs: ['Claim based on nomination patterns', 'Yes is safer claim'], howToRun: "Each dawn, mark the Town Crier with the MINIONS NOT NOMINATED reminder, and remove the MINION NOMINATED reminder, if any.\n\nEach day, if any Minion makes a nomination, replace the MINIONS NOT NOMINATED reminder with the MINION NOMINATED reminder.\n\nEach night except the first, wake the Town Crier. If the Town Crier is marked MINIONS NOT NOMINATED, shake your head no. If the Town Crier is marked MINION NOMINATED, nod your head yes. Then, put the Town Crier to sleep. Remove the MINION NOMINATED reminder, if any.\n\nIf you forget whether a Minion made a nomination or not, wake each Minion at night and ask by showing them the DID YOU NOMINATE TODAY? info token. They must answer honestly, then go to sleep." },
  { id: 'oracle', name: 'Oracle', edition: 'snv', team: 'townsfolk', ability: 'Each night*, you learn how many dead players are evil.', firstNightOrder: null, otherNightOrder: 60, setup: false, reminders: [], flavorQuote: '"The spirits whisper truths."', extendedSummary: 'Each night except the first, you learn how many dead players are evil. Helps identify if executed players were evil.', tipsAndTricks: ['Track count as players die', 'Increasing count means evil dying', 'Stable count means good dying'], bluffingAs: ['Claim counts that match expectations', 'Hard to fake as game progresses'], howToRun: "Each night except the first, wake the Oracle. Show fingers (0, 1, 2, etc.) equaling the number of dead evil players. Then, put the Oracle to sleep." },
  { id: 'savant', name: 'Savant', edition: 'snv', team: 'townsfolk', ability: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"I understand now."', extendedSummary: 'Once per day, you may privately visit the Storyteller. They tell you two statements - one true, one false. You must determine which is which.', tipsAndTricks: ['Privately get customized information', 'Compare statements to deduce truth', 'Powerful but uncertain info source'], bluffingAs: ['Make up plausible statement pairs', 'Private nature makes it easy to lie'], howToRun: "Once per day, if the Savant requests a private chat with you, take them away from the circle so you cannot be overheard. Whisper two pieces of information, one true and one false, to the Savant. (If you cannot think of two straight away, either take your time or ask them to come back in a few minutes.)\n\nKeep the information you give helpful and related to the game. Avoid saying who exactly the Demon is, or it could be a very short game. If you need help on choosing what to say, give information similar to what Townsfolk abilities would provide." },
  { id: 'seamstress', name: 'Seamstress', edition: 'snv', team: 'townsfolk', ability: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.', firstNightOrder: 42, otherNightOrder: 61, setup: false, reminders: ['No Ability'], flavorQuote: '"I can see through the seams."', extendedSummary: 'Once per game, choose two players at night. You learn if they are the same alignment (both good or both evil) or different.', tipsAndTricks: ['Use on suspicious players', 'Different means one good, one evil', 'Same means both good or both evil'], bluffingAs: ['Claim alignment matches you "found"', 'One-shot ability is easy to fake'], howToRun: "Each night, wake the Seamstress. They either shake their head no or point at any two players except themself.\n\nIf they shake their head no, nothing happens. Put the Seamstress to sleep.\n\nIf they point at two players, either nod your head yes (to indicate these players have the same alignment) or shake your head no (to indicate these players do not have the same alignment). Put the Seamstress to sleep. The Seamstress loses their ability—mark them with the NO ABILITY reminder and remove their night token from the night sheet." },
  { id: 'philosopher', name: 'Philosopher', edition: 'snv', team: 'townsfolk', ability: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.', firstNightOrder: 1, otherNightOrder: 1, setup: false, reminders: ['Is the Philosopher', 'Drunk'], flavorQuote: '"I think, therefore I am."', extendedSummary: 'Once per game, choose a good character to gain their ability. If that exact character is in play, they become drunk while you have the ability.', tipsAndTricks: ['Gain any good ability you want', 'Drunks the real character if in play', 'Very flexible power'], bluffingAs: ['Claim to have become specific role', 'Explains having two abilities'], howToRun: "Each night, wake the Philosopher. They either shake their head no or point at any Townsfolk icon or any Outsider icon on their character sheet. Put the Philosopher to sleep.\n\nIf they pointed to an icon of a character not in play, swap the Philosopher token with the chosen character token and mark them with the IS THE PHILOSOPHER reminder.\n\nIf they pointed to an icon of a character in play, the player of the chosen character becomes drunk—mark them with the DRUNK reminder. (You can now use the duplicated character's reminders for the Philosopher.) If the Philosopher dies, the player made drunk by the Philosopher becomes sober—remove the DRUNK reminder." },
  { id: 'artist', name: 'Artist', edition: 'snv', team: 'townsfolk', ability: 'Once per game, during the day, privately ask the Storyteller any yes/no question.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['No Ability'], flavorQuote: '"Let me paint you a picture."', extendedSummary: 'Once per game, during the day, privately ask the Storyteller any yes/no question. They will answer truthfully.', tipsAndTricks: ['Ask carefully worded questions', 'One question must count', 'Consider what info helps most'], bluffingAs: ['Claim you asked specific question', 'Private interaction easy to lie about'], howToRun: "During any day, the Artist can request a private chat with you. Take them away from the circle so you cannot be overheard. They will ask you a question. Whisper \"Yes,\" \"No,\" or \"I don't know,\" to them, or if you cannot answer in one of these ways, prompt the Artist to ask again in a different way. The Artist loses their ability—mark them with the NO ABILITY reminder.\n\nLike the Savant, evil players bluffing as the Artist may request a private chat with you and pretend to ask a question. To help them bluff, you can pretend to give an answer by nodding or shaking your head." },
  { id: 'juggler', name: 'Juggler', edition: 'snv', team: 'townsfolk', ability: 'On your 1st day, publicly guess up to 5 players\' characters. That night, you learn how many you got correct.', firstNightOrder: null, otherNightOrder: 62, setup: false, reminders: ['Correct'], flavorQuote: '"Watch carefully!"', extendedSummary: 'On day 1, publicly guess up to 5 player-character combinations. That night, you learn how many guesses were correct (0-5).', tipsAndTricks: ['Day 1 only - guess carefully', 'More guesses means more info', 'Public guesses give town info'], bluffingAs: ['Claim number of correct guesses', 'Day 1 timing is fixed'], howToRun: "During the first day, if the Juggler declares that they are using their ability, then you enter the circle, holding the Grimoire. The Juggler can make up to five guesses, each of any one player and any one character. For each correct guess, mark the Juggler with a CORRECT reminder. (Make sure the players don't see how many reminders you're placing.)\n\nThat night, wake the Juggler. Show them fingers (0, 1, 2, etc.) equaling the number of CORRECT reminders. Put the Juggler to sleep. Remove the CORRECT reminders and the Juggler's night token when convenient.\n\nIf the Juggler is guessing too fast, prompt them to slow down.\n\nIf an evil player is bluffing as the Juggler, it can help their bluff if you pretend to move tokens around the Grimoire as they make their fake guesses." },
  { id: 'sage', name: 'Sage', edition: 'snv', team: 'townsfolk', ability: 'If the Demon kills you, you learn that it is 1 of 2 players.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Knowledge comes with death."', extendedSummary: 'If you die at night due to Demon attack, you learn 2 players - one of them is the Demon. Information comes with your death.', tipsAndTricks: ['Death gives you Demon info', 'Share info when you die', 'Demon may avoid killing you'], bluffingAs: ['Claim Sage when dead with Demon guess', 'Need to die to "activate"'], howToRun: "If the Sage was killed by the Demon, wake the Sage. Point at two players, one of which is the Demon. Put the Sage to sleep." },

  // OUTSIDERS
  { id: 'mutant', name: 'Mutant', edition: 'snv', team: 'outsider', ability: 'If you are "mad" about being an Outsider, you might be executed.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"I am... different."', extendedSummary: 'If you act like or claim to be an Outsider (are "mad" about it), the Storyteller might execute you. You must pretend to be Townsfolk or not claim at all.', tipsAndTricks: ['Cannot claim Outsider safely', 'Must play as if you are Townsfolk', 'Execution threat is real'], bluffingAs: ['Hard role to directly claim', 'Mutant hides, not announces'], howToRun: "If a player claims to be the Mutant or a player says something like \"I might be the Mutant,\" you may choose to execute them immediately. (This can only happen during the day, and not during another execution.)" },
  { id: 'sweetheart', name: 'Sweetheart', edition: 'snv', team: 'outsider', ability: 'When you die, 1 player is drunk from now on.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: ['Drunk'], flavorQuote: '"My heart was too pure."', extendedSummary: 'When you die (by any means), the Storyteller chooses one player to become drunk for the rest of the game.', tipsAndTricks: ['Your death drunks someone permanently', 'Could drunk good or evil player', 'Death has consequences'], bluffingAs: ['Claim after death to explain drunk', 'Outsider with death trigger'], howToRun: "When the Sweetheart dies, you choose a player who becomes drunk. Mark them with the DRUNK reminder. This lasts until the Sweetheart is no longer dead." },
  { id: 'barber', name: 'Barber', edition: 'snv', team: 'outsider', ability: 'If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.', firstNightOrder: null, otherNightOrder: 40, setup: false, reminders: ['Haircuts Tonight'], flavorQuote: '"A little off the top?"', extendedSummary: 'If you die (day or night), the Demon may choose 2 players that night to swap characters. Cannot swap another Demon.', tipsAndTricks: ['Your death enables character swaps', 'Demon can create chaos', 'Swaps happen night of your death'], bluffingAs: ['Explain character confusion', 'Claim when characters seem swapped'], howToRun: "When the Barber dies, wake the Demon. Show the THIS CHARACTER SELECTED YOU info token, then the Barber token. The Demon either shakes their head no or points at two players. If they point at two players, swap those characters' tokens. If either of these characters have abilities that can affect setup, these abilities can not change the setup. Wake each affected player and show them the YOU ARE info token and their new character token. (Show the Demon this information first.)" },
  { id: 'klutz', name: 'Klutz', edition: 'snv', team: 'outsider', ability: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.', firstNightOrder: null, otherNightOrder: null, setup: false, reminders: [], flavorQuote: '"Oops!"', extendedSummary: 'When you die and learn it, you must publicly choose an alive player. If they are evil, good loses immediately. Choose carefully.', tipsAndTricks: ['Dying triggers lose condition risk', 'Must choose good player to not lose', 'Be very careful who you pick'], bluffingAs: ['Dangerous ability to have', 'Claim explains pressure on choice'], howToRun: "If the Klutz dies, immediately wake them. They point at a player. If that player is evil, the game ends and good wins.\n\nIf they pointed at a good player, the Klutz's death is announced as normal." },

  // MINIONS
  { id: 'evilTwin', name: 'Evil Twin', edition: 'snv', team: 'minion', ability: 'You & an opposing player know each other. If the good player is executed, evil wins. Good can\'t win if you both live.', firstNightOrder: 23, otherNightOrder: null, setup: true, reminders: ['Twin'], flavorQuote: '"We are one."', extendedSummary: 'You and a good player are Twins and know each other. If the good Twin is executed, evil wins. Good cannot win while both Twins live.', tipsAndTricks: ['Your Twin is your shield', 'Executing good Twin wins for evil', 'Both must die for good to win normally'], fightingThe: ['Identify which Twin is evil', 'Both Twins must eventually die', 'Never execute blindly between Twins'], howToRun: "While setting up the game, choose a Townsfolk or Outsider. Wake this player and the Evil Twin. Show the THIS IS THE EVIL TWIN info token, then point at the Evil Twin. Show the THESE CHARACTERS ARE IN PLAY info token, then point at the character token for the good twin and then at the player who is the good twin.\n\nAnytime during the day, if the good twin is executed and dies and the Evil Twin is alive, declare that evil wins." },
  { id: 'witch', name: 'Witch', edition: 'snv', team: 'minion', ability: 'Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.', firstNightOrder: 24, otherNightOrder: 14, setup: false, reminders: ['Cursed'], flavorQuote: '"I\'ll get you, my pretty!"', extendedSummary: 'Each night, curse a player. If they nominate anyone tomorrow, they die immediately. At 3 players, you lose this ability.', tipsAndTricks: ['Silence good players through fear', 'Kills happen on nomination', 'Lose ability at 3 players'], fightingThe: ['Death on nomination means Witch', 'Track who nominated before deaths', 'Safe at 3 players remaining'], howToRun: "Each night, wake the Witch. They point at a player. Mark that player with the CURSED reminder. Put the Witch to sleep.\n\nThe next day, if the player marked CURSED makes a nomination, they die immediately. Declare that the player died." },
  { id: 'cerenovus', name: 'Cerenovus', edition: 'snv', team: 'minion', ability: 'Each night, choose a player & a good character: they are "mad" they are this character tomorrow, or might be executed.', firstNightOrder: 25, otherNightOrder: 15, setup: false, reminders: ['Mad'], flavorQuote: '"Believe what I tell you to believe."', extendedSummary: 'Each night, choose a player and a good character. Tomorrow, they must pretend to be that character or risk execution by Storyteller.', tipsAndTricks: ['Force players to lie', 'Creates conflicting claims', 'Madness causes chaos'], fightingThe: ['Conflicting claims might be madness', 'Ask why someone changed their story', 'Cerenovus forces false claims'], howToRun: "Each night, wake the Cerenovus. They point at a player and at a character on their character sheet. Put the Cerenovus to sleep. Mark the chosen player with the MAD reminder and put a character reminder by that reminder to indicate what the player is mad about.\n\nIf that player does not pretend to be that character convincingly at some point during the day, you may execute them. (This can only happen during the day, and not during another execution.)" },
  { id: 'pitHag', name: 'Pit-Hag', edition: 'snv', team: 'minion', ability: 'Each night*, choose a player & a character they become (if not-in-play). If a Demon is made, deaths tonight are arbitrary.', firstNightOrder: null, otherNightOrder: 16, setup: false, reminders: [], flavorQuote: '"Let me fix that for you."', extendedSummary: 'Each night except first, change a player into a new character (not already in play). If you create a new Demon, all deaths that night are Storyteller\'s choice.', tipsAndTricks: ['Change characters at will', 'Can create new Demon', 'Disrupts ability expectations'], fightingThe: ['Characters might change overnight', 'Role claims may become outdated', 'Pit-Hag creates chaos'], howToRun: "Each night except the first, wake the Pit-Hag. They point at a player and at a character on their character sheet. If the chosen character is not in play, swap the chosen player's character token with the chosen character token. Wake the changed player and show them the YOU ARE info token, then their new character token. Put the Pit-Hag to sleep." },

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
    ],
    howToRun: "Each night except the first, wake the Fang Gu. They point at a player. Put the Fang Gu to sleep.\n\nIf the chosen player is not an Outsider, that player dies—mark them with the DEAD reminder.\n\nIf the chosen player is an Outsider, the Fang Gu dies—mark them with the DEAD reminder. The chosen player becomes an evil Fang Gu—swap the old Fang Gu character token with the new Fang Gu character token and turn it to show evil. Wake the new Fang Gu, show them the YOU ARE info token, then a thumbs-down, then the Fang Gu token. Put the new Fang Gu to sleep.\n\nThe Fang Gu can only swap to an Outsider once per game. After the swap, mark the original Fang Gu with the ONCE reminder."
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
    ],
    howToRun: "Each night except the first, wake the Vigormortis. They point at a player. Put the Vigormortis to sleep. The chosen player dies—mark them with the DEAD reminder.\n\nIf the dead player is a Minion, they keep their ability. Mark them with the HAS ABILITY reminder. One Townsfolk who is a neighbour of this dead Minion becomes poisoned—mark them with a POISONED reminder.\n\nMinions killed by the Vigormortis may or may not wake for their ability as appropriate, but should not speak at night."
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
    ],
    howToRun: "When the game begins, find the two Townsfolk that are closest to the No Dashii, clockwise and anticlockwise. Mark them both with POISONED reminders. If a new Townsfolk becomes a neighbour of the No Dashii, they become poisoned and the previous Townsfolk is no longer poisoned—move the relevant POISONED reminder.\n\nEach night except the first, wake the No Dashii. They point at a player. That player dies—mark them with the DEAD reminder. Put the No Dashii to sleep."
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
    ],
    howToRun: "Each night except the first, wake the Vortox. They point at a player. That player dies—mark them with the DEAD reminder. Put the Vortox to sleep.\n\nWhile the Vortox is alive, all information that would be given to Townsfolk is false. You may need to use a reminder to track whether information is false or not, depending on your ability."
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
  { character1: 'spy', character2: 'poppygrower', reason: 'If the Poppy Grower is in play, the Spy does not see the Grimoire until the Poppy Grower dies.' },
  { character1: 'spy', character2: 'damsel', reason: 'Only 1 jinxed character can be in play.' },
  { character1: 'spy', character2: 'heretic', reason: 'Only 1 jinxed character can be in play.' },
  
  // Widow jinxes
  { character1: 'widow', character2: 'magician', reason: 'When the Widow sees the Grimoire, the Demon and Magician\'s character tokens are swapped.' },
  { character1: 'widow', character2: 'poppygrower', reason: 'If the Poppy Grower is in play, the Widow does not see the Grimoire until the Poppy Grower dies.' },
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
// EXPERIMENTAL (THE CAROUSEL)
// ===================

export const EXPERIMENTAL: Character[] = [
  // TOWNSFOLK
  {
    id: 'acrobat',
    name: 'Acrobat',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night*, choose a player: if they are or become drunk or poisoned tonight, you die.',
    firstNightOrder: null,
    otherNightOrder: 40,
    setup: false,
    reminders: ['Chosen'],
    flavorQuote: "Ladies and gentlemen, hold fast to your hats, for I shall defy the very laws of gravity and dance upon the air, a marvel of agility and daring, all for your delight and wonder!",
    extendedSummary: `The Acrobat dies when they find a drunk or poisoned player.

Each night except the first, the Acrobat chooses a player. If the chosen player is sober and healthy, nothing happens. If the player is drunk or poisoned, the Acrobat dies.

If the Acrobat is drunk or poisoned, they cannot die to their own ability. The Acrobat may choose any player, dead or alive, even themselves.`,
    tipsAndTricks: [
      "Choose players you trust to be sober and healthy - their survival confirms your read on them.",
      "Avoid players who might be targeted by a Poisoner or could be the Drunk.",
      "Your death can confirm that a player was poisoned or drunk, which is useful information for the town.",
      "If you're confident about which players are likely poisoning targets, avoid them."
    ],
    bluffingAs: [
      "Claim to have chosen a player you want to cast suspicion on, implying they were drunk or poisoned.",
      "If you survive, you can confirm players as 'sober and healthy' which builds trust.",
      "Use your survival to support evil players - claim you chose them and they were fine."
    ]
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You have a Minion ability.',
    firstNightOrder: 35,
    otherNightOrder: null,
    setup: false,
    reminders: ['Is the Alchemist'],
    flavorQuote: "Visit the interior of the Earth. By rectification thou shalt find the hidden stone. Above the gold, lieth the red. Kether in Malkuth.",
    extendedSummary: `The Alchemist has a Minion ability.

The Alchemist's ability is usually that of a not-in-play Minion, but can duplicate an in-play Minion ability. They learn which ability this is on the first night.

They are still a good Townsfolk - they win when good wins. They register as good and as the Alchemist. The Alchemist does not wake to learn who the other Minions are or who the Demon is.`,
    tipsAndTricks: [
      "Figure out which Minion ability you have and use it to help the good team.",
      "If you have a Poisoner ability, poison players you suspect are evil.",
      "Your ability is powerful - use it wisely to support the town's goals.",
      "The Storyteller may ask you to choose differently if your choice would harm good too much."
    ],
    bluffingAs: [
      "Claim to have a Minion ability that isn't actually in play to confuse the good team.",
      "Use your 'ability' to justify suspicious behavior or night actions.",
      "Be careful - the real Alchemist knows what ability they have."
    ]
  },
  {
    id: 'alsaahir',
    name: 'Alsaahir',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I am here because of you, and you are here because of me.",
    extendedSummary: `The Alsaahir guesses the entire evil team.

The Alsaahir's guesses need to be public, and during the day. They don't have to guess every day. If the Alsaahir guesses the Demon player as the Demon, and the Minion players as Minions, the game ends immediately and good wins.

The Alsaahir doesn't need to guess specific Minion or Demon characters - just which players are which type.`,
    tipsAndTricks: [
      "Make a guess every day to narrow down who the evil team is.",
      "Wait a few days before your first guess to hide that you are the Alsaahir.",
      "Use your guesses to rule out pairs or groups of players that worry you.",
      "Seek out characters that detect evil players to boost your chances of guessing correctly."
    ],
    bluffingAs: [
      "It is easy to bluff as the Alsaahir early, as good players often do it too.",
      "Be careful with your guesses - put thought into who you guess each day.",
      "Ask for other players' advice on who to guess to make yourself look good."
    ]
  },
  {
    id: 'amnesiac',
    name: 'Amnesiac',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.',
    firstNightOrder: 32,
    otherNightOrder: 48,
    setup: false,
    reminders: ['?', '?', '?'],
    flavorQuote: "Wait. What. Who? Oh, ok. Wait. What?",
    extendedSummary: `The Amnesiac doesn't know their own ability.

The Storyteller decides what the Amnesiac's ability is. It may be the same ability as another character, something similar, or something original.

Each day, the Amnesiac talks to the Storyteller privately and makes a guess. The Storyteller answers "cold" if very wrong, "warm" if on the right track, "hot" if very close, and "bingo" if spot on.`,
    tipsAndTricks: [
      "Start with broad questions like 'Does my ability have to do with Outsiders?'",
      "Pay attention to what happens at night - are you woken? Do you choose players?",
      "Ask for the town's help in figuring out your ability.",
      "Remember that your Storyteller made your ability guessable."
    ],
    bluffingAs: [
      "You don't need an ability in mind when you start bluffing, but have one by the end.",
      "Pretend to guess your ability - this gives limitless room for deception.",
      "Invite the town to figure out your 'ability' with you to distract from finding the Demon."
    ]
  },
  {
    id: 'atheist',
    name: 'Atheist',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'The Storyteller can break the game rules, and if executed, good wins, even if you are dead. [No evil characters]',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: true,
    reminders: [],
    flavorQuote: "Let us disperse with unnecessary conjecture and silly paranoia. There is a perfectly rational explanation for everything.",
    extendedSummary: `The Atheist knows that all players are good and there is no such thing as Demons.

With the Atheist in play, there are no evil players. Good wins if the Storyteller is executed. Any living player may nominate the Storyteller.

The Storyteller may break any game rules - kill players at night, give false information, change characters, etc.`,
    tipsAndTricks: [
      "If you are the Atheist, you know who the Demon is: nobody. Execute the Storyteller to win.",
      "Reveal your character early - there's no point lying since there are no evil players.",
      "If there are characters that could make you drunk, figure out if you are drunk first.",
      "Look for inconsistencies in information as evidence the Storyteller is breaking rules."
    ],
    bluffingAs: [
      "Bluffing as the Atheist can convince good players to execute the Storyteller, causing evil to win.",
      "Try to make the good team's information seem too consistent or inconsistent.",
      "Be prepared for the players to execute you - have a backup plan."
    ]
  },
  {
    id: 'balloonist',
    name: 'Balloonist',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]',
    firstNightOrder: 44,
    otherNightOrder: 56,
    setup: true,
    reminders: ['Know'],
    flavorQuote: "More heat! Higher! Higher! Ahhh... it is so beautiful from up here, don't you agree?",
    extendedSummary: `The Balloonist learns players of different character types.

Each time the Balloonist learns a player, the player must have a different character type to the previously shown player. The Balloonist does not learn the character type.

During setup, the Storyteller may choose to add an Outsider due to the Balloonist's ability.`,
    tipsAndTricks: [
      "Pay attention to Outsider claims - you might have added an extra one.",
      "Talk to the player you learned each day to find out their claimed character.",
      "Lie about your role to stay alive longer - claim to be a less threatening character.",
      "If you learn two Townsfolk claims in a row, one of them is likely evil."
    ],
    bluffingAs: [
      "Since you might add an Outsider, have a Minion bluff as one.",
      "Keep an eye out for good players with information that paints others as evil.",
      "Wait a few days before sharing - this lets you figure out who is what type."
    ]
  },
  {
    id: 'banshee',
    name: 'Banshee',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'If the Demon kills you, all players learn this. From now on, you may nominate twice per day and vote twice per nomination.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Has ability'],
    flavorQuote: "Gorm do shúile, dearg do ghruaig, ní bheidh sé i bhfad, is a mbeidh tú san uaigh.",
    extendedSummary: `The Banshee becomes more powerful when dead, nominating and voting twice as much.

When dead, they may nominate twice per day and vote for any nomination without needing a vote token. They may vote twice for the same nomination.

The Banshee only gains these powers if killed by the Demon. Dying by execution or other abilities doesn't count.`,
    tipsAndTricks: [
      "Get killed by the Demon by any method that works for you!",
      "You get confirmed when you die - take advantage of this to gather information.",
      "Your votes become disproportionately powerful as numbers dwindle.",
      "Use your nominations every day - you can be assured a good player is nominating."
    ],
    bluffingAs: [
      "If you die at night without announcement, your bluff is ruined! Make sure the Demon knows.",
      "Bluff as something else and back into a Banshee claim if forced.",
      "Come out as Banshee early and dare evil to kill you - this can build trust."
    ]
  },
  {
    id: 'bountyhunter',
    name: 'Bounty Hunter',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing 1 evil player. If the player you know dies, you learn another evil player tonight. [1 Townsfolk is evil]',
    firstNightOrder: 46,
    otherNightOrder: 64,
    setup: true,
    reminders: ['Know', 'Known'],
    flavorQuote: "Alone, I walk these streets, paved with the sick stench of corruption.",
    extendedSummary: `The Bounty Hunter tracks down evil players, one at a time.

The Bounty Hunter starts knowing one evil player. When that player dies, they learn another evil player. If the Bounty Hunter is in the game, one Townsfolk is evil.

The Bounty Hunter only learns the evil player, not their character.`,
    tipsAndTricks: [
      "You know who an evil player is right off the bat! Get them executed.",
      "Watch who your target talks to - this might reveal other evil players.",
      "Once you're public, you're a target for the Demon, so time your reveal carefully.",
      "Remember you've created an evil Townsfolk - pay attention to who might be lying."
    ],
    bluffingAs: [
      "Bluffing as the Bounty Hunter throws a lot of shade on other players.",
      "Create a clique with good players to execute those you set up as evil.",
      "If you come out publicly, be prepared to die - get the Demon to kill you to build trust."
    ]
  },
  {
    id: 'cannibal',
    name: 'Cannibal',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Poisoned', 'Lunch'],
    flavorQuote: "I don't like clowns. They taste funny.",
    extendedSummary: `The Cannibal eats executed characters, gaining their ability.

If a good player dies by execution, the Cannibal gains that player's ability. If an evil player dies by execution, the Cannibal is poisoned.

The Cannibal is not told which ability they gained - they must figure it out.`,
    tipsAndTricks: [
      "Execute people! Your ability reduces the sting of executing good players.",
      "Keep an eye out for Townsfolk with once-per-game abilities.",
      "Remember you're not told which ability you have - figure it out from night actions.",
      "Talk to executees before they die to learn what ability you're getting."
    ],
    bluffingAs: [
      "Try to get people executed - it's what a real Cannibal would do!",
      "Be ready to fake a new ability every time someone is executed.",
      "If you want to accuse an executee of being evil, act like your power didn't work."
    ]
  },
  {
    id: 'choirboy',
    name: 'Choirboy',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'If the Demon kills the King, you learn which player is the Demon. [+the King]',
    firstNightOrder: null,
    otherNightOrder: 40,
    setup: true,
    reminders: [],
    flavorQuote: "I saw it, I did. I was in the pews, tidying the hymn books, when a dreadful tune started from the pipe organ.",
    extendedSummary: `The Choirboy learns who the Demon is when the King is slain.

If the Choirboy is in play and the King isn't, the King is added during setup.

If the Demon kills the King using their ability, the Choirboy learns which player is the Demon. Nominations, executions, and Minion kills don't count.`,
    tipsAndTricks: [
      "The Choirboy is an ambush for the Demon - they must be careful about killing the King.",
      "If you die, don't reveal this publicly - the threat of you being alive is powerful.",
      "Try to visit the King discreetly when you can.",
      "Character swap with another player and let them claim to be the Choirboy."
    ],
    bluffingAs: [
      "The Demon knows if there is a King in play - coordinate your bluffs.",
      "If the King dies, you'll need to come out with a Demon accusation.",
      "Be careful if you double up with a real Choirboy."
    ]
  },
  {
    id: 'cultleader',
    name: 'Cult Leader',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, you become the alignment of an alive neighbor. If all good players choose to join your cult, your team wins.',
    firstNightOrder: 47,
    otherNightOrder: 65,
    setup: false,
    reminders: [],
    flavorQuote: "Thinking themselves wise, they became fools.",
    extendedSummary: `The Cult Leader wins if everyone joins their cult.

At the end of each night, the Cult Leader becomes the alignment of a living neighbor. Once per day, the Cult Leader may publicly form a cult - if all good players vote to join, the game ends and the Cult Leader's team wins.`,
    tipsAndTricks: [
      "Come out as the Cult Leader early - your chances of being good are higher early game.",
      "Get other players to use detection abilities on your neighbors.",
      "Try to execute players between you and verified good players.",
      "Ignore your cult ability and just learn if you have evil neighbors like an Empath."
    ],
    bluffingAs: [
      "Keep the good team paranoid by claiming you've been told good is losing.",
      "Frame a dead good player by stating that after their execution, good started winning.",
      "You can actually come out as evil, since this throws shade on your neighbors."
    ]
  },
  {
    id: 'engineer',
    name: 'Engineer',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Once per game, at night, choose which Minions or which Demon is in play.',
    firstNightOrder: 13,
    otherNightOrder: 4,
    setup: false,
    reminders: ['No ability'],
    flavorQuote: "If it bends, great. If it breaks, well, it probably needed fixing anyway.",
    extendedSummary: `The Engineer manufactures the threat that the town faces.

The Engineer can choose which Minion characters are in play, or which Demon is in play, but not both.

When the Engineer creates new characters, the Demon player remains the Demon, and Minion players remain Minions. Only characters from the current script may be chosen.`,
    tipsAndTricks: [
      "Choose which Minions or Demon lets you know what you're facing.",
      "Use your ability on the first night to guarantee you act.",
      "Wait a few nights to discuss with the group what characters to create.",
      "Creating an obvious Demon mid-game may confirm your identity."
    ],
    bluffingAs: [
      "Claim you created the character you actually are.",
      "Make sure you claim characters without obvious tells.",
      "Have a solid story as to WHY you made your choice."
    ]
  },
  {
    id: 'farmer',
    name: 'Farmer',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'When you die at night, an alive good player becomes a Farmer.',
    firstNightOrder: null,
    otherNightOrder: 48,
    setup: false,
    reminders: [],
    flavorQuote: "Even the high and mighty need food on the table. Without us, the city starves.",
    extendedSummary: `The Farmer creates more Farmers.

If a Farmer dies at night, another good player becomes a Farmer too. If this new Farmer also dies at night, another Farmer is created.

Farmers that die during the day do not create more Farmers.`,
    tipsAndTricks: [
      "If you die at night, play it cool and wait for the new Farmer to approach you.",
      "The Farmer can be a powerful trap - if you turn into a Farmer, you can trust the dead player.",
      "Claim to be a high priority target to bait the Demon into killing you.",
      "Avoid execution at all costs - your ability only triggers at night."
    ],
    bluffingAs: [
      "A Farmer bluff can be a good fallback late in the game.",
      "If a fellow evil player dies at night, you can pick up a Farmer bluff.",
      "Bluffing as a Farmer might flush out the real Farmer."
    ]
  },
  {
    id: 'fisherman',
    name: 'Fisherman',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['No ability'],
    flavorQuote: "This was my favourite part of the river... see how the sunlight makes a rainbow from the monastery to the market?",
    extendedSummary: `The Fisherman knows something nobody else can: what should be done.

The Fisherman player chooses when to use their ability. The Storyteller chooses what advice to give.

The advice is a strategy tip that the Storyteller believes will help the Fisherman win, if followed. If drunk or poisoned, bad advice may be given.`,
    tipsAndTricks: [
      "Ask yourself why you got the advice you got.",
      "Follow the advice! It's given in temporal context, so act quickly.",
      "Use your ability immediately to avoid dying before using it.",
      "Or hold off for more specific advice later - risky but potentially more powerful."
    ],
    bluffingAs: [
      "The fake advice you pretend to receive will be the centerpiece of your bluff.",
      "Frame your advice as telling you to DO something, not just information.",
      "Insist on your fake advice - remind players it may have an expiration date."
    ]
  },
  {
    id: 'general',
    name: 'General',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, you learn which alignment the Storyteller believes is winning: good, evil, or neither.',
    firstNightOrder: 62,
    otherNightOrder: 76,
    setup: false,
    reminders: [],
    flavorQuote: "I don't have time for quotes.",
    extendedSummary: `The General knows who is winning.

If good is winning, thumbs up. If evil is winning, thumbs down. If neither, thumbs to the side.

The Storyteller judges based on many factors: how many players of each team are alive, how much information good has, how successful evil's bluffs are, etc.`,
    tipsAndTricks: [
      "Pay attention to events each day and how they may have altered the balance.",
      "Take note of how your information changes night to night.",
      "If consistently told good is winning, let the team know - keep doing what you're doing.",
      "If evil is consistently winning, take immediate contradictory action."
    ],
    bluffingAs: [
      "Keep good paranoid by claiming they're losing.",
      "Frame a dead good player by stating good started winning after their death.",
      "If evil is winning, say good is winning to maintain their overconfidence."
    ]
  },
  {
    id: 'highpriestess',
    name: 'High Priestess',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, learn which player the Storyteller believes you should talk to most.',
    firstNightOrder: 63,
    otherNightOrder: 77,
    setup: false,
    reminders: [],
    flavorQuote: "There is life behind the personality that uses personalities as masks.",
    extendedSummary: `The High Priestess acts on intuition.

The High Priestess can be shown the same player multiple times or different players each night. The shown player can be alive or dead, good or evil.

There are no official criteria - the Storyteller uses their judgement to show who they think will most benefit the good team.`,
    tipsAndTricks: [
      "Talk to the person the Storyteller gives you as soon as possible each day.",
      "Or observe who they talk to first and see if you can gain clues.",
      "Tell the person you saw that you're the High Priestess - see if they know why.",
      "Did you get the same player twice? The conversation probably didn't go as intended."
    ],
    bluffingAs: [
      "Claim to have been shown good players, then support their information to build trust.",
      "Or claim a good player's conversation went badly, casting suspicion on them.",
      "Claim to have seen your fellow evil players as an excuse to coordinate on day one."
    ]
  },
  {
    id: 'huntsman',
    name: 'Huntsman',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]',
    firstNightOrder: 28,
    otherNightOrder: 18,
    setup: true,
    reminders: ['No ability'],
    flavorQuote: "My cabin is warm and sturdy. My axe by the door, my boots drying by the fire...",
    extendedSummary: `The Huntsman saves the Damsel before the Minions find her.

If the Huntsman is in play and the Damsel isn't, the Damsel is added during setup.

If the Huntsman correctly chooses the Damsel, the Damsel becomes a not-in-play Townsfolk immediately. The Huntsman gets one guess at night.`,
    tipsAndTricks: [
      "Find the Damsel ASAP - you have one shot and you're racing against death!",
      "Or wait until you're really sure - you only have one opportunity.",
      "The Damsel is likely to be flighty and paranoid - look for shifty or quiet players.",
      "Privately claim to be the Damsel to flush out the real one."
    ],
    bluffingAs: [
      "Another evil player will need to claim Damsel to support your bluff.",
      "Pretending to be the Huntsman might flush out the real Damsel.",
      "The Huntsman is a useful fallback bluff if your initial bluff falls apart."
    ]
  },
  {
    id: 'king',
    name: 'King',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, if the dead equal or outnumber the living, you learn 1 alive character. The Demon knows you are the King.',
    firstNightOrder: 10,
    otherNightOrder: 62,
    setup: false,
    reminders: [],
    flavorQuote: "Betwixt the unknown strains of mortal strife and morbid night, sweet with mystery and woe...",
    extendedSummary: `The King learns which characters are still alive.

The King gains this ability once dead players equal or outnumber living players. The Demon learns who the King is at the start of the game.

The King may learn good or evil characters, and may learn the same character more than once.`,
    tipsAndTricks: [
      "The King can come out early and confidently - the Demon knows but fears the Choirboy.",
      "Or wait secretly and watch for players paying you too much attention.",
      "Find another player to secretly claim to be the Choirboy as protection.",
      "Coming out creates a gambit - you're either the King or the Demon."
    ],
    bluffingAs: [
      "Being King gives you an excuse to steer the game narrative.",
      "Build a circle of trust to verify or deny character claims late game.",
      "If you're a Minion, come out as King to throw shade on the real one."
    ]
  },
  {
    id: 'knight',
    name: 'Knight',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing 2 players that are not the Demon.',
    firstNightOrder: 45,
    otherNightOrder: null,
    setup: false,
    reminders: ['Know', 'Know'],
    flavorQuote: "For honour and for glory!",
    extendedSummary: `The Knight knows two players who are definitely not the Demon.

On the first night, the Knight learns two players. Neither of these players is the Demon. They could be Townsfolk, Outsiders, or even Minions - but not the Demon.

This information is very useful for narrowing down Demon candidates on the final day.`,
    tipsAndTricks: [
      "Your information tells you who is NOT the Demon - this is crucial for the final day.",
      "The players you see could still be Minions, so don't fully trust them.",
      "Share your information to help narrow down the Demon candidates.",
      "Your information is fixed from night one, so revealing early has minimal risk."
    ],
    bluffingAs: [
      "Claim to know two good players are not the Demon to gain their trust.",
      "Include an evil player to make them look less suspicious.",
      "Be careful - your information can be easily tested if those players are executed."
    ]
  },
  {
    id: 'lycanthrope',
    name: 'Lycanthrope',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night*, choose an alive player. If good, they die, but they are the only player that can die tonight.',
    firstNightOrder: null,
    otherNightOrder: 22,
    setup: false,
    reminders: ['Dead'],
    flavorQuote: "Awooooooo!",
    extendedSummary: `The Lycanthrope kills at night, but protects the town from the Demon.

Each night except the first, the Lycanthrope chooses a player. If that player is good, they die, but no other player can die that night - not even from the Demon.

If the Lycanthrope chooses an evil player, nothing happens and the Demon may kill as normal.`,
    tipsAndTricks: [
      "Choose players you suspect are evil - if they're good, at least you've protected the town.",
      "If no one dies after your choice, you've found an evil player!",
      "Coordinate with the town about who you're choosing each night.",
      "Your ability is a double-edged sword - use it wisely."
    ],
    bluffingAs: [
      "Claim to have found evil players when your 'targets' didn't die.",
      "Use your 'ability' to explain night deaths that were actually the Demon's kills.",
      "Be careful - if the wrong person dies, your story needs to match."
    ]
  },
  {
    id: 'magician',
    name: 'Magician',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'The Demon thinks you are a Minion. Minions think you are a Demon.',
    firstNightOrder: 4,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Pick a card... any card...",
    extendedSummary: `The Magician appears to be evil when evil players learn who their teammates are.

On the first night, when the Demon learns who their Minions are, they also see the Magician as a Minion. When Minions learn who the Demon is, they also see the Magician as the Demon.

This causes confusion for the evil team about who is actually on their side.`,
    tipsAndTricks: [
      "The evil team will be confused about who their real teammates are.",
      "You might be approached by Minions thinking you're the Demon - play along!",
      "The Demon might avoid killing you thinking you're their Minion.",
      "Come out later to prove you're good and expose who approached you."
    ],
    bluffingAs: [
      "Claim Magician to explain why evil players seemed friendly with you.",
      "Use it as a backup bluff if you're caught coordinating with evil.",
      "Be careful - the real Magician knows the evil team's behavior toward them."
    ]
  },
  {
    id: 'nightwatchman',
    name: 'Nightwatchman',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Once per game, at night, choose a player: they learn who you are.',
    firstNightOrder: 64,
    otherNightOrder: 78,
    setup: false,
    reminders: ['No ability'],
    flavorQuote: "It's a thankless job, but someone's got to do it.",
    extendedSummary: `The Nightwatchman reveals themselves to one player of their choice.

Once per game, the Nightwatchman chooses a player at night. That player learns that the Nightwatchman is the Nightwatchman.

This allows the Nightwatchman to form a trusted alliance with one player.`,
    tipsAndTricks: [
      "Choose wisely - this is a one-time ability to form a trusted bond.",
      "Choose a player you believe is good to create an alliance.",
      "The player you choose can vouch for you - you've proven you're the Nightwatchman.",
      "Use this strategically when you need to be believed."
    ],
    bluffingAs: [
      "Claim you revealed yourself to a player who can 'confirm' you.",
      "Coordinate with another evil player to back up each other's claims.",
      "Be careful if the player you claim to have revealed to denies it."
    ]
  },
  {
    id: 'noble',
    name: 'Noble',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing 3 players, 1 and only 1 of which is evil.',
    firstNightOrder: 43,
    otherNightOrder: null,
    setup: false,
    reminders: ['Know', 'Know', 'Know'],
    flavorQuote: "Indeed? How gauche.",
    extendedSummary: `The Noble knows three players, exactly one of whom is evil.

On the first night, the Noble learns three players. Exactly one of these three is evil - not zero, not two, exactly one.

This information helps narrow down evil players while also potentially identifying two good players.`,
    tipsAndTricks: [
      "One of your three players is definitely evil - work to figure out which one.",
      "The other two are definitely good - you can trust them.",
      "Share your information to get help figuring out which one is evil.",
      "Watch how all three players behave throughout the game."
    ],
    bluffingAs: [
      "Include an evil player and two good players to make your evil teammate look less suspicious.",
      "Or include three good players to make them suspicious of each other.",
      "Be careful - if two of your three are confirmed good, the third looks very evil."
    ]
  },
  {
    id: 'pixie',
    name: 'Pixie',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.',
    firstNightOrder: 29,
    otherNightOrder: null,
    setup: false,
    reminders: ['Mad', 'Has ability'],
    flavorQuote: "Tee-hee-hee!",
    extendedSummary: `The Pixie can gain a Townsfolk ability by pretending to be them.

On the first night, the Pixie learns one in-play Townsfolk character. If the Pixie pretends to be that character (is "mad"), they gain that ability when that player dies.

The Storyteller judges whether the Pixie was sufficiently mad about being that character.`,
    tipsAndTricks: [
      "Claim to be the character you were shown to gain their ability when they die.",
      "Be convincing! The Storyteller needs to believe you were truly 'mad'.",
      "You might conflict with the real player - that's expected and part of the game.",
      "Once they die, you get a powerful second ability."
    ],
    bluffingAs: [
      "Claim to have seen a specific Townsfolk and that you've been claiming to be them.",
      "Use this to explain why you were claiming a specific character earlier.",
      "Be careful about conflicting with characters that are easily verified."
    ]
  },
  {
    id: 'poppygrower',
    name: 'Poppy Grower',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Minions & Demons do not know each other. If you die, they learn who each other are that night.',
    firstNightOrder: 2,
    otherNightOrder: null,
    setup: false,
    reminders: ['Evil wakes'],
    flavorQuote: "From the poppy fields of golden Persia, a sweetness unlike any other...",
    extendedSummary: `The Poppy Grower prevents the evil team from knowing each other.

While the Poppy Grower is alive, Minions don't learn who the Demon is, and the Demon doesn't learn who the Minions are. They must find each other through gameplay.

If the Poppy Grower dies, evil players learn who each other are that night.`,
    tipsAndTricks: [
      "Stay alive as long as possible! Evil doesn't know their teammates while you live.",
      "Evil players will be acting confused and trying to find each other.",
      "Watch for players who seem to be testing whether others are evil.",
      "Your death will cause evil to suddenly coordinate - plan for this."
    ],
    bluffingAs: [
      "Claim Poppy Grower to make evil seem disorganized.",
      "Use your 'death' to explain why evil suddenly started coordinating.",
      "Be careful - the real Poppy Grower knows the evil team's early confusion."
    ]
  },
  {
    id: 'preacher',
    name: 'Preacher',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, choose a player: a Minion, if chosen, learns this. All chosen Minions have no ability.',
    firstNightOrder: 13,
    otherNightOrder: 5,
    setup: false,
    reminders: ['At a sermon'],
    flavorQuote: "Woe unto you, for ye have turned from the path of righteousness!",
    extendedSummary: `The Preacher can disable Minion abilities.

Each night, the Preacher chooses a player. If that player is a Minion, they learn they were chosen by the Preacher and their ability stops working.

The Preacher can choose the same player multiple times to keep them disabled.`,
    tipsAndTricks: [
      "Target players you suspect are Minions to disable their abilities.",
      "If a Minion stops acting, you've probably hit them!",
      "Keep targeting the same Minion to keep them disabled.",
      "Work with information roles to narrow down Minion candidates."
    ],
    bluffingAs: [
      "Claim to have disabled a player who was 'obviously' a Minion.",
      "Use this to explain why Minion effects seem to have stopped.",
      "Be careful - the Minion you claim to have disabled knows the truth."
    ]
  },
  {
    id: 'princess',
    name: 'Princess',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You may nominate as many times as you wish, but if the Demon nominates you, you lose your ability.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['No ability'],
    flavorQuote: "Off with their heads!",
    extendedSummary: `The Princess can nominate multiple times per day.

The Princess may nominate as many players as they wish each day, unlike normal rules that limit nominations to once per day.

However, if the Demon nominates the Princess, the Princess loses their ability for the rest of the game.`,
    tipsAndTricks: [
      "Use your extra nominations to pressure suspicious players.",
      "Be careful not to make yourself too obvious to the Demon.",
      "Your ability is powerful for controlling the day phase.",
      "If the Demon nominates you, you've identified them (but lost your ability)."
    ],
    bluffingAs: [
      "Claim Princess to justify nominating multiple times.",
      "Be careful - if the Demon nominates you and you keep nominating, you're caught.",
      "Use this bluff to aggressively push for executions."
    ]
  },
  {
    id: 'shugenja',
    name: 'Shugenja',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing if your closest evil player is clockwise or anti-clockwise. If equidistant, this info is arbitrary.',
    firstNightOrder: 48,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "The spirits tell me much...",
    extendedSummary: `The Shugenja knows the direction to the nearest evil player.

On the first night, the Shugenja learns whether the closest evil player to them is clockwise or anti-clockwise around the circle.

If the nearest evil player in both directions is equidistant, the Storyteller chooses which direction to show.`,
    tipsAndTricks: [
      "Your information points you toward evil - investigate in that direction.",
      "Combine with other information to narrow down who is evil.",
      "The closer the game gets to the end, the more valuable your info becomes.",
      "If you trust your neighbors, the evil player must be further away."
    ],
    bluffingAs: [
      "Claim a direction that points suspicion at a good player.",
      "Or claim a direction that clears your evil teammates.",
      "Be careful about consistency as players die and distances change."
    ]
  },
  {
    id: 'steward',
    name: 'Steward',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'You start knowing 1 good player.',
    firstNightOrder: 41,
    otherNightOrder: null,
    setup: false,
    reminders: ['Know'],
    flavorQuote: "Very good, sir. The usual, sir?",
    extendedSummary: `The Steward knows one player who is definitely good.

On the first night, the Steward learns one good player. This player is definitely on the good team, whether they are Townsfolk or Outsider.

This is simple but valuable information for building trust.`,
    tipsAndTricks: [
      "You have one confirmed good player - build an alliance with them.",
      "Share your information to help the town trust that player.",
      "Your player could still be drunk or giving wrong information - they're just good.",
      "Use this confirmed player as a base to build trust networks."
    ],
    bluffingAs: [
      "Claim to know a player is good to gain their trust.",
      "Include an evil player to make them look trustworthy.",
      "Be careful - alignment detection abilities can catch your lie."
    ]
  },
  {
    id: 'villageidiot',
    name: 'Village Idiot',
    edition: 'experimental',
    team: 'townsfolk',
    ability: 'Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]',
    firstNightOrder: 49,
    otherNightOrder: 67,
    setup: true,
    reminders: ['Drunk'],
    flavorQuote: "Duhhhhh...",
    extendedSummary: `The Village Idiot learns alignments, but there may be multiple of them.

Each night, the Village Idiot chooses a player and learns their alignment. However, the game might have 0 to 2 extra Village Idiots, and if there are extras, one is drunk.

This means Village Idiot information needs to be compared between multiple players claiming it.`,
    tipsAndTricks: [
      "Find other Village Idiots and compare information.",
      "If your info conflicts with another Village Idiot, one of you is drunk.",
      "Your information is powerful but needs verification.",
      "Check key players to help narrow down the evil team."
    ],
    bluffingAs: [
      "Claim Village Idiot to spread false alignment information.",
      "If caught, claim you must be the drunk one.",
      "Coordinate with other evil players claiming Village Idiot."
    ]
  },
  // OUTSIDERS
  {
    id: 'damsel',
    name: 'Damsel',
    edition: 'experimental',
    team: 'outsider',
    ability: 'All Minions know you are in play. If a Minion publicly guesses you (once), your team loses.',
    firstNightOrder: 30,
    otherNightOrder: null,
    setup: false,
    reminders: ['Guess used'],
    flavorQuote: "Help! Help! Someone help me!",
    extendedSummary: `The Damsel is known to all Minions, who can win by guessing them.

All Minions learn that a Damsel is in play on the first night. During the day, if any Minion publicly guesses who the Damsel is, and they're correct, evil wins immediately.

Minions only get one guess total - if they guess wrong, they can't try again.`,
    tipsAndTricks: [
      "Stay hidden! If the Minions find you, evil wins instantly.",
      "You might want to die - execution or Demon kill keeps you safe from Minion guess.",
      "Trust very few people with your identity.",
      "The Huntsman can save you by turning you into a Townsfolk."
    ],
    bluffingAs: [
      "Claim Damsel to make Minions waste their guess on you.",
      "This is a great bluff for evil - it protects the real Damsel if one exists.",
      "Be careful - claiming Damsel draws a lot of attention."
    ]
  },
  {
    id: 'golem',
    name: 'Golem',
    edition: 'experimental',
    team: 'outsider',
    ability: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Can not nominate'],
    flavorQuote: "SMASH!",
    extendedSummary: `The Golem kills with their nomination.

The Golem may only nominate once in the entire game. When they do nominate, if the nominated player is not the Demon, that player dies immediately.

If the Golem nominates the Demon, nothing special happens - the nomination proceeds normally.`,
    tipsAndTricks: [
      "Save your nomination for when you're confident about the Demon.",
      "If you're wrong, you kill a good player, but at least you've confirmed the Demon.",
      "Your one nomination is extremely powerful - use it wisely.",
      "You can claim Golem to explain why you haven't nominated all game."
    ],
    bluffingAs: [
      "Claim Golem to justify not nominating.",
      "Nominate and kill a good player, then claim you thought they were the Demon.",
      "Be careful - your 'ability' only works once."
    ]
  },
  {
    id: 'hatter',
    name: 'Hatter',
    edition: 'experimental',
    team: 'outsider',
    ability: 'If you died today or tonight, the Minion & Demon players may choose new Minion & Demon characters to be.',
    firstNightOrder: null,
    otherNightOrder: 69,
    setup: false,
    reminders: [],
    flavorQuote: "Why is a raven like a writing desk?",
    extendedSummary: `The Hatter's death allows evil to change their characters.

If the Hatter dies, the Minion and Demon players may each choose to become a different Minion or Demon character (respectively) that night.

They keep their evil alignment but gain new abilities.`,
    tipsAndTricks: [
      "Your death lets evil change their abilities - consider staying alive.",
      "Or die strategically to force evil into worse character choices.",
      "Evil might want you dead to change into better characters.",
      "Your death can cause chaos that might help or hurt good."
    ],
    bluffingAs: [
      "Claim Hatter to explain why evil seems to have changed abilities.",
      "Use this to explain inconsistencies in evil's behavior.",
      "Be careful - the real Hatter knows when evil changed."
    ]
  },
  {
    id: 'heretic',
    name: 'Heretic',
    edition: 'experimental',
    team: 'outsider',
    ability: 'Whoever wins, loses & whoever loses, wins, even if you are dead.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "The righteous shall fall, and the wicked shall rise!",
    extendedSummary: `The Heretic reverses the game's outcome.

With the Heretic in play, the normal win conditions are reversed: if good would win, evil wins instead, and vice versa.

This applies even if the Heretic is dead.`,
    tipsAndTricks: [
      "Good must ensure evil 'wins' (by normal standards) for good to actually win.",
      "You might need to get the Demon executed to prevent evil from 'losing'.",
      "Or you need to ensure the Demon survives to the end for good to 'win'.",
      "This completely flips the game - plan accordingly."
    ],
    bluffingAs: [
      "Claim Heretic to confuse the good team about their win condition.",
      "This can cause good to make catastrophic decisions.",
      "Be careful - this bluff can backfire if good adjusts correctly."
    ]
  },
  {
    id: 'hermit',
    name: 'Hermit',
    edition: 'experimental',
    team: 'outsider',
    ability: 'If the Demon dies before final 3, you become the Demon. You only win if evil wins by execution.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Leave me be. I want nothing of your world.",
    extendedSummary: `The Hermit becomes the Demon if the original dies too early.

If the Demon dies before the game reaches the final 3 players, the Hermit becomes the Demon.

The Hermit (now Demon) only wins if evil wins by execution - not by other means.`,
    tipsAndTricks: [
      "You're a backup Demon for evil, but you only win by execution.",
      "If you become Demon, you want good to execute the wrong player.",
      "Evil might try to use you as a failsafe.",
      "Be careful revealing this - evil might want to kill the Demon early."
    ],
    bluffingAs: [
      "Claim Hermit to explain why the game continued after the Demon died.",
      "Use this to create confusion about who the Demon is.",
      "Be careful - the Hermit's win condition is unusual."
    ]
  },
  {
    id: 'ogre',
    name: 'Ogre',
    edition: 'experimental',
    team: 'outsider',
    ability: 'On your 1st night, choose a player (not yourself): you become their alignment (you don\'t know which) even if drunk or poisoned.',
    firstNightOrder: 5,
    otherNightOrder: null,
    setup: false,
    reminders: ['Friend'],
    flavorQuote: "Me friend now. We play?",
    extendedSummary: `The Ogre becomes the alignment of a player they choose.

On the first night, the Ogre chooses a player. The Ogre becomes the same alignment as that player - good if they're good, evil if they're evil.

The Ogre doesn't learn their new alignment. This works even if the Ogre is drunk or poisoned.`,
    tipsAndTricks: [
      "Choose someone you think is good to ensure you stay good.",
      "If you choose an evil player, you become evil (but won't know it).",
      "Your choice is permanent - choose carefully.",
      "You can claim Ogre to explain suspicious behavior if you chose evil."
    ],
    bluffingAs: [
      "Claim Ogre to justify unusual voting or behavior.",
      "Say you might have accidentally become evil.",
      "This explains alignment detection that shows you as evil."
    ]
  },
  {
    id: 'plaguedoctor',
    name: 'Plague Doctor',
    edition: 'experimental',
    team: 'outsider',
    ability: 'If you die, the Storyteller gains a Minion ability.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Storyteller ability'],
    flavorQuote: "I bring only relief. The suffering ends with me.",
    extendedSummary: `The Plague Doctor's death gives the Storyteller a Minion ability.

If the Plague Doctor dies, the Storyteller gains a Minion ability of their choice. The Storyteller uses this ability for the rest of the game.

This essentially adds an extra Minion effect to the game.`,
    tipsAndTricks: [
      "Try to stay alive to prevent the Storyteller gaining a Minion ability.",
      "Your death makes the game harder for good.",
      "The Storyteller will use the ability against the good team.",
      "Consider which Minion abilities are on the script."
    ],
    bluffingAs: [
      "Claim Plague Doctor to explain new Minion effects appearing.",
      "Use this to create paranoia about the Storyteller's actions.",
      "Be careful - the effect should match a Minion ability."
    ]
  },
  {
    id: 'politician',
    name: 'Politician',
    edition: 'experimental',
    team: 'outsider',
    ability: 'If you were the player most responsible for your team losing, you change alignment & win, even if dead.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I promise to uphold the values that the townsfolk hold most dear.",
    extendedSummary: `The Politician can switch teams to win.

If the Politician is deemed most responsible for their team's loss, they change alignment and win instead.

This encourages the Politician to play selfishly and cause their team to lose.`,
    tipsAndTricks: [
      "You might want to sabotage your own team to switch sides and win.",
      "But if your team wins normally, you still win as good.",
      "Be the most responsible for the loss - but not obviously so.",
      "This is a selfish character - play accordingly."
    ],
    bluffingAs: [
      "Claim Politician to justify suspicious behavior.",
      "Say you're trying to switch teams if good looks like losing.",
      "This can excuse votes against good players."
    ]
  },
  {
    id: 'puzzlemaster',
    name: 'Puzzlemaster',
    edition: 'experimental',
    team: 'outsider',
    ability: '1 player is drunk, even if you die. If you guess (once) who it is, you learn the Demon player, but guess wrong & get false info.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: true,
    reminders: ['Drunk', 'Guess used'],
    flavorQuote: "Hmm... interesting.",
    extendedSummary: `The Puzzlemaster can learn the Demon by finding the drunk player.

One player in the game is drunk because of the Puzzlemaster. If the Puzzlemaster guesses who is drunk correctly, they learn who the Demon is.

If they guess wrong, they get false information about the Demon.`,
    tipsAndTricks: [
      "Find the player whose information doesn't match reality - they're drunk.",
      "Your guess is once per game, so be sure before guessing.",
      "If you guess right, you learn the Demon's identity.",
      "If wrong, you get a false Demon - be careful."
    ],
    bluffingAs: [
      "Claim Puzzlemaster and that you've found the Demon.",
      "Implicate a good player as the Demon.",
      "Be careful - you need to name someone as 'drunk' too."
    ]
  },
  {
    id: 'snitch',
    name: 'Snitch',
    edition: 'experimental',
    team: 'outsider',
    ability: 'Minions start knowing 3 not-in-play characters.',
    firstNightOrder: 7,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I ain't sayin' nothin'. But if I was, I'd say check the butcher's shop at midnight.",
    extendedSummary: `The Snitch gives Minions extra bluff characters.

Because of the Snitch, Minions start the game knowing 3 characters that are not in play.

This gives the evil team more safe characters to claim.`,
    tipsAndTricks: [
      "Evil has extra bluffs because of you - watch for characters that seem too convenient.",
      "There are 3 extra not-in-play characters evil knows about.",
      "This makes it harder to catch evil by character claims.",
      "Consider revealing to explain why evil has good bluffs."
    ],
    bluffingAs: [
      "Claim Snitch to explain why evil has convincing character claims.",
      "This explains how the Demon knew what characters to bluff as.",
      "Be careful - this reveals there are extra bluffs in play."
    ]
  },
  {
    id: 'zealot',
    name: 'Zealot',
    edition: 'experimental',
    team: 'outsider',
    ability: 'If there are 5 or more players alive, you must vote for every nomination.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Guilty! Guilty! GUILTY!",
    extendedSummary: `The Zealot must vote on every nomination.

If there are 5 or more players alive, the Zealot must raise their hand to vote on every nomination.

This makes the Zealot obvious to the group and affects voting dynamics.`,
    tipsAndTricks: [
      "You have to vote for everything - you can't be strategic with votes.",
      "Evil knows you're the Zealot based on your voting pattern.",
      "Your votes might swing executions unexpectedly.",
      "Once players drop below 5, you can vote normally."
    ],
    bluffingAs: [
      "Claim Zealot to explain why you voted for everyone.",
      "This can excuse voting for evil players to be executed.",
      "Be careful - your voting pattern is very obvious."
    ]
  },
  // MINIONS
  {
    id: 'boffin',
    name: 'Boffin',
    edition: 'experimental',
    team: 'minion',
    ability: 'The Demon (even if drunk or poisoned) has a not-in-play good character\'s ability. You both know which.',
    firstNightOrder: 34,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "With this serum, you shall have powers beyond imagination!",
    extendedSummary: `The Boffin gives the Demon a good character's ability.

The Demon has an additional ability - that of a not-in-play good character. Both the Boffin and Demon know which ability this is.

This ability works even if the Demon is drunk or poisoned.`,
    tipsAndTricks: [
      "Your Demon has an extra ability - coordinate to use it well.",
      "The ability works through drunk/poison - very powerful.",
      "Consider which ability would be most useful for the Demon.",
      "The Demon can use the ability to create false information."
    ],
    fightingThe: [
      "Watch for the Demon having information they shouldn't have.",
      "The Demon might claim a character that isn't in play - that's the Boffin ability.",
      "Check if the Demon's claims match a not-in-play character."
    ]
  },
  {
    id: 'boomdandy',
    name: 'Boomdandy',
    edition: 'experimental',
    team: 'minion',
    ability: 'If you are executed, all but 3 players die. 1 minute later, the player with the most players pointing at them dies.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "BOOM!",
    extendedSummary: `The Boomdandy explodes when executed, killing most players.

If the Boomdandy is executed, all but 3 players die immediately. One minute later, the player with the most fingers pointed at them dies too.

This creates a chaotic endgame with very few players remaining.`,
    tipsAndTricks: [
      "Getting executed creates chaos - but be careful about timing.",
      "After the explosion, the remaining players point at someone to die.",
      "This can eliminate good players and set up evil for a win.",
      "Coordinate with the Demon about when to trigger this."
    ],
    fightingThe: [
      "Be very careful about executing the Boomdandy!",
      "If they're executed, coordinate who to point at carefully.",
      "Try to keep good players in the final 3 survivors.",
      "Consider not executing suspected Boomdandys."
    ]
  },
  {
    id: 'fearmonger',
    name: 'Fearmonger',
    edition: 'experimental',
    team: 'minion',
    ability: 'Each night, choose a player. If you nominate & execute them, their team loses. All players know if you choose a new player.',
    firstNightOrder: 24,
    otherNightOrder: 14,
    setup: false,
    reminders: ['Fear'],
    flavorQuote: "Let your fear be my feast!",
    extendedSummary: `The Fearmonger can cause a team to lose instantly.

Each night, the Fearmonger chooses a player. If that player is nominated by the Fearmonger and executed, that player's team loses immediately.

All players are told if the Fearmonger changed their target.`,
    tipsAndTricks: [
      "Choose a good player you can get executed to win instantly.",
      "Players know when you change targets - use this to create fear.",
      "Nominate your target and convince others to execute them.",
      "Coordinate with evil to support your nomination."
    ],
    fightingThe: [
      "Pay attention to announcements about the Fearmonger changing targets.",
      "Be careful about executing players the Fearmonger nominates.",
      "The Fearmonger must nominate their target - watch who nominates whom.",
      "Don't execute if the Fearmonger's nomination succeeds."
    ]
  },
  {
    id: 'goblin',
    name: 'Goblin',
    edition: 'experimental',
    team: 'minion',
    ability: 'If you publicly claim to be the Goblin when nominated & are executed that day, your team wins.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Claimed'],
    flavorQuote: "Hehehe!",
    extendedSummary: `The Goblin wins for evil if they claim Goblin and are executed.

If the Goblin publicly claims to be the Goblin after being nominated, and they are executed that day, evil wins immediately.

This creates a dangerous trap for the good team.`,
    tipsAndTricks: [
      "Wait until you're nominated, then claim Goblin.",
      "Good must decide if you're bluffing or really the Goblin.",
      "This creates a lose-lose for good - execute you and risk losing, or let you live.",
      "Coordinate with evil to make your claim believable."
    ],
    fightingThe: [
      "Be very careful about executing someone who claims Goblin after nomination!",
      "Consider not executing them - let them live rather than risk losing.",
      "Watch for players who seem to want to be nominated.",
      "The Goblin claim only works if they're actually the Goblin."
    ]
  },
  {
    id: 'harpy',
    name: 'Harpy',
    edition: 'experimental',
    team: 'minion',
    ability: 'Each night, choose 2 players. Tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.',
    firstNightOrder: 23,
    otherNightOrder: 13,
    setup: false,
    reminders: ['Mad', 'Mad'],
    flavorQuote: "SCREEEEE!",
    extendedSummary: `The Harpy forces players to accuse each other.

Each night, the Harpy chooses two players. The next day, the first player must act "mad" (pretend) that the second player is evil.

If they don't convincingly act mad, the Storyteller may kill one or both of them.`,
    tipsAndTricks: [
      "Choose a good player to force them to accuse another good player.",
      "Or choose a good player to accuse an evil player unconvincingly.",
      "This creates conflict between good players.",
      "The threat of death forces compliance."
    ],
    fightingThe: [
      "If you must claim someone is evil, be obviously reluctant.",
      "Watch for players who suddenly claim others are evil - they might be Harpy'd.",
      "The Harpy's targets are being forced to act.",
      "Don't fully trust sudden accusations."
    ]
  },
  {
    id: 'marionette',
    name: 'Marionette',
    edition: 'experimental',
    team: 'minion',
    ability: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]',
    firstNightOrder: 11,
    otherNightOrder: null,
    setup: true,
    reminders: [],
    flavorQuote: "I'm a real boy!",
    extendedSummary: `The Marionette thinks they are good but is actually evil.

The Marionette is a Minion who doesn't know they are evil. They are given a good character token and believe they are that character.

The Demon knows who the Marionette is, and the Marionette always neighbors the Demon.`,
    tipsAndTricks: [
      "You don't know you're evil - you think you're the good character you were shown.",
      "The Demon knows you and will try to guide your actions.",
      "Your 'ability' doesn't work - you're actually a Minion.",
      "If you discover you're the Marionette, help evil."
    ],
    fightingThe: [
      "Look for players whose abilities don't seem to work correctly.",
      "The Marionette neighbors the Demon - check neighbor relationships.",
      "The Demon might be protecting their Marionette.",
      "Confused-looking players with wrong info might be Marionettes."
    ]
  },
  {
    id: 'mezepheles',
    name: 'Mezepheles',
    edition: 'experimental',
    team: 'minion',
    ability: 'You start knowing a secret word. The 1st good player to say this word becomes evil that night.',
    firstNightOrder: 25,
    otherNightOrder: null,
    setup: false,
    reminders: ['Turns evil', 'No ability'],
    flavorQuote: "Speak my name, and I shall set you free.",
    extendedSummary: `The Mezepheles can turn a good player evil using a secret word.

The Mezepheles starts knowing a secret word. The first good player to say this word during the game becomes evil that night.

The Mezepheles only gets one conversion - once someone says the word, their ability is used.`,
    tipsAndTricks: [
      "Work the secret word into conversation naturally.",
      "Target talkative players who might say the word accidentally.",
      "Or tell a trusted 'ally' the word to convert them deliberately.",
      "The word should be uncommon but natural in context."
    ],
    fightingThe: [
      "Be careful about what words you say!",
      "Watch for players who seem to be prompting specific words.",
      "If someone suddenly turns against good, they might have been converted.",
      "The secret word is usually unusual but not impossible to say."
    ]
  },
  {
    id: 'organgrinder',
    name: 'Organ Grinder',
    edition: 'experimental',
    team: 'minion',
    ability: 'All players keep their eyes closed when voting & the vote tally is secret. Votes for you only count if you vote.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Dance, monkey, dance!",
    extendedSummary: `The Organ Grinder makes votes secret.

While the Organ Grinder is alive, all players close their eyes when voting, and the vote tally is kept secret by the Storyteller.

Votes against the Organ Grinder only count if the Organ Grinder also votes.`,
    tipsAndTricks: [
      "Voting is now secret - evil can vote freely without suspicion.",
      "You can protect yourself by not voting when you're nominated.",
      "Good can't coordinate votes as easily.",
      "Use the chaos to your advantage."
    ],
    fightingThe: [
      "You can't see who's voting - be careful with your votes.",
      "The Organ Grinder is protected unless they vote for themselves.",
      "Try to figure out who the Organ Grinder is.",
      "Once they're dead, voting returns to normal."
    ]
  },
  {
    id: 'psychopath',
    name: 'Psychopath',
    edition: 'experimental',
    team: 'minion',
    ability: 'Each day, before nominations, you may publicly choose a player. Tonight, you wake to learn if they are good or evil. Good dies.',
    firstNightOrder: null,
    otherNightOrder: 15,
    setup: false,
    reminders: ['Stabbed'],
    flavorQuote: "I like you. I'll kill you last.",
    extendedSummary: `The Psychopath can publicly kill players during the day.

Each day, before nominations, the Psychopath may publicly choose a player. That night, the Psychopath learns if their target was good or evil, and if good, that player dies.

This is a public ability - everyone knows who the Psychopath targeted.`,
    tipsAndTricks: [
      "You can kill publicly, but everyone knows you're the Psychopath.",
      "Kill good players to reduce their numbers.",
      "You can't be stopped once you use your ability.",
      "Use this aggressively to overwhelm good."
    ],
    fightingThe: [
      "The Psychopath is known - execute them quickly!",
      "They kill every day they stay alive.",
      "Prioritize killing the Psychopath over the Demon sometimes.",
      "Their kills happen at night - the target has one last day."
    ]
  },
  {
    id: 'summoner',
    name: 'Summoner',
    edition: 'experimental',
    team: 'minion',
    ability: 'You get 3 bluffs. On the 3rd night, choose a player: they become an evil Demon of your choice. [No Demon]',
    firstNightOrder: 26,
    otherNightOrder: 16,
    setup: true,
    reminders: ['Night 1', 'Night 2', 'Night 3'],
    flavorQuote: "Rise, my creation!",
    extendedSummary: `The Summoner creates the Demon on the third night.

The game starts with no Demon. On the third night, the Summoner chooses a player and a Demon character - that player becomes that evil Demon.

The Summoner gets 3 bluffs to share with their team.`,
    tipsAndTricks: [
      "You choose who becomes the Demon - choose wisely.",
      "The first two nights have no Demon kills - explain this if needed.",
      "Choose a Demon that suits the script and situation.",
      "Coordinate your bluffs with other evil players."
    ],
    fightingThe: [
      "No one dies for the first two nights if the Summoner is in play.",
      "Watch who seems to become 'active' after night 3.",
      "The Demon was chosen by the Summoner - they know each other.",
      "The original player might not have expected to become Demon."
    ]
  },
  {
    id: 'vizier',
    name: 'Vizier',
    edition: 'experimental',
    team: 'minion',
    ability: 'All players know who you are. You can not die during the day. If a good player publicly guessed you are the Vizier, you might die.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I am but a humble servant of the crown.",
    extendedSummary: `The Vizier is known to all and cannot be executed.

All players know who the Vizier is from the start. The Vizier cannot die during the day - they can be nominated and voted for, but they won't die.

If a good player publicly guesses the Vizier is evil, the Storyteller may kill the Vizier.`,
    tipsAndTricks: [
      "You're known to all but can't be executed - use this power.",
      "You can dominate day discussions without fear.",
      "Push for executions of good players.",
      "Be careful of good players guessing you're evil."
    ],
    fightingThe: [
      "Everyone knows who the Vizier is - don't trust them!",
      "You can't execute them, but you can ignore them.",
      "Publicly guess the Vizier is evil to potentially kill them.",
      "Focus on finding the Demon instead."
    ]
  },
  {
    id: 'widow',
    name: 'Widow',
    edition: 'experimental',
    team: 'minion',
    ability: 'On your 1st night, look at the Grimoire and choose a player: they are poisoned. 1 good player knows a Widow is in play.',
    firstNightOrder: 17,
    otherNightOrder: null,
    setup: false,
    reminders: ['Poisoned', 'Knows'],
    flavorQuote: "My husband? Oh yes, a terrible accident. Pass the sugar.",
    extendedSummary: `The Widow sees the Grimoire and poisons a player.

On the first night, the Widow sees all the character tokens in the Grimoire and chooses a player to poison for the entire game.

One good player is told that a Widow is in play.`,
    tipsAndTricks: [
      "You see ALL the characters - this is incredibly powerful information.",
      "Poison the most powerful or information-rich player.",
      "Share the Grimoire information with your evil team.",
      "One good player knows a Widow exists - be careful."
    ],
    fightingThe: [
      "One player knows a Widow is in play - believe them.",
      "Someone is poisoned all game - figure out who.",
      "The Widow knows everything - expect evil to have good bluffs.",
      "Check if information doesn't match up - someone might be poisoned."
    ]
  },
  {
    id: 'wizard',
    name: 'Wizard',
    edition: 'experimental',
    team: 'minion',
    ability: 'The Demon does not know which players are which Minion. On their 1st night, the Demon may choose a player: they die.',
    firstNightOrder: 22,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "Abracadabra!",
    extendedSummary: `The Wizard gives the Demon an extra first-night kill.

The Demon doesn't know specifically which players are which Minion - just that they exist. On the first night, the Demon may choose to kill a player.

This gives evil an early advantage.`,
    tipsAndTricks: [
      "Your Demon can kill on night 1 - coordinate who to eliminate.",
      "Evil doesn't know which Minion is which - find each other carefully.",
      "Use the extra kill to remove a powerful information character.",
      "This puts evil ahead early in the game."
    ],
    fightingThe: [
      "There might be a death on night 1 - be prepared.",
      "Evil doesn't know which Minion is which - they might seem confused.",
      "The Wizard enables an aggressive evil start.",
      "Watch for evil players testing who their teammates are."
    ]
  },
  {
    id: 'wraith',
    name: 'Wraith',
    edition: 'experimental',
    team: 'minion',
    ability: 'The Demon\'s kills affect their target\'s neighbors instead. Each night, any players that are exactly 1 step away from being killed wake to learn this.',
    firstNightOrder: 21,
    otherNightOrder: 11,
    setup: false,
    reminders: ['Warning'],
    flavorQuote: "I am the shadow that haunts your dreams.",
    extendedSummary: `The Wraith redirects the Demon's kills to neighbors.

When the Demon kills a player, instead of that player dying, one or both of their neighbors die.

Players who are exactly one step away from dying wake and learn they were almost killed.`,
    tipsAndTricks: [
      "The Demon kills who they choose, but neighbors die instead.",
      "This can confuse good about who the Demon targeted.",
      "Players who 'almost die' learn about it - this creates uncertainty.",
      "Coordinate with the Demon about actual targets vs apparent targets."
    ],
    fightingThe: [
      "The Demon's target isn't who dies - neighbors die instead.",
      "If you're warned you 'almost died', the Demon targeted your neighbor.",
      "Track who the Demon seems to target vs who actually dies.",
      "This creates confusion about Demon intentions."
    ]
  },
  {
    id: 'xaan',
    name: 'Xaan',
    edition: 'experimental',
    team: 'minion',
    ability: 'On night X, all Townsfolk are poisoned until dusk. X is the night equal to the number of players you publicly "touched" yesterday.',
    firstNightOrder: null,
    otherNightOrder: 66,
    setup: false,
    reminders: ['Touched', 'Touched', 'Touched', 'Night X'],
    flavorQuote: "Your pain sustains me.",
    extendedSummary: `Xaan can poison all Townsfolk on a chosen night.

During the day, Xaan publicly "touches" players by announcing it. The number of players touched determines which night all Townsfolk are poisoned.

On night X (where X = number touched yesterday), all Townsfolk are poisoned until dusk.`,
    tipsAndTricks: [
      "Choose how many players to touch to control when Townsfolk are poisoned.",
      "Timing is crucial - poison on a night when it matters most.",
      "This affects ALL Townsfolk - very powerful.",
      "Coordinate with the Demon about when to trigger this."
    ],
    fightingThe: [
      "Watch for players publicly 'touching' others - that's Xaan.",
      "Count the touches to know which night Townsfolk are poisoned.",
      "On night X, all Townsfolk info might be wrong.",
      "Once you identify Xaan, their touching becomes less dangerous."
    ]
  },
  // DEMONS
  {
    id: 'alhadikhia',
    name: 'Al-Hadikhia',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, choose 3 players (all players learn who): each silently chooses to live or die, but if all 3 live, all 3 die.',
    firstNightOrder: null,
    otherNightOrder: 28,
    setup: false,
    reminders: ['Chosen', 'Chosen', 'Chosen'],
    flavorQuote: "Choose wisely, for your life depends on it.",
    extendedSummary: `Al-Hadikhia creates a deadly choice for three players.

Each night except the first, Al-Hadikhia chooses 3 players. All players learn who was chosen. Each chosen player secretly decides to live or die.

If all 3 choose to live, all 3 die instead. Otherwise, those who chose to die, die.`,
    tipsAndTricks: [
      "Create prisoner's dilemma situations for good players.",
      "Choose players who trust each other - they might all try to live.",
      "If even one player chooses death, the others can safely live.",
      "This creates paranoia and mistrust."
    ],
    fightingThe: [
      "If you're chosen, consider volunteering to die so others can live.",
      "Coordinate with other chosen players if possible.",
      "If all 3 try to live, all 3 die - don't all choose life.",
      "Watch for evil players always choosing to live."
    ]
  },
  {
    id: 'kazali',
    name: 'Kazali',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]',
    firstNightOrder: 15,
    otherNightOrder: 29,
    setup: true,
    reminders: ['Dead'],
    flavorQuote: "I choose who serves me.",
    extendedSummary: `The Kazali chooses which players become Minions during setup.

The Kazali picks which good players become Minions. This happens during setup, replacing normal Minion selection.

Outsiders can be added or removed based on the Kazali's choices.`,
    tipsAndTricks: [
      "You pick your own Minion team - choose wisely.",
      "Turn experienced or influential players into Minions.",
      "Your Minions were good players who became evil.",
      "Coordinate carefully since your Minions started good."
    ],
    fightingThe: [
      "The Minions were originally good players turned evil.",
      "Watch for players who suddenly seem to change behavior.",
      "The Kazali chose their own team - they know everyone.",
      "Character claims from 'new' Minions might be real (their old character)."
    ]
  },
  {
    id: 'legion',
    name: 'Legion',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, a player might die. Executions fail if only evil voted. You register as a Minion too. [Most players are Legion]',
    firstNightOrder: null,
    otherNightOrder: 30,
    setup: true,
    reminders: ['Dead', 'About to die'],
    flavorQuote: "We are many. We are Legion.",
    extendedSummary: `Legion is a Demon that most players share.

Most players are Legion - they are all the same Demon. Executions fail if only evil players voted.

Legion registers as both Demon and Minion to detection abilities.`,
    tipsAndTricks: [
      "Most players are you - coordinate but don't make it obvious.",
      "Executions fail if only evil voted - good must vote too.",
      "You register as Minion too - this can confuse detection.",
      "Pretend to be separate players working together."
    ],
    fightingThe: [
      "If an execution fails, only evil voted - those voters are Legion!",
      "Most players might be Legion - trust very few.",
      "Watch voting patterns carefully.",
      "Detection might show 'Minion' instead of 'Demon'."
    ]
  },
  {
    id: 'leviathan',
    name: 'Leviathan',
    edition: 'experimental',
    team: 'demon',
    ability: 'If more than 1 good player is executed, evil wins. All players know you are in play. After day 5, evil wins.',
    firstNightOrder: 65,
    otherNightOrder: 79,
    setup: false,
    reminders: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    flavorQuote: "Time is on my side.",
    extendedSummary: `The Leviathan wins through patience and precision.

Everyone knows a Leviathan is in play. If more than one good player is executed, evil wins immediately. After day 5 ends, evil wins.

The Leviathan doesn't kill at night like normal Demons.`,
    tipsAndTricks: [
      "Everyone knows you're in play - no hiding it.",
      "Good can only execute one good player or they lose.",
      "If good executes no one, you win on day 5.",
      "Create situations where good must execute."
    ],
    fightingThe: [
      "You know a Leviathan is in play - be very careful with executions!",
      "You can only execute one good player total.",
      "You must find and execute the Leviathan before day 5.",
      "Don't waste executions on suspected good players."
    ]
  },
  {
    id: 'lilmonsta',
    name: "Lil' Monsta",
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night, Minions choose who babysits Lil\' Monsta & \"is the Demon\". Each night*, a player might die. [+1 Minion]',
    firstNightOrder: 16,
    otherNightOrder: 31,
    setup: true,
    reminders: ['Dead', 'Is the Demon'],
    flavorQuote: "Goo goo!",
    extendedSummary: `Lil' Monsta is a token passed between Minions.

There is no Demon player - instead, the Lil' Monsta token is held by a Minion each night. That Minion "is the Demon" and dies if the Demon would die.

An extra Minion is added to the game.`,
    tipsAndTricks: [
      "Pass the token between Minions to confuse good.",
      "The holder 'is the Demon' for detection purposes.",
      "If the holder is executed, they die as the Demon.",
      "Coordinate who holds the token each night."
    ],
    fightingThe: [
      "There's no traditional Demon - a Minion holds the token.",
      "The 'Demon' can change each night.",
      "Execute the token holder to win, but they might pass it.",
      "There's one extra Minion in play."
    ]
  },
  {
    id: 'lleech',
    name: 'Lleech',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. You start by choosing a player: they are poisoned. You die if & only if they are dead.',
    firstNightOrder: 14,
    otherNightOrder: 32,
    setup: false,
    reminders: ['Dead', 'Poisoned'],
    flavorQuote: "I'll drink your life force!",
    extendedSummary: `The Lleech is bound to a host who keeps them alive.

On the first night, the Lleech chooses a player who is poisoned for the entire game. The Lleech can only die if this host is dead.

Each subsequent night, the Lleech kills a player.`,
    tipsAndTricks: [
      "Your host keeps you alive - choose carefully.",
      "Your host is poisoned all game - their info is wrong.",
      "If your host dies, you can be killed.",
      "Protect your host while killing others."
    ],
    fightingThe: [
      "The Lleech can only die if their host is dead first.",
      "Someone is poisoned all game because of the Lleech.",
      "Find and kill the host, then the Lleech.",
      "Watch for players the Demon seems to protect."
    ]
  },
  {
    id: 'lordoftyphon',
    name: 'Lord of Typhon',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, choose a player: they die. [Evil characters are in a line. You are in the middle. +1 Minion. -? to +? Outsiders]',
    firstNightOrder: null,
    otherNightOrder: 33,
    setup: true,
    reminders: ['Dead'],
    flavorQuote: "Bow before me, mortal.",
    extendedSummary: `The Lord of Typhon sits at the center of evil.

Evil players are seated in a line with the Lord of Typhon in the middle. There is one extra Minion in play.

Outsiders may be added or removed based on the setup.`,
    tipsAndTricks: [
      "You're in the middle of your evil team - use this for coordination.",
      "Evil is in a line - this affects neighbor relationships.",
      "You have an extra Minion to work with.",
      "Your position is fixed - plan around it."
    ],
    fightingThe: [
      "Evil players are seated in a line around the Lord of Typhon.",
      "The Demon is in the middle of evil players.",
      "If you find one evil player, check their neighbors.",
      "There's one extra Minion in play."
    ]
  },
  {
    id: 'ojo',
    name: 'Ojo',
    edition: 'experimental',
    team: 'demon',
    ability: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.',
    firstNightOrder: null,
    otherNightOrder: 34,
    setup: false,
    reminders: ['Dead'],
    flavorQuote: "I see all. I know all.",
    extendedSummary: `The Ojo kills by choosing characters, not players.

Each night except the first, the Ojo names a character. If that character is in play, that player dies. If not, the Storyteller chooses who dies.

This allows targeted killing based on character knowledge.`,
    tipsAndTricks: [
      "Kill by character, not by player - very precise.",
      "Eliminate specific threats like the Slayer or Fortune Teller.",
      "If you guess wrong, someone still dies.",
      "Use evil's information to know which characters to target."
    ],
    fightingThe: [
      "The Ojo targets characters, not players.",
      "Bluffing as a dangerous character might get you killed.",
      "If a specific character dies, the Ojo knew they were in play.",
      "Consider hiding or lying about your character."
    ]
  },
  {
    id: 'riot',
    name: 'Riot',
    edition: 'experimental',
    team: 'demon',
    ability: 'Nominees die, but may nominate again immediately (on day 3+, a player might not die). After day 3, evil wins. [All Minions are Riot]',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: true,
    reminders: [],
    flavorQuote: "CHAOS!",
    extendedSummary: `Riot creates chaotic chain nominations.

All Minions become Riot. When a player is nominated, they die but may immediately nominate someone else, creating a chain of deaths.

After day 3, if the game hasn't ended, evil wins. On day 3+, a player might survive nomination.`,
    tipsAndTricks: [
      "Nominations kill - use this to eliminate good players.",
      "The chain continues until no one nominates.",
      "You win after day 3 if the game continues.",
      "All your Minions are also Riot."
    ],
    fightingThe: [
      "Nominations kill! Be very careful who you nominate.",
      "You must find and kill all Riots before day 3.",
      "All Minions are Riot - there are multiple Demons.",
      "On day 3+, nominated players might survive."
    ]
  },
  {
    id: 'yaggababble',
    name: 'Yaggababble',
    edition: 'experimental',
    team: 'demon',
    ability: 'You start knowing a secret phrase. For each time you said it publicly today, a player might die tonight.',
    firstNightOrder: 27,
    otherNightOrder: 35,
    setup: false,
    reminders: ['Dead', 'Dead', 'Dead'],
    flavorQuote: "Babble babble babble!",
    extendedSummary: `The Yaggababble kills based on saying a secret phrase.

The Yaggababble starts knowing a secret phrase. For each time they say this phrase publicly during the day, a player might die that night.

Multiple kills are possible if the phrase is said multiple times.`,
    tipsAndTricks: [
      "Say your phrase naturally in conversation.",
      "More times said = more potential kills.",
      "The phrase should be unusual but workable in conversation.",
      "Don't make it too obvious or you'll be caught."
    ],
    fightingThe: [
      "Listen for repeated unusual phrases - that might be the secret phrase.",
      "If multiple people die, the Yaggababble said their phrase multiple times.",
      "Watch for players working phrases into conversation awkwardly.",
      "Once you identify the phrase, watch who keeps saying it."
    ]
  },
  // TRAVELLERS
  {
    id: 'cacklejack',
    name: 'Cacklejack',
    edition: 'experimental',
    team: 'traveler',
    ability: 'Once per night, if you are alive, choose a player: they learn your alignment.',
    firstNightOrder: 1,
    otherNightOrder: 1,
    setup: false,
    reminders: [],
    flavorQuote: "Hee hee hee!",
    extendedSummary: `The Cacklejack reveals their alignment to one player per night.

Each night, the Cacklejack may choose a player to learn the Cacklejack's alignment (good or evil).

This helps players understand who to trust.`,
    tipsAndTricks: [
      "Reveal your alignment strategically to build trust or deceive.",
      "Good Cacklejacks can confirm themselves to key players.",
      "Evil Cacklejacks can pretend to be good.",
      "Choose wisely who learns your alignment."
    ],
    bluffingAs: [
      "Claim you told someone you were good.",
      "Coordinate with that player to back you up.",
      "Be careful if they reveal you said something different."
    ]
  },
  {
    id: 'gangster',
    name: 'Gangster',
    edition: 'experimental',
    team: 'traveler',
    ability: 'Once per day, you may choose to kill an alive neighbor, if your other alive neighbor agrees.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['About to die'],
    flavorQuote: "Nice place you got here. Be a shame if something happened to it.",
    extendedSummary: `The Gangster can kill their neighbors with consent.

Once per day, the Gangster may choose to kill one of their alive neighbors, but only if their other alive neighbor agrees.

This creates interesting dynamics with neighboring players.`,
    tipsAndTricks: [
      "You need your other neighbor's agreement to kill.",
      "Use this to eliminate suspected evil players next to you.",
      "Or work with evil to eliminate good players.",
      "Your neighbors are very important to your ability."
    ],
    bluffingAs: [
      "Claim Gangster to explain why you're talking to your neighbors a lot.",
      "Pretend to negotiate kills that never happen.",
      "Use the threat of killing to influence your neighbors."
    ]
  },
  {
    id: 'gnome',
    name: 'Gnome',
    edition: 'experimental',
    team: 'traveler',
    ability: 'If you are exiled, a player is killed, decided by you, the exiled (if evil) or the Storyteller (if good).',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "I'm watching you...",
    extendedSummary: `The Gnome causes a death when exiled.

If the Gnome is exiled, a player dies. If the Gnome is evil, they choose who dies. If good, the Storyteller chooses.

This makes exiling the Gnome risky.`,
    tipsAndTricks: [
      "Being exiled triggers a death - use this as leverage.",
      "If evil, you get to choose who dies.",
      "If good, the Storyteller will help good by choosing the death.",
      "Threaten exile to influence the game."
    ],
    bluffingAs: [
      "Threaten that your exile will kill someone.",
      "Claim Gnome to discourage exile attempts.",
      "Use the threat to survive longer."
    ]
  },
  // FABLED
  {
    id: 'deusexfiasco',
    name: 'Deus ex Fiasco',
    edition: 'experimental',
    team: 'traveler',
    ability: 'Once per game, the Storyteller may choose a player: they die.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Used'],
    flavorQuote: "The gods are capricious.",
    extendedSummary: `Deus ex Fiasco gives the Storyteller a one-time kill.

Once per game, the Storyteller may use this Fabled to kill a player of their choice.

This is typically used to correct game imbalances.`,
    tipsAndTricks: [
      "This is a Storyteller tool to fix game problems.",
      "If things get too unbalanced, this might be used.",
      "Trust that the Storyteller is using it fairly.",
      "This death is outside normal rules."
    ],
    bluffingAs: []
  },
  {
    id: 'ferryman',
    name: 'Ferryman',
    edition: 'experimental',
    team: 'traveler',
    ability: 'On the final night, dead players who voted that day will die again. The Storyteller may reveal which dead player is in play.',
    firstNightOrder: null,
    otherNightOrder: 80,
    setup: false,
    reminders: [],
    flavorQuote: "Coin for the ferryman?",
    extendedSummary: `The Ferryman affects dead players who vote.

On the final night, dead players who voted during the day will 'die again' and lose their vote for the final day.

The Storyteller may reveal which dead player this affects.`,
    tipsAndTricks: [
      "Dead players must consider whether to vote.",
      "Voting costs them their final vote.",
      "This creates strategic voting decisions for the dead.",
      "The reveal can help good or evil depending on the situation."
    ],
    bluffingAs: []
  },
  {
    id: 'stormcatcher',
    name: 'Storm Catcher',
    edition: 'experimental',
    team: 'traveler',
    ability: 'Name a good character. If in play, they can only die by execution, but evil players learn which player it is.',
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: ['Protected'],
    flavorQuote: "The storm comes for us all.",
    extendedSummary: `Storm Catcher protects a character but reveals them to evil.

A good character is named. If that character is in play, that player can only die by execution - not by Demon kills or other night deaths.

However, all evil players learn which player is protected.`,
    tipsAndTricks: [
      "This protects a powerful good player from night death.",
      "But evil knows who they are - they become a target for execution.",
      "The protection lasts as long as Storm Catcher is in play.",
      "Trade-off between protection and exposure."
    ],
    bluffingAs: []
  }
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
  ...EXPERIMENTAL,
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
