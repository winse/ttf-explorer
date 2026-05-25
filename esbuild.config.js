const esbuild = require('esbuild');
const path = require('path');
const { sassPlugin } = require('esbuild-sass-plugin');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const sharedConfig = {
  minify: production,
  sourcemap: !production,
  sourcesContent: false,
  logLevel: 'warning',
  target: ['es2020'],
};

async function build() {
  try {
    const reactAlias = {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      '@blueprintjs/core': path.resolve(__dirname, 'node_modules', '@blueprintjs/core'),
      '@blueprintjs/icons': path.resolve(__dirname, 'node_modules', '@blueprintjs/icons'),
    };

    const extensionConfig = {
      ...sharedConfig,
      entryPoints: ['src/extension.ts'],
      bundle: true,
      format: 'cjs',
      platform: 'node',
      outfile: 'dist/extension.js',
      external: ['vscode'],
    };

    const webviewConfig = {
      ...sharedConfig,
      entryPoints: ['webview/src/main.tsx'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/webview.js',
      alias: reactAlias,
      plugins: [sassPlugin()],
      loader: {
        '.tsx': 'tsx',
        '.css': 'css',
        '.svg': 'dataurl',
        '.eot': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    };

    if (watch) {
      const ctxExtension = await esbuild.context(extensionConfig);
      const ctxWebview = await esbuild.context(webviewConfig);
      console.log('Watching for changes...');
      await Promise.all([ctxExtension.watch(), ctxWebview.watch()]);
    } else {
      await Promise.all([
        esbuild.build(extensionConfig),
        esbuild.build(webviewConfig),
      ]);
      console.log('Build completed successfully');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
