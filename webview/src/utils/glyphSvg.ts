import type { FontInfo, GlyphSummary } from '../types/font';

/** SVG viewBox that fits glyph bounds after the TTF Y-flip transform. */
export function getGlyphSvgViewBox(
  glyph: GlyphSummary,
  info: FontInfo,
  paddingRatio = 0.08,
): string {
  const { xMin, yMin, xMax, yMax } = glyph.bounds;
  const hasBounds = xMax > xMin || yMax > yMin;

  if (!glyph.svgPath || !hasBounds) {
    const pad = info.unitsPerEm * 0.05;
    return `${-pad} ${-pad} ${info.unitsPerEm + pad * 2} ${info.unitsPerEm + pad * 2}`;
  }

  const padX = Math.max(16, (xMax - xMin) * paddingRatio);
  const padY = Math.max(16, (yMax - yMin) * paddingRatio);
  const baseline = info.unitsPerEm + info.descent;
  const svgYMin = baseline - yMax - padY;
  const svgYMax = baseline - yMin + padY;
  const svgXMin = xMin - padX;
  const width = xMax - xMin + padX * 2;
  const height = svgYMax - svgYMin;

  return `${svgXMin} ${svgYMin} ${width} ${height}`;
}

export function getGlyphFlipTransform(info: FontInfo): string {
  const translateY = info.unitsPerEm + info.descent;
  return `translate(0, ${translateY}) scale(1, -1)`;
}

export function formatUnicode(codePoints: number[]): string {
  if (!codePoints.length) return '—';
  return codePoints
    .map((u) => `U+${u.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(', ');
}

/** Parse user input like E008, U+E008, 0xE008 into a code point. */
export function parseUnicodeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/^U\+/i, '').replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{1,6}$/.test(normalized)) return null;

  const codePoint = parseInt(normalized, 16);
  if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
    return null;
  }
  return codePoint;
}

export function codePointToChar(codePoint: number): string {
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return '';
  }
}
