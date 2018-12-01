
import * as types from '../types';

const state = {
    counter: 0,
    value: 10
};

const getters = {
    [types.DOUBLE_COUNTER]: (state, getters, rootState, rootGetters) => (console.warn(rootState),console.warn(getters), console.warn(rootGetters),state.counter * 2),
    [types.CLICK_COUNTER]: state => state.counter + ' clicks'
};

const mutations = {
    increment: (state, payload = 1) => {
        state.counter += payload;
    },
    decrement: (state, payload) => {
        state.counter -= payload;
    }
};

const actions = {
    // { state, commit, rootState } = context
    increment: ({ state, commit, rootState }, payload = 1) => {
        // console.warn(state)
        // console.warn(rootState)
        commit('increment', payload);
    },
    decrement: ({ commit }, payload) => {
        commit('decrement', payload);
    },
    asyncIncrement: ({ commit }, payload) => {
        setTimeout(() => {
            commit('increment', payload.by);
        }, payload.duration)
    },
    asyncDecrement: ({ commit }, payload) => {
        setTimeout(() => {
            commit('decrement',payload.by);
        }, payload.duration);
    }
};

export default {
    state,
    mutations,
    actions,
    getters
}