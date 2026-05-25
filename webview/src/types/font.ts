export interface GlyphSummary {
  index: number;
  name: string;
  unicode: number[];
  svgPath: string;
  advanceWidth: number;
  bounds: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  compound: boolean;
}

export interface FontInfo {
  fontFamily: string;
  fontSubFamily: string;
  fullName: string;
  version: string;
  unitsPerEm: number;
  glyphCount: number;
  ascent: number;
  descent: number;
  fileName: string;
}

declare global {
  interface Window {
    vscode?: {
      postMessage: (message: unknown) => void;
    };
  }
}

export {};
