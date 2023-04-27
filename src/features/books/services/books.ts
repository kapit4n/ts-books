import CRUDService from '../../../services/CRUDService.interface';
import { IBook } from '../../../@types/book';
import Fetch from '../../../lib/fetch';

export default class BooksService implements CRUDService<IBook> {
  url = "http://locahost:7000/api"
  fetcher = new Fetch<IBook>("books")

  async getAll(): Promise<IBook[]> {
    return await this.fetcher.get("")
  }

  async getById(id: number): Promise<IBook> {
    return await this.fetcher.getById(id)
  }

  async save(book: IBook): Promise<IBook> {
    return await this.fetcher.post(book)
  }
  
  async update(id: number, book: IBook): Promise<IBook> {
    return await this.fetcher.put(id, book)
  }

  async delete(id: number): Promise<void> {
    return await this.fetcher.delete(id)
  }  
}