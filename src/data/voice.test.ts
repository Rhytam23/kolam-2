import { describe, expect, it } from 'vitest';
import { GENERAL_VOICE, VOICES, voiceFor } from './voice';
import { TRADITIONS } from './traditions';

const KOLAM_WORDS = /kolam|pulli|sikku/i;
const textOf = (v: (typeof VOICES)[string]) => [v.ground, v.apply, v.finish, v.ring, v.singleLine, v.file, ...Object.values(v.modeLabels)].join(' | ');

describe('how each art form talks about itself', () => {
  it('has a voice for every art form', () => {
    expect(Object.keys(VOICES).sort()).toEqual(TRADITIONS.map(t => t.slug).sort());
  });

  it('never uses another art form\'s words (kolam, pulli, sikku) outside kolam', () => {
    for (const t of TRADITIONS) {
      if (t.slug === 'kolam') continue;
      const v = voiceFor(t.slug);
      // The design file is still the app's .kolam.json format; its name is the only kolam word allowed.
      const text = textOf(v).replace('.kolam.json', '');
      expect(text, t.slug).not.toMatch(KOLAM_WORDS);
      expect(v.art, t.slug).not.toMatch(KOLAM_WORDS);
    }
  });

  it('names itself: the art form\'s own name is in its voice', () => {
    for (const t of TRADITIONS) expect(voiceFor(t.slug).art.toLowerCase(), t.slug).toContain(t.name.toLowerCase().split(' ')[0].replace(/ulu$/, 'u'));
  });

  it('offers a tab name for every kind of design the art form offers', () => {
    for (const t of TRADITIONS) for (const mode of t.modes) expect(voiceFor(t.slug).modeLabels[mode].length, `${t.slug} ${mode}`).toBeGreaterThan(2);
  });

  it('treats dots as part of the tradition only where its page says it is built on a dot grid', () => {
    const traditional = Object.entries(VOICES).filter(([, v]) => v.dots === 'tradition').map(([slug]) => slug).sort();
    expect(traditional).toEqual(['kolam', 'muggulu']);
  });

  it('describes painted art forms as painted, not poured', () => {
    for (const slug of ['alpana', 'aipan', 'aripan', 'jhoti-chita', 'chittara']) {
      expect(`${VOICES[slug].ground} ${VOICES[slug].apply}`, slug).not.toMatch(/pour|pinch/i);
    }
    expect(VOICES.alpana.apply).toMatch(/fingertip|cloth/i);
  });

  it('keeps the general wording for pages of no one art form', () => {
    expect(voiceFor('home')).toBe(GENERAL_VOICE);
    expect(GENERAL_VOICE.singleLine).toContain('sikku');
  });
});
