function $(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}



$.create = (tag, o) => {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);

		} else if (i === "styles") {
			if(typeof val === "object") {
				Object.keys(val).map(prop => {
					element.style[prop] = val[prop];
				});
			}
		} else if (i in element ) {
			element[i] = val;
		}
		else {
			element.setAttribute(i, val);
		}
	}

	return element;
};

function getOffset(element) {
	let rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	};
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
// an element's offsetParent property will return null whenever it, or any of its parents,
// is hidden via the display style property.
function isHidden(el) {
	return (el.offsetParent === null);
}

function isElementInViewport(el) {
	// Although straightforward: https://stackoverflow.com/a/7557433/6495043
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
	);
}

function getElementContentWidth(element) {
	var styles = window.getComputedStyle(element);
	var padding = parseFloat(styles.paddingLeft) +
		parseFloat(styles.paddingRight);

	return element.clientWidth - padding;
}





function fire(target, type, properties) {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true );

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
}

// https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/

const BASE_MEASURES = {
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

	titleFontSize: 12,
};

function getTopOffset(m) {
	return m.titleHeight + m.margins.top + m.paddings.top;
}

function getLeftOffset(m) {
	return m.margins.left + m.paddings.left;
}

function getExtraHeight(m) {
	let totalExtraHeight = m.margins.top + m.margins.bottom
		+ m.paddings.top + m.paddings.bottom
		+ m.titleHeight + m.legendHeight;
	return totalExtraHeight;
}

function getExtraWidth(m) {
	let totalExtraWidth = m.margins.left + m.margins.right
		+ m.paddings.left + m.paddings.right;

	return totalExtraWidth;
}

const INIT_CHART_UPDATE_TIMEOUT = 700;
const CHART_POST_ANIMATE_TIMEOUT = 400;

const DEFAULT_AXIS_CHART_TYPE = 'line';
const AXIS_DATASET_CHART_TYPES = ['line', 'bar'];

const AXIS_LEGEND_BAR_SIZE = 100;

const BAR_CHART_SPACE_RATIO = 0.5;
const MIN_BAR_PERCENT_HEIGHT = 0.00;

const LINE_CHART_DOT_SIZE = 4;
const DOT_OVERLAY_SIZE_INCR = 4;

const PERCENTAGE_BAR_DEFAULT_HEIGHT = 20;
const PERCENTAGE_BAR_DEFAULT_DEPTH = 2;

// Fixed 5-color theme,
// More colors are difficult to parse visually
const HEATMAP_DISTRIBUTION_SIZE = 5;

const HEATMAP_SQUARE_SIZE = 10;
const HEATMAP_GUTTER_SIZE = 2;

const DEFAULT_CHAR_WIDTH = 7;

const TOOLTIP_POINTER_TRIANGLE_HEIGHT = 5;

const DEFAULT_CHART_COLORS = ['light-blue', 'blue', 'violet', 'red', 'orange',
	'yellow', 'green', 'light-green', 'purple', 'magenta', 'light-grey', 'dark-grey'];
const HEATMAP_COLORS_GREEN = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];



const DEFAULT_COLORS = {
	bar: DEFAULT_CHART_COLORS,
	line: DEFAULT_CHART_COLORS,
	pie: DEFAULT_CHART_COLORS,
	percentage: DEFAULT_CHART_COLORS,
	heatmap: HEATMAP_COLORS_GREEN,
	donut: DEFAULT_CHART_COLORS
};

// Universal constants
const ANGLE_RATIO = Math.PI / 180;
const FULL_ANGLE = 360;

