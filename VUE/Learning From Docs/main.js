
var app =  new Vue({
    el : "#app",
    data : {
        message : "Hello Vue!"
    }
});

// app.message = "I have changed the value";

// ===========================================

var app2 = new Vue({
    el : "#app-2",
    data : {
        message : `You loaded this page on ${new Date().toLocaleString()}!`
    }
});

// app2.message = "some new message";

// ===========================================

var app3 = new Vue({
    el : "#app-3",
    data : {
        seen : true
    }
});

// ===========================================

var app4 = new Vue({
    el : "#app-4",
    data : {
        todos : [
            { text : "Learn Javascript" },
            { text : "Learn Vue" },
            { text : "Build something awesome" }
        ]
    }
});

// ===========================================

var app5 = new Vue({
    el : "#app-5",
    data : {
        message : "Hello Vue!"
    },
    methods : {
        reverseMessage : function () {
            this.message = this.message.split``.reverse().join``;
        }
    }
});

// ===========================================

var app6 = new Vue({
    el : "#app-6",
    data : {
        message : "Hello Vue!"
    }
});

// ===========================================
//* Components - Small intro

Vue.component('todo-item', {
    // "props" - a custom attribute
    props: ['todoa'],
    template: '<li> {{ todoa.text }} </li>'
});

var app7 = new Vue({
    el: "#app-7",
    data : {
        groceryList: [
            { id: 0, text: 'Vegetables' },
            { id: 0, text: 'Cheese' },
            { id: 0, text: 'Whatever else humans are supposed to eat' }
        ],
        msg: "This is a message",
        rawHTML:'<span style="color:red;">This should be red</span>',
        isButtonDisabled: true,
        ok: true
    },
    methods: {
        showAlert: function () {
            alert(1);
        }
    }
});

// console.log(app7.$data)

// ===========================================
//* The Vue Instance
var data = { a: 1 }

var vm = new Vue({
    data : data
});
console.log(vm.a === data.a) // True

vm.a = 2;
console.log("data.a", data.a) // 2

data.a = 3;
console.log("vm.a", vm.a) // 3

// ===========================================
new Vue({
    data: {
        a: 1
    },
    created: function() {
        console.log(`a is ${this.a}`);
    }
});

// ===========================================
//* Computed Properties and Watchers
// The value of `vm.reversedMessage` is always dependent on `vm.message`
var app8 = new Vue({
    el: "#app-8",
    data: {
        message: 'hello',
        fname: 'Foo',
        lname: 'Bar',
        fullname: 'Foo Bar'
    },
    computed: {
        // A computed getter
        reversedMessage: function() {
            // "this" - points to the vm instance
            return this.message.split``.reverse().join``;
        },
        fullNameComputed: function () {
            return `${this.fname} ${this.lname}`;
        },
        // Computed Setter
        fullNameUsingSetter: {
            // Getter
            get: function () {
                return `${this.fname} ${this.lname}`;
            },
            // Setter
            set: function (newValue) {
                var names =  newValue.split` `;
                this.fname = names[0];
                this.lname = names[names.length - 1];
            }
        }
    },
    methods: {
        reverseMessage: function() {
            return this.message.split``.reverse().join``;
        }
    },
    watch: {
        fname: function(val, oldVal) {
            this.fullname = `${val} ${this.lname}`;
            // console.log('fname old', oldVal)
        },
        lname: function(val, oldVal) {
            this.fullname = `${this.fname} ${val}`;
            // console.log('lname old', oldVal)
        }
    }
});

// ===========================================
//* Watcher example

var app9 = new Vue({
    el: "#watcher-example",
    data : {
        question: '',
        answer: 'I cannot give you an answer until you ask a question!'
    },
    watch: {
        // Whenever 'question' changes, this function will run
        question: function(newQuestion, oldQuestion) {
            this.answer = 'Waiting for you to stop typing...';
            this.debouncedGetAnswer();
        }
    },
    beforeCreate: function() {
        console.log("Vue Instance before created") // This will log first
    },
    // When the Vue Instance is created
    created: function() {
        console.log("Vue Instance created") // This will log second
        // _.debounce - limit how ofter a particularly expensive operation can be run
        // In this case, we want to limit how ofter we access yesno.wtf/api
        // waiting until the user has completely finished typing before making the ajax request
        this.debouncedGetAnswer = _.debounce(this.getAnswer,500);
    },
    methods: {
        getAnswer: function() {
            console.log("The user has stopped typing")
            if(this.question.indexOf('?') === -1) {
                this.answer = 'Questions usually contain a question mark. ;-)';
                return;
            }
            this.answer = 'Thinking...';
            var vm = this
            axios.get('https://yesno.wtf/api')
                .then(function(response) {
                    vm.answer = _.capitalize(response.data.answer);
                })
                .catch(function(err) {
                    vm.answer = 'Error! Could not reach the API. ' + error
                });
        }
    }
});


