# Workflow Demo — Project Documentation

Last updated: 2025-11-22

## Executive Summary

Workflow Demo is a Vite + React + TypeScript single-repository demo containing two primary projects under one UI:

- Project 1 (frozen): a workflow/graph editor (React Flow-based) — preserved as the original project and intentionally frozen from further changes.
- Project 2 (Admin Console): an admin/prototype console demonstrating RBAC, simulated real-time metrics, telemetry events, a console notifier, and editable mock entities (workflows, policies).

The repository also contains build and deployment configs (Vite, Tailwind/PostCSS, gh-pages deploy) and a handful of scoped CSS files to deliver a professional UI look.

This document is intended for maintainers and reviewers who need a comprehensive overview: how the project is structured, how to run it, what key design decisions were made, and recommended next steps.

## Goals and Requirements

- Provide a demo workspace showcasing an editable workflow UI and an Admin Console capable of:
  - Role-based access control (RBAC) with role selector and permission gating.
  - Simulated real-time metrics and a subscription-style API for metric updates.
  - Telemetry-style logging (console-driven) surfaced into a transient UI notifier.
  - Editable mock entities (workflows, policies) with modal-based editing and in-memory persistence.
- Keep the original workflow editor (Project 1) frozen — maintain compatibility but do not alter core behavior.
- Deliver an enterprise-quality UI with consistent spacing, clear hierarchy, and accessible controls where feasible.

## Tech Stack

- Frontend: React + TypeScript (TSX)
- Bundler / dev server: Vite
- Styling: Tailwind + scoped custom CSS files; PostCSS with `@tailwindcss/postcss` plugin
- State: Small local React state and a minimal Zustand store used for node status (for the React Flow project)
- Graph: React Flow (used in Project 1)
- Deployment: `gh-pages` (npm script `deploy`) for publishing `dist` to GitHub Pages

## Top-level File Map (key files)

- `index.html` — app entry HTML
- `vite.config.ts` — Vite configuration
- `package.json` — dependencies and scripts (dev/build/deploy)
- `postcss.config.cjs` — PostCSS config (ensures Tailwind works)
- `src/` — application source
  - `main.tsx` — entry React mount, wraps the app in `ConsoleNotifierProvider` and renders `Home` by default
  - `App.tsx` — (Project 1) original workflow editor (React Flow). Frozen; only minor fixes applied (nodeTypes memoization, container sizing fallbacks)
  - `Home.tsx` — simple homepage showing two large buttons to select Project 1 or Project 2
  - `NewProject.tsx` — navigates to Project 2 (Admin Console)
  - `store.ts` — small Zustand store for node status (used by Project 1)
  - `assets/`, `public/` — static assets and Vite static files
  - `src/admin/` — Admin Console code and helpers
    - `AdminConsole.tsx` — main admin UI with role selector, health banner, metrics, editable lists (workflows/policies/agents), and edit modals
    - `rbac.tsx` — `RBACProvider`, `useRBAC()` and `RequirePermission` wrapper component used to gate UI actions
    - `mockApi.ts` — simulated metrics provider: `fetchMetrics()` and `subscribeMetrics()` that provide synthetic, changing values
    - `DesignBrief.md` — design brief describing architecture decisions and trade-offs
    - `admin.css` — scoped CSS for the admin UI (recently polished for spacing, buttons, modal UX)
  - `src/consoleNotifier/ConsoleNotifier.tsx` — intercepts `console.*` calls and shows short UI toasts for each log
  - `src/home.css` — custom styles for the homepage buttons

## Key Design Components

1. RBAC (Role-Based Access Control)
   - Implemented in `src/admin/rbac.tsx`.
   - Roles map to permission sets (e.g., `admin`, `editor`, `viewer`). Components call `useRBAC()` to determine the current role; `RequirePermission` wraps UI fragments that should be hidden/disabled for roles lacking permissions.

2. Mock Metrics & Real-time Simulation
   - `src/admin/mockApi.ts` provides a simulated `subscribeMetrics()` function that notifies callbacks periodically (simulating a push/subscription). `fetchMetrics()` provides the initial snapshot.
   - Admin Console uses these to populate metric cards and charts. Subscription is intentionally lightweight and simulated (no WebSocket server required).

3. Console Notifier (Telemetry UI)
   - `src/consoleNotifier/ConsoleNotifier.tsx` overrides `console.log`, `console.warn`, `console.error`, and `console.info` to additionally push a UI notification visible for ~2 seconds.
   - The notifier is non-blocking (positioned top-right and uses pointer-events appropriately) and intended as a lightweight telemetry demo.

