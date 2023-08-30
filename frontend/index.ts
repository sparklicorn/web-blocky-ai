import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
// import App from './App';
import MainLayout from './views/MainLayout';

createRoot(document.getElementById('app')!).render(createElement(MainLayout));
