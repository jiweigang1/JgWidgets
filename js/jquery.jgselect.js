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
            maxDropHeight:200,
        },
		_create:function(){
			this.settings = {
				width: 260,
				selectionIndex: 0,
				disabled: false,
				showSelectionTextOnly: false,
				onSelectedOnInit: false,
				onSelected: function (index, value, text) { }
			};
			this._initHtml();
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

        _showOptions: function() {
            var $other = $('.jg-select-container .options.open').not(this.$options);
            if ($other.length > 0) {
                $other.removeClass('open');
                $other.slideUp(50);
            }
			this.$arrow.removeClass("close").addClass("open");
			this.$optionsScroll.scrollTop(0);
            this.$optionsScroll.slideDown('fast');
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
				self._selectIndex($(this).attr("index"));
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
			this.$selectContainer.css({width:this.settings.width})
			this.$selected  = this.$selectContainer.find(".selected");
			this.$arrow = this.$selectContainer.find(".arrow");
			this.$optionsContainer = this.$selectContainer.find(".options-container");
			this.$optionsContainer.css({width:this.settings.width});
			this.$options   = this.$selectContainer.find(".options");
            this.$selected.css({ width: this.settings.width - 8});
			this.$optionsScroll = this.$selectContainer.find(".options-scroll");
			this.$optionsScroll.css({"max-height":this.options.maxDropHeight});
			
           
			var optionsHtml = "";
			var i=0;
            this.element.find("option").each(function () {
				optionsHtml += '<li index="'+i+'">'+$(this).text()+'</li>';
				i++;
			});
			this.$options.html(optionsHtml);
            if (!this.settings.disabled) {
                this._enable();
            }else {
                this.$selected.addClass('disabled');
            } 
            this._selectIndex(this.settings.selectionIndex);
        }
	});	
})(jQuery);	