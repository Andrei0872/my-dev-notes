
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://vuejs-http-39b85.firebaseio.com' 
});


instance.defaults.headers.common['SOMETHING'] = 'something'

export default instance
