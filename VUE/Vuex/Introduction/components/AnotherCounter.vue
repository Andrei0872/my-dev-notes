<template>
    <div>
        <button class="btn btn-primary" @click="asyncIncrement({ by: 50, duration: 500 })">Increment</button>
        <button class="btn btn-primary" @click="asyncDecrement({ by: 50, duration: 500 })">Decrement</button>
    </div>
</template>

<script>
    // This will give us easy access to these functions
    // import { mapMutations } from 'vuex';
    import { mapActions } from 'vuex';

    // If you have at least one async action to do, you might not use mutations directly
    export default {
        // methods: {
        //     ...mapMutations([
        //         'increment',
        //         'decrement'
        //     ])
        // }
        methods: {
            ...mapActions([
                'asyncIncrement',
                'asyncDecrement'
            ])
            // ,
            // increment(by) {
            //     this.$store.dispatch('increment', by)
            // }
        }
    }
</script>