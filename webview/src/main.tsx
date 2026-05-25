import { FocusStyleManager } from '@blueprintjs/core';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.scss';

FocusStyleManager.onlyShowFocusOnTabs();

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
