import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core'

export const buildings = mysqlTable('buildings', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdTimestamp: timestamp('created_timestamp').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  updateTimestamp: timestamp('update_timestamp').defaultNow().notNull(),
  updatedBy: varchar('updated_by', { length: 255 }).notNull()
})

export const rooms = mysqlTable('rooms', {
  id: varchar('id', { length: 50 }).primaryKey(),
  buildingId: varchar('building_id', { length: 50 })
    .notNull()
    .references(() => buildings.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdTimestamp: timestamp('created_timestamp').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  updateTimestamp: timestamp('update_timestamp').defaultNow().notNull(),
  updatedBy: varchar('updated_by', { length: 255 }).notNull()
})
