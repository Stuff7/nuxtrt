<script setup lang="ts">
const { editing, chats } = defineProps<{ editing?: boolean, chatCleaner?: string, chats: ChatSelect[] }>();
const emit = defineEmits<{
  vote: [optionId: number],
  chat: [user: string, msg: string],
  addOption: [],
  remOption: [idx: number],
  submit: [],
}>();
const poll = defineModel<Poll>("poll", { required: true  });
const voted = defineModel<number>("voted", { default: -1 });
const canVote = computed(() => voted.value === -1);

async function vote(optionId: number) {
  if (!canVote.value) {
    return;
  }

  voted.value = optionId;
  emit("vote", optionId);
}
</script>

<template>
  <div :class="[$style.poll, 'grid', 'box', 'fullwidth']">
    <div
      v-if="editing"
      class="grid box box-bg2 center-text"
    >
      <strong class="left-text">[󰙨]</strong>
      <h3>You're in <strong>editing</strong> mode</h3>
      <p>Anything inside dashes <strong contenteditable>is editable</strong></p>
      <p class="left-text">
        This is a tutorial box, once your poll is live the following will disappear:
      </p>
      <ul class="left-text">
        <li>Any elements with the testing <strong>[󰙨]</strong> sign (including this box)</li>
        <li>Dashes around editable elements</li>
      </ul>
      <button @click="$emit('submit')">
        <h6>SUBMIT POLL </h6>
      </button>
    </div>
    <div
      class="grid box fullwidth center-text v-center no-padding no-overflow"
      style="grid-template-columns: 1fr auto auto; gap: 0;"
    >
      <Editable
        v-model="poll.title"
        :editing="editing"
        tag="h4"
        :class="$style.title"
      />
      <VideoCall />
      <ChatDialog
        :chats="chats"
        :cleaner="chatCleaner"
        @chat="(user, msg) => $emit('chat', user, msg)"
      />
    </div>
    <section class="grid box fullwidth">
      <Editable
        v-model="poll.description"
        :editing="editing"
        tag="small"
        class="pre"
      />
      <div :class="$style.gutter" />
      <Editable
        v-model="poll.question"
        :editing="editing"
        tag="h1"
        class="pre"
      />
      <button
        v-if="editing && !canVote"
        @click="voted = -1"
      >
        <h6>[󰙨] RE-ENABLE VOTING</h6>
      </button>
      <ul :class="[$style.options, 'no-bullets', 'grid', { [$style.editing]: editing }]">
        <template
          v-for="(o, i) in poll.options"
          :key="o.id"
        >
          <li
            :class="[
              $style.option,
              'box',
              'grid',
              'pre',
              'main-fg1',
              { [$style.canVote]: canVote, [$style.voted]: voted === o.id, [$style.live]: !editing },
            ]"
            @click="vote(o.id)"
          >
            <label class="grid">
              <h6 v-if="voted === o.id">󰄴</h6>
              <h6 v-else>󰝦</h6>
              <Editable
                v-model="o.text"
                :editing="editing"
                tag="span"
              />
              <span v-if="!canVote">{{ o.percent.toFixed(2) }}% ({{ o.count }})</span>
            </label>
            <div
              v-if="!canVote"
              class="box fullwidth no-overflow no-radius"
              :style="`--percent: ${o.percent}%`"
            />
          </li>
          <button
            v-if="editing"
            class="box accent-bg1 hover-bg"
            @click="$emit('remOption', i)"
          >
            <h6> [󰙨]</h6>
          </button>
        </template>
      </ul>
      <button
        v-if="editing"
        class="accent-bg2 hover-bg"
        @click="$emit('addOption')"
      >
        <h6>[󰙨] ADD NEW OPTION</h6>
      </button>
    </section>
  </div>
</template>

<style module lang="scss">
.poll {
  --poll-bg1: #c6ffdd;
  --poll-bg2: #fbd786;
  --poll-bg3: #f7797d;
  --poll-bg: linear-gradient(to right, var(--poll-bg1), var(--poll-bg2), var(--poll-bg3));

  background: var(--poll-bg);
  font-size: 0.2rem;
  border-radius: 0.4rem;

  strong[contenteditable] {
    outline: 2px dashed currentColor;
  }

  .title {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  section {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .gutter {
    margin: var(--sp1);
  }

  .options {
    font-size: 0.5rem;

    &.editing {
      grid-template-columns: 1fr auto;
    }
  }

  .option {
    font-size: 0.75rem;
    position: relative;

    &.live * {
      pointer-events: none;
    }

    &.canVote {
      cursor: pointer;
    }

    &.canVote:hover, &.voted {
      background: linear-gradient(to left, var(--accent-bg1), var(--accent-bg2));
    }

    & > label {
      grid-template-columns: auto 1fr auto;
    }

    & > div {
      background: var(--poll-bg);
      position: relative;
      font-size: 0.3rem;
      &::after {
        content: "";
        background: var(--box-bg1);
        position: absolute;
        right: 0;
        left: var(--percent);
        transition: left 0.5s;
        height: 100%;
        top: 0;
      }
    }
  }
}
</style>
