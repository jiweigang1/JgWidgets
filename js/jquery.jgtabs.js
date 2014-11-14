(function($){
 $.widget( "jgWidgets.jgTabs", {
		options: {
			animation:true,
			//ajax访问类型
			ajaxType:"post",
			////
			_autoHeight:true,
			_tabId:0
		},
		_create: function() {
			this._initOptions();
			this._initHtml();
			this._initEvent();
		},
		_initOptions:function(){
			if(this.element.attr("animation")=="false"){
				this.options.animation = false;
			}
		},
		_initHtml:function(){
			var self = this;
			this.element.addClass("jg-tabs");
			
			this.$header  = this.element.find("ul");
			if(this.$header.length==0){
				this.$header = $("<ul></ul>");
				this.element.append(this.$header);
			}
			
			var $divs = this.element.find("div");
			if($divs.length>0){
				$divs.hide().addClass("jg-tabs-content-element").wrapAll('<div class="jg-tabs-content" ></div>');
			}else{
				this.element.append('<div class="jg-tabs-content" ></div>');
			}
			
			
			
			this.$header.wrap('<div class="jg-tabs-warpHeader" ></div>')
			this.$content = $(".jg-tabs-content",this.element).find(".jg-tabs-content-element").hide().end();
			this.$header.find("li").not("[url]").each(function(i,v){
				$(this).data("content",self.$content.find(".jg-tabs-content-element").eq(i));
				$(this).data("data",{ajax:false});
				$(this).wrapInner("<span></span>");
			});
			this.$header.find("li[url]").each(function(i,v){
				$(this).data("data",{ajax:true,init:false,url:$(this).attr("url")});
				$(this).wrapInner("<span></span>");
			});
			var $li = this.$header.find("li:first"); 
			if($li.length>0){
				this._showTab($li);
			}
			
		},
		_initEvent:function(){
			var self = this;
			this.$header.on("click","li",function(){
				self._showTab($(this));
			})
		},
		_showTab:function($li){
			var self = this;
			if($li.hasClass("active")){
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
				var data = $li.data("data"); 
				if(data.ajax&&!data.init){
					var  $element = $('<div class="jg-tabs-content-element" ></div>').hide();
					this.$content.append($element);
					this._ajaxLoad($element,data.url,{},function(){
							data.init=true;
							$li.data("content",$element);
							self._toggle($element,$toHide,direction,function(){
								$element.trigger("onOpen",[$element]).trigger("onload",[$element]);
							});
					});
					
				}else{	
					self._toggle($li.data("content"),$toHide,direction,function(){
								
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
			});
		},
		_toggle:function(toShow,toHide,direction,fn){
			var self = this;
			if(!direction){
				direction="left";
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
		add:function(name,url,tabId){
			if(!tabId){
				tabId = this.options._tabId++;
				var $li = $('<li url="'+url+'" tid="'+tabId+'" ><span>'+name+'</span></li>');
					$li.appendTo(this.$header);
					$li.data("data",{ajax:true,init:false,url:url});
				this._showTab($li);
			}else{
				var $li = this._getHeader(tabId);
				if($li&&$li.length>0){
					$li.data("content").remove();
					$li.html('<span>'+name+'</span>');
					$li.data("data",{ajax:true,init:false,url:url});
					this._showTab($li);
				}else{
					var $li = $('<li url="'+url+'" tid="'+tabId+'" ><span>'+name+'</span></li>');
					$li.appendTo(this.$header);
					$li.data("data",{ajax:true,init:false,url:url});
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
		_getHeader(tabId){
			if(!tabId){
				return null;
			}
			return 	this.$header.find('li[tid=="'+tabId+'"]');
		}
	})
	
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


