var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function $(expr, con) {
	return typeof expr === "string" ? (con || document).querySelector(expr) : expr || null;
}

var EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

$.findNodeIndex = function (node) {
	var i = 0;
	while (node.previousSibling) {
		node = node.previousSibling;
		i++;
	}
	return i;
};

$.create = function (tag, o) {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		} else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		} else if (i === "styles") {
			if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object") {
				Object.keys(val).map(function (prop) {
					element.style[prop] = val[prop];
				});
			}
		} else if (i in element) {
			element[i] = val;
		} else {
			element.setAttribute(i, val);
		}
	}

	return element;
};

$.createSVG = function (tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		} else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		} else {
			if (i === "className") {
				i = "class";
			}
			if (i === "innerHTML") {
				element['textContent'] = val;
			} else {
				element.setAttribute(i, val);
			}
		}
	}

	return element;
};

$.runSVGAnimation = function (svg_container, elements) {
	// let parent = elements[0][0]['unit'].parentNode;

	var new_elements = [];
	var anim_elements = [];

	elements.map(function (element) {
		var obj = element[0];
		var parent = obj.unit.parentNode;
		// let index = let findNodeIndex(obj.unit);

		var anim_element = void 0,
		    new_element = void 0;

		element[0] = obj.unit;

		var _$$animateSVG = $.animateSVG.apply($, toConsumableArray(element));

		var _$$animateSVG2 = slicedToArray(_$$animateSVG, 2);

		anim_element = _$$animateSVG2[0];
		new_element = _$$animateSVG2[1];


		new_elements.push(new_element);
		anim_elements.push([anim_element, parent]);

		parent.replaceChild(anim_element, obj.unit);

		if (obj.array) {
			obj.array[obj.index] = new_element;
		} else {
			obj.object[obj.key] = new_element;
		}
	});

	var anim_svg = svg_container.cloneNode(true);

	anim_elements.map(function (anim_element, i) {
		anim_element[1].replaceChild(new_elements[i], anim_element[0]);
		elements[i][0] = new_elements[i];
	});

	return anim_svg;
};

$.transform = function (element, style) {
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
};

$.animateSVG = function (element, props, dur) {
	var easing_type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "linear";
	var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
	var old_values = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};


	var anim_element = element.cloneNode(true);
	var new_element = element.cloneNode(true);

	for (var attributeName in props) {
		var animate_element = void 0;
		if (attributeName === 'transform') {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		var current_value = old_values[attributeName] || element.getAttribute(attributeName);
		var value = props[attributeName];

		var anim_attr = {
			attributeName: attributeName,
			from: current_value,
			to: value,
			begin: "0s",
			dur: dur / 1000 + "s",
			values: current_value + ";" + value,
			keySplines: EASING[easing_type],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if (type) {
			anim_attr["type"] = type;
		}

		for (var i in anim_attr) {
			animate_element.setAttribute(i, anim_attr[i]);
		}

		anim_element.appendChild(animate_element);

		if (type) {
			new_element.setAttribute(attributeName, "translate(" + value + ")");
		} else {
			new_element.setAttribute(attributeName, value);
		}
	}

	return [anim_element, new_element];
};

$.offset = function (element) {
	var rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	};
};

$.isElementInViewport = function (el) {
	// Although straightforward: https://stackoverflow.com/a/7557433/6495043
	var rect = el.getBoundingClientRect();

	return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
	rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
	;
};

$.bind = function (element, o) {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.addEventListener(event, callback);
			});
		}
	}
};

$.unbind = function (element, o) {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.removeEventListener(event, callback);
			});
		}
	}
};

$.fire = function (target, type, properties) {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true);

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
};

function float_2(d) {
	return parseFloat(d.toFixed(2));
}

function arrays_equal(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	var are_equal = true;
	arr1.map(function (d, i) {
		if (arr2[i] !== d) are_equal = false;
	});
	return are_equal;
}

function limitColor(r) {
	if (r > 255) return 255;else if (r < 0) return 0;
	return r;
}

function lightenDarkenColor(col, amt) {
	var usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	var num = parseInt(col, 16);
	var r = limitColor((num >> 16) + amt);
	var b = limitColor((num >> 8 & 0x00FF) + amt);
	var g = limitColor((num & 0x0000FF) + amt);
	return (usePound ? "#" : "") + (g | b << 8 | r << 16).toString(16);
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */

var SvgTip = function () {
	function SvgTip(_ref) {
		var _ref$parent = _ref.parent,
		    parent = _ref$parent === undefined ? null : _ref$parent;
		classCallCheck(this, SvgTip);

		this.parent = parent;
		this.title_name = '';
		this.title_value = '';
		this.list_values = [];
		this.title_value_first = 0;

		this.x = 0;
		this.y = 0;

		this.top = 0;
		this.left = 0;

		this.setup();
	}

	createClass(SvgTip, [{
		key: 'setup',
		value: function setup() {
			this.make_tooltip();
		}
	}, {
		key: 'refresh',
		value: function refresh() {
			this.fill();
			this.calc_position();
			// this.show_tip();
		}
	}, {
		key: 'make_tooltip',
		value: function make_tooltip() {
			var _this = this;

			this.container = $.create('div', {
				inside: this.parent,
				className: 'graph-svg-tip comparison',
				innerHTML: '<span class="title"></span>\n\t\t\t\t<ul class="data-point-list"></ul>\n\t\t\t\t<div class="svg-pointer"></div>'
			});
			this.hide_tip();

			this.title = this.container.querySelector('.title');
			this.data_point_list = this.container.querySelector('.data-point-list');

			this.parent.addEventListener('mouseleave', function () {
				_this.hide_tip();
			});
		}
	}, {
		key: 'fill',
		value: function fill() {
			var _this2 = this;

			var title = void 0;
			if (this.title_value_first) {
				title = '<strong>' + this.title_value + '</strong>' + this.title_name;
			} else {
				title = this.title_name + '<strong>' + this.title_value + '</strong>';
			}
			this.title.innerHTML = title;
			this.data_point_list.innerHTML = '';

			this.list_values.map(function (set$$1) {
				var li = $.create('li', {
					className: 'border-top ' + (set$$1.color || 'black'),
					innerHTML: '<strong style="display: block;">' + (isNaN(set$$1.value) ? '' : set$$1.value) + '</strong>\n\t\t\t\t\t' + (set$$1.title ? set$$1.title : '')
				});

				_this2.data_point_list.appendChild(li);
			});
		}
	}, {
		key: 'calc_position',
		value: function calc_position() {
			this.top = this.y - this.container.offsetHeight;
			this.left = this.x - this.container.offsetWidth / 2;
			var max_left = this.parent.offsetWidth - this.container.offsetWidth;

			var pointer = this.container.querySelector('.svg-pointer');

			if (this.left < 0) {
				pointer.style.left = 'calc(50% - ' + -1 * this.left + 'px)';
				this.left = 0;
			} else if (this.left > max_left) {
				var delta = this.left - max_left;
				pointer.style.left = 'calc(50% + ' + delta + 'px)';
				this.left = max_left;
			} else {
				pointer.style.left = '50%';
			}
		}
	}, {
		key: 'set_values',
		value: function set_values(x, y) {
			var title_name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
			var title_value = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
			var list_values = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
			var title_value_first = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

			this.title_name = title_name;
			this.title_value = title_value;
			this.list_values = list_values;
			this.x = x;
			this.y = y;
			this.title_value_first = title_value_first;
			this.refresh();
		}
	}, {
		key: 'hide_tip',
		value: function hide_tip() {
			this.container.style.top = '0px';
			this.container.style.left = '0px';
			this.container.style.opacity = '0';
		}
	}, {
		key: 'show_tip',
		value: function show_tip() {
			this.container.style.top = this.top + 'px';
			this.container.style.left = this.left + 'px';
			this.container.style.opacity = '1';
		}
	}]);
	return SvgTip;
}();

var BaseChart = function () {
	function BaseChart(_ref) {
		var _ref$height = _ref.height,
		    height = _ref$height === undefined ? 240 : _ref$height,
		    _ref$title = _ref.title,
		    title = _ref$title === undefined ? '' : _ref$title,
		    _ref$subtitle = _ref.subtitle,
		    subtitle = _ref$subtitle === undefined ? '' : _ref$subtitle,
		    _ref$format_lambdas = _ref.format_lambdas,
		    format_lambdas = _ref$format_lambdas === undefined ? {} : _ref$format_lambdas,
		    _ref$summary = _ref.summary,
		    summary = _ref$summary === undefined ? [] : _ref$summary,
		    _ref$is_navigable = _ref.is_navigable,
		    is_navigable = _ref$is_navigable === undefined ? 0 : _ref$is_navigable,
		    _ref$has_legend = _ref.has_legend,
		    has_legend = _ref$has_legend === undefined ? 0 : _ref$has_legend,
		    _ref$type = _ref.type,
		    type = _ref$type === undefined ? '' : _ref$type,
		    parent = _ref.parent,
		    data = _ref.data;
		classCallCheck(this, BaseChart);

		this.raw_chart_args = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;
		this.format_lambdas = format_lambdas;

		this.specific_values = data.specific_values || [];
		this.summary = summary;

		this.is_navigable = is_navigable;
		if (this.is_navigable) {
			this.current_index = 0;
		}
		this.has_legend = has_legend;

		this.chart_types = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

		this.set_margins(height);
	}

	createClass(BaseChart, [{
		key: 'get_different_chart',
		value: function get_different_chart(type) {
			if (!this.chart_types.includes(type)) {
				console.error('\'' + type + '\' is not a valid chart type.');
			}
			if (type === this.type) return;

			// Only across compatible types
			var compatible_types = {
				bar: ['line', 'scatter', 'percentage', 'pie'],
				line: ['scatter', 'bar', 'percentage', 'pie'],
				pie: ['line', 'scatter', 'percentage', 'bar'],
				scatter: ['line', 'bar', 'percentage', 'pie'],
				percentage: ['bar', 'line', 'scatter', 'pie'],
				heatmap: []
			};

			if (!compatible_types[this.type].includes(type)) {
				console.error('\'' + this.type + '\' chart cannot be converted to a \'' + type + '\' chart.');
			}

			// Okay, this is anticlimactic
			// this function will need to actually be 'change_chart_type(type)'
			// that will update only the required elements, but for now ...
			return new Chart({
				parent: this.raw_chart_args.parent,
				title: this.title,
				data: this.raw_chart_args.data,
				type: type,
				height: this.raw_chart_args.height
			});
		}
	}, {
		key: 'set_margins',
		value: function set_margins(height) {
			this.base_height = height;
			this.height = height - 40;
			this.translate_x = 60;
			this.translate_y = 10;
		}
	}, {
		key: 'setup',
		value: function setup() {
			if (!this.parent) {
				console.error("No parent element to render on was provided.");
				return;
			}
			this.bind_window_events();
			this.refresh(true);
		}
	}, {
		key: 'bind_window_events',
		value: function bind_window_events() {
			var _this = this;

			window.addEventListener('resize', function () {
				return _this.refresh();
			});
			window.addEventListener('orientationchange', function () {
				return _this.refresh();
			});
		}
	}, {
		key: 'refresh',
		value: function refresh() {
			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this.setup_base_values();
			this.set_width();

			this.setup_container();
			this.setup_components();

			this.setup_values();
			this.setup_utils();

			this.make_graph_components(init);
			this.make_tooltip();

			if (this.summary.length > 0) {
				this.show_custom_summary();
			} else {
				this.show_summary();
			}

			if (this.is_navigable) {
				this.setup_navigation(init);
			}
		}
	}, {
		key: 'set_width',
		value: function set_width() {
			var _this2 = this;

			var special_values_width = 0;
			this.specific_values.map(function (val) {
				if (_this2.get_strwidth(val.title) > special_values_width) {
					special_values_width = _this2.get_strwidth(val.title) - 40;
				}
			});
			this.base_width = this.parent.offsetWidth - special_values_width;
			this.width = this.base_width - this.translate_x * 2;
		}
	}, {
		key: 'setup_base_values',
		value: function setup_base_values() {}
	}, {
		key: 'setup_container',
		value: function setup_container() {
			this.container = $.create('div', {
				className: 'chart-container',
				innerHTML: '<h6 class="title">' + this.title + '</h6>\n\t\t\t\t<h6 class="sub-title uppercase">' + this.subtitle + '</h6>\n\t\t\t\t<div class="frappe-chart graphics"></div>\n\t\t\t\t<div class="graph-stats-container"></div>'
			});

			// Chart needs a dedicated parent element
			this.parent.innerHTML = '';
			this.parent.appendChild(this.container);

			this.chart_wrapper = this.container.querySelector('.frappe-chart');
			this.stats_wrapper = this.container.querySelector('.graph-stats-container');

			this.make_chart_area();
			this.make_draw_area();
		}
	}, {
		key: 'make_chart_area',
		value: function make_chart_area() {
			this.svg = $.createSVG('svg', {
				className: 'chart',
				inside: this.chart_wrapper,
				width: this.base_width,
				height: this.base_height
			});

			this.svg_defs = $.createSVG('defs', {
				inside: this.svg
			});

			return this.svg;
		}
	}, {
		key: 'make_draw_area',
		value: function make_draw_area() {
			this.draw_area = $.createSVG("g", {
				className: this.type + '-chart',
				inside: this.svg,
				transform: 'translate(' + this.translate_x + ', ' + this.translate_y + ')'
			});
		}
	}, {
		key: 'setup_components',
		value: function setup_components() {}
	}, {
		key: 'make_tooltip',
		value: function make_tooltip() {
			this.tip = new SvgTip({
				parent: this.chart_wrapper
			});
			this.bind_tooltip();
		}
	}, {
		key: 'show_summary',
		value: function show_summary() {}
	}, {
		key: 'show_custom_summary',
		value: function show_custom_summary() {
			var _this3 = this;

			this.summary.map(function (d) {
				var stats = $.create('div', {
					className: 'stats',
					innerHTML: '<span class="indicator ' + d.color + '">' + d.title + ': ' + d.value + '</span>'
				});
				_this3.stats_wrapper.appendChild(stats);
			});
		}
	}, {
		key: 'setup_navigation',
		value: function setup_navigation() {
			var _this4 = this;

			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this.make_overlay();

			if (init) {
				this.bind_overlay();

				document.addEventListener('keydown', function (e) {
					if ($.isElementInViewport(_this4.chart_wrapper)) {
						e = e || window.event;

						if (e.keyCode == '37') {
							_this4.on_left_arrow();
						} else if (e.keyCode == '39') {
							_this4.on_right_arrow();
						} else if (e.keyCode == '38') {
							_this4.on_up_arrow();
						} else if (e.keyCode == '40') {
							_this4.on_down_arrow();
						} else if (e.keyCode == '13') {
							_this4.on_enter_key();
						}
					}
				});
			}
		}
	}, {
		key: 'make_overlay',
		value: function make_overlay() {}
	}, {
		key: 'bind_overlay',
		value: function bind_overlay() {}
	}, {
		key: 'bind_units',
		value: function bind_units() {}
	}, {
		key: 'on_left_arrow',
		value: function on_left_arrow() {}
	}, {
		key: 'on_right_arrow',
		value: function on_right_arrow() {}
	}, {
		key: 'on_up_arrow',
		value: function on_up_arrow() {}
	}, {
		key: 'on_down_arrow',
		value: function on_down_arrow() {}
	}, {
		key: 'on_enter_key',
		value: function on_enter_key() {}
	}, {
		key: 'get_data_point',
		value: function get_data_point() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.current_index;

			// check for length
			var data_point = {
				index: index
			};
			var y = this.y[0];
			['svg_units', 'y_tops', 'values'].map(function (key) {
				var data_key = key.slice(0, key.length - 1);
				data_point[data_key] = y[key][index];
			});
			data_point.label = this.x[index];
			return data_point;
		}
	}, {
		key: 'update_current_data_point',
		value: function update_current_data_point(index) {
			index = parseInt(index);
			if (index < 0) index = 0;
			if (index >= this.x.length) index = this.x.length - 1;
			if (index === this.current_index) return;
			this.current_index = index;
			$.fire(this.parent, "data-select", this.get_data_point());
		}

		// Helpers

	}, {
		key: 'get_strwidth',
		value: function get_strwidth(string) {
			return (string + "").length * 8;
		}

		// Objects

	}, {
		key: 'setup_utils',
		value: function setup_utils() {}
	}]);
	return BaseChart;
}();

