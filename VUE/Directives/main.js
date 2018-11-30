import Vue from 'vue'
import App from './App.vue'

Vue.directive('highlight', {
  bind(el, binding, node) {
    // el.style.backgroundColor = 'green';
    // el.style.backgroundColor = binding.value;
    let delay = 0;
    if (binding.modifiers['delayed']) {
      delay = 3000;
    }
    setTimeout(() => {
      if (binding.arg === 'background') {
        el.style.backgroundColor = binding.value;
      } else {
        el.style.color = binding.value
      }
    }, delay);
    // console.warn(binding);
    // console.warn(el);
  }
});

new Vue({
  ...App
}).$mount('#app');