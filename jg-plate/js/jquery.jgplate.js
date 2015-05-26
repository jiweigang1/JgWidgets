(function($){
	$.widget("jgWidgets.jgPlate", {
        options: {
		    toggleTime:200
        },
        _initOptions:function () {
            
        },
		_create:function(){
			this._settings={
				//自定义高度
				autoHeight	:true,
				activePlates:[]
			};
			this.element.addClass("jg-plate-doc");
			this.element.find(">div")
			.each(function(k,v){
				$(this).attr("plateNo",k)
			})
			.addClass("jg-plate").not(":first").hide();
			this._addActivePlate(0);
		},
		open:function(pid){
			var self = this;
			var $plate = this.element.find('>div[pid="'+pid+'"]');
			if($plate.length==0){
				return;
			}
			var $activePlate = this._getCurrentActivePlate();
			var ewidth = this.element.width();
			var method = "animate";
				if($.fn.velocity){
					method = "velocity";	
				}
			$plate.css({left:ewidth});
			this._adjustHeight(this._settings.$activePlate,$plate);
			this.element.addClass("jg-plate-animate")
			$plate.show();
			$plate[method].call($plate,{left:0},this.options.toggleTime,function(){
				self.element.removeClass("jg-plate-animate");
				if(self._settings.autoHeight){
				   self.element.css("height","auto");
				}
				$activePlate.hide();
				self._addActivePlate($plate.attr("plateNo"));
			});
			
		},
		_addActivePlate:function(no){
			this._settings.activePlates = $.grep(this._settings.activePlates,function(v,k){
				if(v==no){
				  return false;
				}
				return true;
			});
			this._settings.activePlates.push(no);
		},
		_getCurrentActivePlate:function(){
		 
		  return this.element.find('>div[plateNo="'+this._settings.activePlates[this._settings.activePlates.length-1]+'"]')
		},
		_removeCurrentActivePlate:function(){
		  this._settings.activePlates.pop();
		},
		_getPreActivePlate:function(){
		  if(this._settings.activePlates.length>1){
			return this.element.find('>div[plateNo="'+this._settings.activePlates[this._settings.activePlates.length-2]+'"]');
		  }else{
			return $([]);
		  }
		},
		_adjustHeight($p1,$p2){
		  if(this._settings.autoHeight){
			 var h1 = 0;
			 if($p1&&$p1.length>0){
				h1 = $p1.height();
			 }
			 var h2 = 0;
			 if($p2&&$p2.length>0){
				h2 = $p2.height();
			 }
			 this.element.height(Math.max(h1,h2));
 		  }
		},
		close:function(){
			var self = this;
			 var $plate = this._getCurrentActivePlate();
				if($plate.length==0){
					return;
				}
				var ewidth = this.element.width();
				var method = "animate";
					if($.fn.velocity){
						method = "velocity";
					}
				$plate.css({left:0});
				var $preplate = this._getPreActivePlate();
				if($preplate&&$preplate.length>0){
					$preplate.show();
				}
				this._adjustHeight($plate,$preplate);
				this.element.addClass("jg-plate-animate")
				$plate[method].call($plate,{left:ewidth},this.options.toggleTime,function(){
					$plate.removeClass("jg-plate-animate");
					 self._removeCurrentActivePlate();
				});
		}
	})
})(jQuery);

(function ($) {
    $.widget("jgWidgets.jgPlateButton", {
        options: {
		
        },
		_create:function(){
			var self 	   = this;
			this._settings = {};
			var $this = this.element;
			$this.click(function(){
				var action = $this.attr("action");
				if(!action){
					action = "open";
				}
				var params =[];
					params.push(action);
				if(action=="open"){
					var pid = $this.attr("pid");
					if(!pid){
						return;
					}
					params.push(pid);
				}else if(action=="close"){
					
				}else{
					return false;
				}
				var $plate = $($this.attr("target"));
				if($plate.length==0){
				   $plate = $this.parents(".jg-plate-doc:first");
				}
				if($plate.length>0){
					$plate.jgPlate.apply($plate,params);
				}
				return false;
			});
		}
	})
})(jQuery)