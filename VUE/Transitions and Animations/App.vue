<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1>Animations</h1>
                <hr>
                <select v-model="alertAnimation" class="form-control">
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                </select>
                <br>
                <button class="btn btn-primary" @click="show = !show">Show Alert!</button>
                <br><br>
                <!-- TODO: try hook -->
                <transition :name="alertAnimation" appear @before-enter="beforeEnterFn">
                    <div class="alert alert-info" v-if="show">This is dynamic!</div>
                </transition>
                <br><br>
                <!-- Removing is done once the animation finishes  -->
                <transition name="slide" type="animation">
                    <div class="alert alert-info" v-if="show">This is awesome info</div>
                </transition>
                <!-- Animate the initial attaching to the DOM -->
                <!-- Override the defaults -->
                <transition 
                    appear
                    @enter="customEnter"
                    enter-active-class="animated bounce"
                    leave-active-class="animated shake"
                    >
                    <div class="alert alert-info" v-if="show">This is awesome info</div>
                </transition>
                <!-- mode="out-in" - wait for the old one to be removed -->
                <transition :name="alertAnimation" mode="out-in">
                    <!-- Vue in not able to differenciate this 2 -->
                    <!-- Only swaps the content, not the element -->
                    <div class="alert alert-info" v-if="show" key="info">This is some Info ;)</div>
                    <div class="alert alert-warning" v-else key="warning">This is some Warning</div>
                </transition>
                <hr>
                <!-- Leaving the CSS world :) -->
                <button class="btn btn-primary" @click="load = !load">Load /  Remove Element</button>
                <br><br>
                <transition
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @enter-cancelled="enterCancelled"

                    @before-leave="beforeLeave"
                    @leave="leave"
                    @after-leave="afterLeave"
                    @leave-cancelled="leaveCancelled"

                    :css="false"
                >
                    <div style="width:300px; height:100px; background-color:lightgreen" v-if="load"></div>
                </transition>
                <br><br>
                <!-- Animating components -->
                <hr>
                <button class="btn btn-primary" @click="selectedComponent = selectedComponent === 'app-success-alert' ? 'app-danger-alert' : 'app-success-alert'">Toggle Components</button>
                <br>
                <br>
                <transition name="fade" mode="out-in">
                    <component :is="selectedComponent"></component>
                </transition>
                <hr>
                <!-- Group transition -->
                <button class="btn btn-primary" @click="addItem">Add Item</button>
                <br><br>
                <ul class="list-group">
                    <transition-group name="slide">
                        <li 
                            class="list-group-item"
                            v-for="(number, index) in numbers"
                            @click="numbers.splice(index,1)"
                            style="cursor: pointer"
                            :key="number"
                        >{{ number }}</li>
                    </transition-group>
                </ul>
            </div>  
        </div>
    </div>
</template>

<script>
    import DangerAlert from './DangerAlert.vue';
    import SuccessAlert from './SuccessAlert.vue';

    export default {
        data() {
            return {
                show: false,
                load: true,
                alertAnimation: 'fade',
                elementWidth: 100,
                selectedComponent: 'app-success-alert',
                numbers: [1,2,3,4,5]
            }
        },
        methods: {
            // elem - the element on which the animation is performed
            beforeEnter(elem) {
                console.warn('beforeEnter');
                this.elementWidth = 100;
                // Reset before adding it to the DOM
                elem.style.width = this.elementWidth + 'px';
            },
            // done - a function; needed to tell Vue js when this animation finishes
            enter(elem, done) {
                console.warn('enter');
                
                let round = 1;
                const interval = setInterval(() => {
                    // 110, 120, 130...
                    elem.style.width = (this.elementWidth +  round * 10) + 'px';
                    round++;
                    if(round > 20) {
                        clearInterval(interval);
                        // Mark as finished
                        done();
                    }
                }, 20);
                
                // Tell when you are done
                //! You don't need to use this function when having CSS Animations
                // done();
                
            },
            afterEnter(elem) {
                console.warn('after enter')
            },
            enterCancelled(elem) {
                console.warn('enter cancelled');
            },
            beforeLeave(elem) {
                // Set state
                console.warn('before leave');
                // 100 + 20 * 10
                this.elementWidth = 300;
                elem.style.width = this.elementWidth + 'px';
            },
            leave(elem, done) {
                console.warn('leave')

                let round = 1;
                const interval = setInterval(() => {
                    // 110, 120, 130...
                    elem.style.width = (this.elementWidth -  round * 10) + 'px';
                    round++;
                    if(round > 20) {
                        clearInterval(interval);
                        // Mark as finished
                        done();
                    }
                }, 20);

                // We want to know when we're done
                // done();
            },
            afterLeave(elem) {
                console.warn('after leave');
            },
            leaveCancelled(elem) {
                console.warn('leave cancelled');
            },
            beforeEnterFn(elem){
                console.info(elem)
                // elem.style.fontSize = '30px';
            },
            customLeave(elem, done) {
                console.warn(elem)
                Object.assign(elem.style, {
                    'transition' : 'opacity 1s'
                });
                done();
            },
            customEnter(elem, done) {
                // Object.assign(elem.style, {
                //     '-webkit-animation-duration': '.92s'
                // });
                done();
            },
            addItem() {
                const pos = Math.floor(Math.random() * this.numbers.length );
                this.numbers.splice(pos, 0, Math.max(... this.numbers) + 1);
            }
        },
        components: {
            appDangerAlert: DangerAlert,
            appSuccessAlert: SuccessAlert
        }
    }
</script>

<style>
    /* At the beginning */
    /* Set the initial state */
    /*//* This gets removed after one frame */
    .fade-enter {
        opacity: 0;
    }
    /* The whole animation time */
    /* This will animate it */
    .fade-enter-active {
        transition: opacity 1s;
    }
    .fade-leave {
        /* //* This is the default */
        /* opacity: 1 */
    }
    /* The default opacity is one */
    .fade-leave-active {
        transition: opacity 1s;
        /* We're saying: Animate when opacity changes */
        opacity: 0;
    }

    /* ======================================================== */

    .slide-enter {
        /* No need to set `transform` prop here, hence is set in the @keyframe */
        /* transform: translateY(20xp); */
        opacity: 0;
    }

    .slide-enter-active {
        /* Play the animation */
        /* `forwads` - stays in the finishing position */
        animation: slide-in 1s ease-out forwards;
        transition: opacity .5s;
    }

    .slide-leave {

    }

    .slide-leave-active {
        animation: slide-out 1s ease-out forwards;
        transition: opacity 1s;
        opacity: 0;
        /* Make sure the other elements move above this element while this elem is beinig animated*/
        position: absolute;
    }

    .slide-move {
        transition: transform 1s;
    }

    @keyframes slide-in {
        from {
            transform: translateY(20px);
        }
        to {
            transform: translateY(0);
        }
    }

    @keyframes slide-out {
        from {
            transform: translateY(0);
        }
        to {
           transform: translateY(20px);
        }
    }

</style>