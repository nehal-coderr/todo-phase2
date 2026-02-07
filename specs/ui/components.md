# Components Specification: Frontend UI

**Feature Branch**: `001-frontend-ui-spec`
**Created**: 2026-02-05
**Status**: Draft

## Overview

This document defines every reusable UI component, its purpose,
conceptual props, visual behavior, and interaction states. Components
are organized from layout-level down to atomic elements.

---

## Layout Components

### AppLayout

**Purpose**: Wraps all authenticated pages with a consistent header
and content area.

**Props**:
- `children` — the page content to render inside the layout.

**Visual Behavior**:
- Full-viewport height. Header is fixed to the top.
- Content area is centered horizontally with a max-width of 960px
  and horizontal padding on smaller screens.
- No sidebar in Phase II.
- Responsive: on mobile (<768px), the header collapses to a
  compact bar with a hamburger menu if needed, but for Phase II
  the header is simple enough to remain inline.

**Interaction States**:
- Static — no interactive states on the layout itself.

---

### Header

**Purpose**: Persistent top bar showing the application identity and
user controls.

**Props**:
- `userEmail` — the authenticated user's email (displayed on the
  right side).

**Visual Behavior**:
- Horizontal bar spanning full width.
- Left: application name/logo (clickable, navigates to
  `/dashboard`).
- Right: user email (truncated with ellipsis if long), sign-out
  button.
- Subtle bottom border or shadow to separate from content.
- On mobile: application name and sign-out icon only; email is
  hidden.

**Interaction States**:
- **Default**: All elements visible.
- **Hover (logo/name)**: Cursor changes to pointer; subtle color
  shift.
- **Hover (sign-out)**: Button highlight.

---

### AuthLayout

**Purpose**: Wraps the sign-in and sign-up pages with a centered
card layout on a neutral background.

**Props**:
- `children` — the form content.

**Visual Behavior**:
- Full-viewport height with centered card.
- Card has a white background, rounded corners, and a subtle shadow.
- Card max-width: 420px. Responsive: on mobile, card spans full
  width with horizontal padding.
- Application name/logo centered above the card.

**Interaction States**:
- Static.

---

## Task Components

### TaskCard

**Purpose**: Displays a single task summary in the dashboard list.

**Props**:
- `title` — the task's title text.
- `status` — "pending" or "completed".
- `createdAt` — the task's creation date.
- `onEdit` — callback when the edit action is triggered.
- `onDelete` — callback when the delete action is triggered.
- `onClick` — callback when the card body is clicked (navigate to
  detail).

**Visual Behavior**:
- Horizontal card with padding. White background, subtle border or
  shadow.
- Left section: title text (single line, truncated with ellipsis if
  overflow) and creation date below in muted text.
- Right section: StatusBadge, then edit and delete icon buttons.
- Completed tasks: title has a strikethrough style and muted text
  color to visually de-emphasize.
- Cards are stacked vertically with consistent spacing (8-12px gap).

**Interaction States**:
- **Default**: Card at rest with normal styling.
- **Hover**: Subtle background color change or border highlight.
  Cursor changes to pointer.
- **Edit icon hover**: Icon color changes to primary blue.
- **Delete icon hover**: Icon color changes to danger red.
- **Disabled** (during delete): Card has reduced opacity while the
  delete request is in progress.

---

### TaskList

**Purpose**: Renders a vertical list of TaskCard components.

**Props**:
- `tasks` — array of task objects.
- `onEdit` — callback forwarded to each TaskCard.
- `onDelete` — callback forwarded to each TaskCard.
- `onClick` — callback forwarded to each TaskCard.

**Visual Behavior**:
- Vertical stack of TaskCards.
- Tasks are ordered by creation date (newest first).
- Responsive: cards span full available width.

**Interaction States**:
- Delegates all interaction to individual TaskCard components.

---

### TaskForm

**Purpose**: Shared form used for both creating and editing a task.

**Props**:
- `mode` — "create" or "edit".
- `initialValues` — pre-populated values (empty for create, task
  data for edit).
- `onSubmit` — callback with form data.
- `onCancel` — callback to dismiss the form.
- `isSubmitting` — whether a submission is in progress.

**Visual Behavior**:
- Title field: single-line text input, required. Label: "Title".
  Placeholder: "Enter task title". Character counter showing
  current/max (e.g., "0/200").
