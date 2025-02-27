import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';
import './styles/responsive.css';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
