/** Colours used in floor art, with the traditional material each one usually comes from. */
export interface TraditionalColour {
  name: string;
  hex: string;
  material: string;
}

export const TRADITIONAL_COLOURS: TraditionalColour[] = [
  { name: 'Rice-flour white', hex: '#F7F3EA', material: 'Rice flour (arisi maavu), white stone powder or chalk' },
  { name: 'Kaavi red', hex: '#A63A1E', material: 'Kaavi or semman (red earth), used for borders and outlines' },
  { name: 'Kumkum red', hex: '#C62839', material: 'Kumkum or red rangoli powder' },
  { name: 'Turmeric yellow', hex: '#E1AD01', material: 'Turmeric (manjal) mixed into rice flour' },
  { name: 'Marigold orange', hex: '#F08A00', material: 'Marigold petals or orange rangoli powder' },
  { name: 'Leaf green', hex: '#2E7D32', material: 'Dried, powdered leaves or green rangoli powder' },
  { name: 'Indigo blue', hex: '#2F3E9E', material: 'Indigo (neel) or blue rangoli powder' },
  { name: 'Rose pink', hex: '#E75480', material: 'Rose petals or pink gulal' },
  { name: 'Violet', hex: '#7B3F98', material: 'Violet rangoli powder' },
  { name: 'Earth brown', hex: '#6B4226', material: 'Mud or cow-dung plastered floor, the traditional ground' },
  { name: 'Charcoal black', hex: '#2B2B2B', material: 'Charcoal powder or a dark stone floor' },
  { name: 'Floor cream', hex: '#F3E3C3', material: 'A washed cement or stone floor, or paper' },
];

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/** Perceptually weighted RGB distance ("redmean"); good enough to name a colour. */
const distance = (a: string, b: string) => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
};

export const nearestTraditional = (hex: string): TraditionalColour =>
  TRADITIONAL_COLOURS.reduce((best, c) => (distance(hex, c.hex) < distance(hex, best.hex) ? c : best));

const GROUNDS: TraditionalColour[] = [
  { name: 'Light floor', hex: '#F6EBD6', material: 'A washed cement or stone floor, or light paper' },
  { name: 'Red-earth floor', hex: '#9A4731', material: 'Floor coated with kaavi or semman (red earth)' },
  { name: 'Mud floor', hex: '#6B4226', material: 'Mud or cow-dung plastered floor, the traditional ground' },
  { name: 'Dark floor', hex: '#25222E', material: 'Dark stone or a floor washed dark; white and bright powders stand out' },
];

/** Grounds are named as floors, not as powders. */
export const nearestGround = (hex: string): TraditionalColour =>
  GROUNDS.reduce((best, c) => (distance(hex, c.hex) < distance(hex, best.hex) ? c : best));

/** Ready-made colour sets for the generators. */
export const PALETTES = {
  riceFlour: { label: 'Rice flour on red floor', background: '#8E3B24', colors: ['#F7F3EA'] },
  kaavi: { label: 'Kaavi on cream', background: '#FFF8EE', colors: ['#A63A1E'] },
  pongal: { label: 'Pongal festive', background: '#FFF8EE', colors: ['#C62839', '#F08A00', '#2E7D32', '#E1AD01', '#2F3E9E', '#E75480'] },
  diwali: { label: 'Diwali night', background: '#1F1A3A', colors: ['#F08A00', '#E1AD01', '#E75480', '#F7F3EA', '#7B3F98'] },
} as const;

export type PaletteName = keyof typeof PALETTES;

export const isDark = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
};
