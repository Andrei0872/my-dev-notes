<template>
    <div>
        <div class="title">
            <slot name="title"></slot>
            <span style="color: #ccc"><slot name="subtitle"> The subtitle </slot></span>
        </div>
        <hr>
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<script>    
    export default {
    }
</script>


<style scoped>
    div {
        border: 1px solid #ccc;
        padding: 30px;
        box-shadow: 1px 1px 3px black;
        margin: 30px auto;
        text-align: center;
    }

    h2 {
        color: red;
    }

    .title {
        font-style: italic;
    }

</style>
