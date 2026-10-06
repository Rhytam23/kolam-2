import { describe, expect, it } from 'vitest';
import { LABEL_KEYS, LANGUAGES, translate } from './i18n';

describe('interface languages', () => {
  it('falls back to English for a label without a translation', () => {
    expect(translate('en', 'nav.studio')).toBe('Studio');
    expect(translate('bn', 'nav.read')).not.toBe('Read a photo');
  });

  it('translates every label in every language', () => {
    for (const { code } of LANGUAGES) {
      if (code === 'en') continue;
      for (const key of LABEL_KEYS) {
        expect(translate(code, key), `${code} ${key}`).not.toBe(translate('en', key));
      }
    }
  });
});
