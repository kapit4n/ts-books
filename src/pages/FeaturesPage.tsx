import React from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from '../components/ui/SectionTitle';
import { FeaturesSlider, Feature } from '../components/sections/FeaturesSlider';
import './FeaturesPage.css';

import img01LandingPage from '../assets/features/01-landing-page.png';
import img02Features from '../assets/features/02-features.png';
import img03Library from '../assets/features/03-library.png';
import img04ImportPage from '../assets/features/04-import-page.png';
import img05BookDetails from '../assets/features/05-book-details.png';
import img06ReadingPlan from '../assets/features/06-reading-plan.png';
import img07Reader from '../assets/features/07-reader.png';
import img08ReaderSidebar from '../assets/features/08-reader-sidebar.png';
import img09StudyWorkspace from '../assets/features/09-study-workspace.png';
import img10StudyNotes from '../assets/features/10-study-notes.png';
import img11StudyHighlights from '../assets/features/11-study-highlights.png';
import img12StudyBookmarks from '../assets/features/12-study-bookmarks.png';
import img13LearningOverview from '../assets/features/13-learning-overview.png';
import img14Flashcards from '../assets/features/14-flashcards.png';
import img15Quizzes from '../assets/features/15-quizzes.png';
import img16Exercises from '../assets/features/16-exercises.png';
import img17Achievements from '../assets/features/17-achievements.png';
import img18Statistics from '../assets/features/18-statistics.png';
import img19TypeScriptBook from '../assets/features/19-typescript-book.png';
import img20TSLearning from '../assets/features/20-ts-learning.png';
import img21CleanCodeBook from '../assets/features/21-clean-code-book.png';
import img22BooksCatalog from '../assets/features/22-books-catalog.png';
import img23BookDetailPage from '../assets/features/23-book-detail-page.png';
import img24About from '../assets/features/24-about.png';
import img25DarkLanding from '../assets/features/25-dark-landing.png';
import img26DarkLibrary from '../assets/features/26-dark-library.png';
import img27DarkLearning from '../assets/features/27-dark-learning.png';
import img28EmptyState from '../assets/features/28-empty-state.png';
import img29ResponsiveTablet from '../assets/features/29-responsive-tablet.png';
import img30ResponsiveMobile from '../assets/features/30-responsive-mobile.png';

