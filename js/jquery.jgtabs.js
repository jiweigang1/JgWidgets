/**
 *
 * jg-tabs
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2014-10-31
 *
*/
(function($){
 $.widget( "jgWidgets.jgTabs", {
		options: {
			animation:true,
			//ajax访问类型
			ajaxType:"post",
			closeable:false,
			scrollable:true,
			
			_autoHeight:true,
			_tabId:0
		},
		_create: function() {
			this._settings = {
				watting:false
			};
			this._initParams();
			this._initHtml();
			this._initEvent();
		},
		_initParams:function(){
			if(this.element.attr("animation")=="false"){
				this.options.animation = false;
			}
			if(this.element.attr("ajaxType")=="get"){
				this.options.ajaxType = "get";
			}
			if(this.element.attr("closeable")=="true"){
				this.options.closeable = true;
			}
			if(this.element.attr("scrollable")=="false"){
				this.options.scrollable = false;
			}
			
		},
		_initHtml:function(){
			var self = this;
			this.element.addClass("jg-tabs");
			
			this.$header  = this.element.find(">ul");
			if(this.$header.length==0){
				this.$header = $("<ul></ul>");
				this.element.append(this.$header);
			}
			
			var $divs = this.element.find(">div");
			if($divs.length>0){
				$divs.hide().addClass("jg-tabs-content-element").wrapAll('<div class="jg-tabs-content" ></div>');
			}else{
				this.element.append('<div class="jg-tabs-content" ></div>');
			}
			
			
			
			this.$header.wrap('<div class="jg-tabs-warpHeader" ></div>')
			this.$scrollBarL = $('<span class="scroll-bar l" ></span>');
			this.$scrollBarR = $('<span class="scroll-bar r" ></span>');
			
			
			
			
			this.element.find(">.jg-tabs-warpHeader").append(this.$scrollBarL).append(this.$scrollBarR);
			
			this.$scrollBarR.on("click",function(){
				 var oleft = cssParseInt(self.$header.css("left"));
					 oleft -=100;
				 var width  = self.$header.width();
				 var bwidth = self.element.width();	
					 if(width - (-1*oleft) < bwidth){
						oleft =  bwidth - width;
					 }
				 self.$header.animate({"left":oleft},200);
			});
			
			this.$scrollBarL.on("click",function(){
				 var oleft = cssParseInt(self.$header.css("left"));
					 oleft+=100;
					 if(oleft>0){
						oleft = 0;
					 }
				 self.$header.animate({"left":oleft},200);
			});
			
			
			
			this.$content = $(">.jg-tabs-content",this.element).find(">.jg-tabs-content-element").hide().end();
			//去除空格
			this.$header.find("li").each(function(){
				self.$header.append(this);
			});
			
			this.$header.find("li").not("[url]").each(function(i,v){
				$(this).data("content",self.$content.find(">.jg-tabs-content-element").eq(i));
				$(this).data("data",{ajax:false});
				$(this).wrapInner("<span></span>");
				if(self.options.closeable){
					$(this).append('<span class="close-button" ></span>')
				}
			});
			this.$header.find("li[url]").each(function(i,v){
				$(this).data("data",{ajax:true,init:false,url:$(this).attr("url")});
				$(this).wrapInner("<span></span>");
				if(self.options.closeable){
					$(this).append('<span class="close-button" ></span>')
				}
			});
			var $li = this.$header.find("li:first"); 
			if($li.length>0){
				this._showTab($li);
			}
			
		},
		_initEvent:function(){
			var self = this;
			this.$header.on("click","li",function(e){
				self._showTab($(this));
				e.stopPropagation();
				return false;
			});
			this.$header.on("click",".close-button",function(e){
				self._closeTab($(this).closest("li"));
				e.stopPropagation();
				return false;
			})
		},
		_closeTab:function($li){
			var $tsl = $li.prev("li");
			if($tsl.length==0){
				$tsl = $li.next("li");
			}
			$li.data("content").remove();
			$li.remove();
			if($tsl.length>0){
				this._showTab($tsl)
			}
		},
		_showTab:function($li){
			var self = this;
			if($li.hasClass("active")){
				this._settings.watting=false;
				return ;
			}else{
				var $toHide;
				var $toShow;
				var direction = "left";
				var $ali = this.$header.find("li.active");
				if($ali.length>0){
					var $toHide =  $ali.removeClass("active").data("content");
					var $lis = this.$header.find("li");
					if($lis.index($ali) > $lis.index($li) ){
						direction = "right";
					}
				}
				
				$li.addClass("active");
				this._fixActiveHead();
				var data = $li.data("data"); 
				if(data.ajax&&!data.init){
					var  $element = $('<div class="jg-tabs-content-element" ></div>').hide();
					this.$content.append($element);
					this._ajaxLoad($element,data.url,{},function(){
							data.init=true;
							$li.data("content",$element);
							
							$element.css("opacity",0).show();
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($element,$.JgWidgets.g_before);
								}catch(e){
								
								}
							}
							$element.hide().css("opacity",1);
							
							self._toggle($element,$toHide,direction,function(){
								$element.trigger("onOpen",[$element]).trigger("onload",[$element]);
								
								if($.JgWidgets){
									try{
										$.JgWidgets._initContent($element,$.JgWidgets.g_after);
									}catch(e){
									
									}
								}
								self._settings.watting = false;
							});
							
							
					});
					
				}else{	
					self._toggle($li.data("content"),$toHide,direction,function(){
						self._settings.watting = false;
					});
				}
			}
		},
		_ajaxLoad:function($dom,url,params,fn){
			var self = this;
			$.ajax({
				type:self.options.ajaxType,
				data:params,
				url:url,
				cache:false,
			}).done(function(data, textStatus, jqXHR){
				$.jgTabs[TAB_HOLDER] = $dom;
				if($.addEventHolder){
					$.addEventHolder("onload",$dom);
				}
				$dom.append(data);
				$.jgTabs[TAB_HOLDER] = null;
				if($.removeEventHolder){
					$.removeEventHolder("onload");
				}
				if(fn&&$.isFunction(fn)){
					fn.call(self);
				}
			}).fail(function(){
				$dom.append("加载失败");
				if(fn&&$.isFunction(fn)){
					fn.call(self);
				}
			});
		},
		_toggle:function(toShow,toHide,direction,fn){
			var self = this;
			if(!direction){
				direction="left";
			}
			if(!toHide||toHide.length==0){
				direction="right";
			}
			if(this.options.animation){
				//this.$content.addClass("animation");
				if(toHide&&toHide.length>0){
					toHide.addClass("animation").css("position","absolute").hide("slide",{direction: direction=='left'?'left':'right'},500,function(){
						toHide.css("position","");
						toHide.removeClass("animation");
					});
				}
				if(toShow&&toShow.length>0){
					toShow.addClass("animation").css("position","absolute").show("slide",{direction: direction=='left'?'right':'left'},500,function(){
						toShow.css("position","");
						toShow.removeClass("animation");
						//self.$content.removeClass("animation");
						if(self.options._autoHeight){
							self.$content.css("height","auto");
						}	
						fn.call(self);
					});
				}
				if(this.options._autoHeight){
					this.$content.height(Math.max((toHide&&toHide.length>0)?toHide.height():0,toShow.height()));
				}
				
			}else{
				if(toHide&&toHide.length>0){
					toHide.hide();
				}
				if(toShow&&toShow.length>0){
					toShow.show();
				}
				
				fn.call(this);
			}
		},
		_fixHeadScroll:function(){
			var bwidth = this.element.width();
			var hwidth = this.$header.width(); 		
			if(this.options.scrollable&&bwidth<hwidth){
				this.$scrollBarL.show();
				this.$scrollBarR.css("left",bwidth-10).show();
			}			
		},
		_fixActiveHead:function($ali){
			var bwidth = this.element.width(); 		
			if(!$ali){
				$ali = this._getActiveHeader();
			}
			var aleft 	= $ali.offset().left
			var awidth	= $ali.width();
			var bleft	= this.element.offset().left
			var hleft	= this.$header.css("left");
				hleft 	= cssParseInt(hleft);
			if($ali.length>0){
				if(aleft+awidth - bleft > bwidth){
					this.$header.css("left",hleft -(aleft+awidth - bleft - bwidth));
				}else if(aleft+awidth - bleft < awidth ) {
					this.$header.css("left",hleft +(awidth - (aleft+awidth - bleft)));
				}
			}
		},
		add:function(name,url,tabId){
			if(this._settings.watting){
				return;
			}else{
				this._settings.watting = true;
			}
			if(!tabId){
				tabId = this.options._tabId++;
				var $li = $('<li url="'+url+'" tid="'+tabId+'" ><span>'+name+'</span></li>');
					if(this.options.closeable){
						$li.append('<span class="close-button" ></span>')
					}
					$li.appendTo(this.$header);
					$li.data("data",{ajax:true,init:false,url:url});
				this._fixHeadScroll();	
				this._showTab($li);
			}else{
				var $li = this._getHeader(tabId);
				if($li&&$li.length>0){
					$li.data("content").remove();
					$li.find("span:first").html(name);
					$li.removeClass("active");
					$li.data("data",{ajax:true,init:false,url:url});
					this._showTab($li);
				}else{
					var $li = $('<li url="'+url+'" tid="'+tabId+'" ><span>'+name+'</span></li>');
					if(this.options.closeable){
						$li.append('<span class="close-button" ></span>')
					}
					$li.appendTo(this.$header);
					$li.data("data",{ajax:true,init:false,url:url});
					this._fixHeadScroll();
					this._showTab($li);
				}
			}
		   
		},
		show:function(tabId){
			var $li = this._getHeader(tabId);
			if(!$li||$li.length==0){
				return false;
			}
			this._showTab($li);
		},
		_getHeader:function(tabId){
			if(!tabId){
				return null;
			}
			return 	this.$header.find('li[tid="'+tabId+'"]');
		},
		_getActiveHeader:function(){
			return 	this.$header.find('li.active');
		}
	})
	
	function cssParseInt(value){
		try{
			value =	parseInt(value.substring(0,value.length-2));
		}catch(e){
			value = 0;
		}
		if(isNaN(value)){
			value =0;
		}
		return value;
	}
	
	/**
		注册加载的事件，作用域是当前的Tab
	*/
	var TAB_HOLDER = "tab_holder";
	$.jgTabs = function(event,fn){
		if(!$.jgTabs[TAB_HOLDER]||!fn||!$.isFunction(fn)){
			return;
		}
		if(event!=="onOpen"){
			return;
		}
		
		$.jgTabs[TAB_HOLDER].one(event,function(event,$tab){
			fn.call(window,$tab);
		});
	}
	
})(jQuery);

(function ($) {
    $.widget("JgWidgets.jgTabsButton", {
        options: {
           
        },
		_create:function(){
			this.element.on("click",function(){
				var $this = $(this);
				var action = $(this).attr("action");
				var $tabs  = $($(this).attr("target"));	
				if($tabs.length==0){
					return false;
				}
				var params = [action];
				if("add"===action){
					var name = $(this).attr("title");
					if(!name){
						name = $(this).attr("tabName");
					}
					if(!name){
						name = "新增Tab";
					}
					params.push(name);
					var url	;  
					if(this.tagName.toUpperCase() == "A"){
						url = $this.attr("href");
					}else{
						url = $this.attr("url");
					}
					if(!url){
						return false;
					}
					params.push(url);
					var tabId = $this.attr("relId");
					params.push(tabId);
				}else{
					return false;
				}
				$tabs.jgTabs.apply($tabs,params);
				return false;
			});
		}
	})
})(jQuery)	


