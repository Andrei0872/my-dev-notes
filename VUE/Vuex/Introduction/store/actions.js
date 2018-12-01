
import * as types from './types';

// export const updateValue =  ({ commit }, payload) => {
//     commit('updateValue', payload);
// };

// export const action2 = () => {}

//* If I would use a namespace
export default {
    [types.UPDATE_VALUE] : ({ commit }, payload) => {
        commit(types.UPDATE_VALUE, payload)
    }
};