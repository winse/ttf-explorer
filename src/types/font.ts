import * as vscode from 'vscode';

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

export interface FontDataPayload {
  info: FontInfo;
  fontBase64: string;
  glyphCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  glyphs: GlyphSummary[];
}

export interface CachedFontData {
  info: FontInfo;
  fontBase64: string;
  glyphCount: number;
}

export interface MessageHandlerContext {
  panel: vscode.WebviewPanel;
  extensionUri: vscode.Uri;
  filePath?: string;
  context: vscode.ExtensionContext;
  fontProcessor: import('../webview/FontProcessor').FontProcessor;
}

declare global {
  interface Window {
    vscode?: {
      postMessage: (message: unknown) => void;
    };
  }
}

export {};
