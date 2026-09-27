import React, { useEffect, useMemo, useState } from 'react';
import { FloorTile, KolamFrame, RangoliFrame } from './FloorArt';
import { diamondDesign, makeSingleLine } from '../../utils/kolamLogic';
import { makeRadial } from '../../utils/radial';

const SCENES = [
    { name: 'Sikku kolam', steps: 'Dots first, then one line around them', ms: 9000 },
    { name: 'Lotus rangoli', steps: 'Dots first, joined ring by ring, then coloured', ms: 10500 },
] as const;

/** The hero picture: a kolam and then a rangoli being drawn on a red-oxide floor, as by hand. */
const LiveDrawing: React.FC = () => {
    const [scene, setScene] = useState(0);
    const [round, setRound] = useState(0);
    const kolam = useMemo(() => makeSingleLine(diamondDesign(5)), []);
    const rangoli = useMemo(() => makeRadial({
        petals: 8, layers: 3, style: 'lotus', background: '#8E3B24', colors: ['#F08A00', '#2E7D32', '#E1AD01'],
    }), []);
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setTimeout(() => {
            setScene(s => (s + 1) % SCENES.length);
            setRound(r => r + 1);
        }, SCENES[scene].ms);
        return () => clearTimeout(timer);
    }, [scene, reduceMotion]);

    return (
        <div className="w-full max-w-md mx-auto">
            <FloorTile label={`${SCENES[scene].name} being drawn on a red floor`}>
                <div key={round} className="absolute inset-[7%]">
                    {scene === 0
                        ? <KolamFrame design={kolam} stage="line" animate={!reduceMotion} />
                        : <RangoliFrame design={rangoli} stage="colour" animate={!reduceMotion} />}
                </div>
            </FloorTile>
            <p className="mt-3 text-center text-sm text-muted" aria-live="polite">
                <span className="font-semibold text-kaavi">{SCENES[scene].name}</span> · {SCENES[scene].steps}
            </p>
        </div>
    );
};

export default LiveDrawing;
