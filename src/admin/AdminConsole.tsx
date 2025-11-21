import React, { useEffect, useState } from 'react';
import { RBACProvider, useRBAC, RequirePermission } from './rbac';
import { fetchMetrics, subscribeMetrics, type Metrics } from './mockApi';
import './admin.css';

function RoleSelector() {
  const { role, setRole } = useRBAC();
  return (
    <div className="role-select">
      <label className="label-muted" style={{ marginRight: 8 }}>Role:</label>
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option>Admin</option>
        <option>Analyst</option>
        <option>Viewer</option>
      </select>
    </div>
  );
}

function HealthBanner({ metrics }: { metrics?: Metrics | null }) {
  if (!metrics) return <div className="health-banner">No metrics</div>;
  const { cpu, latencyMs } = metrics;
  const status = cpu > 80 || latencyMs > 300 ? 'red' : cpu > 60 || latencyMs > 200 ? 'yellow' : 'green';
  const cls = status === 'red' ? 'health-banner' : status === 'yellow' ? 'health-banner' : 'health-banner';
  const colorText = status === 'red' ? '#7f1d1d' : status === 'yellow' ? '#78350f' : '#064e3b';

  return (
    <div className={cls} style={{ background: status === 'red' ? '#fecaca' : status === 'yellow' ? '#fef3c7' : '#bbf7d0', color: colorText }}>
      System Health: {status.toUpperCase()} — CPU {cpu}% — Latency {latencyMs}ms
    </div>
  );
}

