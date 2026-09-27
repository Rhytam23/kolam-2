import type { Theme } from '../lib/theme';
import type { PaletteName } from '../lib/colours';
import type { RadialStyle } from '../utils/radial';
import type { GeometricPattern } from '../utils/geometric';
import type { DesignPreset } from './designs';

/*
 * The floor-art traditions of India that each have their own page. Only widely known traditions
 * are included, and no two with near-identical names (rangavalli is covered under rangoli). The
 * facts are kept to what is well documented.
 */

export interface Tradition {
  slug: string;
  name: string;
  /** The name in its own script. */
  script: { word: string; lang: string };
  region: string;
  /** When it is made. */
  occasion: string;
  materials: string;
  motifs: string;
  about: string[];
  /** A tradition that is easily confused with this one. */
  related?: { slug: string; note: string };
  theme: Theme;
  palettes: PaletteName[];
  modes: Array<'kolam' | 'radial' | 'geometric'>;
  radialStyles: RadialStyle[];
  patterns: GeometricPattern[];
  /** The first is the signature design, drawn at the top of the page. */
  designs: DesignPreset[];
}

export const TRADITIONS: Tradition[] = [
  {
    slug: 'kolam',
    name: 'Kolam',
    script: { word: 'கோலம்', lang: 'ta' },
    region: 'Tamil Nadu',
    occasion: 'Every morning at the doorstep; larger and more colourful in the month of Margazhi and at Pongal.',
    materials: 'Rice flour, or white stone powder; coloured powders on festival days.',
    motifs: 'A grid of dots (pulli) with lines looping round them; single-line sikku kolams; lotuses and lamps.',
    about: [
      'Before sunrise the threshold is swept and sprinkled with water, and a kolam is drawn in rice flour. It welcomes the day, and the rice feeds ants and birds.',
      'Most kolams start from a grid of dots. The line never touches a dot: it loops round each one, and in a sikku kolam a single unbroken line goes round every dot and returns to where it began.',
    ],
    theme: { floor: '#25201D', floor2: '#3A322C', rice: '#F7F3EA', brass: '#C8553D', brassLight: '#F4A987', kaavi: '#A63A1E', paper: '#FBF6EE', ink: '#2B211C', muted: '#5E5048' },
    palettes: ['threshold', 'darkFloor', 'kaavi', 'riceFlour', 'pongal'],
    modes: ['kolam', 'radial'],
    radialStyles: ['curls'],
    patterns: [],
    designs: [
      { title: 'Sikku kolam', kind: 'Sikku', detail: '13 dots, one unbroken line', spec: { mode: 'kolam', shape: 'diamond', size: 5, singleLine: true, palette: 'threshold' } },
      { title: 'Circle of curls', kind: 'Pulli kolam', detail: 'Curls wound round coloured dots', spec: { mode: 'radial', style: 'curls', petals: 8, layers: 3, palette: 'darkFloor' } },
      { title: 'Pulli kolam', kind: 'Pulli kolam', detail: '25 dots, lines looping round them', spec: { mode: 'kolam', shape: 'diamond', size: 7, singleLine: false, palette: 'riceFlour' } },
      { title: 'Pongal kolam', kind: 'Festival', detail: 'Each line in its own colour', spec: { mode: 'kolam', shape: 'square', size: 4, singleLine: false, palette: 'pongal' } },
    ],
  },
  {
    slug: 'muggulu',
    name: 'Muggulu',
    script: { word: 'ముగ్గులు', lang: 'te' },
    region: 'Andhra Pradesh and Telangana',
    occasion: 'Every morning in front of the home; the largest and most colourful for Sankranti in January.',
    materials: 'White powder of rice flour or ground stone, and bright colours at Sankranti.',
    motifs: 'Dot grids joined by straight or curved lines, stars and flowers; at Sankranti, gobbemmalu (cow-dung mounds decorated with flowers) are set on them.',
    about: [
      'Muggulu are drawn at the entrance each morning, on ground washed with water or cow dung. Many are built on a grid of dots, joined by straight lines into stars and diamonds or by curves.',
      'During Sankranti the muggulu grow large and colourful, and whole streets are filled with them.',
    ],
    theme: { floor: '#3F3A22', floor2: '#55502F', rice: '#FBF7EC', brass: '#E75480', brassLight: '#FFB3CF', kaavi: '#A8235A', paper: '#FAF7EC', ink: '#2A2716', muted: '#5C5840' },
    palettes: ['sankranti', 'muggu', 'pongal'],
    modes: ['geometric', 'kolam'],
    radialStyles: [],
    patterns: ['star'],
    designs: [
      { title: 'Muggu star', kind: 'Straight lines', detail: 'Stars joined from dot to dot', spec: { mode: 'geometric', pattern: 'star', size: 9, palette: 'sankranti' } },
      { title: 'White muggu', kind: 'Straight lines', detail: 'Nested stars in white', spec: { mode: 'geometric', pattern: 'star', size: 13, palette: 'muggu' } },
      { title: 'Sankranti muggu', kind: 'Curved lines', detail: 'Lines looping round dots, in colour', spec: { mode: 'kolam', shape: 'square', size: 5, singleLine: false, palette: 'sankranti' } },
    ],
  },
  {
    slug: 'rangoli',
    name: 'Rangoli',
    script: { word: 'रांगोळी', lang: 'mr' },
    region: 'Maharashtra, Gujarat and across India',
    occasion: 'Above all at Diwali; also at weddings and festivals, and to welcome guests.',
    materials: 'Coloured powders, traditionally from rice, stone powder, turmeric and kumkum; flower petals.',
    motifs: 'Lotuses, lamps (diyas), peacocks, and geometric and flower patterns.',
    about: [
      'Rangoli is made on the floor at the entrance and in courtyards, most of all at Diwali, to welcome the goddess Lakshmi and guests into the home.',
      'The outline is drawn first and then filled with bright powders poured between the fingers. In Karnataka the same art is called rangavalli.',
    ],
    theme: { floor: '#FFF7F0', floor2: '#FBE7DB', rice: '#2B1524', brass: '#D6246E', brassLight: '#8E1049', kaavi: '#0F6E7A', paper: '#FFFFFF', ink: '#2B1524', muted: '#5E4A57' },
    palettes: ['gulal', 'pongal', 'diwali', 'festival'],
    modes: ['radial'],
    radialStyles: ['festival', 'lotus', 'star', 'marigold'],
    patterns: [],
    designs: [
      { title: 'Festival rangoli', kind: 'Rangoli', detail: 'Six bands of petals, leaves and teardrops', spec: { mode: 'radial', style: 'festival', petals: 12, layers: 4, palette: 'gulal' } },
      { title: 'Lotus rangoli', kind: 'Rangoli', detail: '8 petals in 3 rings', spec: { mode: 'radial', style: 'lotus', petals: 8, layers: 3, palette: 'pongal' } },
      { title: 'Diwali rangoli', kind: 'Rangoli', detail: 'An eight-pointed star for the night of lamps', spec: { mode: 'radial', style: 'star', petals: 8, layers: 3, palette: 'diwali' } },
    ],
  },
  {
    slug: 'alpana',
    name: 'Alpana',
    script: { word: 'আলপনা', lang: 'bn' },
    region: 'Bengal',
    occasion: 'Lakshmi Puja, Durga Puja, weddings and other rites.',
    materials: 'A paste of soaked, ground rice, painted with the fingertips or a twist of cloth.',
    motifs: 'Lotuses, conch shells, paddy stalks, fish, and the small footprints of Lakshmi.',
    about: [
      'Alpana is painted rather than poured: a fingertip or a twist of cloth dipped in rice paste draws flowing white lines on the floor.',
      'It is made for pujas and weddings; at Lakshmi Puja, a trail of the goddess’s small footprints leads into the home.',
    ],
    theme: { floor: '#9A4A2E', floor2: '#A8553A', rice: '#FFF7EE', brass: '#FFB199', brassLight: '#FFD9C7', kaavi: '#B3122E', paper: '#FFF6F0', ink: '#3A1A10', muted: '#6E4A3C' },
    palettes: ['alpana', 'alta', 'riceFlour'],
    modes: ['radial'],
    radialStyles: ['alpana', 'lotus'],
    patterns: [],
    designs: [
      { title: 'Alpana', kind: 'Alpana', detail: 'Double-outlined petals in rice paste', spec: { mode: 'radial', style: 'alpana', petals: 8, layers: 3, palette: 'alpana' } },
      { title: 'Twelve-petal alpana', kind: 'Alpana', detail: 'Rice paste with alta red', spec: { mode: 'radial', style: 'alpana', petals: 12, layers: 2, palette: 'alta' } },
      { title: 'Lotus alpana', kind: 'Alpana', detail: 'A filled lotus for a puja', spec: { mode: 'radial', style: 'lotus', petals: 8, layers: 2, palette: 'alta' } },
    ],
  },
  {
    slug: 'pookalam',
    name: 'Pookalam',
    script: { word: 'പൂക്കളം', lang: 'ml' },
    region: 'Kerala',
    occasion: 'Onam: made each day for ten days, from Atham to Thiruvonam.',
    materials: 'Fresh flower petals and leaves, such as marigold, thumba and chrysanthemum.',
    motifs: 'Concentric rings of petals in bright colours, often with a lamp or a flower at the centre.',
    about: [
      'A pookalam is laid on the ground with fresh flowers during Onam. It starts small on Atham and grows with each day of the festival until Thiruvonam.',
      'Families and neighbours make it together, and many places hold pookalam competitions.',
    ],
    theme: { floor: '#1F4A2C', floor2: '#2B5E3A', rice: '#FFFBEA', brass: '#F28C00', brassLight: '#FFC93C', kaavi: '#B83A0A', paper: '#FFFBEF', ink: '#1D2A1F', muted: '#4E5A4F' },
    palettes: ['onam', 'thumba'],
    modes: ['radial'],
    radialStyles: ['pookalam', 'marigold'],
    patterns: [],
    designs: [
      { title: 'Onam pookalam', kind: 'Pookalam', detail: 'Rings of petals in six colours', spec: { mode: 'radial', style: 'pookalam', petals: 12, layers: 3, palette: 'onam' } },
      { title: 'Marigold pookalam', kind: 'Pookalam', detail: 'Marigold and thumba in two rings', spec: { mode: 'radial', style: 'pookalam', petals: 16, layers: 2, palette: 'thumba' } },
      { title: 'Flower star', kind: 'Pookalam', detail: 'Rays of petals', spec: { mode: 'radial', style: 'marigold', petals: 12, layers: 3, palette: 'onam' } },
    ],
  },
  {
    slug: 'mandana',
    name: 'Mandana',
    script: { word: 'मांडना', lang: 'hi' },
    region: 'Rajasthan and Madhya Pradesh',
    occasion: 'Festivals such as Diwali, and weddings; drawn on floors and walls.',
    materials: 'White chalk (khadiya) on ground coated with red ochre (geru) and cow dung.',
    motifs: 'Squares, triangles and stars; also peacocks, tigers and other animals.',
    about: [
      'Mandana are drawn by women in white khadiya on floors and walls freshly coated with red geru. The name comes from mandan, meaning decoration.',
      'Each festival has its own mandana, and many are strongly geometric: squares, triangles and stars with saw-tooth borders.',
    ],
    theme: { floor: '#8B3A22', floor2: '#9A4329', rice: '#FFFDF7', brass: '#E0A93B', brassLight: '#FFDF9E', kaavi: '#8A3319', paper: '#FBF5EC', ink: '#2E1A12', muted: '#6A4B3C' },
    palettes: ['khadiya'],
    modes: ['geometric'],
    radialStyles: [],
    patterns: ['mandana', 'star'],
    designs: [
      { title: 'Mandana', kind: 'Mandana', detail: 'A star inside a saw-tooth border', spec: { mode: 'geometric', pattern: 'mandana', size: 9, palette: 'khadiya' } },
      { title: 'Large mandana', kind: 'Mandana', detail: 'On a larger grid of dots', spec: { mode: 'geometric', pattern: 'mandana', size: 13, palette: 'khadiya' } },
      { title: 'Mandana star', kind: 'Mandana', detail: 'Nested eight-pointed stars', spec: { mode: 'geometric', pattern: 'star', size: 11, palette: 'khadiya' } },
    ],
  },
  {
    slug: 'aipan',
    name: 'Aipan',
    script: { word: 'ऐपण', lang: 'hi' },
    region: 'Kumaon, Uttarakhand',
    occasion: 'Festivals such as Diwali, weddings and other ceremonies; on floors, doorsteps and walls.',
    materials: 'Rice paste (biswar) drawn with the fingers on a ground of red ochre (geru).',
    motifs: 'Square chowkis for particular gods and occasions, dots and lines, and the footprints of Lakshmi.',
    about: [
      'Aipan is drawn with the fingers in white rice paste, called biswar, on a surface coated with red geru.',
      'Its designs are strongly geometric: nested squares and diamonds with rows of dots, and special chowkis drawn for particular gods and ceremonies.',
    ],
    related: { slug: 'aripan', note: 'Aipan is from Uttarakhand. Aripan, with a similar name, is a different tradition from Bihar.' },
    theme: { floor: '#B23A2B', floor2: '#BC4434', rice: '#FFFFFF', brass: '#F59E0B', brassLight: '#FFE7B0', kaavi: '#9B2C20', paper: '#FFF7F2', ink: '#3A1410', muted: '#6D4640' },
    palettes: ['biswar'],
    modes: ['geometric'],
    radialStyles: [],
    patterns: ['chowki', 'star'],
    designs: [
      { title: 'Chowki', kind: 'Aipan', detail: 'Nested squares and diamonds', spec: { mode: 'geometric', pattern: 'chowki', size: 9, palette: 'biswar' } },
      { title: 'Large chowki', kind: 'Aipan', detail: 'On a larger grid of dots', spec: { mode: 'geometric', pattern: 'chowki', size: 13, palette: 'biswar' } },
      { title: 'Aipan star', kind: 'Aipan', detail: 'Stars in white on geru', spec: { mode: 'geometric', pattern: 'star', size: 9, palette: 'biswar' } },
    ],
  },
  {
    slug: 'aripan',
    name: 'Aripan',
    script: { word: 'अरिपन', lang: 'mai' },
    region: 'Mithila, Bihar',
    occasion: 'Festivals, weddings and other family ceremonies.',
    materials: 'Rice paste (pithar) on the floor, with touches of vermilion (sindoor) and turmeric.',
    motifs: 'Lotuses, fish, the sun and moon, footprints and circles.',
    about: [
      'Aripan is the floor art of Mithila, drawn in courtyards and at the doorway in white rice paste, often finished with vermilion and turmeric.',
      'It belongs to the same region as Madhubani (Mithila) painting and shares many of its motifs, such as the lotus and the fish.',
    ],
    related: { slug: 'aipan', note: 'Aripan is from Bihar. Aipan, with a similar name, is a different tradition from Uttarakhand.' },
    theme: { floor: '#6B5846', floor2: '#76624F', rice: '#FFF8EC', brass: '#E34234', brassLight: '#FFD27A', kaavi: '#B8321F', paper: '#FDF8F1', ink: '#2F2419', muted: '#62564A' },
    palettes: ['pithar'],
    modes: ['radial'],
    radialStyles: ['aripan'],
    patterns: [],
    designs: [
      { title: 'Aripan lotus', kind: 'Aripan', detail: 'White lotus with vermilion and turmeric', spec: { mode: 'radial', style: 'aripan', petals: 8, layers: 3, palette: 'pithar' } },
      { title: 'Twelve-petal aripan', kind: 'Aripan', detail: 'With a border of turmeric dots', spec: { mode: 'radial', style: 'aripan', petals: 12, layers: 4, palette: 'pithar' } },
    ],
  },
  {
    slug: 'jhoti-chita',
    name: 'Jhoti Chita',
    script: { word: 'ଝୋଟି ଚିତା', lang: 'or' },
    region: 'Odisha',
    occasion: 'Manabasa Gurubar, the Thursdays of the month of Margasira when Lakshmi is worshipped; and other festivals.',
    materials: 'Rice paste (pithau) applied with the fingers or a piece of cloth, on mud floors and walls.',
    motifs: 'Lotuses, the footprints of Lakshmi, paddy stalks, creepers and fish.',
    about: [
      'Jhoti or chita is painted in white rice paste on the floors and walls of homes in Odisha, in single flowing lines.',
      'It is made above all for Manabasa Gurubar, when Lakshmi is welcomed into the home, and paddy stalks recall the harvest.',
    ],
    theme: { floor: '#5A4130', floor2: '#6E5240', rice: '#FFFDF6', brass: '#8DB53C', brassLight: '#D4E89A', kaavi: '#44701A', paper: '#FBF8F1', ink: '#2A1F16', muted: '#5F5446' },
    palettes: ['pitau'],
    modes: ['radial'],
    radialStyles: ['jhoti'],
    patterns: [],
    designs: [
      { title: 'Jhoti lotus', kind: 'Jhoti', detail: 'Lotus and paddy in single white lines', spec: { mode: 'radial', style: 'jhoti', petals: 8, layers: 3, palette: 'pitau' } },
      { title: 'Twelve-petal jhoti', kind: 'Jhoti', detail: 'Two rings of lotus and paddy', spec: { mode: 'radial', style: 'jhoti', petals: 12, layers: 2, palette: 'pitau' } },
    ],
  },
  {
    slug: 'chowk-purana',
    name: 'Chowk Purana',
    script: { word: 'चौक पूरना', lang: 'hi' },
    region: 'Uttar Pradesh',
    occasion: 'Weddings, the birth of a child, pujas and festivals such as Diwali.',
    materials: 'Flour and rice, with turmeric, kumkum and other colours.',
    motifs: 'A square (chowk) filled with triangles, stars and lotuses.',
    about: [
      'Chowk purana means filling the square. A square is marked on the floor and filled with patterns in flour and colours.',
      'The finished chowk marks the sacred place of a ceremony, where a lamp, a pot or the people being blessed are placed.',
    ],
    theme: { floor: '#F8EBC8', floor2: '#F0DCA6', rice: '#3A2410', brass: '#C8102E', brassLight: '#9E1B1B', kaavi: '#B3261E', paper: '#FFFCF3', ink: '#3A2410', muted: '#6A5436' },
    palettes: ['chowk'],
    modes: ['geometric'],
    radialStyles: [],
    patterns: ['chowk', 'star'],
    designs: [
      { title: 'Chowk', kind: 'Chowk', detail: 'Triangles round a central diamond', spec: { mode: 'geometric', pattern: 'chowk', size: 9, palette: 'chowk' } },
      { title: 'Large chowk', kind: 'Chowk', detail: 'On a larger grid of dots', spec: { mode: 'geometric', pattern: 'chowk', size: 13, palette: 'chowk' } },
      { title: 'Chowk star', kind: 'Chowk', detail: 'Nested stars in kumkum and turmeric', spec: { mode: 'geometric', pattern: 'star', size: 9, palette: 'chowk' } },
    ],
  },
  {
    slug: 'chittara',
    name: 'Chittara',
    script: { word: 'ಚಿತ್ತಾರ', lang: 'kn' },
    region: 'Malnad, Karnataka',
    occasion: 'Weddings, festivals and the harvest; painted on the walls and floors of homes.',
    materials: 'White rice paste on red earth, with yellow and black from natural colours.',
    motifs: 'Lines, triangles, diamonds and zigzags built up into bands and panels.',
    about: [
      'Chittara is painted by women of the Deewaru community in the Malnad region of Karnataka on the red-earth walls and floors of their homes. In Kannada the word means picture.',
      'Its patterns are built from straight lines, triangles and diamonds arranged in bands, and are made especially for weddings.',
    ],
    theme: { floor: '#7A2E1C', floor2: '#86372A', rice: '#FFFBF2', brass: '#F2C14E', brassLight: '#FFE08A', kaavi: '#7A2E1C', paper: '#FAF3EA', ink: '#2E140C', muted: '#664439' },
    palettes: ['chittara'],
    modes: ['geometric'],
    radialStyles: [],
    patterns: ['bands'],
    designs: [
      { title: 'Chittara bands', kind: 'Chittara', detail: 'Triangles and diamonds in bands', spec: { mode: 'geometric', pattern: 'bands', size: 9, palette: 'chittara' } },
      { title: 'Large chittara', kind: 'Chittara', detail: 'More bands on a larger grid', spec: { mode: 'geometric', pattern: 'bands', size: 11, palette: 'chittara' } },
    ],
  },
];

