import { getBarHeightAndYAttr } from './draw-utils';

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const FONT_SIZE = 10;

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

export function makeVertXLine(x, label, totalHeight, mode) {
	let height = mode === 'span' ? -1 * AXIS_TICK_LENGTH : totalHeight;

	let l = createSVG('line', {
		x1: 0,
		x2: 0,
		y1: totalHeight + AXIS_TICK_LENGTH,
		y2: height
	});

	let text = createSVG('text', {
		x: 0,
		y: totalHeight + AXIS_TICK_LENGTH + LABEL_MARGIN,
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

export function makeHoriYLine(y, label, totalWidth, mode) {
	let lineType = '';
	let width = mode === 'span' ? totalWidth + AXIS_TICK_LENGTH : AXIS_TICK_LENGTH;

	let l = createSVG('line', {
		className: lineType === "dashed" ? "dashed": "",
		x1: -1 * AXIS_TICK_LENGTH,
		x2: width,
		y1: 0,
		y2: 0
	});

	let text = createSVG('text', {
		x: -1 * (LABEL_MARGIN + AXIS_TICK_LENGTH),
		y: 0,
		dy: (FONT_SIZE / 2 - 2) + 'px',
		'font-size': FONT_SIZE + 'px',
		'text-anchor': 'end',
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

	bar(x, yTop, args, color, index, datasetIndex, noOfDatasets) {

		let totalWidth = this.unitWidth - args.spaceWidth;
		let startX = x - totalWidth/2;

		// temp
		// let width = totalWidth / noOfDatasets;
		// let currentX = startX + width * datasetIndex;

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

	xLine(x, label, mode=this.xAxisMode) {
		// Draw X axis line in span/tick mode with optional label
		return makeVertXLine(x, label, this.totalHeight, mode);
	}

	yLine(y, label, mode=this.yAxisMode) {
		return makeHoriYLine(y, label, this.totalWidth, mode);
	}

	xMarker() {}
	yMarker() {}

	xRegion() {}
	yRegion() {}
}
