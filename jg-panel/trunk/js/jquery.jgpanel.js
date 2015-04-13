var jsPanel = {
				version : '2.1.0 2014-10-15 07:50',
				// global arrays that log hints for option.position 'top center', 'top left' and 'top right'
				hintsTc : [],
				hintsTl : [],
				hintsTr :[],
				ID : 0
			 };
(function($){
	$.widget( "jgWidgets.jgPanel", {
			
			
			options: {
				"addClass": {
				header: false,
				content: false,
				footer: false
			},
			"ajax": false,
			"autoclose": false,
			"bootstrap": false,
			"callback": undefined,
			"content": false,
			"controls": {
				buttons: true,
				iconfont: false
			},
			"draggable": {
				handle: 'div.jg-panel-hdr, div.jg-panel-ftr',
				stack: '.jsPanel',
				opacity: 0.7
			},
			"id": function () {
				jsPanel.ID += 1;
				return 'jsPanel-' + jsPanel.ID;
			},
			"load": false,
			"offset": {
				top: 0,
				left: 0
			},
			"paneltype": false,
			"overflow": 'hidden',
			"position": 'auto',
			"removeHeader": false,
			"resizable": {
				handles: 'e, s, w, se, sw',
				autoHide: false,
				minWidth: 150,
				minHeight: 93
			},
			"rtl": false,
			"selector": 'body',
			"show": 'fadeIn',
			"size": {
				width: 400,
				height: 222
			},
			"theme": 'default',
			"title": 'jsPanel',
			"toolbarFooter": false,
			"toolbarHeader": false,
			"autoAppend":true
			
			},
			_create:function(){
				var self = this;
				this.element.addClass("jg-panel jg-panel-theme-default");
				var html = this.element.text();
				this.element.empty();
				
				var content =	'<div class="jg-panel-hdr jg-panel-theme-default">' +
									'<h3 class="jg-panel-title"></h3>' +
									'<div class="jg-panel-hdr-r">' +
										'<div class="jg-panel-btn-close"></div>' +
										'<div class="jg-panel-btn-max"></div>' +
										'<div class="jg-panel-btn-norm"></div>' +
										'<div class="jg-panel-btn-min"></div>' +
										'<div class="jg-panel-btn-small"></div>' +
										'<div class="jg-panel-btn-smallrev"></div>' +
									'</div>' +
									'<div class="jg-panel-hdr-toolbar jg-panel-clearfix"></div>' +
								'</div>' +
								'<div class="jg-panel-content jg-panel-theme-default"></div>' +
								'<div class="jg-panel-ftr jg-panel-theme-default jg-panel-clearfix"></div>';
				this.element.append(content);
				
				
				this.widthMinimized = 150;
				this.anim = this.options.show;
				this.verticalOffset = 0;
				this.jsPparent	= null	;
				this.jsPparentTagname = null;
				this.count=null;
				
				
				
				
				try {
					this.jsPparent = $(this.options.selector).first();
					this.jsPparentTagname = this.jsPparent[0].tagName.toLowerCase();
					this.count = this.jsPparent.children('.jsPanel').length;
				} catch (e) {
					console.error(e);
					console.error('The element you want to append the jsPanel to does not exist!');
				}

				this.status = "initialized";
				this.header = $('.jg-panel-hdr', this.element);
				this.header.title = $('.jg-panel-title', this.header);
				this.header.controls = $('.jg-panel-hdr-r', this.header);
				this.header.toolbar = $('.jg-panel-hdr-toolbar', this.header);
				this.content = $('.jg-panel-content', this.element);
				this.content.append(html);
				
				this.footer = $('.jg-panel-ftr', this);
				
				(function () {
						if (self.options.paneltype === 'modal') {
							self.options.paneltype = {
								type: 'modal'
							};
						} else if (self.options.paneltype === 'tooltip') {
							self.options.paneltype = {
								type: 'tooltip'
							};
						} else if (self.options.paneltype === 'hint') {
							self.options.paneltype = {
								type: 'hint'
							};
						}
						if (self.options.paneltype.type === 'modal') {
							self.options.paneltype.mode = self.options.paneltype.mode || 'default';
							return;
						}
						if (self.options.paneltype.type === 'tooltip') {
							self.options.paneltype.mode = self.options.paneltype.mode || false;
							self.options.paneltype.position = self.options.paneltype.position || 'top';
							self.options.paneltype.solo = self.options.paneltype.solo || false;
							return;
						}
				}());
				this.options.position = this._rewriteOPosition();
				
				if (typeof this.options.id === 'string') {
					// id doesn't exist yet -> use it
					if ($('#' + this.options.id).length < 1) {
						this.element.attr('id', this.options.id);
					} else {
						this.ID += 1;
						this.element.attr('id', 'jsPanel-' + this.ID);
						// write new id as notification in title
						$('.jg-panel-title', this.element).html($('.jg-panel-title', this.element).text() + ' AUTO-ID: ' + this.element.attr('id'));
					}
				} else if ($.isFunction(this.options.id)) {
					this.element.attr('id', this.options.id);
				}

				/* this.options.paneltype - override or set various settings depending on this.options.paneltype */
				if (this.options.paneltype.type === 'modal') {
					this.options.selector = 'body';
					this.options.show = 'fadeIn';
					if (this.options.paneltype.mode === 'default') {
						this.options.resizable = false;
						this.options.draggable = false;
						this.options.removeHeader = false;
						this.options.position = {top: 'center', left: 'center'};
						this.options.controls.buttons = 'closeonly'; //do not delete else "modal" with no close button possible
						$(".jg-panel-btn-min, .jg-panel-btn-norm, .jg-panel-btn-max, .jg-panel-btn-small, .jg-panel-btn-smallrev", jsP).remove();
						$(jsP.header, jsP.header.title, jsP.footer).css('cursor', 'default');
						$('.jg-panel-title', jsP).css('cursor', 'inherit');
					}
					// backdrop einf¨¹gen
					if ($('.jg-panel-backdrop').length < 1) {
						(function () {
							var backdrop = '<div class="jg-panel-backdrop" style="height:' + docouterHeight() + 'px;"></div>';
							$('body').append(backdrop);
						}()); // IIFE is only to prevent backdrop as global variable
					}
				} else if (this.options.paneltype.type === 'tooltip') {
					this.options.position = {};
					this.options.resizable = false;
					this.options.draggable = false;
					this.options.show = 'fadeIn';
					this.options.controls.buttons = 'closeonly';
					// optionally remove all other tooltips
					if (this.options.paneltype.solo) {
						this._closeallTooltips();
					}
					// calc top & left for the various positions
					if (this.options.paneltype.position === 'top') {
						this.options.position = {
							top: calcPosTooltipTop('top'),
							left: calcPosTooltipLeft('top')
						};
					} else if (this.options.paneltype.position === 'bottom') {
						this.options.position = {
							top: calcPosTooltipTop('bottom'),
							left: calcPosTooltipLeft('bottom')
						};
					} else if (this.options.paneltype.position === 'left') {
						this.options.position = {
							top: calcPosTooltipTop('left'),
							left: calcPosTooltipLeft('left')
						};
					} else if (this.options.paneltype.position === 'right') {
						this.options.position = {
							top: calcPosTooltipTop('right'),
							left: calcPosTooltipLeft('right')
						};
					}
					// position the tooltip & add tooltip class
					this.element.css({
						top: this.options.position.top,
						left: this.options.position.left
					}).addClass('jg-panel-tt');
					if (!this.jsPparent.parent().hasClass('jg-panel-tooltip-wrapper')) {
						// wrap element serving as trigger in a div - will take the tooltip
						this.jsPparent.wrap('<div class="jg-panel-tooltip-wrapper">');
						// append tooltip (jsPanel) to the wrapper div
						this.jsPparent.parent().append(this.element);

						if (this.options.paneltype.mode === 'semisticky') {
							this.element.hover(
								function () {
									$.noop();
								},
								function () {
									self.close();
								}
							);
						} else if (this.options.paneltype.mode === 'sticky') {
							$.noop();
						} else {
							this.options.controls.buttons = 'none';
							// tooltip will be removed whenever mouse leaves trigger
							jsPparent.off('mouseout'); // to prevent mouseout from firing several times
							jsPparent.mouseout(function () {
								self.close();
							});
						}
					}

					// experimental: corners
					this.element.css('overflow', 'visible');

					if (this.options.paneltype.cornerBG) {
						var corner = $("<div></div>"),
							cornerLoc = "jg-panel-corner-" + this.options.paneltype.position,
							cornerPos,
							cornerOX = parseInt(this.options.paneltype.cornerOX) || 0,
							cornerOY = parseInt(this.options.paneltype.cornerOY) || 0,
							cornerBG = this.options.paneltype.cornerBG;

						if (this.options.paneltype.position !== "bottom") {
							corner.addClass(cornerLoc).appendTo(jsP);
						} else {
							corner.addClass(cornerLoc).prependTo(jsP);
						}

						if (this.options.paneltype.position === "top") {
							cornerPos = parseInt(this.options.size.width)/2 - 12 + (cornerOX) + "px";
							corner.css({borderTopColor: cornerBG, left: cornerPos});
						} else if (this.options.paneltype.position === "right") {
							cornerPos = parseInt(this.options.size.height)/2 - 12 + (cornerOY) + "px";
							corner.css({borderRightColor: cornerBG, left: "-24px", top: cornerPos});
						} else if (this.options.paneltype.position === "bottom") {
							cornerPos = parseInt(this.options.size.width)/2 - 12 + (cornerOX) + "px";
							corner.css({borderBottomColor: cornerBG, left: cornerPos, top: "-24px"});
						} else if (this.options.paneltype.position === "left") {
							cornerPos = parseInt(this.options.size.height)/2 - 12 + (cornerOY) + "px";
							corner.css({borderLeftColor: cornerBG, left: this.options.size.width, top: cornerPos});
						}

					}
				} else if (this.options.paneltype.type === 'hint') {
					this.options.resizable = false;
					this.options.draggable = false;
					this.options.removeHeader = true;
					this.options.toolbarFooter = false;
					this.options.show = 'fadeIn';
					this.element.addClass('jg-panel-hint');
					this.content.addClass('jg-panel-hint-content');
					// autoclose default 8 sec | or -1 to deactivate
					if (!this.options.autoclose) {
						this.options.autoclose = 8000;
					} else if (this.options.autoclose < 0) {
						this.options.autoclose = false;
					}
					// add class according this.options.theme to color the hint background
					this.element.content.addClass('jg-panel-hint-' + this.options.theme);
					// add close button to the hint
					if (this.options.theme === 'default' || this.options.theme === 'light') {
						this.content.append('<div class="jg-panel-hint-close-dark"></div>');
					} else {
						this.content.append('<div class="jg-panel-hint-close-white"></div>');
					}
					// bind callback for close button
					$('.jg-panel-hint-close-dark, .jg-panel-hint-close-white', this.element).on('click', this.element, function (event) {
						event.data.close();
					});
					// set this.options.position for hints using 'top left', 'top center' or 'top right'
					if (this.options.position.top === '0' && this.options.position.left === 'center') {
						// Schleife ¨¹ber alle hints in jsPanel.hintsTc, H?hen aufsummieren und als top f¨¹r this.options.position verwenden
						if (jsPanel.hintsTc.length > 0) {
							this.options.position = hintTop(jsPanel.hintsTc);
						}
						// populate array with hints
						jsPanel.hintsTc.push(jsP.attr('id'));
					} else if (this.options.position.top === '0' && this.options.position.left === '0') {
						if (jsPanel.hintsTl.length > 0) {
							this.options.position = hintTop(jsPanel.hintsTl);
						}
						jsPanel.hintsTl.push(jsP.attr('id'));
					} else if (this.options.position.top === '0' && this.options.position.right === '0') {
						if (jsPanel.hintsTr.length > 0) {
							this.options.position = hintTop(jsPanel.hintsTr);
						}
						jsPanel.hintsTr.push(jsP.attr('id'));
					}
				}

				/* this.options.selector - append jsPanel only to the first object in selector */
				if (this.options.paneltype.type !== 'tooltip') {
					this.element.appendTo(this.jsPparent);
				}
				if (this.options.paneltype.type === 'modal') {
					this.element.css('zIndex', '1100');
					if (this.options.paneltype.mode === 'extended') {
						$('.jg-panel-backdrop').css('z-index', '999');
					}
				} else {
					this.element.css('z-index', this._setZi());
				}

				/* this.options.bootstrap & this.options.theme */
				if (this.options.bootstrap) {
					// check whether a bootstrap compatible theme is used
					(function () {
						var arr = ["default", "primary", "info", "success", "warning", "danger"];
						if ($.inArray(this.options.bootstrap, arr) > -1) {
							this.options.theme = this.options.bootstrap;
						} else {
							this.options.theme = "default";
						}
					}());
					this.options.controls.iconfont = 'bootstrap';
					this.element.alterClass('jg-panel-theme-*', 'panel panel-' + this.options.theme);
					this.header.alterClass('jg-panel-theme-*', 'panel-heading');
					this.header.title.addClass('panel-title');
					this.content.alterClass('jg-panel-theme-*', 'panel-body');
					this.footer.addClass('panel-footer');
					// fix css problems for panels nested in other bootstrap panels
					this.header.title.css('color', function () {
						return self.header.css('color');
					});
					this.content.css('border-top-color', function () {
						return self.header.css('border-top-color');
					});
				} else {
					// activate normal non bootstrap themes
					this.element.alterClass('jg-panel-theme-*', 'jg-panel-theme-' + this.options.theme);
					this.header.alterClass('jg-panel-theme-*', 'jg-panel-theme-' + this.options.theme);
					this.content.alterClass('jg-panel-theme-*', 'jg-panel-theme-' + this.options.theme);
					this.footer.alterClass('jg-panel-theme-*', 'jg-panel-theme-' + this.options.theme);
				}

				/* this.options.title | default: function - (¨¹berschrift) des Panels */
				this.header.title.prepend(this.options.title);

				/* this.options.removeHeader */
				if (this.options.removeHeader) {
					this.header.remove();
				}

				/* this.options.controls (buttons in header right) | default: object */
				if (!this.options.removeHeader) {
					if (this.options.controls.buttons === 'closeonly') {
						hideControls(".jg-panel-btn-min, .jg-panel-btn-norm, .jg-panel-btn-max, .jg-panel-btn-small, .jg-panel-btn-smallrev");
					} else if (this.options.controls.buttons === 'none') {
						$('*', this.header.controls).css('display', 'none');
					}
				}

			/* bootstrap iconfonts einf¨¹gen wenn this.options.iconfont gesetzt */
			if (this.options.controls.iconfont) {
				if (this.options.controls.iconfont === 'bootstrap') {
					$('.jg-panel-btn-close', this.header.controls).append('<span class="glyphicon glyphicon-remove"></span>');
					$('.jg-panel-btn-max', this.header.controls).append('<span class="glyphicon glyphicon-fullscreen"></span>');
					$('.jg-panel-btn-norm', this.header.controls).append('<span class="glyphicon glyphicon-resize-full"></span>');
					$('.jg-panel-btn-min', this.header.controls).append('<span class="glyphicon glyphicon-minus"></span>');
					$('.jg-panel-btn-small', this.header.controls).append('<span class="glyphicon glyphicon-chevron-up"></span>');
					$('.jg-panel-btn-smallrev', this.header.controls).append('<span class="glyphicon glyphicon-chevron-down"></span>');
				} else if (this.options.controls.iconfont === 'font-awesome') {
					$('.jg-panel-btn-close', this.header.controls).append('<i class="fa fa-times"></i>');
					$('.jg-panel-btn-max', this.header.controls).append('<i class="fa fa-arrows-alt"></i>');
					$('.jg-panel-btn-norm', this.header.controls).append('<i class="fa fa-expand"></i>');
					$('.jg-panel-btn-min', this.header.controls).append('<i class="fa fa-minus"></i>');
					$('.jg-panel-btn-small', this.header.controls).append('<i class="fa fa-chevron-up"></i>');
					$('.jg-panel-btn-smallrev', this.header.controls).append('<i class="fa fa-chevron-down"></i>');
				}
				// icon sprites entfernen
				$('*', this.header.controls).css('background-image', 'none');
			}

			/* this.options.toolbarHeader | default: false */
			if (this.options.toolbarHeader && this.options.removeHeader === false) {
				if (typeof this.options.toolbarHeader === 'string') {
					this.header.toolbar.append(this.options.toolbarHeader);
				} else if ($.isFunction(this.options.toolbarHeader)) {
					this.header.toolbar.append(this.options.toolbarHeader(this.header));
				} else if ($.isArray(this.options.toolbarHeader)) {
					configToolbar(this.options.toolbarHeader, this.header.toolbar);
				}
			}

			/* this.options.toolbarFooter | default: false */
			if (this.options.toolbarFooter) {
				this.footer.css({
					display: 'block',
					padding: '0 25px 0 5px'
				});
				if (typeof this.options.toolbarFooter === 'string') {
					this.footer.append(this.options.toolbarFooter);
				} else if ($.isFunction(this.options.toolbarFooter)) {
					this.footer.append(this.options.toolbarFooter(this.footer));
				} else if ($.isArray(this.options.toolbarFooter)) {
					configToolbar(this.options.toolbarFooter, this.footer);
				}
			}

			/* this.options.rtl | default: false */
			if (this.options.rtl.rtl === true) {
				(function () {
					var elmts = [ this.header.title, this.content, this.header.toolbar, this.footer ],
						i,
						max = elmts.length;
					for (i = 0; i < max; i += 1) {
						elmts[i].prop('dir', 'rtl');
						if (this.options.rtl.lang) {
							elmts[i].prop('lang', this.options.rtl.lang);
						}
					}
				}()); // IIFE only to prevent global variable
				this.header.title.css('text-align', 'right');
				$('.jg-panel-btn-close', this.header.controls).insertAfter($('.jg-panel-btn-min', this.header.controls));
				$('.jg-panel-btn-max', this.header.controls).insertAfter($('.jg-panel-btn-min', this.header.controls));
				$('.jg-panel-btn-small', this.header.controls).insertBefore($('.jg-panel-btn-min', this.header.controls));
				$('.jg-panel-btn-smallrev', this.header.controls).insertBefore($('.jg-panel-btn-min', this.header.controls));
				$('.jg-panel-hdr-r, .jg-panel-hint-close-dark, .jg-panel-hint-close-white', this).css('float', 'left');
				$('.jg-panel-title', this).css('float', 'right');
				$('.jg-panel-ftr').append('<div style="clear:both;height:0;"></div>');
				$('button', this.footer).css('float', 'left');
			}

			/* this.options.overflow  | default: 'hidden' */
			if (typeof this.options.overflow === 'string') {
				this.content.css('overflow', this.options.overflow);
			} else if ($.isPlainObject(this.options.overflow)) {
				this.content.css({
					'overflow-y': this.options.overflow.vertical,
					'overflow-x': this.options.overflow.horizontal
				});
			}

			/* this.options.draggable */
			if ($.isPlainObject(this.options.draggable)) {
				// if jsPanel is childpanel
				if (this.element.parent().hasClass('jg-panel-content')) {
					this.options.draggable.containment = 'parent';
				}
				// merge draggable settings and apply
				this.options.customdraggable = $.extend(true, {}, $.jgPanel.defaults.draggable, this.options.draggable);
				this.element.draggable(this.options.customdraggable);
			} else if (this.options.draggable === 'disabled') {
				// reset cursor, draggable deactivated
				$('.jg-panel-title', this.element).css('cursor', 'inherit');
				// jquery ui draggable initialize disabled to allow to query status
				this.element.draggable({ disabled: true });
			}

			/* this.options.resizable */
			if ($.isPlainObject(this.options.resizable)) {
				this.options.customresizable = $.extend(true, {}, $.jgPanel.defaults.resizable, this.options.resizable);
				this.element.resizable(this.options.customresizable);
			} else if (this.options.resizable === 'disabled') {
				// jquery ui resizable initialize disabled to allow to query status
				this.element.resizable({ disabled: true });
				$('.ui-icon-gripsmall-diagonal-se', this.element).css('background-image', 'none');
			}

			/* this.options.content */
			// this.options.content can be any valid argument for jQuery.append()
			if (this.options.content) {
				this.content.append(this.options.content);
			}

        /* this.options.load */
        if ($.isPlainObject(this.options.load) && this.options.load.url) {
            if (!this.options.load.data) {
                this.options.load.data = undefined;
            }
            this.content.load(this.options.load.url, this.options.load.data, function (responseText, textStatus, XMLHttpRequest) {
                if (this.options.load.complete) {
                    this.options.load.complete(responseText, textStatus, XMLHttpRequest, self.element);
                }
                // fix for a bug in jQuery-UI draggable? that causes the jsPanel to reduce width when dragged beyond boundary of containing element and this.options.size.width is 'auto'
                this.content.css('width', function () {
                    return self.content.outerWidth() + 'px';
                });
            });
        }
        /* this.options.ajax */
        if ($.isPlainObject(this.options.ajax)) {
            $.ajax(this.options.ajax)
                .done(function (data, textStatus, jqXHR) {
					if(this.options.autoAppend){
						self.element.content.empty().append(data);
					}
					if (this.options.ajax.done && $.isFunction(this.options.ajax.done)) {
                        this.options.ajax.done(data, textStatus, jqXHR, this.element);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (this.options.ajax.fail && $.isFunction(this.options.ajax.fail)) {
                        this.options.ajax.fail(jqXHR, textStatus, errorThrown, this.element);
                    }
                })
                .always(function (arg1, textStatus, arg3) {
                    //In response to a successful request, the function's arguments are the same as those of .done(): data(hier: arg1), textStatus, and the jqXHR object(hier: arg3)
                    //For failed requests the arguments are the same as those of .fail(): the jqXHR object(hier: arg1), textStatus, and errorThrown(hier: arg3)
                    // fix for a bug in jQuery-UI draggable? that causes the jsPanel to reduce width when dragged beyond boundary of containing element and this.options.size.width is 'auto'
                    this.content.css('width', function () {
                        return self.content.outerWidth() + 'px';
                    });
                    if (this.options.ajax.always && $.isFunction(this.options.ajax.always)) {
                        this.options.ajax.always(arg1, textStatus, arg3, self.element);
                    }
                })
                .then(function (data, textStatus, jqXHR) {
                    if (this.options.ajax.then && $.isArray(this.options.ajax.then)) {
                        if (this.options.ajax.then[0] && $.isFunction(this.options.ajax.then[0])) {
                            this.options.ajax.then[0](data, textStatus, jqXHR, self.element);
                        }
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    if (this.options.ajax.then && $.isArray(this.options.ajax.then)) {
                        if (this.options.ajax.then[1] && $.isFunction(this.options.ajax.then[1])) {
                            this.options.ajax.then[1](jqXHR, textStatus, errorThrown, self.element);
                        }
                    }
                });
        }

			/* this.options.size */
			if (typeof this.options.size === 'string' && this.options.size === 'auto') {
				this.options.size = {
					width: 'auto',
					height: 'auto'
				};
			} else if ($.isPlainObject(this.options.size)) {
				if ($.isNumeric(this.options.size.width)) {
					this.options.size.width = this.options.size.width + 'px';
				} else if (typeof this.options.size.width === 'string') {
					if (this.options.size.width !== 'auto') {
						this.options.size.width = $.jgPanel.defaults.size.width + 'px';
					}
				} else if ($.isFunction(this.options.size.width)) {
					this.options.size.width = parseInt(this.options.size.width(), 10) + 'px';
				}

				if ($.isNumeric(this.options.size.height)) {
					this.options.size.height = this.options.size.height + 'px';
				} else if (typeof this.options.size.height === 'string') {
					if (this.options.size.height !== 'auto') {
						this.options.size.height = $.jgPanel.defaults.size.height + 'px';
					}
				} else if ($.isFunction(this.options.size.height)) {
					this.options.size.height = parseInt(this.options.size.height(), 10) + 'px';
				}
			}
			this.content.css({
				width: this.options.size.width,
				height: this.options.size.height
			});

        /* this.options.position */
        if (this.options.paneltype.type !== 'tooltip') {
            // when using this.options.size = 'auto' and this.options.position = 'center' consider use of this.options.ajax with
            // async: false -> size will be known when position is calculated
            // value "center" not allowed for this.options.position.bottom & this.options.position.right -> use top and/or left

            this._calcPanelposition = function (jsP, selector) {
                var panelpos = {};
                // get px values for panel size in case this.options.size is 'auto' - results will be incorrect whenever content
                // is not loaded yet ( e.g. this.options.load, this.options.ajax ) -> centering can't work correctly
                this.options.size.width = $(jsP).outerWidth();
                this.options.size.height = $(jsP).innerHeight();
                // delete op.top and/or left if this.options.position.bottom and/or right
                if (this.options.position.bottom) {
                    delete this.options.position.top;
                }
                if (this.options.position.right) {
                    delete this.options.position.left;
                }
                // calculate top | bottom values != center
                // if not checked for 0 as well code would not be executed!
                if (this.options.position.bottom || this.options.position.bottom === 0) {
                    delete this.options.position.top;
                    self._calcPos('bottom', selector);
                } else if (this.options.position.top || this.options.position.top === 0) {
                    if (this.options.position.top === 'center') {
                        this.options.position.top = posCenter(this.options.selector, this.options.size).top;
                    } else {
                        self._calcPos('top', selector);
                    }
                }
                // calculate left | right values != center
                if (this.options.position.right || this.options.position.right === 0) {
                    delete this.options.position.left;
                    self._calcPos('right', selector);
                } else if (this.options.position.left || this.options.position.left === 0) {
                    if (this.options.position.left === 'center') {
                        this.options.position.left = posCenter(this.options.selector, this.options.size).left;
                    } else {
                        self._calcPos('left', selector);
                    }
                }
                if (this.options.position.top) {
                    panelpos.top = parseInt(this.options.position.top, 10) + this.options.offset.top + 'px';
                } else {
                    panelpos.bottom = parseInt(this.options.position.bottom, 10) + this.options.offset.top + 'px';
                }
                if (this.options.position.left) {
                    panelpos.left = parseInt(this.options.position.left, 10) + this.options.offset.left + 'px';
                } else {
                    panelpos.right = parseInt(this.options.position.right, 10) + this.options.offset.left + 'px';
                }

                this.element.css(panelpos);
                this.options.position = {
                    top: this.element.css('top'),
                    left: this.element.css('left')
                };
            };
            // finally calculate & position the jsPanel
            this._calcPanelposition(this.element, this.options.selector);
        }

        /* this.options.addClass */
        if (typeof this.options.addClass.header === 'string') {
            this.header.addClass(this.options.addClass.header);
        }
        if (typeof this.options.addClass.content === 'string') {
            this.content.addClass(this.options.addClass.content);
        }
        if (typeof this.options.addClass.footer === 'string') {
            this.footer.addClass(this.options.addClass.footer);
        }

        /*
         * handlers for the controls
         */
        // Handler um Panel in den Vordergrund zu holen
        this.element.on('click', function () {
            self.element.css('z-index', self._setZi());
        });
        // jsPanel close
        $('.jg-panel-btn-close', this.element).on('click', function (e) {
            e.preventDefault();
            self.close();
        });
        // jsPanel minimize
        $('.jg-panel-btn-min', this.element).on('click', function (e) {
            e.preventDefault();
            self.minimize();
        });
        // jsPanel maximize
        $('.jg-panel-btn-max', this.element).on('click', function (e) {
            e.preventDefault();
            self.maximize();
        });
        // jsPanel normalize
        $('.jg-panel-btn-norm', this.element).on('click', function (e) {
            e.preventDefault();
            self.normalize();
        });
        // jsPanel smallify
        $('.jg-panel-btn-small, .jg-panel-btn-smallrev', this.element).on('click', function (e) {
            e.preventDefault();
            self.smallify();
        });
				
				
				
				
		
			/* this.options.show */
        if (this.anim.indexOf(" ") === -1) {
            // wenn in anim kein Leerzeichen zu finden ist -> function anwenden
            this.element[this.anim]({
                done: function () {
                    self.status = "normalized";
                    // trigger custom event
                    self.element.trigger('jspanelloaded', self.element.attr('id'));
                    self.element.trigger('jspanelstatechange', self.element.attr('id'));
                    self.options.size = {
                        width: self.element.outerWidth() + 'px',
                        height: self.element.outerHeight() + 'px'
                    };
                }
            });
        } else {
            this.status = "normalized";
            // sonst wird es als css animation interpretiert und die class gesetzt
            // does not work with certain combinations of type of animation and positioning
            this.element.css({
                display: 'block',
                opacity: 1
            })
                .addClass(this.options.show)
                .trigger('jspanelloaded', this.element.attr('id'))
                .trigger('jspanelstatechange', this.element.attr('id'));
            this.options.size = {
                width: this.element.outerWidth() + 'px',
                height: this.element.outerHeight() + 'px'
            };
        }
        // needed if a maximized panel in body is normalized again
        // don't put this under $('body').on('jspanelloaded', function () { ... }
        verticalOffset = this._calcOffsetV();

        /* replace bottom/right values with corresponding top/left values if necessary */
        this._replaceCSSBottomRight(this.element);

        /* reposition hints while scrolling window, must be after normalization of position */
        if (this.options.paneltype.type === 'hint') {
            (function () {
                var dif = self.element.offset().top - winscrollTop();
                // with window.onscroll only the last added hint would stay in position
                $(window).scroll(function () {
                    self.element.css('top', winscrollTop() + dif + 'px');
                });
            }());
        }
        /* reposition jsPanel appended to body while scrolling window */
        if (this.jsPparentTagname === 'body' && (this.options.paneltype.type !== 'tooltip' || this.options.paneltype.type !== 'hint')) {
            this._fixPosition();
        }

        /* this.options.callback & this.options.autoclose started on 'jspanelloaded' and a jQuery-UI draggable bugfix */
        $('body').on('jspanelloaded', function () {
            var j,
                max;
            /* this.options.callback */
            if (self.options.callback && $.isFunction(self.options.callback)) {
                self.options.callback(self.element);
            } else if ($.isArray(self.options.callback)) {
                max = self.options.callback.length;
                for (j = 0; j < max; j += 1) {
                    if ($.isFunction(self.options.callback[j])) {
                        self.options.callback[j](jsP);
                    }
                }
            }
            /* this.options.autoclose | default: false */
            if (typeof self.options.autoclose === 'number' && self.options.autoclose > 0) {
                window.setTimeout(function () {
                    // function autoclose pr¨¹ft erst ob es das el noch gibt
                    autoclose(self.element, self.options.attr('id'));
                }, self.options.autoclose);
            }
        });

        /* resizestart & resizestop & dragstop callbacks */
        // features activated for modals only for @genachka
        if (this.options.paneltype === false || this.options.paneltype.mode === 'extended') {
            // not needed for modals, hints and tooltips
            this.element.on("resizestart", function () {
                self.resizeContent();
                self.content.css('min-width', '');
            });
            this.element.on("resizestop", function () {
                self.options.size = {
                    width: self.element.outerWidth() + 'px',
                    height: self.element.outerHeight() + 'px'
                };
                self.element.trigger('jspanelnormalized', jsP.attr('id'));
                self.element.trigger('jspanelstatechange', jsP.attr('id'));
                this.status = "normalized";
                // controls zur¨¹cksetzen
                self._hideControls(".jg-panel-btn-norm, .jg-panel-btn-smallrev");
            });
            self.element.on("dragstart", function () {
                // remove window.scroll handler, is added again on dragstop
                $(window).off('scroll', self.jsPanelfixPos);
                if (self.options.paneltype.mode === 'extended') {
                    self.element.css('z-index', '1100');
                }
            });
            self.element.on("dragstop", function () {
                self.options.position = {
                    top: self.element.css('top'),
                    left: self.element.css('left')
                };
                verticalOffset = self._calcOffsetV();
                if (self.jsPparentTagname === 'body') {
                    self._fixPosition();
                }
            });
        }	
				
				
				
				
				
				
				
				
				
				
				
				
				
					
	},
			_winscrollTop:function() { 
				return $(window).scrollTop(); 
			},
			_winscrollLeft:function() { 
				return $(window).scrollLeft(); 
			},
			_winouterHeight:function() {
				return $(window).outerHeight(); 
			},
			_winouterWidth:function() { 
				return $(window).outerWidth(); 
			},
			_docouterHeight:function() { 
				return $(document).outerHeight(); 
			},
			_fixPosition:function(){
				var jspaneldiff = this.element.offset().top - this._winscrollTop();
				this.element.jsPanelfixPos = function () {
					this.element.css('top', this._winscrollTop() + jspaneldiff + 'px');
				};
				$(window).on('scroll', this.element.jsPanelfixPos);
			},
			_calcOffsetV:function() {
				return this.element.offset().top - this._winscrollTop();
			},
			_hideControls:function(sel) {
				var controls = ".jg-panel-btn-close, .jg-panel-btn-norm, .jg-panel-btn-min, .jg-panel-btn-max, .jg-panel-btn-small, .jg-panel-btn-smallrev";
				$(controls, this.element).css('display', 'block');
				$(sel, this.element).css('display', 'none');
			},
			_replaceCSSBottomRight:function(panel) {
				var panelPosition = panel.position();
				if (panel.css('bottom')) {
					panel.css({
						'top': parseInt(panelPosition.top, 10) + 'px',
						'bottom': ''
					});
				}
				if (panel.css('right')) {
					panel.css({
						'left': parseInt(panelPosition.left, 10) + 'px',
						'right': ''
					});
				}
			},
			_setZi:function() {
				var zi = 0;
				$('.jsPanel').each(function () {
					if ($(this).zIndex() > zi) {
						zi = $(this).zIndex();
					}
				});
				return zi + 1;
			},
			_autoclose:function(panel, id) {
				var elmt = $('#' + id);
				if (elmt.length > 0) {
					elmt.fadeOut('slow', function () {
						panel.close(); // elmt geht hier nicht weil .close() nicht f¨¹r elmt definiert ist
					});
				}
			},
			// converts this.options.position string to object
			_rewriteOPosition:function() {
				var op = this.options.position;
				if (op === 'center') {
					return {top: 'center', left: 'center'};
				}
				if (op === 'auto') {
					return {top: 'auto', left: 'auto'};
				}
				if (op === 'top left') {
					return {top: '0', left: '0'};
				}
				if (op === 'top center') {
					return {top: '0', left: 'center'};
				}
				if (op === 'top right') {
					return {top: '0', right: '0'};
				}
				if (op === 'center right') {
					return {top: 'center', right: '0'};
				}
				if (op === 'bottom right') {
					return { bottom: '0', right: '0'};
				}
				if (op === 'bottom center') {
					return {bottom: '0', left: 'center'};
				}
				if (op === 'bottom left') {
					return {bottom: '0', left: '0'};
				}
				if (op === 'center left') {
					return {top: 'center', left: '0'};
				}
				return this.options.position;
			},
			// builds toolbar
			_configToolbar:function(optionToolbar, toolbar) {
				var i,
					el,
					type,
					max = optionToolbar.length;
				for (i = 0; i < max; i += 1) {
					if (typeof optionToolbar[i] === 'object') {
						el = $(optionToolbar[i].item);
						type = el.prop('tagName').toLowerCase();
						if (type === 'button') {
							// set text of button
							el.append(optionToolbar[i].btntext);
							// add class to button
							if (typeof optionToolbar[i].btnclass === 'string') {
								el.addClass(optionToolbar[i].btnclass);
							}
						}
						toolbar.append(el);
						// bind handler to the item
						if ($.isFunction(optionToolbar[i].callback)) {
							el.on(optionToolbar[i].event, jsP, optionToolbar[i].callback);
							// jsP is accessible in the handler as "event.data"
						}
					}
				}
			},
			
			// calculates this.options.position for hints using 'top left', 'top center' or 'top right'
         _hintTop:function(hintGroup) {
            var i,
                hintH = 0,
                max = hintGroup.length;
            for (i = 0; i < max; i += 1) {
                hintH += $('#' + hintGroup[i]).outerHeight(true);
            }
            if (hintGroup === jsPanel.hintsTr) {
                return {top: hintH, right: 0};
            }
            if (hintGroup === jsPanel.hintsTl) {
                return {top: hintH, left: 0};
            }
            if (hintGroup === jsPanel.hintsTc) {
                return {top: hintH, left: 'center'};
            }
            return {top: 0, left: 0};
        },

        // reposition hint upon closing
        _reposHints:function(hintGroup) {
            var hintH,
                el,
                i,
                max = hintGroup.length;
            if (jsPparentTagname === 'body') {
                hintH = winscrollTop();
            } else {
                hintH = 0;
            }
            for (i = 0; i < max; i += 1) {
                el = $('#' + hintGroup[i]);
                el.animate({
                    top: hintH + 'px'
                });
                hintH += el.outerHeight(true);
            }
        },

        // calculates css left for tooltips
         _calcPosTooltipLeft:function(pos) {
            // width of element serving as trigger for the tooltip
            var parW = jsPparent.outerWidth(),
                // check whether offset is set
                oX = this.options.offset.left || 0;
            if (pos === 'top' || pos === 'bottom') {
                return (parW - this.options.size.width) / 2 + oX + 'px';
            }
            if (pos === 'left') {
                return -(this.options.size.width) + oX + 'px';
            }
            if (pos === 'right') {
                return parW + oX + 'px';
            }
            return false;
        },
        // calculates css top for tooltips
        _calcPosTooltipTop:function(pos) {
            var parH = jsPparent.innerHeight(),
                oY = this.options.offset.top || 0;
            if (pos === 'left' || pos === 'right') {
                return -(this.options.size.height / 2) + (parH / 2) + oY + 'px';
            }
            if (pos === 'top') {
                return -(this.options.size.height + oY) + 'px';
            }
            if (pos === 'bottom') {
                return parH + oY + 'px';
            }
            return false;
        },

        // calculate position center for this.options.position == 'center'
        _posCenter:function(selector, size) {
            var posL = ($(selector).outerWidth() / 2) - ((parseInt(size.width, 10) / 2)),
                posT;
            if (selector === 'body') {
                posT = ($(window).outerHeight() / 2) - ((parseInt(size.height, 10) / 2) - winscrollTop());
            } else {
                posT = ($(selector).outerHeight() / 2) - ((parseInt(size.height, 10) / 2));
            }
            return {top: posT + 'px', left: posL + 'px'};
        },

        // restores minimized panels to their initial container, reenables resizable and draggable, repositions minimized panels
        _restoreFromMinimized:function() {
            var minimizedCount = $('.jsPanel', $('#jg-panel-min-container')).length,
                i,
                left;
            // restore minimized panel to initial container
            if (this.status === "minimized") {
                // hier kein fadeOut() einbauen, funktioniert nicht mit fixPosition()
                this.element.animate({opacity: 0}, {duration: 50});
                this.element.appendTo(this.options.selector);
            }
            this.element.resizable("enable").draggable("enable");
            // reposition minimized panels
            for (i = 0; i < minimizedCount; i += 1) {
                left = (i * this.widthMinimized) + 'px';
                $('.jsPanel', $('#jg-panel-min-container')).eq(i).animate({
                    left: left
                });
            }
        },

        // maximizes a panel within the body element
        _maxWithinBody:function() {
			var self =  this;
            if (this.status !== "maximized" && this.jsPparentTagname === 'body' && this.options.paneltype.mode !== 'default') {
                // remove window.scroll handler, is added again later in this function
                $(window).off('scroll', this.jsPanelfixPos);
                // restore minimized panel to initial container
                this._restoreFromMinimized();
                this.element.animate({
                    top: self._winscrollTop() + 5 + 'px',
                    left: self._winscrollLeft() + 5 + 'px',
                    width: self._winouterWidth() - 10 + 'px',
                    height: self._winouterHeight() - 10 + 'px'
                }, {
                    done: function () {
                        self.resizeContent();
                        self.element.animate({opacity: 1}, {duration: 150});
                        // hier kein fadeIn() einbauen, funktioniert nicht mit fixPosition()
                        self._hideControls(".jg-panel-btn-max, .jg-panel-btn-smallrev");
                        self.status = "maximized";
                        $(self.element).trigger('jspanelmaximized', self.element.attr('id'));
                        $(self.element).trigger('jspanelstatechange', self.element.attr('id'));
                        self._fixPosition();
                    }
                });
            }
        },

        // maximizes a panel within an element other than body
       _maxWithinElement:function() {
			var self =  this;
            if (this.status !== "maximized" && jsPparentTagname !== 'body' && this.options.paneltype.mode !== 'default') {
                var width,
                    height;
                // restore minimized panel to initial container
                this._restoreFromMinimized();
                width = parseInt(this.element.parent().outerWidth(), 10) - 10 + 'px';
                height = parseInt(this.element.parent().outerHeight(), 10) - 10 + 'px';
                this.element.animate({
                    top: '5px',
                    left: '5px',
                    width: width,
                    height: height
                }, {
                    done: function () {
                        self.resizeContent();
                        self.element.animate({opacity: 1}, {duration: 150});
                        self._hideControls(".jg-panel-btn-max, .jg-panel-btn-smallrev");
                        self.status = "maximized";
                        $(self.element).trigger('jspanelmaximized', self.element.attr('id'));
                        $(self.element).trigger('jspanelstatechange', self.element.attr('id'));
                    }
                });
            }
        },

        // moves a panel to the minimized container
        _movetoMinified:function() {
			var self = this;
            var mincount,
                left;
            // wenn der Container f¨¹r die minimierten jsPanels noch nicht existiert -> erstellen
            if ($('#jg-panel-min-container').length === 0) {
                $('body').append('<div id="jg-panel-min-container"></div>');
            }
            if (this.status !== "minimized") {
                mincount = $('.jsPanel', $('#jg-panel-min-container')).length;
                left = (mincount * this.widthMinimized) + 'px';
                // jsPanel in vorgesehenen Container verschieben
                this.element.css({
                    left: left,
                    top: 0,
                    opacity: 1
                })
                    .appendTo('#jg-panel-min-container')
                    .resizable({disabled: true})
                    .draggable({disabled: true});
                this.content.css('min-width', '');
                // buttons show or hide
                self._hideControls(".jg-panel-btn-min, .jg-panel-btn-small, .jg-panel-btn-smallrev");
                $(this.element).trigger('jspanelminimized', this.element.attr('id'));
                $(this.element).trigger('jspanelstatechange', this.element.attr('id'));
                this.status = "minimized";
                $(window).off('scroll', this.jsPanelfixPos);
            }
        },

        _calcPos:function(prop, selector) {
            if (this.options.position[prop] === 'auto') {
                this.options.position[prop] = this.count * 26 + 'px';
            } else if ($.isFunction(this.options.position[prop])) {
                this.options.position[prop] = this.options.position[prop](jsP);
            } else if (this.options.position[prop] === 0) {
                this.options.position[prop] = '0';
            } else {
                this.options.position[prop] = parseInt(this.options.position[prop], 10) + 'px';
            }
            // corrections if jsPanel is appended to the body element
            if (selector === 'body') {
                if (prop === 'top') {
                    this.options.position[prop] = parseInt(this.options.position[prop], 10) + this._winscrollTop() + 'px';
                }
                if (prop === 'bottom') {
                    this.options.position[prop] = parseInt(this.options.position[prop], 10) - this._winscrollTop() + 'px';
                }
                if (prop === 'left') {
                    this.options.position[prop] = parseInt(this.options.position[prop], 10) + this._winscrollLeft() + 'px';
                }
                if (prop === 'right') {
                    this.options.position[prop] = parseInt(this.options.position[prop], 10) - this._winscrollLeft() + 'px';
                }
            }
            return this.options.position[prop];
        },

        // close all tooltips
        _closeallTooltips:function() {
            var pID;
            $('.jg-panel-tt').each(function () {
                pID = $(this).attr('id');
                // if present remove tooltip wrapper and than remove tooltip
                $('#' + pID).unwrap().remove();
                $('body').trigger('jspanelclosed', pID);
            });
        },
		
			
		// restores a panel to its "normalized" (not minimized, maximized or smallified) position & size
        normalize :function () {
			var self = this;
            var panelTop;
            // remove window.scroll handler, is added again later in this function
            $(window).off('scroll', this.jsPanelfixPos);
            // restore minimized panel to initial container
            this._restoreFromMinimized();
            // correction for panels maximized in body after page was scrolled
            if (this.jsPparentTagname === 'body') {
                panelTop = this._winscrollTop() + this.verticalOffset + 'px';
            } else {
                panelTop = this.options.position.top;
            }
            this.element.animate({
                width:  this.options.size.width,
                height: this.options.size.height,
                top:    panelTop,
                left:   this.options.position.left
            }, {
                done: function () {
                    // hier kein fadeIn() einbauen, funktioniert nicht mit fixPosition()
                    self.element.animate({opacity: 1}, {duration: 150});
                    self._hideControls(".jg-panel-btn-norm, .jg-panel-btn-smallrev");
                    self.element.resizable("enable").draggable("enable");
                    self.status = "normalized";
                    self.element.trigger('jspanelnormalized', self.element.attr('id'));
                    self.element.trigger('jspanelstatechange', self.element.attr('id'));
                    if (self.jsPparentTagname === 'body') {
                        self._fixPosition();
                    }
                }
            });
            return this.element;
        },

        close :function () {
			var self = this;
            // get parent-element of jsPanel
            var context = this.element.parent(),
                panelID = this.element.attr('id'),
                panelcount = context.children('.jsPanel').length, // count of panels in context
                i,
                ind;
            // delete childpanels ...
            this.closeChildpanels();
            // if present remove tooltip wrapper
            if (context.hasClass('jg-panel-tooltip-wrapper')) {
                this.element.unwrap();
            }
            // remove the jsPanel itself
            this.element.remove();
            $('body').trigger('jspanelclosed', panelID);

            // remove backdrop only when modal jsPanel is closed
            if (this.options.paneltype.type === 'modal') {
                $('.jg-panel-backdrop').remove();
            }

            // reposition minimized panels
            for (i = 0; i < panelcount - 1; i += 1) {
                context.children('.minimized').eq(i).animate({
                    left: (i * self.widthMinimized) + 'px'
                });
            }
            // update arrays with hints
            if (this.options.paneltype.type === 'hint') {
                ind = jsPanel.hintsTc.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTc.splice(ind, 1);
                    // reposition hints
                    reposHints(jsPanel.hintsTc);
                }
                ind = jsPanel.hintsTl.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTl.splice(ind, 1);
                    reposHints(jsPanel.hintsTl);
                }
                ind = jsPanel.hintsTr.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTr.splice(ind, 1);
                    reposHints(jsPanel.hintsTr);
                }
            }
            return context;
        },

        closeChildpanels : function () {
            var pID;
            $('.jsPanel', this).each(function () {
                pID = $(this).attr('id');
                $('#' + pID).remove();
                $('body').trigger('jspanelclosed', pID);
            });
            return this.element;
        },

       minimize : function () {
			var self =  this;
            // update panel size to have correct values when normalizing again
            if (this.status === "normalized") {
                this.options.size.width = this.element.outerWidth() + 'px';
                this.options.size.height = this.element.outerHeight() + 'px';
            }
            this.element.animate({
                opacity: 0
            }, {
                duration: 400, // fade out speed when minimizing
                complete: function () {
                    self.element.animate({
                        width: '150px',
                        height: '25px'
                    }, {
                        duration: 100,
                        complete: function () {
                            self._movetoMinified();
                            self.element.css('opacity', 1);
                        }
                    });
                }
            });
            return self.element;
        },

        maximize : function () {
            if (this.jsPparentTagname === 'body') {
                this._maxWithinBody();
            } else {
                this._maxWithinElement();
            }
            return this.element;
        },

        smallify : function () {
			var self = this;
            if (this.status !== "smallified" && this.status !== "smallifiedMax") {
                var statusNew;
                if (this.status === "maximized") {
                    statusNew = "smallifiedMax";
                } else {
                    statusNew = "smallified";
                }
                // store panel height in function property
                this.smallify.height = this.element.outerHeight() + 'px';
                this.panelheaderheight = this.header.outerHeight() - 2;
                this.panelfooterheight = this.footer.outerHeight();
                this.panelcontentheight = this.content.outerHeight();
                this.content.css('min-width', this.content.outerWidth() + 'px');
                this.element.animate({
                    height: this.panelheaderheight + 'px'
                },
                    {
                        done: function () {
                            if (this.status === 'maximized') {
                                self._hideControls(".jg-panel-btn-max, .jg-panel-btn-small");
                            } else {
                                self._hideControls(".jg-panel-btn-norm, .jg-panel-btn-small");
                            }
                            self.status = statusNew;
                            self.element.trigger('jspanelsmallified', self.element.attr('id'));
                            self.element.trigger('jspanelstatechange', self.element.attr('id'));
                        }
                    });
            } else {
                this.element.animate({
                    height: self.smallify.height
                },
                    {
                        done: function () {
                            if (self.status === 'smallified') {
                                self._hideControls(".jg-panel-btn-norm, .jg-panel-btn-smallrev");
                                self.status = "normalized";
                                self.element.trigger('jspanelnormalized', self.element.attr('id'));
                                self.element.trigger('jspanelstatechange', self.element.attr('id'));
                            } else {
                                self._hideControls(".jg-panel-btn-max, .jg-panel-btn-smallrev");
                                self.status = "maximized";
                                self.element.trigger('jspanelmaximized', self.element.attr('id'));
                                self.element.trigger('jspanelstatechange', self.element.attr('id'));
                            }
                        }
                    });
            }
            return this;
        },

        // resizes the .jg-panel-content to match desired panel size
        resizeContent : function () {
            var hdrftr;
            if (this.footer.css('display') === 'none') {
                hdrftr = this.header.outerHeight() + 'px';
            } else {
                hdrftr = this.header.outerHeight() + this.footer.outerHeight() + 'px';
            }
            this.content.css({
                height: 'calc(100% - ' + hdrftr + ')',
                width: '100%'
            });
            return this.element;;
        },

        front : function () {
            this.css('z-index', this.setZi());
            return this.element;;
        },

        addToolbar: function (place, items) {
            if (place === 'header') {
                configToolbar(items, this.header.toolbar);
            } else if (place === 'footer') {
                this.footer.css({
                    display: 'block',
                    padding: '5px 25px 5px 5px'
                });
                configToolbar(items, this.footer);
            }
            return this.element;;
        },

        title :function (text) {
            if (arguments.length === 0) {
                return this.header.title.html();
            }
            if (arguments.length === 1 && typeof text === 'string') {
                this.header.title.html(text);
                return this.element;
            }
            return this.element;;
        }
			
			
		
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
		}
	);
	
	
	
	
	
	
	/* Experimental body click handler: remove all tooltips on click in body except click is inside tooltip */
    $('body').click(function (e) {
        var pID,
            isTT = $(e.target).closest('.jg-panel-tt' ).length;
        //console.log($(e.target).closest('.jg-panel-tt' ).length);
        if (isTT < 1) {
            $('.jg-panel-tt').each(function () {
                pID = $(this).attr('id');
                // if present remove tooltip wrapper and than remove tooltip
                $('#' + pID).unwrap().remove();
                $('body').trigger('jspanelclosed', pID);
            });
        }
    });
	
	
	$.jgPanel=function(options){
		return $("<div></div>").jgPanel(options);
	}
	/* jsPanel.defaults */
    $.jgPanel.defaults = {
        "addClass": {
            header: false,
            content: false,
            footer: false
        },
        "ajax": false,
        "autoclose": false,
        "bootstrap": false,
        "callback": undefined,
        "content": false,
        "controls": {
            buttons: true,
            iconfont: false
        },
        "draggable": {
            handle: 'div.jg-panel-hdr, div.jg-panel-ftr',
            stack: '.jsPanel',
            opacity: 0.7
        },
        "id": function () {
            jsPanel.ID += 1;
            return 'jsPanel-' + jsPanel.ID;
        },
        "load": false,
        "offset": {
            top: 0,
            left: 0
        },
        "paneltype": false,
        "overflow": 'hidden',
        "position": 'auto',
        "removeHeader": false,
        "resizable": {
            handles: 'e, s, w, se, sw',
            autoHide: false,
            minWidth: 150,
            minHeight: 93
        },
        "rtl": false,
        "selector": 'body',
        "show": 'fadeIn',
        "size": {
            width: 400,
            height: 222
        },
        "theme": 'default',
        "title": 'jsPanel',
        "toolbarFooter": false,
        "toolbarHeader": false,
		"autoAppend":true
    };
	
	
	
	
})(jQuery);

(function($){
	$.fn.alterClass = function (removals, additions) {
        var self = this,
            patt;
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }
        patt = new RegExp('\\s' +
            removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
            '\\s', 'g');

        self.each(function (i, it) {
            var cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });
        return !additions ? self : self.addClass(additions);
    };
})(jQuery)

	
		