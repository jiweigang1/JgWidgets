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
				this.element.append('<span>最近</span><span class="time-period-holder"></span><span class="end-time-holder"></span><span class="data_icon_down" ></span>');
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
													<option value="30">30M</option>\
													<option value="60">1H</option>\
													<option value="360">6H</option>\
													<option value="720">12H</option>\
													<option value="1440">&nbsp;&nbsp;1D</option>\
													<option value="4320">3D</option>\
													<option value="10080">7D</option>\
													<option value="20160">14D</option>\
													<option value="43200">1M</option>\
													<option value="86400">2M</option>\
													<option value="129600">3M</option>\
												</select>\
											</div>\
										</td>\
									</tr>\
									<tr class="a-time-panel">\
										<td>\
										  <table width="100%">\
											<tr>\
												<td><input id="timeForm_fromTime" type="text" readonly="readonly" class="end_time_input m_top10"></td>\
												<td><input id="timeForm_endTime"  type="text"  readonly="readonly" class="end_time_input m_top10"></td>\
											</tr>\
											<tr>\
												<td><div class="end_time_calendar rumdatepicker datapicker-button-from "></div></td>\
												<td><div class="end_time_calendar rumdatepicker datapicker-button-end "></div></td>\
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
				
				this._$timePeriodHolder = this.element.find(".time-period-holder");
				this._$endTimeHolder	= this.element.find(".end-time-holder");
				
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
			 _setFromTime(date){
				this._$fromTime.datetimeEntry("setDatetime" ,date);
				this._$datapickerButtonFrom.datepicker("setDate",date);
				this._setEndTime(date);
			 },
			 _setEndTime(date){
				var 
				this._$endTime.datetimeEntry("setDatetime" ,date);
				this._$datapickerButtonEnd.datepicker("setDate",date);
			 },
			 _setMinEndTime(date){
				this._$datapickerButtonEnd.datepicker("option","minDate",date);
				this._$endTime.datetimeEntry('option', 'minDatetime',  date);
			 },
			 _initEvent:function(){
				var self = this;
				var time = {
					timeType   : this._$timeTypeValue.val(),
					timePeriod : this._$timePeriodValue.val(),
					endTimeText: this._$endTimeValue.val()
				};
				if(!time.timeType){
					time.timeType 	= 1;
					this._$timeTypeValue.val(1);
				}
				if(!time.timePeriod){
					time.timePeriod = 30;
					this._$timePeriodValue.val(30);
				}
				
				var  panelDate	= new PanelDate(time.timeType,time.timePeriod,time.endTimeText);
				
				this._$panel.data("oldTime", panelDate);
				
				this._$timeType.val(time.timeType);
				this._$timePeriod.val(time.timePeriod);
				this._$endTime.val(time.endTimeText);
				
				this._initShow()
				this._$timePeriod.selectToUISlider({
					labels : 10,
					tooltip : false,
					labelSrc : "text",
					sliderOptions : {
						range : false
					}
				});
				
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
						},
						maxDate:new Date()
					});
						
				
			this._$datapickerButtonEnd.datepicker(
					{
						dateFormat : "yy-mm-dd",
						onSelect : function(dateText) {
							alert(1);
							var e = self._$endTime.val();
							if (e.length > 0) {
								var i = e.indexOf(" ");
								self._$endTime.val(dateText + e.substring(i, e.length));
							} else {
								self._$endTime.val(dateText);
							}
						},
						minDate:new Date(),
						maxDate:new Date()
					});
					
					
			this.element.click(function() {
				var offset = $(this).offset();
				var time = self._$panel.data("oldTime");
				
				if (time.timeType == "1") {
					self._$timeType.val(2);
					self._$timeTypeButton.trigger("click");
				} else if (time.timeType == "2") {
					self._$timeType.val(1);
					self._$timeTypeButton.trigger("click");
					
					self._setFromTime(time.getFromTime());
					self._setEndTime(time.getEndTime());
					

				}
				self._$timePeriod.val(time.timePeriod);
				self._$panel.find("table").show();
				self._$panel.css({
					"border" : "#cccccc 1px solid",
					"z-index" : 2000
						
				});
                if (self._$panel.is(":visible")) {
                    self._$panel.hide();
                }else{
                    self._$panel.show().css({
                        "top" : offset.top + 20,
                        "left" : offset.left - (self._$panel.width()- $(this).width() - 20)
                    });
                }
                
			});
			this._$closeButton.click(function() {
				self._$panel.css("display", "none");
				self._$panel.css({
					"border" : "0",
					"border-top" : "#cccccc 1px solid"
				}).css("display","none");
			});
			self._$okButton.click(function() {
								var newTime = new PanelDate(self._$timeType.val(),self._$timePeriod.val(),self._$endTime.val());
								var oldTime = self._$panel.data("oldTime");
								var change = false;
								if (oldTime.equals(newTime)) {
									change = true;
								}
								if (change) {
									self._$timeTypeValue.val(newTime.timeType);
									self._$timePeriodValue.val(newTime.timePeriod);
									self._$endTimeValue.val(newTime.endTimeText);
									
									self._$panel.data("oldTime", newTime);
									
									if(self.options.onChange){
										self.options.onChange.call(self);
									}
									self.element.trigger("change");
									self._initShow();
								}
								self._$panel.find("table").css("display", "none");
								self._$panel.css({
									"border" : "0",
									"border-top" : "#cccccc 1px solid"
								}).css("display","none");
							});
			self._$timeTypeButton.click(
					function() {
						if (self._$timeType.val() == "1") {
							$(this).removeClass("time_button01");
							$(this).addClass("time_button02");
						
							self._$rTimekPanel.hide();
							self._$aTimekPanel.show();
							self._$timeType.val(2);
							
							var panelDate = new PanelDate(2,30,null,new Date());
						
							self._setFromTime(panelDate.getFromTime());
							self._setEndTime(panelDate.getEndTime());
						
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
				var self = this;
				self._$timePeriodHolder.text(self._$timePeriod.find("option:selected").text());
				if (self._$timeType.val() == "2") {
					 self._$endTimeHolder.text("(" + self._$endTime.val() + ")");
				} else {
					self._$endTimeHolder.text("");
				}
			 },
			 _destroy:function(){
				this._$panel.remove();
			 }
		});
		
		
		
		
	function PanelDate(timeType,timePeriod,endTimeText,endTime){
			if(timeType){
				this.timeType		= parseInt(timeType+"");
			}
			if(timePeriod){
				this.timePeriod		= parseInt(timePeriod+"");
			}
			if(endTimeText){
				this.endTimeText	= endTimeText;
			}
			if(endTime){
				this.endTimeText	= dateToText(endTime);
			}
	}
	PanelDate.prototype.getEndTime = function(){
		if(!this.endTime||this.endTimeText==""){
			return new Date();
		}
		return new Date(this.endTime.replace(/-/g,"/"));	
	}
	PanelDate.prototype.getEndTimeText = function(){
		return this.endTimeText;
	}
	PanelDate.prototype.getFromTime = function(){
		var 	endTime = this.getEndTime();
				endTime.setTime(endTime.getTime()-this.timePeriod*60*1000);
		return  endTime;
	}
	PanelDate.prototype.getFromTimeText = function(){
		var 	fromTime = this.getFromTime();
		return  dateToText(fromTime)
	}
	PanelDate.prototype.equals = function(date){
		return  this.timeType = date.timeType&& this.timePeriod==date.timePeriod&&this.endTimeText==date.endTimeText;
	}
		
	function dateToText(date){
		return date.getFullYear() + "-" + (date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
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