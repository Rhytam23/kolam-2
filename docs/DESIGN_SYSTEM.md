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

## Cultural kits
Every art form has a kit in `src/lib/culture.ts` (type `CultureKit`) that the shared components read through `CultureProvider` (`src/components/culture/CultureContext.tsx`, set from the page address in `App.tsx`). Pages of no one art form (home, studio, about) use `HOME_KIT`, and their dividers walk through every art form's band.

| Field | Shows up as |
|---|---|
| `greeting` | The greeting in the art form's own script: header (wide screens), hero, and a row of all greetings in the footer and 404 page |
| `ornament` | The motif on every heading rule (`SectionHeading`), hero, footer, and beside each art form's name in the menu and on its card |
| `band` | The border band between sections (`CultureDivider`); kolam uses the pulli-loop band |
| `doorway` | What hangs at the top of the page: toran, flower garland, leaves, or nothing (`Doorway.tsx`) |
| `ground`, `paper` | Faint repeating pattern on dark and on light sections (CSS variables `--ground-pattern`, `--paper-pattern`, set by `applyTheme`) |
| `verb` | "Learn to draw / paint / lay it" and the "Paint it: materials" line in the reader |
| `suggestedLang` | A one-time offer to switch the interface to the art form's language, when the app has it (Tamil, Telugu, Bengali, Hindi) |

Motifs (`src/components/culture/Ornaments.tsx`): diya, lotus, shankha (conch), lamp (nilavilakku), peacock, footprints of Lakshmi, fish, paddy, gobbemma, chowk, diamond, rosette. Each is taken from the motifs, materials and occasions already written on that art form's page (`src/data/traditions.ts`); no new claims are made, and sacred symbols such as the swastika are deliberately not used as decoration. The greetings and motifs should be reviewed by people of each tradition.

Rules: all ornaments are `aria-hidden`; greetings carry a `lang`; animations inside border patterns are switched off (`pattern .flicker, pattern .step-in`) and every animation respects `prefers-reduced-motion`; a transform-based animation must sit on an inner group, never on the group that carries `transform=`.

## Adding an art form
Add an entry to `TRADITIONS` with a `Theme`, `script` (word and `lang`), palettes, modes and designs, and a kit in `KITS` (`src/lib/culture.ts`); routes, titles and the header menu follow from it. `src/lib/culture.test.ts` fails if a kit is missing or two art forms look the same.
