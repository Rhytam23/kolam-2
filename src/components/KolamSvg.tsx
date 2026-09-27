import React, { useMemo } from 'react';
import { designToSvg, type SvgOptions } from '../utils/kolamLogic';
import type { Design } from '../types/kolam';

interface KolamSvgProps extends SvgOptions {
  design: Design;
  className?: string;
  label?: string;
}

/** Renders a design as inline SVG. The markup is generated from validated numbers only. */
const KolamSvg: React.FC<KolamSvgProps> = ({ design, className = '', label = 'Kolam', ...options }) => {
  const svg = useMemo(() => designToSvg(design, options), [design, options.stroke, options.dot, options.background, options.unit]);
  return (
    <div
      role="img"
      aria-label={label}
      className={`[&_svg]:w-full [&_svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default KolamSvg;
