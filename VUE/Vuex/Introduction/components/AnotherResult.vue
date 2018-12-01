<template>
    <div>
        <p>Counter is: {{ cnt }}</p>
        <p>Number of Clicks : {{ stringCnt }} </p>
        <!-- <p>Number of Clicks : {{ $store.getters.stringCounter }} </p> -->
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import * as types from '../store/types.js';

    export default {
        computed: {
            ...mapGetters({
                cnt: types.DOUBLE_COUNTER,
                stringCnt: types.CLICK_COUNTER
        })
        }
    }
</script>