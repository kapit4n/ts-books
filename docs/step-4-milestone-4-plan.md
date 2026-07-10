# Milestone 4 — Complete PDF Reading Experience

## Implementation Plan

---

## Overview

This milestone transforms the existing PDF import/reader into a polished, Kindle-like reading experience. The plan is organized into 8 phases, ordered by dependency. Each phase builds on the previous.

**Current state:** Basic PDF import, metadata extraction, 3-step reading plan wizard, PDF viewer with bookmarks, basic progress tracking (naive +1 min per save), sidebar shortcuts.

**Target state:** Complete reading workflow with real-time session tracking, text search, outline navigation, reader preferences persistence, reading history, session summaries, reading status badges, and a 5-step plan wizard.

---

## Phase 1: Data Layer & Types (Foundation)

Everything else depends on these. Do first.

### 1.1 — Expand Types (`src/types/library.ts`)

Add/modify:

```typescript
// Reading session for tracking actual time spent
interface ReadingSessionRecord {
  id: string;
  bookId: string;
  startTime: string;        // ISO timestamp
  endTime: string | null;   // null while in progress
  durationMs: number;       // calculated on end
  pagesRead: number;        // pages advanced during session
  startPage: number;
  endPage: number;
  averageSpeed: number;     // pages per minute
  completed: boolean;
}

// Reading status for books
type ReadingStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';

// Search result from PDF text layer
interface PDFSearchResult {
  pageIndex: number;
  pageNumber: number;
  text: string;
  matchIndex: number;
  matchLength: number;
}

// Reader preferences (expand existing)
// Add: theme, sidebarVisibility, readingMode to existing type
// Existing: zoom, fitMode, theme, pageSpacing, continuousScroll
// Keep as-is, will be used by reader
```

**Modify existing `ReaderPreferences`:**
- Already has: `zoom, fitMode, theme, pageSpacing, continuousScroll`
- No changes needed — this covers all reader settings

**Modify existing `ReadingAnalytics`:**
- Already has: `booksImported, totalPagesRead, currentStreak, readingHours, completionRate, avgSessionMinutes`
- No changes needed — will be computed from session data

### 1.2 — Expand Dexie Schema (`src/services/database.ts`)

Add new table:

```typescript
this.version(2).stores({
  books: 'id, title, author, importedAt, lastOpened',
  bookmarks: 'id, bookId, page, createdAt',
  progress: 'bookId, lastVisit',
  plans: 'id, bookId, createdAt',
  sessions: 'id, bookId, startTime, endTime'  // NEW
}).upgrade(/* migrate v1 → v2 if needed */);
```

- `sessions` table stores `ReadingSessionRecord` objects
- Indexed by `bookId` for querying sessions per book

### 1.3 — New Service: Reading Session Service (`src/services/readingSessionService.ts`)

Functions:
| Function | Purpose |
|----------|---------|
| `startSession(bookId, startPage)` | Create a new session record with `startTime`, return session ID |
| `endSession(sessionId, endPage)` | Calculate duration, pagesRead, speed, mark completed |
| `getActiveSession(bookId)` | Find uncompleted session for a book |
| `getSessionsForBook(bookId)` | All sessions for a book (sorted by date) |
| `getTodaySession(bookId)` | Get today's session if exists |
| `getReadingStats(bookId)` | Compute pagesRead, totalTime, avgSpeed from sessions |
| `getGlobalStats()` | Compute across all books: total hours, streak, completion rate |

### 1.4 — New Service: Reader Service (`src/services/readerService.ts`)

A facade that coordinates reading state:
| Function | Purpose |
|----------|---------|
| `openBook(bookId)` | Load progress + bookmarks + plan + preferences, start session |
| `closeBook(bookId, currentPage)` | End session, save progress, update lastOpened |
| `getReadingStatus(book)` | Derive status from progress (not-started / in-progress / completed / paused) |
| `getContinueAction(book, progress)` | Return button label + target page |
| `getPageTarget(bookId, page)` | Get page to navigate to (for "continue reading") |

### 1.5 — Expand useReader Hook (`src/hooks/useReader.ts`)

Add to the Zustand store:

