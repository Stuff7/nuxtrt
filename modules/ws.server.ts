import { insertResponse, getPollById, insertChat, deleteChat } from "../server/utils/db";
import { parseMsg, type WsEventName, EV_ADD, EV_REM, type ChatRequest, type WsServerEvent } from "../utils/ws";
import { defineNuxtModule } from "nuxt/kit";
import WebSocket from "ws";

export default defineNuxtModule((_, nuxt) => {
  nuxt.hook("listen", server => {
    server.on("upgrade", (request, socket, head) => {
      if (request.url?.replace(/^\/|\/$/g, "") === "ws") {
        server.on("close", () => wss.close());
        wss.handleUpgrade(request, socket, head, ws => {
          wss.emit("connection", ws);
        });
      }
    });
  });
});

const wss = new WebSocket.Server({ noServer: true });
type WsClient = { ws: WebSocket, pollId: number, ev: WsEventName };
const clients: WsClient[] = [];

function subscribe(ws: WebSocket, message: string) {
  const isSubscription = message.startsWith(EV_ADD) || message.startsWith(EV_REM);
  if (isSubscription) {
    const ev = parseMsg(message.slice(EV_ADD.length), Number);
    if (ev.status !== "event") {
      return true;
    }

    if (message.startsWith(EV_ADD)) {
      clients.push({ pollId: ev.data, ev: ev.name, ws });
    } else {
      const index = clients.findIndex(c => c.ws === ws && c.pollId === ev.data);
      if (index === -1) {
        return;
      }
      clients.splice(index, 1);
    }
  }

  return isSubscription;
}

function sendEvent<K extends WsEventName>(evName: K, data: WsServerEvent[K]) {
  clients.forEach(c => {
    if (c.ev === evName && c.pollId === data.pollId) {
      c.ws.send(`${evName}:${JSON.stringify(data)}`);
    }
  });
}

async function onVote(vote: ResponseInsert) {
  if (!vote.pollId) {
    return;
  }
  await insertResponse(vote);
  const poll = await getPollById(vote.pollId);
  sendEvent("vote", poll);
}

async function onChat(chat: ChatRequest) {
  if (chat.method === "delete") {
    await deleteChat(chat.pollId);
    sendEvent("chat", { type: "del:chat", who: chat.user, pollId: chat.pollId });
    return;
  }

  sendEvent("chat", { type: "new:chat", data: await insertChat(chat), pollId: chat.pollId });
}

async function onCall(call: CallRequest) {
  sendEvent("call", call);
}

wss.on("connection", ws => {
  ws.on("message", message => {
    console.log("Received: %s", message);
    const msg = message.toString();
    if (!subscribe(ws, msg)) {
      const ev = parseMsg(msg, d => d);
      if (ev.status !== "event") {
        return;
      }

      switch (ev.name) {
        case "vote": return onVote(JSON.parse(ev.data));
        case "chat": return onChat(JSON.parse(ev.data));
        case "call": return onCall(JSON.parse(ev.data));
      }
    }
  });

  ws.on("close", () => {
    console.log("Disconnected", ws.url);
    let i = 0, j = 0;

    while (i < clients.length) {
      const c = clients[i];
      if (c.ws !== ws) { clients[j++] = c }
      i++;
    }

    clients.length = j;
  });
});
