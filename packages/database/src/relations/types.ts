import type {
  ExtractTablesFromSchema,
  RelationsBuilder,
  RelationsBuilderConfig,
} from 'drizzle-orm';
import type * as schema from '../schema';

export type DatabaseSchemaTables = ExtractTablesFromSchema<typeof schema>;
export type RelationsHelper = RelationsBuilder<DatabaseSchemaTables>;
export type ModuleRelationsConfig =
  RelationsBuilderConfig<DatabaseSchemaTables>;
