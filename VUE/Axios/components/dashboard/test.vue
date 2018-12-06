<template>
    <div>
        <p>Users : {{ users }}</p>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        created() {
            // Performing Multiple Requests
            axios.all([this.getUsers(), this.getSimpleData(), this.getText()])
                .then(axios.spread((acct, perms, another) => {
                    console.log('acct', acct)
                    console.log('perms',perms)
                    console.log('another',another)
                }))

            // Another alternative using Promise.all()
            // Promise.all([this.getUsers(), this.getSimpleData(), this.getText()])
            //     .then(arr => {
            //         arr.forEach(res => {
            //             console.log(res)
            //         });
            //     })
        },
        data() {
            return {
                storeUsers: []
            }
        },
        computed: {
            users() {
                return JSON.stringify(this.storeUsers);
            }
        },
        methods: {
            // I'd rather include this 2 functions in a separate file.. like a mixin or smth
            getUsers() {
                return axios.get('users.json')
            },
            getSimpleData() {
                return axios.get('data.json')
            },
            getText() {
                return axios.get('text.json')
            }
        }
    }
</script>