const features: Feature[] = [
  {
    image: img01LandingPage,
    title: 'Landing Page',
    description:
      'The homepage greets you with a clean hero section, quick search, and browsing shortcuts to start learning TypeScript right away.',
  },
  {
    image: img02Features,
    title: 'Features Overview',
    description:
      'A quick glance at the core capabilities of ts-books: interactive examples, modern TypeScript coverage, and a fully open-source platform.',
  },
  {
    image: img03Library,
    title: 'Personal Library',
    description:
      'Your imported PDFs are organized in a personal library dashboard where you can browse, search, and manage your collection.',
  },
  {
    image: img04ImportPage,
    title: 'PDF Import',
    description:
      'Drag-and-drop or select PDF files to import them into your library. The import page handles file upload and metadata extraction.',
  },
  {
    image: img05BookDetails,
    title: 'Book Details',
    description:
      'View detailed information about any book including chapters, reading progress, difficulty level, and estimated reading time.',
  },
  {
    image: img06ReadingPlan,
    title: 'Reading Plans',
    description:
      'Set structured reading plans with goals and timelines. Track your completion rate and stay on schedule with your learning journey.',
  },
  {
    image: img07Reader,
    title: 'PDF Reader',
    description:
      'Read imported PDFs with a clean, focused interface. Switch between Book, Column, and Focus modes for the best reading experience.',
  },
  {
    image: img08ReaderSidebar,
    title: 'Reader Sidebar',
    description:
      'The reader sidebar provides quick access to the table of contents, bookmarks, highlights, and notes without leaving the reading view.',
  },
  {
    image: img09StudyWorkspace,
    title: 'Study Workspace',
    description:
      'A dedicated workspace for active reading with highlights, sticky notes, and bookmarks all in one place alongside the PDF viewer.',
  },
  {
    image: img10StudyNotes,
    title: 'Sticky Notes',
    description:
      'Add sticky notes to any page to capture thoughts, questions, and reminders as you read through your materials.',
  },
  {
    image: img11StudyHighlights,
    title: 'Text Highlights',
    description:
      'Highlight important passages with color-coded annotations. Your highlights are saved and searchable across your entire library.',
  },
  {
    image: img12StudyBookmarks,
    title: 'Bookmarks',
    description:
      'Bookmark key pages for quick reference later. Build a curated collection of important sections across all your books.',
  },
  {
    image: img13LearningOverview,
    title: 'Learning Center',
    description:
      'The learning center brings together flashcards, quizzes, exercises, and progress tracking in a single hub for reinforcing knowledge.',
  },
  {
    image: img14Flashcards,
    title: 'Flashcards',
    description:
      'Review key concepts with auto-generated flashcards. Flip through cards to test your memory and strengthen recall.',
  },
  {
    image: img15Quizzes,
    title: 'Quizzes',
    description:
      'Test your understanding with interactive quizzes. Answer questions and get instant feedback on your TypeScript knowledge.',
  },
  {
    image: img16Exercises,
    title: 'Coding Exercises',
    description:
      'Practice writing TypeScript code directly in the browser with Monaco editor. Solve challenges with real-time feedback and syntax highlighting.',
  },
  {
    image: img17Achievements,
    title: 'Achievements',
    description:
      'Track your milestones and earn achievements as you progress through your learning journey. Stay motivated with streaks and badges.',
  },
  {
    image: img18Statistics,
    title: 'Progress Statistics',
    description:
      'Visualize your reading and learning progress with detailed statistics. See how much you have covered and where to focus next.',
  },
  {
    image: img19TypeScriptBook,
    title: 'TypeScript Books',
    description:
      'Browse curated TypeScript books covering fundamentals, advanced patterns, generics, and real-world applications.',
  },
  {
    image: img20TSLearning,
    title: 'Guided Learning',
    description:
      'Follow structured learning paths from beginner to advanced. Each book guides you through concepts step by step with practical examples.',
  },
  {
    image: img21CleanCodeBook,
    title: 'Additional Resources',
    description:
      'Access a broader collection of books on clean code, design patterns, and software architecture alongside TypeScript content.',
  },
  {
    image: img22BooksCatalog,
    title: 'Book Catalog',
    description:
      'Browse the full catalog with filters for category, difficulty, and tags. Discover new topics and find the right books for your level.',
  },
  {
    image: img23BookDetailPage,
    title: 'Detailed Book View',
    description:
      'Every book has a detail page with chapter listing, metadata, related books, and one-click access to start reading or studying.',
  },
  {
    image: img24About,
    title: 'About Page',
    description:
      'Learn about the ts-books project, its mission, and the technology stack behind the platform.',
  },
  {
    image: img25DarkLanding,
    title: 'Dark Mode - Landing',
    description:
      'The dark theme provides a comfortable reading experience in low-light environments while maintaining full functionality.',
  },
  {
    image: img26DarkLibrary,
    title: 'Dark Mode - Library',
    description:
      'Dark mode extends across the entire app including the library, reader, and study views for a consistent experience.',
  },
  {
    image: img27DarkLearning,
    title: 'Dark Mode - Learning',
    description:
      'Study sessions at night are easier with dark mode applied to flashcards, quizzes, and the learning center.',
  },
  {
    image: img28EmptyState,
    title: 'Empty State',
    description:
      'When your library is empty, a friendly prompt guides you to import your first PDF and get started.',
  },
  {
    image: img29ResponsiveTablet,
    title: 'Tablet Responsive',
    description:
      'The layout adapts seamlessly to tablet screens, reflowing content and adjusting navigation for touch-friendly use.',
  },
  {
    image: img30ResponsiveMobile,
    title: 'Mobile Responsive',
    description:
      'Fully responsive on mobile devices with a collapsible navigation, stacked layouts, and optimized touch interactions.',
  },
];

export const FeaturesPage: React.FC = () => {
  return (
    <div className="features-page">
      <div className="features-page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle
            title="Features"
            subtitle="Everything you need to master TypeScript in one place"
            alignment="center"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeaturesSlider features={features} />
        </motion.div>
      </div>
    </div>
  );
};
