/**
 *
 * jg-select
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-5
 *
*/
(function ($) {
    $.widget("jgWidgets.jgSelect", {
        options: {
			url:null,
			ajaxType:"post",
            maxDropHeight:200,
			width:260,
			disabled: false,
			selectionIndex:-1,
			holderId:null,
			autoLoad:true,
			
			//数据的过滤器
			dataFilter:null,
			
			onComplet:null,
			beforeChange:null
			
        },
		_create:function(){
			if(this.element[0].tagName.toLowerCase()!=="select"){
				return false;
			}
			this._settings = {};
			this._settings.UUID = "jg-select"+new Date().getTime();
			var self = this;
			this._initOptions();
			if(this.options.autoLoad){
				this._loadOptions({},function(){
					self._initHtml();
					if(this.options.onComplet){
						this.options.onComplet.call(this.element,this.element.val());
					}
					this.element.trigger("onComplet");
				});
			}else{
				self._initHtml();
				if(this.options.onComplet){
					this.options.onComplet.call(this.element,this.element.val());
				}
				this.element.trigger("onComplet");
			}
			
			
		},
		_initOptions:function(){
			this.options.url 	  		  =	getValue(this.element,"url",		  this.options.url);
			this.options.ajaxType 		  = getValue(this.element,"ajaxType",	  this.options.ajaxType);
			this.options.maxDropHeight 	  = getValue(this.element,"maxDropHeight",this.options.maxDropHeight,"int");
			this.options.holderId 	  	  = getValue(this.element,"holderId",	  this.options.holderId);
			this.options.autoLoad	  	  = getValue(this.element,"autoLoad", 	  this.options.autoLoad,	"boolean");	
			this.options.onComplet	  	  = getValue(this.element,"onComplet", 	  this.options.onComplet,	"function");	
			this.options.beforeChange	  = getValue(this.element,"beforeChange", this.options.beforeChange,"function");
			this.options.dataFilter	  	  = getValue(this.element,"dataFilter",   this.options.dataFilter,	"function");			
			
		},
		_getHolder:function(){
			if(this.options.holderId){
				var    $holder = $("#"+this.options.holderId);
				return $holder.length>0?$holder:null;
			}else{
				return null;
			}
		},
		_setHolderValue:function(value,$option){
			var $holder  = this._getHolder();
			var oldValue ; 
			if($holder){
				oldValue = $holder.val();
				$holder.data("jg-select","___");
				$holder.data("old-value",oldValue);
				$holder.val(value);
				$holder.data("jg-select-option",$option.clone());
			}
		},
		
		_triggerHolderChange:function(force){
			if(typeof force ==="undefined" ){
				force = true;
			}
			var $holder = this._getHolder();
			if($holder&&$holder.length>0){
				if(!force){
					var oldValue = $holder.data("old-value")
					if(oldValue!=$holder.val()){
						$holder.trigger("change");
					}
				}else{
					$holder.trigger("change");
				}
				
			}
		},
		
		_selectValue:function(v){
		   var $option = this.element.find('option[value="'+v+'"]');
		   this._selectOption($option);
		},
		_selectIndex: function(index) {
			if(index<0){
				index = 0;
			}
            var $option = this.element.find("option").eq(index)
			this._selectOption($option);
        },
		_selectOption:function($option){
			if($option.length==0){
				$option = this.element.find("option:first");
				if($option.length==0){
					return false;
				}
			}
			var name 	= $option.text();
			var value	= $option.attr("value");
			this.$selected.find("span").html(name);
			if(!this.element.is('[multiple]')){
				this.element.find("option[selected]").attr("selected",false);
			}
			//$option.attr("selected",true);
			$option[0].selected=true;
			var $holder = this._getHolder();
			this._setHolderValue($option.attr("value"),$option);
		},
		_triggerChange:function(){
			var value 		= this.element.val();
			var $selected	= this.element.find("option:selected").clone();
			if(this.options.beforeChange){
				this.options.beforeChange.call(this.element,value,$selected);
			}
			this.element.trigger("beforeChange");
			this._triggerHolderChange();
			this.element.trigger("change",[value,$selected]);
		},
		_loadOptions:function(params,fn){
			var self = this;
			if(this.options.url){
				$.ajax({
					url:self.options.url,
					type:self.options.ajaxType,
					cache:false,
					data:params||{},
				}).done(function(data){
					if(self.options.dataFilter){
						data = self.options.dataFilter.call(self,data);
					}
					self.element.append(data);
					if($.isFunction(fn)){
						fn.call(self);
					}	
				}).fail(function(){
					if($.isFunction(fn)){
						fn.call(self);
					}
				});
			}else{
				if($.isFunction(fn)){
					fn.call(self);
				}
			}
		},
        _showOptions: function() {
			var self = this;
            var $other = $('.jg-select-container .options.open').not(this.$options);
            if ($other.length > 0) {
                $other.removeClass('open');
                $other.slideUp(50);
            }
			this.$arrow.removeClass("close").addClass("open");
            this.$optionsScroll.slideDown('fast',function(){
				self.$optionsScroll.scrollTop(0);
				self._updateOptionsScroll();
			});
        },
		_updateOptionsScroll:function(){
			var self = this;
			if($.fn.jgScrollbar){
				if(self.$optionsScroll.data("jgScrollbar")){
					self.$optionsScroll.jgScrollbar("update");
				}else{
					self.$optionsScroll.jgScrollbar();
				}
			}
		},
        _closeOptions: function (fn) {
            var self	= this;
			this.$arrow.removeClass('open').addClass("close");
            this.$optionsScroll.slideUp(50,function(){
				if(fn){
					fn.call(self);
				}
			});
        },

        _enable: function () {
            var self = this;
			var $hander = this.$selected.add(this.$arrow); 
			$hander.on("click.jg-select",function(e){
				if(self.$arrow.hasClass("close")){	
					self._showOptions();
				}else{
					self._closeOptions();
				}
			});
			this.$options.on("click.jg-select","li",function(e){
				var index = $(this).attr("index");
				if(!index){
					return false;
				}
				self._selectIndex(index);
				self._closeOptions(function(){
					self._triggerChange();
				});
				
			})
			this.$selectContainer.on("click.jg-select",function(e){
				e.stopPropagation();
				e.preventDefault();
				$(document).trigger("click",[self._settings.UUID])
			})
			$(document).on("click.jg-select"+this._settings.UUID, function (e,UUID) {
                 if(typeof UUID==="string"&&UUID===self._settings.UUID){
					
				 }else{
					self._closeOptions();
				 }
				 
            });
			
        },

        _disable: function(){
            this.$selected.on("click.jg-select");
			this.$options.off("click.jg-select");
			this.$selectContainer.off("click.jg-select")
			$(document).off("click.jg-select");
            this.$selected.addClass('disabled');
        },
        _initHtml: function () {
            var  self = this;
            this.element.hide();
            this.$selectContainer = $('<div class="jg-select-container">\
										<a class="selected">\
											<span></span>\
										</a>\
										<span class="jg-select-arrow close"></span>\
										<div class="options-container" >\
											<div class="options-scroll">\
												<ul class="options">\
												</ul>\
											</div>\
										 </div>\
									  </div>');
            this.$selectContainer.insertAfter(this.element);
			this.$selectContainer.css({width:this.options.width})
			this.$selected  = this.$selectContainer.find(".selected");
			this.$arrow = this.$selectContainer.find(".jg-select-arrow");
			this.$optionsContainer = this.$selectContainer.find(".options-container");
			this.$optionsContainer.css({width:this.options.width});
			this.$options   = this.$selectContainer.find(".options");
            this.$selected.css({ width: this.options.width - 8});
			this.$optionsScroll = this.$selectContainer.find(".options-scroll");
			this.$optionsScroll.css({"max-height":this.options.maxDropHeight});
			if($.fn.jgScrollbar){
				this.$optionsScroll.css({"overflow":"hidden","position":"relative"})
				this.$optionsScroll.jgScrollbar({autoShow:false,wheelSpeed:15});
			}
			this._initOptionsHtml();
			if (!this.options.disabled) {
                this._enable();
            }else {
                this.$selected.addClass('disabled');
            }
			
			var $holder = self._getHolder();
			if($holder&&$holder.data("jg-select")){
				this._selectValue($holder.val());
			}else{
				this._selectIndex(this.options.selectionIndex,false);
			}
			
			
            
        },
		_initOptionsHtml:function(){
			var self = this;
			var optionsHtml = "";
			var i=0;
            this.element.children().each(function () {
				if(this.tagName.toLowerCase()=="optgroup"){
					optionsHtml += '<li class="jg-select-optgroup" ><span class="jg-select-text" >'+$(this).attr("label")+'</span></li>';
					$(this).find("option").each(function(){
						optionsHtml += '<li class="jg-select-option" index="'+i+'"><span class="jg-select-text" >'+$(this).text()+'</span></li>';
						if($(this).attr("selected")){
							self.options.selectionIndex=i;
						}
						i++;
					})
				}else if(this.tagName.toLowerCase()=="option"){
					optionsHtml += '<li class="jg-select-option"  index="'+i+'"><span class="jg-select-text" >'+$(this).text()+'</span></li>';
					if($(this).attr("selected")){
							self.options.selectionIndex=i;
					}
					i++;
				}
				
			});
			this.$options.html(optionsHtml);
			if(this.$options.find(".jg-select-optgroup").length>0){
				this.$options.addClass("jg-select-optgroup-container");
			}
		},
		_destroy:function(){
			$(document).off("click.jg-select"+this._settings.UUID);
		},
		reload:function(params,onComplet){
			var self = this;
			this.element.empty();
			this._loadOptions(params,function(){
				self._initOptionsHtml();
				var $holder = self._getHolder();
				if($holder&&$holder.data("jg-select")){
					self._selectValue($holder.val());
				}else{
					self._selectIndex(self.options.selectionIndex,false);
				}
				if($.isFunction(onComplet)){
					try{
						onComplet.call();
					}catch(e){
						if(console){
						  console.log(e)
						}
					}
				}
			});
		},
		selectByIndex:function(index){
			this._selectIndex(index);
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