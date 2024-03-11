import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { sql, count, eq, sum } from "drizzle-orm";

if (!process.env.DB) {
  throw new Error("Missing DB env");
}

const queryClient = postgres(process.env.DB);
const db = drizzle(queryClient);

export type Poll = Omit<schema.PollSelect, "id"> & {
  pollId: number,
  options: {
    id: number,
    text: string,
    count: number,
    percent: number,
  }[],
  totalVotes: number,
};

export async function getPollById(id: number): Promise<Poll> {
  const votes = count(schema.responses.id);
  const sumVotes = sum(votes);
  const matches = await db.select({
    createdAt: schema.polls.createdAt,
    pollId: schema.polls.id,
    title: schema.polls.title,
    description: schema.polls.description,
    question: schema.polls.question,
    options: {
      id: schema.options.id,
      text: schema.options.text,
      count: votes,
      percent: sql`case
        when ${votes} > 0 then (${votes} * 100.0 / ${sumVotes} over (partition by ${schema.polls.id}))
        else 0 end`.mapWith(Number),
    },
    totalVotes: sql`${sumVotes} over (partition by ${schema.polls.id})`.mapWith(Number),
  })
    .from(schema.polls)
    .leftJoin(schema.options, eq(schema.polls.id, schema.options.pollId))
    .leftJoin(schema.responses, eq(schema.options.id, schema.responses.optionId))
    .where(eq(schema.polls.id, id))
    .groupBy(schema.polls.id, schema.options.id)
    .orderBy(schema.options.id);
  return {
    ...matches[0],
    options: matches.map(m => m.options).filter((o): o is Poll["options"][number] => !!o),
  };
}

export async function insertResponse(response: schema.ResponseInsert): Promise<schema.ResponseSelect[]> {
  return db.insert(schema.responses).values(response).returning();
}

export async function insertPoll(poll: schema.PollInsert): Promise<schema.PollSelect> {
  return (await db.insert(schema.polls).values(poll).returning())[0];
}

export async function insertOptions(options: string[], pollId: number): Promise<schema.OptionSelect[]> {
  return db.insert(schema.options).values(options.map(text => ({ text, pollId }))).returning();
}

export async function clearPolls(): Promise<schema.PollSelect[]> {
  await db.delete(schema.chats);
  await db.delete(schema.responses);
  await db.delete(schema.options);
  return db.delete(schema.polls).returning();
}

export async function deleteChat(pollId: number): Promise<schema.ChatSelect[]> {
  return db.delete(schema.chats).where(eq(schema.chats.pollId, pollId));
}

export async function listPolls(): Promise<schema.PollSelect[]> {
  return db.select().from(schema.polls);
}

export async function insertChat(chat: schema.ChatInsert): Promise<schema.ChatSelect> {
  return (await db.insert(schema.chats).values(chat).returning())[0];
}

export async function getChatByPollId(pollId: number): Promise<schema.ChatSelect[]> {
  return db.select().from(schema.chats).where(eq(schema.chats.pollId, pollId));
}
