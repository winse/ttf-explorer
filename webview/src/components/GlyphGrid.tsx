import { Button, ButtonGroup, HTMLSelect, Tag } from '@blueprintjs/core';
import React from 'react';
import type { FontInfo, GlyphSummary } from '../types/font';
import { formatUnicode } from '../utils/glyphSvg';
import { GlyphSvg } from './GlyphSvg';
import { PanelHeader } from './PanelHeader';

export interface GlyphGridProps {
  info: FontInfo;
  glyphs: GlyphSummary[];
  selectedGlyph: GlyphSummary | null;
  page: number;
  totalPages: number;
  pageSize: number;
  glyphCount: number;
  onSelect: (glyph: GlyphSummary) => void;
  onPageChange: (page: number) => void;
}

export const GlyphGrid: React.FC<GlyphGridProps> = ({
  info,
  glyphs,
  selectedGlyph,
  page,
  totalPages,
  pageSize,
  glyphCount,
  onSelect,
  onPageChange,
}) => {
  const pageSizeOptions = [50, 100, 200];

  return (
    <section className="fe-panel glyph-grid-panel">
      <PanelHeader icon="grid-view" title="Glyph List" badge={glyphCount} />

      <div className="glyph-grid-scroll">
        <div className="glyph-grid">
          {glyphs.map((glyph) => {
            const selected = selectedGlyph?.index === glyph.index;
            return (
              <button
                key={glyph.index}
                type="button"
                className={`glyph-card ${selected ? 'glyph-card-selected' : ''}`}
                onClick={() => onSelect(glyph)}
              >
                <div className="glyph-card-preview glyph-canvas">
                  <GlyphSvg glyph={glyph} info={info} />
                </div>
                <div className="glyph-card-meta">
                  <span className="glyph-card-index">#{glyph.index}</span>
                  <span className="glyph-card-unicode" title={formatUnicode(glyph.unicode)}>
                    {formatUnicode(glyph.unicode)}
                  </span>
                  <span className="glyph-card-name" title={glyph.name}>{glyph.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="glyph-pagination">
        <div className="glyph-pagination-left">
          <span className="page-size-label">Page size</span>
          <HTMLSelect value={pageSize} disabled options={pageSizeOptions} minimal />
        </div>

        <ButtonGroup minimal className="glyph-pagination-controls">
          <Button
            icon="double-chevron-left"
            disabled={page === 0}
            onClick={() => onPageChange(0)}
            title="First page"
          />
          <Button
            icon="chevron-left"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            title="Previous page"
          />
          <Button active intent="primary" className="glyph-page-indicator">{page + 1}</Button>
          <Button
            rightIcon="chevron-right"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            title="Next page"
          />
          <Button
            rightIcon="double-chevron-right"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            title="Last page"
          />
        </ButtonGroup>

        <Tag minimal round className="glyph-page-total">{page + 1} / {totalPages}</Tag>
      </footer>
    </section>
  );
};
