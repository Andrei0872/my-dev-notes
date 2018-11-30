
<template>
    <div class="panel panel-success">
        <div style="font-weight:bold;" class="panel-heading text-center">
            Well Done
        </div>
        <div class="panel-body text-center">
            <button @click="resetGame" class="btn btn-primary">Keep Playing!</button>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            resetGame() {
                this.$emit('resetGame', true);
            }
        }
    }
</script>