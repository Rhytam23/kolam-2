/*
 * How each art form talks about itself in the studio, the drawing guide and practice: its own name,
 * its word for a dot, how its ground is prepared and its material applied, and whether the dots are
 * part of how it is made or only a help for learners. Everything is taken from what the art form's
 * own page already says (data/traditions.ts), so no step claims more than that page does. Pages
 * that belong to no one art form (home, studio, about) use GENERAL, the wording the app began with.
 * Practitioners of each tradition should review these texts.
 */

export interface TraditionVoice {
  /** The art form in a sentence: "a kolam", "an alpana". */
  art: string;
  /** Its plural: "kolams". */
  plural: string;
  /** What its dots are called. */
  dotWord: string;
  /** Names of the studio tabs for the kinds of design it offers. */
  modeLabels: { kolam: string; radial: string; geometric: string };
  /** Step 1 of the guide, before the name of the ground. */
  ground: string;
  /** How the material is applied: the tip on the line and ring steps. */
  apply: string;
  /** The tip on the last step. */
  finish: string;
  /** How a ring step begins: join the dots, or lay petals. */
  ring: string;
  /** The verb in a ring step's title: "Join the dots:", "Paint", "Lay". */
  ringTitle: string;
  /** 'tradition': the dots are how it is made. 'aid': it is made by hand, and dots are only a help for learners. */
  dots: 'tradition' | 'aid';
  /** Where a round design is started. */
  start: 'dots-first' | 'centre-out';
  /** The label of the one-line option of dot designs. */
  singleLine: string;
  /** The label of the design-file download. */
  file: string;
}

const GENERAL: TraditionVoice = {
  art: 'a design', plural: 'designs', dotWord: 'dots',
  modeLabels: { kolam: 'Dot kolam', radial: 'Round designs', geometric: 'Straight lines' },
  ground: 'Sweep the floor and sprinkle water so the powder sticks.',
  apply: 'Take a pinch of powder between thumb and finger and let it run in a steady line.',
  finish: 'Pour powder into a paper cone or pinch it between thumb and fingers to fill evenly.',
  ring: 'Join the dots of this ring into',
  ringTitle: 'Join the dots:',
  dots: 'tradition', start: 'dots-first',
  singleLine: 'One continuous line (sikku kolam)', file: '.kolam.json',
};

const make = (v: Partial<Omit<TraditionVoice, 'modeLabels'>> & Pick<TraditionVoice, 'art' | 'plural'> & { modeLabels?: Partial<TraditionVoice['modeLabels']> }): TraditionVoice => ({
  ...GENERAL, singleLine: 'One continuous line', file: 'Design file (.kolam.json)', dots: 'aid', ...v,
  // Kinds of design an art form does not offer get a neutral name, never another art form's.
  modeLabels: { kolam: 'Dot designs', radial: 'Round designs', geometric: 'Straight lines', ...v.modeLabels },
});

/** Art forms made by painting: their steps say "Paint", not "Join the dots". */
const PAINTED = { ringTitle: 'Paint', ring: 'Paint this ring as' } as const;

/** Freehand traditions painted with the fingers in rice paste. */
const PASTE = 'Dip a fingertip, or a twist of cloth, in the rice paste and paint the line in one steady stroke.';