var AxisChart = function (_BaseChart) {
	inherits(AxisChart, _BaseChart);

	function AxisChart(args) {
		classCallCheck(this, AxisChart);

		var _this = possibleConstructorReturn(this, (AxisChart.__proto__ || Object.getPrototypeOf(AxisChart)).call(this, args));

		_this.x = _this.data.labels;
		_this.y = _this.data.datasets;

		_this.is_series = args.is_series;

		_this.get_y_label = _this.format_lambdas.y_label;
		_this.get_y_tooltip = _this.format_lambdas.y_tooltip;
		_this.get_x_tooltip = _this.format_lambdas.x_tooltip;

		_this.colors = ['green', 'blue', 'violet', 'red', 'orange', 'yellow', 'light-blue', 'light-green', 'purple', 'magenta'];

		_this.zero_line = _this.height;
		return _this;
	}

	createClass(AxisChart, [{
		key: 'setup_values',
		value: function setup_values() {
			this.data.datasets.map(function (d) {
				d.values = d.values.map(function (val) {
					return !isNaN(val) ? val : 0;
				});
			});
			this.setup_x();
			this.setup_y();
		}
	}, {
		key: 'setup_x',
		value: function setup_x() {
			var _this2 = this;

			this.set_avg_unit_width_and_x_offset();

			if (this.x_axis_positions) {
				this.x_old_axis_positions = this.x_axis_positions.slice();
			}
			this.x_axis_positions = this.x.map(function (d, i) {
				return float_2(_this2.x_offset + i * _this2.avg_unit_width);
			});

			if (!this.x_old_axis_positions) {
				this.x_old_axis_positions = this.x_axis_positions.slice();
			}
		}
	}, {
		key: 'setup_y',
		value: function setup_y() {
			if (this.y_axis_values) {
				this.y_old_axis_values = this.y_axis_values.slice();
			}

			var values = this.get_all_y_values();

			if (this.y_sums && this.y_sums.length > 0) {
				values = values.concat(this.y_sums);
			}

			this.y_axis_values = this.get_y_axis_points(values);

			if (!this.y_old_axis_values) {
				this.y_old_axis_values = this.y_axis_values.slice();
			}

			var y_pts = this.y_axis_values;
			var value_range = y_pts[y_pts.length - 1] - y_pts[0];

			if (this.multiplier) this.old_multiplier = this.multiplier;
			this.multiplier = this.height / value_range;
			if (!this.old_multiplier) this.old_multiplier = this.multiplier;

			var zero_index = y_pts.indexOf(0);
			var interval = y_pts[1] - y_pts[0];
			var interval_height = interval * this.multiplier;

			if (this.zero_line) this.old_zero_line = this.zero_line;
			this.zero_line = this.height - zero_index * interval_height;
			if (!this.old_zero_line) this.old_zero_line = this.zero_line;
		}
	}, {
		key: 'setup_components',
		value: function setup_components() {
			get(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'setup_components', this).call(this);
			this.setup_marker_components();
			this.setup_aggregation_components();
			this.setup_graph_components();
		}
	}, {
		key: 'setup_marker_components',
		value: function setup_marker_components() {
			this.y_axis_group = $.createSVG('g', { className: 'y axis', inside: this.draw_area });
			this.x_axis_group = $.createSVG('g', { className: 'x axis', inside: this.draw_area });
			this.specific_y_group = $.createSVG('g', { className: 'specific axis', inside: this.draw_area });
		}
	}, {
		key: 'setup_aggregation_components',
		value: function setup_aggregation_components() {
			this.sum_group = $.createSVG('g', { className: 'data-points', inside: this.draw_area });
			this.average_group = $.createSVG('g', { className: 'chart-area', inside: this.draw_area });
		}
	}, {
		key: 'setup_graph_components',
		value: function setup_graph_components() {
			var _this3 = this;

			this.svg_units_groups = [];
			this.y.map(function (d, i) {
				_this3.svg_units_groups[i] = $.createSVG('g', {
					className: 'data-points data-points-' + i,
					inside: _this3.draw_area
				});
			});
		}
	}, {
		key: 'make_graph_components',
		value: function make_graph_components() {
			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this.make_y_axis();
			this.make_x_axis();
			this.draw_graph(init);
			this.make_y_specifics();
		}

		// make VERTICAL lines for x values

	}, {
		key: 'make_x_axis',
		value: function make_x_axis() {
			var _this4 = this;

			var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			var start_at = void 0,
			    height = void 0,
			    text_start_at = void 0,
			    axis_line_class = '';
			if (this.x_axis_mode === 'span') {
				// long spanning lines
				start_at = -7;
				height = this.height + 15;
				text_start_at = this.height + 25;
			} else if (this.x_axis_mode === 'tick') {
				// short label lines
				start_at = this.height;
				height = 6;
				text_start_at = 9;
				axis_line_class = 'x-axis-label';
			}

			this.x_axis_group.setAttribute('transform', 'translate(0,' + start_at + ')');

			if (animate) {
				this.make_anim_x_axis(height, text_start_at, axis_line_class);
				return;
			}

			var allowed_space = this.avg_unit_width * 1.5;
			var allowed_letters = allowed_space / 8;

			this.x_axis_group.textContent = '';
			this.x.map(function (point, i) {
				var space_taken = _this4.get_strwidth(point) + 2;
				if (space_taken > allowed_space) {
					if (_this4.is_series) {
						// Skip some axis lines if X axis is a series
						var skips = 1;
						while (space_taken / skips * 2 > allowed_space) {
							skips++;
						}
						if (i % skips !== 0) {
							return;
						}
					} else {
						point = point.slice(0, allowed_letters - 3) + " ...";
					}
				}
				_this4.x_axis_group.appendChild(_this4.make_x_line(height, text_start_at, point, 'x-value-text', axis_line_class, _this4.x_axis_positions[i]));
			});
		}

		// make HORIZONTAL lines for y values

	}, {
		key: 'make_y_axis',
		value: function make_y_axis() {
			var _this5 = this;

			var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (animate) {
				this.make_anim_y_axis();
				this.make_anim_y_specifics();
				return;
			}

			var _get_y_axis_line_prop = this.get_y_axis_line_props(),
			    _get_y_axis_line_prop2 = slicedToArray(_get_y_axis_line_prop, 4),
			    width = _get_y_axis_line_prop2[0],
			    text_end_at = _get_y_axis_line_prop2[1],
			    axis_line_class = _get_y_axis_line_prop2[2],
			    start_at = _get_y_axis_line_prop2[3];

			this.y_axis_group.textContent = '';
			this.y_axis_values.map(function (value, i) {
				_this5.y_axis_group.appendChild(_this5.make_y_line(start_at, width, text_end_at, value, 'y-value-text', axis_line_class, _this5.zero_line - value * _this5.multiplier, value === 0 && i !== 0 // Non-first Zero line
				));
			});
		}
	}, {
		key: 'get_y_axis_line_props',
		value: function get_y_axis_line_props() {
			var specific = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (specific) {
				return [this.width, this.width + 5, 'specific-value', 0];
			}
			var width = void 0,
			    text_end_at = -9,
			    axis_line_class = '',
			    start_at = 0;
			if (this.y_axis_mode === 'span') {
				// long spanning lines
				width = this.width + 6;
				start_at = -6;
			} else if (this.y_axis_mode === 'tick') {
				// short label lines
				width = -6;
				axis_line_class = 'y-axis-label';
			}

			return [width, text_end_at, axis_line_class, start_at];
		}
	}, {
		key: 'draw_graph',
		value: function draw_graph() {
			var _this6 = this;

			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
				this.y.map(function (d, i) {
					d.svg_units = [];
					_this6.make_path && _this6.make_path(d, i, _this6.x_axis_positions, d.y_tops, d.color || _this6.colors[i]);
					_this6.make_new_units(d, i);
					_this6.calc_y_dependencies();
				});
				return;
			}
			if (init) {
				this.draw_new_graph_and_animate();
				return;
			}
			this.y.map(function (d, i) {
				d.svg_units = [];
				_this6.make_path && _this6.make_path(d, i, _this6.x_axis_positions, d.y_tops, d.color || _this6.colors[i]);
				_this6.make_new_units(d, i);
			});
		}
	}, {
		key: 'draw_new_graph_and_animate',
		value: function draw_new_graph_and_animate() {
			var _this7 = this;

			var data = [];
			this.y.map(function (d, i) {
				// Anim: Don't draw initial values, store them and update later
				d.y_tops = new Array(d.values.length).fill(_this7.zero_line); // no value
				data.push({ values: d.values });
				d.svg_units = [];

				_this7.make_path && _this7.make_path(d, i, _this7.x_axis_positions, d.y_tops, d.color || _this7.colors[i]);
				_this7.make_new_units(d, i);
			});

			setTimeout(function () {
				_this7.update_values(data);
			}, 350);
		}
	}, {
		key: 'setup_navigation',
		value: function setup_navigation(init) {
			var _this8 = this;

			if (init) {
				// Hack: defer nav till initial update_values
				setTimeout(function () {
					get(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'setup_navigation', _this8).call(_this8, init);
				}, 500);
			} else {
				get(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'setup_navigation', this).call(this, init);
			}
		}
	}, {
		key: 'make_new_units',
		value: function make_new_units(d, i) {
			this.make_new_units_for_dataset(this.x_axis_positions, d.y_tops, d.color || this.colors[i], i, this.y.length);
		}
	}, {
		key: 'make_new_units_for_dataset',
		value: function make_new_units_for_dataset(x_values, y_values, color, dataset_index, no_of_datasets, units_group, units_array, unit) {
			var _this9 = this;

			if (!units_group) units_group = this.svg_units_groups[dataset_index];
			if (!units_array) units_array = this.y[dataset_index].svg_units;
			if (!unit) unit = this.unit_args;

			units_group.textContent = '';
			units_array.length = 0;

			y_values.map(function (y, i) {
				var data_unit = _this9.draw[unit.type](x_values[i], y, unit.args, color, i, dataset_index, no_of_datasets);
				units_group.appendChild(data_unit);
				units_array.push(data_unit);
			});

			if (this.is_navigable) {
				this.bind_units(units_array);
			}
		}
	}, {
		key: 'make_y_specifics',
		value: function make_y_specifics() {
			var _this10 = this;

			this.specific_y_group.textContent = '';
			this.specific_values.map(function (d) {
				_this10.specific_y_group.appendChild(_this10.make_y_line(0, _this10.width, _this10.width + 5, d.title.toUpperCase(), 'specific-value', 'specific-value', _this10.zero_line - d.value * _this10.multiplier, false, d.line_type));
			});
		}
	}, {
		key: 'bind_tooltip',
		value: function bind_tooltip() {
			var _this11 = this;

			// TODO: could be in tooltip itself, as it is a given functionality for its parent
			this.chart_wrapper.addEventListener('mousemove', function (e) {
				var offset = $.offset(_this11.chart_wrapper);
				var relX = e.pageX - offset.left - _this11.translate_x;
				var relY = e.pageY - offset.top - _this11.translate_y;

				if (relY < _this11.height + _this11.translate_y * 2) {
					_this11.map_tooltip_x_position_and_show(relX);
				} else {
					_this11.tip.hide_tip();
				}
			});
		}
	}, {
		key: 'map_tooltip_x_position_and_show',
		value: function map_tooltip_x_position_and_show(relX) {
			var _this12 = this;

			if (!this.y_min_tops) return;
			for (var i = this.x_axis_positions.length - 1; i >= 0; i--) {
				var x_val = this.x_axis_positions[i];
				// let delta = i === 0 ? this.avg_unit_width : x_val - this.x_axis_positions[i-1];
				if (relX > x_val - this.avg_unit_width / 2) {
					var x = x_val + this.translate_x;
					var y = this.y_min_tops[i] + this.translate_y;

					var title = this.x.formatted && this.x.formatted.length > 0 ? this.x.formatted[i] : this.x[i];
					var values = this.y.map(function (set$$1, j) {
						return {
							title: set$$1.title,
							value: set$$1.formatted ? set$$1.formatted[i] : set$$1.values[i],
							color: set$$1.color || _this12.colors[j]
						};
					});

					// TODO: upside-down tooltips for negative values?
					this.tip.set_values(x, y, title, '', values);
					this.tip.show_tip();
					break;
				}
			}
		}

		// API

	}, {
		key: 'show_sums',
		value: function show_sums() {
			var _this13 = this;

			this.updating = true;

			this.y_sums = new Array(this.x_axis_positions.length).fill(0);
			this.y.map(function (d) {
				d.values.map(function (value, i) {
					_this13.y_sums[i] += value;
				});
			});

			// Remake y axis, animate
			this.update_values();

			// Then make sum units, don't animate
			this.sum_units = [];

			this.make_new_units_for_dataset(this.x_axis_positions, this.y_sums.map(function (val) {
				return float_2(_this13.zero_line - val * _this13.multiplier);
			}), 'light-grey', 0, 1, this.sum_group, this.sum_units);

			// this.make_path && this.make_path(d, i, old_x, old_y, d.color || this.colors[i]);

			this.updating = false;
		}
	}, {
		key: 'hide_sums',
		value: function hide_sums() {
			if (this.updating) return;
			this.y_sums = [];
			this.sum_group.textContent = '';
			this.sum_units = [];
			this.update_values();
		}
	}, {
		key: 'show_averages',
		value: function show_averages() {
			var _this14 = this;

			this.old_specific_values = this.specific_values.slice();
			this.y.map(function (d, i) {
				var sum = 0;
				d.values.map(function (e) {
					sum += e;
				});
				var average = sum / d.values.length;

				_this14.specific_values.push({
					title: "AVG" + " " + (i + 1),
					line_type: "dashed",
					value: average,
					auto: 1
				});
			});

			this.update_values();
		}
	}, {
		key: 'hide_averages',
		value: function hide_averages() {
			var _this15 = this;

			this.old_specific_values = this.specific_values.slice();

			var indices_to_remove = [];
			this.specific_values.map(function (d, i) {
				if (d.auto) indices_to_remove.unshift(i);
			});

			indices_to_remove.map(function (index) {
				_this15.specific_values.splice(index, 1);
			});

			this.update_values();
		}
	}, {
		key: 'update_values',
		value: function update_values(new_y, new_x) {
			var _this16 = this;

			if (!new_x) {
				new_x = this.x;
			}
			this.elements_to_animate = [];
			this.updating = true;

			this.old_x_values = this.x.slice();
			this.old_y_axis_tops = this.y.map(function (d) {
				return d.y_tops.slice();
			});

			this.old_y_values = this.y.map(function (d) {
				return d.values;
			});

			this.no_of_extra_pts = new_x.length - this.x.length;

			// Just update values prop, setup_x/y() will do the rest
			if (new_y) this.y.map(function (d, i) {
				d.values = new_y[i].values;
			});
			if (new_x) this.x = new_x;

			this.setup_x();
			this.setup_y();

			// Animate only if positions have changed
			if (!arrays_equal(this.x_old_axis_positions, this.x_axis_positions)) {
				this.make_x_axis(true);
				setTimeout(function () {
					if (!_this16.updating) _this16.make_x_axis();
				}, 350);
			}

			if (!arrays_equal(this.y_old_axis_values, this.y_axis_values) || this.old_specific_values && !arrays_equal(this.old_specific_values, this.specific_values)) {

				this.make_y_axis(true);
				setTimeout(function () {
					if (!_this16.updating) {
						_this16.make_y_axis();
						_this16.make_y_specifics();
					}
				}, 350);
			}

			// Change in data, so calculate dependencies
			this.calc_y_dependencies();

			this.animate_graphs();

			// Trigger animation with the animatable elements in this.elements_to_animate
			this.run_animation();

			this.updating = false;
		}
	}, {
		key: 'add_data_point',
		value: function add_data_point(y_point, x_point) {
			var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.x.length;

			var new_y = this.y.map(function (data_set) {
				return { values: data_set.values };
			});
			new_y.map(function (d, i) {
				d.values.splice(index, 0, y_point[i]);
			});
			var new_x = this.x.slice();
			new_x.splice(index, 0, x_point);

			this.update_values(new_y, new_x);
		}
	}, {
		key: 'remove_data_point',
		value: function remove_data_point() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.x.length - 1;

			if (this.x.length < 3) return;

			var new_y = this.y.map(function (data_set) {
				return { values: data_set.values };
			});
			new_y.map(function (d) {
				d.values.splice(index, 1);
			});
			var new_x = this.x.slice();
			new_x.splice(index, 1);

			this.update_values(new_y, new_x);
		}
	}, {
		key: 'run_animation',
		value: function run_animation() {
			var _this17 = this;

			var anim_svg = $.runSVGAnimation(this.svg, this.elements_to_animate);

			if (this.svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(this.svg);
				this.chart_wrapper.appendChild(anim_svg);
			}

			// Replace the new svg (data has long been replaced)
			setTimeout(function () {
				if (anim_svg.parentNode == _this17.chart_wrapper) {
					_this17.chart_wrapper.removeChild(anim_svg);
					_this17.chart_wrapper.appendChild(_this17.svg);
				}
			}, 250);
		}
	}, {
		key: 'animate_graphs',
		value: function animate_graphs() {
			var _this18 = this;

			this.y.map(function (d, i) {
				// Pre-prep, equilize no of positions between old and new
				var _calc_old_and_new_pos = _this18.calc_old_and_new_postions(d, i),
				    _calc_old_and_new_pos2 = slicedToArray(_calc_old_and_new_pos, 4),
				    old_x = _calc_old_and_new_pos2[0],
				    old_y = _calc_old_and_new_pos2[1],
				    new_x = _calc_old_and_new_pos2[2],
				    new_y = _calc_old_and_new_pos2[3];

				if (_this18.no_of_extra_pts >= 0) {
					_this18.make_path && _this18.make_path(d, i, old_x, old_y, d.color || _this18.colors[i]);
					_this18.make_new_units_for_dataset(old_x, old_y, d.color || _this18.colors[i], i, _this18.y.length);
				}
				d.path && _this18.animate_path(d, i, old_x, old_y, new_x, new_y);
				_this18.animate_units(d, i, old_x, old_y, new_x, new_y);
			});

			// TODO: replace with real units
			setTimeout(function () {
				_this18.y.map(function (d, i) {
					_this18.make_path && _this18.make_path(d, i, _this18.x_axis_positions, d.y_tops, d.color || _this18.colors[i]);
					_this18.make_new_units(d, i);
				});
			}, 400);
		}
	}, {
		key: 'animate_path',
		value: function animate_path(d, i, old_x, old_y, new_x, new_y) {
			// Animate path
			var new_points_list = new_y.map(function (y, i) {
				return new_x[i] + ',' + y;
			});
			var new_path_str = new_points_list.join("L");

			var path_args = [{ unit: d.path, object: d, key: 'path' }, { d: "M" + new_path_str }, 350, "easein"];
			this.elements_to_animate.push(path_args);

			// Animate region
			if (d.region_path) {
				var reg_start_pt = '0,' + this.zero_line + 'L';
				var reg_end_pt = 'L' + this.width + ',' + this.zero_line;

				var region_args = [{ unit: d.region_path, object: d, key: 'region_path' }, { d: "M" + reg_start_pt + new_path_str + reg_end_pt }, 350, "easein"];
				this.elements_to_animate.push(region_args);
			}
		}
	}, {
		key: 'animate_units',
		value: function animate_units(d, index, old_x, old_y, new_x, new_y) {
			var _this19 = this;

			var type = this.unit_args.type;

			d.svg_units.map(function (unit, i) {
				if (new_x[i] === undefined || new_y[i] === undefined) return;
				_this19.elements_to_animate.push(_this19.animate[type]({ unit: unit, array: d.svg_units, index: i }, // unit, with info to replace where it came from in the data
				new_x[i], new_y[i], index));
			});
		}
	}, {
		key: 'calc_old_and_new_postions',
		value: function calc_old_and_new_postions(d, i) {
			var old_x = this.x_old_axis_positions.slice();
			var new_x = this.x_axis_positions.slice();

			var old_y = this.old_y_axis_tops[i].slice();
			var new_y = d.y_tops.slice();

			var last_old_x_pos = old_x[old_x.length - 1];
			var last_old_y_pos = old_y[old_y.length - 1];

			var last_new_x_pos = new_x[new_x.length - 1];
			var last_new_y_pos = new_y[new_y.length - 1];

			if (this.no_of_extra_pts >= 0) {
				// First substitute current path with a squiggled one (looking the same but
				// having more points at end),
				// then animate to stretch it later to new points
				// (new points already have more points)

				// Hence, the extra end points will correspond to current(old) positions
				var filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_x_pos);
				var filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_y_pos);

				old_x = old_x.concat(filler_x);
				old_y = old_y.concat(filler_y);
			} else {
				// Just modify the new points to have extra points
				// with the same position at end
				var _filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_x_pos);
				var _filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_y_pos);

				new_x = new_x.concat(_filler_x);
				new_y = new_y.concat(_filler_y);
			}

			return [old_x, old_y, new_x, new_y];
		}
	}, {
		key: 'make_anim_x_axis',
		value: function make_anim_x_axis(height, text_start_at, axis_line_class) {
			var _this20 = this;

			// Animate X AXIS to account for more or less axis lines

			var old_pos = this.x_old_axis_positions;
			var new_pos = this.x_axis_positions;

			var old_vals = this.old_x_values;
			var new_vals = this.x;

			var last_line_pos = old_pos[old_pos.length - 1];

			var add_and_animate_line = function add_and_animate_line(value, old_pos, new_pos) {
				if (typeof new_pos === 'string') {
					new_pos = parseInt(new_pos.substring(0, new_pos.length - 1));
				}
				var x_line = _this20.make_x_line(height, text_start_at, value, // new value
				'x-value-text', axis_line_class, old_pos // old position
				);
				_this20.x_axis_group.appendChild(x_line);

				_this20.elements_to_animate && _this20.elements_to_animate.push([{ unit: x_line, array: [0], index: 0 }, { transform: new_pos + ', 0' }, 350, "easein", "translate", { transform: old_pos + ', 0' }]);
			};

			this.x_axis_group.textContent = '';

			this.make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, add_and_animate_line);
		}
	}, {
		key: 'make_anim_y_axis',
		value: function make_anim_y_axis() {
			var _this21 = this;

			// Animate Y AXIS to account for more or less axis lines

			var old_pos = this.y_old_axis_values.map(function (value) {
				return _this21.zero_line - value * _this21.multiplier;
			});
			var new_pos = this.y_axis_values.map(function (value) {
				return _this21.zero_line - value * _this21.multiplier;
			});

			var old_vals = this.y_old_axis_values;
			var new_vals = this.y_axis_values;

			var last_line_pos = old_pos[old_pos.length - 1];

			this.y_axis_group.textContent = '';

			this.make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, this.add_and_animate_y_line.bind(this), this.y_axis_group);
		}
	}, {
		key: 'make_anim_y_specifics',
		value: function make_anim_y_specifics() {
			var _this22 = this;

			this.specific_y_group.textContent = '';
			this.specific_values.map(function (d) {
				_this22.add_and_animate_y_line(d.title, _this22.old_zero_line - d.value * _this22.old_multiplier, _this22.zero_line - d.value * _this22.multiplier, 0, _this22.specific_y_group, d.line_type, true);
			});
		}
	}, {
		key: 'make_new_axis_anim_lines',
		value: function make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, add_and_animate_line, group) {
			var superimposed_positions = void 0,
			    superimposed_values = void 0;
			var no_of_extras = new_vals.length - old_vals.length;
			if (no_of_extras > 0) {
				// More axis are needed
				// First make only the superimposed (same position) ones
				// Add in the extras at the end later
				superimposed_positions = new_pos.slice(0, old_pos.length);
				superimposed_values = new_vals.slice(0, old_vals.length);
			} else {
				// Axis have to be reduced
				// Fake it by moving all current extra axis to the last position
				// You'll need filler positions and values in the new arrays
				var filler_vals = new Array(Math.abs(no_of_extras)).fill("");
				superimposed_values = new_vals.concat(filler_vals);

				var filler_pos = new Array(Math.abs(no_of_extras)).fill(last_line_pos + "F");
				superimposed_positions = new_pos.concat(filler_pos);
			}

			superimposed_values.map(function (value, i) {
				add_and_animate_line(value, old_pos[i], superimposed_positions[i], i, group);
			});

			if (no_of_extras > 0) {
				// Add in extra axis in the end
				// and then animate to new positions
				var extra_values = new_vals.slice(old_vals.length);
				var extra_positions = new_pos.slice(old_pos.length);

				extra_values.map(function (value, i) {
					add_and_animate_line(value, last_line_pos, extra_positions[i], i, group);
				});
			}
		}
	}, {
		key: 'make_x_line',
		value: function make_x_line(height, text_start_at, point, label_class, axis_line_class, x_pos) {
			var line = $.createSVG('line', {
				x1: 0,
				x2: 0,
				y1: 0,
				y2: height
			});

			var text = $.createSVG('text', {
				className: label_class,
				x: 0,
				y: text_start_at,
				dy: '.71em',
				innerHTML: point
			});

			var x_level = $.createSVG('g', {
				className: 'tick ' + axis_line_class,
				transform: 'translate(' + x_pos + ', 0)'
			});

			x_level.appendChild(line);
			x_level.appendChild(text);

			return x_level;
		}
	}, {
		key: 'make_y_line',
		value: function make_y_line(start_at, width, text_end_at, point, label_class, axis_line_class, y_pos) {
			var darker = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
			var line_type = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : "";

			var line = $.createSVG('line', {
				className: line_type === "dashed" ? "dashed" : "",
				x1: start_at,
				x2: width,
				y1: 0,
				y2: 0
			});

			var text = $.createSVG('text', {
				className: label_class,
				x: text_end_at,
				y: 0,
				dy: '.32em',
				innerHTML: point + ""
			});

			var y_level = $.createSVG('g', {
				className: 'tick ' + axis_line_class,
				transform: 'translate(0, ' + y_pos + ')',
				'stroke-opacity': 1
			});

			if (darker) {
				line.style.stroke = "rgba(27, 31, 35, 0.6)";
			}

			y_level.appendChild(line);
			y_level.appendChild(text);

			return y_level;
		}
	}, {
		key: 'add_and_animate_y_line',
		value: function add_and_animate_y_line(value, old_pos, new_pos, i, group, type) {
			var specific = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

			var filler = false;
			if (typeof new_pos === 'string') {
				new_pos = parseInt(new_pos.substring(0, new_pos.length - 1));
				filler = true;
			}
			var new_props = { transform: '0, ' + new_pos };
			var old_props = { transform: '0, ' + old_pos };

			if (filler) {
				new_props['stroke-opacity'] = 0;
				// old_props['stroke-opacity'] = 1;
			}

			var _get_y_axis_line_prop3 = this.get_y_axis_line_props(specific),
			    _get_y_axis_line_prop4 = slicedToArray(_get_y_axis_line_prop3, 4),
			    width = _get_y_axis_line_prop4[0],
			    text_end_at = _get_y_axis_line_prop4[1],
			    axis_line_class = _get_y_axis_line_prop4[2],
			    start_at = _get_y_axis_line_prop4[3];

			var axis_label_class = !specific ? 'y-value-text' : 'specific-value';
			value = !specific ? value : (value + "").toUpperCase();
			var y_line = this.make_y_line(start_at, width, text_end_at, value, axis_label_class, axis_line_class, old_pos, // old position
			value === 0 && i !== 0, // Non-first Zero line
			type);

			group.appendChild(y_line);

			this.elements_to_animate && this.elements_to_animate.push([{ unit: y_line, array: [0], index: 0 }, new_props, 350, "easein", "translate", old_props]);
		}
	}, {
		key: 'get_y_axis_points',
		value: function get_y_axis_points(array) {
			var _this23 = this;

			//*** Where the magic happens ***

			// Calculates best-fit y intervals from given values
			// and returns the interval array

			// TODO: Fractions

			var max_bound = void 0,
			    min_bound = void 0,
			    pos_no_of_parts = void 0,
			    neg_no_of_parts = void 0,
			    part_size = void 0; // eslint-disable-line no-unused-vars

			// Critical values
			var max_val = parseInt(Math.max.apply(Math, toConsumableArray(array)));
			var min_val = parseInt(Math.min.apply(Math, toConsumableArray(array)));
			if (min_val >= 0) {
				min_val = 0;
			}

			var get_params = function get_params(value1, value2) {
				var bound1 = void 0,
				    bound2 = void 0,
				    no_of_parts_1 = void 0,
				    no_of_parts_2 = void 0,
				    interval_size = void 0;
				if ((value1 + "").length <= 1) {
					bound1 = 10;
					no_of_parts_1 = 5;
				} else {
					var _calc_upper_bound_and = _this23.calc_upper_bound_and_no_of_parts(value1);

					var _calc_upper_bound_and2 = slicedToArray(_calc_upper_bound_and, 2);

					bound1 = _calc_upper_bound_and2[0];
					no_of_parts_1 = _calc_upper_bound_and2[1];
				}

				interval_size = bound1 / no_of_parts_1;
				no_of_parts_2 = _this23.calc_no_of_parts(value2, interval_size);
				bound2 = no_of_parts_2 * interval_size;

				return [bound1, bound2, no_of_parts_1, no_of_parts_2, interval_size];
			};

			var abs_min_val = min_val * -1;
			if (abs_min_val <= max_val) {
				var _get_params = get_params(max_val, abs_min_val);
				// Get the positive region intervals
				// then calc negative ones accordingly


				var _get_params2 = slicedToArray(_get_params, 5);

				min_bound = _get_params2[1];
				pos_no_of_parts = _get_params2[2];
				neg_no_of_parts = _get_params2[3];
				part_size = _get_params2[4];

				if (abs_min_val === 0) {
					min_bound = 0;neg_no_of_parts = 0;
				}
			} else {
				var _get_params3 = get_params(abs_min_val, max_val);
				// Get the negative region here first


				var _get_params4 = slicedToArray(_get_params3, 5);

				min_bound = _get_params4[0];
				neg_no_of_parts = _get_params4[2];
				pos_no_of_parts = _get_params4[3];
				part_size = _get_params4[4];
			}

			// Make both region parts even
			if (pos_no_of_parts % 2 !== 0 && neg_no_of_parts > 0) pos_no_of_parts++;
			if (neg_no_of_parts % 2 !== 0) {
				// every increase in no_of_parts entails an increase in corresponding bound
				// except here, it happens implicitly after every calc_no_of_parts() call
				neg_no_of_parts++;
				min_bound += part_size;
			}

			var no_of_parts = pos_no_of_parts + neg_no_of_parts;
			if (no_of_parts > 5) {
				no_of_parts /= 2;
				part_size *= 2;

				pos_no_of_parts /= 2;
			}

			if (max_val < (pos_no_of_parts - 1) * part_size) {
				no_of_parts--;
			}

			return this.get_intervals(-1 * min_bound, part_size, no_of_parts);
		}
	}, {
		key: 'get_intervals',
		value: function get_intervals(start, interval_size, count) {
			var intervals = [];
			for (var i = 0; i <= count; i++) {
				intervals.push(start);
				start += interval_size;
			}
			return intervals;
		}
	}, {
		key: 'calc_upper_bound_and_no_of_parts',
		value: function calc_upper_bound_and_no_of_parts(max_val) {
			// Given a positive value, calculates a nice-number upper bound
			// and a consequent optimal number of parts

			var part_size = Math.pow(10, (max_val + "").length - 1);
			var no_of_parts = this.calc_no_of_parts(max_val, part_size);

			// Use it to get a nice even upper bound
			var upper_bound = part_size * no_of_parts;

			return [upper_bound, no_of_parts];
		}
	}, {
		key: 'calc_no_of_parts',
		value: function calc_no_of_parts(value, divisor) {
			// value should be a positive number, divisor should be greater than 0
			// returns an even no of parts
			var no_of_parts = Math.ceil(value / divisor);
			if (no_of_parts % 2 !== 0) no_of_parts++; // Make it an even number

			return no_of_parts;
		}
	}, {
		key: 'get_optimal_no_of_parts',
		value: function get_optimal_no_of_parts(no_of_parts) {
			// aka Divide by 2 if too large
			return no_of_parts < 5 ? no_of_parts : no_of_parts / 2;
		}
	}, {
		key: 'set_avg_unit_width_and_x_offset',
		value: function set_avg_unit_width_and_x_offset() {
			// Set the ... you get it
			this.avg_unit_width = this.width / (this.x.length - 1);
			this.x_offset = 0;
		}
	}, {
		key: 'get_all_y_values',
		value: function get_all_y_values() {
			var all_values = [];

			// Add in all the y values in the datasets
			this.y.map(function (d) {
				all_values = all_values.concat(d.values);
			});

			// Add in all the specific values
			return all_values.concat(this.specific_values.map(function (d) {
				return d.value;
			}));
		}
	}, {
		key: 'calc_y_dependencies',
		value: function calc_y_dependencies() {
			var _this24 = this;

			this.y_min_tops = new Array(this.x_axis_positions.length).fill(9999);
			this.y.map(function (d) {
				d.y_tops = d.values.map(function (val) {
					return float_2(_this24.zero_line - val * _this24.multiplier);
				});
				d.y_tops.map(function (y_top, i) {
					if (y_top < _this24.y_min_tops[i]) {
						_this24.y_min_tops[i] = y_top;
					}
				});
			});
			// this.chart_wrapper.removeChild(this.tip.container);
			// this.make_tooltip();
		}
	}, {
		key: 'get_bar_height_and_y_attr',
		value: function get_bar_height_and_y_attr(y_top) {
			var height = void 0,
			    y = void 0;
			if (y_top <= this.zero_line) {
				height = this.zero_line - y_top;
				y = y_top;

				// In case of invisible bars
				if (height === 0) {
					height = this.height * 0.01;
					y -= height;
				}
			} else {
				height = y_top - this.zero_line;
				y = this.zero_line;

				// In case of invisible bars
				if (height === 0) {
					height = this.height * 0.01;
				}
			}

			return [height, y];
		}
	}, {
		key: 'setup_utils',
		value: function setup_utils() {
			var _this25 = this;

			this.draw = {
				'bar': function bar(x, y_top, args, color, index, dataset_index, no_of_datasets) {
					var total_width = _this25.avg_unit_width - args.space_width;
					var start_x = x - total_width / 2;

					var width = total_width / no_of_datasets;
					var current_x = start_x + width * dataset_index;

					var _get_bar_height_and_y = _this25.get_bar_height_and_y_attr(y_top),
					    _get_bar_height_and_y2 = slicedToArray(_get_bar_height_and_y, 2),
					    height = _get_bar_height_and_y2[0],
					    y = _get_bar_height_and_y2[1];

					return $.createSVG('rect', {
						className: 'bar mini fill ' + color,
						'data-point-index': index,
						x: current_x,
						y: y,
						width: width,
						height: height
					});
				},
				'dot': function dot(x, y, args, color, index) {
					return $.createSVG('circle', {
						className: 'fill ' + color,
						'data-point-index': index,
						cx: x,
						cy: y,
						r: args.radius
					});
				}
			};

			this.animate = {
				'bar': function bar(bar_obj, x, y_top, index) {
					var start = x - _this25.avg_unit_width / 4;
					var width = _this25.avg_unit_width / 2 / _this25.y.length;

					var _get_bar_height_and_y3 = _this25.get_bar_height_and_y_attr(y_top),
					    _get_bar_height_and_y4 = slicedToArray(_get_bar_height_and_y3, 2),
					    height = _get_bar_height_and_y4[0],
					    y = _get_bar_height_and_y4[1];

					x = start + width * index;

					return [bar_obj, { width: width, height: height, x: x, y: y }, 350, "easein"];
					// bar.animate({height: args.new_height, y: y_top}, 350, mina.easein);
				},
				'dot': function dot(dot_obj, x, y_top) {
					return [dot_obj, { cx: x, cy: y_top }, 350, "easein"];
					// dot.animate({cy: y_top}, 350, mina.easein);
				}
			};
		}
	}]);
	return AxisChart;
}(BaseChart);

