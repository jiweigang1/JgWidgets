(function($){
	var defaults = {
		url:null,
		//返回值 true 执行 false中断 string 替换返回的请求(panel有)
		validate:null
	};
	$.fn.jgButton = function(options){
		return this.each(function(){
			var $this = $(this);
			var opt = $.extend(true,{},defaults,options);
				opt._btype = $this.attr("btype");
			if(!opt._btype){
				opt._btype = "panel"
			}
			if(opt._btype=="page"){
				_initPageButton($this,opt);
			}else if(opt._btype=="panel"){
				_initPanelButton($this,opt);
			}
		});
	}
	
	function _initPanelButton($this,opt){
		$this.on("click",function(){
			opt.url = $this.attr("url");
			if(!opt.url){
				return true;
			}
			    $.jsPanel({
							autoAppend:false,
							ajax: {
								url: opt.url,
								cache:false,
								done: function(data,textStatus, jqXHR, jsPanel ){
										if(opt.validate&&$.isFunction(opt.validate)){
										var v = opt.validate.call(null,jqXHR.responseText);
											if(typeof v =="boolean"){
												if(!v){
													return;
												}
											}else if(typeof v=="string"){
												data = v;	
											}
										}
										var $content = $( '.jsPanel-content', jsPanel);
										$.jgPanel[PANEL_HOLDER] = $content;
											$content.append(data);
										$.jgPanel[PANEL_HOLDER] = null;
											$content.trigger("onOpen",[$content]);
								}
							}
						});
			
			
		})
		
	}
	
	var PANEL_HOLDER = "panel_holder";
	$.jgPanel = function(event,fn){
		if(!$.jgPanel[PANEL_HOLDER]||!fn||!$.isFunction(fn)){
			return;
		}
		if(event!=="onOpen"){
			return;
		}
		$.jgPanel[PANEL_HOLDER].one(event,function(event,$page){
			fn.call(window,$page);
		});
	}
	
	
	
})(jQuery);