# Step 3: Import PDF Books & Generate a Reading Plan

## Goal

Add a personal library feature that lets users import their own PDF textbooks, generate reading plans based on their goals and constraints, and read PDFs in a browser-based reader with bookmarks and progress tracking.

## New Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/library` | LibraryDashboard | Library grid with stats, empty state, import button |
| `/library/import` | ImportPage | Upload PDFs, process metadata, set reading strategy |
| `/library/:id` | LibraryBookDetails | Book details with progress, plan, bookmarks |
| `/library/:id/read` | PDFReaderPage | Full PDF reader with toolbar, sidebars, plan |

## New Dependencies

| Package | Purpose |
|---------|---------|
| `react-pdf` | PDF rendering via pdf.js |
| `zustand` | Lightweight state management |
| `dexie` | IndexedDB wrapper for local persistence |
| `date-fns` | Date utilities |

## Data Layer

### IndexedDB Schema (Dexie)

```
books       - id, title, author, importedAt, lastOpened, pageCount, pdfData, thumbnail, metadata, outline
bookmarks   - id, bookId, page, title, color, createdAt
progress    - bookId, currentPage, percentage, totalPagesRead, totalReadingTimeMs, sessionsCompleted, lastVisit
plans       - id, bookId, goal, minutesPerDay, targetDate, preferredDays, dailyPages, estimatedDays, sessions
```

### Zustand Stores

**useLibrary** — Books CRUD, import jobs

| State/Action | Type | Purpose |
|---|---|---|
| `books` | `ImportedBook[]` | All imported books |
| `importJobs` | `ImportJob[]` | Active imports |
| `loadBooks()` | async | Load from IndexedDB |
| `addBook(book)` | async | Save to IndexedDB + state |
| `removeBook(id)` | async | Delete from IndexedDB + state |
| `updateBook(id, updates)` | async | Partial update |

**useReader** — Reader state, progress, bookmarks, plan

| State/Action | Type | Purpose |
|---|---|---|
| `currentPage` | number | Current page in reader |
| `zoom` | number | Zoom level (0.5–3) |
| `sidebarsOpen` | {left, right} | Sidebar visibility |
| `progress` | BookProgress | Loaded progress |
| `bookmarks` | BookBookmark[] | Book bookmarks |
| `plan` | ReadingPlan | Current reading plan |
| `saveProgress()` | async | Persist to IndexedDB |

## TypeScript Types

All defined in `src/types/library.ts`:

| Type | Purpose |
|------|---------|
| `ImportedBook` | Full book with pdfData, thumbnail, outline |
| `BookOutline` | PDF outline with recursive children |
| `ReadingGoal` | `'finish-quickly'` \| `'study-deeply'` \| `'casual'` \| `'exam-prep'` |
| `ReadingPlan` | Plan with sessions, daily pages, target date |
| `ReadingSession` | Individual session (start/end page, review, completed) |
| `BookBookmark` | Bookmark with page, title, color |
| `BookProgress` | Progress with reading time, sessions completed |
| `ReadingAnalytics` | Aggregated stats |
| `ImportJob` | Upload job status |

## Services

### PDF Service (`src/services/pdfService.ts`)

| Function | Purpose |
|----------|---------|
| `processPDF(file)` | Extract metadata, thumbnail, outline from PDF file |
| `generateThumbnail(pdfDoc, scale)` | Render first page to canvas as thumbnail |
| `extractOutline(pdfDoc)` | Parse PDF outline into `BookOutline[]` |
| `estimateReadingTime(pages)` | Calculate estimated reading time string |

### Reading Plan Service (`src/services/readingPlanService.ts`)

| Function | Purpose |
|----------|---------|
| `generateReadingPlan(book, goal, minutesPerDay, preferredDays)` | Generate a full reading plan with sessions |
| `dailyPagesForGoal(goal, pageCount, minutesPerDay)` | Calculate daily page count based on goal |

**Goal-based behavior:**
- `finish-quickly` — 2x pages/day, heavy weekdays
- `study-deeply` — 0.5x pages/day, includes review sessions
- `casual` — 1x pages/day, evenly distributed
- `exam-prep` — 1.5x pages/day, deadline-focused

## Components Created

### Library Components (`src/components/library/`)

| Component | Purpose |
|-----------|---------|
| `PDFUploader` | Drag & drop zone + file picker for PDF upload |
| `LibraryCard` | Book card with progress, bookmarks count, menu |
| `ReadingStrategySetup` | 3-step wizard: Goal → Time → Days |
| `ReaderPreferencesComponent` | Zoom and fit mode controls |
| `AnalyticsCards` | 4-card stats row (pages read, time, bookmarks, avg session) |

