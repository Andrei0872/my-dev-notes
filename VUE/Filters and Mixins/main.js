import Vue from 'vue'
import App from './App.vue'

// Global Filter
Vue.filter('to-lowercase', function (value) {
  return value.toLowerCase();
});

// Global Mixin

Vue.mixin({
  created() {
    console.warn('global mixin created hook');
  }
});

new Vue({
  ...App
}).$mount('#app');