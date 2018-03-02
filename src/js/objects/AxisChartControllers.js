import { getBarHeightAndYAttr } from '../utils/draw-utils';
import { createSVG, makePath, makeGradient, wrapInSVGGroup, FONT_SIZE } from '../utils/draw';
import { STD_EASING, UNIT_ANIM_DUR, MARKER_LINE_ANIM_DUR, PATH_ANIM_DUR } from '../utils/animate';

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

export class LineChartController extends AxisChartController {
	constructor(meta) {
		super(meta);
	}

	setupArgs() {
		this.consts = {
			radius: this.meta.dotSize || 4
		};
	}

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

