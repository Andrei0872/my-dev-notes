<template>
    <div>
        <h3>Dummy Comp {{ $route.params.slug || 'no param' }}</h3>
        <p>Props Passed : {{ action || 'no action' }}</p>
        <p>Switch to test comp</p>
        <button @click="switchToTest()">Switch</button>
        <button @click="switchToTest('left')">Left Arrow</button>
        <button @click="switchToTest('right')">Right Arrow</button>
    </div>
</template>

<script>
    export default {
        methods: {
            switchToTest(direction = 'default') {
                direction === 'default' && this.$router.push('/test') ||
                direction === 'left' && this.$router.go(-1) ||
                direction === 'right' && this.$router.go(1) 
            }
        },
        beforeRouteLeave (to, from, next) {
            console.log('leaving')
            next()
        },
        props: ['action']
    }
</script>