export interface Book {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readingTime: string;
  chapters: number;
  rating: number;
  category: string;
  cover: string;
  updatedAt: string;
  progress?: number;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  bookCount: number;
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
    title: 'TypeScript Fundamentals',
    description: 'A comprehensive guide to getting started with TypeScript. Learn about types, interfaces, and the type compiler.',
    difficulty: 'Beginner',
    readingTime: '4 hours',
    chapters: 12,
    rating: 4.8,
    category: 'TypeScript Basics',
    cover: '📘',
    updatedAt: '2024-01-15',
    progress: 65,
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced type system features including conditional types, mapped types, and type inference.',
    difficulty: 'Advanced',
    readingTime: '6 hours',
    chapters: 18,
    rating: 4.9,
    category: 'Advanced Types',
    cover: '📕',
    updatedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'React with TypeScript',
    description: 'Build modern React applications with TypeScript. Covers hooks, context, and component patterns.',
    difficulty: 'Intermediate',
    readingTime: '5 hours',
    chapters: 15,
    rating: 4.7,
    category: 'Design Patterns',
    cover: '📗',
    updatedAt: '2024-01-08',
  },
  {
    id: '4',
    title: 'TypeScript Generics Deep Dive',
    description: 'Master generics to write flexible and reusable code. From basics to advanced patterns.',
    difficulty: 'Intermediate',
    readingTime: '3 hours',
    chapters: 10,
    rating: 4.6,
    category: 'Generics',
    cover: '📙',
    updatedAt: '2024-01-05',
    progress: 30,
  },
  {
    id: '5',
    title: 'Interfaces and Type Aliases',
    description: 'Understand the power of interfaces and type aliases in TypeScript. Learn when to use each.',
    difficulty: 'Beginner',
    readingTime: '2 hours',
    chapters: 8,
    rating: 4.5,
    category: 'Interfaces',
    cover: '📓',
    updatedAt: '2024-01-03',
  },
  {
    id: '6',
    title: 'TypeScript Utility Types',
    description: 'Explore built-in utility types and learn to create your own type transformations.',
    difficulty: 'Intermediate',
    readingTime: '3 hours',
    chapters: 11,
    rating: 4.4,
    category: 'Utility Types',
    cover: '📔',
    updatedAt: '2024-01-01',
  },
  {
    id: '7',
    title: 'Testing TypeScript Applications',
    description: 'Write reliable tests using Jest and React Testing Library with TypeScript.',
    difficulty: 'Intermediate',
    readingTime: '4 hours',
    chapters: 14,
    rating: 4.3,
    category: 'Testing',
    cover: '📒',
    updatedAt: '2023-12-28',
  },
  {
    id: '8',
    title: 'TypeScript Design Patterns',
    description: 'Implement classic design patterns using TypeScript. Singleton, Factory, Observer, and more.',
    difficulty: 'Advanced',
    readingTime: '5 hours',
    chapters: 16,
    rating: 4.7,
    category: 'Design Patterns',
    cover: '📕',
    updatedAt: '2023-12-25',
  },
];

export const featuredBook: Book = books[0];

export const continueReading: Book = books[3];

export const popularBooks: Book[] = [books[1], books[2], books[5], books[7]];

export const recentlyUpdated: Book[] = [books[0], books[1], books[2], books[3]];
