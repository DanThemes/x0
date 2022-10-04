import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GameContextProvider } from './context/StateContext';

const root = createRoot(document.querySelector('#root'));
root.render(
  <GameContextProvider>
    <App />
  </GameContextProvider>
)