/**
 *
 * jg-accordion
 * Licensed  Apache Licence 2.0
 * Version : 1.0.0
 * Author JiGang 2014-10-31
 *
*/
(function ($) {
    $.widget("JgWidgets.jgAccordion", {
        options: {
		
        },
		_create:function(){
			var $this = this.element;
			$(this.element).width(this.element.width()-22);
			$this.find('.jg-accordion-header').addClass('inactive-header').removeClass("active-header");
			$this.find('.jg-accordion-content').css({'display':'none'});
			$this.find('.jg-accordion-header').click(function () {
				if($(this).hasClass('inactive-header')) {
					$('.active-header',$this).addClass('inactive-header').removeClass('active-header').next(".jg-accordion-content").slideToggle().removeClass('open-content');
					$(this).addClass('active-header').removeClass('inactive-header');
					$(this).next(".jg-accordion-content").slideToggle().addClass('open-content');
				}else {
					$(this).removeClass('active-header').addClass('inactive-header');
					$(this).next(".jg-accordion-content").slideToggle().removeClass('open-content');
				}
			});
			$this.find('.jg-accordion-header:first').trigger("click");
		}
	});
})(jQuery);