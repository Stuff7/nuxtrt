<template>
  <section :class="[$style.create, 'grid', 'box', 'fullwidth']">
    <h1>What will you <strong>inquire</strong> about today?</h1>
    <p>Using polls simplifies the process of posing questions.</p>
    <NuxtLink to="/polls/create">
      <button :class="$style.btn">
        <h1>Create Poll</h1>
      </button>
    </NuxtLink>
  </section>
</template>

<style module>
.create {
  text-align: center;
}

.btn {
  font-size: 28px;
  width: 100%;
}
</style>
