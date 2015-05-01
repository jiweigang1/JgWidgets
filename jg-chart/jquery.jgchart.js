(function($){
	$.fn.jgChart = function(options){
		var returnValue = this;
		var ifMehtodCall  = typeof options == "string";
		var args = arguments;
		this.each(function(){
			var $this = $(this);
			var type  = $(this).attr("chartType");
			var value ;
			if("map"==type){
				value = $this.jgMap.apply($this,args);
			}else if("pmap"==type){
				value = $this.jgPmap.apply($this,args);
			}else{
				value = $this.jgHchartHelper.apply($this,args);
			}
			if(ifMehtodCall){
				returnValue = value;
			}
		});
		return returnValue;
	}
})(jQuery);