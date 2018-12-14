import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Home from './components/Home';
import Test from './components/Test';
import Dummy from './components/Dummy';
import PassFunction from './components/PassFunction'
import Welcome from './components/Welcome.vue';

Vue.config.productionTip = false
Vue.use(VueRouter)

const call = (fn, ...args) => event => fn(args, event)

// Using functions depending on router
function wrapView(component, { events, elements: { title }}) {
  // You could also loop through elements... generate depending on router
  return {
    functional: true,
    render: (h, context) => {
      const {data, children} = context
      // console.log(data, children)
      // console.warn(context.listeners) // gain access to the event passed from <router-view></router-view>
      return h(component, {
        ... data //, attrs: { id: "demo" } - will override what's passed from <router-view></router-view>
      }, 
      // This will be added to the <slot />
      [ children || 'no children', ' ' ,h('button', {
        on: events
      }, 'check console'),' ', h('button', {
        on: {
          // Passing arguments as well
          click: call(events.login, 'arg1', 'arg2', 'arg3...')
        }
      }, 'try here'),h('p', JSON.stringify(data)),h(title.tag, title.options, title.content)])
    }
  }
}


const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '', name: 'home', component: Home },
    { path: '/test', name: 'test', component: Test, props: {
      'number': 3,
      name: 'andrei' // You must register it as a prop in the actual component
      }
    },
    { path: '/dummy/:slug?/:action', name: 'dummy', component: Dummy, beforeEnter: (to, from, next) => {
      console.log('welcome to dummy comp')
      next()
      },
      props: true
    },
    { path: '/func', name: 'addfunc', component: PassFunction},
    { path: '/welcome', name: 'welcome', component: wrapView(Welcome, {
      events: {
        login: (args, ev) => {console.warn('click'); console.warn('args', args), console.warn('event', ev)},
        click: () => { console.log('hmmm') }
      },
      elements: {
        title: {
          tag: 'h1',
          options: {
            attrs: {
              class: 'green'
            },
            on: {
              click: function () { router.push({ name: 'home' }) }
            }
          },
          content: 'Go back to Home Tab'
        }
      }
    })}
  ]
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
