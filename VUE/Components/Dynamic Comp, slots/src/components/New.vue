<template>
    <div>
        <h3>New Quote</h3>
        <button @click="counter++">Increase</button>
        <p>{{ counter }}</p>
    </div>
</template>

<script>    
    export default {
        data() {
            return {
                counter: 0
            }
        },
        destroyed() {
            console.warn('destroyed')   
        },
        // Navigate away
        deactivated() {
            console.warn('deactivated')
        },
        // Loading the component
        activated() {
            console.warn('activated')
        }
    }
</script>

<style>
</style>

