'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
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
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function styleInject(css, ref) {
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

var css_248z = ".chart-container {\n  position: relative;\n  /* for absolutely positioned tooltip */\n  /* https://www.smashingmagazine.com/2015/11/using-system-ui-fonts-practical-guide/ */\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }\n  .chart-container .axis, .chart-container .chart-label {\n    fill: #313B44; }\n    .chart-container .axis line, .chart-container .chart-label line {\n      stroke: #E2E6E9; }\n  .chart-container .dataset-units circle {\n    stroke: #fff;\n    stroke-width: 2; }\n  .chart-container .dataset-units path {\n    fill: none;\n    stroke-opacity: 1;\n    stroke-width: 2px; }\n  .chart-container .dataset-path {\n    stroke-width: 2px; }\n  .chart-container .path-group path {\n    fill: none;\n    stroke-opacity: 1;\n    stroke-width: 2px; }\n  .chart-container line.dashed {\n    stroke-dasharray: 5, 3; }\n  .chart-container .axis-line .specific-value {\n    text-anchor: start; }\n  .chart-container .axis-line .y-line {\n    text-anchor: end; }\n  .chart-container .axis-line .x-line {\n    text-anchor: middle; }\n  .chart-container .legend-dataset-text {\n    fill: #6c7680;\n    font-weight: 600; }\n\n.graph-svg-tip {\n  position: absolute;\n  z-index: 99999;\n  padding: 10px;\n  font-size: 12px;\n  text-align: center;\n  background: #FFFFFF;\n  box-shadow: 0px 1px 4px rgba(17, 43, 66, 0.1), 0px 2px 6px rgba(17, 43, 66, 0.08), 0px 40px 30px -30px rgba(17, 43, 66, 0.1);\n  border-radius: 6px; }\n  .graph-svg-tip ul {\n    padding-left: 0;\n    display: flex; }\n  .graph-svg-tip ol {\n    padding-left: 0;\n    display: flex; }\n  .graph-svg-tip ul.data-point-list li {\n    min-width: 90px;\n    font-weight: 600; }\n  .graph-svg-tip .svg-pointer {\n    position: absolute;\n    height: 12px;\n    width: 12px;\n    border-radius: 2px;\n    background: white;\n    transform: rotate(45deg);\n    margin-top: -7px;\n    margin-left: -6px; }\n  .graph-svg-tip.comparison {\n    text-align: left;\n    padding: 0px;\n    pointer-events: none; }\n    .graph-svg-tip.comparison .title {\n      display: block;\n      padding: 16px;\n      margin: 0;\n      color: #313B44;\n      font-weight: 600;\n      line-height: 1;\n      pointer-events: none;\n      text-transform: uppercase; }\n    .graph-svg-tip.comparison ul {\n      margin: 0;\n      white-space: nowrap;\n      list-style: none; }\n      .graph-svg-tip.comparison ul.tooltip-grid {\n        display: grid;\n        grid-template-columns: repeat(4, minmax(0, 1fr));\n        gap: 5px; }\n    .graph-svg-tip.comparison li {\n      display: inline-block;\n      display: flex;\n      flex-direction: row;\n      font-weight: 600;\n      line-height: 1;\n      padding: 5px 15px 15px 15px; }\n      .graph-svg-tip.comparison li .tooltip-legend {\n        height: 12px;\n        width: 12px;\n        margin-right: 8px;\n        border-radius: 2px; }\n      .graph-svg-tip.comparison li .tooltip-label {\n        margin-top: 4px;\n        font-size: 11px;\n        max-width: 100px;\n        color: #313B44;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap; }\n      .graph-svg-tip.comparison li .tooltip-value {\n        color: #192734; }\n";
styleInject(css_248z);

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
    } else if (i === "styles") {
      if (_typeof(val) === "object") {
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
} // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
// an element's offsetParent property will return null whenever it, or any of its parents,
// is hidden via the display style property.

function isHidden(el) {
  return el.offsetParent === null;
}
function isElementInViewport(el) {
  // Although straightforward: https://stackoverflow.com/a/7557433/6495043
  var rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
  /*or $(window).height() */
  rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  /*or $(window).width() */
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
} // https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/

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
var AXIS_LEGEND_BAR_SIZE = 100;
var BAR_CHART_SPACE_RATIO = 0.5;
var MIN_BAR_PERCENT_HEIGHT = 0.00;
var LINE_CHART_DOT_SIZE = 4;
var DOT_OVERLAY_SIZE_INCR = 4;
var PERCENTAGE_BAR_DEFAULT_HEIGHT = 20;
var PERCENTAGE_BAR_DEFAULT_DEPTH = 2; // Fixed 5-color theme,
// More colors are difficult to parse visually

var HEATMAP_DISTRIBUTION_SIZE = 5;
var HEATMAP_SQUARE_SIZE = 10;
var HEATMAP_GUTTER_SIZE = 2;
var DEFAULT_CHAR_WIDTH = 7;
var TOOLTIP_POINTER_TRIANGLE_HEIGHT = 7.48;
var DEFAULT_CHART_COLORS = ['pink', 'blue', 'green', 'grey', 'red', 'yellow', 'purple', 'teal', 'cyan', 'orange'];
var HEATMAP_COLORS_GREEN = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
var DEFAULT_COLORS = {
  bar: DEFAULT_CHART_COLORS,
  line: DEFAULT_CHART_COLORS,
  pie: DEFAULT_CHART_COLORS,
  percentage: DEFAULT_CHART_COLORS,
  heatmap: HEATMAP_COLORS_GREEN,
  donut: DEFAULT_CHART_COLORS
}; // Universal constants

var ANGLE_RATIO = Math.PI / 180;
var FULL_ANGLE = 360;

var SvgTip = /*#__PURE__*/function () {
  function SvgTip(_ref) {
    var _ref$parent = _ref.parent,
        parent = _ref$parent === void 0 ? null : _ref$parent,
        _ref$colors = _ref.colors,
        colors = _ref$colors === void 0 ? [] : _ref$colors;

    _classCallCheck(this, SvgTip);

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

  _createClass(SvgTip, [{
    key: "setup",
    value: function setup() {
      this.makeTooltip();
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.fill();
      this.calcPosition();
    }
  }, {
    key: "makeTooltip",
    value: function makeTooltip() {
      var _this = this;

      this.container = $.create('div', {
        inside: this.parent,
        className: 'graph-svg-tip comparison',
        innerHTML: "<span class=\"title\"></span>\n\t\t\t\t<ul class=\"data-point-list\"></ul>\n\t\t\t\t<div class=\"svg-pointer\"></div>"
      });
      this.hideTip();
      this.title = this.container.querySelector('.title');
      this.list = this.container.querySelector('.data-point-list');
      this.dataPointList = this.container.querySelector('.data-point-list');
      this.parent.addEventListener('mouseleave', function () {
        _this.hideTip();
      });
    }
  }, {
    key: "fill",
    value: function fill() {
      var _this2 = this;

      var title;

      if (this.index) {
        this.container.setAttribute('data-point-index', this.index);
      }

      if (this.titleValueFirst) {
        title = "<strong>".concat(this.titleValue, "</strong>").concat(this.titleName);
      } else {
        title = "".concat(this.titleName, "<strong>").concat(this.titleValue, "</strong>");
      }

      if (this.listValues.length > 4) {
        this.list.classList.add('tooltip-grid');
      } else {
        this.list.classList.remove('tooltip-grid');
      }

      this.title.innerHTML = title;
      this.dataPointList.innerHTML = '';
      this.listValues.map(function (set, i) {
        var color = _this2.colors[i] || 'black';
        var value = set.formatted === 0 || set.formatted ? set.formatted : set.value;
        var li = $.create('li', {
          innerHTML: "<div class=\"tooltip-legend\" style=\"background: ".concat(color, ";\"></div>\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<div class=\"tooltip-value\">").concat(value === 0 || value ? value : '', "</div>\n\t\t\t\t\t\t<div class=\"tooltip-label\">").concat(set.title ? set.title : '', "</div>\n\t\t\t\t\t</div>")
        });

        _this2.dataPointList.appendChild(li);
      });
    }
  }, {
    key: "calcPosition",
    value: function calcPosition() {
      var width = this.container.offsetWidth;
      this.top = this.y - this.container.offsetHeight - TOOLTIP_POINTER_TRIANGLE_HEIGHT;
      this.left = this.x - width / 2;
      var maxLeft = this.parent.offsetWidth - width;
      var pointer = this.container.querySelector('.svg-pointer');

      if (this.left < 0) {
        pointer.style.left = "calc(50% - ".concat(-1 * this.left, "px)");
        this.left = 0;
      } else if (this.left > maxLeft) {
        var delta = this.left - maxLeft;
        var pointerOffset = "calc(50% + ".concat(delta, "px)");
        pointer.style.left = pointerOffset;
        this.left = maxLeft;
      } else {
        pointer.style.left = "50%";
      }
    }
  }, {
    key: "setValues",
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
    key: "hideTip",
    value: function hideTip() {
      this.container.style.top = '0px';
      this.container.style.left = '0px';
      this.container.style.opacity = '0';
    }
  }, {
    key: "showTip",
    value: function showTip() {
      this.container.style.top = this.top + 'px';
      this.container.style.left = this.left + 'px';
      this.container.style.opacity = '1';
    }
  }]);

  return SvgTip;
}();

/**
 * Returns the value of a number upto 2 decimal places.
 * @param {Number} d Any number
 */

function floatTwo(d) {
  return parseFloat(d.toFixed(2));
}
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
function getPositionByAngle(angle, radius) {
  return {
    x: Math.sin(angle * ANGLE_RATIO) * radius,
    y: Math.cos(angle * ANGLE_RATIO) * radius
  };
}
/**
 * Check if a number is valid for svg attributes
 * @param {object} candidate Candidate to test
 * @param {Boolean} nonNegative flag to treat negative number as invalid
 */

function isValidNumber(candidate) {
  var nonNegative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (Number.isNaN(candidate)) return false;else if (candidate === undefined) return false;else if (!Number.isFinite(candidate)) return false;else if (nonNegative && candidate < 0) return false;else return true;
}

function getBarHeightAndYAttr(yTop, zeroLine) {
  var height, y;

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
function truncateString(txt, len) {
  if (!txt) {
    return;
  }

  if (txt.length > len) {
    return txt.slice(0, len - 3) + '...';
  } else {
    return txt;
  }
}
function shortenLargeNumber(label) {
  var number;
  if (typeof label === 'number') number = label;else if (typeof label === 'string') {
    number = Number(label);
    if (Number.isNaN(number)) return label;
  } // Using absolute since log wont work for negative numbers

  var p = Math.floor(Math.log10(Math.abs(number)));
  if (p <= 2) return number; // Return as is for a 3 digit number of less

  var l = Math.floor(p / 3);
  var shortened = Math.pow(10, p - l * 3) * +(number / Math.pow(10, p)).toFixed(1); // Correct for floating point error upto 2 decimal places

  return Math.round(shortened * 100) / 100 + ' ' + ['', 'K', 'M', 'B', 'T'][l];
} // cubic bezier curve calculation (from example by François Romain)

function getSplineCurvePointsStr(xList, yList) {
  var points = [];

  for (var i = 0; i < xList.length; i++) {
    points.push([xList[i], yList[i]]);
  }

  var smoothing = 0.2;

  var line = function line(pointA, pointB) {
    var lengthX = pointB[0] - pointA[0];
    var lengthY = pointB[1] - pointA[1];
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  };

  var controlPoint = function controlPoint(current, previous, next, reverse) {
    var p = previous || current;
    var n = next || current;
    var o = line(p, n);
    var angle = o.angle + (reverse ? Math.PI : 0);
    var length = o.length * smoothing;
    var x = current[0] + Math.cos(angle) * length;
    var y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  var bezierCommand = function bezierCommand(point, i, a) {
    var cps = controlPoint(a[i - 1], a[i - 2], point);
    var cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return "C ".concat(cps[0], ",").concat(cps[1], " ").concat(cpe[0], ",").concat(cpe[1], " ").concat(point[0], ",").concat(point[1]);
  };

  var pointStr = function pointStr(points, command) {
    return points.reduce(function (acc, point, i, a) {
      return i === 0 ? "".concat(point[0], ",").concat(point[1]) : "".concat(acc, " ").concat(command(point, i, a));
    }, '');
  };

  return pointStr(points, bezierCommand);
}

var PRESET_COLOR_MAP = {
  'pink': '#F683AE',
  'blue': '#318AD8',
  'green': '#48BB74',
  'grey': '#A6B1B9',
  'red': '#F56B6B',
  'yellow': '#FACF7A',
  'purple': '#44427B',
  'teal': '#5FD8C4',
  'cyan': '#15CCEF',
  'orange': '#F8814F',
  'light-pink': '#FED7E5',
  'light-blue': '#BFDDF7',
  'light-green': '#48BB74',
  'light-grey': '#F4F5F6',
  'light-red': '#F6DFDF',
  'light-yellow': '#FEE9BF',
  'light-purple': '#E8E8F7',
  'light-teal': '#D3FDF6',
  'light-cyan': '#DDF8FD',
  'light-orange': '#FECDB8'
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
  // https://stackoverflow.com/a/32685393
  var HEX_RE = /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i;
  var RGB_RE = /(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;
  return HEX_RE.test(string) || RGB_RE.test(string);
}
var getColor = function getColor(color) {
  return PRESET_COLOR_MAP[color] || color;
};

var AXIS_TICK_LENGTH = 6;
var LABEL_MARGIN = 4;
var LABEL_MAX_CHARS = 15;
var FONT_SIZE = 10;
var BASE_LINE_COLOR = '#E2E6E9';
var FONT_FILL = '#313B44';

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
      if (_typeof(val) === "object") {
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
    'style': "stop-color: ".concat(color),
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
  var strokeWidth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;
  return createSVG('path', {
    className: className,
    d: pathStr,
    styles: {
      stroke: stroke,
      fill: fill,
      'stroke-width': strokeWidth
    }
  });
}
function makeArcPathStr(startPosition, endPosition, center, radius) {
  var clockWise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var largeArc = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var arcStartX = center.x + startPosition.x,
      arcStartY = center.y + startPosition.y;
  var arcEndX = center.x + endPosition.x,
      arcEndY = center.y + endPosition.y;
  return "M".concat(center.x, " ").concat(center.y, "\n\t\tL").concat(arcStartX, " ").concat(arcStartY, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(arcEndY, " z");
}
function makeCircleStr(startPosition, endPosition, center, radius) {
  var clockWise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var largeArc = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var arcStartX = center.x + startPosition.x,
      arcStartY = center.y + startPosition.y;
  var arcEndX = center.x + endPosition.x,
      midArc = center.y * 2,
      arcEndY = center.y + endPosition.y;
  return "M".concat(center.x, " ").concat(center.y, "\n\t\tL").concat(arcStartX, " ").concat(arcStartY, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(midArc, " z\n\t\tL").concat(arcStartX, " ").concat(midArc, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(arcEndY, " z");
}
function makeArcStrokePathStr(startPosition, endPosition, center, radius) {
  var clockWise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var largeArc = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var arcStartX = center.x + startPosition.x,
      arcStartY = center.y + startPosition.y;
  var arcEndX = center.x + endPosition.x,
      arcEndY = center.y + endPosition.y;
  return "M".concat(arcStartX, " ").concat(arcStartY, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(arcEndY);
}
function makeStrokeCircleStr(startPosition, endPosition, center, radius) {
  var clockWise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var largeArc = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var arcStartX = center.x + startPosition.x,
      arcStartY = center.y + startPosition.y;
  var arcEndX = center.x + endPosition.x,
      midArc = radius * 2 + arcStartY,
      arcEndY = center.y + startPosition.y;
  return "M".concat(arcStartX, " ").concat(arcStartY, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(midArc, "\n\t\tM").concat(arcStartX, " ").concat(midArc, "\n\t\tA ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc, " ").concat(clockWise ? 1 : 0, "\n\t\t").concat(arcEndX, " ").concat(arcEndY);
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
      'stroke-dasharray': "0, ".concat(height + width, ", ").concat(width, ", ").concat(height),
      'stroke-width': depth
    }
  };
  return createSVG("rect", args);
}
function heatSquare(className, x, y, size, radius) {
  var fill = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'none';
  var data = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
  var args = {
    className: className,
    x: x,
    y: y,
    width: size,
    height: size,
    rx: radius,
    fill: fill
  };
  Object.keys(data).map(function (key) {
    args[key] = data[key];
  });
  return createSVG("rect", args);
}
function legendBar(x, y, size) {
  var fill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
  var label = arguments.length > 4 ? arguments[4] : undefined;
  var truncate = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  label = truncate ? truncateString(label, LABEL_MAX_CHARS) : label;
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
    transform: "translate(".concat(x, ", ").concat(y, ")")
  });
  group.appendChild(createSVG("rect", args));
  group.appendChild(text);
  return group;
}
function legendDot(x, y, size) {
  var fill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
  var label = arguments.length > 4 ? arguments[4] : undefined;
  var truncate = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  label = truncate ? truncateString(label, LABEL_MAX_CHARS) : label;
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
    transform: "translate(".concat(x, ", ").concat(y, ")")
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
    transform: "translate(".concat(x, ", 0)")
  });
  line.appendChild(l);
  line.appendChild(text);
  return line;
}

function makeHoriLine(y, label, x1, x2) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  if (!options.stroke) options.stroke = BASE_LINE_COLOR;
  if (!options.lineType) options.lineType = '';
  if (options.shortenNumbers) label = shortenLargeNumber(label);
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
    transform: "translate(0, ".concat(y, ")"),
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
  if (!isValidNumber(y)) y = 0;
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
  } // let offset = options.pos === 'left' ? -1 * options.offset : options.offset;


  x1 += options.offset;
  x2 += options.offset;
  return makeHoriLine(y, label, x1, x2, {
    stroke: options.stroke,
    className: options.className,
    lineType: options.lineType,
    shortenNumbers: options.shortenNumbers
  });
}
function xLine(x, label, height) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if (!isValidNumber(x)) x = 0;
  if (!options.pos) options.pos = 'bottom';
  if (!options.offset) options.offset = 0;
  if (!options.mode) options.mode = 'span';
  if (!options.stroke) options.stroke = BASE_LINE_COLOR;
  if (!options.className) options.className = ''; // Draw X axis line in span/tick mode with optional label
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
    className: "bar mini",
    // remove class
    styles: {
      fill: "rgba(228, 234, 239, 0.49)",
      stroke: BASE_LINE_COLOR,
      'stroke-dasharray': "".concat(width, ", ").concat(height)
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
    transform: "translate(0, ".concat(y2, ")")
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
  } // Preprocess numbers to avoid svg building errors


  if (!isValidNumber(x)) x = 0;
  if (!isValidNumber(y)) y = 0;
  if (!isValidNumber(height, true)) height = 0;
  if (!isValidNumber(width, true)) width = 0;
  var rect = createSVG('rect', {
    className: "bar mini",
    style: "fill: ".concat(color),
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
      transform: "translate(".concat(x, ", ").concat(y, ")")
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
    style: "fill: ".concat(color),
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
      transform: "translate(".concat(x, ", ").concat(y, ")")
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
  var pointsStr = pointsList.join("L"); // Spline

  if (options.spline) pointsStr = getSplineCurvePointsStr(xList, yList);
  var path = makePath("M" + pointsStr, 'line-graph-path', color); // HeatLine

  if (options.heatline) {
    var gradient_id = makeGradient(meta.svgDefs, color);
    path.style.stroke = "url(#".concat(gradient_id, ")");
  }

  var paths = {
    path: path
  }; // Region

  if (options.regionFill) {
    var gradient_id_region = makeGradient(meta.svgDefs, color, true);
    var pathStr = "M" + "".concat(xList[0], ",").concat(meta.zeroLine, "L") + pointsStr + "L".concat(xList.slice(-1)[0], ",").concat(meta.zeroLine);
    paths.region = makePath(pathStr, "region-fill", 'none', "url(#".concat(gradient_id_region, ")"));
  }

  return paths;
}
var makeOverlay = {
  'bar': function bar(unit) {
    var transformValue;

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
    var transformValue;

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
    var transformValue;

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
    var transformValue;

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
    var transformValue;

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
    var transformValue;

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

var UNIT_ANIM_DUR = 350;
var PATH_ANIM_DUR = 350;
var MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
var REPLACE_ALL_NEW_DUR = 250;
var STD_EASING = 'easein';
function translate(unit, oldCoord, newCoord, duration) {
  var old = typeof oldCoord === 'string' ? oldCoord : oldCoord.join(', ');
  return [unit, {
    transform: newCoord.join(', ')
  }, duration, STD_EASING, "translate", {
    transform: old
  }];
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
  var rectAnim = [rect, {
    height: newHeight,
    'stroke-dasharray': "".concat(width, ", ").concat(newHeight)
  }, MARKER_LINE_ANIM_DUR, STD_EASING];
  var groupAnim = translate(rectGroup, [0, oldY2], [0, newY2], MARKER_LINE_ANIM_DUR);
  return [rectAnim, groupAnim];
}
function animateBar(bar, x, yTop, width) {
  var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var meta = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  var _getBarHeightAndYAttr = getBarHeightAndYAttr(yTop, meta.zeroLine),
      _getBarHeightAndYAttr2 = _slicedToArray(_getBarHeightAndYAttr, 2),
      height = _getBarHeightAndYAttr2[0],
      y = _getBarHeightAndYAttr2[1];

  y -= offset;

  if (bar.nodeName !== 'rect') {
    var rect = bar.childNodes[0];
    var rectAnim = [rect, {
      width: width,
      height: height
    }, UNIT_ANIM_DUR, STD_EASING];
    var oldCoordStr = bar.getAttribute("transform").split("(")[1].slice(0, -1);
    var groupAnim = translate(bar, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
    return [rectAnim, groupAnim];
  } else {
    return [[bar, {
      width: width,
      height: height,
      x: x,
      y: y
    }, UNIT_ANIM_DUR, STD_EASING]];
  } // bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);

}
function animateDot(dot, x, y) {
  if (dot.nodeName !== 'circle') {
    var oldCoordStr = dot.getAttribute("transform").split("(")[1].slice(0, -1);
    var groupAnim = translate(dot, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
    return [groupAnim];
  } else {
    return [[dot, {
      cx: x,
      cy: y
    }, UNIT_ANIM_DUR, STD_EASING]];
  } // dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);

}
function animatePath(paths, newXList, newYList, zeroLine, spline) {
  var pathComponents = [];
  var pointsStr = newYList.map(function (y, i) {
    return newXList[i] + ',' + y;
  }).join("L");
  if (spline) pointsStr = getSplineCurvePointsStr(newXList, newYList);
  var animPath = [paths.path, {
    d: "M" + pointsStr
  }, PATH_ANIM_DUR, STD_EASING];
  pathComponents.push(animPath);

  if (paths.region) {
    var regStartPt = "".concat(newXList[0], ",").concat(zeroLine, "L");
    var regEndPt = "L".concat(newXList.slice(-1)[0], ", ").concat(zeroLine);
    var animRegion = [paths.region, {
      d: "M" + regStartPt + pointsStr + regEndPt
    }, PATH_ANIM_DUR, STD_EASING];
    pathComponents.push(animRegion);
  }

  return pathComponents;
}
function animatePathStr(oldPath, pathStr) {
  return [oldPath, {
    d: pathStr
  }, UNIT_ANIM_DUR, STD_EASING];
}

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
      newElement.setAttribute(attributeName, "translate(".concat(value, ")"));
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
    var animElement, newElement;
    element[0] = unit;

    var _animateSVGElement = animateSVGElement.apply(void 0, _toConsumableArray(element));

    var _animateSVGElement2 = _slicedToArray(_animateSVGElement, 2);

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
  } // Replace the new svgElement (data has already been replaced)


  setTimeout(function () {
    if (animSvgElement.parentNode == parent) {
      parent.removeChild(animSvgElement);
      parent.appendChild(svgElement);
    }
  }, REPLACE_ALL_NEW_DUR);
}

var CSSTEXT = ".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}";

function downloadFile(filename, data) {
  var a = document.createElement('a');
  a.style = "display: none";
  var blob = new Blob(data, {
    type: "image/svg+xml; charset=utf-8"
  });
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

var BaseChart = /*#__PURE__*/function () {
  function BaseChart(parent, options) {
    _classCallCheck(this, BaseChart);

    this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;

    if (!(this.parent instanceof HTMLElement)) {
      throw new Error('No `parent` element to render on was provided.');
    }

    this.rawChartArgs = options;
    this.title = options.title || '';
    this.type = options.type || '';
    this.realData = this.prepareData(options.data);
    this.data = this.prepareFirstData(this.realData);
    this.colors = this.validateColors(options.colors, this.type);
    this.config = {
      showTooltip: 1,
      // calculate
      showLegend: 1,
      // calculate
      isNavigable: options.isNavigable || 0,
      animate: typeof options.animate !== 'undefined' ? options.animate : 1,
      truncateLegends: options.truncateLegends || 1
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

  _createClass(BaseChart, [{
    key: "prepareData",
    value: function prepareData(data) {
      return data;
    }
  }, {
    key: "prepareFirstData",
    value: function prepareFirstData(data) {
      return data;
    }
  }, {
    key: "validateColors",
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
    key: "setMeasures",
    value: function setMeasures() {// Override measures, including those for title and legend
      // set config for legend and title
    }
  }, {
    key: "configure",
    value: function configure() {
      var _this = this;

      var height = this.argHeight;
      this.baseHeight = height;
      this.height = height - getExtraHeight(this.measures); // Bind window events

      this.boundDrawFn = function () {
        return _this.draw(true);
      };

      window.addEventListener('resize', this.boundDrawFn);
      window.addEventListener('orientationchange', this.boundDrawFn);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      window.removeEventListener('resize', this.boundDrawFn);
      window.removeEventListener('orientationchange', this.boundDrawFn);
    } // Has to be called manually

  }, {
    key: "setup",
    value: function setup() {
      this.makeContainer();
      this.updateWidth();
      this.makeTooltip();
      this.draw(false, true);
    }
  }, {
    key: "makeContainer",
    value: function makeContainer() {
      // Chart needs a dedicated parent element
      this.parent.innerHTML = '';
      var args = {
        inside: this.parent,
        className: 'chart-container'
      };

      if (this.independentWidth) {
        args.styles = {
          width: this.independentWidth + 'px'
        };
      }

      this.container = $.create('div', args);
    }
  }, {
    key: "makeTooltip",
    value: function makeTooltip() {
      this.tip = new SvgTip({
        parent: this.container,
        colors: this.colors
      });
      this.bindTooltip();
    }
  }, {
    key: "bindTooltip",
    value: function bindTooltip() {}
  }, {
    key: "draw",
    value: function draw() {
      var _this2 = this;

      var onlyWidthChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (onlyWidthChange && isHidden(this.parent)) {
        // Don't update anything if the chart is hidden
        return;
      }

      this.updateWidth();
      this.calc(onlyWidthChange);
      this.makeChartArea();
      this.setupComponents();
      this.components.forEach(function (c) {
        return c.setup(_this2.drawArea);
      }); // this.components.forEach(c => c.make());

      this.render(this.components, false);

      if (init) {
        this.data = this.realData;
        setTimeout(function () {
          _this2.update(_this2.data);
        }, this.initTimeout);
      }

      this.renderLegend();
      this.setupNavigation(init);
    }
  }, {
    key: "calc",
    value: function calc() {} // builds state

  }, {
    key: "updateWidth",
    value: function updateWidth() {
      this.baseWidth = getElementContentWidth(this.parent);
      this.width = this.baseWidth - getExtraWidth(this.measures);
    }
  }, {
    key: "makeChartArea",
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
      this.drawArea = makeSVGGroup(this.type + '-chart chart-draw-area', "translate(".concat(getLeftOffset(m), ", ").concat(top, ")"));

      if (this.config.showLegend) {
        top += this.height + m.paddings.bottom;
        this.legendArea = makeSVGGroup('chart-legend', "translate(".concat(getLeftOffset(m), ", ").concat(top, ")"));
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
    key: "updateTipOffset",
    value: function updateTipOffset(x, y) {
      this.tip.offset = {
        x: x,
        y: y
      };
    }
  }, {
    key: "setupComponents",
    value: function setupComponents() {
      this.components = new Map();
    }
  }, {
    key: "update",
    value: function update(data) {
      if (!data) {
        console.error('No data to update.');
      }

      this.data = this.prepareData(data);
      this.calc(); // builds state

      this.render(this.components, this.config.animate);
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.components;
      var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this.config.isNavigable) {
        // Remove all existing overlays
        this.overlays.map(function (o) {
          return o.parentNode.removeChild(o);
        }); // ref.parentNode.insertBefore(element, ref);
      }

      var elementsToAnimate = []; // Can decouple to this.refreshComponents() first to save animation timeout

      components.forEach(function (c) {
        elementsToAnimate = elementsToAnimate.concat(c.update(animate));
      });

      if (elementsToAnimate.length > 0) {
        runSMILAnimation(this.container, this.svg, elementsToAnimate);
        setTimeout(function () {
          components.forEach(function (c) {
            return c.make();
          });

          _this3.updateNav();
        }, CHART_POST_ANIMATE_TIMEOUT);
      } else {
        components.forEach(function (c) {
          return c.make();
        });
        this.updateNav();
      }
    }
  }, {
    key: "updateNav",
    value: function updateNav() {
      if (this.config.isNavigable) {
        this.makeOverlay();
        this.bindUnits();
      }
    }
  }, {
    key: "renderLegend",
    value: function renderLegend() {}
  }, {
    key: "setupNavigation",
    value: function setupNavigation() {
      var _this4 = this;

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
          if (isElementInViewport(_this4.container)) {
            e = e || window.event;

            if (_this4.keyActions[e.keyCode]) {
              _this4.keyActions[e.keyCode]();
            }
          }
        });
      }
    }
  }, {
    key: "makeOverlay",
    value: function makeOverlay() {}
  }, {
    key: "updateOverlay",
    value: function updateOverlay() {}
  }, {
    key: "bindOverlay",
    value: function bindOverlay() {}
  }, {
    key: "bindUnits",
    value: function bindUnits() {}
  }, {
    key: "onLeftArrow",
    value: function onLeftArrow() {}
  }, {
    key: "onRightArrow",
    value: function onRightArrow() {}
  }, {
    key: "onUpArrow",
    value: function onUpArrow() {}
  }, {
    key: "onDownArrow",
    value: function onDownArrow() {}
  }, {
    key: "onEnterKey",
    value: function onEnterKey() {}
  }, {
    key: "addDataPoint",
    value: function addDataPoint() {}
  }, {
    key: "removeDataPoint",
    value: function removeDataPoint() {}
  }, {
    key: "getDataPoint",
    value: function getDataPoint() {}
  }, {
    key: "setCurrentDataPoint",
    value: function setCurrentDataPoint() {}
  }, {
    key: "updateDataset",
    value: function updateDataset() {}
  }, {
    key: "export",
    value: function _export() {
      var chartSvg = prepareForExport(this.svg);
      downloadFile(this.title || 'Chart', [chartSvg]);
    }
  }]);

  return BaseChart;
}();

var AggregationChart = /*#__PURE__*/function (_BaseChart) {
  _inherits(AggregationChart, _BaseChart);

  var _super = _createSuper(AggregationChart);

  function AggregationChart(parent, args) {
    _classCallCheck(this, AggregationChart);

    return _super.call(this, parent, args);
  }

  _createClass(AggregationChart, [{
    key: "configure",
    value: function configure(args) {
      _get(_getPrototypeOf(AggregationChart.prototype), "configure", this).call(this, args);

      this.config.maxSlices = args.maxSlices || 20;
      this.config.maxLegendPoints = args.maxLegendPoints || 20;
    }
  }, {
    key: "calc",
    value: function calc() {
      var _this = this;

      var s = this.state;
      var maxSlices = this.config.maxSlices;
      s.sliceTotals = [];
      var allTotals = this.data.labels.map(function (label, i) {
        var total = 0;

        _this.data.datasets.map(function (e) {
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
    key: "renderLegend",
    value: function renderLegend() {
      var _this2 = this;

      var s = this.state;
      this.legendArea.textContent = '';
      this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);
      var count = 0;
      var y = 0;
      this.legendTotals.map(function (d, i) {
        var barWidth = 150;
        var divisor = Math.floor((_this2.width - getExtraWidth(_this2.measures)) / barWidth);

        if (_this2.legendTotals.length < divisor) {
          barWidth = _this2.width / _this2.legendTotals.length;
        }

        if (count > divisor) {
          count = 0;
          y += 20;
        }

        var x = barWidth * count + 5;
        var label = _this2.config.truncateLegends ? truncateString(s.labels[i], barWidth / 10) : s.labels[i];
        var dot = legendDot(x, y, 5, _this2.colors[i], "".concat(label, ": ").concat(d), false);

        _this2.legendArea.appendChild(dot);

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
} // mutates

function setDayToSunday(date) {
  var newDate = clone(date);
  var day = newDate.getDay();

  if (day !== 0) {
    addDays(newDate, -1 * day);
  }

  return newDate;
} // mutates

function addDays(date, numberOfDays) {
  date.setDate(date.getDate() + numberOfDays);
}

var ChartComponent = /*#__PURE__*/function () {
  function ChartComponent(_ref) {
    var _ref$layerClass = _ref.layerClass,
        layerClass = _ref$layerClass === void 0 ? '' : _ref$layerClass,
        _ref$layerTransform = _ref.layerTransform,
        layerTransform = _ref$layerTransform === void 0 ? '' : _ref$layerTransform,
        constants = _ref.constants,
        getData = _ref.getData,
        makeElements = _ref.makeElements,
        animateElements = _ref.animateElements;

    _classCallCheck(this, ChartComponent);

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

  _createClass(ChartComponent, [{
    key: "refresh",
    value: function refresh(data) {
      this.data = data || this.getData();
    }
  }, {
    key: "setup",
    value: function setup(parent) {
      this.layer = makeSVGGroup(this.layerClass, this.layerTransform, parent);
    }
  }, {
    key: "make",
    value: function make() {
      this.render(this.data);
      this.oldData = this.data;
    }
  }, {
    key: "render",
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
    key: "update",
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
  donutSlices: {
    layerClass: 'donut-slices',
    makeElements: function makeElements(data) {
      return data.sliceStrings.map(function (s, i) {
        var slice = makePath(s, 'donut-path', data.colors[i], 'none', data.strokeWidth);
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
        return yLine(position, data.labels[i], _this3.constants.width, {
          mode: _this3.constants.mode,
          pos: _this3.constants.pos,
          shortenNumbers: _this3.constants.shortenNumbers
        });
      });
    },
    animateElements: function animateElements(newData) {
      var newPos = newData.positions;
      var newLabels = newData.labels;
      var oldPos = this.oldData.positions;
      var oldLabels = this.oldData.labels;

      var _equilizeNoOfElements = equilizeNoOfElements(oldPos, newPos);

      var _equilizeNoOfElements2 = _slicedToArray(_equilizeNoOfElements, 2);

      oldPos = _equilizeNoOfElements2[0];
      newPos = _equilizeNoOfElements2[1];

      var _equilizeNoOfElements3 = equilizeNoOfElements(oldLabels, newLabels);

      var _equilizeNoOfElements4 = _slicedToArray(_equilizeNoOfElements3, 2);

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
        return xLine(position, data.calcLabels[i], _this4.constants.height, {
          mode: _this4.constants.mode,
          pos: _this4.constants.pos
        });
      });
    },
    animateElements: function animateElements(newData) {
      var newPos = newData.positions;
      var newLabels = newData.calcLabels;
      var oldPos = this.oldData.positions;
      var oldLabels = this.oldData.calcLabels;

      var _equilizeNoOfElements5 = equilizeNoOfElements(oldPos, newPos);

      var _equilizeNoOfElements6 = _slicedToArray(_equilizeNoOfElements5, 2);

      oldPos = _equilizeNoOfElements6[0];
      newPos = _equilizeNoOfElements6[1];

      var _equilizeNoOfElements7 = equilizeNoOfElements(oldLabels, newLabels);

      var _equilizeNoOfElements8 = _slicedToArray(_equilizeNoOfElements7, 2);

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
        return yMarker(m.position, m.label, _this5.constants.width, {
          labelPos: m.options.labelPos,
          mode: 'span',
          lineType: 'dashed'
        });
      });
    },
    animateElements: function animateElements(newData) {
      var _equilizeNoOfElements9 = equilizeNoOfElements(this.oldData, newData);

      var _equilizeNoOfElements10 = _slicedToArray(_equilizeNoOfElements9, 2);

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
        return yRegion(r.startPos, r.endPos, _this6.constants.width, r.label, {
          labelPos: r.options.labelPos
        });
      });
    },
    animateElements: function animateElements(newData) {
      var _equilizeNoOfElements11 = equilizeNoOfElements(this.oldData, newData);

      var _equilizeNoOfElements12 = _slicedToArray(_equilizeNoOfElements11, 2);

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

      var _this$constants = this.constants,
          index = _this$constants.index,
          colWidth = _this$constants.colWidth,
          rowHeight = _this$constants.rowHeight,
          squareSize = _this$constants.squareSize,
          radius = _this$constants.radius,
          xTranslate = _this$constants.xTranslate;
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
            var square = heatSquare('day', x, y, squareSize, radius, day.fill, _data);

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

      var _equilizeNoOfElements14 = _slicedToArray(_equilizeNoOfElements13, 2);

      oldXPos = _equilizeNoOfElements14[0];
      newXPos = _equilizeNoOfElements14[1];

      var _equilizeNoOfElements15 = equilizeNoOfElements(oldYPos, newYPos);

      var _equilizeNoOfElements16 = _slicedToArray(_equilizeNoOfElements15, 2);

      oldYPos = _equilizeNoOfElements16[0];
      newYPos = _equilizeNoOfElements16[1];

      var _equilizeNoOfElements17 = equilizeNoOfElements(oldOffsets, newOffsets);

      var _equilizeNoOfElements18 = _slicedToArray(_equilizeNoOfElements17, 2);

      oldOffsets = _equilizeNoOfElements18[0];
      newOffsets = _equilizeNoOfElements18[1];

      var _equilizeNoOfElements19 = equilizeNoOfElements(oldLabels, newLabels);

      var _equilizeNoOfElements20 = _slicedToArray(_equilizeNoOfElements19, 2);

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
        animateElements = animateElements.concat(animateBar(bar, newXPos[i], newYPos[i], newData.barWidth, newOffsets[i], {
          zeroLine: newData.zeroLine
        }));
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
          regionFill: c.regionFill,
          spline: c.spline
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

      var _equilizeNoOfElements22 = _slicedToArray(_equilizeNoOfElements21, 2);

      oldXPos = _equilizeNoOfElements22[0];
      newXPos = _equilizeNoOfElements22[1];

      var _equilizeNoOfElements23 = equilizeNoOfElements(oldYPos, newYPos);

      var _equilizeNoOfElements24 = _slicedToArray(_equilizeNoOfElements23, 2);

      oldYPos = _equilizeNoOfElements24[0];
      newYPos = _equilizeNoOfElements24[1];

      var _equilizeNoOfElements25 = equilizeNoOfElements(oldValues, newValues);

      var _equilizeNoOfElements26 = _slicedToArray(_equilizeNoOfElements25, 2);

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
        animateElements = animateElements.concat(animatePath(this.paths, newXPos, newYPos, newData.zeroLine, this.constants.spline));
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

var PercentageChart = /*#__PURE__*/function (_AggregationChart) {
  _inherits(PercentageChart, _AggregationChart);

  var _super = _createSuper(PercentageChart);

  function PercentageChart(parent, args) {
    var _this;

    _classCallCheck(this, PercentageChart);

    _this = _super.call(this, parent, args);
    _this.type = 'percentage';

    _this.setup();

    return _this;
  }

  _createClass(PercentageChart, [{
    key: "setMeasures",
    value: function setMeasures(options) {
      var m = this.measures;
      this.barOptions = options.barOptions || {};
      var b = this.barOptions;
      b.height = b.height || PERCENTAGE_BAR_DEFAULT_HEIGHT;
      b.depth = b.depth || PERCENTAGE_BAR_DEFAULT_DEPTH;
      m.paddings.right = 30;
      m.legendHeight = 60;
      m.baseHeight = (b.height + b.depth * 0.5) * 8;
    }
  }, {
    key: "setupComponents",
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
        var component = getComponent.apply(void 0, _toConsumableArray(args));
        return [args[0], component];
      }));
    }
  }, {
    key: "calc",
    value: function calc() {
      var _this2 = this;

      _get(_getPrototypeOf(PercentageChart.prototype), "calc", this).call(this);

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
    key: "makeDataByIndex",
    value: function makeDataByIndex() {}
  }, {
    key: "bindTooltip",
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

          _this3.tip.setValues(x, y, {
            name: title,
            value: (fraction * 100).toFixed(1) + "%"
          });

          _this3.tip.showTip();
        }
      });
    }
  }]);

  return PercentageChart;
}(AggregationChart);

var PieChart = /*#__PURE__*/function (_AggregationChart) {
  _inherits(PieChart, _AggregationChart);

  var _super = _createSuper(PieChart);

  function PieChart(parent, args) {
    var _this;

    _classCallCheck(this, PieChart);

    _this = _super.call(this, parent, args);
    _this.type = 'pie';
    _this.initTimeout = 0;
    _this.init = 1;

    _this.setup();

    return _this;
  }

  _createClass(PieChart, [{
    key: "configure",
    value: function configure(args) {
      _get(_getPrototypeOf(PieChart.prototype), "configure", this).call(this, args);

      this.mouseMove = this.mouseMove.bind(this);
      this.mouseLeave = this.mouseLeave.bind(this);
      this.hoverRadio = args.hoverRadio || 0.1;
      this.config.startAngle = args.startAngle || 0;
      this.clockWise = args.clockWise || false;
    }
  }, {
    key: "calc",
    value: function calc() {
      var _this2 = this;

      _get(_getPrototypeOf(PieChart.prototype), "calc", this).call(this);

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
        var largeArc = originDiffAngle > 180 ? 1 : 0;
        var diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
        var endAngle = curAngle = curAngle + diffAngle;
        var startPosition = getPositionByAngle(startAngle, radius);
        var endPosition = getPositionByAngle(endAngle, radius);
        var prevProperty = _this2.init && prevSlicesProperties[i];
        var curStart, curEnd;

        if (_this2.init) {
          curStart = prevProperty ? prevProperty.startPosition : startPosition;
          curEnd = prevProperty ? prevProperty.endPosition : startPosition;
        } else {
          curStart = startPosition;
          curEnd = endPosition;
        }

        var curPath = originDiffAngle === 360 ? makeCircleStr(curStart, curEnd, _this2.center, _this2.radius, clockWise, largeArc) : makeArcPathStr(curStart, curEnd, _this2.center, _this2.radius, clockWise, largeArc);
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
    key: "setupComponents",
    value: function setupComponents() {
      var s = this.state;
      var componentConfigs = [['pieSlices', {}, function () {
        return {
          sliceStrings: s.sliceStrings,
          colors: this.colors
        };
      }.bind(this)]];
      this.components = new Map(componentConfigs.map(function (args) {
        var component = getComponent.apply(void 0, _toConsumableArray(args));
        return [args[0], component];
      }));
    }
  }, {
    key: "calTranslateByAngle",
    value: function calTranslateByAngle(property) {
      var radius = this.radius,
          hoverRadio = this.hoverRadio;
      var position = getPositionByAngle(property.startAngle + property.angle / 2, radius);
      return "translate3d(".concat(position.x * hoverRadio, "px,").concat(position.y * hoverRadio, "px,0)");
    }
  }, {
    key: "hoverSlice",
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
        this.tip.setValues(x, y, {
          name: title,
          value: percent + "%"
        });
        this.tip.showTip();
      } else {
        transform(path, 'translate3d(0,0,0)');
        this.tip.hideTip();
        path.style.fill = color;
      }
    }
  }, {
    key: "bindTooltip",
    value: function bindTooltip() {
      this.container.addEventListener('mousemove', this.mouseMove);
      this.container.addEventListener('mouseleave', this.mouseLeave);
    }
  }, {
    key: "mouseMove",
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
    key: "mouseLeave",
    value: function mouseLeave() {
      this.hoverSlice(this.curActiveSlice, this.curActiveSliceIndex, false);
    }
  }]);

  return PieChart;
}(AggregationChart);

function normalize(x) {
  // Calculates mantissa and exponent of a number
  // Returns normalized number and exponent
  // https://stackoverflow.com/q/9383593/6495043
  if (x === 0) {
    return [0, 0];
  }

  if (isNaN(x)) {
    return {
      mantissa: -6755399441055744,
      exponent: 972
    };
  }

  var sig = x > 0 ? 1 : -1;

  if (!isFinite(x)) {
    return {
      mantissa: sig * 4503599627370496,
      exponent: 972
    };
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
  var partSize = 1; // To avoid too many partitions

  if (range > 5) {
    if (range % 2 !== 0) {
      upperBound++; // Recalc range

      range = upperBound - lowerBound;
    }

    noOfParts = range / 2;
    partSize = 2;
  } // Special case: 1 and 2


  if (range <= 2) {
    noOfParts = 4;
    partSize = range / noOfParts;
  } // Special case: 0


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
      _normalize2 = _slicedToArray(_normalize, 2),
      normalMaxValue = _normalize2[0],
      exponent = _normalize2[1];

  var normalMinValue = minValue ? minValue / Math.pow(10, exponent) : 0; // Allow only 7 significant digits

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
  var maxValue = Math.max.apply(Math, _toConsumableArray(values));
  var minValue = Math.min.apply(Math, _toConsumableArray(values)); // Exponent to be used for pretty print

  var exponent = 0,
      intervals = []; // eslint-disable-line no-unused-vars

  function getPositiveFirstIntervals(maxValue, absMinValue) {
    var intervals = getChartIntervals(maxValue);
    var intervalSize = intervals[1] - intervals[0]; // Then unshift the negative values

    var value = 0;

    for (var i = 1; value < absMinValue; i++) {
      value += intervalSize;
      intervals.unshift(-1 * value);
    }

    return intervals;
  } // CASE I: Both non-negative


  if (maxValue >= 0 && minValue >= 0) {
    exponent = normalize(maxValue)[1];

    if (!withMinimum) {
      intervals = getChartIntervals(maxValue);
    } else {
      intervals = getChartIntervals(maxValue, minValue);
    }
  } // CASE II: Only minValue negative
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
    } // CASE III: Both non-positive
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
  var zeroIndex;
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
  }, []);
  return index ? arr.indexOf(closest) : closest;
}
function calcDistribution(values, distributionSize) {
  // Assume non-negative values,
  // implying distribution minimum at zero
  var dataMaxValue = Math.max.apply(Math, _toConsumableArray(values));
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

var COL_WIDTH = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;
var ROW_HEIGHT = COL_WIDTH; // const DAY_INCR = 1;

var Heatmap = /*#__PURE__*/function (_BaseChart) {
  _inherits(Heatmap, _BaseChart);

  var _super = _createSuper(Heatmap);

  function Heatmap(parent, options) {
    var _this;

    _classCallCheck(this, Heatmap);

    _this = _super.call(this, parent, options);
    _this.type = 'heatmap';
    _this.countLabel = options.countLabel || '';
    var validStarts = ['Sunday', 'Monday'];
    var startSubDomain = validStarts.includes(options.startSubDomain) ? options.startSubDomain : 'Sunday';
    _this.startSubDomainIndex = validStarts.indexOf(startSubDomain);

    _this.setup();

    return _this;
  }

  _createClass(Heatmap, [{
    key: "setMeasures",
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
    key: "updateWidth",
    value: function updateWidth() {
      var spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
      var noOfWeeks = this.state.noOfWeeks ? this.state.noOfWeeks : 52;
      this.baseWidth = (noOfWeeks + spacing) * COL_WIDTH + getExtraWidth(this.measures);
    }
  }, {
    key: "prepareData",
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
        Object.keys(data.dataPoints).forEach(function (timestampSec) {
          var date = new Date(timestampSec * NO_OF_MILLIS);
          points[getYyyyMmDd(date)] = data.dataPoints[timestampSec];
        });
        data.dataPoints = points;
      }

      return data;
    }
  }, {
    key: "calc",
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
    key: "setupComponents",
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
          radius: _this2.rawChartArgs.radius || 0,
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
        var component = getComponent.apply(void 0, _toConsumableArray(args));
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
    key: "update",
    value: function update(data) {
      if (!data) {
        console.error('No data to update.');
      }

      this.data = this.prepareData(data);
      this.draw();
      this.bindTooltip();
    }
  }, {
    key: "bindTooltip",
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

            _this3.tip.setValues(x, y, {
              name: name,
              value: value,
              valueFirst: 1
            }, []);

            _this3.tip.showTip();
          }
        });
      });
    }
  }, {
    key: "renderLegend",
    value: function renderLegend() {
      var _this4 = this;

      this.legendArea.textContent = '';
      var x = 0;
      var y = ROW_HEIGHT;
      var radius = this.rawChartArgs.radius || 0;
      var lessText = makeText('subdomain-name', x, y, 'Less', {
        fontSize: HEATMAP_SQUARE_SIZE + 1,
        dy: 9
      });
      x = COL_WIDTH * 2 + COL_WIDTH / 2;
      this.legendArea.appendChild(lessText);
      this.colors.slice(0, HEATMAP_DISTRIBUTION_SIZE).map(function (color, i) {
        var square = heatSquare('heatmap-legend-unit', x + (COL_WIDTH + 3) * i, y, HEATMAP_SQUARE_SIZE, radius, color);

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
    key: "getDomains",
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
    key: "getDomainConfig",
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
          col;

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
    key: "getCol",
    value: function getCol(startDate, month) {
      var empty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var s = this.state; // startDate is the start of week

      var currentDate = clone(startDate);
      var col = [];

      for (var i = 0; i < NO_OF_DAYS_IN_WEEK; i++, addDays(currentDate, 1)) {
        var config = {}; // Non-generic adjustment for entire heatmap, needs state

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
    key: "getSubDomainConfig",
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
  var datasetLength = data.labels.length; // Datasets

  var datasets = data.datasets;
  var zeroArray = new Array(datasetLength).fill(0);

  if (!datasets) {
    // default
    datasets = [{
      values: zeroArray
    }];
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
      }); // Trim or extend

      if (vals.length > datasetLength) {
        vals = vals.slice(0, datasetLength);
      } else {
        vals = fillArray(vals, datasetLength - vals.length, 0);
      }
    } // Set labels
    //
    // Set type


    if (!d.chartType) {
      d.chartType = type;
    }
  }); // Markers
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
  var seriesMultiple;

  if (isSeries) {
    // Find the maximum label length for spacing calculations
    var maxLabelLength = Math.max.apply(Math, _toConsumableArray(labels.map(function (label) {
      return label.length;
    })));
    seriesMultiple = Math.ceil(maxLabelLength / allowedLetters);
  }

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
        if (i % seriesMultiple !== 0) {
          label = "";
        }
      }
    }

    return label;
  });
  return calcLabels;
}

