import { BaseFacade, type StoreWithLoading } from './BaseFacade';
import { PAGINATION } from '../../constants/pagination';

export interface CrudService<TEntity, TCreateDto, TUpdateDto, TFilters> {
  getAll(filters?: TFilters, page?: number, size?: number): Promise<{
    content: TEntity[];
    total: number;
    page: number;
    size?: number;
  }>;
  getById(id: number): Promise<TEntity>;
  create(data: TCreateDto): Promise<TEntity>;
  update(id: number, data: TUpdateDto): Promise<TEntity>;
  delete(id: number): Promise<void>;
}

export interface CrudStore<TEntity> extends StoreWithLoading {
  setEntities?(entities: TEntity[], total: number, page: number, size?: number): void;
  setCurrentEntity?(entity: TEntity | null | undefined): void;
  removeEntity?(id: number): void;
}

export abstract class BaseCrudFacade<
  TEntity,
  TCreateDto,
  TUpdateDto,
  TFilters,
  TService extends CrudService<TEntity, TCreateDto, TUpdateDto, TFilters>,
  TStore extends CrudStore<TEntity>
> extends BaseFacade<TStore> {
  protected abstract service: TService;

  async fetchAll(filters?: TFilters, page = PAGINATION.INITIAL_PAGE, size = PAGINATION.DEFAULT_PAGE_SIZE): Promise<void> {
    return this.executeWithLoading(async () => {
      const response = await this.service.getAll(filters, page, size);
      
      if (this.store.setEntities) {
        this.store.setEntities(response.content, response.total, response.page, response.size);
      }
    });
  }

  async fetchById(id: number): Promise<TEntity> {
    return this.executeWithLoading(async () => {
      const entity = await this.service.getById(id);
      
      if (this.store.setCurrentEntity) {
        this.store.setCurrentEntity(entity);
      }
      
      return entity;
    });
  }

  async create(data: TCreateDto): Promise<TEntity> {
    return this.executeWithLoading(async () => {
      const created = await this.service.create(data);
      await this.fetchAll();
      return created;
    });
  }

  async update(id: number, data: TUpdateDto): Promise<TEntity> {
    return this.executeWithLoading(async () => {
      const updated = await this.service.update(id, data);
      await this.fetchAll();
      return updated;
    });
  }

  async delete(id: number): Promise<void> {
    return this.executeWithLoading(async () => {
      await this.service.delete(id);
      
      if (this.store.removeEntity) {
        this.store.removeEntity(id);
      }
    });
  }
}
