/*
 *	JavaScript Wordpress editor
 *	Author: 		Ante Primorac
 *	Author URI: 	http://anteprimorac.from.hr
 *	Version: 		1.1
 *	License:
 *		Copyright (c) 2013 Ante Primorac
 *		Permission is hereby granted, free of charge, to any person obtaining a copy
 *		of this software and associated documentation files (the "Software"), to deal
 *		in the Software without restriction, including without limitation the rights
 *		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *		copies of the Software, and to permit persons to whom the Software is
 *		furnished to do so, subject to the following conditions:
 *
 *		The above copyright notice and this permission notice shall be included in
 *		all copies or substantial portions of the Software.
 *
 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *		THE SOFTWARE.
 *	Usage:
 *		server side(WP):
 *			js_wp_editor( $settings );
 *		client side(jQuery):
 *			$('textarea').wp_editor( options );
 */

;(function( $, window ) {
	$.fn.wp_editor = function( options ) {

		if( !$(this).is('textarea') )
			console.warn('Element must be a textarea');

		if( typeof tinyMCEPreInit == 'undefined' || typeof QTags == 'undefined' || typeof ap_vars == 'undefined' )
			console.warn('js_wp_editor( $settings ); must be loaded');

		if( !$(this).is('textarea') || typeof tinyMCEPreInit == 'undefined' || typeof QTags == 'undefined' || typeof ap_vars == 'undefined' )
			return this;
		
		var default_options = {
			'mode': 'html',
			'mceInit' : {
				"theme": "modern",
				"skin": "lightgray",
				"language": "en",
				"formats": {
					"alignleft": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"left"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["alignleft"],
							"deep":false,
							"remove":"none"
						}
					],
					"aligncenter": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"center"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["aligncenter"],
							"deep": false,
							"remove": "none"
						}
					],
					"alignright": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"right"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["alignright"],
							"deep": false,
							"remove": "none"
						}
					],
					"strikethrough": {"inline":"del","deep":true,"split":true}
				},
				"relative_urls": false,
				"remove_script_host": false,
				"convert_urls": false,
				"browser_spellcheck": true,
				"fix_list_elements": true,
				"entities": "38,amp,60,lt,62,gt",
				"entity_encoding": "raw",
				"keep_styles": false,
				"paste_webkit_styles": "font-weight font-style color",
				"preview_styles": "font-family font-size font-weight font-style text-decoration text-transform",
				"wpeditimage_disable_captions": false,
				"wpeditimage_html5_captions": false,
				"plugins": "charmap,hr,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview,image",
				"content_css": ap_vars.includes_url + "css/dashicons.css?ver=3.9," + ap_vars.includes_url + "js/mediaelement/mediaelementplayer.min.css?ver=3.9," + ap_vars.includes_url + "js/mediaelement/wp-mediaelement.css?ver=3.9," + ap_vars.includes_url + "js/tinymce/skins/wordpress/wp-content.css?ver=3.9",
				"selector": "#apid",
				"resize": "vertical",
				"menubar": false,
				"wpautop": true,
				"indent": false,
				"toolbar1": "bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
				"toolbar2": "formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
				"toolbar3": "",
				"toolbar4": "",
				"tabfocus_elements": ":prev,:next",
				"body_class": "apid"
			}
		}, id_regexp = new RegExp('apid', 'g');

		if(tinyMCEPreInit.mceInit['apid']) {
			default_options.mceInit = tinyMCEPreInit.mceInit['apid'];
		}

		var options = $.extend(true, default_options, options);

		return this.each(function() {

			if( !$(this).is('textarea') )
				console.warn('Element must be a textarea');
			else {
				var current_id = $(this).attr('id');
				$.each( options.mceInit, function( key, value ) {
					if( $.type( value ) == 'string' )
					options.mceInit[key] = value.replace(id_regexp, current_id);
				} );
				options.mode = options.mode == 'tmce' ? 'tmce' : 'html';

				tinyMCEPreInit.mceInit[current_id] = options.mceInit;

				$(this).addClass('wp-editor-area').show();
				var self = this;
				if( $(this).closest('.wp-editor-wrap').length ) {
					var parent_el = $(this).closest('.wp-editor-wrap').parent();
					$(this).closest('.wp-editor-wrap').before($(this).clone());
					$(this).closest('.wp-editor-wrap').remove();
					self = parent_el.find('textarea[id="' + current_id + '"]');
				}

				var wrap = $('<div id="wp-' + current_id + '-wrap" class="wp-core-ui wp-editor-wrap ' + options.mode + '-active" />'),
					editor_tools = $('<div id="wp-' + current_id + '-editor-tools" class="wp-editor-tools hide-if-no-js" />'),
					editor_tabs = $('<div class="wp-editor-tabs" />'),
					switch_editor_html = $('<a id="' + current_id + '-html" class="wp-switch-editor switch-html" onclick="switchEditors.switchto(this);">Text</a>'),
					switch_editor_tmce = $('<a id="' + current_id + '-tmce" class="wp-switch-editor switch-tmce" onclick="switchEditors.switchto(this);">Visual</a>'),
					media_buttons = $('<div id="wp-' + current_id + '-media-buttons" class="wp-media-buttons" />'),
					insert_media_button = $('<a href="#" id="insert-media-button" class="button insert-media add_media" data-editor="' + current_id + '" title="Add Media"><span class="wp-media-buttons-icon"></span> Add Media</a>'),
					editor_container = $('<div id="wp-' + current_id + '-editor-container" class="wp-editor-container" />'),
					content_css = /*Object.prototype.hasOwnProperty.call(tinyMCEPreInit.mceInit[current_id], 'content_css') ? tinyMCEPreInit.mceInit[current_id]['content_css'].split(',') :*/ false;

				insert_media_button.appendTo(media_buttons);
				media_buttons.appendTo(editor_tools);

				switch_editor_html.appendTo(editor_tabs);
				switch_editor_tmce.appendTo(editor_tabs);
				editor_tabs.appendTo(editor_tools);

				editor_tools.appendTo(wrap);
				editor_container.appendTo(wrap);

				editor_container.append($(self).clone().addClass('wp-editor-area'));

				if( content_css != false )
					$.each( content_css, function() {
						if( ! $('link[href="' + this + '"]').length )
							$(self).before('<link rel="stylesheet" type="text/css" href="' + this + '">');
					} );

				$(self).before('<link rel="stylesheet" id="editor-buttons-css" href="' + ap_vars.includes_url + 'css/editor.css" type="text/css" media="all">');

				$(self).before(wrap);
				$(self).remove();

				new QTags(current_id);
				QTags._buttonsInit();
				switchEditors.go(current_id, options.mode);

            	$(wrap).on( 'click', '.insert-media', function( event ) {
					var elem = $( event.currentTarget ),
						editor = elem.data('editor'),
						options = {
							frame:    'post',
							state:    'insert',
							title:    wp.media.view.l10n.addMedia,
							multiple: true
						};

					event.preventDefault();

					elem.blur();

					if ( elem.hasClass( 'gallery' ) ) {
						options.state = 'gallery';
						options.title = wp.media.view.l10n.createGalleryTitle;
					}

					wp.media.editor.open( editor, options );
				});
			}
		});
	}
})( jQuery, window )