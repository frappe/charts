'use strict';

function __$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

Object.defineProperty(exports, '__esModule', { value: true });

__$styleInject(".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:1;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ol,.graph-svg-tip ul{padding-left:0;display:-webkit-box;display:-ms-flexbox;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;-webkit-box-flex:1;-ms-flex:1;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:\" \";border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}", {});

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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function $(expr, con) {
	return typeof expr === "string" ? (con || document).querySelector(expr) : expr || null;
}



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
		} else if (i === "onClick") {
			element.addEventListener('click', val);
		} else if (i === "onInput") {
			element.addEventListener('input', function (e) {
				val(element.value);
			});
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

function getOffset(element) {
	var rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	};
}

function isElementInViewport(el) {
	// Although straightforward: https://stackoverflow.com/a/7557433/6495043
	var rect = el.getBoundingClientRect();

	return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
	rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
	;
}

function getElementContentWidth(element) {
	var styles = window.getComputedStyle(element);
	var padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);

	return element.clientWidth - padding;
}





function fire(target, type, properties) {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true);

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
}

// https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/

var BASE_MEASURES = {
	margins: {
		top: 10,
		bottom: 10,
		left: 20,
		right: 20
	},
	paddings: {
		top: 20,
		bottom: 40,
		left: 30,
		right: 10
	},

	baseHeight: 240,

	titleHeight: 20,
	legendHeight: 30,

	titleFontSize: 12
};

function getTopOffset(m) {
	return m.titleHeight + m.margins.top + m.paddings.top;
}

function getLeftOffset(m) {
	return m.margins.left + m.paddings.left;
}

function getExtraHeight(m) {
	var totalExtraHeight = m.margins.top + m.margins.bottom + m.paddings.top + m.paddings.bottom + m.titleHeight + m.legendHeight;
	return totalExtraHeight;
}

function getExtraWidth(m) {
	var totalExtraWidth = m.margins.left + m.margins.right + m.paddings.left + m.paddings.right;

	return totalExtraWidth;
}

var INIT_CHART_UPDATE_TIMEOUT = 700;
var CHART_POST_ANIMATE_TIMEOUT = 400;

var AXIS_CHART_DEFAULT_TYPE = 'line';


var AXIS_DATASET_CHART_TYPES = ['line', 'bar'];



var AXIS_LEGEND_BAR_SIZE = 100;

var BAR_CHART_SPACE_RATIO = 1;
var MIN_BAR_PERCENT_HEIGHT = 0.02;

var LINE_CHART_DOT_SIZE = 4;
var DOT_OVERLAY_SIZE_INCR = 4;

var PERCENTAGE_BAR_DEFAULT_HEIGHT = 20;
var PERCENTAGE_BAR_DEFAULT_DEPTH = 2;

// Fixed 5-color theme,
// More colors are difficult to parse visually
var HEATMAP_DISTRIBUTION_SIZE = 5;

var HEATMAP_SQUARE_SIZE = 10;
var HEATMAP_GUTTER_SIZE = 2;

var DEFAULT_CHAR_WIDTH = 7;

var TOOLTIP_POINTER_TRIANGLE_HEIGHT = 5;

var DEFAULT_CHART_COLORS = ['light-blue', 'blue', 'violet', 'red', 'orange', 'yellow', 'green', 'light-green', 'purple', 'magenta', 'light-grey', 'dark-grey'];
var HEATMAP_COLORS_GREEN = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];



var DEFAULT_COLORS = {
	bar: DEFAULT_CHART_COLORS,
	line: DEFAULT_CHART_COLORS,
	pie: DEFAULT_CHART_COLORS,
	percentage: DEFAULT_CHART_COLORS,
	heatmap: HEATMAP_COLORS_GREEN
};

// Universal constants
var ANGLE_RATIO = Math.PI / 180;
var FULL_ANGLE = 360;

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SvgTip = function () {
	function SvgTip(_ref) {
		var _ref$parent = _ref.parent,
		    parent = _ref$parent === undefined ? null : _ref$parent,
		    _ref$colors = _ref.colors,
		    colors = _ref$colors === undefined ? [] : _ref$colors;

		_classCallCheck$4(this, SvgTip);

		this.parent = parent;
		this.colors = colors;
		this.titleName = '';
		this.titleValue = '';
		this.listValues = [];
		this.titleValueFirst = 0;

		this.x = 0;
		this.y = 0;

		this.top = 0;
		this.left = 0;

		this.setup();
	}

	_createClass$3(SvgTip, [{
		key: 'setup',
		value: function setup() {
			this.makeTooltip();
		}
	}, {
		key: 'refresh',
		value: function refresh() {
			this.fill();
			this.calcPosition();
		}
	}, {
		key: 'makeTooltip',
		value: function makeTooltip() {
			var _this = this;

			this.container = $.create('div', {
				inside: this.parent,
				className: 'graph-svg-tip comparison',
				innerHTML: '<span class="title"></span>\n\t\t\t\t<ul class="data-point-list"></ul>\n\t\t\t\t<div class="svg-pointer"></div>'
			});
			this.hideTip();

			this.title = this.container.querySelector('.title');
			this.dataPointList = this.container.querySelector('.data-point-list');

			this.parent.addEventListener('mouseleave', function () {
				_this.hideTip();
			});
		}
	}, {
		key: 'fill',
		value: function fill() {
			var _this2 = this;

			var title = void 0;
			if (this.index) {
				this.container.setAttribute('data-point-index', this.index);
			}
			if (this.titleValueFirst) {
				title = '<strong>' + this.titleValue + '</strong>' + this.titleName;
			} else {
				title = this.titleName + '<strong>' + this.titleValue + '</strong>';
			}
			this.title.innerHTML = title;
			this.dataPointList.innerHTML = '';

			this.listValues.map(function (set$$1, i) {
				var color = _this2.colors[i] || 'black';
				var value = set$$1.formatted === 0 || set$$1.formatted ? set$$1.formatted : set$$1.value;

				var li = $.create('li', {
					styles: {
						'border-top': '3px solid ' + color
					},
					innerHTML: '<strong style="display: block;">' + (value === 0 || value ? value : '') + '</strong>\n\t\t\t\t\t' + (set$$1.title ? set$$1.title : '')
				});

				_this2.dataPointList.appendChild(li);
			});
		}
	}, {
		key: 'calcPosition',
		value: function calcPosition() {
			var width = this.container.offsetWidth;

			this.top = this.y - this.container.offsetHeight - TOOLTIP_POINTER_TRIANGLE_HEIGHT;
			this.left = this.x - width / 2;
			var maxLeft = this.parent.offsetWidth - width;

			var pointer = this.container.querySelector('.svg-pointer');

			if (this.left < 0) {
				pointer.style.left = 'calc(50% - ' + -1 * this.left + 'px)';
				this.left = 0;
			} else if (this.left > maxLeft) {
				var delta = this.left - maxLeft;
				var pointerOffset = 'calc(50% + ' + delta + 'px)';
				pointer.style.left = pointerOffset;

				this.left = maxLeft;
			} else {
				pointer.style.left = '50%';
			}
		}
	}, {
		key: 'setValues',
		value: function setValues(x, y) {
			var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
			var listValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
			var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;

			this.titleName = title.name;
			this.titleValue = title.value;
			this.listValues = listValues;
			this.x = x;
			this.y = y;
			this.titleValueFirst = title.valueFirst || 0;
			this.index = index;
			this.refresh();
		}
	}, {
		key: 'hideTip',
		value: function hideTip() {
			this.container.style.top = '0px';
			this.container.style.left = '0px';
			this.container.style.opacity = '0';
		}
	}, {
		key: 'showTip',
		value: function showTip() {
			this.container.style.top = this.top + 'px';
			this.container.style.left = this.left + 'px';
			this.container.style.opacity = '1';
		}
	}]);

	return SvgTip;
}();

function floatTwo(d) {
	return parseFloat(d.toFixed(2));
}

/**
 * Returns whether or not two given arrays are equal.
 * @param {Array} arr1 First array
 * @param {Array} arr2 Second array
 */


/**
 * Shuffles array in place. ES6 version
 * @param {Array} array An array containing the items.
 */


/**
 * Fill an array with extra points
 * @param {Array} array Array
 * @param {Number} count number of filler elements
 * @param {Object} element element to fill with
 * @param {Boolean} start fill at start?
 */
function fillArray(array, count, element) {
	var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	if (!element) {
		element = start ? array[0] : array[array.length - 1];
	}
	var fillerArray = new Array(Math.abs(count)).fill(element);
	array = start ? fillerArray.concat(array) : array.concat(fillerArray);
	return array;
}

/**
 * Returns pixel width of string.
 * @param {String} string
 * @param {Number} charWidth Width of single char in pixels
 */
function getStringWidth(string, charWidth) {
	return (string + "").length * charWidth;
}



// https://stackoverflow.com/a/29325222


function getPositionByAngle(angle, radius) {
	return {
		x: Math.sin(angle * ANGLE_RATIO) * radius,
		y: Math.cos(angle * ANGLE_RATIO) * radius
	};
}

function getBarHeightAndYAttr(yTop, zeroLine) {
	var height = void 0,
	    y = void 0;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;
	} else {
		height = yTop - zeroLine;
		y = zeroLine;
	}

	return [height, y];
}

function equilizeNoOfElements(array1, array2) {
	var extraCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : array2.length - array1.length;


	// Doesn't work if either has zero elements.
	if (extraCount > 0) {
		array1 = fillArray(array1, extraCount);
	} else {
		array2 = fillArray(array2, extraCount);
	}
	return [array1, array2];
}

var PRESET_COLOR_MAP = {
	'light-blue': '#7cd6fd',
	'blue': '#5e64ff',
	'violet': '#743ee2',
	'red': '#ff5858',
	'orange': '#ffa00a',
	'yellow': '#feef72',
	'green': '#28a745',
	'light-green': '#98d85b',
	'purple': '#b554ff',
	'magenta': '#ffa3ef',
	'black': '#36114C',
	'grey': '#bdd3e6',
	'light-grey': '#f0f4f7',
	'dark-grey': '#b8c2cc'
};

function limitColor(r) {
	if (r > 255) return 255;else if (r < 0) return 0;
	return r;
}

function lightenDarkenColor(color, amt) {
	var col = getColor(color);
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

function isValidColor(string) {
	// https://stackoverflow.com/a/8027444/6495043
	return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(string)
	);
}

var getColor = function getColor(color) {
	return PRESET_COLOR_MAP[color] || color;
};

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var AXIS_TICK_LENGTH = 6;
var LABEL_MARGIN = 4;
var FONT_SIZE = 10;
var BASE_LINE_COLOR = '#dadada';
var FONT_FILL = '#555b51';

function $$1(expr, con) {
	return typeof expr === "string" ? (con || document).querySelector(expr) : expr || null;
}

