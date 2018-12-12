
<script>
    export default {
        props: ['details'],
        functional: true,
        render(h, context) {
            const {title, img, index } = context.props.details || {}; 

            return h('div', {
                key: 1 // In order to make the transition work
            }, [
                h('h1', title),
                h('p', `Img source : ${img}`),
                h('button', {
                    on: {
                        click: context.listeners.click
                    }
                }, 'Go Back!')
            ]);
        }
    }
</script>