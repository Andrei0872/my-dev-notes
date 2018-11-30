<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1>Custom Directive</h1>
                <p v-highlight.delayed="'red'">Color This</p>
                <p v-local-highlight:background.delayed.blink="{mainColor: 'red', secondColor:'green', delay:500}">Color This, too</p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        // Registering Directives Locally
        directives: {
            'local-highlight': {
                bind(el, binding, vnode) {
                    let delay = 0;
                    if (binding.modifiers['delayed']) {
                        delay = 3000;
                    }
                    if(binding.modifiers['blink']) {
                        let mainColor = binding.value.mainColor;
                        let secondColor = binding.value.secondColor;
                        let currentColor = mainColor;
                        setTimeout(() => {
                            setInterval(() => {
                                currentColor = currentColor === secondColor ? mainColor: secondColor;
                                if (binding.arg === 'background') {
                                    el.style.backgroundColor = currentColor;
                                } else {
                                    el.style.color = currentColor;
                                }
                            }, binding.value.delay);
                        }, delay);
                    } else {
                        setTimeout(() => {
                            if (binding.arg === 'background') {
                                el.style.backgroundColor = binding.value.mainColor;
                            } else {
                                el.style.color = binding.value.mainColor;
                            }
                        }, delay);
                    }
                    console.warn(binding);
                    console.warn(el);
                }
            }
        }
    }
</script>

<style>

</style>