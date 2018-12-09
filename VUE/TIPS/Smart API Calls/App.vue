<template>
  <div id="app">
    <h3>Let's write some code!</h3>
    {{ items.length }}
    <button @click="addItem">Add</button>
  </div>
</template>

<script>
import API from './Api.js'

const myApi = new API({ url: 'https://jsonplaceholder.typicode.com'})
myApi.createEntity({ name: 'posts' })

export default {
  name: 'app',
  data() {
    return {
      items: []
    }
  },
  created() {

    myApi.endpoints.posts.getAll()
      .then(resp => {
        console.log(resp)
        this.items = resp.data
      })
  },
  methods: {
    async addItem() {
      const anotherApi = new API({ url: 'http://localhost/REST/api' });
      anotherApi.createEntity({ name: 'category', isPhp: true })
      const res = await anotherApi.endpoints.category.create({
        name: 'another 1'
      })
      console.log(res)
    }
  }
}
</script>

<style>
</style>
