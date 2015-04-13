/*!
 * jg-Scrollbar
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 2.0.0
 *
 * Author JiGang 2014-6-4
 */
 $(function(){
  $.widget("jgWidgets.jgScrollbar", {
        options: {
				wheelSpeed: 10,
				wheelPropagation: false,
				//使用滚轮
				usemouseWheel:true,
				
				minScrollbarLength: null,
				useBothWheelAxes: false,
				useKeyboard: true,
				suppressScrollX: false,
				suppressScrollY: false,
				scrollXMarginOffset: 0,
				scrollYMarginOffset: 0,
				includePadding: false,
				autoPreventEvent: true,
				scrollYPanddingTop:0,
				scrollYPanddingButtom:0,
				scrollXPanddingLeft:0,
				scrollXPanddingRight:0,
				//存放滚动条的容器
				railContainer:null,
				dragEnable:true,
				//监听高度和宽度的变化，自动update
				autoUpdate:false,
				autoShow:true
        },
		_create:function(){
			this._settings 			= {};
			this._settings.UUID		= "jgScrollbar"+new Date().getTime();
			this._$this = this.element;
			this._opts	= this.options;
			this._initd();
		},
		_initd:function(){
			this._scrollbarxShow = -1;	  
			this._scrollbaryShow = -1;
			this._wheelScrollbarShow = -1;
			this._supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
			this._initHtml();
			this._updateBarSizeAndPosition();
			this._initEvent();
		},
		_initHtml:function(){
		 this._$railContainer = null;
		 this._noRailContainer = true;
		 if(!this._opts.railContainer){
			   this._$railContainer = this._$this;
		 }else{
			   this._$railContainer = $(this._opts.railContainer);
			  if( this._$railContainer.length===0){
				  this._$railContainer = this._$this;	
			  }else{
				  this._noRailContainer = false;
			  }
		 }	
		 this._$railContainer.addClass('jg-container');
	
		 this._$scrollbarXRail = $("<div class='jg-scrollbar-x-rail'></div>").appendTo(this._$railContainer);
         this._$scrollbarYRail = $("<div class='jg-scrollbar-y-rail'></div>").appendTo(this._$railContainer);
		 this._$scrollbarX 	   = $("<div class='jg-scrollbar-x'></div>").appendTo(this._$scrollbarXRail);
		 this._$scrollbarY 	   = $("<div class='jg-scrollbar-y'></div>").appendTo(this._$scrollbarYRail);
		 this._scrollbarXActive = null;
		 this._scrollbarYActive= null;
          
		 this._containerWidth = null;
         this._containerHeight= null;
		  
		 this._railContainerWidth= null;
         this._railContainerHeight= null;
          
		 this._xRailWidth= null;
		 this._yRailHeight= null;
		  
		 this._contentWidth= null;
         this._contentHeight= null;
         this._scrollbarXWidth= null;
         this._scrollbarXLeft= null;
         this._scrollbarXBottom = parseInt(this._$scrollbarXRail.css('bottom'), 10);
         this._isScrollbarXUsingBottom = this._scrollbarXBottom === this._scrollbarXBottom; // !isNaN
         this._scrollbarXTop =  this._isScrollbarXUsingBottom ? null : parseInt(this._$scrollbarXRail.css('top'), 10),
         this._scrollbarYHeight= null;
         this._scrollbarYTop= null;
         this._scrollbarYRight = parseInt(this._$scrollbarYRail.css('right'), 10);
         this._isScrollbarYUsingRight =  this._scrollbarYRight ===  this._scrollbarYRight; // !isNaN
         this._scrollbarYLeft =  this._isScrollbarYUsingRight ? null: parseInt(this._$scrollbarYRail.css('left'), 10);
         this._isRtl = this._$this.css('direction') === "rtl";
		 this._eventClassName = "jgScrollbar";
			
		},
		_initEvent:function(){
			if(this.options.autoShow){
				this._$railContainer.hover(function(){
					$(this).addClass("hover")
				},function(){
					$(this).removeClass("hover")
				});
			}else{
				this._$railContainer.addClass("hover")
			}
			
		
			this._bindScrollHandler();
			this._bindMouseScrollXHandler();
			this._bindMouseScrollYHandler();
			this._bindRailClickHandler();
			
			if(this.options.dragEnable){
				this._bindDragHandler();
			}
			if (this.options.usemouseWheel) {
				this._bindMouseWheelHandler();
			}
			if (this.options.useKeyboard) {
				this._bindKeyboardHandler();
			}
			if(this.options.autoUpdate){
				this._initAutoUpdateEvent();
			}
		},
		//监听高度和宽度变化
		_initAutoUpdateEvent:function(){
			var self = this;
			this._$railContainer.on("mouseenter",function(){
				$(self.element).on("resize",function(){
					self.update();
				});
			}).on("mouseleave",function(){
				$(this).off("resize");
			})
		},
		_updateContentScrollTop:function(currentTop, deltaY) {
			var self =this;
			var newTop = currentTop + deltaY,
				maxTop = this._yRailHeight - this._scrollbarYHeight;
			if (newTop < 0) {
				this._scrollbarYTop = 0;
			}
			else if (newTop > maxTop) {
			  //alert(newTop +"|"+ maxTop);
			  this._scrollbarYTop = maxTop;
			}else {
			  this._scrollbarYTop = newTop;
			}
			var scrollTop = parseInt(this._scrollbarYTop * (this._contentHeight - this._railContainerHeight) / (this._yRailHeight - this._scrollbarYHeight), 10);
			this._hideScrollbarX();
			this._$this.scrollTop(scrollTop);
			
      },
	  _updateContentScrollTopByDrag:function(currentTop, deltaY) {
			var newTop = currentTop - deltaY,
				maxTop = this._contentHeight - this._containerHeight;
			if (newTop < 0) {
				this._scrollbarYTop = 0;
			}else if (newTop > maxTop) {
			  this._scrollbarYTop = maxTop;
			}
			this._scrollbarYTop = parseInt(newTop * (this._contentHeight - this._railContainerHeight) / (this._yRailHeight - this._scrollbarYHeight), 10);
			this._hideScrollbarX();
			this._$this.scrollTop(newTop);
			
      },
	  _updateContentScrollLeft :function (currentLeft, deltaX) {
		var self = this;
        var newLeft = currentLeft + deltaX,
            maxLeft = this._xRailWidth - this._scrollbarXWidth;

        if (newLeft < 0) {
          this._scrollbarXLeft = 0;
        }
        else if (newLeft > maxLeft) {
          this._scrollbarXLeft = maxLeft;
        }
        else {
          this._scrollbarXLeft = newLeft;
        }
        var scrollLeft = parseInt(this._scrollbarXLeft * (this._contentWidth - this._railContainerWidth) / (this._xRailWidth - this._scrollbarXWidth), 10);
	    this._hideScrollbarY();
		this._$this.scrollLeft(scrollLeft);
		
      },
	  
	   _updateContentScrollLeftByDrag :function (currentScrollLeft, deltaX) {
		var self = this;
        var newLeft = currentScrollLeft - deltaX,
            maxLeft = this._contentWidth - this._containerWidth;

        if (newLeft < 0 ) {
			this._scrollbarXLeft = 0;
        }else if (newLeft > maxLeft) {
			newLeft = maxLeft ;
        }
		
        this._scrollbarXLeft = parseInt(newLeft* (this._contentWidth - this._containerWidth) / (this._xRailWidth - this._scrollbarXWidth), 10);
		this._hideScrollbarY();
		this._$this.scrollLeft(newLeft);
      },
	  
	  _hideScrollbarY:function(){
			var self = this;
			if(this._scrollbaryShow>0){
				clearTimeout(this._scrollbaryShow);
			}
			this._$scrollbarY.hide();
			this._scrollbaryShow = setTimeout(function(){
				self._$scrollbarY.show("normal");
				this._scrollbaryShow =-1;
			},20);
	  
	  },
	  
	   _hideScrollbarX:function(){
			var self = this;
			if(this._scrollbarxShow>0){
				clearTimeout(this._scrollbarxShow);
			}
			this._$scrollbarX.hide();
			this._scrollbarxShow = setTimeout(function(){
				self._$scrollbarX.show("normal");
				this._scrollbarxShow = -1;
			},20);
	  
	  },
	  _getSettingsAdjustedThumbSize:function(thumbSize) {
        if (this._opts.minScrollbarLength) {
			 thumbSize = Math.max(this._thumbSize, this._opts.minScrollbarLength);
        }
			return thumbSize;
      },
	
	  _updateScrollbarCss :function () {
        var scrollbarXStyles = {width: this._xRailWidth, display: this._scrollbarXActive ? "inherit": "none"};
        if (this._isRtl) {
			if(this._noRailContainer){
				scrollbarXStyles.left = this._$this.scrollLeft() + this._containerWidth - this._contentWidth + this._opts.scrollXPanddingLeft;
			}else{
				scrollbarXStyles.left = this._opts.scrollXPanddingLeft;
			}
		} else {
			if(this._noRailContainer){
				scrollbarXStyles.left = this._$this.scrollLeft() + this._opts.scrollXPanddingLeft;
			}else{
				scrollbarXStyles.left = this._opts.scrollXPanddingLeft;
			}
		
		}
        if (this._isScrollbarXUsingBottom) {
			if(this._noRailContainer){
				scrollbarXStyles.bottom = this._scrollbarXBottom - this._$this.scrollTop();
			}else{
				scrollbarXStyles.bottom = this._scrollbarXBottom;
			}
		} else {
			if(this._noRailContainer){
				scrollbarXStyles.top = this._scrollbarXTop + this._$this.scrollTop();
			}else{
				scrollbarXStyles.bottom = this._scrollbarXTop;
			}
			
        }
        this._$scrollbarXRail.css(scrollbarXStyles);

        var scrollbarYStyles = this._noRailContainer?{top: this._$this.scrollTop()+ this._opts.scrollYPanddingTop, height: this._yRailHeight, display: this._scrollbarYActive ? "inherit": "none"}:{top: this._opts.scrollYPanddingTop, height: this._yRailHeight, display: this._scrollbarYActive ? "inherit": "none"};

        if (this._isScrollbarYUsingRight) {
          if (this._isRtl) {
			if(this._noRailContainer){
				scrollbarYStyles.right = this._contentWidth - this._$this.scrollLeft() - this._scrollbarYRight - this._$scrollbarY.outerWidth();
			}else{
				scrollbarYStyles.right =  this._scrollbarYRight ;
			}
          } else {
			if(this._noRailContainer){
				scrollbarYStyles.right = this._scrollbarYRight - this._$this.scrollLeft();
			}else{
				scrollbarYStyles.right =  this._scrollbarYRight ;
			}
            
          }
        } else {
          if (this._isRtl) {
			if(this._noRailContainer){
				scrollbarYStyles.left = this._$this.scrollLeft() + this._containerWidth * 2 - this._contentWidth - this._scrollbarYLeft - this._$scrollbarY.outerWidth();
			}else{
				scrollbarYStyles.left = this._scrollbarYLeft;
			}
          } else {
			if(this._noRailContainer){
				 scrollbarYStyles.left = this._scrollbarYLeft + this._$this.scrollLeft();
			}else{
				 scrollbarYStyles.left = this._scrollbarYLeft;
			}
           
          }
        }
        this._$scrollbarYRail.css(scrollbarYStyles);

        this._$scrollbarX.css({left: this._scrollbarXLeft, width: this._scrollbarXWidth});
        this._$scrollbarY.css({top: this._scrollbarYTop, height: this._scrollbarYHeight});
      },
	  update:function(){
		this._updateBarSizeAndPosition();
	  },	
	  _updateBarSizeAndPosition : function () {
        this._containerWidth  = this._opts.includePadding ? this._$this.innerWidth() : this._$this.width() ;
        this._containerHeight = this._opts.includePadding ? this._$this.innerHeight() : this._$this.height();
		
		this._railContainerWidth  = this._opts.includePadding ? this._$railContainer.innerWidth()  : this._$railContainer.width() ;
        this._railContainerHeight = this._opts.includePadding ? this._$railContainer.innerHeight() : this._$railContainer.height();
		
		this._xRailWidth		= this._railContainerWidth  - this._opts.scrollXPanddingLeft - this._opts.scrollXPanddingRight;
		this._yRailHeight		= this._railContainerHeight - this._opts.scrollYPanddingTop - this._opts.scrollYPanddingButtom;
	  
		this._contentWidth = this._$this.prop('scrollWidth');
        this._contentHeight = this._$this.prop('scrollHeight');

        if (!this._opts.suppressScrollX && this._containerWidth + this._opts.scrollXMarginOffset < this._contentWidth) {
          this._scrollbarXActive = true;
          this._scrollbarXWidth = this._getSettingsAdjustedThumbSize(parseInt(this._xRailWidth * this._containerWidth / this._contentWidth, 10));
          this._scrollbarXLeft = parseInt(this._$this.scrollLeft() * (this._xRailWidth - this._scrollbarXWidth) / (this._contentWidth - this._containerWidth ), 10);
        }
        else {
          this._scrollbarXActive = false;
          this._scrollbarXWidth = 0;
          this._scrollbarXLeft = 0;
          this._$this.scrollLeft(0);
        }

        if (!this._opts.suppressScrollY && this._containerHeight + this._opts.scrollYMarginOffset < this._contentHeight) {
          this._scrollbarYActive = true;
          this._scrollbarYHeight = this._getSettingsAdjustedThumbSize(parseInt(this._yRailHeight * this._containerHeight / this._contentHeight, 10));
          this._scrollbarYTop = parseInt(this._$this.scrollTop() * (this._yRailHeight - this._scrollbarYHeight) / (this._contentHeight - this._containerHeight ), 10) ;
		 // console.log(scrollbarYTop);
        }else {
          this._scrollbarYActive = false;
          this._scrollbarYHeight = 0;
          this._scrollbarYTop = 0;
          this._$this.scrollTop(0);
        }

        if (this._scrollbarYTop >= this._containerHeight - this._scrollbarYHeight) {
			this._scrollbarYTop = this._containerHeight - this._scrollbarYHeight;
        }
        if (this._scrollbarXLeft >= this._containerWidth - this._scrollbarXWidth) {
			this._scrollbarXLeft = this._containerWidth - this._scrollbarXWidth;
        }

        this._updateScrollbarCss();
      },
	  _bindMouseScrollXHandler : function () {
	    var self = this;
        var currentLeft = null ;
		var oldPageX 	= null;
	    this._$scrollbarX.draggable({
			axis:"x",
			helper:function(){
				return $('<div style="display:none" ></div>');
			},
			start:function(e,ui){
				currentLeft = self._$scrollbarX.position().left;
				oldPageX = e.pageX;
				self._$scrollbarXRail.addClass('in-scrolling');
			},
			drag:function(e,ui){
				if (self._$scrollbarXRail.hasClass('in-scrolling')) {
					self._updateContentScrollLeft(currentLeft, e.pageX-oldPageX);
				}
			},
			stop:function(){
				 if (self._$scrollbarXRail.hasClass('in-scrolling')) {
					self._$scrollbarXRail.removeClass('in-scrolling');
				 }
				currentLeft = null;
				oldPageX = null;
			}
	   });
       
      },
	  
	  _bindMouseScrollYHandler : function () {
		var self = this;
        var currentTop  = null;
		var oldPageY 	= null;
		this._$scrollbarY.draggable({
			axis:"y",
			helper:function(){
				return $('<div style="display:none" ></div>');
			},
			start:function(e,ui){
				currentTop = self._$scrollbarY.position().top;
				oldPageY   = e.pageY;
				self._$scrollbarYRail.addClass('in-scrolling');
			},
			drag:function(e,ui){
				if (self._$scrollbarYRail.hasClass('in-scrolling')) {
					self._updateContentScrollTop(currentTop, e.pageY-oldPageY);
				}
			},
			stop:function(){
				if (self._$scrollbarYRail.hasClass('in-scrolling')) {
					self._$scrollbarYRail.removeClass('in-scrolling');
				}
				currentTop = null;
				oldPageY   = null;
			}
		});
		
		
      },
	  
	  // check if the default scrolling should be prevented.
      _shouldPreventDefault : function (deltaX, deltaY) {
        var scrollTop = this._$this.scrollTop();
        if (deltaX === 0) {
          if (!this._scrollbarYActive) {
            return false;
          }
          if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= this._contentHeight - this._containerHeight && deltaY < 0)) {
            return !this._opts.wheelPropagation;
          }
        }

        var scrollLeft = this._$this.scrollLeft();
        if (deltaY === 0) {
          if (!this._scrollbarXActive) {
            return false;
          }
          if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= this._contentWidth - this._containerWidth && deltaX > 0)) {
            return !this._opts.wheelPropagation;
          }
        }
        return true;
      },
	  
	 _bindMouseWheelHandler : function () {
        var self = this;
        this._opts.wheelSpeed /= 10;

        var shouldPrevent = false;
        this._$this.bind('mousewheel', function (e, deprecatedDelta, deprecatedDeltaX, deprecatedDeltaY) {
          var deltaX = e.deltaX * e.deltaFactor || deprecatedDeltaX,
              deltaY = e.deltaY * e.deltaFactor || deprecatedDeltaY;

          shouldPrevent = false;
		  var $willShow =[] ;
          if (!self._opts.useBothWheelAxes) {
            // deltaX will only be used for horizontal scrolling and deltaY will
            // only be used for vertical scrolling - this is the default
            if(deltaX!=0){
				self._$scrollbarY.hide();
				$willShow.push($scrollbarY);
			}
			if(deltaY!=0){
				self._$scrollbarX.hide();
				$willShow.push(self._$scrollbarX);
			}
			self._$this.scrollTop(self._$this.scrollTop() - (deltaY * self._opts.wheelSpeed));
            self._$this.scrollLeft(self._$this.scrollLeft() + (deltaX * self._opts.wheelSpeed));
          } else if (self._scrollbarYActive && !self._scrollbarXActive) {
            // only vertical scrollbar is active and useBothWheelAxes option is
            // active, so let's scroll vertical bar using both mouse wheel axes
			self._$scrollbarX.hide();
			$willShow = [self._$scrollbarX];
            if (deltaY) {
              self._$this.scrollTop(self._$this.scrollTop() - (deltaY * self._opts.wheelSpeed));
            } else {
              self._$this.scrollTop(self._$this.scrollTop() + (deltaX * self._opts.wheelSpeed));
            }
            shouldPrevent = true;
          } else if (self._scrollbarXActive && !self._scrollbarYActive) {
            // useBothWheelAxes and only horizontal bar is active, so use both
            // wheel axes for horizontal bar
			$willShow = [self._$scrollbarY];
			self._$scrollbarY.hide();
            if (deltaX) {
              self._$this.scrollLeft(self._$this.scrollLeft() + (deltaX * self._opts.wheelSpeed));
            } else {
              self._$this.scrollLeft(self._$this.scrollLeft() - (deltaY * self._opts.wheelSpeed));
            }
            shouldPrevent = true;
          }

          // update bar position
          self._updateBarSizeAndPosition();
		  if(self._wheelScrollbarShow>0){
			 clearTimeout(self._wheelScrollbarShow);
		  }
		  if($willShow){
			  self._wheelScrollbarShow = setTimeout(function(){
					for(var i=0;i<$willShow.length;i++){
						$willShow[i].show("normal");
					}
					
			  },300);
		  }
		  
          shouldPrevent =   self._opts.autoPreventEvent?(shouldPrevent || self._shouldPreventDefault(deltaX, deltaY)):true;
          if (shouldPrevent) {
            e.stopPropagation();
            e.preventDefault();
          }
        });

        // fix Firefox scroll problem
        this._$this.bind('MozMousePixelScroll', function (e) {
          if (shouldPrevent) {
            e.preventDefault();
          }
        });
      },
	  _bindKeyboardHandler : function () {
		var self 	= this;
        var hovered = false;
        this._$railContainer.bind('mouseenter', function (e) {
          hovered = true;
        });
        this._$railContainer.bind('mouseleave', function (e) {
          hovered = false;
        });

        var shouldPrevent = false;
        $(document).on('keydown.'+self._settings.UUID, function (e) {
          if (!hovered || $(document.activeElement).is(":input,[contenteditable]")) {
            return;
          }

          var deltaX = 0,
              deltaY = 0;

          switch (e.which) {
          case 37: // left
            deltaX = -30;
            break;
          case 38: // up
            deltaY = 30;
            break;
          case 39: // right
            deltaX = 30;
            break;
          case 40: // down
            deltaY = -30;
            break;
          case 33: // page up
            deltaY = 90;
            break;
          case 32: // space bar
          case 34: // page down
            deltaY = -90;
            break;
          case 35: // end
            deltaY = -containerHeight;
            break;
          case 36: // home
            deltaY = containerHeight;
            break;
          default:
            return;
          }
		  self._updateContentScrollLeftByDrag(self._$this.scrollLeft() , deltaX);
		  self._updateContentScrollTopByDrag(self._$this.scrollTop() , deltaY);
		  
          shouldPrevent = self._shouldPreventDefault(deltaX, deltaY);
          if (shouldPrevent) {
            e.preventDefault();
          }
        });
      },
	  _bindRailClickHandler : function () {
		var self = this;
        this._$scrollbarY.on('click', function(e){
			 e.stopPropagation();
		});
        this._$scrollbarYRail.on('click', function (e) {
		  var halfOfScrollbarLength = parseInt(self._scrollbarYHeight / 2, 10),
              positionTop = e.pageY - self._$scrollbarYRail.offset().top - halfOfScrollbarLength,
              maxPositionTop = self._yRailHeight - self._scrollbarYHeight,
              positionRatio = positionTop / maxPositionTop;

          if (positionRatio < 0) {
            positionRatio = 0;
          } else if (positionRatio > 1) {
            positionRatio = 1;
          }

          self._$this.scrollTop((self._contentHeight - self._containerHeight) * positionRatio);
        });
		
		this._$scrollbarX.on('click', function(e){
			 e.stopPropagation();
		});
        this._$scrollbarXRail.bind('click', function (e) {
          var halfOfScrollbarLength = parseInt(self._scrollbarXWidth / 2, 10),
              positionLeft = e.pageX - self._$scrollbarXRail.offset().left - halfOfScrollbarLength,
              maxPositionLeft = self._xRailWidth - self._scrollbarXWidth,
              positionRatio = positionLeft / maxPositionLeft;

          if (positionRatio < 0) {
            positionRatio = 0;
          } else if (positionRatio > 1) {
            positionRatio = 1;
          }

          self._$this.scrollLeft((self._contentWidth - self._containerWidth) * positionRatio);
        });
      },
	 _bindDragHandler : function () {
        var self = this;
        var currentScrollLeft = null ;
		var currentScrollTop  = null;
		var oldPageX = null;
		var oldPageY = null;
		this._$this.draggable({
			helper:function(){
				return $('<div style="display:none" ></div>');
			},
			start:function(e,ui){
				currentScrollLeft = self._$this.scrollLeft();
				currentScrollTop = self._$this.scrollTop();
				oldPageX = e.pageX;
				oldPageY = e.pageY;
			},
			drag:function(e,ui){
				self._updateContentScrollLeftByDrag(currentScrollLeft, e.pageX-oldPageX);
				self._updateContentScrollTopByDrag(currentScrollTop, e.pageY-oldPageY);
			},
			stop:function(){
				currentScrollLeft = null;
				currentScrollTop = null;
				oldPageX = null;
				oldPageY = null;
			}
		});


	   
      },
	  _bindScrollHandler : function () {
		var self = this;
        this._$this.bind('scroll.'+this._eventClassName, function (e) {
           self._updateBarSizeAndPosition();
        });
      },
	  _destroy : function () {
        this._$this.unbind("."+this._eventClassName);
        this._$scrollbarX.remove();
        this._$scrollbarY.remove();
        this._$scrollbarXRail.remove();
        this._$scrollbarYRail.remove();
		$(document).off('keydown.'+self._settings.UUID);
      }	
	});
 });