function createSVG(tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$$1(val).appendChild(element);
		} else if (i === "around") {
			var ref = $$1(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		} else if (i === "styles") {
			if ((typeof val === 'undefined' ? 'undefined' : _typeof$2(val)) === "object") {
				Object.keys(val).map(function (prop) {
					element.style[prop] = val[prop];
				});
			}
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
}

function renderVerticalGradient(svgDefElem, gradientId) {
	return createSVG('linearGradient', {
		inside: svgDefElem,
		id: gradientId,
		x1: 0,
		x2: 0,
		y1: 0,
		y2: 1
	});
}

function setGradientStop(gradElem, offset, color, opacity) {
	return createSVG('stop', {
		'inside': gradElem,
		'style': 'stop-color: ' + color,
		'offset': offset,
		'stop-opacity': opacity
	});
}

function makeSVGContainer(parent, className, width, height) {
	return createSVG('svg', {
		className: className,
		inside: parent,
		width: width,
		height: height
	});
}

function makeSVGDefs(svgContainer) {
	return createSVG('defs', {
		inside: svgContainer
	});
}

function makeSVGGroup(className) {
	var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

	var args = {
		className: className,
		transform: transform
	};
	if (parent) args.inside = parent;
	return createSVG('g', args);
}



function makePath(pathStr) {
	var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	var stroke = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
	var fill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';

	return createSVG('path', {
		className: className,
		d: pathStr,
		styles: {
			stroke: stroke,
			fill: fill
		}
	});
}

function makeArcPathStr(startPosition, endPosition, center, radius) {
	var clockWise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
	var arcStartX = center.x + startPosition.x,
	    arcStartY = center.y + startPosition.y;
	var arcEndX = center.x + endPosition.x,
	    arcEndY = center.y + endPosition.y;


	return 'M' + center.x + ' ' + center.y + '\n\t\tL' + arcStartX + ' ' + arcStartY + '\n\t\tA ' + radius + ' ' + radius + ' 0 0 ' + (clockWise ? 1 : 0) + '\n\t\t' + arcEndX + ' ' + arcEndY + ' z';
}

function makeGradient(svgDefElem, color) {
	var lighter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	var gradientId = 'path-fill-gradient' + '-' + color + '-' + (lighter ? 'lighter' : 'default');
	var gradientDef = renderVerticalGradient(svgDefElem, gradientId);
	var opacities = [1, 0.6, 0.2];
	if (lighter) {
		opacities = [0.4, 0.2, 0];
	}

	setGradientStop(gradientDef, "0%", color, opacities[0]);
	setGradientStop(gradientDef, "50%", color, opacities[1]);
	setGradientStop(gradientDef, "100%", color, opacities[2]);

	return gradientId;
}

function percentageBar(x, y, width, height) {
	var depth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : PERCENTAGE_BAR_DEFAULT_DEPTH;
	var fill = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'none';


	var args = {
		className: 'percentage-bar',
		x: x,
		y: y,
		width: width,
		height: height,
		fill: fill,
		styles: {
			'stroke': lightenDarkenColor(fill, -25),
			// Diabolically good: https://stackoverflow.com/a/9000859
			// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
			'stroke-dasharray': '0, ' + (height + width) + ', ' + width + ', ' + height,
			'stroke-width': depth
		}
	};

	return createSVG("rect", args);
}

function heatSquare(className, x, y, size) {
	var fill = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'none';
	var data = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

	var args = {
		className: className,
		x: x,
		y: y,
		width: size,
		height: size,
		fill: fill
	};

	Object.keys(data).map(function (key) {
		args[key] = data[key];
	});

	return createSVG("rect", args);
}

function legendBar(x, y, size) {
	var fill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
	var label = arguments[4];

	var args = {
		className: 'legend-bar',
		x: 0,
		y: 0,
		width: size,
		height: '2px',
		fill: fill
	};
	var text = createSVG('text', {
		className: 'legend-dataset-text',
		x: 0,
		y: 0,
		dy: FONT_SIZE * 2 + 'px',
		'font-size': FONT_SIZE * 1.2 + 'px',
		'text-anchor': 'start',
		fill: FONT_FILL,
		innerHTML: label
	});

	var group = createSVG('g', {
		transform: 'translate(' + x + ', ' + y + ')'
	});
	group.appendChild(createSVG("rect", args));
	group.appendChild(text);

	return group;
}

function legendDot(x, y, size) {
	var fill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
	var label = arguments[4];

	var args = {
		className: 'legend-dot',
		cx: 0,
		cy: 0,
		r: size,
		fill: fill
	};
	var text = createSVG('text', {
		className: 'legend-dataset-text',
		x: 0,
		y: 0,
		dx: FONT_SIZE + 'px',
		dy: FONT_SIZE / 3 + 'px',
		'font-size': FONT_SIZE * 1.2 + 'px',
		'text-anchor': 'start',
		fill: FONT_FILL,
		innerHTML: label
	});

	var group = createSVG('g', {
		transform: 'translate(' + x + ', ' + y + ')'
	});
	group.appendChild(createSVG("circle", args));
	group.appendChild(text);

	return group;
}

function makeText(className, x, y, content) {
	var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

	var fontSize = options.fontSize || FONT_SIZE;
	var dy = options.dy !== undefined ? options.dy : fontSize / 2;
	var fill = options.fill || FONT_FILL;
	var textAnchor = options.textAnchor || 'start';
	return createSVG('text', {
		className: className,
		x: x,
		y: y,
		dy: dy + 'px',
		'font-size': fontSize + 'px',
		fill: fill,
		'text-anchor': textAnchor,
		innerHTML: content
	});
}

function makeVertLine(x, label, y1, y2) {
	var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

	if (!options.stroke) options.stroke = BASE_LINE_COLOR;
	var l = createSVG('line', {
		className: 'line-vertical ' + options.className,
		x1: 0,
		x2: 0,
		y1: y1,
		y2: y2,
		styles: {
			stroke: options.stroke
		}
	});

	var text = createSVG('text', {
		x: 0,
		y: y1 > y2 ? y1 + LABEL_MARGIN : y1 - LABEL_MARGIN - FONT_SIZE,
		dy: FONT_SIZE + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'middle',
		innerHTML: label + ""
	});

	var line = createSVG('g', {
		transform: 'translate(' + x + ', 0)'
	});

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

function makeHoriLine(y, label, x1, x2) {
	var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

	if (!options.stroke) options.stroke = BASE_LINE_COLOR;
	if (!options.lineType) options.lineType = '';
	var className = 'line-horizontal ' + options.className + (options.lineType === "dashed" ? "dashed" : "");

	var l = createSVG('line', {
		className: className,
		x1: x1,
		x2: x2,
		y1: 0,
		y2: 0,
		styles: {
			stroke: options.stroke
		}
	});

	var text = createSVG('text', {
		x: x1 < x2 ? x1 - LABEL_MARGIN : x1 + LABEL_MARGIN,
		y: 0,
		dy: FONT_SIZE / 2 - 2 + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': x1 < x2 ? 'end' : 'start',
		innerHTML: label + ""
	});

	var line = createSVG('g', {
		transform: 'translate(0, ' + y + ')',
		'stroke-opacity': 1
	});

	if (text === 0 || text === '0') {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

function yLine(y, label, width) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	if (!options.pos) options.pos = 'left';
	if (!options.offset) options.offset = 0;
	if (!options.mode) options.mode = 'span';
	if (!options.stroke) options.stroke = BASE_LINE_COLOR;
	if (!options.className) options.className = '';

	var x1 = -1 * AXIS_TICK_LENGTH;
	var x2 = options.mode === 'span' ? width + AXIS_TICK_LENGTH : 0;

	if (options.mode === 'tick' && options.pos === 'right') {
		x1 = width + AXIS_TICK_LENGTH;
		x2 = width;
	}

	// let offset = options.pos === 'left' ? -1 * options.offset : options.offset;

	x1 += options.offset;
	x2 += options.offset;

	return makeHoriLine(y, label, x1, x2, {
		stroke: options.stroke,
		className: options.className,
		lineType: options.lineType
	});
}

function xLine(x, label, height) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	if (!options.pos) options.pos = 'bottom';
	if (!options.offset) options.offset = 0;
	if (!options.mode) options.mode = 'span';
	if (!options.stroke) options.stroke = BASE_LINE_COLOR;
	if (!options.className) options.className = '';

	// Draw X axis line in span/tick mode with optional label
	//                        	y2(span)
	// 						|
	// 						|
	//				x line	|
	//						|
	// 					   	|
	// ---------------------+-- y2(tick)
	//						|
	//							y1

	var y1 = height + AXIS_TICK_LENGTH;
	var y2 = options.mode === 'span' ? -1 * AXIS_TICK_LENGTH : height;

	if (options.mode === 'tick' && options.pos === 'top') {
		// top axis ticks
		y1 = -1 * AXIS_TICK_LENGTH;
		y2 = 0;
	}

	return makeVertLine(x, label, y1, y2, {
		stroke: options.stroke,
		className: options.className,
		lineType: options.lineType
	});
}

function yMarker(y, label, width) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	if (!options.labelPos) options.labelPos = 'right';
	var x = options.labelPos === 'left' ? LABEL_MARGIN : width - getStringWidth(label, 5) - LABEL_MARGIN;

	var labelSvg = createSVG('text', {
		className: 'chart-label',
		x: x,
		y: 0,
		dy: FONT_SIZE / -2 + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'start',
		innerHTML: label + ""
	});

	var line = makeHoriLine(y, '', 0, width, {
		stroke: options.stroke || BASE_LINE_COLOR,
		className: options.className || '',
		lineType: options.lineType
	});

	line.appendChild(labelSvg);

	return line;
}

function yRegion(y1, y2, width, label) {
	var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

	// return a group
	var height = y1 - y2;

	var rect = createSVG('rect', {
		className: 'bar mini', // remove class
		styles: {
			fill: 'rgba(228, 234, 239, 0.49)',
			stroke: BASE_LINE_COLOR,
			'stroke-dasharray': width + ', ' + height
		},
		// 'data-point-index': index,
		x: 0,
		y: 0,
		width: width,
		height: height
	});

	if (!options.labelPos) options.labelPos = 'right';
	var x = options.labelPos === 'left' ? LABEL_MARGIN : width - getStringWidth(label + "", 4.5) - LABEL_MARGIN;

	var labelSvg = createSVG('text', {
		className: 'chart-label',
		x: x,
		y: 0,
		dy: FONT_SIZE / -2 + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'start',
		innerHTML: label + ""
	});

	var region = createSVG('g', {
		transform: 'translate(0, ' + y2 + ')'
	});

	region.appendChild(rect);
	region.appendChild(labelSvg);

	return region;
}

function datasetBar(x, yTop, width, color) {
	var label = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
	var index = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
	var offset = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
	var meta = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {};

	var _getBarHeightAndYAttr = getBarHeightAndYAttr(yTop, meta.zeroLine),
	    _getBarHeightAndYAttr2 = _slicedToArray(_getBarHeightAndYAttr, 2),
	    height = _getBarHeightAndYAttr2[0],
	    y = _getBarHeightAndYAttr2[1];

	y -= offset;

	if (height === 0) {
		height = meta.minHeight;
		y -= meta.minHeight;
	}

	var rect = createSVG('rect', {
		className: 'bar mini',
		style: 'fill: ' + color,
		'data-point-index': index,
		x: x,
		y: y,
		width: width,
		height: height
	});

	label += "";

	if (!label && !label.length) {
		return rect;
	} else {
		rect.setAttribute('y', 0);
		rect.setAttribute('x', 0);
		var text = createSVG('text', {
			className: 'data-point-value',
			x: width / 2,
			y: 0,
			dy: FONT_SIZE / 2 * -1 + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'middle',
			innerHTML: label
		});

		var group = createSVG('g', {
			'data-point-index': index,
			transform: 'translate(' + x + ', ' + y + ')'
		});
		group.appendChild(rect);
		group.appendChild(text);

		return group;
	}
}

function datasetDot(x, y, radius, color) {
	var label = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
	var index = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

	var dot = createSVG('circle', {
		style: 'fill: ' + color,
		'data-point-index': index,
		cx: x,
		cy: y,
		r: radius
	});

	label += "";

	if (!label && !label.length) {
		return dot;
	} else {
		dot.setAttribute('cy', 0);
		dot.setAttribute('cx', 0);

		var text = createSVG('text', {
			className: 'data-point-value',
			x: 0,
			y: 0,
			dy: FONT_SIZE / 2 * -1 - radius + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'middle',
			innerHTML: label
		});

		var group = createSVG('g', {
			'data-point-index': index,
			transform: 'translate(' + x + ', ' + y + ')'
		});
		group.appendChild(dot);
		group.appendChild(text);

		return group;
	}
}

function getPaths(xList, yList, color) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	var meta = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

	var pointsList = yList.map(function (y, i) {
		return xList[i] + ',' + y;
	});
	var pointsStr = pointsList.join("L");
	var path = makePath("M" + pointsStr, 'line-graph-path', color);

	// HeatLine
	if (options.heatline) {
		var gradient_id = makeGradient(meta.svgDefs, color);
		path.style.stroke = 'url(#' + gradient_id + ')';
	}

	var paths = {
		path: path
	};

	// Region
	if (options.areaFill) {
		var gradient_id_region = makeGradient(meta.svgDefs, color, true);

		var pathStr = "M" + (xList[0] + ',' + meta.zeroLine + 'L') + pointsStr + ('L' + xList.slice(-1)[0] + ',' + meta.zeroLine);
		paths.region = makePath(pathStr, 'region-fill', 'none', 'url(#' + gradient_id_region + ')');
	}

	return paths;
}

