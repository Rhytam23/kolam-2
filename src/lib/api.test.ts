import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANALYSIS_MESSAGES, AnalysisError, analysisErrorKind, analysisErrorMessage, analyzeKolam } from './api';

const file = new File(['x'], 'k.png', { type: 'image/png' });
const opts = { preset: 'balanced' as const, deskew: true };

const reply = (status: number, body: unknown = { detail: 'Traceback: cv2.error in analyze.py line 42' }) =>
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

afterEach(() => vi.unstubAllGlobals());

describe('friendly reading errors', () => {
    it('sorts every status into a kind', () => {
        expect(analysisErrorKind(null)).toBe('network');
        expect(analysisErrorKind(429)).toBe('rate-limit');
        expect(analysisErrorKind(503)).toBe('busy');
        expect(analysisErrorKind(500)).toBe('server');
        expect(analysisErrorKind(502)).toBe('server');
        expect(analysisErrorKind(413)).toBe('file-too-large');
        expect(analysisErrorKind(415)).toBe('file-type');
        expect(analysisErrorKind(400)).toBe('file-unreadable');
        expect(analysisErrorKind(422)).toBe('file-unreadable');
        expect(analysisErrorKind(302)).toBe('unknown');
    });

    it('never shows a status code, a stack trace or technical wording', () => {
        for (const text of Object.values(ANALYSIS_MESSAGES)) {
            expect(text).not.toMatch(/HTTP|\b[1-5]\d\d\b|traceback|stack|exception|cv2|pipeline|undefined|null|fetch/i);
        }
        for (const status of [null, 400, 413, 415, 422, 429, 500, 502, 503]) expect(analysisErrorMessage(status)).not.toMatch(/\d{3}/);
    });

    it('says what to do next for each kind', () => {
        expect(ANALYSIS_MESSAGES.network).toMatch(/connection/i);
        expect(ANALYSIS_MESSAGES['rate-limit']).toMatch(/wait/i);
        expect(ANALYSIS_MESSAGES['file-too-large']).toMatch(/smaller/i);
        expect(ANALYSIS_MESSAGES['file-type']).toMatch(/PNG, JPEG or WebP/);
        expect(ANALYSIS_MESSAGES.server).toMatch(/try again/i);
    });

    it.each([[500, 'server'], [429, 'rate-limit'], [413, 'file-too-large'], [415, 'file-type'], [400, 'file-unreadable']] as const)(
        'turns a %i reply into a friendly message, ignoring the server text', async (status, kind) => {
            vi.stubGlobal('fetch', reply(status));
            const err = await analyzeKolam(file, opts).catch(e => e);
            expect(err).toBeInstanceOf(AnalysisError);
            expect(err.kind).toBe(kind);
            expect(err.message).toBe(ANALYSIS_MESSAGES[kind]);
            expect(err.message).not.toMatch(/Traceback|cv2|\d{3}/);
        });

    it('turns a failed connection into the network message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
        const err = await analyzeKolam(file, opts).catch(e => e);
        expect(err.kind).toBe('network');
        expect(err.message).toBe(ANALYSIS_MESSAGES.network);
    });

    it('treats a reply that is not data as a server fault', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>oops</html>', { status: 200 })));
        const err = await analyzeKolam(file, opts).catch(e => e);
        expect(err.kind).toBe('server');
    });

    it('lets a busy server clear up on its own, then says so if it does not', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', reply(503, { detail: 'busy' }));
        const onBusy = vi.fn();
        const run = analyzeKolam(file, { ...opts, onBusy }).catch(e => e);
        await vi.runAllTimersAsync();
        const err = await run;
        vi.useRealTimers();
        expect(onBusy).toHaveBeenCalledTimes(3);
        expect(err.kind).toBe('busy');
    });
});
