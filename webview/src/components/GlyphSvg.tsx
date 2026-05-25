import React from 'react';
import type { FontInfo, GlyphSummary } from '../types/font';
import { getGlyphFlipTransform, getGlyphSvgViewBox } from '../utils/glyphSvg';

export interface GlyphSvgProps {
  glyph: GlyphSummary;
  info: FontInfo;
  className?: string;
  paddingRatio?: number;
}

export const GlyphSvg: React.FC<GlyphSvgProps> = ({
  glyph,
  info,
  className = 'glyph-svg',
  paddingRatio,
}) => {
  if (!glyph.svgPath) {
    return <div className="glyph-empty">∅</div>;
  }

  return (
    <svg
      viewBox={getGlyphSvgViewBox(glyph, info, paddingRatio)}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g transform={getGlyphFlipTransform(info)}>
        <path d={glyph.svgPath} fill="currentColor" />
      </g>
    </svg>
  );
};
