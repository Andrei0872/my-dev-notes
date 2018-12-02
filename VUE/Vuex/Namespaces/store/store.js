
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
    state: {
        value: 0
    },
    getters,
    mutations,
    actions,
    modules: {
        counter
    }
});