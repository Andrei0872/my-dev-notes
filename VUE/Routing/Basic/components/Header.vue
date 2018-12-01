<template>
    <ul class="nav nav-pills">
        <!-- <router-link> - replace the default behaviour of an anchor tag -->
        <!-- router-link - will set up the link to the list item -->
        <!-- Mark the link as active whenever the content of "to" contains the same chars as the URL -->
        <!-- exact - exact match -->
        <!-- active-class - what class to be applied when the link is active -->
        <router-link to="/" tag="li" active-class="active" exact ><a>Home</a></router-link>
        <router-link to="/user" tag="li" active-class="active"><a>User</a></router-link>
    </ul>
</template>