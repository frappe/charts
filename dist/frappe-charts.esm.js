function $$1(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}



$$1.create = (tag, o) => {
	var element = document.createElement(tag);

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

class SvgTip {
	constructor({
		parent = null,
		colors = []
	}) {
		this.parent = parent;
		this.colors = colors;
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

	setup() {
		this.make_tooltip();
	}

	refresh() {
		this.fill();
		this.calc_position();
		// this.show_tip();
	}

	make_tooltip() {
		this.container = $$1.create('div', {
			inside: this.parent,
			className: 'graph-svg-tip comparison',
			innerHTML: `<span class="title"></span>
				<ul class="data-point-list"></ul>
				<div class="svg-pointer"></div>`
		});
		this.hide_tip();

		this.title = this.container.querySelector('.title');
		this.data_point_list = this.container.querySelector('.data-point-list');

		this.parent.addEventListener('mouseleave', () => {
			this.hide_tip();
		});
	}

	fill() {
		let title;
		if(this.title_value_first) {
			title = `<strong>${this.title_value}</strong>${this.title_name}`;
		} else {
			title = `${this.title_name}<strong>${this.title_value}</strong>`;
		}
		this.title.innerHTML = title;
		this.data_point_list.innerHTML = '';

		this.list_values.map((set, i) => {
			const color = this.colors[i] || 'black';

			let li = $$1.create('li', {
				styles: {
					'border-top': `3px solid ${color}`
				},
				innerHTML: `<strong style="display: block;">${ set.value === 0 || set.value ? set.value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.data_point_list.appendChild(li);
		});
	}

	calc_position() {
		let width = this.container.offsetWidth;

		this.top = this.y - this.container.offsetHeight;
		this.left = this.x - width/2;
		let max_left = this.parent.offsetWidth - width;

		let pointer = this.container.querySelector('.svg-pointer');

		if(this.left < 0) {
			pointer.style.left = `calc(50% - ${-1 * this.left}px)`;
			this.left = 0;
		} else if(this.left > max_left) {
			let delta = this.left - max_left;
			let pointer_offset = `calc(50% + ${delta}px)`;
			pointer.style.left = pointer_offset;

			this.left = max_left;
		} else {
			pointer.style.left = `50%`;
		}
	}

	set_values(x, y, title_name = '', title_value = '', list_values = [], title_value_first = 0) {
		this.title_name = title_name;
		this.title_value = title_value;
		this.list_values = list_values;
		this.x = x;
		this.y = y;
		this.title_value_first = title_value_first;
		this.refresh();
	}

	hide_tip() {
		this.container.style.top = '0px';
		this.container.style.left = '0px';
		this.container.style.opacity = '0';
	}

	show_tip() {
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

function getBarHeightAndYAttr(yTop, zeroLine) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * MIN_BAR_PERCENT_HEIGHT;
			y -= height;
		}
	} else {
		height = yTop - zeroLine;
		y = zeroLine;
	}

	return [height, y];
}

function equilizeNoOfElements(array1, array2,
	extra_count=array2.length - array1.length) {

	if(extra_count > 0) {
		array1 = fillArray(array1, extra_count);
	} else {
		array2 = fillArray(array2, extra_count);
	}
	return [array1, array2];
}

// let char_width = 8;
// let allowed_space = avgUnitWidth * 1.5;
// let allowed_letters = allowed_space / 8;

// return values.map((value, i) => {
// 	let space_taken = getStringWidth(value, char_width) + 2;
// 	if(space_taken > allowed_space) {
// 		if(isSeries) {
// 			// Skip some axis lines if X axis is a series
// 			let skips = 1;
// 			while((space_taken/skips)*2 > allowed_space) {
// 				skips++;
// 			}
// 			if(i % skips !== 0) {
// 				return;
// 			}
// 		} else {
// 			value = value.slice(0, allowed_letters-3) + " ...";
// 		}
// 	}

const UNIT_ANIM_DUR = 350;
const PATH_ANIM_DUR = 350;
const MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
const REPLACE_ALL_NEW_DUR = 250;

const STD_EASING = 'easein';

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const FONT_SIZE = 10;
const BASE_LINE_COLOR = '#dadada';
function $$2(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

function createSVG(tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$$2(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $$2(val);
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

function wrapInSVGGroup(elements, className='') {
	let g = createSVG('g', {
		className: className
	});
	elements.forEach(e => g.appendChild(e));
	return g;
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

function makeGradient(svgDefElem, color, lighter = false) {
	let gradientId ='path-fill-gradient' + '-' + color;
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
		fill: 1
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
		innerHTML: label
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
		y1: y,
		y2: y,
		styles: {
			stroke: options.stroke
		}
	});

	let text = createSVG('text', {
		x: x1 < x2 ? x1 - LABEL_MARGIN : x1 + LABEL_MARGIN,
		y: y,
		dy: (FONT_SIZE / 2 - 2) + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': x1 < x2 ? 'end' : 'start',
		innerHTML: label+""
	});

	let line = createSVG('g', {
		'stroke-opacity': 1
	});

	if(text === 0 || text === '0') {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

class AxisChartRenderer {
	constructor(state) {
		this.refreshState(state);
	}

	refreshState(state) {
		this.totalHeight = state.totalHeight;
		this.totalWidth = state.totalWidth;
		this.zeroLine = state.zeroLine;
		this.unitWidth = state.unitWidth;
		this.xAxisMode = state.xAxisMode;
		this.yAxisMode = state.yAxisMode;
	}

	setZeroline(zeroLine) {
		this.zeroLine = zeroLine;
	}

	xLine(x, label, options={}) {
		if(!options.pos) options.pos = 'bottom';
		if(!options.offset) options.offset = 0;
		if(!options.mode) options.mode = this.xAxisMode;
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

		let y1 = this.totalHeight + AXIS_TICK_LENGTH;
		let y2 = options.mode === 'span' ? -1 * AXIS_TICK_LENGTH : this.totalHeight;

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

	yLine(y, label, options={}) {
		if(!options.pos) options.pos = 'left';
		if(!options.offset) options.offset = 0;
		if(!options.mode) options.mode = this.yAxisMode;
		if(!options.stroke) options.stroke = BASE_LINE_COLOR;
		if(!options.className) options.className = '';

		let x1 = -1 * AXIS_TICK_LENGTH;
		let x2 = options.mode === 'span' ? this.totalWidth + AXIS_TICK_LENGTH : 0;

		if(options.mode === 'tick' && options.pos === 'right') {
			x1 = this.totalWidth + AXIS_TICK_LENGTH;
			x2 = this.totalWidth;
		}

		x1 += options.offset;
		x2 += options.offset;

		return makeHoriLine(y, label, x1, x2, {
			stroke: options.stroke,
			className: options.className,
			lineType: options.lineType
		});
	}


	xMarker() {}
	yMarker(y, label, options={}) {
		let labelSvg = createSVG('text', {
			className: 'chart-label',
			x: this.totalWidth - getStringWidth(label, 5) - LABEL_MARGIN,
			y: y - FONT_SIZE - 2,
			dy: (FONT_SIZE / 2) + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'start',
			innerHTML: label+""
		});

		let line = makeHoriLine(y, '', 0, this.totalWidth, {
			stroke: options.stroke || BASE_LINE_COLOR,
			className: options.className || '',
			lineType: options.lineType
		});

		line.appendChild(labelSvg);

		return line;
	}

	xRegion() {
		return createSVG('rect', {
			className: `bar mini`, // remove class
			style: `fill: rgba(228, 234, 239, 0.49)`,
			// 'data-point-index': index,
			x: 0,
			y: y2,
			width: this.totalWidth,
			height: y1 - y2
		});

		return region;
	}

	yRegion(y1, y2, label) {
		// return a group

		let rect = createSVG('rect', {
			className: `bar mini`, // remove class
			style: `fill: rgba(228, 234, 239, 0.49)`,
			// 'data-point-index': index,
			x: 0,
			y: y2,
			width: this.totalWidth,
			height: y1 - y2
		});

		let upperBorder = createSVG('line', {
			className: 'line-horizontal',
			x1: 0,
			x2: this.totalWidth,
			y1: y2,
			y2: y2,
			styles: {
				stroke: BASE_LINE_COLOR
			}
		});
		let lowerBorder = createSVG('line', {
			className: 'line-horizontal',
			x1: 0,
			x2: this.totalWidth,
			y1: y1,
			y2: y1,
			styles: {
				stroke: BASE_LINE_COLOR
			}
		});

		let labelSvg = createSVG('text', {
			className: 'chart-label',
			x: this.totalWidth - getStringWidth(label, 4.5) - LABEL_MARGIN,
			y: y2 - FONT_SIZE - 2,
			dy: (FONT_SIZE / 2) + 'px',
			'font-size': FONT_SIZE + 'px',
			'text-anchor': 'start',
			innerHTML: label+""
		});

		let region = createSVG('g', {});

		region.appendChild(rect);
		region.appendChild(upperBorder);
		region.appendChild(lowerBorder);
		region.appendChild(labelSvg);

		return region;
	}

	animatebar(bar, x, yTop, index, noOfDatasets) {
		let start = x - this.avgUnitWidth/4;
		let width = (this.avgUnitWidth/2)/noOfDatasets;
		let [height, y] = getBarHeightAndYAttr(yTop, this.zeroLine, this.totalHeight);

		x = start + (width * index);

		return [bar, {width: width, height: height, x: x, y: y}, UNIT_ANIM_DUR, STD_EASING];
		// bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);
	}

	animatedot(dot, x, yTop) {
		return [dot, {cx: x, cy: yTop}, UNIT_ANIM_DUR, STD_EASING];
		// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
	}

	animatepath(paths, pathStr) {
		let pathComponents = [];
		const animPath = [paths[0], {d:"M"+pathStr}, PATH_ANIM_DUR, STD_EASING];
		pathComponents.push(animPath);

		if(paths[1]) {
			let regStartPt = `0,${this.zeroLine}L`;
			let regEndPt = `L${this.totalWidth}, ${this.zeroLine}`;

			const animRegion = [
				paths[1],
				{d:"M" + regStartPt + pathStr + regEndPt},
				PATH_ANIM_DUR,
				STD_EASING
			];
			pathComponents.push(animRegion);
		}

		return pathComponents;
	}

	translate(unit, oldCoord, newCoord, duration) {
		return [
			unit,
			{transform: newCoord.join(', ')},
			duration,
			STD_EASING,
			"translate",
			{transform: oldCoord.join(', ')}
		];
	}

	translateVertLine(xLine, newX, oldX) {
		return this.translate(xLine, [oldX, 0], [newX, 0], MARKER_LINE_ANIM_DUR);
	}

	translateHoriLine(yLine, newY, oldY) {
		return this.translate(yLine, [0, oldY], [0, newY], MARKER_LINE_ANIM_DUR);
	}
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

const DEFAULT_COLORS = ['light-blue', 'blue', 'violet', 'red', 'orange',
	'yellow', 'green', 'light-green', 'purple', 'magenta'];

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

function getDifferentChart(type, current_type, args) {
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
	return new Chart({
		parent: args.parent,
		title: args.title,
		data: args.data,
		type: type,
		height: args.height,
		colors: useColor ? args.colors : undefined
	});
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
	constructor({
		height = 240,

		title = '',
		subtitle = '',
		colors = [],

		isNavigable = 0,
		showLegend = 1,

		type = '',

		parent,
		data
	}) {
		this.rawChartArgs = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;
		this.argHeight = height;

		this.isNavigable = isNavigable;
		if(this.isNavigable) {
			this.currentIndex = 0;
		}

		this.configure(arguments[0]);
	}

	configure(args) {
		// Make a this.config, that has stuff like showTooltip,
		// showLegend, which then all functions will check

		this.setColors();

		// constants
		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1,
			isNavigable: 0,
			// animate: 1
			animate: 0
		};

		this.state = {
			colors: this.colors
		};
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
		// TODO: think for all
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - 40; // change
		this.translateY = 20;

		this.setHorizontalMargin();
	}

	setHorizontalMargin() {
		this.translateXLeft = 60;
		this.translateXRight = 40;
	}

	validate(){
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return false;
		}
		if(!this.parseData()) {
			return false;
		}
		return true;
	}

	parseData() {
		let data = this.rawChartArgs.data;
		let valid = this.checkData(data);
		if(!valid) return false;

		if(!this.config.animate) {
			this.data = data;
		} else {
			[this.data, this.firstUpdateData] =
				this.getFirstUpdateData(data);
		}
		return true;
	}

	checkData() {}
	getFirstUpdateData() {}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.bindWindowEvents();
		this.setupConstants();
		this.setupComponents();

		this.setMargins();
		this.makeContainer();
		this.makeTooltip(); // without binding
		this.draw(true);
	}

	bindWindowEvents() {
		window.addEventListener('resize orientationchange', () => this.draw());
	}

	setupConstants() {}

	setupComponents() {
		// Components config
		this.components = [];
	}

	makeContainer() {
		this.container = $$1.create('div', {
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

	draw(init=false) {
		// difference from update(): draw the whole object due to groudbreaking event (init, resize, etc.)
		// (draw everything, layers, groups, units)

		this.calcWidth();

		// refresh conponent with chart
		this.refresh(this.data);

		this.makeChartArea();
		this.setComponentParent();
		this.makeComponentLayers();

		this.renderLegend();
		this.setupNavigation(init);

		// first time plain render, so no rerender
		this.renderComponents();
		this.renderConstants();

		if(this.config.animate) this.update(this.firstUpdateData);
	}

	update(data) {
		this.refresh(data);
		this.reRender();
	}

	calcWidth() {
		let outerAnnotationsWidth = 0;
		// let charWidth = 8;
		// this.specificValues.map(val => {
		// 	let strWidth = getStringWidth((val.title + ""), charWidth);
		// 	if(strWidth > outerAnnotationsWidth) {
		// 		outerAnnotationsWidth = strWidth - 40;
		// 	}
		// });
		this.baseWidth = getElementContentWidth(this.parent) - outerAnnotationsWidth;
		this.width = this.baseWidth - (this.translateXLeft + this.translateXRight);
	}

	refresh(data) { //?? refresh?
		this.oldState = this.state ? JSON.parse(JSON.stringify(this.state)) : {};
		this.intermedState = {}; // use this for the extra position problems?

		this.prepareData(data);
		this.reCalc();
		this.refreshRenderer();
	}

	makeChartArea() {
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
			`translate(${this.translateXLeft}, ${this.translateY})`
		);
	}

	prepareData() {}

	renderConstants() {}

	reCalc() {}
	// Will update values(state)
	// Will recalc specific parts depending on the update

	refreshRenderer() {
		this.renderer = {};
	}

	reRender(animate=true) {
		if(!animate) {
			this.renderComponents();
			return;
		}
		this.elementsToAnimate = [];
		this.loadAnimatedComponents();
		runSMILAnimation(this.chartWrapper, this.svg, this.elementsToAnimate);
		setTimeout(() => {
			this.renderComponents();
		}, 400);
		// TODO: should be max anim duration required
		// (opt, should not redraw if still in animate?)
	}

	// convenient component array abstractions
	setComponentParent() { this.components.forEach(c => c.setupParent(this.drawArea)); };
	makeComponentLayers() { this.components.forEach(c => c.makeLayer()); }
	renderComponents() { this.components.forEach(c => c.render()); }
	loadAnimatedComponents() { this.components.forEach(c => c.loadAnimatedComponents()); }

	refreshComponents() { this.components.forEach(c => c.refresh(this.state, this.rawChartArgs)); }

	renderLegend() {}

	setupNavigation(init=false) {
		if(this.isNavigable) return;

		this.makeOverlay();

		if(init) {
			this.bindOverlay();

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.chartWrapper)) {
					e = e || window.event;

					if (e.keyCode == '37') {
						this.onLeftArrow();
					} else if (e.keyCode == '39') {
						this.onRightArrow();
					} else if (e.keyCode == '38') {
						this.onUpArrow();
					} else if (e.keyCode == '40') {
						this.onDownArrow();
					} else if (e.keyCode == '13') {
						this.onEnterKey();
					}
				}
			});
		}
	}

	makeOverlay() {}
	bindOverlay() {}
	bind_units() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	// updateData() {
	// 	update();
	// }

	getDataPoint() {}
	setCurrentDataPoint() {}


	// Update the data here, then do relevant updates
	// and drawing in child classes by overriding
	// The Child chart will only know what a particular update means
	// and what components are affected,
	// BaseChart shouldn't be doing the animating

	updateDataset(dataset, index) {}

	updateDatasets(datasets) {
		//
	}

	addDataset(dataset, index) {}

	removeDataset(index = 0) {}

	addDataPoint(dataPoint, index = 0) {}

	removeDataPoint(index = 0) {}

	updateDataPoint(dataPoint, index = 0) {}



	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}

const Y_AXIS_MARGIN = 60;

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		initData,

		// called on update
		setData,
		preMake,
		make,
		postMake,
		animate
	}) {
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;

		this.initData = initData;
		this.setData = setData;

		this.preMake = preMake;
		this.make = make;
		this.postMake = postMake;

		this.animate = animate;

		this.layer = undefined;
		this.store = [];
	}

	refresh(state, args) {
		this.meta = Object.assign((this.meta || {}), args);
		this.state = state;
	}


	render() {
		this.data = this.setData(); // The only without this function?

		this.preMake && this.preMake();
		this.store = this.make();

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});

		this.postMake && this.postMake();
	}

	setupParent(parent) {
		this.parent = parent;
	}

	loadAnimatedComponents() {
		this.animate(this.store);
	}

	makeLayer() {
		this.layer = makeSVGGroup(this.parent, this.layerClass, this.layerTransform);
	}
}

const MIN_BAR_PERCENT_HEIGHT$1 = 0.01;

class AxisChartController {
	constructor(meta) {
		// TODO: make configurable passing args
		this.meta = meta || {};
		this.setupArgs();
	}

	setupArgs() {
		this.consts = {};
	}

	setup() {}

	refreshMeta(meta) {
		this.meta = Object.assign((this.meta || {}), meta);
	}

	draw() {}
	animate() {}
}



class BarChartController extends AxisChartController {
	constructor(meta) {
		super(meta);
	}

	setupArgs() {
		this.consts = {
			spaceRatio: 0.5,
			minHeight: this.meta.totalHeight * MIN_BAR_PERCENT_HEIGHT$1
		};
	}

	refreshMeta(meta) {
		if(meta) {
			super.refreshMeta(meta);
		}
		let m = this.meta;
		this.consts.barsWidth = m.unitWidth - m.unitWidth * this.consts.spaceRatio;

		this.consts.width = this.consts.barsWidth / (m.options && m.options.stacked
			? m.options.stacked : m.noOfDatasets);
	}

	draw(x, yTop, color, label='', index=0, offset=0) {
		let [height, y] = getBarHeightAndYAttr(yTop, this.meta.zeroLine);

		let rect = createSVG('rect', {
			className: `bar mini`,
			style: `fill: ${color}`,
			'data-point-index': index,
			x: x - this.consts.barsWidth/2,
			y: y - offset,
			width: this.consts.width,
			height: height || this.consts.minHeight
		});

		if(!label && !label.length) {
			return rect;
		} else {
			let text = createSVG('text', {
				className: 'data-point-value',
				x: x,
				y: y - offset,
				dy: (FONT_SIZE / 2 * -1) + 'px',
				'font-size': FONT_SIZE + 'px',
				'text-anchor': 'middle',
				innerHTML: label
			});

			return wrapInSVGGroup([rect, text]);
		}
	}

	animate(bar, x, yTop, index, noOfDatasets) {
		let start = x - this.meta.unitWidth/4;
		let width = (this.meta.unitWidth/2)/noOfDatasets;
		let [height, y] = getBarHeightAndYAttr(yTop, this.meta.zeroLine, this.meta.totalHeight);

		x = start + (width * index);

		return [bar, {width: width, height: height, x: x, y: y}, UNIT_ANIM_DUR, STD_EASING];
		// bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);
	}
}

class LineChartController extends AxisChartController {
	constructor(meta) {
		super(meta);
	}

	setupArgs() {
		this.consts = {
			radius: this.meta.dotSize || 4
		};
	}

	draw(x, y, color, label='', index=0) {
		let dot = createSVG('circle', {
			style: `fill: ${color}`,
			'data-point-index': index,
			cx: x,
			cy: y,
			r: this.consts.radius
		});

		if(!label && !label.length) {
			return dot;
		} else {
			let text = createSVG('text', {
				className: 'data-point-value',
				x: x,
				y: y,
				dy: (FONT_SIZE / 2 * -1 - this.consts.radius) + 'px',
				'font-size': FONT_SIZE + 'px',
				'text-anchor': 'middle',
				innerHTML: label
			});

			return wrapInSVGGroup([dot, text]);
		}
	}

	animate(dot, x, yTop) {
		return [dot, {cx: x, cy: yTop}, UNIT_ANIM_DUR, STD_EASING];
		// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
	}
}

function getPaths(yList, xList, color, heatline=false, regionFill=false) {
	let pointsList = yList.map((y, i) => (xList[i] + ',' + y));
	let pointsStr = pointsList.join("L");
	let path = makePath("M"+pointsStr, 'line-graph-path', color);

	// HeatLine
	if(heatline) {
		let gradient_id = makeGradient(this.svgDefs, color);
		path.style.stroke = `url(#${gradient_id})`;
	}

	let components = [path];

	// Region
	if(regionFill) {
		let gradient_id_region = makeGradient(this.svgDefs, color, true);

		let zeroLine = this.state.yAxis.zeroLine;
		// TODO: use zeroLine OR minimum
		let pathStr = "M" + `0,${zeroLine}L` + pointsStr + `L${this.width},${zeroLine}`;
		components.push(makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id_region})`));
	}

	return components;
}

// class BarChart extends AxisChart {
// 	constructor(args) {
// 		super(args);
// 		this.type = 'bar';
// 		this.setup();
// 	}

// 	configure(args) {
// 		super.configure(args);
// 		this.config.xAxisMode = args.xAxisMode || 'tick';
// 		this.config.yAxisMode = args.yAxisMode || 'span';
// 	}

// 	// =================================

// 	makeOverlay() {
// 		// Just make one out of the first element
// 		let index = this.xAxisLabels.length - 1;
// 		let unit = this.y[0].svg_units[index];
// 		this.setCurrentDataPoint(index);

// 		if(this.overlay) {
// 			this.overlay.parentNode.removeChild(this.overlay);
// 		}
// 		this.overlay = unit.cloneNode();
// 		this.overlay.style.fill = '#000000';
// 		this.overlay.style.opacity = '0.4';
// 		this.drawArea.appendChild(this.overlay);
// 	}

// 	bindOverlay() {
// 		// on event, update overlay
// 		this.parent.addEventListener('data-select', (e) => {
// 			this.update_overlay(e.svg_unit);
// 		});
// 	}

// 	bind_units(units_array) {
// 		units_array.map(unit => {
// 			unit.addEventListener('click', () => {
// 				let index = unit.getAttribute('data-point-index');
// 				this.setCurrentDataPoint(index);
// 			});
// 		});
// 	}

// 	update_overlay(unit) {
// 		let attributes = [];
// 		Object.keys(unit.attributes).map(index => {
// 			attributes.push(unit.attributes[index]);
// 		});

// 		attributes.filter(attr => attr.specified).map(attr => {
// 			this.overlay.setAttribute(attr.name, attr.nodeValue);
// 		});

// 		this.overlay.style.fill = '#000000';
// 		this.overlay.style.opacity = '0.4';
// 	}

// 	onLeftArrow() {
// 		this.setCurrentDataPoint(this.currentIndex - 1);
// 	}

// 	onRightArrow() {
// 		this.setCurrentDataPoint(this.currentIndex + 1);
// 	}
// }

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

function getRangeIntervals(max, min=0) {
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

function getIntervals(maxValue, minValue=0) {
	let [normalMaxValue, exponent] = normalize(maxValue);
	let normalMinValue = minValue ? minValue/Math.pow(10, exponent): 0;

	// Allow only 7 significant digits
	normalMaxValue = normalMaxValue.toFixed(6);

	let intervals = getRangeIntervals(normalMaxValue, normalMinValue);
	intervals = intervals.map(value => value * Math.pow(10, exponent));
	return intervals;
}

function calcIntervals(values, withMinimum=false) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	let maxValue = Math.max(...values);
	let minValue = Math.min(...values);

	// Exponent to be used for pretty print
	let exponent = 0, intervals = []; // eslint-disable-line no-unused-vars

	function getPositiveFirstIntervals(maxValue, absMinValue) {
		let intervals = getIntervals(maxValue);

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
			intervals = getIntervals(maxValue);
		} else {
			intervals = getIntervals(maxValue, minValue);
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
			intervals = getIntervals(pseudoMaxValue);
		} else {
			intervals = getIntervals(pseudoMaxValue, pseudoMinValue);
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

class AxisChart extends BaseChart {
	constructor(args) {
		super(args);
		this.isSeries = args.isSeries;
		this.valuesOverPoints = args.valuesOverPoints;
		this.formatTooltipY = args.formatTooltipY;
		this.formatTooltipX = args.formatTooltipX;
		this.barOptions = args.barOptions;
		this.lineOptions = args.lineOptions;
		this.type = args.type || 'line';

		this.setupUnitRenderer();

		this.zeroLine = this.height;
		this.preSetup();
		this.setup();
	}

	configure(args) {
		super.configure();

		this.config.xAxisMode = args.xAxisMode;
		this.config.yAxisMode = args.yAxisMode;
	}

	preSetup() {}

	setupUnitRenderer() {
		// TODO: this is empty
		let options = this.rawChartArgs.options;
		this.unitRenderers = {
			bar: new BarChartController(options),
			line: new LineChartController(options)
		};
	}

	setHorizontalMargin() {
		this.translateXLeft = Y_AXIS_MARGIN;
		this.translateXRight = Y_AXIS_MARGIN;
	}

	checkData(data) {
		return true;
	}

	getFirstUpdateData(data) {
		//
	}

	setupConstants() {
		this.state = {
			xAxisLabels: [],
			xAxisPositions: [],
			xAxisMode: this.config.xAxisMode,
			yAxisMode: this.config.yAxisMode
		};

		this.data.datasets.map(d => {
			if(!d.chartType ) {
				d.chartType = this.type;
			}
		});

		this.prepareYAxis();
	}

	prepareData(data) {
		let s = this.state;

		s.xAxisLabels = data.labels || [];

		s.datasetLength = s.xAxisLabels.length;

		let zeroArray = new Array(s.datasetLength).fill(0);

		s.datasets = data.datasets; // whole dataset info too
		if(!data.datasets) {
			// default
			s.datasets = [{
				values: zeroArray	// Proof that state version will be seen instead of this.data
			}];
		}

		s.datasets.map((d, i)=> {
			let vals = d.values;
			if(!vals) {
				vals = zeroArray;
			} else {
				// Check for non values
				vals = vals.map(val => (!isNaN(val) ? val : 0));

				// Trim or extend
				if(vals.length > s.datasetLength) {
					vals = vals.slice(0, s.datasetLength);
				} else {
					vals = fillArray(vals, s.datasetLength - vals.length, 0);
				}
			}

			d.index = i;
		});

		s.noOfDatasets = s.datasets.length;
		s.yMarkers = data.yMarkers;
		s.yRegions = data.yRegions;
	}

	prepareYAxis() {
		this.state.yAxis = {
			labels: [],
			positions: []
		};
	}

	reCalc() {
		let s = this.state;

		s.xAxisLabels = this.data.labels;
		this.calcXPositions();

		s.datasetsLabels = this.data.datasets.map(d => d.name);
		this.setYAxis();
		this.calcYUnits();
		this.calcYMaximums();
		this.calcYRegions();

		// should be state
		this.configUnits();
	}

	setYAxis() {
		this.calcYAxisParameters(this.state.yAxis, this.getAllYValues(), this.type === 'line');
		this.state.zeroLine = this.state.yAxis.zeroLine;
	}

	calcXPositions() {
		let s = this.state;
		this.setUnitWidthAndXOffset();
		s.xAxisPositions = s.xAxisLabels.map((d, i) =>
			floatTwo(s.xOffset + i * s.unitWidth)
		);

		s.xUnitPositions = new Array(s.noOfDatasets).fill(s.xAxisPositions);
	}

	calcYAxisParameters(yAxis, dataValues, withMinimum = 'false') {
		yAxis.labels = calcIntervals(dataValues, withMinimum);
		const yPts = yAxis.labels;

		yAxis.scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * yAxis.scaleMultiplier;
		yAxis.zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		yAxis.positions = yPts.map(d => yAxis.zeroLine - d * yAxis.scaleMultiplier);
	}

	calcYUnits() {
		let s = this.state;
		s.datasets.map(d => {
			d.positions = d.values.map(val =>
				floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
		});

		if(this.barOptions && this.barOptions.stacked) {
			s.datasets.map((d, i) => {
				d.cumulativePositions = d.cumulativeYs.map(val =>
					floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
			});
		}
	}

	calcYMaximums() {
		let s = this.state;
		if(this.barOptions && this.barOptions.stacked) {
			s.yExtremes = s.datasets[s.datasets.length - 1].cumulativePositions;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		s.datasets.map((d, i) => {
			d.positions.map((pos, j) => {
				if(pos < s.yExtremes[j]) {
					s.yExtremes[j] = pos;
				}
			});
		});

		// Tooltip refresh should not be needed?
		// this.chartWrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}

	calcYRegions() {
		let s = this.state;
		if(s.yMarkers) {
			s.yMarkers = s.yMarkers.map(d => {
				d.value = floatTwo(s.yAxis.zeroLine - d.value * s.yAxis.scaleMultiplier);
				return d;
			});
		}
		if(s.yRegions) {
			s.yRegions = s.yRegions.map(d => {
				d.start = floatTwo(s.yAxis.zeroLine - d.start * s.yAxis.scaleMultiplier);
				d.end = floatTwo(s.yAxis.zeroLine - d.end * s.yAxis.scaleMultiplier);
				return d;
			});
		}
	}

	configUnits() {}

	// Default, as per bar, and mixed. Only line will be a special case
	setUnitWidthAndXOffset() {
		this.state.unitWidth = this.width/(this.state.datasetLength);
		this.state.xOffset = this.state.unitWidth/2;
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever

		let key = 'values';

		if(this.barOptions && this.barOptions.stacked) {
			key = 'cumulativeYs';
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.state.datasets.map((d, i) => {
				let values = this.state.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
			});
		}

		return [].concat(...this.state.datasets.map(d => d[key]));
	}

	calcIntermedState() {
		//
	}

	setupValues() {}

	setupComponents() {

		// TODO: rebind new units
		// if(this.isNavigable) {
		// 	this.bind_units(units_array);
		// }

		this.components = [
			...this.getYAxesComponents(),
			this.getXAxisComponents(),
			...this.getYRegions(),
			...this.getXRegions(),
			...this.getYMarkerLines(),
			// ...this.getXMarkerLines(),
			...this.getChartComponents(),
			...this.getChartLabels(),
		];
	}

	getYAxesComponents() {
		return [new ChartComponent({
			layerClass: 'y axis',
			setData: () => {
				// let s = this.state;

				// data = {};


				// return data;
			},
			initializeData: function() {
				this.axesPositions = this.state;
			},
			make: () => {
				// positions, labels, renderer
				let s = this.state;
				return s.yAxis.positions.map((position, i) =>
					this.renderer.yLine(position, s.yAxis.labels[i], {pos:'right'})
				);
			},
			animate: (yLines) => {
				// Equilize
				let newY = this.state.yAxis.positions;
				let oldY = this.oldState.yAxis.positions;

				let extra = newY.length - oldY.length;
				let lastLine = yLines[yLines.length - 1];
				let parentNode = lastLine.parentNode;

				[oldY, newY] = equilizeNoOfElements(oldY, newY);
				// console.log(newY.slice(), oldY.slice());
				if(extra > 0) {
					for(var i = 0; i<extra; i++) {
						let line = lastLine.cloneNode(true);
						parentNode.appendChild(line);
						yLines.push(line);
					}
				}

				yLines.map((line, i) => {
					// console.log(line, newY[i], oldY[i]);
					this.elementsToAnimate.push(this.renderer.translateHoriLine(
						line, newY[i], oldY[i]
					));
				});
			}
		})];
	}

	getXAxisComponents() {
		return new ChartComponent({
			layerClass: 'x axis',
			setData: () => {},
			make: () => {
				let s = this.state;
				// positions
				// TODO: xAxis Label spacing
				return s.xAxisPositions.map((position, i) =>
					this.renderer.xLine(position, s.xAxisLabels[i]
						// , {pos:'top'}
					)
				);
			},
			animate: (xLines) => {
				// Equilize
				let newX = this.state.xAxisPositions;
				let oldX = this.oldState.xAxisPositions;

				this.oldState.xExtra = newX.length - oldX.length;
				let lastLine = xLines[xLines.length - 1];
				let parentNode = lastLine.parentNode;

				[oldX, newX] = equilizeNoOfElements(oldX, newX);
				if(this.oldState.xExtra > 0) {
					for(var i = 0; i<this.oldState.xExtra; i++) {
						let line = lastLine.cloneNode(true);
						parentNode.appendChild(line);
						xLines.push(line);
					}
				}
				xLines.map((line, i) => {
					this.elementsToAnimate.push(this.renderer.translateVertLine(
						line, newX[i], oldX[i]
					));
				});
			}
		});
	}

	getChartComponents() {
		let dataUnitsComponents = [];
		// this.state is not defined at this stage
		this.data.datasets.forEach((d, index) => {
			if(d.chartType === 'line') {
				dataUnitsComponents.push(this.getPathComponent(d, index));
			}

			let renderer = this.unitRenderers[d.chartType];
			dataUnitsComponents.push(this.getDataUnitComponent(
				index, renderer
			));
		});
		return dataUnitsComponents;
	}

	getChartLabels() {
		// To layer all labels above everything else
		return [];
	}

	getDataUnitComponent(index, unitRenderer) {
		return new ChartComponent({
			layerClass: 'dataset-units dataset-' + index,
			setData: () => {},
			preMake: () => { },
			make: () => {
				let d = this.state.datasets[index];

				return d.positions.map((y, j) => {
					return unitRenderer.draw(
						this.state.xAxisPositions[j],
						y,
						this.colors[index],
						(this.valuesOverPoints ? (this.barOptions &&
							this.barOptions.stacked ? d.cumulativeYs[j] : d.values[j]) : ''),
						j,
						y - (d.cumulativePositions ? d.cumulativePositions[j] : y)
					);
				});
			},
			postMake: function() {
				let translate_layer = () => {
					this.layer.setAttribute('transform', `translate(${unitRenderer.consts.width * index}, 0)`);
				};

				// let d = this.state.datasets[index];

				if(this.meta.type === 'bar' && (!this.meta.barOptions
					|| !this.meta.barOptions.stacked)) {

					translate_layer();
				}
			},
			animate: (svgUnits) => {
				// have been updated in axis render;
				let newX = this.state.xAxisPositions;
				let newY = this.state.datasets[index].positions;

				let lastUnit = svgUnits[svgUnits.length - 1];
				let parentNode = lastUnit.parentNode;

				if(this.oldState.xExtra > 0) {
					for(var i = 0; i<this.oldState.xExtra; i++) {
						let unit = lastUnit.cloneNode(true);
						parentNode.appendChild(unit);
						svgUnits.push(unit);
					}
				}

				svgUnits.map((unit, i) => {
					if(newX[i] === undefined || newY[i] === undefined) return;
					this.elementsToAnimate.push(unitRenderer.animate(
						unit, // unit, with info to replace where it came from in the data
						newX[i],
						newY[i],
						index,
						this.state.noOfDatasets
					));
				});
			}
		});
	}

	getPathComponent(d, index) {
		return new ChartComponent({
			layerClass: 'path dataset-path',
			setData: () => {},
			make: () => {
				let d = this.state.datasets[index];
				let color = this.colors[index];

				return getPaths(
					d.positions,
					this.state.xAxisPositions,
					color,
					this.config.heatline,
					this.config.regionFill
				);
			},
			animate: (paths) => {
				let newX = this.state.xAxisPositions;
				let newY = this.state.datasets[index].positions;

				let oldX = this.oldState.xAxisPositions;
				let oldY = this.oldState.datasets[index].positions;


				let parentNode = paths[0].parentNode;

				[oldX, newX] = equilizeNoOfElements(oldX, newX);
				[oldY, newY] = equilizeNoOfElements(oldY, newY);

				if(this.oldState.xExtra > 0) {
					paths = getPaths(
						oldY, oldX, this.colors[index],
						this.config.heatline,
						this.config.regionFill
					);
					parentNode.textContent = '';
					paths.map(path => parentNode.appendChild(path));
				}

				const newPointsList = newY.map((y, i) => (newX[i] + ',' + y));
				this.elementsToAnimate = this.elementsToAnimate
					.concat(this.renderer.animatepath(paths, newPointsList.join("L")));
			}
		});
	}

	getYMarkerLines() {
		if(!this.data.yMarkers) {
			return [];
		}
		return this.data.yMarkers.map((d, index) => {
			return new ChartComponent({
				layerClass: 'y-markers',
				setData: () => {},
				make: () => {
					let s = this.state;
					return s.yMarkers.map(marker =>
						this.renderer.yMarker(marker.value, marker.name,
							{pos:'right', mode: 'span', lineType: marker.type})
					);
				},
				animate: () => {}
			});
		});
	}

	getYRegions() {
		if(!this.data.yRegions) {
			return [];
		}
		// return [];
		return this.data.yRegions.map((d, index) => {
			return new ChartComponent({
				layerClass: 'y-regions',
				setData: () => {},
				make: () => {
					let s = this.state;
					return s.yRegions.map(region =>
						this.renderer.yRegion(region.start, region.end, region.name)
					);
				},
				animate: () => {}
			});
		});
	}

	getXRegions() {
		return [];
	}

	refreshRenderer() {
		// These args are basically the current state of the chart,
		// with constant and alive params mixed
		let state = {
			totalHeight: this.height,
			totalWidth: this.width,

			xAxisMode: this.config.xAxisMode,
			yAxisMode: this.config.yAxisMode,

			zeroLine: this.state.zeroLine,
			unitWidth: this.state.unitWidth,
		};
		if(!this.renderer) {
			this.renderer = new AxisChartRenderer(state);
		} else {
			this.renderer.refreshState(state);
		}

		this.refreshComponents();

		let meta = {
			totalHeight: this.height,
			totalWidth: this.width,
			zeroLine: this.state.zeroLine,
			unitWidth: this.state.unitWidth,
			noOfDatasets: this.state.noOfDatasets,
		};

		meta = Object.assign(meta, this.rawChartArgs.options);

		Object.keys(this.unitRenderers).map(key => {
			meta.options = this[key + 'Options'];
			this.unitRenderers[key].refreshMeta(meta);
		});
	}

	bindTooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chartWrapper.addEventListener('mousemove', (e) => {
			let o = getOffset(this.chartWrapper);
			let relX = e.pageX - o.left - this.translateXLeft;
			let relY = e.pageY - o.top - this.translateY;

			if(relY < this.height + this.translateY * 2) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		let s = this.state;
		if(!s.yExtremes) return;

		let titles = s.xAxisLabels;
		if(this.formatTooltipX && this.formatTooltipX(titles[0])) {
			titles = titles.map(d=>this.formatTooltipX(d));
		}

		let formatY = this.formatTooltipY && this.formatTooltipY(this.y[0].values[0]);

		for(var i=s.datasetLength - 1; i >= 0 ; i--) {
			let xVal = s.xAxisPositions[i];
			// let delta = i === 0 ? s.unitWidth : xVal - s.xAxisPositions[i-1];
			if(relX > xVal - s.unitWidth/2) {
				let x = xVal + this.translateXLeft;
				let y = s.yExtremes[i] + this.translateY;

				let values = s.datasets.map((set, j) => {
					return {
						title: set.title,
						value: formatY ? this.formatTooltipY(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.set_values(x, y, titles[i], '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	getDataPoint(index=this.current_index) {
		// check for length
		let data_point = {
			index: index
		};
		let y = this.y[0];
		['svg_units', 'yUnitPositions', 'values'].map(key => {
			let data_key = key.slice(0, key.length-1);
			data_point[data_key] = y[key][index];
		});
		data_point.label = this.xAxisLabels[index];
		return data_point;
	}

	setCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.xAxisLabels.length) index = this.xAxisLabels.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$.fire(this.parent, "data-select", this.getDataPoint());
	}

	// API

	addDataPoint(label, datasetValues, index=this.state.datasetLength) {
		super.addDataPoint(label, datasetValues, index);
		// console.log(label, datasetValues, this.data.labels);
		this.data.labels.splice(index, 0, label);
		this.data.datasets.map((d, i) => {
			d.values.splice(index, 0, datasetValues[i]);
		});
		// console.log(this.data);
		this.update(this.data);
	}

	removeDataPoint(index = this.state.datasetLength-1) {
		super.removeDataPoint(index);
		this.data.labels.splice(index, 1);
		this.data.datasets.map(d => {
			d.values.splice(index, 1);
		});
		this.update(this.data);
	}

	// updateData() {
	// 	// animate if same no. of datasets,
	// 	// else return new chart

	// 	//
	// }
}


// keep a binding at the end of chart

class LineChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'line';

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'span';
		this.config.yAxisMode = args.yAxisMode || 'span';

		this.config.dotRadius = args.dotRadius || 4;

		this.config.heatline = args.heatline || 0;
		this.config.regionFill = args.regionFill || 0;
		this.config.showDots = args.showDots || 1;
	}

	configUnits() {
		this.unitArgs = {
			type: 'dot',
			args: { radius: this.config.dotRadius }
		};
	}

	// temp commented
	setUnitWidthAndXOffset() {
		this.state.unitWidth = this.width/(this.state.datasetLength - 1);
		this.state.xOffset = 0;
	}

}

class ScatterChart extends LineChart {
	constructor(args) {
		super(args);

		this.type = 'scatter';

		if(!args.dotRadius) {
			this.dotRadius = 8;
		} else {
			this.dotRadius = args.dotRadius;
		}

		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dotRadius }
		};
	}

	make_paths() {}
	make_path() {}
}

class MultiAxisChart extends AxisChart {
	constructor(args) {
		super(args);
		// this.unitType = args.unitType || 'line';
		// this.setup();
	}

	preSetup() {
		this.type = 'multiaxis';
	}

	setHorizontalMargin() {
		let noOfLeftAxes = this.data.datasets.filter(d => d.axisPosition === 'left').length;
		this.translateXLeft = (noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
		this.translateXRight = (this.data.datasets.length - noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
	}

	prepareYAxis() { }

	prepareData(data) {
		super.prepareData(data);
		let sets = this.state.datasets;
		// let axesLeft = sets.filter(d => d.axisPosition === 'left');
		// let axesRight = sets.filter(d => d.axisPosition === 'right');
		// let axesNone = sets.filter(d => !d.axisPosition ||
		// 	!['left', 'right'].includes(d.axisPosition));

		let leftCount = 0, rightCount = 0;

		sets.forEach((d, i) => {
			d.yAxis = {
				position: d.axisPosition,
				index: d.axisPosition === 'left' ? leftCount++ : rightCount++
			};
		});
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'tick';
		this.config.yAxisMode = args.yAxisMode || 'span';
	}

	// setUnitWidthAndXOffset() {
	// 	this.state.unitWidth = this.width/(this.state.datasetLength);
	// 	this.state.xOffset = this.state.unitWidth/2;
	// }

	configUnits() {
		this.unitArgs = {
			type: 'bar',
			args: {
				spaceWidth: this.state.unitWidth/2,
			}
		};
	}

	setYAxis() {
		this.state.datasets.map(d => {
			this.calcYAxisParameters(d.yAxis, d.values, this.unitType === 'line');
		});
	}

	calcYUnits() {
		this.state.datasets.map(d => {
			d.positions = d.values.map(val => floatTwo(d.yAxis.zeroLine - val * d.yAxis.scaleMultiplier));
		});
	}

	renderConstants() {
		this.state.datasets.map(d => {
			let guidePos = d.yAxis.position === 'left'
				? -1 * d.yAxis.index * Y_AXIS_MARGIN
				: this.width + d.yAxis.index * Y_AXIS_MARGIN;
			this.renderer.xLine(guidePos, '', {
				pos:'top',
				mode: 'span',
				stroke: this.colors[i],
				className: 'y-axis-guide'
			});
		});
	}

	getYAxesComponents() {
		return this.data.datasets.map((e, i) => {
			return new ChartComponent({
				layerClass: 'y axis y-axis-' + i,
				make: () => {
					let yAxis = this.state.datasets[i].yAxis;
					this.renderer.setZeroline(yAxis.zeroline);
					let options = {
						pos: yAxis.position,
						mode: 'tick',
						offset: yAxis.index * Y_AXIS_MARGIN,
						stroke: this.colors[i]
					};

					return yAxis.positions.map((position, j) =>
						this.renderer.yLine(position, yAxis.labels[j], options)
					);
				},
				animate: () => {}
			});
		});
	}

	// TODO remove renderer zeroline from above and below
	getChartComponents() {
		return this.data.datasets.map((d, index) => {
			return new ChartComponent({
				layerClass: 'dataset-units dataset-' + index,
				make: () => {
					let d = this.state.datasets[index];
					let unitType = this.unitArgs;

					// the only difference, should be tied to datasets or default
					this.renderer.setZeroline(d.yAxis.zeroLine);

					return d.positions.map((y, j) => {
						return this.renderer[unitType.type](
							this.state.xAxisPositions[j],
							y,
							unitType.args,
							this.colors[index],
							j,
							index,
							this.state.datasetLength
						);
					});
				},
				animate: (svgUnits) => {
					let d = this.state.datasets[index];
					let unitType = this.unitArgs.type;

					// have been updated in axis render;
					let newX = this.state.xAxisPositions;
					let newY = this.state.datasets[index].positions;

					let lastUnit = svgUnits[svgUnits.length - 1];
					let parentNode = lastUnit.parentNode;

					if(this.oldState.xExtra > 0) {
						for(var i = 0; i<this.oldState.xExtra; i++) {
							let unit = lastUnit.cloneNode(true);
							parentNode.appendChild(unit);
							svgUnits.push(unit);
						}
					}

					this.renderer.setZeroline(d.yAxis.zeroLine);

					svgUnits.map((unit, i) => {
						if(newX[i] === undefined || newY[i] === undefined) return;
						this.elementsToAnimate.push(this.renderer['animate' + unitType](
							unit, // unit, with info to replace where it came from in the data
							newX[i],
							newY[i],
							index,
							this.state.noOfDatasets
						));
					});
				}
			});
		});
	}
}

class PercentageChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'percentage';

		this.max_slices = 10;
		this.max_legend_points = 6;

		this.setup();
	}

	makeChartArea() {
		this.chartWrapper.className += ' ' + 'graph-focus-margin';
		this.chartWrapper.style.marginTop = '45px';

		this.statsWrapper.className += ' ' + 'graph-focus-margin';
		this.statsWrapper.style.marginBottom = '30px';
		this.statsWrapper.style.paddingTop = '0px';

		this.chartDiv = $$1.create('div', {
			className: 'div',
			inside: this.chartWrapper
		});

		this.chart = $$1.create('div', {
			className: 'progress-chart',
			inside: this.chartDiv
		});
	}

	setupLayers() {
		this.percentageBar = $$1.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	setup_values() {
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	renderComponents() {
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		this.slices = [];
		this.slice_totals.map((total, i) => {
			let slice = $$1.create('div', {
				className: `progress-bar`,
				inside: this.percentageBar,
				styles: {
					background: this.colors[i],
					width: total*100/this.grand_total + "%"
				}
			});
			this.slices.push(slice);
		});
	}

	bindTooltip() {
		this.slices.map((slice, i) => {
			slice.addEventListener('mouseenter', () => {
				let g_off = getOffset(this.chartWrapper), p_off = getOffset(slice);

				let x = p_off.left - g_off.left + slice.offsetWidth/2;
				let y = p_off.top - g_off.top - 6;
				let title = (this.formatted_labels && this.formatted_labels.length>0
					? this.formatted_labels[i] : this.labels[i]) + ': ';
				let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);

				this.tip.set_values(x, y, title, percent + "%");
				this.tip.show_tip();
			});
		});
	}

	renderLegend() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			if(d) {
				let stats = $$1.create('div', {
					className: 'stats',
					inside: this.statsWrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background: ${this.colors[i]}"></i>
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}

const ANGLE_RATIO = Math.PI / 180;
const FULL_ANGLE = 360;

class PieChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'pie';
		this.elements_to_animate = null;
		this.hoverRadio = args.hoverRadio || 0.1;
		this.max_slices = 10;
		this.max_legend_points = 6;
		this.isAnimate = false;
		this.startAngle = args.startAngle || 0;
		this.clockWise = args.clockWise || false;
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		this.setup();
	}
	setup_values() {
		this.centerX = this.width / 2;
		this.centerY = this.height / 2;
		this.radius = (this.height > this.width ? this.centerX : this.centerY);
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	static getPositionByAngle(angle,radius){
		return {
			x:Math.sin(angle * ANGLE_RATIO) * radius,
			y:Math.cos(angle * ANGLE_RATIO) * radius,
		};
	}
	makeArcPath(startPosition,endPosition){
		const{centerX,centerY,radius,clockWise} = this;
		return `M${centerX} ${centerY} L${centerX+startPosition.x} ${centerY+startPosition.y} A ${radius} ${radius} 0 0 ${clockWise ? 1 : 0} ${centerX+endPosition.x} ${centerY+endPosition.y} z`;
	}
	renderComponents(init){
		const{radius,clockWise} = this;
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		const prevSlicesProperties = this.slicesProperties || [];
		this.slices = [];
		this.elements_to_animate = [];
		this.slicesProperties = [];
		let curAngle = 180 - this.startAngle;
		this.slice_totals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / this.grand_total) * FULL_ANGLE;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = PieChart.getPositionByAngle(startAngle,radius);
			const endPosition = PieChart.getPositionByAngle(endAngle,radius);
			const prevProperty = init && prevSlicesProperties[i];
			let curStart,curEnd;
			if(init){
				curStart = prevProperty?prevProperty.startPosition : startPosition;
				curEnd = prevProperty? prevProperty.endPosition : startPosition;
			}else{
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath = this.makeArcPath(curStart,curEnd);
			let slice = makePath(curPath, 'pie-path', 'none', this.colors[i]);
			slice.style.transition = 'transform .3s;';
			this.drawArea.appendChild(slice);

			this.slices.push(slice);
			this.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: this.grand_total,
				startAngle,
				endAngle,
				angle:diffAngle
			});
			if(init){
				this.elements_to_animate.push([{unit: slice, array: this.slices, index: this.slices.length - 1},
					{d:this.makeArcPath(startPosition,endPosition)},
					650, "easein",null,{
						d:curPath
					}]);
			}

		});
		if(init){
			runSMILAnimation(this.chartWrapper, this.svg, this.elements_to_animate);
		}
	}

	calTranslateByAngle(property){
		const{radius,hoverRadio} = this;
		const position = PieChart.getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}
	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag){
			transform(path,this.calTranslateByAngle(this.slicesProperties[i]));
			path.style.fill = lightenDarkenColor(color,50);
			let g_off = getOffset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length>0
				? this.formatted_labels[i] : this.labels[i]) + ': ';
			let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);
			this.tip.set_values(x, y, title, percent + "%");
			this.tip.show_tip();
		}else{
			transform(path,'translate3d(0,0,0)');
			this.tip.hide_tip();
			path.style.fill = color;
		}
	}

	mouseMove(e){
		const target = e.target;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		for(let i = 0; i < this.slices.length; i++){
			if(target === this.slices[i]){
				this.hoverSlice(prevAcitve,prevIndex,false);
				this.curActiveSlice = target;
				this.curActiveSliceIndex = i;
				this.hoverSlice(target,i,true,e);
				break;
			}
		}
	}
	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
	bindTooltip() {
		this.drawArea.addEventListener('mousemove',this.mouseMove);
		this.drawArea.addEventListener('mouseleave',this.mouseLeave);
	}

	renderLegend() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			const color = this.colors[i];

			if(d) {
				let stats = $$1.create('div', {
					className: 'stats',
					inside: this.statsWrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background-color:${color};"></i>
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
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

// export function getMonthName() {}

class Heatmap extends BaseChart {
	constructor({
		start = '',
		domain = '',
		subdomain = '',
		data = {},
		discrete_domains = 0,
		count_label = '',
		legend_colors = []
	}) {
		super(arguments[0]);

		this.type = 'heatmap';

		this.domain = domain;
		this.subdomain = subdomain;
		this.data = data;
		this.discrete_domains = discrete_domains;
		this.count_label = count_label;

		let today = new Date();
		this.start = start || addDays(today, 365);

		legend_colors = legend_colors.slice(0, 5);
		this.legend_colors = this.validate_colors(legend_colors)
			? legend_colors
			: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		// Fixed 5-color theme,
		// More colors are difficult to parse visually
		this.distribution_size = 5;

		this.translateX = 0;
		// this.setup();
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

	setupConstants() {
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.first_week_start = new Date(this.start.toDateString());
		this.last_week_start = new Date(this.today.toDateString());
		if(this.first_week_start.getDay() !== 7) {
			addDays(this.first_week_start, (-1) * this.first_week_start.getDay());
		}
		if(this.last_week_start.getDay() !== 7) {
			addDays(this.last_week_start, (-1) * this.last_week_start.getDay());
		}
		this.no_of_cols = getWeeksBetween(this.first_week_start + '', this.last_week_start + '') + 1;
	}

	calcWidth() {
		this.baseWidth = (this.no_of_cols + 3) * 12 ;

		if(this.discrete_domains) {
			this.baseWidth += (12 * 12);
		}
	}

	setupLayers() {
		this.domain_label_group = this.makeLayer(
			'domain-label-group chart-label');

		this.data_groups = this.makeLayer(
			'data-groups',
			`translate(0, 20)`
		);
	}

	setup_values() {
		this.domain_label_group.textContent = '';
		this.data_groups.textContent = '';

		let data_values = Object.keys(this.data).map(key => this.data[key]);
		this.distribution = calcDistribution(data_values, this.distribution_size);

		this.month_names = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];

		this.render_all_weeks_and_store_x_values(this.no_of_cols);
	}

	render_all_weeks_and_store_x_values(no_of_weeks) {
		let current_week_sunday = new Date(this.first_week_start);
		this.week_col = 0;
		this.current_month = current_week_sunday.getMonth();

		this.months = [this.current_month + ''];
		this.month_weeks = {}, this.month_start_points = [];
		this.month_weeks[this.current_month] = 0;
		this.month_start_points.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let data_group, month_change = 0;
			let day = new Date(current_week_sunday);

			[data_group, month_change] = this.get_week_squares_group(day, this.week_col);
			this.data_groups.appendChild(data_group);
			this.week_col += 1 + parseInt(this.discrete_domains && month_change);
			this.month_weeks[this.current_month]++;
			if(month_change) {
				this.current_month = (this.current_month + 1) % 12;
				this.months.push(this.current_month + '');
				this.month_weeks[this.current_month] = 1;
			}
			addDays(current_week_sunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(current_date, index) {
		const no_of_weekdays = 7;
		const square_side = 10;
		const cell_padding = 2;
		const step = 1;
		const today_time = this.today.getTime();

		let month_change = 0;
		let week_col_change = 0;

		let data_group = makeSVGGroup(this.data_groups, 'data-group');

		for(var y = 0, i = 0; i < no_of_weekdays; i += step, y += (square_side + cell_padding)) {
			let data_value = 0;
			let color_index = 0;

			let current_timestamp = current_date.getTime()/1000;
			let timestamp = Math.floor(current_timestamp - (current_timestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				data_value = this.data[timestamp];
			}

			if(this.data[Math.round(timestamp)]) {
				data_value = this.data[Math.round(timestamp)];
			}

			if(data_value) {
				color_index = getMaxCheckpoint(data_value, this.distribution);
			}

			let x = 13 + (index + week_col_change) * 12;

			let dataAttr = {
				'data-date': getDdMmYyyy(current_date),
				'data-value': data_value,
				'data-day': current_date.getDay()
			};
			let heatSquare = makeHeatSquare('day', x, y, square_side,
				this.legend_colors[color_index], dataAttr);

			data_group.appendChild(heatSquare);

			let next_date = new Date(current_date);
			addDays(next_date, 1);
			if(next_date.getTime() > today_time) break;


			if(next_date.getMonth() - current_date.getMonth()) {
				month_change = 1;
				if(this.discrete_domains) {
					week_col_change = 1;
				}

				this.month_start_points.push(13 + (index + week_col_change) * 12);
			}
			current_date = next_date;
		}

		return [data_group, month_change];
	}

	render_month_labels() {
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

		this.month_start_points.map((start, i) => {
			let month_name =  this.month_names[this.months[i]].substring(0, 3);
			let text = makeText('y-value-text', start+12, 10, month_name);
			this.domain_label_group.appendChild(text);
		});
	}

	renderComponents() {
		Array.prototype.slice.call(
			this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')
		).map(d => {
			d.style.display = 'None';
		});
		this.chartWrapper.style.marginTop = '0px';
		this.chartWrapper.style.paddingTop = '0px';
	}

	bindTooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let date_parts = e.target.getAttribute('data-date').split('-');

				let month = this.month_names[parseInt(date_parts[1])-1].substring(0, 3);

				let g_off = this.chartWrapper.getBoundingClientRect(), p_off = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = p_off.left - g_off.left + (width+2)/2;
				let y = p_off.top - g_off.top - (width+2)/2;
				let value = count + ' ' + this.count_label;
				let name = ' on ' + month + ' ' + date_parts[0] + ', ' + date_parts[2];

				this.tip.set_values(x, y, name, value, [], 1);
				this.tip.show_tip();
			});
		});
	}

	update(data) {
		this.data = data;
		this.setup_values();
		this.bindTooltip();
	}
}

const chartTypes = {
	mixed: AxisChart,
	multiaxis: MultiAxisChart,
	scatter: ScatterChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', options) {
	debugger;
	if(chartType === 'line') {
		options.type = 'line';
		return new AxisChart(options);
	} else if (chartType === 'bar') {
		options.type = 'bar';
		return new AxisChart(options);
	}

	if (!chartTypes[chartType]) {
		console.error("Undefined chart type: " + chartType);
		return;
	}

	return new chartTypes[chartType](options);
}

class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}

export default Chart;
