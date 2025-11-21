import React, { useEffect, useRef, useState } from 'react';
import '../consoleNotifier/console.css';

type Msg = { type: 'log' | 'info' | 'warn' | 'error'; text: string } | null;

export function ConsoleNotifierProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<Msg>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const orig = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };

    function formatArgs(args: any[]) {
      if (!args || args.length === 0) return '';
      try {
        const first = args[0];
        if (typeof first === 'string') {
          // include first string and a short preview of following objects
          const rest = args.slice(1).map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
          const preview = rest ? ` — ${rest}` : '';
          const text = `${first}${preview}`;
          return text.length > 180 ? text.slice(0, 177) + '...' : text;
        }
        return JSON.stringify(args).slice(0, 180) + (JSON.stringify(args).length > 180 ? '...' : '');
      } catch (e) {
        return String(args[0]);
      }
    }

    function show(type: Msg['type'], args: any[]) {
      const text = formatArgs(args);
      // show friendly curated message
      const friendly = type === 'error' ? 'An error occurred — check the console for details.' : type === 'warn' ? 'Warning produced — check console for details.' : 'New console output — open DevTools to review.';
      setMsg({ type, text: `${friendly} ▶ ${text}` });
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setMsg(null), 2000);
    }

    console.log = (...args: any[]) => {
      orig.log(...args);
      show('log', args);
    };
    console.info = (...args: any[]) => {
      orig.info(...args);
      show('info', args);
    };
    console.warn = (...args: any[]) => {
      orig.warn(...args);
      show('warn', args);
    };
    console.error = (...args: any[]) => {
      orig.error(...args);
      show('error', args);
    };

    return () => {
      // restore
      console.log = orig.log;
      console.info = orig.info;
      console.warn = orig.warn;
      console.error = orig.error;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {msg && (
        <div className={`cn-modal ${msg.type}`} role="status" aria-live="polite">
          <div className="cn-modal-inner">
            <strong style={{ display: 'block', marginBottom: 6 }}>{msg.type.toUpperCase()}</strong>
            <div className="cn-modal-text">{msg.text}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConsoleNotifierProvider;
