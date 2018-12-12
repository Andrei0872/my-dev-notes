
<script>
    const mounted = () => {
        document.body.style.overflow = 'hidden';
    }
    const beforeDestroy = () => {
        document.body.style.overflow = null;
    };

    const fun = function (e, index) {
        console.log(index)
    }

    import Test from './Test.vue';

    export default {
        props: ['items'],
        render (h) {
            const items = this.$props.items.map((item, index) => h('div', {
                on: {
                    click: this.func
                },
                attrs: {
                    'data-index': index
                }
            }, [h('b', item.title),' ', h('i', item.img)]))
            
            // const result = this.selected ? h('Test', { props: { details: this.info }, on: { click: this.testFunc } }) : h('div',[items]);
            let self = this;
            const result = this.selected ? h('Test', { 
                props: { details: this.info }, 
                on: { 
                    click: function() { self.selected = !self.selected } 
                    } 
                }) : h('div',[items]);

            const transition = h('transition', {
                 props: { name: "fade", mode: "out-in" } 
                }, [result] );
            
            return transition
        },
        methods: {
            func(e) {
                const index = e.currentTarget.getAttribute('data-index')
                this.info = this.items[index]
                this.info.index = index
                this.selected = !this.selected
            },
            testFunc() {
                this.selected = !this.selected
            }
        },
        data() {
            return {
                info: {},
                selected: false
            }
        },
        components: {
            Test
        }
    }
</script>

<style >
    .fade-enter {
        opacity: 0;
    }

    .fade-enter-active {
        transition: opacity 1s ease;
    }

    .fade-leave {}

    .fade-leave-active {
        opacity: 0;
        transition: opacity 1s ease;
    }
</style>