var BarChart = function (_AxisChart) {
	inherits(BarChart, _AxisChart);

	function BarChart(args) {
		classCallCheck(this, BarChart);

		var _this = possibleConstructorReturn(this, (BarChart.__proto__ || Object.getPrototypeOf(BarChart)).call(this, args));

		_this.type = 'bar';
		_this.x_axis_mode = args.x_axis_mode || 'tick';
		_this.y_axis_mode = args.y_axis_mode || 'span';
		_this.setup();
		return _this;
	}

	createClass(BarChart, [{
		key: 'setup_values',
		value: function setup_values() {
			get(BarChart.prototype.__proto__ || Object.getPrototypeOf(BarChart.prototype), 'setup_values', this).call(this);
			this.x_offset = this.avg_unit_width;
			this.unit_args = {
				type: 'bar',
				args: {
					space_width: this.avg_unit_width / 2
				}
			};
		}
	}, {
		key: 'make_overlay',
		value: function make_overlay() {
			// Just make one out of the first element
			var index = this.x.length - 1;
			var unit = this.y[0].svg_units[index];
			this.update_current_data_point(index);

			if (this.overlay) {
				this.overlay.parentNode.removeChild(this.overlay);
			}

			this.overlay = unit.cloneNode();
			this.overlay.style.fill = '#000000';
			this.overlay.style.opacity = '0.4';
			this.draw_area.appendChild(this.overlay);
		}
	}, {
		key: 'bind_overlay',
		value: function bind_overlay() {
			var _this2 = this;

			// on event, update overlay
			this.parent.addEventListener('data-select', function (e) {
				_this2.update_overlay(e.svg_unit);
			});
		}
	}, {
		key: 'bind_units',
		value: function bind_units(units_array) {
			var _this3 = this;

			units_array.map(function (unit) {
				unit.addEventListener('click', function () {
					var index = unit.getAttribute('data-point-index');
					_this3.update_current_data_point(index);
				});
			});
		}
	}, {
		key: 'update_overlay',
		value: function update_overlay(unit) {
			var _this4 = this;

			var attributes = [];
			Object.keys(unit.attributes).map(function (index) {
				attributes.push(unit.attributes[index]);
			});

			attributes.filter(function (attr) {
				return attr.specified;
			}).map(function (attr) {
				_this4.overlay.setAttribute(attr.name, attr.nodeValue);
			});
		}
	}, {
		key: 'on_left_arrow',
		value: function on_left_arrow() {
			this.update_current_data_point(this.current_index - 1);
		}
	}, {
		key: 'on_right_arrow',
		value: function on_right_arrow() {
			this.update_current_data_point(this.current_index + 1);
		}
	}, {
		key: 'set_avg_unit_width_and_x_offset',
		value: function set_avg_unit_width_and_x_offset() {
			this.avg_unit_width = this.width / (this.x.length + 1);
			this.x_offset = this.avg_unit_width;
		}
	}]);
	return BarChart;
}(AxisChart);

