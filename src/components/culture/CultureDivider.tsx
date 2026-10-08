import React, { useId } from 'react';
import KolamDivider from '../landing/KolamDivider';
import { IconShape } from './Ornaments';
import { KIT_LIST, type BandSpec } from '../../lib/culture';
import { useCulture } from './CultureContext';

const CELL = 64;      // width of one motif and its connector
const HEIGHT = 40;

const connector = (kind: BandSpec['connector'], x0: number, x1: number) => {
  const y = HEIGHT / 2;
  switch (kind) {
    case 'dots': return [0.2, 0.4, 0.6, 0.8].map(t => <circle key={t} cx={x0 + (x1 - x0) * t} cy={y} r={1.4} fill="currentColor" />);
    case 'line': return <path d={`M${x0} ${y}H${x1}M${x0} ${y - 3}H${x1}`} stroke="currentColor" strokeWidth={1} fill="none" opacity={0.7} />;
    case 'wave': return <path d={`M${x0} ${y}C${x0 + 8} ${y - 8} ${x0 + 16} ${y - 8} ${(x0 + x1) / 2} ${y} S${x1 - 8} ${y + 8} ${x1} ${y}`} stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" />;
    case 'zigzag': return <path d={`M${x0} ${y + 6}L${x0 + 8} ${y - 6}L${x0 + 16} ${y + 6}L${x0 + 24} ${y - 6}L${x1} ${y}`} stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinejoin="round" />;
    default: return null;
  }
};

/**
 * A border band between sections, in the style of the page's art form: its own motifs joined by a
 * dotted line, a wave or a zigzag, and repeated across the full width. The kolam band is the pulli
 * loop kolam drawn by the kolam engine. On pages of no one art form, `index` picks which tradition's
 * band to show, so the home page walks through all of them.
 */
const CultureDivider: React.FC<{ tone?: 'rice' | 'kaavi'; spacing?: number; className?: string; index?: number }> = ({ tone = 'kaavi', spacing = 34, className = '', index }) => {
  const own = useCulture();
  const kit = index !== undefined && own.slug === 'home' ? KIT_LIST[index % KIT_LIST.length] : own;
  const patternId = useId().replace(/:/g, '');
  if (kit.band === 'kolam') return <KolamDivider tone={tone} spacing={spacing} className={className} />;
  const { icons, connector: kind } = kit.band;
  const tileWidth = icons.length * CELL;
  const colour = tone === 'rice' ? 'rgb(var(--rice))' : 'rgb(var(--kaavi))';
  return (
    <div className={`px-4 ${className}`} aria-hidden>
      <svg className={`block w-full ${tone === 'rice' ? 'glow' : 'opacity-70'}`} height={HEIGHT} style={{ color: colour }} focusable="false">
        <defs>
          <pattern id={patternId} width={tileWidth} height={HEIGHT} patternUnits="userSpaceOnUse">
            {icons.map((id, i) => {
              const x = i * CELL;
              return (
                <g key={`${id}${i}`}>
                  <g transform={`translate(${x + 2} 0)`}><IconShape id={id} /></g>
                  {connector(kind, x + 44, x + CELL + 0)}
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect width="100%" height={HEIGHT} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

export default CultureDivider;
