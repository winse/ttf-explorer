/** Build a CSS-ready data URL from raw base64 or an existing data URL. */
export function toFontDataUrl(fontData: string): string {
  if (fontData.startsWith('data:')) {
    return fontData;
  }
  return `data:font/ttf;base64,${fontData}`;
}

/** Fixed family name for @font-face — avoids mismatch with internal font name tables. */
export const PREVIEW_FONT_FAMILY = 'TtfExplorerPreview';

let loadedFontKey: string | null = null;
let previewFace: FontFace | null = null;

/** Load font into document via FontFace API (reliable in VS Code webviews). */
export async function loadPreviewFont(fontData: string): Promise<void> {
  const dataUrl = toFontDataUrl(fontData);
  if (loadedFontKey === dataUrl && previewFace?.status === 'loaded') {
    return;
  }

  if (previewFace) {
    document.fonts.delete(previewFace);
    previewFace = null;
  }

  const face = new FontFace(PREVIEW_FONT_FAMILY, `url("${dataUrl}")`, {
    style: 'normal',
    weight: 'normal',
  });

  await face.load();
  document.fonts.add(face);
  await document.fonts.ready;
  previewFace = face;
  loadedFontKey = dataUrl;
}

export function getPreviewFontFamily(): string {
  return `'${PREVIEW_FONT_FAMILY}', sans-serif`;
}

export function resetPreviewFontCache(): void {
  if (previewFace) {
    document.fonts.delete(previewFace);
    previewFace = null;
  }
  loadedFontKey = null;
}
