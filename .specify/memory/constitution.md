<!--
Sync Impact Report
===================
Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)

Modified principles: N/A (first version)

Added sections:
  - Core Principles (3 principles)
  - Agent Authority Model (6 agent roles)
  - Security Constitution (Non-Negotiable)
  - API Rules
  - Data Rules
  - Workflow Enforcement
  - Change Management
  - Governance

Removed sections: N/A

Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check
    section already references this file dynamically)
  - .specify/templates/spec-template.md — ✅ compatible (no constitution-
    specific placeholders; FR/SC sections align)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure
    aligns with workflow enforcement order)

Follow-up TODOs: None
-->

# Hackathon Todo Constitution

## Core Principles

### I. Spec-Driven Development Is Mandatory

- Specifications are the **source of truth** for all work.
- No implementation may begin without an approved spec.
- Specs MUST be written before plans, tasks, or code.
- If specs are unclear, agents MUST request clarification via
  spec updates — never guess or improvise.

### II. Separation of Responsibilities

- Each agent has a single, well-defined role.
- Agents MUST NOT perform tasks outside their assigned responsibility.
- Agents MUST NOT override decisions owned by another agent.
- Conflicts are resolved by updating specs, not by improvisation.

### III. No Manual Coding

- All implementation MUST be performed via Claude Code.
- Agents may generate prompts, plans, and validation logic.
- Humans may only trigger agents and review outputs.
- Any manual code change invalidates the workflow.

## Agent Authority Model

### Spec Writer Agent

- **Owns**: what is built.
- Writes and updates all specs.
- MUST NOT write architecture or code.

### Architecture Planner Agent

- **Owns**: system design and security.
- Defines auth, trust boundaries, and data isolation.
- MUST NOT write implementation code.

### Database Engineer Agent

- **Owns**: data models and persistence.
- Defines schema, constraints, and indexes.
- MUST NOT write application logic.

### Backend Engineer Agent

- **Owns**: FastAPI implementation.
- MUST follow specs exactly.
- MUST enforce JWT verification and user isolation.

### Frontend Engineer Agent

- **Owns**: Next.js frontend.
- MUST integrate Better Auth and JWT propagation.
- MUST follow UI and API specs strictly.

### Integration Agent

- **Owns**: end-to-end correctness.
- Validates frontend-backend-database behavior.
- Reports inconsistencies; MUST NOT fix them directly.

## Security Constitution (Non-Negotiable)

Every rule below is non-negotiable. Any violation is a **critical failure**.

- Frontend is **untrusted**.
- Backend MUST verify JWT on every request.
- User identity is derived **only** from JWT.
- API MUST NEVER trust `user_id` from request body or query params.
- All database queries MUST be filtered by authenticated user.
- Requests without a valid JWT MUST return `401 Unauthorized`.

## API Rules

- RESTful conventions only.
- Stateless requests only.
- Authorization via `Authorization: Bearer <JWT>` header.
- Endpoints MUST behave identically regardless of client.
- API behavior MUST match `specs/api/*.md` exactly.

## Data Rules

- Each task belongs to exactly one user.
- Users can only access their own tasks.
- Ownership enforcement MUST exist at:
  - **Query level** — SELECT queries filtered by user.
  - **Update level** — UPDATE queries scoped to user.
  - **Delete level** — DELETE queries scoped to user.

## Workflow Enforcement

All work MUST follow this order. Skipping steps is forbidden.

1. Write or update specs.
2. Review specs for completeness.
3. Generate implementation plan.
4. Break plan into atomic tasks.
5. Implement using Claude Code.
6. Validate against acceptance criteria.

## Change Management

- Requirement changes → update specs first.
- Architecture changes → update architecture spec.
- Schema changes → update database schema spec.
- No silent deviations are allowed.

## Governance

- This constitution supersedes all other practices and conventions.
- Amendments require:
  1. A documented rationale.
  2. Approval from the project owner.
  3. A migration plan for affected artifacts.
- All agents MUST verify compliance with this constitution before
  producing any artifact.
- Version follows semantic versioning (MAJOR.MINOR.PATCH):
  - MAJOR: backward-incompatible governance or principle changes.
  - MINOR: new principles or materially expanded guidance.
  - PATCH: clarifications, wording, or typo fixes.
- Compliance review: every spec, plan, and task MUST include a
  constitution check confirming adherence to all principles.

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05
