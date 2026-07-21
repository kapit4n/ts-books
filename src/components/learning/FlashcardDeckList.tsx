import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useFlashcardDecksStore } from '../../hooks/useFlashcardDecks';
import { FlashcardDeck } from '../../types/learning';

interface FlashcardDeckListProps {
  bookId: string;
  onSelectDeck: (deck: FlashcardDeck) => void;
  onCreateDeck: () => void;
}

export const FlashcardDeckList: React.FC<FlashcardDeckListProps> = ({
  bookId,
  onSelectDeck,
  onCreateDeck,
}) => {
  const { decks, loading, loadDecks, removeDeck } =
    useFlashcardDecksStore();

  useEffect(() => {
    loadDecks(bookId);
  }, [bookId, loadDecks]);

  return (
    <div className="flashcard-deck-list">
      <div className="deck-list-header">
        <h3>Decks</h3>
        <button className="learn-btn primary sm" onClick={onCreateDeck}>
          <Plus size={14} /> New Deck
        </button>
      </div>
      {loading && <p className="learn-loading">Loading...</p>}
      {!loading && decks.length === 0 && (
        <p className="learn-empty">
          No decks yet. Create one to organize your flashcards.
        </p>
      )}
      {decks.map((deck) => (
        <motion.div
          key={deck.id}
          className="deck-item"
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelectDeck(deck)}
        >
          <div
            className="deck-item-color"
            style={{ backgroundColor: deck.color }}
          />
          <div className="deck-item-info">
            <span className="deck-item-name">{deck.name}</span>
            <span className="deck-item-count">
              {deck.flashcardIds.length} cards
            </span>
          </div>
          <button
            className="deck-item-delete"
            onClick={(e) => {
              e.stopPropagation();
              removeDeck(deck.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </motion.div>
      ))}
    </div>
  );
};
