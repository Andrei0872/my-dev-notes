<template>
  <div id="dashboard">
    <h1>That's the dashboard!</h1>
    <p>You should only get here if you're authenticated!</p>
    <hr>
    <p>Emails</p>
    <ul class="list-group">
      <li
        class="list-group-item"
        v-for="(email, index) in emails"
        :key="index"
      >{{ email }}</li>
    </ul>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    data() {
      return {
        emails: []
      }
    },
    created() {
      axios.get('users.json', {
        // transformResponse: [
        //   data => {
        //     return data;
        //   }
        // ]
      })
        .then(resp => {
          console.log(resp.data)
          const tempEmails = [];

          // It may be recommended that you save the id(the encrypted thing)
          for(let key of Object.values(resp.data)) {
            tempEmails.push(key.email)
          }
          this.emails = tempEmails;
        })
        .catch(err => console.log(err))
        .then(() => {
          // finally block
          console.warn('finally');
        })
    }
  }
</script>

<style scoped>
  h1, p {
    text-align: center;
  }

  p {
    color: red;
  }
</style>