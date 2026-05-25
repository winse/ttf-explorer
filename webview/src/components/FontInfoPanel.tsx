import { Icon, Tag } from '@blueprintjs/core';
import React from 'react';
import type { FontInfo } from '../types/font';

export interface FontInfoPanelProps {
  info: FontInfo;
}

const metrics = (info: FontInfo) => [
  { label: 'Glyphs', value: info.glyphCount.toLocaleString() },
  { label: 'UPM', value: String(info.unitsPerEm) },
  { label: 'Ascent', value: String(info.ascent) },
  { label: 'Descent', value: String(info.descent) },
];

export const FontInfoPanel: React.FC<FontInfoPanelProps> = ({ info }) => (
  <header className="font-info-hero">
    <div className="font-info-hero-main">
      <div className="font-info-hero-icon" aria-hidden>
        <Icon icon="font" size={22} />
      </div>
      <div className="font-info-hero-text">
        <h1 className="font-info-title">{info.fullName || info.fontFamily}</h1>
        <div className="font-info-subtitle">
          <span className="font-info-family">{info.fontFamily}</span>
          {info.fontSubFamily && (
            <>
              <span className="font-info-dot">·</span>
              <span>{info.fontSubFamily}</span>
            </>
          )}
          {info.version && (
            <>
              <span className="font-info-dot">·</span>
              <span>v{info.version}</span>
            </>
          )}
        </div>
        <div className="font-info-tags">
          <Tag minimal round icon="document">{info.fileName}</Tag>
          <Tag minimal round intent="primary">TTF</Tag>
        </div>
      </div>
    </div>
    <div className="font-metrics-grid">
      {metrics(info).map(({ label, value }) => (
        <div key={label} className="font-metric">
          <span className="font-metric-label">{label}</span>
          <span className="font-metric-value">{value}</span>
        </div>
      ))}
    </div>
  </header>
);
