import { Category } from '../../Category';

export interface ICategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findByWorkspaceId(workspaceId: string): Promise<Category[]>;
  findByIds(ids: string[]): Promise<Category[]>;
  existsByNameInWorkspace(name: string, workspaceId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
