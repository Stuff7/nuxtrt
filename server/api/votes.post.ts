export default defineEventHandler(async (event) => {
  const body: Omit<ResponseInsert, "createdAt" | "id"> = await readBody(event);
  return await insertResponse(body);
});