var LineChart = function (_AxisChart) {
	inherits(LineChart, _AxisChart);

	function LineChart(args) {
		classCallCheck(this, LineChart);

		var _this = possibleConstructorReturn(this, (LineChart.__proto__ || Object.getPrototypeOf(LineChart)).call(this, args));

		_this.x_axis_mode = args.x_axis_mode || 'span';
		_this.y_axis_mode = args.y_axis_mode || 'span';

		if (args.hasOwnProperty('show_dots')) {
			_this.show_dots = args.show_dots;
		} else {
			_this.show_dots = 1;
		}
		_this.region_fill = args.region_fill;

		if (Object.getPrototypeOf(_this) !== LineChart.prototype) {
			return possibleConstructorReturn(_this);
		}
		_this.dot_radius = args.dot_radius || 4;
		_this.heatline = args.heatline;
		_this.type = 'line';

		_this.setup();
		return _this;
	}

	createClass(LineChart, [{
		key: 'setup_graph_components',
		value: function setup_graph_components() {
			this.setup_path_groups();
			get(LineChart.prototype.__proto__ || Object.getPrototypeOf(LineChart.prototype), 'setup_graph_components', this).call(this);
		}
	}, {
		key: 'setup_path_groups',
		value: function setup_path_groups() {
			var _this2 = this;

			this.paths_groups = [];
			this.y.map(function (d, i) {
				_this2.paths_groups[i] = $.createSVG('g', {
					className: 'path-group path-group-' + i,
					inside: _this2.draw_area
				});
			});
		}
	}, {
		key: 'setup_values',
		value: function setup_values() {
			get(LineChart.prototype.__proto__ || Object.getPrototypeOf(LineChart.prototype), 'setup_values', this).call(this);
			this.unit_args = {
				type: 'dot',
				args: { radius: this.dot_radius }
			};
		}
	}, {
		key: 'make_new_units_for_dataset',
		value: function make_new_units_for_dataset(x_values, y_values, color, dataset_index, no_of_datasets, units_group, units_array, unit) {
			if (this.show_dots) {
				get(LineChart.prototype.__proto__ || Object.getPrototypeOf(LineChart.prototype), 'make_new_units_for_dataset', this).call(this, x_values, y_values, color, dataset_index, no_of_datasets, units_group, units_array, unit);
			}
		}
	}, {
		key: 'make_paths',
		value: function make_paths() {
			var _this3 = this;

			this.y.map(function (d, i) {
				_this3.make_path(d, i, _this3.x_axis_positions, d.y_tops, d.color || _this3.colors[i]);
			});
		}
	}, {
		key: 'make_path',
		value: function make_path(d, i, x_positions, y_positions, color) {
			var points_list = y_positions.map(function (y, i) {
				return x_positions[i] + ',' + y;
			});
			var points_str = points_list.join("L");

			this.paths_groups[i].textContent = '';

			d.path = $.createSVG('path', {
				inside: this.paths_groups[i],
				className: 'stroke ' + color,
				d: "M" + points_str
			});

			if (this.heatline) {
				var gradient_id = this.make_gradient(color);
				d.path.style.stroke = 'url(#' + gradient_id + ')';
			}

			if (this.region_fill) {
				this.fill_region_for_dataset(d, i, color, points_str);
			}
		}
	}, {
		key: 'fill_region_for_dataset',
		value: function fill_region_for_dataset(d, i, color, points_str) {
			var gradient_id = this.make_gradient(color, true);

			d.region_path = $.createSVG('path', {
				inside: this.paths_groups[i],
				className: 'region-fill',
				d: "M" + ('0,' + this.zero_line + 'L') + points_str + ('L' + this.width + ',' + this.zero_line)
			});

			d.region_path.style.stroke = "none";
			d.region_path.style.fill = 'url(#' + gradient_id + ')';
		}
	}, {
		key: 'make_gradient',
		value: function make_gradient(color) {
			var lighter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var gradient_id = 'path-fill-gradient' + '-' + color;

			var gradient_def = $.createSVG('linearGradient', {
				inside: this.svg_defs,
				id: gradient_id,
				x1: 0,
				x2: 0,
				y1: 0,
				y2: 1
			});

			var set_gradient_stop = function set_gradient_stop(grad_elem, offset, color, opacity) {
				$.createSVG('stop', {
					'className': 'stop-color ' + color,
					'inside': grad_elem,
					'offset': offset,
					'stop-opacity': opacity
				});
			};

			var opacities = [1, 0.6, 0.2];

			if (lighter) {
				opacities = [0.4, 0.2, 0];
			}

			set_gradient_stop(gradient_def, "0%", color, opacities[0]);
			set_gradient_stop(gradient_def, "50%", color, opacities[1]);
			set_gradient_stop(gradient_def, "100%", color, opacities[2]);

			return gradient_id;
		}
	}]);
	return LineChart;
}(AxisChart);

