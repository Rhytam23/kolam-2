import type { Theme } from './theme';
import type { LangCode } from './i18n';

/*
 * The cultural kit of each art form: the small things that make a page feel like its own tradition,
 * from the greeting at the door to the border band between sections. Everything here is taken from
 * what each tradition's own page already says (its motifs, materials and occasions in
 * data/traditions.ts), so it adds no new claims. Wording should be reviewed by people of each tradition.
 */

export type IconId = 'diya' | 'lotus' | 'shankha' | 'lamp' | 'peacock' | 'footprints' | 'fish' | 'paddy' | 'gobbemma' | 'chowk' | 'diamond' | 'rosette';
export type Connector = 'dots' | 'line' | 'wave' | 'zigzag' | 'none';
export type PatternId = 'pulli' | 'lotus' | 'rosette' | 'chowk' | 'diamond' | 'creeper';
export type DoorwayId = 'toran' | 'garland' | 'leaves' | 'none';

/** A border band: motifs in a row, joined by a connector, repeated across the width. */
export interface BandSpec { icons: IconId[]; connector: Connector }

export interface CultureKit {
  slug: string;
  /** How people greet at the door, in the art form's own language. */
  greeting: { word: string; lang: string; meaning: string };
  /** The small motif that sits on every heading rule. */
  ornament: IconId;
  /** The border band between sections; 'kolam' is the pulli loop band drawn by the kolam engine. */
  band: BandSpec | 'kolam';
  /** What hangs over the doorway at the top of the page. */
  doorway: DoorwayId;
  /** The faint pattern on dark sections and on light sections. */
  ground: PatternId;
  paper: PatternId;
  /** What a person does with the material: draw, paint or lay. */
  verb: 'draw' | 'paint' | 'lay';
  /** How the top of its page is composed: text beside the design, or everything centred around it. */
  hero: 'split' | 'centred';
  /** The interface language to offer, if the app has one for this tradition. */
  suggestedLang?: Exclude<LangCode, 'en'>;
}

export const KITS: Record<string, CultureKit> = {
  kolam: { slug: 'kolam', greeting: { word: 'வணக்கம்', lang: 'ta', meaning: 'Welcome' }, ornament: 'diya', band: 'kolam', doorway: 'toran', ground: 'pulli', paper: 'pulli', hero: 'split', verb: 'draw', suggestedLang: 'ta' },
  muggulu: { slug: 'muggulu', greeting: { word: 'నమస్కారం', lang: 'te', meaning: 'Welcome' }, ornament: 'gobbemma', band: { icons: ['gobbemma', 'rosette'], connector: 'dots' }, doorway: 'toran', ground: 'pulli', paper: 'pulli', hero: 'split', verb: 'draw', suggestedLang: 'te' },
  rangoli: { slug: 'rangoli', greeting: { word: 'नमस्कार', lang: 'mr', meaning: 'Welcome' }, ornament: 'lotus', band: { icons: ['diya', 'lotus'], connector: 'dots' }, doorway: 'toran', ground: 'rosette', paper: 'rosette', hero: 'centred', verb: 'draw' },
  alpana: { slug: 'alpana', greeting: { word: 'নমস্কার', lang: 'bn', meaning: 'Welcome' }, ornament: 'shankha', band: { icons: ['footprints', 'lotus'], connector: 'wave' }, doorway: 'leaves', ground: 'lotus', paper: 'lotus', hero: 'centred', verb: 'paint', suggestedLang: 'bn' },
  pookalam: { slug: 'pookalam', greeting: { word: 'നമസ്കാരം', lang: 'ml', meaning: 'Welcome' }, ornament: 'lamp', band: { icons: ['rosette'], connector: 'line' }, doorway: 'garland', ground: 'rosette', paper: 'rosette', hero: 'centred', verb: 'lay' },
  mandana: { slug: 'mandana', greeting: { word: 'नमस्ते', lang: 'hi', meaning: 'Welcome' }, ornament: 'peacock', band: { icons: ['diamond', 'chowk'], connector: 'zigzag' }, doorway: 'none', ground: 'chowk', paper: 'chowk', hero: 'split', verb: 'paint', suggestedLang: 'hi' },
  aipan: { slug: 'aipan', greeting: { word: 'नमस्कार', lang: 'hi', meaning: 'Welcome' }, ornament: 'footprints', band: { icons: ['chowk', 'footprints'], connector: 'dots' }, doorway: 'none', ground: 'chowk', paper: 'chowk', hero: 'split', verb: 'paint', suggestedLang: 'hi' },
  aripan: { slug: 'aripan', greeting: { word: 'प्रणाम', lang: 'mai', meaning: 'Greetings' }, ornament: 'fish', band: { icons: ['fish', 'lotus'], connector: 'wave' }, doorway: 'none', ground: 'creeper', paper: 'creeper', hero: 'centred', verb: 'paint' },
  'jhoti-chita': { slug: 'jhoti-chita', greeting: { word: 'ନମସ୍କାର', lang: 'or', meaning: 'Welcome' }, ornament: 'paddy', band: { icons: ['paddy', 'footprints'], connector: 'wave' }, doorway: 'leaves', ground: 'creeper', paper: 'creeper', hero: 'centred', verb: 'paint' },
  'chowk-purana': { slug: 'chowk-purana', greeting: { word: 'नमस्ते', lang: 'hi', meaning: 'Welcome' }, ornament: 'chowk', band: { icons: ['chowk', 'lotus'], connector: 'line' }, doorway: 'toran', ground: 'chowk', paper: 'chowk', hero: 'split', verb: 'draw', suggestedLang: 'hi' },
  chittara: { slug: 'chittara', greeting: { word: 'ನಮಸ್ಕಾರ', lang: 'kn', meaning: 'Welcome' }, ornament: 'diamond', band: { icons: ['diamond'], connector: 'zigzag' }, doorway: 'none', ground: 'diamond', paper: 'diamond', hero: 'split', verb: 'paint' },
};

