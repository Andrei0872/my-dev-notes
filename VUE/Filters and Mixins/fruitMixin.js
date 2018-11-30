
// This is not shared
// Each comp which includes this mixin will get a copy of this object
export const fruitMixin = {
    data() {
        return {
            fruits: ['Apple', 'Banana', 'Mango', 'Melon'],
            filterText: ''
        }
    },
    computed: {
        // Only when filterText || fruit array changes
        filteredFruits() {
            return this.fruits.filter((element) => {
                return element.toLowerCase().match(this.filterText);
            });
        }
    },
    created() {
        console.warn('created');
    }
};