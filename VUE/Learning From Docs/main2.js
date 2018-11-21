// =============================================
//* Form Input Bindings
new Vue({
    el: "#input",
    data: {
        inputText: 'andrei',
        trimmed: ''
    }
});

// =============================================
//* Components
Vue.component('button-counter', {
    // If Vue didn't have this rule, clicking one button would affect the data of all other instances
    data: function () {
        return  {
            count: 0
        }
    },
    template: '<button @click="count++">You clicked me {{ count === 0 ? "no times" : count === 1 ? count + "time" :  count + " times" }} </button>'
});

new Vue({ el: "#components-demo" });

// Passing Data to Child Components
Vue.component('blog-post',  {
    props: ['post'],
    template: `
       <div>
            <h3> {{ post.author }} </h3>
            <p><strong>Published at: </strong> {{ post.publishedAt }}</p>
            <p><i>Author: <i> {{ post.author }}</p> 
       </div>
    `
});

new Vue({
    el: "#blog-post-demo",
    data: {
        posts: [
            { id:1, title: 'First', publishedAt: (new Date()).toLocaleTimeString(), author: "Dan" },
            { id:2, title: 'Second', publishedAt: (new Date()).toLocaleTimeString(), author: "Andrei" },
            { id:3, title: 'Third', publishedAt: (new Date()).toLocaleTimeString(), author: "Vlad"},
        ]
    }
});

// Sending messages to parents From Events
Vue.component('blog-post2', {
    props: ['post','colors'],
    template: `
        <div>
            <h3> {{ post.title }} </h3>
            <button @click="$emit('enlarge-text',0.1)">Enlarge Text</button>
            <button @click="$emit('reduce-text',0.1)">Reduce Text</button>
            <button @click="$emit('test-func',0.1,colors[Math.floor(Math.random() * colors.length)])">Test</button>
        </div>
    `
});

new Vue({
    el: "#blog-post-demo2",
    data: {
        posts: [
            { id:1, title: 'First' },
            { id:2, title: 'Second' },
            { id:3, title: 'Third' },
        ],
        postSize: 1,
        colors: ['green', 'red','blue'],
        defaultColor: 'yellow'
    },
    methods: {
        testFunc: function (event, second) {
            this.defaultColor = second;
        }
    }
});

// v-model on Components
Vue.component('custom-input', {
    props: ['value'],
    template: `
      <input
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      >
    `
})

new Vue({
    el: "#custom-inp"
});


// =============================================
// =============================================
// =============================================
// =============================================
// =============================================
// =============================================

