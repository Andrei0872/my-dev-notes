<template>
    <div>
        <button class="btn btn-primary" @click="increment(100)">Increment</button>
        <button class="btn btn-primary" @click="decrement(50)">Decrement</button>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        methods: {
            ...mapActions([
                'increment',
                'decrement'
            ])
        }
    }

    // methods: {
    //         increment() {
    //             // this.$emit('updated', 1);
    //             // this.$store.state.counter++;
    //             this.$store.commit('increment');
    //         },
    //         decrement() {
    //             // this.$emit('updated', -1);
    //             // this.$store.state.counter--;
    //             this.$store.commit('decrement');
    //         }
    //     }
</script>