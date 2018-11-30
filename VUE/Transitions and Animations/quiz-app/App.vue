<template>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <h1 class="text-center">The Super Quiz</h1>
            </div>  
        </div>
        <hr>
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <transition name="flip" mode="out-in">
                    <component :is="selectedComponent" @resetGame="reset" @checkButton="checkButton" :results="results" :question="question"></component>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import Question from './components/Question';
import Answer from './components/Answer';

export default {
    components: {
        appQuestion: Question,
        appAnswer: Answer
    },
    methods: {
        checkButton(value) {
            value === this.finalResult ?  this.selectedComponent = 'appAnswer' : alert('Try again!');
        },
        reset() {
            this.selectedComponent = 'appQuestion';
            this.generateQuestion();
        },
        generateQuestion () {
            this.results = [];
            let num1 = Math.floor(Math.random() * 100);
            let num2 = Math.floor(Math.random() * 100);
            let operator = Math.floor(Math.random() * this.operators.length)
            let sign = this.operators[operator].sign;
            let expected_result = this.operators[operator].fn(num1,num2);

            this.finalResult = expected_result;
            
            let temp = []
            while (temp.length < 4) {
                let random = this.getRandomNumber(expected_result - 10, expected_result + 10, expected_result);
                temp.includes(temp) ? null: temp.push(random); 
            }
            this.results = temp;
            this.results[Math.floor(Math.random() * 4)] = this.finalResult;
            this.question =  `What's ${num1} ${sign} ${num2}`; 
        },
        getRandomNumber(min, max, avoid) {
            let random = Math.floor(Math.random() * (max - min)) + min;
            return random === avoid ? random + 1 : random;
        }
    },
    data() {
        return {
            selectedComponent: 'appQuestion',
            results: [],
            finalResult: '',
            operators: [
                {sign: '+' ,fn: (x, y) => x + y },
                {sign: '-', fn: (x, y) => x - y},
                {sign: '/', fn: (x, y) => Math.floor(x / y)},
                {sign: '*', fn: (x, y) => x * y},
                {sign: '%', fn: (x, y) => x % y}
            ],
            question: ''
        }
    },
    created() {
        this.generateQuestion();
    }
}
</script>

<style>
    .flip-enter {
    }

    .flip-enter-active {
        animation: flip-in 0.5s ease-out forwards;
        /* transition: transform 1s; */
    }

    .flip-leave {
        /*  */
    }

    .flip-leave-active {
        transform: flip-out 0.5s ease-out forwards;
        /* transition: transform 1s; */
    }

    @keyframes flip-out {
        from {
            transform: rotateY(0deg);
        }
        to {
            transform: rotateY(90deg);
        }
    }

    @keyframes flip-in {
        from {
            transform: rotateY(90deg);
        }
        to {
            transform: rotateY(0deg);
        }
    }

</style>