4. Edit Modal & Persistence
   - Workflows and Policies in the Admin Console are mock objects stored in local component state (in-memory arrays). Edit actions open a modal form (`admin-modal`) and `save` updates the arrays and emits a telemetry message.
   - This is a prototype: no backend persistence is implemented. The UI code is structured so it can easily be wired to a real API.

5. Styling
   - Tailwind is available for utility styling. Key project areas use scoped CSS files (`admin.css`, `home.css`) for precise layout and enterprise polish. Recent changes standardize spacing, typography, and button appearances.

## How to Run (local dev)

Prerequisites: Node.js (v16+ recommended), npm

1. Install dependencies

```powershell
cd C:\Users\User\Desktop\Task_Ashutosh
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. Open the app

Visit the dev server URL printed by Vite (usually `http://localhost:5173/`). The `Home` screen shows two large buttons. Click the second to open the Admin Console, or the first to open the frozen workflow app.

## Build & Deploy

1. Create production build

```powershell
npm run build
```

2. Deploy to GitHub Pages (already configured with `gh-pages` in `package.json`)

```powershell
npm run deploy
```

Note: The repo's Vite `base` was previously configured for a GitHub Pages deployment path; confirm the `base` value in `vite.config.ts` if your repo name or organization changes.

## Development Notes & Troubleshooting

- Tailwind/PostCSS: The project uses a `postcss.config.cjs` with the `@tailwindcss/postcss` plugin. If styles don't compile, ensure that plugin is installed and that the dev server was restarted after installing PostCSS plugins.
- React Flow UI blank/black screen: This was caused by React Flow container sizing and non-memoized `nodeTypes`. Fixes applied: explicit width/height fallbacks for the container and memoization of `nodeTypes`.
- Console Notifier: Because it overrides `console.*`, it may affect test harnesses or third-party libs expecting original console behavior. It's implemented to call the original console after capturing logs, but if you need to disable it, remove the provider wrapper in `main.tsx`.

## Known Limitations & Next Steps

- Persistence: Editing entities updates in-memory state only. Integrate a backend (REST/GraphQL) with proper persistence and optimistic updates.
- Accessibility: Modal focus traps and keyboard accessibility need improvement. Add a focus-trap utility and `aria-*` attributes on modals and controls.
- Tests: Add unit tests for RBAC logic, the mock API subscription, and visual regression tests for critical UI flows.
- Telemetry: Replace console-driven telemetry with a proper instrumentation pipeline (e.g., OpenTelemetry + collector) and send events to a telemetry backend.
- Role Management: Provide a real role management UI and tie roles to user identities (auth provider integration: OAuth/OIDC)

## Code Walkthrough (high-level)

- `main.tsx`: App root — wraps the app with `ConsoleNotifierProvider` and renders `Home`.
- `Home.tsx`: Launchpad — two buttons to open project 1 (frozen) or project 2 (admin).
- `App.tsx`: React Flow graph UI — note: this area is frozen and only minimal fixes were applied.
- `src/admin/AdminConsole.tsx`: The primary admin demo — contains role selector, health banner, metrics grid, and lists for workflows/policies/agents. Edit operations open modals.
- `src/admin/rbac.tsx`: RBAC provider and permission guard. Use `RequirePermission` to show/hide or enable/disable actions.
- `src/admin/mockApi.ts`: Synthetic metrics provider — the Admin Console subscribes to it to receive periodic updates.

## Recommended Branching & CI

- Keep `main` as the deploy-ready branch. Create feature branches for new functionality: `feature/admin-access-control`, `feature/telemetry`, etc.
- Add a GitHub Actions workflow to run linting, type checks, and build on PRs. Example steps:
  - `npm ci`
  - `npm run build` (to catch build-time/runtime compile issues)
  - `npm run lint` / `npm run test` (if tests are added)

## Contribution Guidelines

- Keep the original workflow editor (Project 1) stable — avoid changes there unless they are bug fixes.
- Use `src/admin/` area for continued admin console work. Add unit tests when adding business logic (RBAC mapping, API handlers).

## Contact & Maintainer Notes

- Maintainer: repository owner (local alias: `Ashutoshsoni777`) — coordinate changes to the `vite.config.ts` base if you change the GitHub Pages repo path.

## Appendix: Quick File Reference

- `src/admin/admin.css` — enterprise-styled admin UI CSS (spacing, buttons, modal styles)
- `src/home.css` — homepage button styling
- `src/consoleNotifier/console.css` — console notifier styles (top-right non-blocking toasts)
