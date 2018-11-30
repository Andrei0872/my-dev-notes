
export const myMixin = {
    computed: {
        reversed_computed() {
            return this.firstEx.split``.reverse().join``;
        },
        showLengh_computed() {
            return this.secondEx.length !== 0 ?  `${this.secondEx} ${this.secondEx.length}` : '';
        }
    }
};