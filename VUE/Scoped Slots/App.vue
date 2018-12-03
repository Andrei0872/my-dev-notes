<template>
  <div class="container">
    <div class="row">
      <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <h3>Scoped Slots</h3>
        <app-posts :pseudo-slot="({ post }) => post.content">
          <span slot-scope="{ post }">
            {{ post.content }}
          </span>
        </app-posts>
      </div>
    </div>
  </div>
</template>

<script>
  import Posts from './Posts.vue';

  export default {
    components: {
      'app-posts': Posts
    }
  }
</script>