var ScatterChart = function (_LineChart) {
	inherits(ScatterChart, _LineChart);

	function ScatterChart(args) {
		classCallCheck(this, ScatterChart);

		var _this = possibleConstructorReturn(this, (ScatterChart.__proto__ || Object.getPrototypeOf(ScatterChart)).call(this, args));

		_this.type = 'scatter';

		if (!args.dot_radius) {
			_this.dot_radius = 8;
		} else {
			_this.dot_radius = args.dot_radius;
		}

		_this.setup();
		return _this;
	}

	createClass(ScatterChart, [{
		key: 'setup_graph_components',
		value: function setup_graph_components() {
			this.setup_path_groups();
			get(ScatterChart.prototype.__proto__ || Object.getPrototypeOf(ScatterChart.prototype), 'setup_graph_components', this).call(this);
		}
	}, {
		key: 'setup_path_groups',
		value: function setup_path_groups() {}
	}, {
		key: 'setup_values',
		value: function setup_values() {
			get(ScatterChart.prototype.__proto__ || Object.getPrototypeOf(ScatterChart.prototype), 'setup_values', this).call(this);
			this.unit_args = {
				type: 'dot',
				args: { radius: this.dot_radius }
			};
		}
	}, {
		key: 'make_paths',
		value: function make_paths() {}
	}, {
		key: 'make_path',
		value: function make_path() {}
	}]);
	return ScatterChart;
}(LineChart);

