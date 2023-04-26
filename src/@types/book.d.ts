export interface IBook {
  id: number;
  name: string;
  author: string;
  description?: string;
  feedback?: string;
  image?: string;
  price?: number;
  pages?: number;
  readPages?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
