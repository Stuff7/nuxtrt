import {
  EV_REM,
  parseMsg,
  EV_ADD,
  type WsSubscription,
  type WsEventName,
  parseDbEntry,
  type ChatEvent,
  type ChatRequest,
  type WsServerEvent,
  type CallRequest,
} from "../utils/ws";

export default defineNuxtPlugin(async () => {
  const realtime = await socketEvents();
  return {
    provide: {
      realtime,
    },
  };
});

function socketEvents() {
  const protocol = location.protocol.startsWith("https") ? "wss" : "ws";
  const url = `${protocol}://${location.host}/ws`;
  const socket = new WebSocket(url);
  return new Promise<Realtime>((resolve, reject) => {
    socket.onopen = () => {
      socket.onmessage = ({ data }) => {
        if (typeof data !== "string") {
          return;
        }

        const ev = parseMsg(data, d => d);
        if (ev.status !== "event") {
          return;
        }
        const evData = parseDbEntry<WsServerEvent[typeof ev.name]>(ev.data);

        EVENTS.forEach(e => {
          if (e.name !== ev.name) {
            return;
          }

          if (e.pollId === evData.pollId) {
            e.handler(evData as Poll & ChatEvent & CallRequest);
          }
        });
      };

      const addSocketEvent = (eventName: WsSubscription) => {
        socket.send(`${EV_ADD}${eventName}`);
      };

      const removeSocketEvent = (eventName: WsSubscription) => {
        socket.send(`${EV_REM}${eventName}`);
      };

      resolve({
        on(eventName, pollId, handler) {
          const evName = `${eventName}:${pollId}` as const;
          const ev = parseMsg(evName, Number);
          if (ev.status !== "event") {
            return handler;
          }

          EVENTS.push({
            name: ev.name,
            handler,
            pollId: ev.data,
          } as WsClientEvent);

          addSocketEvent(evName);
          return handler;
        },
        off(eventName, pollId, handler) {
          const evName = `${eventName}:${pollId}` as const;
          const ev = parseMsg(evName, Number);
          if (ev.status !== "event") {
            return handler;
          }

          const idx = EVENTS.findIndex(e => e.pollId === ev.data && e.handler === handler);
          if (idx === -1) {
            return;
          }

          EVENTS[idx] = EVENTS[EVENTS.length - 1];
          EVENTS.length--;
          if (EVENTS.length === 0) {
            removeSocketEvent(evName);
          }
        },
        close() {
          EVENTS.forEach((e) => {
            removeSocketEvent(`chat:${e.pollId}`);
            removeSocketEvent(`vote:${e.pollId}`);
          });
          socket.close(3000, "Bye!");
        },
        vote(vote: ResponseInsert) {
          socket.send(`vote:${JSON.stringify(vote)}`);
        },
        chat(ev: ChatRequest) {
          socket.send(`chat:${JSON.stringify(ev)}`);
        },
        call(ev: CallRequest) {
          socket.send(`call:${JSON.stringify(ev)}`);
        },
      });
    };

    socket.onerror = (error) => {
      console.error("Error in WebSocket", error);
      reject(error);
    };
  });
}

const EVENTS: WsClientEvent[] = [];

export type Realtime = {
  on<T extends WsEventName>(eventName: T, pollId: number, handler: EventHandler<T>): EventHandler<T>,
  off<T extends WsEventName>(eventName: T, pollId: number, handler: EventHandler<T>): void,
  close(): void,
  vote(vote: ResponseInsert): void,
  chat(chat: ChatRequest): void,
  call(call: CallRequest): void,
};

type EventHandler<T extends WsEventName> = EventHandlers[T];
type EventHandlers = {
  vote: VoteEventHandler,
  chat: ChatEventHandler,
  call: CallEventHandler,
}

type VoteEventHandler = (poll: Poll) => void;
type ChatEventHandler = (chat: ChatEvent) => void;
type CallEventHandler = (call: CallRequest) => void;

type WsEvGen<T extends WsEventName> = { name: T, handler: EventHandler<T> };

type WsClientEvent = { pollId: number } & (WsEvGen<"chat"> | WsEvGen<"vote"> | WsEvGen<"call">);