var PercentageChart = function (_BaseChart) {
	inherits(PercentageChart, _BaseChart);

	function PercentageChart(args) {
		classCallCheck(this, PercentageChart);

		var _this = possibleConstructorReturn(this, (PercentageChart.__proto__ || Object.getPrototypeOf(PercentageChart)).call(this, args));

		_this.type = 'percentage';

		_this.get_y_label = _this.format_lambdas.y_label;
		_this.get_x_tooltip = _this.format_lambdas.x_tooltip;
		_this.get_y_tooltip = _this.format_lambdas.y_tooltip;

		_this.max_slices = 10;
		_this.max_legend_points = 6;

		_this.colors = args.colors;

		if (!_this.colors || _this.colors.length < _this.data.labels.length) {
			_this.colors = ['light-blue', 'blue', 'violet', 'red', 'orange', 'yellow', 'green', 'light-green', 'purple', 'magenta'];
		}

		_this.setup();
		return _this;
	}

	createClass(PercentageChart, [{
		key: 'make_chart_area',
		value: function make_chart_area() {
			this.chart_wrapper.className += ' ' + 'graph-focus-margin';
			this.chart_wrapper.style.marginTop = '45px';

			this.stats_wrapper.className += ' ' + 'graph-focus-margin';
			this.stats_wrapper.style.marginBottom = '30px';
			this.stats_wrapper.style.paddingTop = '0px';
		}
	}, {
		key: 'make_draw_area',
		value: function make_draw_area() {
			this.chart_div = $.create('div', {
				className: 'div',
				inside: this.chart_wrapper
			});

			this.chart = $.create('div', {
				className: 'progress-chart',
				inside: this.chart_div
			});
		}
	}, {
		key: 'setup_components',
		value: function setup_components() {
			this.percentage_bar = $.create('div', {
				className: 'progress',
				inside: this.chart
			});
		}
	}, {
		key: 'setup_values',
		value: function setup_values() {
			var _this2 = this;

			this.slice_totals = [];
			var all_totals = this.data.labels.map(function (d, i) {
				var total = 0;
				_this2.data.datasets.map(function (e) {
					total += e.values[i];
				});
				return [total, d];
			}).filter(function (d) {
				return d[0] > 0;
			}); // keep only positive results

			var totals = all_totals;

			if (all_totals.length > this.max_slices) {
				all_totals.sort(function (a, b) {
					return b[0] - a[0];
				});

				totals = all_totals.slice(0, this.max_slices - 1);
				var others = all_totals.slice(this.max_slices - 1);

				var sum_of_others = 0;
				others.map(function (d) {
					sum_of_others += d[0];
				});

				totals.push([sum_of_others, 'Rest']);

				this.colors[this.max_slices - 1] = 'grey';
			}

			this.labels = [];
			totals.map(function (d) {
				_this2.slice_totals.push(d[0]);
				_this2.labels.push(d[1]);
			});

			this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
		}
	}, {
		key: 'setup_utils',
		value: function setup_utils() {}
	}, {
		key: 'make_graph_components',
		value: function make_graph_components() {
			var _this3 = this;

			this.grand_total = this.slice_totals.reduce(function (a, b) {
				return a + b;
			}, 0);
			this.slices = [];
			this.slice_totals.map(function (total, i) {
				var slice = $.create('div', {
					className: 'progress-bar background ' + _this3.colors[i],
					inside: _this3.percentage_bar,
					styles: {
						width: total * 100 / _this3.grand_total + "%"
					}
				});
				_this3.slices.push(slice);
			});
		}
	}, {
		key: 'bind_tooltip',
		value: function bind_tooltip() {
			var _this4 = this;

			this.slices.map(function (slice, i) {
				slice.addEventListener('mouseenter', function () {
					var g_off = $.offset(_this4.chart_wrapper),
					    p_off = $.offset(slice);

					var x = p_off.left - g_off.left + slice.offsetWidth / 2;
					var y = p_off.top - g_off.top - 6;
					var title = (_this4.formatted_labels && _this4.formatted_labels.length > 0 ? _this4.formatted_labels[i] : _this4.labels[i]) + ': ';
					var percent = (_this4.slice_totals[i] * 100 / _this4.grand_total).toFixed(1);

					_this4.tip.set_values(x, y, title, percent + "%");
					_this4.tip.show_tip();
				});
			});
		}
	}, {
		key: 'show_summary',
		value: function show_summary() {
			var _this5 = this;

			var x_values = this.formatted_labels && this.formatted_labels.length > 0 ? this.formatted_labels : this.labels;
			this.legend_totals.map(function (d, i) {
				if (d) {
					var stats = $.create('div', {
						className: 'stats',
						inside: _this5.stats_wrapper
					});
					stats.innerHTML = '<span class="indicator ' + _this5.colors[i] + '">\n\t\t\t\t\t<span class="text-muted">' + x_values[i] + ':</span>\n\t\t\t\t\t' + d + '\n\t\t\t\t</span>';
				}
			});
		}
	}]);
	return PercentageChart;
}(BaseChart);

