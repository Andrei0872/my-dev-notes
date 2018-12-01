<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1 class="text-center">Sharing Data Between Components</h1>
                <base-input @data-sent="addItem"></base-input>
                <hr>
                <app-response :msg="message"></app-response>
            </div>  
        </div>
    </div>
</template>

<script>
import BaseInput from './components/BaseInput';
import Response from './components/Response';

export default {
    components: {
        'base-input': BaseInput,
        'app-response': Response
    },
    data() {
        return {
            message: ''
        }
    },
    methods: {
        addItem(value) {
            this.message = value;
        }
    }
}
</script>

<style>
    
</style>