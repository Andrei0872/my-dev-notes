<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h3>Routing</h3>
                <hr>
                <!-- <app-header></app-header> -->
                <router-view name="headerTop"></router-view>
                <!-- Tell the router where to render the componenet// -->
                <!-- This gets loaded by default -->
                <transition name="slide" mode="out-in">
                    <router-view></router-view>
                </transition>
                <router-view name="headerBottom"></router-view>
            </div>  
        </div>
    </div>
</template>

<script>
import Header from './components/Header';

export default {
    components: {
        appHeader: Header
    }
}
</script>

<style>
    .slide-leave-active {
        transition: opacity 1s ease;
        opacity: 0;
        animation: slide-out 1s ease-out forwards;
    }
    
    .slide-leave {
        opacity: 1;
        /* transform: translateY(0); */
    }

    .slide-enter-active {
        animation: slide-in 1s ease-out forwards;
    }

    @keyframes slide-out {
        0% {
            transform: translateY(0);
        }
        100% {
            transform: translateY(-30px);
        }
    }

    @keyframes slide-in {
        0% {
            transform: translateY(-30px);
        }   
        100% {
            transform: translateY(0);
        }
    }

</style>