export default defineEventHandler(async (event) => {
  const pollId = parseInt(event.context.params!.pollId);
  if (isNaN(pollId)) {
    return `Invalid pollId ${event.context.params!.pollId}`;
  }

  switch (event.method) {
    case "GET": return getChatByPollId(pollId);
    case "DELETE": return deleteChat(pollId);
    default: {
      setResponseStatus(event, 405);
      return;
    }
  }
});
