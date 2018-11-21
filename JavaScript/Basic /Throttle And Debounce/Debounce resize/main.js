
// Based on http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
$(document).ready(function(){
  
    var $win = $(window);
    var $left_panel = $('.left-panel');
    var $right_panel = $('.right-panel');
    
    var debounced_version = _.debounce(function() {
        display_info($right_panel);
    },400);

    function display_info($div) {
      $div.append($win.width() + ' x ' + $win.height() +  '<br>');
    }
                  
    $(window).on('resize', function(){
      display_info($left_panel);
    });
    
    // $(window).on('resize', _.debounce(function() {
    //   display_info($right_panel);
    // }, 400/* , {leading:true, trailing:false}*/));
    $(window).on('resize', debounced_version);
});
  