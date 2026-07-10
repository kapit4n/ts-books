# Step 6: Advanced PDF Reading Modes

## Goal

Improve readability of imported PDF books by introducing multiple reading modes optimized for desktop screens.

The current reader displays a single PDF page centered on screen. For programming books and technical documentation this leaves too much unused space and forces unnecessary zooming.

---

## Reading Modes

### Standard

Current behavior. Single page, centered.

### Book Mode

Display two consecutive PDF pages side by side.

```
Page 6 | Page 7
```

Navigation advances two pages at a time. If the document has an odd number of pages, the last page occupies the left side.

### Column Mode

Split a single PDF page into two reading columns displayed side by side.

```
Page 6
┌───────────────┬───────────────┐
│ Left half     │ Right half    │
│ of page       │ of page       │
└───────────────┴───────────────┘
```

Reading order: Left column → Right column → Next page. Maximizes readability on large desktop screens by using available width efficiently.

### Focus Mode

Hide left sidebar, right sidebar, and most toolbar actions. Expand the PDF to nearly the entire viewport.

---

## Implementation Checklist

### Phase 1: Types + Store

- [ ] Change `ReadingMode` from `'standard' | 'focus' | 'study'` to `'standard' | 'book' | 'column' | 'focus'`
- [ ] Keep `FitMode` as `'width' | 'height' | 'actual'`
- [ ] Add `columnSide: 'left' | 'right'` state to useReader (for Column Mode navigation)
- [ ] Update `setReadingMode` logic: `'book'`/`'column'` close sidebars like focus, `'standard'` restores
- [ ] Add `toggleColumnSide()` action
- [ ] Add `nextColumn()` / `prevColumn()` actions (handles page transitions)
- [ ] Add `fitToContainer(width, height, pageWidth, pageHeight)` helper that computes and sets zoom
- [ ] Add `containerWidth` and `containerHeight` state (updated by ResizeObserver)
- [ ] Remove `'study'` mode references from store

### Phase 2: FitMode + ResizeObserver

- [ ] Add `ResizeObserver` on `.pdf-viewer-wrapper` to track container dimensions
- [ ] Store `containerWidth` and `containerHeight` in store (or local state in reader)
- [ ] Implement `computeFitScale(fitMode, containerW, containerH, pageW, pageH)`:
  - `'width'`: `containerW / pageW`
  - `'height'`: `containerH / pageH`
  - `'actual'`: `1.0`
- [ ] When `fitMode` changes or container resizes, recompute zoom
- [ ] Column Mode defaults to `fitMode: 'width'`

### Phase 3: Book Mode Rendering

- [ ] Add conditional rendering in PDFReaderPage: when `readingMode === 'book'`, render two `<Page>` components side by side
- [ ] Left page: `pageNumber={currentPage}`, Right page: `pageNumber={currentPage + 1}`
- [ ] Right page hidden (CSS) when `currentPage + 1 > totalPages`
- [ ] Navigation: next = `setPage(currentPage + 2)`, prev = `setPage(Math.max(1, currentPage - 2))`
- [ ] Click on right page = next spread, click on left page = prev spread
- [ ] Both pages share the same `scale={zoom}` prop
- [ ] Gap between pages: `var(--space-md)`
- [ ] CSS: `.pdf-book-mode` container uses `display: flex; gap; justify-content: center; align-items: flex-start`

### Phase 4: Column Mode Rendering

- [ ] Create `ColumnRenderer` custom renderer component using `usePageContext()` from react-pdf
- [ ] `ColumnRenderer` uses `page.getViewport({ scale })` and `page.render()` to draw full page to an offscreen canvas
- [ ] From the offscreen canvas, draw left half to left canvas and right half to right canvas using `drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)`
- [ ] Column Mode renders `<Page renderMode="custom" customRenderer={ColumnRenderer} scale={zoom}>` plus two `<canvas>` elements
- [ ] Left column canvas: `overflow: hidden`, half-width container
- [ ] Right column canvas: `overflow: hidden`, half-width container
- [ ] Both columns displayed side by side in a flex row
- [ ] Navigation: ArrowRight/Down when `columnSide === 'left'` → switch to `'right'`. When `columnSide === 'right'` → next page, reset to `'left'`
- [ ] ArrowLeft/Up when `columnSide === 'right'` → switch to `'left'`. When `columnSide === 'left'` → prev page, reset to `'right'`
- [ ] Column position indicator: small pill showing "Left | Right" in toolbar
- [ ] Disable text layer in Column Mode (`renderTextLayer={false}` on the hidden `<Page>`)

### Phase 5: Focus Mode Refinement

