# Step 4: PDF Import Entry Points

## Goal

Improve discoverability of the PDF import feature so users always know they can add their own books. Add navigation entry points across the app — Navbar, Library page, Reader sidebar, and Mobile FAB — all pointing to `/library/import`.

## Entry Points

| Location | Desktop | Mobile | Navigates To |
|----------|---------|--------|--------------|
| Navbar | Outlined "Import PDF" button with `Upload` icon | Icon link in mobile drawer | `/library/import` |
| Library Header | Toolbar with search, filter, sort, prominent "Import PDF" primary button | Stacked toolbar, full-width search | `/library/import` |
| Empty Library State | Circular icon, title, description, large CTA button, secondary "Browse Built-in Books" link | Same layout | CTA → `/library/import`, link → `/books` |
| Grid Action Bar | Import PDF (primary), Create Collection (placeholder), view toggle, sort | Stacked actions | `/library/import` |
| Mobile FAB | Not displayed | Fixed bottom-right 56px circle, `Upload` icon, spring animation | `/library/import` |
| Reader Sidebar | Shortcuts section: Library, Recent Books, Import PDF | Slide-out drawer shortcuts | `/library`, `/library/import` |
| Import Page Hero | Back breadcrumb, updated title/subtitle, format/size info below uploader | Same | N/A (already on import page) |
| Import Page Quick Actions | 4-card grid: Recent Imports, Import Another PDF, Browse Library, Continue Reading | 2x2 grid on mobile | Various (internal anchors, `/library`, `/library/:id/read`, reload) |

## What Changed

### Navbar (`src/components/layout/Navbar.tsx`)

- Added `Upload` icon import from lucide-react
- Desktop: Added outlined button in `navbar-right` before icon buttons with `Upload` icon + "Import PDF" label
- Mobile drawer: Added "Import PDF" link at the bottom of the navigation menu
- CSS: New `.navbar-import-btn` (outlined, border, hover → primary color), `.navbar-mobile-import` (primary color, icon + label)
- Mobile responsive: `.navbar-import-btn` hidden on `≤768px` (replaced by drawer link)

### LibraryDashboard (`src/pages/LibraryDashboard.tsx`)

**Header → Toolbar:**
- Left: Title + subtitle
- Right: Search input (`Search` icon), filter button (`SlidersHorizontal`), sort button (`ArrowUpDown`), prominent "Import PDF" primary button (`Upload`)
- Search input has focus border animation

**Empty State (no books):**
- Circular icon container (96px, primary-light background) with `BookOpen` icon
- Title: "Your Library is Empty"
- Description: "Import your first PDF and create your own personalized reading experience."
- Large primary CTA: "Import PDF" button
- Secondary link: "Browse Built-in Books" → `/books`
- Fade + scale entrance animation

**Grid Action Bar (books exist):**
- Left group: "Import PDF" (primary-filled), "Create Collection" (disabled placeholder)
- Right group: Grid view toggle (active state), Sort button
- Wrapped in a card-style container with border

**CSS (`src/pages/LibraryDashboard.css`):**
- `.library-toolbar` — flex row with left/right sections
- `.library-toolbar-search` — input container with search icon
- `.library-toolbar-btn` — icon-only buttons (filter, sort)
- `.library-action-bar` — flex row with left/right button groups
- `.library-action-primary` — filled primary variant
- `.library-action-active` — active/selected state
- `.library-empty-icon` — circular icon container
- `.library-empty-import-btn` — large CTA
- `.library-empty-browse` — secondary link
- Responsive: toolbar stacks at `≤968px`, action bar stacks at `≤480px`

### ImportPage (`src/pages/ImportPage.tsx`)

**Hero:**
- Back breadcrumb link: `← Library`
- Title: "Import PDF"
- Subtitle: "Build your personal learning library. Upload any PDF book and transform it into a structured reading experience."

**Format Info:**
- Below uploader: "Supported formats: **PDF** | Maximum size: **50MB**"
- Centered, small text, subtle styling

**Quick Actions (below uploader):**
- 4-card grid linking to:
  - Recent Imports → `#recent-imports` (anchor scroll)
  - Import Another PDF → page reload
  - Browse Library → `/library`
  - Continue Reading → most recent book's reader (`/library/:id/read`), or "Browse Built-in Books" → `/books` if empty
- Each card: icon + label, bordered, hover → primary color + light background

**CSS (`src/pages/ImportPage.css`):**
- `.import-hero` — flex column for breadcrumb + title + subtitle
- `.import-back-link` — breadcrumb-style back link
- `.import-format-info` — centered format/size metadata
- `.import-quick-actions` / `.import-quick-grid` — 4-column grid
- `.import-quick-card` — individual action card with icon + label
- Responsive: 2-column grid at `≤640px`

### PDFReaderPage (`src/pages/PDFReaderPage.tsx`)

