import * as vscode from 'vscode';
import * as path from 'path';
import { createFont } from 'fonteditor-core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const glyf2svg = require('fonteditor-core/lib/ttf/util/glyf2svg').default
  ?? require('fonteditor-core/lib/ttf/util/glyf2svg');
import {
  FontDataPayload,
  FontInfo,
  GlyphSummary,
} from '../types/font';

interface ParsedFont {
  ttfObject: Record<string, any>;
  font: ReturnType<typeof createFont>;
  /** Original file bytes as base64 — used for text preview (avoids re-encode issues). */
  rawBase64: string;
}

export class FontProcessor {
  private cache = new Map<string, ParsedFont>();

  public async processFile(
    filePath: string,
    page: number,
    pageSize: number,
  ): Promise<FontDataPayload> {
    const parsed = await this.loadParsedFont(filePath);
    const { ttfObject } = parsed;
    const info = this.extractFontInfo(filePath, ttfObject);
    const fontBase64 = parsed.rawBase64;
    const glyphCount = ttfObject.glyf?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(glyphCount / pageSize));
    const glyphs = this.buildGlyphPage(ttfObject, page, pageSize);

    return {
      info,
      fontBase64,
      glyphCount,
      page,
      pageSize,
      totalPages,
      glyphs,
    };
  }

  public async getGlyphPage(
    filePath: string,
    page: number,
    pageSize: number,
  ): Promise<{ page: number; pageSize: number; totalPages: number; glyphs: GlyphSummary[] }> {
    const parsed = await this.loadParsedFont(filePath);
    const glyphCount = parsed.ttfObject.glyf?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(glyphCount / pageSize));
    const glyphs = this.buildGlyphPage(parsed.ttfObject, page, pageSize);

    return { page, pageSize, totalPages, glyphs };
  }

  public async findGlyphByUnicode(
    filePath: string,
    codePoint: number,
    pageSize: number,
  ): Promise<{ glyph: GlyphSummary; page: number; pageSize: number; totalPages: number; glyphs: GlyphSummary[] } | null> {
    const parsed = await this.loadParsedFont(filePath);
    const glyfList: any[] = parsed.ttfObject.glyf ?? [];
    const glyphCount = glyfList.length;

    let foundIndex = -1;
    for (let i = 0; i < glyfList.length; i += 1) {
      const unicode: number[] = glyfList[i]?.unicode ?? [];
      if (unicode.includes(codePoint)) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex < 0) {
      return null;
    }

    const page = Math.floor(foundIndex / pageSize);
    const totalPages = Math.max(1, Math.ceil(glyphCount / pageSize));
    const glyphs = this.buildGlyphPage(parsed.ttfObject, page, pageSize);
    const glyph = glyphs.find((g) => g.index === foundIndex)
      ?? this.buildGlyphSummary(parsed.ttfObject, foundIndex);

    return { glyph, page, pageSize, totalPages, glyphs };
  }

  private buildGlyphSummary(ttfObject: Record<string, any>, index: number): GlyphSummary {
    const glyf = ttfObject.glyf?.[index];
    if (!glyf) {
      throw new Error(`Glyph ${index} not found`);
    }

    let svgPath = '';
    try {
      svgPath = glyf2svg(glyf, ttfObject) ?? '';
    } catch {
      svgPath = '';
    }

    return {
      index,
      name: glyf.name ?? `.notdef${index}`,
      unicode: Array.isArray(glyf.unicode) ? glyf.unicode : [],
      svgPath,
      advanceWidth: glyf.advanceWidth ?? 0,
      bounds: {
        xMin: glyf.xMin ?? 0,
        yMin: glyf.yMin ?? 0,
        xMax: glyf.xMax ?? 0,
        yMax: glyf.yMax ?? 0,
      },
      compound: Boolean(glyf.compound),
    };
  }

  private async loadParsedFont(filePath: string): Promise<ParsedFont> {
    const cached = this.cache.get(filePath);
    if (cached) {
      return cached;
    }

    const buffer = await this.readFile(filePath);
    const font = createFont(buffer, {
      type: 'ttf',
      compound2simple: true,
      hinting: false,
      kerning: false,
    });
    const ttfObject = font.get();
    const rawBase64 = Buffer.from(buffer).toString('base64');
    const parsed: ParsedFont = { ttfObject, font, rawBase64 };
    this.cache.set(filePath, parsed);
    return parsed;
  }

  private async readFile(filePath: string): Promise<ArrayBuffer> {
    const uri = vscode.Uri.file(filePath);
    const fileBuffer = await vscode.workspace.fs.readFile(uri);
    return fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ) as ArrayBuffer;
  }

  private extractFontInfo(filePath: string, ttfObject: Record<string, any>): FontInfo {
    const name = ttfObject.name ?? {};
    const head = ttfObject.head ?? {};
    const hhea = ttfObject.hhea ?? {};

    return {
      fontFamily: name.fontFamily ?? name.fontFamilyEn ?? 'Unknown',
      fontSubFamily: name.fontSubFamily ?? name.fontSubFamilyEn ?? '',
      fullName: name.fullName ?? name.fullNameEn ?? path.basename(filePath, '.ttf'),
      version: name.version ?? name.versionEn ?? '',
      unitsPerEm: head.unitsPerEm ?? 1000,
      glyphCount: ttfObject.glyf?.length ?? 0,
      ascent: hhea.ascent ?? 0,
      descent: hhea.descent ?? 0,
      fileName: path.basename(filePath),
    };
  }

  private buildGlyphPage(
    ttfObject: Record<string, any>,
    page: number,
    pageSize: number,
  ): GlyphSummary[] {
    const glyfList: any[] = ttfObject.glyf ?? [];
    const start = page * pageSize;
    const end = Math.min(start + pageSize, glyfList.length);

    const glyphs: GlyphSummary[] = [];
    for (let i = start; i < end; i += 1) {
      glyphs.push(this.buildGlyphSummary(ttfObject, i));
    }

    return glyphs;
  }
}
