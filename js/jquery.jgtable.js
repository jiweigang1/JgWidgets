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
			  fixedColumns:    -1,
			  sortable:        false,
			  cloneHeadToFoot: false, 
			  autoRefreshData :false,
			  autoScroll:true
        },
		_create:function(){
				this._settings = {
					 _cwidths:[],
					 _ccount:0,
					 _width:0,
					 _hlevel:0
				}
				this.element.css("opacity",0);
				this._$this		 	= this.element;
				this._$boxParent 	= this.element.parent();
				this._originClass	= this.element[0].className;
				this._mheaders	 	= this._isMheaders(this.element);
				this._initt();
		},
	 _initOptions:function(){
		if(this.element.attr("autoScroll")==="false"){
			this.options.autoScroll=false;
		}
		if(this.element.attr("cloneHeadToFoot")==="true"){
			this.options.cloneHeadToFoot=true;
		}
		
	 },
	 _initFixedColumns:function(){
		var $fixeds =	this._$theadTable.find('thead tr>*[fixed="true"],thead tr>*[fixed]');
		var fc = -1;
		if($fixeds.length>0){
			$fixeds.each(function(){
				var c = this.cellIndex + (this.colSpan-1);
				if(c>fc){
					fc =c;
				}
			});
		}
		
		if(fc>=0&&this._validFixedColumns(fc)){
			this.options.fixedColumns = fc;
		}else if( !(this.options.fixedColumns>0&&this._validFixedColumns(this.options.fixedColumns))  ){
			this.options.fixedColumns = -1;
		}
	 },
	 _validFixedColumns:function(index){
		this._$theadTable.find("tr").each(function(){
			var r = false;
			$(this).find(">*").each(function(){
				if(this.cellIndex + (this.colSpan-1) ==index ){
					r = true;
					return true;
				}
			});
			if(!r){
			  return false;
			}
		});
	  return true;
	},
	 
	 _initt:function(){
		this._initOptions();
		this._settings._hlevel = this.element.find("thead>tr").length;
		this._initWH();
		this._initHtml();
		this._initScroll();
		this._initResize();
		this._initDrop();
		if(this.options.autoRefreshData){
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
		var bw = this._calculate(this.options.boxWidth ,this._$this.parent().innerWidth()		,this._$this.parent().innerWidth());
		var bh = this._calculate(this.options.boxHeight,this._$this.parent().innerHeight()	,this._$this.parent().innerHeight());
		var h  = this._calculate(this.options.height	 ,this._$this.parent().height()			,this._$this.parent().height());
		var w  = this._calculate(this.options.width	 ,this._$this.parent().width()			,this._$this.parent().width());
		
		this._settings._width 	= w-2;
		this.options._boxWidth	= Math.min(bw,w); 
		
		this.options._height 	= h;
		this.options._boxHeight	= Math.min(bh,h); 
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
								<div class="jg-table-thead-scroll" >\
									<table class="jg-table-thead"></table>\
								</div>\
							</div>\
							<div class="jg-table-tbody-container" >\
								<div class="jg-table-tbody-scroll" >\
								</div>\
							</div>\
						</div>'
					);
		this._$this.before(this._$box);
		this._$box.css("opacity",0);
		this._$theadTableContainer=$(".jg-table-thead-container",this._$box);	
		this._$tbodyTableContainer=$(".jg-table-tbody-container",this._$box);
		this._$theadTableScroll	  =$(".jg-table-thead-scroll"	,this._$box);
		this._$tbodyTableScroll	  =$(".jg-table-tbody-scroll"	,this._$box);
		
		this._$tbodyTableScroll.append(this._$this);
		
		this._$theadTable = $(".jg-table-thead-scroll > table",this._$box).addClass(this._originClass).addClass("jg-table");	
		this._$tbodyTable = $(".jg-table-tbody-scroll > table",this._$box).addClass("jg-table jg-table-tbody");
		
		this._$box.css({width:this.options._boxWidth,height:this.options._boxHeight==this._$boxParent.height()?"100%":this.options._boxHeight});
		this._initHeadHtml();
		this._initBodyHtml();
		this._initFootHtml();
		this._$box.css("opacity",1);
		this.element.css("opacity",1);
		this._initFixedColumns()
		if(this.options.fixedColumns>=0){
			this._initFixColHtml();
		}
	  },
	  _initHeadHtml:function(){
			var self = this;
			this._$theadTable.append(this._$tbodyTable.find("thead"));
			this._headerData = [];
			this._$theadTable.width(this._settings._width);
			this._settings._ccount = this._cellPos(this._$theadTable.find("tr:first>*:last")).left+1;
			this._$theadTable.find("tr").each(function(){
				$(this).find(">*").each(function(){
					var width = $(this).attr("width")||this.style.width;
						width = self._calculate(width,self.options.width,null);
						if(width){
							var colSpan = this.colSpan;
							var left = self._cellPos(this).left;
							for(var i=0;i<colSpan;i++){
								self._settings._cwidths[i+left]=width/colSpan;
							}
						}
					});
			});
			var nwidth = this._settings._width,ncount=0;
			for(var i=0;i<this._settings._ccount;i++){
				if(!this._settings._cwidths[i]){
					ncount++;
				}else{
					nwidth -= this._settings._cwidths[i];
				}
			}
			for(var i=0;i<this._settings._ccount;i++){
				if(!this._settings._cwidths[i]){
					this._settings._cwidths[i] = nwidth/ncount;
				}
			}
			var cindex = '<tr style="height:auto" class="cindex" >'
				for(var i=0;i<this._settings._ccount;i++){
					cindex += '<th style="width:'+this._settings._cwidths[i]+'px;height:0px;padding:0px;border-width:0px"></th>';
				}
				cindex+="</tr>";
			this._$theadTable.find("thead").prepend(cindex);
			this._adjustTbodyTableContainer();
	  },
	  _initBodyHtml:function(){
		this._$tbodyTable.width(this._settings._width);
		this._$tbodyTable.find("thead").remove();
		this._$tbodyTable.prepend("<thead></thead>");
		this._$tbodyTable.find("thead").append(this._$theadTable.find(".cindex").clone());
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
		var $tfoot = this._$tbodyTable.find("tfoot");
		if($tfoot.length>0||this.options.cloneHeadToFoot){
			this._$tfootTableContainer = $('<div  class="jg-table-tfoot-container" ><div class="jg-table-tfoot-scroll" ><table class="jg-table-tfoot jg-table" ></table></div></div>').appendTo(this._$box);
			this._$tfootTableScroll = this._$tfootTableContainer.find(".jg-table-tfoot-scroll");
			this._$tfootTable = $(".jg-table-tfoot",this._$tfootTableContainer).width(this._settings._width);
		}
		if($tfoot.length>0){
			this._$tfootTable.append(this._$tbodyTable.find("tfoot")).find("tfoot").prepend(this._$theadTable.find(".cindex").clone());
		}else if(this.options.cloneHeadToFoot){
			this._$tfootTable.append(this._reverseHead(this._$theadTable.find("thead")));
			this._$tfootTable.find("thead").prepend(this._$tfootTable.find("thead .cindex"));
		}
		this._adjustTbodyTableContainer();
	  },
	  _resetFootHtml:function(){
		if(this._$tfootTable){
			if(this._$tfootTable.find("thead").length>0){
			    this._$tfootTable.find("thead").remove();
				this._$tfootTable.append(this._reverseHead(this._$theadTable.find("thead")));
				this._$tfootTable.find("thead").prepend(this._$tfootTable.find("thead .cindex"));
			}
		}	
	  },
	   _initFixColHtml:function(){
		this._initFixColHeadHtml();
		this._initFixColTbodyHtml();
		this._initFixColTfootHtml();
		this._resetFixedTableData();
	  },
	  _initFixColHeadHtml:function(){
			var self = this;
			var html = 	'<div class="jg-fix-thead-table-scroll" >\
							<table class="jg-fix-thead-table jg-table" >\
								<thead>\
									<tr class="cindex"></tr>\
								</thead>\
							</table>\
						</div>';
			this._$theadTableContainer.append(html);
			this._$fixTheadTable = this._$theadTableContainer.find(".jg-fix-thead-table");
			
			var $index = this._$theadTable.find(".cindex>*");
			for(var i=0;i<=this.options.fixedColumns;i++){
				this._$fixTheadTable.find(".cindex").append($index.eq(i).clone());
			}
			var  $thead = this._$fixTheadTable.find("thead");
			this._$theadTable.find("tr:not(.cindex)").each(function(){
				var $tr =$("<tr></tr>");
					$tr.height($(this).height());
					$thead.append($tr);
				$(this).find(">*").each(function(){
					var pos = self._cellPos(this);
					if(pos.left + (this.colSpan-1) <= self.options.fixedColumns){
						$tr.append($(this).clone());
						
					}
				});	
			});
			this._$fixTheadTable.width(this._getFixedWidth());
	  },
	  _initFixColTbodyHtml:function(){
		var self = this;
			var html = '<div class="jg-fix-tbody-table-scroll" >\
							<table class="jg-fix-tbody-table jg-table" >\
								<thead>\
								</thead>\
								<tbody>\
								</tbody>\
							</table>\
						</div>';
			this._$fixTbodyTableScroll = $(html);
			this._$tbodyTableContainer.append(this._$fixTbodyTableScroll);
			this._$fixTbodyTable = $(".jg-fix-tbody-table",this._$tbodyTableContainer).addClass(this._originClass);
			this._$fixTbodyTable.find("thead").append(this._$fixTheadTable.find(".cindex").clone());
			this._$fixTbodyTable.width(this._getFixedWidth()); 
	  },
	  _initFixColTfootHtml:function(){
		var self = this;
		if(this._$tfootTable){
			var html = '<div class="jg-fix-tfoot-table-scroll" >\
							<table class="jg-fix-tfoot-table jg-table" >\
							</table>\
						</div>';
			this._$tfootTableContainer.append(html);
			this._$fixTfootTable = this._$tfootTableContainer.find(".jg-fix-tfoot-table");
			if(this._$tfootTable.find("tfoot").length>0){
				this._$fixTfootTable.append("<tfoot></tfoot>");
			}else{
				this._$fixTfootTable.append("<thead></thead>");
			}
			this._$fixTfootTable.find("thead,tfoot").append(this._$fixTheadTable.find(".cindex").clone());
			
			var  $tfoot = this._$fixTfootTable.find("thead,tfoot");
			
			this._$tfootTable.find("tr:not(.cindex)").each(function(){
				var $tr =$("<tr></tr>");
					$tr.height($(this).height());
					$tfoot.append($tr);
				$(this).find(">*").each(function(){
					var pos = self._cellPos(this);
					if(pos.left + (this.colSpan-1) <= self.options.fixedColumns){
						$tr.append($(this).clone());
					}
				});	
			});
			this._$fixTfootTable.width(this._getFixedWidth());
		}
		this._adjustTbodyTableContainer();
	  },
	  _adjustTbodyTableContainer:function(){
		this._$tbodyTableContainer.css({"height":this.options._boxHeight-this._$theadTableContainer.outerHeight(true) - (this._$tfootTableContainer?this._$tfootTableContainer.outerHeight(true):0)});
	  },
	  _initScroll:function(){
		var self = this;
		this._$tbodyTableScroll.jgScrollbar({
												wheelPropagation:true,
												wheelSpeed:10,
												autoPreventEvent:false,
												railContainer:this._$tbodyTableContainer,
												autoShow:this.options.autoScroll
											});
		this._$tbodyTableScroll.on("scroll",function(){
			self._$theadTableScroll.scrollLeft($(this).scrollLeft());
			if(self._$fixTbodyTableScroll){
				self._$fixTbodyTableScroll.scrollTop($(this).scrollTop());
			}
			if(self._$tfootTableScroll){
				self._$tfootTableScroll.scrollLeft($(this).scrollLeft());
			}
		});
	  },
	  _initResize:function(){
			var self = this;
			this._$resizeMark=$('<div class="resize-mark"><div></div></div>').appendTo(this._$box);
			self._$resizeMark.draggable({
				axis:"x",
				start:function(e,ui){
					self._$resizeMark.css({opacity:1});
					self._resizeMoving = true;
					$(this).data("start",e.pageX);
				},
				stop:function(e,ui){
					if($(this).data("th")){
						self._addThWidth($(this).data("th"),e.pageX-$(this).data("start"));
					}
					self._$resizeMark.css({opacity:0});
					self._resizeMoving = false;
					self._updateScroll()
				}
		});
		this._$box.find("thead tr:not(.cindex)>*,tfoot tr:not(.cindex)>").each(function(){
			var $this = $(this);
			$(this).on("mousemove",function(e){
				if(self._resizeMoving){
					return;
				}
				if($(this).offset().left + $(this).outerWidth(true) - e.pageX < 5){
					self._$resizeMark.data("th",$(this));
					self._$resizeMark.css({height:self._$box.height(),left:e.pageX-self._$box.offset().left-5,opacity:0}).show();
					$(this).css({"cursor":"col-resize"});
				}else{
					self._$resizeMark.hide();
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
		this._$theadTable.find("tr:not(.cindex)>*").each(function(){
			$(this).draggable({
								appendTo:self._$box,
								helper: function(){
									var 	$helper = $('<span class="helper"><span class="verify" ></span><span class="content"></span></span>');
											$helper.find(".content").append($(this).find(">div").html());
									return  $helper;
								},
								cursorAt:{
									left:-5,
									top:-5
								},
								revert:function(e,ui){
									var revert = $(this).data("revert");
										$(this).removeData("revert");
									if(revert){
										return true;
									}else{
										return false;
									}
									
								},
								drag:function(e,ui){		
									var $th 	= $(this).data("drop");
									if(!$th){
										return;
									}
									var sleft	= $th.offset().left - self._$theadTableContainer.offset().left;
									var top		= $th.offset().top - self._$theadTableContainer.offset().top;
									var eleft	= sleft+$th.outerWidth(true);
									var em		= e.pageX - self._$theadTableContainer.offset().left;
									if(em<=(sleft+eleft)/2){
										$(this).data("right",false);
										self._$colMoveTop.css({left:sleft-self._$colMoveTop.outerWidth(true)/2,top:top}).show();
										self._$colMoveBottom.css({left:sleft-self._$colMoveBottom.outerWidth(true)/2}).show();
									}else{
										$(this).data("right",true);
										self._$colMoveTop.css({left:eleft-self._$colMoveTop.outerWidth(true)/2,top:top}).show();
										self._$colMoveBottom.css({left:eleft-self._$colMoveBottom.outerWidth(true)/2}).show();
									}
								},
								stop:function(){
									self._$colMoveTop.hide();
									self._$colMoveBottom.hide();
								}
								
							 });
			$(this).droppable({
				accept:"th",
				tolerance:"pointer",
				over:function(e, ui){
					var $move 		= $(ui.draggable);
					var $before		= $(this);
					if(
						(($move[0].rowSpan == self._settings._hlevel)||($move[0].rowSpan==1&&$move.parent()[0].rowIndex==self._settings._hlevel&&$move[0].colSpan==1))
						&&
						(($before[0].rowSpan == self._settings._hlevel)||($before[0].rowSpan==1&&$before.parent()[0].rowIndex==self._settings._hlevel&&$before[0].colSpan==1))
						&&
						$move[0].rowSpan === $before[0].rowSpan
					){
						$(this).removeClass("no").addClass("yes");
						$move.data("drop",$before);
					}else{
						$(this).removeClass("yes").addClass("no");
					}
					
				},
				out:function(e,ui){
					$(this).removeClass("yes no");
				},
				drop:function(e,ui){
					$(this).removeClass("yes no");
					var $move 		= $(ui.draggable);
					var $before		= $(this);
					if(
						(($move[0].rowSpan == self._settings._hlevel)||($move[0].rowSpan==1&&$move.parent()[0].rowIndex==self._settings._hlevel&&$move[0].colSpan==1))
						&&
						(($before[0].rowSpan == self._settings._hlevel)||($before[0].rowSpan==1&&$before.parent()[0].rowIndex==self._settings._hlevel&&$before[0].colSpan==1))
						&&
						$move[0].rowSpan === $before[0].rowSpan
					){
						
					}else{
						$move.data("revert",true);
						return false;
					}
				
					var $move 	= $(ui.draggable)
					var $before	= $(this);
					self._moveColumn($move,$before,$(ui.draggable).data("right"));
					return false;
				}
			});
			
			
		});
	  },
	  _addThWidth:function($th,width){
			var self = this;
			this._settings._width+=width;
			var left 	=	this._cellPos($th).left;
			var colSpan =	$th[0].colSpan;
			for(var i=0;i<colSpan;i++){
				this._settings._cwidths[i+left] +=  width/colSpan;
			}
			this._resetTableWidth();
			self._resetColWidth();
	  },
	  _resetTableWidth:function(){
		this._$theadTable.width(this._settings._width);
		this._$tbodyTable.width(this._settings._width);
		if(this._$tfootTable){
			this._$tfootTable.width(this._settings._width);
		}	
		if(this.options.fixedColumns>=0){
			var width = this._getFixedWidth();
			this._$fixTheadTable.width(width);
			this._$fixTbodyTable.width(width);
			if(this._$fixTfootTable){
				this._$fixTfootTable.width(width);
			}
		}
	  },
	  _resetColWidth:function(){
		var self = this;
		this._$box.find("tr.cindex").each(function(){
			var i = 0;
			$(this).find(">*").each(function(){
				$(this).width();
				$(this).width(self._settings._cwidths[i]);
				i++;
			});
		})
		
	  },
	  _getFixedWidth:function(){
		var width = 0;
		if(this.options.fixedColumns<0){
			return 0;
		}
		for(var i=0;i<=this.options.fixedColumns;i++){
			width += this._settings._cwidths[i]; 
		}
		return width;	
	  },
	  _updateScroll:function(){
		this._$tbodyTableScroll.jgScrollbar("update");
	  },
	  _moveColumn:function($move,$before,after){
		var self = this;
		var move 	= this._cellPos($move).left;
		var before	= this._cellPos($before).left;
		if(after){
			before +=1;
		}
		this._settings._cwidths.splice(before,0,this._settings._cwidths[move]);
		if(move>before){
			this._settings._cwidths.splice(move+1,1);
		}else{
			this._settings._cwidths.splice(move,1);
		}
		if(after){
			$move.insertAfter($before);
		}else{
			$move.insertBefore($before);
		}	
			
		
		
		this._$theadTable.find("thead").data("change",true);
		
		this._$tbodyTable.find("tbody tr").each(function(){
			$(this).find(">*:eq("+move+")").insertBefore($(this).find(">*:eq("+before+")"));
		}).end().find("tbody").data("change",true);
		
		this._resetFootHtml();
		this._resetColWidth();
	  },
	  _resetFixedTableData:function(){
		var self =	this;
		if(this._$fixTbodyTable){
			var $tbody = this._$fixTbodyTable.find("tbody");
				$tbody.empty();
			this._$tbodyTable.find("tbody>tr").each(function(){
				var $tr = $("<tr></tr>");
					$tbody.append($tr);
				var $tds = $(this).find(">*")
				for(var i=0;i<=self.options.fixedColumns;i++){
					$tr.append($tds.eq(i).clone());
				}
			});	
		}
	  },
	  _reverseHead:function($thead){
			$thead = $thead.clone();
			this._cellPos($thead.find("tr:last>*:last"));
		var $rthead = $("<thead></thead>");
			$thead.find("tr").each(function(){
				$rthead.prepend(this);
			});
			var i=0,k=0;
			$rthead.find("tr").each(function(){
				k = 0;
				$(this).find(">*").each(function(){
					var rowSpan = this.rowSpan;
					var left	= $(this).data("cellPos").left;
					if(rowSpan>1){
						var $tr = $rthead.find("tr").eq(i-(rowSpan-1));
						var $th;
						$tr.find(">*").each(function(){
							if($(this).data("cellPos").left<left){
								$th = $(this);
							}
						});
						if($th&&$th.length>0){
							$(this).insertAfter($th);
						}else{
							$tr.prepend(this);
						}
					}
				});
				i++
			})
			$rthead.find("td,th").removeData("cellPos");
		return $rthead;
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
		  if(this.options.url){
			 $.post(this.options.url,data?data:{},function(respons){
				   var rdata = eval("("+respons+")");
				   self._emptyRows();
				   self._addRowsByJson(rdata.data);
				   if(complete){
						complete.call(self);
				   }
			 });		
		  }
		  
	  },
	  _cellPos:function(thd){
		var $cell = $(thd).first(),
            pos = $cell.data( "cellPos" );
		var	rescan = $cell.closest( "table, thead, tbody, tfoot" ).data("change")||false;
        if( !pos || rescan ) {
            var $table = $cell.closest( "table, thead, tbody, tfoot" );
            this._scanTable( $table );
        }
        pos = $cell.data("cellPos");
        return pos;
	  },
	  _scanTable:function($table){
			var m = [];
			$table.children( "tr" ).each( function( y, row ) {
				$( row ).children( "td, th" ).each( function( x, cell ) {
					var $cell = $( cell ),
						cspan = $cell.attr( "colspan" ) | 0,
						rspan = $cell.attr( "rowspan" ) | 0,
						tx, ty;
					cspan = cspan ? cspan : 1;
					rspan = rspan ? rspan : 1;
					for( ; m[y] && m[y][x]; ++x );  //skip already occupied cells in current row
					for( tx = x; tx < x + cspan; ++tx ) {  //mark matrix elements occupied by current cell with true
						for( ty = y; ty < y + rspan; ++ty ) {
							if( !m[ty] ) {  //fill missing rows
								m[ty] = [];
							}
							m[ty][tx] = true;
						}
					}
					var pos = { top: y, left: x };
					$cell.data( "cellPos", pos );
				} );
			} );
		}
	})
})(jQuery);