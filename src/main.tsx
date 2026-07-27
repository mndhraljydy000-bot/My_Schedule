import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import ReactGA from 'react-ga4';

ReactGA.initialize('G-VQMDSLDKK7');

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
