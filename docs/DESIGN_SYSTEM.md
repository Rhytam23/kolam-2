# Design system

Visual language: a swept floor, rice flour and brass lamp light. Warm, calm, high contrast. Each art form recolours the whole page.

## Colour tokens
Defined as `r g b` CSS variables in `src/index.css` and used through Tailwind (`tailwind.config.js`, e.g. `bg-floor`, `text-kaavi`).

| Token | Role | Default |
|---|---|---|
| `--floor`, `--floor-2` | Ground of dark sections; background glows | `#5A2416`, `#72301C` |
| `--rice` | Text and lines on `floor` | `#F7F3EA` |
| `--brass`, `--brass-light` | Rules and ornaments; headings and main buttons on `floor` | `#C9973A`, `#E8C271` |
| `--kaavi` | Headings, links and buttons on `paper` | `#A63A1E` |
| `--paper` | Ground of light sections (the tools) | `#FFF8EE` |
| `--ink`, `--muted` | Text and secondary text on `paper` | `#3B2416`, `#6B5443` |

Fixed accents: `marigold #F08A00`, `turmeric #E1AD01`, `leaf #2E7D32`, `kumkum #C62839`, `sand #FBEBD3`.

## Per-tradition themes
Each art form has a `Theme` (`src/lib/theme.ts`, `src/data/traditions.ts`) applied by `applyTheme()` when its page opens and reset on leaving. Text sits on `floor` (dark sections) or `paper` (light sections) only; `contrast()` in `theme.ts` is available to check a pair (aim for WCAG AA).

## Typography
- Body: Hind Madurai (400, 600, 700).
- Headings use the serif of the art form's own script, set through `--font-heading` (`src/lib/fonts.ts`): Tiro Tamil, Telugu, Devanagari Hindi, Bangla, Kannada, and Noto Serif Malayalam and Oriya. The default is Tiro Tamil.
- Script names use the `font-script` family and a `lang` attribute.
- All fonts are self-hosted (`@fontsource`); no third-party requests.

## Components
Shared UI is in `src/components/ui/`: `Button`, `Card`, `Label`, `SectionHeading`. Ornaments are in `src/components/landing/`: `Toran`, `Diya`, `KolamDivider`, `FloorArt`. Utility classes in `src/index.css`: `floor-bg`, `paper-bg` (faint dot grid), `kolam-border`, `brass-rule`, `glow`.

## Motion
`kolam-draw` (line drawing), `fade-in`, `reveal`, `sway`, `flicker`. All respect `prefers-reduced-motion`.

## Accessibility rules
Skip link to `#main`; ARIA labels on icon buttons and tab-like toggles; `aria-live` for status text; keyboard-operable controls; touch targets suitable for a fingertip (practice taps accept about 24 px); page language follows the chosen interface language.

## Languages
Labels live in `src/lib/i18n.tsx` (English is the source; a missing label falls back to English). Cover navigation and the photo reader only.

## Adding an art form
Add an entry to `TRADITIONS` with a `Theme`, `script` (word and `lang`), palettes, modes and designs; routes, titles and the header menu follow from it.
