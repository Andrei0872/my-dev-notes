<template>
  <div id="app">
    <h3>Let's write some code!</h3>
    <hr>
    <p>Length of the array passed from the child component {{ counter }}</p>
    <hr>
    <p>Switch to test comp: <router-link to="/test" active-class="active" tag="button" class="btn btn-primary">Click!</router-link></p>
    <p>Switch to dummy comp: <router-link to="/dummy" active-class="active" tag="button" class="btn btn-primary">Click!</router-link></p>
    <!-- span - children prop -->
    <router-view foo="123" @click="check"><span>children</span></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  data() {
    return {
      counter: 0
    }
  },
  methods: {
    sayHello() {
      return 'hello!'
    },
    check(args,e) {
      // console.log(e.target.tagName)
      // console.log(args)
      this.counter = args.length
    }
  }
}
</script>

<style>
.active {
  font-size: 30px;
}
</style>
