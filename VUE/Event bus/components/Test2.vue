
<template>
    <h3>Component2 : {{ copyNum }}</h3>
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

    created() {
        eventBus.$on('incrementNum', (data) => { this.copyNum = data })
    }
}
</script>
