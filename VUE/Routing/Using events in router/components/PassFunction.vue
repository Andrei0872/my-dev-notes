<template>
    <div>
        <h3>{{ JSON.stringify($attrs) }}</h3>
        <p>Go to dummy comp and pass params</p>
        <button @click="goToDummy">Go!</button>
    </div>
</template>

<script>
    export default {
        methods: {
            goToDummy() {
                console.log(this.$router)
                this.$router.push({
                    name: 'dummy',
                    params: { slug: 'andrei', action: 'create' }
                })
            }
        }
    }
</script>