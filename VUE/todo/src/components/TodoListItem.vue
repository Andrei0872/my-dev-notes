
<template>
    <li>
        <span :class="{done: todo.done}"> {{ todo.text }} </span>
        <button @click="$emit('remove', todo.id)">&times;</button>
        <button @click="$emit('toggle', todo.id)">{{ todo.done ? 'Done': 'Pending..' }}</button>
    </li>
</template>

<script>
export default {
    props: {
        todo: {
            type: Object,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
    .done {
        border-bottom:1px solid green;
    }
</style>