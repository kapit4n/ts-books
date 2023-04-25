export interface IBook {
  id: number;
  name: string;
  author: string;
  description?: string;
  image?: string;
  price?: number;
  pages?: number;
  createdAt?: Date;
  updatedAt?: Date;
}