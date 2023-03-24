import CRUDService from '../../../services/CRUDService.interface';

export default class BooksService implements CRUDService<string> {
  url = "http://locahost:7000/api"

  getAll() {
    return ""
  }

  getById(id: number): string {
    return ""
  }

  save(book: string): string {
    return "saved"
  }
  
  update(id: number, book: string): string {
    return "updated"
  }

  delete(id: number): void {
    
  }


  
}