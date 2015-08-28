/**
 *
 * jg-layout
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-9
 *
*/
(function ($) {
	$.widget("jgWidgets.jgLayout",{
		options:{
			northSize:200,
			westSize:200,
			southSize:200,
			eastSize:200,
			enableKey:true,
			enableResizeEvent:true
		},
		_create:function(){
			this.element.addClass("jg-layout-container");
			this._initOptions();
			this._initStyle();
			this._initEvent();
			this._initKeyEvent();
		},
		_initOptions:function(){
			this._settings 			= {
				windowWidth	:$(window).width(),
				windowHeight:$(window).height()
			};
			
			this._settings.$north	= this.element.find(".jg-layout-north");
			if(this._settings.$north.length==0){
				this.options.northSize = 0;
			}
			this._settings.$west	= this.element.find(".jg-layout-west");
			if(this._settings.$west.length==0){
				this.options.westSize = 0;
			}
			this._settings.$south	= this.element.find(".jg-layout-south");
			if(this._settings.$south.length==0){
				this.options.southSize = 0;
			}
			this._settings.$east	= this.element.find(".jg-layout-east");
			if(this._settings.$east.length==0){
				this.options.eastSize = 0;
			}
			this._settings.$centor 	= this.element.find(".jg-layout-centor");
		},
		_initStyle:function(){
			if(this._settings.$north.length>0){
				this._settings.$north.css(this._getNorthStyle());
			}
			if(this._settings.$west.length>0){
				this._settings.$west.css(this._getWestStyle());
			}
			if(this._settings.$south.length>0){
				this._settings.$south.css(this._getSouthStyle());
			}
			if(this._settings.$east.length>0){
				this._settings.$east.css(this._getEastStyle());
			}
			if(this._settings.$centor.length>0){
				this._settings.$centor.css(this._getCentorStyle());
			}
		},
		
		_getNorthStyle:function(){
			return {left:0,top:0,height:this.options.northSize,width:this._settings.windowWidth};
		},
		_getWestStyle:function(){
			var  top = this.options.northSize;
			return {left:0,top:top,width:this.options.westSize,height:this._settings.windowHeight-this.options.northSize-this.options.southSize};
		},
		_getSouthStyle:function(){
			return {left:0,bottom:0,height:this.options.southSize,width:this._settings.windowWidth};
		},
		_getEastStyle:function(){
			var  top  = this.options.northSize;
			var  left = this._settings.windowWidth-this.options.eastSize
			return {right:0,top:top,width:this.options.eastSize,height:this._settings.windowHeight-this.options.northSize-this.options.southSize};
		},
		_getCentorStyle:function(){
			var  top 	= this.options.northSize;
			var  left	= this.options.westSize;
			return {left:left,top:top,width:this._settings.windowWidth-this.options.westSize-this.options.eastSize,height:this._settings.windowHeight-this.options.northSize-this.options.southSize};
		},
		_initEvent:function(){
			var self = this;
			$(window).on("resize" , function(){
				if(self._resizeTimeout){
					clearTimeout(self._resizeTimeout);
				}
				self._resizeTimeout = setTimeout(function(){
					var wwidth 	= $(window).width();
					var wheight	= $(window).height();
					if(self._settings.windowWidth==wwidth&&self._settings.windowHeight==wheight){
						return;
					}else{
						self._settings.windowHeight = wheight;
						self._settings.windowWidth	= wwidth;
						self._initStyle();
					}
				},20);
			});
		},
		_initKeyEvent:function(){
		    var self = this; 		
			if(this.options.enableKey){
				 $(document).keyup(function(event){ 
					if(event.keyCode==121){
						self.fullScreen();
					}else if(event.keyCode==27){
						self.exitFullScreen();
					}
				 });
			}
		},
		close:function(part){
			if(part=="centor"){
				return;
			}
			
			var $part = this._settings["$"+part];
			if($part&&$part.length>0&&!$part.hasClass("jg-layout-close")){
				$part.hide().addClass("jg-layout-close").removeClass("jg-layout-open");
			}else{
				return;
			}
			var p = part+"Size";
			this._settings["_old"+p] = this.options[p];
			this.options[p] = 0;
			this._initStyle();
		},
		open:function(part){
			if(part=="centor"){
				return;
			}
			var $part = this._settings["$"+part];
			if($part&&$part.length>0&&!$part.hasClass("jg-layout-open")){
				$part.show().removeClass("jg-layout-close").addClass("jg-layout-open");
			}else{
				return;
			}
			var p = part+"Size";
			if(typeof this.options[p] =="number"){
				this.options[p] = this._settings["_old"+p] ;
			}
			this._initStyle();
		},
		fullScreen:function(){
			var parts = ["north","west","south","east"];
			for(var i=0; i<parts.length;i++){
				this.close(parts[i]);
			}
			if(this.options.enableResizeEvent){
				$(window).trigger("resize");
			}
		},
		exitFullScreen:function(){
			var parts = ["north","west","south","east"];
			for(var i=0; i<parts.length;i++){
				this.open(parts[i]);
			}
			if(this.options.enableResizeEvent){
				$(window).trigger("resize");
			}
		}
		
	});
})(jQuery)