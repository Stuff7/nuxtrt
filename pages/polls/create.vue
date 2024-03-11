<script setup lang="ts">
import { ref } from "vue";
const poll = ref<Poll>({
  createdAt: new Date(),
  pollId: -1,
  title: "Poll Title",
  description: "Poll Description",
  question: "Is this a poll?",
  options: [{ id: Date.now(), text: "Yes", count: 1, percent: 100 }],
  totalVotes: 1,
});
const chats = ref<ChatSelect[]>([]);
const voted = ref(-1);

async function submit() {
  await $fetch("/api/polls", {
    body: {
      title: poll.value.title,
      description: poll.value.description,
      question: poll.value.question,
      options: poll.value.options.map(o => o.text),
    },
    method: "POST",
    onResponse({ response }) {
      if (response.redirected) {
        const url = new URL(response.url);
        navigateTo(url.pathname, { replace: true });
      }
    },
  });
}

async function simulateChat(user: string, msg: string) {
  chats.value.push({ id: 0, user, msg, createdAt: new Date(), pollId: 0 });
}

async function simulateVote(optionId: number) {
  poll.value.totalVotes++;
  poll.value.options.forEach(o => {
    if (o.id === optionId) {
      o.count++;
    }
    o.percent = 100 * o.count / poll.value.totalVotes;
  });
}
</script>

<template>
  <PollCard
    v-model:voted="voted"
    :poll="poll"
    :chats="chats"
    editing
    @add-option="poll.options.push({ id: Date.now(), text: '', count: 0, percent: 0 })"
    @rem-option="(idx) => poll.options.splice(idx, 1)"
    @submit="submit"
    @vote="simulateVote"
    @chat="simulateChat"
  />
</template>
