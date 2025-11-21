import { useState } from 'react';
import App from './App.tsx';
import NewProject from './NewProject.tsx';
import './home.css';

export default function Home() {
  const [active, setActive] = useState<'project1' | 'project2' | null>(null);

  return (
    <div className="home-root">
      <div className="home-wrap">
        <h1 className="home-title">Select the task </h1>

        <div className="home-buttons">
          <button onClick={() => setActive('project1')} className={`home-btn ${active === 'project1' ? 'active' : ''}`}>
           Story 1 — “The Frozen Workflow”
          </button>

          <button onClick={() => setActive('project2')} className={`home-btn ${active === 'project2' ? 'active' : ''}`}>
           Story 2 — “The Admin Console That Sees Everything”
          </button>
        </div>

        <div style={{ marginTop: 40 }}>
          {active === 'project1' && <App />}
          {active === 'project2' && <NewProject />}
        </div>
      </div>
    </div>
  );
}
