
<script> 
    const call = (fn, ...args) => context =>  fn(args, context) 
    const generateArr = () => [... Array(Math.floor(Math.random() * 10) + 1)]

    export default {
        functional: true,
        render(h, context) {
            console.log(context)
            const title = h('h3', `Click the button ${context.props.number || 0}, ${context.data.attrs.number || 0}, ${context.props.name}`)
            const button = h('button', {
                on: {
                    click: call(context.listeners.click, ...generateArr())
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
        props: ['name']
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