var ANGLE_RATIO = Math.PI / 180;
var FULL_ANGLE = 360;

var PieChart = function (_BaseChart) {
	inherits(PieChart, _BaseChart);

	function PieChart(args) {
		classCallCheck(this, PieChart);

		var _this = possibleConstructorReturn(this, (PieChart.__proto__ || Object.getPrototypeOf(PieChart)).call(this, args));

		_this.type = 'pie';
		_this.get_y_label = _this.format_lambdas.y_label;
		_this.get_x_tooltip = _this.format_lambdas.x_tooltip;
		_this.get_y_tooltip = _this.format_lambdas.y_tooltip;
		_this.elements_to_animate = null;
		_this.hoverRadio = args.hoverRadio || 0.1;
		_this.max_slices = 10;
		_this.max_legend_points = 6;
		_this.isAnimate = false;
		_this.colors = args.colors;
		_this.startAngle = args.startAngle || 0;
		_this.clockWise = args.clockWise || false;
		if (!_this.colors || _this.colors.length < _this.data.labels.length) {
			_this.colors = ['#7cd6fd', '#5e64ff', '#743ee2', '#ff5858', '#ffa00a', '#FEEF72', '#28a745', '#98d85b', '#b554ff', '#ffa3ef'];
		}
		_this.mouseMove = _this.mouseMove.bind(_this);
		_this.mouseLeave = _this.mouseLeave.bind(_this);
		_this.setup();
		return _this;
	}

	createClass(PieChart, [{
		key: 'setup_values',
		value: function setup_values() {
			var _this2 = this;

			this.centerX = this.width / 2;
			this.centerY = this.height / 2;
			this.radius = this.height > this.width ? this.centerX : this.centerY;
			this.slice_totals = [];
			var all_totals = this.data.labels.map(function (d, i) {
				var total = 0;
				_this2.data.datasets.map(function (e) {
					total += e.values[i];
				});
				return [total, d];
			}).filter(function (d) {
				return d[0] > 0;
			}); // keep only positive results

			var totals = all_totals;

			if (all_totals.length > this.max_slices) {
				all_totals.sort(function (a, b) {
					return b[0] - a[0];
				});

				totals = all_totals.slice(0, this.max_slices - 1);
				var others = all_totals.slice(this.max_slices - 1);

				var sum_of_others = 0;
				others.map(function (d) {
					sum_of_others += d[0];
				});

				totals.push([sum_of_others, 'Rest']);

				this.colors[this.max_slices - 1] = 'grey';
			}

			this.labels = [];
			totals.map(function (d) {
				_this2.slice_totals.push(d[0]);
				_this2.labels.push(d[1]);
			});

			this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
		}
	}, {
		key: 'setup_utils',
		value: function setup_utils() {}
	}, {
		key: 'makeArcPath',
		value: function makeArcPath(startPosition, endPosition) {
			var centerX = this.centerX,
			    centerY = this.centerY,
			    radius = this.radius,
			    clockWise = this.clockWise;

			return 'M' + centerX + ' ' + centerY + ' L' + (centerX + startPosition.x) + ' ' + (centerY + startPosition.y) + ' A ' + radius + ' ' + radius + ' 0 0 ' + (clockWise ? 1 : 0) + ' ' + (centerX + endPosition.x) + ' ' + (centerY + endPosition.y) + ' z';
		}
	}, {
		key: 'make_graph_components',
		value: function make_graph_components(init) {
			var _this3 = this;

			var radius = this.radius,
			    clockWise = this.clockWise;

			this.grand_total = this.slice_totals.reduce(function (a, b) {
				return a + b;
			}, 0);
			var prevSlicesProperties = this.slicesProperties || [];
			this.slices = [];
			this.elements_to_animate = [];
			this.slicesProperties = [];
			var curAngle = 180 - this.startAngle;
			this.slice_totals.map(function (total, i) {
				var startAngle = curAngle;
				var originDiffAngle = total / _this3.grand_total * FULL_ANGLE;
				var diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
				var endAngle = curAngle = curAngle + diffAngle;
				var startPosition = PieChart.getPositionByAngle(startAngle, radius);
				var endPosition = PieChart.getPositionByAngle(endAngle, radius);
				var prevProperty = init && prevSlicesProperties[i];
				var curStart = void 0,
				    curEnd = void 0;
				if (init) {
					curStart = prevProperty ? prevProperty.startPosition : startPosition;
					curEnd = prevProperty ? prevProperty.endPosition : startPosition;
				} else {
					curStart = startPosition;
					curEnd = endPosition;
				}
				var curPath = _this3.makeArcPath(curStart, curEnd);
				var slice = $.createSVG('path', {
					inside: _this3.draw_area,
					className: 'pie-path',
					style: 'transition:transform .3s;',
					d: curPath,
					fill: _this3.colors[i]
				});
				_this3.slices.push(slice);
				_this3.slicesProperties.push({
					startPosition: startPosition,
					endPosition: endPosition,
					value: total,
					total: _this3.grand_total,
					startAngle: startAngle,
					endAngle: endAngle,
					angle: diffAngle
				});
				if (init) {
					_this3.elements_to_animate.push([{ unit: slice, array: _this3.slices, index: _this3.slices.length - 1 }, { d: _this3.makeArcPath(startPosition, endPosition) }, 650, "easein", null, {
						d: curPath
					}]);
				}
			});
			if (init) {
				this.run_animation();
			}
		}
	}, {
		key: 'run_animation',
		value: function run_animation() {
			var _this4 = this;

			// if(this.isAnimate) return ;
			// this.isAnimate = true;
			if (!this.elements_to_animate || this.elements_to_animate.length === 0) return;
			var anim_svg = $.runSVGAnimation(this.svg, this.elements_to_animate);

			if (this.svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(this.svg);
				this.chart_wrapper.appendChild(anim_svg);
			}

			// Replace the new svg (data has long been replaced)
			setTimeout(function () {
				// this.isAnimate = false;
				if (anim_svg.parentNode == _this4.chart_wrapper) {
					_this4.chart_wrapper.removeChild(anim_svg);
					_this4.chart_wrapper.appendChild(_this4.svg);
				}
			}, 650);
		}
	}, {
		key: 'calTranslateByAngle',
		value: function calTranslateByAngle(property) {
			var radius = this.radius,
			    hoverRadio = this.hoverRadio;

			var position = PieChart.getPositionByAngle(property.startAngle + property.angle / 2, radius);
			return 'translate3d(' + position.x * hoverRadio + 'px,' + position.y * hoverRadio + 'px,0)';
		}
	}, {
		key: 'hoverSlice',
		value: function hoverSlice(path, i, flag, e) {
			if (!path) return;
			if (flag) {
				$.transform(path, this.calTranslateByAngle(this.slicesProperties[i]));
				path.setAttribute('fill', lightenDarkenColor(this.colors[i], 50));
				var g_off = $.offset(this.svg);
				var x = e.pageX - g_off.left + 10;
				var y = e.pageY - g_off.top - 10;
				var title = (this.formatted_labels && this.formatted_labels.length > 0 ? this.formatted_labels[i] : this.labels[i]) + ': ';
				var percent = (this.slice_totals[i] * 100 / this.grand_total).toFixed(1);
				this.tip.set_values(x, y, title, percent + "%");
				this.tip.show_tip();
			} else {
				$.transform(path, 'translate3d(0,0,0)');
				this.tip.hide_tip();
				path.setAttribute('fill', this.colors[i]);
			}
		}
	}, {
		key: 'mouseMove',
		value: function mouseMove(e) {
			var target = e.target;
			var prevIndex = this.curActiveSliceIndex;
			var prevAcitve = this.curActiveSlice;
			for (var i = 0; i < this.slices.length; i++) {
				if (target === this.slices[i]) {
					this.hoverSlice(prevAcitve, prevIndex, false);
					this.curActiveSlice = target;
					this.curActiveSliceIndex = i;
					this.hoverSlice(target, i, true, e);
					break;
				}
			}
		}
	}, {
		key: 'mouseLeave',
		value: function mouseLeave() {
			this.hoverSlice(this.curActiveSlice, this.curActiveSliceIndex, false);
		}
	}, {
		key: 'bind_tooltip',
		value: function bind_tooltip() {
			this.draw_area.addEventListener('mousemove', this.mouseMove);
			this.draw_area.addEventListener('mouseleave', this.mouseLeave);
		}
	}, {
		key: 'show_summary',
		value: function show_summary() {
			var _this5 = this;

			var x_values = this.formatted_labels && this.formatted_labels.length > 0 ? this.formatted_labels : this.labels;
			this.legend_totals.map(function (d, i) {
				if (d) {
					var stats = $.create('div', {
						className: 'stats',
						inside: _this5.stats_wrapper
					});
					stats.innerHTML = '<span class="indicator">\n\t\t\t\t\t<i style="background-color:' + _this5.colors[i] + ';"></i>\n\t\t\t\t\t<span class="text-muted">' + x_values[i] + ':</span>\n\t\t\t\t\t' + d + '\n\t\t\t\t</span>';
				}
			});
		}
	}], [{
		key: 'getPositionByAngle',
		value: function getPositionByAngle(angle, radius) {
			return {
				x: Math.sin(angle * ANGLE_RATIO) * radius,
				y: Math.cos(angle * ANGLE_RATIO) * radius
			};
		}
	}]);
	return PieChart;
}(BaseChart);

