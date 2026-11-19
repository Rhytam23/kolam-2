import React from 'react';
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PaletteChoice } from './KolamGenerator';
import { PALETTES, type PaletteName } from '../lib/colours';

/** Every group of siblings in a React element tree whose keys are not all different. */
const duplicateKeys = (node: React.ReactNode, found: string[] = []): string[] => {
    if (Array.isArray(node)) {
        const keys = node.map(n => (React.isValidElement(n) ? n.key : null)).filter((k): k is string => k !== null);
        keys.filter((k, i) => keys.indexOf(k) !== i).forEach(k => found.push(k));
        node.forEach(n => duplicateKeys(n, found));
    } else if (React.isValidElement(node)) {
        duplicateKeys((node.props as { children?: React.ReactNode }).children, found);
    }
    return found;
};

describe('palette swatches', () => {
    const names = Object.keys(PALETTES) as PaletteName[];

    it('some palettes repeat a colour, so a colour cannot be the key', () => {
        const repeated = names.filter(n => new Set(PALETTES[n].colors.slice(0, 4)).size < Math.min(4, PALETTES[n].colors.length));
        expect(repeated).toEqual(expect.arrayContaining(['muggu', 'chittara', 'khadiya', 'biswar']));
    });

    it('gives every swatch of every palette its own key', () => {
        const tree = (PaletteChoice as (props: React.ComponentProps<typeof PaletteChoice>) => React.ReactNode)({ value: null, onChange: () => {}, names });
        expect(duplicateKeys(tree)).toEqual([]);
        expect(duplicateKeys([<i key="a" />, <i key="a" />])).toEqual(['a']); // the check itself works
    });

    it('does not key any list by a bare colour in the source', () => {
        const files: string[] = [];
        const walk = (dir: string) => readdirSync(dir).forEach(f => { const p = join(dir, f); statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(f) && !/\.test\./.test(f) && files.push(p); });
        walk(join(__dirname, '..'));
        const bad = files.filter(f => /key=\{(c|colour|color|hex)\}/.test(readFileSync(f, 'utf8')));
        expect(bad).toEqual([]);
    });
});
