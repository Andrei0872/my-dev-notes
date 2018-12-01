<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1 class="text-center">HTTP</h1>
                <div class="form-group">
                    <label >Username</label>
                    <input type="text" class="form-control" v-model="user.username">
                </div>
                <div class="form-group">
                    <label >Mail</label>
                    <input type="text" class="form-control" v-model="user.email">
                </div>
                <button class="btn btn-primary" @click="submit">Submit</button>
                <hr>
                <input type="text" class="form-control" v-model="node">
                <button class="btn btn-primary" @click="fetchData">Get Data</button>
                <br><br>
                <ul class="list-group">
                    <li
                        class="list-group-item"
                        v-for="(user, index) in users"
                        :key="index"
                    > {{ user.username }} || {{ user.email }} </li>
                </ul>
            </div>  
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                username: '',
                email: ''
            },
            users: [],
            resource: {},
            node: 'data'
        }
    },
    methods: {
        submit() {
            // The "data" node holds our data
            // this.$http.post('data.json', this.user)
            //     .then(response => {
            //         console.log(response)
            //     }, error => {
            //         console.error(error)
            //     });

            //* Simply save it
            // {} - params for URL
            // this.user - the data I want to pass
            // this.resource.save({}, this.user);
            this.resource.saveAlt(this.user);
        },
        fetchData() {
            // this.$http.get('data.json')
            //     .then(resp => resp.json())
                // .then(data => {
                //     console.warn(data)
                //     const resultArr = [];
                //     for(let key in data) {
                //         console.warn('key', key)
                //         resultArr.push(data[key])
                //     }
            //         this.users = resultArr;
            //         // this.users.push(data['messages']);
            //     });
            this.resource.getData({ node: this.node })
                .then(resp => resp.json())
                .then(data => {
                    console.warn(data)
                    const resultArr = [];
                    for(let key in data) {
                        console.warn('key', key)
                        resultArr.push(data[key])
                    }
                    this.users = resultArr;
                });
        }
    },
    created() {
        // First param - the resource
        const customActions = {
            saveAlt: { method: 'POST', url: 'alternative.json'},
            getData: { methods: 'GET' }
        }
        // Second arg - pass data to URL
        // The resource gets appened to the root URL
        this.resource = this.$resource('{node}.json', {}, customActions);
    }
}
</script>

<style>
    
</style>