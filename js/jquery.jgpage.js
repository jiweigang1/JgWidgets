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
    $.widget("JgWidgets.jgPage", {
        options: {
            url: null,
			
            beforeOpen: null,
            opened: null,
            beforeBack: null,
            backed: null,
			//返回值 true 执行 false中断 string 替换返回的请求
			validate:null,
			//执行动画
			animation:true,
			//自定义高度
			_autoHeight:true
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
        openPage: function (url,params,clearCache,pageNo) {
            var self = this;
            var newPage = true;
			
			if(typeof clearCache==="undefined"){
				clearCache = true;
			}
			
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
                        self._toggle($page,self.opt.activePage,"right",function(){
							if(self.options.opened) {
                                self.options.opened.call(null, $page, this);
                            }
                            $el.trigger("opened", [$page]);
							if($.JgWidgets){
								try{
									$.JgWidgets._initContent($page);
								}catch(e){
								
								}
							}
							$page.trigger("onload",[$page]);
							$page.trigger("onOpen",[$page]);
							self.opt.activePage = $page;
							if(clearCache){
								self._clearCache();
							}
						});
						
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
			$oldPage.load(url,params,function(){
					self.element.trigger("opened",$oldPage);
					if (self.options.opened) {
						self.options.opened.call(null, $oldPage);
						$oldPage.trigger("onload",[$page]);
						$oldPage.trigger("onOpen",[$page]);
					}	
			});
			
		},
		
        goBack: function (reload) {
            var self = this;
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
					self._toggle($oldPage,self.opt.activePage,"left",function(){
							$oldPage.trigger("onload",[$oldPage]);
							$oldPage.trigger("onOpen",[$oldPage]);
							$el.trigger("backed", [$(this).data("pageData")]);
							self.opt.activePage = $oldPage;
					});
				});
            }else{
				self._toggle($oldPage,self.opt.activePage,"left",function(){
							$el.trigger("backed", [$(this).data("pageData")]);
							self.opt.activePage = $oldPage;
				});
			}
			
        },
		
		_toggle:function(toShow,toHide,direction,fn){
			var self = this;
			if(!direction){
				direction="left";
			}
			if(this.options.animation){
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
		
		_ajaxLoad:function($dom,url,params,success){
			var self = this;
			if(!$dom||$dom.length==0){
				return;
			}
			$.ajax({
				 url : url,
                 data: params,
				 cache:false,
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
					if(success&&$.isFunction(success)){
						success.call(null,data)
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
		}
    });
	
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



(function($){
	var plugName = "_jgPageButton_";
	$.fn.jgPageButton = function(){
		return  this.each(function(){
			var $this = $(this);
			if($this.data(plugName)){
				return true;
			}
			
			var action = $this.attr("action");
			if(!action){
				action = "reload";
			}
			
			var params =[];
				params.push(action);
			if(action=="openPage"||action=="reload"){
				var url	;  
				if(this.tagName.toUpperCase() == "A"){
					url = $this.attr("href");
				}else{
					url = $this.attr("url");
				}
				if(!url){
					return true;
				}
				params.push(url);
			}else if(action=="goBack"){
				
			}else{
				return true;
			}
			
			$this.click(function(){
				var target = $this.attr("target");
				var $page;
				if(target){
					$page = $(target);
				}
				if($page.length==0){
					$page = $this.parents(".rum-page-doc:first");
				}
				if($page.length>0){
					$page.jgPage.apply($page,params);
				}
				return false;
			});
		});
	}
})(jQuery)