| New State/Action | Purpose |
|---|---|
| `currentSessionId: string \| null` | Active session ID |
| `sessionStartTime: number \| null` | When current session started (for timer) |
| `searchQuery: string` | Current search query |
| `searchResults: PDFSearchResult[]` | Search results |
| `searchIndex: number` | Which result is focused |
| `readerTheme: 'light' \| 'dark' \| 'sepia'` | Override theme within reader |
| `startSession()` | Calls readingSessionService.startSession |
| `endSession()` | Calls readingSessionService.endSession |
| `searchInPDF(query)` | Placeholder — actual search uses pdf.js API |
| `navigateSearchResult(direction)` | Next/prev result |

### 1.6 — New Hook: useReadingSession (`src/hooks/useReadingSession.ts`)

Custom hook (not Zustand store — uses `useEffect` + ref):

```typescript
function useReadingSession(bookId: string) {
  // Tracks elapsed time via setInterval (every 10 seconds)
  // Starts session on mount
  // Ends session on unmount (via beforeunload + cleanup)
  // Returns: { elapsed, pagesReadThisSession, isTracking }
}
```

- Uses `setInterval` every 10 seconds to update elapsed time
- Saves progress every 30 seconds (not every page change)
- Ends session on `beforeunload` event and component unmount
- Uses `useRef` for timer to avoid stale closures

---

## Phase 2: Enhanced Import Flow

### 2.1 — Processing Screen (`src/pages/ImportPage.tsx`)

Replace the current simple spinner with a step-by-step animated processing screen:

When a file is being processed, show:
```
✓ Reading metadata
✓ Extracting pages  
✓ Detecting table of contents
✓ Calculating reading time
✓ Preparing reader
○ Generating reading plan    ← current step
○ Saving to library
```

Each step animates in sequence with a checkmark when complete. Use `framer-motion` for staggered entrance and checkmark animation.

**Implementation:**
- Add `processingStep` state to `ImportPage` (0-6)
- Map each `processPDF` callback to a step number
- After PDF processing, cycle through steps 4-6 as plan generates and saves
- Use `AnimatePresence` + `motion.div` for step transitions

### 2.2 — Reading Plan Wizard Expansion (`src/components/library/ReadingStrategySetup.tsx`)

Expand from 3 steps to 5:

| Step | Title | Content |
|------|-------|---------|
| 1 | Reading Goal | 5 options: Finish Quickly, Study Carefully, Daily Habit, Exam Prep, Custom |
| 2 | Daily Reading Time | 6 presets: 15/30/45/60/90 min + Custom input |
| 3 | Reading Schedule | Day-of-week toggles (Mon-Sun) |
| 4 | Target Date | Optional date picker. If set, auto-calculate pages/day. If not, auto-estimate completion. |
| 5 | Review Plan | Show: pages/session, sessions count, completion date, weekly schedule preview. Allow editing previous steps. |

**Component changes:**
- Add `step4` and `step5` to the wizard state machine
- Step 4: `<input type="date">` with optional toggle
- Step 5: Summary cards showing calculated stats + "Edit" buttons to go back
- Add a "Skip" option on step 4 (sets no target date)
- Update `onComplete` signature to include `targetDate: string | null`

### 2.3 — Import Page Quick Actions Enhancement

