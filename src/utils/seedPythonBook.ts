import { db } from '../services/database';
import type { ImportedBook } from '../types/library';
import type { Flashcard, Quiz, QuizAttempt, Exercise, ExerciseResult, UserAchievement, ChapterProgress, LearningStats, StudyCalendarEntry, ContinueLearningState, FlashcardDeck } from '../types/learning';

const PYTHON_BOOK_ID = 'python-crash-course-seed';
const now = new Date().toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const daysAgo = (days: number) => {
  const d = new Date(Date.now() - days * 86400000);
  return d.toISOString().split('T')[0];
};

function minimalPdf(): ArrayBuffer {
  const s = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF';
  const buf = new ArrayBuffer(s.length);
  new Uint8Array(buf).set(new TextEncoder().encode(s));
  return buf;
}

const outline = [
  { title: 'Chapter 1: Getting Started', pageNumber: 1 },
  { title: 'Chapter 2: Variables and Data Types', pageNumber: 15 },
  { title: 'Chapter 3: Control Flow', pageNumber: 35 },
  { title: 'Chapter 4: Functions', pageNumber: 55 },
  { title: 'Chapter 5: Lists and Tuples', pageNumber: 75 },
  { title: 'Chapter 6: Dictionaries and Sets', pageNumber: 95 },
  { title: 'Chapter 7: File Handling', pageNumber: 115 },
  { title: 'Chapter 8: Object-Oriented Programming', pageNumber: 135 },
  { title: 'Chapter 9: Error Handling', pageNumber: 160 },
  { title: 'Chapter 10: Modules and Packages', pageNumber: 180 },
  { title: 'Chapter 11: Testing', pageNumber: 200 },
  { title: 'Chapter 12: Projects', pageNumber: 220 },
];

