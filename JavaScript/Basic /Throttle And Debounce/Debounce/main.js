$(document).ready(function(){

    var $rawDiv = $('#raw-events'),
        $debounceDiv = $('#debounced-events'),
        $triggerArea = $('.trigger-area'),
        initialized = false,
        frequency = 100,
        barLength = 0,
        globalColor = 2,
        interval_id,
        rawColor = 0,
        debounceColor = 0,
        maxBarLength = 87;
  
    // leading: true - trigger the function execution immediately, so it behaves
    // exactly as the original non-debounced handler
    var drawDebouncedEvent = _.debounce(function(div){
     debounceColor = globalColor;
    }, frequency*4, {leading:false, trailing:true});
    
  
    var changeDebouncedColor = _.debounce(function(div){
      // Change colors, to visualize easier the "group of events" that is reperesenting this debounced event
      
      globalColor++;
      if (globalColor > 9){
        globalColor = 2;
      } 
    }, frequency*4, {leading:false, trailing:true});
    
  
    function draw_tick_marks(){
  
        // every x seconds, draw a tick mark in the bar
        interval_id = setInterval(function(){
        barLength++;   
        $rawDiv.append('<span class="color' + rawColor + '" >');
        $debounceDiv.append('<span class="color' + debounceColor + '" >');
        rawColor = 0; // make it transparent again
        debounceColor = 0; // make it transparent again
        
        // Stop if it has reached the limit
        if (barLength > maxBarLength){
          clearInterval(interval_id);
        }
      }, frequency);
    };
    
    
    // Track Mouse movement or clicks for mobile
    $triggerArea.on('click mousemove', function (){  
      if (!initialized) {
        initialized = true;
        draw_tick_marks();
        $(this).addClass('active');
      } 
      rawColor = globalColor;
      drawDebouncedEvent();
      changeDebouncedColor();
    });
  
    $('.reset').on('click', function(){
      initialized = false;
      $triggerArea.removeClass('active');
      $rawDiv.empty();
      $debounceDiv.empty();
      barLength = 0;
      clearInterval(interval_id);
    });
  
  });