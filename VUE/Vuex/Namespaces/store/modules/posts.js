import * as types from '../types';

const state = {
    posts: [1,2,3,4,5]
};

const getters = {
    nrPosts: state => state.posts.length,
    getPosts: state => state.posts
};

const mutations = {
    add: state => { state.posts.push(Math.random() * 3) },
    delete: (state, index) => { state.posts.splice(index,1)}
};

const actions = {
    add: ({ commit }) => { commit('add'); },
    delete: ({ dispatch, commit }, index) => { dispatch('deleteUtil', index) },
    deleteUtil: ({ commit }, index) => { commit('delete', index) },
    updateVal: ({ commit }, payload) => {
        commit(types.UPDATE_VALUE, payload, { root: true });
    }
}

export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true,
}
