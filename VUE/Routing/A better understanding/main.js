import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Home from './components/Home';
import Test from './components/Test';
import Dummy from './components/Dummy';
import PassFunction from './components/PassFunction'

Vue.config.productionTip = false
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '', name: 'home', component: Home },
    { path: '/test', name: 'test', component: Test, props: {
      'number': 3,
      name: 'andrei' // You must register it as a prop in the actual component
      }
    },
    { path: '/dummy/:slug?/:action?', name: 'dummy', component: Dummy, beforeEnter: (to, from, next) => {
      console.log('welcome to dummy comp')
      next()
      },
      props: true
    },
    { path: '/func', name: 'addfunc', component: PassFunction}
  ]
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
