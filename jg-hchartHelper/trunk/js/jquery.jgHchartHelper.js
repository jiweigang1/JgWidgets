/**
 * jg-hchartHelper
 * Licensed  Apache Licence 2.0
 * Version : 1.0.0
 * Author JiGang 2014-12-27
 *
*/
/**
*
*	forms-a	closest-a
*	froms可以指定多个组
*
*
*/
(function($){
	if(window.Highcharts){
		Highcharts.setOptions({
			global: {
				useUTC: false
		}});
		Highcharts.Tick.prototype.handleOverflow = function(indxex,xy){
			return true;
		};
	}
	$.widget("jgWidgets.jgHchartHelper",{
		options:{
			chartType 		  :null,
			ajaxType		  :"post",
			chartId	  		  :null,
			chartWidth		  :null,
			chartHeight		  :null,
			url		  		  :null,
			params	  		  :null,
			forms	  		  :null,
			tooltipGroup	  :null,
			webContext		  :null,
			onSeriesClick	  :null,
			onPointClick	  :null,	
			autoRefresh		  :false,
			apdex			  :false,
			showAggregateLable:true,
			showYRangeBar	  :false,
			addLegendHeight	  :false,	
			hchartSetting	  :null,
			logoUrl			  :null,
			showWaitting	  :true,
			windowResize	  :true,		
			onReceiveData	  :null,
			showApdexT        :false,
			animation		  :true,
			forceLoadForm	  :false,
			//group相同的Chart的最大值为最大值那个chart
			eqYGroup		  :null,	
			
			
		},
		_create:function(){
			var self = this;
			this._UUID = "helper"+new Date().getTime();
			this.__initParams();
			this.element.addClass("jg-hchart-helper");
			this.el			= this.element;
			this.$el		= this.el;
			this.$elC		= null;
			this.setting    ={
				url		:"",
				data	:[],
				height	:200,
				width	:200,
				events	:{
						seriesClick :null,
						pointClick	:null
				},
				eqValues:{}
			}
			
			this._settings = {};
			
			this.chartSetting 		= null;
			this.highChart		  	= null;
			this.dataChartSetting	= null;
			if(this.options.windowResize){
				$(window).on("resize."+this._UUID,function(){
					if(!self.$el.is(":visible")){
						return;
					}
					if(self._timeOutResize){
						clearTimeout(self._timeOutResize);
					}
					self._timeOutResize = setTimeout(function(){
						self._timeOutResize = null;
						self.reDrawLocal();
					},20);
					
				});	
			}
			this.draw();
			
		},
		__initParams:function(){
		  this.options.chartType  	  		 = getValue(this.element,"chartType",this.options.chartType);
		  this.options.chartId    	  		 = getValue(this.element,"chartId",this.options.chartId);
		  this.options.chartWidth 	  		 = getValue(this.element,"chartWidth",this.options.chartWidth);
		  this.options.chartHeight 	  		 = getValue(this.element,"chartHeight",this.options.chartHeight);
		  this.options.url 		  	  		 = getValue(this.element,"url",this.options.url);
		  this.options.params	  	  		 = getValue(this.element,"params",null,"object");
		  this.options.forms	  	  		 = getValue(this.element,"forms",null);
		  this.options.tooltipGroup	  		 = getValue(this.element,"tooltipGroup",this.options.tooltipGroup);
		  this.options.webContext	  		 = getValue(this.element,"webContext",this.options.webContext);
		  this.options.onSeriesClick  		 = getValue(this.element,"onSeriesClick",this.options.onSeriesClick,"function");
		  this.options.onPointClick	  		 = getValue(this.element,"onPointClick",this.options.onPointClick,"function");
		  this.options.autoRefresh	  		 = getValue(this.element,"autoRefresh",this.options.autoRefresh,"boolean");
		  this.options.apdex	 	  		 = getValue(this.element,"apdex",this.options.apdex,"boolean");
		  this.options.showAggregateLable	 = getValue(this.element,"showAggregateLable",this.options.showAggregateLable,"boolean");
		  this.options.showYRangeBar	 	 = getValue(this.element,"showYRangeBar",this.options.showYRangeBar,"boolean");
		  this.options.addLegendHeight	 	 = getValue(this.element,"addLegendHeight",this.options.addLegendHeight,"boolean");
		  this.options.hchartSetting	 	 = getValue(this.element,"hchartSetting",this.options.hchartSetting,"object");
		  this.options.logoUrl	 	 		 = getValue(this.element,"logoUrl",this.options.logoUrl);
		  this.options.showWaitting	 	 	 = getValue(this.element,"showWaitting",this.options.showWaitting,"boolean"); 
		  
		  this.options.onComplete			 = getValue(this.element,"onComplete",	 this.options.onComplete,"function");
		  this.options.onReceiveData		 = getValue(this.element,"onReceiveData",this.options.onReceiveData,"function");
		  this.options.showApdexT		 	 = getValue(this.element,"showApdexT",	 this.options.showApdexT,"boolean");
		  this.options.animation		 	 = getValue(this.element,"animation",	 this.options.animation,"boolean");
		  this.options.forceLoadForm		 = getValue(this.element,"forceLoadForm",this.options.forceLoadForm,"boolean");
		  this.options.eqYGroup		 		 = getValue(this.element,"eqYGroup",this.options.eqYGroup);
		  
		},
		//初始化url
		_initUrl:function(){
			if(this.options.url){
			   this.setting.url	= this.options.url;
			}
			if(this.setting.url&&this.options.chartId){
				this.setting.url = connectUrl(this.setting.url,"chartId="+this.options.chartId);
			}
		},
		
		//初始化Form 的绑定事件
		_initParams:function(r){
			var self = this;
			if(this.options.forms){
				var $fs = this._getForms();
					if($fs.length>0){
						if(this.options.autoRefresh&&!r){
							$fs.off("change."+this._UUID);
							$fs.on("change."+this._UUID,function(e,type){
								if(self.$el.is(":visible")){
									if("updateChartData"==type){
										self.updateChartData();
									}else{
										self.reDraw();
									}
								}
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
				if(this.options.forceLoadForm){
					this._settings.forms = null;
				}
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
	//初始化高度和宽度
	_initHeightAndWidth:function(){
		if(this.options.chartWidth){
			if(this.options.chartWidth.indexOf("%")>0){
				this.setting.width = this.$el.innerWidth() * ( parseFloat(this.options.chartWidth.substring(0,this.options.chartWidth.indexOf("%"))) / 100.0) ;
			}else{
				this.setting.width = this.options.chartWidth;
			}
		}else{
			this.setting.width	= this.$el.innerWidth();	
		}
		
		if(this.options.chartHeight){
			if(this.options.chartHeight.indexOf("%")>0){
				this.setting.height = this.$el.innerHeight() * ( parseFloat(this.options.chartHeight.substring(0,this.options.chartHeight.indexOf("%"))) / 100.0) ;
			}else{
				this.setting.height = this.options.chartHeight;
			}
		}else{
			if(this.$el.css("height")==="0px"||this.$el.css("height")==="auto"){
			   this.$el.css("height",this.setting.height);
			}else{
				this.setting.height= this.$el.innerHeight();
			}
			
		}
		
		this.setting.height = parseInt(this.setting.height);
		this.setting.width	= parseInt(this.setting.width);
	},
	
	_createElc:function(){
		this.$elC = $('<div class="rum-chart-container" ></div>');
		this.$elC.css({width:this.setting.width,height:this.setting.height});
		if(this.options.showYRangeBar){
			this.$elC.css({float:"left",width:this.setting.width-20});
		}
		this.$el.append(this.$elC);
		return this.$elC;
	},
	_setElcSize:function(width,height){
		if(!this.$elC){
			return;
		}
		this.$elC.css({width:width,height:height});
		if(this.options.showYRangeBar){
			this.$elC.css({float:"left",width:width-20});
		}
	},
	
	//初始化事件
	_initEvents:function(){
		var self = this;
		if(this.options.onSeriesClick){
			if($.isFunction(this.options.onSeriesClick)){
				this.setting.events.seriesClick = this.options.onSeriesClick;
			}else if(typeof this.options.onSeriesClick == "string"){
				var f;
				try{
					f = eval(this.options.onSeriesClick);
				}catch(e){
					
				}
				if($.isFunction(f)){
					this.setting.events.seriesClick = f;
				}
			}
		}
	
		if(this.options.onPointClick){
			if($.isFunction(this.options.onPointClick)){
				this.setting.events.pointClick = this.options.onPointClick;
			}else if(typeof this.options.onPointClick == "string"){
				var f;
				try{
					f = eval(this.options.onPointClick);
				}catch(e){
					
				}
				if($.isFunction(f)){
					this.setting.events.pointClick = f;
				}
			}
		}
		
		if(this.options.onComplete){
			if($.isFunction(this.options.onComplete)){
				this.setting.events.onComplete = this.options.onComplete;
			}else if(typeof this.options.onComplete == "string"){
				var f;
				try{
					f = eval(this.options.onComplete);
				}catch(e){
					
				}
				if($.isFunction(f)){
					this.setting.events.onComplete = f;
				}
			}
		}
	},
	//初始化配置信息
	_initChartSetting:function(chartSetting){
		var self    = this;
		var $c 		= this.$el;	
		var $elC	= this.$elC;
		var opts	= this.options;
		var cs 		= chartSetting;
		var os = {
					global:{
							useUTC:false
					},
					chart	:{
						reflow:false,
						renderTo:$c[0],
						borderWidth:0,
						plotBorderWidth:0
					},
					credits :{enabled:false},
					title:{
						text:""
					},
					subtitle:{
						text:""
					},
					tooltip:{
						shared: false,
						useHTML:true,
						formatter:function(){
							return toolTipFormatter(this);
						},
						style: {
							padding: 1
						}
						
					},
					legend:{
						borderWidth: 1,
						borderRadius: 5,
						itemStyle:{"fontWeight": "normal"}
					}
				 };
			if(!this.options.addLegendHeight){
				os.chart.height = this.setting.height;
			}
			
			
			os.chart.width  = this.setting.width;
			
			os.chart.marginTop 		= 26;
			os.chart.spacingBottom	= 24;
			
		if(opts.tooltipGroup){
			//plotOptions.series.point.events
			os.plotOptions = {
				series:{
					point:{
						events:{
							mouseOut:function(){
								var group =$(document).data("rum-chart-toolTipGroup-"+self.options.toolTipGroup);
								var selfChart  = self.highChart; //$c.data("chart");
								if(!group||group.length==0){
									return;
								}
								for(var i=0;i<group.length;i++){
									if(group[i]==selfChart){
										continue;
									}
								   hideChartTooltip(group[i],this.series.name, this.x,this.category);
								}
								
							},
							mouseOver:function(){
								var group =$(document).data("rum-chart-toolTipGroup-"+self.options.toolTipGroup);
								var selfChart  = self.highChart; //$c.data("chart");
								if(!group||group.length==0){
									return;
								}
								for(var i=0;i<group.length;i++){
									if(group[i]==selfChart){
										continue;
									}
								   showChartTooltip(group[i],this.series.name,this.x,this.category);
								}
							}
						}
					}
				}
			};
		}
		os = $.extend(true,{},cs,os);
		if(this.setting.events.pointClick){
			os = $.extend(true,{},os,{
									plotOptions:{ 
												  series:{
													point:{
														events:{
															click:function(){
																var params = this.params;
																var p = {};
																if(params){
																	if(typeof params=="string"){
																		try{
																			p = $.parseJSON(params)
																		}catch(e){
																		}
																	}else if(typeof params=="object"){
																		p = params;
																	}
																}
																self.setting.events.pointClick.call(self.$el,this,p,self);
															}
														}
													}
												  }
												}
								});	
		}
		
		if(this.setting.events.seriesClick){
			os = $.extend(true,{},os,{
									plotOptions:{
													series:{
														events:{
															click:function(){
																var params = this.options.params;
																var p = {};
																if(params){
																	if(typeof params=="string"){
																		try{
																			p = $.parseJSON(params)
																		}catch(e){
																		}
																	}else if(typeof params=="object"){
																		p = params;
																	}
																}
																self.setting.events.seriesClick.call(self.$el,this,p);
															}
														}
													}	
												}
								});	
		}
		if(opts.chartType){
			os.chart.type   = opts.chartType;
		} 
		
		os = $.extend(true,os,{
			plotOptions:{
					series:{
						animation:opts.animation
					}
			}
		});
		
		if(os.chart.type&&os.chart.type.toLowerCase()=="area"){
			os = $.extend(true,{},os,{
				 plotOptions:{
					area:{
						stacking :"normal"
					},
					series: {
						stacking: 'normal'
					}
				 }		
			});
		}
		if(opts.hchartSetting){
			os = $.extend(true,{},os,opts.hchartSetting);
		}
		if(os.chart.type=="pie"){
			os = $.extend(true,{},os,{
					plotOptions: {
						pie: {
							dataLabels: {
								enabled: false
							},
							showInLegend: true
						}
					}
					/**
					,
					legend: {
							align: 'right',
							verticalAlign: 'top',
							y: 100
					}
					**/
			});
		}
		if(opts.apdex){
			os = $.extend(true,{},os,{
				 yAxis:{
					title: {
						text: ""
					},
					max :1,
					min: 0,
					tickInterval: 0.01,
					minorGridLineWidth:0,
					labels: {
						formatter: function() {
								if(this.value==0||this.value==0.7||this.value==0.85||this.value==0.94||this.value==1){
									return this.value;
								}else{
									return null;
								}
								
						}
					},
					ticks:{
						handleOverflow:function(index, xy){
							return true;
						}
					}
				}
			});
		}
		
		return os;
	},
	_addLegendHeight:function(){
		if(this.options.addLegendHeight){
			var height = this.highChart.legend.legendHeight;
			if(height>0){
				this.setting.height+=height;
				this.$el.height(this.$el.height()+height);
				this.$elC.height(this.setting.height);
				this.highChart.setSize(null,this.setting.height);
			}
		}
	},
	//设置几个图相等的Y轴最大值
	//data {ymax:,ytickInterval:}
	setEqMaxYValue:function(id,data){
		this.setting.eqValues[id] = data;
		if(this.highChart){
		   this._doSetEqMaxYValue();
		}
	},
	_setOtherChartsEqMaxYValue:function(){
	 var okkk = this.highChart.yAxis[0];
	  if(this.highChart){
		var group = this.options.eqYGroup;
		if(group){
			var $charts =  $('div.chart[eqYGroup="'+group+'"]').not(this.element).jgHchartHelper();
				$charts.jgHchartHelper("setEqMaxYValue",this._UUID,{ymax:this.highChart.yAxis[0].max,ytickInterval:this.highChart.yAxis[0].tickInterval})
		}
	  }
	},
	_doSetEqMaxYValue:function(){
		if(this.highChart){
			var oldMaxY = this.highChart.yAxis[0].max;
			var data;
			for(var id in this.setting.eqValues){
				if(this.setting.eqValues[id].ymax>this.highChart.yAxis[0].max){
					data = this.setting.eqValues[id];
				}
			}
			if(data&& data.ymax > oldMaxY){
				//alert(data.ytickInterval+10)
				this.highChart.yAxis[0].update({
												 tickInterval:data.ytickInterval
											   });
				this.highChart.yAxis[0].setExtremes(this.highChart.yAxis[0].min,data.ymax,true,false);
				
			}
		}
	},
	_createYRangeBar:function(){
		var self = this;
		if(this.options.showYRangeBar){
			if(!self.highChart){
				return false;
			}
		var y = self.highChart.yAxis[0];
			var $barDiv = $('<div class="rum-chart-YRangeBar" style="float:left;" > </div>');
				$barDiv.css({height:y.height,top:y.top});
			var init   = false; 
			var min	   = y.min;
			var max	   = y.max;
			var tid	  = -1;
			this.$elC.before($barDiv);
				$barDiv.slider({
					orientation: "vertical",
					range: true,
					values: [ 0, 100],
					slide: function( event, ui ) {
							 
							if(!init){
								max = y.max
								min = y.min;
								init=true;
							}
							if(tid>0){
								clearTimeout(tid);
								//console.log("bb");
							}
							tid = setTimeout(function(){
								//y.options.startOnTick =true;
								//y.options.endOnTick=true;								
								y.setExtremes(min+(max-min)*ui.values[0]/100,min+(max-min)*ui.values[1]/100);
							},200);
					}
				});
		}
	},
	
	_drawChart:function(chartSetting){
		//如果初始化过清除
		this._clear();
		var $c 	  = this.$el;
		this._createElc();
			chartSetting.chart.renderTo= this.$elC[0];
			
		var cs 	  = chartSetting;
		var chart = new Highcharts.Chart(cs);
		this.highChart =chart;
		this._addLegendHeight();
		if(this.options.tooltipGroup){
			var group =$(document).data("rum-chart-toolTipGroup-"+this.options.toolTipGroup);
				if(!group){
					group=[];
				}
				group.push(chart);
			$(document).data("rum-chart-toolTipGroup-"+this.options.toolTipGroup,group);
		}
		this._creatWaterMark();
		this._creatAggregateLable();
		this._creatYaxisTickUnit();
		this._createApdex();
		this._createYRangeBar();
	},
	_clear:function(){
		var  $this 	 =  this.$el;
		var  chart	 =  this.higchart;
		if(chart){
			var opts  = chart.opts;
			if(opts&&opts.tooltipGroup){
				var group = $this.data("rum-chart-toolTipGroup-"+opts.toolTipGroup);
				  if(group&&group.length>0){
					for(var i=0;i<group.length;i++){
						if(group[i]==chart){
							group.splice(i,1)
							break;
						}
					}
				  }
			}
		}
		this.$el.empty();
	},
	_creatAggregateLable:function(){
		var  $this 	 = this.$el;
		var  chart 	 = this.highChart;
		var  opts	 = this.options; 
		//面积图都为堆积图，不显示平均值
		if(!opts.showAggregateLable||chart.options.chart.type=="area"){
			return;
		}
		if(!chart){
			return;
		}
		var text = "";
		if(chart.options.aggregateValue){
			text = chart.options.aggregateValue;
		}
		if(!(chart.options.aggregateValue!=undefined&&chart.options.aggregateValue>0) ){
			return;
		}
		if(chart.yAxis[0].options.tickUnit){
			text = text+" ("+chart.yAxis[0].options.tickUnit+")"; 	
		}
		var atext = chart.renderer.text("平均值："+text,-1000,-1000).css({
                fontSize: '12px',
				"font-family": "Arial, 宋体, sans-serif"
            });
			atext.add();
		
		this._settings.aggregateLable = atext;
		this._resetAggregateLablePosition();
		
		//以下处理显示ApdexT

        if(!opts.showApdexT){
            return;
        }

        if(chart.options.params && chart.options.params.apdexT){
            text = chart.options.params.apdexT;
        }
        if(  !(chart.options.params.apdexT != undefined && chart.options.params.apdexT > 0) ){
            return;
        }

        var apdextext = chart.renderer.text("应用服务器 Apdex T："+text+"(ms)",-1000,-1000).css({
            fontSize: '12px',
            "font-family": "Arial, 宋体, sans-serif"
        });
        apdextext.add();
        var apdexbox	  = apdextext.getBBox();
		var box			  = atext.getBBox();
        _x    = this.highChart.plotBox.width - box.width - apdexbox.width - 20;
        if(!isNaN(_x)){
            apdextext.attr({x:_x,y:14});
        }
		
		
	},
	_setAggregateLableValue:function(value,unit){
		if(value<=0||!this._settings.aggregateLable){
			return;
		}
		if(!unit){
			if(this.highChart){
				unit = this.highChart.yAxis[0].options.tickUnit;
			}else{
				unit = "";
			}
		}
		unitText = "";
		if(unit != undefined){
			unitText = "("+unit+")"
		}
		
		this._settings.aggregateLable.attr("text","平均值:"+value+unitText);
		this._resetAggregateLablePosition();
	},
	_resetAggregateLablePosition:function(){
		if(!this._settings.aggregateLable){
			return;
		}
		this._settings.aggregateLable.attr({x:this.highChart.plotBox.width-2,y:14,"text-anchor":"end"});
	},
	
	_creatWaterMark:function(){
		var  $this 	 = this.$el;
		var  chart 	 = this.highChart;
		var  opts	 = this.options; 
		if(!chart){
			return;
		}
		if(this.setting.width>500&&opts.logoUrl){
				var waterWidth  = 96;
				var waterHeight = 10;
				var x		= chart.options.chart.width  - waterWidth;
				var y		= chart.options.chart.height;// - waterHeight;
				var water = chart.renderer.image(opts.logoUrl, chart.plotLeft+chart.plotWidth-waterWidth, y-14, waterWidth, waterHeight).add();
		}
	},
	_showWaitting:function(){
		this.$el.find("div").remove();
		var html ='<div class="waitting_box"  ><span class="waitting_icon" style="" ></span></div>';
		this.$el.append(html);
		var $waitting_box = this.$el.find(".waitting_box");
			$waitting_box.height(this.setting.height).width(this.setting.width);
		var $waitting_icon= this.$el.find(".waitting_icon");
			$waitting_icon.css({"margin-left":this.setting.width/2-$waitting_icon.width()/2,"margin-top":this.setting.height/2-$waitting_icon.height()/2});
	},
	_showErr:function(err){
		this.$el.find("div").remove();
		var html ='<div class="err_box"  ><span class="err_message_box"><span class="err_icon"></span><span class="err_message" style="" ></span></span></div>';
		this.$el.append(html);
		var $err_box = this.$el.find(".err_box");
			$err_box.height(this.setting.height);//.width(this.setting.width)
		var $err_message_box= this.$el.find(".err_message_box");
		var $err_message	= this.$el.find(".err_message");
			$err_message.text(err);
			$err_message_box.css({"margin-left":this.setting.width/2-$err_message_box.width()/2,"margin-top":this.setting.height/2-$err_message_box.height()/2});
			
	},
	_hideWaittingAndErr:function(){
		var $waitting_box = this.$el.find(".waitting_box"); 
		if($waitting_box.length>0){
			$waitting_box.remove();
		}
	},
	
	_creatYaxisTickUnit:function(){
		var chart 	= this.highChart;
		var yAxises	= chart.yAxis;
		for(var i=0;i<yAxises.length;i++){
			var se = yAxises[i];
			var tick = se.options.tickUnit;
			if(tick){
				tick ="("+tick+")";
				var te 		= chart.renderer.text(tick,-1000,-1000).add();
				var boxx	= te.getBBox();
				var x = se.left-10;
				if(i>0){
					//x = this.highChart.options.chart.width-x-10;
					x = this.highChart.options.chart.width-boxx.width-10;
				}
				if(x<4||isNaN(x)){
					x = 4;
				}	
				//te.attr({x:x,y:se.top-boxx.height/2});
				te.attr({
						  x:x,
						  y:14,
						  fontSize: '12px',
						  "font-family": "Arial, 宋体, sans-serif"
						});
			}
		}
	},
	
	//绘图
	_draw:function(r){
			   if(!r){
				  r = false;	
			   }
			   var self = this;
			   this._initUrl();	
			   this._initParams(r);
			   this._initHeightAndWidth(this.$el,this.options);
			   this._initEvents();
			   var url = this.setting.url;
			   if(this.options.webContext){
				   url = this.options.webContext + url;	
			   }
			   $.ajax({
					type:this.options.ajaxType,
					url:  url,
					data:this._getData()||{},
					dataType:"text",
					beforeSend:function(requset){
					  if(self.options.showWaitting){
						 self._showWaitting();
					  }	
					},
					error:function(){
						self._showErr("加载图片错误！");	
					},
					success:function(chart){
						try{
							chart = eval("("+chart+")");
							if(self.options.onReceiveData){
									self.options.onReceiveData.call(null,chart);
									self.element.trigger("onReceiveData");
							}
						}catch(e){
							try{
								chart = eval(chart);
								this.dataChartSetting = chart;
								if(self.options.onReceiveData){
									self.options.onReceiveData.call(null,chart);
									self.element.trigger("onReceiveData");
								}
							}catch(e){
								if(console){
									console.log(e);
								}
								self._showErr("加载图片错误！");	
							}
							return;
						}
						if((!chart.series||chart.series.length==0)||(chart.series.length==1&&(!chart.series[0].data||chart.series[0].data.length==0) )){
							self._showErr("暂无数据！");	
							return;
						}
						chart = self._initChartSetting(chart);
						self._drawChart(chart);
						
						
						
						self._doSetEqMaxYValue();
						self._setOtherChartsEqMaxYValue();
					},
					complete:function(){
						if(self.setting.events.onComplete){
							setTimeout(function(){
							    try{	
									self.setting.events.onComplete.call(self);
								}catch(e){
								
								}
							},1000);
					    }
					}
			   });
	},
	
	draw:function(){
		this._draw(false);
	},
	reDraw:function(){
		this._draw(true);
	},
	reDrawLocal:function(){	
		this._initHeightAndWidth();
		this._setElcSize(this.setting.width,this.setting.height);
		if(this.highChart){
			this.highChart.setSize(this.setting.width,this.setting.height,false);
		}
		if(this.options.showAggregateLable){
			this._resetAggregateLablePosition();
		}
		
	},
	_getUrl:function(){
		var url = this.setting.url;
		if(this.options.webContext){
			url = this.options.webContext + url;
		}
		return url;  
	},
	//更新数据
	updateChartData:function(){
		var self = this;
		var url = this._getUrl();
		$.ajax({
			type:this.options.ajaxType,
			url:  url,
			data:this._getData()||{},
			dataType:"text",
		}).done(function(data){
			var data = $.parseJSON(data);
			if(!data){
				return;
			}
			if(!self.highChart){
				return;
			}
			while(self.highChart.series.length > 0){
				self.highChart.series[0].remove(false);
			}
			for(var i=0;i<data.series.length;i++){
				var s = data.series[i];
					s.animation = false;
				self.highChart.addSeries(s,false,false);
			}
			self.highChart.redraw(false);
			if(self.options.showAggregateLable){
				self._setAggregateLableValue(data.aggregateValue);
			}
			
		});
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
		return this.options.chartType;
	},
	_createApdex:function(){
		if(!this.options.apdex){
			return;
		}
		var lines  = [0,0.7,0.85,0.94,1];
		var points = [];
			$.each(this.highChart.yAxis[0].ticks,function(k,v){
			if(!((k==0|| k==0.7 || k==0.85|| k==0.94||k==1 ))){
				v.gridLine.hide();
			}else{
			
			}
		});
		for(var i=0;i<lines.length;i++){
			if(this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList instanceof Array){
				points.push({x:this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList[0].x,y:this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList[0].y});	
			}else if(this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList.getItem){
				points.push({x:this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList.getItem(0).x,y:this.highChart.yAxis[0].ticks[lines[i]].gridLine.element.pathSegList.getItem(0).y});	
			}
			
		}
		
		var colors = ["#f39e10","#e0da0c","#2e9fcb","#75a722"];
		for(var i=0;i<colors.length;i++){
			var start = points[i];
			var end	  = points[i+1];
			if(start&&end){
				var path1 = this.highChart.renderer.path(["M", start.x, start.y,"L", end.x, end.y])
					path1.attr({"stroke-width":10,stroke:colors[i]});
					path1.add();
			}
			
		}
		
			
		
		
	},
	_destroy:function(){
	 	var $fs = this._getForms();
		if($fs.length>0){
			$fs.off("change."+this._UUID);
		}
		$(window).off("resize."+this._UUID);
	},
	getExtattr:function(){
		var  extAttr = [];
			 extAttr.push({name:"showYRangeBar",value:this.options.showYRangeBar});
			 extAttr.push({name:"addLegendHeight",value:this.options.addLegendHeight});
		return $.toJSON(extAttr);	 
	},
	isMaxY:function(point){
		var self = this;
		if(this._maxPoint){
			return point    === this._maxPoint;
		}else{
			var max, x , y;
			for(var i=0;i<self.highChart.series.length;i++){
				for(var k=0;k<self.highChart.series[i].yData.length;k++){
					if(max){
						if(max<self.highChart.series[i].yData[k]){
							max = self.highChart.series[i].yData[k];
							x=i;
							y=k;
						}
					}else{
							max = self.highChart.series[i].yData[k];
							x=i;
							y=k;
					}
				}
			}
			this._maxPoint = self.highChart.series[x].data[y];
			return point    === this._maxPoint;
		}
	}
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
					}catch(e){
						if(console){
							console.log(e);
						}
					}
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
	
	function findTooltipObject(chart,seriesName,x,categoriy){
		var series ;
		if(chart.series){
			for(var i=0;i<chart.series.length;i++){
				if(chart.series[i].name == seriesName){
					series = chart.series[i];
					break;
				}
			}
		}else if(chart.getSelectseries){
		
		
		}
		
		
		if(!series){
			return null ;
		}
		var pindex = -1;
		for(var i=0;i<series.points.length;i++){
			if(   (series.points[i].categoriy  &&  series.points[i].categoriy==categoriy  ) || ( series.points[i].x && series.points[i].x==x)){
					pindex = i;
				break;
			}
		}
		if(pindex<0){
			return null;
		}
		
		return {series:series,data:series.data[pindex],point:series.points[pindex]};
	}
	
	
	
	
	
	
	function  showChartTooltip(chart,seriesName,x,categoriy){
		var obj = findTooltipObject(chart,seriesName,x,categoriy);
			if(!obj){
				return ;
			}
			obj.data.setState('hover');
			chart.tooltip.refresh(obj.point);
	}
	
	
	function hideChartTooltip(chart,seriesName,x,categoriy){
		var obj = findTooltipObject(chart,seriesName,x,categoriy);
			if(!obj){
				return ;
			}
			obj.data.setState();
			chart.tooltip.hide();
	}
	
	function connectUrl(url,param){
		if(url.indexOf("?")>0){
			url += "&"+param
		}else{
			url += "?"+param;
		}
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
	
	function toolTipFormatter(p){
		var point 	= p.point;
		if(!point){
		   return true;
		}
		var tooltip	= point.tooltip;
		var name =  p.series.chart.options.chart.type =="pie"?null:p.series.name;
		if(!tooltip){
			return name+"</br>"+p.x+":"+p.y;
		}
		try{
			tooltip = $.parseJSON(tooltip);
			var t  = "<table>";
				if(name){
					t +=	"<tr><td colspan=\"2\" align=\"center\" >"+name+"</td></tr>"
				}
				
				
				t +=	"<tr><td colspan=\"2\">"+tooltip.title+"</td></tr>"
			if(tooltip.data&&tooltip.data.length>0){
			  for(var i=0;i<tooltip.data.length;i++){
				var title = tooltip.data[i].title; 
				var value = tooltip.data[i].value; 
				var unit = tooltip.data[i].unit;
					if(unit){
					  unit = "("+unit+")";	
					}else{
						unit ="";
					}
				t +=   "<tr><td>"+title+":</td><td>"+value+unit+"</td></tr>"
			  }
			}	
				t += "</table>";	
			return t;
		}catch(e){
			if(typeof tooltip =="string"){
				return tooltip;
			}else{
				return true;
			}
		}
	}
})(jQuery);