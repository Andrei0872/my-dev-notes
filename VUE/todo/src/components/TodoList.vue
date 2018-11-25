
<template>
    <div>
        <BaseInput 
            placeholder="New Todo"
            v-model="newTodoText"
            @keydown.enter="addTodo"
        />
        <ul v-if="todos.length">
            <TodoListItem 
                v-for="todo in todos"
                :key="todo.id"
                :todo="todo"
                @remove="removeTodo"
                @toggle="toggleTodo"
            />
        </ul>
        <p v-else> Nothing left. </p>
    </div>
</template>

<script>
import BaseInput from './BaseInput'
import TodoListItem from './TodoListItem'

// let nextTodoId = 1

export default {
    components: {
        BaseInput,
        TodoListItem
    },
    data() {
        return {
            newTodoText: '',
            nextTodoId: 4,
            todos: [
                { id: 1, text: 'First item' , done: false},
                { id: 2, text: 'Second item', done: true },
                { id: 3, text: 'Third item', done: false},
            ]
        }
    },
    methods: {
        addTodo() {
            const trimmed = this.newTodoText.trim();
            this.newTodoText = '';
            if(trimmed === '') return;
            this.todos.push({
                id: this.nextTodoId++,
                text: trimmed,
                done: false
            });
        },
        removeTodo(idToRemove) {
            this.todos = this.todos.filter(({id}) => id !== idToRemove)
        },
        toggleTodo(idToFind) {
            const elem = this.todos.find(elem => elem.id === idToFind);
            elem.done = !elem.done;
        }
    }
}
</script>
