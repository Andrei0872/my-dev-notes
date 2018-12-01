<template>
    <div>
        <h3>User</h3>
        <p>This is user page</p>
        <hr>
        <!-- <p>Loaded ID : {{ id }} </p> -->
        <button @click="navigateToHome" class="btn btn-primary">Go to Home</button>
        <hr>
        <!-- Load the subroutes -->
        <router-view></router-view>
    </div>
</template>

<script>
// By default, the component will not be recreated
    export default {
        // data() {
        //     return {
        //         id: this.$route.params.id
        //     }
        // },
        // watch: {
        //     // to - to which route are we going 
        //     // from - which route are we coming from
        //     '$route'(to, from) {
        //         console.log(to)
        //         console.log(from)
        //         this.id = to.params.id;
        //     }
        // },
        methods: {
            navigateToHome() {
                // Push on the stack of routes
                this.$router.push({
                    name: 'home'
                });
            }
        }
    }
</script>