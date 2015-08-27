(function($){
	$.widget("jgWidgets.jgTimePanel", {
			 options:{
				timePeriodId:null,
				endTimeId	:null,
				timeZoneId	:null,
				timeTypeId	:null,
				onChange	:null
			 },
			 _create:function(){
				this._initOptions();
				this._initHtml();
				this._initEvent();
				this._initShow();
			 },
			 
			 _initOptions:function(){
				this.options.timePeriodId 	= getValue(this.element,"timePeriodId",		this.option.timePeriodId);
				this.options.endTimeId 		= getValue(this.element,"endTimeId",		this.option.endTimeId);
				this.options.timeZoneId 	= getValue(this.element,"timeZoneId",		this.option.timeZoneId);
				this.options.timeTypeId 	= getValue(this.element,"timeTypeId",		this.option.timeTypeId);
				this.options.onChange 		= getValue(this.element,"onChange",			this.option.onChange,"function");
				
			 },
			 _initHtml:function(){
				this.element.append('<span class="time-panel-time-holder"></span><span class="data_icon_down" ></span>');
				
				this._$timeHolder = this.element.find(".time-panel-time-holder");
				
				var html = '<div class="time_selection_w" style="z-index: 500;position: absolute;display: none;">\
								<table style="width: 100%; float:left;">\
									<tr>\
										<td>\
											<div class="time_font_w">\
												<input name="timeType" type="hidden">\
												<span class="time_font01">最近</span>\
												<div id="time_type" class="time_button01"></div>\
												<span class="time_font02">指定时间</span>\
											</div>\
											<div id="time_close" class="time_selection_close" title="关闭"></div>\
										</td>\
									</tr>\
									<tr class="r-time-panel">\
										<td style="height: 50px" align="center">\
											<div class="rumslider" style="width: 90%;float: none;position: relative;">\
												<select id="timeForm_timePeriod" class="time-period" style="display: none;">\
													<option value="30"  desc="30分钟" >30M</option>\
													<option value="60"  desc="1小时">1H</option>\
													<option value="360" desc="6小时" >6H</option>\
													<option value="720" desc="12小时">12H</option>\
													<option value="1440" desc="1天">&nbsp;&nbsp;1D</option>\
													<option value="4320" desc="3天">3D</option>\
													<option value="10080" desc="7天">7D</option>\
													<option value="20160" desc="14天">14D</option>\
													<option value="43200" desc="1月">1M</option>\
													<option value="86400" desc="2月">2M</option>\
													<option value="129600" desc="3月">3M</option>\
												</select>\
											</div>\
										</td>\
									</tr>\
									<tr class="a-time-panel">\
										<td>\
										  <table width="100%">\
											<tr>\
												<td width="50%"  valign="middle" ><input id="timeForm_fromTime" type="text" readonly="readonly" class="end_time_input m_top10"></td>\
												<td width="50%"  valign="middle"><input id="timeForm_endTime"  type="text"  readonly="readonly" class="end_time_input m_top10"></td>\
											</tr>\
											<tr>\
												<td width="50%"  valign="middle"><div class="end_time_calendar rumdatepicker datapicker-button-from "></div></td>\
												<td width="50%"  valign="middle"><div class="end_time_calendar rumdatepicker datapicker-button-end "></div></td>\
											</tr>\
										  </table>\
										</td>\
									</tr>\
									<tr>\
										<td align="center">\
											<div id="time_ok" style="float: none" class="btn_demo2 m_top30">设置</div>\
										</td>\
									</tr>\
									<tr>\
										<td>\
											<div class="time_zone" style="display: none;">\
												<div class="time_zone_font1">\
													<!-- 回到<br>30分钟 -->\
													&nbsp\
												</div>\
												<div class="time_zone_font2">\
													<!-- (GMT=0800)北京时间：北京、重庆、香港  -->\
												</div>\
												<div class="time_zone_font3">\
													<!-- 前进<br>30分钟  -->\
													&nbsp\
												</div>\
											</div>\
										</td>\
									</tr>\
								</table>\
							</div>';
				this._$panel = $(html);
				
				if(this.options.timePeriodId){
					this._$timePeriodValue = $("#"+this.options.timePeriodId);
					if(this._$timePeriodValue.length==0){
						this._$timePeriodValue = $('<input type="hidden" />');
						this.element.append(this._$timePeriodValue);
					}
				}else{
					this._$timePeriodValue = $('<input type="hidden" />');
					this.element.append(this._$timePeriodValue);
				}
				
				if(this.options.endTimeId){
					this._$endTimeValue = $("#"+this.options.endTimeId);
					if(this._$endTimeValue.length==0){
						this._$endTimeValue = $('<input type="hidden" />');
						this.element.append(this._$endTimeValue);
					}
				}else{
					this._$endTimeValue = $('<input type="hidden" />');
					this.element.append(this._$endTimeValue);
				}
				
				if(this.options.timeTypeId){
					this._$timeTypeValue = $("#"+this.options.timeTypeId);
					if(this._$timeTypeValue.length==0){
						this._$timeTypeValue = $('<input type="hidden" />');
						this.element.append(this._$timeTypeValue);
					}
				}else{
					this._$timeTypeValue = $('<input type="hidden" />');
					this.element.append(this._$timeTypeValue);
				}
				
				if(this.options.timeZoneId){
					this._$timeZoneValue = $("#"+this.options.timeZoneId);
					if(this._$timeZoneValue.length==0){
						this._$timeZoneValue = $('<input type="hidden" />');
						this.element.append(this._$timeZoneValue);
					}
				}else{
					this._$timeZoneValue = $('<input type="hidden" />');
					this.element.append(this._$timeZoneValue);
				}
				
				this._$timePeriod 			= this._$panel.find(".time-period");
				
				this._$endTime 	  			= this._$panel.find("#timeForm_endTime");
				this._$fromTime 	  		= this._$panel.find("#timeForm_fromTime");
				
				this._$timeType				= this._$panel.find('input[name="timeType"]');
				
				this._$datapickerButtonFrom = this._$panel.find(".datapicker-button-from");
				this._$datapickerButtonEnd  = this._$panel.find(".datapicker-button-end");
				
				this._$timeTypeButton		= this._$panel.find('#time_type');
				this._$closeButton			= this._$panel.find('#time_close');
				this._$okButton				= this._$panel.find('#time_ok');
				
				
				
				this._$rTimekPanel		= this._$panel.find(".r-time-panel");
				this._$aTimekPanel		= this._$panel.find(".a-time-panel");
				
				$("body").append(this._$panel);	
			 },
			 _setFromTime:function(date){
				this._$fromTime.datetimeEntry("setDatetime" ,date);
				this._$datapickerButtonFrom.datepicker("setDate",date);
				this._setEndTime(date);
			 },
			 _setEndTime:function(date){
				this._$endTime.datetimeEntry("setDatetime" ,date);
				this._$datapickerButtonEnd.datepicker("setDate",date);
			 },
			 _setMinEndTime:function(odate){
				var date = new Date()
					date.setTime(odate.getTime());
					date.setHours(0,0);
				this._$datapickerButtonEnd.datepicker("option","minDate",date);
				this._$endTime.datetimeEntry('option', 'minDatetime',  date);
			 },
			 _setMaxEndTime:function(odate){
				var date = new Date()
					date.setTime(odate.getTime());
					date.setHours(23,59);
				this._$datapickerButtonEnd.datepicker("option","maxDate",date);
				this._$endTime.datetimeEntry('option', 'maxDatetime',  date);
			 },
			 _setMaxFromTime:function(odate){
				var date = new Date();
					date.setTime(odate.getTime());
					date.setHours(23,59);
				this._$datapickerButtonFrom.datepicker("option","maxDate",date);
				this._$fromTime.datetimeEntry('option', 'maxDatetime',  date);
			 },
			 //获取TimePeriod 转换为分钟
			 _getTimePeriod:function(){
				var timeType = this._getTimeType();
				if(timeType==1){
				   return  parseInt(this._$timePeriod.val());
				}else{
				   var fromTime = this._$fromTime.datetimeEntry('getDatetime');
				   var endTime  = this._$endTime.datetimeEntry('getDatetime');			
				   return (endTime.getTime() - fromTime.getTime())/1000/60;
				}
			 },
			 _getTimeType:function(){
				return parseInt(this._$timeType.val());
			 },
			 _getEndTime:function(){
				if(this._getTimeType()==1){
				   return null;
				}
				return this._$endTime.datetimeEntry('getDatetime');	
			 },
			 _getFromTime:function(){
				if(this._getTimeType()==1){
				   return null;
				}
				return this._$fromTime.datetimeEntry('getDatetime');
			 },
			 _createFromTime:function(endTime,timePeriod){
				var date = new Date();
					date.setTime(endTime.getTime()-timePeriod*60*1000);
				return date;	
			 },
			 _setValueFromLocal:function(){
				var timeType = this._getTimeType();
				this._$timeTypeValue.val(timeType);
				this._$timePeriodValue.val(this._getTimePeriod());
				if(timeType==2){
				  this._$endTimeValue.val(dateToText(this._getEndTime()));
				}else{
				  this._$endTimeValue.val("");
				}
			 },
			 _setValue:function(){
				var time = this._$panel.data("oldTime");
				this._$timeTypeValue.val(time.timeType);
				this._$timePeriodValue.val(time.timePeriod);
				if(time.timeType==2){
				  this._$endTimeValue.val(dateToText(time.endTime));
				}else{
				  this._$endTimeValue.val("");
				}
			 },
			 //从表单中获取数据
			 _getValue:function(){
				var time = {
					timeType   		: this._$timeTypeValue.val(),
					timePeriod 		: this._$timePeriodValue.val(),
					endTime			: null,
					fromTime		: null
				};
				if(!time.timeType){
					time.timeType 	= 1;
				}else{
					time.timeType	= parseInt(time.timeType);
				}
				if(!time.timePeriod){
					time.timePeriod = 30;
				}
				if(time.timeType==2){
					var endTimeText  = this._$endTimeValue.val();
					if(endTimeText){
						time.endTime = textToDate(endTimeText);
					}
				}
				
				if(time.timeType==2){
					time.fromTime = this._createFromTime(time.endTime,time.timePeriod);
				}
				return time;
			 },
			 _getLocalValue:function(){
				var time ={}
					time.timeType 	= this._getTimeType();
					time.timePeriod = this._getTimePeriod();
				if(time.timeType==2){
					time.fromTime	= this._getFromTime();
					time.endTime	= this._getEndTime();
				}	
				return time;
			 },
			 _checkChange:function(oldDate,newDate){
				if(oldDate.timeType!=newDate.timeType){
					return true;
				}
				if(oldDate.timePeriod!=newDate.timePeriod){
					return true;
				}
				if(oldDate.timeType==2){
					if(oldDate.endTime.getTime()!=newDate.endTime.getTime()){
					  return true;
					}
				}
				
			 },
			 _initEvent:function(){
				var self = this;
				var time = this._getValue();
				this._$panel.data("oldTime", time);
				this._setValue();
				
				this._$timeType.val(time.timeType);
				if(time.timeType==1){
				   this._$timePeriod.val(time.timePeriod);		
				}else{
				   this._$timePeriod.find("option:first").attr("selected",true);
				}
				
				this._$timePeriod.selectToUISlider({
					labels : 10,
					tooltip : false,
					labelSrc : "text",
					sliderOptions : {
						range : false
					}
				});
				
				var now = new Date();
				
				this._$endTime.datetimeEntry({
					datetimeFormat: "Y-O-D H:M",
					useMouseWheel: true,
					spinnerImage:false,
					maxDatetime:new Date()
				}).change(
					function() {
						var date = new Date(Date.parse($(this).val().replace(/-/g, "/")));
						if (date && !isNaN(date)) {
							self._$datapickerButtonEnd.datepicker("setDate", date);
						}
				});
				
				this._$fromTime.datetimeEntry({
					datetimeFormat: "Y-O-D H:M",
					useMouseWheel: true,
					spinnerImage:false
				}).change(
					function() {
						var date = new Date(Date.parse($(this).val().replace(/-/g, "/")));
						if (date && !isNaN(date)) {
							self._$datapickerButtonFrom.datepicker("setDate", date);
							self._setMinEndTime(date);
						}
				});

				
			this._$datapickerButtonFrom.datepicker(
					{
						dateFormat : "yy-mm-dd",
						onSelect : function(dateText) {
							var e = self._$fromTime.val();
							if (e.length > 0) {
								var i = e.indexOf(" ");
								self._$fromTime.val(dateText + e.substring(i, e.length));
							} else {
								self._$fromTime.val(dateText);
							}
							self._setMinEndTime(new Date(Date.parse(dateText.replace(/-/g, "/"))));
						}
					});
						
				
			this._$datapickerButtonEnd.datepicker(
					{
						dateFormat : "yy-mm-dd",
						onSelect : function(dateText) {
							var e = self._$endTime.val();
							if (e.length > 0) {
								var i = e.indexOf(" ");
								self._$endTime.val(dateText + e.substring(i, e.length));
							} else {
								self._$endTime.val(dateText);
							}
						}
					});
			
			if(time.timeType==2){
				this._setEndTime(time.endTime)
				this._setFromTime(time.fromTime)	
			}
				
			this._initShow()
			
			this._setMaxFromTime(now);
			this._setMinEndTime(now);
			this._setMaxEndTime(now);
					
			this.element.click(function() {
				
				var offset = $(this).offset();
				var time = self._$panel.data("oldTime");
				
				if(time.timeType==1){
					self._$rTimekPanel.show();
					self._$aTimekPanel.hide();
					self._$timeTypeButton.addClass("time_button01").removeClass("time_button02");
				}else{
					self._$aTimekPanel.show();
					self._$rTimekPanel.hide();
					self._$timeTypeButton.addClass("time_button02").removeClass("time_button01");
				}
				
                if (self._$panel.is(":visible")) {
                    self._$panel.hide();
                }else{
					self._$panel.css({
                        "top" : offset.top + 20,
                        "left" : offset.left - (self._$panel.width()- $(this).width()+20),
                    })
					var $cson = closestSon(self.element,"body");
					if($cson.css("z-index")!="auto"){
					  self._$panel.css("z-index", parseInt($cson.css("z-index"))+1);
					}
					self._$panel.show();
                }
                
			});
			this._$closeButton.click(function() {
				self._$panel.hide();
			});
			self._$okButton.click(function() {
								var oldTime = self._$panel.data("oldTime");
								var newTime = self._getLocalValue()
								if (self._checkChange(oldTime,newTime)) {
									self._$panel.data("oldTime", newTime);
									self._setValue();
									if(self.options.onChange){
										self.options.onChange.call(self);
									}
									self.element.trigger("change");
									self._initShow();
								}
								self._$panel.hide();
							});
			self._$timeTypeButton.click(
					function() {
						if (self._$timeType.val() == "1") {
							$(this).removeClass("time_button01");
							$(this).addClass("time_button02");
						
							self._$rTimekPanel.hide();
							self._$aTimekPanel.show();
							self._$timeType.val(2);
							
							var endTime = new Date();
						
							self._setFromTime(self._createFromTime(endTime,30));
							self._setEndTime(endTime);
						
						} else if (self._$timeType.val() == "2") {
							$(this).removeClass("time_button02");
							$(this).addClass("time_button01");
							
							self._$aTimekPanel.hide();
							self._$rTimekPanel.show();
							
							self._$timeType.val(1);
							self._$endTime.val("");
						}
					});
			 },
			 _initShow:function(){
				var time = this._$panel.data("oldTime")
				var html = "";
				if(time.timeType==2){
					html = '<div class="jg-time-panel-a-time">\
								<div><span>开始时间</span><span>'+dateToText(time.fromTime)+'</span></div>\
								<div><span>结束时间</span><span>'+dateToText(time.endTime)+'</span></div>\
							</div>'	
				}else{
					html = '<div class="jg-time-panel-r-time">\
								<span>最近</span><span>'+this._$timePeriod.find("option:selected").attr("desc")+'</span>\
							</div>'	
				}
				this._$timeHolder.empty().append(html);
			 },
			 _destroy:function(){
				this._$panel.remove();
			 }
		});
		
	function dateToText(date){
		return date.getFullYear() + "-" + fixNo(date.getMonth()+1)+"-"+ fixNo(date.getDate())+" "+fixNo(date.getHours())+":"+fixNo(date.getMinutes());
	}
	
	function textToDate(dateText){
		return new Date(dateText.replace(/-/g, "/"));
	}
	
	function fixNo(no){
		if(no<10){
		  return "0"+no;
		}else{
		  return no;
		}
	}
	
	function closestSon($el,selector){
		var $parent = $el.parent();
		if(!$parent){
			return null;
		}
		if($parent.is(selector)){
			return $el;
		}else{
			return closestSon($parent,selector);
		}
	}
	
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
		
})(jQuery);