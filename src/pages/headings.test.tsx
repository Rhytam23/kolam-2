import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { page } from '../App';
import { I18nProvider } from '../lib/i18n';
import { CultureProvider } from '../components/culture/CultureContext';
import { KolamProvider } from '../components/KolamContext';
import { ROUTES, traditionBySlug } from '../data/traditions';
import { kitFor } from '../lib/culture';
import { SectionHeading } from '../components/ui/SectionHeading';

const render = (path: string) => {
    const kit = kitFor(traditionBySlug(path.split('/')[1])?.slug);
    return renderToStaticMarkup(
        <I18nProvider><CultureProvider kit={kit}><KolamProvider>{page(path)}</KolamProvider></CultureProvider></I18nProvider>,
    );
};

const count = (html: string, tag: string) => (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length;

describe('page headings', () => {
    it('every page has exactly one h1', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        for (const path of [...ROUTES.map(r => r.path), '/no-such-page', '/kolam/no-such-page']) {
            expect(count(render(path), 'h1'), path).toBe(1);
        }
        // Nothing in any page's markup makes React complain (duplicate keys and the like).
        expect(error.mock.calls.map(c => String(c[0]))).toEqual([]);
        error.mockRestore();
    });

    it('lets a section title be the page title without changing how it looks', () => {
        const wrap = (level?: 1 | 2) => renderToStaticMarkup(<I18nProvider><CultureProvider kit={kitFor(undefined)}><SectionHeading title="T" level={level} /></CultureProvider></I18nProvider>);
        const h2 = wrap(), h1 = wrap(1);
        expect(h2).toContain('<h2 ');
        expect(h1).toContain('<h1 ');
        expect(h1.replace('h1', 'h2').replace('/h1', '/h2')).toBe(h2);
    });
});
