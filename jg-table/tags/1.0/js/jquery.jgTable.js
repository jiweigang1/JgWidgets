/*!
 * jg-Table
 *
 * Licensed under MIT
 * Apache Licence 2.0
 *
 * Version : 1.0
 *
 */

(function ($) {

  $.fn.jgTable = function (options) {
        return this.each(function () {
		  var settings = $.extend({}, defaults, options);		
          var $this = $(this);
			  settings.autoRefreshData = $this.attr("autoRefreshData")=="true";
			  if(!settings.url){
				 settings.url = $this.attr("url");
			  }
		  if (!$this.data("JgTable")) {
              $this.data("JgTable",new JgTable(settings,$this));
          }
        });
 };
    var defaults = {	
	  boxWidth		   :'100%',		
	  boxHeight		   :"100%",	
      width:           '100%',
      height:          '100%',
      borderCollapse:  true,
      fixedColumns:    0,
      fixedColumn:     false, 
      sortable:        false,
      autoShow:        true, 
      footer:          false, 
      cloneHeadToFoot: false, 
      autoResize:      false, 
      create:          null, 
	  autoRefreshData :false	
	  
	};

	var JgTable 		 = function(settings,$table){
		this._settings	 = settings;
		this._$this		 = $table;
		this._$boxParent = $table.parent();
		this._originClass=$table[0].className;
		this._init();
	}
	$.extend(JgTable.prototype,{
      _init:function(){
		this._initWH();
		this._initTableWidth();
		this._initHtml();
		this._initScroll();
		this._initResize();
		this._initDrop();
		if(this._settings.autoRefreshData){
			this._refreshDataByAjax({});
		}
	  },
	  _initTableWidth:function(){
			var self = this;
			var $ths = this._$this.find("thead>tr:first>*");
			$ths.each(function(){
				$(this).width(self._settings._width/$ths.length);
			});
			var $fths = this._$this.find("tfoot>tr:first>*");
			$fths.each(function(){
				$(this).width(self._settings._width/$ths.length);
			});
	  },
	  _initWH:function(){
		var bw = this._settings.boxWidth+"";
		if(bw.indexOf("%")>-1){
		    bw = bw.substring(0,bw.indexOf("%"));
			try{
				bw =  parseInt(bw)/100*this._$this.parent().innerWidth();
			}catch(e){
				bw = this._$this.parent().innerWidth();
			}		
		}else if(bw.indexOf("px")){
			bw = bw.substring(0,bw.indexOf("px"));
			try{
				bw =  parseInt(bw);
			}catch(e){
				bw = this._$this.parent().innerWidth();
			}
		}else{
			try{
				bw =  parseInt(bw);
			}catch(e){
				bw = this._$this.parent().innerWidth();
			}
		}
		
		var bh = this._settings.boxHeight+"";
		if(bh.indexOf("%")>-1){
		    bh = bh.substring(0,bh.indexOf("%"));
			try{
				bh =  parseInt(bh)/100*this._$this.parent().height();
			}catch(e){
				bh = this._$this.parent().height();
			}		
		}else if(bh.indexOf("px")){
			bh = bh.substring(0,bh.indexOf("px"));
			try{
				bh =  parseInt(bh);
			}catch(e){
				bh = this._$this.parent().height();
			}
		}else{
			try{
				bh =  parseInt(bh);
			}catch(e){
				bh = this._$this.parent().height();
			}
		}
		
		var h = this._settings.height+"";
		if(h.indexOf("%")>-1){
		    h = h.substring(0,h.indexOf("%"));
			try{
				h =  parseInt(h)/100*this._$this.parent().width();
			}catch(e){
				h = this._$this.parent().width();
			}		
		}else if(h.indexOf("px")){
			h = h.substring(0,h.indexOf("px"));
			try{
				h =  parseInt(h);
			}catch(e){
				h = this._$this.parent().width();
			}
		}else{
			try{
				h =  parseInt(h);
			}catch(e){
				h = this._$this.parent().width();
			}
		}
		
		
		var w = this._settings.width+"";
		if(w.indexOf("%")>-1){
		    w = w.substring(0,w.indexOf("%"));
			try{
				w =  parseInt(w)/100*this._$this.parent().width();
			}catch(e){
				w = this._$this.parent().width();
			}		
		}else if(w.indexOf("px")>-1){
			w = w.substring(0,w.indexOf("px"));
			try{
				w =  parseInt(w);
			}catch(e){
				w = this._$this.parent().width();
			}
		}else{
			try{
				w =  parseInt(w);
			}catch(e){
				w = this._$this.parent().width();
			}
		}
		
		this._settings._width 		= w;
		this._settings._boxWidth	= Math.min(bw,w); 
		
		this._settings._height 		= h;
		this._settings._boxHeight	= Math.min(bh,h); 
	  }, 
	  _initHtml:function(){
		this._$this.find("thead tr:first>*").each(function(){
			$(this).wrapInner('<div class="jg-table-cell" ></div>');
		});
		this._$this.find("tfoot tr:first>*").each(function(){
			$(this).wrapInner('<div class="jg-table-cell" ></div>');
		});
	  
		this._$box = $(
						'<div class="jg-table-wrapper" >\
							<div class="resize-mark" ></div>\
							<div class="jg-table-thead-container" >\
								<div class="col-move-top" ></div>\
								<div class="col-move-bottom"></div>\
								<table class="jg-table-thead jg-table"></table>\
							</div>\
							<div class="jg-table-tbody-container jg-table" >\
							</div>\
							<div class="jg-table-tfoot-container" >\
								<table class="jg-table-tfoot jg-table"></table>\
							</div>\
						</div>'
					);
		this._$this.before(this._$box);
		this._$tbodyTableContainer=$(".jg-table-tbody-container",this._$box).append(this._$this);
		
		this._$theadTable = $(".jg-table-thead-container > table",this._$box).addClass(this._originClass);	
		this._$tbodyTable = $(".jg-table-tbody-container > table",this._$box).addClass(this._originClass);
		this._$tfootTable = $(".jg-table-tfoot-container > table",this._$box).addClass(this._originClass);	
		this._$resizeMark = $(".resize-mark",this._$box); 	
			
		this._$theadTableContainer=$(".jg-table-thead-container",this._$box);	
		this._$tbodyTableContainer=$(".jg-table-tbody-container",this._$box);
		this._$tfootTableContainer=$(".jg-table-tfoot-container",this._$box);			
		
		this._$colMoveTop 	 = $(".col-move-top",	 this._$box);
		this._$colMoveBottom = $(".col-move-bottom", this._$box);
		
		
		this._$theadTable.append(this._$this.find("thead").clone()).css({"width":this._settings._width});
		this._$tbodyTable.addClass("jg-table").css({"width":this._settings._width});
		this._$tfootTable.append(this._$this.find("tfoot").length>0?this._$this.find("tfoot"):this._$this.find("thead").clone()).css({"width":this._settings._width});
		
	
		this._$box.css({width:this._settings._boxWidth,height:this._settings._boxHeight==this._$boxParent.height()?"100%":this._settings._boxHeight});
		this._$tbodyTable.css({"margin-top":-this._$theadTableContainer.outerHeight(true)});
		this._$tbodyTableContainer.css({"height":this._settings._boxHeight-this._$theadTableContainer.outerHeight(true)-this._$tfootTableContainer.outerHeight(true),"overflow":"hidden"});
		
		this._$colMoveBottom.css({top:this._$theadTableContainer.height()-this._$colMoveBottom.outerHeight(true)});	
	
	  },
	  _initScroll:function(){
		var self = this;
		this._$tbodyTableContainer.perfectScrollbar({
														wheelPropagation:true,
														wheelSpeed:10,
														autoPreventEvent:false
													});
		this._$tbodyTableContainer.on("scroll",function(){
			self._$theadTableContainer.scrollLeft($(this).scrollLeft());
			self._$tfootTableContainer.scrollLeft($(this).scrollLeft());
		});
	  },
	  _initResize:function(){
			var self = this;
			self._$resizeMark.on("dragstart",function(e){
				self._$resizeMark.css({opacity:1});
				var  t = self._$resizeMark.clone().addClass("protx").appendTo(self._$box);	 
					 t.data("th"	  ,self._$resizeMark.data("th"))
					 t.data("oldPageX",e.pageX);
				self._$resizeMark.hide();
				return t;
			});
			self._$resizeMark.on("drag",function(e,t){
				$(t.proxy).css({left:e.pageX-self._$box.offset().left});
			});
			self._$resizeMark.on("dragend",function(e,t){
				self._addThWidth($(t.proxy).data("th"),e.pageX-$(t.proxy).data("oldPageX"));
				$(t.proxy).remove();
			});
			
		this._$theadTable.find("tr:first>th").each(function(){
			var $this = $(this);
			$(this).on("mousemove",function(e){
				if($(this).offset().left + $(this).outerWidth(true) - e.pageX < 5){
					self._$resizeMark.data("th",$(this));
					self._$resizeMark.css({height:self._$box.height(),left:e.pageX-self._$box.offset().left,opacity:0}).show();
					$(this).css({"cursor":"move"});
				}else{
					$(this).css({"cursor":"default"});
				}
			});
		});
	  },
	  _initDrop:function(){
		var self  = this;
		this._$theadTable.find("tr:first>th div").each(function(){
			$(this).on("dragstart",function(){
				var $p = $("<span></span>").append($(this).html()).appendTo(self._$theadTableContainer).css({position:"absolute",width:"auto",height:$(this).height(),left:0,top:0}).addClass("switch");
				self._$theadTableContainer.append($p);
				return $p;
			});
			var t1 = -1;
			$(this).on("drag",function(e,t){
				$(t.proxy).css({left:e.pageX-self._$theadTableContainer.offset().left,top:e.pageY-self._$theadTableContainer.offset().top+20,"z-index":1});	
				var $drop = $(t.drop)
				if($drop.length==0){
					return;
				}
				if(t1>0){
					clearTimeout(t1);
				}
				t1 = setTimeout(function(){
					var $th 	= $drop.parent();
					var sleft	= $th.offset().left - self._$theadTableContainer.offset().left;
					var eleft	= sleft+$th.outerWidth(true);
					var em		= e.pageX - self._$theadTableContainer.offset().left;
					if(em<=(sleft+eleft)/2){
						t._right = false;
						self._$colMoveTop.css({left:sleft-self._$colMoveTop.outerWidth(true)/2}).show();
						self._$colMoveBottom.css({left:sleft-self._$colMoveBottom.outerWidth(true)/2}).show();
					}else{
						t._right = true;
						self._$colMoveTop.css({left:eleft-self._$colMoveTop.outerWidth(true)/2}).show();
						self._$colMoveBottom.css({left:eleft-self._$colMoveBottom.outerWidth(true)/2}).show();
					}
					
				},40);
			});
			$(this).on("dragend",function(e,t){
				$(t.proxy).remove();
				self._$colMoveTop.hide();
				self._$colMoveBottom.hide();
			});
			//$.drop({ mode:true });
			$(this).on("drop",{mode:"mouse"},function(e,t){
				if($(t.proxy).hasClass("switch")){
					self._switchColumn($(t.drag).parent(),$(t.drop).parent(),t._right);
				}
			});
		});
	  },
	  _addThWidth:function($th,width){
		var $table = $th.parents("table:first"); 
			
		var index 			= $th.parent().find("th").index($th);
		var thWidth			= $th.width()+width;
		var tableWidth		= $table.width()+width;
		
		$th.width(thWidth);
		$table.width(tableWidth);
		
		this._$tbodyTable.width(tableWidth);
		
		var $tbodyTh = this._$tbodyTable.find("thead tr:first>th:eq("+index+")");
			$tbodyTh.width(thWidth);
			
		this._$tfootTable.width(tableWidth);	
		var $tfootTh = this._$tfootTable.find("tr:first>th:eq("+index+")");
			$tfootTh.width(thWidth);	
	  },
	  _updateScroll:function(){
		this._$tbodyTableContainer.perfectScrollbar("update");
	  },
	  _switchColumn:function($fth,$tth,after){
		var $ths   = this._$theadTable.find("thead tr:first>th");
		var findex = $ths.index($fth);
		var tindex = $ths.index($tth);
		if(after){
			$fth.insertAfter($tth);
		}else{
			$fth.insertBefore($tth);
		}
		this._$tbodyTable.find("thead tr").each(function(){
			if(after){
				$(this).find(">*:eq("+findex+")").insertAfter($(this).find(">*:eq("+tindex+")"));
			}else{
				$(this).find(">*:eq("+findex+")").insertBefore($(this).find(">*:eq("+tindex+")"));
			}
			
		});
		this._$tbodyTable.find("tbody tr").each(function(){
			if(after){
				$(this).find(">*:eq("+findex+")").insertAfter($(this).find(">*:eq("+tindex+")"));
			}else{
				$(this).find(">*:eq("+findex+")").insertBefore($(this).find(">*:eq("+tindex+")"));
			}
		});
		this._$tfootTable.find("tr:first").each(function(){
			if(after){
				$(this).find(">*:eq("+findex+")").insertAfter($(this).find(">*:eq("+tindex+")"));
			}else{
				$(this).find(">*:eq("+findex+")").insertBefore($(this).find(">*:eq("+tindex+")"));
			}
		});
	  },
	  _emptyRows:function(){
		this._$tbodyTable.find("tbody").empty();
	  },
	  _addRowsByJson:function(data){
			if(data&&data.length>0){
				var html = "";
				$.each(data,function(){
					html+="<tr>";
						$.each(this,function(){
							html+="<td>"+this+"</td>"
						});
					html+="</tr>";
				});
				this._$tbodyTable.find("tbody").append(html);
				this._updateScroll();
			}
	  },
	  _refreshDataByAjax:function(data,complete){
		  var self = this;
		  if(this._settings.url){
			 $.post(this._settings.url,data?data:{},function(respons){
				   var rdata = eval("("+respons+")");
				   self._emptyRows();
				   self._addRowsByJson(rdata.data);
				   if(complete){
						complete.call(self);
				   }
			 });
		  }
	  }
	});
})(jQuery);
