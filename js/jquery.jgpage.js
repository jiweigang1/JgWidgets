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
            url: null,
			//事件
            beforeOpen: null,
            opened: null,
            beforeBack: null,
            backed: null,
			
			//是否显示等待图标
			showLoading:false,
			//返回值 true 执行 false中断 string 替换返回的请求
			validate:null,
			//执行动画
			animation:true,
			ajaxType:"post",
			//自定义高度
			_autoHeight:true,
			_waitting:false,
        },
        _initOptions: function () {
            var $el = this.element;
            if (!this.options.url) {
                this.options.url = $el.attr("url")
            }
        },
		_fireEvent:function(name,params){
			if(this.options[name]){
				this.options[name].apply(this,params);
			}
			this.element.trigger(name,params);
		},
        _create: function () {
            this.opt={
				historyPage: [],
				activePage: null,
				pageNo: 1,
				overlay: null
			};
			this._initOptions();
			this.element.addClass("jg-page-doc");
			var html = this.element.html();
            this.$pageLoading = $('<div class="page-loading"></div>');
			this.element.append(this.$pageLoading)
			if(html&&$.trim(html)!=""){
				self.addPage(html,this.element.attr("orginPageId"));
			}
			if(this.options.url) {
				this.openPage(this.options.url);
            } 

        },
		_creatPage:function(pageNo){
			var $page = $('<div class="jg-page" pageNo="" ></div>').hide();
			if(pageNo){
				$page.attr("pageNo",pageNo);
			}else{
				$page.attr("pageNo",this.opt.page_no++);
			}
				$page.data("pageData",{pageNo:pageNo});
			return $page;
		},
		addPage:function(html,pageNo){
			var $page = this._createPage(pageNo);
				$page.append(html);
				
		},
        openPage: function (url,params,clearCache,direction,animation,pageNo) {
			if(this.options._waitting){
				return;
			}else{
				this.options._waitting = true;
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
                $page = $('<div class="jg-page" pageNo="' + (this.opt.pageNo++) + '" ></div>').hide();
            } else {
                $page = this.element.find('.jg-page[pageNno=' + pageNo + ']:first');
                if ($page.length == 0) {
                    $page = $('<div class="jg-page" pageNo="' + pageNo + '" ></div>').hide();
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
					    if (self.opt.activePage) {
                            self._addHistory(self.opt.activePage);
                        }
						$page.css("opacity",0).show();
						if($.JgWidgets){
							try{
								$.JgWidgets._initContent($page,$.JgWidgets.g_befor);
							}catch(e){
							
							}
						}
						$page.hide().css("opacity",1);
                        self._toggle($page,self.opt.activePage,direction,function(){
							if(clearCache){
								self._clearCache();
							}
							if(self.options.opened) {
                                self.options.opened.call(null, $page, this);
                            }
                            $el.trigger("opened", [$page]);
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($page,$.JgWidgets.g_after);
								}catch(e){
								
								}
							}
							$page.trigger("onload",[$page]);
							$page.trigger("onOpen",[$page]);
							self.opt.activePage = $page;
							
							self.options._waitting = false;
						},animation);
						
			});
            $page.data("pageData", pageData);
        },
		reload:function(url,params){
			var self = this;
			var $oldPage =  this.opt.activePage;
			if(!$oldPage||$oldPage.length==0){
				return;
			}
			var pageData = $oldPage.data("pageData");
			if(!url){
				url = pageData.url;
			}
			this._ajaxLoad($oldPage,url,params,function(){
					self.element.trigger("opened",$oldPage);
					if (self.options.opened) {
						self.options.opened.call(null, $oldPage);
					}
					if($.JgWidgets){
						try{
							$.JgWidgets._initContent($oldPage);
						}catch(e){
						
						}
					}
					$oldPage.trigger("onload",[$oldPage]);
					$oldPage.trigger("onOpen",[$oldPage]);
			});
			
		},
		
        goBack: function (reload,remove) {
            var self = this;
			reload 	= toBoolean(reload,false);
			remove	= toBoolean(remove,true);
			var $oldPage = this.opt.historyPage.pop();
			if(!$oldPage||$oldPage.length==0){
				return;
			}
            var $el = this.element;
            if (self.options.beforeBack) {
                self.options.beforeBack.call(null, this.opt.activePage, this);
            }
            $el.trigger("beforeBack");
            if(reload){
            	var pageData = $oldPage.data("pageData");
				this._ajaxLoad($oldPage,pageData.url,pageData.params,function(){
					self._toggle($oldPage,self.opt.activePage,"right",function(){
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($oldPage);
								}catch(e){
								
								}
							}
							$oldPage.trigger("onload",[$oldPage]);
							$oldPage.trigger("onOpen",[$oldPage]);
							$el.trigger("backed", [$(this).data("pageData")]);
							if(remove){
								self.opt.activePage.remove();
							}
							
							self.opt.activePage = $oldPage;
					});
				});
            }else{
				self._toggle($oldPage,self.opt.activePage,"right",function(){
							$el.trigger("backed", [$(this).data("pageData")]);
							if(remove){
								self.opt.activePage.remove();
							}
							self.opt.activePage = $oldPage;
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
			if(this.options.animation&&animation){
				if(toHide&&toHide.length>0){
					toHide.addClass("animation").css("position","absolute").hide("slide",{direction: direction=='left'?'left':'right'},500,function(){
						toHide.css("position","");
						toHide.removeClass("animation");
					});
				}
				if(toShow&&toShow.length>0){
					toShow.addClass("animation").css("position","absolute").show("slide",{direction: direction=='left'?'right':'left'},500,function(){
						toShow.css("position","");
						toShow.removeClass("animation");
						if(self.options._autoHeight){
							self.element.css("height","auto");
						}	
						fn.call(self);
					});
				}
				if(this.options._autoHeight){
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
		_ajaxLoad:function($dom,url,params,success){
			var self = this;
			if(!$dom||$dom.length==0){
				return;
			}
			self._showLoading();
			$.ajax({
				 url : url,
                 data: params,
				 cache:false,
				 type:self.options.ajaxType,
				 success:function(data){
					if(self.options.validate&&$.isFunction(self.options.validate)){
						var v = self.options.validate.call(null,data);
						if(typeof v =="boolean"){
							if(!v){
								return;
							}
						}else if(typeof v=="string"){
							data = v;	
						}
					}
					$.jgPage[PAGE_HOLDER]=$dom;
					if($.addEventHolder){
						$.addEventHolder("onload",$dom);
					}
					$dom.empty().append(data);
					$.jgPage[PAGE_HOLDER]=null;
					if($.removeEventHolder){
						$.removeEventHolder("onload");
					}
					self._hideLoading();
					if(success&&$.isFunction(success)){
						success.call(null,data)
					}
				 },
				 //请求失败
				 error:function(){
					if(success&&$.isFunction(success)){
						success.call(null,"")
					}
				 }
			});
		},
        _addHistory: function ($page) {
            this.opt.historyPage.push($page);
        },
		//清空缓存
		_clearCache:function(){
			if(this.opt.historyPage&&this.opt.historyPage.length>0){
				$.each(this.opt.historyPage,function(k,v){
					$(v).remove();
				});
				this.opt.historyPage = [];
			}
		},
		_showLoading:function(){
			if(!this.options.showLoading){
				return;
			}
			var x =	this.element.width()/2-this.$pageLoading.width()/2
			var y = this.element.height()/2-this.$pageLoading.height()/2
			this.$pageLoading.css({x:x,y:y}).show();
		},
		_hideLoading:function(){
			this.$pageLoading.hide();
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
	
	
	
})(jQuery);

(function ($) {
    $.widget("JgWidgets.jgPageButton", {
        options: {
           
        },
		_create:function(){
			var $this = this.element;
			$this.click(function(){
				var action = $this.attr("action");
				if(!action){
					action = "reload";
				}
				var params =[];
					params.push(action);
				if(action=="openPage"){
					//(url,params,clearCache,pageNo)
					var url	;  
					if($this[0].tagName.toUpperCase() == "A"){
						url = $this.attr("href");
					}else{
						url = $this.attr("url");
					}
					if(!url){
						return true;
					}
					params.push(url);
					params.push({});
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
		}
	})
})(jQuery);	