Update the quick actions grid at the bottom of ImportPage:
- "Recent Imports" → anchor scroll to `#recent-imports`
- "Import Another PDF" → reset uploader state (don't reload page)
- "Browse Library" → `/library`
- "Continue Reading" → most recently opened book

---

## Phase 3: Reader Core Enhancements

### 3.1 — Outline Navigation (Fix existing)

The outline items in the left sidebar currently render but have no `onClick`. Wire them up:

- Each outline item calls `setPage(item.pageNumber)` on click
- Highlight the currently visible outline item based on `currentPage`
- Scroll outline list to keep active item visible

### 3.2 — PDF Text Search

Add search functionality using `pdf.js` text layer:

**New component: `src/components/library/ReaderSearch.tsx`**
- Input field with prev/next navigation arrows
- Calls `page.getTextContent()` for each page (or all pages)
- Highlights matches in the text layer
- Shows results as "Page X: ...snippet..."
- Click result → navigate to that page

**Integration in PDFReaderPage:**
- Add search button to toolbar (opens search panel in right sidebar or inline)
- Use `react-pdf`'s `Page.getTextContent()` API
- Search across all pages (with loading state for large PDFs)
- Highlight matches with CSS class on text layer spans

### 3.3 — Page Jump Input

Add a direct page number input in the toolbar:
- Replace the static "Page X of Y" with an editable input
- On Enter or blur, navigate to that page
- Validate: clamp to 1..totalPages

### 3.4 — Keyboard Shortcuts

Add keyboard event listener in PDFReaderPage:

| Key | Action |
|-----|--------|
| `ArrowLeft` / `ArrowUp` | Previous page |
| `ArrowRight` / `ArrowDown` | Next page |
| `Home` | First page |
| `End` | Last page |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom to 1.0 |
| `f` | Toggle fullscreen |
| `b` | Toggle left sidebar |
| `Escape` | Close search / Close bookmark form |

### 3.5 — Fullscreen Mode

Add fullscreen toggle to toolbar:
- Use `document.documentElement.requestFullscreen()` API
- Show `Maximize` / `Minimize` icon based on state
- Handle `fullscreenchange` event to update icon
- Auto-exit fullscreen on unmount

### 3.6 — Continuous Scroll Mode

Add toggle between single-page and continuous scroll:
- Single page (current): renders one `<Page>` at a time
- Continuous: renders all pages in a scrollable container
- Store preference in `ReaderPreferences.continuousScroll`
- Toggle button in toolbar or settings panel

**Implementation note:** For continuous mode, render pages in a virtual list (only render visible pages + buffer) to avoid performance issues with large PDFs.

### 3.7 — Reader Theme

Add theme options within the reader (independent of global dark mode):
- Light (white background)
- Dark (dark background, light text)
- Sepia (warm background)

Apply via CSS class on the viewer container:
- `.reader-theme-light` — default
- `.reader-theme-dark` — `background: #1a1a2e; color: #e0e0e0`
- `.reader-theme-sepia` — `background: #f4ecd8; color: #5c4b37`

---

## Phase 4: Progress & Session Tracking

### 4.1 — Real-Time Session Timer (`src/hooks/useReadingSession.ts`)

Replace the naive +1-min-per-save with actual time tracking:

```
On reader mount:
  1. Create session record (startTime = now)
  2. Start setInterval every 10 seconds → update elapsed
  3. Start setInterval every 30 seconds → save progress to Dexie
  
On page change:
  1. Calculate pages advanced this session
  2. Update session record

On unmount / beforeunload:
  1. End session (endTime = now, calculate duration, pages, speed)
  2. Save final progress
  3. Clear intervals
```

### 4.2 — Session Summary Modal (`src/components/library/SessionSummary.tsx`)

When leaving the reader, show a summary:

```
┌─────────────────────────────────┐
│        Reading Session          │
│                                 │
│  Duration        32 minutes     │
│  Pages Read      12 pages       │
│  Current Page    58 of 420      │
│  Progress        13%            │
│  Speed           0.38 pages/min │
│                                 │
│  [Continue Later]  [Close]      │
└─────────────────────────────────┘
```

Show via `useEffect` cleanup or a "Reading complete" trigger.

### 4.3 — Reading Progress Tracking (Enhance existing)

Update `useReader.saveProgress` to use actual session data:
- `totalReadingTimeMs`: accumulate from sessions (not +60000)
- `sessionsCompleted`: increment on session end
- `totalPagesRead`: max of all session end pages
- `percentage`: currentPage / totalPages * 100

### 4.4 — Continue Reading Logic

When opening a book that has progress > 0:
- `LibraryCard` button shows "Continue Reading" instead of "Start Reading"
- `LibraryBookDetails` primary action: "Continue Reading" → navigates to `/library/:id/read`
- On reader mount, restore: last page, zoom, fit mode, sidebar state, bookmarks
- Use `useReader.loadProgress` which already sets `currentPage` from saved progress

### 4.5 — Reading Status Badge

Add status derivation to `ReaderService`:
```typescript
function getReadingStatus(book, progress): ReadingStatus {
  if (!progress || progress.percentage === 0) return 'not-started';
  if (progress.percentage === 100) return 'completed';
  // Check if last session was > 7 days ago
  const daysSinceLastVisit = /* calculate */;
  if (daysSinceLastVisit > 7) return 'paused';
  return 'in-progress';
}
```

Display as colored badge on `LibraryCard` and `LibraryBookDetails`:
- Not Started: gray
- In Progress: blue
- Completed: green
- Paused: yellow/amber

### 4.6 — Primary Action Button Logic

Determine button text and action:

| Progress | Button | Navigates To |
|----------|--------|--------------|
| 0% | Start Reading | Page 1 |
| 1-99% | Continue Reading | Last read page |
| 100% | Read Again | Page 1 |

Apply to: `LibraryCard`, `LibraryBookDetails`

---

## Phase 5: Library Enhancements

### 5.1 — Library Card Enhancements (`src/components/library/LibraryCard.tsx`)

Add to each card:
- Reading status badge (colored dot or label)
- "Last opened X ago" relative time
- Plan info (if exists): "18 pages/day · finishes Aug 10"
- Fix "Start/Continue Reading" button logic per Phase 4.6

### 5.2 — Library Dashboard Enhancements

- Wire up the search input to filter books by title/author
- Wire up sort dropdown: by last opened, by title, by progress, by import date
- Show reading history section: "Recently Read" (top 3 books by lastOpened)
- Show "Books In Progress" section
- Show "Completed Books" section

### 5.3 — LibraryBookDetails Enhancements

- Show reading status badge
- Fix primary action button (Start/Continue/Read Again)
- Show reading statistics from sessions (total time, sessions count, avg speed)
- Show "Continue Reading" navigates to last read page
- Show completion date if completed
- Add "Reading History" section showing recent sessions

### 5.4 — Reading History Page (Optional — can be section in Dashboard)

Add to library dashboard or as a separate tab:
- "Recently Read" — last 5 books by lastOpened
- "Books In Progress" — all books with 0 < progress < 100
- "Completed Books" — all books with progress = 100
- Each shows: cover, title, progress, last session date

---

## Phase 6: Reader UI Polish

### 6.1 — Daily Reading Goal Display

In the left sidebar, show today's objective more prominently:

```
Today's Goal
Pages 58–74
17 Pages
≈ 22 Minutes

████████░░░░  58%
```

- Pull from reading plan sessions
- Find today's session (match day of week)
- Show page range, page count, estimated time
- Progress bar for today's goal

### 6.2 — Right Sidebar Enhancements

Update the right panel tabs:

**Progress tab:**
- Circular progress indicator (CSS conic-gradient)
- Statistics cards (reuse `AnalyticsCards` component)
- Reading sessions list

**Bookmarks tab:**
- Already functional, keep as-is

**Settings tab:**
- Reader theme selector (Light/Dark/Sepia)
- Fit mode toggle (Fit Width/Fit Page)
- Continuous scroll toggle
- Sidebar visibility toggles
- Use `ReaderPreferencesComponent` (already exists, wire it in)

### 6.3 — Reader Toolbar Enhancement

Add missing toolbar buttons:
- `Maximize` / `Minimize` (fullscreen toggle)
- `Search` icon (opens search panel)
- `Palette` icon (theme selector dropdown)
- Page number input (editable, replaces static text)

### 6.4 — Loading & Empty States

- PDF loading: spinner with "Loading PDF..." text
- PDF error: friendly error with retry button
- No bookmarks: "No bookmarks yet" with hint
- No outline: "No table of contents" message
- Empty search: "Type to search within this book"

---

## Phase 7: Animations & Accessibility

### 7.1 — Framer Motion Animations

| Element | Animation |
|---------|-----------|
| Import processing steps | Staggered fade-in + slide-right for each step |
| Checkmark on step complete | Scale 0→1 with spring |
| Session summary modal | Backdrop fade + modal slide-up |
| Status badges | Color transition on status change |
| Reader sidebar open/close | Slide + opacity |
| Bookmark form | Slide-down from toolbar |
| Search results list | Staggered fade-in |
| Progress circle | Animated fill on mount |
| Toolbar buttons | Hover scale (whileHover) |
| Page change | Subtle fade between pages |
| Settings panel | Fade transition on tab switch |

### 7.2 — Accessibility

- All buttons: `aria-label` attributes
- Reader: `role="document"` on PDF container
- Search: `role="search"` on search panel
- Keyboard shortcuts: documented in settings panel
- Focus management: trap focus in modals, return focus on close
- Screen reader: announce page changes, bookmark additions
- High contrast: ensure all colors meet WCAG AA

---

## Phase 8: Responsive Design

### 8.1 — Desktop (≥1024px)
- Three-column reader layout (already implemented)
- Full toolbar with all controls
- Side-by-side search results

### 8.2 — Tablet (768–1024px)
- Sidebars become slide-in overlays (already implemented)
- Toolbar wraps naturally
- Grid layout for library cards: 2 columns

### 8.3 — Mobile (<768px)
- Fullscreen reader (sidebars hidden by default)
- Bottom toolbar: prev/page/next + bookmark + menu
- Swipe gestures for page turn (optional, via touch events)
- FAB visible (already implemented)
- Single column for library cards
- Drawer navigation for sidebar

---

## File Change Summary

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useReadingSession.ts` | Real-time session tracking hook |
| `src/services/readingSessionService.ts` | Session CRUD + stats computation |
| `src/services/readerService.ts` | Reader facade (open/close/status/actions) |
| `src/components/library/ReaderSearch.tsx` | PDF text search panel |
| `src/components/library/ReaderSearch.css` | Search styles |
| `src/components/library/SessionSummary.tsx` | Session summary modal |
| `src/components/library/SessionSummary.css` | Modal styles |
| `src/components/library/BookStatusBadge.tsx` | Reading status badge |
| `src/components/library/BookStatusBadge.css` | Badge styles |
| `src/components/library/ReadingGoalCard.tsx` | Daily goal display |
| `src/components/library/ReadingGoalCard.css` | Goal card styles |
| `src/components/library/ProgressCircle.tsx` | Circular progress indicator |
| `src/components/library/ProgressCircle.css` | Circle styles |

### Modified Files

| File | Changes |
|------|---------|
| `src/types/library.ts` | Add ReadingSessionRecord, PDFSearchResult, ReadingStatus |
| `src/services/database.ts` | Add sessions table, bump to version 2 |
| `src/services/pdfService.ts` | Fix outline page numbers (currently always 1) |
| `src/services/readingPlanService.ts` | Add targetDate calculation, review step support |
| `src/hooks/useLibrary.ts` | Add search, filter, sort methods |
| `src/hooks/useReader.ts` | Add session, search, theme, fullscreen state |
| `src/components/library/ReadingStrategySetup.tsx` | Expand to 5 steps |
| `src/components/library/ReadingStrategySetup.css` | Styles for steps 4-5 |
| `src/components/library/LibraryCard.tsx` | Status badge, relative time, plan info, button logic |
| `src/components/library/LibraryCard.css` | Badge, plan info styles |
| `src/components/library/AnalyticsCards.tsx` | Wire into reader right panel |
| `src/components/library/ReaderPreferences.tsx` | Add theme, continuous scroll, sidebar toggles |
| `src/pages/ImportPage.tsx` | Animated step-by-step processing screen |
| `src/pages/ImportPage.css` | Processing animation styles |
| `src/pages/LibraryDashboard.tsx` | Search, filter, sort, history sections |
| `src/pages/LibraryDashboard.css` | History section styles |
| `src/pages/LibraryBookDetails.tsx` | Status badge, session stats, continue logic |
| `src/pages/LibraryBookDetails.css` | Session stats, history styles |
| `src/pages/PDFReaderPage.tsx` | Search, keyboard shortcuts, fullscreen, session timer, continuous scroll, theme, page input, outline nav |
| `src/pages/PDFReaderPage.css` | All new reader styles |

---

## Implementation Order (Dependency Graph)

```
Phase 1: Data Layer
  ↓
Phase 2: Import Flow (depends on types + schema)
  ↓
Phase 3: Reader Core (depends on types + hooks)
  ↓
Phase 4: Progress & Sessions (depends on reader core + session service)
  ↓
Phase 5: Library Enhancements (depends on status + sessions + continue logic)
  ↓
Phase 6: Reader UI Polish (depends on reader core being stable)
  ↓
Phase 7: Animations (polish pass, can be done incrementally)
  ↓
Phase 8: Responsive (final pass, can be done incrementally)
```

**Estimated scope:**
- Phase 1: ~3 files changed/created
- Phase 2: ~3 files changed
- Phase 3: ~5 files changed/created
- Phase 4: ~6 files changed/created
- Phase 5: ~4 files changed
- Phase 6: ~5 files changed/created
- Phase 7: ~10 files for animation polish
- Phase 8: ~5 files for responsive fixes

**Total: ~12 new files, ~20 modified files**

---

## Build Result (Expected)

```
File sizes after gzip:
  ~440-460 kB  build/static/js/main.[hash].js   (+15-35 kB from new code)
  ~12-14 kB    build/static/css/main.[hash].css  (+1-3 kB from new styles)
  2.63 kB      build/static/js/496.[hash].chunk.js (unchanged)
```

---

## What's NOT Implemented

- AI summaries / recommendations
- Cloud sync
- OCR for scanned PDFs
- EPUB support
- Collaborative reading
- Quizzes / flashcards
- Code playgrounds
- User authentication
- Highlighting / annotations (notes panel is placeholder)
- Inline text selection actions (context menu)
- Book collections / folders (placeholder button exists)
