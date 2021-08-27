<template>
  <div style="text-align: left" id="app">
    <chat style="margin-left: auto; margin-right: auto" />
  </div>
</template>

<script>
import chat from "./components/chat.vue";

export default {
  name: "App",
  components: {
    chat,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.displayed {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
