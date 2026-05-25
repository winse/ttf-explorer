import * as vscode from "vscode";
import { WebviewManager } from "../webview/WebviewManager";

export function registerOpenFontViewerCommand(
  context: vscode.ExtensionContext,
  webviewManager: WebviewManager,
): vscode.Disposable {
  return vscode.commands.registerCommand("ttf-explorer.open", async () => {
    const fontPath = await getActiveFontFilePath();
    if (!fontPath) {
      vscode.window.showErrorMessage("No TTF file selected");
      return;
    }
    webviewManager.createOrShow(fontPath);
  });
}

async function getActiveFontFilePath(): Promise<string | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.fileName.toLowerCase().endsWith(".ttf")) {
    return editor.document.fileName;
  }
  const selectedFiles = await vscode.window.showOpenDialog({
    filters: { "TrueType Font": ["ttf"] },
    canSelectMany: false,
  });
  return selectedFiles?.[0]?.fsPath;
}
