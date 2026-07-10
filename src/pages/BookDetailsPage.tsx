import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookBySlug, getRelatedBooks, getReadingProgress } from '../data/mockData';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BookHeader, BookActions, BookStats, ProgressCard, ChapterList, RelatedBooks, ReviewPlaceholder } from '../components/book';
import './BookDetailsPage.css';

export const BookDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const book = slug ? getBookBySlug(slug) : undefined;

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  const progress = getReadingProgress(book.id);
  const currentChapterId = progress?.currentChapterId || book.chapters.find((c) => !c.completed)?.id || null;
  const relatedBooks = getRelatedBooks(book);

  const handleStartReading = () => {
    navigate(`/books/${book.slug}/read`);
  };

  const handleChapterClick = (chapterId: string) => {
    navigate(`/books/${book.slug}/read?chapter=${chapterId}`);
  };

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Books', href: '/books' },
            { label: book.title },
          ]}
        />

        <BookHeader book={book} />

        <BookActions
          hasProgress={!!(progress && progress.percentage > 0)}
          onStartReading={handleStartReading}
        />

        <BookStats book={book} />

        <ProgressCard book={book} onContinue={handleStartReading} />

        <ChapterList
          chapters={book.chapters}
          currentChapterId={currentChapterId}
          onChapterClick={(ch) => handleChapterClick(ch.id)}
        />

        <RelatedBooks books={relatedBooks} />

        <ReviewPlaceholder />
      </div>
    </div>
  );
};
