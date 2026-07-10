# Step 1: Landing Page Redesign

## Goal

Transform the ts-books homepage from a simple book list into a polished, modern educational platform similar to GitBook, Frontend Masters, or freeCodeCamp.

## Objective

- Modern, clean, developer-focused design
- Responsive and accessible
- Soft shadows, rounded corners, good spacing, subtle animations
- Consistent typography and minimal aesthetic

## Page Sections

1. **Navbar** - Sticky navigation with logo, nav links, search, dark mode toggle, GitHub button, blur effect on scroll
2. **Hero Section** - Large hero with title, subtitle, CTA buttons, floating cards illustration, search bar with Ctrl+K shortcut
3. **Categories** - Responsive grid of 8 category cards (TypeScript Basics, Advanced Types, Interfaces, Generics, Utility Types, Design Patterns, Algorithms, Testing)
4. **Featured Book** - Large horizontal card with book cover, title, description, difficulty badge, reading time, chapters, continue button
5. **Continue Reading** - Progress card with book title, progress bar, current chapter, remaining chapters
6. **Popular Books** - Responsive grid of 4 book cards with cover, title, difficulty, reading time, chapters, rating, bookmark
7. **Recently Updated** - Horizontal cards with updated date, book title, description, category tag
8. **Why ts-books?** - Three feature cards (Interactive Examples, Modern TypeScript, Completely Open Source)
9. **Footer** - Logo, navigation links, legal links, copyright, GitHub link

## Components Created

### Reusable UI (`src/components/ui/`)
- `Button` - Primary/secondary/ghost variants, small/medium/large sizes
- `Badge` - Default/primary/success/warning/danger variants
- `ProgressBar` - Animated progress with color thresholds
- `SectionTitle` - Reusable section headers with optional subtitle
- `GithubIcon` - Custom SVG icon component

### Layout (`src/components/layout/`)
- `Navbar` - Sticky nav with blur backdrop, mobile hamburger menu, dark mode toggle
- `Footer` - Brand, navigation, legal, copyright

### Sections (`src/components/sections/`)
- `Hero` - Hero content with floating cards and search
- `SearchBar` - Search input with Ctrl+K shortcut badge
- `Categories` - Category grid wrapper
- `CategoryCard` - Individual category card with icon
- `FeaturedBook` - Featured book horizontal card
- `ContinueReading` - Reading progress card
- `PopularBooks` - Book grid wrapper
- `BookCard` - Individual book card
- `RecentlyUpdated` - Recently updated list
- `WhyTsBooks` - Feature cards section

## Dependencies Added

```json
{
  "lucide-react": "^1.24.0",
  "framer-motion": "^11.0.0"
}
```

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | New layout with Navbar + Footer, dark mode state |
| `src/App.css` | Minimal reset styles |
| `src/index.css` | CSS variables for theming (light/dark mode) |
| `src/pages/Home.tsx` | All new sections |

## Files Created

| File | Purpose |
|------|---------|
| `src/data/mockData.ts` | 8 books, 8 categories with TypeScript types |
| `src/components/ui/Button.tsx` | Button component |
| `src/components/ui/Badge.tsx` | Badge component |
| `src/components/ui/ProgressBar.tsx` | Progress bar component |
| `src/components/ui/SectionTitle.tsx` | Section title component |
| `src/components/ui/GithubIcon.tsx` | GitHub SVG icon |
| `src/components/layout/Navbar.tsx` | Navigation bar |
| `src/components/layout/Footer.tsx` | Footer component |
| `src/components/SearchBar.tsx` | Search input |
| `src/components/sections/Hero.tsx` | Hero section |
| `src/components/sections/Categories.tsx` | Categories grid |
| `src/components/sections/CategoryCard.tsx` | Category card |
| `src/components/sections/FeaturedBook.tsx` | Featured book card |
| `src/components/sections/ContinueReading.tsx` | Continue reading card |
| `src/components/sections/PopularBooks.tsx` | Popular books grid |
| `src/components/sections/BookCard.tsx` | Book card |
| `src/components/sections/RecentlyUpdated.tsx` | Recently updated list |
| `src/components/sections/WhyTsBooks.tsx` | Why ts-books section |

## Files Removed

| File | Reason |
|------|--------|
| `src/layout/Navbar.tsx` | Replaced with new Navbar component |
| `src/layout/Content.tsx` | No longer needed |
| `src/layout/PageContainer.tsx` | Empty stub |
| `src/layout/Sidebar.tsx` | Unused stub |
| `src/components/Card.tsx` | Replaced by BookCard/CategoryCard |
| `src/components/Chip.tsx` | Replaced by Badge |
| `src/components/Grid.tsx` | Replaced by CSS Grid |
| `src/data/constants.ts` | Unused |
| `src/services/news.ts` | Unused stub |
| `src/utils/formatDate.ts` | Unused stub |
| `src/logo.svg` | CRA default |
| `src/features/books/components/BookList.tsx` | Replaced by new components |

## Mock Data Structure

```typescript
interface Book {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readingTime: string;
  chapters: number;
  rating: number;
  category: string;
  cover: string;
  updatedAt: string;
  progress?: number;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  bookCount: number;
}
```

## Styling

- **CSS Variables** - All colors, spacing, shadows, transitions defined in `:root`
- **Dark Mode** - `[data-theme="dark"]` selector with inverted colors
- **Responsive** - Media queries at 968px (tablet) and 480px (mobile)
- **Transitions** - 150-300ms ease transitions for all interactive elements

## Animations (Framer Motion)

- Hero content fade-in on page load
- Floating cards staggered entrance
- Category/Book cards slide-up on viewport entry
- Button scale on hover/tap
- Book cards lift and shadow on hover
- Mobile menu expand/collapse

## Accessibility

- Semantic HTML (`nav`, `main`, `section`, `footer`)
- ARIA labels on icon buttons
- Keyboard navigation support
- Visible focus states with `:focus-visible`
- High color contrast ratios
- Alt text for images

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|---------------|
| > 968px | Full 2-column hero, 4-column grids |
| 768-968px | Hero stacks vertically, 2-column grids |
| < 480px | Single column, buttons stack, search shortcut hidden, hamburger menu |

## Build Result

```
File sizes after gzip:
  140.7 kB  build/static/js/main.9c989928.js
  3.89 kB   build/static/css/main.e3834ffb.css
  2.62 kB   build/static/js/496.23a31cc9.chunk.js
```

## Next Steps

- Implement authentication
- Implement backend APIs
- Implement book reader page
- Connect search functionality
- Add real book data
