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
		// this.showTip();
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

			let li = $.create('li', {
				styles: {
					'border-top': `3px solid ${color}`
				},
				innerHTML: `<strong style="display: block;">${ set.value === 0 || set.value ? set.value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.dataPointList.appendChild(li);
		});
	}

	calcPosition() {
		let width = this.container.offsetWidth;

		this.top = this.y - this.container.offsetHeight;
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

const VERT_SPACE_OUTSIDE_BASE_CHART = 50;
const TRANSLATE_Y_BASE_CHART = 20;
const LEFT_MARGIN_BASE_CHART = 60;
const RIGHT_MARGIN_BASE_CHART = 40;
const Y_AXIS_MARGIN = 60;

const INIT_CHART_UPDATE_TIMEOUT = 700;
const CHART_POST_ANIMATE_TIMEOUT = 400;

const DEFAULT_AXIS_CHART_TYPE = 'line';
const AXIS_DATASET_CHART_TYPES = ['line', 'bar'];

const BAR_CHART_SPACE_RATIO = 0.5;
const MIN_BAR_PERCENT_HEIGHT = 0.01;

const LINE_CHART_DOT_SIZE = 4;
const DOT_OVERLAY_SIZE_INCR = 4;

const DEFAULT_CHAR_WIDTH = 7;

// Universal constants
const ANGLE_RATIO = Math.PI / 180;
const FULL_ANGLE = 360;

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



function getPositionByAngle(angle, radius) {
	return {
		x:Math.sin(angle * ANGLE_RATIO) * radius,
		y:Math.cos(angle * ANGLE_RATIO) * radius,
	};
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

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const FONT_SIZE = 10;
const BASE_LINE_COLOR = '#dadada';

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

function makeSVGGroup(parent, className, transform='') {
	return createSVG('g', {
		className: className,
		inside: parent,
		transform: transform
	});
}



function makePath(pathStr, className='', stroke='none', fill='none') {
	return createSVG('path', {
		className: className,
		d: pathStr,
		styles: {
			stroke: stroke,
			fill: fill
		}
	});
}

function makeArcPathStr(startPosition, endPosition, center, radius, clockWise=1){
	let [arcStartX, arcStartY] = [center.x + startPosition.x, center.y + startPosition.y];
	let [arcEndX, arcEndY] = [center.x + endPosition.x, center.y + endPosition.y];

	return `M${center.x} ${center.y}
		L${arcStartX} ${arcStartY}
		A ${radius} ${radius} 0 0 ${clockWise ? 1 : 0}
		${arcEndX} ${arcEndY} z`;
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

function makeHeatSquare(className, x, y, size, fill='none', data={}) {
	let args = {
		className: className,
		x: x,
		y: y,
		width: size,
		height: size,
		fill: fill
	};

	Object.keys(data).map(key => {
		args[key] = data[key];
	});

	return createSVG("rect", args);
}

function makeText(className, x, y, content) {
	return createSVG('text', {
		className: className,
		x: x,
		y: y,
		dy: (FONT_SIZE / 2) + 'px',
		'font-size': FONT_SIZE + 'px',
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
		lineType: options.lineType
	});
}

function xLine(x, label, height, options={}) {
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
	let labelSvg = createSVG('text', {
		className: 'chart-label',
		x: width - getStringWidth(label, 5) - LABEL_MARGIN,
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

function yRegion(y1, y2, width, label) {
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

	let labelSvg = createSVG('text', {
		className: 'chart-label',
		x: width - getStringWidth(label+"", 4.5) - LABEL_MARGIN,
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

	let rect = createSVG('rect', {
		className: `bar mini`,
		style: `fill: ${color}`,
		'data-point-index': index,
		x: x,
		y: y,
		width: width,
		height: height || meta.minHeight // TODO: correct y for positive min height
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

		// TODO: use zeroLine OR minimum
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
	}
};

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

const DEFAULT_COLORS = ['light-blue', 'blue', 'violet', 'red', 'orange',
	'yellow', 'green', 'light-green', 'purple', 'magenta', 'light-grey', 'dark-grey'];

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
	// https://stackoverflow.com/a/8027444/6495043
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(string);
}

const getColor = (color) => {
	return PRESET_COLOR_MAP[color] || color;
};

const ALL_CHART_TYPES = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

const COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter', 'percentage', 'pie'],
	line: ['scatter', 'bar', 'percentage', 'pie'],
	pie: ['line', 'scatter', 'percentage', 'bar'],
	scatter: ['line', 'bar', 'percentage', 'pie'],
	percentage: ['bar', 'line', 'scatter', 'pie'],
	heatmap: []
};

// Needs structure as per only labels/datasets
const COLOR_COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter'],
	line: ['scatter', 'bar'],
	pie: ['percentage'],
	scatter: ['line', 'bar'],
	percentage: ['pie'],
	heatmap: []
};

function getDifferentChart(type, current_type, parent, args) {
	if(type === current_type) return;

	if(!ALL_CHART_TYPES.includes(type)) {
		console.error(`'${type}' is not a valid chart type.`);
	}

	if(!COMPATIBLE_CHARTS[current_type].includes(type)) {
		console.error(`'${current_type}' chart cannot be converted to a '${type}' chart.`);
	}

	// whether the new chart can use the existing colors
	const useColor = COLOR_COMPATIBLE_CHARTS[current_type].includes(type);

	// Okay, this is anticlimactic
	// this function will need to actually be 'changeChartType(type)'
	// that will update only the required elements, but for now ...

	args.type = type;
	args.colors = useColor ? args.colors : undefined;

	return new Chart(parent, args);
}

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

function animatePath(paths, newXList, newYList, zeroLine) {
	let pathComponents = [];

	let pointsStr = newYList.map((y, i) => (newXList[i] + ',' + y));
	let pathStr = pointsStr.join("L");

	const animPath = [paths.path, {d:"M"+pathStr}, PATH_ANIM_DUR, STD_EASING];
	pathComponents.push(animPath);

	if(paths.region) {
		let regStartPt = `${newXList[0]},${zeroLine}L`;
		let regEndPt = `L${newXList.slice(-1)[0]}, ${zeroLine}`;

		const animRegion = [
			paths.region,
			{d:"M" + regStartPt + pathStr + regEndPt},
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

class BaseChart {
	constructor(parent, options) {
		this.rawChartArgs = options;

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.title = options.title || '';
		this.subtitle = options.subtitle || '';
		this.argHeight = options.height || 240;
		this.type = options.type || '';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);
		this.colors = [];
		this.config = {
			showTooltip: 1, // calculate
			showLegend: options.showLegend || 1,
			isNavigable: options.isNavigable || 0,
			animate: 1
		};
		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if(this.config.isNavigable) {
			this.overlays = [];
		}

		this.configure(options);
	}

	configure(args) {
		this.setColors(args);
		this.setMargins();

		// Bind window events
		window.addEventListener('resize', () => this.draw(true));
		window.addEventListener('orientationchange', () => this.draw(true));
	}

	setColors() {
		let args = this.rawChartArgs;

		// Needs structure as per only labels/datasets, from config
		const list = args.type === 'percentage' || args.type === 'pie'
			? args.data.labels
			: args.data.datasets;

		if(!args.colors || (list && args.colors.length < list.length)) {
			this.colors = DEFAULT_COLORS;
		} else {
			this.colors = args.colors;
		}

		this.colors = this.colors.map(color => getColor(color));
	}

	setMargins() {
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - VERT_SPACE_OUTSIDE_BASE_CHART;
		this.translateY = TRANSLATE_Y_BASE_CHART;

		// Horizontal margins
		this.leftMargin = LEFT_MARGIN_BASE_CHART;
		this.rightMargin = RIGHT_MARGIN_BASE_CHART;
	}

	validate() {
		return true;
	}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.makeContainer();
		this.makeTooltip();

		this.draw(false, true);
	}

	setupComponents() {
		this.components = new Map();
	}

	makeContainer() {
		this.container = $.create('div', {
			className: 'chart-container',
			innerHTML: `<h6 class="title">${this.title}</h6>
				<h6 class="sub-title uppercase">${this.subtitle}</h6>
				<div class="frappe-chart graphics"></div>
				<div class="graph-stats-container"></div>`
		});

		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';
		this.parent.appendChild(this.container);

		this.chartWrapper = this.container.querySelector('.frappe-chart');
		this.statsWrapper = this.container.querySelector('.graph-stats-container');
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.chartWrapper,
			colors: this.colors
		});
		this.bindTooltip();
	}

	bindTooltip() {}

	draw(onlyWidthChange=false, init=false) {
		this.calcWidth();
		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update();}, this.initTimeout);
		}

		if(!onlyWidthChange) {
			this.renderLegend();
		}

		this.setupNavigation(init);
	}

	calcWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - (this.leftMargin + this.rightMargin);
	}

	update(data=this.data) {
		this.data = this.prepareData(data);
		this.calc(); // builds state
		this.render();
	}

	prepareData(data=this.data) {
		return data;
	}

	prepareFirstData(data=this.data) {
		return data;
	}

	calc() {} // builds state

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
			runSMILAnimation(this.chartWrapper, this.svg, elementsToAnimate);
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
			// if(!this.overlayGuides){
			this.makeOverlay();
			this.bindUnits();
			// } else {
			// 	this.updateOverlay();
			// }
		}
	}

	makeChartArea() {
		if(this.svg) {
			this.chartWrapper.removeChild(this.svg);
		}
		this.svg = makeSVGContainer(
			this.chartWrapper,
			'chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		// I WISH !!!
		// this.svg = makeSVGGroup(
		// 	svgContainer,
		// 	'flipped-coord-system',
		// 	`translate(0, ${this.baseHeight}) scale(1, -1)`
		// );

		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.leftMargin}, ${this.translateY})`
		);
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
				if(isElementInViewport(this.chartWrapper)) {
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

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.parent, this.rawChartArgs);
	}
}

class AggregationChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
	}

	configure(args) {
		super.configure(args);

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
		}).filter(d => { return d[0] > 0; }); // keep only positive results

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
			s.sliceTotals.push(d[0]);
			s.labels.push(d[1]);
		});
	}

	renderLegend() {
		let s = this.state;

		this.statsWrapper.textContent = '';

		this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);

		let xValues = s.labels;
		this.legendTotals.map((d, i) => {
			if(d) {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.statsWrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background: ${this.colors[i]}"></i>
					<span class="text-muted">${xValues[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}

class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';

		this.setup();
	}

	makeChartArea() {
		this.chartWrapper.className += ' ' + 'graph-focus-margin';
		this.chartWrapper.style.marginTop = '45px';

		this.statsWrapper.className += ' ' + 'graph-focus-margin';
		this.statsWrapper.style.marginBottom = '30px';
		this.statsWrapper.style.paddingTop = '0px';

		this.svg = $.create('div', {
			className: 'div',
			inside: this.chartWrapper
		});

		this.chart = $.create('div', {
			className: 'progress-chart',
			inside: this.svg
		});

		this.percentageBar = $.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	render() {
		let s = this.state;
		this.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);
		s.slices = [];
		s.sliceTotals.map((total, i) => {
			let slice = $.create('div', {
				className: `progress-bar`,
				'data-index': i,
				inside: this.percentageBar,
				styles: {
					background: this.colors[i],
					width: total*100/this.grandTotal + "%"
				}
			});
			s.slices.push(slice);
		});
	}

	bindTooltip() {
		let s = this.state;

		this.chartWrapper.addEventListener('mousemove', (e) => {
			let slice = e.target;
			if(slice.classList.contains('progress-bar')) {

				let i = slice.getAttribute('data-index');
				let gOff = getOffset(this.chartWrapper), pOff = getOffset(slice);

				let x = pOff.left - gOff.left + slice.offsetWidth/2;
				let y = pOff.top - gOff.top - 6;
				let title = (this.formattedLabels && this.formattedLabels.length>0
					? this.formattedLabels[i] : this.state.labels[i]) + ': ';
				let percent = (s.sliceTotals[i]*100/this.grandTotal).toFixed(1);

				this.tip.setValues(x, y, {name: title, value: percent + "%"});
				this.tip.showTip();
			}
		});
	}
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

		this.layerClass = layerClass;
		this.layerClass = typeof(this.layerClass) === 'function'
			? this.layerClass() : this.layerClass;

		this.refresh();
	}

	refresh(data) {
		this.data = data || this.getData();
	}

	setup(parent) {
		this.layer = makeSVGGroup(parent, this.layerClass, this.layerTransform);
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
	}

	update(animate = true) {
		this.refresh();
		let animateElements = [];
		if(animate) {
			animateElements = this.animateElements(this.data);
		}
		return animateElements;
	}
}

let componentConfigs = {
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
	yAxis: {
		layerClass: 'y axis',
		makeElements(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos})
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
			return data.map(marker =>
				yMarker(marker.position, marker.label, this.constants.width,
					{pos:'right', mode: 'span', lineType: 'dashed'})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.position);
			let newLabels = newData.map(d => d.label);

			let oldPos = this.oldData.map(d => d.position);

			this.render(oldPos.map((pos, i) => {
				return {
					position: oldPos[i],
					label: newLabels[i]
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
			return data.map(region =>
				yRegion(region.startPos, region.endPos, this.constants.width,
					region.label)
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.endPos);
			let newLabels = newData.map(d => d.label);
			let newStarts = newData.map(d => d.startPos);

			let oldPos = this.oldData.map(d => d.endPos);
			let oldStarts = this.oldData.map(d => d.startPos);

			this.render(oldPos.map((pos, i) => {
				return {
					startPos: oldStarts[i],
					endPos: oldPos[i],
					label: newLabels[i]
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
						regionFill: c.regionFill
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
					this.paths, newXPos, newYPos, newData.zeroLine));
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

class PieChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'pie';
		this.initTimeout = 0;

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

	prepareFirstData(data=this.data) {
		this.init = 1;
		return data;
	}

	calc() {
		super.calc();
		let s = this.state;

		this.center = {
			x: this.width / 2,
			y: this.height / 2
		};
		this.radius = (this.height > this.width ? this.center.x : this.center.y);

		s.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);

		this.calcSlices();
	}

	calcSlices() {
		let s = this.state;
		const { radius, clockWise } = this;

		const prevSlicesProperties = s.slicesProperties || [];
		s.sliceStrings = [];
		s.slicesProperties = [];
		let curAngle = 180 - this.config.startAngle;

		s.sliceTotals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / s.grandTotal) * FULL_ANGLE;
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
			const curPath = makeArcPathStr(curStart, curEnd, this.center, this.radius, this.clockWise);

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
		this.chartWrapper.addEventListener('mousemove', this.mouseMove);
		this.chartWrapper.addEventListener('mouseleave', this.mouseLeave);
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

// Playing around with dates

// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(dateStr) {
	let result = new Date(dateStr);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

function getDdMmYyyy(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		(dd>9 ? '' : '0') + dd,
		(mm>9 ? '' : '0') + mm,
		date.getFullYear()
	].join('-');
}

function getWeeksBetween(startDateStr, endDateStr) {
	return Math.ceil(getDaysBetween(startDateStr, endDateStr) / 7);
}

function getDaysBetween(startDateStr, endDateStr) {
	let millisecondsPerDay = 24 * 60 * 60 * 1000;
	return (treatAsUtc(endDateStr) - treatAsUtc(startDateStr)) / millisecondsPerDay;
}

// mutates
function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
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
			intervals = posIntervals.map(d => d * (-1));
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

class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);

		this.type = 'heatmap';

		this.domain = options.domain || '';
		this.subdomain = options.subdomain || '';
		this.data = options.data || {};
		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;
		this.countLabel = options.countLabel || '';

		let today = new Date();
		this.start = options.start || addDays(today, 365);

		let legendColors = (options.legendColors || []).slice(0, 5);
		this.legendColors = this.validate_colors(legendColors)
			? legendColors
			: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		// Fixed 5-color theme,
		// More colors are difficult to parse visually
		this.distribution_size = 5;

		this.translateX = 0;
		this.setup();
	}

	setMargins() {
		super.setMargins();
		this.leftMargin = 10;
		this.translateY = 10;
	}

	validate_colors(colors) {
		if(colors.length < 5) return 0;

		let valid = 1;
		colors.forEach(function(string) {
			if(!isValidColor(string)) {
				valid = 0;
				console.warn('"' + string + '" is not a valid color.');
			}
		}, this);

		return valid;
	}

	configure() {
		super.configure();
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.firstWeekStart = new Date(this.start.toDateString());
		this.lastWeekStart = new Date(this.today.toDateString());
		if(this.firstWeekStart.getDay() !== 7) {
			addDays(this.firstWeekStart, (-1) * this.firstWeekStart.getDay());
		}
		if(this.lastWeekStart.getDay() !== 7) {
			addDays(this.lastWeekStart, (-1) * this.lastWeekStart.getDay());
		}
		this.no_of_cols = getWeeksBetween(this.firstWeekStart + '', this.lastWeekStart + '') + 1;
	}

	calcWidth() {
		this.baseWidth = (this.no_of_cols + 3) * 12 ;

		if(this.discreteDomains) {
			this.baseWidth += (12 * 12);
		}
	}

	makeChartArea() {
		super.makeChartArea();
		this.domainLabelGroup = makeSVGGroup(this.drawArea,
			'domain-label-group chart-label');

		this.dataGroups = makeSVGGroup(this.drawArea,
			'data-groups',
			`translate(0, 20)`
		);

		this.container.querySelector('.title').style.display = 'None';
		this.container.querySelector('.sub-title').style.display = 'None';
		this.container.querySelector('.graph-stats-container').style.display = 'None';
		this.chartWrapper.style.marginTop = '0px';
		this.chartWrapper.style.paddingTop = '0px';
	}

	calc() {

		let dataValues = Object.keys(this.data).map(key => this.data[key]);
		this.distribution = calcDistribution(dataValues, this.distribution_size);

		this.monthNames = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
	}

	render() {
		this.renderAllWeeksAndStoreXValues(this.no_of_cols);
	}

	renderAllWeeksAndStoreXValues(no_of_weeks) {
		// renderAllWeeksAndStoreXValues
		this.domainLabelGroup.textContent = '';
		this.dataGroups.textContent = '';

		let currentWeekSunday = new Date(this.firstWeekStart);
		this.weekCol = 0;
		this.currentMonth = currentWeekSunday.getMonth();

		this.months = [this.currentMonth + ''];
		this.monthWeeks = {}, this.monthStartPoints = [];
		this.monthWeeks[this.currentMonth] = 0;
		this.monthStartPoints.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let dataGroup, monthChange = 0;
			let day = new Date(currentWeekSunday);

			[dataGroup, monthChange] = this.get_week_squares_group(day, this.weekCol);
			this.dataGroups.appendChild(dataGroup);
			this.weekCol += 1 + parseInt(this.discreteDomains && monthChange);
			this.monthWeeks[this.currentMonth]++;
			if(monthChange) {
				this.currentMonth = (this.currentMonth + 1) % 12;
				this.months.push(this.currentMonth + '');
				this.monthWeeks[this.currentMonth] = 1;
			}
			addDays(currentWeekSunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(currentDate, index) {
		const noOfWeekdays = 7;
		const squareSide = 10;
		const cellPadding = 2;
		const step = 1;
		const todayTime = this.today.getTime();

		let monthChange = 0;
		let weekColChange = 0;

		let dataGroup = makeSVGGroup(this.dataGroups, 'data-group');

		for(var y = 0, i = 0; i < noOfWeekdays; i += step, y += (squareSide + cellPadding)) {
			let dataValue = 0;
			let colorIndex = 0;

			let currentTimestamp = currentDate.getTime()/1000;
			let timestamp = Math.floor(currentTimestamp - (currentTimestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				dataValue = this.data[timestamp];
			}

			if(this.data[Math.round(timestamp)]) {
				dataValue = this.data[Math.round(timestamp)];
			}

			if(dataValue) {
				colorIndex = getMaxCheckpoint(dataValue, this.distribution);
			}

			let x = 13 + (index + weekColChange) * 12;

			let dataAttr = {
				'data-date': getDdMmYyyy(currentDate),
				'data-value': dataValue,
				'data-day': currentDate.getDay()
			};

			let heatSquare = makeHeatSquare('day', x, y, squareSide,
				this.legendColors[colorIndex], dataAttr);

			dataGroup.appendChild(heatSquare);

			let nextDate = new Date(currentDate);
			addDays(nextDate, 1);
			if(nextDate.getTime() > todayTime) break;


			if(nextDate.getMonth() - currentDate.getMonth()) {
				monthChange = 1;
				if(this.discreteDomains) {
					weekColChange = 1;
				}

				this.monthStartPoints.push(13 + (index + weekColChange) * 12);
			}
			currentDate = nextDate;
		}

		return [dataGroup, monthChange];
	}

	render_month_labels() {
		// this.first_month_label = 1;
		// if (this.firstWeekStart.getDate() > 8) {
		// 	this.first_month_label = 0;
		// }
		// this.last_month_label = 1;

		// let first_month = this.months.shift();
		// let first_month_start = this.monthStartPoints.shift();
		// render first month if

		// let last_month = this.months.pop();
		// let last_month_start = this.monthStartPoints.pop();
		// render last month if

		this.months.shift();
		this.monthStartPoints.shift();
		this.months.pop();
		this.monthStartPoints.pop();

		this.monthStartPoints.map((start, i) => {
			let month_name =  this.monthNames[this.months[i]].substring(0, 3);
			let text = makeText('y-value-text', start+12, 10, month_name);
			this.domainLabelGroup.appendChild(text);
		});
	}

	bindTooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let dateParts = e.target.getAttribute('data-date').split('-');

				let month = this.monthNames[parseInt(dateParts[1])-1].substring(0, 3);

				let gOff = this.chartWrapper.getBoundingClientRect(), pOff = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = pOff.left - gOff.left + (width+2)/2;
				let y = pOff.top - gOff.top - (width+2)/2;
				let value = count + ' ' + this.countLabel;
				let name = ' on ' + month + ' ' + dateParts[0] + ', ' + dateParts[2];

				this.tip.setValues(x, y, {name: name, value: value, valueFirst: 1}, []);
				this.tip.showTip();
			});
		});
	}

	update(data) {
		super.update(data);
		this.bindTooltip();
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
	let allowedLetters = allowedSpace / DEFAULT_CHAR_WIDTH;

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
				let multiple = Math.ceil(label.length/allowedLetters);
				if(i % multiple !== 0) {
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

	configure(args) {
		super.configure();

		args.axisOptions = args.axisOptions || {};
		args.tooltipOptions = args.tooltipOptions || {};

		this.config.xAxisMode = args.axisOptions.xAxisMode || 'span';
		this.config.yAxisMode = args.axisOptions.yAxisMode || 'span';
		this.config.xIsSeries = args.axisOptions.xIsSeries || 0;

		this.config.formatTooltipX = args.tooltipOptions.formatTooltipX;
		this.config.formatTooltipY = args.tooltipOptions.formatTooltipY;

		this.config.valuesOverPoints = args.valuesOverPoints;
	}

	setMargins() {
		super.setMargins();
		this.leftMargin = Y_AXIS_MARGIN;
		this.rightMargin = Y_AXIS_MARGIN;
	}

	prepareData(data=this.data) {
		return dataPrep(data, this.type);
	}

	prepareFirstData(data=this.data) {
		return zeroDataPrep(data);
	}

	calc(onlyWidthChange = false) {
		this.calcXPositions();
		if(onlyWidthChange) return;
		this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
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
				return d;
			});
		}
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever
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
					hideDots: this.lineOptions.hideDots,
					hideLine: this.lineOptions.hideLine,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
				},
				function() {
					let s = this.state;
					let d = s.datasets[index];

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: s.yAxis.zeroLine,
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

	bindTooltip() {
		// NOTE: could be in tooltip itself, as it is a given functionality for its parent
		this.chartWrapper.addEventListener('mousemove', (e) => {
			let o = getOffset(this.chartWrapper);
			let relX = e.pageX - o.left - this.leftMargin;
			let relY = e.pageY - o.top - this.translateY;

			if(relY < this.height + this.translateY * 2) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hideTip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		let s = this.state;
		if(!s.yExtremes) return;

		let formatY = this.config.formatTooltipY;
		let formatX = this.config.formatTooltipX;

		let titles = s.xAxis.labels;
		if(formatX && formatX(titles[0])) {
			titles = titles.map(d=>formatX(d));
		}

		formatY = formatY && formatY(s.yAxis.labels[0]) ? formatY : 0;

		for(var i=s.datasetLength - 1; i >= 0 ; i--) {
			let xVal = s.xAxis.positions[i];
			// let delta = i === 0 ? s.unitWidth : xVal - s.xAxis.positions[i-1];
			if(relX > xVal - s.unitWidth/2) {
				let x = xVal + this.leftMargin;
				let y = s.yExtremes[i] + this.translateY;

				let values = this.data.datasets.map((set, j) => {
					return {
						title: set.name,
						value: formatY ? formatY(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.setValues(x, y, {name: titles[i], value: ''}, values, i);
				this.tip.showTip();
				break;
			}
		}
	}

	renderLegend() {
		let s = this.data;
		this.statsWrapper.textContent = '';

		if(s.datasets.length > 1) {
			s.datasets.map((d, i) => {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.statsWrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background: ${this.colors[i]}"></i>
					${d.name}
				</span>`;
			});
		}
	}

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

const chartTypes = {
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', parent, options) {
	if(chartType === 'line') {
		options.type = 'line';
		return new AxisChart(parent, options);
	} else if (chartType === 'bar') {
		options.type = 'bar';
		return new AxisChart(parent, options);
	} else if (chartType === 'axis-mixed') {
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

export default Chart;