var AxisChart = /*#__PURE__*/function (_BaseChart) {
  _inherits(AxisChart, _BaseChart);

  var _super = _createSuper(AxisChart);

  function AxisChart(parent, args) {
    var _this;

    _classCallCheck(this, AxisChart);

    _this = _super.call(this, parent, args);
    _this.barOptions = args.barOptions || {};
    _this.lineOptions = args.lineOptions || {};
    _this.type = args.type || 'line';
    _this.init = 1;

    _this.setup();

    return _this;
  }

  _createClass(AxisChart, [{
    key: "setMeasures",
    value: function setMeasures() {
      if (this.data.datasets.length <= 1) {
        this.config.showLegend = 0;
        this.measures.paddings.bottom = 30;
      }
    }
  }, {
    key: "configure",
    value: function configure(options) {
      _get(_getPrototypeOf(AxisChart.prototype), "configure", this).call(this, options);

      options.axisOptions = options.axisOptions || {};
      options.tooltipOptions = options.tooltipOptions || {};
      this.config.xAxisMode = options.axisOptions.xAxisMode || 'span';
      this.config.yAxisMode = options.axisOptions.yAxisMode || 'span';
      this.config.xIsSeries = options.axisOptions.xIsSeries || 0;
      this.config.shortenYAxisNumbers = options.axisOptions.shortenYAxisNumbers || 0;
      this.config.formatTooltipX = options.tooltipOptions.formatTooltipX;
      this.config.formatTooltipY = options.tooltipOptions.formatTooltipY;
      this.config.valuesOverPoints = options.valuesOverPoints;
    }
  }, {
    key: "prepareData",
    value: function prepareData() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;
      return dataPrep(data, this.type);
    }
  }, {
    key: "prepareFirstData",
    value: function prepareFirstData() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;
      return zeroDataPrep(data);
    }
  }, {
    key: "calc",
    value: function calc() {
      var onlyWidthChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.calcXPositions();

      if (!onlyWidthChange) {
        this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
      }

      this.makeDataByIndex();
    }
  }, {
    key: "calcXPositions",
    value: function calcXPositions() {
      var s = this.state;
      var labels = this.data.labels;
      s.datasetLength = labels.length;
      s.unitWidth = this.width / s.datasetLength; // Default, as per bar, and mixed. Only line will be a special case

      s.xOffset = s.unitWidth / 2; // // For a pure Line Chart
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
    key: "calcYAxisParameters",
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
      }; // Dependent if above changes

      this.calcDatasetPoints();
      this.calcYExtremes();
      this.calcYRegions();
    }
  }, {
    key: "calcDatasetPoints",
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
    key: "calcYExtremes",
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
    key: "calcYRegions",
    value: function calcYRegions() {
      var s = this.state;

      if (this.data.yMarkers) {
        this.state.yMarkers = this.data.yMarkers.map(function (d) {
          d.position = scale(d.value, s.yAxis);
          if (!d.options) d.options = {}; // if(!d.label.includes(':')) {
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
    key: "getAllYValues",
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

      return (_ref = []).concat.apply(_ref, _toConsumableArray(allValueLists));
    }
  }, {
    key: "setupComponents",
    value: function setupComponents() {
      var _this3 = this;

      var componentConfigs = [['yAxis', {
        mode: this.config.yAxisMode,
        width: this.width,
        shortenNumbers: this.config.shortenYAxisNumbers // pos: 'right'

      }, function () {
        return this.state.yAxis;
      }.bind(this)], ['xAxis', {
        mode: this.config.xAxisMode,
        height: this.height // pos: 'right'

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
          var barsWidth = s.unitWidth * (1 - spaceRatio);
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
          regionFill: _this3.lineOptions.regionFill,
          spline: _this3.lineOptions.spline,
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
        var component = getComponent.apply(void 0, _toConsumableArray(args));

        if (args[0].includes('lineGraph') || args[0].includes('barGraph')) {
          _this3.dataUnitComponents.push(component);
        }

        return [args[0], component];
      }));
    }
  }, {
    key: "makeDataByIndex",
    value: function makeDataByIndex() {
      var _this4 = this;

      this.dataByIndex = {};
      var s = this.state;
      var formatX = this.config.formatTooltipX;
      var formatY = this.config.formatTooltipY;
      var titles = s.xAxis.labels;
      titles.map(function (label, index) {
        var values = _this4.state.datasets.map(function (set, i) {
          var value = set.values[index];
          return {
            title: set.name,
            value: value,
            yPos: set.yPositions[index],
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
    key: "bindTooltip",
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
    key: "mapTooltipXPosition",
    value: function mapTooltipXPosition(relX) {
      var s = this.state;
      if (!s.yExtremes) return;
      var index = getClosestInArray(relX, s.xAxis.positions, true);

      if (index >= 0) {
        var dbi = this.dataByIndex[index];
        this.tip.setValues(dbi.xPos + this.tip.offset.x, dbi.yExtreme + this.tip.offset.y, {
          name: dbi.formattedLabel,
          value: ''
        }, dbi.values, index);
        this.tip.showTip();
      }
    }
  }, {
    key: "renderLegend",
    value: function renderLegend() {
      var _this6 = this;

      var s = this.data;

      if (s.datasets.length > 1) {
        this.legendArea.textContent = '';
        s.datasets.map(function (d, i) {
          var barWidth = AXIS_LEGEND_BAR_SIZE; // let rightEndPoint = this.baseWidth - this.measures.margins.left - this.measures.margins.right;
          // let multiplier = s.datasets.length - i;

          var rect = legendBar( // rightEndPoint - multiplier * barWidth,	// To right align
          barWidth * i, '0', barWidth, _this6.colors[i], d.name, _this6.config.truncateLegends);

          _this6.legendArea.appendChild(rect);
        });
      }
    } // Overlay

  }, {
    key: "makeOverlay",
    value: function makeOverlay$1() {
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
      } // Render overlays


      this.overlayGuides.map(function (d) {
        var currentUnit = d.units[_this7.state.currentIndex];
        d.overlay = makeOverlay[d.type](currentUnit);

        _this7.drawArea.appendChild(d.overlay);
      });
    }
  }, {
    key: "updateOverlayGuides",
    value: function updateOverlayGuides() {
      if (this.overlayGuides) {
        this.overlayGuides.forEach(function (g) {
          var o = g.overlay;
          o.parentNode.removeChild(o);
        });
      }
    }
  }, {
    key: "bindOverlay",
    value: function bindOverlay() {
      var _this8 = this;

      this.parent.addEventListener('data-select', function () {
        _this8.updateOverlay();
      });
    }
  }, {
    key: "bindUnits",
    value: function bindUnits() {
      var _this9 = this;

      this.dataUnitComponents.map(function (c) {
        c.units.map(function (unit) {
          unit.addEventListener('click', function () {
            var index = unit.getAttribute('data-point-index');

            _this9.setCurrentDataPoint(index);
          });
        });
      }); // Note: Doesn't work as tooltip is absolutely positioned

      this.tip.container.addEventListener('click', function () {
        var index = _this9.tip.container.getAttribute('data-point-index');

        _this9.setCurrentDataPoint(index);
      });
    }
  }, {
    key: "updateOverlay",
    value: function updateOverlay$1() {
      var _this10 = this;

      this.overlayGuides.map(function (d) {
        var currentUnit = d.units[_this10.state.currentIndex];

        updateOverlay[d.type](currentUnit, d.overlay);
      });
    }
  }, {
    key: "onLeftArrow",
    value: function onLeftArrow() {
      this.setCurrentDataPoint(this.state.currentIndex - 1);
    }
  }, {
    key: "onRightArrow",
    value: function onRightArrow() {
      this.setCurrentDataPoint(this.state.currentIndex + 1);
    }
  }, {
    key: "getDataPoint",
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
    key: "setCurrentDataPoint",
    value: function setCurrentDataPoint(index) {
      var s = this.state;
      index = parseInt(index);
      if (index < 0) index = 0;
      if (index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
      if (index === s.currentIndex) return;
      s.currentIndex = index;
      fire(this.parent, "data-select", this.getDataPoint());
    } // API

  }, {
    key: "addDataPoint",
    value: function addDataPoint(label, datasetValues) {
      var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.state.datasetLength;

      _get(_getPrototypeOf(AxisChart.prototype), "addDataPoint", this).call(this, label, datasetValues, index);

      this.data.labels.splice(index, 0, label);
      this.data.datasets.map(function (d, i) {
        d.values.splice(index, 0, datasetValues[i]);
      });
      this.update(this.data);
    }
  }, {
    key: "removeDataPoint",
    value: function removeDataPoint() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.datasetLength - 1;

      if (this.data.labels.length <= 1) {
        return;
      }

      _get(_getPrototypeOf(AxisChart.prototype), "removeDataPoint", this).call(this, index);

      this.data.labels.splice(index, 1);
      this.data.datasets.map(function (d) {
        d.values.splice(index, 1);
      });
      this.update(this.data);
    }
  }, {
    key: "updateDataset",
    value: function updateDataset(datasetValues) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      this.data.datasets[index].values = datasetValues;
      this.update(this.data);
    } // addDataset(dataset, index) {}
    // removeDataset(index = 0) {}

  }, {
    key: "updateDatasets",
    value: function updateDatasets(datasets) {
      this.data.datasets.map(function (d, i) {
        if (datasets[i]) {
          d.values = datasets[i];
        }
      });
      this.update(this.data);
    } // updateDataPoint(dataPoint, index = 0) {}
    // addDataPoint(dataPoint, index = 0) {}
    // removeDataPoint(index = 0) {}

  }]);

  return AxisChart;
}(BaseChart);

var DonutChart = /*#__PURE__*/function (_AggregationChart) {
  _inherits(DonutChart, _AggregationChart);

  var _super = _createSuper(DonutChart);

  function DonutChart(parent, args) {
    var _this;

    _classCallCheck(this, DonutChart);

    _this = _super.call(this, parent, args);
    _this.type = 'donut';
    _this.initTimeout = 0;
    _this.init = 1;

    _this.setup();

    return _this;
  }

  _createClass(DonutChart, [{
    key: "configure",
    value: function configure(args) {
      _get(_getPrototypeOf(DonutChart.prototype), "configure", this).call(this, args);

      this.mouseMove = this.mouseMove.bind(this);
      this.mouseLeave = this.mouseLeave.bind(this);
      this.hoverRadio = args.hoverRadio || 0.1;
      this.config.startAngle = args.startAngle || 0;
      this.clockWise = args.clockWise || false;
      this.strokeWidth = args.strokeWidth || 30;
    }
  }, {
    key: "calc",
    value: function calc() {
      var _this2 = this;

      _get(_getPrototypeOf(DonutChart.prototype), "calc", this).call(this);

      var s = this.state;
      this.radius = this.height > this.width ? this.center.x - this.strokeWidth / 2 : this.center.y - this.strokeWidth / 2;
      var radius = this.radius,
          clockWise = this.clockWise;
      var prevSlicesProperties = s.slicesProperties || [];
      s.sliceStrings = [];
      s.slicesProperties = [];
      var curAngle = 180 - this.config.startAngle;
      s.sliceTotals.map(function (total, i) {
        var startAngle = curAngle;
        var originDiffAngle = total / s.grandTotal * FULL_ANGLE;
        var largeArc = originDiffAngle > 180 ? 1 : 0;
        var diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
        var endAngle = curAngle = curAngle + diffAngle;
        var startPosition = getPositionByAngle(startAngle, radius);
        var endPosition = getPositionByAngle(endAngle, radius);
        var prevProperty = _this2.init && prevSlicesProperties[i];
        var curStart, curEnd;

        if (_this2.init) {
          curStart = prevProperty ? prevProperty.startPosition : startPosition;
          curEnd = prevProperty ? prevProperty.endPosition : startPosition;
        } else {
          curStart = startPosition;
          curEnd = endPosition;
        }

        var curPath = originDiffAngle === 360 ? makeStrokeCircleStr(curStart, curEnd, _this2.center, _this2.radius, _this2.clockWise, largeArc) : makeArcStrokePathStr(curStart, curEnd, _this2.center, _this2.radius, _this2.clockWise, largeArc);
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
    key: "setupComponents",
    value: function setupComponents() {
      var s = this.state;
      var componentConfigs = [['donutSlices', {}, function () {
        return {
          sliceStrings: s.sliceStrings,
          colors: this.colors,
          strokeWidth: this.strokeWidth
        };
      }.bind(this)]];
      this.components = new Map(componentConfigs.map(function (args) {
        var component = getComponent.apply(void 0, _toConsumableArray(args));
        return [args[0], component];
      }));
    }
  }, {
    key: "calTranslateByAngle",
    value: function calTranslateByAngle(property) {
      var radius = this.radius,
          hoverRadio = this.hoverRadio;
      var position = getPositionByAngle(property.startAngle + property.angle / 2, radius);
      return "translate3d(".concat(position.x * hoverRadio, "px,").concat(position.y * hoverRadio, "px,0)");
    }
  }, {
    key: "hoverSlice",
    value: function hoverSlice(path, i, flag, e) {
      if (!path) return;
      var color = this.colors[i];

      if (flag) {
        transform(path, this.calTranslateByAngle(this.state.slicesProperties[i]));
        path.style.stroke = lightenDarkenColor(color, 50);
        var g_off = getOffset(this.svg);
        var x = e.pageX - g_off.left + 10;
        var y = e.pageY - g_off.top - 10;
        var title = (this.formatted_labels && this.formatted_labels.length > 0 ? this.formatted_labels[i] : this.state.labels[i]) + ': ';
        var percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
        this.tip.setValues(x, y, {
          name: title,
          value: percent + "%"
        });
        this.tip.showTip();
      } else {
        transform(path, 'translate3d(0,0,0)');
        this.tip.hideTip();
        path.style.stroke = color;
      }
    }
  }, {
    key: "bindTooltip",
    value: function bindTooltip() {
      this.container.addEventListener('mousemove', this.mouseMove);
      this.container.addEventListener('mouseleave', this.mouseLeave);
    }
  }, {
    key: "mouseMove",
    value: function mouseMove(e) {
      var target = e.target;
      var slices = this.components.get('donutSlices').store;
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
    key: "mouseLeave",
    value: function mouseLeave() {
      this.hoverSlice(this.curActiveSlice, this.curActiveSliceIndex, false);
    }
  }]);

  return DonutChart;
}(AggregationChart);

var chartTypes = {
  bar: AxisChart,
  line: AxisChart,
  // multiaxis: MultiAxisChart,
  percentage: PercentageChart,
  heatmap: Heatmap,
  pie: PieChart,
  donut: DonutChart
};

function getChartByType() {
  var chartType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'line';
  var parent = arguments.length > 1 ? arguments[1] : undefined;
  var options = arguments.length > 2 ? arguments[2] : undefined;

  if (chartType === 'axis-mixed') {
    options.type = 'line';
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

exports.AxisChart = AxisChart;
exports.Chart = Chart;
exports.Heatmap = Heatmap;
exports.PercentageChart = PercentageChart;
exports.PieChart = PieChart;
