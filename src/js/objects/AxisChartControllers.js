import { getBarHeightAndYAttr } from '../utils/draw-utils';
import { createSVG, makePath, makeGradient, wrapInSVGGroup, FONT_SIZE } from '../utils/draw';
import { STD_EASING, UNIT_ANIM_DUR, MARKER_LINE_ANIM_DUR, PATH_ANIM_DUR } from '../utils/animate';

const MIN_BAR_PERCENT_HEIGHT = 0.01;

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

export class AxisController extends AxisChartController {
	constructor(meta) {
		super(meta);
	}

	draw(x, y, color, index) {
		return createSVG('circle', {
			style: `fill: ${color}`,
			'data-point-index': index,
			cx: x,
			cy: y,
			r: this.consts.radius
		});
	}

	animate(dot, x, yTop) {
		return [dot, {cx: x, cy: yTop}, UNIT_ANIM_DUR, STD_EASING];
		// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
	}
}

export class BarChartController extends AxisChartController {
	constructor(meta) {
		super(meta);
	}

	setupArgs() {
		this.consts = {
			spaceRatio: 0.5,
			minHeight: this.meta.totalHeight * MIN_BAR_PERCENT_HEIGHT
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

export class LineChartController extends AxisChartController {
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

export function getPaths(yList, xList, color, heatline=false, regionFill=false) {
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

