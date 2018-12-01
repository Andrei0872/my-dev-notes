// export const  updateValue =  (state, payload) => {
//     state.value = payload
// }

import * as types from './types';

export default {
    [types.UPDATE_VALUE]: (state, payload) => {
        state.value = payload;
    }
};