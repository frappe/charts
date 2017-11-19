import { getBarHeightAndYAttr } from './draw-utils';

// Constants used

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
		dy: '.32em',
		innerHTML: content
	});
}

export function makeXLine(height, textStartAt, point, labelClass, axisLineClass, xPos) {
	let line = createSVG('line', {
		x1: 0,
		x2: 0,
		y1: 0,
		y2: height
	});

	let text = createSVG('text', {
		className: labelClass,
		x: 0,
		y: textStartAt,
		dy: '.71em',
		innerHTML: point
	});

	let xLine = createSVG('g', {
		className: `tick ${axisLineClass}`,
		transform: `translate(${ xPos }, 0)`
	});

	xLine.appendChild(line);
	xLine.appendChild(text);

	return xLine;
}

export function makeYLine(startAt, width, textEndAt, point, labelClass, axisLineClass, yPos, darker=false, lineType="") {
	let line = createSVG('line', {
		className: lineType === "dashed" ? "dashed": "",
		x1: startAt,
		x2: width,
		y1: 0,
		y2: 0
	});

	let text = createSVG('text', {
		className: labelClass,
		x: textEndAt,
		y: 0,
		dy: '.32em',
		innerHTML: point+""
	});

	let yLine = createSVG('g', {
		className: `tick ${axisLineClass}`,
		transform: `translate(0, ${yPos})`,
		'stroke-opacity': 1
	});

	if(darker) {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	yLine.appendChild(line);
	yLine.appendChild(text);

	return yLine;
}

export var UnitRenderer = (function() {
	var UnitRenderer = function(totalHeight, zeroLine, avgUnitWidth) {
		this.totalHeight = totalHeight;
		this.zeroLine = zeroLine;
		this.avgUnitWidth = avgUnitWidth;
	};

	UnitRenderer.prototype = {
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
		}
	};

	return UnitRenderer;
})();
