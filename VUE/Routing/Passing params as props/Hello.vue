
<template>
  <div>
    <h2 class="hello">Hello {{name}} {{ JSON.stringify($attrs) === JSON.stringify({}) ? '' : $attrs }}</h2>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: 'Vue!'
    }
  },
  data() {
      return {
          ok: false
      }
  }
}
</script>