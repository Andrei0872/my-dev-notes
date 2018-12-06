import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import store from './store'

// Set global options that will be applied to any request
axios.defaults.baseURL = 'https://vuejs-http-39b85.firebaseio.com'
// common - applied to any request, no matter its type
axios.defaults.headers.common['Authorization'] = 'abcd'
// get - targetting `get` requests
axios.defaults.headers.get['Accepts'] = 'application/json'

// config - requrest configuration
const reqInterceptor = axios.interceptors.request.use(config => {
  console.log('configuration',config)
  // You can manipulate the request configuration
  // For example, adjust things on the fly..
  config.headers['SOMETHING'] = Math.random()
  return config
});

const respInterceptor = axios.interceptors.response.use(res => {
  console.log('response', res)
  return res
});

// Getting rid of the interceptors
axios.interceptors.request.eject(reqInterceptor);
axios.interceptors.response.eject(respInterceptor);


new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
