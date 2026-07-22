import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingImportButton } from './components/library/FloatingImportButton';
import { Home } from './pages/Home';
import { BooksPage } from './pages/BooksPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { ReaderPage } from './pages/ReaderPage';
import { ImportPage } from './pages/ImportPage';
import { LibraryDashboard } from './pages/LibraryDashboard';
import { LibraryBookDetails } from './pages/LibraryBookDetails';
import { PDFReaderPage } from './pages/PDFReaderPage';
import { StudyWorkspacePage } from './pages/StudyWorkspacePage';
import { LearningCenterPage } from './pages/LearningCenterPage';
import About from './pages/About';
import { FeaturesPage } from './pages/FeaturesPage';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Documentation mode: expose seed function on window for Playwright
  useEffect(() => {
    import('./utils/seedAllDemoData').then(({ seedAllDemoData }) => {
      (window as any).__seedAllDemoData = seedAllDemoData;
    });
  }, []);

  // Documentation mode: auto-seed demo data when ?seed=true is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('seed') === 'true') {
      localStorage.setItem('darkMode', 'false');
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
      import('./utils/seedAllDemoData').then(({ seedAllDemoData }) => {
        seedAllDemoData().then(() => {
          console.log('[App] Demo data seeded via ?seed=true');
        });
      });
    }
  }, [location.search]);

  return (
    <div className="App">
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:slug" element={<BookDetailsPage />} />
          <Route path="/books/:slug/read" element={<ReaderPage />} />
          <Route path="/library" element={<LibraryDashboard />} />
          <Route path="/library/import" element={<ImportPage />} />
          <Route path="/library/:id" element={<LibraryBookDetails />} />
          <Route path="/library/:id/read" element={<PDFReaderPage />} />
          <Route path="/library/:id/study" element={<StudyWorkspacePage />} />
          <Route path="/library/:id/learn" element={<LearningCenterPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/detail/:bookId" element={<Home />} />
        </Routes>
      </main>
      <FloatingImportButton />
      <Footer />
    </div>
  );
}

export default App;
