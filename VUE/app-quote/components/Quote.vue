<template>
    <div class="col-lg-3 col-sm-6 col-md-4">
        <div class="panel panel-default">
            <div class="panel-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
</script>

<style>
    .panel-body {
        font-family: 'Arizonia', cursive;
        font-size: 24px;
        color: #6e6e6e;
    }

    .quote {
        cursor: pointer;
    }

    .quote:hover {
        background-color: #ffe2e2;
    }
</style>