var Heatmap = function (_BaseChart) {
	inherits(Heatmap, _BaseChart);

	function Heatmap(_ref) {
		var _ref$start = _ref.start,
		    start = _ref$start === undefined ? '' : _ref$start,
		    _ref$domain = _ref.domain,
		    domain = _ref$domain === undefined ? '' : _ref$domain,
		    _ref$subdomain = _ref.subdomain,
		    subdomain = _ref$subdomain === undefined ? '' : _ref$subdomain,
		    _ref$data = _ref.data,
		    data = _ref$data === undefined ? {} : _ref$data,
		    _ref$discrete_domains = _ref.discrete_domains,
		    discrete_domains = _ref$discrete_domains === undefined ? 0 : _ref$discrete_domains,
		    _ref$count_label = _ref.count_label,
		    count_label = _ref$count_label === undefined ? '' : _ref$count_label;
		classCallCheck(this, Heatmap);

		var _this = possibleConstructorReturn(this, (Heatmap.__proto__ || Object.getPrototypeOf(Heatmap)).call(this, arguments[0]));

		_this.type = 'heatmap';

		_this.domain = domain;
		_this.subdomain = subdomain;
		_this.data = data;
		_this.discrete_domains = discrete_domains;
		_this.count_label = count_label;

		var today = new Date();
		_this.start = start || _this.add_days(today, 365);

		_this.legend_colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		_this.translate_x = 0;
		_this.setup();
		return _this;
	}

	createClass(Heatmap, [{
		key: 'setup_base_values',
		value: function setup_base_values() {
			this.today = new Date();

			if (!this.start) {
				this.start = new Date();
				this.start.setFullYear(this.start.getFullYear() - 1);
			}
			this.first_week_start = new Date(this.start.toDateString());
			this.last_week_start = new Date(this.today.toDateString());
			if (this.first_week_start.getDay() !== 7) {
				this.add_days(this.first_week_start, -1 * this.first_week_start.getDay());
			}
			if (this.last_week_start.getDay() !== 7) {
				this.add_days(this.last_week_start, -1 * this.last_week_start.getDay());
			}
			this.no_of_cols = this.get_weeks_between(this.first_week_start + '', this.last_week_start + '') + 1;
		}
	}, {
		key: 'set_width',
		value: function set_width() {
			this.base_width = (this.no_of_cols + 3) * 12;

			if (this.discrete_domains) {
				this.base_width += 12 * 12;
			}
		}
	}, {
		key: 'setup_components',
		value: function setup_components() {
			this.domain_label_group = $.createSVG("g", {
				className: "domain-label-group chart-label",
				inside: this.draw_area
			});
			this.data_groups = $.createSVG("g", {
				className: "data-groups",
				inside: this.draw_area,
				transform: 'translate(0, 20)'
			});
		}
	}, {
		key: 'setup_values',
		value: function setup_values() {
			this.domain_label_group.textContent = '';
			this.data_groups.textContent = '';
			this.distribution = this.get_distribution(this.data, this.legend_colors);
			this.month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

			this.render_all_weeks_and_store_x_values(this.no_of_cols);
		}
	}, {
		key: 'render_all_weeks_and_store_x_values',
		value: function render_all_weeks_and_store_x_values(no_of_weeks) {
			var current_week_sunday = new Date(this.first_week_start);
			this.week_col = 0;
			this.current_month = current_week_sunday.getMonth();

			this.months = [this.current_month + ''];
			this.month_weeks = {}, this.month_start_points = [];
			this.month_weeks[this.current_month] = 0;
			this.month_start_points.push(13);

			for (var i = 0; i < no_of_weeks; i++) {
				var data_group = void 0,
				    month_change = 0;
				var day = new Date(current_week_sunday);

				var _get_week_squares_gro = this.get_week_squares_group(day, this.week_col);

				var _get_week_squares_gro2 = slicedToArray(_get_week_squares_gro, 2);

				data_group = _get_week_squares_gro2[0];
				month_change = _get_week_squares_gro2[1];

				this.data_groups.appendChild(data_group);
				this.week_col += 1 + parseInt(this.discrete_domains && month_change);
				this.month_weeks[this.current_month]++;
				if (month_change) {
					this.current_month = (this.current_month + 1) % 12;
					this.months.push(this.current_month + '');
					this.month_weeks[this.current_month] = 1;
				}
				this.add_days(current_week_sunday, 7);
			}
			this.render_month_labels();
		}
	}, {
		key: 'get_week_squares_group',
		value: function get_week_squares_group(current_date, index) {
			var no_of_weekdays = 7;
			var square_side = 10;
			var cell_padding = 2;
			var step = 1;

			var month_change = 0;
			var week_col_change = 0;

			var data_group = $.createSVG("g", {
				className: "data-group",
				inside: this.data_groups
			});

			for (var y = 0, i = 0; i < no_of_weekdays; i += step, y += square_side + cell_padding) {
				var data_value = 0;
				var color_index = 0;

				var current_timestamp = current_date.getTime() / 1000;
				var timestamp = Math.floor(current_timestamp - current_timestamp % 86400).toFixed(1);

				if (this.data[timestamp]) {
					data_value = this.data[timestamp];
					color_index = this.get_max_checkpoint(data_value, this.distribution);
				}

				if (this.data[Math.round(timestamp)]) {
					data_value = this.data[Math.round(timestamp)];
					color_index = this.get_max_checkpoint(data_value, this.distribution);
				}

				var x = 13 + (index + week_col_change) * 12;

				$.createSVG("rect", {
					className: 'day',
					inside: data_group,
					x: x,
					y: y,
					width: square_side,
					height: square_side,
					fill: this.legend_colors[color_index],
					'data-date': this.get_dd_mm_yyyy(current_date),
					'data-value': data_value,
					'data-day': current_date.getDay()
				});

				var next_date = new Date(current_date);
				this.add_days(next_date, 1);
				if (next_date.getMonth() - current_date.getMonth()) {
					month_change = 1;
					if (this.discrete_domains) {
						week_col_change = 1;
					}

					this.month_start_points.push(13 + (index + week_col_change) * 12);
				}
				current_date = next_date;
			}

			return [data_group, month_change];
		}
	}, {
		key: 'render_month_labels',
		value: function render_month_labels() {
			var _this2 = this;

			// this.first_month_label = 1;
			// if (this.first_week_start.getDate() > 8) {
			// 	this.first_month_label = 0;
			// }
			// this.last_month_label = 1;

			// let first_month = this.months.shift();
			// let first_month_start = this.month_start_points.shift();
			// render first month if

			// let last_month = this.months.pop();
			// let last_month_start = this.month_start_points.pop();
			// render last month if

			this.months.shift();
			this.month_start_points.shift();
			this.months.pop();
			this.month_start_points.pop();

			this.month_start_points.map(function (start, i) {
				var month_name = _this2.month_names[_this2.months[i]].substring(0, 3);

				$.createSVG('text', {
					className: 'y-value-text',
					inside: _this2.domain_label_group,
					x: start + 12,
					y: 10,
					dy: '.32em',
					innerHTML: month_name
				});
			});
		}
	}, {
		key: 'make_graph_components',
		value: function make_graph_components() {
			Array.prototype.slice.call(this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')).map(function (d) {
				d.style.display = 'None';
			});
			this.chart_wrapper.style.marginTop = '0px';
			this.chart_wrapper.style.paddingTop = '0px';
		}
	}, {
		key: 'bind_tooltip',
		value: function bind_tooltip() {
			var _this3 = this;

			Array.prototype.slice.call(document.querySelectorAll(".data-group .day")).map(function (el) {
				el.addEventListener('mouseenter', function (e) {
					var count = e.target.getAttribute('data-value');
					var date_parts = e.target.getAttribute('data-date').split('-');

					var month = _this3.month_names[parseInt(date_parts[1]) - 1].substring(0, 3);

					var g_off = _this3.chart_wrapper.getBoundingClientRect(),
					    p_off = e.target.getBoundingClientRect();

					var width = parseInt(e.target.getAttribute('width'));
					var x = p_off.left - g_off.left + (width + 2) / 2;
					var y = p_off.top - g_off.top - (width + 2) / 2;
					var value = count + ' ' + _this3.count_label;
					var name = ' on ' + month + ' ' + date_parts[0] + ', ' + date_parts[2];

					_this3.tip.set_values(x, y, name, value, [], 1);
					_this3.tip.show_tip();
				});
			});
		}
	}, {
		key: 'update',
		value: function update(data) {
			this.data = data;
			this.setup_values();
			this.bind_tooltip();
		}
	}, {
		key: 'get_distribution',
		value: function get_distribution() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var mapper_array = arguments[1];

			var data_values = Object.keys(data).map(function (key) {
				return data[key];
			});
			var data_max_value = Math.max.apply(Math, toConsumableArray(data_values));

			var distribution_step = 1 / (mapper_array.length - 1);
			var distribution = [];

			mapper_array.map(function (color, i) {
				var checkpoint = data_max_value * (distribution_step * i);
				distribution.push(checkpoint);
			});

			return distribution;
		}
	}, {
		key: 'get_max_checkpoint',
		value: function get_max_checkpoint(value, distribution) {
			return distribution.filter(function (d, i) {
				if (i === 1) {
					return distribution[0] < value;
				}
				return d <= value;
			}).length - 1;
		}

		// TODO: date utils, move these out

		// https://stackoverflow.com/a/11252167/6495043

	}, {
		key: 'treat_as_utc',
		value: function treat_as_utc(date_str) {
			var result = new Date(date_str);
			result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
			return result;
		}
	}, {
		key: 'get_dd_mm_yyyy',
		value: function get_dd_mm_yyyy(date) {
			var dd = date.getDate();
			var mm = date.getMonth() + 1; // getMonth() is zero-based
			return [(dd > 9 ? '' : '0') + dd, (mm > 9 ? '' : '0') + mm, date.getFullYear()].join('-');
		}
	}, {
		key: 'get_weeks_between',
		value: function get_weeks_between(start_date_str, end_date_str) {
			return Math.ceil(this.get_days_between(start_date_str, end_date_str) / 7);
		}
	}, {
		key: 'get_days_between',
		value: function get_days_between(start_date_str, end_date_str) {
			var milliseconds_per_day = 24 * 60 * 60 * 1000;
			return (this.treat_as_utc(end_date_str) - this.treat_as_utc(start_date_str)) / milliseconds_per_day;
		}

		// mutates

	}, {
		key: 'add_days',
		value: function add_days(date, number_of_days) {
			date.setDate(date.getDate() + number_of_days);
		}
	}, {
		key: 'get_month_name',
		value: function get_month_name() {}
	}]);
	return Heatmap;
}(BaseChart);

// if ("development" !== 'production') {
// 	// Enable LiveReload
// 	document.write(
// 		'<script src="http://' + (location.host || 'localhost').split(':')[0] +
// 		':35729/livereload.js?snipver=1"></' + 'script>'
// 	);
// }

var chartTypes = {
	line: LineChart,
	bar: BarChart,
	scatter: ScatterChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType() {
	var chartType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'line';
	var options = arguments[1];

	if (!chartTypes[chartType]) {
		return new LineChart(options);
	}

	return new chartTypes[chartType](options);
}

var Chart = function Chart(args) {
	classCallCheck(this, Chart);

	return getChartByType(args.type, arguments[0]);
};

export default Chart;