const flashcards: Flashcard[] = [
  { id: 'fc-1', bookId: PYTHON_BOOK_ID, question: 'What is the output of print(type(42))?', answer: "<class 'int'>", difficulty: 'easy', status: 'mastered', category: 'Variables', tags: ['types', 'basics'], createdAt: ago(10), updatedAt: ago(2), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 5, easeFactor: 2.6, interval: 8, correctCount: 5, incorrectCount: 0 },
  { id: 'fc-2', bookId: PYTHON_BOOK_ID, question: 'How do you create a list in Python?', answer: 'Using square brackets: my_list = [1, 2, 3]', difficulty: 'easy', status: 'mastered', category: 'Lists', tags: ['lists', 'basics'], createdAt: ago(10), updatedAt: ago(3), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 4, easeFactor: 2.5, interval: 6, correctCount: 4, incorrectCount: 0 },
  { id: 'fc-3', bookId: PYTHON_BOOK_ID, question: 'What is the difference between a list and a tuple?', answer: 'Lists are mutable (can be changed), tuples are immutable (cannot be changed after creation).', difficulty: 'medium', status: 'learning', category: 'Data Structures', tags: ['lists', 'tuples'], createdAt: ago(8), updatedAt: ago(2), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 2, easeFactor: 2.2, interval: 3, correctCount: 2, incorrectCount: 1 },
  { id: 'fc-4', bookId: PYTHON_BOOK_ID, question: 'What does the "self" parameter represent in a class method?', answer: 'It refers to the instance of the class itself, allowing access to instance attributes and methods.', difficulty: 'medium', status: 'learning', category: 'OOP', tags: ['classes', 'oop'], createdAt: ago(7), updatedAt: ago(3), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 1, easeFactor: 2.1, interval: 2, correctCount: 1, incorrectCount: 1 },
  { id: 'fc-5', bookId: PYTHON_BOOK_ID, question: 'How do you handle exceptions in Python?', answer: 'Using try/except blocks: try: risky_code() except ValueError as e: handle_error(e)', difficulty: 'medium', status: 'reviewing', category: 'Error Handling', tags: ['exceptions', 'try-except'], createdAt: ago(6), updatedAt: ago(1), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 3, easeFactor: 2.3, interval: 4, correctCount: 3, incorrectCount: 0 },
  { id: 'fc-6', bookId: PYTHON_BOOK_ID, question: 'What is a dictionary in Python?', answer: 'An unordered collection of key-value pairs: my_dict = {"name": "Alice", "age": 30}', difficulty: 'easy', status: 'mastered', category: 'Data Structures', tags: ['dict', 'basics'], createdAt: ago(9), updatedAt: ago(4), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 6, easeFactor: 2.7, interval: 10, correctCount: 6, incorrectCount: 0 },
  { id: 'fc-7', bookId: PYTHON_BOOK_ID, question: 'What is list comprehension?', answer: 'A concise way to create lists: squares = [x**2 for x in range(10)]', difficulty: 'medium', status: 'learning', category: 'Lists', tags: ['comprehension', 'advanced'], createdAt: ago(5), updatedAt: ago(2), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 1, easeFactor: 2.0, interval: 2, correctCount: 1, incorrectCount: 2 },
  { id: 'fc-8', bookId: PYTHON_BOOK_ID, question: 'What is the difference between "==" and "is" in Python?', answer: '"==" checks value equality, "is" checks identity (whether two variables point to the same object in memory).', difficulty: 'hard', status: 'new', category: 'Variables', tags: ['operators', 'identity'], createdAt: ago(3), updatedAt: ago(3), streak: 0, easeFactor: 2.5, interval: 0, correctCount: 0, incorrectCount: 0 },
  { id: 'fc-9', bookId: PYTHON_BOOK_ID, question: 'What are *args and **kwargs?', answer: '*args allows passing variable positional arguments as a tuple. **kwargs allows passing variable keyword arguments as a dictionary.', difficulty: 'hard', status: 'new', category: 'Functions', tags: ['args', 'kwargs', 'advanced'], createdAt: ago(2), updatedAt: ago(2), streak: 0, easeFactor: 2.5, interval: 0, correctCount: 0, incorrectCount: 0 },
  { id: 'fc-10', bookId: PYTHON_BOOK_ID, question: 'How does Python manage memory?', answer: 'Python uses reference counting and a garbage collector. Objects are deallocated when their reference count drops to zero.', difficulty: 'hard', status: 'new', category: 'Advanced', tags: ['memory', 'garbage-collection'], createdAt: ago(1), updatedAt: ago(1), streak: 0, easeFactor: 2.5, interval: 0, correctCount: 0, incorrectCount: 0 },
  { id: 'fc-11', bookId: PYTHON_BOOK_ID, question: 'What is a decorator in Python?', answer: 'A function that takes another function and extends its behavior without explicitly modifying it. Used with @decorator syntax.', difficulty: 'hard', status: 'learning', category: 'Advanced', tags: ['decorators', 'advanced'], createdAt: ago(4), updatedAt: ago(2), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 1, easeFactor: 2.0, interval: 1, correctCount: 1, incorrectCount: 1 },
  { id: 'fc-12', bookId: PYTHON_BOOK_ID, question: 'What is a lambda function?', answer: 'An anonymous function defined with lambda keyword: square = lambda x: x**2', difficulty: 'easy', status: 'mastered', category: 'Functions', tags: ['lambda', 'basics'], createdAt: ago(8), updatedAt: ago(5), lastReviewed: ago(4), nextReview: daysAgo(0), streak: 4, easeFactor: 2.5, interval: 8, correctCount: 4, incorrectCount: 0 },
];

const flashcardDecks: FlashcardDeck[] = [
  { id: 'deck-1', bookId: PYTHON_BOOK_ID, name: 'Python Basics', description: 'Fundamental Python concepts', color: '#3b82f6', flashcardIds: ['fc-1', 'fc-2', 'fc-6', 'fc-12'], createdAt: ago(10), updatedAt: ago(2) },
  { id: 'deck-2', bookId: PYTHON_BOOK_ID, name: 'Data Structures', description: 'Lists, tuples, dicts, and sets', color: '#10b981', flashcardIds: ['fc-3', 'fc-7'], createdAt: ago(8), updatedAt: ago(2) },
  { id: 'deck-3', bookId: PYTHON_BOOK_ID, name: 'OOP & Advanced', description: 'Classes, decorators, and more', color: '#8b5cf6', flashcardIds: ['fc-4', 'fc-11', 'fc-8', 'fc-9', 'fc-10'], createdAt: ago(6), updatedAt: ago(2) },
];