**Sidebar Shortcuts (bottom of left sidebar):**
- New section: "Shortcuts"
- Links: Library (`BookOpen`), Recent Books (`FolderOpen`), Import PDF (`Upload`)
- Import PDF link highlighted in primary color
- Uses `margin-top: auto` to stick to bottom of sidebar

**CSS (`src/pages/PDFReaderPage.css`):**
- `.pdf-sidebar-shortcuts` — bottom-anchored section
- `.pdf-shortcut-item` — flex row link with icon + label
- `.pdf-shortcut-import` — primary-colored variant

### PDFUploader (`src/components/library/PDFUploader.tsx`)

- Updated format text from "PDF only" to "PDF only · Maximum size: 50MB"

### FloatingImportButton (New)

**`src/components/library/FloatingImportButton.tsx`:**
- Mobile-only floating action button
- Fixed position: bottom 24px, right 24px, z-index 900
- 56px circle, primary color, shadow (`0 4px 14px rgba(0,0,0,0.25)`)
- `Upload` icon (24px), no label
- Framer Motion: spring entrance animation (stiffness 260, damping 20, 0.3s delay)
- `whileHover` scale 1.1, `whileTap` scale 0.95
- ARIA label: "Import PDF"
- Navigates to `/library/import` on click

**`src/components/library/FloatingImportButton.css`:**
- `display: none` by default (hidden on desktop)
- At `≤768px`: `display: flex`, fixed positioning, full styles
- Hover, focus-visible states

### App.tsx

- Imported `FloatingImportButton`
- Rendered between `</main>` and `<Footer />` (always in DOM, CSS controls visibility)

## Responsive Design

| Breakpoint | Navbar | Library | Import Page | Reader Sidebar | FAB |
|------------|--------|---------|-------------|----------------|-----|
| > 768px | Import button in toolbar | Full toolbar, 3-col grid, horizontal action bar | 4-col quick actions | Always visible | Hidden |
| ≤ 768px | Import link in drawer | Stacked toolbar, 1-2 col grid, stacked action bar | 2-col quick actions | Slide-out drawer | Visible, fixed bottom-right |

## Animations (Framer Motion)

- Navbar import button: hover scale via CSS transition
- Library toolbar: fade-in + slide-up on mount
- Empty state: fade-in + scale entrance
- Grid action bar: fade-in + slide-up with delay
- Book cards: stagger entrance (0.05s × index)
- Import page hero: fade-in + slide-up
- Quick actions: fade-in + slide-up with delay
- FAB: spring animation (scale 0→1, opacity 0→1, 0.3s delay)
- FAB hover/tap: scale 1.1 / 0.95
- Quick action cards: border-color + background transition on hover
- Reader sidebar shortcuts: color transition on hover

## Accessibility

- All interactive elements have `aria-label` attributes
- Navbar import button: `aria-label="Import PDF"`
- Filter/sort buttons: `aria-label="Filter"`, `aria-label="Sort"`
- FAB: `aria-label="Import PDF"`
- Search input: `aria-label="Search books"`
- Keyboard focusable elements have `:focus-visible` outlines
- Semantic HTML: `<nav>`, `<main>`, `<a>`, `<button>`
- Quick action cards use `<button>` for actions and `<a>` for navigation

## Build Result

```
File sizes after gzip:
  424.4 kB  build/static/js/main.c141a15d.js
  10.96 kB  build/static/css/main.b72bc412.css
  2.63 kB   build/static/js/496.1b2d8f25.chunk.js
```

## Files Created

| File | Purpose |
|------|---------|
| `src/components/library/FloatingImportButton.tsx` | Mobile floating action button |
| `src/components/library/FloatingImportButton.css` | FAB styles with mobile-only visibility |

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Imported and mounted `FloatingImportButton` globally |
| `src/components/layout/Navbar.tsx` | Added "Import PDF" button (desktop) + mobile drawer link |
| `src/components/layout/Navbar.css` | Import button styles, mobile import link, responsive rules |
| `src/pages/LibraryDashboard.tsx` | Toolbar, improved empty state, grid action bar |
| `src/pages/LibraryDashboard.css` | Toolbar, action bar, empty state, responsive styles |
| `src/pages/ImportPage.tsx` | Hero with breadcrumb, format info, quick actions section |
| `src/pages/ImportPage.css` | Hero, format info, quick actions grid styles |
| `src/pages/PDFReaderPage.tsx` | Sidebar shortcuts (Library, Recent Books, Import PDF) |
| `src/pages/PDFReaderPage.css` | Sidebar shortcut styles |
| `src/components/library/PDFUploader.tsx` | Updated format text to include max size |

## What's NOT Implemented (Future Milestones)

- Actual search/filter/sort functionality (UI placeholders only)
- Create Collection (disabled placeholder button)
- View toggle between grid/list (single active state shown)
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
