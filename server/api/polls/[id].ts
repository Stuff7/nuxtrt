export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params!.id);
  if (isNaN(id)) {
    return `Invalid id ${event.context.params!.id}`;
  }
  return await getPollById(id);
});
