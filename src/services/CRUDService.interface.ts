
/**
 * Genetic crud interface
 */
export default interface CRUDService<T> {
  getAll(parentId?: number): Promise<T[]>;
  getById(id: number): Promise<T>;
  save(data: T): Promise<T>;
  update(id: number, data: T): Promise<T>;
  delete(id: number): void;
}
