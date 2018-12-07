<template>
  <div id="app">
    <HelloWorld/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background-color: #2c2334;
    background-image: linear-gradient(to bottom,rgba(44,35,52,.8),rgba(70,31,23,.5)),url(./assets/wallpaper.jpg);
    background-position: top;
    background-size: cover;
    height: 400px; 
    width: 700px; 
    color: #fff;
    position: relative;
    text-shadow: 0 0 6px #000;
}
</style>
