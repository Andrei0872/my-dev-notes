
//* Passing the properties of an object
Vue.component('about-me', {
    props: ['name', 'age'],
    // props: ['obj'],
    template: `
        <div>
            <h3> {{ name }} </h3>
            <br>
            <h3> {{ age }} </h3>
        </div>
    `
});

new Vue({
    el: "#demo",
    data: {
        obj: {
            name: 'Andrei',
            age: 13
        }
    }
});

// ================================================
//* Prop Validation

Vue.component('my-prop-validation', {
    props: {
        propA: Number,
        // Multiple possible types
        propB: [String, Number],
        // Required string
        propC: {
            type: String
        },
        // Number with default value
        propD: {
            type: Number,
            default: 6
        },
        // Obj with default value
        propE: {
            type: Object,
            default: function () {
                return { message: 'Hello' }
            }
        },
        // Custom validator
        propF: {
            validator: function (value) {
                return ['success', 'warning', 'danger'].indexOf(value) !== -1;
            } 
        }
    },
    template: `
    <div>
       <h3>{{ propA }}</h3> 
       <h3>{{ propB }}</h3> 
       <h3>{{ propC }}</h3> 
       <h3>{{ propD }}</h3> 
       <h3>{{ propE.message }}</h3> 
       <h3>{{ propF}}</h3> 
    </div>
    `,
    data: function () {
        return  {
            props: {
                propC: ''
            }
        }
    }
});


new Vue({
    el: "#prop-validation",
    data: {
        details: {
            message: 'Hello Andrei'
        }
    }
});


// =================================


