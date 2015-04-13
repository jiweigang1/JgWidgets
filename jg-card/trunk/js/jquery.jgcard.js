/**
 *
 * jg-page
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-9
 *
*/
(function ($) {
    $.widget("jgWidgets.jgCard", {
        options: {
            onShow:null
        },
		_create:function(){
			this.element.find(">div").hide();
			this._initOptions();
			this.open(this.element.find(">div:first").attr("cardId"));
		},
		_initOptions:function(){
			 this.options.onShow  = getValue(this.element,"onShow",this.options.onShow,"function");
		},
		open:function(cardId,trigger){
			if(!cardId){
				return false;
			}
			if(typeof trigger !=="boolean"){
			   trigger = true;
			}
			var self = this;
			var $toHide = this.element.find(".jg-card-open");
			var $toOpen = this.element.find('>div[cardId="'+cardId+'"]');
			if($toOpen.length==0||$toOpen.hasClass("jg-card-open")){
				return false;
			}
			$toHide.removeClass("jg-card-open");
			$toOpen.addClass("jg-card-open");
			if($toHide.length>0){
				$toHide.slideUp();
			}
			if($toOpen.length>0){
				$toOpen.slideDown(function(){
					if(self.options.onShow&&$.isFunction(self.options.onShow)){
						self.options.onShow.call(null,$toOpen);
						if(trigger){
						   self.element.trigger("onShow",[$toOpen]);
						}
					}
				});
			}
		}
	});
	
	function getValue($el,name,defaultValue,type){
		if(!type){
			type = "string";
		}
		var value = $el.attr(name);
		if(!value){
			return defaultValue;
		}else{
			if(type=="string"){
				return value;
			}else if(type=="boolean"){
				if(value=="true"){
					return true;
				}else{
					return false;
				}
			}else if(type=="function"){
				if($.isFunction(value)){
					return value;
				}else{
					var v;
					try{
						v = eval(value)
					}catch(e){}
					if($.isFunction(v)){
						return v;
					}else{
						return defaultValue;
					}
				}
			}else if(type=="object"){
					var v;
					try{
						v = eval(value)
					}catch(e){}
					if(v){
						return v;
					}else{
						return defaultValue;
					}
			}
		}
		return defaultValue;
	}
	
	
})(jQuery);


(function ($) {
    $.widget("JgWidgets.jgCardButton", {
        options: {
           
        },
		_create:function(){
			var $this = this.element;
			$this.click(function(){
				var action = $this.attr("open");
				if(!action){
					action = "open";
				}
				var params =[];
					params.push(action);
				var cardId = $this.attr("cardId");
				if(!cardId){
					return false;
				}	
				params.push(cardId);
				var $card = $($this.attr("target"));
				if($card.length>0){
					$card.jgCard.apply($card,params);
				}
				return false;
			});
		}
	})
})(jQuery);	