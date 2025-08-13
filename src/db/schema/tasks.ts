import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for tasks
export const selectTasksSchema = createSelectSchema(tasks);
export const insertTasksSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const patchTasksSchema = insertTasksSchema.partial();