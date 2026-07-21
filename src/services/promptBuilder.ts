import { PROMPT_TEMPLATES, AIPromptTemplate, AISettings } from '../types/ai';
import { getAISettings } from './aiProvider';

export function buildSystemPrompt(settings?: AISettings): string {
  const s = settings || getAISettings();
  const levelMap = {
    beginner: 'Explain concepts simply, avoid jargon, use analogies.',
    intermediate: 'Use technical terms where appropriate, provide moderate detail.',
    expert: 'Use precise technical language, provide in-depth analysis.',
  };

  return `You are an AI learning assistant integrated into a book reading application. You help users understand book content, create study materials, and answer questions.

Key rules:
- Be concise and focused. Responses should be helpful but not overwhelming.
- Use markdown formatting for code, lists, and emphasis.
- When generating flashcards, use the exact format: Q: [question] / A: [answer] / Difficulty: [easy|medium|hard]
- When generating quizzes, structure questions clearly with options where applicable.
- Reference the book context provided when answering questions.
- ${levelMap[s.explanationLevel]}

If code is being analyzed, explain it line by line and note potential issues or improvements.`;
}

export function buildPrompt(
  template: AIPromptTemplate,
  selection: string,
  bookContext?: string
): string {
  let prompt = template.template.replace(/\{selection\}/g, selection);

  if (bookContext) {
    prompt = `Book context:\n${bookContext}\n\n---\n\n${prompt}`;
  }

  return prompt;
}

export function buildFollowUpPrompt(
  originalQuestion: string,
  userFollowUp: string,
  previousAnswer: string
): string {
  return `The user previously asked: "${originalQuestion}"
The assistant answered: "${previousAnswer}"

Now the user asks a follow-up: "${userFollowUp}"

Answer the follow-up question, building on the previous context.`;
}

export function getContextFromSelection(selectedText: string, pageTitle?: number): string {
  let context = `Selected content from the book`;
  if (pageTitle) context += ` (page ${pageTitle})`;
  context += `:\n\n"${selectedText}"`;
  return context;
}

export function parseFlashcardsFromResponse(response: string): Array<{ question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard' }> {
  const cards: Array<{ question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard' }> = [];
  const cardBlocks = response.split(/Q:\s*/i).filter(Boolean);

  for (const block of cardBlocks) {
    const qMatch = block.match(/^(.+?)(?=A:\s*)/is);
    const aMatch = block.match(/A:\s*(.+?)(?=Difficulty:|$)/is);
    const dMatch = block.match(/Difficulty:\s*(easy|medium|hard)/i);

    if (qMatch && aMatch) {
      cards.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
        difficulty: (dMatch?.[1]?.toLowerCase() as 'easy' | 'medium' | 'hard') || 'medium',
      });
    }
  }

  return cards;
}

export function parseQuizFromResponse(response: string): Array<{
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}> {
  const questions: Array<{
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }> = [];

  const qBlocks = response.split(/\d+[.)]\s+/).filter(Boolean);

  for (const block of qBlocks) {
    const qMatch = block.match(/^(.+?)(?=Answer:|Correct Answer:)/is);
    const aMatch = block.match(/(?:Answer|Correct Answer):\s*(.+?)(?=Explanation:|$)/is);
    const eMatch = block.match(/Explanation:\s*(.+?)$/is);

    if (qMatch && aMatch) {
      const questionText = qMatch[1].trim();
      const answer = aMatch[1].trim();
      const optionsMatch = questionText.match(/([A-D][.)]\s*.+?)(?=[A-D][.)]|$)/gs);

      let type: 'multiple-choice' | 'true-false' | 'short-answer' = 'short-answer';
      let options: string[] | undefined;

      if (optionsMatch && optionsMatch.length >= 2) {
        type = 'multiple-choice';
        options = optionsMatch.map((o) => o.replace(/^[A-D][.)]\s*/, '').trim());
      } else if (/\b(true|false)\b/i.test(questionText)) {
        type = 'true-false';
        options = ['True', 'False'];
      }

      const cleanQuestion = type === 'multiple-choice'
        ? questionText.replace(/([A-D][.)]\s*.+?)/gs, '').trim()
        : questionText;

      questions.push({
        type,
        question: cleanQuestion,
        options,
        correctAnswer: answer,
        explanation: eMatch?.[1]?.trim() || '',
      });
    }
  }

  return questions;
}

export function getTemplatesByCategory(category?: string): AIPromptTemplate[] {
  if (!category) return PROMPT_TEMPLATES;
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}
