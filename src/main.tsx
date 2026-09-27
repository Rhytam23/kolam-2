
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Self-hosted fonts (no third-party requests). Each file only downloads when its script appears on the page.
import '@fontsource/hind-madurai/400.css';
import '@fontsource/hind-madurai/600.css';
import '@fontsource/hind-madurai/700.css';
import '@fontsource/tiro-tamil/400.css';
import '@fontsource/tiro-telugu/400.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import '@fontsource/tiro-bangla/400.css';
import '@fontsource/tiro-kannada/400.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
