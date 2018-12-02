<template>
    <div>
        <button class="btn btn-primary" @click="increment">Increment</button>
        <button class="btn btn-primary" @click="decrement">Decrement</button>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        methods: {
            ...mapActions('counter',{
                increment: 'increment',
                decrement: 'decrement'
            })
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