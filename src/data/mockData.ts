export interface Chapter {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  order: number;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  author: string;
  version: string;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  readingTime: string;
  category: string;
  updatedAt: string;
  tags: string[];
  progress?: number;
  chapters: Chapter[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  bookCount: number;
}

export interface ReadingProgress {
  bookId: string;
  currentChapterId: string | null;
  completedChapters: string[];
  percentage: number;
  lastOpened: string;
}

export const categories: Category[] = [
  {
    id: 'ts-basics',
    title: 'TypeScript Basics',
    description: 'Learn the fundamentals of TypeScript',
    icon: 'Code',
    bookCount: 3,
  },
  {
    id: 'advanced-types',
    title: 'Advanced Types',
    description: 'Master complex type system features',
    icon: 'Layers',
    bookCount: 2,
  },
  {
    id: 'interfaces',
    title: 'Interfaces',
    description: 'Define contracts and shapes',
    icon: 'FileCode',
    bookCount: 2,
  },
  {
    id: 'generics',
    title: 'Generics',
    description: 'Write flexible, reusable code',
    icon: 'Puzzle',
    bookCount: 2,
  },
  {
    id: 'utility-types',
    title: 'Utility Types',
    description: 'Transform and manipulate types',
    icon: 'Wrench',
    bookCount: 1,
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    description: 'Architecture and best practices',
    icon: 'Layout',
    bookCount: 2,
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Data structures and algorithms in TS',
    icon: 'Binary',
    bookCount: 1,
  },
  {
    id: 'testing',
    title: 'Testing',
    description: 'Write reliable tests with TypeScript',
    icon: 'TestTube',
    bookCount: 1,
  },
];

export const books: Book[] = [
  {
    id: '1',
    slug: 'typescript-fundamentals',
    title: 'TypeScript Fundamentals',
    description: 'A comprehensive guide to getting started with TypeScript. Learn about types, interfaces, and the type compiler.',
    cover: '📘',
    author: 'Sarah Chen',
    version: '2.1',
    language: 'English',
    difficulty: 'Beginner',
    rating: 4.8,
    readingTime: '4 hours',
    category: 'TypeScript Basics',
    updatedAt: '2024-01-15',
    tags: ['typescript', 'fundamentals', 'beginner', 'types'],
    progress: 65,
    chapters: [
      { id: 'c1', title: 'What is TypeScript?', description: 'Introduction to TypeScript and its benefits', estimatedTime: '15 min', difficulty: 'Beginner', completed: true, order: 1 },
      { id: 'c2', title: 'Setting Up Your Environment', description: 'Install TypeScript and configure your project', estimatedTime: '20 min', difficulty: 'Beginner', completed: true, order: 2 },
      { id: 'c3', title: 'Basic Types', description: 'String, number, boolean, and more', estimatedTime: '30 min', difficulty: 'Beginner', completed: true, order: 3 },
      { id: 'c4', title: 'Functions', description: 'Type annotations for functions', estimatedTime: '25 min', difficulty: 'Beginner', completed: true, order: 4 },
      { id: 'c5', title: 'Interfaces', description: 'Define object shapes', estimatedTime: '35 min', difficulty: 'Beginner', completed: true, order: 5 },
      { id: 'c6', title: 'Classes', description: 'Object-oriented programming in TypeScript', estimatedTime: '40 min', difficulty: 'Beginner', completed: true, order: 6 },
      { id: 'c7', title: 'Arrays and Tuples', description: 'Working with collections', estimatedTime: '25 min', difficulty: 'Beginner', completed: true, order: 7 },
      { id: 'c8', title: 'Enums', description: 'Enumeration types', estimatedTime: '20 min', difficulty: 'Beginner', completed: true, order: 8 },
      { id: 'c9', title: 'Type Assertions', description: 'Tell TypeScript about types', estimatedTime: '15 min', difficulty: 'Beginner', completed: false, order: 9 },
      { id: 'c10', title: 'Union and Intersection', description: 'Combining types', estimatedTime: '30 min', difficulty: 'Beginner', completed: false, order: 10 },
      { id: 'c11', title: 'Generics Basics', description: 'Introduction to generics', estimatedTime: '35 min', difficulty: 'Beginner', completed: false, order: 11 },
      { id: 'c12', title: 'Next Steps', description: 'Where to go from here', estimatedTime: '10 min', difficulty: 'Beginner', completed: false, order: 12 },
    ],
  },
  {
    id: '2',
    slug: 'advanced-typescript-patterns',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced type system features including conditional types, mapped types, and type inference.',
    cover: '📕',
    author: 'Michael Rodriguez',
    version: '1.5',
    language: 'English',
    difficulty: 'Advanced',
    rating: 4.9,
    readingTime: '6 hours',
    category: 'Advanced Types',
    updatedAt: '2024-01-10',
    tags: ['typescript', 'advanced', 'patterns', 'generics'],
    chapters: [
      { id: 'c1', title: 'Conditional Types', description: 'Types that depend on other types', estimatedTime: '45 min', difficulty: 'Advanced', completed: true, order: 1 },
      { id: 'c2', title: 'Mapped Types', description: 'Transform existing types', estimatedTime: '40 min', difficulty: 'Advanced', completed: true, order: 2 },
      { id: 'c3', title: 'Template Literal Types', description: 'String manipulation at the type level', estimatedTime: '35 min', difficulty: 'Advanced', completed: true, order: 3 },
      { id: 'c4', title: 'Infer Keyword', description: 'Extract types from other types', estimatedTime: '30 min', difficulty: 'Advanced', completed: false, order: 4 },
      { id: 'c5', title: 'Recursive Types', description: 'Types that reference themselves', estimatedTime: '40 min', difficulty: 'Advanced', completed: false, order: 5 },
      { id: 'c6', title: 'Type Guards', description: 'Runtime type checking', estimatedTime: '35 min', difficulty: 'Advanced', completed: false, order: 6 },
      { id: 'c7', title: 'Discriminated Unions', description: 'Pattern matching with types', estimatedTime: '45 min', difficulty: 'Advanced', completed: false, order: 7 },
      { id: 'c8', title: 'Branded Types', description: 'Nominal typing in TypeScript', estimatedTime: '30 min', difficulty: 'Advanced', completed: false, order: 8 },
      { id: 'c9', title: 'Type-Level Programming', description: 'Compute types at compile time', estimatedTime: '50 min', difficulty: 'Advanced', completed: false, order: 9 },
      { id: 'c10', title: 'Real-World Examples', description: 'Applying advanced patterns', estimatedTime: '60 min', difficulty: 'Advanced', completed: false, order: 10 },
    ],
  },
  {
    id: '3',
    slug: 'react-with-typescript',
    title: 'React with TypeScript',
    description: 'Build modern React applications with TypeScript. Covers hooks, context, and component patterns.',
    cover: '📗',
    author: 'Emily Watson',
    version: '3.0',
    language: 'English',
    difficulty: 'Intermediate',
    rating: 4.7,
    readingTime: '5 hours',
    category: 'Design Patterns',
    updatedAt: '2024-01-08',
    tags: ['react', 'typescript', 'hooks', 'patterns'],
    chapters: [
      { id: 'c1', title: 'React + TS Setup', description: 'Configure a React TypeScript project', estimatedTime: '20 min', difficulty: 'Intermediate', completed: true, order: 1 },
      { id: 'c2', title: 'Component Types', description: 'Typing React components', estimatedTime: '30 min', difficulty: 'Intermediate', completed: true, order: 2 },
      { id: 'c3', title: 'Props and State', description: 'Type safety for props and state', estimatedTime: '35 min', difficulty: 'Intermediate', completed: true, order: 3 },
      { id: 'c4', title: 'Hooks with TypeScript', description: 'use useState, useEffect, and custom hooks', estimatedTime: '45 min', difficulty: 'Intermediate', completed: false, order: 4 },
      { id: 'c5', title: 'Context API', description: 'Typed context and providers', estimatedTime: '30 min', difficulty: 'Intermediate', completed: false, order: 5 },
      { id: 'c6', title: 'Form Handling', description: 'Type-safe form management', estimatedTime: '40 min', difficulty: 'Intermediate', completed: false, order: 6 },
      { id: 'c7', title: 'API Integration', description: 'Typed API calls and data fetching', estimatedTime: '35 min', difficulty: 'Intermediate', completed: false, order: 7 },
      { id: 'c8', title: 'Performance Patterns', description: 'Optimization with TypeScript', estimatedTime: '30 min', difficulty: 'Intermediate', completed: false, order: 8 },
    ],
  },
  {
    id: '4',
    slug: 'typescript-generics-deep-dive',
    title: 'TypeScript Generics Deep Dive',
    description: 'Master generics to write flexible and reusable code. From basics to advanced patterns.',
    cover: '📙',
    author: 'David Kim',
    version: '1.2',
    language: 'English',
    difficulty: 'Intermediate',
    rating: 4.6,
    readingTime: '3 hours',
    category: 'Generics',
    updatedAt: '2024-01-05',
    tags: ['typescript', 'generics', 'intermediate', 'reusability'],
    progress: 30,
    chapters: [
      { id: 'c1', title: 'Why Generics?', description: 'Understanding the need for generics', estimatedTime: '15 min', difficulty: 'Intermediate', completed: true, order: 1 },
      { id: 'c2', title: 'Generic Functions', description: 'Create flexible functions', estimatedTime: '25 min', difficulty: 'Intermediate', completed: true, order: 2 },
      { id: 'c3', title: 'Generic Interfaces', description: 'Type-safe interfaces', estimatedTime: '30 min', difficulty: 'Intermediate', completed: true, order: 3 },
      { id: 'c4', title: 'Generic Classes', description: 'Reusable class definitions', estimatedTime: '35 min', difficulty: 'Intermediate', completed: false, order: 4 },
      { id: 'c5', title: 'Constraints', description: 'Limit generic types', estimatedTime: '25 min', difficulty: 'Intermediate', completed: false, order: 5 },
      { id: 'c6', title: 'Default Types', description: 'Provide type defaults', estimatedTime: '20 min', difficulty: 'Intermediate', completed: false, order: 6 },
      { id: 'c7', title: 'Advanced Patterns', description: 'Real-world generic patterns', estimatedTime: '40 min', difficulty: 'Intermediate', completed: false, order: 7 },
      { id: 'c8', title: 'Common Utilities', description: 'Build your own utility types', estimatedTime: '30 min', difficulty: 'Intermediate', completed: false, order: 8 },
      { id: 'c9', title: 'Best Practices', description: 'When and how to use generics', estimatedTime: '20 min', difficulty: 'Intermediate', completed: false, order: 9 },
      { id: 'c10', title: 'Exercises', description: 'Practice what you learned', estimatedTime: '45 min', difficulty: 'Intermediate', completed: false, order: 10 },
    ],
  },
  {
    id: '5',
    slug: 'interfaces-and-type-aliases',
    title: 'Interfaces and Type Aliases',
    description: 'Understand the power of interfaces and type aliases in TypeScript. Learn when to use each.',
    cover: '📓',
    author: 'Lisa Park',
    version: '1.0',
    language: 'English',
    difficulty: 'Beginner',
    rating: 4.5,
    readingTime: '2 hours',
    category: 'Interfaces',
    updatedAt: '2024-01-03',
    tags: ['typescript', 'interfaces', 'types', 'beginner'],
    chapters: [
      { id: 'c1', title: 'What are Interfaces?', description: 'Introduction to interfaces', estimatedTime: '20 min', difficulty: 'Beginner', completed: true, order: 1 },
      { id: 'c2', title: 'What are Type Aliases?', description: 'Understanding type aliases', estimatedTime: '20 min', difficulty: 'Beginner', completed: true, order: 2 },
      { id: 'c3', title: 'Interfaces vs Type Aliases', description: 'When to use each', estimatedTime: '25 min', difficulty: 'Beginner', completed: true, order: 3 },
      { id: 'c4', title: 'Extending Types', description: 'Inheritance in types', estimatedTime: '30 min', difficulty: 'Beginner', completed: false, order: 4 },
      { id: 'c5', title: 'Declaration Merging', description: 'Combining interface declarations', estimatedTime: '20 min', difficulty: 'Beginner', completed: false, order: 5 },
      { id: 'c6', title: 'Index Signatures', description: 'Flexible object types', estimatedTime: '25 min', difficulty: 'Beginner', completed: false, order: 6 },
      { id: 'c7', title: 'Real Examples', description: 'Practical usage patterns', estimatedTime: '30 min', difficulty: 'Beginner', completed: false, order: 7 },
      { id: 'c8', title: 'Best Practices', description: 'Tips and conventions', estimatedTime: '15 min', difficulty: 'Beginner', completed: false, order: 8 },
    ],
  },
  {
    id: '6',
    slug: 'typescript-utility-types',
    title: 'TypeScript Utility Types',
    description: 'Explore built-in utility types and learn to create your own type transformations.',
    cover: '📔',
    author: 'James Liu',
    version: '1.3',
    language: 'English',
    difficulty: 'Intermediate',
    rating: 4.4,
    readingTime: '3 hours',
    category: 'Utility Types',
    updatedAt: '2024-01-01',
    tags: ['typescript', 'utility-types', 'advanced', 'transforms'],
    chapters: [
      { id: 'c1', title: 'Overview', description: 'What are utility types?', estimatedTime: '15 min', difficulty: 'Intermediate', completed: true, order: 1 },
      { id: 'c2', title: 'Partial and Required', description: 'Make properties optional or required', estimatedTime: '25 min', difficulty: 'Intermediate', completed: true, order: 2 },
      { id: 'c3', title: 'Pick and Omit', description: 'Select or exclude properties', estimatedTime: '30 min', difficulty: 'Intermediate', completed: true, order: 3 },
      { id: 'c4', title: 'Record and Readonly', description: 'Object types', estimatedTime: '25 min', difficulty: 'Intermediate', completed: true, order: 4 },
      { id: 'c5', title: 'ReturnType and Parameters', description: 'Extract function types', estimatedTime: '30 min', difficulty: 'Intermediate', completed: false, order: 5 },
      { id: 'c6', title: 'Exclude and Extract', description: 'Filter union types', estimatedTime: '25 min', difficulty: 'Intermediate', completed: false, order: 6 },
      { id: 'c7', title: 'NonNullable and Awaited', description: 'Special type transformations', estimatedTime: '20 min', difficulty: 'Intermediate', completed: false, order: 7 },
      { id: 'c8', title: 'Custom Utility Types', description: 'Build your own', estimatedTime: '35 min', difficulty: 'Intermediate', completed: false, order: 8 },
    ],
  },
  {
    id: '7',
    slug: 'testing-typescript-applications',
    title: 'Testing TypeScript Applications',
    description: 'Write reliable tests using Jest and React Testing Library with TypeScript.',
    cover: '📒',
    author: 'Anna Martinez',
    version: '2.0',
    language: 'English',
    difficulty: 'Intermediate',
    rating: 4.3,
    readingTime: '4 hours',
    category: 'Testing',
    updatedAt: '2023-12-28',
    tags: ['testing', 'jest', 'typescript', 'react'],
    chapters: [
      { id: 'c1', title: 'Testing Philosophy', description: 'Why test?', estimatedTime: '15 min', difficulty: 'Intermediate', completed: true, order: 1 },
      { id: 'c2', title: 'Jest Setup', description: 'Configure Jest with TypeScript', estimatedTime: '20 min', difficulty: 'Intermediate', completed: true, order: 2 },
      { id: 'c3', title: 'Unit Testing', description: 'Write unit tests', estimatedTime: '35 min', difficulty: 'Intermediate', completed: false, order: 3 },
      { id: 'c4', title: 'Integration Testing', description: 'Test component integration', estimatedTime: '40 min', difficulty: 'Intermediate', completed: false, order: 4 },
      { id: 'c5', title: 'React Testing Library', description: 'Component testing', estimatedTime: '45 min', difficulty: 'Intermediate', completed: false, order: 5 },
      { id: 'c6', title: 'Mocking', description: 'Mock modules and APIs', estimatedTime: '30 min', difficulty: 'Intermediate', completed: false, order: 6 },
      { id: 'c7', title: 'Coverage Reports', description: 'Measure test coverage', estimatedTime: '20 min', difficulty: 'Intermediate', completed: false, order: 7 },
      { id: 'c8', title: 'CI/CD Integration', description: 'Automate testing', estimatedTime: '25 min', difficulty: 'Intermediate', completed: false, order: 8 },
    ],
  },
  {
    id: '8',
    slug: 'typescript-design-patterns',
    title: 'TypeScript Design Patterns',
    description: 'Implement classic design patterns using TypeScript. Singleton, Factory, Observer, and more.',
    cover: '📕',
    author: 'Robert Taylor',
    version: '1.1',
    language: 'English',
    difficulty: 'Advanced',
    rating: 4.7,
    readingTime: '5 hours',
    category: 'Design Patterns',
    updatedAt: '2023-12-25',
    tags: ['typescript', 'design-patterns', 'advanced', 'architecture'],
    chapters: [
      { id: 'c1', title: 'Why Design Patterns?', description: 'Importance of patterns', estimatedTime: '20 min', difficulty: 'Advanced', completed: true, order: 1 },
      { id: 'c2', title: 'Singleton Pattern', description: 'Single instance classes', estimatedTime: '30 min', difficulty: 'Advanced', completed: true, order: 2 },
      { id: 'c3', title: 'Factory Pattern', description: 'Object creation', estimatedTime: '35 min', difficulty: 'Advanced', completed: true, order: 3 },
      { id: 'c4', title: 'Observer Pattern', description: 'Event-driven design', estimatedTime: '40 min', difficulty: 'Advanced', completed: false, order: 4 },
      { id: 'c5', title: 'Strategy Pattern', description: 'Algorithm selection', estimatedTime: '35 min', difficulty: 'Advanced', completed: false, order: 5 },
      { id: 'c6', title: 'Decorator Pattern', description: 'Extending functionality', estimatedTime: '30 min', difficulty: 'Advanced', completed: false, order: 6 },
      { id: 'c7', title: 'Adapter Pattern', description: 'Interface compatibility', estimatedTime: '25 min', difficulty: 'Advanced', completed: false, order: 7 },
      { id: 'c8', title: 'Composite Pattern', description: 'Tree structures', estimatedTime: '35 min', difficulty: 'Advanced', completed: false, order: 8 },
      { id: 'c9', title: 'Command Pattern', description: 'Encapsulate actions', estimatedTime: '30 min', difficulty: 'Advanced', completed: false, order: 9 },
      { id: 'c10', title: 'Putting It Together', description: 'Combining patterns', estimatedTime: '45 min', difficulty: 'Advanced', completed: false, order: 10 },
    ],
  },
];

export const featuredBook: Book = books[0];
export const continueReadingBook: Book = books[3];
export const popularBooks: Book[] = [books[1], books[2], books[5], books[7]];
export const recentlyUpdated: Book[] = [books[0], books[1], books[2], books[3]];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function getRelatedBooks(book: Book, count: number = 3): Book[] {
  return books
    .filter((b) => b.category === book.category && b.id !== book.id)
    .slice(0, count);
}

export function getReadingProgress(bookId: string): ReadingProgress | null {
  const stored = localStorage.getItem(`reading-progress-${bookId}`);
  return stored ? JSON.parse(stored) : null;
}

export function saveReadingProgress(progress: ReadingProgress): void {
  localStorage.setItem(`reading-progress-${progress.bookId}`, JSON.stringify(progress));
}
