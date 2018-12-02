<template>
    <div>
        <p>Counter is: {{ cnt }}</p>
        <p>Number of Clicks : {{ stringCnt }} </p>
        <!-- <p>Number of Clicks : {{ $store.getters.stringCounter }} </p> -->
    </div>
</template>

<script>
    // Another way to create namespaces
    import { createNamespacedHelpers } from 'vuex';
    const { mapGetters } = createNamespacedHelpers('counter');

    export default {
        computed: {
            ...mapGetters({
                cnt: 'doubleCounter',
                stringCnt: 'stringCounter'
        })
        }
    }
</script>