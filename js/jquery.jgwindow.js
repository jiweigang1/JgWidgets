/**
 *
 * jg-window
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-5-21
 *
*/
(function($){



$.widget( "jgWidgets.jgWindow", {
		 options:{
		 
			params	 :null,
		 
			
			height	 :300,
			width	 :400,
			minHeight:0,
			minWidth :0,
			title	 :'新建窗口',
			content	 :null,
			left	 :null,
			top		 :null,
			ajaxType :"post",
			url		 :null,
			//是否使用优化后的滚动条
			jgscroll :true,
			jgscrollDragEnable:true,
			//是否使用Iframe 如果是跨域的话使用，使用iframe 只能使用get 方式传递参数
			iframe	 :false,
			
			model		:false,
			max			:false,
			fullScreen	:false,
			
			maxAble  :true,
			miniAble :true,
			closeAble:true,
			draggable :true,
			resizable:true,
			
			validate:null,
			onOpen	:null,
			
			_cover:null,
			_zindex	:0,
			_wid	:0
			
		 },
		 GLOBE:{
			_front:null,
			_id:0,
			_minIndex: 1000,
			_minBarIndex:1500
		 },
		 _create:function(){
			this.options._id = this.GLOBE._id++;
			this.options._zindex = this.GLOBE._minIndex+=2;
			this._initHtml();
			this._initEvent();
		 },
		 _initHtml:function(){
				var self = this;
				if(this.options.model){
					this._showCover();
				}
				this.element.addClass("jg-window jg-component").css("z-index",this.options._zindex);
				var html = this.element.text();
				this.element.empty();
				var content = '<div class="jg-window-tool-bar">\
								<div class="jg-window-tool-bar-holder" >\
									<div class="jg-window-title-container">\
									  <p class="jg-window-title">\
									  </p>\
									</div>\
									<div class="jg-window-tool-container">\
									  <div class="jg-window-tool-close"></div>\
									  <div class="jg-window-tool-max normal"></div>\
									  <div class="jg-window-tool-min"></div>\
									</div>\
									<div class="jg-window-tool-hdr"></div>\
								</div>\
							  </div>\
							  <div class="jg-window-content-container">\
									<div class="jg-window-content" ></div>\
							  </div>';
				
				this.element.append(content).appendTo("body");
				this._$window	=	this.element;
				
				this._$toolBar			= $(".jg-window-tool-bar",		 this._$window);
				this._$toolBarHolder	= $(".jg-window-tool-bar-holder",this._$window);
				
				this._$toolContainer	= $(".jg-window-tool-container",this._$window);
				this._$windowTitle		= $(".jg-window-title",this._$window);
				this._$contentContainer = $(".jg-window-content-container",this._$window);
				
				this._$content 			= $(".jg-window-content",this._$window);
				if(this.options.iframe){
					this._$content.addClass("iframe-type")
				}
				
				this._$toolMax			= $(".jg-window-tool-max"  ,this._$window);
				this._$toolMin			= $(".jg-window-tool-min",this._$window);
				this._$toolClose		= $(".jg-window-tool-close",this._$window);
				
				if(this.options.fullScreen){
					this._$toolBar.hide();
					var hand_mouseenter = function(){
						self._$toolBar.show();
						self._$fullScreenHander.hide();
						self._adjustContentContainer();
					}
					
					var toolBar_leave = function(){
						self._$toolBar.hide();
						self._$fullScreenHander.show();
						self._adjustContentContainer();
					}
					
					
					this._$fullScreenHander = $('<div class="jg-window-fullScreen-hander" ></div>');
					this.element.append(this._$fullScreenHander);
					this._$fullScreenHander.on("mouseenter",hand_mouseenter);
					this._$toolBar.on("mouseleave",toolBar_leave);
				}
				
				if(this.options.maxAble){
				   this._$toolMax.show();
				}
				if(this.options.miniAble){
					this._$toolMin.show();;
				}
				if(this.options.closeAble){
					this._$toolClose.show();;
				}
				
				
				
				this._$window.width(this.options.width).height(this.options.height);
				
				this._$windowTitle.text(this.options.title);
				this._initLocation();
				this._adjustContentContainer();
				if(html&&$.trim(html)!=""){
					this._$contentContainer.append(html);
				}
				
				if(!this.options.max){
					if(this.options.url){
						this.loadContent(this.options.url,this.options.params);
					}
				}
				if(this.options.jgscroll&&!this.options.iframe){
					this._enableJgScroll();
				}
				if(this.options.max){
					this.maxSize(function(){
						if(self.options.url){
							self.loadContent(this.options.url,this.options.params);
						}
					});
				}
				
		},
		_showCover:function(){
			if(!this.options._cover){
				this.options._cover = $('<div class="jg-window-cover"></div>').css("z-index",this.options._zindex-1).appendTo("body");
			}
		},
		_hideCover:function(){
			if(this.options._cover){
				this.options._cover.hide();
			}
		},
		_removeCover:function(){
			if(this.options._cover){
				this.options._cover.remove();
				this.options._cover=null;
			}
		},
		_updateScroll:function(){
			var self = this;
			if(this.options.jgscroll&&$.fn.jgScrollbar&&!this.options.iframe){
				if(this._$contentContainer.data("jgScrollbar")){
					this._$contentContainer.jgScrollbar("update");
				}else{
					this._$contentContainer.addClass("scroll").jgScrollbar({dragEnable:self.options.jgscrollDragEnable});
					this._$contentContainer.on("mouseenter",function(){
						self._$contentContainer.jgScrollbar("update");
					})
				}
			}
		},
		_enableJgScroll:function(){
			this._updateScroll();
		},
		enableResize:function(){
			var self = this;
			var ds = {
						handles:"all",
						helper: "jg-window-resizable-helper",
						start:function(){
							self.element.addClass("sizzing");
						},
						stop:function(){
							self.element.removeClass("sizzing");
							self._adjustContentContainer();
						}
					}
		
			if(this.options.minHeight>0){
				ds.minHeight = this.options.minHeight;
			}
			if(this.options.minWidth>0){
				ds.minWidth = this.options.minWidth;
			}
			
			this.element.resizable(ds);
		},
		enableDrag:function(){
			var self = this;
			var ds = {
						handle:"div.jg-window-tool-bar",
						start:function(){
							self.element.addClass("dragging");
						},
						stop:function(){
							self.element.removeClass("dragging");
						}
					}
			
			this.element.draggable(ds);
			
		},
		_initEvent:function(){
				var self = this;
				if(this.options.draggable){
					this.enableDrag();
				}
				
				if(this.options.resizable){
					this.enableResize();
				}
				
				this._$toolBar.on("mousedown",function(){
					self.front();
				});
				this._$toolMax.on("click",function(){
					if($(this).hasClass("normal")){
						self.maxSize();
						$(this).removeClass("normal").addClass("alternate");
					}else{
						self.normalSize();
						$(this).removeClass("alternate").addClass("normal");
					}
					
				});
				
				this._$toolClose.on("click",function(){
					self.close();
				});
				this._$toolMin.on("click",function(){
					self.minSize();
				});
				$(window).resize(function(){
					if(self._maxTimeout){
						clearTimeout(self._maxTimeout);
					}
					self._maxTimeout = setTimeout(function(){
						if(self._$toolMax.hasClass("alternate")){
							self._maxSize();
						}
						self._maxTimeout = null;
					},20);
				});
				
				
				
	 },
	 _initLocation:function(){
		if(!this.options.left){
			this._$window.css({"left":$(document).scrollLeft()+$(window).width()/2-this._$window.outerWidth()/2});
		}else{
			this._$window.css({"left":this.options.left});
		}
		
		if(!this.options.top){
			this._$window.css({"top":$(document).scrollTop()+$(window).height()/2-this._$window.outerHeight()/2});
		}else{
			this._$window.css({"top":this.options.top});
		}
	 },
	 _adjustContentContainer:function(){
		this._$contentContainer.css({"height":this._$window.height()-this._$toolBar.height()-6,"width":this._$window.width()-6});
		this._updateScroll();
	 },
	 /**
	 _adjustContent:function(){
		this._$content.css({"min-height":this._$content.parent().height(),"min-width":this._$content.parent().width()});
		this._$contentContainer.jgScrollbar("update");
	 },
	 */
	_frontWindow:function(){
		var zi = 0;
		var w  = null;
		$('.jg-window:visible').each(function () {
					if ($(this).zIndex() >= zi) {
						zi = $(this).zIndex();
						w = $(this);
					}
				});
		return w;
	},
	_initMiniContainer:function(){
		var minContainer = $('<div id="jg-window-min-container" class="jg-window-min-container" ></div>').css("z-index",this.GLOBE._minBarIndex).appendTo("body");
			minContainer.on("click",".jg-window-min-tool-close,.jg-window-min-bar",function(event){
			if($(this).hasClass("jg-window-min-tool-close")){
				var $bar 	= $(this).parents(".jg-window-min-bar:first"); 
				var window	= $bar.data("jg-window").jgWindow("close"); 
					$bar.remove();
					event.preventDefault();
					event.stopPropagation();
			}else if($(this).hasClass("jg-window-min-bar")){
				$(this).data("jg-window").jgWindow("show"); 
				$(this).remove();
				event.preventDefault();
				event.stopPropagation();
			}
			
		});
		return minContainer;
	},
	_ajaxLoad:function($dom,url,params,success){
			var self = this;
			if(!$dom||$dom.length==0){
				return;
			}
			$.ajax({
				 url : url,
                 data: params,
				 cache:false,
				 type:self.options.ajaxType,
				 dataType:"text",
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
					$.jgWindow[EVENT_HOLDER]=$dom;
					if($.addEventHolder){
						$.addEventHolder($.event_init,$dom);
						$.addEventHolder($.event_ready,$dom);
					}
					$dom.empty().append(data);
					$.jgWindow[EVENT_HOLDER]=null;
					
					if($.removeEventHolder){
						$.removeEventHolder($.event_init,$dom);
						$.removeEventHolder($.event_ready,$dom);
					}
					
					if(success&&$.isFunction(success)){
						success.call(null,data)
					}
				 },
				 //请求失败
				 error:function(){
					if(success&&$.isFunction(success)){
						success.call(null,"")
					}
				 }
			});
	},
	loadContent:function(url,params){
		var self 		= this;
		var $content	= this._$content;
		if(!this.options.iframe){
			this._ajaxLoad($content,url,params,function(){
				$content.css("opacity",0);
				if($.event_init){
				    self._triggerEvent($content,$.event_init,[$content]);	
				}
				if($.JgWidgets){
					try{
						$.JgWidgets._initContent($content,$.JgWidgets.g_before);
					}catch(e){
						if(console){
							console.log(e);
						}
					}
				}
				$content.css("opacity",1);
				if(self.options.onOpen) {
					self.options.onOpen.call(null, $content);
				}
				if($.JgWidgets){
					try{
						$.JgWidgets._initContent($content,$.JgWidgets.g_after);
					}catch(e){
						if(console){
							console.log(e);
						}
					}
				}
				if($.event_ready){
				    self._triggerEvent($content,$.event_ready,[$content]);
				}
				self._triggerEvent($content,"onOpen",[$content]);
				self._adjustContentContainer();
			});
		}else{
			$content.append('<iframe class="jg-window-iframe"  frameborder="0" src="'+this.options.url+'"></iframe>')
		}
	},
	_triggerEvent:function($el,eventType,params){
			try{
				$el.trigger(eventType,params);
			}catch(e){
				if(console){
				   console.log(e.message)	
				}
			}
	},
	_fireEvent:function(eventType,context,params){
		
		if(this.options[eventType]){
			try{
				this.options[eventType].apply(context,params);
			}catch(e){
				if(console){
				   console.log(e.message)	
				}
			}
		}
		
		try{
			 this.element.trigger(eventType,params);
		}catch(e){
			if(console){
			   console.log(e.message)	
			}
		}
	},
	getWid:function(){
		return this.options._wid;
	},
	close:function(){
		this.element.remove();
		this._resetFront();
		this._removeCover();
	},
	_destroy:function(){
		//this.close();
	},
	_resetFront:function(){
		this.GLOBE._front = this._frontWindow();
	},
	front:function(){
		if(this.GLOBE._front==null){
			this.GLOBE._front = this._frontWindow();
		}	
		if(this.getWid()!=this.GLOBE._front.jgWindow("getWid")){
			var oIndex = this.GLOBE._front.jgWindow("zindex");
			var nIndex = this.zindex();
			this.zindex(oIndex);
			this.GLOBE._front.jgWindow("zindex",nIndex);
		}
		this.GLOBE._front = this.element;
	},
	zindex:function(index){
		if(index){
			this.element.css("z-index",index);
		}else{
			return parseInt(this.element.css("z-index"));
		}
	},
	maxSize:function(fn){
		var self =  this;
		this._maxSize({left:this._$window.css("left"),top:this._$window.css("top"),width:this._$window.css("width"),height:this._$window.css("height")},fn);
	},
	_maxSize:function(oldSize,fn){
		var self =  this;
		if(oldSize){
			this.element.data("oldSize",oldSize);
		}
		var width =  parseInt( this._$window.parent().outerWidth() , 10 ) - 10 + 'px',
            height = parseInt( this._$window.parent().outerHeight() , 10 ) - 10 + 'px';
		var wsT = $( window ).scrollTop(),
			wsL = $( window ).scrollLeft(),
            woH = $( window ).outerHeight();
			woW = $( window ).outerWidth();
		self.element.addClass("sizzing");	
        this.element.animate( {left: wsL+5+'px' , top: wsT+5+'px' , width: woW-12 , height: woH-12+'px' },function(){
			self.element.removeClass("sizzing");
			self._adjustContentContainer();
			if(self.options.resizable){
				self.element.resizable("disable");
			}
			
			if(self.options.draggable){
				self.element.draggable("disable")
			}
			if(fn){
				fn.call(self);
			}
		} );
	 },
	 normalSize:function(){
		var self = this;
		var oldSize = this._$window.data("oldSize");
			self.element.addClass("sizzing");		
		this._$window.animate( {left: oldSize.left , top: oldSize.top , width: oldSize.width , height: oldSize.height},function(){
			self.element.removeClass("sizzing");
			self._adjustContentContainer();
			
			if(self.options.resizable){
				self.element.resizable("enable");
			}
			
			if(self.options.draggable){
				self.element.draggable("enable");
			}
			
		});
	 },
	 minSize:function(){
		this.hide();
		var $min = $("#jg-window-min-container");
		if($min.size()==0){
			$min = this._initMiniContainer();
		}
		var html = '<div class="jg-window-min-bar">\
						<div class="jg-window-min-title-container">\
						  <p class="jg-window-min-title">'+this.options.title+'</p>\
						</div>\
						<div class="jg-window-min-tool-container">\
						  <div class="jg-window-min-tool-close"></div>\
						</div>\
					  </div>';
		var $html = $(html);			  
			$min.append($html);
		$html.data("jg-window",this.element);		
		
	 },
	 hide:function(){
		this.element.hide();
		this._hideCover();
		this._resetFront();
		this.element.data("oldDocScroll",{"left":$(document).scrollLeft(),"top":$(document).scrollTop()})
	 },
	 show:function(){
		var os = this.element.data("oldDocScroll");
		var x=0, y=0;
		if(os){
			if($(document).scrollLeft()!=os.left){
				x = $(document).scrollLeft()-os.left;
			}
			
			if($(document).scrollTop()!=os.top){
				y = $(document).scrollTop()-os.top;
			}
		}
		
		var ol = this.location();
		this.location(ol.left+x,ol.top+y);
		this.element.show();
		this.front();
	 },
	 location:function(left,top){
		if(arguments.length==0){
			return {"left":parseInt(this._$window.css("left").replace("px","")),"top":parseInt(this._$window.css("top").replace("px",""))};
		}else{
			var l = {};
			if(left){
				l.left = left;
			}
			if(top){
				l.top  = top;
			}
			this._$window.css(l);
		}
	 },
	 size:function(width,height){
		if(arguments.length==0){
			return {"width":this._$window.width(),"height":this._$window.height()};
		}else {
			var s ={};
			if(width){
				s.width  = width;
			}
			if(height){
				s.height = height;
			}
			this._$window.css(s);
			this._adjustContentContainer();
		}
	 }
});
	
	/**
		注册加载的事件，作用域是当前的Window Content
	*/
	var EVENT_HOLDER = "window_holder";
	$.jgWindow = function(options){
		if(!(arguments.length==2&&typeof arguments[0]==="string" && $.isFunction(arguments[1]))){
			$("<div></div>").jgWindow(options);
		}else{
			var event = arguments[0]
			var fn	  = arguments[1];
			if(!$.jgWindow[EVENT_HOLDER]||!fn||!$.isFunction(fn)){
				return;
			}
			if(event!=="onOpen"){
				return;
			}
			$.jgWindow[EVENT_HOLDER].one(event,function(event,$content){
				fn.call(window,$content);
			});
		}
	}
})(jQuery);
(function ($) {
    $.widget("jgWidgets.jgWindowButton", {
        options: {
           
        },
		_create:function(){
			var $this = this.element;
			$this.on("click",function(){
				var url	;  
				if($this[0].tagName.toUpperCase() == "A"){
					url = $this.attr("href");
				}else{
					url = $this.attr("url");
				}
				if(!url){
					return true;
				}
				var max 	= "true" ===$this.attr("max");
				var title	= $this.attr("title")||"新建窗口";
				var maxAble = true;
				if($this.attr("maxAble")==="false"){
					maxAble = false;
				}
				
				var closeAble = true;
				if($this.attr("closeAble")==="false"){
					closeAble = false;
				}
				
				var miniAble = true; 
				if($this.attr("miniAble")==="false"){
					miniAble = false;
				}
				var fullScreen = false;
				if($this.attr("fullScreen")==="true"){
					fullScreen = true;
				}
				
				var jgscrollDragEnable = true;
				if($this.attr("jgscrollDragEnable")==="false"){
					jgscrollDragEnable = false;
				}
				
				var model = true;
				if($this.attr("model")==="false"){
					model = false;
				}
				
				var draggable = true;
				if($this.attr("draggable")==="false"){
					draggable = false;
				}
				
				var resizable = true;
				if($this.attr("resizable")==="false"){
					resizable = false;
				}
				
				var iframe = false;
				if($this.attr("iframe")==="true"){
					iframe = true;
				}
				
				
				var height 	  = getValue($this,"height",	 $.jgWidgets.jgWindow.prototype.options.height,"int");
				var width  	  = getValue($this,"width", 	 $.jgWidgets.jgWindow.prototype.options.width,"int");
				var minWidth  = getValue($this,"minWidth",   $.jgWidgets.jgWindow.prototype.options.minWidth,"int");
				var minHeight = getValue($this,"minHeight",  $.jgWidgets.jgWindow.prototype.options.minHeight,"int");
				
				
				$.jgWindow({url:url,draggable:draggable,resizable:resizable,height:height,width:width,minHeight:minHeight,minWidth:minWidth,max:max,title:title,maxAble:maxAble,closeAble:closeAble,miniAble:miniAble,fullScreen:fullScreen,model:model,jgscrollDragEnable:jgscrollDragEnable,iframe:iframe});
				return false;
			})
		}
	})
	
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
						v = $.parseJSON(value)
					}catch(e){
						if(console){
							console.log(e+"\n"+value);
						}
					}
					if(v){
						return v;
					}else{
						return defaultValue;
					}
			}else if(type=="int"){
					var v = defaultValue;
					try{
						v = parseInt(value);
					}catch(e){
						if(console){
							console.log(e+"\n"+value);
						}
					}
					return v;
			}
		}
		return defaultValue;
	}
	
})(jQuery);	