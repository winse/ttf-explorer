import {
  Icon,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  NonIdealState,
  Spinner,
  Tag,
} from '@blueprintjs/core';
import React, { useRef } from 'react';
import { FontInfoPanel } from './components/FontInfoPanel';
import { GlyphDetail } from './components/GlyphDetail';
import { GlyphGrid } from './components/GlyphGrid';
import { TextPreview } from './components/TextPreview';
import { ThemedFontViewer } from './components/ThemedFontViewer';
import { useElementHeight } from './hooks/useElementHeight';
import { useFontViewer } from './hooks/useFontViewer';

const FontViewerApp: React.FC = () => {
  const {
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
  } = useFontViewer();

  const detailRef = useRef<HTMLElement>(null);
  const detailHeight = useElementHeight(detailRef, [selectedGlyph, loading, info]);

  if (loading && !info) {
    return (
      <div className="font-viewer-loading">
        <Spinner size={40} />
        <p>Loading font…</p>
      </div>
    );
  }

  if (error) {
    return (
      <NonIdealState
        icon="error"
        title="Failed to load font"
        description={error}
      />
    );
  }

  if (!info || !fontBase64) {
    return (
      <NonIdealState
        icon="font"
        title="No font loaded"
        description="Open a .ttf file to browse glyphs."
      />
    );
  }

  return (
    <div className="font-viewer-app">
      <Navbar className="font-viewer-navbar">
        <NavbarGroup>
          <Icon icon="font" className="font-viewer-navbar-icon" />
          <NavbarHeading>TTF Explorer</NavbarHeading>
          <Tag minimal round intent="none" className="font-viewer-navbar-tag">Read-only</Tag>
        </NavbarGroup>
      </Navbar>

      <FontInfoPanel info={info} />

      <div className="font-viewer-main">
        <div
          className="font-viewer-left"
          style={detailHeight ? { height: detailHeight } : undefined}
        >
          {loading ? (
            <div className="font-viewer-page-loading">
              <Spinner size={24} />
            </div>
          ) : (
            <GlyphGrid
              info={info}
              glyphs={glyphs}
              selectedGlyph={selectedGlyph}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              glyphCount={glyphCount}
              onSelect={setSelectedGlyph}
              onPageChange={loadPage}
            />
          )}
        </div>
        <div className="font-viewer-right">
          <GlyphDetail ref={detailRef} info={info} glyph={selectedGlyph} />
        </div>
      </div>

      <TextPreview
        fontBase64={fontBase64}
        fontFamily={info.fontFamily}
        selectedUnicode={selectedGlyph?.unicode[0]}
        onUnicodeLookup={findGlyphByUnicode}
      />
    </div>
  );
};

const App: React.FC = () => (
  <ThemedFontViewer>
    <FontViewerApp />
  </ThemedFontViewer>
);

export default App;
