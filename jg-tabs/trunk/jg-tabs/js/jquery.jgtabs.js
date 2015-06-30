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
			
		},
		_create: function() {
			this.element.addClass("jg-component")
			this._settings = {
				watting:false,
				UUID:"jgTabs"+new Date().getTime(),
				tabIdIndex:0
			};
			this._initParams();
			this._initHtml();
			this._initEvent();
		},
		destroy:function(){
			$(window).off("resize."+this._settings.UUID);
		},
		_createTid:function(){
			return "__tab"+ this._settings.tabIdIndex++
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
			
			var height = $.trim(this.element[0].style.height);
			if(height!=""&&height!="auto"){
				this.options._autoHeight = false;
			}
			
			
		},
		_initHtml:function(){
			var self = this;
			this.element.addClass("jg-tabs");
			if(!this.options._autoHeight){
				this.element.addClass("jg-tabs-fixed-height");
			}
			
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
				if(!$(this).attr("tid")){
					$(this).attr("tid",self._createTid());
				}
				$(this).data("content",self.$content.find(">.jg-tabs-content-element").eq(i));
				$(this).data("data",{ajax:false});
				$(this).wrapInner("<span></span>");
				if(self.options.closeable){
					$(this).append('<span class="close-button" ></span>')
				}
			});
			this.$header.find("li[url]").each(function(i,v){
				if(!$(this).attr("tid")){
					$(this).attr("tid",self._createTid());
				}
				var bean = self._getFormBean($(this));
				$(this).data("data",{ajax:true,init:false,url:$(this).attr("url"),formBean:bean});
				$(this).wrapInner("<span></span>");
				if(self.options.closeable){
					$(this).append('<span class="close-button" ></span>')
				}
				
				var LI_UUID = "jg-tabs-li"+new Date().getTime();
				var $fs = bean.getAllElements();
				var $li = $(this);
				if($fs&&$fs.length>0){
					$fs.on("change."+LI_UUID,function(){
						var data = $li.data("data");
							data.init=false;
						if($li.hasClass("active")){
							$li.removeClass("active");
							$li.data("content").remove();
							self._showTab($li);
						}
					})
					$li.on("remove",function(){
						$fs.off("change."+LI_UUID);
					})
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
				if(self._settings.watting){
					return;
				}
				self._settings.watting = true;
				self._showTab($(this));
				e.stopPropagation();
				return false;
			});
			this.$header.on("click",".close-button",function(e){
				self._closeTab($(this).closest("li"));
				e.stopPropagation();
				return false;
			});
			$(window).on("resize."+this._settings.UUID,function(){
				self._fixHeadScroll();
			});
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
		reloadCurrent:function(url,params){
			if(arguments.length==1&&typeof arguments[0]=="object"){
				params = arguments[0].params||{};
				url    = arguments[0].url;
			}
			var $li = this._getActiveHeader();
			this.reload($li.attr("tid"),url,params);
		},
		reload:function(tabId,url,params){
			if(arguments.length==1&&typeof arguments[0]=="object"){
				url    = arguments[0].url;
				params = arguments[0].params;
				tabId  = arguments[0].tabId;
			}
			var $li = this._getHeader(tabId);
			if(!$li.data("data").ajax){
				return;
			}
			$li.data("data").init=false;
			if(url){
			 $li.data("data").url = url;
			}
			
			if($li.hasClass("active")){
				$li.removeClass("active");
				if($li.data("content")&&$li.data("content").length>0){
					$li.data("content").remove();
				}
				$li.removeData("content");
				this._showTab($li,false);
			}else{
				if($li.data("content")&&$li.data("content").length>0){
					$li.data("content").remove();
				}
				$li.removeData("content");
			}
			
			
		},
		
		_showTab:function($li,animation){
			if(typeof animation=="undefined"){
				animation = true;
			}
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
				this._fixHeadScroll();
				this._fixActiveHead();
				var data = $li.data("data"); 
				if(data.ajax&&!data.init){
					var  $element = $('<div class="jg-tabs-content-element" ></div>').hide();
					this.$content.append($element);
					var params = {};
					if(data.formBean){
						params = data.formBean.getAllElements().serializeArray();
					}
					this._ajaxLoad($element,data.url,params,function(){
							data.init=true;
							$li.data("content",$element);
							
							$element.css("opacity",0).show();
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($element,$.JgWidgets.g_before);
								}catch(e){
									if(console){
										console.log(e);
									}
								}
							}
							$element.hide().css("opacity",1);
							self._toggle($element,$toHide,animation,direction,function(){
								if($.JgWidgets){
									try{
										$.JgWidgets._initContent($element,$.JgWidgets.g_after);
									}catch(e){
										if(console){
											console.log(e);
										}
									}
								}
								self._triggerEvent("onOpen",[$element]);
								$element.trigger("onOpen",[$element]);
								if($.event_ready){
									$element.trigger($.event_ready,[$element]);
								}
								self._settings.watting = false;
							});
							
							
					});
					
				}else{	
					self._toggle($li.data("content"),$toHide,animation,direction,function(){
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
				globalRequest:true,
			}).done(function(data, textStatus, jqXHR){
				$.jgTabs[TAB_HOLDER] = $dom;
				if($.addEventHolder){
					$.addEventHolder($.event_init,$dom);
					$.addEventHolder($.event_ready,$dom);
				}
				$dom.append(data);
				$.jgTabs[TAB_HOLDER] = null;
				if($.removeEventHolder){
					$.removeEventHolder($.event_init);
					$.removeEventHolder($.event_ready);
				}
				if($.event_init){
					$dom.trigger($.event_init,[$dom]);
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
		_toggle:function(toShow,toHide,animation,direction,fn){
			var self = this;
			if(!direction){
				direction="left";
			}
			if(!toHide||toHide.length==0){
				direction="right";
			}
			var ewidth = this.element.width();
			if(this.options.animation&&animation){
				if(toHide&&toHide.length>0){
					toHide.addClass("animation").css({"position":"absolute"});
					var method = "animate";
					if($.fn.velocity){
						method = "velocity";	
					}
					toHide[method].call(toHide,{left:direction=='left'?-ewidth:ewidth},500,function(){
						toHide.hide().css("position","").removeClass("animation");
					});
				}
				if(toShow&&toShow.length>0){
					toShow.addClass("animation").css({"position":"absolute","left":direction=='left'?ewidth:-ewidth}).show();
					var method = "animate";
					if($.fn.velocity){
						method = "velocity";	
					}
					toShow[method].call(toShow,{left:0},500,function(){
						toShow.css("position","").removeClass("animation");
						if(self.options._autoHeight){
							self.element.css("height","auto");
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
				this.$scrollBarR.css("right",0).show();
			}else{
				this.$scrollBarL.hide();
				this.$scrollBarR.hide();
			}
		},
		_fixActiveHead:function($ali){
			var bwidth = this.element.width();
			if(bwidth<=0){
			   return;	
			}
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
		_triggerEvent:function(eventType,params){
			if(this.options[eventType]&&$.isFunction(this.options[eventType])){
				this.options[eventType].apply(this.element,params);
			}
			this.element.trigger(eventType,params);
		},
		_getHeader:function(tabId){
			if(!tabId){
				return null;
			}
			return 	this.$header.find('li[tid="'+tabId+'"]');
		},
		_getActiveHeader:function(){
			return 	this.$header.find('li.active');
		},
		_getFormBean:function(element){
			var self = this;
			var bean  = {
				forms:[],
				getForm:function(group){
					for(var i=0;i<this.forms.length;i++){
						if(this.forms[i].group===group){
							return this.forms[i];
						}
					}
				},
				getAllElements:function(){
					var $fs = $([]);
					for(var i=0;i<this.forms.length;i++){
						if(this.forms[i].elements&&this.forms[i].elements.length>0){
						  $fs =	$fs.add(this.forms[i].elements)
						}
					}
					return $fs;
				}
			}
			 
			 /*[
					elements:""
					forms:""
					closest:""
					group:""
				]*/
				$.each(element[0].attributes,function(){
					if(this.specified && this.name.indexOf("forms")==0){
						var form = {group:"____"};
						var g = this.name.split("-");
						if(g[1]){
							form.group = g[1];
						}
						form.forms = this.value;
						if(form.forms){
							form.forms = form.forms.split(/\s+/);
						}
						if(form.forms.length>0){
							bean.forms.push(form);
						}
					}
					
				});
				$.each(element[0].attributes,function(name,value){
					if(this.specified && this.name.indexOf("closest")==0){
						var g = this.name.split("-");
						if(g[1]){
						  var form = bean.getFrom(g[1]);
						  if(form&&this.value){
							 form.closest = this.value;
						  }
						}
					}
				});
				$.each(bean.forms,function(index,form){
					var $c	 = $(document);
					if(form.closest){
						var $cl = element.closest(form.closest);
						if($cl.length>0){
							$c = $cl;
						}
					}
					form.elements =	$(form.forms.join(),$c);							
				});
				return bean;
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
    $.widget("jgWidgets.jgTabsButton", {
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
				}else if("reload"){
					var tabId = $this.attr("relId");
						params.push(tabId);
						
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
				}else{
					return false;
				}
				$tabs.jgTabs.apply($tabs,params);
				return false;
			});
		}
	})
})(jQuery)	


