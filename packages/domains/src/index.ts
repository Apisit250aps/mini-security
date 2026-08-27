export abstract class BaseUseCase<Context, TOutput> {
  abstract execute(context: Context): Promise<TOutput>;
}

export abstract class BaseRepository<T, Create, Update> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(entity: Create): Promise<T>;
  abstract update(id: string, entity: Update): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

export * from './lib/entity';
export * from './entities';
