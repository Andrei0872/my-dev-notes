
<template>
    <div>
        <ul v-if="items.length">
            <li
                v-for="(item, index) in items"
                :key="index"
                @click="items.splice(index,1)"
                style="cursor:pointer;"
            >{{ item }}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        props: {
            msg: String
        },
        data() {
            return {
                items: []
            }
        },
        watch: {
            msg(newVal) {
                this.items.push(newVal)
            }
        }
    }
</script>

<style>

</style>