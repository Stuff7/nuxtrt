<script setup lang="ts">
const { $realtime } = useNuxtApp();
const route = useRoute();
const poll = ref(await $fetch<Poll>(`/api/polls/${route.params.id}`, { parseResponse: parseDbEntry }));
const chats = ref(await $fetch<ChatSelect[]>(`/api/chats/${route.params.id}`, { parseResponse: parseDbEntry }));
const chatCleaner = ref("");

async function vote(optionId: number) {
  $realtime.vote({ optionId, pollId: poll.value.pollId });
}

async function chat(user: string, msg: string) {
  if (msg === "/clear") {
    $realtime.chat({ method: "delete", pollId: poll.value.pollId, user });
  } else {
    $realtime.chat({ method: "post", user, msg, pollId: poll.value.pollId });
  }
}

onMounted(() => {
  $realtime.on("vote", poll.value.pollId, updatePoll);
  $realtime.on("chat", poll.value.pollId, updateChat);
});

onUnmounted(() => {
  $realtime.off("vote", poll.value.pollId, updatePoll);
  $realtime.off("chat", poll.value.pollId, updateChat);
});

function updatePoll(updPoll: Poll) {
  poll.value = updPoll;
}

function updateChat(ev: ChatEvent) {
  chatCleaner.value = "";
  switch (ev.type) {
    case "new:chat": return chats.value.push(ev.data);
    case "del:chat": {
      chatCleaner.value = ev.who;
      chats.value = [];
      break;
    }
  }
}
</script>

<template>
  <div>
    <PollCard
      :poll="poll"
      :chats="chats"
      :chat-cleaner="chatCleaner"
      @vote="vote"
      @chat="chat"
    />
  </div>
</template>
