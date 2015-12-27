/**
 * jQuery json-viewer
 * @author: Alexandre Bodelot <alexandre.bodelot@gmail.com>, Philipp Kuebler <info@pkuebler.de>
 */
(function($){

	/**
	 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
	 * @return boolean
	 */
	function isCollapsable(arg) {
		return arg instanceof Object && Object.keys(arg).length > 0;
	}

	/**
	 * Check if a string represents a valid url
	 * @return boolean
	 */
	function isUrl(string) {
		 var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		 return regexp.test(string);
	}

	/**
	 * Transform a json object into html representation
	 * @return string
	 */
	function json2html(json, key) {
		html = '';
		if (typeof json === 'string') {
			json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			if (isUrl(json))
				html += '<a href="' + json + '"'+((key)?' data-key="'+key+'"':'')+' class="json-string">' + json + '</a>';
			else
				html += '<span class="json-string"'+((key)?' data-key="'+key+'"':'')+'>"' + json + '"</span>';
		}
		else if (typeof json === 'number') {
			html += '<span class="json-literal"'+((key)?' data-key="'+key+'"':'')+'>' + json + '</span>';
		}
		else if (typeof json === 'boolean') {
			html += '<span class="json-literal"'+((key)?' data-key="'+key+'"':'')+'>' + json + '</span>';
		}
		else if (json === null) {
			html += '<span class="json-literal"'+((key)?' data-key="'+key+'"':'')+'>null</span>';
		}
		else if (json instanceof Array) {
			if (json.length > 0) {
				html += '[<ol class="json-array"'+((key)?' data-key="'+key+'"':'')+'>';
				for (var i = 0; i < json.length; ++i) {
					html += '<li>'
					// Add toggle button if item is collapsable
					if (isCollapsable(json[i]))
						html += '<a href class="json-toggle"></a>';

					html += json2html(json[i]);
					// Add comma if item is not last
					if (i < json.length - 1)
						html += ',';
					html += '</li>';
				}
				html += '</ol>]';
			}
			else {
				html += '[]';
			}
		}
		else if (typeof json === 'object') {
			var key_count = Object.keys(json).length;
			if (key_count > 0) {
				html += '{<ul class="json-dict"'+((key)?' data-key="'+key+'"':'')+'>';
				for (var i in json) {
					if (json.hasOwnProperty(i)) {
						html += '<li>';
						// Add toggle button if item is collapsable
						if (isCollapsable(json[i]))
							html += '<a href class="json-toggle">' + i + '</a>';
						else
							html += i;

						html += ': ' + json2html(json[i], i);
						// Add comma if item is not last
						if (--key_count > 0)
							html += ',';
						html += '</li>';
					}
				}
				html += '</ul>}';
			}
			else {
				html += '{}';
			}
		}
		return html;
	}

	/**
	 * Edit
	 */
	function addInput (obj, cb) {
		var input = $('<input />');
		input.val(obj.text());
		obj.hide();
		obj.before(input);
		input.bind('keyup.submit', function(e){
			if(e.keyCode == 13) {
				if (obj.text() != $(this).val()) {
					obj.text($(this).val());
					if (typeof cb == 'function') {
						cb(html2json(obj.parents("#json-renderer")));
					}
				}
				obj.show();
				$(this).unbind('keyup.submit');
				$(this).remove();
			}
		});
	}

	function html2json (html, parent) {
		var children = html.children().get();
		if (children.length == 0)
			return [];

		for (var i in children) {
			var item = $(children[i]);
			var key = item.data('key');

			if (item.prop('tagName') == 'UL' || item.prop('tagName') == 'OL') {
				var child = [];
				if (item.prop('tagName') == 'UL')
					child = {};

				child = html2json(item, child);
				// Root?
				if (parent) {
					// Add Parent
					if (!key) {
						parent.push(child); // Array
					} else {
						parent[key] = child; // Obj
					}
				} else {
					parent = child;
				}
			} else if (item.prop('tagName') == 'SPAN' || (item.prop('tagName') == 'A' && item.hasClass('json-string'))) {
				// Add Parent
				if (!key) {
					parent.push(item.text()); // Array
				} else {
					parent[key] = item.text(); // Obj
				}
			} else {
				if(parent)
					html2json(item, parent);
			}
		}

		return parent;
	}

	/**
	 * jQuery plugin method
	 */
	$.fn.jsonViewer = function(json, callbackChange) {
		var lastObjClick = null,
			timer = null;

		// jQuery chaining
		return this.each(function() {

			// Transform to HTML
			var html = json2html(json)
			if (isCollapsable(json))
				html = '<a href class="json-toggle"></a>' + html;

			// Insert HTML in target DOM element
			$(this).html(html);

			// Bind click on toggle buttons
			$(this).off('click');
			$(this).on('click', 'a.json-toggle', function() {
				if (lastObjClick == null) {
					// First Click
					lastObjClick = $(this);
					timer = setTimeout(function() {
						// Click
						var target = lastObjClick.toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
						target.toggle();
						if (target.is(':visible')) {
							target.siblings('.json-placeholder').remove();
						}
						else {
							var count = target.children('li').length;
							var placeholder = count + (count > 1 ? ' items' : ' item');
							target.after('<a href class="json-placeholder">' + placeholder + '</a>');
						}
						lastObjClick = null;
					}, 200);
				} else {
					// Double Click
					clearTimeout(timer);
					addInput($(this), callbackChange);
					lastObjClick = null;
				}
				return false;
			});

			$(this).on('click', 'span.json-key, span.json-literal, span.json-string', function() {
				addInput($(this), callbackChange);
			});

			// Simulate click on toggle button when placeholder is clicked
			$(this).on('click', 'a.json-placeholder', function() {
				$(this).siblings('a.json-toggle').click();
				return false;
			});
		});
	};
})(jQuery);
