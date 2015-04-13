/*!
 * jg-Table
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 2.1
 *
 * Author JiGang 2014-11-11
 */
(function ($) {
    $.widget("jgWidgets.jgTable", {
        options: {
              boxWidth		   :'100%',		
			  boxHeight		   :"100%",	
			  width:           '100%',
			  height:          '100%',
			  borderCollapse:  true,
			  fixedColumns:    0,
			  fixedColumn:     false,
			  sortable:        false,
			  cloneHeadToFoot: false, 
			  autoRefreshData :false	
        },
		_create:function(){
				this._settings	 	= this.options;
				this._$this		 	= this.element;
				this._$boxParent 	= this.element.parent();
				this._originClass	= this.element[0].className;
				this._mheaders	 	= this._isMheaders(this.element);
				this._th_data_name	= "_th_data_";
				this._initt();
		},
	 _initt:function(){
		this._initWH();
		this._initHtml();
		this._initScroll();
		this._initResize();
		if(!this._mheaders){
			this._initDrop();
		}
		if(this._settings.autoRefreshData){
			this._refreshDataByAjax({});
		}
	  },	
	  _isMheaders:function($table){
		 return $table.find("thead tr").length>1;
	  },
	  _calculate:function(vstr,pval,dval){
		if(!vstr){
			return null;
		}
		vstr+="";
		if(vstr.indexOf("%")>-1){
		    vstr = vstr.substring(0,vstr.indexOf("%"));
			try{
				return  parseInt(vstr)/100*pval;
			}catch(e){
				return dval;
			}		
		}else if(vstr.indexOf("px")>-1){
			vstr = vstr.substring(0,vstr.indexOf("px"));
			try{
				return parseInt(vstr);
			}catch(e){
				return dval;
			}
		}else{
			try{
				return   parseInt(vstr);
			}catch(e){
				return dval;
			}
		}
	  },
	  _initWH:function(){
		
		var bw = this._calculate(this._settings.boxWidth ,this._$this.parent().innerWidth()		,this._$this.parent().innerWidth());
		var bh = this._calculate(this._settings.boxHeight,this._$this.parent().innerHeight()	,this._$this.parent().innerHeight());
		var h  = this._calculate(this._settings.height	 ,this._$this.parent().height()			,this._$this.parent().height());
		var w  = this._calculate(this._settings.width	 ,this._$this.parent().width()			,this._$this.parent().width());
		
		this._settings._width 		= w;
		this._settings._boxWidth	= Math.min(bw,w); 
		
		this._settings._height 		= h;
		this._settings._boxHeight	= Math.min(bh,h); 
	  }, 
	  _initHtml:function(){
		this._$this.find("thead tr:not(.cindex)>*").each(function(){
			$(this).wrapInner('<div class="jg-table-cell" ></div>');
		});
		this._$this.find("tfoot tr:not(.cindex)>*").each(function(){
			$(this).wrapInner('<div class="jg-table-cell" ></div>');
		});
	  
		this._$box = $(
						'<div class="jg-table-wrapper" >\
							<div class="jg-table-thead-container" >\
								<table class="jg-table-thead"></table>\
							</div>\
							<div class="jg-table-tbody-container jg-table" >\
							</div>\
						</div>'
					);
		this._$this.before(this._$box);
		
		this._$theadTableContainer=$(".jg-table-thead-container",this._$box);	
		this._$tbodyTableContainer=$(".jg-table-tbody-container",this._$box);
		
		this._$tbodyTableContainer.append(this._$this).css({"overflow":"hidden"});
		
		this._$theadTable = $(".jg-table-thead-container > table",this._$box).addClass(this._originClass).addClass("jg-table");	
		this._$tbodyTable = $(".jg-table-tbody-container > table",this._$box).addClass("jg-table jg-table-tbody");
		
		this._$box.css({width:this._settings._boxWidth,height:this._settings._boxHeight==this._$boxParent.height()?"100%":this._settings._boxHeight});
		this._initHeadHtml();
		this._initBodyHtml();
		this._initFootHtml();
	  },
	  _initHeadHtml:function(){
			var self = this;
			this._$theadTable.append(this._$tbodyTable.find("thead"));
			this._headerData = [];
			this._$theadTable.width(this._settings._width);
			this._$theadTable.find("thead tr").each(function(){
				self._headerData.push([]);
			}).each(function(index){
				var itr = index;
				$(this).find(">th").each(function(){
					var $this = $(this);
				    var r  = $(this).attr("rowspan")||1;
					var c  = $(this).attr("colspan")||1;					
					for(var ir=0;ir<r;ir++){
						for(var ic=0;ic<c;ic++){
							self._headerData[itr+ir].push($this);
						}
					}
				});
			});
			var ths ='<tr style="height:auto" class="cindex" >';
			for(var i=0;i<this._headerData[0].length;i++){
				ths+='<th style="height:0px;padding:0px;border-width:0px"></th>';
			}
				ths+="</tr>";
			var $ths = $(ths).prependTo(this._$theadTable.find("thead")).find("th");	
			for(var i=0;i<this._headerData.length;i++){
				for(var k=0;k<this._headerData[i].length;k++){
					var $th = this._headerData[i][k];
					var data   = $th.data(this._th_data_name);
					if(!data){
						data ={};
						$th.data(this._th_data_name,data);
					}
					var cindex = data.cindex;
					if(!cindex){
						cindex = data.cindex = [];
					}
					var thc = data.thc;
					if(!thc){
						thc = data.thc =[];
					}
					var ex = false;
					for(var ci=0;ci<cindex.length;ci++){
						if(cindex[ci]==k){
							ex = true;
							break;
						}
					}
					if(!ex){
						cindex.push(k);
						thc.push($ths.eq(k));
					}
				}
			}
			var cwidths 	=[];
			for(var i=0;i<this._headerData[0].length;i++){
				cwidths[i]=-1;
				for(var k=0;k<this._headerData.length;k++){
					for(var l=0;l<this._headerData[k].length;l++){
						var cindex = this._headerData[k][l].data(this._th_data_name).cindex; 
						if(cindex.length==1&&cindex[0]==i){
							var width = this._headerData[k][l].attr("width")||this._headerData[k][l][0].style.width;
								width = this._calculate(width,this._settings.width,null);
								if(width){
									cwidths[i]=width;
								}
							}
					}
				}
			}
			var nwidths = [];
			var allwidth = this._settings._width;
			for(var i=0;i<cwidths.length;i++){
				if(cwidths[i]>0){
					$ths.eq(i).width(cwidths[i]);
					allwidth-=cwidths[i];
				}else{
					nwidths.push(i);
				}
			}
			for(var i=0;i<nwidths.length;i++){
				$ths.eq(nwidths[i]).width(allwidth/nwidths.length);
			}
			this._adjustTbodyTableContainer();
	  },
	  _initBodyHtml:function(){
		this._$tbodyTable.width(this._settings._width);
		this._$tbodyTable.find("thead").remove();
		this._$tbodyTable.prepend("<thead></thead>");
		this._$tbodyTable.find("thead").append(this._$theadTable.find(".cindex").clone());
		var $ths = this._$tbodyTable.find(".cindex>th");
		for(var i=0;i<this._headerData.length;i++){
			for(var k=0;k<this._headerData[i].length;k++){
				var data = this._headerData[i][k].data(this._th_data_name);
					var tbc = data.tbc;
					if(!tbc){
						tbc = data.tbc =[];
					}
					var cindex = data.cindex;
					for(l=0;l<cindex.length;l++){
						tbc.push($ths.eq(cindex[l]));
					}
			}
		}
		this._$tbodyTable.css("margin-top" ,-this._$tbodyTable.find("thead").height());
		this._resetBodyStyle();
		this._adjustTbodyTableContainer();
	  
	  },
	  _resetBodyStyle:function(){
		var self = this;
		this._$tbodyTable.on("click","tbody>tr",function(){
			self._$tbodyTable.find("tr.select").removeClass("select");
			$(this).addClass("select");
		}).find("tbody>tr").hover(function(){
			$(this).addClass("hover");
		},function(){
			$(this).removeClass("hover");
		});
		
	  },
	  _initFootHtml:function(){
		if(this._$tbodyTable.find("tfoot").length>0){
			this._$tfootTableContainer = $('<div  class="jg-table-tfoot-container" ><table class="jg-table-tfoot jg-table" ></table></div>').appendTo(this._$box);
			this._$tfootTable = $(".jg-table-tfoot",this._$tfootTableContainer);
			this._$tfootTable.append(this._$tbodyTable.find("tfoot"));
			this._$tfootTable.width(this._settings._width).find("tfoot").prepend(this._$theadTable.find(".cindex").clone());
			var $ths = this._$tfootTable.find(".cindex>th");
			for(var i=0;i<this._headerData.length;i++){
					for(k=0;k<this._headerData[i].length;k++){
						var data   = this._headerData[i][k].data(this._th_data_name);
						var cindex = data.cindex;	
						var tfc	   = data.tfc = []; 	
						for(var m=0;m<cindex.length;m++){
							tfc.push($ths.eq(cindex[m]));
						}
					}
					
			}
		}else{
			if(this._settings.cloneHeadToFoot){
				this._$tfootTableContainer = $('<div  class="jg-table-tfoot-container" ><table class="jg-table-tfoot jg-table" ></table></div>').appendTo(this._$box);
				this._$tfootTable = $(".jg-table-tfoot",this._$tfootTableContainer);
				this._$tfootTable.append('<thead></thead>').width(this._settings._width).find("thead").append(this._$theadTable.find(".cindex").clone());
				var $ths = this._$tfootTable.find(".cindex>th");
				var hd	=[];
				var html ="";
				var $p = $("<p></p>");
				for(var i=this._headerData.length-1;i>=0;i--){
					html+="<tr>";
					for(k=0;k<this._headerData[i].length;k++){
						var data   = this._headerData[i][k].data(this._th_data_name);
						var cindex = data.cindex;	
						var tfc	   = data.tfc = []; 	
						for(var m=0;m<cindex.length;m++){
							tfc.push($ths.eq(cindex[m]));
						}
						var e = false;
						for(var l=0;l<hd.length;l++){
							if(hd[l] == this._headerData[i][k]){
								e = true;
								break;
							}
						}
						if(!e){
							hd.push(this._headerData[i][k]);
							html+= $p.empty().append(this._headerData[i][k].clone()).html();
						}
					}
					html+="</tr>";
				}
				this._$tfootTable.find("thead").append(html);
				
				hd=null;
			}
		}
		this._adjustTbodyTableContainer();
	  },
	  _adjustTbodyTableContainer:function(){
		this._$tbodyTableContainer.css({"height":this._settings._boxHeight-this._$theadTableContainer.outerHeight(true) - (this._$tfootTableContainer?this._$tfootTableContainer.outerHeight(true):0)});
	  },
	  _initScroll:function(){
		var self = this;
		this._$tbodyTableContainer.jgScrollbar({
													wheelPropagation:true,
													wheelSpeed:10,
													autoPreventEvent:false
												});
		this._$tbodyTableContainer.on("scroll",function(){
			self._$theadTableContainer.scrollLeft($(this).scrollLeft());
			if(self._$tfootTableContainer){
				self._$tfootTableContainer.scrollLeft($(this).scrollLeft());
			}
		});
	  },
	  _initResize:function(){
			var self = this;
			this._$resizeMark=$('<div class="resize-mark"></div>').appendTo(this._$box);
			self._$resizeMark.draggable({
				axis:"x",
				start:function(e,ui){
					self._$resizeMark.css({opacity:1});
					self._resizeMoving = true;
					$(this).data("start",e.pageX);
				},
				stop:function(e,ui){
					self._addThWidth($(this).data("th"),e.pageX-$(this).data("start"));
					self._$resizeMark.css({opacity:0});
					self._resizeMoving = false;
					self._updateScroll()
				}
			});
			
			
		this._$theadTable.find("tr>th").each(function(){
			var $this = $(this);
			$(this).on("mousemove",function(e){
				if(self._resizeMoving){
					return;
				}
				if($(this).offset().left + $(this).outerWidth(true) - e.pageX < 5){
					self._$resizeMark.data("th",$(this));
					self._$resizeMark.css({height:self._$box.height(),left:e.pageX-self._$box.offset().left,opacity:0}).show();
					$(this).css({"cursor":"col-resize"});
				}else{
					$(this).css({"cursor":"default"});
				}
			});
		});
	  },
	  _initDrop:function(){
		this._$colMoveTop 		=  $('<div class="col-move-top" ></div>').prependTo(this._$theadTableContainer);
		this._$colMoveBottom	=  $('<div class="col-move-bottom"></div>').prependTo(this._$theadTableContainer);
		this._$colMoveBottom.css({top:this._$theadTableContainer.height()-this._$colMoveBottom.outerHeight(true)});	
		var self  = this;
		this._$theadTable.find("tr:eq(1)>th").each(function(){
			$(this).draggable({
								axis:"x",
								appendTo:$(this).parents(".jg-table-thead-container:first"),
								helper: function(){
									return $("<span></span>").append($(this).find("div").html()).css({width:"auto",height:$(this).height()}).addClass("switch");
								},
								drag:function(e,ui){
									var $th 	= $(this).data("drop");
									if(!$th){
										return;
									}
									var sleft	= $th.offset().left - self._$theadTableContainer.offset().left;
									var eleft	= sleft+$th.outerWidth(true);
									var em		= e.pageX - self._$theadTableContainer.offset().left;
									if(em<=(sleft+eleft)/2){
										$(this).data("right",false);
										self._$colMoveTop.css({left:sleft-self._$colMoveTop.outerWidth(true)/2}).show();
										self._$colMoveBottom.css({left:sleft-self._$colMoveBottom.outerWidth(true)/2}).show();
									}else{
										$(this).data("right",true);
										self._$colMoveTop.css({left:eleft-self._$colMoveTop.outerWidth(true)/2}).show();
										self._$colMoveBottom.css({left:eleft-self._$colMoveBottom.outerWidth(true)/2}).show();
									}
								},
								stop:function(){
									self._$colMoveTop.hide();
									self._$colMoveBottom.hide();
								}
								
							 });
			$(this).droppable({
				accept:function(){
					return true;
				},
				over:function(e, ui ){
					$(ui.draggable).data("drop",$(this));
				},
				drop:function(e,ui){
					self._switchColumn($(ui.draggable),$(this),$(ui.draggable).data("right"));
				}
			});
			
			
		});
	  },
	  _addThWidth:function($th,width){
			var tableWidth  = this._$theadTable.width()+width;
			var data 		= $th.data(this._th_data_name);
			var toWidth	= [];
			this._$theadTable.width(tableWidth);
			this._$tbodyTable.width(tableWidth);
			if(this._$tfootTable){
				this._$tfootTable.width(tableWidth);
			}	
			
			for(var i=0;i<data.thc.length;i++){
				var w = data.thc[i].width()+width/data.thc.length;
					data.thc[i].width(w);
					toWidth.push(w);
			}
			
			
			

			for(var i=0;i<data.tbc.length;i++){	
				data.tbc[i].width(toWidth[i]);
			}
			
			if(this._$tfootTable){
				this._$tfootTable.width(tableWidth);	
				for(var i=0;i<data.tfc.length;i++){	
					data.tfc[i].width(toWidth[i]);
				}
			}	
			
	  },
	  _updateScroll:function(){
		this._$tbodyTableContainer.jgScrollbar("update");
	  },
	  _switchColumn:function($fth,$tth,after){
		var $ths   = this._$theadTable.find("thead tr:eq(1)>th");
		var findex = $ths.index($fth);
		var tindex = $ths.index($tth);
		
		this._$theadTable.find("thead tr").each(function(){
			if(after){
				$(this).find(">*:eq("+findex+")").insertAfter($(this).find(">*:eq("+tindex+")"));
			}else{
				$(this).find(">*:eq("+findex+")").insertBefore($(this).find(">*:eq("+tindex+")"));
			}
			
		});
		
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
		if(this._$tfootTable){
			this._$tfootTable.find("tr:first").each(function(){
				if(after){
					$(this).find(">*:eq("+findex+")").insertAfter($(this).find(">*:eq("+tindex+")"));
				}else{
					$(this).find(">*:eq("+findex+")").insertBefore($(this).find(">*:eq("+tindex+")"));
				}
			});
		}		
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
	})
})(jQuery);