
<template>
    <div class="panel panel-default">
        <div style="font-weight:bold;" class="panel-heading text-center">
            Add Item
        </div>
        <div class="panel-body">
            <input 
                type="text"
                @keyup.enter="sendData"
                v-model="itemText"
                placeholder="type item here"
            >
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                itemText: ''
            }
        },
        methods: {
            sendData() {
                this.$emit('data-sent', this.itemText)
                this.itemText = '';
            }
        }
    }
</script>

<style>

</style>