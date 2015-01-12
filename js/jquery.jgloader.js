/**
 *
 * jg-loader
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-5
 *
*/
(function ($) {
    $.widget("jgWidgets.jgLoader", {
        options: {
		    validate:null,
			
            url		:null,
			ajaxType:"post"
        },
        _initOptions: function () {
            var $el = this.element;
            if (!this.options.url) {
                this.options.url = $el.attr("url")
            }
        },
		_create:function(){
			this._initOptions();
			var $content = $("<div><div>");
				$content.css({"opacity":0,width:"100%","margin":"0px","padding":"0px"});
			this.element.append($content);
			if(this.options.url){
				this._ajaxLoad($content,this.options.url,{},function(){
						if($.JgWidgets){
							try{
								$.JgWidgets._initContent($content);
								$content.contents().unwrap();
							}catch(e){
								if(console){
									console.log(e);
								}
							}
						}
				},this.element);
			}
		},
		_ajaxLoad:function($dom,url,params,success,$eventHolder){
			var self = this;
			if(!$dom||$dom.length==0){
				return;
			}
			if(!$eventHolder){
				$dom = $eventHolder;
			}
			//self._showLoading();
			$.ajax({
				 url : url,
                 data: params,
				 cache:false,
				 type:self.options.ajaxType,
				 success:function(data){
					if(self.options.validate&&$.isFunction(self.options.validate)){
						var v = self.options.validate.call(null,data);
						if(typeof v =="boolean"){
							if(!v){
								return;
							}
						}else if(typeof v=="string"){
							data = v;	
						}
					}
					$.jgLoader[EVENT_HOLDER]=$eventHolder;
					if($.addEventHolder){
						$.addEventHolder("onload",$eventHolder);
					}
					$dom.empty().append(data);
					$.jgLoader[EVENT_HOLDER]=null;
					if($.removeEventHolder){
						$.removeEventHolder("onload");
					}
					//self._hideLoading();
					if(success&&$.isFunction(success)){
						success.call(null,data)
					}
				 },
				 //����ʧ��
				 error:function(){
					if(success&&$.isFunction(success)){
						success.call(null,"")
					}
				 }
			});
		},
	});
	
	/**
		ע����ص��¼����������ǵ�ǰ��Loader
	*/
	var EVENT_HOLDER = "event_holder";
	$.jgLoader = function(event,fn){
		if(!$.jgTabs[EVENT_HOLDER]||!fn||!$.isFunction(fn)){
			return;
		}
		if(event!=="onOpen"){
			return;
		}
		
		$.jgLoader[EVENT_HOLDER].one(event,function(event,$content){
			fn.call(window,$content);
		});
	}
	
})(jQuery);	