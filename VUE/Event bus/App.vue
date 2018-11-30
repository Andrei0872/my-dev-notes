<template>
    <div>
        <Test :num="num"></Test>
        <Test2 :num="num"></Test2>
        <hr>
        <h3>Parent : {{ num }} </h3>
    </div>
</template>

<script>
    import Test from './components/Test.vue';
    import Test2 from './components/Test2.vue';

    export default {
        components: {
            Test,
            Test2
        },
        data() {
            return {
                num: 0
            }
        }
    }
</script>

<style>
</style>
