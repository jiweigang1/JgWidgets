/**
 * jg-hchartHelper
 * Licensed  Apache Licence 2.0
 * Version : 1.0.0
 * Author JiGang 2014-12-27
 *
*/

(function($){
	if(window.Highcharts){
		Highcharts.setOptions({
			global: {
				useUTC: false
		}});
	}
	$.widget("jgWidgets.jgHchartHelper",{
		options:{
			chartType 		  :null,
			ajaxType		  :"post",
			chartId	  		  :null,
			chartWidth		  :null,
			chartHight		  :null,
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
			
			onReceiveData	  :null
			
			
		},
		_create:function(){
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
				}
			}	
			this.chartSetting 		= null;
			this.highChart		  	= null;
			this.dataChartSetting	= null;
			this._initParams();
			this.draw();
			
		},
		__initParams:function(){
		  this.options.chartType  	  		 = getValue(this.element,"chartType",this.options.chartType);
		  this.options.chartId    	  		 = getValue(this.element,"chartId",this.options.chartId);
		  this.options.chartWidth 	  		 = getValue(this.element,"chartWidth",this.options.chartWidth);
		  this.options.chartHight 	  		 = getValue(this.element,"chartHight",this.options.chartHight);
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
		  
		  this.options.onReceiveData		 = getValue(this.element,"onReceiveData",this.options.onReceiveData,"function");
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
		
		//初始化参数
		_initParams:function(r){
			var self = this;
			//防止重绘时重复表单
			if(r){
				this.setting.data=[];
			}
			if(this.options.params){
				this.setting.data = serializeArrayObject(this.options.params);
			}
			if(this.options.forms){
				var fs 	 =  this.options.forms.split(/\s+/);
				var $fs	 =	$(fs.join());	
				if(fs.length>0){
					this.setting.data  = $.merge(this.setting.data,$fs.serializeArray());
					if(this.options.autoRefresh&&!r){
						$fs.change(function(e){
							if(self.$el.is(":visible")){
								self.reDraw();
							}
						});
					}
				}
			}
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
		
			chartSetting.chart.renderTo=this._createElc()[0];
			
		var cs 	  = chartSetting;
		var chart = new Highcharts.Chart(cs);
		this.highChart =chart;
		this._addLegendHeight();
		//$c.data("chart",chart);
		//$c.data("opts" ,this.options);
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
		var  rchart  =  $this.data("chart")
		if(!rchart){
			return;
		}
		var chart	= rchart.higchart;
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
			$this.removeData("chart opts");
		}
		this.$el.empty();
	},
	_creatAggregateLable:function(){
		var  $this 	 = this.$el;
		var  chart 	 = this.highChart;
		var  opts	 = this.options; 
		if(!opts.showAggregateLable){
			return;
		}
		if(!chart){
			return;
		}
		var text = "";
		if(chart.options.aggregateValue){
			text = chart.options.aggregateValue;
		}
		if(  !(chart.options.aggregateValue!=undefined&&chart.options.aggregateValue>0) ){
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
		var box	  = atext.getBBox();
		var _x    = chart.options.chart.width-box.width;
		if(!isNaN(_x)){
			atext.attr({x:_x,y:14});
		}	
		
	},
	
	_creatWaterMark:function(){
		var  $this 	 = this.$el;
		var  chart 	 = this.highChart;
		var  opts	 = this.options; 
		if(!chart){
			return;
		}
		// if(this.setting.height>500&&opts.logoUrl){
			// var logoImg = new Image();
				// logoImg.src		= opts.logoUrl;
				// logoImg.onload  = function() {
				// var waterWidth  = logoImg.width;
				// var waterHeight = logoImg.height;
				// var x		= chart.options.chart.width  - waterWidth;
				// var y		= chart.options.chart.height;// - waterHeight;
				// var water = chart.renderer.image(opts.logoUrl, chart.plotLeft+chart.plotWidth-waterWidth, chart.plotTop+chart.plotHeight+10, waterWidth, waterHeight).add();
			// }
		// }
		
		
		if(this.setting.width>500&&opts.logoUrl){
				var waterWidth  = 96;
				var waterHeight = 10;
				var x		= chart.options.chart.width  - waterWidth;
				var y		= chart.options.chart.height;// - waterHeight;
				var water = chart.renderer.image(opts.logoUrl, chart.plotLeft+chart.plotWidth-waterWidth, y-14, waterWidth, waterHeight).add();
		}
	},
	_showWaitting:function(){
		// var $err_box = this.$el.find(".err_box");
		// if($err_box.size()>0){
			// $err_box.remove();
		// }
		this.$el.find("div").remove();
		var html ='<div class="waitting_box"  ><span class="waitting_icon" style="" ></span></div>';
		this.$el.append(html);
		var $waitting_box = this.$el.find(".waitting_box");
			$waitting_box.height(this.setting.height).width(this.setting.width);
		var $waitting_icon= this.$el.find(".waitting_icon");
			$waitting_icon.css({"margin-left":this.setting.width/2-$waitting_icon.width()/2,"margin-top":this.setting.height/2-$waitting_icon.height()/2});
	},
	_showErr:function(err){
		// var $waitting_box = this.$el.find(".waitting_box");
		// if($waitting_box.size()>0){
			// $waitting_box.remove();
		// }
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
				var x = se.left-20;
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
					data:this.setting.data||{},
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
						if(!chart.series||chart.series.length==0){
							self._showErr("暂无数据！");	
							return;
						}
						chart = self._initChartSetting(chart);
						
						self._drawChart(chart);
					},
					complete:function(){
						
					}
			   });
			   this.$el.data("chart",this);
			   if(this.setting.events.onComplete){
					setTimeout(function(){
						try{
							self.setting.events.onComplete.call(self);
						}catch(e){
						
						}
						
					},1000);
			   }
	},
	
	draw:function(){
		this._draw(false);
	},
	reDraw:function(){
		this._draw(true);
	},
	getDataString:function(){
		var data = this.setting.data;
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
						v = eval(value)
					}catch(e){}
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