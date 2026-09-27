import { describe, expect, it } from 'vitest';
import { parseKolamFile, toKolamFile } from './kolamFile';
import { diamondDesign, makeSingleLine } from '../utils/kolamLogic';

describe('.kolam.json', () => {
  it('round-trips a design through JSON', () => {
    const file = toKolamFile(makeSingleLine(diamondDesign(5)), [{ x: 0.5, y: 0.5 }], null);
    expect(parseKolamFile(JSON.parse(JSON.stringify(file)))).toEqual(file);
  });

  it('rejects malformed or inconsistent designs', () => {
    const good = toKolamFile(diamondDesign(3), [], null);
    expect(parseKolamFile({ ...good, format: 'other' })).toBeNull();
    expect(parseKolamFile({ ...good, design: { ...good.design, rows: 99 } })).toBeNull();
    // A port marked as a crossing where one of its dots is missing.
    expect(parseKolamFile({ ...good, design: { ...good.design, h: ['xx', 'xx', 'xx'] } })).toBeNull();
    expect(parseKolamFile('nonsense')).toBeNull();
  });

  it('drops invalid dots but keeps the design', () => {
    const file = parseKolamFile({ ...toKolamFile(diamondDesign(3), [], null), dots: [{ x: 1, y: 'a' }, { x: 0.2, y: 0.3 }] });
    expect(file?.dots).toEqual([{ x: 0.2, y: 0.3 }]);
  });
});
