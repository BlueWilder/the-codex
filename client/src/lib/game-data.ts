// Static data for characters to bootstrap the frontend
export interface Character {
  id: string;
  name: string;
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler';
  ability: string;
  firstNight?: boolean;
  otherNight?: boolean;
}

export const CHARACTERS: Character[] = [
  // TOWNSFOLK
  { id: 'washerwoman', name: 'Washerwoman', team: 'townsfolk', ability: 'Start knowing that 1 of 2 players is a particular Townsfolk.', firstNight: true },
  { id: 'librarian', name: 'Librarian', team: 'townsfolk', ability: 'Start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)', firstNight: true },
  { id: 'investigator', name: 'Investigator', team: 'townsfolk', ability: 'Start knowing that 1 of 2 players is a particular Minion.', firstNight: true },
  { id: 'chef', name: 'Chef', team: 'townsfolk', ability: 'Start knowing how many pairs of evil players are neighbors.', firstNight: true },
  { id: 'empath', name: 'Empath', team: 'townsfolk', ability: 'Each night, you learn how many of your 2 alive neighbors are evil.', otherNight: true },
  { id: 'fortuneteller', name: 'Fortune Teller', team: 'townsfolk', ability: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.', otherNight: true },
  { id: 'undertaker', name: 'Undertaker', team: 'townsfolk', ability: 'Each night*, you learn which character died by execution today.', otherNight: true },
  { id: 'monk', name: 'Monk', team: 'townsfolk', ability: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.', otherNight: true },
  { id: 'ravenkeeper', name: 'Ravenkeeper', team: 'townsfolk', ability: 'If you die at night, you are woken to choose a player: you learn their character.' },
  { id: 'virgin', name: 'Virgin', team: 'townsfolk', ability: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.' },
  { id: 'slayer', name: 'Slayer', team: 'townsfolk', ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.' },
  { id: 'soldier', name: 'Soldier', team: 'townsfolk', ability: 'You are safe from the Demon.' },
  { id: 'mayor', name: 'Mayor', team: 'townsfolk', ability: 'If no one is executed, you might die. If you die at night, another player might die instead.' },
  
  // OUTSIDERS
  { id: 'butler', name: 'Butler', team: 'outsider', ability: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.', otherNight: true },
  { id: 'drunk', name: 'Drunk', team: 'outsider', ability: 'You do not know you are the Drunk. You think you are a Townsfolk, but you are not.' },
  { id: 'recluse', name: 'Recluse', team: 'outsider', ability: 'You might register as evil & as a Minion or Demon, even if dead.' },
  { id: 'saint', name: 'Saint', team: 'outsider', ability: 'If you die by execution, your team loses.' },

  // MINIONS
  { id: 'poisoner', name: 'Poisoner', team: 'minion', ability: 'Each night, choose a player: they are poisoned tonight and tomorrow day.', firstNight: true, otherNight: true },
  { id: 'spy', name: 'Spy', team: 'minion', ability: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.', firstNight: true, otherNight: true },
  { id: 'scarletwoman', name: 'Scarlet Woman', team: 'minion', ability: 'If there are 5 or more players alive & the Demon dies, you become the Demon. (Travelers don\'t count).' },
  { id: 'baron', name: 'Baron', team: 'minion', ability: 'There are extra Outsiders in play. [+2 Outsiders]' },

  // DEMONS
  { id: 'imp', name: 'Imp', team: 'demon', ability: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.', otherNight: true },
];

export const OFFICIAL_SCRIPTS = [
  {
    id: 1,
    name: 'Trouble Brewing',
    author: 'The Pandemonium Institute',
    description: 'The classic introductory script. Balanced and beginner-friendly.',
    isOfficial: true,
    content: CHARACTERS.map(c => c.id), // Simplified for now
  }
];