const quizzes: Quiz[] = [
  {
    id: 'quiz-1', bookId: PYTHON_BOOK_ID, title: 'Python Basics Quiz', description: 'Test your knowledge of Python fundamentals', difficulty: 'easy', passingScore: 70, createdAt: ago(9), updatedAt: ago(3),
    questions: [
      { id: 'q1-1', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctAnswer: 'def', explanation: 'The "def" keyword is used to define functions in Python.', difficulty: 'easy', category: 'Functions', createdAt: ago(9) },
      { id: 'q1-2', bookId: PYTHON_BOOK_ID, type: 'true-false', question: 'Python is a statically typed language.', correctAnswer: 'false', explanation: 'Python is dynamically typed - variable types are determined at runtime.', difficulty: 'easy', category: 'Basics', createdAt: ago(9) },
      { id: 'q1-3', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'What is the correct file extension for Python files?', options: ['.py', '.python', '.pt', '.pyt'], correctAnswer: '.py', explanation: 'Python files use the .py extension.', difficulty: 'easy', category: 'Basics', createdAt: ago(9) },
      { id: 'q1-4', bookId: PYTHON_BOOK_ID, type: 'short-answer', question: 'What built-in function returns the length of a list?', correctAnswer: 'len()', explanation: 'The len() function returns the number of items in an object.', difficulty: 'easy', category: 'Functions', createdAt: ago(9) },
      { id: 'q1-5', bookId: PYTHON_BOOK_ID, type: 'true-false', question: 'In Python, indentation is optional.', correctAnswer: 'false', explanation: 'Python uses indentation to define code blocks; it is mandatory.', difficulty: 'easy', category: 'Basics', createdAt: ago(9) },
    ],
  },
  {
    id: 'quiz-2', bookId: PYTHON_BOOK_ID, title: 'Data Structures Challenge', description: 'Deep dive into Python data structures', difficulty: 'medium', passingScore: 60, createdAt: ago(6), updatedAt: ago(2),
    questions: [
      { id: 'q2-1', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'Which data structure is immutable?', options: ['list', 'dictionary', 'tuple', 'set'], correctAnswer: 'tuple', explanation: 'Tuples are immutable sequences in Python.', difficulty: 'medium', category: 'Data Structures', createdAt: ago(6) },
      { id: 'q2-2', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'How do you access a value in a dictionary?', options: ['dict[0]', 'dict.get(key)', 'dict.key', 'dict(key)'], correctAnswer: 'dict.get(key)', explanation: 'Use dict[key] or dict.get(key) to access dictionary values.', difficulty: 'medium', category: 'Dictionaries', createdAt: ago(6) },
      { id: 'q2-3', bookId: PYTHON_BOOK_ID, type: 'true-false', question: 'Dictionary keys must be unique.', correctAnswer: 'true', explanation: 'Each key in a dictionary must be unique; duplicate keys overwrite the previous value.', difficulty: 'medium', category: 'Dictionaries', createdAt: ago(6) },
      { id: 'q2-4', bookId: PYTHON_BOOK_ID, type: 'short-answer', question: 'What method adds an element to the end of a list?', correctAnswer: 'append()', explanation: 'The append() method adds an element to the end of a list.', difficulty: 'medium', category: 'Lists', createdAt: ago(6) },
    ],
  },
  {
    id: 'quiz-3', bookId: PYTHON_BOOK_ID, title: 'OOP Mastery', description: 'Object-oriented programming in Python', difficulty: 'hard', passingScore: 50, timeLimitMinutes: 15, createdAt: ago(4), updatedAt: ago(1),
    questions: [
      { id: 'q3-1', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'What method is called when an object is created?', options: ['__new__', '__init__', '__create__', '__construct__'], correctAnswer: '__init__', explanation: '__init__ is the constructor method called after object creation.', difficulty: 'hard', category: 'OOP', createdAt: ago(4) },
      { id: 'q3-2', bookId: PYTHON_BOOK_ID, type: 'short-answer', question: 'What keyword is used for inheritance in Python?', correctAnswer: 'class Child(Parent)', explanation: 'Specify the parent class in parentheses after the child class name.', difficulty: 'hard', category: 'OOP', createdAt: ago(4) },
      { id: 'q3-3', bookId: PYTHON_BOOK_ID, type: 'true-false', question: 'Python supports multiple inheritance.', correctAnswer: 'true', explanation: 'Python supports multiple inheritance: class C(A, B): pass', difficulty: 'hard', category: 'OOP', createdAt: ago(4) },
      { id: 'q3-4', bookId: PYTHON_BOOK_ID, type: 'multiple-choice', question: 'What is method overriding?', options: ['Defining a method in a child class that replaces the parent method', 'Calling a parent method', 'Deleting a method', 'Importing a method'], correctAnswer: 'Defining a method in a child class that replaces the parent method', explanation: 'Method overriding allows a child class to provide a specific implementation of a method already defined in its parent.', difficulty: 'hard', category: 'OOP', createdAt: ago(4) },
      { id: 'q3-5', bookId: PYTHON_BOOK_ID, type: 'short-answer', question: 'What is a property decorator used for?', correctAnswer: '@property', explanation: '@property turns a method into a getter, allowing attribute-like access.', difficulty: 'hard', category: 'OOP', createdAt: ago(4) },
    ],
  },
];

