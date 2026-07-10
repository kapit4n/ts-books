# Step 5: Adaptive Desktop Reading Experience

## Goal

Redesign the PDF reader to maximize readability on desktop. Collapsible sidebars, three reading modes, better zoom, fullscreen, keyboard shortcuts, and persistent preferences. The PDF should always be the primary focus.

## Reading Modes

| Mode | Left Sidebar | PDF | Right Sidebar | Toolbar |
|------|-------------|-----|---------------|---------|
| Standard | User preference | Primary | User preference | Full |
| Focus | Hidden | Full viewport | Hidden | Minimal (auto-hide) |
| Study | Open | Primary | Open | Full |

## Implementation Checklist

### Phase 1: Types + Store
- [x] Add `ReadingMode` type (`'standard' | 'focus' | 'study'`)
- [x] Add `FitMode` type (`'width' | 'height' | 'actual'`)
- [x] Expand `ReaderPreferences` with readingMode, sidebar states, lastPage
- [x] Add `readingMode` state to useReader store
- [x] Change `fitMode` from `'width' | 'page'` to `FitMode`
- [x] Add `enterFocusMode()` / `exitFocusMode()` / `toggleFocusMode()`
- [x] Add `setLeftSidebar(open)` / `setRightSidebar(open)`
- [x] Add `savePreferences()` / `loadPreferences()` (localStorage)
- [x] Load preferences in `setCurrentBook`

### Phase 2: Toolbar Rewrite
- [x] Group controls: Navigation | View | Panels | Utilities
- [x] Replace static page info with editable page input
- [x] Add zoom % dropdown with presets
- [x] Add Fit Width / Fit Height buttons
- [x] Add left sidebar toggle button
- [x] Add right sidebar toggle button
- [x] Add focus mode toggle button
- [x] Add fullscreen button
- [x] Add theme toggle button
- [x] Style toolbar groups with dividers

### Phase 3: Reading Modes & Layout
- [x] CSS: sidebars use `width: 0` + transition when closed
- [x] CSS: sidebars expand to 280px/260px when open
- [x] CSS: `.reader-focus` class hides both sidebars
- [x] CSS: `.reader-study` class forces both sidebars open
- [x] Focus mode: minimal toolbar (hide panel buttons)
- [x] Focus mode: auto-hide toolbar after 3s inactivity
- [x] Focus mode: show toolbar on mouse move

### Phase 4: Zoom Controls
- [x] Define zoom presets constant (Fit Width, Fit Height, Actual, 75-200%)
- [x] Build zoom dropdown/popover component
- [x] Implement Ctrl+Mouse Wheel zoom on viewer
- [x] Implement keyboard +/- zoom
- [x] Implement Fit Width calculation (container width / page width)
- [x] Implement Fit Height calculation (container height / page height)
- [x] Smooth zoom transitions via CSS

### Phase 5: Fullscreen
- [x] `requestFullscreen()` / `exitFullscreen()` API
- [x] Listen for `fullscreenchange` event
- [x] Update icon state (Maximize/Minimize)
- [x] CSS: reader takes 100vh in fullscreen
- [x] Hide app Navbar in fullscreen

### Phase 6: Keyboard Shortcuts
- [x] Arrow Left/Right: prev/next page
- [x] Home/End: first/last page
- [x] +/-: zoom in/out
- [x] 0: reset zoom
- [x] F: toggle focus mode
- [x] F11: toggle fullscreen
- [x] B: toggle left sidebar
- [x] R: toggle right sidebar
- [x] Escape: close search/bookmark form
- [x] Show shortcuts reference in Settings tab

### Phase 7: Reader Preferences Persistence
- [x] Save zoom, fitMode, readingMode, sidebar states to localStorage
- [x] Save lastPage on progress save
- [x] Load preferences on reader mount
- [x] localStorage key: `'ts-books-reader-prefs'`

### Phase 8: Animations
- [x] Sidebar width transition (0.3s ease)
- [x] Focus mode enter/exit transition
- [x] Zoom dropdown slide animation
- [x] Toolbar auto-hide fade
- [x] Zoom change smooth scale

## Files Modified

| File | Phase | Changes |
|------|-------|---------|
| `src/types/library.ts` | 1 | Add ReadingMode, FitMode. Expand ReaderPreferences. |
| `src/hooks/useReader.ts` | 1,7 | Add modes, fitMode expansion, focus toggle, persistence |
| `src/pages/PDFReaderPage.tsx` | 2,3,4,5,6 | Toolbar rewrite, modes, zoom, fullscreen, shortcuts |
| `src/pages/PDFReaderPage.css` | 2,3,4,5,8 | Layout, transitions, focus mode, toolbar groups |

## Reading Mode Behaviors

### Standard Mode
- Sidebars follow user toggle state
- Full toolbar
- Default mode on load

### Focus Mode
- Both sidebars hidden
- Toolbar auto-hides after 3s (reappears on mouse move)
- PDF uses 90-95% viewport width
- Press `F` or click focus button to toggle
- Minimal distractions

### Study Mode
- Both sidebars forced open
- Full toolbar
- Left sidebar: outline, bookmarks, today's goal
- Right sidebar: progress, notes placeholder
- Optimized for active learning

## Zoom Behavior

| Action | Effect |
|--------|--------|
| Fit Width | Zoom = containerWidth / pageWidth |
| Fit Height | Zoom = containerHeight / pageHeight |
| Actual Size | Zoom = 1.0 |
| Preset % | Zoom = preset / 100 |
| Ctrl+Wheel | Zoom +/- 0.1 per tick |
| Keyboard +/- | Zoom +/- 0.1 |
| Keyboard 0 | Reset to 1.0 |

Zoom is clamped to [0.25, 5.0].

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Left | Previous page |
| Arrow Right | Next page |
| Home | First page |
| End | Last page |
| + / = | Zoom in |
| - | Zoom out |
| 0 | Reset zoom to 100% |
| F | Toggle Focus Mode |
| F11 | Toggle Fullscreen |
| B | Toggle left sidebar |
| R | Toggle right sidebar |
| Escape | Close active panel/form |

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| > 1024px | Sidebars inline, percentage widths |
| 768-1024px | Sidebars slide-over overlays |
| < 768px | Sidebars full-screen drawers, bottom toolbar |

## Build Result

```
File sizes after gzip:
  426.66 kB  build/static/js/main.[hash].js
  11.47 kB   build/static/css/main.[hash].css
  2.63 kB    build/static/js/496.[hash].chunk.js
```

## Progress Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2026-07-10 | Phase 1 | ✅ | Types + Store — ReadingMode, FitMode, useReader rewrite |
| 2026-07-10 | Phase 2 | ✅ | Toolbar — grouped sections, page input, zoom dropdown |
| 2026-07-10 | Phase 3 | ✅ | Sidebar transitions, Focus/Study CSS classes |
| 2026-07-10 | Phase 4 | ✅ | Zoom presets, Ctrl+Wheel, Fit Width/Height |
| 2026-07-10 | Phase 5 | ✅ | Fullscreen API, icon toggle |
| 2026-07-10 | Phase 6 | ✅ | All keyboard shortcuts |
| 2026-07-10 | Phase 7 | ✅ | localStorage persistence |
| 2026-07-10 | Phase 8 | ✅ | Sidebar transitions, focus mode, zoom dropdown animation |
