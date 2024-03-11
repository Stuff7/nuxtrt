<template>
  <NuxtPage />
</template>

<style lang="scss">
@use "~/assets/font.scss";

@include font.load-font("JetBrainsMono", $replace: (900: "ExtraBold"));

:root {
  --main-bg1: #001;
  --main-bg2: #002;

  --accent-bg1: #F86;
  --accent-bg2: #F56;
  --accent-bg3: #BFA;
  --accent-bg4: #1FF;

  --box-bg1: #222;
  --box-bg2: #223;
  --box-bg3: #113;
  --box-bg4: #235;

  --main-fg1: #EFF;
  --main-fg2: #89A;

  --main-sp1: 1.6rem;
  --sp1: 0.8em;
  --sp2: 2em;
  --rd1: 0.4em;
  --box-shadow1: 0px 0px 4px 4px;
}

*, *::before, *::after {
  font: 20px JetBrainsMono, mono, Menlo-Regular;
  box-sizing: border-box;

  scrollbar-width: thin;
  scrollbar-color: var(--accent-bg1) #0003;
  &::-webkit-scrollbar-thumb {
    background: var(--accent-bg1);
    border-radius: 20rem;
  }
  &::-webkit-scrollbar-track {
    background: #0003;
  }
  &::-webkit-scrollbar {
    width: 3rem;
  }
}

:root, body, main {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body, main {
  background: linear-gradient(to right, var(--main-bg2), var(--main-bg1), var(--main-bg2));
  color: var(--main-fg1);
}

main {
  display: grid;
  padding: var(--main-sp1);
  position: relative;
  overflow: hidden auto;
}

[data-layer] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;

  & * {
    pointer-events: all;
  }
}

.no-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6, p {
  margin: 0;
}

h1 {
  font-size: 2.2rem;
  font-weight: 900;
}

h2 {
  font-size: 2rem;
  font-weight: 800;
}

h3 {
  font-size: 1.8rem;
  font-weight: 800;
}

h4 {
  font-size: 1.6rem;
  font-weight: 700;
}

h5 {
  font-size: 1.4rem;
  font-weight: 700;
}

h6 {
  font-size: 1.2rem;
  font-weight: 600;
}

a {
  color: var(--accent-bg1);

  &:visited {
    color: var(--accent-bg2);
  }
}

small {
  font-weight: 100;
  font-size: 0.9em;
}

strong {
  font-weight: 900;
  font-size: 1.1em;
  background: linear-gradient(to right, var(--accent-bg1), var(--accent-bg2));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

button, input {
  border-radius: var(--rd1);
  outline: 0;
}

button {
  --grad-dir: to top right;
  cursor: pointer;
  background: linear-gradient(var(--grad-dir), var(--accent-bg1), var(--accent-bg2));
  box-shadow: var(--box-shadow1) #2204;
  border: 0;
  padding: var(--sp1) var(--sp2);

  &:hover {
    background: var(--accent-bg2);
  }

  &:active {
    background: var(--accent-bg1);
  }

  &, a, a:visited {
    text-decoration: none;
    color: var(--main-fg1);
  }
}

input {
  border: 1px solid var(--main-bg2);
  padding: calc(var(--sp1) * 0.5);

  &:focus {
    border-color: var(--accent-bg1);
  }
}

.grid {
  display: grid;
  gap: var(--sp1);

  &.v-center {
    align-items: center;
  }
}

.box {
  border-radius: var(--rd1);
  background: linear-gradient(to top, var(--box-bg1), var(--box-bg2));
  color: var(--main-fg1);
  box-shadow: var(--box-shadow1) #0024;
  padding: var(--sp1);
}

.no-padding {
  padding: 0;
}

.center-text {
  text-align: center;
}

.left-text {
  text-align: left;
}

.circle {
  border-radius: 100%;
  width: var(--sp1);
  height: var(--sp1);
}

.fullwidth {
  width: 100%;
  max-width: 50rem;
  margin: auto;
}

.no-select {
  user-select: none;
}

.no-overflow {
  overflow: hidden;
}

.scroll {
  overflow: hidden auto;
}

.no-radius {
  border-radius: 0;
}

.pre {
  white-space: pre-line;
}

.plain {
  background: transparent;
  color: currentColor;
  box-shadow: none;
}

.neg-bg {
  background: linear-gradient(to top right, var(--accent-bg1), var(--neg-bg1));
  color: var(--main-bg1);
}

.main-fg1 {
  background: linear-gradient(to left, var(--main-fg1), var(--main-fg2));
  color: var(--main-bg1);
}

.box-bg1 {
  background: linear-gradient(to right, var(--box-bg1), var(--box-bg2));
}

.box-bg2 {
  background: linear-gradient(to right, var(--box-bg3), var(--box-bg4));
}

.accent-bg1 {
  background: linear-gradient(to top right, var(--accent-bg1), var(--accent-bg2));
  color: var(--main-fg1);

  &:hover.hover-bg {
    background: var(--accent-bg2);
  }
}

.accent-bg2 {
  background: linear-gradient(to top right, var(--accent-bg3), var(--accent-bg4));
  color: var(--main-bg1);

  &:hover.hover-bg {
    background: var(--accent-bg4);
  }
}
</style>
