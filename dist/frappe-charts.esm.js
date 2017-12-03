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
		this.container = $.create('div', {
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

			let li = $.create('li', {
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

const MIN_BAR_PERCENT_HEIGHT = 0.01;



function getXLineProps(totalHeight, mode) {
	let startAt = totalHeight + 6, height, textStartAt, axisLineClass = '';
	if(mode === 'span') {		// long spanning lines
		startAt = -7;
		height = totalHeight + 15;
		textStartAt = totalHeight + 25;
	} else if(mode === 'tick'){	// short label lines
		startAt = totalHeight;
		height = 6;
		textStartAt = 9;
		axisLineClass = 'x-axis-label';
	}

	return [startAt, height, textStartAt, axisLineClass];
}

// export function getYLineProps(totalWidth, mode, specific=false) {
function getYLineProps(totalWidth, mode) {
	// if(specific) {
	// 	return[totalWidth, totalWidth + 5, 'specific-value', 0];
	// }
	let width, text_end_at = -9, axisLineClass = '', startAt = 0;
	if(mode === 'span') {		// long spanning lines
		width = totalWidth + 6;
		startAt = -6;
	} else if(mode === 'tick'){	// short label lines
		width = -6;
		axisLineClass = 'y-axis-label';
	}

	return [width, text_end_at, axisLineClass, startAt];
}

// let char_width = 8;
// let allowed_space = avg_unit_width * 1.5;
// let allowed_letters = allowed_space / 8;

// return values.map((value, i) => {
// 	let space_taken = getStringWidth(value, char_width) + 2;
// 	if(space_taken > allowed_space) {
// 		if(is_series) {
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

function getBarHeightAndYAttr(yTop, zeroLine, totalHeight) {
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

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * MIN_BAR_PERCENT_HEIGHT;
		}
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

const X_LABEL_CLASS = 'x-value-text';
const Y_LABEL_CLASS = 'y-value-text';

// const X_AXIS_LINE_CLASS = 'x-value-text';
// const Y_AXIS_LINE_CLASS = 'y-value-text';

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
		dy: '.32em',
		innerHTML: content
	});
}

var AxisChartRenderer = (function() {
	var AxisChartRenderer = function(totalHeight, totalWidth, zeroLine, avgUnitWidth, xAxisMode, yAxisMode) {
		this.totalHeight = totalHeight;
		this.totalWidth = totalWidth;
		this.zeroLine = zeroLine;
		this.avgUnitWidth = avgUnitWidth;
		this.xAxisMode = xAxisMode;
		this.yAxisMode = yAxisMode;
	};

	AxisChartRenderer.prototype = {
		bar: function (x, yTop, args, color, index, datasetIndex, noOfDatasets) {
			let totalWidth = this.avgUnitWidth - args.spaceWidth;
			let startX = x - totalWidth/2;

			let width = totalWidth / noOfDatasets;
			let currentX = startX + width * datasetIndex;

			let [height, y] = getBarHeightAndYAttr(yTop, this.zeroLine, this.totalHeight);

			return createSVG('rect', {
				className: `bar mini`,
				style: `fill: ${color}`,
				'data-point-index': index,
				x: currentX,
				y: y,
				width: width,
				height: height
			});
		},

		dot: function(x, y, args, color, index) {
			return createSVG('circle', {
				style: `fill: ${color}`,
				'data-point-index': index,
				cx: x,
				cy: y,
				r: args.radius
			});
		},

		xLine: function(x, label, mode=this.xAxisMode) {
			// Draw X axis line in span/tick mode with optional label
			let [startAt, height, textStartAt, axisLineClass] = getXLineProps(this.totalHeight, mode);
			let l = createSVG('line', {
				x1: 0,
				x2: 0,
				y1: startAt,
				y2: height
			});

			let text = createSVG('text', {
				className: X_LABEL_CLASS,
				x: 0,
				y: textStartAt,
				dy: '.71em',
				innerHTML: label
			});

			let line = createSVG('g', {
				className: `tick ${axisLineClass}`,
				transform: `translate(${ x }, 0)`
			});

			line.appendChild(l);
			line.appendChild(text);

			return line;
		},

		yLine: function(y, label, mode=this.yAxisMode) {
			// TODO: stroke type
			let lineType = '';

			let [width, textEndAt, axisLineClass, startAt] = getYLineProps(this.totalWidth, mode);
			let l = createSVG('line', {
				className: lineType === "dashed" ? "dashed": "",
				x1: startAt,
				x2: width,
				y1: 0,
				y2: 0
			});

			let text = createSVG('text', {
				className: Y_LABEL_CLASS,
				x: textEndAt,
				y: 0,
				dy: '.32em',
				innerHTML: label+""
			});

			let line = createSVG('g', {
				className: `tick ${axisLineClass}`,
				transform: `translate(0, ${y})`,
				'stroke-opacity': 1
			});

			// if(darker) {
			// 	line.style.stroke = "rgba(27, 31, 35, 0.6)";
			// }

			line.appendChild(l);
			line.appendChild(text);

			return line;
		},

		xRegion: function(x1, x2, label) { },

		yRegion: function(y1, y2, label) { }
	};

	return AxisChartRenderer;
})();

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

class BaseChart {
	constructor({
		height = 240,

		title = '',
		subtitle = '',
		colors = [],

		isNavigable = 0,

		type = '',

		parent,
		data
	}) {
		this.rawChartArgs = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.isNavigable = isNavigable;
		if(this.isNavigable) {
			this.currentIndex = 0;
		}

		this.setupConfiguration();
	}

	setupConfiguration() {
		// Make a this.config, that has stuff like showTooltip,
		// showLegend, which then all functions will check

		this.setColors();
		this.setMargins();

		this.config = {
			showTooltip: 1,
			showLegend: 1,
			isNavigable: 0
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
		let height = this.rawChartArgs.height;
		this.baseHeight = height;
		this.height = height - 40;
		this.translateX = 60;
		this.translateY = 10;
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
		// Check and all



		// If all good
		this.data = data;


		return true;
	}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.bindWindowEvents();
		this.setupConstants();


		this.makeContainer();
		this.makeTooltip(); // without binding
		this.draw(true);
	}

	draw(init=false) {
		// (draw everything, layers, groups, units)
		this.calc();
		this.setupRenderer(); // this chart's rendered with the config
		this.setupComponents();


		this.makeChartArea();
		this.makeLayers();

		this.renderComponents(); // with zero values
		this.renderLegend();
		this.setupNavigation(init);

		if(init) this.update(this.data);
	}

	bindWindowEvents() {
		window.addEventListener('resize', () => this.draw());
		window.addEventListener('orientationchange', () => this.draw());
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
		this.width = this.baseWidth - this.translateX * 2;
	}

	setupConstants() {}

	calc() {
		this.calcWidth();
		this.reCalc();
	}

	setupRenderer() {}

	setupComponents() {
		// Components config
		this.components = [];
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

	makeChartArea() {
		this.svg = makeSVGContainer(
			this.chartWrapper,
			'chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svg_defs = makeSVGDefs(this.svg);

		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.translateX}, ${this.translateY})`
		);
	}


	makeLayers() {
		this.components.forEach((component) => {
			component.layer = this.makeLayer(component.layerClass);
		});
	}

	calculateValues() {}

	renderComponents() {
		this.components.forEach(c => {
			c.store = c.make(...c.makeArgs);
			c.layer.textContent = '';
			c.store.forEach(element => {c.layer.appendChild(element);});
		});
	}

	update() {
		this.reCalc();
		this.reRender();
	}

	reCalc() {
		// Will update values(state)
		// Will recalc specific parts depending on the update
	}

	reRender(animate=true) {
		if(!animate) {
			this.renderComponents();
			return;
		}
		this.animateComponents();
		setTimeout(() => {
			this.renderComponents();
		}, 400);
		// TODO: should be max anim duration required
		// (opt, should not redraw if still in animate?)
	}

	animateComponents() {
		this.intermedValues = this.calcIntermediateValues();
		this.components.forEach(c => {
			// c.store = c.animate(...c.animateArgs);
			// c.layer.textContent = '';
			// c.store.forEach(element => {c.layer.appendChild(element);});
		});
	}


	calcInitStage() {}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.chartWrapper,
			colors: this.colors
		});
		this.bindTooltip();
	}

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

	getDataPoint() {}
	updateCurrentDataPoint() {}

	makeLayer(className, transform='') {
		return makeSVGGroup(this.drawArea, className, transform);
	}

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}

const UNIT_ANIM_DUR = 350;
const PATH_ANIM_DUR = 650;
const MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
const REPLACE_ALL_NEW_DUR = 250;

const STD_EASING = 'easein';

var Animator = (function() {
	var Animator = function(totalHeight, totalWidth, zeroLine, avgUnitWidth) {
		// constants
		this.totalHeight = totalHeight;
		this.totalWidth = totalWidth;

		// changeables
		this.avgUnitWidth = avgUnitWidth;
		this.zeroLine = zeroLine;
	};

	Animator.prototype = {
		bar: function(barObj, x, yTop, index, noOfDatasets) {
			let start = x - this.avgUnitWidth/4;
			let width = (this.avgUnitWidth/2)/noOfDatasets;
			let [height, y] = getBarHeightAndYAttr(yTop, this.zeroLine, this.totalHeight);

			x = start + (width * index);

			return [barObj, {width: width, height: height, x: x, y: y}, UNIT_ANIM_DUR, STD_EASING];
			// bar.animate({height: args.newHeight, y: yTop}, UNIT_ANIM_DUR, mina.easein);
		},

		dot: function(dotObj, x, yTop) {
			return [dotObj, {cx: x, cy: yTop}, UNIT_ANIM_DUR, STD_EASING];
			// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
		},

		path: function(d, pathStr) {
			let pathComponents = [];
			const animPath = [{unit: d.path, object: d, key: 'path'}, {d:"M"+pathStr}, PATH_ANIM_DUR, STD_EASING];
			pathComponents.push(animPath);

			if(d.regionPath) {
				let regStartPt = `0,${this.zeroLine}L`;
				let regEndPt = `L${this.totalWidth}, ${this.zeroLine}`;

				const animRegion = [
					{unit: d.regionPath, object: d, key: 'regionPath'},
					{d:"M" + regStartPt + pathStr + regEndPt},
					PATH_ANIM_DUR,
					STD_EASING
				];
				pathComponents.push(animRegion);
			}

			return pathComponents;
		},

		translate: function(obj, oldCoord, newCoord, duration) {
			return [
				{unit: obj, array: [0], index: 0},
				{transform: newCoord.join(', ')},
				duration,
				STD_EASING,
				"translate",
				{transform: oldCoord.join(', ')}
			];
		},

		verticalLine: function(xLine, newX, oldX) {
			return this.translate(xLine, [oldX, 0], [newX, 0], MARKER_LINE_ANIM_DUR);
		},

		horizontalLine: function(yLine, newY, oldY) {
			return this.translate(yLine, [0, oldY], [0, newY], MARKER_LINE_ANIM_DUR);
		}
	};

	return Animator;
})();





// export function animateXLines(animator, lines, oldX, newX) {
// 	// this.xAxisLines.map((xLine, i) => {
// 	return lines.map((xLine, i) => {
// 		return animator.verticalLine(xLine, newX[i], oldX[i]);
// 	});
// }

// export function animateYLines(animator, lines, oldY, newY) {
// 	// this.yAxisLines.map((yLine, i) => {
// 	lines.map((yLine, i) => {
// 		return animator.horizontalLine(yLine, newY[i], oldY[i]);
// 	});
// }

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
		let obj = element[0];
		let parent = obj.unit.parentNode;

		let animElement, newElement;

		element[0] = obj.unit;
		[animElement, newElement] = animateSVGElement(...element);

		newElements.push(newElement);
		animElements.push([animElement, parent]);

		parent.replaceChild(animElement, obj.unit);

		if(obj.array) {
			obj.array[obj.index] = newElement;
		} else {
			obj.object[obj.key] = newElement;
		}
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
		this.is_series = args.is_series;
		this.format_tooltip_y = args.format_tooltip_y;
		this.format_tooltip_x = args.format_tooltip_x;
		this.zero_line = this.height;
	}

	parseData() {
		let args = this.rawChartArgs;
		this.xAxisLabels = args.data.labels || [];
		this.y = args.data.datasets || [];

		this.y.forEach(function(d, i) {
			d.index = i;
		}, this);
		return true;
	}

	reCalc() {
		// examples:

		// [A] Dimension change:

		// [B] Data change:
		// 1. X values update
		// 2. Y values update


		// Aka all the values(state), these all will be documented in an old values object

		// Backup first!
		this.oldValues = ["everything"];

		// extracted, raw args will remain in their own object
		this.datasetsLabels = [];
		this.datasetsValues = [[[12, 34, 68], [10, 5, 46]], [[20, 20, 20]]];

		// CALCULATION: we'll need the first batch of calcs
		// List of what will happen:
			// this.xOffset = 0;
			// this.unitWidth = 0;
			// this.scaleMultipliers = [];
			// this.datasetsPoints =

		// Now, the function calls

		// var merged = [].concat(...arrays)



		// INIT
		// axes
		this.yAxisPositions = [this.height, this.height/2, 0];
		this.yAxisLabels = ['0', '5', '10'];

		this.xPositions = [0, this.width/2, this.width];
		this.xAxisLabels = ['0', '5', '10'];


	}

	calcInitStage() {
		// will borrow from the full recalc function
	}

	calcIntermediateValues() {
		//
	}

	// this should be inherent in BaseChart
	getRenderer() {
		// These args are basically the current state/config of the chart,
		// with constant and alive params mixed
		return new AxisChartRenderer(this.height, this.width,
			this.zero_line, this.avg_unit_width, this.xAxisMode, this.yAxisMode);
	}

	setupComponents() {
		// Must have access to all current data things
		let self = this;
		let renderer = this.getRenderer();
		this.yAxis = {
			layerClass: 'y axis',
			layer: undefined,
			make: self.makeYLines,
			makeArgs: [renderer, self.yAxisPositions, self.yAxisLabels],
			store: [],
			// animate? or update? will come to while implementing
			animate: self.animateYLines,
			// indexed: 1 // ?? As per datasets?
		};
		this.xAxis = {
			layerClass: 'x axis',
			layer: undefined,
			make: self.makeXLines,
			// TODO: better context of renderer
			// TODO: will implement series skip with avgUnitWidth and isSeries later
			makeArgs: [renderer, self.xPositions, self.xAxisLabels],
			store: [],
			animate: self.animateXLines
		};
		// Indexed according to dataset
		// this.dataUnits = {
		// 	layerClass: 'y marker axis',
		// 	layer: undefined,
		// 	make: makeXLines,
		// 	makeArgs: [this.xPositions, this.xAxisLabels],
		// 	store: [],
		// 	animate: animateXLines,
		// 	indexed: 1
		// };
		this.yMarkerLines = {
			// layerClass: 'y marker axis',
			// layer: undefined,
			// make: makeYMarkerLines,
			// makeArgs: [this.yMarkerPositions, this.yMarker],
			// store: [],
			// animate: animateYMarkerLines
		};
		this.xMarkerLines = {
			// layerClass: 'x marker axis',
			// layer: undefined,
			// make: makeXMarkerLines,
			// makeArgs: [this.xMarkerPositions, this.xMarker],
			// store: [],
			// animate: animateXMarkerLines
		};

		// Marker Regions

		this.components = [
			this.yAxis,
			this.xAxis,
			// this.yMarkerLines,
			// this.xMarkerLines,
			// this.dataUnits,
		];
	}

	setup_values() {
		this.data.datasets.map(d => {
			d.values = d.values.map(val => (!isNaN(val) ? val : 0));
		});
		this.setup_x();
		this.setup_y();
	}

	setup_x() {
		this.set_avg_unit_width_and_x_offset();
		if(this.xPositions) {
			this.x_old_axis_positions =  this.xPositions.slice();
		}
		this.xPositions = this.xAxisLabels.map((d, i) =>
			floatTwo(this.x_offset + i * this.avg_unit_width));

		if(!this.x_old_axis_positions) {
			this.x_old_axis_positions = this.xPositions.slice();
		}
	}

	setup_y() {
		if(this.yAxisLabels) {
			this.y_old_axis_values =  this.yAxisLabels.slice();
		}

		let values = this.get_all_y_values();

		if(this.y_sums && this.y_sums.length > 0) {
			values = values.concat(this.y_sums);
		}

		this.yAxisLabels = calcIntervals(values, this.type === 'line');

		if(!this.y_old_axis_values) {
			this.y_old_axis_values = this.yAxisLabels.slice();
		}

		const y_pts = this.yAxisLabels;
		const value_range = y_pts[y_pts.length-1] - y_pts[0];

		if(this.multiplier) this.old_multiplier = this.multiplier;
		this.multiplier = this.height / value_range;
		if(!this.old_multiplier) this.old_multiplier = this.multiplier;

		const interval = y_pts[1] - y_pts[0];
		const interval_height = interval * this.multiplier;

		let zero_index;

		if(y_pts.indexOf(0) >= 0) {
			// the range has a given zero
			// zero-line on the chart
			zero_index = y_pts.indexOf(0);
		} else if(y_pts[0] > 0) {
			// Minimum value is positive
			// zero-line is off the chart: below
			let min = y_pts[0];
			zero_index = (-1) * min / interval;
		} else {
			// Maximum value is negative
			// zero-line is off the chart: above
			let max = y_pts[y_pts.length - 1];
			zero_index = (-1) * max / interval + (y_pts.length - 1);
		}

		if(this.zero_line) this.old_zero_line = this.zero_line;
		this.zero_line = this.height - (zero_index * interval_height);
		if(!this.old_zero_line) this.old_zero_line = this.zero_line;

		// Make positions arrays for y elements
		if(this.yAxisPositions) this.oldYAxisPositions = this.yAxisPositions;
		this.yAxisPositions = this.yAxisLabels.map(d => this.zero_line - d * this.multiplier);
		if(!this.oldYAxisPositions) this.oldYAxisPositions = this.yAxisPositions;

		// if(this.yAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
		// this.yAnnotationPositions = this.specific_values.map(d => this.zero_line - d.value * this.multiplier);
		// if(!this.oldYAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
	}

	makeXLines(renderer, positions, values) {
		// TODO: draw as per condition

		return positions.map((position, i) => renderer.xLine(position, values[i]));
	}

	makeYLines(renderer, positions, values) {
		return positions.map((position, i) => renderer.yLine(position, values[i]));
	}

	draw_graph(init=false) {
		// TODO: NO INIT!
		if(this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
			this.y.map((d, i) => {
				d.svg_units = [];
				this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
				this.makeUnits(d);
				this.calcYDependencies();
			});
			return;
		}
		if(init) {
			this.draw_new_graph_and_animate();
			return;
		}
		this.y.map((d, i) => {
			d.svg_units = [];
			this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
			this.makeUnits(d);
		});
	}

	draw_new_graph_and_animate() {
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.yUnitPositions = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
			this.makeUnits(d);
		});

		setTimeout(() => {
			this.updateData(data);
		}, 350);
	}

	setupNavigation(init) {
		if(init) {
			// Hack: defer nav till initial updateData
			setTimeout(() => {
				super.setupNavigation(init);
			}, 500);
		} else {
			super.setupNavigation(init);
		}
	}

	makeUnits(d) {
		this.makeDatasetUnits(
			this.xPositions,
			d.yUnitPositions,
			this.colors[d.index],
			d.index,
			this.y.length
		);
	}

	makeDatasetUnits(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {

		if(!units_group) units_group = this.svg_units_groups[dataset_index];
		if(!units_array) units_array = this.y[dataset_index].svg_units;
		if(!unit) unit = this.unit_args;

		units_group.textContent = '';
		units_array.length = 0;

		let unit_AxisChartRenderer = new AxisChartRenderer(this.height, this.zero_line, this.avg_unit_width);

		y_values.map((y, i) => {
			let data_unit = unit_AxisChartRenderer[unit.type](
				x_values[i],
				y,
				unit.args,
				color,
				i,
				dataset_index,
				no_of_datasets
			);
			units_group.appendChild(data_unit);
			units_array.push(data_unit);
		});

		if(this.isNavigable) {
			this.bind_units(units_array);
		}
	}

	bindTooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chartWrapper.addEventListener('mousemove', (e) => {
			let offset = getOffset(this.chartWrapper);
			let relX = e.pageX - offset.left - this.translateX;
			let relY = e.pageY - offset.top - this.translateY;

			if(relY < this.height + this.translateY * 2) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		if(!this.y_min_tops) return;

		let titles = this.xAxisLabels;
		if(this.format_tooltip_x && this.format_tooltip_x(this.xAxisLabels[0])) {
			titles = this.xAxisLabels.map(d=>this.format_tooltip_x(d));
		}

		let y_format = this.format_tooltip_y && this.format_tooltip_y(this.y[0].values[0]);

		for(var i=this.xPositions.length - 1; i >= 0 ; i--) {
			let x_val = this.xPositions[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.xPositions[i-1];
			if(relX > x_val - this.avg_unit_width/2) {
				let x = x_val + this.translateX;
				let y = this.y_min_tops[i] + this.translateY;

				let title = titles[i];
				let values = this.y.map((set, j) => {
					return {
						title: set.title,
						value: y_format ? this.format_tooltip_y(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	// API
	updateData(newY, newX) {
		if(!newX) {
			newX = this.xAxisLabels;
		}
		this.updating = true;

		this.old_x_values = this.xAxisLabels.slice();
		this.old_y_axis_tops = this.y.map(d => d.yUnitPositions.slice());

		this.old_y_values = this.y.map(d => d.values);

		// Just update values prop, setup_x/y() will do the rest
		if(newY) this.y.map(d => {d.values = newY[d.index].values;});
		if(newX) this.xAxisLabels = newX;

		this.setup_x();
		this.setup_y();

		// Change in data, so calculate dependencies
		this.calcYDependencies();

		// Got the values? Now begin drawing
		this.animator = new Animator(this.height, this.width, this.zero_line, this.avg_unit_width);

		this.animate_graphs();

		this.updating = false;
	}

	animate_graphs() {
		this.elements_to_animate = [];
		// Pre-prep, equilize no of positions between old and new
		let [old_x, newX] = equilizeNoOfElements(
			this.x_old_axis_positions.slice(),
			this.xPositions.slice()
		);

		let [oldYAxis, newYAxis] = equilizeNoOfElements(
			this.oldYAxisPositions.slice(),
			this.yAxisPositions.slice()
		);

		let newXValues = this.xAxisLabels.slice();
		let newYValues = this.yAxisLabels.slice();

		let extra_points = this.xPositions.slice().length - this.x_old_axis_positions.slice().length;

		if(extra_points > 0) {
			this.makeXLines(old_x, newXValues);
		}
		// No Y extra check?
		this.makeYLines(oldYAxis, newYValues);

		// Animation
		if(extra_points !== 0) {
			this.animateXLines(old_x, newX);
		}
		this.animateYLines(oldYAxis, newYAxis);

		this.y.map(d => {
			let [old_y, newY] = equilizeNoOfElements(
				this.old_y_axis_tops[d.index].slice(),
				d.yUnitPositions.slice()
			);
			if(extra_points > 0) {
				this.make_path && this.make_path(d, old_x, old_y, this.colors[d.index]);
				this.makeDatasetUnits(old_x, old_y, this.colors[d.index], d.index, this.y.length);
			}
			// Animation
			d.path && this.animate_path(d, newX, newY);
			this.animate_units(d, newX, newY);
		});

		runSMILAnimation(this.chartWrapper, this.svg, this.elements_to_animate);

		setTimeout(() => {
			this.y.map(d => {
				this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[d.index]);
				this.makeUnits(d);

				this.makeYLines(this.yAxisPositions, this.yAxisLabels);
				this.makeXLines(this.xPositions, this.xAxisLabels);
				// this.make_y_specifics(this.yAnnotationPositions, this.specific_values);
			});
		}, 400);
	}

	animate_path(d, newX, newY) {
		const newPointsList = newY.map((y, i) => (newX[i] + ',' + y));
		this.elements_to_animate = this.elements_to_animate
			.concat(this.animator.path(d, newPointsList.join("L")));
	}

	animate_units(d, newX, newY) {
		let type = this.unit_args.type;

		d.svg_units.map((unit, i) => {
			if(newX[i] === undefined || newY[i] === undefined) return;
			this.elements_to_animate.push(this.animator[type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				newX[i],
				newY[i],
				d.index,
				this.y.length
			));
		});
	}

	animateXLines(oldX, newX) {
		this.xAxisLines.map((xLine, i) => {
			this.elements_to_animate.push(this.animator.verticalLine(
				xLine, newX[i], oldX[i]
			));
		});
	}

	animateYLines(oldY, newY) {
		this.yAxisLines.map((yLine, i) => {
			this.elements_to_animate.push(this.animator.horizontalLine(
				yLine, newY[i], oldY[i]
			));
		});
	}

	animateYAnnotations() {
		//
	}

	add_data_point(y_point, x_point, index=this.xAxisLabels.length) {
		let newY = this.y.map(data_set => { return {values:data_set.values}; });
		newY.map((d, i) => { d.values.splice(index, 0, y_point[i]); });
		let newX = this.xAxisLabels.slice();
		newX.splice(index, 0, x_point);

		this.updateData(newY, newX);
	}

	remove_data_point(index = this.xAxisLabels.length-1) {
		if(this.xAxisLabels.length < 3) return;

		let newY = this.y.map(data_set => { return {values:data_set.values}; });
		newY.map((d) => { d.values.splice(index, 1); });
		let newX = this.xAxisLabels.slice();
		newX.splice(index, 1);

		this.updateData(newY, newX);
	}

	getDataPoint(index=this.currentIndex) {
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

	updateCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.xAxisLabels.length) index = this.xAxisLabels.length - 1;
		if(index === this.currentIndex) return;
		this.currentIndex = index;
		fire(this.parent, "data-select", this.getDataPoint());
	}

	set_avg_unit_width_and_x_offset() {
		// Set the ... you get it
		this.avg_unit_width = this.width/(this.xAxisLabels.length - 1);
		this.x_offset = 0;
	}

	get_all_y_values() {
		let all_values = [];

		// Add in all the y values in the datasets
		this.y.map(d => {
			all_values = all_values.concat(d.values);
		});

		// Add in all the specific values
		return all_values.concat(this.specific_values.map(d => d.value));
	}

	calcYDependencies() {
		this.y_min_tops = new Array(this.xAxisLabels.length).fill(9999);
		this.y.map(d => {
			d.yUnitPositions = d.values.map( val => floatTwo(this.zero_line - val * this.multiplier));
			d.yUnitPositions.map( (yUnitPosition, i) => {
				if(yUnitPosition < this.y_min_tops[i]) {
					this.y_min_tops[i] = yUnitPosition;
				}
			});
		});
		// this.chartWrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}
}

class BarChart extends AxisChart {
	constructor(args) {
		super(args);

		this.type = 'bar';
		this.xAxisMode = args.xAxisMode || 'tick';
		this.yAxisMode = args.yAxisMode || 'span';
		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.x_offset = this.avg_unit_width;
		this.unit_args = {
			type: 'bar',
			args: {
				spaceWidth: this.avg_unit_width/2,
			}
		};
	}

	// makeOverlay() {
	// 	// Just make one out of the first element
	// 	let index = this.xAxisLabels.length - 1;
	// 	let unit = this.y[0].svg_units[index];
	// 	this.updateCurrentDataPoint(index);

	// 	if(this.overlay) {
	// 		this.overlay.parentNode.removeChild(this.overlay);
	// 	}
	// 	this.overlay = unit.cloneNode();
	// 	this.overlay.style.fill = '#000000';
	// 	this.overlay.style.opacity = '0.4';
	// 	this.drawArea.appendChild(this.overlay);
	// }

	// bindOverlay() {
	// 	// on event, update overlay
	// 	this.parent.addEventListener('data-select', (e) => {
	// 		this.update_overlay(e.svg_unit);
	// 	});
	// }

	bind_units(units_array) {
		units_array.map(unit => {
			unit.addEventListener('click', () => {
				let index = unit.getAttribute('data-point-index');
				this.updateCurrentDataPoint(index);
			});
		});
	}

	update_overlay(unit) {
		let attributes = [];
		Object.keys(unit.attributes).map(index => {
			attributes.push(unit.attributes[index]);
		});

		attributes.filter(attr => attr.specified).map(attr => {
			this.overlay.setAttribute(attr.name, attr.nodeValue);
		});

		this.overlay.style.fill = '#000000';
		this.overlay.style.opacity = '0.4';
	}

	onLeftArrow() {
		this.updateCurrentDataPoint(this.currentIndex - 1);
	}

	onRightArrow() {
		this.updateCurrentDataPoint(this.currentIndex + 1);
	}

	set_avg_unit_width_and_x_offset() {
		this.avg_unit_width = this.width/(this.xAxisLabels.length + 1);
		this.x_offset = this.avg_unit_width;
	}
}

class LineChart extends AxisChart {
	constructor(args) {
		super(args);

		this.xAxisMode = args.xAxisMode || 'span';
		this.yAxisMode = args.yAxisMode || 'span';

		if(args.hasOwnProperty('show_dots')) {
			this.show_dots = args.show_dots;
		} else {
			this.show_dots = 1;
		}
		this.region_fill = args.region_fill;

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}
		this.dot_radius = args.dot_radius || 4;
		this.heatline = args.heatline;
		this.type = 'line';

		this.setup();
	}

	setupPreUnitLayers() {
		// Path groups
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = makeSVGGroup(
				this.drawArea,
				'path-group path-group-' + i
			);
		});
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	makeDatasetUnits(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {
		if(this.show_dots) {
			super.makeDatasetUnits(x_values, y_values, color, dataset_index,
				no_of_datasets, units_group, units_array, unit);
		}
	}

	make_paths() {
		this.y.map(d => {
			this.make_path(d, this.xPositions, d.yUnitPositions, d.color || this.colors[d.index]);
		});
	}

	make_path(d, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[d.index].textContent = '';

		d.path = makePath("M"+points_str, 'line-graph-path', color);
		this.paths_groups[d.index].appendChild(d.path);

		if(this.heatline) {
			let gradient_id = makeGradient(this.svg_defs, color);
			d.path.style.stroke = `url(#${gradient_id})`;
		}

		if(this.region_fill) {
			this.fill_region_for_dataset(d, color, points_str);
		}
	}

	fill_region_for_dataset(d, color, points_str) {
		let gradient_id = makeGradient(this.svg_defs, color, true);
		let pathStr = "M" + `0,${this.zero_line}L` + points_str + `L${this.width},${this.zero_line}`;

		d.regionPath = makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id})`);
		this.paths_groups[d.index].appendChild(d.regionPath);
	}
}

class ScatterChart extends LineChart {
	constructor(args) {
		super(args);

		this.type = 'scatter';

		if(!args.dot_radius) {
			this.dot_radius = 8;
		} else {
			this.dot_radius = args.dot_radius;
		}

		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	make_paths() {}
	make_path() {}
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

		this.chartDiv = $.create('div', {
			className: 'div',
			inside: this.chartWrapper
		});

		this.chart = $.create('div', {
			className: 'progress-chart',
			inside: this.chartDiv
		});
	}

	setupLayers() {
		this.percentageBar = $.create('div', {
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
			let slice = $.create('div', {
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
				let stats = $.create('div', {
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
				let stats = $.create('div', {
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
	line: LineChart,
	bar: BarChart,
	scatter: ScatterChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', options) {
	if (!chartTypes[chartType]) {
		return new LineChart(options);
	}

	return new chartTypes[chartType](options);
}

class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}

export default Chart;
