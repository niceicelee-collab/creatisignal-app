# Video Generation Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split script editing and video results into separate workflow steps, with step four owning current generation tasks and all completed video versions.

**Architecture:** Restore a four-step `StepId` model and make the selected step decide which workspace surface is visible. Keep render status and video-version state independent from navigation so users can return to script editing and then reopen the video-generation step without losing results.

**Tech Stack:** Next.js 16 App Router, React 19 client state, TypeScript, Tailwind CSS.

---

### Task 1: Restore the fourth workflow step

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Change `StepId` to `1 | 2 | 3 | 4`.
2. Rename step three to `脚本转写` and add step four `视频生成`.
3. Initialize completed, failed, and rendering projects on step four.
4. Verify navigation completion state uses step four as the final step.

### Task 2: Separate navigation state from render state

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Make steps one through three render their editing surfaces based on `step`.
2. Make step four render the first-generation progress view, results view, failure view, or in-result generation task.
3. Move to step four when generation starts and preserve completed results when returning to step three.
4. Show the footer only on editable steps one through three.

### Task 3: Remove the global history entry

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Remove the header `历史视频` button.
2. Remove its drawer state, open handler, drawer render, and unused drawer component.
3. Keep version selection in the step-four `历史结果` list.

### Task 4: Validate the workflow

**Files:**
- Test: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Run targeted ESLint and TypeScript checks.
2. Verify completed projects open on step four with history visible and no header history button.
3. Return to step three and confirm the script editor appears while step four remains accessible.
4. Start a new version, confirm automatic navigation to step four, and switch an older version while the new task is generating.
