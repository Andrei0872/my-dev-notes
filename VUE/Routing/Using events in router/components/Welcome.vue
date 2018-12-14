<template>
    <div>
        <h3>Welcome</h3>
        <button @click="show">Login!</button>
        <hr>
        {{ $attrs }}
        <!-- {{ $listeners }} -->
        <div align="center">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            show() {
                alert(1)
            }
        },
        created() {
            console.log(this)
        }
    }
</script>

<style lang="scss">
    .green {
        color: green;
    }
</style>