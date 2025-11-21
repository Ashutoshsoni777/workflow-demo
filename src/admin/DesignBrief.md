# Design Brief — Admin Console (Perceive Now)

Overview
-------
This brief explains the architecture and decisions for a secure, real-time Admin Console that enforces Role-Based Access Control (RBAC) and provides live telemetry updates for engineers and analysts.

RBAC Strategy
-------------
- Model: roles are coarse-grained (`Admin`, `Analyst`, `Viewer`) plus a permissions map derived from role.
- Permissions: each UI action is guarded by a permission name (e.g., `workflows.view`, `workflows.edit`, `policies.delete`).
- Visible UI Elements: components check permissions (via hook or wrapper) to determine rendering. For example, a `Delete` button is shown only if `policies.delete` permission is present.
- Implementation pattern: a React Context (`PermissionsProvider`) exposes the current user and a `can(permission)` helper. UI components use a `usePermissions()` hook or a `RequirePermission` wrapper component to conditionally render content.

Example mapping (role → permissions)
- Admin: all permissions (view/edit/delete for workflows, agents, policies, access control).
- Analyst: view-only for most sections, plus `metrics.view` and `logs.view`.
- Viewer: very limited, can only view workflows list and system health.

Data Fetching & Refresh Logic
----------------------------
- Approach: use a fetch-with-polling pattern for metrics (every 2–5 seconds), and a simulated WebSocket for push updates. Use React Query or SWR in production; here we implement a lightweight polling + subscription pattern.
- Real-time design:
  - Polling fallbacks: if socket disconnects, fallback to periodic polling with exponential backoff.
  - Push updates: when a new metric arrives via socket, update the UI immediately and update cache.
- Error recovery and caching:
  - Cache last successful metrics in memory. On transient errors, continue showing cached data and display a non-blocking toast or indicator.
  - Retry with backoff on network errors; after N failures, stop polling and show an explicit error state.

Security & Performance
----------------------
- API token handling: tokens are stored in memory (not localStorage) for the mock; in production, use short-lived tokens and secure refresh flows. Protect tokens on the server and enforce scopes.
- CSP and data masking: enforce Content Security Policy headers that disallow inline scripts and remote code. Mask PII in UI (e.g., user emails) — client should receive only masked values when possible.
- Render efficiency: use memoized permission checks and split UI into lazy-loaded sections. Use virtualization for long tables, and incremental hydration for server-side rendered pages.

Telemetry Integration
---------------------
- Frontend instrumentation: integrate OpenTelemetry JS to capture traces and metrics for page loads, user actions, and API latency. In this prototype we simulate instrumentation by logging structured events to console.
- Observability goals: log user actions (role, action, timestamp), API latency, and errors. Combine client telemetry with backend logs to correlate traces.

Summary
-------
This design enforces explicit permission checks at render-time, prefers push updates with polling fallback, and treats telemetry as first-class (instrument most user actions and API calls). The prototype demonstrates these patterns in a small React app.
