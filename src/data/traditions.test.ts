import { describe, expect, it } from 'vitest';
import { ROUTES, TRADITIONS } from './traditions';
import { buildDesign } from './designs';
import { DEFAULT_THEME, contrast, type Theme } from '../lib/theme';
import { PALETTES } from '../lib/colours';

/** How alike two names are (0 = same), ignoring case, spaces and hyphens. */
const distance = (a: string, b: string) => {
  const [s, t] = [a, b].map(x => x.toLowerCase().replace(/[\s-]/g, ''));
  const row = Array.from({ length: t.length + 1 }, (_, j) => j);
  for (let i = 1; i <= s.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + (s[i - 1] === t[j - 1] ? 0 : 1));
      prev = row[j];
      row[j] = next;
    }
  }
  return row[t.length];
};

describe('traditions', () => {
  it('have unique addresses and names that are not easily confused', () => {
    expect(new Set(TRADITIONS.map(t => t.slug)).size).toBe(TRADITIONS.length);
    const allowed = new Set(['aipan|aripan']);
    for (const a of TRADITIONS) {
      for (const b of TRADITIONS) {
        if (a.slug >= b.slug || allowed.has(`${a.slug}|${b.slug}`)) continue;
        // At least a third of the letters differ.
        const share = distance(a.name, b.name) / Math.max(a.name.length, b.name.length);
        expect(share, `${a.name} / ${b.name}`).toBeGreaterThanOrEqual(0.3);
      }
    }
    // Look-alikes that are allowed must say how they differ.
    expect(TRADITIONS.find(t => t.slug === 'aipan')?.related?.slug).toBe('aripan');
    expect(TRADITIONS.find(t => t.slug === 'aripan')?.related?.slug).toBe('aipan');
  });

  it('each has readable colours of its own', () => {
    const readable = (t: Theme) => [
      contrast(t.rice, t.floor), contrast(t.brassLight, t.floor), // text on the dark sections
      contrast(t.ink, t.paper), contrast(t.muted, t.paper), contrast(t.kaavi, t.paper), // text on the light sections
      contrast(t.floor, t.brassLight), // main buttons
    ];
    for (const t of [DEFAULT_THEME, ...TRADITIONS.map(x => x.theme)]) {
      for (const ratio of readable(t)) expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
    const looks = TRADITIONS.map(t => `${t.theme.floor}|${t.theme.brass}`);
    expect(new Set(looks).size).toBe(TRADITIONS.length);
    expect(TRADITIONS.every(t => t.theme.floor !== DEFAULT_THEME.floor)).toBe(true);
  });

  it('offer designs and colours that exist and can be drawn', () => {
    for (const t of TRADITIONS) {
      expect(t.designs.length).toBeGreaterThanOrEqual(2);
      for (const name of t.palettes) expect(PALETTES[name]).toBeTruthy();
      for (const d of t.designs) {
        expect(t.modes).toContain(d.spec.mode);
        expect(t.palettes).toContain(d.spec.palette);
        if (d.spec.mode === 'radial') expect(t.radialStyles).toContain(d.spec.style);
        if (d.spec.mode === 'geometric') expect(t.patterns).toContain(d.spec.pattern);
        expect(buildDesign(d.spec).design).toBeTruthy();
      }
    }
  });

  it('are all served at their own address', () => {
    const paths = ROUTES.map(r => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const t of TRADITIONS) expect(paths).toContain(`/${t.slug}`);
  });
});
