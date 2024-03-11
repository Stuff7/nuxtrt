import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  question: text("question").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PollInsert = typeof polls.$inferInsert;
export type PollSelect = typeof polls.$inferSelect;

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id),
  text: text("text").notNull(),
});

export type OptionSelect = typeof options.$inferSelect;
export type OptionInsert = typeof options.$inferInsert;

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id),
  optionId: integer("option_id").references(() => options.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ResponseSelect = typeof responses.$inferSelect;
export type ResponseInsert = typeof responses.$inferInsert;

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id),
  user: text("user").notNull(),
  msg: text("msg").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ChatSelect = typeof chats.$inferSelect;
export type ChatInsert = typeof chats.$inferInsert;
