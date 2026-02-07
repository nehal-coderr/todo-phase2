# Database Schema Specification

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft

## Overview

This specification defines the database schema for the Phase II Todo
application backend. The database is Neon Serverless PostgreSQL,
accessed via SQLModel ORM. This document specifies tables, columns,
constraints, indexes, and data rules — not SQL or ORM code.

## Tables

### tasks

The `tasks` table stores all task records for all users.

| Column      | Type                     | Nullable | Default                | Description                     |
|-------------|--------------------------|----------|------------------------|---------------------------------|
| id          | UUID                     | No       | Server-generated UUID  | Primary key                     |
| user_id     | String                   | No       | None (from JWT)        | Owner's user ID (from JWT sub)  |
| title       | String (max 200)         | No       | None (required)        | Task title                      |
| description | String (max 2000)        | Yes      | null                   | Optional task description       |
| completed   | Boolean                  | No       | false                  | Completion status               |
| created_at  | Timestamp with timezone  | No       | Current UTC time       | Record creation timestamp       |
| updated_at  | Timestamp with timezone  | No       | Current UTC time       | Last modification timestamp     |

### Column Details

#### id (Primary Key)

- Type: UUID (universally unique identifier).
- Generated server-side before insertion.
- Immutable once created.
- Used in API URLs as the task identifier.

#### user_id (Foreign Reference)

- Type: String (matches Better Auth's user ID format).
- Set from the authenticated JWT `sub` claim on creation.
- Immutable once created — a task cannot change owners.
- NOT a traditional foreign key (no `users` table in backend DB).
  The backend trusts the JWT-verified user ID without a local user
  table.
- Indexed for query performance (see Indexing Strategy below).

#### title

- Type: String with maximum length of 200 characters.
- Required; cannot be null or empty.
- Stored after trimming leading/trailing whitespace.

#### description

- Type: String with maximum length of 2000 characters.
- Nullable. Null means no description was provided.
- Stored as-is (no trimming applied to description).

#### completed

- Type: Boolean.
- Defaults to `false` on creation.
- Mapped to API status: `false` = "pending", `true` = "completed".

#### created_at

- Type: Timestamp with timezone.
- Set to current UTC time on insertion.
- Never modified after creation.
- Used for default sort order (descending).

#### updated_at

- Type: Timestamp with timezone.
- Set to current UTC time on insertion.
- Updated to current UTC time on every modification.

## Constraints

### Primary Key

- `id` is the primary key of the `tasks` table.
- Uniqueness is guaranteed by UUID generation + PK constraint.

### Not Null Constraints

- `id`: NOT NULL
- `user_id`: NOT NULL
- `title`: NOT NULL
- `completed`: NOT NULL
- `created_at`: NOT NULL
- `updated_at`: NOT NULL

### String Length Constraints

- `title`: maximum 200 characters.
- `description`: maximum 2000 characters (when not null).

### No Foreign Key Constraint on user_id

- The backend does NOT maintain a `users` table. User accounts are
  managed by Better Auth on the frontend.
- `user_id` is a string that references an external identity system.
- Referential integrity is enforced by the authentication layer
  (only verified JWT user IDs reach the database), not by a
  database foreign key.

## Indexing Strategy

### Primary Index

- `id` (UUID) — primary key index, automatically created.

### User Ownership Index

- **Index on `user_id`**: Every query filters by `user_id`. This
  index is critical for performance.
- Type: B-tree index on the `user_id` column.
- This is the most important secondary index in the schema.

### Sorting Index

- **Composite index on (`user_id`, `created_at` DESC)**: Optimizes
  the most common query pattern — listing all tasks for a user
  ordered by creation date.
- This composite index covers both the WHERE clause (`user_id`) and
  the ORDER BY clause (`created_at DESC`) in a single index scan.

### Index Summary

| Index Name                  | Columns                        | Type   | Purpose                        |
|-----------------------------|--------------------------------|--------|--------------------------------|
| pk_tasks                    | id                             | PK     | Primary key lookup             |
| ix_tasks_user_id            | user_id                        | B-tree | Ownership filtering            |
| ix_tasks_user_id_created_at | user_id, created_at DESC       | B-tree | List query optimization        |

## Data Rules

### Ownership

- Each task belongs to exactly one user, identified by `user_id`.
- A task's `user_id` is set once on creation and never changes.
- Cross-user access is forbidden: no query may return tasks belonging
  to a different user than the authenticated one.

### Isolation Enforcement

- **SELECT queries**: MUST include `WHERE user_id = :auth_user_id`.
- **UPDATE queries**: MUST include `WHERE id = :task_id AND user_id = :auth_user_id`.
- **DELETE queries**: MUST include `WHERE id = :task_id AND user_id = :auth_user_id`.
- **INSERT queries**: MUST set `user_id = :auth_user_id`.
- No query may operate on tasks without a `user_id` filter.

### Deletion Behavior

- **Hard delete**: Tasks are permanently removed from the database
  on deletion.
- No soft delete column (e.g., `deleted_at`) exists in Phase II.
- No recycle bin or undo capability at the database level.
- Deletion is irreversible.

### Timestamp Management

- `created_at` and `updated_at` are managed server-side.
- The application layer (not the database) sets these values to
  ensure consistency with the ORM.
- UTC timezone is always used.

## Data Volume Assumptions (Phase II)

- Expected task count per user: low hundreds (no pagination needed).
- Expected total users: small scale (hackathon context).
- No archival or partitioning strategy needed for Phase II.
- If scaling is required later, the `user_id` index and composite
  index provide a solid foundation for query performance.

## Schema Evolution Notes

- The schema is designed to be the minimal viable schema for Phase II.
- Future additions (categories, priorities, due dates) would add
  columns to the `tasks` table.
- The `user_id` column and indexing strategy support multi-tenant
  scaling without schema changes.
- No migration tooling is specified for Phase II; schema is created
  at application startup.

## Constitution Compliance

This specification adheres to `.specify/memory/constitution.md` v1.0.0:

- Data Rules: Each task belongs to one user, cross-user access
  forbidden, ownership enforced at query/update/delete levels.
- Security Constitution: user_id from JWT only, all queries filtered
  by authenticated user.
- Separation of Responsibilities: Database Engineer scope — schema
  and constraints only, no application logic.
