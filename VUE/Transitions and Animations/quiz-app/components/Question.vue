
<template>
    <div class="panel panel-default">
        <div style="font-weight:bold;" class="panel-heading text-center">
            {{ question }}
        </div>
        <div class="panel-body">
            <div 
                class="col-xs-12 col-sm-6 text-center" 
                v-for="(result, index) in results"
                :key="index"
                >
                <button @click="checkValidity(result)" class="btn btn-primary">{{ result }}</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['question' , 'results'],
        methods: {
            checkValidity(value) {
                this.$emit('checkButton', value);
            }
        }
    }
</script>

<style scoped>
    button {
        margin: 3px 5px;
    }
</style>