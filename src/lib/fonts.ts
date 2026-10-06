/** The heading typeface of each language an art form is named in, so every page is set in its own script's serif. */
const HEADING_FONTS: Record<string, string> = {
  ta: "'Tiro Tamil'",
  te: "'Tiro Telugu'",
  mr: "'Tiro Devanagari Hindi'",
  hi: "'Tiro Devanagari Hindi'",
  mai: "'Tiro Devanagari Hindi'",
  bn: "'Tiro Bangla'",
  kn: "'Tiro Kannada'",
  ml: "'Noto Serif Malayalam'",
  or: "'Noto Serif Oriya'",
};

export const DEFAULT_HEADING_FONT = "'Tiro Tamil'";

export const headingFont = (lang: string) => HEADING_FONTS[lang] ?? DEFAULT_HEADING_FONT;
