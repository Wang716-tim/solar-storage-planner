# 向阳 · 光储估算 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese local tool that estimates a household solar and storage scenario from explicit user inputs.

**Architecture:** Keep formulas and validation in a pure JavaScript module; let a browser controller connect that module to a semantic HTML form. Serve static files from a loopback-only Node HTTP server and use the Node built-in test runner.

**Tech Stack:** Node.js 20+, HTML, CSS, JavaScript ES Modules, `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-25-guang-chu-fangan-tai-design.md`

## Global Constraints

- User-visible text uses Simplified Chinese.
- No third-party runtime dependency, account, API key, or remote model is required.
- Deterministic code is the only source of engineering numbers.
- Display estimates with their assumptions and limits.

---

### Task 1: Deterministic estimation engine

**Files:** `tests/engineering.test.js`, `src/engineering.js`

- [x] Define normal, roof-limit, invalid-input, missing-input, and zero-cost behaviors in tests.
- [x] Run tests before implementation and observe the missing-module failure.
- [x] Implement `validateInputs(input)` and `calculateScenario(input)`.
- [x] Run `node --test`; all five calculation tests pass.

### Task 2: Local static server

**Files:** `server.js`, `tests/server.test.js`

- [x] Verify the root route returns Chinese HTML and outside-root access is rejected.
- [x] Implement loopback server and content-type mapping.
- [x] Run HTTP integration tests; both pass.

### Task 3: Chinese responsive interface

**Files:** `index.html`, `styles.css`, `src/app.js`

- [x] Add semantic input form, result cards, and calculation disclosure.
- [x] Connect validation and deterministic results to the UI.
- [x] Add responsive layout, focus states, and reduced-motion handling.

### Task 4: Documentation and project memory

**Files:** `AGENTS.md`, `README.md`, `docs/`, `.gitignore`, `package.json`

- [x] Document product context, scope, architecture, decisions, roadmap, tasks, tests, changes, and handoff.
- [x] Add `npm start` and `npm test` entry points.
- [x] Keep internal project-combination notes out of the public repository.
