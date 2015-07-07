 /*
 * @author Krzysiek Grzembski (mynthon)
 *
 * @param {type} $
 * @returns {undefined}
 */


/*
 *
 * posiible bug in ie? Tooltip shows with native tooltip?
then in main function:
var isIE = navigator.userAgent.match(/msie/i);
and in methods.init:
// in ie tooltip show twice if title attribute was used
if (isIE && options.attribute === 'title') {
 rewrite title to other attribute and switch it in options
}
 */
(function($){
	 /*
	  * todo: implement
		enter: function(){},
		exit: function(){}
	  */

	var negativeMargin = '-99999999999em';

	/*
	 * Usage: tipka_reposition.call($myObject);
	 * This is used as function instead of objects method to reduce memory usage in ie8
	 *
	 * @returns {undefined}
	 */
	var tipka_reposition = function(){

		var opts = this.options
		var $content = this.content
		var $holder = this.holder
		var $trigger = $(this.trigger)
		var initDisplay = $holder.css('display'); // be sure to work on visible element. later we change display again

		var maxWidth = parseInt(opts.maxWidth);
		var diff_size = $content.outerWidth() - $content.width();
		$content.children().each(function(){
			if ($(this).outerWidth() > maxWidth){
				maxWidth = ($(this).outerWidth() + diff_size);
			}
		});

		$holder.css({
			'display': 'block',
			'width': 'auto',
			'max-width': maxWidth
		});

		var mode = '';
		var margin_top = 0;
		var margin_left = 0;
		var arrow_top = 0;
		var arrow_left = 0;
		var add_class = 't'

		var win_height = $(window).height();
		var win_width = $(window).width();
		var win_top = $(window).scrollTop();
		var win_left = $(window).scrollLeft();

		var trigger_top = parseInt($trigger.offset()['top']);
		var trigger_left = parseInt($trigger.offset()['left']);
		var trigger_height = $trigger.outerHeight();
		var trigger_width = $trigger.outerWidth();
		var tip_width = $content.outerWidth();
		var tip_height = $content.outerHeight();

		var arrow_size = 18;
		var half_offset = .25;
		var offset = opts.edgeOffset;

		var marg_y_top = trigger_top - offset - arrow_size - tip_height;
		var marg_y_more_top = trigger_top + trigger_height/2 - tip_height*half_offset;
		var marg_y_more_bottom = trigger_top + trigger_height/2  - tip_height*(1 - half_offset);
		var marg_y_bottom = trigger_top + trigger_height + offset + arrow_size;
		var marg_y_center = trigger_top + trigger_height/2 - tip_height/2;

		var marg_x_left = trigger_left - offset - arrow_size - tip_width;
		var marg_x_more_left = trigger_left + trigger_width/2 - tip_width*(1 - half_offset);
		var marg_x_more_right = trigger_left + trigger_width/2 - tip_width*half_offset;
		var marg_x_right = trigger_left + trigger_width + offset + arrow_size;
		var marg_x_center = trigger_left + trigger_width/2 - tip_width/2;

		var tip_field = tip_width * tip_height;

		var calc_field_diff = function(_x, _y){
			var top_cut = Math.min(0, Math.max(-(tip_height), _y - win_top))
			var right_cut = Math.min(0, Math.max(-(tip_width), win_width - _x - tip_width));
			var bottom_cut = Math.min(0, Math.max(-(tip_height), (win_top + win_height - _y - tip_height)));
			var left_cut = Math.min(0, Math.max(-(tip_width), _x - win_left));
			return 2*tip_field - (tip_field + (top_cut + bottom_cut)*tip_height) - (tip_field + (left_cut + right_cut)*tip_width)
		};

		var field_diffs = {
			t: calc_field_diff(marg_x_center, marg_y_top),
			r: calc_field_diff(marg_x_right, marg_y_center),
			b: calc_field_diff(marg_x_center, marg_y_bottom),
			l: calc_field_diff(marg_x_left, marg_y_center),
			tr: calc_field_diff(marg_x_more_right, marg_y_top),
			rt: calc_field_diff(marg_x_right, marg_y_more_top),
			rb: calc_field_diff(marg_x_right, marg_y_more_bottom),
			br: calc_field_diff(marg_x_more_right, marg_y_bottom),
			bl: calc_field_diff(marg_x_more_left, marg_y_bottom),
			lb: calc_field_diff(marg_x_left, marg_y_more_bottom),
			lt: calc_field_diff(marg_x_left, marg_y_more_top),
			tl: calc_field_diff(marg_x_more_left, marg_y_top)
		};

		(function(){
			var last_biggest_diff = Infinity;
			var best_mode = '';
			var k;
			var user_modes = opts.defaultPosition.split(',');

			if (opts.smartPosition === 'defaults') {
				for (k in user_modes){
					if (field_diffs[user_modes[k]] === 0){
						mode = user_modes[k];
						break;
					}
				}
				if(mode === ''){
					mode = user_modes[0];
				}

			} else if (opts.smartPosition === 'findAnySpot') {
				for (k in field_diffs) {
					if (field_diffs[k] === 0){
						mode = k;
						break;
					}
				}
				if(mode === ''){
					mode = user_modes[0];
				}

			} else if (opts.smartPosition === 'defaultsBestFit') {
				for(k in user_modes){
					if(field_diffs[user_modes[k]] < last_biggest_diff){
						last_biggest_diff = field_diffs[user_modes[k]];
						best_mode = user_modes[k];
					}
				}
				mode = best_mode;

			} else if (opts.smartPosition === 'bestFit') {
				for(k in field_diffs){
					if(field_diffs[k] < last_biggest_diff){
						last_biggest_diff = field_diffs[k];
						best_mode = k;
					}
				}
				mode = best_mode;
			}

			if (mode === '') {
				mode = 't';
			}
		})();

		if (mode == 't'){
			margin_top = trigger_top - offset - arrow_size - tip_height;
			margin_left = trigger_left + trigger_width/2 - tip_width/2;
			arrow_top = tip_height - 1;
			arrow_left = tip_width/2 - arrow_size/2;
			add_class = 't';
		}else if(mode == 'r'){
			margin_top = trigger_top + trigger_height/2 - tip_height/2;
			margin_left = trigger_left +  trigger_width + offset + arrow_size;
			arrow_top = tip_height/2 - arrow_size/2;
			arrow_left = 0;
			add_class = 'r';
		}else if(mode == 'b'){
			margin_top = trigger_top + trigger_height + offset + arrow_size;
			margin_left = trigger_left + trigger_width/2 - tip_width/2;
			arrow_top = -arrow_size + 1;
			arrow_left = tip_width/2 - arrow_size/2;
			add_class = 'b';
		}else if(mode == 'l'){
			margin_top = trigger_top + trigger_height/2 - (0.5 * tip_height);
			margin_left = trigger_left - offset - arrow_size - tip_width;
			arrow_top = tip_height/2 - arrow_size/2;
			arrow_left = tip_width - 1;
			add_class = 'l';
		}else if(mode == 'tr'){
			margin_top = trigger_top - offset - arrow_size - tip_height;
			margin_left = trigger_left + trigger_width/2 - (half_offset * tip_width);
			arrow_top = tip_height - 1;
			arrow_left = tip_width * half_offset - arrow_size/2;
			add_class = 'tr';
		}else if(mode == 'rt'){
			margin_top = trigger_top + 0.5 * trigger_height - half_offset * tip_height;
			margin_left = trigger_left + trigger_width + offset + arrow_size;
			arrow_top = tip_height * half_offset - arrow_size/2;
			arrow_left = 0;
			add_class = 'rt';
		}else if(mode == 'rb'){
			margin_top = trigger_top + trigger_height/2 - (1 - half_offset) * tip_height;
			margin_left = trigger_left + trigger_width + offset + arrow_size;
			arrow_top = tip_height * (1 - half_offset) - arrow_size/2;
			arrow_left = 0;
			add_class = 'rb';
		}else if(mode == 'br'){
			margin_top = trigger_top + trigger_height + offset + arrow_size;
			margin_left = trigger_left + trigger_width/2 - (half_offset * tip_width);
			arrow_top = -arrow_size + 1;
			arrow_left = tip_width * half_offset - arrow_size/2;
			add_class = 'br';
		}else if(mode == 'bl'){
			margin_top = trigger_top + trigger_height + offset + arrow_size;
			margin_left = trigger_left + trigger_width/2 - (1 - half_offset) * tip_width;
			arrow_top = -arrow_size + 1;
			arrow_left = tip_width * (1 - half_offset) - arrow_size/2;
			add_class = 'bl'
		}else if(mode == 'lb'){
			margin_top = trigger_top + trigger_height/2 - (1 - half_offset) * tip_height;
			margin_left = trigger_left - offset - arrow_size - tip_width;
			arrow_top = tip_height * (1 - half_offset) - arrow_size/2;
			arrow_left = tip_width - 1;
			add_class = 'lb'
		}else if(mode == 'lt'){
			margin_top = trigger_top + trigger_height/2 - half_offset * tip_height;
			margin_left = trigger_left - offset - arrow_size - tip_width;
			arrow_top = tip_height * half_offset - arrow_size/2;
			arrow_left = tip_width - 1;
			add_class = 'lt'
		}else if(mode == 'tl'){
			margin_top = trigger_top - offset - arrow_size - tip_height;
			margin_left = trigger_left + trigger_width/2 - (1 - half_offset) * tip_width;
			arrow_top = tip_height - 1;
			arrow_left = tip_width * (1 - half_offset) - arrow_size/2;
			add_class = 'tl'
		}

		var tipka_holder_force_width = $holder.width();

		$holder.css({
			'width':tipka_holder_force_width,
			'margin-top': margin_top,
			'margin-left': margin_left,
			'display': initDisplay
		}).removeClass($holder.attr('data-tipkaclass')).addClass("tip_" + add_class).attr('data-tipkaclass', "tip_" + add_class);

		this.arrow.css({
			"margin-left": arrow_left,
			"margin-top": arrow_top
		});
	}; /*eof: tipka_reposition*/

	$.tipkaTipDefaults = {
		addClass:'',
		activation: "hover",
		keepAlive: false,
		maxWidth: "200px",
		maxHeight: null,
		edgeOffset: 3,
		defaultPosition: "b",
		smartPosition: 'defaultsBestFit',
		keepOnTip: true,
		delay: 400,
		fadeIn: 200,
		fadeOut: 50,
		attribute: "title",
		content: false, // HTML or String to fill tipka with
		enter: function(){},
		exit: function(){}
	};

	var TipPanel = function(trigger, options){
		this.id = 'tiphld' + (+new Date()) + '' + Math.round(Math.random() * 1e6);
		this.idSel = '.' + this.id
		this.trigger = trigger
		this.holder = null
		this.content = null
		this.arrow = null
		this.options = options

		this.cloto //close timeout object
		this.clotms = 200//close timeout in miliseconds

		this.init()
	}

	TipPanel.prototype = {

		init: function(){
			var opts = this.options
			var that = this

			// Setup tip tip elements and render them to the DOM
			if($(".tipka_holder" + this.idSel).length > 0){
				this.holder.stop().remove();
			}
			this.holder = $('<div class="tipka_holder ' +
				this.id + ' ' + opts.addClass +
				'" style="min-width:40px; position:absolute; top:0; left:0; display:block; margin-left:' + negativeMargin + ';max-width:' +
				opts.maxWidth +';"></div>');
			this.content = $('<div class="tipka_content"></div>');
			this.arrow = $('<div class="tipka_arrow" style="position:absolute;"><div class="tipka_arrow_outer"></div><div class="tipka_arrow_inner"></div></div>');

			this.holder
				.attr('data-tipkaclass', "")
				.append(this.content)
				.prepend(this.arrow)

			if (opts.maxHeight) {
				this.content.css({
					maxHeight: opts.maxHeight,
					overflow: 'auto'
				});
			}
		},

		open: function(){
			var attached = this.isAttached();
			var opts = this.options;
			clearTimeout(this.cloto)

			if (!attached){
				this.attach();
				tipka_reposition.call(this)
				this.holder.hide();
				this.holder.css({opacity:0}) //needed for animation
			}

			var at = (1 - parseFloat(this.holder.css('opacity')||0)) * opts.fadeIn;
			this.holder.stop(true,false).fadeTo(at, 1);
		},

		close: function(){
			var that = this;
			var opts = this.options;
			var $holder = this.holder;
			this.cloto = setTimeout(function(){
				$holder.stop(true,false).fadeTo(opts.fadeOut, 0, function(){
					that.detach();
					$holder.css({display:'block', marginLeft:negativeMargin, marginTop:negativeMargin});
				});
			}, this.clotms)
		},

		hideByMargin: function(){
			this.holder.css({'margin-top':negativeMargin, 'margin-left':negativeMargin})
		},

		attach: function(){
			var that = this;
			var $holder = this.holder;
			var attached = this.isAttached();

			if (!attached){

				$('body').append($holder);

				if (this.options.keepOnTip){
					$holder.off('mouseover.tipka').on('mouseover.tipka', function(){
						that.open()
					});

					$holder.off('mouseout.tipka').on('mouseout.tipka', function(){
						that.close()
					});
				}
			}
		},

		detach: function(){
			$(this.idSel).remove()
		},

		isAttached: function(){
			return ($(this.idSel).length > 0)
		},

		setContent: function(html){
			var that = this;
			var $temp = $('<div />').html(html);
			$temp.find('img').hide();

			this.content.html($temp.html());
			var images = this.content.find('img');

			images.each(function(){
				var $img = $(this);
				var img = new Image();

				img.onload = function(){
					that.hideByMargin()
					$img.show();
					tipka_reposition.call(that)
				};

				img.onerror = function(){
					that.hideByMargin()
					$img.show();
					tipka_reposition.call(that)
				};

				img.src = $(this).attr('src')
			});
		}
	}


	/*
	 *
	 * @param string activation hover|click|focus|elsewhere
	 *	elsewhere option means that tooltip will be fired by javascript rather than mouse event
	 * @param string defaultPosition comma separated list of positions (no spaces).
	 *	Available options are r, b, l, t, tr, rt, rb, br, bl, lb, lt, tl for
	 *	right, bottom, left, etc.
	 * @param string smartPosition
	 *	defaults - try to fit within defaults. if no fully visible spot found display at first position declared.
	 *	findAnySpot - try to fit in any fully visible spot. If no fully visible spot found display at default position.
	 *	defaultsBestFit - show in spot where tip will be mostly visible. Check only defaults.
	 *	bestFit - if no fully visible spot find where tip will be most visible.
	 * @param bool keepOnTip determines if tip should stay after moving cursor
	 *  over it or should always disappear after moving cursor out of trigger
	 */


	var methods = {
		init : function(options) {

			var localOptions = options;

			return this.each(function(){
				var $trigger = $(this);
				var trigger = this;
				var loadTimeoutObj = null

				if ($trigger.hasClass('tipka_hastip')){return true;} //this is much in ie8 than filter

				trigger.options = {};
				$.extend(trigger.options, $.tipkaTipDefaults, localOptions);
				var options = trigger.options;

				$trigger.addClass('tipka_hastip'); //be sure to not add two tips to one trigger
				var oldTitle = '';
				var tipPanel = null

				/*
				 * needed for backward compatibility reasons (for me only)
				 *
				 * @param {type} content
				 * @returns {undefined}
				 */
				this.updateContent = function(content){
					console.log('BACKWARD COMPATIBILITY: updateContent')
					tipPanel.setContent(content)
					tipka_reposition.call(tipPanel)
				}

				/*
				 * helper function for lazy creation of panel
				 * @returns {undefined}
				 */
				function createPanel(){
					if(!$trigger.data('tipPanel')){
						$trigger.data('tipPanel', new TipPanel(trigger, options));
						tipPanel = $trigger.data('tipPanel')
					}
				}

				/*
				 * helper that prepares content
				 *
				 * @returns {options.content|Window|String}
				 */
				function contentFactory(){
					var content = options.content
					var attr = options.attribute
					var toReturn = ''

					if (typeof(content) === 'string') {
						toReturn = content
					} else if(typeof(content) === 'function') {
						toReturn = content($trigger)
					} else if (content instanceof jQuery) {
						toReturn = content.html()
					} else if (attr) {
						toReturn = $trigger.attr(attr)
					}

					return toReturn
				}

				/*
				 * helper
				 *
				 * @param {type} e
				 * @returns {undefined}
				 */
				var actionOpen = function(e){
					e.preventDefault();
					e.stopPropagation();

					loadTimeoutObj = setTimeout(function(){
						trigger.open();
					}, (tipPanel && tipPanel.isAttached() ? 0 : options.delay));
				};

				this.open = function(){
					createPanel();
					tipPanel.setContent(contentFactory());
					oldTitle = $trigger.attr('title');
					$trigger.attr('title','');
					tipPanel.open();
				};

				/*
				 * helper
				 *
				 * @param {type} e
				 * @returns {undefined}
				 */
				var actionClose = function(e){
					clearTimeout(loadTimeoutObj)
					if (tipPanel && !options.keepAlive) {tipPanel.close();}
					if (oldTitle){$trigger.attr('title', oldTitle);}
				};

				this.close = function(e){
					if (tipPanel){tipPanel.close();}
					if (oldTitle){$trigger.attr('title', oldTitle);}
				};

				/*
				 * open/close management
				 */
				if (options.activation === 'elsewhere'){
					//just skip. elsewhere is a placeholder.
				} else if (options.activation === 'click') {
					$trigger.on('click', function(e){
						actionOpen(e);
					});

					$trigger.on('mouseout', function(){
						actionClose();
					});
				}else if(options.activation === 'hover'){
					$trigger.on('mouseover', function(e){
						actionOpen(e);
						return false;
					});

					$trigger.on('mouseout', function(){
						actionClose();
					});
				}else if(options.activation === 'focus'){
					$trigger.on('focus', function(e){
						actionOpen(e);
					});

					$trigger.on('blur', function(){
						actionClose();
					});
				}
			});
		},

		show: function(){
			return this.each(function(){
				console.log('deprecated show(), use open() instead')
				this.open()
			});
		},

		hide: function(){
			return this.each(function(){
				console.log('deprecated hide(), use close() instead')
				this.close()
			});
		},

		open: function(){
			return this.each(function(){
				this.open()
			});
		},

		close: function(){
			return this.each(function(){
				this.close()
			});
		},

		updateContent: function(content){
			return this.each(function(){
				var p = $(this).data('tipPanel');
				p.setContent(content);
				tipka_reposition.call(p)
			});
		}
	};

	$.fn.tipka = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tipka' );
		}
	};

})(jQuery);