### UI Components Used

| Component | Source |
|-----------|--------|
| `ProgressBar` | From Step 2 |
| `Button` | From Step 2 |
| `Breadcrumb` | From Step 2 |

## Pages

### LibraryDashboard (`/library`)

**Empty state:** illustration + "Import Your First Book" CTA

**With books:** Stats row (Books, Reading, Pages) + responsive grid of `LibraryCard`

### ImportPage (`/library/import`)

**Flow:**
1. `PDFUploader` — drag/drop or click to select PDFs
2. Processing — PDF metadata extracted via `processPDF()`
3. `ReadingStrategySetup` — choose goal, time per day, preferred days
4. Plan generated → book saved to IndexedDB → redirect to book details

**File list:** Shows pending files with processing status (spinner, checkmark, error)

### LibraryBookDetails (`/library/:id`)

**Layout:**
```
Breadcrumb
Book Header (thumbnail, title, author, meta)
Progress Card (percentage, currentPage, totalPages)
Action Buttons (Continue Reading, Create Plan, Bookmarks, Delete)
Reading Plan Card (daily pages, sessions, schedule)
Bookmarks List (clickable → jump to page)
```

### PDFReaderPage (`/library/:id/read`)

**Three-Column Layout:**

| Left Sidebar | Center Content | Right Panel |
|-------------|---------------|-------------|
| Back link | Toolbar (menu, page nav, zoom, bookmark) | Tabs: Progress / Bookmarks / Settings |
| Book title + progress | PDF Document (`react-pdf`) | Progress stats |
| Today's goal from plan | Page turn controls | Bookmark list |
| PDF outline | Zoom in/out | Reader preferences |
| Bookmarks list | | |

**Features:**
- Page navigation (prev/next)
- Zoom controls (0.5x–3x)
- Bookmark creation (with custom title)
- Progress auto-saved to IndexedDB
- Right panel with progress stats, bookmark management, fit mode settings
- Responsive: sidebars become slide-out drawers on mobile

## Responsive Design

| Breakpoint | Dashboard | Import | Book Details | Reader |
|------------|-----------|--------|-------------|--------|
| > 1024px | 3-column grid | Full layout | Full layout | Three columns |
| 768-1024px | 2-column grid | Stacked | Stacked meta | Sidebars slide |
| < 768px | 1-column grid | Stacked | Stacked | Sidebars drawer + mobile toolbar |

## Animations (Framer Motion)

- Dashboard cards fade-in on mount
- Library cards slide up on viewport entry
- Import page file list stagger entrance
- Reading strategy wizard slide transitions
- Reader content fade on page change

## Build Result

```
File sizes after gzip:
  423.15 kB  build/static/js/main.6019e562.js
  10.07 kB   build/static/css/main.5acffa4a.css
  2.63 kB    build/static/js/496.1b2d8f25.chunk.js
```

## Files Created

| File | Purpose |
|------|---------|
| `src/types/library.ts` | All TypeScript interfaces for library feature |
| `src/services/database.ts` | Dexie IndexedDB setup (4 tables) |
| `src/services/pdfService.ts` | PDF processing (metadata, thumbnails, outline) |
| `src/services/readingPlanService.ts` | Reading plan generation |
| `src/hooks/useLibrary.ts` | Zustand store for library state |
| `src/hooks/useReader.ts` | Zustand store for reader state |
| `src/components/library/PDFUploader.tsx` | Drag & drop PDF upload |
| `src/components/library/LibraryCard.tsx` | Library book card |
| `src/components/library/ReadingStrategySetup.tsx` | 3-step wizard |
| `src/components/library/ReaderPreferences.tsx` | Reader zoom/fit controls |
| `src/components/library/AnalyticsCards.tsx` | Stats cards |
| `src/pages/ImportPage.tsx` | PDF import page |
| `src/pages/LibraryDashboard.tsx` | Library dashboard |
| `src/pages/LibraryBookDetails.tsx` | Imported book details |
| `src/pages/PDFReaderPage.tsx` | PDF reader |
| `src/pages/PDFReaderPage.css` | Reader styles |

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added 4 library routes |
| `src/components/layout/Navbar.tsx` | Added "Library" nav link |

## What's NOT Implemented (Future Milestones)

- PDF text search within reader
- Annotation/highlighting
- Note-taking per page
- Reading session timer
- Streak tracking
- Reading analytics charts
- Export bookmarks/notes
- Multiple reader themes
- Sync across devices
- AI reading summaries

## Next Steps

- Add PDF text search
- Implement page annotation/highlighting
- Add note-taking functionality
- Build reading session timer with streak tracking
- Create analytics dashboard with charts
- Add reader theme customization
