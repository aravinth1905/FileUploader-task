<template>
  <div id="app">
    <HomeSection msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HomeSection from './components/HomeSection.vue';

export default {
  name: 'App',
  components: {
    HomeSection
  }
}

</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
