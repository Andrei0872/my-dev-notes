<template>
    <div>
        <div
            id="on"
            @click="switched(true)"
            :class="{active: value}"
        >On</div>

        <div
            id="off"
            @click="switched(false)"
            :class="{active: !value}"
        >Off</div>
        {{ value }}
    </div>
</template>

<script>
    export default {
        props: {
            value: Boolean
        },
        methods: {
            switched(isOn) {
                this.$emit('input', isOn);
            }
        }
    }
</script>

<style>
    #on, #off {
        width: 40px;
        height: 30px;
        background-color: lightgray;
        padding: 2px;
        display: inline-block;
        box-sizing: border-box;
        text-align: center;
        cursor: pointer;
    }

    #on:hover, #on.active {
        background-color: lightgreen;
    }

    #off:hover, #off.active {
        background-color: lightcoral;
    }
</style>