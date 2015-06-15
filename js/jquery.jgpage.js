/**
 *
 * jg-page
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2014-10-31
 *
*/
(function ($) {
    $.widget("jgWidgets.jgPage", {
        options: {
            url					: null,
			autoShowBackButton	: true,
			//事件
            beforeOpen			: null,
            onOpen				: null,
            beforeBack			: null,
            onBack				: null,
			
			//是否显示等待图标
			showLoading		:false,
			//执行动画
			animation		:true,
			ajaxType		:"post",
			loaddingTimeout	:600,
			toggleTime		:500
        },
        _initOptions: function () {
			this.options.url  		 	= getValue(this.element,"url"		  			,this.options.url);
			this.options.beforeOpen  	= getValue(this.element,"beforeOpen" 			,this.options.beforeOpen	,"function");
			this.options.onOpen  	 	= getValue(this.element,"onOpen"	  			,this.options.onOpen	 	,"function");
			this.options.beforeBack  	= getValue(this.element,"beforeBack" 			,this.options.beforeBack	,"function");
			this.options.onBack 	 	= getValue(this.element,"onBack"	  			,this.options.onBack	 	,"function");
			this.options.showLoading 	= getValue(this.element,"showLoading"			,this.options.showLoading	,"boolean");
			this.options.animation	 	= getValue(this.element,"animation"  			,this.options.animation		,"boolean");
			this.options.ajaxType	 	= getValue(this.element,"ajaxType"   			,this.options.ajaxType);
			this.options.loaddingTimeout= getValue(this.element,"loaddingTimeout"   	,this.options.loaddingTimeout,"int");
			this.options.toggleTime		= getValue(this.element,"toggleTime"   			,this.options.toggleTime	 ,"int");
			
		},
		_fireEvent:function(name,params){
			if(this.options[name]){
				this.options[name].apply(this,params);
			}
			this.element.trigger(name,params);
		},
		enableAutoShowBackButton:function(){
			var self = this;
			this.element.off("click.jg-page-auto-show-back-button").on("click.jg-page-auto-show-back-button",".jg-page-back-button",function(){
				var $this = $(this);
				var reload = false;
				if($this.attr("reload")=="true"){
						reload = true;
				}
				self.goBack(reload);
			});
		},
        _create: function () {
			var self = this;
            this._settings={
				historyPage	: [],
				activePage	: null,
				pageNo		: 1,
				overlay		: null,
				$pageLoading: null,
				//自定义高度
				autoHeight	:true,
				waitting	:false
			};
			this._initOptions();
			this.element.addClass("jg-page-doc	jg-component");
			var html = this.element.html();
			if(this.options.autoShowBackButton){
				this.enableAutoShowBackButton();
			}
			if(html&&$.trim(html)!=""){
				self.addPage({
								html:this.element.contents(),
								pageNo:this.element.attr("orginPageId"),
								animation:false,
								clearCache:true
							});
			}
			if(this.options.url) {
				this.openPage(this.options.url);
            } 

        },
		_createPage:function(pageNo){
			var $page = $('<div class="jg-page jg-box" pageNo="" ></div>').hide();
			if(pageNo){
				$page.attr("pageNo",pageNo);
			}else{
				$page.attr("pageNo",this._settings.pageNo++);
			}
				$page.data("pageData",{pageNo:pageNo});
			return $page;
		},
		addPage:function(html,clearCache,direction,animation,pageNo){
			if(arguments.length==1&&typeof arguments[0]==="object" ){
				clearCache	= arguments[0].clearCache;
				direction	= arguments[0].direction;
				animation	= arguments[0].animation;
				pageNo		= arguments[0].pageNo;
				html 		= arguments[0].html;
			}
				clearCache = toBoolean(clearCache,true);
				animation  = toBoolean(animation,true);
			if(!direction||(direction!=="left"&&direction!=="right")){
				direction = "left";
			}
			
		
			var self  = this;
			var $page = this._createPage(pageNo);
				this.element.append($page);
				$page.append(html);
				if (self._settings.activePage) {
                    self._addHistory(self._settings.activePage);
                }
				
				self._toggle($page,self._settings.activePage,"right",function(){
					if(clearCache){
						self._clearCache();
					}
					self._settings.activePage = $page;
				},animation);
				
				
				
				
		},
		_addBackButton:function($page){
			if(this._settings.historyPage.length>0){
				$page.append('<div class="jg-page-back-button">返回</div>');
			}
		},
        openPage: function (url,params,clearCache,direction,animation,pageNo) {
			if(arguments.length==1&&typeof arguments[0]==="object" ){
				params		= arguments[0].params;
				clearCache	= arguments[0].clearCache;
				direction	= arguments[0].direction;
				animation	= arguments[0].animation;
				pageNo		= arguments[0].pageNo;
				url 		= arguments[0].url;
			}
		
			if(this._settings.waitting){
				return;
			}else{
				this._settings.waitting = true;
			}
            var self 	   = this;
				clearCache = toBoolean(clearCache,true);
				animation  = toBoolean(animation,true);
			if(!direction||(direction!=="left"&&direction!=="right")){
				direction = "left";
			}
			
			
			var newPage    = true;
            var $page;
            if (!pageNo) {
                $page = this._createPage();
            } else {
                $page = this.element.find('.jg-page[pageNo=' + pageNo + ']:first');
                if ($page.length == 0) {
                    $page = this._createPage(pageNo);
                } else {
                    newPage = false;
                    $page.empty();
                }
            }
	
			this.element.append($page);
            var pageData = {url: url, params: params, pageNo: pageNo};
            $page.data("pageData",pageData);	
            var $el = this.element;
            if (self.options.beforeOpen) {
                self.options.beforeOpen.call(null, $page, this);
            }
            $el.trigger("beforeOpen", pageData);
            if (!params) {
                params = {};
            }
			this._ajaxLoad($page,url,params,function(){
					    if (self._settings.activePage) {
                            self._addHistory(self._settings.activePage);
                        }
						$page.css("opacity",0).show();
						if($.JgWidgets){
							try{
								$.JgWidgets._initContent($page,$.JgWidgets.g_before);
							}catch(e){
								if(console){
									console.log(e);
								}
							}
						}
						$page.hide().css("opacity",1);
                        self._toggle($page,self._settings.activePage,direction,function(){
							if(clearCache){
								self._clearCache();
							}
							if(self.options.onOpen) {
                                self.options.onOpen.call(null, $page, this);
                            }
                            $el.trigger("onOpen", [$page]);
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($page,$.JgWidgets.g_after);
								}catch(e){
									if(console){
										console.log(e);
									}
								}
							}
							try{
								$page.trigger("onload",[$page]);
							}catch(e){
								if(console){
									console.log(e);
								}
							}
							
							try{
								$page.trigger("onOpen",[$page]);
							}catch(e){
								if(console){
									console.log(e);
								}
							}
							self._settings.activePage = $page;
							self._settings.waitting   = false;
							if(self.options.autoShowBackButton){
								self._addBackButton($page);
							}
						},animation);
						
			});
            $page.data("pageData", pageData);
        },
		reload:function(url,params){
			if(arguments.length==1&&typeof arguments[0]==="object" ){
				params		= arguments[0].params;
				url 		= arguments[0].url;
			}
			
			
			
			var self = this;
			var $oldPage =  this._settings.activePage;
			if(!$oldPage||$oldPage.length==0){
				return;
			}
			var pageData = $oldPage.data("pageData");
			if(!url){
				url = pageData.url;
			}
			//this._showLoading(true);
			this._ajaxLoad($oldPage,url,params,function(){
					//self._hideLoading();
					self.element.trigger("onOpen",$oldPage);
					if (self.options.onOpen) {
						self.options.onOpen.call(null, $oldPage);
					}
					if($.JgWidgets){
						try{
							$.JgWidgets._initContent($oldPage);
						}catch(e){
							if(console){
									console.log(e);
							}
						}
					}
					$oldPage.trigger("onload",[$oldPage]);
					$oldPage.trigger("onOpen",[$oldPage]);
					if(self.options.autoShowBackButton){
						self._addBackButton($oldPage);
					}
			},true);
			
		},
		
        goBack: function (reload,remove) {
			if(arguments.length==1&&typeof arguments[0]==="object" ){
				reload		= arguments[0].reload;
				remove 		= arguments[0].remove;
			}
		
            var self = this;
			reload 	= toBoolean(reload,false);
			remove	= toBoolean(remove,true);
			var $oldPage = this._settings.historyPage.pop();
			if(!$oldPage||$oldPage.length==0){
				return;
			}
            var $el = this.element;
            if (self.options.beforeBack) {
                try{
				  self.options.beforeBack.call(null, this._settings.activePage, this);
				}catch(e){
					if(console){
						console.log(e);
					}
				}
			}
			try{
				 $el.trigger("beforeBack");
			}catch(e){
				if(console){
					console.log(e);
				}
			}
			
            if(self._settings.activePage){
				try{
				 self._settings.activePage.trigger("beforeClose",[self._settings.activePage.data("pageData")]);
				}catch(e){
					if(console){
						console.log(e);
					}
				}
			}
            
			if(reload){
            	var pageData = $oldPage.data("pageData");
				this._ajaxLoad($oldPage,pageData.url,pageData.params,function(){
					self._toggle($oldPage,self._settings.activePage,"right",function(){
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($oldPage);
								}catch(e){
									if(console){
										console.log(e);
									}
								}
							}
							$oldPage.trigger("onload",[$oldPage]);
							$oldPage.trigger("onOpen",[$oldPage]);
							$el.trigger("onBack", [$(this).data("pageData")]);
							if(remove){
								self._settings.activePage.remove();
							}
							
							self._settings.activePage = $oldPage;
					});
				});
            }else{
				self._toggle($oldPage,self._settings.activePage,"right",function(){
							$el.trigger("onBack", [$(this).data("pageData")]);
							if(remove){
								self._settings.activePage.remove();
							}
							self._settings.activePage = $oldPage;
				});
			}
			
        },
		
		_toggle:function(toShow,toHide,direction,fn,animation){
			var self = this;
			if(!direction){
				direction="left";
			}
			if(!toHide||toHide.length==0){
				direction="right";
			}
			if(typeof animation =="undefined"){
				animation = true;
			}
			var ewidth = this.element.width();
			if(this.options.animation&&animation){
				fn.__time = 1;
				var count = toHide==null?1:2;
				var fnWrapper = function(){
					if(fn.__time<count){
						fn.__time++;
						return;
					}
					delete fn.__time;
					fn.call(self);
				}
				if(toHide&&toHide.length>0){
					toHide.addClass("animation").css({"position":"absolute"});
					var method = "animate";
					if($.fn.velocity){
						method = "velocity";	
					}
					toHide[method].call(toHide,{left:direction=='left'?-ewidth:ewidth},this.options.toggleTime,function(){
						toHide.hide().css("position","").removeClass("animation");
						fnWrapper();
					});
				}
				if(toShow&&toShow.length>0){
					toShow.addClass("animation").css({"position":"absolute","left":direction=='left'?ewidth:-ewidth}).show();
					var method = "animate";
					if($.fn.velocity){
						method = "velocity";	
					}
					toShow[method].call(toShow,{left:0},this.options.toggleTime,function(){
						toShow.css("position","").removeClass("animation");
						if(self._settings.autoHeight){
							self.element.css("height","auto");
						}	
						fnWrapper();
					});
				}
				if(this._settings.autoHeight){
					this.element.height(Math.max((toHide&&toHide.length>0)?toHide.height():0,toShow.height()));
				}
				
			}else{
				if(toHide&&toHide.length>0){
					toHide.hide();
				}
				if(toShow&&toShow.length>0){
					toShow.show();
				}
				
				fn.call(this);
			}
		},
		/*
			success(data,success);
		**/
		_ajaxLoad:function($dom,url,params,success,forceLoading){
			var self = this;
			if(!$dom||$dom.length==0){
				return;
			}
			self._showLoading(forceLoading);
			$.ajax({
				 url : url,
                 data: params,
				 cache:false,
				 type:self.options.ajaxType,
				 dataType:"text",
				 globalRequest:true,
				 success:function(data){
					$.jgPage[PAGE_HOLDER]=$dom;
					
					if($.addEventHolder){
						$.addEventHolder($.event_init,$dom);
						$.addEventHolder($.event_ready,$dom);
					}
					
					self._hideLoading();
					$dom.empty().append(data);
					$.jgPage[PAGE_HOLDER]=null;
					
					
					if($.removeEventHolder){
						$.removeEventHolder($.event_init,$dom);
						$.removeEventHolder($.event_ready,$dom);
					}
					
					$dom.trigger("onOpen",[$dom]);
					
					if(success&&$.isFunction(success)){
						success.call(null,data)
					}
				 },
				 //请求失败
				 error:function(){
					self._hideLoading();
					if(success&&$.isFunction(success)){
						success.call(null,"")
					}
				 }
			});
		},
        _addHistory: function ($page) {
            this._settings.historyPage.push($page);
        },
		//清空缓存
		_clearCache:function(){
			if(this._settings.historyPage&&this._settings.historyPage.length>0){
				$.each(this._settings.historyPage,function(k,v){
					$(v).remove();
				});
				this._settings.historyPage = [];
			}
		},
		_showLoading:function(forceLoading){
			var self = this;
			if(!this.options.showLoading){
				return;
			}
			if(typeof forceLoading==="undefined"){
				forceLoading = false;
			}
			if(!this._settings.$pageLoading||this._settings.$pageLoading.length==0){
				this._settings.$pageLoading = $('<div class="jg-page-loading"></div>');
				$("body").append(this._settings.$pageLoading);
			}
			
			this._settings.loadingTime = setTimeout(function(){
				var x =	$(window).width()/2-self._settings.$pageLoading.width()/2
				var y = $(window).height()/2-self._settings.$pageLoading.height()/2
				self._settings.$pageLoading.css({left:x,top:y}).show();
			},forceLoading?0:this.options.loaddingTimeout);
			
		},
		_hideLoading:function(){
			clearTimeout(this._settings.loadingTime);
			if(this._settings.$pageLoading&&this._settings.$pageLoading.length>0){
				this._settings.$pageLoading.hide();
			}
		},
		_destroy:function(){
			clearTimeout(this._settings.loadingTime);
			if(this._settings.$pageLoading&&this._settings.$pageLoading.length>0){
				this._settings.$pageLoading.remove();
			}
		}
    });
	
	function toBoolean(value,dv){
		if(typeof value =="string"){
			if("true"===value){
				return true;
			}else if("false"===value){
				return false;
			}
		}else if(typeof value==="boolean"){
			return value;
		}
		return dv||false;
	}
	
	/**
		注册加载的事件，作用域是当前的Page
	*/
	var PAGE_HOLDER = "page_holder";
	$.jgPage = function(event,fn){
		if(!$.jgPage[PAGE_HOLDER]||!fn||!$.isFunction(fn)){
			return;
		}
		if(event!=="onOpen"){
			return;
		}
		$.jgPage[PAGE_HOLDER].one(event,function(event,$page){
			fn.call(window,$page);
		});
	}
	
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
	
})(jQuery);

