export default defineEventHandler(async (event) => {
  const body: Omit<PollInsert, "createdAt" | "id"> & { options: string | string[] } = await readBody(event);
  const { id: pollId } = await insertPoll(body);
  const options = typeof body.options === "string" ? [body.options] : body.options;
  await insertOptions(options, pollId);

  return sendRedirect(event, `/polls/${pollId}`, 302);
});