export const VOICES: Record<string, TraditionVoice> = {
  kolam: make({
    art: 'a kolam', plural: 'kolams', dotWord: 'pulli',
    modeLabels: { kolam: 'Pulli kolam', radial: 'Circle of curls' },
    ground: 'Kolams are drawn at dawn on a swept, wet threshold.',
    apply: 'Let the rice flour fall in a thin stream from between your thumb and forefinger.',
    finish: 'Go over any thin places with a fine line of rice flour; coloured powders come on festival days.',
    dots: 'tradition', singleLine: 'One continuous line (sikku kolam)', file: '.kolam.json',
  }),
  muggulu: make({
    art: 'a muggu', plural: 'muggulu', dotWord: 'chukka',
    modeLabels: { kolam: 'Dots and curves', geometric: 'Dots and straight lines' },
    ground: 'Muggulu are drawn at the entrance each morning, on ground washed with water or cow dung.',
    apply: 'Let the white powder of rice flour or ground stone fall in a thin line from between your thumb and finger.',
    finish: 'Bright colours are added at Sankranti; set gobbemmalu (flower-decorated cow-dung mounds) on the finished muggu.',
    dots: 'tradition',
  }),
  rangoli: make({
    art: 'a rangoli', plural: 'rangolis', ringTitle: 'Draw', ring: 'Draw this ring as',
    modeLabels: { radial: 'Round rangoli' },
    ground: 'Sweep the floor at the entrance, then sprinkle a little water so the powder sticks.',
    apply: 'Take a pinch of coloured powder between thumb and finger, or pour it through a paper cone, and let it run in a steady line.',
    finish: 'Fill each shape with its colour; coloured powders, or flower petals, work equally well.',
  }),
  alpana: make({
    art: 'an alpana', ...PAINTED, plural: 'alpanas',
    modeLabels: { radial: 'Round alpana' },
    ground: 'Alpana is painted with rice paste. Clean the floor so the paste will take.',
    apply: PASTE,
    finish: 'Add the small dots and touches in paste. Where the palette has alta, touch in the red last.',
    start: 'centre-out',
  }),
  pookalam: make({
    art: 'a pookalam', plural: 'pookalams',
    modeLabels: { radial: 'Flower rings' },
    ground: 'A pookalam is laid on clean ground in front of the house, small on the first day and larger each day of Onam.',
    apply: 'Lay fresh petals and leaves with your fingertips, ring by ring, from the centre outwards.',
    finish: 'Put a lamp or a flower at the centre.',
    ring: 'Lay petals along this ring to form',
    ringTitle: 'Lay',
    start: 'centre-out',
  }),
  mandana: make({
    art: 'a mandana', ...PAINTED, plural: 'mandanas',
    modeLabels: { geometric: 'Mandana patterns' },
    ground: 'A mandana is drawn on ground coated with red ochre (geru) and cow dung.',
    apply: 'Draw each line in white khadiya (chalk) in one steady stroke.',
    finish: 'Check the squares, triangles and stars against each other: the design is the same on every side.',
  }),
  aipan: make({
    art: 'an aipan', ...PAINTED, plural: 'aipans',
    modeLabels: { geometric: 'Aipan chowkis' },
    ground: 'Aipan is drawn on a surface coated with red ochre (geru).',
    apply: 'Draw each line with your fingers in white rice paste (biswar).',
    finish: 'Check each chowki against the others before the paste dries.',
  }),
  aripan: make({
    art: 'an aripan', ...PAINTED, plural: 'aripans',
    modeLabels: { radial: 'Round aripan' },
    ground: 'Aripan is drawn on the floor of the courtyard or at the doorway.',
    apply: 'Draw each line in white rice paste (pithar), then touch in vermilion and turmeric.',
    finish: 'Finish with touches of vermilion (sindoor) and turmeric.',
    start: 'centre-out',
  }),
  'jhoti-chita': make({
    art: 'a jhoti chita', ...PAINTED, plural: 'jhoti chitas',
    modeLabels: { radial: 'Round jhoti' },
    ground: 'Jhoti chita is painted on a clean mud floor or wall.',
    apply: 'Dip your fingers, or a piece of cloth, in rice paste (pithau) and paint the line in one steady stroke.',
    finish: 'Add the small details, such as paddy stalks and creepers, last.',
    start: 'centre-out',
  }),
  'chowk-purana': make({
    art: 'a chowk purana', plural: 'chowk puranas',
    modeLabels: { geometric: 'Chowk patterns' },
    ground: 'Mark a square (chowk) on the swept floor; the design fills it.',
    apply: 'Let the flour or rice powder run in a thin line from between your thumb and finger.',
    finish: 'Fill the square with colours: turmeric, kumkum and other powders.',
  }),
  chittara: make({
    art: 'a chittara', ...PAINTED, plural: 'chittaras',
    modeLabels: { geometric: 'Chittara bands' },
    ground: 'Chittara is painted on a red-earth wall or floor.',
    apply: 'Paint each line with white rice paste.',
    finish: 'Add the yellow and black details last.',
  }),
};

export const GENERAL_VOICE = GENERAL;

/** The name of the art form without its article: "alpana". */
export const artName = (v: TraditionVoice) => v.art.replace(/^an? /, '');

/** "Pulli", "Chukka"; "Dot" when the art form has no word of its own. */
export const dotTitle = (v: TraditionVoice) => (v.dotWord === 'dots' ? 'Dot' : v.dotWord[0].toUpperCase() + v.dotWord.slice(1));

export const voiceFor = (slug: string): TraditionVoice => VOICES[slug] ?? GENERAL;
