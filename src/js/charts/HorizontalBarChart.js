import BaseChart from './BaseChart';
import { getOffset, getTextWidth } from '../utils/dom';
import { createSVG, makeSVGGroup, makeText, makeHoverBand } from '../utils/draw';
import { calcChartIntervals } from '../utils/intervals';
import { getTopOffset, getLeftOffset } from '../utils/constants';
import {
	BAR_CHART_RADIUS, TOOLTIP_SIDE_GAP, HBAR_ROW_HEIGHT, HBAR_BAR_HEIGHT, HBAR_LABEL_WIDTH,
	HBAR_LABEL_GAP, HBAR_VALUE_GAP, HBAR_AXIS_HEIGHT, HBAR_FONT_SIZE, HBAR_TICK_FONT_SIZE
} from '../utils/constants';

export default class HorizontalBarChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		let rows = ((options.data || {}).labels || []).length;
		this.config.showLegend = 0;
		m.legendHeight = 0;
		m.margins = { top: 0, bottom: 0, left: 0, right: 0 };
		m.paddings = { top: 4, bottom: HBAR_AXIS_HEIGHT, left: 0, right: 0 };
		m.baseHeight = rows * HBAR_ROW_HEIGHT + m.paddings.top + m.paddings.bottom
			+ (options.title ? m.titleHeight : 0);
	}

	configure(args) {
		super.configure(args);

		let barOptions = args.barOptions || {};
		this.type = 'horizontal-bar';
		this.config.labelWidth = barOptions.labelWidth || HBAR_LABEL_WIDTH;
		this.config.radius = barOptions.radius !== undefined ? barOptions.radius : BAR_CHART_RADIUS;
		this.config.numberFormatter = (args.axisOptions || {}).numberFormatter;
		this.config.formatTooltipY = (args.tooltipOptions || {}).formatTooltipY;
	}

	formatValue(value) {
		return this.config.numberFormatter ? this.config.numberFormatter(value) : value;
	}

	formatTooltipValue(value) {
		return this.config.formatTooltipY ? this.config.formatTooltipY(value) : this.formatValue(value);
	}

	calc() {
		let s = this.state;
		let dataset = this.data.datasets[0] || { values: [] };
		s.labels = this.data.labels || [];
		s.name = dataset.name || '';
		s.values = s.labels.map((label, i) => Math.max(Number(dataset.values[i]) || 0, 0));
		s.ticks = calcChartIntervals(s.values.concat(0)).filter(tick => tick >= 0);

		let font = `${HBAR_FONT_SIZE}px ${getComputedStyle(this.container).fontFamily}`;
		let valueSpace = Math.max(0, ...s.values.map(v => getTextWidth(String(this.formatValue(v)), font)));

		s.font = font;
		s.max = s.ticks[s.ticks.length - 1] || 1;
		s.rowHeight = s.labels.length ? this.height / s.labels.length : 0;
		s.plotX = this.config.labelWidth + HBAR_LABEL_GAP;
		s.plotWidth = Math.max(this.width - s.plotX - valueSpace - HBAR_VALUE_GAP, 0);
		s.barWidths = s.values.map(v => (v / s.max) * s.plotWidth);
	}

	setupComponents() {
		this.components = new Map();
	}

	render() {
		let s = this.state;
		if (this.layer) this.layer.remove();
		this.layer = makeSVGGroup('horizontal-bars', '', this.drawArea);
		this.hoverBand = makeHoverBand(s.rowHeight);
		this.hoverBand.style.display = 'none';
		this.layer.appendChild(this.hoverBand);

		s.ticks.forEach(tick => {
			let x = s.plotX + (tick / s.max) * s.plotWidth;
			this.layer.appendChild(createSVG('line', {
				className: 'horizontal-bar-grid', x1: x, x2: x, y1: 0, y2: this.height
			}));
			this.layer.appendChild(makeText('horizontal-bar-tick', x, this.height + HBAR_AXIS_HEIGHT / 2,
				this.formatValue(tick), { fontSize: HBAR_TICK_FONT_SIZE, textAnchor: 'middle' }));
		});

		s.labels.forEach((label, i) => this.layer.appendChild(this.makeRow(label, i)));
	}

	makeRow(label, i) {
		let s = this.state;
		let middle = i * s.rowHeight + s.rowHeight / 2;
		let barHeight = Math.min(HBAR_BAR_HEIGHT, s.rowHeight * 0.8);
		let row = makeSVGGroup('horizontal-bar-row');

		let text = makeText('horizontal-bar-label', s.plotX - HBAR_LABEL_GAP, middle,
			this.fitLabel(String(label)), { fontSize: HBAR_FONT_SIZE, dy: HBAR_FONT_SIZE * 0.35, textAnchor: 'end' });
		text.appendChild(createSVG('title', { innerHTML: label }));
		row.appendChild(text);

		row.appendChild(createSVG('path', {
			className: 'bar',
			style: `fill: ${this.colors[0]}; stroke: none`,
			d: horizontalBarPathStr(s.plotX, middle - barHeight / 2, s.barWidths[i], barHeight, this.config.radius)
		}));

		row.appendChild(makeText('horizontal-bar-value', s.plotX + s.barWidths[i] + HBAR_VALUE_GAP, middle,
			this.formatValue(s.values[i]), { fontSize: HBAR_FONT_SIZE, dy: HBAR_FONT_SIZE * 0.35 }));
		return row;
	}

	fitLabel(label) {
		let max = this.config.labelWidth;
		if (getTextWidth(label, this.state.font) <= max) return label;
		while (label.length > 1 && getTextWidth(label + '…', this.state.font) > max) {
			label = label.slice(0, -1);
		}
		return label + '…';
	}

	makeTooltip() {
		super.makeTooltip();
		this.tip.placement = 'side';
		this.tip.sideOffset = TOOLTIP_SIDE_GAP;
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', (e) => {
			let s = this.state;
			let m = this.measures;
			let offset = getOffset(this.container);
			let relY = e.pageY - offset.top - getTopOffset(m);
			let i = s.rowHeight ? Math.floor(relY / s.rowHeight) : -1;
			if (i < 0 || i >= s.labels.length) {
				this.hideTooltip();
				return;
			}
			this.showRowTip(i);
		});
		this.container.addEventListener('mouseleave', () => this.hideTooltip());
	}

	showRowTip(i) {
		let s = this.state;
		let m = this.measures;
		this.hoverBand.setAttribute('y', i * s.rowHeight);
		this.hoverBand.setAttribute('width', this.width);
		this.hoverBand.style.display = '';

		this.tip.setValues(
			getLeftOffset(m) + s.plotX + s.barWidths[i],
			getTopOffset(m) + i * s.rowHeight + s.rowHeight / 2,
			{ name: s.labels[i], value: '' },
			[{ title: s.name, formatted: this.formatTooltipValue(s.values[i]), color: this.colors[0] }]
		);
		this.tip.showTip();
	}

	hideTooltip() {
		this.tip.hideTip();
		if (this.hoverBand) this.hoverBand.style.display = 'none';
	}
}

function horizontalBarPathStr(x, y, width, height, radius) {
	let r = Math.max(0, Math.min(radius, height / 2, width));
	let [right, bottom] = [x + width, y + height];
	return `M${x},${y} H${right - r} Q${right},${y} ${right},${y + r} `
		+ `V${bottom - r} Q${right},${bottom} ${right - r},${bottom} H${x} Z`;
}
