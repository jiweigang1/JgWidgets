(function($){
	$.widget("jgWidgets.jgEchartHelper",{
		options:{
			url:"",
			ajaxType:"post"
		},
		
		_initOptions:function(){
			this.options.url = getValue(this.element,"url",this.options.value);
		},
		_create:function(){
			this._initOptions();
			this.draw();
		},
		_getData:function(fn){
			var self = this;
			$.ajax({
				url		:this.options.url,
				cache	:false,
				type	:this.options.ajaxType
			}).done(function(response){
				if(!response){
				   return;
				}
				self._chartData = $.parseJSON(response);
				//self._chartData = eval("("+response+")");
				if(fn){
				   fn.call(self);	
				}
			});
		},
		draw:function(){
			this._getData(function(){
				this._echart = echarts.init(this.element[0]);
				this._echart.setOption(this._chartData,true);
			});
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
						v = $.parseJSON(value)
					}catch(e){
						if(console){
							console.log(e+"\n"+value);
						}
					}
					if(v){
						return v;
					}else{
						return defaultValue;
					}
			}else if(type=="int"){
					var v = defaultValue;
					try{
						v = parseInt(value);
					}catch(e){
						if(console){
							console.log(e+"\n"+value);
						}
					}
					return v;
			}
		}
		return defaultValue;
	}
})(jQuery)