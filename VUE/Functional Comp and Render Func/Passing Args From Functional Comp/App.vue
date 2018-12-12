<template>
  <div id="app">
    <h3>Let's write some code!</h3>
    <hr>
    <p>Length of the array passed from the child component {{ counter }}</p>
    <hr>
    <app-test :counter="counter" @click="check"><span>33</span></app-test>
  </div>
</template>

<script>
import Test from './components/Test';

export default {
  name: 'app',
  data() {
    return {
      counter: 0
    }
  },
  components: {
    'app-test': Test
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
</style>
