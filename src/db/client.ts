import { ExampleTable } from './schema/example';

export * from 'drizzle-orm';

// スキーマをオブジェクトとしてエクスポート
export const schema = {
  example: ExampleTable,
};
