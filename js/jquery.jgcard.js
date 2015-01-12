/**
 *
 * jg-page
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-9
 *
*/
(function ($) {
    $.widget("jgWidgets.jgCard", {
        options: {
            
        },
		_create:function(){
			this.element.find(">div").eq(0).addClass("jg-card-open");
			this.element.find(">div:not(:first)").hide();
		},
		open:function(cardId){
			var $toHide = this.element.find(".jg-card-open");
			var $toOpen = this.element.find('>div[cardId="'+cardId+'"]');
			if($toOpen.length==0||$toOpen.hasClass("jg-card-open")){
				return false;
			}
			$toHide.removeClass("jg-card-open");
			$toOpen.addClass("jg-card-open");
			if($toHide.length>0){
				$toHide.slideUp();
			}
			if($toOpen.length>0){
				$toOpen.slideDown();
			}
		}
	});
})(jQuery);


(function ($) {
    $.widget("JgWidgets.jgCardButton", {
        options: {
           
        },
		_create:function(){
			var $this = this.element;
			$this.click(function(){
				var action = $this.attr("open");
				if(!action){
					action = "open";
				}
				var params =[];
					params.push(action);
				var cardId = $this.attr("cardId");
				if(!cardId){
					return false;
				}	
				params.push(cardId);
				var $card = $($this.attr("target"));
				if($card.length>0){
					$card.jgCard.apply($card,params);
				}
				return false;
			});
		}
	})
})(jQuery);	