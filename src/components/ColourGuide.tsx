import React from 'react';
import { nearestGround, nearestHenna, nearestTraditional } from '../lib/colours';

interface Props {
    colours: readonly string[];
    background?: string;
    /** Share of the picture covered by each colour, when known (from a photo). */
    shares?: readonly number[];
    title?: string;
    /** Dot kolams are drawn as lines in the first colour. */
    firstIsLine?: boolean;
    /** Henna on skin: the colours are named as henna and skin, not as powders and floors. */
    henna?: boolean;
}

/** Lists the colours of a design with the closest traditional colour and what it is made from. */
const ColourGuide: React.FC<Props> = ({ colours, background, shares, title = 'Colours to use', firstIsLine = false, henna = false }) => {
    const rows = [
        ...(background ? [{ hex: background, role: henna ? 'Skin' : 'Ground', share: undefined as number | undefined }] : []),
        ...colours.map((hex, i) => ({ hex, role: henna ? 'Henna' : firstIsLine ? (i === 0 ? 'Lines' : 'More lines') : 'Colour', share: shares?.[i] })),
    ];
    return (
        <div>
            <h4 className="text-sm font-semibold text-muted mb-2">{title}</h4>
            <ul className="space-y-2">
                {rows.map(({ hex, role, share }, i) => {
                    const match = henna ? nearestHenna(hex) : role === 'Ground' ? nearestGround(hex) : nearestTraditional(hex);
                    return (
                        <li key={`${hex}-${i}`} className="flex items-start gap-3">
                            <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-ink/20 shadow-inner" style={{ backgroundColor: hex }} aria-hidden />
                            <div className="text-sm leading-snug">
                                <p className="text-ink">
                                    <span className="font-semibold">{match.name}</span>
                                    <span className="text-muted"> · {role}{share !== undefined ? ` · ${(share * 100).toFixed(0)}%` : ''}</span>
                                </p>
                                <p className="text-muted">{match.material}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ColourGuide;
