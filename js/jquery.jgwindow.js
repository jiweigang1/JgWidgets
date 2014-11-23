(function($){

$.jgWindow = function(options){
	$("<div></div>").jgWindow(options);
}

$.widget( "jgWidgets.jgWindow", {
		 options:{
			minHeight:300,
			minWidth:400,
			title	:'新建窗口',
			content	:null,
			left	:null,
			top		:null,
			ajaxType:"post",
			url		:null,
			jgscroll:true,
			model	:false,
			
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
				if(this.options.model){
					this._showCover();
				}
				this.element.addClass("jg-window").css("z-index",this.options._zindex);
				var html = this.element.text();
				this.element.empty();
				var content = '<div class="jg-window-tool-bar">\
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
							  <div class="jg-window-content-container">\
									<div class="jg-window-content" ></div>\
							  </div>';
				
				this.element.append(content).appendTo("body");
				this._$window	=	this.element;
				
				this._$toolBar			= $(".jg-window-tool-bar",this._$window);
				this._$toolContainer	= $(".jg-window-tool-container",this._$window);
				this._$windowTitle		= $(".jg-window-title",this._$window);
				this._$contentContainer = $(".jg-window-content-container",this._$window);
				this._$content 			= $(".jg-window-content",this._$window);
				
				this._$toolMax			= $(".jg-window-tool-max"  ,this._$window);
				this._$toolClose		= $(".jg-window-tool-close",this._$window);
				this._$toolMin			= $(".jg-window-tool-min",this._$window);
				
				this._$window.width(this.options.minWidth).height(this.options.minHeight);
				this._$windowTitle.text(this.options.title);
				this._initLocation();
				this._adjustContentContainer();
				if(html&&$.trim(html)!=""){
					this._$contentContainer.append(html);
				}
				if(this.options.url){
					this.loadContent(this.options.url);
				}
				if(this.options.jgscroll){
					this._enableJgScroll();
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
		_enableJgScroll:function(){
			var self = this;
			if($.fn.jgScrollbar){
				this._$contentContainer.addClass("scroll").jgScrollbar();
				this._$contentContainer.on("mouseenter",function(){
					self._$contentContainer.jgScrollbar("update");
				})
			}
		},
		_initEvent:function(){
				var self = this;
				this.element.draggable({
										handle:"div.jg-window-tool-bar",
										start:function(){
											self.element.addClass("dragging");
										},
										stop:function(){
											self.element.removeClass("dragging");
										},
									});
				this.element.resizable({
										handles:"all",
										start:function(){
											self.element.addClass("sizzing");
										},
										stop:function(){
											self.element.removeClass("sizzing");
											self._adjustContentContainer();
										}			
									});
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
	 },
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
					
					if($.addEventHolder){
						$.addEventHolder("onload",$dom);
					}
					$dom.empty().append(data);
					if($.removeEventHolder){
						$.removeEventHolder("onload");
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
		this._ajaxLoad(this._$content,url,params,function(){
			
		});
	},
	getWid:function(){
		return this.options._wid;
	},
	close:function(){
		this.element.remove();
		this._resetFront();
		this._removeCover();
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
	maxSize:function(){ 
		var self =  this;
		this.element.data("oldSize",{left:this._$window.css("left"),top:this._$window.css("top"),width:this._$window.css("width"),height:this._$window.css("height")});
		var width =  parseInt( this._$window.parent().outerWidth() , 10 ) - 10 + 'px',
            height = parseInt( this._$window.parent().outerHeight() , 10 ) - 10 + 'px';
		var wsT = $( window ).scrollTop(),
			wsL = $( window ).scrollLeft(),
            woH = $( window ).outerHeight();
			woW = $( window ).outerWidth();
		self.element.addClass("sizzing");	
        this.element.animate( {left: wsL+5+'px' , top: wsT+5+'px' , width: woW-12 , height: woH-12+'px' },function(){
			self.element.removeClass("sizzing");
		} );
	 },
	 normalSize:function(){
		var self = this;
		var oldSize = this._$window.data("oldSize");
			self.element.addClass("sizzing");		
		this._$window.animate( {left: oldSize.left , top: oldSize.top , width: oldSize.width , height: oldSize.height},function(){
			self.element.removeClass("sizzing");
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
})(jQuery);
(function ($) {
    $.widget("JgWidgets.jgWindowButton", {
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
			
				$.jgWindow({url:url});
				return false;
			})
		}
	})
})(jQuery);	