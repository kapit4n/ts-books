import { db } from '../services/database';
import { AIConversation, AIMessage } from '../types/ai';

export const conversationService = {
  async getByBook(bookId: string): Promise<AIConversation[]> {
    return db.aiConversations
      .where('bookId')
      .equals(bookId)
      .reverse()
      .sortBy('updatedAt');
  },

  async get(id: string): Promise<AIConversation | undefined> {
    return db.aiConversations.get(id);
  },

  async create(conversation: AIConversation): Promise<void> {
    await db.aiConversations.add(conversation);
  },

  async update(id: string, updates: Partial<AIConversation>): Promise<void> {
    await db.aiConversations.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.aiMessages.where('conversationId').equals(id).delete();
    await db.aiConversations.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    const convos = await db.aiConversations.where('bookId').equals(bookId).toArray();
    for (const c of convos) {
      await db.aiMessages.where('conversationId').equals(c.id).delete();
    }
    await db.aiConversations.where('bookId').equals(bookId).delete();
  },

  async getMessages(conversationId: string): Promise<AIMessage[]> {
    return db.aiMessages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('timestamp');
  },

  async addMessage(message: AIMessage): Promise<void> {
    await db.aiMessages.add(message);
    await db.aiConversations.update(message.conversationId, {
      updatedAt: message.timestamp,
      messageCount: await db.aiMessages.where('conversationId').equals(message.conversationId).count(),
    });
  },

  async updateMessage(id: string, updates: Partial<AIMessage>): Promise<void> {
    await db.aiMessages.update(id, updates);
  },

  async removeMessage(id: string): Promise<void> {
    await db.aiMessages.delete(id);
  },

  async count(bookId: string): Promise<number> {
    return db.aiConversations.where('bookId').equals(bookId).count();
  },
};
