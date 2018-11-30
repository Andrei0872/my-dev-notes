
<template>
    <div>
        <h3>Component 1 {{ copyNum }}</h3>
        <button @click="increment">Increment</button>
    </div>
</template>

<script>
import { eventBus } from '../main.js';

export default {
    props: {
        num: Number
    },
    data() {
        return {
            copyNum: this.num
        }
    },
    methods: {
        increment() {
            this.copyNum++;
            eventBus.$emit('incrementNum', this.copyNum);
        }
    }
}
</script>
