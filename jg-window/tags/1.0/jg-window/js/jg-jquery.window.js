(function($){

$.jgWindow = function(options){
	var opts = $.extend(true,{},$.jgWindow.defaults,options);
	return new JgWindow(opts);
}

$.fn.jgWindow=function(options){
	return this.each(function(){
		var opts 	 = $.extend(true,{},$.jgWindow.defaults,options);
		var jgWindow = new JgWindow(opts);
			jgWindow.setContent(this);
	});	
}

$.jgWindow.defaults = {
	minHeight:300,
	minWidth:400,
	title	:'ÐÂ½¨´°¿Ú',
	content	:null,
	left:null,
	top:null
}

var JgWindowManager = function(){
	this._windows 		= [];
	this._id			= 0;
	this._zindex		= 1000;
}

$.extend(JgWindowManager.prototype,{
	storeWindow:function(win){
		this._windows.push(win);
	},
	getWindow:function(id){
		var w = null;
		$.each(this._windows,function(){
			if(this._id==id){
				w = this;
				return false;
			}
		});
		return w;
	},
	removeWindow:function (id){
		var index = -1;
		$.each(this._windows,function(i,v){
			if(this._id==id){
				index = i;
				return false;
			}
		});
		if(index>=0){
			this._windows.splice(index,1);
		}
	},
	getId:function (){
		return ++this._id;
	},
	zindex:function(){
		return ++this._zindex;
	},
	getFrontWindow:function(){
		var fw = null;
		$.each(this._windows,function(i,v){
			if(!fw||this._zindex>fw._zindex){
				fw = this;
			}
		});
		return fw;
	}
});

var jgWm = new JgWindowManager();



var JgWindowMin = function(){
	this._minContainer =null;
}

$.extend(JgWindowMin.prototype,{
	add:function(id,title){
		if(!this._minContainer){
			this._init();
		}
		var html = '<div class="jg-window-min-bar" rel="'+id+'"  >\
						<div class="jg-window-min-title-container">\
						  <p class="jg-window-min-title">'+title+'</p>\
						</div>\
						<div class="jg-window-min-tool-container">\
						  <div class="jg-window-min-tool-close"></div>\
						</div>\
					  </div>';
		this._minContainer.append(html);
	},
	remove:function(id){
		this._minContainer.find("[rel="+id+"]").remove();
		if($(".jg-window-min-bar",this._minContainer).length==0){
			this._minContainer.remove();
			this._minContainer =null;
		}
	},
	_init:function(){
		var self = this;
		this._minContainer = $('<div class="jg-window-min-container" ></div>').appendTo("body");
		this._minContainer.on("click",".jg-window-min-tool-close,.jg-window-min-bar",function(){
			if($(this).hasClass("jg-window-min-tool-close")){
				var $bar = $(this).parents(".jg-window-min-bar:first"); 
				jgWm.getWindow($bar.attr("rel")).close();
				self.remove($bar.attr("rel"));
			}else if($(this).hasClass("jg-window-min-bar")){
				jgWm.getWindow($(this).attr("rel")).show();
				self.remove($(this).attr("rel"));
			}
		});
	}
});

var jgWindowMin = new JgWindowMin();

var JgWindow = function(opts){
	this._id   		= jgWm.getId();
	this._zindex	= jgWm.zindex();
	
	this._opts = opts;
	this._initHtml();
	this._initEvent();
	if(this._opts.url&&this._opts.url.length>0){
		this.loadContent(this._opts.url);
	}
	if(this._opts.content&&this._opts.content.length>0){
		this.setContent(this._opts.content);
	}
	jgWm.storeWindow(this);
}

$.extend(JgWindow.prototype,{
	 _initHtml:function(){
		var html = '<div class="jg-window" style="postion:absulte;z-index:'+this._zindex+'" >\
					  <div class="jg-window-tool-bar">\
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
					  </div>\
					  <div class="jg-window-content-resizable-e  resizable-handler"></div>\
					  <div class="jg-window-content-resizable-s  resizable-handler"></div>\
					  <div class="jg-window-content-resizable-w  resizable-handler"></div>\
					  <div class="jg-window-content-resizable-se resizable-handler"></div>\
					  <div class="jg-window-content-resizable-sw resizable-handler"></div>\
					</div>';
		this._$window  			= $(html).appendTo("body");			
		this._$toolBar			= $(".jg-window-tool-bar",this._$window);
		this._$toolContainer	= $(".jg-window-tool-container",this._$window);
		this._$windowTitle		= $(".jg-window-title",this._$window);
		this._$contentContainer = $(".jg-window-content-container",this._$window);
		
		this._$toolMax			= $(".jg-window-tool-max"  ,this._$window);
		this._$toolClose		= $(".jg-window-tool-close",this._$window);
		this._$toolMin			= $(".jg-window-tool-min",this._$window);
		
		this._$window.width(this._opts.minWidth).height(this._opts.minHeight);
		this._$windowTitle.text(this._opts.title);
		this._initLocation();
		this._adjustContentContainer();
	 },
	 _initEvent:function(){
		var self = this;
		this._$toolBar.on("dragstart",function(e,tt){
				var woffset = self._$window.offset();
				self._$toolBar.data("oldData",{"left":woffset.left,"top":woffset.top,"pageX":e.pageX,"pageY":e.pageY});
				//self._$contentContainer.css({"margin-top":10000})
		}).on("drag",function(e,tt){
			var oldData = self._$toolBar.data("oldData");
			self._$window.css({"left":e.pageX-oldData.pageX+oldData.left,"top":e.pageY-oldData.pageY+oldData.top});
			//self._$contentContainer.css({"margin-top":0)
		}).on("mousedown",function(){
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
		
		$(".resizable-handler",this._$window).on("dragstart",function(e,tt){
			var $box =$('<div class="jg-window-resize-box" ></div>').css({"left":self._$window.offset().left,"top":self._$window.offset().top,height:self._$window.height(),width:self._$window.width(),"z-index":self._zindex+1}).appendTo("body")
				$box.data("owidth",$box.width());
				$box.data("oheight",$box.height());
				$box.data("ooffset",$box.offset());
			return $box;
		}).on("drag",function(e,tt){
			if($(this).hasClass("jg-window-content-resizable-e")){
				$(tt.proxy).css({width:$(tt.proxy).data("owidth")+tt.deltaX});
			}else if($(this).hasClass("jg-window-content-resizable-w")){
				$(tt.proxy).css({width:$(tt.proxy).data("owidth")-tt.deltaX,left:$(tt.proxy).data("ooffset").left+tt.deltaX});
			}else if($(this).hasClass("jg-window-content-resizable-s")){
				$(tt.proxy).css({height:$(tt.proxy).data("oheight")+tt.deltaY});
			}else if($(this).hasClass("jg-window-content-resizable-se")){
				$(tt.proxy).css({width:$(tt.proxy).data("owidth")+tt.deltaX,height:$(tt.proxy).data("oheight")+tt.deltaY});
			}else if($(this).hasClass("jg-window-content-resizable-sw")){
				$(tt.proxy).css({width:$(tt.proxy).data("owidth")-tt.deltaX,height:$(tt.proxy).data("oheight")+tt.deltaY,left:$(tt.proxy).data("ooffset").left+tt.deltaX});
			}
		}).on("dragend",function(e,tt){
			self._$window.css({width:$(tt.proxy).width(),height:$(tt.proxy).height(),left:$(tt.proxy).offset().left,top:$(tt.proxy).offset().top});
			self._adjustContentContainer();
			$(tt.proxy).remove();	
		});
		
	 },
	 maxSize:function(){ 
		this._$window.data("oldSize",{left:this._$window.css("left"),top:this._$window.css("top"),width:this._$window.css("width"),height:this._$window.css("height")});
		var width =  parseInt( this._$window.parent().outerWidth() , 10 ) - 10 + 'px',
            height = parseInt( this._$window.parent().outerHeight() , 10 ) - 10 + 'px';
		var wsT = $( window ).scrollTop(),
			wsL = $( window ).scrollLeft(),
            woH = $( window ).outerHeight();
        this._$window.animate( {left: wsL+5+'px' , top: wsT+5+'px' , width: width , height: woH-10+'px' } );
	 },
	 normalSize:function(){
		var oldSize = this._$window.data("oldSize");
		this._$window.animate( {left: oldSize.left , top: oldSize.top , width: oldSize.width , height: oldSize.height} );
	 },
	 close:function(){
		this._$window.remove();
		jgWm.removeWindow(this._id);
		//alert(this._$toolContainer.html());
	 },
	 minSize:function(){
		this.hide();
		jgWindowMin.add(this._id,this._opts.title);
	 },
	 hide:function(){
		this._$window.hide();
		this._$window.data("oldDocScroll",{"left":$(document).scrollLeft(),"top":$(document).scrollTop()})
	 },
	 show:function(){
		var os = this._$window.data("oldDocScroll");
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
		this._$window.show();
	 },
	 zindex:function(zindex){
		this._zindex = zindex;
		this._$window.css({"z-index":zindex});
	 },
	 front:function(){
		var fw = jgWm.getFrontWindow();
		if(fw!=this){
			var sz = this._zindex;
			this.zindex(fw._zindex);
			fw.zindex(sz);
		}
	 },
	 setContent:function(content){
		this._$contentContainer.append(content);
	 },
	 loadContent:function(url){
		var self = this;
		$.post(url,{},function(respons){
			self.setContent(respons);
		});	
	 },
	 _adjustContentContainer:function(){
		this._$contentContainer.css({"height":this._$window.height()-this._$toolBar.height()-6,"width":this._$window.width()-6});
	 },
	 _initLocation:function(){
		if(!this._opts.left){
			this._$window.css({"left":$(document).scrollLeft()+$(window).width()/2-this._$window.outerWidth()/2});
		}else{
			this._$window.css({"left":this._opts.left});
		}
		
		if(!this._opts.top){
			this._$window.css({"top":$(document).scrollTop()+$(window).height()/2-this._$window.outerHeight()/2});
		}else{
			this._$window.css({"top":this._opts.top});
		}
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

})(jQuery)