
import Vue from 'vue';
import Vuex from 'vuex';
import counter from './modules/counter';
// import * as actions from './actions'; // Not using a namespace
import actions from './actions';
// import * as mutations from './mutations'; Not using a namespace
import mutations from './mutations';
import getters from './getters';

Vue.use(Vuex);

export const store = new Vuex.Store({
    // Store all the props that our app has
    state: {
        value: 0
    },
    getters,
    // Mutation - always has to be synchronous
    // Have to change the state immediately
    mutations,
    // Run code asynchronously
    // actions: {
    //     // increment: context => {
    //     //     // We have access to our store
    //     //     context.commit('increment');
    //     // }
    // },
    actions,
    modules: {
        counter
    }
});