const quizAttempts: QuizAttempt[] = [
  { id: 'qa-1', quizId: 'quiz-1', bookId: PYTHON_BOOK_ID, answers: { 'q1-1': 'def', 'q1-2': 'false', 'q1-3': '.py', 'q1-4': 'len()', 'q1-5': 'false' }, score: 100, totalQuestions: 5, passed: true, startedAt: ago(8), completedAt: ago(8), durationMs: 120000 },
  { id: 'qa-2', quizId: 'quiz-2', bookId: PYTHON_BOOK_ID, answers: { 'q2-1': 'tuple', 'q2-2': 'dict.get(key)', 'q2-3': 'true', 'q2-4': 'append()' }, score: 75, totalQuestions: 4, passed: true, startedAt: ago(5), completedAt: ago(5), durationMs: 180000 },
  { id: 'qa-3', quizId: 'quiz-2', bookId: PYTHON_BOOK_ID, answers: { 'q2-1': 'list', 'q2-2': 'dict.get(key)', 'q2-3': 'true', 'q2-4': 'append()' }, score: 75, totalQuestions: 4, passed: true, startedAt: ago(3), completedAt: ago(3), durationMs: 150000 },
  { id: 'qa-4', quizId: 'quiz-3', bookId: PYTHON_BOOK_ID, answers: { 'q3-1': '__init__', 'q3-2': 'class Child(Parent)', 'q3-3': 'true', 'q3-4': 'Defining a method in a child class that replaces the parent method', 'q3-5': '@property' }, score: 60, totalQuestions: 5, passed: false, startedAt: ago(2), completedAt: ago(2), durationMs: 600000 },
];

