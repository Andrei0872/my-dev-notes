

//! _.debounce - it would only trigger when the user stops scrolling
$(document).ready(function() {

    var throttle_func = _.throttle(function() {
        console.log('checking...')
        check_if_needs_more_content();
    },300);

    // Check every 300 ms the scroll position
    $(document).on('scroll', function () {
        throttle_func();
    })


    var check_if_needs_more_content = function() {
        // console.log($(document).height())
        // console.log($(window).height())
        // console.log($(document).scrollTop())
        // console.log('===================')
    
        let pos = 0 + $(document).height() - ($(window).height() + $(window).scrollTop());

        console.log(pos)
        if(pos < 200) {
            // Here would go an Ajax Request
            $('body').append($('.item').clone());
        }
    }
});