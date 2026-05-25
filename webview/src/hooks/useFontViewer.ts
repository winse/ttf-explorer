import { useState, useEffect, useCallback } from 'react';
import type { FontInfo, GlyphSummary } from '../types/font';

export interface UseFontViewerReturn {
  loading: boolean;
  error: string | null;
  info: FontInfo | null;
  fontBase64: string | null;
  glyphCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  glyphs: GlyphSummary[];
  selectedGlyph: GlyphSummary | null;
  setSelectedGlyph: (glyph: GlyphSummary | null) => void;
  loadPage: (page: number) => void;
  findGlyphByUnicode: (codePoint: number) => void;
}

export function useFontViewer(): UseFontViewerReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<FontInfo | null>(null);
  const [fontBase64, setFontBase64] = useState<string | null>(null);
  const [glyphCount, setGlyphCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [glyphs, setGlyphs] = useState<GlyphSummary[]>([]);
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphSummary | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'loading':
          setLoading(true);
          break;

        case 'fontData':
          setInfo(message.info);
          setFontBase64(message.fontBase64);
          setGlyphCount(message.glyphCount);
          setPage(message.page);
          setPageSize(message.pageSize);
          setTotalPages(message.totalPages);
          setGlyphs(message.glyphs);
          setSelectedGlyph(message.glyphs?.[0] ?? null);
          setLoading(false);
          setError(null);
          break;

        case 'glyphPage':
          setPage(message.page);
          setPageSize(message.pageSize);
          setTotalPages(message.totalPages);
          setGlyphs(message.glyphs);
          setSelectedGlyph((prev) => {
            const stillVisible = message.glyphs?.find((g: GlyphSummary) => g.index === prev?.index);
            return stillVisible ?? message.glyphs?.[0] ?? null;
          });
          setLoading(false);
          break;

        case 'glyphFound':
          setPage(message.page);
          setPageSize(message.pageSize);
          setTotalPages(message.totalPages);
          setGlyphs(message.glyphs);
          setSelectedGlyph(message.glyph);
          setLoading(false);
          setError(null);
          break;

        case 'glyphNotFound':
          setLoading(false);
          break;

        case 'error':
          setError(message.message);
          setLoading(false);
          break;

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    window.vscode?.postMessage({ type: 'getFontData' });

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadPage = useCallback((nextPage: number) => {
    setLoading(true);
    window.vscode?.postMessage({ type: 'getGlyphPage', page: nextPage });
  }, []);

  const findGlyphByUnicode = useCallback((codePoint: number) => {
    setLoading(true);
    setError(null);
    window.vscode?.postMessage({ type: 'findGlyphByUnicode', codePoint });
  }, []);

  return {
    loading,
    error,
    info,
    fontBase64,
    glyphCount,
    page,
    pageSize,
    totalPages,
    glyphs,
    selectedGlyph,
    setSelectedGlyph,
    loadPage,
    findGlyphByUnicode,
  };
}
