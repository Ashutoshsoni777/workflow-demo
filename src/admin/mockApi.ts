export type Metrics = {
  cpu: number; // 0-100
  latencyMs: number;
  jobsProcessed: number;
  timestamp: number;
};

let jobs = 1000;

export function fetchMetrics(): Promise<Metrics> {
  // simulate API latency
  return new Promise((res) => {
    setTimeout(() => {
      jobs += Math.round(Math.random() * 5);
      const m: Metrics = {
        cpu: Math.max(5, Math.min(95, 30 + Math.round(Math.random() * 50) - 5)),
        latencyMs: Math.max(10, Math.round(50 + Math.random() * 200)),
        jobsProcessed: jobs,
        timestamp: Date.now(),
      };
      res(m);
    }, 300 + Math.random() * 300);
  });
}

// Simple pub/sub WebSocket simulation
type Listener = (m: Metrics) => void;
const listeners: Set<Listener> = new Set();

export function subscribeMetrics(cb: Listener) {
  listeners.add(cb);
  // send immediate heartbeat
  const interval = setInterval(async () => {
    const m = await fetchMetrics();
    listeners.forEach((l) => l(m));
  }, 2000 + Math.random() * 1000);

  return () => {
    listeners.delete(cb);
    clearInterval(interval);
  };
}
