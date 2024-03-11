<script lang="ts">
const USERNAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Emma",
  "Frank",
  "Grace",
  "Henry",
  "Ivy",
  "Jack",
];
</script>

<script setup lang="ts">
const { chats } = defineProps<{ cleaner?: string, chats: ChatSelect[] }>();
const emit = defineEmits<{ chat: [user: string, msg: string] }>();
const username = USERNAMES[~~(Math.random() * USERNAMES.length)];
const open = ref(false);
const chatElem = ref<HTMLElement | null>(null);
const userScrolled = ref(false);
const botScrolled = ref(false);

watchEffect(() => {
  if (chats.length && !userScrolled.value && chatElem.value) {
    botScrolled.value = true;
    chatElem.value.scrollTo({ behavior: "smooth", top: chatElem.value.scrollHeight });
  }
}, { flush: "post" });

function trackScroll(e: UIEvent) {
  const t = e.currentTarget;
  if (!(t instanceof HTMLElement)) {
    return;
  }

  if (botScrolled.value) {
    botScrolled.value = false;
    return;
  }

  userScrolled.value = t.scrollTop < t.scrollHeight - t.offsetHeight - 100;
}

async function chat(e: KeyboardEvent) {
  if (!(e.currentTarget instanceof HTMLInputElement)) {
    return;
  }

  emit("chat", username, e.currentTarget.value);
  e.currentTarget.value = "";
}
</script>

<template>
  <button
    :class="['plain', 'no-radius', { 'accent-bg2': open }]"
    @click="open = !open"
  >
    <h4>󰍡</h4>
    <Dialog
      v-model:open="open"
      class="grid"
      style="grid-template-rows: 1fr auto;"
    >
      <ul
        ref="chatElem"
        class="grid box plain scroll"
        style="gap: 0.2em; grid-auto-rows: max-content;"
        @scroll="trackScroll"
      >
        <small v-if="cleaner">Chat has been cleared by <strong>{{ cleaner }}</strong></small>
        <small v-else-if="!chats.length">Nothing to see here 󰊠</small>
        <li
          v-for="c in chats"
          :key="c.createdAt.toString()"
          class="grid"
          style="gap: 0"
        >
          <p
            class="grid v-center"
            style="grid-template-columns: auto 1fr"
          >
            <strong>{{ c.user }}</strong>
            <small>{{ c.createdAt.toLocaleString() }}</small>
          </p>
          <pre class="no-bullets">{{ c.msg }}</pre>
        </li>
      </ul>
      <input
        class="fullwidth"
        placeholder="Chat here 󱐏"
        @keyup.enter="chat"
      >
    </Dialog>
  </button>
</template>
