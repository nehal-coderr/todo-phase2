---
id: 1
title: Hackathon Todo Constitution Ratified
stage: constitution
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: kk
command: /sp.constitution
labels: ["constitution", "governance", "security", "agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

This constitution defines the non-negotiable rules, boundaries, and workflow governing all agents participating in Phase II of the Hackathon Todo project.

All agents must operate in strict compliance with this constitution.

Core Principles
1. Spec-Driven Development Is Mandatory

Specifications are the source of truth

No implementation may begin without an approved spec

Specs must be written before plans, tasks, or code

If specs are unclear, agents must request clarification via spec updates

2. Separation of Responsibilities

Each agent has a single, well-defined role.

Agents must not perform tasks outside their assigned responsibility

Agents must not override decisions owned by another agent

Conflicts are resolved by updating specs, not by improvisation

3. No Manual Coding

All implementation must be performed via Claude Code

Agents may generate prompts, plans, and validation logic

Humans may only trigger agents and review outputs

Any manual code change invalidates the workflow

Agent Authority Model
Spec Writer Agent

Owns what is built

Writes and updates all specs

Cannot write architecture or code

Architecture Planner Agent

Owns system design and security

Defines auth, trust boundaries, and data isolation

Cannot write implementation code

Database Engineer Agent

Owns data models and persistence

Defines schema, constraints, and indexes

Cannot write application logic

Backend Engineer Agent

Owns FastAPI implementation

Must follow specs exactly

Must enforce JWT verification and user isolation

Frontend Engineer Agent

Owns Next.js frontend

Must integrate Better Auth and JWT propagation

Must follow UI and API specs strictly

Integration Agent

Owns end-to-end correctness

Validates frontend ↔ backend ↔ database behavior

Reports inconsistencies, never fixes them directly

Security Constitution (Non-Negotiable)

Frontend is untrusted

Backend must verify JWT on every request

User identity is derived only from JWT

API must never trust user_id from request body or query

All database queries must be filtered by authenticated user

Requests without valid JWT must return 401 Unauthorized

Any violation is considered a critical failure.

API Rules

RESTful conventions only

Stateless requests only

Authorization via:

Authorization: Bearer <JWT>


Endpoints must behave identically regardless of client

API behavior must match /specs/api/*.md exactly

Data Rules

Each task belongs to exactly one user

Users can only access their own tasks

Ownership enforcement must exist at:

Query level

Update level

Delete level

Workflow Enforcement

All work must follow this order:

Write or update specs

Review specs for completeness

Generate implementation plan

Break plan into atomic tasks

Implement using Claude Code

Validate against acceptance criteria

Skipping steps is forbidden.

Change Management

Requirement changes → update specs first

Architecture changes → update architecture spec

Schema changes → update database schema spec

No silent deviations are allowed

Success Criteria

The

## Response snapshot

Created constitution v1.0.0 for the Hackathon Todo project. Filled all template placeholders with the user-provided principles: (1) Spec-Driven Development, (2) Separation of Responsibilities, (3) No Manual Coding. Added sections for Agent Authority Model (6 agents), Security Constitution, API Rules, Data Rules, Workflow Enforcement, Change Management, and Governance. Ratified 2026-02-05. All dependent templates verified compatible. No follow-up TODOs.

## Outcome

- ✅ Impact: Constitution v1.0.0 ratified — foundational governance for all Phase II agents
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md (overwritten with completed constitution)
- 🔁 Next prompts: /sp.specify to write feature specs, /sp.plan for architecture
- 🧠 Reflection: User provided comprehensive input covering all sections; no clarifications needed

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
