<template>
    <div id="app">
        <h3>Todo List</h3>
        <TodoList />
    </div>
</template>

<script>
    import TodoList from './components/TodoList'
    export default {
        components: {
            TodoList
        }
    }
</script>

<style lang="scss">
    @import './variables.scss';

    #app {
        max-width: 400px;
        margin: 0 auto;
        line-height: 1.4;
        color: $vue-blue;
    }

    h1 {
        text-align: center;
    }
</style>