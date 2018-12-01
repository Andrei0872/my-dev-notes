
import User from './components/user/User.vue';
import UserStart from './components/user/UserStart.vue';
import UserDetail from './components/user/UserDetail.vue';
import UserEdit from './components/user/UserEdit.vue';
import Home from './components/Home.vue';
import Header from './components/Header.vue';



// path - what will be appended to the URL
export const routes = [
    { path: '', name: 'home', components: {
        default: Home,
        'headerTop': Header
    } },
    { path: '/user', components: {
        default: User,
        'headerBottom': Header
    }, children: [
        // If you use / - the name will be appended to your domain
        // If you leave away the / - will be appended to the parent route
        { path: '', component: UserStart }, // This gets selected by default
        { path: ':id', component: UserDetail, beforeEnter: (to, from, next) => {
            // console.log('inside route setup')
            // TODO: try path
            // next({ name: 'home' });
            // next(false);
            next();
        } }, 
        { path: ':id/edit', component: UserEdit, name: 'userEdit' }
    ]},
    { path: '/redirect-me', redirect: { name: 'home' } },
    { path: '*', redirect: '/' }
];