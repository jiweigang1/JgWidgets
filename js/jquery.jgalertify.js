/**
 * jg-alert
 * Licensed  Apache Licence 2.0
 * Version : 1.0.0
 * Author JiGang 2014-11-23
 *
*/
(function($){
	
	var coverId 		= "__cover-jg-alert_";
	var logsContainerId = "__logsContainer_";
	
	var JgAlert = function(){
		this._dialogs=[];
		this._init();
	};
	$.extend(JgAlert.prototype,{
		_init:function(){
			if($("#"+logsContainerId).length==0){
				this._$logsContainer	=	$('<div id="'+logsContainerId+'" class="jg-alert-logs"></div>').appendTo("body");
			}
			if($("#"+coverId).length==0){
				this._$cover 			=	$('<div id="'+coverId+'" class="jg-alert-cover"></div>').appendTo("body");
			}
			
		},
		_dialog:function(){
			var ele = this._dialogs.shift();
			if(ele){
			   this._init();	
			   var $html = this._buildDialogHtml(ele.type,ele.message,ele.cssClass);
				   $html.appendTo("body");
				this._initDialogEvent(ele.type,ele.fn,$html);
				this._$cover.show();
				$html.animate({top:"50px",opacity:1},300);
			}
			
		},
		_buildDialogHtml:function(type,message,cssClass){
			var clazz = " jg-alert-message ";
			if(cssClass){
				clazz += " "+cssClass;
			}
			var	$html = $('<div id="jg-alert" class="jg-alert jg-alert-'+type+'">\
							<div class="jg-alert-dialog">\
								<div class="jg-alert-inner">\
									<p id="jg-alert-message" class="'+clazz+'">'+message+'</p>\
									<div class="jg-alert-buttons">\
										<button id="jg-alert-ok" class="jg-alert-button jg-alert-button-ok">确定</button>\
									</div>\
								</div>\
							</div>\
						</div>');
			if(type=="confirm"||type=="prompt"){
				$html.find("#jg-alert-ok").after('<button id="jg-alert-cancel" class="jg-alert-button jg-alert-button-cancel">取消</button>');
			}			
			if(type=="prompt"){
				$html.find("#jg-alert-message").after('<div class="jg-alert-text-wrapper"><input type="text" id="jg-alert-text" class="jg-alert-text"></div>');
			}
			return $html;		
						
		},
		_initDialogEvent:function(type,fn,$html){
			var self = this;
			$html.find("#jg-alert-ok").on("click",function(){
				$html.animate({top:"-300px",opacity:0},300,function(){
					$html.remove();
					if(fn){
						try{
							fn.call(null,true,type==="prompt"?$html.find("#jg-alert-text").val():window.undefined);
						}catch(e){
								
						}
					}
					self._$cover.hide();
					self._dialog();
				});
			}).focus();
			if(type=="confirm"||type==="prompt"){
				$html.find("#jg-alert-cancel").on("click",function(){
					$html.animate({top:"-300px",opacity:0},300,function(){
						$html.remove();
						if(fn){
							try{
								fn.call(null,false,type==="prompt"?$html.find("#jg-alert-text").val():window.undefined);
							}catch(e){
								
							}	
						}
						self._$cover.hide();
						self._dialog();
					});
				});
			}
		},
		alert:function(message, fn, cssClass){
			if(typeof fn === "string"){ 
					cssClass = fn;
					fn = window.undefined;
			}
			this._dialogs.push({type:"alert",message:message,fn:fn,cssClass:cssClass});
			if(this._dialogs.length==1){
				this._dialog();
			}
			
		},
		confirm:function(message, fn, cssClass){
			if(typeof fn === "string"){ 
					cssClass = fn;
					fn = window.undefined;
			}
			this._dialogs.push({type:"confirm",message:message,fn:fn,cssClass:cssClass});
			if(this._dialogs.length==1){
				this._dialog();
			}
		},
		prompt:function(message, fn, cssClass){
			if(typeof fn === "string"){ 
					cssClass = fn;
					fn = window.undefined;
			}
			this._dialogs.push({type:"prompt",message:message,fn:fn,cssClass:cssClass});
			if(this._dialogs.length==1){
				this._dialog();
			}
		},
		log:function(message, type, wait){
			var self = this;
			var auto = true;
			this._init();
			if( typeof wait == "undefined"){
				wait = 10*1000;
			}else if(wait<=0){
				auto = false;
			}
			this._$logsContainer.show();
			var $html	=	$('<div class="jg-alert-log jg-alert-log-'+type+'">'+message+'</div>').appendTo(this._$logsContainer);
				$html.animate({right:"0px",opacity:1});
			
			var hide  = function(){
				$html.off("click");
				$html.animate({right:"-300px",opacity:300},function(){
						$html.remove();
						if(self._$logsContainer.find("div").length==0){
							self._$logsContainer.hide();
						}
				});
			}
			if(auto){
				var timeOut =  setTimeout(function(){
						hide.call();
					},wait);
				$html.data("timeOut",timeOut)	
			}
			
			$html.on("click",function(){
				 hide.call();
			});
			
			
		},
		success:function(message, wait){
			this.log(message, "success", wait);
		},
		error:function(message, wait){
			this.log(message, "error", wait);
		} 
	});
	window.jgAlertify = window.jgAlert = new JgAlert();	
	
	var ms = ['alert','confirm','prompt','log','success','error'];
	
	$.each(ms,function(k,name){
		$["jg"+name.substring(0,1).toUpperCase()+name.substring(1)] = function(){
			window.jgAlert[name].apply(window.jgAlert,arguments);
		}
	});
	
})(jQuery);