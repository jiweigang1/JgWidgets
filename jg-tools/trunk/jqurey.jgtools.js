(function($){
	/**
	*fn
	*time
	*single
	*/
	var defaultSetInterval={
		fn:null,
		time:null,
		single:true	
	}
	
	$.fn.setInterval=function(options){
		options = $.extend(true,{},defaultSetInterval,options)
		if(!options||!options.fn||!options.time){
			return this;
		}
		var callback = function(){
			try{
				options.fn.call();
			}catch(e){
				console.log(e);
			}	
		}
		
		var  interval =	setInterval(callback,options.time);
		
		return this.each(function(){
			var $this = $(this);
			$this.data("__interval__",interval).on("remove",function(){
				$this.clearInterval();
			});
			
		});
	}
	
	$.fn.clearInterval=function(id){
		if(id){
		  clearInterval(id);
		  return this;
		}
		return  this.each(function(){
			var $this = $(this);
			try{
				clearInterval($this.data("__interval__"));
			   }catch(e){
				console.log(e);
			   }	
		});
	}
	
	
})(jQuery)