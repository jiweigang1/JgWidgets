(function($,window,undefined){
  var elems = $([]),
    jq_resize = $.resize = $.extend( $.resize, {} ),
    timeout_id,
    str_setTimeout = 'setTimeout',
    str_resize 	   = 'attrChange',
    str_data 	   = str_resize + '-special-event',
    str_delay 	   = 'delay',
    str_throttle   = 'throttleWindow';
	jq_resize[ str_delay ] = 250;
  jq_resize[ str_throttle ] = true;   
  $.event.special[ str_resize ] = {
    setup: function(data) {
		alert(data);
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      var elem = $(this);
      
      // Add this element to the list of internal elements to monitor.
      elems = elems.add( elem );
      
      // Initialize data store on the element.
      $.data( this, str_data, { w: elem.width(), h: elem.height() ,sw:elem.prop("scrollWidth"),sh:elem.prop("scrollHeight") } );
      
      // If this is the first element added, start the polling loop.
      if ( elems.length === 1 ) {
        loopy();
      }
    },
    
    // Called only when the last 'resize' event callback is unbound per element.
    teardown: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will unbind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Remove this element from the list of internal elements to monitor.
      elems = elems.not( elem );
      
      // Remove any data stored on the element.
      elem.removeData( str_data );
      
      // If this is the last element removed, stop the polling loop.
      if ( !elems.length ) {
        clearTimeout( timeout_id );
      }
    },
    
    // Called every time a 'resize' event callback is bound per element (new in
    // jQuery 1.4).
    add: function( handleObj ) {
      // Since window has its own native 'resize' event, return false so that
      // jQuery doesn't modify the event object. Unless, of course, we're
      // throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var old_handler;
      
      // The new_handler function is executed every time the event is triggered.
      // This is used to update the internal element data store with the width
      // and height when the event is triggered manually, to avoid double-firing
      // of the event callback. See the "Double firing issue in jQuery 1.3.2"
      // comments above for more information.
      
      function new_handler( e, w, h,sw,sh ) {
        var elem = $(this),
          data = $.data( this, str_data );
        
        // If called from the polling loop, w and h will be passed in as
        // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
        // those values will need to be computed.
        data.w 	= w  !== undefined ? w : elem.width();
        data.h 	= h  !== undefined ? h : elem.height();
		data.sw = sw !== undefined ? sw : elem.prop("scrollWidth");
        data.sh = sh !== undefined ? sh : elem.prop("scrollHeight");
        
        old_handler.apply( this, arguments );
      };
      
      // This may seem a little complicated, but it normalizes the special event
      // .add method between jQuery 1.4/1.4.1 and 1.4.2+
      if ( $.isFunction( handleObj ) ) {
        // 1.4, 1.4.1
        old_handler = handleObj;
        return new_handler;
      } else {
        // 1.4.2+
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
    
  };
  
  function loopy() {
    
    // Start the polling loop, asynchronously.
    timeout_id = window[ str_setTimeout ](function(){
      
      // Iterate over all elements to which the 'resize' event is bound.
      elems.each(function(){
        var elem = $(this),
          width 		= elem.width(),
          height 		= elem.height(),
		  scrollWidth	= elem.prop("scrollWidth");	
		  scrollHeight	= elem.prop("scrollHeight");
          data = $.data( this, str_data );
        
        // If element size has changed since the last time, update the element
        // data store and trigger the 'resize' event.
        if ( width !== data.w || height !== data.h || scrollWidth!==data.sw || scrollHeight!==data.sh) {
          elem.trigger( str_resize, [ data.w = width, data.h = height ,data.sw = scrollWidth,	data.sh = scrollHeight] );
        }
        
      });
      
      // Loop.
      loopy();
      
    }, jq_resize[ str_delay ] );
    
  };
  
})(jQuery,this);
