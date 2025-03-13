/**
 * main.tsx
 *
 * The React entry point, mounting App to #root.
 * We import index.css here as well, though you can also rely on the <link> in index.html
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
