<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <!-- <h1 v-myDir:click="{event: showAlert, param1: 'First Param', param2: 'Second Param' }">Directives Exercise</h1> -->
                <button v-changeClass:click="'danger'" class="btn btn-primary">Click me!</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        directives: {
            'myDir': {
                bind(el, binding, vNode) {
                    if (binding.arg === 'click') {
                        const {event, ...rest } = binding.value;
                        binding.value.event(... Object.values(rest));
                    }
                }
            },
            'changeClass': {
                bind(el, binding, vNode) {
                    let eventName = binding.arg;
                    
                    el.addEventListener(eventName, () => {
                        let classModifier = binding.value;
                        el.classList.value = el.classList.value.replace(/(btn-)(\S+)/g, (match, first, second) => {
                            return first + classModifier;
                        })
                    })
                }
            }
        },
        methods: {
            showAlert(...params) {
                alert(JSON.stringify(params));
            }
        }
    }
</script>

<style>
</style>