(function ($) {
    $.widget("jgWidgets.jgPageButton", {
        options: {
           
        },
		_create:function(){
			var self 	   = this;
			this._settings = {};
		
			var $this = this.element;
			$this.click(function(e,eparam){
				if(!eparam){
					eparam = {};
				}
				var action = $this.attr("action");
				if(!action){
					action = "reload";
				}
				var params =[];
					params.push(action);
				if(action=="openPage"){
					var url	; 
					if(eparam.url){
						url = eparam.url;
					}else if($this[0].tagName.toUpperCase() == "A"){
						url = $this.attr("href");
					}else{
						url = $this.attr("url");
					}
					if(!url){
						return true;
					}
					params.push(url);
					var ps = serializeArrayObject(eparam.params||{});
					
					params.push($.merge(self._getForms().serializeArray(),ps));
					
					
					var clearCache = true;
					if($this.attr("clearCache")=="false"){
						clearCache = false;
					}
					params.push(clearCache);
					params.push($this.attr("direction"));
					params.push($this.attr("animation"));
					params.push($this.attr("pageNo"));
					
				}else if(action=="reload"){
					
				}else if(action=="goBack"){
					var reload = false;
					if($this.attr("reload")=="true"){
						reload = true;
					}
					params.push(reload);
				}else{
					return false;
				}
				var $page = $($this.attr("target"));
				if($page.length==0){
					$page = $this.parents(".jg-page-doc:first");
				}
				if($page.length>0){
					$page.jgPage.apply($page,params);
				}
				return false;
			});
		},
		_getForms:function(){
			var self = this;
				/*
				[
					elements:""
					forms:""
					closest:""
					group:""
				]
				*/
				
				if(!this._settings.forms){
					this._settings.forms = [];
					$.each(this.element[0].attributes,function(){
						if(this.specified && this.name.indexOf("form")==0){
							var form = {group:"____"};
							var g = this.name.split("-");
							if(g[1]){
								form.group = g[1];
							}
							form.forms = this.value;
							if(form.forms){
								form.forms = form.forms.split(/\s+/);
							}
							if(form.forms.length>0){
								self._settings.forms.push(form);
							}
						}
						
					});
					$.each(this.element[0].attributes,function(name,value){
						
						if(this.specified && this.name.indexOf("closest")==0){
							var g = this.name.split("-");
							if(g[1]){
							  var form = self._getFromByGroup(g[1]);
							  if(form&&this.value){
								 form.closest = this.value;
							  }
							}
						}
					});
					
					$.each(this._settings.forms,function(index,form){
						var $c	 = $(document);
						if(form.closest){
							var $cl = self.element.closest(form.closest);
							if($cl.length>0){
								$c = $cl;
							}
						}
						form.elements =	$(form.forms.join(),$c);	
												
					});
					
				}
				var $r = $([]);
				for(var i=0;i<this._settings.forms.length;i++){
					
					$r = $r.add(this._settings.forms[i].elements);
					//alert($r.length);
				}
				return $r;
				
			}	
	});
	
	function serializeArrayObject(obj){
		var data =[];
		$.each(obj,function(i,v){
			 	if($.isArray(v)){
					$.each(v,function(ii,vv){
							data.push({name:i,value:vv});
					});
				}else{
					data.push({name:i,value:v});
				}
		});
		return data;
	}
})(jQuery);	


