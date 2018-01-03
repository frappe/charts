import { getBarHeightAndYAttr } from './draw-utils';
import { STD_EASING, UNIT_ANIM_DUR, MARKER_LINE_ANIM_DUR, PATH_ANIM_DUR } from './animate';

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const FONT_SIZE = 10;
const BASE_LINE_COLOR = '#dadada';

function $(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

function createSVG(tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

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

export function makeSVGContainer(parent, className, width, height) {
	return createSVG('svg', {
		className: className,
		inside: parent,
		width: width,
		height: height
	});
}

export function makeSVGDefs(svgContainer) {
	return createSVG('defs', {
		inside: svgContainer,
	});
}

export function makeSVGGroup(parent, className, transform='') {
	return createSVG('g', {
		className: className,
		inside: parent,
		transform: transform
	});
}

export function makePath(pathStr, className='', stroke='none', fill='none') {
	return createSVG('path', {
		className: className,
		d: pathStr,
		styles: {
			stroke: stroke,
			fill: fill
		}
	});
}

export function makeGradient(svgDefElem, color, lighter = false) {
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

export function makeHeatSquare(className, x, y, size, fill='none', data={}) {
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

export function makeText(className, x, y, content) {
	return createSVG('text', {
		className: className,
		x: x,
		y: y,
		dy: (FONT_SIZE / 2) + 'px',
		'font-size': FONT_SIZE + 'px',
		innerHTML: content
	});
}

export function makeVertLine(x, label, y1, y2, options={}) {
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

export function makeHoriLine(y, label, x1, x2, options={}) {
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
		transform: `translate(0, ${ y })`,
		'stroke-opacity': 1
	});

	if(text === 0 || text === '0') {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	line.appendChild(l);
	line.appendChild(text);

	return line;
}

export class AxisChartRenderer {
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

	bar(x, yTop, args, color, index, datasetIndex, noOfDatasets) {

		let totalWidth = this.unitWidth - args.spaceWidth;
		let startX = x - totalWidth/2;

		// temp commented
		// let width = totalWidth / noOfDatasets;
		// let currentX = startX + width * datasetIndex;

		// temp
		let width = totalWidth;
		let currentX = startX;

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
	}

	dot(x, y, args, color, index) {
		return createSVG('circle', {
			style: `fill: ${color}`,
			'data-point-index': index,
			cx: x,
			cy: y,
			r: args.radius
		});
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
			className: options.className
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
			x1 = this.totalWidth + AXIS_TICK_LENGTH
			x2 = this.totalWidth;
		}

		let offset = options.pos === 'left' ? -1 * options.offset : options.offset;

		x1 += options.offset;
		x2 += options.offset;

		return makeHoriLine(y, label, x1, x2, {
			stroke: options.stroke,
			className: options.className
		});
	}


	xMarker() {}
	yMarker() {}

	xRegion() {}
	yRegion() {}

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