- Description field: multi-line textarea, optional. Label:
  "Description". Placeholder: "Add a description (optional)".
  Character counter: "0/2000".
- Status toggle (edit mode only): checkbox or switch labeled
  "Mark as completed".
- Submit button: "Create Task" (create mode) or "Save Changes"
  (edit mode).
- Cancel button: always present, navigates back without saving.
- Fields are stacked vertically with consistent label spacing.

**Interaction States**:
- **Default**: Fields empty or pre-populated, submit enabled.
- **Focus**: Active field has a visible focus ring (blue border).
- **Validation error**: Red border on invalid field, red error text
  below the field. Error text disappears when the user corrects the
  input.
- **Submitting**: Submit button shows spinner and label changes
  ("Creating..." or "Saving..."). All fields and buttons are
  disabled.
- **Disabled (cancel during submit)**: Cancel button disabled while
  submission is in flight.

---

### TaskDetail

**Purpose**: Read-only display of a single task's full information.

**Props**:
- `title` — the task title.
- `description` — the task description (may be empty).
- `status` — "pending" or "completed".
- `createdAt` — creation date.
- `updatedAt` — last-modified date.

**Visual Behavior**:
- Title displayed as a large heading with the StatusBadge inline.
- Description displayed as a text block below the title. If empty,
  display muted italic text: "No description provided."
- Metadata row below description: "Created [date]" and "Modified
  [date]" in muted text.
- Action buttons below metadata: "Edit" (secondary), "Delete"
  (danger).

**Interaction States**:
- Static display; interaction is on the buttons (see Button
  component).

---

## Feedback Components

### StatusBadge

**Purpose**: Visual indicator of a task's current status.

**Props**:
- `status` — "pending" or "completed".

**Visual Behavior**:
- Small pill-shaped badge with rounded corners.
- Pending: amber/yellow background, dark text, label "Pending".
- Completed: green background, dark text, label "Completed".
- Fixed width to prevent layout shifts between states.

**Interaction States**:
- Static — no interactive states.

---

### Toast

**Purpose**: Non-intrusive notification for success, error, and
informational messages.

**Props**:
- `message` — the text to display.
- `variant` — "success", "error", or "info".
- `duration` — auto-dismiss time (default: 4 seconds for success,
  persistent for error until dismissed).

**Visual Behavior**:
- Positioned at the top-right of the viewport, stacked if multiple.
- Slides in from the right with a subtle animation.
- Success: green left border, checkmark icon.
- Error: red left border, warning icon.
- Info: blue left border, info icon.
- Close button (X) on the right side of each toast.
- Auto-dismisses after `duration` unless the user hovers over it
  (pause auto-dismiss on hover).

**Interaction States**:
- **Entering**: Slide-in animation (200ms).
- **Visible**: Static with close button.
- **Hover**: Auto-dismiss timer pauses; close button highlights.
- **Exiting**: Fade-out animation (150ms).

---

### ConfirmationModal

**Purpose**: Blocks user action until they explicitly confirm or
cancel a destructive operation.