- [ ] Focus mode: hide both sidebars, force `leftSidebarOpen: false`, `rightSidebarOpen: false`
- [ ] Focus mode: toolbar auto-hides after 3s (already implemented)
- [ ] Focus mode: viewer padding expanded, background changes (already implemented)
- [ ] Focus mode: prevent sidebar toggle while in focus mode
- [ ] Focus mode: pressing F exits focus mode

### Phase 6: Toolbar Updates

- [ ] Replace 3 mode buttons (Standard/Focus/Study) with 4 mode buttons (Standard/Book/Column/Focus)
- [ ] Add column position indicator pill in toolbar when `readingMode === 'column'`
- [ ] Column indicator shows "Left" / "Right" with click to toggle
- [ ] Mode buttons: icons — Standard (`File`), Book (`BookOpen`), Column (`Columns`), Focus (`Focus`)
- [ ] Active mode button highlighted with primary color

### Phase 7: Keyboard Shortcuts

- [ ] `1` = Standard mode
- [ ] `2` = Book mode
- [ ] `3` = Column mode
- [ ] `4` = Focus mode
- [ ] `F` = Toggle Focus mode
- [ ] `←`/`→` = Standard: prev/next page. Book: prev/next spread. Column: switch column / next page
- [ ] `↑`/`↓` = Column Mode: switch between columns
- [ ] Keep existing shortcuts: `+`/`-` zoom, `0` reset, `B` left sidebar, `R` right sidebar, `Home`/`End`, `Escape`

### Phase 8: Responsive Rules

- [ ] Desktop (> 1024px): all modes available
- [ ] Tablet (768–1024px): disable Book Mode, allow Column Mode
- [ ] Mobile (< 768px): Standard Mode only, auto-fallback
- [ ] On mode disable: show toast/fallback message, switch to Standard
- [ ] Detect breakpoint via `window.matchMedia` or ResizeObserver

### Phase 9: Animations

- [ ] Mode transition: animate container width changes with CSS transition (0.3s ease)
- [ ] Book Mode: animate gap between pages on enter
- [ ] Column Mode: animate column split on enter
- [ ] Sidebar collapse/expand already animated (0.3s ease)
- [ ] No page flickering: keep existing page rendered until new mode is ready

### Phase 10: Reader Preferences Persistence

- [ ] Update `ReaderPreferences` interface: replace `readingMode: ReadingMode` (already exists, just new values)
- [ ] Add `columnSide: 'left' | 'right'` to persisted preferences
- [ ] Save on mode change, restore on book open
- [ ] localStorage key: `'ts-books-reader-prefs'` (unchanged)

---

## Files Modified

| File | Phases | Changes |
|------|--------|---------|
| `src/types/library.ts` | 1 | Change ReadingMode union, add columnSide |
| `src/hooks/useReader.ts` | 1,2,10 | New mode logic, column navigation, fitScale, container dimensions, persistence |
| `src/pages/PDFReaderPage.tsx` | 3,4,5,6,7,8 | Conditional rendering per mode, ColumnRenderer, toolbar, keyboard shortcuts |
| `src/pages/PDFReaderPage.css` | 3,4,5,8,9 | Book mode layout, column mode layout, responsive rules, animations |
| `src/components/library/ReaderPreferences.tsx` | 6 | Update mode buttons from 3 to 4 |

---

## Column Mode — Rendering Detail

Column Mode uses react-pdf's `renderMode="custom"` with a custom renderer component.

### Architecture

```
<Page renderMode="custom" customRenderer={ColumnRenderer} pageNumber={n} scale={zoom}>
  {/* text/annotation layers disabled for column mode */}
</Page>
<div className="pdf-column-viewer">
  <div className="pdf-column-half pdf-column-left">
    <canvas ref={leftCanvasRef} />
  </div>
  <div className="pdf-column-half pdf-column-right">
    <canvas ref={rightCanvasRef} />
  </div>
</div>
```

### ColumnRenderer Component

