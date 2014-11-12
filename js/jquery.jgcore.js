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
		_debug:false,
		_init:false,
		_plugins:[],
		addPlugin :function(fn){
			this._plugins.push(fn);
		},
		_initContent:function(content){
			var $content;
			if(!content){
				$content = $(document);
			}else{
				$content = $(content);
			}
			$.each(this._plugins,function(k,v){
				if($.isFunction(v)){
					v.call(null,$content);
				}else if(typeof v =="object"){
					if(v.doPlugin&&$.isFunction(v.doPlugin)){
						v.doPlugin.call(null,$content);
					}
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
			$.each(this._plugins,function(k,v){
				if(typeof v =="object"){
					if(v.init&&$.isFunction(v.init)){
						v.init();
					}
				}
			});
			this._init = true;
		}
	};
	
	(function defaultPlugins(){
		//add jgPage plugin
		$.JgWidgets.addPlugin(function($content){
			$content.find(".page").jgPage();
			$content.find(".page-button").jgPageButton();
			$content.find(".tabs").jgTabs();
			$content.find(".tabs-button").jgTabsButton();
			$content.find(".accordion").jgAccordion();
		});
	})();
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
})(jQuery)