class SvgTip {
	constructor({
		parent = null,
		colors = []
	}) {
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

	setup() {
		this.makeTooltip();
	}

	refresh() {
		this.fill();
		this.calcPosition();
	}

	makeTooltip() {
		this.container = $.create('div', {
			inside: this.parent,
			className: 'graph-svg-tip comparison',
			innerHTML: `<span class="title"></span>
				<ul class="data-point-list"></ul>
				<div class="svg-pointer"></div>`
		});
		this.hideTip();

		this.title = this.container.querySelector('.title');
		this.dataPointList = this.container.querySelector('.data-point-list');

		this.parent.addEventListener('mouseleave', () => {
			this.hideTip();
		});
	}

	fill() {
		let title;
		if(this.index) {
			this.container.setAttribute('data-point-index', this.index);
		}
		if(this.titleValueFirst) {
			title = `<strong>${this.titleValue}</strong>${this.titleName}`;
		} else {
			title = `${this.titleName}<strong>${this.titleValue}</strong>`;
		}
		this.title.innerHTML = title;
		this.dataPointList.innerHTML = '';

		this.listValues.map((set, i) => {
			const color = this.colors[i] || 'black';
			let value = set.formatted === 0 || set.formatted ? set.formatted : set.value;

			let li = $.create('li', {
				styles: {
					'border-top': `3px solid ${color}`
				},
				innerHTML: `<strong style="display: block;">${ value === 0 || value ? value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.dataPointList.appendChild(li);
		});
	}

	calcPosition() {
		let width = this.container.offsetWidth;

		this.top = this.y - this.container.offsetHeight
			- TOOLTIP_POINTER_TRIANGLE_HEIGHT;
		this.left = this.x - width/2;
		let maxLeft = this.parent.offsetWidth - width;

		let pointer = this.container.querySelector('.svg-pointer');

		if(this.left < 0) {
			pointer.style.left = `calc(50% - ${-1 * this.left}px)`;
			this.left = 0;
		} else if(this.left > maxLeft) {
			let delta = this.left - maxLeft;
			let pointerOffset = `calc(50% + ${delta}px)`;
			pointer.style.left = pointerOffset;

			this.left = maxLeft;
		} else {
			pointer.style.left = `50%`;
		}
	}

	setValues(x, y, title = {}, listValues = [], index = -1) {
		this.titleName = title.name;
		this.titleValue = title.value;
		this.listValues = listValues;
		this.x = x;
		this.y = y;
		this.titleValueFirst = title.valueFirst || 0;
		this.index = index;
		this.refresh();
	}

	hideTip() {
		this.container.style.top = '0px';
		this.container.style.left = '0px';
		this.container.style.opacity = '0';
	}

	showTip() {
		this.container.style.top = this.top + 'px';
		this.container.style.left = this.left + 'px';
		this.container.style.opacity = '1';
	}
}

/**
 * Returns the value of a number upto 2 decimal places.
 * @param {Number} d Any number
 */
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
function fillArray(array, count, element, start=false) {
	if(!element) {
		element = start ? array[0] : array[array.length - 1];
	}
	let fillerArray = new Array(Math.abs(count)).fill(element);
	array = start ? fillerArray.concat(array) : array.concat(fillerArray);
	return array;
}

/**
 * Returns pixel width of string.
 * @param {String} string
 * @param {Number} charWidth Width of single char in pixels
 */
function getStringWidth(string, charWidth) {
	return (string+"").length * charWidth;
}



// https://stackoverflow.com/a/29325222


function getPositionByAngle(angle, radius) {
	return {
		x: Math.sin(angle * ANGLE_RATIO) * radius,
		y: Math.cos(angle * ANGLE_RATIO) * radius,
	};
}

/**
 * Check if a number is valid for svg attributes
 * @param {object} candidate Candidate to test
 * @param {Boolean} nonNegative flag to treat negative number as invalid
 */
function isValidNumber(candidate, nonNegative=false) {
	if (Number.isNaN(candidate)) return false;
	else if (candidate === undefined) return false;
	else if (!Number.isFinite(candidate)) return false;
	else if (nonNegative && candidate < 0) return false;
	else return true;
}

/**
 * Round a number to the closes precision, max max precision 4
 * @param {Number} d Any Number
 */
function round(d) {
	// https://floating-point-gui.de/
	// https://www.jacklmoore.com/notes/rounding-in-javascript/
	return Number(Math.round(d + 'e4') + 'e-4');
}

function getBarHeightAndYAttr(yTop, zeroLine) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;
	} else {
		height = yTop - zeroLine;
		y = zeroLine;
	}

	return [height, y];
}

function equilizeNoOfElements(array1, array2,
	extraCount = array2.length - array1.length) {

	// Doesn't work if either has zero elements.
	if(extraCount > 0) {
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
		return txt.slice(0, len-3) + '...';
	} else {
		return txt;
	}
}

function shortenLargeNumber(label) {
	let number;
	if (typeof label === 'number') number = label;
	else if (typeof label === 'string') {
		number = Number(label);
		if (Number.isNaN(number)) return label;
	}

	// Using absolute since log wont work for negative numbers
	let p = Math.floor(Math.log10(Math.abs(number)));
	if (p <= 2) return number; // Return as is for a 3 digit number of less
	let	l = Math.floor(p / 3);
	let shortened = (Math.pow(10, p - l * 3) * +(number / Math.pow(10, p)).toFixed(1));

	// Correct for floating point error upto 2 decimal places
	return Math.round(shortened*100)/100 + ' ' + ['', 'K', 'M', 'B', 'T'][l];
}

// cubic bezier curve calculation (from example by François Romain)
function getSplineCurvePointsStr(xList, yList) {

	let points=[];
	for(let i=0;i<xList.length;i++){
		points.push([xList[i], yList[i]]);
	}

	let smoothing = 0.2;
	let line = (pointA, pointB) => {
		let lengthX = pointB[0] - pointA[0];
		let lengthY = pointB[1] - pointA[1];
		return {
			length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
			angle: Math.atan2(lengthY, lengthX)
		};
	};
    
	let controlPoint = (current, previous, next, reverse) => {
		let p = previous || current;
		let n = next || current;
		let o = line(p, n);
		let angle = o.angle + (reverse ? Math.PI : 0);
		let length = o.length * smoothing;
		let x = current[0] + Math.cos(angle) * length;
		let y = current[1] + Math.sin(angle) * length;
		return [x, y];
	};
    
	let bezierCommand = (point, i, a) => {
		let cps = controlPoint(a[i - 1], a[i - 2], point);
		let cpe = controlPoint(point, a[i - 1], a[i + 1], true);
		return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
	};
    
	let pointStr = (points, command) => {
		return points.reduce((acc, point, i, a) => i === 0
			? `${point[0]},${point[1]}`
			: `${acc} ${command(point, i, a)}`, '');
	};
    
	return pointStr(points, bezierCommand);
}

const PRESET_COLOR_MAP = {
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

function limitColor(r){
	if (r > 255) return 255;
	else if (r < 0) return 0;
	return r;
}

function lightenDarkenColor(color, amt) {
	let col = getColor(color);
	let usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	let num = parseInt(col,16);
	let r = limitColor((num >> 16) + amt);
	let b = limitColor(((num >> 8) & 0x00FF) + amt);
	let g = limitColor((num & 0x0000FF) + amt);
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

function isValidColor(string) {
	// https://stackoverflow.com/a/32685393
	let HEX_RE = /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i;
	let RGB_RE = /(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;
	return HEX_RE.test(string) || RGB_RE.test(string);
}

const getColor = (color) => {
	return PRESET_COLOR_MAP[color] || color;
};

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const LABEL_MAX_CHARS = 15;
const FONT_SIZE = 10;
const BASE_LINE_COLOR = '#dadada';
const FONT_FILL = '#555b51';

function $$1(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

function createSVG(tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$$1(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $$1(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);

		} else if (i === "styles") {
			if(typeof val === "object") {
				Object.keys(val).map(prop => {
					element.style[prop] = val[prop];
				});
			}
		} else {
			if(i === "className") { i = "class"; }
			if(i === "innerHTML") {
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
		'style': `stop-color: ${color}`,
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
		inside: svgContainer,
	});
}

function makeSVGGroup(className, transform='', parent=undefined) {
	let args = {
		className: className,
		transform: transform
	};
	if(parent) args.inside = parent;
	return createSVG('g', args);
}



function makePath(pathStr, className='', stroke='none', fill='none', strokeWidth=2) {
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

function makeArcPathStr(startPosition, endPosition, center, radius, clockWise=1, largeArc=0){
	let [arcStartX, arcStartY] = [center.x + startPosition.x, center.y + startPosition.y];
	let [arcEndX, arcEndY] = [center.x + endPosition.x, center.y + endPosition.y];
	return `M${center.x} ${center.y}
		L${arcStartX} ${arcStartY}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${arcEndY} z`;
}

function makeCircleStr(startPosition, endPosition, center, radius, clockWise=1, largeArc=0){
	let [arcStartX, arcStartY] = [center.x + startPosition.x, center.y + startPosition.y];
	let [arcEndX, midArc, arcEndY] = [center.x + endPosition.x, center.y * 2, center.y + endPosition.y];
	return `M${center.x} ${center.y}
		L${arcStartX} ${arcStartY}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${midArc} z
		L${arcStartX} ${midArc}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${arcEndY} z`;
}

function makeArcStrokePathStr(startPosition, endPosition, center, radius, clockWise=1, largeArc=0){
	let [arcStartX, arcStartY] = [center.x + startPosition.x, center.y + startPosition.y];
	let [arcEndX, arcEndY] = [center.x + endPosition.x, center.y + endPosition.y];

	return `M${arcStartX} ${arcStartY}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${arcEndY}`;
}

function makeStrokeCircleStr(startPosition, endPosition, center, radius, clockWise=1, largeArc=0){
	let [arcStartX, arcStartY] = [center.x + startPosition.x, center.y + startPosition.y];
	let [arcEndX, midArc, arcEndY] = [center.x + endPosition.x, radius * 2 + arcStartY, center.y + startPosition.y];

	return `M${arcStartX} ${arcStartY}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${midArc}
		M${arcStartX} ${midArc}
		A ${radius} ${radius} 0 ${largeArc} ${clockWise ? 1 : 0}
		${arcEndX} ${arcEndY}`;
}

function makeGradient(svgDefElem, color, lighter = false) {
	let gradientId ='path-fill-gradient' + '-' + color + '-' +(lighter ? 'lighter' : 'default');
	let gradientDef = renderVerticalGradient(svgDefElem, gradientId);
	let opacities = [1, 0.6, 0.2];
	if(lighter) {
		opacities = [0.4, 0.2, 0];
	}

	setGradientStop(gradientDef, "0%", color, opacities[0]);
	setGradientStop(gradientDef, "50%", color, opacities[1]);
	setGradientStop(gradientDef, "100%", color, opacities[2]);

	return gradientId;
}

function percentageBar(x, y, width, height,
	depth=PERCENTAGE_BAR_DEFAULT_DEPTH, fill='none') {

	let args = {
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
			'stroke-dasharray': `0, ${height + width}, ${width}, ${height}`,
			'stroke-width': depth
		},
	};

	return createSVG("rect", args);
}

function heatSquare(className, x, y, size, radius, fill='none', data={}) {
	let args = {
		className: className,
		x: x,
		y: y,
		width: size,
		height: size,
		rx: radius,
		fill: fill
	};

	Object.keys(data).map(key => {
		args[key] = data[key];
	});

	return createSVG("rect", args);
}

function legendBar(x, y, size, fill='none', label, truncate=false) {
	label = truncate ? truncateString(label, LABEL_MAX_CHARS) : label;

	let args = {
		className: 'legend-bar',
		x: 0,
		y: 0,
		width: size,
		height: '2px',
		fill: fill
	};
	let text = createSVG('text', {
		className: 'legend-dataset-text',
		x: 0,
		y: 0,
		dy: (FONT_SIZE * 2) + 'px',
		'font-size': (FONT_SIZE * 1.2) + 'px',
		'text-anchor': 'start',
		fill: FONT_FILL,
		innerHTML: label
	});

	let group = createSVG('g', {
		transform: `translate(${x}, ${y})`
	});
	group.appendChild(createSVG("rect", args));
	group.appendChild(text);

	return group;
}

function legendDot(x, y, size, fill='none', label, truncate=false) {
	label = truncate ? truncateString(label, LABEL_MAX_CHARS) : label;

	let args = {
		className: 'legend-dot',
		cx: 0,
		cy: 0,
		r: size,
		fill: fill
	};
	let text = createSVG('text', {
		className: 'legend-dataset-text',
		x: 0,
		y: 0,
		dx: (FONT_SIZE) + 'px',
		dy: (FONT_SIZE/3) + 'px',
		'font-size': (FONT_SIZE * 1.2) + 'px',
		'text-anchor': 'start',
		fill: FONT_FILL,
		innerHTML: label
	});

	let group = createSVG('g', {
		transform: `translate(${x}, ${y})`
	});
	group.appendChild(createSVG("circle", args));
	group.appendChild(text);

	return group;
}

function makeText(className, x, y, content, options = {}) {
	let fontSize = options.fontSize || FONT_SIZE;
	let dy = options.dy !== undefined ? options.dy : (fontSize / 2);
	let fill = options.fill || FONT_FILL;
	let textAnchor = options.textAnchor || 'start';
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

function makeVertLine(x, label, y1, y2, options={}) {
	if(!options.stroke) options.stroke = BASE_LINE_COLOR;
	let l = createSVG('line', {
		className: 'line-vertical ' + options.className,
		x1: 0,
		x2: 0,
		y1: y1,
		y2: y2,
		styles: {
			stroke: options.stroke
		}
	});

	let text = createSVG('text', {
		x: 0,
		y: y1 > y2 ? y1 + LABEL_MARGIN : y1 - LABEL_MARGIN - FONT_SIZE,
		dy: FONT_SIZE + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'middle',
		innerHTML: label + ""
	});

	let line = createSVG('g', {
		transform: `translate(${ x }, 0)`
	});

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

function makeHoriLine(y, label, x1, x2, options={}) {
	if(!options.stroke) options.stroke = BASE_LINE_COLOR;
	if(!options.lineType) options.lineType = '';
	if (options.shortenNumbers) label = shortenLargeNumber(label);

	let className = 'line-horizontal ' + options.className +
		(options.lineType === "dashed" ? "dashed": "");

	let l = createSVG('line', {
		className: className,
		x1: x1,
		x2: x2,
		y1: 0,
		y2: 0,
		styles: {
			stroke: options.stroke
		}
	});

	let text = createSVG('text', {
		x: x1 < x2 ? x1 - LABEL_MARGIN : x1 + LABEL_MARGIN,
		y: 0,
		dy: (FONT_SIZE / 2 - 2) + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': x1 < x2 ? 'end' : 'start',
		innerHTML: label+""
	});

	let line = createSVG('g', {
		transform: `translate(0, ${y})`,
		'stroke-opacity': 1
	});

	if(text === 0 || text === '0') {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

function yLine(y, label, width, options={}) {
	if (!isValidNumber(y)) y = 0;

	if(!options.pos) options.pos = 'left';
	if(!options.offset) options.offset = 0;
	if(!options.mode) options.mode = 'span';
	if(!options.stroke) options.stroke = BASE_LINE_COLOR;
	if(!options.className) options.className = '';

	let x1 = -1 * AXIS_TICK_LENGTH;
	let x2 = options.mode === 'span' ? width + AXIS_TICK_LENGTH : 0;

	if(options.mode === 'tick' && options.pos === 'right') {
		x1 = width + AXIS_TICK_LENGTH;
		x2 = width;
	}

	// let offset = options.pos === 'left' ? -1 * options.offset : options.offset;

	x1 += options.offset;
	x2 += options.offset;

	return makeHoriLine(y, label, x1, x2, {
		stroke: options.stroke,
		className: options.className,
		lineType: options.lineType,
		shortenNumbers: options.shortenNumbers
	});
}

function xLine(x, label, height, options={}) {
	if (!isValidNumber(x)) x = 0;

	if(!options.pos) options.pos = 'bottom';
	if(!options.offset) options.offset = 0;
	if(!options.mode) options.mode = 'span';
	if(!options.stroke) options.stroke = BASE_LINE_COLOR;
	if(!options.className) options.className = '';

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

	let y1 = height + AXIS_TICK_LENGTH;
	let y2 = options.mode === 'span' ? -1 * AXIS_TICK_LENGTH : height;

	if(options.mode === 'tick' && options.pos === 'top') {
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

function yMarker(y, label, width, options={}) {
	if(!options.labelPos) options.labelPos = 'right';
	let x = options.labelPos === 'left' ? LABEL_MARGIN
		: width - getStringWidth(label, 5) - LABEL_MARGIN;

	let labelSvg = createSVG('text', {
		className: 'chart-label',
		x: x,
		y: 0,
		dy: (FONT_SIZE / -2) + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'start',
		innerHTML: label+""
	});

	let line = makeHoriLine(y, '', 0, width, {
		stroke: options.stroke || BASE_LINE_COLOR,
		className: options.className || '',
		lineType: options.lineType
	});

	line.appendChild(labelSvg);

	return line;
}

function yRegion(y1, y2, width, label, options={}) {
	// return a group
	let height = y1 - y2;

	let rect = createSVG('rect', {
		className: `bar mini`, // remove class
		styles: {
			fill: `rgba(228, 234, 239, 0.49)`,
			stroke: BASE_LINE_COLOR,
			'stroke-dasharray': `${width}, ${height}`
		},
		// 'data-point-index': index,
		x: 0,
		y: 0,
		width: width,
		height: height
	});

	if(!options.labelPos) options.labelPos = 'right';
	let x = options.labelPos === 'left' ? LABEL_MARGIN
		: width - getStringWidth(label+"", 4.5) - LABEL_MARGIN;

	let labelSvg = createSVG('text', {
		className: 'chart-label',
		x: x,
		y: 0,
		dy: (FONT_SIZE / -2) + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'start',
		innerHTML: label+""
	});

	let region = createSVG('g', {
		transform: `translate(0, ${y2})`
	});

	region.appendChild(rect);
	region.appendChild(labelSvg);

	return region;
}

function datasetBar(x, yTop, width, color, label='', index=0, offset=0, meta={}) {
	let [height, y] = getBarHeightAndYAttr(yTop, meta.zeroLine);
	y -= offset;

	if(height === 0) {
		height = meta.minHeight;
		y -= meta.minHeight;
	}

	// Preprocess numbers to avoid svg building errors
	if (!isValidNumber(x)) x = 0;
	if (!isValidNumber(y)) y = 0;
	if (!isValidNumber(height, true)) height = 0;
	if (!isValidNumber(width, true)) width = 0;

	let rect = createSVG('rect', {
		className: `bar mini`,
		style: `fill: ${color}`,
		'data-point-index': index,
		x: x,
		y: y,
		width: width,
		height: height
	});

	label += "";

	if(!label && !label.length) {
		return rect;
	} else {
		rect.setAttribute('y', 0);
		rect.setAttribute('x', 0);
		let text = createSVG('text', {
			className: 'data-point-value',
			x: width/2,
			y: 0,
			dy: (FONT_SIZE / 2 * -1) + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'middle',
			innerHTML: label
		});

		let group = createSVG('g', {
			'data-point-index': index,
			transform: `translate(${x}, ${y})`
		});
		group.appendChild(rect);
		group.appendChild(text);

		return group;
	}
}

function datasetDot(x, y, radius, color, label='', index=0) {
	let dot = createSVG('circle', {
		style: `fill: ${color}`,
		'data-point-index': index,
		cx: x,
		cy: y,
		r: radius
	});

	label += "";

	if(!label && !label.length) {
		return dot;
	} else {
		dot.setAttribute('cy', 0);
		dot.setAttribute('cx', 0);

		let text = createSVG('text', {
			className: 'data-point-value',
			x: 0,
			y: 0,
			dy: (FONT_SIZE / 2 * -1 - radius) + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'middle',
			innerHTML: label
		});

		let group = createSVG('g', {
			'data-point-index': index,
			transform: `translate(${x}, ${y})`
		});
		group.appendChild(dot);
		group.appendChild(text);

		return group;
	}
}

function getPaths(xList, yList, color, options={}, meta={}) {
	let pointsList = yList.map((y, i) => (xList[i] + ',' + y));
	let pointsStr = pointsList.join("L");

	// Spline
	if (options.spline)
		pointsStr = getSplineCurvePointsStr(xList, yList);

	let path = makePath("M"+pointsStr, 'line-graph-path', color);

	// HeatLine
	if(options.heatline) {
		let gradient_id = makeGradient(meta.svgDefs, color);
		path.style.stroke = `url(#${gradient_id})`;
	}

	let paths = {
		path: path
	};

	// Region
	if(options.regionFill) {
		let gradient_id_region = makeGradient(meta.svgDefs, color, true);

		let pathStr = "M" + `${xList[0]},${meta.zeroLine}L` + pointsStr + `L${xList.slice(-1)[0]},${meta.zeroLine}`;
		paths.region = makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id_region})`);
	}

	return paths;
}

let makeOverlay = {
	'bar': (unit) => {
		let transformValue;
		if(unit.nodeName !== 'rect') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let overlay = unit.cloneNode();
		overlay.style.fill = '#000000';
		overlay.style.opacity = '0.4';

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	},

	'dot': (unit) => {
		let transformValue;
		if(unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let overlay = unit.cloneNode();
		let radius = unit.getAttribute('r');
		let fill = unit.getAttribute('fill');
		overlay.setAttribute('r', parseInt(radius) + DOT_OVERLAY_SIZE_INCR);
		overlay.setAttribute('fill', fill);
		overlay.style.opacity = '0.6';

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	},

	'heat_square': (unit) => {
		let transformValue;
		if(unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let overlay = unit.cloneNode();
		let radius = unit.getAttribute('r');
		let fill = unit.getAttribute('fill');
		overlay.setAttribute('r', parseInt(radius) + DOT_OVERLAY_SIZE_INCR);
		overlay.setAttribute('fill', fill);
		overlay.style.opacity = '0.6';

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
		return overlay;
	}
};

let updateOverlay = {
	'bar': (unit, overlay) => {
		let transformValue;
		if(unit.nodeName !== 'rect') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let attributes = ['x', 'y', 'width', 'height'];
		Object.values(unit.attributes)
			.filter(attr => attributes.includes(attr.name) && attr.specified)
			.map(attr => {
				overlay.setAttribute(attr.name, attr.nodeValue);
			});

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	},

	'dot': (unit, overlay) => {
		let transformValue;
		if(unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let attributes = ['cx', 'cy'];
		Object.values(unit.attributes)
			.filter(attr => attributes.includes(attr.name) && attr.specified)
			.map(attr => {
				overlay.setAttribute(attr.name, attr.nodeValue);
			});

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	},

	'heat_square': (unit, overlay) => {
		let transformValue;
		if(unit.nodeName !== 'circle') {
			transformValue = unit.getAttribute('transform');
			unit = unit.childNodes[0];
		}
		let attributes = ['cx', 'cy'];
		Object.values(unit.attributes)
			.filter(attr => attributes.includes(attr.name) && attr.specified)
			.map(attr => {
				overlay.setAttribute(attr.name, attr.nodeValue);
			});

		if(transformValue) {
			overlay.setAttribute('transform', transformValue);
		}
	},
};

const UNIT_ANIM_DUR = 350;
const PATH_ANIM_DUR = 350;
const MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
const REPLACE_ALL_NEW_DUR = 250;

const STD_EASING = 'easein';

function translate(unit, oldCoord, newCoord, duration) {
	let old = typeof oldCoord === 'string' ? oldCoord : oldCoord.join(', ');
	return [
		unit,
		{transform: newCoord.join(', ')},
		duration,
		STD_EASING,
		"translate",
		{transform: old}
	];
}

function translateVertLine(xLine, newX, oldX) {
	return translate(xLine, [oldX, 0], [newX, 0], MARKER_LINE_ANIM_DUR);
}

function translateHoriLine(yLine, newY, oldY) {
	return translate(yLine, [0, oldY], [0, newY], MARKER_LINE_ANIM_DUR);
}

function animateRegion(rectGroup, newY1, newY2, oldY2) {
	let newHeight = newY1 - newY2;
	let rect = rectGroup.childNodes[0];
	let width = rect.getAttribute("width");
	let rectAnim = [
		rect,
		{ height: newHeight, 'stroke-dasharray': `${width}, ${newHeight}` },
		MARKER_LINE_ANIM_DUR,
		STD_EASING
	];

	let groupAnim = translate(rectGroup, [0, oldY2], [0, newY2], MARKER_LINE_ANIM_DUR);
	return [rectAnim, groupAnim];
}

function animateBar(bar, x, yTop, width, offset=0, meta={}) {
	let [height, y] = getBarHeightAndYAttr(yTop, meta.zeroLine);
	y -= offset;
	if(bar.nodeName !== 'rect') {
		let rect = bar.childNodes[0];
		let rectAnim = [
			rect,
			{width: width, height: height},
			UNIT_ANIM_DUR,
			STD_EASING
		];

		let oldCoordStr = bar.getAttribute("transform").split("(")[1].slice(0, -1);
		let groupAnim = translate(bar, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
		return [rectAnim, groupAnim];
	} else {
		return [[bar, {width: width, height: height, x: x, y: y}, UNIT_ANIM_DUR, STD_EASING]];
	}
	// bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);
}

function animateDot(dot, x, y) {
	if(dot.nodeName !== 'circle') {
		let oldCoordStr = dot.getAttribute("transform").split("(")[1].slice(0, -1);
		let groupAnim = translate(dot, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
		return [groupAnim];
	} else {
		return [[dot, {cx: x, cy: y}, UNIT_ANIM_DUR, STD_EASING]];
	}
	// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
}

function animatePath(paths, newXList, newYList, zeroLine, spline) {
	let pathComponents = [];
	let pointsStr = newYList.map((y, i) => (newXList[i] + ',' + y)).join("L");

	if (spline)
		pointsStr = getSplineCurvePointsStr(newXList, newYList);

	const animPath = [paths.path, {d:"M" + pointsStr}, PATH_ANIM_DUR, STD_EASING];
	pathComponents.push(animPath);

	if(paths.region) {
		let regStartPt = `${newXList[0]},${zeroLine}L`;
		let regEndPt = `L${newXList.slice(-1)[0]}, ${zeroLine}`;

		const animRegion = [
			paths.region,
			{d:"M" + regStartPt + pointsStr + regEndPt},
			PATH_ANIM_DUR,
			STD_EASING
		];
		pathComponents.push(animRegion);
	}

	return pathComponents;
}

function animatePathStr(oldPath, pathStr) {
	return [oldPath, {d: pathStr}, UNIT_ANIM_DUR, STD_EASING];
}

// Leveraging SMIL Animations

const EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

function animateSVGElement(element, props, dur, easingType="linear", type=undefined, oldValues={}) {

	let animElement = element.cloneNode(true);
	let newElement = element.cloneNode(true);

	for(var attributeName in props) {
		let animateElement;
		if(attributeName === 'transform') {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		let currentValue = oldValues[attributeName] || element.getAttribute(attributeName);
		let value = props[attributeName];

		let animAttr = {
			attributeName: attributeName,
			from: currentValue,
			to: value,
			begin: "0s",
			dur: dur/1000 + "s",
			values: currentValue + ";" + value,
			keySplines: EASING[easingType],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if(type) {
			animAttr["type"] = type;
		}

		for (var i in animAttr) {
			animateElement.setAttribute(i, animAttr[i]);
		}

		animElement.appendChild(animateElement);

		if(type) {
			newElement.setAttribute(attributeName, `translate(${value})`);
		} else {
			newElement.setAttribute(attributeName, value);
		}
	}

	return [animElement, newElement];
}

function transform(element, style) { // eslint-disable-line no-unused-vars
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
}

function animateSVG(svgContainer, elements) {
	let newElements = [];
	let animElements = [];

	elements.map(element => {
		let unit = element[0];
		let parent = unit.parentNode;

		let animElement, newElement;

		element[0] = unit;
		[animElement, newElement] = animateSVGElement(...element);

		newElements.push(newElement);
		animElements.push([animElement, parent]);

		parent.replaceChild(animElement, unit);
	});

	let animSvg = svgContainer.cloneNode(true);

	animElements.map((animElement, i) => {
		animElement[1].replaceChild(newElements[i], animElement[0]);
		elements[i][0] = newElements[i];
	});

	return animSvg;
}

function runSMILAnimation(parent, svgElement, elementsToAnimate) {
	if(elementsToAnimate.length === 0) return;

	let animSvgElement = animateSVG(svgElement, elementsToAnimate);
	if(svgElement.parentNode == parent) {
		parent.removeChild(svgElement);
		parent.appendChild(animSvgElement);

	}

	// Replace the new svgElement (data has already been replaced)
	setTimeout(() => {
		if(animSvgElement.parentNode == parent) {
			parent.removeChild(animSvgElement);
			parent.appendChild(svgElement);
		}
	}, REPLACE_ALL_NEW_DUR);
}

const CSSTEXT = ".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}";

function downloadFile(filename, data) {
	var a = document.createElement('a');
	a.style = "display: none";
	var blob = new Blob(data, {type: "image/svg+xml; charset=utf-8"});
	var url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function(){
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 300);
}

function prepareForExport(svg) {
	let clone = svg.cloneNode(true);
	clone.classList.add('chart-container');
	clone.setAttribute('xmlns', "http://www.w3.org/2000/svg");
	clone.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
	let styleEl = $.create('style', {
		'innerHTML': CSSTEXT
	});
	clone.insertBefore(styleEl, clone.firstChild);

	let container = $.create('div');
	container.appendChild(clone);

	return container.innerHTML;
}

class BaseChart {
	constructor(parent, options) {

		this.parent = typeof parent === 'string'
			? document.querySelector(parent)
			: parent;

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
			showTooltip: 1, // calculate
			showLegend: 1, // calculate
			isNavigable: options.isNavigable || 0,
			animate: (typeof options.animate !== 'undefined') ? options.animate : 1,
			truncateLegends: options.truncateLegends || 1
		};

		this.measures = JSON.parse(JSON.stringify(BASE_MEASURES));
		let m = this.measures;
		this.setMeasures(options);
		if(!this.title.length) { m.titleHeight = 0; }
		if(!this.config.showLegend) m.legendHeight = 0;
		this.argHeight = options.height || m.baseHeight;

		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if(this.config.isNavigable) {
			this.overlays = [];
		}

		this.configure(options);
	}

	prepareData(data) {
		return data;
	}

	prepareFirstData(data) {
		return data;
	}

	validateColors(colors, type) {
		const validColors = [];
		colors = (colors || []).concat(DEFAULT_COLORS[type]);
		colors.forEach((string) => {
			const color = getColor(string);
			if(!isValidColor(color)) {
				console.warn('"' + string + '" is not a valid color.');
			} else {
				validColors.push(color);
			}
		});
		return validColors;
	}

	setMeasures() {
		// Override measures, including those for title and legend
		// set config for legend and title
	}

	configure() {
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - getExtraHeight(this.measures);

		// Bind window events
		this.boundDrawFn = () => this.draw(true);
		window.addEventListener('resize', this.boundDrawFn);
		window.addEventListener('orientationchange', this.boundDrawFn);
	}

	destroy() {
		window.removeEventListener('resize', this.boundDrawFn);
		window.removeEventListener('orientationchange', this.boundDrawFn);
	}

	// Has to be called manually
	setup() {
		this.makeContainer();
		this.updateWidth();
		this.makeTooltip();

		this.draw(false, true);
	}

	makeContainer() {
		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';

		let args = {
			inside: this.parent,
			className: 'chart-container'
		};

		if(this.independentWidth) {
			args.styles = { width: this.independentWidth + 'px' };
		}

		this.container = $.create('div', args);
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.container,
			colors: this.colors
		});
		this.bindTooltip();
	}

	bindTooltip() {}

	draw(onlyWidthChange=false, init=false) {
		if (onlyWidthChange && isHidden(this.parent)) {
			// Don't update anything if the chart is hidden
			return;
		}
		this.updateWidth();

		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update(this.data);}, this.initTimeout);
		}

		this.renderLegend();

		this.setupNavigation(init);
	}

	calc() {} // builds state

	updateWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - getExtraWidth(this.measures);
	}

	makeChartArea() {
		if(this.svg) {
			this.container.removeChild(this.svg);
		}
		let m = this.measures;

		this.svg = makeSVGContainer(
			this.container,
			'frappe-chart chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		if(this.title.length) {
			this.titleEL = makeText(
				'title',
				m.margins.left,
				m.margins.top,
				this.title,
				{
					fontSize: m.titleFontSize,
					fill: '#666666',
					dy: m.titleFontSize
				}
			);
		}

		let top = getTopOffset(m);
		this.drawArea = makeSVGGroup(
			this.type + '-chart chart-draw-area',
			`translate(${getLeftOffset(m)}, ${top})`
		);

		if(this.config.showLegend) {
			top += this.height + m.paddings.bottom;
			this.legendArea = makeSVGGroup(
				'chart-legend',
				`translate(${getLeftOffset(m)}, ${top})`
			);
		}

		if(this.title.length) { this.svg.appendChild(this.titleEL); }
		this.svg.appendChild(this.drawArea);
		if(this.config.showLegend) { this.svg.appendChild(this.legendArea); }

		this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
	}

	updateTipOffset(x, y) {
		this.tip.offset = {
			x: x,
			y: y
		};
	}

	setupComponents() { this.components = new Map(); }

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}
		this.data = this.prepareData(data);
		this.calc(); // builds state
		this.render(this.components, this.config.animate);
	}

	render(components=this.components, animate=true) {
		if(this.config.isNavigable) {
			// Remove all existing overlays
			this.overlays.map(o => o.parentNode.removeChild(o));
			// ref.parentNode.insertBefore(element, ref);
		}
		let elementsToAnimate = [];
		// Can decouple to this.refreshComponents() first to save animation timeout
		components.forEach(c => {
			elementsToAnimate = elementsToAnimate.concat(c.update(animate));
		});
		if(elementsToAnimate.length > 0) {
			runSMILAnimation(this.container, this.svg, elementsToAnimate);
			setTimeout(() => {
				components.forEach(c => c.make());
				this.updateNav();
			}, CHART_POST_ANIMATE_TIMEOUT);
		} else {
			components.forEach(c => c.make());
			this.updateNav();
		}
	}

	updateNav() {
		if(this.config.isNavigable) {
			this.makeOverlay();
			this.bindUnits();
		}
	}

	renderLegend() {}

	setupNavigation(init=false) {
		if(!this.config.isNavigable) return;

		if(init) {
			this.bindOverlay();

			this.keyActions = {
				'13': this.onEnterKey.bind(this),
				'37': this.onLeftArrow.bind(this),
				'38': this.onUpArrow.bind(this),
				'39': this.onRightArrow.bind(this),
				'40': this.onDownArrow.bind(this),
			};

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.container)) {
					e = e || window.event;
					if(this.keyActions[e.keyCode]) {
						this.keyActions[e.keyCode]();
					}
				}
			});
		}
	}

	makeOverlay() {}
	updateOverlay() {}
	bindOverlay() {}
	bindUnits() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	addDataPoint() {}
	removeDataPoint() {}

	getDataPoint() {}
	setCurrentDataPoint() {}

	updateDataset() {}

	export() {
		let chartSvg = prepareForExport(this.svg);
		downloadFile(this.title || 'Chart', [chartSvg]);
	}
}

class AggregationChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
	}

	configure(args) {
		super.configure(args);

		this.config.formatTooltipY = args.tooltipOptions.formatTooltipY;
		this.config.maxSlices = args.maxSlices || 20;
		this.config.maxLegendPoints = args.maxLegendPoints || 20;
	}

	calc() {
		let s = this.state;
		let maxSlices = this.config.maxSlices;
		s.sliceTotals = [];

		let allTotals = this.data.labels.map((label, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, label];
		}).filter(d => { return d[0] >= 0; }); // keep only positive results

		let totals = allTotals;
		if(allTotals.length > maxSlices) {
			// Prune and keep a grey area for rest as per maxSlices
			allTotals.sort((a, b) => { return b[0] - a[0]; });

			totals = allTotals.slice(0, maxSlices-1);
			let remaining = allTotals.slice(maxSlices-1);

			let sumOfRemaining = 0;
			remaining.map(d => {sumOfRemaining += d[0];});
			totals.push([sumOfRemaining, 'Rest']);
			this.colors[maxSlices-1] = 'grey';
		}

		s.labels = [];
		totals.map(d => {
			s.sliceTotals.push(round(d[0]));
			s.labels.push(d[1]);
		});

		s.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);

		this.center = {
			x: this.width / 2,
			y: this.height / 2
		};
	}

	renderLegend() {
		let s = this.state;
		this.legendArea.textContent = '';
		this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);

		let count = 0;
		let y = 0;
		this.legendTotals.map((d, i) => {
			let barWidth = 150;
			let divisor = Math.floor(
				(this.width - getExtraWidth(this.measures))/barWidth
			);
			if (this.legendTotals.length < divisor) {
				barWidth = this.width/this.legendTotals.length;
			}
			if(count > divisor) {
				count = 0;
				y += 20;
			}
			let x = barWidth * count + 5;
			let label = this.config.truncateLegends ? truncateString(s.labels[i], barWidth/10) : s.labels[i];
			let formatted = this.config.formatTooltipY ? this.config.formatTooltipY(d) : d;
			let dot = legendDot(
				x,
				y,
				5,
				this.colors[i],
				`${label}: ${formatted}`,
				false
			);
			this.legendArea.appendChild(dot);
			count++;
		});
	}
}

// Playing around with dates

const NO_OF_YEAR_MONTHS = 12;
const NO_OF_DAYS_IN_WEEK = 7;

const NO_OF_MILLIS = 1000;
const SEC_IN_DAY = 86400;

const MONTH_NAMES = ["January", "February", "March", "April", "May",
	"June", "July", "August", "September", "October", "November", "December"];


const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(date) {
	let result = new Date(date);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

function getYyyyMmDd(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		date.getFullYear(),
		(mm>9 ? '' : '0') + mm,
		(dd>9 ? '' : '0') + dd
	].join('-');
}

function clone(date) {
	return new Date(date.getTime());
}





// export function getMonthsBetween(startDate, endDate) {}

function getWeeksBetween(startDate, endDate) {
	let weekStartDate = setDayToSunday(startDate);
	return Math.ceil(getDaysBetween(weekStartDate, endDate) / NO_OF_DAYS_IN_WEEK);
}

function getDaysBetween(startDate, endDate) {
	let millisecondsPerDay = SEC_IN_DAY * NO_OF_MILLIS;
	return (treatAsUtc(endDate) - treatAsUtc(startDate)) / millisecondsPerDay;
}

function areInSameMonth(startDate, endDate) {
	return startDate.getMonth() === endDate.getMonth()
		&& startDate.getFullYear() === endDate.getFullYear();
}

function getMonthName(i, short=false) {
	let monthName = MONTH_NAMES[i];
	return short ? monthName.slice(0, 3) : monthName;
}

function getLastDateInMonth (month, year) {
	return new Date(year, month + 1, 0); // 0: last day in previous month
}

// mutates
function setDayToSunday(date) {
	let newDate = clone(date);
	const day = newDate.getDay();
	if(day !== 0) {
		addDays(newDate, (-1) * day);
	}
	return newDate;
}

// mutates
function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
}

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		constants,

		getData,
		makeElements,
		animateElements
	}) {
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.labels = [];

		this.layerClass = layerClass;
		this.layerClass = typeof(this.layerClass) === 'function'
			? this.layerClass() : this.layerClass;

		this.refresh();
	}

	refresh(data) {
		this.data = data || this.getData();
	}

	setup(parent) {
		this.layer = makeSVGGroup(this.layerClass, this.layerTransform, parent);
	}

	make() {
		this.render(this.data);
		this.oldData = this.data;
	}

	render(data) {
		this.store = this.makeElements(data);

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
		this.labels.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	update(animate = true) {
		this.refresh();
		let animateElements = [];
		if(animate) {
			animateElements = this.animateElements(this.data) || [];
		}
		return animateElements;
	}
}

let componentConfigs = {
	donutSlices: {
		layerClass: 'donut-slices',
		makeElements(data) {
			return data.sliceStrings.map((s, i) => {
				let slice = makePath(s, 'donut-path', data.colors[i], 'none', data.strokeWidth);
				slice.style.transition = 'transform .3s;';
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) => animatePathStr(slice, newData.sliceStrings[i]));
		},
	},
	pieSlices: {
		layerClass: 'pie-slices',
		makeElements(data) {
			return data.sliceStrings.map((s, i) =>{
				let slice = makePath(s, 'pie-path', 'none', data.colors[i]);
				slice.style.transition = 'transform .3s;';
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) =>
				animatePathStr(slice, newData.sliceStrings[i])
			);
		}
	},
	percentageBars: {
		layerClass: 'percentage-bars',
		makeElements(data) {
			return data.xPositions.map((x, i) =>{
				let y = 0;
				let bar = percentageBar(x, y, data.widths[i],
					this.constants.barHeight, this.constants.barDepth, data.colors[i]);
				return bar;
			});
		},

		animateElements(newData) {
			if(newData) return [];
		}
	},
	yAxis: {
		layerClass: 'y axis',
		makeElements(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos, shortenNumbers: this.constants.shortenNumbers})
			);
		},

		animateElements(newData) {
			let newPos = newData.positions;
			let newLabels = newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map((line, i) => {
				return translateHoriLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	xAxis: {
		layerClass: 'x axis',
		makeElements(data) {
			return data.positions.map((position, i) =>
				xLine(position, data.calcLabels[i], this.constants.height,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements(newData) {
			let newPos = newData.positions;
			let newLabels = newData.calcLabels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.calcLabels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				calcLabels: newLabels
			});

			return this.store.map((line, i) => {
				return translateVertLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	yMarkers: {
		layerClass: 'y-markers',
		makeElements(data) {
			return data.map(m =>
				yMarker(m.position, m.label, this.constants.width,
					{labelPos: m.options.labelPos, mode: 'span', lineType: 'dashed'})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.position);
			let newLabels = newData.map(d => d.label);
			let newOptions = newData.map(d => d.options);

			let oldPos = this.oldData.map(d => d.position);

			this.render(oldPos.map((pos, i) => {
				return {
					position: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
			}));

			return this.store.map((line, i) => {
				return translateHoriLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	yRegions: {
		layerClass: 'y-regions',
		makeElements(data) {
			return data.map(r =>
				yRegion(r.startPos, r.endPos, this.constants.width,
					r.label, {labelPos: r.options.labelPos})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.endPos);
			let newLabels = newData.map(d => d.label);
			let newStarts = newData.map(d => d.startPos);
			let newOptions = newData.map(d => d.options);

			let oldPos = this.oldData.map(d => d.endPos);
			let oldStarts = this.oldData.map(d => d.startPos);

			this.render(oldPos.map((pos, i) => {
				return {
					startPos: oldStarts[i],
					endPos: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
			}));

			let animateElements = [];

			this.store.map((rectGroup, i) => {
				animateElements = animateElements.concat(animateRegion(
					rectGroup, newStarts[i], newPos[i], oldPos[i]
				));
			});

			return animateElements;
		}
	},

	heatDomain: {
		layerClass: function() { return 'heat-domain domain-' + this.constants.index; },
		makeElements(data) {
			let {index, colWidth, rowHeight, squareSize, radius, xTranslate} = this.constants;
			let monthNameHeight = -12;
			let x = xTranslate, y = 0;

			this.serializedSubDomains = [];

			data.cols.map((week, weekNo) => {
				if(weekNo === 1) {
					this.labels.push(
						makeText('domain-name', x, monthNameHeight, getMonthName(index, true).toUpperCase(),
							{
								fontSize: 9
							}
						)
					);
				}
				week.map((day, i) => {
					if(day.fill) {
						let data = {
							'data-date': day.yyyyMmDd,
							'data-value': day.dataValue,
							'data-day': i
						};
						let square = heatSquare('day', x, y, squareSize, radius, day.fill, data);
						this.serializedSubDomains.push(square);
					}
					y += rowHeight;
				});
				y = 0;
				x += colWidth;
			});

			return this.serializedSubDomains;
		},

		animateElements(newData) {
			if(newData) return [];
		}
	},

	barGraph: {
		layerClass: function() { return 'dataset-units dataset-bars dataset-' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			this.unitType = 'bar';
			this.units = data.yPositions.map((y, j) => {
				return datasetBar(
					data.xPositions[j],
					y,
					data.barWidth,
					c.color,
					data.labels[j],
					j,
					data.offsets[j],
					{
						zeroLine: data.zeroLine,
						barsWidth: data.barsWidth,
						minHeight: c.minHeight
					}
				);
			});
			return this.units;
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newOffsets = newData.offsets;
			let newLabels = newData.labels;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldOffsets = this.oldData.offsets;
			let oldLabels = this.oldData.labels;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldOffsets, newOffsets] = equilizeNoOfElements(oldOffsets, newOffsets);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				offsets: oldOffsets,
				labels: newLabels,

				zeroLine: this.oldData.zeroLine,
				barsWidth: this.oldData.barsWidth,
				barWidth: this.oldData.barWidth,
			});

			let animateElements = [];

			this.store.map((bar, i) => {
				animateElements = animateElements.concat(animateBar(
					bar, newXPos[i], newYPos[i], newData.barWidth, newOffsets[i],
					{zeroLine: newData.zeroLine}
				));
			});

			return animateElements;
		}
	},

	lineGraph: {
		layerClass: function() { return 'dataset-units dataset-line dataset-' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			this.unitType = 'dot';
			this.paths = {};
			if(!c.hideLine) {
				this.paths = getPaths(
					data.xPositions,
					data.yPositions,
					c.color,
					{
						heatline: c.heatline,
						regionFill: c.regionFill,
						spline: c.spline
					},
					{
						svgDefs: c.svgDefs,
						zeroLine: data.zeroLine
					}
				);
			}

			this.units = [];
			if(!c.hideDots) {
				this.units = data.yPositions.map((y, j) => {
					return datasetDot(
						data.xPositions[j],
						y,
						data.radius,
						c.color,
						(c.valuesOverPoints ? data.values[j] : ''),
						j
					);
				});
			}

			return Object.values(this.paths).concat(this.units);
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newValues = newData.values;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldValues = this.oldData.values;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldValues, newValues] = equilizeNoOfElements(oldValues, newValues);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				values: newValues,

				zeroLine: this.oldData.zeroLine,
				radius: this.oldData.radius,
			});

			let animateElements = [];

			if(Object.keys(this.paths).length) {
				animateElements = animateElements.concat(animatePath(
					this.paths, newXPos, newYPos, newData.zeroLine, this.constants.spline));
			}

			if(this.units.length) {
				this.units.map((dot, i) => {
					animateElements = animateElements.concat(animateDot(
						dot, newXPos[i], newYPos[i]));
				});
			}

			return animateElements;
		}
	}
};

function getComponent(name, constants, getData) {
	let keys = Object.keys(componentConfigs).filter(k => name.includes(k));
	let config = componentConfigs[keys[0]];
	Object.assign(config, {
		constants: constants,
		getData: getData
	});
	return new ChartComponent(config);
}

class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';
		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		this.barOptions = options.barOptions || {};

		let b = this.barOptions;
		b.height = b.height || PERCENTAGE_BAR_DEFAULT_HEIGHT;
		b.depth = b.depth || PERCENTAGE_BAR_DEFAULT_DEPTH;

		m.paddings.right = 30;
		m.legendHeight = 60;
		m.baseHeight = (b.height + b.depth * 0.5) * 8;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'percentageBars',
				{
					barHeight: this.barOptions.height,
					barDepth: this.barOptions.depth,
				},
				function() {
					return {
						xPositions: s.xPositions,
						widths: s.widths,
						colors: this.colors
					};
				}.bind(this)
			]
		];

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	calc() {
		super.calc();
		let s = this.state;

		s.xPositions = [];
		s.widths = [];

		let xPos = 0;
		s.sliceTotals.map((value) => {
			let width = this.width * value / s.grandTotal;
			s.widths.push(width);
			s.xPositions.push(xPos);
			xPos += width;
		});
	}

	makeDataByIndex() { }

	bindTooltip() {
		let s = this.state;
		this.container.addEventListener('mousemove', (e) => {
			let bars = this.components.get('percentageBars').store;
			let bar = e.target;
			if(bars.includes(bar)) {

				let i = bars.indexOf(bar);
				let gOff = getOffset(this.container), pOff = getOffset(bar);

				let x = pOff.left - gOff.left + parseInt(bar.getAttribute('width'))/2;
				let y = pOff.top - gOff.top;
				let title = (this.formattedLabels && this.formattedLabels.length>0
					? this.formattedLabels[i] : this.state.labels[i]) + ': ';
				let fraction = s.sliceTotals[i]/s.grandTotal;

				this.tip.setValues(x, y, {name: title, value: (fraction*100).toFixed(1) + "%"});
				this.tip.showTip();
			}
		});
	}
}

class PieChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'pie';
		this.initTimeout = 0;
		this.init = 1;

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);

		this.hoverRadio = args.hoverRadio || 0.1;
		this.config.startAngle = args.startAngle || 0;

		this.clockWise = args.clockWise || false;
	}

	calc() {
		super.calc();
		let s = this.state;
		this.radius = (this.height > this.width ? this.center.x : this.center.y);

		const { radius, clockWise } = this;

		const prevSlicesProperties = s.slicesProperties || [];
		s.sliceStrings = [];
		s.slicesProperties = [];
		let curAngle = 180 - this.config.startAngle;
		s.sliceTotals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / s.grandTotal) * FULL_ANGLE;
			const largeArc = originDiffAngle > 180 ? 1: 0;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = getPositionByAngle(startAngle, radius);
			const endPosition = getPositionByAngle(endAngle, radius);

			const prevProperty = this.init && prevSlicesProperties[i];

			let curStart,curEnd;
			if(this.init) {
				curStart = prevProperty ? prevProperty.startPosition : startPosition;
				curEnd = prevProperty ? prevProperty.endPosition : startPosition;
			} else {
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath =
				originDiffAngle === 360
					? makeCircleStr(curStart, curEnd, this.center, this.radius, clockWise, largeArc)
					: makeArcPathStr(curStart, curEnd, this.center, this.radius, clockWise, largeArc);

			s.sliceStrings.push(curPath);
			s.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: s.grandTotal,
				startAngle,
				endAngle,
				angle: diffAngle
			});

		});
		this.init = 0;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'pieSlices',
				{ },
				function() {
					return {
						sliceStrings: s.sliceStrings,
						colors: this.colors
					};
				}.bind(this)
			]
		];

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	calTranslateByAngle(property){
		const{radius,hoverRadio} = this;
		const position = getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}

	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag) {
			transform(path, this.calTranslateByAngle(this.state.slicesProperties[i]));
			path.style.fill = lightenDarkenColor(color, 50);
			let g_off = getOffset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length > 0
				? this.formatted_labels[i] : this.state.labels[i]) + ': ';
			let percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
			this.tip.setValues(x, y, {name: title, value: percent + "%"});
			this.tip.showTip();
		} else {
			transform(path,'translate3d(0,0,0)');
			this.tip.hideTip();
			path.style.fill = color;
		}
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', this.mouseMove);
		this.container.addEventListener('mouseleave', this.mouseLeave);
	}

	mouseMove(e){
		const target = e.target;
		let slices = this.components.get('pieSlices').store;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		if(slices.includes(target)) {
			let i = slices.indexOf(target);
			this.hoverSlice(prevAcitve, prevIndex,false);
			this.curActiveSlice = target;
			this.curActiveSliceIndex = i;
			this.hoverSlice(target, i, true, e);
		} else {
			this.mouseLeave();
		}
	}

	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
}

function normalize(x) {
	// Calculates mantissa and exponent of a number
	// Returns normalized number and exponent
	// https://stackoverflow.com/q/9383593/6495043

	if(x===0) {
		return [0, 0];
	}
	if(isNaN(x)) {
		return {mantissa: -6755399441055744, exponent: 972};
	}
	var sig = x > 0 ? 1 : -1;
	if(!isFinite(x)) {
		return {mantissa: sig * 4503599627370496, exponent: 972};
	}

	x = Math.abs(x);
	var exp = Math.floor(Math.log10(x));
	var man = x/Math.pow(10, exp);

	return [sig * man, exp];
}

function getChartRangeIntervals(max, min=0) {
	let upperBound = Math.ceil(max);
	let lowerBound = Math.floor(min);
	let range = upperBound - lowerBound;

	let noOfParts = range;
	let partSize = 1;

	// To avoid too many partitions
	if(range > 5) {
		if(range % 2 !== 0) {
			upperBound++;
			// Recalc range
			range = upperBound - lowerBound;
		}
		noOfParts = range/2;
		partSize = 2;
	}

	// Special case: 1 and 2
	if(range <= 2) {
		noOfParts = 4;
		partSize = range/noOfParts;
	}

	// Special case: 0
	if(range === 0) {
		noOfParts = 5;
		partSize = 1;
	}

	let intervals = [];
	for(var i = 0; i <= noOfParts; i++){
		intervals.push(lowerBound + partSize * i);
	}
	return intervals;
}

function getChartIntervals(maxValue, minValue=0) {
	let [normalMaxValue, exponent] = normalize(maxValue);
	let normalMinValue = minValue ? minValue/Math.pow(10, exponent): 0;

	// Allow only 7 significant digits
	normalMaxValue = normalMaxValue.toFixed(6);

	let intervals = getChartRangeIntervals(normalMaxValue, normalMinValue);
	intervals = intervals.map(value => value * Math.pow(10, exponent));
	return intervals;
}

function calcChartIntervals(values, withMinimum=false) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	let maxValue = Math.max(...values);
	let minValue = Math.min(...values);

	// Exponent to be used for pretty print
	let exponent = 0, intervals = []; // eslint-disable-line no-unused-vars

	function getPositiveFirstIntervals(maxValue, absMinValue) {
		let intervals = getChartIntervals(maxValue);

		let intervalSize = intervals[1] - intervals[0];

		// Then unshift the negative values
		let value = 0;
		for(var i = 1; value < absMinValue; i++) {
			value += intervalSize;
			intervals.unshift((-1) * value);
		}
		return intervals;
	}

	// CASE I: Both non-negative

	if(maxValue >= 0 && minValue >= 0) {
		exponent = normalize(maxValue)[1];
		if(!withMinimum) {
			intervals = getChartIntervals(maxValue);
		} else {
			intervals = getChartIntervals(maxValue, minValue);
		}
	}

	// CASE II: Only minValue negative

	else if(maxValue > 0 && minValue < 0) {
		// `withMinimum` irrelevant in this case,
		// We'll be handling both sides of zero separately
		// (both starting from zero)
		// Because ceil() and floor() behave differently
		// in those two regions

		let absMinValue = Math.abs(minValue);

		if(maxValue >= absMinValue) {
			exponent = normalize(maxValue)[1];
			intervals = getPositiveFirstIntervals(maxValue, absMinValue);
		} else {
			// Mirror: maxValue => absMinValue, then change sign
			exponent = normalize(absMinValue)[1];
			let posIntervals = getPositiveFirstIntervals(absMinValue, maxValue);
			intervals = posIntervals.reverse().map(d => d * (-1));
		}

	}

	// CASE III: Both non-positive

	else if(maxValue <= 0 && minValue <= 0) {
		// Mirrored Case I:
		// Work with positives, then reverse the sign and array

		let pseudoMaxValue = Math.abs(minValue);
		let pseudoMinValue = Math.abs(maxValue);

		exponent = normalize(pseudoMaxValue)[1];
		if(!withMinimum) {
			intervals = getChartIntervals(pseudoMaxValue);
		} else {
			intervals = getChartIntervals(pseudoMaxValue, pseudoMinValue);
		}

		intervals = intervals.reverse().map(d => d * (-1));
	}

	return intervals;
}

function getZeroIndex(yPts) {
	let zeroIndex;
	let interval = getIntervalSize(yPts);
	if(yPts.indexOf(0) >= 0) {
		// the range has a given zero
		// zero-line on the chart
		zeroIndex = yPts.indexOf(0);
	} else if(yPts[0] > 0) {
		// Minimum value is positive
		// zero-line is off the chart: below
		let min = yPts[0];
		zeroIndex = (-1) * min / interval;
	} else {
		// Maximum value is negative
		// zero-line is off the chart: above
		let max = yPts[yPts.length - 1];
		zeroIndex = (-1) * max / interval + (yPts.length - 1);
	}
	return zeroIndex;
}



function getIntervalSize(orderedArray) {
	return orderedArray[1] - orderedArray[0];
}

function getValueRange(orderedArray) {
	return orderedArray[orderedArray.length-1] - orderedArray[0];
}

function scale(val, yAxis) {
	return floatTwo(yAxis.zeroLine - val * yAxis.scaleMultiplier);
}





function getClosestInArray(goal, arr, index = false) {
	let closest = arr.reduce(function(prev, curr) {
		return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
	}, []);

	return index ? arr.indexOf(closest) : closest;
}

function calcDistribution(values, distributionSize) {
	// Assume non-negative values,
	// implying distribution minimum at zero

	let dataMaxValue = Math.max(...values);

	let distributionStep = 1 / (distributionSize - 1);
	let distribution = [];

	for(var i = 0; i < distributionSize; i++) {
		let checkpoint = dataMaxValue * (distributionStep * i);
		distribution.push(checkpoint);
	}

	return distribution;
}

function getMaxCheckpoint(value, distribution) {
	return distribution.filter(d => d < value).length;
}

const COL_WIDTH = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;
const ROW_HEIGHT = COL_WIDTH;
// const DAY_INCR = 1;

class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);
		this.type = 'heatmap';

		this.countLabel = options.countLabel || '';

		let validStarts = ['Sunday', 'Monday'];
		let startSubDomain = validStarts.includes(options.startSubDomain)
			? options.startSubDomain : 'Sunday';
		this.startSubDomainIndex = validStarts.indexOf(startSubDomain);

		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;

		m.paddings.top = ROW_HEIGHT * 3;
		m.paddings.bottom = 0;
		m.legendHeight = ROW_HEIGHT * 2;
		m.baseHeight = ROW_HEIGHT * NO_OF_DAYS_IN_WEEK
			+ getExtraHeight(m);

		let d = this.data;
		let spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
		this.independentWidth = (getWeeksBetween(d.start, d.end)
			+ spacing) * COL_WIDTH + getExtraWidth(m);
	}

	updateWidth() {
		let spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
		let noOfWeeks = this.state.noOfWeeks ? this.state.noOfWeeks : 52;
		this.baseWidth = (noOfWeeks + spacing) * COL_WIDTH
			+ getExtraWidth(this.measures);
	}

	prepareData(data=this.data) {
		if(data.start && data.end && data.start > data.end) {
			throw new Error('Start date cannot be greater than end date.');
		}

		if(!data.start) {
			data.start = new Date();
			data.start.setFullYear( data.start.getFullYear() - 1 );
		}
		if(!data.end) { data.end = new Date(); }
		data.dataPoints = data.dataPoints || {};

		if(parseInt(Object.keys(data.dataPoints)[0]) > 100000) {
			let points = {};
			Object.keys(data.dataPoints).forEach(timestampSec$$1 => {
				let date = new Date(timestampSec$$1 * NO_OF_MILLIS);
				points[getYyyyMmDd(date)] = data.dataPoints[timestampSec$$1];
			});
			data.dataPoints = points;
		}

		return data;
	}

	calc() {
		let s = this.state;

		s.start = clone(this.data.start);
		s.end = clone(this.data.end);

		s.firstWeekStart = clone(s.start);
		s.noOfWeeks = getWeeksBetween(s.start, s.end);
		s.distribution = calcDistribution(
			Object.values(this.data.dataPoints), HEATMAP_DISTRIBUTION_SIZE);

		s.domainConfigs = this.getDomains();
	}

	setupComponents() {
		let s = this.state;
		let lessCol = this.discreteDomains ? 0 : 1;

		let componentConfigs = s.domainConfigs.map((config, i) => [
			'heatDomain',
			{
				index: config.index,
				colWidth: COL_WIDTH,
				rowHeight: ROW_HEIGHT,
				squareSize: HEATMAP_SQUARE_SIZE,
				radius: this.rawChartArgs.radius || 0,
				xTranslate: s.domainConfigs
					.filter((config, j) => j < i)
					.map(config => config.cols.length - lessCol)
					.reduce((a, b) => a + b, 0)
					* COL_WIDTH
			},
			function() {
				return s.domainConfigs[i];
			}.bind(this)

		]);

		this.components = new Map(componentConfigs
			.map((args, i) => {
				let component = getComponent(...args);
				return [args[0] + '-' + i, component];
			})
		);

		let y = 0;
		DAY_NAMES_SHORT.forEach((dayName, i) => {
			if([1, 3, 5].includes(i)) {
				let dayText = makeText('subdomain-name', -COL_WIDTH/2, y, dayName,
					{
						fontSize: HEATMAP_SQUARE_SIZE,
						dy: 8,
						textAnchor: 'end'
					}
				);
				this.drawArea.appendChild(dayText);
			}
			y += ROW_HEIGHT;
		});
	}

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}

		this.data = this.prepareData(data);
		this.draw();
		this.bindTooltip();
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', (e) => {
			this.components.forEach(comp => {
				let daySquares = comp.store;
				let daySquare = e.target;
				if(daySquares.includes(daySquare)) {

					let count = daySquare.getAttribute('data-value');
					let dateParts = daySquare.getAttribute('data-date').split('-');

					let month = getMonthName(parseInt(dateParts[1])-1, true);

					let gOff = this.container.getBoundingClientRect(), pOff = daySquare.getBoundingClientRect();

					let width = parseInt(e.target.getAttribute('width'));
					let x = pOff.left - gOff.left + width/2;
					let y = pOff.top - gOff.top;
					let value = count + ' ' + this.countLabel;
					let name = ' on ' + month + ' ' + dateParts[0] + ', ' + dateParts[2];

					this.tip.setValues(x, y, {name: name, value: value, valueFirst: 1}, []);
					this.tip.showTip();
				}
			});
		});
	}

	renderLegend() {
		this.legendArea.textContent = '';
		let x = 0;
		let y = ROW_HEIGHT;
		let radius = this.rawChartArgs.radius || 0;

		let lessText = makeText('subdomain-name', x, y, 'Less',
			{
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			}
		);
		x = (COL_WIDTH * 2) + COL_WIDTH/2;
		this.legendArea.appendChild(lessText);

		this.colors.slice(0, HEATMAP_DISTRIBUTION_SIZE).map((color, i) => {
			const square = heatSquare('heatmap-legend-unit', x + (COL_WIDTH + 3) * i,
				y, HEATMAP_SQUARE_SIZE, radius, color);
			this.legendArea.appendChild(square);
		});

		let moreTextX = x + HEATMAP_DISTRIBUTION_SIZE * (COL_WIDTH + 3) + COL_WIDTH/4;
		let moreText = makeText('subdomain-name', moreTextX, y, 'More',
			{
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			}
		);
		this.legendArea.appendChild(moreText);
	}

	getDomains() {
		let s = this.state;
		const [startMonth, startYear] = [s.start.getMonth(), s.start.getFullYear()];
		const [endMonth, endYear] = [s.end.getMonth(), s.end.getFullYear()];

		const noOfMonths = (endMonth - startMonth + 1) + (endYear - startYear) * 12;

		let domainConfigs = [];

		let startOfMonth = clone(s.start);
		for(var i = 0; i < noOfMonths; i++) {
			let endDate = s.end;
			if(!areInSameMonth(startOfMonth, s.end)) {
				let [month, year] = [startOfMonth.getMonth(), startOfMonth.getFullYear()];
				endDate = getLastDateInMonth(month, year);
			}
			domainConfigs.push(this.getDomainConfig(startOfMonth, endDate));

			addDays(endDate, 1);
			startOfMonth = endDate;
		}

		return domainConfigs;
	}

	getDomainConfig(startDate, endDate='') {
		let [month, year] = [startDate.getMonth(), startDate.getFullYear()];
		let startOfWeek = setDayToSunday(startDate); // TODO: Monday as well
		endDate = clone(endDate) || getLastDateInMonth(month, year);

		let domainConfig = {
			index: month,
			cols: []
		};

		addDays(endDate, 1);
		let noOfMonthWeeks = getWeeksBetween(startOfWeek, endDate);

		let cols = [], col;
		for(var i = 0; i < noOfMonthWeeks; i++) {
			col = this.getCol(startOfWeek, month);
			cols.push(col);

			startOfWeek = new Date(col[NO_OF_DAYS_IN_WEEK - 1].yyyyMmDd);
			addDays(startOfWeek, 1);
		}

		if(col[NO_OF_DAYS_IN_WEEK - 1].dataValue !== undefined) {
			addDays(startOfWeek, 1);
			cols.push(this.getCol(startOfWeek, month, true));
		}

		domainConfig.cols = cols;

		return domainConfig;
	}

	getCol(startDate, month, empty = false) {
		let s = this.state;

		// startDate is the start of week
		let currentDate = clone(startDate);
		let col = [];

		for(var i = 0; i < NO_OF_DAYS_IN_WEEK; i++, addDays(currentDate, 1)) {
			let config = {};

			// Non-generic adjustment for entire heatmap, needs state
			let currentDateWithinData = currentDate >= s.start && currentDate <= s.end;

			if(empty || currentDate.getMonth() !== month || !currentDateWithinData) {
				config.yyyyMmDd = getYyyyMmDd(currentDate);
			} else {
				config = this.getSubDomainConfig(currentDate);
			}
			col.push(config);
		}

		return col;
	}

	getSubDomainConfig(date) {
		let yyyyMmDd = getYyyyMmDd(date);
		let dataValue = this.data.dataPoints[yyyyMmDd];
		let config = {
			yyyyMmDd: yyyyMmDd,
			dataValue: dataValue || 0,
			fill: this.colors[getMaxCheckpoint(dataValue, this.state.distribution)]
		};
		return config;
	}
}

function dataPrep(data, type) {
	data.labels = data.labels || [];

	let datasetLength = data.labels.length;

	// Datasets
	let datasets = data.datasets;
	let zeroArray = new Array(datasetLength).fill(0);
	if(!datasets) {
		// default
		datasets = [{
			values: zeroArray
		}];
	}

	datasets.map(d=> {
		// Set values
		if(!d.values) {
			d.values = zeroArray;
		} else {
			// Check for non values
			let vals = d.values;
			vals = vals.map(val => (!isNaN(val) ? val : 0));

			// Trim or extend
			if(vals.length > datasetLength) {
				vals = vals.slice(0, datasetLength);
			} else {
				vals = fillArray(vals, datasetLength - vals.length, 0);
			}
		}

		// Set labels
		//

		// Set type
		if(!d.chartType ) {
			if(!AXIS_DATASET_CHART_TYPES.includes(type)) type === DEFAULT_AXIS_CHART_TYPE;
			d.chartType = type;
		}

	});

	// Markers

	// Regions
	// data.yRegions = data.yRegions || [];
	if(data.yRegions) {
		data.yRegions.map(d => {
			if(d.end < d.start) {
				[d.start, d.end] = [d.end, d.start];
			}
		});
	}

	return data;
}

function zeroDataPrep(realData) {
	let datasetLength = realData.labels.length;
	let zeroArray = new Array(datasetLength).fill(0);

	let zeroData = {
		labels: realData.labels.slice(0, -1),
		datasets: realData.datasets.map(d => {
			return {
				name: '',
				values: zeroArray.slice(0, -1),
				chartType: d.chartType
			};
		}),
	};

	if(realData.yMarkers) {
		zeroData.yMarkers = [
			{
				value: 0,
				label: ''
			}
		];
	}

	if(realData.yRegions) {
		zeroData.yRegions = [
			{
				start: 0,
				end: 0,
				label: ''
			}
		];
	}

	return zeroData;
}

function getShortenedLabels(chartWidth, labels=[], isSeries=true) {
	let allowedSpace = chartWidth / labels.length;
	if(allowedSpace <= 0) allowedSpace = 1;
	let allowedLetters = allowedSpace / DEFAULT_CHAR_WIDTH;

	let seriesMultiple;
	if(isSeries) {
		// Find the maximum label length for spacing calculations
		let maxLabelLength = Math.max(...labels.map(label => label.length));
		seriesMultiple = Math.ceil(maxLabelLength/allowedLetters);
	}

	let calcLabels = labels.map((label, i) => {
		label += "";
		if(label.length > allowedLetters) {

			if(!isSeries) {
				if(allowedLetters-3 > 0) {
					label = label.slice(0, allowedLetters-3) + " ...";
				} else {
					label = label.slice(0, allowedLetters) + '..';
				}
			} else {
				if(i % seriesMultiple !== 0) {
					label = "";
				}
			}
		}
		return label;
	});

	return calcLabels;
}

class AxisChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);

		this.barOptions = args.barOptions || {};
		this.lineOptions = args.lineOptions || {};

		this.type = args.type || 'line';
		this.init = 1;

		this.setup();
	}

	setMeasures() {
		if(this.data.datasets.length <= 1) {
			this.config.showLegend = 0;
			this.measures.paddings.bottom = 30;
		}
	}

	configure(options) {
		super.configure(options);

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

	prepareData(data=this.data) {
		return dataPrep(data, this.type);
	}

	prepareFirstData(data=this.data) {
		return zeroDataPrep(data);
	}

	calc(onlyWidthChange = false) {
		this.calcXPositions();
		if(!onlyWidthChange) {
			this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
		}
		this.makeDataByIndex();
	}

	calcXPositions() {
		let s = this.state;
		let labels = this.data.labels;
		s.datasetLength = labels.length;

		s.unitWidth = this.width/(s.datasetLength);
		// Default, as per bar, and mixed. Only line will be a special case
		s.xOffset = s.unitWidth/2;

		// // For a pure Line Chart
		// s.unitWidth = this.width/(s.datasetLength - 1);
		// s.xOffset = 0;

		s.xAxis = {
			labels: labels,
			positions: labels.map((d, i) =>
				floatTwo(s.xOffset + i * s.unitWidth)
			)
		};
	}

	calcYAxisParameters(dataValues, withMinimum = 'false') {
		const yPts = calcChartIntervals(dataValues, withMinimum);
		const scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
		const zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		this.state.yAxis = {
			labels: yPts,
			positions: yPts.map(d => zeroLine - d * scaleMultiplier),
			scaleMultiplier: scaleMultiplier,
			zeroLine: zeroLine,
		};

		// Dependent if above changes
		this.calcDatasetPoints();
		this.calcYExtremes();
		this.calcYRegions();
	}

	calcDatasetPoints() {
		let s = this.state;
		let scaleAll = values => values.map(val => scale(val, s.yAxis));

		s.datasets = this.data.datasets.map((d, i) => {
			let values = d.values;
			let cumulativeYs = d.cumulativeYs || [];
			return {
				name: d.name,
				index: i,
				chartType: d.chartType,

				values: values,
				yPositions: scaleAll(values),

				cumulativeYs: cumulativeYs,
				cumulativeYPos: scaleAll(cumulativeYs),
			};
		});
	}

	calcYExtremes() {
		let s = this.state;
		if(this.barOptions.stacked) {
			s.yExtremes = s.datasets[s.datasets.length - 1].cumulativeYPos;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		s.datasets.map(d => {
			d.yPositions.map((pos, j) => {
				if(pos < s.yExtremes[j]) {
					s.yExtremes[j] = pos;
				}
			});
		});
	}

	calcYRegions() {
		let s = this.state;
		if(this.data.yMarkers) {
			this.state.yMarkers = this.data.yMarkers.map(d => {
				d.position = scale(d.value, s.yAxis);
				if(!d.options) d.options = {};
				// if(!d.label.includes(':')) {
				// 	d.label += ': ' + d.value;
				// }
				return d;
			});
		}
		if(this.data.yRegions) {
			this.state.yRegions = this.data.yRegions.map(d => {
				d.startPos = scale(d.start, s.yAxis);
				d.endPos = scale(d.end, s.yAxis);
				if(!d.options) d.options = {};
				return d;
			});
		}
	}

	getAllYValues() {
		let key = 'values';

		if(this.barOptions.stacked) {
			key = 'cumulativeYs';
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.data.datasets.map((d, i) => {
				let values = this.data.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
			});
		}

		let allValueLists = this.data.datasets.map(d => d[key]);
		if(this.data.yMarkers) {
			allValueLists.push(this.data.yMarkers.map(d => d.value));
		}
		if(this.data.yRegions) {
			this.data.yRegions.map(d => {
				allValueLists.push([d.end, d.start]);
			});
		}

		return [].concat(...allValueLists);
	}

	setupComponents() {
		let componentConfigs = [
			[
				'yAxis',
				{
					mode: this.config.yAxisMode,
					width: this.width,
					shortenNumbers: this.config.shortenYAxisNumbers
					// pos: 'right'
				},
				function() {
					return this.state.yAxis;
				}.bind(this)
			],

			[
				'xAxis',
				{
					mode: this.config.xAxisMode,
					height: this.height,
					// pos: 'right'
				},
				function() {
					let s = this.state;
					s.xAxis.calcLabels = getShortenedLabels(this.width,
						s.xAxis.labels, this.config.xIsSeries);

					return s.xAxis;
				}.bind(this)
			],

			[
				'yRegions',
				{
					width: this.width,
					pos: 'right'
				},
				function() {
					return this.state.yRegions;
				}.bind(this)
			],
		];

		let barDatasets = this.state.datasets.filter(d => d.chartType === 'bar');
		let lineDatasets = this.state.datasets.filter(d => d.chartType === 'line');

		let barsConfigs = barDatasets.map(d => {
			let index = d.index;
			return [
				'barGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					stacked: this.barOptions.stacked,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
					minHeight: this.height * MIN_BAR_PERCENT_HEIGHT,
				},
				function() {
					let s = this.state;
					let d = s.datasets[index];
					let stacked = this.barOptions.stacked;

					let spaceRatio = this.barOptions.spaceRatio || BAR_CHART_SPACE_RATIO;
					let barsWidth = s.unitWidth * (1 - spaceRatio);
					let barWidth = barsWidth/(stacked ? 1 : barDatasets.length);

					let xPositions = s.xAxis.positions.map(x => x - barsWidth/2);
					if(!stacked) {
						xPositions = xPositions.map(p => p + barWidth * index);
					}

					let labels = new Array(s.datasetLength).fill('');
					if(this.config.valuesOverPoints) {
						if(stacked && d.index === s.datasets.length - 1) {
							labels = d.cumulativeYs;
						} else {
							labels = d.values;
						}
					}

					let offsets = new Array(s.datasetLength).fill(0);
					if(stacked) {
						offsets = d.yPositions.map((y, j) => y - d.cumulativeYPos[j]);
					}

					return {
						xPositions: xPositions,
						yPositions: d.yPositions,
						offsets: offsets,
						// values: d.values,
						labels: labels,

						zeroLine: s.yAxis.zeroLine,
						barsWidth: barsWidth,
						barWidth: barWidth,
					};
				}.bind(this)
			];
		});

		let lineConfigs = lineDatasets.map(d => {
			let index = d.index;
			return [
				'lineGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					svgDefs: this.svgDefs,
					heatline: this.lineOptions.heatline,
					regionFill: this.lineOptions.regionFill,
					spline: this.lineOptions.spline,
					hideDots: this.lineOptions.hideDots,
					hideLine: this.lineOptions.hideLine,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
				},
				function() {
					let s = this.state;
					let d = s.datasets[index];
					let minLine = s.yAxis.positions[0] < s.yAxis.zeroLine
						? s.yAxis.positions[0] : s.yAxis.zeroLine;

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: minLine,
						radius: this.lineOptions.dotSize || LINE_CHART_DOT_SIZE,
					};
				}.bind(this)
			];
		});

		let markerConfigs = [
			[
				'yMarkers',
				{
					width: this.width,
					pos: 'right'
				},
				function() {
					return this.state.yMarkers;
				}.bind(this)
			]
		];

		componentConfigs = componentConfigs.concat(barsConfigs, lineConfigs, markerConfigs);

		let optionals = ['yMarkers', 'yRegions'];
		this.dataUnitComponents = [];

		this.components = new Map(componentConfigs
			.filter(args => !optionals.includes(args[0]) || this.state[args[0]])
			.map(args => {
				let component = getComponent(...args);
				if(args[0].includes('lineGraph') || args[0].includes('barGraph')) {
					this.dataUnitComponents.push(component);
				}
				return [args[0], component];
			}));
	}

	makeDataByIndex() {
		this.dataByIndex = {};

		let s = this.state;
		let formatX = this.config.formatTooltipX;
		let formatY = this.config.formatTooltipY;
		let titles = s.xAxis.labels;

		titles.map((label, index) => {
			let values = this.state.datasets.map((set, i) => {
				let value = set.values[index];
				return {
					title: set.name,
					value: value,
					yPos: set.yPositions[index],
					color: this.colors[i],
					formatted: formatY ? formatY(value) : value,
				};
			});

			this.dataByIndex[index] = {
				label: label,
				formattedLabel: formatX ? formatX(label) : label,
				xPos: s.xAxis.positions[index],
				values: values,
				yExtreme: s.yExtremes[index],
			};
		});
	}

	bindTooltip() {
		// NOTE: could be in tooltip itself, as it is a given functionality for its parent
		this.container.addEventListener('mousemove', (e) => {
			let m = this.measures;
			let o = getOffset(this.container);
			let relX = e.pageX - o.left - getLeftOffset(m);
			let relY = e.pageY - o.top;

			if(relY < this.height + getTopOffset(m)
				&& relY >  getTopOffset(m)) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hideTip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		let s = this.state;
		if(!s.yExtremes) return;

		let index = getClosestInArray(relX, s.xAxis.positions, true);
		if (index >= 0) {
			let dbi = this.dataByIndex[index];

			this.tip.setValues(
				dbi.xPos + this.tip.offset.x,
				dbi.yExtreme + this.tip.offset.y,
				{name: dbi.formattedLabel, value: ''},
				dbi.values,
				index
			);

			this.tip.showTip();
		}
	}

	renderLegend() {
		let s = this.data;
		if(s.datasets.length > 1) {
			this.legendArea.textContent = '';
			s.datasets.map((d, i) => {
				let barWidth = AXIS_LEGEND_BAR_SIZE;
				// let rightEndPoint = this.baseWidth - this.measures.margins.left - this.measures.margins.right;
				// let multiplier = s.datasets.length - i;
				let rect = legendBar(
					// rightEndPoint - multiplier * barWidth,	// To right align
					barWidth * i,
					'0',
					barWidth,
					this.colors[i],
					d.name,
					this.config.truncateLegends);
				this.legendArea.appendChild(rect);
			});
		}
	}



	// Overlay
	makeOverlay() {
		if(this.init) {
			this.init = 0;
			return;
		}
		if(this.overlayGuides) {
			this.overlayGuides.forEach(g => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
			});
		}

		this.overlayGuides = this.dataUnitComponents.map(c => {
			return {
				type: c.unitType,
				overlay: undefined,
				units: c.units,
			};
		});

		if(this.state.currentIndex === undefined) {
			this.state.currentIndex = this.state.datasetLength - 1;
		}

		// Render overlays
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];

			d.overlay = makeOverlay[d.type](currentUnit);
			this.drawArea.appendChild(d.overlay);
		});
	}

	updateOverlayGuides() {
		if(this.overlayGuides) {
			this.overlayGuides.forEach(g => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
			});
		}
	}

	bindOverlay() {
		this.parent.addEventListener('data-select', () => {
			this.updateOverlay();
		});
	}

	bindUnits() {
		this.dataUnitComponents.map(c => {
			c.units.map(unit => {
				unit.addEventListener('click', () => {
					let index = unit.getAttribute('data-point-index');
					this.setCurrentDataPoint(index);
				});
			});
		});

		// Note: Doesn't work as tooltip is absolutely positioned
		this.tip.container.addEventListener('click', () => {
			let index = this.tip.container.getAttribute('data-point-index');
			this.setCurrentDataPoint(index);
		});
	}

	updateOverlay() {
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];
			updateOverlay[d.type](currentUnit, d.overlay);
		});
	}

	onLeftArrow() {
		this.setCurrentDataPoint(this.state.currentIndex - 1);
	}

	onRightArrow() {
		this.setCurrentDataPoint(this.state.currentIndex + 1);
	}

	getDataPoint(index=this.state.currentIndex) {
		let s = this.state;
		let data_point = {
			index: index,
			label: s.xAxis.labels[index],
			values: s.datasets.map(d => d.values[index])
		};
		return data_point;
	}

	setCurrentDataPoint(index) {
		let s = this.state;
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
		if(index === s.currentIndex) return;
		s.currentIndex = index;
		fire(this.parent, "data-select", this.getDataPoint());
	}



	// API
	addDataPoint(label, datasetValues, index=this.state.datasetLength) {
		super.addDataPoint(label, datasetValues, index);
		this.data.labels.splice(index, 0, label);
		this.data.datasets.map((d, i) => {
			d.values.splice(index, 0, datasetValues[i]);
		});
		this.update(this.data);
	}

	removeDataPoint(index = this.state.datasetLength-1) {
		if (this.data.labels.length <= 1) {
			return;
		}
		super.removeDataPoint(index);
		this.data.labels.splice(index, 1);
		this.data.datasets.map(d => {
			d.values.splice(index, 1);
		});
		this.update(this.data);
	}

	updateDataset(datasetValues, index=0) {
		this.data.datasets[index].values = datasetValues;
		this.update(this.data);
	}
	// addDataset(dataset, index) {}
	// removeDataset(index = 0) {}

	updateDatasets(datasets) {
		this.data.datasets.map((d, i) => {
			if(datasets[i]) {
				d.values = datasets[i];
			}
		});
		this.update(this.data);
	}

	// updateDataPoint(dataPoint, index = 0) {}
	// addDataPoint(dataPoint, index = 0) {}
	// removeDataPoint(index = 0) {}
}

class DonutChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'donut';
		this.initTimeout = 0;
		this.init = 1;

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);

		this.hoverRadio = args.hoverRadio || 0.1;
		this.config.startAngle = args.startAngle || 0;

		this.clockWise = args.clockWise || false;
		this.strokeWidth = args.strokeWidth || 30;
	}

	calc() {
		super.calc();
		let s = this.state;
		this.radius =
			this.height > this.width
				? this.center.x - this.strokeWidth / 2
				: this.center.y - this.strokeWidth / 2;

		const { radius, clockWise } = this;

		const prevSlicesProperties = s.slicesProperties || [];
		s.sliceStrings = [];
		s.slicesProperties = [];
		let curAngle = 180 - this.config.startAngle;

		s.sliceTotals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / s.grandTotal) * FULL_ANGLE;
			const largeArc = originDiffAngle > 180 ? 1: 0;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = getPositionByAngle(startAngle, radius);
			const endPosition = getPositionByAngle(endAngle, radius);

			const prevProperty = this.init && prevSlicesProperties[i];

			let curStart,curEnd;
			if(this.init) {
				curStart = prevProperty ? prevProperty.startPosition : startPosition;
				curEnd = prevProperty ? prevProperty.endPosition : startPosition;
			} else {
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath =
				originDiffAngle === 360
					? makeStrokeCircleStr(curStart, curEnd, this.center, this.radius, this.clockWise, largeArc)
					: makeArcStrokePathStr(curStart, curEnd, this.center, this.radius, this.clockWise, largeArc);

			s.sliceStrings.push(curPath);
			s.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: s.grandTotal,
				startAngle,
				endAngle,
				angle: diffAngle
			});

		});
		this.init = 0;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'donutSlices',
				{ },
				function() {
					return {
						sliceStrings: s.sliceStrings,
						colors: this.colors,
						strokeWidth: this.strokeWidth,
					};
				}.bind(this)
			]
		];

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	calTranslateByAngle(property){
		const{ radius, hoverRadio } = this;
		const position = getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}

	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag) {
			transform(path, this.calTranslateByAngle(this.state.slicesProperties[i]));
			path.style.stroke = lightenDarkenColor(color, 50);
			let g_off = getOffset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length > 0
				? this.formatted_labels[i] : this.state.labels[i]) + ': ';
			let percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
			this.tip.setValues(x, y, {name: title, value: percent + "%"});
			this.tip.showTip();
		} else {
			transform(path,'translate3d(0,0,0)');
			this.tip.hideTip();
			path.style.stroke = color;
		}
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', this.mouseMove);
		this.container.addEventListener('mouseleave', this.mouseLeave);
	}

	mouseMove(e){
		const target = e.target;
		let slices = this.components.get('donutSlices').store;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		if(slices.includes(target)) {
			let i = slices.indexOf(target);
			this.hoverSlice(prevAcitve, prevIndex,false);
			this.curActiveSlice = target;
			this.curActiveSliceIndex = i;
			this.hoverSlice(target, i, true, e);
		} else {
			this.mouseLeave();
		}
	}

	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
}

// import MultiAxisChart from './charts/MultiAxisChart';
const chartTypes = {
	bar: AxisChart,
	line: AxisChart,
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart,
	donut: DonutChart,
};

function getChartByType(chartType = 'line', parent, options) {
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

class Chart {
	constructor(parent, options) {
		return getChartByType(options.type, parent, options);
	}
}

export { Chart, PercentageChart, PieChart, Heatmap, AxisChart };
