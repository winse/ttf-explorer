import React from 'react';
import { useIsDarkTheme } from '../hooks/useTheme';

export interface ThemedFontViewerProps {
  children: React.ReactNode;
}

export const ThemedFontViewer: React.FC<ThemedFontViewerProps> = ({ children }) => {
  const isDark = useIsDarkTheme();
  return <div className={`font-viewer-root ${isDark ? 'bp6-dark' : ''}`}>{children}</div>;
};
