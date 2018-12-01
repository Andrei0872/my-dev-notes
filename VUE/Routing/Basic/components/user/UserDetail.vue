<template>
    <div>
        <h3>User detail</h3>
        <!-- It will be reacreated anyway -->
        <p>User Loaded : {{ $route.params.id }}</p>
        <!-- :to="'/user/' + $route.params.id + '/edit'" -->
        <router-link 
                tag="button" 
                :to="link"
                class="btn btn-primary"
            >Edit User</router-link>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                link: { 
                    name: 'userEdit', 
                    params: { id: this.$route.params.id }, 
                    query: { locale: 'en', q: 100 },
                    hash: '#data'
                }
            }
        },
        beforeRouteEnter (to, from, next) {
            
            // If using this, it means that at this point of time, this component has already beenc createad
            // next(vm => {
                // vm.link; // Gain access to your component
            // });

            // Check if this component should be created before creating it
            if (true) { 
                next();
            }
            else next(false);
        }
    } 
</script>