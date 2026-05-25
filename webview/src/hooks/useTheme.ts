import { useState, useEffect } from 'react';

export function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(
    () => document.body.classList.contains('vscode-dark')
      || document.body.classList.contains('vscode-high-contrast'),
  );

  useEffect(() => {
    const updateTheme = () => {
      const dark = document.body.classList.contains('vscode-dark')
        || document.body.classList.contains('vscode-high-contrast');
      setIsDark(dark);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateTheme();
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