const exercises: Exercise[] = [
  { id: 'ex-1', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 4: Functions', title: 'Hello World Function', description: 'Create a function that returns a greeting message.', instructions: 'Write a function called greet(name) that returns "Hello, {name}!"', difficulty: 'beginner', language: 'python', starterCode: 'def greet(name):\n    # Your code here\n    pass', expectedOutput: 'Hello, Alice!', hints: ['Use an f-string or .format()'], solution: 'def greet(name):\n    return f"Hello, {name}!"', status: 'completed', category: 'Functions', createdAt: ago(8), updatedAt: ago(5) },
  { id: 'ex-2', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 5: Lists and Tuples', title: 'List Comprehension Practice', description: 'Use list comprehension to transform data.', instructions: 'Create a list of squares from 1 to 10 using list comprehension.', difficulty: 'beginner', language: 'python', starterCode: '# Create a list of squares from 1 to 10\nsquares = []\nprint(squares)', expectedOutput: '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]', hints: ['Use [x**2 for x in range(1, 11)]'], solution: 'squares = [x**2 for x in range(1, 11)]\nprint(squares)', status: 'completed', category: 'Lists', createdAt: ago(7), updatedAt: ago(5) },
  { id: 'ex-3', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 6: Dictionaries', title: 'Word Frequency Counter', description: 'Count word frequencies using a dictionary.', instructions: 'Write a function that takes a string and returns a dictionary with word frequencies.', difficulty: 'intermediate', language: 'python', starterCode: 'def word_count(text):\n    # Your code here\n    pass', expectedOutput: "{'hello': 2, 'world': 1}", hints: ['Split the string into words', 'Use a dictionary to count occurrences'], solution: "def word_count(text):\n    words = text.split()\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts", status: 'completed', category: 'Dictionaries', createdAt: ago(6), updatedAt: ago(4) },
  { id: 'ex-4', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 8: OOP', title: 'Bank Account Class', description: 'Implement a BankAccount class with deposit and withdrawal.', instructions: 'Create a BankAccount class with deposit(), withdraw(), and get_balance() methods.', difficulty: 'intermediate', language: 'python', starterCode: 'class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    # Add your methods here\n    pass', expectedOutput: 'Balance: 500', hints: ['Use self.balance to track the balance', 'Check for sufficient funds on withdrawal'], solution: "class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n    def get_balance(self):\n        return self.balance", status: 'in-progress', category: 'OOP', createdAt: ago(5), updatedAt: ago(3) },
  { id: 'ex-5', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 9: Error Handling', title: 'Safe Division Calculator', description: 'Handle division by zero and invalid input gracefully.', instructions: 'Write a safe_divide(a, b) function that handles ZeroDivisionError and ValueError.', difficulty: 'intermediate', language: 'python', starterCode: 'def safe_divide(a, b):\n    # Your code here\n    pass', expectedOutput: 'Result: 2.5', hints: ['Use try/except blocks', 'Catch ZeroDivisionError specifically'], solution: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Cannot divide by zero"\n    except (TypeError, ValueError):\n        return "Invalid input"', status: 'not-started', category: 'Error Handling', createdAt: ago(3), updatedAt: ago(3) },
  { id: 'ex-6', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 10: Modules', title: 'File Word Counter', description: 'Read a file and count words, lines, and characters.', instructions: 'Write a function that reads a text file and returns stats.', difficulty: 'advanced', language: 'python', starterCode: 'def file_stats(filename):\n    # Your code here\n    pass', expectedOutput: "{'words': 150, 'lines': 10, 'chars': 750}", hints: ['Use with open() to read the file', 'Split lines by newlines, words by spaces'], solution: "def file_stats(filename):\n    with open(filename, 'r') as f:\n        text = f.read()\n    lines = text.split('\\n')\n    words = text.split()\n    return {'words': len(words), 'lines': len(lines), 'chars': len(text)}", status: 'not-started', category: 'File Handling', createdAt: ago(2), updatedAt: ago(2) },
];

const exerciseResults: ExerciseResult[] = [
  { id: 'er-1', exerciseId: 'ex-1', bookId: PYTHON_BOOK_ID, userCode: 'def greet(name):\n    return f"Hello, {name}!"', output: 'Hello, Alice!', passed: true, attemptedAt: ago(5) },
  { id: 'er-2', exerciseId: 'ex-2', bookId: PYTHON_BOOK_ID, userCode: 'squares = [x**2 for x in range(1, 11)]\nprint(squares)', output: '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]', passed: true, attemptedAt: ago(5) },
  { id: 'er-3', exerciseId: 'ex-3', bookId: PYTHON_BOOK_ID, userCode: "def word_count(text):\n    words = text.split()\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts", output: "{'hello': 2, 'world': 1}", passed: true, attemptedAt: ago(4) },
];

const userAchievements: UserAchievement[] = [
  { id: 'ua-1', achievementId: 'flashcards-10', unlockedAt: ago(3), progress: 12 },
  { id: 'ua-2', achievementId: 'quiz-first', unlockedAt: ago(8), progress: 1 },
  { id: 'ua-3', achievementId: 'exercise-first', unlockedAt: ago(5), progress: 3 },
  { id: 'ua-4', achievementId: 'streak-7', unlockedAt: ago(1), progress: 7 },
];

const chapterProgressItems: ChapterProgress[] = [
  { id: 'cp-1', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 1: Getting Started', pageNumber: 1, status: 'completed', completedAt: ago(9), updatedAt: ago(9) },
  { id: 'cp-2', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 2: Variables and Data Types', pageNumber: 15, status: 'completed', completedAt: ago(8), updatedAt: ago(8) },
  { id: 'cp-3', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 3: Control Flow', pageNumber: 35, status: 'completed', completedAt: ago(7), updatedAt: ago(7) },
  { id: 'cp-4', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 4: Functions', pageNumber: 55, status: 'completed', completedAt: ago(6), updatedAt: ago(6) },
  { id: 'cp-5', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 5: Lists and Tuples', pageNumber: 75, status: 'completed', completedAt: ago(5), updatedAt: ago(5) },
  { id: 'cp-6', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 6: Dictionaries and Sets', pageNumber: 95, status: 'practicing', updatedAt: ago(3) },
  { id: 'cp-7', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 7: File Handling', pageNumber: 115, status: 'reading', updatedAt: ago(2) },
  { id: 'cp-8', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 8: Object-Oriented Programming', pageNumber: 135, status: 'not-started', updatedAt: ago(5) },
  { id: 'cp-9', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 9: Error Handling', pageNumber: 160, status: 'not-started', updatedAt: ago(3) },
  { id: 'cp-10', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 10: Modules and Packages', pageNumber: 180, status: 'not-started', updatedAt: ago(2) },
  { id: 'cp-11', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 11: Testing', pageNumber: 200, status: 'not-started', updatedAt: ago(1) },
  { id: 'cp-12', bookId: PYTHON_BOOK_ID, chapterTitle: 'Chapter 12: Projects', pageNumber: 220, status: 'not-started', updatedAt: ago(1) },
];

const studyCalendarEntries: StudyCalendarEntry[] = (() => {
  const entries: StudyCalendarEntry[] = [];
  let id = 1;
  for (let d = 27; d >= 0; d--) {
    const date = daysAgo(d);
    const types: Array<{ type: StudyCalendarEntry['type']; desc: string; dur: number }> = [
      { type: 'reading', desc: 'Read Python Crash Course', dur: 1800000 + Math.random() * 2400000 },
      { type: 'flashcards', desc: 'Reviewed flashcards', dur: 600000 + Math.random() * 900000 },
    ];
    if (d % 3 === 0) types.push({ type: 'quiz', desc: 'Took a quiz', dur: 300000 + Math.random() * 600000 });
    if (d % 4 === 0) types.push({ type: 'exercise', desc: 'Completed an exercise', dur: 900000 + Math.random() * 1200000 });
    for (const t of types) {
      entries.push({
        id: `sc-${id++}`,
        bookId: PYTHON_BOOK_ID,
        date,
        type: t.type,
        durationMs: Math.round(t.dur),
        description: t.desc,
        createdAt: new Date(`${date}T12:00:00Z`).toISOString(),
      });
    }
  }
  return entries;
})();

const learningStats: LearningStats = {
  id: PYTHON_BOOK_ID,
  bookId: PYTHON_BOOK_ID,
  totalFlashcards: 12,
  masteredFlashcards: 4,
  totalQuizzes: 3,
  quizzesPassed: 2,
  totalExercises: 6,
  exercisesCompleted: 3,
  studyTimeMs: 45000000,
  currentStreak: 7,
  longestStreak: 7,
  lastStudyDate: daysAgo(0),
  learningScore: 72,
  updatedAt: now,
};

const continueLearning: ContinueLearningState = {
  id: PYTHON_BOOK_ID,
  bookId: PYTHON_BOOK_ID,
  lastActivity: 'exercise',
  lastExerciseId: 'ex-4',
  lastChapterTitle: 'Chapter 7: File Handling',
  updatedAt: now,
};

export async function seedPythonBook() {
  const existing = await db.books.get(PYTHON_BOOK_ID);
  if (existing) {
    console.log('[Seed] Python book already exists, skipping.');
    return PYTHON_BOOK_ID;
  }

  const book: ImportedBook = {
    id: PYTHON_BOOK_ID,
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    fileName: 'python-crash-course.pdf',
    pageCount: 256,
    pdfData: minimalPdf(),
    thumbnail: null,
    metadata: { publisher: 'No Starch Press', year: 2023, language: 'English' },
    outline,
    category: 'Programming',
    tags: ['python', 'programming', 'beginner'],
    importedAt: ago(14),
    lastOpened: ago(0),
    readingTimeEstimate: '~20 hours',
  };

  await db.transaction('rw', [
    db.books, db.flashcards, db.flashcardDecks, db.quizzes, db.quizAttempts,
    db.exercises, db.exerciseResults, db.userAchievements, db.chapterProgress,
    db.learningStats, db.studyCalendarEntries, db.continueLearning,
  ], async () => {
    await db.books.add(book);
    await db.flashcards.bulkAdd(flashcards);
    await db.flashcardDecks.bulkAdd(flashcardDecks);
    await db.quizzes.bulkAdd(quizzes);
    await db.quizAttempts.bulkAdd(quizAttempts);
    await db.exercises.bulkAdd(exercises);
    await db.exerciseResults.bulkAdd(exerciseResults);
    await db.userAchievements.bulkAdd(userAchievements);
    await db.chapterProgress.bulkAdd(chapterProgressItems);
    await db.learningStats.add(learningStats);
    await db.studyCalendarEntries.bulkAdd(studyCalendarEntries);
    await db.continueLearning.add(continueLearning);
  });

  console.log('[Seed] Python Crash Course book seeded successfully!');
  console.log(`[Seed] Navigate to /library/${PYTHON_BOOK_ID}/learn to see the Learning Center.`);
  return PYTHON_BOOK_ID;
}
