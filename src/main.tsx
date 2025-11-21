import React from 'react'
import ReactDOM from 'react-dom/client'
import Home from './Home';
import './index.css'
import 'reactflow/dist/style.css';
import ConsoleNotifierProvider from './consoleNotifier/ConsoleNotifier';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConsoleNotifierProvider>
      <Home />
    </ConsoleNotifierProvider>
  </React.StrictMode>,
)