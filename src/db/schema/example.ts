import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const ExampleTable = pgTable('example', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
});
