import { describe, expect, it } from 'vitest';
import { handOverPhoto, takeHandedOverPhoto } from './handoff';

describe('photo handoff', () => {
    it('hands a photo over exactly once', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        handOverPhoto(file);
        expect(takeHandedOverPhoto()).toBe(file);
        expect(takeHandedOverPhoto()).toBeNull();
    });
});
