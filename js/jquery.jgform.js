(function($){

	(function(){
		$.validator.methods.phone = function(value, element, param) {
			if($.trim(value)==""||!value){
				return true;
			}
			var test = /^1\d{10}$|^(0\d{2,3}-?|\(0\d{2,3}\))?[1-9]\d{4,7}(-\d{1,8})?$/;
			return test.test(value);
		};
		
		$.validator.messages.phone = "请输入正确的电话号码！";
		
		
		$.validator.methods.ajax = function(value, element, param) {
			var validator = param.validator;
			var previous = validator.previousValue(element);
			if ( previous.old === value ) {
				return previous.valid;
			}
			previous.old  = value;
			var url  	  = $(element).attr("action");
			var data 	  = {};
				data[$(element).attr("name")] = value;
			var valid 	= false;
			var message = $(element).attr("title");
				$.ajax({
							url:url,
							dataType:"text",
							type:"POST",
							data:data,
							async:false,
							success: function( response ) {
								var data = $.parseJSON(response);
									valid = (data.status==200) ;
								previous.valid = valid;
							}
						});	
			return 	valid ;
		};
		
		$.validator.messages.ajax = "验证失败！";
		
		$.validator.methods.eqto = function(value, element, param) {
			var tv = $("#"+$(element).attr("eqtoid"), $(element).parents("form:first")).val();
			if(!tv||$.trim(tv)==""){
				return true;
			}else{
				return value === tv;
			}
		};
		
		$.validator.messages.eqto  = "两次输入不一致！";
		
		$.validator.methods.submit = function(value, element, param){
			//alert(param.options.ignoreSubmit);
			if(param.options.ignoreSubmit){
				return true;
			}
			return value === $(element).data("oldValue");
		}
		
		$.validator.messages.submit = "未提交！";
		
		
	})();
	

	$.widget("jgWidgets.jgForm",{
		options:{
			type:"ajax",	//ajax iframe
			action:null,
			method:"post",
			onComplete:null,
			onSuceess:null,
			onError:null,
			findErrHolder:null,
			validate:true,
			ignoreSubmit:false
		},
		_create:function(){
			this._initParams(this.element);
			this._initEvent(this.element);
			if(this.options.validate){
				this._initValidata();
			}
		},
		_initParams:function(){
			var $el = this.element;
			if($el.attr("type")){
				this.options.type=$el.attr("type");
			}
			if($el.attr("method")){
				this.options.method = $el.attr("method");
			}
			if($el.attr("action")){
				this.options.action = $el.attr("action");
			}
			
			var findErrHolder = getFunction($el,"findErrHolder");
			if(findErrHolder){
				this.options.findErrHolder = findErrHolder;
			}
			
			
		},
		_initEvent:function($el){
			var self = this;
			var complete = getFunction($el,"onComplete");
			if(complete){
				this.options.onComplete = complete;	
			}
			var suceess = getFunction($el,"onSuceess");
			if(suceess){
				this.options.onSuceess = suceess;	
			}
			var error = getFunction($el,"onError");
			if(error){
				this.options.onError = error;	
			}
			
			$el.bind("complete",function(event,data){
				if(self.options.onComplete){
					self.options.onComplete.call(null,$el,data);
				}
			});
			
			$el.bind("suceess",function(event,data){
				if(self.options.onSuceess){
					self.options.onSuceess.call(null,$el,data);
				}
			});
			
			$el.bind("error",function(event,data){
				if(self.options.onError){
					self.options.onError.call(null,$el,data);
				}
			});
			$el.on("submit",function(){
				self.options.ignoreSubmit = true;
				var v = self.element.valid();
					self.options.ignoreSubmit = false;
				if(!v){
					$(":password",this.element).val("");
					self._validSubmit();
					return false;
				}
				
				$.ajax({
					type:self.options.method,
					url:self.options.action,
					data:$el.serializeArray(),
					cache:false,
					success:function(data, textStatus, jqXHR){
						self._resetSubmitRule();
						$el.trigger("suceess",[data])
					},
					error:function(){
						self._validSubmit();
					}
				});
				return false;
			});
		},
		_initValidata:function(){
			var self = this;
			var validator = this.element.validate({
					onsubmit: false,
					focusInvalid: false,
					focusCleanup: true,
					errorElement: "span",
					ignore:".ignore",
					errorPlacement: function(error, element) {
								var errorTip;
								if(self.options.findErrHolder){
									errorTip = self.options.findErrHolder.call(null,self.element,$(element));
								}else{
									errorTip = defaultFindErrHolder.call(null,self.element,$(element));
								}
								if(errorTip&&errorTip.length>0){
									errorTip.append(error);
								}
					},
					invalidHandler: function(form, validator) {
						var errors = validator.numberOfInvalids();
						//alert(errors);
					}
			});
			
			this.element.find("[ajax],[data-rule-ajax='true']").each(function(){
				var $input = $(this);
					$input.rules("add", {
						ajax:{
							  validator : validator
							}
					});
			});
			
			this.element.find("[phone],[data-rule-phone='true']").each(function(){
				var $input = $(this);
					$input.rules("add", {
						phone:{
							
							}
					});
			});
			
			
			this.element.find("[submit] ,[data-rule-submit='true'] ").each(function(){
				var $input = $(this);
					$input.rules("add", {
						submit:{
							options:self.options
						}
					});
			}).off("focusin focusout keyup").on("focusin focusout keyup",function(){
				validator.element(this);
			});
			this._resetSubmitRule();
			
		},
		validata:function(){
			return this.element.validate;
		},
		_resetSubmitRule:function(){
			this.element.find("[submit],[data-rule-submit='true']").each(function(){
				$(this).data("oldValue",$(this).val());
			});
		},
		_validSubmit:function(){
			var self = this;
			var validator = self.element.data("validator" );
			var result = true;
			this.element.find("[submit],[data-rule-submit='true']").each(function(){
				var r =  validator.element(this);
				if(!r){
					result = false;
				}
			});
			return result;
		}
	});
	
	var defaultFindErrHolder = function($form,$element){
		var errorTip;
		var errRel = $element.attr("errRel");
			if(errRel){
				errorTip = $form.find("#"+errRel);
			}else{
				errorTip = $form.find("#"+$element.attr("name")+"-error");
			}
			
		return errorTip;		
	}
	
	function getFunction($el,name){
		if($el.attr(name)){
			var f =  $el.attr(name);
			try{
				f = eval(f);
				if($.isFunction(f)){
					return f;
				}
			}catch(e){
				
			}
		}
		return;
	}
})(jQuery);

(function($){
	var defaults = {
		callBack:null,
		conform:true
	};
	
	var plugName = "_ajaxButton_";
	
	$.fn.ajaxButton = function(options){
		return this.each(function(){
			var $this = $(this);
			if($this.data(plugName)){
				return true;
			}
			
			var opts = $.extend(true,{},defaults,options);
			var url ;
			if(this.tagName.toUpperCase() == "A"){
				url = $this.attr("href");
			}else{
				url = $this.attr("url");
			}
			var message = $this.attr("title")||"";
			$this.on("click",function(){
				if(opts.conform){
					jgAlertify.confirm(message,function(e){
						if(e){
						    $.post(url,{},function(response){
							  if(opts.callBack){
								  opts.callBack.call($this,$this,response);
								}
							});
						}
					});
				}else{
					$.post(url,{},function(response){
					   if(opts.callBack){
						  opts.callBack.call($this,$this,response);
						}
					});
				}
				
				return false;
			});
			
		});
	}
})(jQuery);


