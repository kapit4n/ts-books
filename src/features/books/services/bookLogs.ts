import CRUDService from '../../../services/CRUDService.interface';
import Fetch from '../../../lib/fetch';
import { IBookLog } from '../../../@types/bookLog';

export default class BookLogsService implements CRUDService<IBookLog> {
  url = "http://locahost:7000/api"
  fetcher = new Fetch<IBookLog>("bookLogs")

  async getAll(bookId: number): Promise<IBookLog[]> {
    return await this.fetcher.get(`bookId=${bookId}`)
  }

  async save(book: IBookLog): Promise<IBookLog> {
    return await this.fetcher.post(book)
  }

  async getById(bookId: number): Promise<IBookLog> {
    return {} as IBookLog
  }
  async update(id: number, bookLog: IBookLog): Promise<IBookLog> {
    return {} as IBookLog
  }
  

  delete(id: number): void {
    
  }  
}