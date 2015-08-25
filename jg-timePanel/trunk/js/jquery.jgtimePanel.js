(function($){
	$.widget("jgWidgets.jgTimePanel", {
			 options:{
				timePeriodId:null,
				endTimeId	:null,
				timeZoneId	:null,
				timeTypeId	:null
			 },
			 _create:function(){
				this._initOptions();
				this._initHtml();
				this._initEvent();
				this._initShow();
			 },
			 
			 _initOptions:function(){
				this.options.timePeriodId = getValue(this.element,"timePeriodId",this.option.timePeriodId);
				this.options.endTimeId 	  = getValue(this.element,"endTimeId",this.option.endTimeId);
				this.options.timeZoneId   = getValue(this.element,"timeZoneId",this.option.timeZoneId);
				this.options.timeTypeId   = getValue(this.element,"timeTypeId",this.option.timeTypeId);
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
										  <table>\
											<tr>\
												<td><input id="timeForm_fromTime" type="text" readonly="readonly" class="end_time_input m_top10"></td>\
												<td><input id="timeForm_endTime" type="text" readonly="readonly" class="end_time_input m_top10"></td>\
											</tr>\
											<tr>\
												<td><div class="end_time_calendar rumdatepicker datapicker-button "></div></td>\
												<td><div class="end_time_calendar rumdatepicker datapicker-button "></div></td>\
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
			 
			 _initEvent:function(){
				var self = this;
				var time = {
					timeType   : this._$timeTypeValue.val(),
					timePeriod : this._$timePeriodValue.val(),
					endTime    : this._$endTimeValue.val()
				};
				if(!time.timeType){
					time.timeType 	= 1;
					this._$timeTypeValue.val(1);
				}
				if(!time.timePeriod){
					time.timePeriod = 30;
					this._$timePeriodValue.val(30);
				}
				
				this._$panel.data("oldTime", time);
				
				this._$timeType.val(time.timeType);
				this._$timePeriod.val(time.timePeriod);
				this._$endTime.val(time.endTime);
				
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
					spinnerImage:false
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
							}
				});

			this._$datapickerButton.datepicker(
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
					
					
			this.element.click(function() {
				var offset = $(this).offset();
				var time = self._$panel.data("oldTime");
				if (time.timeType == "1") {
					self._$timeType.val(2);
					self._$timeTypeButton.trigger("click");
				} else if (time.timeType == "2") {
					self._$timeType.val(1);
					self._$timeTypeButton.trigger("click");
					if (time.endTime && time.endTime.length > 0) {
						self._$endTime.val(time.endTime);
						var date = new Date(time.endTime.replace(/-/g,"/"));
						if (date && !isNaN(date)) {
							self._$datapickerButton.datepicker("setDate", date);
						}
					}
				}
				self._$timePeriod.val(time.timePeriod);
				self._$panel.find("table").show();
				self._$panel.css({
					"border" : "#cccccc 1px solid"
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
						
								var newTime = {
									timeType 	: self._$timeType.val(),
									timePeriod  : self._$timePeriod.val(),
									endTime 	: self._$endTime.val()
								};
								var oldTime = self._$panel.data("oldTime");
								var change = false;
								if (oldTime.timeType != newTime.timeType
										|| oldTime.timePeriod != newTime.timePeriod
										|| oldTime.endTime != newTime.endTime) {
									change = true;
								}
								var type="3";
								if((type==70 || type==71)){
									var reportPeriod=3;
									if(data){
										reportPeriod=data.reportPeriod;
									}
									if(newTime.timeType==2 ){
										var today=new Date(); // 获取今天时间
										today.setDate(today.getDate() -reportPeriod); // 系统会自动转换
										today.setHours(0);
										today.setMinutes(0);
										today.setSeconds(0);
										today.setMilliseconds(0);
										
										var date_array=newTime.endTime.split(" ");
										var str_array1=date_array[0].split("-");
										var str_array2=date_array[1].split(":");
										var choosedate=new Date(parseInt(str_array1[0]),parseInt(str_array1[1])-1,parseInt(str_array1[2]),parseInt(str_array2[0]),parseInt(str_array2[1]),0);
										choosedate.setTime(choosedate.getTime()-newTime.timePeriod*60*1000);
										if(choosedate.getTime()-today.getTime()<0){
											alert("选择的日期超出范围");
											return;
										}
									}
								}
								if (change) {
									self._$timeType.val(newTime.timeType);
									self._$timePeriodValue.val(newTime.timePeriod);
									self._$endTimeValue.val(newTime.endTime);
									self._$panel.data("oldTime", newTime);
									self._$timePeriodValue.trigger("change");
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
							self._$fromTime.datetimeEntry("setDatetime",new Date());
							self._$endTime.datetimeEntry("setDatetime",new Date());
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