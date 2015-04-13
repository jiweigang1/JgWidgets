/*!
 * jg-iCheck
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0
 *
 * Author JiGang 2014-6-27
 */
(function($){
	$.fn.jgIcheck = function(options){
		return this.each(function(){
			var opts  = $.extend(true,defaluts,options);
			var $this = $(this);
				if(typeof($this.attr('autoTriggerChange')) != 'undefined'){
					opts.autoTriggerChange = $this.attr("autoTriggerChange")=="true";
				}
				
				$this.iCheck(opts);
				if(opts.autoTriggerChange){
					$this.on("ifChanged",function(){
						$(this).trigger("change");
					});
				}
					
		});
	}
	var defaluts = {
		autoTriggerChange:true,
		checkboxClass: 'icheckbox_minimal'
	}
})(jQuery)