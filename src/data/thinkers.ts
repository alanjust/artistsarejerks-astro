// Eight ways to look, each after a thinker. Plain-English rewrite of the old About page's thinkers.
export type Way = {title: string; idea: string; tryIt: string; good: string; bad: string; credit: string};

export const ways: Way[] = [
  {
    title: 'Give it three minutes',
    idea: "Some things only show up after you've been standing there a while.",
    tryIt: 'Pick one piece and stay with it for three minutes. What do you notice only after minute two?',
    good: 'Makes quiet shows and long, slow works that reward staying put.',
    bad: 'Fakes rarity and VIP mystique to pump up the price.',
    credit: 'After Walter Benjamin',
  },
  {
    title: 'Notice your body first',
    idea: 'Your gut often gets there before your brain does. Trust it for a minute.',
    tryIt: 'Before you read the label, name three things the piece does to you physically. Tense? Calm? Hungry?',
    good: 'Skips the explanation and lets the work hit you.',
    bad: 'Uses big words to make your gut reaction feel naive.',
    credit: 'After Susan Sontag',
  },
  {
    title: 'Decide what it means to you',
    idea: "The artist doesn't own the meaning. You get a vote.",
    tryIt: 'Write one sentence about what the piece means to you. No quotes, no borrowing from the label.',
    good: 'Leaves room for lots of readings and hands the meaning back to you.',
    bad: 'Insists there\'s one right answer, and it\'s theirs.',
    credit: 'After Roland Barthes',
  },
  {
    title: 'Imagine it somewhere else',
    idea: 'Where a thing is shown changes what it is. A urinal in a museum is not a urinal in a restroom.',
    tryIt: 'Pick something ordinary around you. Imagine it on a pedestal in a gallery. What does it start to mean?',
    good: 'Puts ordinary things in new settings to show how much the setting does.',
    bad: 'Leans on the gallery walls to make thin work look important.',
    credit: 'After Arthur Danto',
  },
  {
    title: "Ask who's missing",
    idea: "Every picture shows some people and leaves others out. That's worth noticing.",
    tryIt: 'Ask three questions: who is here, who isn\'t, and why might that matter?',
    good: 'Brings people and stories into view that usually get left out.',
    bad: 'Uses someone\'s identity or pain as a way to get attention.',
    credit: 'After bell hooks',
  },
  {
    title: 'Pick one and ignore the rest',
    idea: 'Less is more. A limit sharpens your attention.',
    tryIt: 'In a crowded show, adopt one piece. Pretend the others aren\'t there.',
    good: 'Uses tight limits, like small works or sparse shows, to focus your attention.',
    bad: 'Piles on spectacle and information to hide that there\'s not much there.',
    credit: 'After Barry Schwartz',
  },
  {
    title: 'Connect it to something unrelated',
    idea: 'Meaning spreads sideways. Follow the odd connections.',
    tryIt: 'Link the piece to a song, a memory, and something from the news. What grows out of that?',
    good: 'Invites remixing and surprising links across ideas and media.',
    bad: 'Builds a maze of theory to keep people out.',
    credit: 'After Gilles Deleuze',
  },
  {
    title: "Look for what doesn't belong",
    idea: 'The rule used to be that each art form should stay pure. The rule was wrong.',
    tryIt: 'List what\'s mixed into the piece: odd materials, borrowed sources, other genres. How do they make it better?',
    good: 'Mixes materials and references to widen the experience.',
    bad: 'Polices the rules and declares whole kinds of work invalid.',
    credit: 'After Clement Greenberg, by arguing with him',
  },
];