**Props**:
- `title` — modal heading (e.g., "Delete Task").
- `message` — descriptive text (e.g., "Are you sure you want to
  delete '{taskTitle}'? This action cannot be undone.").
- `confirmLabel` — text for the confirm button (e.g., "Delete").
- `cancelLabel` — text for the cancel button (e.g., "Cancel").
- `variant` — "danger" (red confirm button) or "warning" (amber).
- `onConfirm` — callback when confirmed.
- `onCancel` — callback when cancelled.
- `isProcessing` — whether the action is in progress.

**Visual Behavior**:
- Centered card overlaying a dimmed backdrop.
- Modal card: white background, rounded corners, max-width 480px.
- Title at the top (bold), message below, buttons at the bottom
  right.
- Confirm button uses the variant color (red for danger).
- Cancel button is secondary/ghost style.
- Backdrop click dismisses the modal (same as cancel).
- Escape key dismisses the modal.

**Interaction States**:
- **Default**: Both buttons enabled.
- **Processing**: Confirm button shows spinner and is disabled.
  Cancel button is disabled. Backdrop click is disabled.
- **Hover (confirm)**: Darker shade of variant color.
- **Hover (cancel)**: Subtle background highlight.

---

### EmptyState

**Purpose**: Displayed when a list has no items, guiding the user
toward the next action.

**Props**:
- `icon` — an illustrative icon or small graphic.
- `heading` — primary text (e.g., "No tasks yet").
- `subtext` — secondary guidance text.
- `actionLabel` — button text (e.g., "Create Task").
- `onAction` — callback when the button is clicked.

**Visual Behavior**:
- Centered vertically and horizontally within the content area.
- Icon above the heading, muted color.
- Heading in medium-weight font, normal size.
- Subtext in smaller, muted font below the heading.
- Action button (primary style) below the subtext.

**Interaction States**:
- Button follows PrimaryButton interaction states.

---

### ErrorState

**Purpose**: Displayed when a data fetch fails, providing a retry
mechanism.

**Props**:
- `message` — user-readable error text.
- `onRetry` — callback for the retry button.

**Visual Behavior**:
- Centered in the content area.
- Warning or error icon above the message.
- Message in normal text.
- "Try Again" button below (secondary style).

**Interaction States**:
- Button follows SecondaryButton interaction states.

---

## Skeleton Components

### TaskCardSkeleton

**Purpose**: Placeholder displayed while task data is loading.

**Props**: None.

**Visual Behavior**:
- Same dimensions and layout as TaskCard.
- Title area: rectangular pulsing gray bar (60-80% width).
- Date area: smaller pulsing bar (30% width).
- Badge area: small pulsing pill shape.
- Action icons: small pulsing circles.
- Pulsing animation: smooth opacity oscillation between 40% and
  100% on a 1.5-second cycle.

**Interaction States**:
- Non-interactive. No hover effects. Cursor is default.

---

### TaskFormSkeleton

**Purpose**: Placeholder displayed while loading task data for the
edit form.

**Props**: None.

**Visual Behavior**:
- Same layout as TaskForm.
- Label areas: small pulsing bars.
- Input areas: full-width pulsing rectangles matching input heights.
- Button areas: pulsing rectangles matching button dimensions.
- Same pulsing animation as TaskCardSkeleton.

**Interaction States**:
- Non-interactive.

---

### TaskDetailSkeleton

**Purpose**: Placeholder displayed while loading task detail data.

**Props**: None.

**Visual Behavior**:
- Title: large pulsing bar (50% width).
- Badge: small pulsing pill.
- Description: 3-4 pulsing bars of varying widths (100%, 90%, 70%).
- Metadata: two small pulsing bars side by side.
- Same pulsing animation.

**Interaction States**:
- Non-interactive.

---

## Atomic / Primitive Components

### PrimaryButton

**Purpose**: Main call-to-action button for affirmative actions
(create, save, sign in).

**Props**:
- `label` — button text.
- `onClick` — click callback.
- `disabled` — whether the button is disabled.
- `loading` — whether to show a loading spinner.
- `fullWidth` — whether the button spans the full container width.

**Visual Behavior**:
- Solid background in the primary brand color (blue).
- White text, medium font weight, rounded corners.
- Minimum width: 120px. Padding: 12px horizontal, 10px vertical.
- When `loading`: spinner icon replaces or precedes the label text.
- When `fullWidth`: spans 100% of the parent container.

**Interaction States**:
- **Default**: Primary color background, white text.
- **Hover**: Slightly darker background.
- **Active/Pressed**: Even darker background, slight inward shadow.
- **Focus**: Visible focus ring (2px offset, primary color).
- **Disabled**: Reduced opacity (50%), cursor not-allowed.
- **Loading**: Spinner visible, label may change, pointer-events
  disabled.

---

### SecondaryButton

**Purpose**: Alternative actions (cancel, back, secondary
navigation).

**Props**: Same as PrimaryButton.

**Visual Behavior**:
- Transparent or light gray background with a border.
- Text in the primary brand color or dark gray.
- Same dimensions and rounding as PrimaryButton.

**Interaction States**:
- **Default**: Light background, dark text, subtle border.
- **Hover**: Slightly darker background fill.
- **Active/Pressed**: Darker background.
- **Focus**: Visible focus ring.
- **Disabled**: Reduced opacity, cursor not-allowed.
- **Loading**: Spinner visible if applicable.

---

### DangerButton

**Purpose**: Destructive actions (delete, remove).

**Props**: Same as PrimaryButton.

**Visual Behavior**:
- Solid red background, white text.
- Same dimensions and rounding as PrimaryButton.

**Interaction States**:
- **Default**: Red background, white text.
- **Hover**: Darker red.
- **Active/Pressed**: Even darker red.
- **Focus**: Focus ring in red.
- **Disabled**: Reduced opacity, cursor not-allowed.
- **Loading**: Spinner visible.

---

### TextInput

**Purpose**: Single-line text input field with label and validation.

**Props**:
- `label` — the field label text.
- `placeholder` — placeholder text.
- `value` — current value.
- `onChange` — change callback.
- `error` — error message to display (if any).
- `maxLength` — maximum character count.
- `required` — whether the field is required.
- `disabled` — whether the field is disabled.

**Visual Behavior**:
- Label above the input in medium-weight text.
- Input: full-width, border, rounded corners, inner padding.
- Placeholder text in muted color.
- Required indicator: red asterisk after the label.
- Character counter below the input on the right side when
  `maxLength` is set, showing "currentLength/maxLength". Counter
  turns red when within 10% of the limit.
- Error message below the input on the left side in red text.

**Interaction States**:
- **Default**: Gray border, white background.
- **Focus**: Blue border, subtle blue shadow/ring.
- **Error**: Red border, red error text below. Focus ring is red.
- **Disabled**: Light gray background, muted text, cursor
  not-allowed.

---

### TextArea

**Purpose**: Multi-line text input for longer content (descriptions).

**Props**: Same as TextInput, plus:
- `rows` — number of visible text rows (default: 4).

**Visual Behavior**:
- Same styling conventions as TextInput but taller.
- Vertically resizable (user can drag to resize), with a minimum
  height matching `rows`.

**Interaction States**:
- Same as TextInput.

---

### IconButton

**Purpose**: Small icon-only button for inline actions (edit, delete
in task cards).

**Props**:
- `icon` — the icon to display (conceptual: "pencil", "trash").
- `ariaLabel` — accessible label for screen readers.
- `onClick` — click callback.
- `variant` — "default", "primary", "danger".
- `disabled` — whether the button is disabled.

**Visual Behavior**:
- Square button with an icon centered inside. No visible background
  or border at rest.
- Size: 32x32px. Icon size: 16-20px.

**Interaction States**:
- **Default**: Icon in muted gray color.
- **Hover**: Background appears (light circle), icon changes to
  variant color (blue for primary, red for danger).
- **Active/Pressed**: Darker background circle.
- **Focus**: Visible focus ring.
- **Disabled**: Reduced opacity, cursor not-allowed.

---

## Data & State Behavior

### Loading Behavior
- All data-fetching pages MUST display skeleton components (not
  spinners) while waiting for API responses.
- Skeletons MUST match the dimensions of the real content to prevent
  layout shifts when data arrives.
- The pulsing animation MUST be smooth and subtle (opacity-based,
  not color-shifting).

### Empty State Behavior
- The dashboard MUST display the EmptyState component when the
  user has zero tasks.
- The empty state MUST include guidance text and a direct action
  button to create the first task.
- Empty states MUST NOT display the word "error" or imply something
  is broken.

### Error Behavior
- API errors MUST surface via the ErrorState component in the
  content area (for page-level errors) or via a Toast (for action-
  level errors like failed create/update/delete).
- Error messages MUST be user-readable. Raw status codes, exception
  names, or stack traces MUST NOT be displayed.
- Page-level errors MUST include a "Try Again" retry button.
- Action-level errors (toast) MUST persist until dismissed by the
  user.

### Optimistic Update Feel
- When a task is created, the user SHOULD be redirected to the
  dashboard where the new task is visible after a fresh fetch. No
  client-side optimistic insertion is required for Phase II, but
  the redirect + refetch SHOULD feel near-instant.
- When a task is deleted, the removal SHOULD feel immediate. The
  card MAY briefly show a disabled/fading state before disappearing
  after confirmation of server success.
- When a task is updated, the redirect to dashboard SHOULD show the
  updated values immediately via a fresh data fetch.

### Success Feedback
- Create, edit, and delete operations MUST display a success Toast
  after completion.
- Success toasts auto-dismiss after 4 seconds.
- Toast messages:
  - Create: "Task created"
  - Edit: "Task updated"
  - Delete: "Task deleted"
