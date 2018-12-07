
<template>
    <div>
        <div class="list-container">
            <transition name="fade" mode="out-in">
            <div v-if="!selected">
                <div
                    class="list-container-item"
                    v-for="(item, index) in items"
                    :key="index"
                    @click="getInfo(index), selected = !selected"
                >
                    <span>{{ item.title }}</span>
                </div>
            </div>
                <app-nonfunctional  @click="changeState" :details="info" v-if="selected"></app-nonfunctional>\
            </transition>
            <hr>
            <real-functional :items="items"></real-functional>
        </div>
    </div>    
</template>


<script>
import NonFunctional from './NonFunctional.vue';
import RealFunctional from './RealFunctional.vue';

export default {
    data() {
        return {
            selected: false,
            elem: '',
            info: {nume: 'andrei'},
            items: [
                { title: 'Link 1', img:'image_src1' },
                { title: 'Link 2', img:'image_src2' },
                { title: 'Link 3', img:'image_src3' },
                { title: 'Link 4', img:'image_src4' },
            ]
        }
    },
    components: {
        'app-nonfunctional': NonFunctional,
        'real-functional': RealFunctional
    },
    methods: {
        getInfo(index) {
            this.info = this.items[index];
        },
        changeState() {
            this.selected = !this.selected
        },
        customFunc(param) {
            console.log(this.elem)
        }
    }
}
</script>


<style>
    .list-container {
        padding: 10px;
    }
    
    .list-container-item {
        margin: 10px;
    }

    .list-container-item:hover {
        text-decoration: underline;
    }


    /* Fade Transition */
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