function MetricsView({ metrics }: { metrics?: Metrics | null }) {
  if (!metrics) return <div className="p-4">Loading metrics…</div>;
  return (
    <div className="p-4">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="label-muted">CPU</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.cpu}%</div>
        </div>
        <div className="metric-card">
          <div className="label-muted">Latency</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.latencyMs}ms</div>
        </div>
        <div className="metric-card">
          <div className="label-muted">Jobs</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.jobsProcessed}</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function AdminAppInner() {
  const { role } = useRBAC();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  function doAction(msg: string) {
    const text = `${role}: ${msg}`;
    console.info(text);
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 2000);
  }

  // mock data for workflows and policies
  const [workflows, setWorkflows] = useState(() => [
    { id: 'w1', name: 'Extract Users', description: 'Extract user data from source A' },
    { id: 'w2', name: 'Transform Data', description: 'Transform pipeline' },
  ] as { id: string; name: string; description?: string }[]);

  const [policies, setPolicies] = useState(() => [
    { id: 'p1', name: 'Allow Read', rules: 'read:*' },
    { id: 'p2', name: 'Restrict Writes', rules: 'write:restricted' },
  ] as { id: string; name: string; rules?: string }[]);

  const [editing, setEditing] = useState<{ type: 'workflow' | 'policy'; id: string } | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});

  function openEdit(type: 'workflow' | 'policy', id: string) {
    setEditing({ type, id });
    if (type === 'workflow') {
      const item = workflows.find((w) => w.id === id)!;
      setFormState({ name: item.name, description: item.description || '' });
    } else {
      const item = policies.find((p) => p.id === id)!;
      setFormState({ name: item.name, rules: item.rules || '' });
    }
  }

  function closeEdit() {
    setEditing(null);
    setFormState({});
  }

  function saveEdit() {
    if (!editing) return;
    if (editing.type === 'workflow') {
      setWorkflows((prev) => prev.map((w) => (w.id === editing.id ? { ...w, ...formState } : w)));
      doAction(`Saved workflow ${formState.name}`);
    } else {
      setPolicies((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...formState } : p)));
      doAction(`Saved policy ${formState.name}`);
    }
    closeEdit();
  }

  useEffect(() => {
    let mounted = true;
    fetchMetrics()
      .then((m) => {
        if (!mounted) return;
        setMetrics(m);
        setLoading(false);
        console.info('[telemetry] fetchMetrics', { role, latency: 0 });
      })
      .catch((e) => {
        console.error('metrics fetch error', e);
        setError(String(e));
        setLoading(false);
      });

    const unsub = subscribeMetrics((m) => {
      setMetrics(m);
      // Simulate OpenTelemetry logging to console
      console.log('[otel] metrics.update', { role, timestamp: m.timestamp, cpu: m.cpu, latency: m.latencyMs });
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [role]);

  return (
    <div className="admin-root">
      <div className="admin-container">
        <div className="admin-header">
          <RoleSelector />
          <div className="admin-title">Admin Console</div>
          <div>
            {actionMsg && (
              <div style={{ background: 'rgba(11,95,255,0.08)', padding: '6px 10px', borderRadius: 8, color: '#0b5fff', fontWeight: 600 }}>
                {actionMsg}
              </div>
            )}
          </div>
        </div>

        <HealthBanner metrics={metrics} />

        <div className="admin-panel mt-4">
          <Section title="Workflows">
            <RequirePermission perm="workflows.view">
              <div>
                {workflows.map((w) => (
                  <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{w.name}</div>
                      <div className="label-muted" style={{ fontSize: 13 }}>{w.description}</div>
                    </div>
                    <div>
                      <RequirePermission perm="workflows.edit">
                        <button onClick={() => openEdit('workflow', w.id)} className="btn primary">Edit</button>
                      </RequirePermission>
                    </div>
                  </div>
                ))}
              </div>
            </RequirePermission>
          </Section>

          <Section title="Agents">
            <RequirePermission perm="agents.view">
              <div>Agents list (agents.view)</div>
            </RequirePermission>
          </Section>

          <Section title="Policies">
            <RequirePermission perm="policies.view">
              <div>
                {policies.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div className="label-muted" style={{ fontSize: 13 }}>{p.rules}</div>
                    </div>
                    <div>
                      <RequirePermission perm="policies.edit">
                        <button onClick={() => openEdit('policy', p.id)} className="btn primary">Edit</button>
                      </RequirePermission>
                    </div>
                  </div>
                ))}
              </div>
            </RequirePermission>
          </Section>

          <Section title="Access Control">
            <RequirePermission perm="access.view">
              <div>RBAC & access control (restricted)</div>
            </RequirePermission>
          </Section>

          <Section title="Live Metrics">
            {loading && <div className="p-2">Loading metrics…</div>}
            {error && <div className="p-2" style={{ color: 'var(--danger)' }}>Error loading metrics: {error}</div>}
            <RequirePermission perm="metrics.view">
              <MetricsView metrics={metrics} />
            </RequirePermission>
            <div className="p-2 label-muted">(Metrics auto-refresh in real-time)</div>
          </Section>
        </div>
        {editing && (
          <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
            <div className="admin-modal">
              <h3 style={{ marginBottom: 6 }}>{editing.type === 'workflow' ? 'Edit Workflow' : 'Edit Policy'}</h3>
              {editing.type === 'workflow' ? (
                <>
                  <div className="form-row">
                    <label>Name</label>
                    <input className="ui-input" value={formState.name || ''} onChange={(e) => setFormState((s: any) => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label>Description</label>
                    <textarea className="ui-input" value={formState.description || ''} onChange={(e) => setFormState((s: any) => ({ ...s, description: e.target.value }))} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <label>Name</label>
                    <input className="ui-input" value={formState.name || ''} onChange={(e) => setFormState((s: any) => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label>Rules</label>
                    <input className="ui-input" value={formState.rules || ''} onChange={(e) => setFormState((s: any) => ({ ...s, rules: e.target.value }))} />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button className="btn secondary" onClick={closeEdit}>Cancel</button>
                <button className="btn primary" onClick={saveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminConsole() {
  return (
    <RBACProvider>
      <AdminAppInner />
    </RBACProvider>
  );
}

