<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1>Filters & Mixins</h1>
                <input type="text" v-model="firstEx" placeholder="Reverse...">
                <p>{{ firstEx | reverse }}</p>
                <hr>
                <input type="text" v-model="secondEx" placeholder="show text and length">
                <p>{{ secondEx | showLengh }}</p>
                <hr>
                <p> {{ reversed_computed }} </p>
                <p> {{ showLengh_computed }} </p>
                <hr>
            </div>
        </div>
    </div>
</template>

<script>
    import { myMixin } from './myMixin.js';

    export default {
        mixins: [myMixin],
        filters: {
            reverse(value) {
                return value.split``.reverse().join``;
            },
            showLengh(value) {
                return value.length !== 0 ?  `${value} ${value.length}` : '';
            }
        },
        data() {
            return {
                firstEx: '',
                secondEx: ''
            }
        }
    }
</script>

<style>
</style>