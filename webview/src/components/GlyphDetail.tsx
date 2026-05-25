import { Button, Tag } from '@blueprintjs/core';
import React, { forwardRef } from 'react';
import type { FontInfo, GlyphSummary } from '../types/font';
import { formatUnicode } from '../utils/glyphSvg';
import { GlyphSvg } from './GlyphSvg';
import { PanelHeader } from './PanelHeader';

export interface GlyphDetailProps {
  info: FontInfo;
  glyph: GlyphSummary | null;
}

export const GlyphDetail = forwardRef<HTMLElement, GlyphDetailProps>(function GlyphDetail(
  { info, glyph },
  ref,
) {
  if (!glyph) {
    return (
      <section ref={ref} className="fe-panel glyph-detail-panel">
        <PanelHeader icon="properties" title="Glyph Detail" />
        <div className="glyph-detail-empty-state">
          <span className="glyph-detail-empty-icon">◻</span>
          <p>Select a glyph from the list to inspect its outline and metrics.</p>
        </div>
      </section>
    );
  }

  const unicodeText = formatUnicode(glyph.unicode);

  const copyUnicode = () => {
    window.vscode?.postMessage({ type: 'copyToClipboard', data: unicodeText });
  };

  return (
    <section ref={ref} className="fe-panel glyph-detail-panel">
      <PanelHeader
        icon="properties"
        title="Glyph Detail"
        badge={`#${glyph.index}`}
        extra={(
          <Button icon="clipboard" minimal small onClick={copyUnicode}>
            Copy Unicode
          </Button>
        )}
      />

      <div className="glyph-detail-body">
        <div className="glyph-detail-preview glyph-canvas glyph-canvas-large">
          <GlyphSvg glyph={glyph} info={info} className="glyph-detail-svg" />
        </div>

        <div className="glyph-detail-tags">
          <Tag minimal round intent="primary">{glyph.name}</Tag>
          {glyph.compound && <Tag minimal round intent="warning">compound</Tag>}
        </div>

        <dl className="glyph-detail-props">
          <div className="glyph-detail-prop">
            <dt>Unicode</dt>
            <dd><code>{unicodeText}</code></dd>
          </div>
          <div className="glyph-detail-prop">
            <dt>Advance</dt>
            <dd><code>{glyph.advanceWidth}</code></dd>
          </div>
          <div className="glyph-detail-prop">
            <dt>Bounds</dt>
            <dd>
              <code>
                ({glyph.bounds.xMin}, {glyph.bounds.yMin}) – ({glyph.bounds.xMax}, {glyph.bounds.yMax})
              </code>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
});