// ===========================================
//* Class and Style

new Vue({
    el: "#class-example",
    data: {
        isActive: true,
        hasError: false
    }
});

// Bound object NOT inline
new Vue({
    el: "#class-example2",
    data: {
        classObj: {
            static: true,
            active: true,
            'text-danger': true
        }
    }
});

// Using computed property
new Vue({
    el: "#class-example3",
    data: {
        isActive: true,
        hasError: {
            type: 'fatal'
        }
    },
    computed: {
        computedObjClass: function() {
            return  {
                static: true,
                active: this.isActive ,
                'text-danger': this.hasError && this.hasError.type === 'fatal'
            }
        }
    }
});

// Array Syntax
new Vue({
    el: "#class-example4",
    data: {
        isActive: true,
        'text-danger': true
    }
});

// Inline Style
new Vue({
    el: "#style-example",
    data : {
        mainColor: 'blue',
        mainSize: '30px',
        baseStyles : {
            'text-decoration': 'underline',
            'letter-spacing': '2px'
        }
    }
});

// ===========================================

//* Contidionals
new Vue({
    el: "#conditional",
    data : {
        type: 'D'
    }
});

// ===========================================

//* Controlling Reusable Elements with `key`
new Vue({
    el: "#reusable-key",
    data: {
        loginType: 'username'
    },
    methods: {
        toggleLoginType: function () {
            this.loginType = this.loginType === 'username' ? 'email':'username';
            this.input = '';
        }
    }
});

// `key` attr - unique values; don't reuse them

// ===========================================
//* List rendering
new Vue({
    el: "#list-example1",
    data : {
        parentMessage: 'Parent',
        items: [
            { message : 'Foo' },
            { message : 'Bar' },
        ]
    }
});

// v-for object
new Vue({
    el: "#v-for-obj",
    data: {
        object: {
            firstName: 'Andrei',
            lastName: 'Gatej',
            age: 17
        }
    }
});

// ===========================================
//* Array and Object mutation

var vm = new Vue({
    data: {
        items: [1,2,3,4,5]
    }
});

// vm.items[1] = 'x'; //! NOT reactive
// vm.items.length = 2 //! NOT reactive
// vm.items.splice(newLength) - 
console.log(vm.items) 

//? Vue.set(vm.items,indexOfItem, newValue);
//? vm.items.slice(index,1,newValue)
vm.$set(vm.items,0,'A'); // Alias for Vue.set()
// console.log(vm.items)

// Object Change Detection Caveats
var vm = new Vue({
    data: {
      a: 1
    }
}); // vm.a - reactive

vm.b = 2; //! NOT reactive

// It's possible to add reactive properties to a nested object
// Vue.set(object,key, value);

// ===========================================
//* Filtered Results
new Vue({
    el: "#filtered",
    data: {
        numbers: [1,2,3,4,5],
        todos: ['one', 'two', 'three']
    },
    // Not feasible when having nested v-for loops
    computed: {
        evenNumbers: function() {
            return this.numbers.filter(function(num) {
                return num % 2 === 0;
            });
        }
    },
    methods: {
        even: function(numbers) {
            return numbers.filter(num => ! (num % 2) );
        }
    }
});

// ===========================================
//* Todo List

Vue.component('todo-item', {
    template: '\
        <li :class="{\'text-danger\': this.status}">\
            {{ title }}\
            <button @click="$emit(\'remove\')">Remove</button>\
            <button @click="$emit(\'change-status\')">Change Status</button>\
        </li>\
    ',
    props: ['title','status']
});

new Vue({
    el: "#todo-list-example",
    test: true,
    data: {
        todoInput: '',
        todos: [
            {
            id: 1,
            title: 'Do the dishes',
            status: true
            },
            {
            id: 2,
            title: 'Take out the trash',
            status: false
            },
            {
            id: 3,
            title: 'Mow the lawn',
            status: true
            }
        ],
        nextTodoId: 4
    },
    methods: {
        addNewTodo: function () {
            if(this.todoInput === '') {
                return;
            }
            this.todos.push({
                id: this.nextTodoId++,
                title: this.todoInput,
                status: false
            });
            this.todoInput = '';
        },
        change: function(item) {
            item.status = !item.status;   
        }
    }
});

// ===========================================
//* Events
new Vue({
    el: "#events",
    methods: {
        showAlert: function(event) {
            alert(event.target.tagName);
        }
    }
});

// ===========================================
// ===========================================
// ===========================================
