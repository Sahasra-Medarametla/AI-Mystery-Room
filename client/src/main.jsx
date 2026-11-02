import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { MysteryProvider } from './context/MysteryContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><MysteryProvider><App /></MysteryProvider></BrowserRouter></React.StrictMode>
);
