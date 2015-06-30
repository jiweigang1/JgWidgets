/**
 *
 * jg-map
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-16
 *
*/
(function($){
	function Tooltip(){
			 this._toolTipContainer	= null;		
	}
	Tooltip.prototype.init=function($elc){
			 var self 	= this;
			 if(!this._toolTipContainer){
				this._toolTipContainer = $('<span style="font-size:12px;background:#333333;color:#FFFFFF;z-index:1000;position:absolute;display:none;padding:4px" ></span>');
				this._toolTipContainer.appendTo("body");
			 }
			 $elc.on("mousemove",function(e){
					var x 	   = e.pageX+15;
					var y 	   = e.pageY+15;
					self.move(x,y);
			 });
	}
	Tooltip.prototype.show=function(){
			this._toolTipContainer.show();
	}
	Tooltip.prototype.hide=function(){
			this._toolTipContainer.hide();
	}
	Tooltip.prototype.setText=function(text){
			this._toolTipContainer.text(text);
	}
	Tooltip.prototype.move =function(x,y){
			this._toolTipContainer.css({"left":x,"top":y});
	}
	Tooltip.prototype.destroy =function(){
			if(this._toolTipContainer&&this._toolTipContainer.length>0){
				this._toolTipContainer.remove();
			}
	}
	
	$.widget("jgWidgets.jgMap", {
			 options:{
				ajaxType   :"post",	
				chartWidth : null,
				chartHeight: null,
				url		   : null,
				params	   : null,
				forms	   : null,
				webContext : "",
				autoRefresh:false,
				onClick	   : null,
				logoUrl	   : null,
				location   : "china",
				chartAlign : null,
				windowResize:true
			 },
			 _create:function(){
				var self = this;
				this._initOptions();
				this.draw();
			 },
			 _initOptions:function(){
				var self = this;
				this.options.chartWidth  = getValue(this.element,"chartWidth",this.options.chartWidth);
				this.options.chartHeight = getValue(this.element,"chartHeight",this.options.chartHeight);
				this.options.url 		 = getValue(this.element,"url",this.options.url);
				this.options.params 	 = getValue(this.element,"params",this.options.params,"object");
				this.options.forms 	 	 = getValue(this.element,"forms",this.options.params);
				this.options.webContext	 = getValue(this.element,"webContext",this.options.webContext);
				this.options.autoRefresh = getValue(this.element,"autoRefresh",this.options.autoRefresh,"boolean");
				this.options.onClick 	 = getValue(this.element,"onClick",this.options.onClick,"function");
				this.options.logoUrl 	 = getValue(this.element,"logoUrl",this.options.logoUrl);
				this.options.location 	 = getValue(this.element,"location",this.options.location);
				this.options.chartAlign  = getValue(this.element,"chartAlign",this.options.chartAlign);
				
				this._settings = {};
				this._settings.UUID  = "JgMap"+new Date().getTime();
				this._settings.map   = window._maps_[this.options.location];
				this._settings.ratio = 1;
				this._settings.h	   		  = this._settings.map.height;
				this._settings.w	   		  = this._settings.map.width;	 
				this._settings.paper		  = null;
				this._settings.allMap	  	  = null;
				this._settings.backGround  	  = null;
				this._settings.tooltip	  	  = null;
				this._settings.logo		  	  = null;
				this._settings.lstartText  	  = null;
				this._settings.lendText	  	  = null;
				this._settings.data	  	  	  = null;
				this._settings.canvasHeight	  = this._settings.map.height;
				this._settings.canvasWidth 	  = this._settings.map.width;	  
				
				if(this.options.windowResize){
					$(window).on("resize."+this._settings.UUID,function(){
						if(self._timeOutResize){
							clearTimeout(self._timeOutResize);
						}
						self._timeOutResize = setTimeout(function(){
								self.reDrawLocal();
						},20);
					})
				}
			 },
			 
	
			//计算比例
			_caculateRatio:function(r){
					if(r){
						this.element.empty();
					}
					var w = 0,h=0;
					if(this.options.chartWidth){
						if(this.options.chartWidth.indexOf("%")>0){
							w = this.element.innerWidth() * ( parseFloat(this.options.chartWidth.substring(0,this.options.chartWidth.indexOf("%"))) / 100.0) ;
						}else{
							w = this.options.chartWidth;
						}
					}else{
						w	= this.element.innerWidth();
					}
					
					if(this.options.chartHeight){
						if(this.options.chartHeight.indexOf("%")>0){
							h = this.element.innerHeight() * ( parseFloat(this.options.chartHeight.substring(0,this.options.chartHeight.indexOf("%"))) / 100.0) ;
						}else{
							h = this.options.chartHeight;
						}
					}else{
						h	= this.element.innerHeight();
					}
					
					if(isNaN(w)){
						w=0;
					}
					if(isNaN(h)){
						h=0;
					}
				if(w>0&&h==0){
					this._settings.ratio = w/this._settings.map.width;
				}else if(w==0&&h>0){
					this._settings.ratio = h/this._settings.map.height;
				}else if(w>0&&h>0){
					this._settings.ratio = Math.max(w/this._settings.map.width,h/this._settings.map.height);
				}
			},
			//创建画布
			_creatPaper:function(r){
				if(r){
					this.element.empty();
				}
				this._settings.canvasWidth   =  this._settings.w*this._settings.ratio+10 ;
				this._settings.canvasHeight  =  this._settings.h*this._settings.ratio+10 +30;// +30;
				this._settings.$elc = $('<div style="position:relative"  ></div>');
				this._settings.$elc.css({"text-align":"left","padding":0,"width":this._settings.canvasWidth});
				if(this.options.chartAlign=='center'){
					this._$elc.css({"margin":"0px auto"});
				}
				this.element.append(this._settings.$elc);	
				
				this._settings.lpaper = Raphael(this._settings.$elc[0],this._settings.canvasWidth ,30);
				this._settings.paper  = Raphael(this._settings.$elc[0],this._settings.canvasWidth ,this._settings.canvasHeight);
				
				this._settings.allMap = this._settings.paper.set();	
			},
	
			_initParams:function(r){
				var self = this;
				if(this.options.forms){
					var $fs = this._getForms();
					if($fs.length>0){
						if(this.options.autoRefresh&&!r){
							$fs.on("change."+self._settings.UUID,function(e){
								self._reDraw();
							});
						}
					}
				}
			},
			_getFromByGroup:function(group){
				if(!this._settings.forms){
					return  null;
				}
				for(var i=0;i<this._settings.forms.length;i++){
					if(this._settings.forms[i].group===group){
						return 	this._settings.forms[i];
					}
				}
				return null;
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
						//console.log(this.name);
						if(this.specified && this.name.indexOf("forms")==0){
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
				var $r = $();
				for(var i=0;i<this._settings.forms.length;i++){
					$r = $r.add(this._settings.forms[i].elements);
					//alert($r.length);
				}
				return $r;
				
			},
			//获取参数
			_getData:function(){
				var data = [];
				if(this.options.params){
					data = serializeArrayObject(this.options.params);
				}
				var $fs = this._getForms();
				if($fs.length>0){
					$.merge(data,$fs.serializeArray());
				}
				return data;
			},
			_creatBackGround:function(){
				this._settings.backGround = this._settings.paper.rect(0,0,this._settings.map.width, this._settings.map.height); this._settings.allMap.push(this._settings.backGround);
				this._settings.backGround.attr("fill","#FFFFFF"); 
				this._settings.backGround.attr("stroke-width",0); 
			},
			
			_creatEmptyMap:function(r){
				var self = this;
				this._settings.mapGroup	= this._settings.paper.set(); this._settings.allMap.push(this._settings.mapGroup);
				this._settings.pathMap = {}; 
				for(var p in this._settings.map.paths){
						var 	path = this._settings.paper.path(this._settings.map.paths[p].path).attr({"stroke-width":1,"stroke-opacity":0.5});
								path.data("area",this._settings.map.paths[p]);
								path.data("name",p)
								path.data("id",this._settings.map.paths[p].localId)
								path.data("valueLable",null);
						this._settings.pathMap["path"+this._settings.map.paths[p].localId] = path;		
						var 	group = this._settings.paper.set();
								group.push(path);
						group.mouseover(function(e){
							self._settings.tooltip.show();
							var valueLable = this.data("valueLable");
							if(!valueLable){
								valueLable ="无数据";
							}
							self._settings.tooltip.setText(this.data("area").name +" : "+valueLable);
							//因为如果还没有被颜色渲染时默认的加载颜色为#F7F7F7为白色，所以onmouseout时会把着色渲染成白色造成失去渲染色的问题
							//this.c = this.c||this.attr("fill");
							this.attr({"fill-opacity":0.6,"stroke-opacity":0.9});
						});
						group.mouseout(function(e){
							this.attr({"fill-opacity":1,"stroke-opacity":0.5});
							self._settings.tooltip.hide();
						});
						group.click(function(e){
							if(self.options.onClick&&!self._settings.panZoom.isDragging()){
								self.options.onClick.call(self.element,this.data("area").localId);
							}
						});
						this._settings.mapGroup.push(group);
				}
				this._settings.mapGroup.attr("fill","#F7F7F7");
			},
			
			_supportCreatLegend:function(){
				if(this._settings.canvasWidth<300){
					return false;
				}
				return true;
			},
			
			_creatLegend:function(lstartText,lendText){
				if(!this._supportCreatLegend()){
					return;
				}
				this._settings.legendGroup 	= this._settings.paper.set();
				var lstart  		= lstartText||" "
				var lend			= lendText||" "
				var legendOffSetX	= 0;
				var legendOffSetY	= 5 ; 
				var	lstartText = this._settings.lpaper.text(legendOffSetX,legendOffSetY+8,lstart).attr({"font-size":12,"text-anchor":"start"});	
				    legendOffSetX   =  lstartText.getBBox().width+2;
								
				var lwidth  = 12;
				var lheight = 12;
				
				
				for(var i=0;i<this._settings.map.legendColors.length;i++){
					 this._settings.legendGroup.push(this._settings.lpaper.rect( legendOffSetX + i*(lwidth+4)+2  ,legendOffSetY,lwidth,lheight).attr(  {"fill":this._settings.map.legendColors[i],"stroke-width":0  } )  );
				}
					
				var	lendText   = this._settings.lpaper.text(legendOffSetX+(this._settings.map.legendColors.length)*(lwidth+4)+2,legendOffSetY+8,lend).attr({"font-size":12,"text-anchor":"start"});
				this._settings.lstartText = lstartText;
				this._settings.lendText	  = lendText;
				this._settings.legendGroup.push(lstartText,lendText);
			},
			
			_setMinAndMaxLable:function(lstartText,lendText){
				if(!this._supportCreatLegend()){
					return;
				}
				if(this._settings.legendGroup){
					this._settings.legendGroup.remove();
					this._settings.legendGroup=this._settings.paper.set();
				}
				
				if(this._settings.lstartText){
					this._settings.lstartText.remove();
					this._settings.lstartText=null;
				}
				if(this._settings.lendText){
					this._settings.lendText.remove();
					this._settings.lstartText=null;
				}
				
				this._creatLegend(lstartText,lendText);
				
			},
	
			_creatLogo:function(){
				if(this.options.logoUrl){
					this._settings.logo = this._settings.lpaper.image(this.options.logoUrl,this._settings.canvasWidth-120 ,5,96,10);
				}
			},
			
			_creatAggregate:function(){
				var self = this;
				if(self._settings.$elc.find("#aggregateValue").length==0){
					self._settings.$elc.append('<div id="aggregateValue" style="position:absolute;right:20px;top:10px;font-size:12px;color:#333333" ></div>');
				}
				this._settings.$aggregateValue = self._settings.$elc.find("#aggregateValue");
				
			},
			
			_setAggregateValue:function(aggregateValue,unit){
				if(!this._settings.$aggregateValue||this._settings.$aggregateValue.length){
					this._creatAggregate();
				}
				var text ;
					if(!unit){
					   unit ="";
					}else{
					   unit ="("+unit+")";	
					}
					if(aggregateValue&&aggregateValue>0){
						this._settings.$aggregateValue.text("平均值："+aggregateValue+unit);
					}
			},
			
			_zoom : function(){
				this._settings.allMap.transform("...s"+this._settings.ratio+","+this._settings.ratio+",0,0t0,60");
				this._settings.panZoom  = this._settings.paper.panzoom({initialPosition:  { x: 0, y: 0} ,initialZoom:0});
				this._settings.panZoom.enable();
			},
	
			_divideData:function(resData){
				var self= this;	
				var max = 0;
				var min = 0;
				if(!resData.data||resData.data.length<=0){
					return;
				}
				min = resData.data[0].value;
				$.each(resData.data,function(index,value){			
						for(var i=0;i<self._settings.mapGroup.length;i++){
								if(self._settings.mapGroup[i][0].data("id") == value.locationId){
									 self._settings.mapGroup[i][0].data("data",value);
									 self._settings.mapGroup[i][0].data("valueLable",value.value+" "+resData["unit"]);
									 break;
								}	
								
						}
					
						if(value.value>max){
							max = value.value;
						}	
						if(value.value<min){
							min = value.value
						}
				});
				
				var d   = (max-min)/12;
				var dv  = [];
				for(i=0;i<12;i++){
						dv.push(min+d*i);
				}
				
				dv.push(max);
				
				var group =[];
				$.each(resData.data,function(index,value){
						for(var i=0;i<=11;i++){
								if(!group[i]){
											group[i]={color:self._settings.map.legendColors[i],localIds:[]};
								}
								if(dv[i]<= value.value && value.value<=dv[i+1]  ){
									 group[i].localIds.push(value.locationId);
									 break;
								}
						}
				});
				this._setMinAndMaxLable(Math.floor(min)+""+resData.unit,Math.ceil(max)+""+resData.unit);
				this._setAggregateValue(resData.aggregateValue,resData.unit);
				return group;
			},
			_fillLocal:function(group){
				for(var i=0;i<group.length;i++){
					  for(var j=0;j<group[i].localIds.length;j++){
							for(var k=0;k<this._settings.mapGroup.length;k++){
								 if(this._settings.mapGroup[k][0].data("id")==group[i].localIds[j]){
										this._settings.mapGroup[k].attr({"fill":group[i].color});
								 }
							}
					  }
				}
			},
			_getUrl:function(){
				var url = this.options.url;
				if(this.options.webContext){
					url = this.options.webContext + url;
				}
				return url;
			},
			_renderLocal:function(fn,local){
				var self = this;
				if(!local){
						var self = this;
					   if(!this.options.url){
							return;
					   }
						$.ajax({
								url		:this._getUrl(),
								type	:this.options.ajaxType,
								data	:self._getData()||[],
								dataType:"text"
						}).done(function(data){
								 data = $.parseJSON(data);	
								 self._settings.dataGroup = data;
								 var group = 	self._divideData(data);
								 
								 if(group){
									self._fillLocal(group);
								 }
								if(fn&&$.isFunction(fn)){
									fn.call(null,true);
								}	 
						}).fail(function(){
							if(fn&&$.isFunction(fn)){
									fn.call(null,false);
							}
						});
				}else{
					if(self._settings.dataGroup){
						var group = 	self._divideData(self._settings.dataGroup);
						if(group){
							self._fillLocal(group);
						}
					}
				}
				 
			},
	
	
	
			_drawEmptyMap:function(r){
				this._caculateRatio(r);
				this._creatPaper(r);
				this._initParams(r);
				this._creatBackGround();
				this._initTooltip();
				this._creatEmptyMap(r);
				this._creatLegend();
				this._creatLogo();
				this._zoom();
				this._initZoom();
			},
			_resetMap:function(){
				this._settings.mapGroup.data("valueLable",null);
				this._settings.mapGroup.attr({"fill":"#F7F7F7"});
				if(this._settings.lstartText){
					this._settings.lstartText.attr("text","");
				}
				if(this._settings.lendText){
					this._settings.lendText.attr("text","");	
				}
				
				if(this._settings.$aggregateValue){
					this._settings.$aggregateValue.text("");
				}
			},
			_initTooltip:function(){
				if(!this._settings.tooltip){
					this._settings.tooltip = new Tooltip();
				}
				this._settings.tooltip.init(this._settings.$elc);
			},
	
			//缩放控制
			_initZoom:function(r){
				var self = this;
				var $div = $('<div style="position:absolute;top:10px;left:10px;width:20px;font-size:20px;font-weight:bold;color:#333333"  ><div id="up" style="height:20px;width:20px;background:#F3F3F3;border:#CCCCCC 1px solid;text-align:center;line-height:20px;cursor:pointer" >+</div><div id="down" style="height:20px;width:20px;background:#F3F3F3;border:#CCCCCC 1px solid;text-align:center;line-height:20px;cursor:pointer;margin-top:8px" >-</div></div>');
				this._settings.$elc.append($div);
				$div.find("#up").on("click",function(e){
					self._settings.panZoom.zoomIn(1);
					e.preventDefault();
				});
				$div.find("#down").on("click",function(e){
					self._settings.panZoom.zoomOut(1);
					e.preventDefault();
				});
			},
			_draw:function(r){
				this._drawEmptyMap(r);
				this._renderLocal();
			},
			draw:function(){
				this._draw(false);
			},
			_reDraw:function(){
				this._resetMap();
				this._renderLocal();
			},
			reDraw:function(){
				this._reDraw();
			},
			reDrawLocal:function(){
				this._drawEmptyMap(true);
				this._renderLocal(null,true);
			},
			getDataString:function(){
				var data = this._getData();
				var r  = {};
				if(data&&data.length>0){
					$.each(data,function(k,v){
						if(!r[v.name]){
							r[v.name] =[];
						}
						r[v.name].push(v.value);
					});
				}
				return $.toJSON(r);
			},
			getUrl:function(){
				return this.options.url;
			},
			getChartType:function(){
				return "rumMap";
			},
			getExtattr:function(){
				var  extAttr = [];
				extAttr.push({name:"location",value:this.options.location});
				return $.toJSON(extAttr);
			},
			_destroy:function(){
				var $fs = this._getForms();
				if($fs.length>0){
					$fs.off("change."+this._settings.UUID);
				}
				$(window).off("resize."+this._settings.UUID);
				if(this._settings.tooltip){
					this._settings.tooltip.destroy();
				}
			},

		});
		
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
			}
		}
		return defaultValue;
	}	
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
(function () {
    'use strict';
    /*jslint browser: true*/
    /*global Raphael*/
    
    function findPos(obj) {
        var posX = obj.offsetLeft, posY = obj.offsetTop, posArray;
        while (obj.offsetParent) {
            if (obj === document.getElementsByTagName('body')[0]) {
                break;
            } else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }
    
    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];

        return { x: x, y: y };
    }

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },

        pan: function (deltaX, deltaY) {
            this.applyPan(deltaX * -1, deltaY * -1);
        },

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        }
    },

        PanZoom = function (el, options) {
            var paper = el,
                container = paper.canvas.parentNode,
                me = this,
                settings = {},
                initialPos = { x: 0, y: 0 },
                //deltaX = 0,
                //deltaY = 0,
                mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

            this.enabled = false;
            this.dragThreshold = 5;
            this.dragTime = 0;
    
            options = options || {};
    
            settings.maxZoom = options.maxZoom || 9;
            settings.minZoom = options.minZoom || 0;
            settings.zoomStep = options.zoomStep || 0.1;
            settings.initialZoom = options.initialZoom || 0;
            settings.initialPosition = options.initialPosition || { x: 0, y: 0 };
    
            this.currZoom = settings.initialZoom;
            this.currPos = settings.initialPosition;
            
            function repaint(deltaX,deltaY) {
                me.currPos.x = me.currPos.x + deltaX;
                me.currPos.y = me.currPos.y + deltaY;
                
                var newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                    newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep));
    
                if (me.currPos.x < 0) {
                    me.currPos.x = 0;
                } else if (me.currPos.x > (paper.width * me.currZoom * settings.zoomStep)) {
                    me.currPos.x = (paper.width * me.currZoom * settings.zoomStep);
                }
    
                if (me.currPos.y < 0) {
                    me.currPos.y = 0;
                } else if (me.currPos.y > (paper.height * me.currZoom * settings.zoomStep)) {
                    me.currPos.y = (paper.height * me.currZoom * settings.zoomStep);
                }
                paper.setViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight);
            }
            
            function dragging(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                    newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep)),
                    newPoint = getRelativePosition(evt, container);
    
                var deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.width) * -1;
                var deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.height) * -1;
                initialPos = newPoint;
    
                repaint(deltaX,deltaY);
                me.dragTime += 1;
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            function applyZoom(val, centerPoint) {
                if (!me.enabled) {
                    return false;
                }
                me.currZoom += val;
                if (me.currZoom < settings.minZoom) {
                    me.currZoom = settings.minZoom;
                } else if (me.currZoom > settings.maxZoom) {
                    me.currZoom = settings.maxZoom;
                } else {
                    centerPoint = centerPoint || { x: paper.width / 2, y: paper.height / 2 };
    
                    var deltaX = ((paper.width * settings.zoomStep) * (centerPoint.x / paper.width)) * val;
                    var deltaY = (paper.height * settings.zoomStep) * (centerPoint.y / paper.height) * val;
    
                    repaint(deltaX,deltaY);
                }
            }
    
            this.applyZoom = applyZoom;
            
            function handleScroll(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    delta = evt.detail || evt.wheelDelta * -1,
                    zoomCenter = getRelativePosition(evt, container);
    
                if (delta > 0) {
                    delta = -1;
                } else if (delta < 0) {
                    delta = 1;
                }
                
                applyZoom(delta, zoomCenter);
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            repaint(0,0);
    
            container.onmousedown = function (e) {
                var evt = window.event || e;
                if (!me.enabled) {
                    return false;
                }
                me.dragTime = 0;
                initialPos = getRelativePosition(evt, container);
                container.className += " grabbing";
                container.onmousemove = dragging;
                document.onmousemove = function () { return false; };
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            };
    
            container.onmouseup = function (e) {
			    var evt = window.event || e;
                //Remove class framework independent
                document.onmousemove = null;
                container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
                container.onmousemove = null;
				if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            };
    
            if (container.attachEvent) {//if IE (and Opera depending on user setting)
                container.attachEvent("on" + mousewheelevt, handleScroll);
            } else if (container.addEventListener) {//WC3 browsers
                container.addEventListener(mousewheelevt, handleScroll, false);
            }
            
            function applyPan(dX, dY) {
                //deltaX = dX;
                //deltaY = dY;
                repaint(dX,dY);
            }
            
            this.applyPan = applyPan;
        };

    PanZoom.prototype = panZoomFunctions;

    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

}());
