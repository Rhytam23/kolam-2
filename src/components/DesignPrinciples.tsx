import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { SYMMETRY_LABELS, countLoops, portCounts, rowPattern, symmetries } from '../utils/kolamLogic';
import type { ImageSymmetry } from '../types/kolam';
import type { Scan } from './KolamContext';

const IMAGE_SYMMETRY_LABELS: Record<keyof ImageSymmetry, string> = {
    mirrorVertical: 'Mirror (vertical axis)',
    mirrorHorizontal: 'Mirror (horizontal axis)',
    rotation180: '2-fold rotation',
    rotation90: '4-fold rotation',
    diagonal: 'Mirror (diagonal)',
};

interface Props {
    scan: Scan | null;
    imageSymmetry: ImageSymmetry | null;
    confidence: number | null;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <dt className="text-gray-400">{label}</dt>
        <dd className="text-white text-right">{children}</dd>
    </div>
);

const DesignPrinciples: React.FC<Props> = ({ scan, imageSymmetry, confidence }) => {
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
            orientation: Math.min(angle, 90 - angle) < 10 ? 'square (upright)' : Math.abs(angle - 45) < 10 ? 'diagonal (45°)' : `rotated ${angle.toFixed(0)}°`,
            kind: loops === 1 ? 'Sikku kolam: one continuous line around every dot' : `Pulli kolam: ${loops} closed loops around the dots`,
        };
    }, [scan]);

    const strongImageSymmetry = imageSymmetry
        ? (Object.keys(IMAGE_SYMMETRY_LABELS) as Array<keyof ImageSymmetry>).filter(k => imageSymmetry[k] >= 0.8)
        : [];

    if (!facts && !imageSymmetry) return null;

    return (
        <Card>
            <h3 className="text-xl font-semibold text-gray-200 mb-1">Design Principles</h3>
            <p className="text-sm text-saffron mb-4">
                {facts ? facts.kind : 'Free-hand kolam: no regular dot grid was found.'}
            </p>
            <dl className="text-sm">
                {facts && (
                    <>
                        <Row label="Dot grid">{facts.grid}, {facts.orientation}</Row>
                        <Row label="Dots per row">{facts.pattern} ({facts.dots} dots)</Row>
                        <Row label="Between dots">{facts.ports.crossings} crossings · {facts.ports.turns} turn-backs · {facts.ports.joins} joins</Row>
                        <Row label="Loops">{facts.loops === 1 ? '1 (single line)' : facts.loops}</Row>
                        <Row label="Design symmetry">{facts.symmetry.length ? facts.symmetry.map(s => SYMMETRY_LABELS[s]).join(', ') : 'none'}</Row>
                    </>
                )}
                {imageSymmetry && (
                    <Row label="Drawing symmetry">
                        {strongImageSymmetry.length
                            ? strongImageSymmetry.map(k => `${IMAGE_SYMMETRY_LABELS[k]} ${(imageSymmetry[k] * 100).toFixed(0)}%`).join(', ')
                            : 'weak'}
                    </Row>
                )}
                {confidence !== null && <Row label="Confidence">{(confidence * 100).toFixed(0)}%</Row>}
            </dl>
        </Card>
    );
};

export default DesignPrinciples;
