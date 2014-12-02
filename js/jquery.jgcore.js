(function($){
	var ehs = {};
	$.addEventHolder=function(eventType,$dom){
		var es = ehs[eventType];
		if(!es){
			es = [];
			ehs[eventType]=es;
		}
		es.push($dom);
	};
	$.removeEventHolder=function(eventType){
		if(!eventType){
			eventType = "onload"
		}
		var es = ehs[eventType];
		if(es&&es.length>0){
			return es.shift();
		}
		return null;
	};
	$.jgReady=function(fn){
		var eventType = "onload";
		if(!ehs[eventType]||ehs[eventType].length==0){
			return;
		}
		var $dom = ehs[eventType][0];
		$dom.one(eventType,function(event,$dom){
			fn.call(window,$dom);
		});
	}
	
	
	
////////////////////////////////////
$.JgWidgets = {
		g_before:1,
		g_after:2,
		
		_debug:false,
		_init:false,
		_plugins:[], //{fn:fn,group:group}
		addPlugin :function(fn,group){
			if(!group){
				group = this.g_after;
			}
			this._plugins.push({fn:fn,group:group});
		},
		_initContent:function(content,group){
			var $content;
			if(!content){
				$content = $(document);
			}else{
				$content = $(content);
			}
			$.each(this._plugins,function(k,v){
				if(group&&group!==v.group){
					return true;
				}
				if($.isFunction(v.fn)){
					v.fn.call(null,$content);
				}
			});
		},
		init:function(){
			this._initPlugins();
			this._initContent(document);
			
		},
		_initPlugins:function(){
			if(this._init){
				return;
			}
			/**
			$.each(this._plugins,function(k,v){
				if(typeof v =="object"){
					if(v.init&&$.isFunction(v.init)){
						v.init();
					}
				}
			});
			**/
			this._init = true;
		}
	};
	
	(function(){
		//Ä¬ÈÏº¯Êý----
		window.onAjaxButtonCallBackInPage = function($button,respons){
				var data = $.parseJSON(respons);
				jgAlertify.alert(data.message,function(){
					if(data.status==200){
						$button.parents(".jg-page-doc:first").jgPage("reload");
					}
				});
		}
	//---
	})();
	
	(function defaultPlugins(){
		//add jgPage plugin
		if($.fn.jgPage){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".page").jgPage();
			});
		}
		if($.fn.jgPageButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".page-button").jgPageButton();
			});
		}
		if($.fn.jgTabs){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".tabs").jgTabs();
			},$.JgWidgets.g_after);
		}
		if($.fn.jgTabsButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".tabs-button").jgTabsButton();
			});
		}
		if($.fn.jgAccordion){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".accordion").jgAccordion();
			});
		}
		
		if($.fn.jgForm){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".form").jgForm();
			});
		}
		
		if($.fn.ajaxButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".ajax-button").ajaxButton({callBack:onAjaxButtonCallBackInPage});
			});
		}
		if($.fn.jgTable){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".table").jgTable();
			});
		}
		if($.fn.jgWindowButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".window-button").jgWindowButton();
			});
		}
		
	})();
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
})(jQuery)


