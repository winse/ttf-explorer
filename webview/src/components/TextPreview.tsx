import {
  Button,
  FormGroup,
  InputGroup,
} from '@blueprintjs/core';
import React, { useCallback, useEffect, useState } from 'react';
import { codePointToChar, parseUnicodeInput } from '../utils/glyphSvg';
import { getPreviewFontFamily, loadPreviewFont } from '../utils/previewFont';
import { PanelHeader } from './PanelHeader';

export interface TextPreviewProps {
  fontBase64: string;
  fontFamily: string;
  selectedUnicode?: number;
  onUnicodeLookup?: (codePoint: number) => void;
}

export const TextPreview: React.FC<TextPreviewProps> = ({
  fontBase64,
  selectedUnicode,
  onUnicodeLookup,
}) => {
  const [sampleText, setSampleText] = useState(
    'The quick brown fox jumps over the lazy dog.\n字体预览 Font Preview 1234567890',
  );
  const [unicodeInput, setUnicodeInput] = useState('');
  const [unicodePreview, setUnicodePreview] = useState('');
  const [unicodeError, setUnicodeError] = useState<string | null>(null);
  const [fontReady, setFontReady] = useState(false);
  const [fontLoadError, setFontLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFontReady(false);
    setFontLoadError(null);

    loadPreviewFont(fontBase64)
      .then(() => {
        if (!cancelled) setFontReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFontLoadError(err instanceof Error ? err.message : 'Failed to load font for preview');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fontBase64]);

  useEffect(() => {
    if (selectedUnicode === undefined) return;
    const hex = selectedUnicode.toString(16).toUpperCase().padStart(4, '0');
    setUnicodeInput(hex);
    setUnicodePreview(codePointToChar(selectedUnicode));
    setUnicodeError(null);
  }, [selectedUnicode]);

  useEffect(() => {
    const handleLookupResult = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'glyphNotFound') {
        const hex = Number(message.codePoint).toString(16).toUpperCase().padStart(4, '0');
        setUnicodeError(`No glyph mapped to U+${hex}`);
        setUnicodePreview('');
      }
    };
    window.addEventListener('message', handleLookupResult);
    return () => window.removeEventListener('message', handleLookupResult);
  }, []);

  const applyUnicode = useCallback(() => {
    const codePoint = parseUnicodeInput(unicodeInput);
    if (codePoint === null) {
      setUnicodeError('Enter a valid hex code (e.g. E008 or U+E008)');
      return;
    }

    const char = codePointToChar(codePoint);
    if (!char) {
      setUnicodeError('Invalid Unicode code point');
      return;
    }

    setUnicodeError(null);
    setUnicodePreview(char);
    onUnicodeLookup?.(codePoint);
  }, [unicodeInput, onUnicodeLookup]);

  const appendUnicodeToSample = useCallback(() => {
    const codePoint = parseUnicodeInput(unicodeInput);
    if (codePoint === null) {
      setUnicodeError('Enter a valid hex code (e.g. E008 or U+E008)');
      return;
    }

    const char = codePointToChar(codePoint);
    if (!char) {
      setUnicodeError('Invalid Unicode code point');
      return;
    }

    setUnicodeError(null);
    setUnicodePreview(char);
    setSampleText((prev) => `${prev}${char}`);
    onUnicodeLookup?.(codePoint);
  }, [unicodeInput, onUnicodeLookup]);

  const handleUnicodeKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyUnicode();
    }
  };

  const fontStyle = { fontFamily: getPreviewFontFamily() } as const;
  const previewClassName = fontReady ? '' : 'text-preview-font-loading';

  return (
    <section className="fe-panel text-preview-panel">
      <PanelHeader icon="text-highlight" title="Text Preview" />

      <div className="text-preview-body">
        {fontLoadError && (
          <p className="text-preview-font-error">{fontLoadError}</p>
        )}

        <div className="text-preview-unicode-row">
          <FormGroup
            label="Unicode lookup"
            labelFor="unicode-input"
            helperText={unicodeError ?? 'E008 · U+E008 · 0xE008 — Enter to preview and jump'}
            intent={unicodeError ? 'danger' : 'none'}
            className="text-preview-unicode-input"
          >
            <InputGroup
              id="unicode-input"
              placeholder="E008"
              value={unicodeInput}
              onChange={(e) => {
                setUnicodeInput(e.target.value);
                setUnicodeError(null);
              }}
              onKeyDown={handleUnicodeKeyDown}
              leftIcon="search"
              rightElement={(
                <Button minimal icon="arrow-right" onClick={applyUnicode} title="Preview & go to glyph" />
              )}
            />
          </FormGroup>

          <div className="text-preview-unicode-actions">
            {unicodePreview ? (
              <div
                className={`text-preview-unicode-char glyph-canvas ${previewClassName}`}
                style={fontStyle}
              >
                {unicodePreview}
              </div>
            ) : (
              <div className="text-preview-unicode-char text-preview-unicode-char--empty">
                ?
              </div>
            )}
            <Button small outlined onClick={appendUnicodeToSample} disabled={!unicodeInput.trim()}>
              Append to sample
            </Button>
          </div>
        </div>

        <FormGroup label="Sample text" labelFor="sample-text" className="text-preview-sample-input">
          <textarea
            id="sample-text"
            className="fe-textarea"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={2}
          />
        </FormGroup>

        <div
          className={`text-preview-output glyph-canvas ${previewClassName}`}
          style={fontStyle}
        >
          {sampleText || <span className="text-preview-placeholder">Type above to preview…</span>}
        </div>
      </div>
    </section>
  );
};
