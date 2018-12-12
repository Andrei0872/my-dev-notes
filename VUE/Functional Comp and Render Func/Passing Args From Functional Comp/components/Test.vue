
<script> 
    const call = (fn, ...args) => context =>  fn(args, context) 
    const generateArr = () => [... Array(Math.floor(Math.random() * 10) + 1)]

    export default {
        functional: true,
        render(h, context) {
            const title = h('h3', 'Click the button!')
            const button = h('button', {
                on: {
                    // click: context.listeners.click.bind(null, [1,2,3])
                    click: call(context.listeners.click, ...generateArr())
                    //! You want to return a function that has not been executed yet
                    // click: context.listeners.click.apply(null, [1,2,3])
                },
                style: {
                    'background-color': '#ccc',
                    'outline': 'none'
                },
                domProps: {
                    // 'innerHTML': 'hmm'
                },
                attrs: {
                    class: 'btn big'
                }
            }, context.parent.sayHello())

            return h('div', [title, button])
        },
        props: ['counter']
    }    
</script>

<style lang="scss" scoped>
    button.big {
        font: {
            size: 1.4rem;
            weight: bold;
        }
    }
</style>
