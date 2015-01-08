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
			selectionIndex:0
			
        },
		_create:function(){
			var self = this;
			this._initOptions();
			this._loadOptions(function(){
				self._initHtml();
			});
			
		},
		_initOptions:function(){
			this.options.url 	  		  =	getValue(this.element,"url",		  this.options.url);
			this.options.ajaxType 		  = getValue(this.element,"ajaxType",	  this.options.ajaxType);
			this.options.maxDropHeight 	  = getValue(this.element,"maxDropHeight",this.options.maxDropHeight,"int");
		},
		_selectIndex: function(index) {
            var $option = this.element.find("option").eq(index)
			var name 	= $option.text();
			var value	= $option.attr("value");
			this.$selected.find("span").html(name);
			if(!this.element.is('[multiple]')){
				this.element.find("option[selected]").attr("selected",false);
			}
			this.element.find("option").eq(index).attr("selected",true);
			this.element.trigger("change");
        },

		_loadOptions:function(fn){
			var self = this;
			if(this.options.url){
				$.ajax({
					url:self.options.url,
					type:self.options.ajaxType,
					cache:false
				}).done(function(data){
					self.element.append(data);
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
				if($.fn.jgScrollbar){
					self.$optionsScroll.jgScrollbar("update");
				}
			});
        },

        _closeOptions: function () {
            this.$arrow.removeClass('open').addClass("close");
            this.$optionsScroll.slideUp(50);
        },

        _enable: function () {
            var self = this;
			this.$selected.on("click.jg-select",function(e){
				self._showOptions();
				e.stopPropagation();
				e.preventDefault();
			});
			this.$options.on("click.jg-select","li",function(e){
				var index = $(this).attr("index");
				if(!index){
					return false;
				}
				self._selectIndex(index);
				self._closeOptions();
			})
			this.$selectContainer.on("click.jg-select",function(e){
				e.stopPropagation();
			})
			$(document).on("click.jg-select", function (e) {
                self._closeOptions();
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
										<span class="arrow close"></span>\
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
			this.$arrow = this.$selectContainer.find(".arrow");
			this.$optionsContainer = this.$selectContainer.find(".options-container");
			this.$optionsContainer.css({width:this.options.width});
			this.$options   = this.$selectContainer.find(".options");
            this.$selected.css({ width: this.options.width - 8});
			this.$optionsScroll = this.$selectContainer.find(".options-scroll");
			this.$optionsScroll.css({"max-height":this.options.maxDropHeight});
			if($.fn.jgScrollbar){
				this.$optionsScroll.css({"overflow":"hidden","position":"relative"})
				this.$optionsScroll.jgScrollbar({autoShow:false});
			}
           
			var optionsHtml = "";
			var i=0;
            this.element.children().each(function () {
				if(this.tagName.toLowerCase()=="optgroup"){
					optionsHtml += '<li>'+$(this).attr("label")+'</li>';
					$(this).find("option").each(function(){
						optionsHtml += '<li index="'+i+'">'+$(this).text()+'</li>';
						i++;
					})
				}else if(this.tagName.toLowerCase()=="option"){
					optionsHtml += '<li index="'+i+'">'+$(this).text()+'</li>';
					i++;
				}
				
			});
			this.$options.html(optionsHtml);
            if (!this.options.disabled) {
                this._enable();
            }else {
                this.$selected.addClass('disabled');
            } 
            this._selectIndex(this.options.selectionIndex);
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