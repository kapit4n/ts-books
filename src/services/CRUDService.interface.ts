
/**
 * Genetic crud interface
 */
export default interface CRUDService<T> {
  getAll(): T;
  getById(id: number): T;
  save(data: T): T;
  update(id: number, data: T): T;
  delete(id: number): void;
}
