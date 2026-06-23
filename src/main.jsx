import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Hide splash screen
const hideSplash = () => {
    const splash = document.getElementById('splash');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 600);
    }
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);

// Hide splash after first paint
requestAnimationFrame(() => {
    setTimeout(hideSplash, 400);
});
