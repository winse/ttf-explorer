import * as vscode from 'vscode';
import { MessageHandlerContext } from '../types/font';

export class MessageHandler {
  public handle(message: { type: string; [key: string]: unknown }, context: MessageHandlerContext): void {
    const { type } = message;

    switch (type) {
      case 'getFontData':
        this.handleGetFontData(context);
        break;
      case 'getGlyphPage':
        this.handleGetGlyphPage(message as { page?: number }, context);
        break;
      case 'findGlyphByUnicode':
        this.handleFindGlyphByUnicode(message as { codePoint?: number }, context);
        break;
      case 'copyToClipboard':
        this.copyToClipboard(String(message.data ?? ''), context);
        break;
      default:
        console.log('[MessageHandler] Unknown message type:', type);
    }
  }

  private async handleGetFontData(context: MessageHandlerContext): Promise<void> {
    if (!context.filePath) {
      context.panel.webview.postMessage({
        type: 'error',
        message: 'No file path available. Please open a TTF file first.',
      });
      return;
    }

    try {
      context.panel.webview.postMessage({
        type: 'loading',
        message: 'Reading font file...',
      });

      const config = vscode.workspace.getConfiguration('ttf-explorer');
      const pageSize = config.get<number>('glyphPageSize', 100);
      const payload = await context.fontProcessor.processFile(context.filePath, 0, pageSize);

      context.panel.webview.postMessage({
        type: 'fontData',
        ...payload,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load font file';
      console.error('[MessageHandler] handleGetFontData error', { filePath: context.filePath, error });
      context.panel.webview.postMessage({ type: 'error', message });
    }
  }

  private async handleGetGlyphPage(
    message: { page?: number },
    context: MessageHandlerContext,
  ): Promise<void> {
    if (!context.filePath) {
      return;
    }

    try {
      const config = vscode.workspace.getConfiguration('ttf-explorer');
      const pageSize = config.get<number>('glyphPageSize', 100);
      const page = typeof message.page === 'number' ? message.page : 0;
      const payload = await context.fontProcessor.getGlyphPage(context.filePath, page, pageSize);

      context.panel.webview.postMessage({
        type: 'glyphPage',
        ...payload,
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Failed to load glyph page';
      context.panel.webview.postMessage({ type: 'error', message: errMessage });
    }
  }

  private async handleFindGlyphByUnicode(
    message: { codePoint?: number },
    context: MessageHandlerContext,
  ): Promise<void> {
    if (!context.filePath || typeof message.codePoint !== 'number') {
      return;
    }

    try {
      const config = vscode.workspace.getConfiguration('ttf-explorer');
      const pageSize = config.get<number>('glyphPageSize', 100);
      const result = await context.fontProcessor.findGlyphByUnicode(
        context.filePath,
        message.codePoint,
        pageSize,
      );

      if (!result) {
        context.panel.webview.postMessage({
          type: 'glyphNotFound',
          codePoint: message.codePoint,
        });
        return;
      }

      context.panel.webview.postMessage({
        type: 'glyphFound',
        ...result,
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Failed to find glyph';
      context.panel.webview.postMessage({ type: 'error', message: errMessage });
    }
  }

  private async copyToClipboard(data: string, context: MessageHandlerContext): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(data);
      context.panel.webview.postMessage({ type: 'copyComplete', message: 'Copied to clipboard' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Copy failed';
      context.panel.webview.postMessage({ type: 'copyError', message });
    }
  }
}
