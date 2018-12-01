import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue'
import { routes } from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if(savedPosition) {
      // console.warn('saved', savedPosition)
      return savedPosition;
    }
    if(to.hash) {
      // console.warn('has hash')  
      return { selector: to.hash };
    }
    // console.warn('back to top')
    return {x: 0, y: 0}
  }
});

// Is the user allowed to enter ? 
// beforeEach() - execute this before any route action
// next - let the request continue its journey
router.beforeEach((to, from, next) => {
  console.warn('global beforeach');
  // If omitted, it would consider that the user is not allowed to continue
  // Params: nothing(continue its journey), false(abort), path, or obj defining that object
  next();
});

new Vue({
  ...App,
  router
}).$mount('#app');