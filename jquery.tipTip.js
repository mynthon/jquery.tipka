 /*
 * TipTip
 * Copyright 2010 Drew Wilson
 * www.drewwilson.com
 * code.drewwilson.com/entry/tiptip-jquery-plugin
 *
 * Version 1.3   -   Updated: Mar. 23, 2010
 *
 * This Plug-In will create a custom tooltip to replace the default
 * browser tooltip. It is extremely lightweight and very smart in
 * that it detects the edges of the browser window and will make sure
 * the tooltip stays within the current window size. As a result the
 * tooltip will adjust itself to be displayed above, below, to the left
 * or to the right depending on what is necessary to stay within the
 * browser window. It is completely customizable as well via CSS.
 *
 * This TipTip jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($){

	//new style - not used by now

	//tip should be separate class, not bunch of functions with prefix

	var TipPanel = function(trigger, options){
		this.id = 'tiphld' + (+new Date()) + '' + Math.round(Math.random() * 1e6);
		this.idSel = '.' + id
		this.holder = null
		this.content = null
		this.arrow = null
		this.options = options


		this.init()
	}

	TipPanel.prototype = {

		init: function(){
			var opts = this.options

			// Setup tip tip elements and render them to the DOM
			if($(".tiptip_holder.tiptip_holder_" + GUID + '_' + unique_id).length > 0){
				tiptip_holder.stop();
				tiptip_holder.remove();
			}
			this.holder = $('<div class="tiptip_holder ' + this.id + ' ' + opts.addClass + '" style="min-width:40px; position:absolute; top:0; left:0; display:block; margin-left:-9999em;max-width:'+ opts.maxWidth +';"></div>');
			this.content = $('<div class="tiptip_content"></div>');
			this.arrow = $('<div class="tiptip_arrow" style="position:absolute;"><div class="tiptip_arrow_outer"></div><div class="tiptip_arrow_inner"></div></div>');

			this.holder
					.attr('data-tiptipclass', "")
					.data('justCreated', true)
					.append(this.content)
					.prepend(this.arrow)

			if (opts.maxHeight) {
				this.content.css({
					maxHeight: opts.maxHeight,
					overflow: 'auto'
				});
			}
		},

		reposition: function(){
			var opts = this.options
			var $content = this.content
			var $holder = this.holder

			var maxWidth = parseInt(opts.maxWidth)
			var diff_size = $content.outerWidth() - $content.width();
			$content.children().each(function(){
				if ($(this).outerWidth() > maxWidth){
					maxWidth = ($(this).outerWidth() + diff_size);
				}
			});

			$holder.css({
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

			var trigger_top = parseInt(trigger.offset()['top']);
			var trigger_left = parseInt(trigger.offset()['left']);
			var trigger_height = trigger.outerHeight();
			var trigger_width = trigger.outerWidth();
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

			var tiptip_holder_force_width = $holder.width();
			$holder.css({
				'width':tiptip_holder_force_width,
				'margin-top': margin_top,
				'margin-left': margin_left
			}).removeClass($holder.attr('data-tiptipclass')).addClass("tip_" + add_class).attr('data-tiptipclass', "tip_" + add_class);
			tiptip_arrow.css({
				"margin-left": arrow_left,
				"margin-top": arrow_top
			});

			if ($holder.data('justCreated')){
				$holder.data('justCreated', false);
				$holder.hide();
			}
		},

		open: function(){
			if (!this.isAttached()){
				this.attach();
			}
		},

		close: function(){

		},

		attach: function(){
			$('body').append(this.holder)
		},

		detach: function(){
			$(this.idSel).remove()
		},

		isAttached: function(){
			return ($(this.idSel).length > 0)
		},

		setContent: function(html){
			this.content.html(html)
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
	 *	defaults - try to fit in defaults.
	 *	findAnySpot - try to fit in any fully visible spot.
	 *	defaultsBestFit - if no fully visible spot find where tip will be most visible but limit to defaults.
	 *	bestFit - if no fully visible spot find where tip will be most visible.
	 * @param bool tipHoverBind determines if tip should stay after moving cursor
	 *  over it or only over trigger and if close action should be fired after
	 *  tip mouse rollout.
	 */

	var defaults = {
		addClass:'',
		activation: "hover",
		keepAlive: false,
		maxWidth: "200px",
		maxHeight: null,
		edgeOffset: 3,
		defaultPosition: "b",
		smartPosition: 'defaultsBestFit',
		tipHoverBind: true,
		delay: 400,
		fadeIn: 200,
		fadeOut: 50,
		attribute: "title",
		content: false, // HTML or String to fill TipTip with
		enter: function(){},
		exit: function(){}
	};

	var S_CLOSED = 1;
	var S_OPENED = 2;
	var S_CLOSING = 4;
	var S_OPENING = 8;


	var methods = {
		init : function(options) {
			var global_unique_id = 0;
			var GUID = +new Date() + '' + Math.round(Math.random() * 1e6);

			return this.filter(':not(.tiptip_hastip)').each(function(){

				var opts = {};
				$.extend(opts, defaults, options);
				this.opts = opts; //po przebudowie trzeba używać tylko tego

				var unique_id = -1,
				close_timeout_o = null,
				close_timeout_ms = 80,
				show_timeout_o = null,
				show_timeout_ms = 30,
				load_timeout_o = false,
				load_timeout_ms = this.opts.delay,
				tiptip_holder = null,
				tiptip_content = null,
				tiptip_arrow = null,
				$this = this,
				_this = this, //use this
				trigger = $(this),
				old_title = trigger.attr('title'),
				content = this.opts.content ? this.opts.content : trigger.attr(this.opts.attribute);


				_this.tipStatus = S_CLOSED;

				$(this).addClass('tiptip_hastip');

				if(content != ''){
					/*
					 *
					 */
					this.createHolder = function(){
						var opts = this.opts


						if (unique_id == -1){
							global_unique_id ++;
							unique_id = global_unique_id;
						}
						// Setup tip tip elements and render them to the DOM
						if($(".tiptip_holder.tiptip_holder_" + GUID + '_' + unique_id).length > 0){
							tiptip_holder.stop();
							tiptip_holder.remove();
						}
						tiptip_holder = $('<div class="tiptip_holder tiptip_holder_' + GUID + '_' + unique_id + ' ' + opts.addClass + '" style="min-width:40px; position:absolute; top:0; left:0; display:block; margin-left:-9999em;max-width:'+ opts.maxWidth +';"></div>');
						tiptip_content = $('<div class="tiptip_content"></div>');
						tiptip_arrow = $('<div class="tiptip_arrow" style="position:absolute;"></div>');
						$("body").append(tiptip_holder.html(tiptip_content).prepend(tiptip_arrow.html('<div class="tiptip_arrow_outer"></div><div class="tiptip_arrow_inner"></div>')));
						tiptip_holder.attr('data-tiptipclass', "")
						tiptip_holder.data('justCreated', true);

						if (opts.maxHeight) {
							tiptip_content.css({
								maxHeight: opts.maxHeight,
								overflow: 'auto'
							});
						}
					}

					/*
					 *
					 */
					this.reposition = function(){
						var maxWidth = parseInt(opts.maxWidth)
						var diff_size = tiptip_content.outerWidth() - tiptip_content.width();
						tiptip_content.children().each(function(){
							if ($(this).outerWidth() > maxWidth){
								maxWidth = ($(this).outerWidth() + diff_size);
							}
						});
						tiptip_holder.css({
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

						var trigger_top = parseInt(trigger.offset()['top']);
						var trigger_left = parseInt(trigger.offset()['left']);
						var trigger_height = trigger.outerHeight();
						var trigger_width = trigger.outerWidth();
						var tip_width = tiptip_content.outerWidth();
						var tip_height = tiptip_content.outerHeight();

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

						var tiptip_holder_force_width = tiptip_holder.width();
						tiptip_holder.css({
							'width':tiptip_holder_force_width,
							'margin-top': margin_top,
							'margin-left': margin_left
						}).removeClass(tiptip_holder.attr('data-tiptipclass')).addClass("tip_" + add_class).attr('data-tiptipclass', "tip_" + add_class);
						tiptip_arrow.css({
							"margin-left": arrow_left,
							"margin-top": arrow_top
						});

						if (tiptip_holder.data('justCreated')){
							tiptip_holder.data('justCreated', false);
							tiptip_holder.hide();
						}
					}

					/*
					 *
					 */
					this.calculateContent = function(){
						var content
						if(opts.content){
							content = typeof(opts.content) === 'function' ?
								opts.content(trigger) :
								opts.content
							;
						} else {
							content = trigger.attr(opts.attribute);
						}
						return content
					}






					this.activateTip = function(){
						var _tiptip = _this;
						opts.enter.apply(_tiptip);


						if ($this.tipStatus & S_CLOSING) {
							$this.tipStatus = S_OPENING;
							tiptip_holder.stop(true,false).fadeTo(opts.fadeIn, 1, function(){$this.tipStatus = S_OPENED});
							return true
						}else{

							$this.tipStatus = S_OPENING;

							if (load_timeout_o){
								clearTimeout(load_timeout_o);
							}
							load_timeout_o = setTimeout(function(){

								content = _tiptip.calculateContent()

								if(old_title){
									trigger.removeAttr('title');
								}

								tiptip_content.html(content);

								var images = tiptip_content.find('img');

								if (images.length > 0){
									var images_loaded = 0;
									images.each(function(){
										var jqimg = $(this);
										var image_object = new Image();

										image_object.onerror = function(){
											images_loaded += 1;
											if (images_loaded == images.length){
												_tiptip.reposition();
												if (show_timeout_o){
													clearTimeout(show_timeout_o);
												}
												show_timeout_o = setTimeout(function(){
													tiptip_holder.stop(true,false).fadeIn(opts.fadeIn, function(){$this.tipStatus = S_OPENED});
												}, show_timeout_ms);
												delete image_object;
											}
										}

										image_object.onload = function(){
											images_loaded += 1;
											if (images_loaded == images.length){
												_tiptip.reposition();
												if (show_timeout_o){
													clearTimeout(show_timeout_o);
												}
												show_timeout_o = setTimeout(function(){
													tiptip_holder.stop(true,false).fadeIn(opts.fadeIn, function(){$this.tipStatus = S_OPENED});
												}, show_timeout_ms);
												delete image_object;
											}
										}

										image_object.src = jqimg.attr('src');
									});
								} else {
									_tiptip.reposition();
									if (show_timeout_o){
										clearTimeout(show_timeout_o);
									}
									show_timeout_o = setTimeout(function(){
										tiptip_holder.stop(true,false).fadeIn(opts.fadeIn, function(){$this.tipStatus = S_OPENED});
									}, show_timeout_ms);
								}

							}, load_timeout_ms);
						}
					}

					this.deactivateTip = function(){
						_this.tipStatus = S_CLOSING
						opts.exit.apply(_this);

						clearTimeout(load_timeout_o);
						clearTimeout(show_timeout_o);

						show_timeout_o = null;
						close_timeout_o = null;

						if (old_title){
							trigger.attr('title', old_title);
						}
						tiptip_holder.stop(true, false).fadeOut(opts.fadeOut, function(){
							tiptip_holder.remove();
							_this.tipStatus = S_CLOSED;
						});
					}

					this._actionShow = function(){
						clearTimeout(close_timeout_o);
						if ($this.tipStatus & (S_CLOSED | S_CLOSING)) {
							if ($this.tipStatus & S_CLOSED){
								$this.createHolder();
								if (_this.opts.tipHoverBind){
									tiptip_holder.hover(
										function(){
											clearTimeout(close_timeout_o);
										},
										function(){
											if (!opts.keepAlive){
												close_timeout_o = setTimeout(_this.deactivateTip, close_timeout_ms);
											}
										}
									);
								}
							}
							_this.activateTip();
						}
					}



					this._actionHide = function(){
						if (!opts.keepAlive){
							clearTimeout(show_timeout_o);
							if ($this.tipStatus & (S_OPENED | S_OPENING)) {
								close_timeout_o = setTimeout($this.deactivateTip, close_timeout_ms)
							}
						}
					}

					if (opts.activation == 'elsewhere'){

					}else if(opts.activation == "hover"){
						trigger.hover(
							_this._actionShow,
							_this._actionHide
						)
					} else if (opts.activation == "focus") {
						trigger.focus(function(){
							_this.createHolder();
							_this.activateTip();
						}).blur(function(){
							_this.deactivateTip();
						});
					} else if(opts.activation == "click") {
						trigger.click(function(){
							_this.createHolder();
							_this.activateTip();
							tiptip_holder.hover(
								function(){
									clearTimeout(close_timeout_o);
									close_timeout_o = null;
								},
								function(){
									if (tiptip_holder){
										if(!opts.keepAlive){
											close_timeout_o = setTimeout(_this.deactivateTip, close_timeout_ms);
										}
									}
								}
								);
							return false;
						}).hover(
							function(){
								clearTimeout(close_timeout_o);
								close_timeout_o = null;
							},
							function(){
								if (tiptip_holder){
									if(!opts.keepAlive){
										close_timeout_o = setTimeout(_this.deactivateTip, close_timeout_ms);
									}
								}
							}
						);

						if(opts.keepAlive){
							_this.createHolder();
							tiptip_holder.hover(function(){}, function(){
								_this.deactivateTip();
							});
						}
					}
				}


				this.isOpened = function(){
					return !!($this.tipStatus & S_OPENED);
				}

				this.getHolder = function(){
					return tiptip_holder;
				}

				this.hasContent = function(){
					return (typeof(content) == 'string' && content.length > 0)
				}

				this.updateContent = function(content){
					tiptip_content.html(content);
					this.reposition();
					tiptip_holder.show();//zbadać czy to jest potrzebne, jeśli reposition nie zmienia display na none;
				}

			});
		},

		show: function(){
			return this.each(function(){
				this._actionShow();
			});
		},

		hide: function(){
			return this.each(function(){
				this._actionHide();
			});
		},

		updateContent: function(content){
			return this.each(function(){
				this.updateContent(content);
			});
		}
	};

	$.fn.tipTip = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tipTip' );
		}
	};

})(jQuery);