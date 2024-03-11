const EV_NAMES = ["vote", "chat", "call"] as const;
export const EV_ADD = "event:add:" as const;
export const EV_REM = "event:rem:" as const;

export type WsEventName = typeof EV_NAMES[number];
export type WsSubscription = `${WsEventName}:${number}`;
export type WsServerEvent = {
  vote: Poll,
  chat: ChatEvent,
  call: CallRequest,
};

export type ChatRequest = { pollId: number } & ({
  method: "delete",
  user: string,
} | {
  method: "post",
  user: string,
  msg: string,
});

export type CallRequest = { pollId: number } & ({
  type: "offer",
  offer: RTCSessionDescriptionInit,
} | {
  type: "answer",
  answer: RTCSessionDescriptionInit,
} | {
  type: "ice:offer",
  candidate: RTCIceCandidateInit,
} | {
  type: "ice:answer",
  candidate: RTCIceCandidateInit,
});

export type ChatEvent = { pollId: number } & ({
  type: "new:chat",
  data: ChatSelect,
} | {
  type: "del:chat",
  who: string,
});

type ParsedMsg<D> = {
  status: "event",
  name: WsEventName,
  data: D,
} | {
  status: "parsed",
  name: string,
  data: D,
} | {
  status: "invalid",
};

export function parseMsg<D>(msg: string, parser: (data: string) => D): ParsedMsg<D> {
  const idx = msg.indexOf(":");
  if (idx === -1) {
    return { status: "invalid" };
  }

  const name = msg.slice(0, idx) as WsEventName;
  const data = parser(msg.slice(idx + 1));

  return { status: EV_NAMES.includes(name) ? "event" : "parsed", name, data };
}

export function parseDbEntry<T>(json: string): T {
  return JSON.parse(json, (k, v) => {
    if (k === "createdAt") { return new Date(v) }
    return v;
  });
}
