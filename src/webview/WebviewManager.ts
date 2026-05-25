import * as vscode from 'vscode';
import * as path from 'path';
import { FontProcessor } from './FontProcessor';
import { MessageHandler } from './messageHandler';
import { CachedFontData } from '../types/font';

export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private currentFilePath: string | undefined;
  private dataCache: Map<string, CachedFontData> = new Map();

  constructor(
    private context: vscode.ExtensionContext,
    private messageHandler: MessageHandler,
    private fontProcessor: FontProcessor,
  ) {}

  public createOrShow(filePath: string): void {
    const fileName = path.basename(filePath);
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      this.panel.title = fileName;
      this.currentFilePath = filePath;
      this.loadFile(filePath);
      return;
    }
    this.createPanel(filePath, fileName);
  }

  public createOrShowWithPanel(filePath: string, panel: vscode.WebviewPanel): void {
    this.panel = panel;
    this.currentFilePath = filePath;
    const fileName = path.basename(filePath);

    panel.title = fileName;
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist')],
    };

    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js'),
    );
    const styleUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css'),
    );

    panel.webview.html = this.getHtmlContent(scriptUri, styleUri);

    panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.currentFilePath = undefined;
      },
      undefined,
      this.context.subscriptions,
    );

    this.bindMessageHandler(filePath);
    this.loadFile(filePath);
  }

  private createPanel(filePath: string, fileName: string): void {
    this.currentFilePath = filePath;
    this.panel = vscode.window.createWebviewPanel(
      'ttfViewer',
      fileName,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist')],
      },
    );

    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js'),
    );
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css'),
    );

    this.panel.webview.html = this.getHtmlContent(scriptUri, styleUri);

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.currentFilePath = undefined;
      },
      undefined,
      this.context.subscriptions,
    );

    this.bindMessageHandler(filePath);
    this.loadFile(filePath);
  }

  private bindMessageHandler(filePath: string): void {
    if (!this.panel) return;

    this.panel.webview.onDidReceiveMessage(
      (message) => this.messageHandler.handle(message, {
        panel: this.panel!,
        extensionUri: this.context.extensionUri,
        filePath,
        context: this.context,
        fontProcessor: this.fontProcessor,
      }),
      undefined,
      this.context.subscriptions,
    );
  }

  private async loadFile(filePath: string): Promise<void> {
    if (!this.panel) return;

    try {
      this.panel.webview.postMessage({
        type: 'loading',
        message: 'Reading font file...',
      });

      const config = vscode.workspace.getConfiguration('ttf-explorer');
      const pageSize = config.get<number>('glyphPageSize', 100);

      const payload = await this.fontProcessor.processFile(filePath, 0, pageSize);

      this.dataCache.set(filePath, {
        info: payload.info,
        fontBase64: payload.fontBase64,
        glyphCount: payload.glyphCount,
      });

      this.panel.webview.postMessage({
        type: 'fontData',
        ...payload,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load font file';
      console.error('[WebviewManager] loadFile error', { filePath, error });
      this.panel.webview.postMessage({ type: 'error', message });
    }
  }

  private getHtmlContent(scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
    const cspSource = this.panel?.webview.cspSource ?? '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src ${cspSource} https: data:;
    script-src ${cspSource} 'unsafe-inline';
    style-src ${cspSource} 'unsafe-inline';
    connect-src https:;
    font-src ${cspSource} data:;
  ">
  <link href="${styleUri}" rel="stylesheet">
  <title>TTF Explorer</title>
</head>
<body>
  <div id="root"></div>
  <script>
    const vscode = acquireVsCodeApi();
    window.vscode = vscode;
  </script>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
