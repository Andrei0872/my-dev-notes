<template>
    <div>
        <p>Current length : {{ len }}</p>
        <ul class="list-group">
            <li
                class="list-group-item"
                v-for="(post, index) in posts"
                :key="index"
                @click="deleteItem(index)"
            >{{ post }}</li>
        </ul>
        <hr>
        <button @click="addItem" class="btn btn-primary">Add</button>
        <button @click="update(13)" class="btn btn-primary">Update Counter</button>
        <button @click="update2(20)" class="btn btn-primary">Update Counter 2</button>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex';

    export default {
        computed: {
                ...mapGetters('counter/posts', {
                    posts: 'getPosts',
                    len: 'nrPosts'
                })
        },
        methods: {
            ...mapActions({
                addItem: 'counter/posts/add',
                deleteItem: 'counter/posts/delete',
                update: 'counter/updateVal',
                update2: 'counter/posts/updateVal'
            })
        }
    }
</script>