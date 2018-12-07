
<template>
    <div>
        <h1>{{this.$props.details.title}}</h1>
        <p>Image goes here {{this.$props.details.img}}</p>
        <button @click="$emit('click')">Go Back</button>
    </div>    
</template>

<script>
export default {
    props: ['details'],
}
</script>

<style>

</style>
