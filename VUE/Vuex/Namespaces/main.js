import Vue from 'vue'
import App from './App.vue';

import { store } from './store/store';

new Vue({
  ...App,
  store
}).$mount('#app')
