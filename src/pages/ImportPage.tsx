import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, Loader2, ChevronRight,
  Upload, Clock, FolderOpen, BookOpen,
} from 'lucide-react';
import { PDFUploader } from '../components/library/PDFUploader';
import { ReadingStrategySetup } from '../components/library/ReadingStrategySetup';
import { useLibraryStore } from '../hooks/useLibrary';
import { processPDF } from '../services/pdfService';
import { generateReadingPlan } from '../services/readingPlanService';
import { db } from '../services/database';
import { ImportedBook, ReadingGoal } from '../types/library';
import './ImportPage.css';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

interface PendingBook {
  file: File;
  processed: Omit<ImportedBook, 'id' | 'importedAt' | 'lastOpened'> | null;
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, addBook, loadBooks, addImportJob, updateImportJob } = useLibraryStore();
  const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
  const [strategyBook, setStrategyBook] = useState<PendingBook | null>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      const jobId = generateId();
      addImportJob({ id: jobId, fileName: file.name, status: 'processing', progress: 0 });

      const pending: PendingBook = { file, processed: null, status: 'processing' };
      setPendingBooks((prev) => [...prev, pending]);

      try {
        const processed = await processPDF(file, (progress) => {
          updateImportJob(jobId, { progress });
        });

        pending.processed = processed;
        pending.status = 'ready';
        updateImportJob(jobId, { status: 'completed', progress: 100, bookId: 'pending' });
      } catch (err) {
        pending.status = 'error';
        pending.error = err instanceof Error ? err.message : 'Failed to process PDF';
        updateImportJob(jobId, { status: 'error', error: pending.error });
      }

      setPendingBooks((prev) => [...prev]);
    }
  };

  const handleStrategyComplete = async (
    goal: ReadingGoal,
    minutesPerDay: number,
    targetDate: string | null,
    preferredDays: string[]
  ) => {
    if (!strategyBook?.processed) return;

    const id = generateId();
    const book: ImportedBook = {
      ...strategyBook.processed,
      id,
      importedAt: new Date().toISOString(),
      lastOpened: null,
    };

    await addBook(book);

    const plan = generateReadingPlan(id, book.pageCount, goal, minutesPerDay, targetDate, preferredDays);
    await db.plans.add(plan);

    setPendingBooks((prev) => prev.filter((p) => p !== strategyBook));
    setStrategyBook(null);
    navigate(`/library/${id}`);
  };

  const recentlyImported = books.slice(0, 5);
  const mostRecentBook = books.length > 0 ? books[0] : null;

  return (
    <div className="import-page">
      <div className="import-page-container">
        {/* Hero */}
        <motion.div
          className="import-hero"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a href="/library" className="import-back-link">
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            Library
          </a>
          <h1 className="import-page-title">Import PDF</h1>
          <p className="import-page-subtitle">
            Build your personal learning library. Upload any PDF book and transform it into a
            structured reading experience.
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PDFUploader onFilesSelected={handleFilesSelected} />
          <div className="import-format-info">
            <span>Supported formats: <strong>PDF</strong></span>
            <span className="import-format-sep">|</span>
            <span>Maximum size: <strong>50MB</strong></span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="import-quick-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="import-section-title">Quick Actions</h3>
          <div className="import-quick-grid">
            <a href="#recent-imports" className="import-quick-card">
              <Clock size={20} />
              <span className="import-quick-label">Recent Imports</span>
            </a>
            <button className="import-quick-card" onClick={() => window.location.reload()}>
              <Upload size={20} />
              <span className="import-quick-label">Import Another PDF</span>
            </button>
            <a href="/library" className="import-quick-card">
              <FolderOpen size={20} />
              <span className="import-quick-label">Browse Library</span>
            </a>
            {mostRecentBook ? (
              <a href={`/library/${mostRecentBook.id}/read`} className="import-quick-card">
                <BookOpen size={20} />
                <span className="import-quick-label">Continue Reading</span>
              </a>
            ) : (
              <a href="/books" className="import-quick-card">
                <BookOpen size={20} />
                <span className="import-quick-label">Browse Built-in Books</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Pending Books */}
        {pendingBooks.length > 0 && (
          <div className="import-pending">
            <h3 className="import-section-title">Processing</h3>
            {pendingBooks.map((pending, index) => (
              <motion.div
                key={index}
                className="import-pending-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="import-pending-info">
                  {pending.status === 'processing' && <Loader2 size={20} className="import-spin" />}
                  {pending.status === 'ready' && <CheckCircle2 size={20} className="import-success" />}
                  {pending.status === 'error' && <AlertCircle size={20} className="import-error" />}
                  <div>
                    <span className="import-pending-name">{pending.file.name}</span>
                    {pending.status === 'ready' && pending.processed && (
                      <span className="import-pending-meta">
                        {pending.processed.pageCount} pages - {pending.processed.readingTimeEstimate}
                      </span>
                    )}
                    {pending.status === 'error' && (
                      <span className="import-pending-error">{pending.error}</span>
                    )}
                  </div>
                </div>
                {pending.status === 'ready' && (
                  <button
                    className="import-pending-import-btn"
                    onClick={() => setStrategyBook(pending)}
                  >
                    Set Up Reading Plan
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Reading Strategy */}
        {strategyBook && strategyBook.processed && (
          <ReadingStrategySetup
            bookTitle={strategyBook.processed.title}
            pageCount={strategyBook.processed.pageCount}
            onComplete={handleStrategyComplete}
            onCancel={() => setStrategyBook(null)}
          />
        )}

        {/* Recently Imported */}
        {recentlyImported.length > 0 && (
          <div className="import-recent" id="recent-imports">
            <h3 className="import-section-title">Recently Imported</h3>
            <div className="import-recent-list">
              {recentlyImported.map((book) => (
                <a
                  key={book.id}
                  href={`/library/${book.id}`}
                  className="import-recent-item"
                >
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="import-recent-thumb" />
                  ) : (
                    <div className="import-recent-placeholder" />
                  )}
                  <div>
                    <span className="import-recent-title">{book.title}</span>
                    <span className="import-recent-meta">{book.pageCount} pages</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
