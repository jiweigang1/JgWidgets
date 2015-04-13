/*!
 * jg-Scrollbar
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.2
 *
 * Author JiGang 2014-6-4
 */


(function ($) {
  'use strict';
  var  oldScrollHeightName 			= "___oldScrollHeightName___";
  var  scrollHeightListenerName		= "__scrollHeightListenerName___";
  
  
  var ScrollHeightListener = function(handler){
		this._$els 	  = $([]);
		this._tid 	  = 0
		if(handler){
			this._handler = handler;
		}
		
  }
  
  $.extend(ScrollHeightListener.prototype,{
		add:function($el){	
			this._$els=this._$els.add($el);
			this._run();
		},
		remove:function($el){
			this._$els = this._$els.not($el);
		},
		_run:function(){
			var self = this;
			//console.log(this._$els.length);
			if(this._$els.length==0){
				return false;
			}
			$.each(this._$els,function(k,v){
				//console.log("check");
				v = $(v);
				//console.log(v.data(oldScrollHeightName));
				if(v.data(oldScrollHeightName)){
					var ns = v[0].scrollHeight;
					if(ns!=v.data(oldScrollHeightName)){
						v.data(oldScrollHeightName ,v[0].scrollHeight);
						if(self._handler){
							//console.log("change");
							self._handler.call(null,v);
						}
					}
				}else{
					v.data(oldScrollHeightName ,v[0].scrollHeight);
				}	
			});
			if(this._tid>0){
				clearTimeout(this._tid);
			}
			this._tid = setTimeout(function(){
				self._run();
			},250);
		}
  });

  $(document).data(scrollHeightListenerName,new ScrollHeightListener(function($el){
		$el.perfectScrollbar("update");
  }))
  
  
  
  
  
  
  
  
  
  
  // The default settings for the plugin
  var defaultSettings = {
    wheelSpeed: 10,
    wheelPropagation: false,
    minScrollbarLength: null,
    useBothWheelAxes: false,
    useKeyboard: true,
    suppressScrollX: false,
    suppressScrollY: false,
    scrollXMarginOffset: 0,
    scrollYMarginOffset: 0,
    includePadding: false,
	autoUpdate	  : false,
	autoPreventEvent: true,
	scrollYPanddingTop:0,
	scrollYPanddingButtom:0,
	scrollXPanddingLeft:0,
	scrollXPanddingRight:0,
	railContainer:null
  };

  var JgScrollbar = function($this,opts){
		this._$this = $this;
		this._opts	= opts;
		this._init();
  }
  
  $.extend(JgScrollbar.prototype,{
		_init:function(){
			this._scrollbarxShow = -1;	  
			this._scrollbaryShow = -1;
			this._wheelScrollbarShow = -1;
			this._supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
			this._initHtml();
			
			var ieMatch = navigator.userAgent.toLowerCase().match(/(msie) ([\w.]+)/);
			if (ieMatch && ieMatch[1] === 'msie') {
			  // must be executed at first, because 'ieSupport' may addClass to the container
			  this._ieSupport(parseInt(ieMatch[2], 10));
			}
			
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
		 this._$railContainer.addClass('ps-container');
	
		 this._$scrollbarXRail = $("<div class='ps-scrollbar-x-rail'></div>").appendTo(this._$railContainer);
         this._$scrollbarYRail = $("<div class='ps-scrollbar-y-rail'></div>").appendTo(this._$railContainer);
		 this._$scrollbarX 	   = $("<div class='ps-scrollbar-x'></div>").appendTo(this._$scrollbarXRail);
		 this._$scrollbarY 	   = $("<div class='ps-scrollbar-y'></div>").appendTo(this._$scrollbarYRail);
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
			
		},
		_initEvent:function(){
			this._bindScrollHandler();
			this._bindMouseScrollXHandler();
			this._bindMouseScrollYHandler();
			this._bindRailClickHandler();
			this._bindDragHandler();
			if (this._$this.mousewheel) {
				this._bindMouseWheelHandler();
			}
			if (this._opts.useKeyboard) {
				this._bindKeyboardHandler();
			}
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
		this._$this.scrollLeft(newLeft);
       
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
        this._$scrollbarX.bind('dragstart', function (e) {
          currentLeft = self._$scrollbarX.position().left;
			self._$scrollbarXRail.addClass('in-scrolling');
        });

        this._$scrollbarX.bind('drag', function (e,t) {
          if (self._$scrollbarXRail.hasClass('in-scrolling')) {
				self._updateContentScrollLeft(currentLeft, t.deltaX);
          }
        });

        this._$scrollbarX.bind('dragend', {click:true},function (e) {
          if (self._$scrollbarXRail.hasClass('in-scrolling')) {
				self._$scrollbarXRail.removeClass('in-scrolling');
          }
		   currentLeft = null;	
	   });
       
      },
	  
	  _bindMouseScrollYHandler : function () {
		var self = this;
        var currentTop =null;
        this._$scrollbarY.on('dragstart', function (e) {
          currentTop = self._$scrollbarY.position().top;
          self._$scrollbarYRail.addClass('in-scrolling');
        });

        this._$scrollbarY.on('drag', function (e,t) {
          if (self._$scrollbarYRail.hasClass('in-scrolling')) {
            self._updateContentScrollTop(currentTop, t.deltaY);
          }
        });

        this._$scrollbarY.on('dragend',{click:true}, function (e) {
          if (self._$scrollbarYRail.hasClass('in-scrolling')) {
				self._$scrollbarYRail.removeClass('in-scrolling');
          }
		   currentTop = null;
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
        $(document).bind('keydown', function (e) {
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

          //self._$this.scrollTop( self._$this.scrollTop() - deltaY);
          //self._$this.scrollLeft( self._$this.scrollLeft() + deltaX);

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
        var stopPropagation = function (e) {
		  e.stopPropagation();
		};

        this._$scrollbarY.bind('click', stopPropagation);
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

        this._$scrollbarX.bind('click', stopPropagation);
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
		var currentScrollTop  	  = null;
        this._$this.bind('dragstart', function (e) {
          currentScrollLeft = self._$this.scrollLeft();
			self._$scrollbarXRail.addClass('in-scrolling');
			 currentScrollTop = self._$this.scrollTop();
          self._$scrollbarYRail.addClass('in-scrolling');
        });

        this._$this.bind('drag', function (e,t) {
          if (self._$scrollbarXRail.hasClass('in-scrolling')) {
				self._updateContentScrollLeftByDrag(currentScrollLeft, t.deltaX);
          }
		  if (self._$scrollbarYRail.hasClass('in-scrolling')) {
            self._updateContentScrollTopByDrag(currentScrollTop, t.deltaY);
          }
        });

        this._$this.bind('dragend', {click:true},function (e) {
          if (self._$scrollbarXRail.hasClass('in-scrolling')) {
				self._$scrollbarXRail.removeClass('in-scrolling');
          }
		   currentScrollLeft = null;	
		  if (self._$scrollbarYRail.hasClass('in-scrolling')) {
				self._$scrollbarYRail.removeClass('in-scrolling');
          }
		   currentScrollTop = null;
	   });   
      },
	  _bindScrollHandler : function () {
		var self = this;
        this._$this.bind('scroll', function (e) {
           self._updateBarSizeAndPosition();
        });
      },
	  destroy : function () {
        this._$this.unbind(eventClassName);
        this._$this$scrollbarX.remove();
        this._$this$scrollbarY.remove();
        this._$this$scrollbarXRail.remove();
        this._$this$scrollbarYRail.remove();

        // clean all variables
        this._$this$scrollbarXRail =
        this._$this$scrollbarYRail =
        this._$this$scrollbarX =
        this._$this$scrollbarY =
        this._scrollbarXActive =
        this._scrollbarYActive =
        this._containerWidth =
        this._containerHeight =
        this._contentWidth =
        this._contentHeight =
        this._scrollbarXWidth =
        this._scrollbarXLeft =
        this._scrollbarXBottom =
        this._isScrollbarXUsingBottom =
        this._scrollbarXTop =
        this._scrollbarYHeight =
        this._scrollbarYTop =
        this._scrollbarYRight =
        this._isScrollbarYUsingRight =
        this._scrollbarYLeft =
        this._isRtl =
        eventClassName = null;
      },
	  _ieSupport : function (version) {
        $this.addClass('ie').addClass('ie' + version);

        var bindHoverHandlers = function () {
          var mouseenter = function () {
            $(this).addClass('hover');
          };
          var mouseleave = function () {
            $(this).removeClass('hover');
          };
          $railContainer.bind('mouseenter' + eventClassName, mouseenter).bind('mouseleave' + eventClassName, mouseleave);
          $scrollbarXRail.bind('mouseenter' + eventClassName, mouseenter).bind('mouseleave' + eventClassName, mouseleave);
          $scrollbarYRail.bind('mouseenter' + eventClassName, mouseenter).bind('mouseleave' + eventClassName, mouseleave);
          $scrollbarX.bind('mouseenter' + eventClassName, mouseenter).bind('mouseleave' + eventClassName, mouseleave);
          $scrollbarY.bind('mouseenter' + eventClassName, mouseenter).bind('mouseleave' + eventClassName, mouseleave);
        };

        var fixIe6ScrollbarPosition = function () {
          updateScrollbarCss = function () {
            var scrollbarXStyles = {left: scrollbarXLeft + $this.scrollLeft(), width: scrollbarXWidth};
            if (isScrollbarXUsingBottom) {
              scrollbarXStyles.bottom = scrollbarXBottom;
            } else {
              scrollbarXStyles.top = scrollbarXTop;
            }
            $scrollbarX.css(scrollbarXStyles);

            var scrollbarYStyles = {top: scrollbarYTop + $this.scrollTop(), height: scrollbarYHeight};
            if (isScrollbarYUsingRight) {
              scrollbarYStyles.right = scrollbarYRight;
            } else {
              scrollbarYStyles.left = scrollbarYLeft;
            }

            $scrollbarY.css(scrollbarYStyles);
            $scrollbarX.hide().show();
            $scrollbarY.hide().show();
          };
        };

        if (version === 6) {
          bindHoverHandlers();
          fixIe6ScrollbarPosition();
        }
      }
  });
  
  
  $.fn.jgScrollbar = function (options) {
    return this.each(function () {
      var opts  = $.extend(true, {},defaultSettings,options);
	  var $this = $(this); 
      if (!$this.data('jgScrollbar')) {
         $this.data('jgScrollbar',new JgScrollbar($this,opts));
      }
      return $this;
    });
  };
})(jQuery);