/** Pages that belong to no one art form (home, studio, about): the lamp, with every band taking its turn. */
export const HOME_KIT: CultureKit = {
  slug: 'home', greeting: { word: 'स्वागत', lang: 'hi', meaning: 'Welcome' }, ornament: 'diya', band: 'kolam', doorway: 'toran', ground: 'pulli', paper: 'pulli', hero: 'split', verb: 'draw',
};

export const kitFor = (slug?: string): CultureKit => (slug && KITS[slug]) || HOME_KIT;
export const KIT_LIST = Object.values(KITS);

const hexToRgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/** A faint repeating pattern as a CSS background image and its tile size, in the given colour. */
export const patternFor = (id: PatternId, hex: string, alpha: number): { image: string; size: string } => {
  const [r, g, b] = hexToRgb(hex);
  const c = `rgba(${r},${g},${b},${alpha})`;
  const tile = (w: number, h: number, body: string) => ({
    image: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' fill='none' stroke='${c}' stroke-width='1'>${body}</svg>`)}")`,
    size: `${w}px ${h}px`,
  });
  switch (id) {
    case 'lotus': return tile(56, 56, `<path d='M28 12C32 18 32 26 28 32 24 26 24 18 28 12Z'/><path d='M28 32C21 31 17 27 16 21 22 22 26 26 28 32Z'/><path d='M28 32C35 31 39 27 40 21 34 22 30 26 28 32Z'/><circle cx='4' cy='4' r='1.2' fill='${c}' stroke='none'/>`);
    case 'rosette': return tile(48, 48, `<circle cx='24' cy='24' r='2' fill='${c}' stroke='none'/>${[0, 60, 120, 180, 240, 300].map(a => `<circle cx='${(24 + 7 * Math.cos((a * Math.PI) / 180)).toFixed(1)}' cy='${(24 + 7 * Math.sin((a * Math.PI) / 180)).toFixed(1)}' r='4'/>`).join('')}`);
    case 'chowk': return tile(40, 40, `<rect x='9' y='9' width='22' height='22'/><rect x='14' y='14' width='12' height='12'/><circle cx='20' cy='20' r='1.2' fill='${c}' stroke='none'/>`);
    case 'diamond': return tile(36, 36, `<path d='M18 5L31 18 18 31 5 18Z'/><path d='M18 11L25 18 18 25 11 18Z'/>`);
    case 'creeper': return tile(60, 30, `<path d='M0 15C10 5 20 25 30 15S50 5 60 15'/><circle cx='15' cy='9' r='1.4' fill='${c}' stroke='none'/><circle cx='45' cy='21' r='1.4' fill='${c}' stroke='none'/>`);
    default: return tile(28, 28, `<circle cx='14' cy='14' r='1.3' fill='${c}' stroke='none'/>`);
  }
};

/** The CSS variables that give a page its patterns: faint rice on the dark floor, faint accent on paper. */
export const culturePatterns = (kit: CultureKit, theme: Theme) => {
  const ground = patternFor(kit.ground, theme.rice, 0.13);
  const paper = patternFor(kit.paper, theme.kaavi, 0.14);
  return { '--ground-pattern': ground.image, '--ground-size': ground.size, '--paper-pattern': paper.image, '--paper-size': paper.size };
};
