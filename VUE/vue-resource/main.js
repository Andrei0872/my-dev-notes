import Vue from 'vue'
import VueResource from 'vue-resource';
import App from './App.vue'

// Add a plugin
Vue.use(VueResource);

Vue.http.options.root = 'https://vuejs-http-39b85.firebaseio.com/';

// Array of functions to be executed on each request
// next - a cb fn -  you don't want your request to end with this function
Vue.http.interceptors.push((req, next) => {
  // POST - append
  if(req.method === 'POST')  {
    // PUT - Override
    req.method = 'PUT'
  }
  
  // Having access to the response
  next(resp => {
    // Override json
    // Since we're using a PUT method, the returned data will not be an object
    // So to solve this, create the following object, where 'message' is the key
    resp.json = () => {
      return { messages: resp.body }
    }
  });
});

new Vue({
  ...App
}).$mount('#app');