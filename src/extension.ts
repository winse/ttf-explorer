import * as vscode from "vscode";
import { registerOpenFontViewerCommand } from "./commands/openFontViewer";
import { WebviewManager } from "./webview/WebviewManager";
import { MessageHandler } from "./webview/messageHandler";
import { registerFontEditor } from "./webview/FontEditorProvider";
import { FontProcessor } from "./webview/FontProcessor";

export function activate(context: vscode.ExtensionContext) {
  console.log("TTF Explorer extension is now active");
  const fontProcessor = new FontProcessor();
  const messageHandler = new MessageHandler();
  const webviewManager = new WebviewManager(context, messageHandler, fontProcessor);
  const editorDisposable = registerFontEditor(context, webviewManager);
  context.subscriptions.push(editorDisposable);
  const commandDisposable = registerOpenFontViewerCommand(context, webviewManager);
  context.subscriptions.push(commandDisposable);
}

export function deactivate() {
  console.log("TTF Explorer extension is now deactivated");
}