export const traditionBySlug = (slug: string) => TRADITIONS.find(t => t.slug === slug);

/** The page that explains reading a photo; each art form has its own reader under it (/alpana/read-a-photo). */
export const READ_A_PHOTO = '/read-a-photo';
export const readerPath = (slug: string) => `/${slug}${READ_A_PHOTO}`;

/** "a kolam", "an alpana", "an aipan". */
export const withArticle = (name: string) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name.toLowerCase()}`;

/** Paths the app answers, with the title and description each page is shared with. */
export const ROUTES: Array<{ path: string; title: string; description: string }> = [
  { path: '/', title: 'Chittara – Kolam, rangoli and alpana', description: 'Read, learn and draw the floor art of India: kolam, rangoli, alpana, muggulu, pookalam, mandana and more, dots first, then lines, then colour.' },
  { path: READ_A_PHOTO, title: 'How to read a design from a photo · Chittara', description: 'Choose the art form, photograph the design, and Chittara finds its dots, symmetry and colours so you can draw it again.' },
  { path: '/studio', title: 'Design Studio · Chittara', description: 'Make your own kolam, rangoli, alpana or muggulu, then learn to draw it step by step.' },
  { path: '/about', title: 'About · Chittara', description: 'Why Chittara was made, what its name means, and the research behind it.' },
  ...TRADITIONS.map(t => ({
    path: `/${t.slug}`,
    title: `${t.name} (${t.script.word}) · Chittara`,
    description: `${t.name} from ${t.region}: ${t.about[0]}`,
  })),
  ...TRADITIONS.map(t => ({
    path: readerPath(t.slug),
    title: `Read a photo of ${withArticle(t.name)} · Chittara`,
    description: `Photograph ${withArticle(t.name)} and Chittara finds its dots, symmetry and colours, then helps you draw it again.`,
  })),
];
