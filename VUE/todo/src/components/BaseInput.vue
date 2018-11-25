
<template>
    <input
        type="text"
        class="input"
        :value="value"
        v-on="listeners"
    >   
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    computed: {
        listeners() {
            console.log('listeners', this.$listeners)
            console.log('attrs', this.$attrs)
            return {
                // Pass all listeners directly to input
                ...this.$listeners,
                // Override input listener to work wity v-model
                input: event => this.$emit('input', event.target.value),
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .input {
        width: 100%;
        border: 1px solid black;
        padding: 8px 10px;
    }
</style>
