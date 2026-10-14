import AggregationChart from './AggregationChart';
import { getComponent } from '../objects/ChartComponents';
import { getOffset, getTextWidth } from '../utils/dom';
import { createSVG, legendDot, makeText, makeDonutSectorStr, makeDonutRingStr } from '../utils/draw';
import { getLegendRows, wholePercentages } from '../utils/helpers';
import {
	ANGLE_RATIO, getExtraHeight, getLeftOffset, getTopOffset, LEGEND_DOT_SIZE, LEGEND_FONT_SIZE, LEGEND_ITEM_GAP,
	TOOLTIP_SIDE_GAP, DONUT_GAP_ANGLE, DONUT_LIFT_RATIO, DONUT_THICKNESS_RATIO, DONUT_CORNER_RATIO,
	DONUT_VALUE_FONT_SIZE, DONUT_LABEL_FONT_SIZE
} from '../utils/constants';

export default class DonutChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.init = 1;
		this.activeIndex = -1;

		this.setup();
	}

	setMeasures() {
		this.measures.paddings = { top: 10, bottom: 16, left: 0, right: 0 };
	}

	configure(args) {
		super.configure(args);

		this.type = 'donut';
		this.sliceName = 'donutSlices';

		this.config.startAngle = args.startAngle || 0;
		this.config.clockWise = args.clockWise !== undefined ? args.clockWise : 1;
		this.config.strokeWidth = args.strokeWidth;
		this.config.center = args.center || {};
		this.config.legendRowHeight = 32;
	}

	calc() {
		super.calc();
		let s = this.state;

		s.percentages = s.grandTotal
			? wholePercentages(s.sliceTotals.map(total => total / s.grandTotal))
			: s.sliceTotals.map(() => 0);

		this.calcLegend();
		this.height = this.baseHeight - getExtraHeight(this.measures);
		this.center = { x: this.width / 2, y: this.height / 2 };
		this.calcRadii();
		this.calcSlices();
		this.init = 0;
	}

	calcLegend() {
		if (!this.config.showLegend) return;
		let font = `${LEGEND_FONT_SIZE * 1.6}px ${getComputedStyle(this.container).fontFamily}`;
		let widths = this.state.sliceTotals
			.slice(0, this.config.maxLegendPoints)
			.map((total, i) => LEGEND_DOT_SIZE + LEGEND_FONT_SIZE + 6 + getTextWidth(this.legendText(i), font));

		this.legendRows = getLegendRows(widths, this.width, LEGEND_ITEM_GAP);
		this.measures.legendHeight = this.legendRows.length * this.config.legendRowHeight;
	}

	calcRadii() {
		let outer = Math.min(this.width, this.height) / 2;
		let lift = outer * DONUT_LIFT_RATIO;
		let ro = outer - lift;
		let thickness = this.config.strokeWidth || ro * DONUT_THICKNESS_RATIO;
		let ri = Math.max(ro - thickness, ro * 0.1);
		this.radii = { ro, ri, lift, corner: (ro - ri) * DONUT_CORNER_RATIO };
	}

	calcSlices() {
		let s = this.state;
		let gap = s.sliceTotals.filter(total => total > 0).length > 1 ? DONUT_GAP_ANGLE : 0;
		let direction = this.config.clockWise ? 1 : -1;
		let angle = (this.config.startAngle - 90) * ANGLE_RATIO;

		s.sliceAngles = s.sliceTotals.map(total => {
			let sweep = s.grandTotal ? (total / s.grandTotal) * 2 * Math.PI : 0;
			let g = Math.min(gap, sweep / 2);
			let start = direction > 0 ? angle : angle - sweep;
			angle += direction * sweep;
			return [start + g / 2, start + sweep - g / 2];
		});

		s.sliceStrings = s.sliceAngles.map((angles, i) => {
			if (!this.init) return this.slicePath(i, this.radii.ro);
			let from = direction > 0 ? angles[0] : angles[1];
			return makeDonutSectorStr(this.center, this.radii.ri, this.radii.ro, from, from, 0);
		});
	}

	slicePath(i, outer) {
		let s = this.state;
		let { ri, corner } = this.radii;
		if (s.grandTotal && s.sliceTotals[i] === s.grandTotal) {
			return makeDonutRingStr(this.center, ri, outer);
		}
		let [start, end] = s.sliceAngles[i];
		return makeDonutSectorStr(this.center, ri, outer, start, end, corner);
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				this.sliceName,
				{},
				function () {
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

	makeChartArea() {
		this.activeIndex = -1;
		super.makeChartArea();
		this.svg.setAttribute('role', 'img');

		this.centerValue = makeText('donut-center-value', 0, 0, '', {
			fontSize: DONUT_VALUE_FONT_SIZE,
			dy: DONUT_VALUE_FONT_SIZE * 0.35,
			textAnchor: 'middle'
		});
		this.centerLabel = makeText('donut-center-label', 0, DONUT_VALUE_FONT_SIZE, '', {
			fontSize: DONUT_LABEL_FONT_SIZE,
			textAnchor: 'middle'
		});
		this.drawArea.appendChild(this.centerValue);
		this.drawArea.appendChild(this.centerLabel);
		this.placeCenter();
	}

	update(data, drawing = false) {
		super.update(data, drawing);
		this.placeCenter();
		if (this.config.showLegend) {
			let m = this.measures;
			this.legendArea.setAttribute('transform',
				`translate(${getLeftOffset(m)}, ${getTopOffset(m) + this.height + m.paddings.bottom})`);
			this.renderLegend();
		}
	}

	placeCenter() {
		let { x, y } = this.center;
		[this.centerValue, this.centerLabel].forEach(text => {
			text.setAttribute('transform', `translate(${x}, ${y})`);
		});
	}

	render(components, animate) {
		this.clearHover();
		this.setCenter(this.config.center.value, this.config.center.label);
		this.svg.setAttribute('aria-label', this.state.labels
			.map((label, i) => `${label}: ${this.formatValue(this.state.sliceTotals[i])} (${this.state.percentages[i]}%)`)
			.join(', '));
		super.render(components, animate);
	}

	setCenter(value, label) {
		this.centerValue.textContent = value == null ? '' : value;
		this.centerLabel.textContent = label == null ? '' : label;
	}

	formatValue(value) {
		return this.config.formatTooltipY ? this.config.formatTooltipY(value) : value;
	}

	legendText(i) {
		let s = this.state;
		return `${s.labels[i]} ${this.formatValue(s.sliceTotals[i])} · ${s.percentages[i]}%`;
	}

	renderLegend() {
		let totals = this.state.sliceTotals;
		this.legendArea.textContent = '';
		this.legendRows.forEach((row, r) => {
			row.forEach(({ index, x }) => {
				this.legendArea.appendChild(this.makeLegend(totals[index], index, x, r * this.config.legendRowHeight));
			});
		});
	}

	makeLegend(data, index, x_pos, y_pos) {
		let item = legendDot(
			x_pos,
			y_pos + 5,
			LEGEND_DOT_SIZE,
			LEGEND_DOT_SIZE / 2,
			this.colors[index],
			this.state.labels[index],
			null,
			LEGEND_FONT_SIZE,
			this.config.truncateLegends
		);
		item.querySelector('text').appendChild(createSVG('tspan', {
			className: 'donut-legend-value',
			dx: '6px',
			innerHTML: `${this.formatValue(data)} · ${this.state.percentages[index]}%`
		}));
		item.setAttribute('class', 'donut-legend-item');
		item.setAttribute('tabindex', 0);

		['mouseenter', 'focus'].forEach(event => item.addEventListener(event, () => {
			this.highlight(index);
			this.tip.hideTip();
		}));
		['mouseleave', 'blur'].forEach(event => item.addEventListener(event, () => this.clearHover()));
		return item;
	}

	makeTooltip() {
		super.makeTooltip();
		this.tip.placement = 'side';
		this.tip.sideOffset = TOOLTIP_SIDE_GAP;
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', (e) => {
			if (this.legendArea && this.legendArea.contains(e.target)) return;
			let i = this.components.get(this.sliceName).store.indexOf(e.target);
			if (i === -1) {
				this.clearHover();
				return;
			}
			this.highlight(i);
			this.showSliceTip(i, e);
		});
		this.container.addEventListener('mouseleave', () => this.clearHover());
	}

	highlight(i) {
		if (this.activeIndex === i) return;
		this.clearHover();
		this.activeIndex = i;

		let s = this.state;
		let slices = this.components.get(this.sliceName).store;
		slices.forEach((slice, j) => slice.classList.toggle('is-dim', j !== i));
		slices[i].setAttribute('d', this.slicePath(i, this.radii.ro + this.radii.lift));
		this.setCenter(this.formatValue(s.sliceTotals[i]), `${s.labels[i]} · ${s.percentages[i]}%`);
	}

	clearHover() {
		this.tip.hideTip();
		if (this.activeIndex === -1) return;

		let slices = this.components.get(this.sliceName).store;
		slices[this.activeIndex].setAttribute('d', this.slicePath(this.activeIndex, this.radii.ro));
		slices.forEach(slice => slice.classList.remove('is-dim'));
		this.activeIndex = -1;
		this.setCenter(this.config.center.value, this.config.center.label);
	}

	showSliceTip(i, e) {
		let s = this.state;
		let offset = getOffset(this.container);
		this.tip.setValues(
			e.pageX - offset.left,
			e.pageY - offset.top,
			{ name: '', value: '' },
			[{
				title: s.labels[i],
				formatted: `${this.formatValue(s.sliceTotals[i])} · ${s.percentages[i]}%`,
				color: this.colors[i]
			}]
		);
		this.tip.showTip();
	}
}
