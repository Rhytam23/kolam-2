import { DEFAULT_HEADING_FONT } from './fonts';

/** A page's colours, named after their role. Text is always drawn on `floor` (dark sections) or `paper` (light sections). */
export interface Theme {
  /** The ground of the dark sections, and the text colour of buttons on `brassLight`. */
  floor: string;
  /** A second ground shade, only for background glows. */
  floor2: string;
  /** Text and lines on `floor`. */
  rice: string;
  /** Rules, borders and ornaments on `floor`. */
  brass: string;
  /** Headings and highlights on `floor`, and the background of the main buttons. */
  brassLight: string;
  /** Headings, links and buttons on `paper`. */
  kaavi: string;
  /** The ground of the light sections (the tools). */
  paper: string;
  /** Text on `paper`. */
  ink: string;
  /** Secondary text on `paper`. */
  muted: string;
}

export const DEFAULT_THEME: Theme = {
  floor: '#5A2416', floor2: '#72301C', rice: '#F7F3EA', brass: '#C9973A', brassLight: '#E8C271',
  kaavi: '#A63A1E', paper: '#FFF8EE', ink: '#3B2416', muted: '#6B5443',
};

const VARS: Record<keyof Theme, string> = {
  floor: '--floor', floor2: '--floor-2', rice: '--rice', brass: '--brass', brassLight: '--brass-light',
  kaavi: '--kaavi', paper: '--paper', ink: '--ink', muted: '--muted',
};

const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');

/** Colours the whole page (header and footer included) with a theme, and sets its headings in `font` (a CSS font family). */
export const applyTheme = (theme: Theme, font = DEFAULT_HEADING_FONT, patterns: Record<string, string> = {}) => {
  const root = document.documentElement.style;
  // Patterns belong to one art form: set its own, and clear whatever the page before it left behind.
  for (const name of ['--ground-pattern', '--ground-size', '--paper-pattern', '--paper-size']) {
    if (patterns[name]) root.setProperty(name, patterns[name]);
    else root.removeProperty(name);
  }
  root.setProperty('--font-heading', font);
  (Object.keys(VARS) as Array<keyof Theme>).forEach(key => root.setProperty(VARS[key], channels(theme[key])));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.floor);
};

/** WCAG contrast ratio between two colours. */
export const contrast = (a: string, b: string) => {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
