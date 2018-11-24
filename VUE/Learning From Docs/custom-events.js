
// Example : the 'value' property: it is important for radio and checkbox input types
// By default, v-model uses `value` as the prop and `input` as the event
// but some input types such as checkboxes and radio btns may want to use 
// the value attribute for different purpose(sending data to server)
// We can avoid conflicts by using the `model` object
Vue.component('base-checkbox', {
    model: {
      prop: 'checked',
      event: 'change'
    },
    props: {
      checked: Boolean
    },
    template: `
      <input
        type="checkbox"
        v-bind:checked="checked"
        v-on:change="$emit('change-state', $event.target.checked, $event.target.tagName)"
      >
    `
  })


new Vue({
    el: "#demo",
    data: {
        lovingVue: false
    },
    methods: {
        showAlert: function (event, param) {
            console.log('event',event);
            console.log('param',param);

        }
    },
    watch: {
        lovingVue: function (newVal, oldVal) {
            console.log('old', oldVal);
            console.log('new', newVal);
        }
    }
});

// =======================================
//* Binding Native Events to Components

new Vue({
    el: "#app",
    components: {
        'parent': {
            name: 'parent',
            template: "#parent-component",
            data: function () {
                return  {
                    id: 'Hello',
                    cls: 'all'
                }
            },
            methods: {
                sayHello: function () {
                    alert('Hello');
                }
            },
            // As a parent, this component also contains components
            components: {
                'inherited-child': {
                    name: 'inherited-child',
                    template: "#child-component",
                },
                'noninherited-child': {
                    inheritAttrs: false,
                    name: 'noninherited-child',
                    template: "#child-component"
                }
            }
        }
    }
});
