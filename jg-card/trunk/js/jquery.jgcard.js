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
			direction:"top",
			autoShowFirst:true,
			//默认打开的card
			defaultShow:null,
            onShow:null
        },
		_create:function(){
			 this._settings={
				autoHeight	:true
			};
			this.element.addClass("jg-card-doc");
			this._initOptions();
			var $cards = this.element.find(">div").addClass("jg-card");
			if(!this.options.defaultShow){	
				if(this.options.autoShowFirst){
					$cards.hide();
					this.open($cards.eq(0).attr("cardId"));
				}else{
					$cards.eq(0).addClass("jg-card-open").show();
					$cards.not(":first").hide();
				}
			}else{
				$cards.hide();
				this.open(this.options.defaultShow,false);
			}
		},
		_initOptions:function(){
			 this.options.direction 	 = getValue(this.element,"direction"	,this.options.direction);
			 this.options.autoShowFirst  = getValue(this.element,"autoShowFirst",this.options.autoShowFirst,"boolean");
			 this.options.defaultShow    = getValue(this.element,"defaultShow"	,this.options.defaultShow);	
			 this.options.onShow  	 	 = getValue(this.element,"onShow"		,this.options.onShow,"function");
		},
		/**
		  cardId  	: 打开的card 的 id
		  trigger 	：是否触发事件
		  direction	：动画的方向
		**/
		open:function(cardId,trigger,direction){
			if(!cardId){
				return false;
			}
			if($.isPlainObject(cardId)){
				trigger		= cardId.trigger;
				direction	= cardId.direction;
				cardId 		= cardId.cardId;
			}
			
			if(typeof trigger !=="boolean"){
			   trigger = true;
			}
			var self = this;
			var $toHide = this.element.find(".jg-card-open");
			var $toShow = this.element.find('>div[cardId="'+cardId+'"]');
			if($toShow.length==0||$toShow.hasClass("jg-card-open")){ 
				return false;
			}
			this._toggle($toShow,$toHide,direction||this.options.direction,function(){
				
			},trigger);
		},
		_toggle:function($toShow,$toHide,direction,fn,trigger){
			var self = this;
			
		
			$toHide.removeClass("jg-card-open");
			$toShow.addClass("jg-card-open");
			if(direction=="top"){
				if($toHide.length>0){
					$toHide.slideUp();
				}
				if($toShow.length>0){
					$toShow.slideDown(function(){
						if(self.options.onShow&&$.isFunction(self.options.onShow)){
							if(trigger){
							  try{
								self.options.onShow.call(null,$toShow);
							  }catch(e){
								console.log(e);
							  }	
								
							}
							if(trigger){
							  try{
								self.element.trigger("onShow",[$toShow]);
							  }catch(e){
								console.log(e);
							  } 	
							}
						}
					});
				}
				
			}else if(direction=="left"||direction=="right"){
				var ewidth = this.element.width();
					fn.__time = 1;
					var count = $toHide==null?1:2;
					var fnWrapper = function(){
						if(fn.__time<count){
							fn.__time++;
							return;
						}
						delete fn.__time;
						fn.call(self);
						if(trigger){
							  try{
								self.options.onShow.call(null,$toShow);
							  }catch(e){
								console.log(e);
							  }	
								
							}
							if(trigger){
							  try{
								self.element.trigger("onShow",[$toShow]);
							  }catch(e){
								console.log(e);
							  } 	
							}
					}
					if($toHide&&$toHide.length>0){
						$toHide.addClass("animation").css({"position":"absolute"});
						var method = "animate";
						if($.fn.velocity){
							method = "velocity";	
						}
						$toHide[method].call($toHide,{left:direction=='left'?-ewidth:ewidth},this.options.toggleTime,function(){
							$toHide.hide().css("position","").removeClass("animation");
							fnWrapper();
						});
					}
					if($toShow&&$toShow.length>0){
						$toShow.addClass("animation").css({"position":"absolute","left":direction=='left'?ewidth:-ewidth}).show();
						var method = "animate";
						if($.fn.velocity){
							method = "velocity";
						}
						$toShow[method].call($toShow,{left:0},this.options.toggleTime,function(){
							$toShow.css("position","").removeClass("animation");
							if(self._settings.autoHeight){
								self.element.css("height","auto");
							}	
							fnWrapper();
						});
					}
					if(this._settings.autoHeight){
						this.element.height(Math.max(($toHide&&$toHide.length>0)?$toHide.height():0,$toShow.height()));
					}
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
				var params = {};
					params.cardId = $this.attr("cardId");
				if(!params.cardId){
					return false;
				}	
				var direction = $this.attr("direction");
					params.direction = direction;
					
				var $card = $($this.attr("target"));
				if($card.length>0){
					$card.jgCard.call($card,action,params);
				}
				return false;
			});
		}
	})
})(jQuery);	