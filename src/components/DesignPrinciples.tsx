import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import ColourGuide from './ColourGuide';
import { SYMMETRY_LABELS, countLoops, portCounts, rowPattern, symmetries } from '../utils/kolamLogic';
import type { ImageSymmetry, PaletteEntry, RadialSymmetry } from '../types/kolam';
import type { Scan } from './KolamContext';

const IMAGE_SYMMETRY_LABELS: Record<keyof ImageSymmetry, string> = {
    mirrorVertical: 'Mirror (left–right)',
    mirrorHorizontal: 'Mirror (top–bottom)',
    rotation180: 'Half-turn',
    rotation90: 'Quarter-turn',
    diagonal: 'Mirror (diagonal)',
};

interface Props {
    scan: Scan | null;
    imageSymmetry: ImageSymmetry | null;
    radial: RadialSymmetry | null;
    palette: PaletteEntry[];
    confidence: number | null;
    onRecreate: () => void;
    onSimilar: () => void;
    onDraw: () => void;
}

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-kaavi/10 last:border-0">
        <dt className="text-muted">{label}{hint && <span className="block text-xs text-muted/80">{hint}</span>}</dt>
        <dd className="text-ink text-right">{children}</dd>
    </div>
);

const DesignPrinciples: React.FC<Props> = ({ scan, imageSymmetry, radial, palette, confidence, onRecreate, onSimilar, onDraw }) => {
    const facts = useMemo(() => {
        if (!scan) return null;
        const { design, lattice } = scan;
        const loops = countLoops(design);
        const angle = lattice ? ((lattice.angle % 90) + 90) % 90 : 0;
        return {
            loops,
            ports: portCounts(design),
            symmetry: symmetries(design),
            pattern: rowPattern(design),
            dots: design.mask.join('').split('1').length - 1,
            grid: `${design.rows} × ${design.cols}`,
            orientation: Math.min(angle, 90 - angle) < 10 ? 'upright' : Math.abs(angle - 45) < 10 ? 'turned 45°' : `turned ${angle.toFixed(0)}°`,
            kind: loops === 1 ? 'Sikku kolam: one continuous line around every dot' : `Pulli kolam: ${loops} separate lines around the dots`,
        };
    }, [scan]);

    const strongImageSymmetry = imageSymmetry
        ? (Object.keys(IMAGE_SYMMETRY_LABELS) as Array<keyof ImageSymmetry>).filter(k => imageSymmetry[k] >= 0.8)
        : [];
    const drawn = palette.filter(p => !p.background);
    const ground = palette.find(p => p.background);

    if (!facts && !imageSymmetry && !palette.length) return null;

    const radialText = radial
        ? radial.circular ? 'Concentric rings' : radial.order > 1 ? `${radial.order}-fold (${radial.order} repeats around the centre)` : 'none'
        : null;

    return (
        <Card>
            <h3 className="font-heading text-2xl text-kaavi mb-1">Design Principles</h3>
            <p className="text-sm text-leaf font-semibold mb-4">
                {facts ? facts.kind : radial && radial.order > 1
                    ? `Free-hand radial design with ${radial.order} repeats, like a rangoli or alpana`
                    : 'Free-hand design (no dot grid), like an alpana, mandana or rangoli'}
            </p>
            <dl className="text-sm">
                {facts && (
                    <>
                        <Row label="Pulli (dots)" hint="rows × columns">{facts.grid}, {facts.orientation}</Row>
                        <Row label="Dots per row">{facts.pattern} ({facts.dots} dots)</Row>
                        <Row label="Between two dots" hint="lines cross · bend back · join">{facts.ports.crossings} · {facts.ports.turns} · {facts.ports.joins}</Row>
                        <Row label="Separate lines">{facts.loops === 1 ? '1 (one continuous line)' : facts.loops}</Row>
                        <Row label="Symmetry of the design">{facts.symmetry.length ? facts.symmetry.map(s => SYMMETRY_LABELS[s]).join(', ') : 'none'}</Row>
                    </>
                )}
                {radialText && <Row label="Turning symmetry" hint="around the centre">{radialText}</Row>}
                {imageSymmetry && (
                    <Row label="Symmetry of the drawing">
                        {strongImageSymmetry.length ? strongImageSymmetry.map(k => IMAGE_SYMMETRY_LABELS[k]).join(', ') : 'weak'}
                    </Row>
                )}
                {confidence !== null && <Row label="Confidence">{(confidence * 100).toFixed(0)}%</Row>}
            </dl>

            {palette.length > 0 && (
                <div className="mt-5">
                    <ColourGuide title="Colours in your photo" colours={drawn.map(p => p.hex)} shares={drawn.map(p => p.share)} background={ground?.hex} />
                </div>
            )}

            <div className="flex flex-wrap gap-2 mt-5">
                {facts ? (
                    <Button size="sm" onClick={onRecreate}>Open the recreated kolam</Button>
                ) : (
                    <Button size="sm" onClick={onRecreate}>See the traced drawing</Button>
                )}
                <Button size="sm" variant="secondary" onClick={onSimilar}>Make a similar {facts ? 'rangoli' : 'design'}</Button>
                <Button size="sm" variant="secondary" onClick={onDraw}>Draw it step by step</Button>
            </div>
        </Card>
    );
};

export default DesignPrinciples;