```tsx
import { usePageContext } from 'react-pdf';

function ColumnRenderer() {
  const ctx = usePageContext();
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ctx?.page || !leftRef.current || !rightRef.current) return;

    const viewport = ctx.page.getViewport({ scale: ctx.scale });
    const offscreen = document.createElement('canvas');
    offscreen.width = viewport.width;
    offscreen.height = viewport.height;

    ctx.page.render({
      canvasContext: offscreen.getContext('2d')!,
      viewport,
    }).promise.then(() => {
      const halfW = Math.floor(viewport.width / 2);
      // Left half
      const leftCtx = leftRef.current!.getContext('2d')!;
      leftRef.current!.width = halfW;
      leftRef.current!.height = viewport.height;
      leftCtx.drawImage(offscreen, 0, 0, halfW, viewport.height, 0, 0, halfW, viewport.height);
      // Right half
      const rightCtx = rightRef.current!.getContext('2d')!;
      rightRef.current!.width = viewport.width - halfW;
      rightRef.current!.height = viewport.height;
      rightCtx.drawImage(offscreen, halfW, 0, viewport.width - halfW, viewport.height, 0, 0, viewport.width - halfW, viewport.height);
    });
  }, [ctx?.page, ctx?.scale]);

  return null; // rendering is side-effect based
}
```

### Column Layout CSS

```css
.pdf-column-viewer {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  align-items: flex-start;
}

.pdf-column-half {
  overflow: hidden;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
}

.pdf-column-half canvas {
  display: block;
}
```

---

## Book Mode — Rendering Detail

Book Mode renders two `<Page>` components in a flex row.

```tsx
<div className="pdf-book-viewer">
  <div className="pdf-book-page">
    <Page pageNumber={currentPage} scale={zoom} />
  </div>
  {currentPage + 1 <= totalPages && (
    <div className="pdf-book-page">
      <Page pageNumber={currentPage + 1} scale={zoom} />
    </div>
  )}
</div>
```

### Book Layout CSS

```css
.pdf-book-viewer {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  align-items: flex-start;
}

.pdf-book-page {
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.pdf-book-page + .pdf-book-page {
  margin-left: var(--space-md);
}
```

---

## Navigation Logic Per Mode

### Standard Mode

```
ArrowLeft  → page - 1
ArrowRight → page + 1
Home       → page 1
End        → page totalPages
```

### Book Mode

```
ArrowLeft  → page - 2
ArrowRight → page + 2
Home       → page 1
End        → page totalPages (adjusted to even)
```

### Column Mode

```
ArrowRight → if columnSide === 'left' → columnSide = 'right'
             if columnSide === 'right' → page + 1, columnSide = 'left'
ArrowLeft  → if columnSide === 'right' → columnSide = 'left'
             if columnSide === 'left'  → page - 1, columnSide = 'right'
ArrowDown  → same as ArrowRight
ArrowUp    → same as ArrowLeft
Home       → page 1, columnSide = 'left'
End        → page totalPages, columnSide = 'right'
```

### Focus Mode

Same as Standard Mode (focus only affects UI visibility).

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1 | Standard mode |
| 2 | Book mode |
| 3 | Column mode |
| 4 | Focus mode |
| F | Toggle Focus mode |
| Arrow Left | Prev page/spread/column |
| Arrow Right | Next page/spread/column |
| Arrow Up | Column Mode: switch to left column |
| Arrow Down | Column Mode: switch to right column |
| Home | First page |
| End | Last page |
| + / = | Zoom in |
| - | Zoom out |
| 0 | Reset zoom to 100% |
| B | Toggle left sidebar |
| R | Toggle right sidebar |
| Escape | Close active panel/form |

---

## Responsive Rules

| Breakpoint | Book Mode | Column Mode | Standard | Focus |
|------------|-----------|-------------|----------|-------|
| > 1024px   | ✅        | ✅          | ✅       | ✅    |
| 768–1024px | ❌        | ✅          | ✅       | ✅    |
| < 768px    | ❌        | ❌          | ✅ only  | ✅    |

Fallback: if user is in a disabled mode, auto-switch to Standard. Show brief toast notification.

---

## Build Result (Expected)

```
File sizes after gzip:
  ~435-445 kB  build/static/js/main.[hash].js
  ~11.5 kB     build/static/css/main.[hash].css
  2.63 kB      build/static/js/496.[hash].chunk.js
```

---

## Progress Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2026-07-10 | Phase 1 | Done | Types + store updated |
| 2026-07-10 | Phase 2 | Done | ResizeObserver + computeFitScale |
| 2026-07-10 | Phase 3 | Done | Book Mode rendering |
| 2026-07-10 | Phase 4 | Done | Column Mode with canvasRef splitting |
| 2026-07-10 | Phase 5 | Done | Focus Mode refinement |
| 2026-07-10 | Phase 6 | Done | Toolbar: 4 mode buttons + column pill |
| 2026-07-10 | Phase 7 | Done | Keyboard shortcuts 1-4 + nav per mode |
| 2026-07-10 | Phase 8 | Done | Responsive breakpoints |
| 2026-07-10 | Phase 9 | Done | CSS transitions |
| 2026-07-10 | Phase 10 | Done | columnSide persistence |