var makeOverlay = {
	'bar': function bar(unit) {
		var transformValue = void 0;
		if (unit.nodeName !== 'rect') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var overlay = unit.cloneNode();
		overlay.style.fill = '#000000';
		overlay.style.opacity = '0.4';

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	},

	'dot': function dot(unit) {
		var transformValue = void 0;
		if (unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var overlay = unit.cloneNode();
		var radius = unit.getAttribute('r');
		var fill = unit.getAttribute('fill');
		overlay.setAttribute('r', parseInt(radius) + DOT_OVERLAY_SIZE_INCR);
		overlay.setAttribute('fill', fill);
		overlay.style.opacity = '0.6';

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	},

	'heat_square': function heat_square(unit) {
		var transformValue = void 0;
		if (unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var overlay = unit.cloneNode();
		var radius = unit.getAttribute('r');
		var fill = unit.getAttribute('fill');
		overlay.setAttribute('r', parseInt(radius) + DOT_OVERLAY_SIZE_INCR);
		overlay.setAttribute('fill', fill);
		overlay.style.opacity = '0.6';

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	}
};

var updateOverlay = {
	'bar': function bar(unit, overlay) {
		var transformValue = void 0;
		if (unit.nodeName !== 'rect') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var attributes = ['x', 'y', 'width', 'height'];
		Object.values(unit.attributes).filter(function (attr) {
			return attributes.includes(attr.name) && attr.specified;
		}).map(function (attr) {
			overlay.setAttribute(attr.name, attr.nodeValue);
		});

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	},

	'dot': function dot(unit, overlay) {
		var transformValue = void 0;
		if (unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var attributes = ['cx', 'cy'];
		Object.values(unit.attributes).filter(function (attr) {
			return attributes.includes(attr.name) && attr.specified;
		}).map(function (attr) {
			overlay.setAttribute(attr.name, attr.nodeValue);
		});

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	},

	'heat_square': function heat_square(unit, overlay) {
		var transformValue = void 0;
		if (unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		var attributes = ['cx', 'cy'];
		Object.values(unit.attributes).filter(function (attr) {
			return attributes.includes(attr.name) && attr.specified;
		}).map(function (attr) {
			overlay.setAttribute(attr.name, attr.nodeValue);
		});

		if (transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	}
};

var _slicedToArray$2 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var UNIT_ANIM_DUR = 350;
var PATH_ANIM_DUR = 350;
var MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
var REPLACE_ALL_NEW_DUR = 250;

var STD_EASING = 'easein';

function translate(unit, oldCoord, newCoord, duration) {
	var old = typeof oldCoord === 'string' ? oldCoord : oldCoord.join(', ');
	return [unit, { transform: newCoord.join(', ') }, duration, STD_EASING, "translate", { transform: old }];
}

function translateVertLine(xLine, newX, oldX) {
	return translate(xLine, [oldX, 0], [newX, 0], MARKER_LINE_ANIM_DUR);
}

function translateHoriLine(yLine, newY, oldY) {
	return translate(yLine, [0, oldY], [0, newY], MARKER_LINE_ANIM_DUR);
}

function animateRegion(rectGroup, newY1, newY2, oldY2) {
	var newHeight = newY1 - newY2;
	var rect = rectGroup.childNodes[0];
	var width = rect.getAttribute("width");
	var rectAnim = [rect, { height: newHeight, 'stroke-dasharray': width + ', ' + newHeight }, MARKER_LINE_ANIM_DUR, STD_EASING];

	var groupAnim = translate(rectGroup, [0, oldY2], [0, newY2], MARKER_LINE_ANIM_DUR);
	return [rectAnim, groupAnim];
}

function animateBar(bar, x, yTop, width) {
	var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
	var meta = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

	var _getBarHeightAndYAttr = getBarHeightAndYAttr(yTop, meta.zeroLine),
	    _getBarHeightAndYAttr2 = _slicedToArray$2(_getBarHeightAndYAttr, 2),
	    height = _getBarHeightAndYAttr2[0],
	    y = _getBarHeightAndYAttr2[1];

	y -= offset;
	if (bar.nodeName !== 'rect') {
		var rect = bar.childNodes[0];
		var rectAnim = [rect, { width: width, height: height }, UNIT_ANIM_DUR, STD_EASING];

		var oldCoordStr = bar.getAttribute("transform").split("(")[1].slice(0, -1);
		var groupAnim = translate(bar, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
		return [rectAnim, groupAnim];
	} else {
		return [[bar, { width: width, height: height, x: x, y: y }, UNIT_ANIM_DUR, STD_EASING]];
	}
	// bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);
}

function animateDot(dot, x, y) {
	if (dot.nodeName !== 'circle') {
		var oldCoordStr = dot.getAttribute("transform").split("(")[1].slice(0, -1);
		var groupAnim = translate(dot, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
		return [groupAnim];
	} else {
		return [[dot, { cx: x, cy: y }, UNIT_ANIM_DUR, STD_EASING]];
	}
	// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
}

function animatePath(paths, newXList, newYList, zeroLine) {
	var pathComponents = [];

	var pointsStr = newYList.map(function (y, i) {
		return newXList[i] + ',' + y;
	});
	var pathStr = pointsStr.join("L");

	var animPath = [paths.path, { d: "M" + pathStr }, PATH_ANIM_DUR, STD_EASING];
	pathComponents.push(animPath);

	if (paths.region) {
		var regStartPt = newXList[0] + ',' + zeroLine + 'L';
		var regEndPt = 'L' + newXList.slice(-1)[0] + ', ' + zeroLine;

		var animRegion = [paths.region, { d: "M" + regStartPt + pathStr + regEndPt }, PATH_ANIM_DUR, STD_EASING];
		pathComponents.push(animRegion);
	}

	return pathComponents;
}

function animatePathStr(oldPath, pathStr) {
	return [oldPath, { d: pathStr }, UNIT_ANIM_DUR, STD_EASING];
}

var _slicedToArray$1 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Leveraging SMIL Animations

var EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

function animateSVGElement(element, props, dur) {
	var easingType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "linear";
	var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
	var oldValues = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};


	var animElement = element.cloneNode(true);
	var newElement = element.cloneNode(true);

	for (var attributeName in props) {
		var animateElement = void 0;
		if (attributeName === 'transform') {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		var currentValue = oldValues[attributeName] || element.getAttribute(attributeName);
		var value = props[attributeName];

		var animAttr = {
			attributeName: attributeName,
			from: currentValue,
			to: value,
			begin: "0s",
			dur: dur / 1000 + "s",
			values: currentValue + ";" + value,
			keySplines: EASING[easingType],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if (type) {
			animAttr["type"] = type;
		}

		for (var i in animAttr) {
			animateElement.setAttribute(i, animAttr[i]);
		}

		animElement.appendChild(animateElement);

		if (type) {
			newElement.setAttribute(attributeName, "translate(" + value + ")");
		} else {
			newElement.setAttribute(attributeName, value);
		}
	}

	return [animElement, newElement];
}

function transform(element, style) {
	// eslint-disable-line no-unused-vars
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
}

function animateSVG(svgContainer, elements) {
	var newElements = [];
	var animElements = [];

	elements.map(function (element) {
		var unit = element[0];
		var parent = unit.parentNode;

		var animElement = void 0,
		    newElement = void 0;

		element[0] = unit;

		var _animateSVGElement = animateSVGElement.apply(undefined, _toConsumableArray$1(element));

		var _animateSVGElement2 = _slicedToArray$1(_animateSVGElement, 2);

		animElement = _animateSVGElement2[0];
		newElement = _animateSVGElement2[1];


		newElements.push(newElement);
		animElements.push([animElement, parent]);

		parent.replaceChild(animElement, unit);
	});

	var animSvg = svgContainer.cloneNode(true);

	animElements.map(function (animElement, i) {
		animElement[1].replaceChild(newElements[i], animElement[0]);
		elements[i][0] = newElements[i];
	});

	return animSvg;
}

function runSMILAnimation(parent, svgElement, elementsToAnimate) {
	if (elementsToAnimate.length === 0) return;

	var animSvgElement = animateSVG(svgElement, elementsToAnimate);
	if (svgElement.parentNode == parent) {
		parent.removeChild(svgElement);
		parent.appendChild(animSvgElement);
	}

	// Replace the new svgElement (data has already been replaced)
	setTimeout(function () {
		if (animSvgElement.parentNode == parent) {
			parent.removeChild(animSvgElement);
			parent.appendChild(svgElement);
		}
	}, REPLACE_ALL_NEW_DUR);
}

var CSSTEXT = ".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}";

function downloadFile(filename, data) {
	var a = document.createElement('a');
	a.style = "display: none";
	var blob = new Blob(data, { type: "image/svg+xml; charset=utf-8" });
	var url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 300);
}

function prepareForExport(svg) {
	var clone = svg.cloneNode(true);
	clone.classList.add('chart-container');
	clone.setAttribute('xmlns', "http://www.w3.org/2000/svg");
	clone.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
	var styleEl = $.create('style', {
		'innerHTML': CSSTEXT
	});
	clone.insertBefore(styleEl, clone.firstChild);

	var container = $.create('div');
	container.appendChild(clone);

	return container.innerHTML;
}

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BOUND_DRAW_FN = void 0;

var BaseChart = function () {
	function BaseChart(parent, options) {
		_classCallCheck$3(this, BaseChart);

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;

		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.rawChartArgs = options;

		this.title = options.title || '';
		this.type = options.type || 'line';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);

		this.colors = this.validateColors(options.colors, this.type);

		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1, // calculate
			isNavigable: options.isNavigable || 0,
			animate: 1
		};

		this.measures = JSON.parse(JSON.stringify(BASE_MEASURES));
		var m = this.measures;
		this.setMeasures(options);
		if (!this.title.length) {
			m.titleHeight = 0;
		}
		if (!this.config.showLegend) m.legendHeight = 0;
		this.argHeight = options.height || m.baseHeight;

		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if (this.config.isNavigable) {
			this.overlays = [];
		}

		this.configure(options);
	}

	_createClass$2(BaseChart, [{
		key: 'prepareData',
		value: function prepareData(data) {
			return data;
		}
	}, {
		key: 'prepareFirstData',
		value: function prepareFirstData(data) {
			return data;
		}
	}, {
		key: 'validateColors',
		value: function validateColors(colors, type) {
			var validColors = [];
			colors = (colors || []).concat(DEFAULT_COLORS[type]);
			colors.forEach(function (string) {
				var color = getColor(string);
				if (!isValidColor(color)) {
					console.warn('"' + string + '" is not a valid color.');
				} else {
					validColors.push(color);
				}
			});
			return validColors;
		}
	}, {
		key: 'setMeasures',
		value: function setMeasures() {
			// Override measures, including those for title and legend
			// set config for legend and title
		}
	}, {
		key: 'configure',
		value: function configure() {
			var height = this.argHeight;
			this.baseHeight = height;
			this.height = height - getExtraHeight(this.measures);

			// Bind window events
			BOUND_DRAW_FN = this.boundDrawFn.bind(this);
			window.addEventListener('resize', BOUND_DRAW_FN);
			window.addEventListener('orientationchange', this.boundDrawFn.bind(this));
		}
	}, {
		key: 'boundDrawFn',
		value: function boundDrawFn() {
			this.draw(true);
		}
	}, {
		key: 'unbindWindowEvents',
		value: function unbindWindowEvents() {
			window.removeEventListener('resize', BOUND_DRAW_FN);
			window.removeEventListener('orientationchange', this.boundDrawFn.bind(this));
		}

		// Has to be called manually

	}, {
		key: 'setup',
		value: function setup() {
			this.makeContainer();
			this.updateWidth();
			this.makeTooltip();

			this.draw(false, true);
		}
	}, {
		key: 'makeContainer',
		value: function makeContainer() {
			// Chart needs a dedicated parent element
			this.parent.innerHTML = '';

			var args = {
				inside: this.parent,
				className: 'chart-container'
			};

			if (this.independentWidth) {
				args.styles = { width: this.independentWidth + 'px' };
				this.parent.style.overflow = 'auto';
			}

			this.container = $.create('div', args);
		}
	}, {
		key: 'makeTooltip',
		value: function makeTooltip() {
			this.tip = new SvgTip({
				parent: this.container,
				colors: this.colors
			});
			this.bindTooltip();
		}
	}, {
		key: 'bindTooltip',
		value: function bindTooltip() {}
	}, {
		key: 'draw',
		value: function draw() {
			var _this = this;

			var onlyWidthChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
			var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			this.updateWidth();

			this.calc(onlyWidthChange);
			this.makeChartArea();
			this.setupComponents();

			this.components.forEach(function (c) {
				return c.setup(_this.drawArea);
			});
			// this.components.forEach(c => c.make());
			this.render(this.components, false);

			if (init) {
				this.data = this.realData;
				setTimeout(function () {
					_this.update(_this.data);
				}, this.initTimeout);
			}

			this.renderLegend();

			this.setupNavigation(init);
		}
	}, {
		key: 'calc',
		value: function calc() {} // builds state

	}, {
		key: 'updateWidth',
		value: function updateWidth() {
			this.baseWidth = getElementContentWidth(this.parent);
			this.width = this.baseWidth - getExtraWidth(this.measures);
		}
	}, {
		key: 'makeChartArea',
		value: function makeChartArea() {
			if (this.svg) {
				this.container.removeChild(this.svg);
			}
			var m = this.measures;

			this.svg = makeSVGContainer(this.container, 'frappe-chart chart', this.baseWidth, this.baseHeight);
			this.svgDefs = makeSVGDefs(this.svg);

			if (this.title.length) {
				this.titleEL = makeText('title', m.margins.left, m.margins.top, this.title, {
					fontSize: m.titleFontSize,
					fill: '#666666',
					dy: m.titleFontSize
				});
			}

			var top = getTopOffset(m);
			this.drawArea = makeSVGGroup(this.type + '-chart chart-draw-area', 'translate(' + getLeftOffset(m) + ', ' + top + ')');

			if (this.config.showLegend) {
				top += this.height + m.paddings.bottom;
				this.legendArea = makeSVGGroup('chart-legend', 'translate(' + getLeftOffset(m) + ', ' + top + ')');
			}

			if (this.title.length) {
				this.svg.appendChild(this.titleEL);
			}
			this.svg.appendChild(this.drawArea);
			if (this.config.showLegend) {
				this.svg.appendChild(this.legendArea);
			}

			this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
		}
	}, {
		key: 'updateTipOffset',
		value: function updateTipOffset(x, y) {
			this.tip.offset = {
				x: x,
				y: y
			};
		}
	}, {
		key: 'setupComponents',
		value: function setupComponents() {
			this.components = new Map();
		}
	}, {
		key: 'update',
		value: function update(data) {
			if (!data) {
				console.error('No data to update.');
			}
			this.data = this.prepareData(data);
			this.calc(); // builds state
			this.render();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.components;
			var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			if (this.config.isNavigable) {
				// Remove all existing overlays
				this.overlays.map(function (o) {
					return o.parentNode.removeChild(o);
				});
				// ref.parentNode.insertBefore(element, ref);
			}
			var elementsToAnimate = [];
			// Can decouple to this.refreshComponents() first to save animation timeout
			components.forEach(function (c) {
				elementsToAnimate = elementsToAnimate.concat(c.update(animate));
			});
			if (elementsToAnimate.length > 0) {
				runSMILAnimation(this.container, this.svg, elementsToAnimate);
				setTimeout(function () {
					components.forEach(function (c) {
						return c.make();
					});
					_this2.updateNav();
				}, CHART_POST_ANIMATE_TIMEOUT);
			} else {
				components.forEach(function (c) {
					return c.make();
				});
				this.updateNav();
			}
		}
	}, {
		key: 'updateNav',
		value: function updateNav() {
			if (this.config.isNavigable) {
				this.makeOverlay();
				this.bindUnits();
			}
		}
	}, {
		key: 'renderLegend',
		value: function renderLegend() {}
	}, {
		key: 'setupNavigation',
		value: function setupNavigation() {
			var _this3 = this;

			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (!this.config.isNavigable) return;

			if (init) {
				this.bindOverlay();

				this.keyActions = {
					'13': this.onEnterKey.bind(this),
					'37': this.onLeftArrow.bind(this),
					'38': this.onUpArrow.bind(this),
					'39': this.onRightArrow.bind(this),
					'40': this.onDownArrow.bind(this)
				};

				document.addEventListener('keydown', function (e) {
					if (isElementInViewport(_this3.container)) {
						e = e || window.event;
						if (_this3.keyActions[e.keyCode]) {
							_this3.keyActions[e.keyCode]();
						}
					}
				});
			}
		}
	}, {
		key: 'makeOverlay',
		value: function makeOverlay$$1() {}
	}, {
		key: 'updateOverlay',
		value: function updateOverlay$$1() {}
	}, {
		key: 'bindOverlay',
		value: function bindOverlay() {}
	}, {
		key: 'bindUnits',
		value: function bindUnits() {}
	}, {
		key: 'onLeftArrow',
		value: function onLeftArrow() {}
	}, {
		key: 'onRightArrow',
		value: function onRightArrow() {}
	}, {
		key: 'onUpArrow',
		value: function onUpArrow() {}
	}, {
		key: 'onDownArrow',
		value: function onDownArrow() {}
	}, {
		key: 'onEnterKey',
		value: function onEnterKey() {}
	}, {
		key: 'addDataPoint',
		value: function addDataPoint() {}
	}, {
		key: 'removeDataPoint',
		value: function removeDataPoint() {}
	}, {
		key: 'getDataPoint',
		value: function getDataPoint() {}
	}, {
		key: 'setCurrentDataPoint',
		value: function setCurrentDataPoint() {}
	}, {
		key: 'updateDataset',
		value: function updateDataset() {}
	}, {
		key: 'export',
		value: function _export() {
			var chartSvg = prepareForExport(this.svg);
			downloadFile(this.title || 'Chart', [chartSvg]);
		}
	}]);

	return BaseChart;
}();

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get$1 = function get$$1(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get$$1(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AggregationChart = function (_BaseChart) {
	_inherits$1(AggregationChart, _BaseChart);

	function AggregationChart(parent, args) {
		_classCallCheck$2(this, AggregationChart);

		return _possibleConstructorReturn$1(this, (AggregationChart.__proto__ || Object.getPrototypeOf(AggregationChart)).call(this, parent, args));
	}

	_createClass$1(AggregationChart, [{
		key: 'configure',
		value: function configure(args) {
			_get$1(AggregationChart.prototype.__proto__ || Object.getPrototypeOf(AggregationChart.prototype), 'configure', this).call(this, args);

			this.config.maxSlices = args.maxSlices || 20;
			this.config.maxLegendPoints = args.maxLegendPoints || 20;
		}
	}, {
		key: 'calc',
		value: function calc() {
			var _this2 = this;

			var s = this.state;
			var maxSlices = this.config.maxSlices;
			s.sliceTotals = [];

			var allTotals = this.data.labels.map(function (label, i) {
				var total = 0;
				_this2.data.datasets.map(function (e) {
					total += e.values[i];
				});
				return [total, label];
			}).filter(function (d) {
				return d[0] >= 0;
			}); // keep only positive results

			var totals = allTotals;
			if (allTotals.length > maxSlices) {
				// Prune and keep a grey area for rest as per maxSlices
				allTotals.sort(function (a, b) {
					return b[0] - a[0];
				});

				totals = allTotals.slice(0, maxSlices - 1);
				var remaining = allTotals.slice(maxSlices - 1);

				var sumOfRemaining = 0;
				remaining.map(function (d) {
					sumOfRemaining += d[0];
				});
				totals.push([sumOfRemaining, 'Rest']);
				this.colors[maxSlices - 1] = 'grey';
			}

			s.labels = [];
			totals.map(function (d) {
				s.sliceTotals.push(d[0]);
				s.labels.push(d[1]);
			});

			s.grandTotal = s.sliceTotals.reduce(function (a, b) {
				return a + b;
			}, 0);

			this.center = {
				x: this.width / 2,
				y: this.height / 2
			};
		}
	}, {
		key: 'renderLegend',
		value: function renderLegend() {
			var _this3 = this;

			var s = this.state;
			this.legendArea.textContent = '';
			this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);

			var count = 0;
			var y = 0;
			this.legendTotals.map(function (d, i) {
				var barWidth = 110;
				var divisor = Math.floor((_this3.width - getExtraWidth(_this3.measures)) / barWidth);
				if (count > divisor) {
					count = 0;
					y += 20;
				}
				var x = barWidth * count + 5;
				var dot = legendDot(x, y, 5, _this3.colors[i], s.labels[i] + ': ' + d);
				_this3.legendArea.appendChild(dot);
				count++;
			});
		}
	}]);

	return AggregationChart;
}(BaseChart);

// Playing around with dates

var NO_OF_YEAR_MONTHS = 12;
var NO_OF_DAYS_IN_WEEK = 7;

var NO_OF_MILLIS = 1000;
var SEC_IN_DAY = 86400;

var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


var DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(date) {
	var result = new Date(date);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

function getYyyyMmDd(date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1; // getMonth() is zero-based
	return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
}

function clone(date) {
	return new Date(date.getTime());
}





// export function getMonthsBetween(startDate, endDate) {}

function getWeeksBetween(startDate, endDate) {
	var weekStartDate = setDayToSunday(startDate);
	return Math.ceil(getDaysBetween(weekStartDate, endDate) / NO_OF_DAYS_IN_WEEK);
}

function getDaysBetween(startDate, endDate) {
	var millisecondsPerDay = SEC_IN_DAY * NO_OF_MILLIS;
	return (treatAsUtc(endDate) - treatAsUtc(startDate)) / millisecondsPerDay;
}

function areInSameMonth(startDate, endDate) {
	return startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
}

function getMonthName(i) {
	var short = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var monthName = MONTH_NAMES[i];
	return short ? monthName.slice(0, 3) : monthName;
}

function getLastDateInMonth(month, year) {
	return new Date(year, month + 1, 0); // 0: last day in previous month
}

// mutates
function setDayToSunday(date) {
	var newDate = clone(date);
	var day = newDate.getDay();
	if (day !== 0) {
		addDays(newDate, -1 * day);
	}
	return newDate;
}

// mutates
function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
}

var _slicedToArray$3 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChartComponent = function () {
	function ChartComponent(_ref) {
		var _ref$layerClass = _ref.layerClass,
		    layerClass = _ref$layerClass === undefined ? '' : _ref$layerClass,
		    _ref$layerTransform = _ref.layerTransform,
		    layerTransform = _ref$layerTransform === undefined ? '' : _ref$layerTransform,
		    constants = _ref.constants,
		    getData = _ref.getData,
		    makeElements = _ref.makeElements,
		    animateElements = _ref.animateElements;

		_classCallCheck$5(this, ChartComponent);

		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.labels = [];

		this.layerClass = layerClass;
		this.layerClass = typeof this.layerClass === 'function' ? this.layerClass() : this.layerClass;

		this.refresh();
	}

	_createClass$4(ChartComponent, [{
		key: 'refresh',
		value: function refresh(data) {
			this.data = data || this.getData();
		}
	}, {
		key: 'setup',
		value: function setup(parent) {
			this.layer = makeSVGGroup(this.layerClass, this.layerTransform, parent);
		}
	}, {
		key: 'make',
		value: function make() {
			this.render(this.data);
			this.oldData = this.data;
		}
	}, {
		key: 'render',
		value: function render(data) {
			var _this = this;

			this.store = this.makeElements(data);

			this.layer.textContent = '';
			this.store.forEach(function (element) {
				_this.layer.appendChild(element);
			});
			this.labels.forEach(function (element) {
				_this.layer.appendChild(element);
			});
		}
	}, {
		key: 'update',
		value: function update() {
			var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			this.refresh();
			var animateElements = [];
			if (animate) {
				animateElements = this.animateElements(this.data) || [];
			}
			return animateElements;
		}
	}]);

	return ChartComponent;
}();

var componentConfigs = {
	pieSlices: {
		layerClass: 'pie-slices',
		makeElements: function makeElements(data) {
			return data.sliceStrings.map(function (s, i) {
				var slice = makePath(s, 'pie-path', 'none', data.colors[i]);
				slice.style.transition = 'transform .3s;';
				return slice;
			});
		},
		animateElements: function animateElements(newData) {
			return this.store.map(function (slice, i) {
				return animatePathStr(slice, newData.sliceStrings[i]);
			});
		}
	},
	percentageBars: {
		layerClass: 'percentage-bars',
		makeElements: function makeElements(data) {
			var _this2 = this;

			return data.xPositions.map(function (x, i) {
				var y = 0;
				var bar = percentageBar(x, y, data.widths[i], _this2.constants.barHeight, _this2.constants.barDepth, data.colors[i]);
				return bar;
			});
		},
		animateElements: function animateElements(newData) {
			if (newData) return [];
		}
	},
	yAxis: {
		layerClass: 'y axis',
		makeElements: function makeElements(data) {
			var _this3 = this;

			return data.positions.map(function (position, i) {
				return yLine(position, data.labels[i], _this3.constants.width, { mode: _this3.constants.mode, pos: _this3.constants.pos });
			});
		},
		animateElements: function animateElements(newData) {
			var newPos = newData.positions;
			var newLabels = newData.labels;
			var oldPos = this.oldData.positions;
			var oldLabels = this.oldData.labels;

			var _equilizeNoOfElements = equilizeNoOfElements(oldPos, newPos);

			var _equilizeNoOfElements2 = _slicedToArray$3(_equilizeNoOfElements, 2);

			oldPos = _equilizeNoOfElements2[0];
			newPos = _equilizeNoOfElements2[1];

			var _equilizeNoOfElements3 = equilizeNoOfElements(oldLabels, newLabels);

			var _equilizeNoOfElements4 = _slicedToArray$3(_equilizeNoOfElements3, 2);

			oldLabels = _equilizeNoOfElements4[0];
			newLabels = _equilizeNoOfElements4[1];


			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map(function (line, i) {
				return translateHoriLine(line, newPos[i], oldPos[i]);
			});
		}
	},

	xAxis: {
		layerClass: 'x axis',
		makeElements: function makeElements(data) {
			var _this4 = this;

			return data.positions.map(function (position, i) {
				return xLine(position, data.calcLabels[i], _this4.constants.height, { mode: _this4.constants.mode, pos: _this4.constants.pos });
			});
		},
		animateElements: function animateElements(newData) {
			var newPos = newData.positions;
			var newLabels = newData.calcLabels;
			var oldPos = this.oldData.positions;
			var oldLabels = this.oldData.calcLabels;

			var _equilizeNoOfElements5 = equilizeNoOfElements(oldPos, newPos);

			var _equilizeNoOfElements6 = _slicedToArray$3(_equilizeNoOfElements5, 2);

			oldPos = _equilizeNoOfElements6[0];
			newPos = _equilizeNoOfElements6[1];

			var _equilizeNoOfElements7 = equilizeNoOfElements(oldLabels, newLabels);

			var _equilizeNoOfElements8 = _slicedToArray$3(_equilizeNoOfElements7, 2);

			oldLabels = _equilizeNoOfElements8[0];
			newLabels = _equilizeNoOfElements8[1];


			this.render({
				positions: oldPos,
				calcLabels: newLabels
			});

			return this.store.map(function (line, i) {
				return translateVertLine(line, newPos[i], oldPos[i]);
			});
		}
	},

	yMarkers: {
		layerClass: 'y-markers',
		makeElements: function makeElements(data) {
			var _this5 = this;

			return data.map(function (m) {
				return yMarker(m.position, m.label, _this5.constants.width, { labelPos: m.options.labelPos, mode: 'span', lineType: 'dashed' });
			});
		},
		animateElements: function animateElements(newData) {
			var _equilizeNoOfElements9 = equilizeNoOfElements(this.oldData, newData);

			var _equilizeNoOfElements10 = _slicedToArray$3(_equilizeNoOfElements9, 2);

			this.oldData = _equilizeNoOfElements10[0];
			newData = _equilizeNoOfElements10[1];


			var newPos = newData.map(function (d) {
				return d.position;
			});
			var newLabels = newData.map(function (d) {
				return d.label;
			});
			var newOptions = newData.map(function (d) {
				return d.options;
			});

			var oldPos = this.oldData.map(function (d) {
				return d.position;
			});

			this.render(oldPos.map(function (pos, i) {
				return {
					position: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
			}));

			return this.store.map(function (line, i) {
				return translateHoriLine(line, newPos[i], oldPos[i]);
			});
		}
	},

	yRegions: {
		layerClass: 'y-regions',
		makeElements: function makeElements(data) {
			var _this6 = this;

			return data.map(function (r) {
				return yRegion(r.startPos, r.endPos, _this6.constants.width, r.label, { labelPos: r.options.labelPos });
			});
		},
		animateElements: function animateElements(newData) {
			var _equilizeNoOfElements11 = equilizeNoOfElements(this.oldData, newData);

			var _equilizeNoOfElements12 = _slicedToArray$3(_equilizeNoOfElements11, 2);

			this.oldData = _equilizeNoOfElements12[0];
			newData = _equilizeNoOfElements12[1];


			var newPos = newData.map(function (d) {
				return d.endPos;
			});
			var newLabels = newData.map(function (d) {
				return d.label;
			});
			var newStarts = newData.map(function (d) {
				return d.startPos;
			});
			var newOptions = newData.map(function (d) {
				return d.options;
			});

			var oldPos = this.oldData.map(function (d) {
				return d.endPos;
			});
			var oldStarts = this.oldData.map(function (d) {
				return d.startPos;
			});

			this.render(oldPos.map(function (pos, i) {
				return {
					startPos: oldStarts[i],
					endPos: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
			}));

			var animateElements = [];

			this.store.map(function (rectGroup, i) {
				animateElements = animateElements.concat(animateRegion(rectGroup, newStarts[i], newPos[i], oldPos[i]));
			});

			return animateElements;
		}
	},

	heatDomain: {
		layerClass: function layerClass() {
			return 'heat-domain domain-' + this.constants.index;
		},
		makeElements: function makeElements(data) {
			var _this7 = this;

			var _constants = this.constants,
			    index = _constants.index,
			    colWidth = _constants.colWidth,
			    rowHeight = _constants.rowHeight,
			    squareSize = _constants.squareSize,
			    xTranslate = _constants.xTranslate;

			var monthNameHeight = -12;
			var x = xTranslate,
			    y = 0;

			this.serializedSubDomains = [];

			data.cols.map(function (week, weekNo) {
				if (weekNo === 1) {
					_this7.labels.push(makeText('domain-name', x, monthNameHeight, getMonthName(index, true).toUpperCase(), {
						fontSize: 9
					}));
				}
				week.map(function (day, i) {
					if (day.fill) {
						var _data = {
							'data-date': day.yyyyMmDd,
							'data-value': day.dataValue,
							'data-day': i
						};
						var square = heatSquare('day', x, y, squareSize, day.fill, _data);
						_this7.serializedSubDomains.push(square);
					}
					y += rowHeight;
				});
				y = 0;
				x += colWidth;
			});

			return this.serializedSubDomains;
		},
		animateElements: function animateElements(newData) {
			if (newData) return [];
		}
	},

	barGraph: {
		layerClass: function layerClass() {
			return 'dataset-units dataset-bars dataset-' + this.constants.index;
		},
		makeElements: function makeElements(data) {
			var c = this.constants;
			this.unitType = 'bar';
			this.units = data.yPositions.map(function (y, j) {
				return datasetBar(data.xPositions[j], y, data.barWidth, c.color, data.labels[j], j, data.offsets[j], {
					zeroLine: data.zeroLine,
					barsWidth: data.barsWidth,
					minHeight: c.minHeight
				});
			});
			return this.units;
		},
		animateElements: function animateElements(newData) {
			var newXPos = newData.xPositions;
			var newYPos = newData.yPositions;
			var newOffsets = newData.offsets;
			var newLabels = newData.labels;

			var oldXPos = this.oldData.xPositions;
			var oldYPos = this.oldData.yPositions;
			var oldOffsets = this.oldData.offsets;
			var oldLabels = this.oldData.labels;

			var _equilizeNoOfElements13 = equilizeNoOfElements(oldXPos, newXPos);

			var _equilizeNoOfElements14 = _slicedToArray$3(_equilizeNoOfElements13, 2);

			oldXPos = _equilizeNoOfElements14[0];
			newXPos = _equilizeNoOfElements14[1];

			var _equilizeNoOfElements15 = equilizeNoOfElements(oldYPos, newYPos);

			var _equilizeNoOfElements16 = _slicedToArray$3(_equilizeNoOfElements15, 2);

			oldYPos = _equilizeNoOfElements16[0];
			newYPos = _equilizeNoOfElements16[1];

			var _equilizeNoOfElements17 = equilizeNoOfElements(oldOffsets, newOffsets);

			var _equilizeNoOfElements18 = _slicedToArray$3(_equilizeNoOfElements17, 2);

			oldOffsets = _equilizeNoOfElements18[0];
			newOffsets = _equilizeNoOfElements18[1];

			var _equilizeNoOfElements19 = equilizeNoOfElements(oldLabels, newLabels);

			var _equilizeNoOfElements20 = _slicedToArray$3(_equilizeNoOfElements19, 2);

			oldLabels = _equilizeNoOfElements20[0];
			newLabels = _equilizeNoOfElements20[1];


			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				offsets: oldOffsets,
				labels: newLabels,

				zeroLine: this.oldData.zeroLine,
				barsWidth: this.oldData.barsWidth,
				barWidth: this.oldData.barWidth
			});

			var animateElements = [];

			this.store.map(function (bar, i) {
				animateElements = animateElements.concat(animateBar(bar, newXPos[i], newYPos[i], newData.barWidth, newOffsets[i], { zeroLine: newData.zeroLine }));
			});

			return animateElements;
		}
	},

	lineGraph: {
		layerClass: function layerClass() {
			return 'dataset-units dataset-line dataset-' + this.constants.index;
		},
		makeElements: function makeElements(data) {
			var c = this.constants;
			this.unitType = 'dot';
			this.paths = {};
			if (!c.hideLine) {
				this.paths = getPaths(data.xPositions, data.yPositions, c.color, {
					heatline: c.heatline,
					areaFill: c.areaFill
				}, {
					svgDefs: c.svgDefs,
					zeroLine: data.zeroLine
				});
			}

			this.units = [];
			if (!c.hideDots) {
				this.units = data.yPositions.map(function (y, j) {
					return datasetDot(data.xPositions[j], y, data.radius, c.color, c.valuesOverPoints ? data.values[j] : '', j);
				});
			}

			return Object.values(this.paths).concat(this.units);
		},
		animateElements: function animateElements(newData) {
			var newXPos = newData.xPositions;
			var newYPos = newData.yPositions;
			var newValues = newData.values;

			var oldXPos = this.oldData.xPositions;
			var oldYPos = this.oldData.yPositions;
			var oldValues = this.oldData.values;

			var _equilizeNoOfElements21 = equilizeNoOfElements(oldXPos, newXPos);

			var _equilizeNoOfElements22 = _slicedToArray$3(_equilizeNoOfElements21, 2);

			oldXPos = _equilizeNoOfElements22[0];
			newXPos = _equilizeNoOfElements22[1];

			var _equilizeNoOfElements23 = equilizeNoOfElements(oldYPos, newYPos);

			var _equilizeNoOfElements24 = _slicedToArray$3(_equilizeNoOfElements23, 2);

			oldYPos = _equilizeNoOfElements24[0];
			newYPos = _equilizeNoOfElements24[1];

			var _equilizeNoOfElements25 = equilizeNoOfElements(oldValues, newValues);

			var _equilizeNoOfElements26 = _slicedToArray$3(_equilizeNoOfElements25, 2);

			oldValues = _equilizeNoOfElements26[0];
			newValues = _equilizeNoOfElements26[1];


			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				values: newValues,

				zeroLine: this.oldData.zeroLine,
				radius: this.oldData.radius
			});

			var animateElements = [];

			if (Object.keys(this.paths).length) {
				animateElements = animateElements.concat(animatePath(this.paths, newXPos, newYPos, newData.zeroLine));
			}

			if (this.units.length) {
				this.units.map(function (dot, i) {
					animateElements = animateElements.concat(animateDot(dot, newXPos[i], newYPos[i]));
				});
			}

			return animateElements;
		}
	}
};

function getComponent(name, constants, getData) {
	var keys = Object.keys(componentConfigs).filter(function (k) {
		return name.includes(k);
	});
	var config = componentConfigs[keys[0]];
	Object.assign(config, {
		constants: constants,
		getData: getData
	});
	return new ChartComponent(config);
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get$$1(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get$$1(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PercentageChart = function (_AggregationChart) {
	_inherits(PercentageChart, _AggregationChart);

	function PercentageChart(parent, args) {
		_classCallCheck$1(this, PercentageChart);

		var _this = _possibleConstructorReturn(this, (PercentageChart.__proto__ || Object.getPrototypeOf(PercentageChart)).call(this, parent, args));

		_this.type = 'percentage';
		_this.setup();
		return _this;
	}

	_createClass(PercentageChart, [{
		key: 'setMeasures',
		value: function setMeasures(options) {
			var m = this.measures;
			this.barOptions = options.barOptions || {};

			var b = this.barOptions;
			b.height = b.height || PERCENTAGE_BAR_DEFAULT_HEIGHT;
			b.depth = b.depth || PERCENTAGE_BAR_DEFAULT_DEPTH;

			m.paddings.right = 30;
			m.legendHeight = 80;
			m.baseHeight = (b.height + b.depth * 0.5) * 8;
		}
	}, {
		key: 'setupComponents',
		value: function setupComponents() {
			var s = this.state;

			var componentConfigs = [['percentageBars', {
				barHeight: this.barOptions.height,
				barDepth: this.barOptions.depth
			}, function () {
				return {
					xPositions: s.xPositions,
					widths: s.widths,
					colors: this.colors
				};
			}.bind(this)]];

			this.components = new Map(componentConfigs.map(function (args) {
				var component = getComponent.apply(undefined, _toConsumableArray(args));
				return [args[0], component];
			}));
		}
	}, {
		key: 'calc',
		value: function calc() {
			var _this2 = this;

			_get(PercentageChart.prototype.__proto__ || Object.getPrototypeOf(PercentageChart.prototype), 'calc', this).call(this);
			var s = this.state;

			s.xPositions = [];
			s.widths = [];

			var xPos = 0;
			s.sliceTotals.map(function (value) {
				var width = _this2.width * value / s.grandTotal;
				s.widths.push(width);
				s.xPositions.push(xPos);
				xPos += width;
			});
		}
	}, {
		key: 'makeDataByIndex',
		value: function makeDataByIndex() {}
	}, {
		key: 'bindTooltip',
		value: function bindTooltip() {
			var _this3 = this;

			var s = this.state;
			this.container.addEventListener('mousemove', function (e) {
				var bars = _this3.components.get('percentageBars').store;
				var bar = e.target;
				if (bars.includes(bar)) {

					var i = bars.indexOf(bar);
					var gOff = getOffset(_this3.container),
					    pOff = getOffset(bar);

					var x = pOff.left - gOff.left + parseInt(bar.getAttribute('width')) / 2;
					var y = pOff.top - gOff.top;
					var title = (_this3.formattedLabels && _this3.formattedLabels.length > 0 ? _this3.formattedLabels[i] : _this3.state.labels[i]) + ': ';
					var fraction = s.sliceTotals[i] / s.grandTotal;

					_this3.tip.setValues(x, y, { name: title, value: (fraction * 100).toFixed(1) + "%" });
					_this3.tip.showTip();
				}
			});
		}
	}]);

	return PercentageChart;
}(AggregationChart);

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get$2 = function get$$1(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get$$1(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PieChart = function (_AggregationChart) {
	_inherits$2(PieChart, _AggregationChart);

	function PieChart(parent, args) {
		_classCallCheck$6(this, PieChart);

		var _this = _possibleConstructorReturn$2(this, (PieChart.__proto__ || Object.getPrototypeOf(PieChart)).call(this, parent, args));

		_this.type = 'pie';
		_this.initTimeout = 0;
		_this.init = 1;

		_this.setup();
		return _this;
	}

	_createClass$5(PieChart, [{
		key: 'configure',
		value: function configure(args) {
			_get$2(PieChart.prototype.__proto__ || Object.getPrototypeOf(PieChart.prototype), 'configure', this).call(this, args);
			this.mouseMove = this.mouseMove.bind(this);
			this.mouseLeave = this.mouseLeave.bind(this);

			this.hoverRadio = args.hoverRadio || 0.1;
			this.config.startAngle = args.startAngle || 0;

			this.clockWise = args.clockWise || false;
		}
	}, {
		key: 'calc',
		value: function calc() {
			var _this2 = this;

			_get$2(PieChart.prototype.__proto__ || Object.getPrototypeOf(PieChart.prototype), 'calc', this).call(this);
			var s = this.state;
			this.radius = this.height > this.width ? this.center.x : this.center.y;

			var radius = this.radius,
			    clockWise = this.clockWise;


			var prevSlicesProperties = s.slicesProperties || [];
			s.sliceStrings = [];
			s.slicesProperties = [];
			var curAngle = 180 - this.config.startAngle;

			s.sliceTotals.map(function (total, i) {
				var startAngle = curAngle;
				var originDiffAngle = total / s.grandTotal * FULL_ANGLE;
				var diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
				var endAngle = curAngle = curAngle + diffAngle;
				var startPosition = getPositionByAngle(startAngle, radius);
				var endPosition = getPositionByAngle(endAngle, radius);

				var prevProperty = _this2.init && prevSlicesProperties[i];

				var curStart = void 0,
				    curEnd = void 0;
				if (_this2.init) {
					curStart = prevProperty ? prevProperty.startPosition : startPosition;
					curEnd = prevProperty ? prevProperty.endPosition : startPosition;
				} else {
					curStart = startPosition;
					curEnd = endPosition;
				}
				var curPath = makeArcPathStr(curStart, curEnd, _this2.center, _this2.radius, _this2.clockWise);

				s.sliceStrings.push(curPath);
				s.slicesProperties.push({
					startPosition: startPosition,
					endPosition: endPosition,
					value: total,
					total: s.grandTotal,
					startAngle: startAngle,
					endAngle: endAngle,
					angle: diffAngle
				});
			});
			this.init = 0;
		}
	}, {
		key: 'setupComponents',
		value: function setupComponents() {
			var s = this.state;

			var componentConfigs = [['pieSlices', {}, function () {
				return {
					sliceStrings: s.sliceStrings,
					colors: this.colors
				};
			}.bind(this)]];

			this.components = new Map(componentConfigs.map(function (args) {
				var component = getComponent.apply(undefined, _toConsumableArray$2(args));
				return [args[0], component];
			}));
		}
	}, {
		key: 'calTranslateByAngle',
		value: function calTranslateByAngle(property) {
			var radius = this.radius,
			    hoverRadio = this.hoverRadio;

			var position = getPositionByAngle(property.startAngle + property.angle / 2, radius);
			return 'translate3d(' + position.x * hoverRadio + 'px,' + position.y * hoverRadio + 'px,0)';
		}
	}, {
		key: 'hoverSlice',
		value: function hoverSlice(path, i, flag, e) {
			if (!path) return;
			var color = this.colors[i];
			if (flag) {
				transform(path, this.calTranslateByAngle(this.state.slicesProperties[i]));
				path.style.fill = lightenDarkenColor(color, 50);
				var g_off = getOffset(this.svg);
				var x = e.pageX - g_off.left + 10;
				var y = e.pageY - g_off.top - 10;
				var title = (this.formatted_labels && this.formatted_labels.length > 0 ? this.formatted_labels[i] : this.state.labels[i]) + ': ';
				var percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
				this.tip.setValues(x, y, { name: title, value: percent + "%" });
				this.tip.showTip();
			} else {
				transform(path, 'translate3d(0,0,0)');
				this.tip.hideTip();
				path.style.fill = color;
			}
		}
	}, {
		key: 'bindTooltip',
		value: function bindTooltip() {
			this.container.addEventListener('mousemove', this.mouseMove);
			this.container.addEventListener('mouseleave', this.mouseLeave);
		}
	}, {
		key: 'mouseMove',
		value: function mouseMove(e) {
			var target = e.target;
			var slices = this.components.get('pieSlices').store;
			var prevIndex = this.curActiveSliceIndex;
			var prevAcitve = this.curActiveSlice;
			if (slices.includes(target)) {
				var i = slices.indexOf(target);
				this.hoverSlice(prevAcitve, prevIndex, false);
				this.curActiveSlice = target;
				this.curActiveSliceIndex = i;
				this.hoverSlice(target, i, true, e);
			} else {
				this.mouseLeave();
			}
		}
	}, {
		key: 'mouseLeave',
		value: function mouseLeave() {
			this.hoverSlice(this.curActiveSlice, this.curActiveSliceIndex, false);
		}
	}]);

	return PieChart;
}(AggregationChart);

var _slicedToArray$4 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray$4(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function normalize(x) {
	// Calculates mantissa and exponent of a number
	// Returns normalized number and exponent
	// https://stackoverflow.com/q/9383593/6495043

	if (x === 0) {
		return [0, 0];
	}
	if (isNaN(x)) {
		return { mantissa: -6755399441055744, exponent: 972 };
	}
	var sig = x > 0 ? 1 : -1;
	if (!isFinite(x)) {
		return { mantissa: sig * 4503599627370496, exponent: 972 };
	}

	x = Math.abs(x);
	var exp = Math.floor(Math.log10(x));
	var man = x / Math.pow(10, exp);

	return [sig * man, exp];
}

function getChartRangeIntervals(max) {
	var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	var upperBound = Math.ceil(max);
	var lowerBound = Math.floor(min);
	var range = upperBound - lowerBound;

	var noOfParts = range;
	var partSize = 1;

	// To avoid too many partitions
	if (range > 5) {
		if (range % 2 !== 0) {
			upperBound++;
			// Recalc range
			range = upperBound - lowerBound;
		}
		noOfParts = range / 2;
		partSize = 2;
	}

	// Special case: 1 and 2
	if (range <= 2) {
		noOfParts = 4;
		partSize = range / noOfParts;
	}

	// Special case: 0
	if (range === 0) {
		noOfParts = 5;
		partSize = 1;
	}

	var intervals = [];
	for (var i = 0; i <= noOfParts; i++) {
		intervals.push(lowerBound + partSize * i);
	}
	return intervals;
}

function getChartIntervals(maxValue) {
	var minValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	var _normalize = normalize(maxValue),
	    _normalize2 = _slicedToArray$4(_normalize, 2),
	    normalMaxValue = _normalize2[0],
	    exponent = _normalize2[1];

	var normalMinValue = minValue ? minValue / Math.pow(10, exponent) : 0;

	// Allow only 7 significant digits
	normalMaxValue = normalMaxValue.toFixed(6);

	var intervals = getChartRangeIntervals(normalMaxValue, normalMinValue);
	intervals = intervals.map(function (value) {
		return value * Math.pow(10, exponent);
	});
	return intervals;
}

function calcChartIntervals(values) {
	var withMinimum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	var maxValue = Math.max.apply(Math, _toConsumableArray$4(values));
	var minValue = Math.min.apply(Math, _toConsumableArray$4(values));

	// Exponent to be used for pretty print
	var exponent = 0,
	    intervals = []; // eslint-disable-line no-unused-vars

	function getPositiveFirstIntervals(maxValue, absMinValue) {
		var intervals = getChartIntervals(maxValue);

		var intervalSize = intervals[1] - intervals[0];

		// Then unshift the negative values
		var value = 0;
		for (var i = 1; value < absMinValue; i++) {
			value += intervalSize;
			intervals.unshift(-1 * value);
		}
		return intervals;
	}

	// CASE I: Both non-negative

	if (maxValue >= 0 && minValue >= 0) {
		exponent = normalize(maxValue)[1];
		if (!withMinimum) {
			intervals = getChartIntervals(maxValue);
		} else {
			intervals = getChartIntervals(maxValue, minValue);
		}
	}

	// CASE II: Only minValue negative

	else if (maxValue > 0 && minValue < 0) {
			// `withMinimum` irrelevant in this case,
			// We'll be handling both sides of zero separately
			// (both starting from zero)
			// Because ceil() and floor() behave differently
			// in those two regions

			var absMinValue = Math.abs(minValue);

			if (maxValue >= absMinValue) {
				exponent = normalize(maxValue)[1];
				intervals = getPositiveFirstIntervals(maxValue, absMinValue);
			} else {
				// Mirror: maxValue => absMinValue, then change sign
				exponent = normalize(absMinValue)[1];
				var posIntervals = getPositiveFirstIntervals(absMinValue, maxValue);
				intervals = posIntervals.map(function (d) {
					return d * -1;
				});
			}
		}

		// CASE III: Both non-positive

		else if (maxValue <= 0 && minValue <= 0) {
				// Mirrored Case I:
				// Work with positives, then reverse the sign and array

				var pseudoMaxValue = Math.abs(minValue);
				var pseudoMinValue = Math.abs(maxValue);

				exponent = normalize(pseudoMaxValue)[1];
				if (!withMinimum) {
					intervals = getChartIntervals(pseudoMaxValue);
				} else {
					intervals = getChartIntervals(pseudoMaxValue, pseudoMinValue);
				}

				intervals = intervals.reverse().map(function (d) {
					return d * -1;
				});
			}

	return intervals;
}

function getZeroIndex(yPts) {
	var zeroIndex = void 0;
	var interval = getIntervalSize(yPts);
	if (yPts.indexOf(0) >= 0) {
		// the range has a given zero
		// zero-line on the chart
		zeroIndex = yPts.indexOf(0);
	} else if (yPts[0] > 0) {
		// Minimum value is positive
		// zero-line is off the chart: below
		var min = yPts[0];
		zeroIndex = -1 * min / interval;
	} else {
		// Maximum value is negative
		// zero-line is off the chart: above
		var max = yPts[yPts.length - 1];
		zeroIndex = -1 * max / interval + (yPts.length - 1);
	}
	return zeroIndex;
}



function getIntervalSize(orderedArray) {
	return orderedArray[1] - orderedArray[0];
}

function getValueRange(orderedArray) {
	return orderedArray[orderedArray.length - 1] - orderedArray[0];
}

function scale(val, yAxis) {
	return floatTwo(yAxis.zeroLine - val * yAxis.scaleMultiplier);
}





function getClosestInArray(goal, arr) {
	var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	var closest = arr.reduce(function (prev, curr) {
		return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
	});

	return index ? arr.indexOf(closest) : closest;
}

function calcDistribution(values, distributionSize) {
	// Assume non-negative values,
	// implying distribution minimum at zero

	var dataMaxValue = Math.max.apply(Math, _toConsumableArray$4(values));

	var distributionStep = 1 / (distributionSize - 1);
	var distribution = [];

	for (var i = 0; i < distributionSize; i++) {
		var checkpoint = dataMaxValue * (distributionStep * i);
		distribution.push(checkpoint);
	}

	return distribution;
}

function getMaxCheckpoint(value, distribution) {
	return distribution.filter(function (d) {
		return d < value;
	}).length;
}

var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray$3(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var COL_WIDTH = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;
var ROW_HEIGHT = COL_WIDTH;
// const DAY_INCR = 1;

var Heatmap = function (_BaseChart) {
	_inherits$3(Heatmap, _BaseChart);

	function Heatmap(parent, options) {
		_classCallCheck$7(this, Heatmap);

		var _this = _possibleConstructorReturn$3(this, (Heatmap.__proto__ || Object.getPrototypeOf(Heatmap)).call(this, parent, options));

		_this.type = 'heatmap';

		_this.countLabel = options.countLabel || '';

		var validStarts = ['Sunday', 'Monday'];
		var startSubDomain = validStarts.includes(options.startSubDomain) ? options.startSubDomain : 'Sunday';
		_this.startSubDomainIndex = validStarts.indexOf(startSubDomain);

		_this.setup();
		return _this;
	}

	_createClass$6(Heatmap, [{
		key: 'setMeasures',
		value: function setMeasures(options) {
			var m = this.measures;
			this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;

			m.paddings.top = ROW_HEIGHT * 3;
			m.paddings.bottom = 0;
			m.legendHeight = ROW_HEIGHT * 2;
			m.baseHeight = ROW_HEIGHT * NO_OF_DAYS_IN_WEEK + getExtraHeight(m);

			var d = this.data;
			var spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
			this.independentWidth = (getWeeksBetween(d.start, d.end) + spacing) * COL_WIDTH + getExtraWidth(m);
		}
	}, {
		key: 'updateWidth',
		value: function updateWidth() {
			var spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
			var noOfWeeks = this.state.noOfWeeks ? this.state.noOfWeeks : 52;
			this.baseWidth = (noOfWeeks + spacing) * COL_WIDTH + getExtraWidth(this.measures);
		}
	}, {
		key: 'prepareData',
		value: function prepareData() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;

			if (data.start && data.end && data.start > data.end) {
				throw new Error('Start date cannot be greater than end date.');
			}

			if (!data.start) {
				data.start = new Date();
				data.start.setFullYear(data.start.getFullYear() - 1);
			}
			if (!data.end) {
				data.end = new Date();
			}
			data.dataPoints = data.dataPoints || {};

			if (parseInt(Object.keys(data.dataPoints)[0]) > 100000) {
				var points = {};
				Object.keys(data.dataPoints).forEach(function (timestampSec$$1) {
					var date = new Date(timestampSec$$1 * NO_OF_MILLIS);
					points[getYyyyMmDd(date)] = data.dataPoints[timestampSec$$1];
				});
				data.dataPoints = points;
			}

			return data;
		}
	}, {
		key: 'calc',
		value: function calc() {
			var s = this.state;

			s.start = clone(this.data.start);
			s.end = clone(this.data.end);

			s.firstWeekStart = clone(s.start);
			s.noOfWeeks = getWeeksBetween(s.start, s.end);
			s.distribution = calcDistribution(Object.values(this.data.dataPoints), HEATMAP_DISTRIBUTION_SIZE);

			s.domainConfigs = this.getDomains();
		}
	}, {
		key: 'setupComponents',
		value: function setupComponents() {
			var _this2 = this;

			var s = this.state;
			var lessCol = this.discreteDomains ? 0 : 1;

			var componentConfigs = s.domainConfigs.map(function (config, i) {
				return ['heatDomain', {
					index: config.index,
					colWidth: COL_WIDTH,
					rowHeight: ROW_HEIGHT,
					squareSize: HEATMAP_SQUARE_SIZE,
					xTranslate: s.domainConfigs.filter(function (config, j) {
						return j < i;
					}).map(function (config) {
						return config.cols.length - lessCol;
					}).reduce(function (a, b) {
						return a + b;
					}, 0) * COL_WIDTH
				}, function () {
					return s.domainConfigs[i];
				}.bind(_this2)];
			});

			this.components = new Map(componentConfigs.map(function (args, i) {
				var component = getComponent.apply(undefined, _toConsumableArray$3(args));
				return [args[0] + '-' + i, component];
			}));

			var y = 0;
			DAY_NAMES_SHORT.forEach(function (dayName, i) {
				if ([1, 3, 5].includes(i)) {
					var dayText = makeText('subdomain-name', -COL_WIDTH / 2, y, dayName, {
						fontSize: HEATMAP_SQUARE_SIZE,
						dy: 8,
						textAnchor: 'end'
					});
					_this2.drawArea.appendChild(dayText);
				}
				y += ROW_HEIGHT;
			});
		}
	}, {
		key: 'update',
		value: function update(data) {
			if (!data) {
				console.error('No data to update.');
			}

			this.data = this.prepareData(data);
			this.draw();
			this.bindTooltip();
		}
	}, {
		key: 'bindTooltip',
		value: function bindTooltip() {
			var _this3 = this;

			this.container.addEventListener('mousemove', function (e) {
				_this3.components.forEach(function (comp) {
					var daySquares = comp.store;
					var daySquare = e.target;
					if (daySquares.includes(daySquare)) {

						var count = daySquare.getAttribute('data-value');
						var dateParts = daySquare.getAttribute('data-date').split('-');

						var month = getMonthName(parseInt(dateParts[1]) - 1, true);

						var gOff = _this3.container.getBoundingClientRect(),
						    pOff = daySquare.getBoundingClientRect();

						var width = parseInt(e.target.getAttribute('width'));
						var x = pOff.left - gOff.left + width / 2;
						var y = pOff.top - gOff.top;
						var value = count + ' ' + _this3.countLabel;
						var name = ' on ' + month + ' ' + dateParts[0] + ', ' + dateParts[2];

						_this3.tip.setValues(x, y, { name: name, value: value, valueFirst: 1 }, []);
						_this3.tip.showTip();
					}
				});
			});
		}
	}, {
		key: 'renderLegend',
		value: function renderLegend() {
			var _this4 = this;

			this.legendArea.textContent = '';
			var x = 0;
			var y = ROW_HEIGHT;

			var lessText = makeText('subdomain-name', x, y, 'Less', {
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			});
			x = COL_WIDTH * 2 + COL_WIDTH / 2;
			this.legendArea.appendChild(lessText);

			this.colors.slice(0, HEATMAP_DISTRIBUTION_SIZE).map(function (color, i) {
				var square = heatSquare('heatmap-legend-unit', x + (COL_WIDTH + 3) * i, y, HEATMAP_SQUARE_SIZE, color);
				_this4.legendArea.appendChild(square);
			});

			var moreTextX = x + HEATMAP_DISTRIBUTION_SIZE * (COL_WIDTH + 3) + COL_WIDTH / 4;
			var moreText = makeText('subdomain-name', moreTextX, y, 'More', {
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			});
			this.legendArea.appendChild(moreText);
		}
	}, {
		key: 'getDomains',
		value: function getDomains() {
			var s = this.state;
			var _ref = [s.start.getMonth(), s.start.getFullYear()],
			    startMonth = _ref[0],
			    startYear = _ref[1];
			var _ref2 = [s.end.getMonth(), s.end.getFullYear()],
			    endMonth = _ref2[0],
			    endYear = _ref2[1];


			var noOfMonths = endMonth - startMonth + 1 + (endYear - startYear) * 12;

			var domainConfigs = [];

			var startOfMonth = clone(s.start);
			for (var i = 0; i < noOfMonths; i++) {
				var endDate = s.end;
				if (!areInSameMonth(startOfMonth, s.end)) {
					var _ref3 = [startOfMonth.getMonth(), startOfMonth.getFullYear()],
					    month = _ref3[0],
					    year = _ref3[1];

					endDate = getLastDateInMonth(month, year);
				}
				domainConfigs.push(this.getDomainConfig(startOfMonth, endDate));

				addDays(endDate, 1);
				startOfMonth = endDate;
			}

			return domainConfigs;
		}
	}, {
		key: 'getDomainConfig',
		value: function getDomainConfig(startDate) {
			var endDate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
			var _ref4 = [startDate.getMonth(), startDate.getFullYear()],
			    month = _ref4[0],
			    year = _ref4[1];

			var startOfWeek = setDayToSunday(startDate); // TODO: Monday as well
			endDate = clone(endDate) || getLastDateInMonth(month, year);

			var domainConfig = {
				index: month,
				cols: []
			};

			addDays(endDate, 1);
			var noOfMonthWeeks = getWeeksBetween(startOfWeek, endDate);

			var cols = [],
			    col = void 0;
			for (var i = 0; i < noOfMonthWeeks; i++) {
				col = this.getCol(startOfWeek, month);
				cols.push(col);

				startOfWeek = new Date(col[NO_OF_DAYS_IN_WEEK - 1].yyyyMmDd);
				addDays(startOfWeek, 1);
			}

			if (col[NO_OF_DAYS_IN_WEEK - 1].dataValue !== undefined) {
				addDays(startOfWeek, 1);
				cols.push(this.getCol(startOfWeek, month, true));
			}

			domainConfig.cols = cols;

			return domainConfig;
		}
	}, {
		key: 'getCol',
		value: function getCol(startDate, month) {
			var empty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var s = this.state;

			// startDate is the start of week
			var currentDate = clone(startDate);
			var col = [];

			for (var i = 0; i < NO_OF_DAYS_IN_WEEK; i++, addDays(currentDate, 1)) {
				var config = {};

				// Non-generic adjustment for entire heatmap, needs state
				var currentDateWithinData = currentDate >= s.start && currentDate <= s.end;

				if (empty || currentDate.getMonth() !== month || !currentDateWithinData) {
					config.yyyyMmDd = getYyyyMmDd(currentDate);
				} else {
					config = this.getSubDomainConfig(currentDate);
				}
				col.push(config);
			}

			return col;
		}
	}, {
		key: 'getSubDomainConfig',
		value: function getSubDomainConfig(date) {
			var yyyyMmDd = getYyyyMmDd(date);
			var dataValue = this.data.dataPoints[yyyyMmDd];
			var config = {
				yyyyMmDd: yyyyMmDd,
				dataValue: dataValue || 0,
				fill: this.colors[getMaxCheckpoint(dataValue, this.state.distribution)]
			};
			return config;
		}
	}]);

	return Heatmap;
}(BaseChart);

function dataPrep(data, type) {
	data.labels = data.labels || [];

	var datasetLength = data.labels.length;

	// Datasets
	var datasets = data.datasets;
	var zeroArray = new Array(datasetLength).fill(0);
	if (!datasets) {
		// default
		datasets = [{
			values: zeroArray
		}];
	}

	var overridingType = void 0;
	if (AXIS_DATASET_CHART_TYPES.includes(type)) {
		overridingType = type;
	}

	datasets.map(function (d) {
		// Set values
		if (!d.values) {
			d.values = zeroArray;
		} else {
			// Check for non values
			var vals = d.values;
			vals = vals.map(function (val) {
				return !isNaN(val) ? val : 0;
			});

			// Trim or extend
			if (vals.length > datasetLength) {
				vals = vals.slice(0, datasetLength);
			} else {
				vals = fillArray(vals, datasetLength - vals.length, 0);
			}
		}

		// Set labels

		// Set type
		if (overridingType) {
			d.chartType = overridingType;
		} else if (!d.chartType) {
			d.chartType = AXIS_CHART_DEFAULT_TYPE;
		}
	});

	// Markers

	// Regions
	// data.yRegions = data.yRegions || [];
	if (data.yRegions) {
		data.yRegions.map(function (d) {
			if (d.end < d.start) {
				var _ref = [d.end, d.start];
				d.start = _ref[0];
				d.end = _ref[1];
			}
		});
	}

	return data;
}

function zeroDataPrep(realData) {
	var datasetLength = realData.labels.length;
	var zeroArray = new Array(datasetLength).fill(0);

	var zeroData = {
		labels: realData.labels.slice(0, -1),
		datasets: realData.datasets.map(function (d) {
			return {
				name: '',
				values: zeroArray.slice(0, -1),
				chartType: d.chartType
			};
		})
	};

	if (realData.yMarkers) {
		zeroData.yMarkers = [{
			value: 0,
			label: ''
		}];
	}

	if (realData.yRegions) {
		zeroData.yRegions = [{
			start: 0,
			end: 0,
			label: ''
		}];
	}

	return zeroData;
}

function getShortenedLabels(chartWidth) {
	var labels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	var isSeries = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

	var allowedSpace = chartWidth / labels.length;
	if (allowedSpace <= 0) allowedSpace = 1;
	var allowedLetters = allowedSpace / DEFAULT_CHAR_WIDTH;

	var calcLabels = labels.map(function (label, i) {
		label += "";
		if (label.length > allowedLetters) {

			if (!isSeries) {
				if (allowedLetters - 3 > 0) {
					label = label.slice(0, allowedLetters - 3) + " ...";
				} else {
					label = label.slice(0, allowedLetters) + '..';
				}
			} else {
				var multiple = Math.ceil(label.length / allowedLetters);
				if (i % multiple !== 0) {
					label = "";
				}
			}
		}
		return label;
	});

	return calcLabels;
}

var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get$3 = function get$$1(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get$$1(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray$5(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AxisChart = function (_BaseChart) {
	_inherits$4(AxisChart, _BaseChart);

	function AxisChart(parent, args) {
		_classCallCheck$8(this, AxisChart);

		var _this = _possibleConstructorReturn$4(this, (AxisChart.__proto__ || Object.getPrototypeOf(AxisChart)).call(this, parent, args));

		_this.barOptions = args.barOptions || {};
		_this.lineOptions = args.lineOptions || {};

		_this.init = 1;

		_this.setup();
		return _this;
	}

	_createClass$7(AxisChart, [{
		key: 'setMeasures',
		value: function setMeasures() {
			if (this.data.datasets.length <= 1) {
				this.config.showLegend = 0;
				this.measures.paddings.bottom = 30;
			}
		}
	}, {
		key: 'configure',
		value: function configure(options) {
			_get$3(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'configure', this).call(this, options);

			options.axisOptions = options.axisOptions || {};
			options.tooltipOptions = options.tooltipOptions || {};

			this.config.xAxisMode = options.axisOptions.xAxisMode || 'span';
			this.config.yAxisMode = options.axisOptions.yAxisMode || 'span';
			this.config.xIsSeries = options.axisOptions.xIsSeries || 0;

			this.config.formatTooltipX = options.tooltipOptions.formatTooltipX;
			this.config.formatTooltipY = options.tooltipOptions.formatTooltipY;

			this.config.valuesOverPoints = options.valuesOverPoints;
		}
	}, {
		key: 'prepareData',
		value: function prepareData() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;

			return dataPrep(data, this.type);
		}
	}, {
		key: 'prepareFirstData',
		value: function prepareFirstData() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;

			return zeroDataPrep(data);
		}
	}, {
		key: 'calc',
		value: function calc() {
			var onlyWidthChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this.calcXPositions();
			if (!onlyWidthChange) {
				this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
			}
			this.makeDataByIndex();
		}
	}, {
		key: 'calcXPositions',
		value: function calcXPositions() {
			var s = this.state;
			var labels = this.data.labels;
			s.datasetLength = labels.length;

			s.unitWidth = this.width / s.datasetLength;
			// Default, as per bar, and mixed. Only line will be a special case
			s.xOffset = s.unitWidth / 2;

			// // For a pure Line Chart
			// s.unitWidth = this.width/(s.datasetLength - 1);
			// s.xOffset = 0;

			s.xAxis = {
				labels: labels,
				positions: labels.map(function (d, i) {
					return floatTwo(s.xOffset + i * s.unitWidth);
				})
			};
		}
	}, {
		key: 'calcYAxisParameters',
		value: function calcYAxisParameters(dataValues) {
			var withMinimum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'false';

			var yPts = calcChartIntervals(dataValues, withMinimum);
			var scaleMultiplier = this.height / getValueRange(yPts);
			var intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
			var zeroLine = this.height - getZeroIndex(yPts) * intervalHeight;

			this.state.yAxis = {
				labels: yPts,
				positions: yPts.map(function (d) {
					return zeroLine - d * scaleMultiplier;
				}),
				scaleMultiplier: scaleMultiplier,
				zeroLine: zeroLine
			};

			// Dependent if above changes
			this.calcDatasetPoints();
			this.calcYExtremes();
			this.calcYRegions();
		}
	}, {
		key: 'calcDatasetPoints',
		value: function calcDatasetPoints() {
			var s = this.state;
			var scaleAll = function scaleAll(values) {
				return values.map(function (val) {
					return scale(val, s.yAxis);
				});
			};

			s.datasets = this.data.datasets.map(function (d, i) {
				var values = d.values;
				var cumulativeYs = d.cumulativeYs || [];
				return {
					name: d.name,
					index: i,
					chartType: d.chartType,

					values: values,
					yPositions: scaleAll(values),

					cumulativeYs: cumulativeYs,
					cumulativeYPos: scaleAll(cumulativeYs)
				};
			});
		}
	}, {
		key: 'calcYExtremes',
		value: function calcYExtremes() {
			var s = this.state;
			if (this.barOptions.stacked) {
				s.yExtremes = s.datasets[s.datasets.length - 1].cumulativeYPos;
				return;
			}
			s.yExtremes = new Array(s.datasetLength).fill(9999);
			s.datasets.map(function (d) {
				d.yPositions.map(function (pos, j) {
					if (pos < s.yExtremes[j]) {
						s.yExtremes[j] = pos;
					}
				});
			});
		}
	}, {
		key: 'calcYRegions',
		value: function calcYRegions() {
			var s = this.state;
			if (this.data.yMarkers) {
				this.state.yMarkers = this.data.yMarkers.map(function (d) {
					d.position = scale(d.value, s.yAxis);
					if (!d.options) d.options = {};
					// if(!d.label.includes(':')) {
					// 	d.label += ': ' + d.value;
					// }
					return d;
				});
			}
			if (this.data.yRegions) {
				this.state.yRegions = this.data.yRegions.map(function (d) {
					d.startPos = scale(d.start, s.yAxis);
					d.endPos = scale(d.end, s.yAxis);
					if (!d.options) d.options = {};
					return d;
				});
			}
		}
	}, {
		key: 'getAllYValues',
		value: function getAllYValues() {
			var _this2 = this,
			    _ref;

			var key = 'values';

			if (this.barOptions.stacked) {
				key = 'cumulativeYs';
				var cumulative = new Array(this.state.datasetLength).fill(0);
				this.data.datasets.map(function (d, i) {
					var values = _this2.data.datasets[i].values;
					d[key] = cumulative = cumulative.map(function (c, i) {
						return c + values[i];
					});
				});
			}

			var allValueLists = this.data.datasets.map(function (d) {
				return d[key];
			});
			if (this.data.yMarkers) {
				allValueLists.push(this.data.yMarkers.map(function (d) {
					return d.value;
				}));
			}
			if (this.data.yRegions) {
				this.data.yRegions.map(function (d) {
					allValueLists.push([d.end, d.start]);
				});
			}

			return (_ref = []).concat.apply(_ref, _toConsumableArray$5(allValueLists));
		}
	}, {
		key: 'setupComponents',
		value: function setupComponents() {
			var _this3 = this;

			var componentConfigs = [['yAxis', {
				mode: this.config.yAxisMode,
				width: this.width
				// pos: 'right'
			}, function () {
				return this.state.yAxis;
			}.bind(this)], ['xAxis', {
				mode: this.config.xAxisMode,
				height: this.height
				// pos: 'right'
			}, function () {
				var s = this.state;
				s.xAxis.calcLabels = getShortenedLabels(this.width, s.xAxis.labels, this.config.xIsSeries);

				return s.xAxis;
			}.bind(this)], ['yRegions', {
				width: this.width,
				pos: 'right'
			}, function () {
				return this.state.yRegions;
			}.bind(this)]];

			var barDatasets = this.state.datasets.filter(function (d) {
				return d.chartType === 'bar';
			});
			var lineDatasets = this.state.datasets.filter(function (d) {
				return d.chartType === 'line';
			});

			var barsConfigs = barDatasets.map(function (d) {
				var index = d.index;
				return ['barGraph' + '-' + d.index, {
					index: index,
					color: _this3.colors[index],
					stacked: _this3.barOptions.stacked,

					// same for all datasets
					valuesOverPoints: _this3.config.valuesOverPoints,
					minHeight: _this3.height * MIN_BAR_PERCENT_HEIGHT
				}, function () {
					var s = this.state;
					var d = s.datasets[index];
					var stacked = this.barOptions.stacked;

					var spaceRatio = this.barOptions.spaceRatio || BAR_CHART_SPACE_RATIO;
					var barsWidth = s.unitWidth / 2 * (2 - spaceRatio);
					var barWidth = barsWidth / (stacked ? 1 : barDatasets.length);

					var xPositions = s.xAxis.positions.map(function (x) {
						return x - barsWidth / 2;
					});
					if (!stacked) {
						xPositions = xPositions.map(function (p) {
							return p + barWidth * index;
						});
					}

					var labels = new Array(s.datasetLength).fill('');
					if (this.config.valuesOverPoints) {
						if (stacked && d.index === s.datasets.length - 1) {
							labels = d.cumulativeYs;
						} else {
							labels = d.values;
						}
					}

					var offsets = new Array(s.datasetLength).fill(0);
					if (stacked) {
						offsets = d.yPositions.map(function (y, j) {
							return y - d.cumulativeYPos[j];
						});
					}

					return {
						xPositions: xPositions,
						yPositions: d.yPositions,
						offsets: offsets,
						// values: d.values,
						labels: labels,

						zeroLine: s.yAxis.zeroLine,
						barsWidth: barsWidth,
						barWidth: barWidth
					};
				}.bind(_this3)];
			});

			var lineConfigs = lineDatasets.map(function (d) {
				var index = d.index;
				return ['lineGraph' + '-' + d.index, {
					index: index,
					color: _this3.colors[index],
					svgDefs: _this3.svgDefs,
					heatline: _this3.lineOptions.heatline,
					areaFill: _this3.lineOptions.areaFill,
					hideDots: _this3.lineOptions.hideDots,
					hideLine: _this3.lineOptions.hideLine,

					// same for all datasets
					valuesOverPoints: _this3.config.valuesOverPoints
				}, function () {
					var s = this.state;
					var d = s.datasets[index];
					var minLine = s.yAxis.positions[0] < s.yAxis.zeroLine ? s.yAxis.positions[0] : s.yAxis.zeroLine;

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: minLine,
						radius: this.lineOptions.dotSize || LINE_CHART_DOT_SIZE
					};
				}.bind(_this3)];
			});

			var markerConfigs = [['yMarkers', {
				width: this.width,
				pos: 'right'
			}, function () {
				return this.state.yMarkers;
			}.bind(this)]];

			componentConfigs = componentConfigs.concat(barsConfigs, lineConfigs, markerConfigs);

			var optionals = ['yMarkers', 'yRegions'];
			this.dataUnitComponents = [];

			this.components = new Map(componentConfigs.filter(function (args) {
				return !optionals.includes(args[0]) || _this3.state[args[0]];
			}).map(function (args) {
				var component = getComponent.apply(undefined, _toConsumableArray$5(args));
				if (args[0].includes('lineGraph') || args[0].includes('barGraph')) {
					_this3.dataUnitComponents.push(component);
				}
				return [args[0], component];
			}));
		}
	}, {
		key: 'makeDataByIndex',
		value: function makeDataByIndex() {
			var _this4 = this;

			this.dataByIndex = {};

			var s = this.state;
			var formatX = this.config.formatTooltipX;
			var formatY = this.config.formatTooltipY;
			var titles = s.xAxis.labels;

			titles.map(function (label, index) {
				var values = _this4.state.datasets.map(function (set$$1, i) {
					var value = set$$1.values[index];
					return {
						title: set$$1.name,
						value: value,
						yPos: set$$1.yPositions[index],
						color: _this4.colors[i],
						formatted: formatY ? formatY(value) : value
					};
				});

				_this4.dataByIndex[index] = {
					label: label,
					formattedLabel: formatX ? formatX(label) : label,
					xPos: s.xAxis.positions[index],
					values: values,
					yExtreme: s.yExtremes[index]
				};
			});
		}
	}, {
		key: 'bindTooltip',
		value: function bindTooltip() {
			var _this5 = this;

			// NOTE: could be in tooltip itself, as it is a given functionality for its parent
			this.container.addEventListener('mousemove', function (e) {
				var m = _this5.measures;
				var o = getOffset(_this5.container);
				var relX = e.pageX - o.left - getLeftOffset(m);
				var relY = e.pageY - o.top;

				if (relY < _this5.height + getTopOffset(m) && relY > getTopOffset(m)) {
					_this5.mapTooltipXPosition(relX);
				} else {
					_this5.tip.hideTip();
				}
			});
		}
	}, {
		key: 'mapTooltipXPosition',
		value: function mapTooltipXPosition(relX) {
			var s = this.state;
			if (!s.yExtremes) return;

			var index = getClosestInArray(relX, s.xAxis.positions, true);
			var dbi = this.dataByIndex[index];

			this.tip.setValues(dbi.xPos + this.tip.offset.x, dbi.yExtreme + this.tip.offset.y, { name: dbi.formattedLabel, value: '' }, dbi.values, index);

			this.tip.showTip();
		}
	}, {
		key: 'renderLegend',
		value: function renderLegend() {
			var _this6 = this;

			var s = this.data;
			if (s.datasets.length > 1) {
				this.legendArea.textContent = '';
				s.datasets.map(function (d, i) {
					var barWidth = AXIS_LEGEND_BAR_SIZE;
					// let rightEndPoint = this.baseWidth - this.measures.margins.left - this.measures.margins.right;
					// let multiplier = s.datasets.length - i;
					var rect = legendBar(
					// rightEndPoint - multiplier * barWidth,	// To right align
					barWidth * i, '0', barWidth, _this6.colors[i], d.name);
					_this6.legendArea.appendChild(rect);
				});
			}
		}

		// Overlay

	}, {
		key: 'makeOverlay',
		value: function makeOverlay$$1() {
			var _this7 = this;

			if (this.init) {
				this.init = 0;
				return;
			}
			if (this.overlayGuides) {
				this.overlayGuides.forEach(function (g) {
					var o = g.overlay;
					o.parentNode.removeChild(o);
				});
			}

			this.overlayGuides = this.dataUnitComponents.map(function (c) {
				return {
					type: c.unitType,
					overlay: undefined,
					units: c.units
				};
			});

			if (this.state.currentIndex === undefined) {
				this.state.currentIndex = this.state.datasetLength - 1;
			}

			// Render overlays
			this.overlayGuides.map(function (d) {
				var currentUnit = d.units[_this7.state.currentIndex];

				d.overlay = makeOverlay[d.type](currentUnit);
				_this7.drawArea.appendChild(d.overlay);
			});
		}
	}, {
		key: 'updateOverlayGuides',
		value: function updateOverlayGuides() {
			if (this.overlayGuides) {
				this.overlayGuides.forEach(function (g) {
					var o = g.overlay;
					o.parentNode.removeChild(o);
				});
			}
		}
	}, {
		key: 'bindOverlay',
		value: function bindOverlay() {
			var _this8 = this;

			this.parent.addEventListener('data-select', function () {
				_this8.updateOverlay();
			});
		}
	}, {
		key: 'bindUnits',
		value: function bindUnits() {
			var _this9 = this;

			this.dataUnitComponents.map(function (c) {
				c.units.map(function (unit) {
					unit.addEventListener('click', function () {
						var index = unit.getAttribute('data-point-index');
						_this9.setCurrentDataPoint(index);
					});
				});
			});

			// Note: Doesn't work as tooltip is absolutely positioned
			this.tip.container.addEventListener('click', function () {
				var index = _this9.tip.container.getAttribute('data-point-index');
				_this9.setCurrentDataPoint(index);
			});
		}
	}, {
		key: 'updateOverlay',
		value: function updateOverlay$$1() {
			var _this10 = this;

			this.overlayGuides.map(function (d) {
				var currentUnit = d.units[_this10.state.currentIndex];
				updateOverlay[d.type](currentUnit, d.overlay);
			});
		}
	}, {
		key: 'onLeftArrow',
		value: function onLeftArrow() {
			this.setCurrentDataPoint(this.state.currentIndex - 1);
		}
	}, {
		key: 'onRightArrow',
		value: function onRightArrow() {
			this.setCurrentDataPoint(this.state.currentIndex + 1);
		}
	}, {
		key: 'getDataPoint',
		value: function getDataPoint() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.currentIndex;

			var s = this.state;
			var data_point = {
				index: index,
				label: s.xAxis.labels[index],
				values: s.datasets.map(function (d) {
					return d.values[index];
				})
			};
			return data_point;
		}
	}, {
		key: 'setCurrentDataPoint',
		value: function setCurrentDataPoint(index) {
			var s = this.state;
			index = parseInt(index);
			if (index < 0) index = 0;
			if (index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
			if (index === s.currentIndex) return;
			s.currentIndex = index;
			fire(this.parent, "data-select", this.getDataPoint());
		}

		// API

	}, {
		key: 'addDataPoint',
		value: function addDataPoint(label, datasetValues) {
			var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.state.datasetLength;

			_get$3(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'addDataPoint', this).call(this, label, datasetValues, index);
			this.data.labels.splice(index, 0, label);
			this.data.datasets.map(function (d, i) {
				d.values.splice(index, 0, datasetValues[i]);
			});
			this.update(this.data);
		}
	}, {
		key: 'removeDataPoint',
		value: function removeDataPoint() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.datasetLength - 1;

			if (this.data.labels.length <= 1) {
				return;
			}
			_get$3(AxisChart.prototype.__proto__ || Object.getPrototypeOf(AxisChart.prototype), 'removeDataPoint', this).call(this, index);
			this.data.labels.splice(index, 1);
			this.data.datasets.map(function (d) {
				d.values.splice(index, 1);
			});
			this.update(this.data);
		}
	}, {
		key: 'updateDataset',
		value: function updateDataset(datasetValues) {
			var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			this.data.datasets[index].values = datasetValues;
			this.update(this.data);
		}
		// addDataset(dataset, index) {}
		// removeDataset(index = 0) {}

	}, {
		key: 'updateDatasets',
		value: function updateDatasets(datasets) {
			this.data.datasets.map(function (d, i) {
				if (datasets[i]) {
					d.values = datasets[i];
				}
			});
			this.update(this.data);
		}

		// updateDataPoint(dataPoint, index = 0) {}
		// addDataPoint(dataPoint, index = 0) {}
		// removeDataPoint(index = 0) {}

	}]);

	return AxisChart;
}(BaseChart);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chartTypes = {
	bar: AxisChart,
	line: AxisChart,
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType() {
	var chartType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'line';
	var parent = arguments[1];
	var options = arguments[2];

	if (chartType === 'axis-mixed') {
		// options.type = 'line';
		return new AxisChart(parent, options);
	}

	if (!chartTypes[chartType]) {
		console.error("Undefined chart type: " + chartType);
		return;
	}

	return new chartTypes[chartType](parent, options);
}

var Chart = function Chart(parent, options) {
	_classCallCheck(this, Chart);

	return getChartByType(options.type, parent, options);
};

exports.Chart = Chart;
exports.PercentageChart = PercentageChart;
exports.PieChart = PieChart;
exports.Heatmap = Heatmap;
exports.AxisChart = AxisChart;
//# sourceMappingURL=frappe-charts.min.cjs.js.map
