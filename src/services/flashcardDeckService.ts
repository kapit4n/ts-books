import { db } from './database';
import { FlashcardDeck } from '../types/learning';
import { generateId } from '../lib/utils';

export const flashcardDeckService = {
  async getByBook(bookId: string): Promise<FlashcardDeck[]> {
    return db.flashcardDecks.where('bookId').equals(bookId).toArray();
  },
  async get(id: string): Promise<FlashcardDeck | undefined> {
    return db.flashcardDecks.get(id);
  },
  async create(deck: FlashcardDeck): Promise<void> {
    await db.flashcardDecks.add(deck);
  },
  async update(id: string, updates: Partial<FlashcardDeck>): Promise<void> {
    await db.flashcardDecks.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await db.flashcardDecks.delete(id);
  },
  async removeByBook(bookId: string): Promise<void> {
    await db.flashcardDecks.where('bookId').equals(bookId).delete();
  },
  async addCardToDeck(deckId: string, flashcardId: string): Promise<void> {
    const deck = await db.flashcardDecks.get(deckId);
    if (deck && !deck.flashcardIds.includes(flashcardId)) {
      await db.flashcardDecks.update(deckId, {
        flashcardIds: [...deck.flashcardIds, flashcardId],
        updatedAt: new Date().toISOString(),
      });
    }
  },
  async removeCardFromDeck(deckId: string, flashcardId: string): Promise<void> {
    const deck = await db.flashcardDecks.get(deckId);
    if (deck) {
      await db.flashcardDecks.update(deckId, {
        flashcardIds: deck.flashcardIds.filter(id => id !== flashcardId),
        updatedAt: new Date().toISOString(),
      });
    }
  },
  async count(bookId: string): Promise<number> {
    return db.flashcardDecks.where('bookId').equals(bookId).count();
  },
};
