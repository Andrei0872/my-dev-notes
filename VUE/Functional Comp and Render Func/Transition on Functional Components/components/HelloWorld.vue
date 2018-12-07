<template>
  <div class="container">
    <h3>Apps You Need, Without Ones You Don’t.</h3>
    <p>elementary OS comes with a carefully considered set of apps that cater to every day needs so you can spend more time using your computer and less time cleaning up bloatware.</p>
    <br>
      <AppList></AppList>
  </div>
</template>

<script>
import AppList from './AppList.vue';

export default {
  components: {
    AppList
  }
}
</script>

<style>
.container {
    height: 400px; 
    width: 700px; 
    color: #fff;
    position: relative;
    text-shadow: 0 0 6px #000;
}
</style>
