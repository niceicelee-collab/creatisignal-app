# Video History While Editing Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep previously generated mock videos visible and usable after the user returns to edit the script, and append each new render as a new version.

**Architecture:** Keep mock video versions in `ReplicateBetaWorkspace` instead of inside the result view. Treat render progress, script editing, and video history as separate UI state, then expose the shared history through the result view and a right-side drawer.

**Tech Stack:** Next.js 16 App Router, React 19 client state, TypeScript, Tailwind CSS, Lucide icons.

---

### Task 1: Hoist mock video version state

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Add a typed mock video-version model and initial versions for completed projects.
2. Keep `videoVersions` and `selectedVersionId` in the workspace component.
3. When mock rendering completes, prepend a new version and keep older versions unchanged.
4. Verify TypeScript and ESLint accept the new state flow.

### Task 2: Preserve history during script editing

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Change “返回修改脚本” to enter editing mode without clearing video versions.
2. Add a compact notice above the script showing that the latest successful version remains available.
3. Change the step-three CTA to “生成新版本” when history exists.
4. Verify editing a voiceover marks the draft as changed while the old video remains playable.

### Task 3: Add the history entry and drawer

**Files:**
- Modify: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Add a “历史视频 N” action in the workspace header when versions exist.
2. Add an accessible right-side drawer with preview, download action, metadata, and selectable version rows.
3. Reuse the same selected-version state in the full result view and drawer.
4. Verify opening, switching versions, playing, downloading, backdrop close, and close-button behavior.

### Task 4: Validate the affected route

**Files:**
- Test: `src/components/replicate/beta/replicate-beta-workspace.tsx`

1. Run `npx.cmd eslint src/components/replicate/beta/replicate-beta-workspace.tsx` and expect exit code 0.
2. Inspect the actual local route for a completed beta project.
3. Click “返回修改脚本”, confirm the history entry remains visible, open the drawer, switch versions, and confirm the old video is still available.
4. Trigger a mock generation and confirm a new version is added without replacing earlier versions.
