
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
        ]
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
// ===========================================
// ===========================================
// ===========================================