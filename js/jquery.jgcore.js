/**
 *
 * jg-core
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-4-16
 *
*/
(function($){
	
	$.event_ready 		= "onload";
	$.event_init 		= "_init_";
	
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
			return;
		}
		var es = ehs[eventType];
		if(es&&es.length>0){
			return es.shift();
		}
		return null;
	};
	/**
	  执行时机是所有是插件执行完成后执行
	*/
	$.jgReady=function(fn){
		var eventType = $.event_ready;
		if(!ehs[eventType]||ehs[eventType].length==0){
			return;
		}
		var $dom = ehs[eventType][0];
		$dom.one(eventType,function(event,$dom){
			fn.call(window,$dom);
		});
	}
	
	
	
	$.jgInit=function(fn){
		var eventType = $.event_init;
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
		//默认函数----
		window.onAjaxButtonCallBackInPage = function($button,respons){
				var data = $.parseJSON(respons);
				jgAlertify.alert(data.message,function(){
					if(data.status==200){
						$button.parents(".jg-page-doc:first").jgPage("reload");
					}
				});
		}
		
		window.onFormCallBackInPage = function($form,respons){
				var data = $.parseJSON(respons);
				jgAlertify.alert(data.message,function(){
					if(data.status==200){
						$form.parents(".jg-page-doc:first").jgPage("goBack");
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
			});
		}
		if($.fn.jgTabsButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".tabs-button").jgTabsButton();
			});
		}
		if($.fn.jgAccordion){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".accordion").jgAccordion();
			},$.JgWidgets.g_before);
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
			},$.JgWidgets.g_before);
		}
		if($.fn.jgWindowButton){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".window-button").jgWindowButton();
			});
		}
		
		
		if($.fn.jgLoader){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".loader").jgLoader();
			});
		}
		
		if($.fn.jgSelect){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".select").jgSelect();
			},$.JgWidgets.g_before);
		}
		
		if($.fn.jgCard){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".card").jgCard();
			},$.JgWidgets.g_before);
		}
		
		if($.fn.jgCard){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".card-button").jgCardButton();
			});
		}
		
		//查询form
		$.JgWidgets.addPlugin(function($content){
			var $forms = $content.find(".panel-from")
				$forms.each(function(){
					$(this).on("submit",function(event){
						var $container = $(this).closest(".jg-component");
						if($container.hasClass("jg-page-doc")){
							$container.jgPage("reload",{url:$(this).attr("action"),params:$(this).serializeArray()});
						}else if($container.hasClass("jg-tabs")){
							$container.jgTabs("reloadCurrent",{url:$(this).attr("action"),params:$(this).serializeArray()});
						}
						return false;
					});
				});
		});
		
		if($.fn.jgHchartHelper){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".hchart").jgHchartHelper();
			});
		}
		
	})();
	
	
	(function thPlugins(){
		if($.fn.chosen){
			$.JgWidgets.addPlugin(function($content){
				$content.find(".jg-chosen").chosen();
			},$.JgWidgets.g_before);
		}
	})();
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
})(jQuery)


