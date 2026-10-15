import BaseChart from './BaseChart';
import { getOffset, getTextWidth } from '../utils/dom';
import { createSVG, makeSVGGroup, makeText, makeHoverBand, legendDot } from '../utils/draw';
import { calcChartIntervals } from '../utils/intervals';
import { escapeHTML, getLegendRows } from '../utils/helpers';
import { getTopOffset, getLeftOffset, getExtraHeight } from '../utils/constants';
import {
	BAR_CHART_RADIUS, BAR_CHART_GAP, TOOLTIP_SIDE_GAP, LEGEND_DOT_SIZE, LEGEND_FONT_SIZE, LEGEND_ITEM_GAP,
	HBAR_ROW_HEIGHT, HBAR_BAR_HEIGHT, HBAR_LABEL_WIDTH, HBAR_LABEL_GAP, HBAR_VALUE_GAP, HBAR_AXIS_HEIGHT,
	HBAR_FONT_SIZE, HBAR_TICK_FONT_SIZE, HBAR_LEGEND_ROW_HEIGHT
} from '../utils/constants';

export default class HorizontalBarChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		let data = options.data || {};
		let rows = (data.labels || []).length;
		let showLegend = (data.datasets || []).length > 1 && this.config.showLegend;
		this.config.showLegend = showLegend ? 1 : 0;
		m.legendHeight = showLegend ? HBAR_LEGEND_ROW_HEIGHT : 0;
		m.margins = { top: 0, bottom: 0, left: 0, right: 0 };
		m.paddings = { top: 4, bottom: HBAR_AXIS_HEIGHT, left: 0, right: 0 };
		m.baseHeight = rows * HBAR_ROW_HEIGHT + m.paddings.top + m.paddings.bottom + m.legendHeight
			+ (options.title ? m.titleHeight : 0);
	}

	configure(args) {
		super.configure(args);

		let barOptions = args.barOptions || {};
		this.type = 'horizontal-bar';
		this.config.stacked = barOptions.stacked ? 1 : 0;
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
		s.labels = this.data.labels || [];
		s.datasets = (this.data.datasets || []).map(d => ({
			name: d.name || '',
			values: s.labels.map((label, i) => Number(d.values[i]) || 0)
		}));
		s.stacked = this.config.stacked && s.datasets.length > 1;
		s.font = `${HBAR_FONT_SIZE}px ${getComputedStyle(this.container).fontFamily}`;

		this.calcLegend();
		this.height = this.baseHeight - getExtraHeight(this.measures);

		let ends = s.stacked
			? s.labels.flatMap((label, i) => this.stackTotals(i))
			: s.datasets.flatMap(d => d.values);
		s.ticks = calcChartIntervals(ends.concat(0));
		s.min = s.ticks[0];
		s.max = s.ticks[s.ticks.length - 1];
		if (s.max === s.min) s.max = s.min + 1;

		let labelWidth = v => getTextWidth(String(this.formatValue(v)), s.font) + HBAR_VALUE_GAP;
		let rowEnds = this.rowEnds();
		let rightSpace = Math.max(0, ...rowEnds.filter(e => e.value >= 0).map(e => labelWidth(e.value)));
		let leftSpace = Math.max(0, ...rowEnds.filter(e => e.value < 0).map(e => labelWidth(e.value)));

		s.rowHeight = s.labels.length ? this.height / s.labels.length : 0;
		s.plotX = this.config.labelWidth + HBAR_LABEL_GAP + leftSpace;
		s.plotWidth = Math.max(this.width - s.plotX - rightSpace, 0);
	}

	calcLegend() {
		if (!this.config.showLegend) return;
		let font = `${LEGEND_FONT_SIZE * 1.6}px ${getComputedStyle(this.container).fontFamily}`;
		let widths = this.state.datasets.map(d => LEGEND_DOT_SIZE * 2 + getTextWidth(d.name, font));
		this.legendRows = getLegendRows(widths, this.width, LEGEND_ITEM_GAP);
		this.measures.legendHeight = this.legendRows.length * HBAR_LEGEND_ROW_HEIGHT;
	}

	stackTotals(i) {
		let values = this.state.datasets.map(d => d.values[i]);
		return [
			values.filter(v => v > 0).reduce((a, b) => a + b, 0),
			values.filter(v => v < 0).reduce((a, b) => a + b, 0)
		];
	}

	rowEnds() {
		let s = this.state;
		if (s.stacked) {
			return s.labels.flatMap((label, i) => this.stackTotals(i)
				.filter((total, j) => total !== 0 || j === 0)
				.map(total => ({ row: i, value: total })));
		}
		return s.labels.flatMap((label, i) => s.datasets.map((d, j) => ({ row: i, dataset: j, value: d.values[i] })));
	}

	x(value) {
		let s = this.state;
		return s.plotX + ((value - s.min) / (s.max - s.min)) * s.plotWidth;
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
			let x = this.x(tick);
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
		let row = makeSVGGroup('horizontal-bar-row');

		let text = makeText('horizontal-bar-label', this.config.labelWidth, middle,
			this.fitLabel(String(label)), { fontSize: HBAR_FONT_SIZE, dy: HBAR_FONT_SIZE * 0.35, textAnchor: 'end' });
		text.appendChild(createSVG('title', { innerHTML: label }));
		row.appendChild(text);

		if (s.stacked) {
			this.drawStack(row, i, middle);
		} else {
			this.drawGroup(row, i, middle);
		}
		return row;
	}

	drawGroup(row, i, middle) {
		let s = this.state;
		let n = s.datasets.length;
		let total = Math.min(HBAR_BAR_HEIGHT * n, s.rowHeight * 0.8);
		let height = (total - BAR_CHART_GAP * (n - 1)) / n;
		s.datasets.forEach((d, j) => {
			let top = middle - total / 2 + j * (height + BAR_CHART_GAP);
			row.appendChild(this.makeBar(0, d.values[i], top, height, this.colors[j], true));
			row.appendChild(this.makeValue(d.values[i], top + height / 2));
		});
	}

	drawStack(row, i, middle) {
		let s = this.state;
		let height = Math.min(HBAR_BAR_HEIGHT, s.rowHeight * 0.8);
		let top = middle - height / 2;
		let sums = { pos: 0, neg: 0 };
		let lastIndex = { pos: -1, neg: -1 };
		s.datasets.forEach((d, j) => {
			if (d.values[i] > 0) lastIndex.pos = j;
			if (d.values[i] < 0) lastIndex.neg = j;
		});
		s.datasets.forEach((d, j) => {
			let value = d.values[i];
			if (!value) return;
			let side = value > 0 ? 'pos' : 'neg';
			let start = sums[side];
			sums[side] += value;
			row.appendChild(this.makeBar(start, sums[side], top, height, this.colors[j], lastIndex[side] === j));
		});
		let [pos, neg] = this.stackTotals(i);
		row.appendChild(this.makeValue(pos, middle));
		if (neg) row.appendChild(this.makeValue(neg, middle));
	}

	makeBar(from, to, top, height, color, rounded) {
		let x0 = this.x(from);
		let x1 = this.x(to);
		let radius = rounded ? this.config.radius : 0;
		return createSVG('path', {
			className: 'bar',
			style: `fill: ${color}; stroke: none`,
			d: horizontalBarPathStr(x0, x1, top, height, radius)
		});
	}

	makeValue(value, middle) {
		let negative = value < 0;
		let x = this.x(value) + (negative ? -HBAR_VALUE_GAP : HBAR_VALUE_GAP);
		return makeText('horizontal-bar-value', x, middle, this.formatValue(value),
			{ fontSize: HBAR_FONT_SIZE, dy: HBAR_FONT_SIZE * 0.35, textAnchor: negative ? 'end' : 'start' });
	}

	fitLabel(label) {
		let max = this.config.labelWidth;
		if (getTextWidth(label, this.state.font) <= max) return label;
		while (label.length > 1 && getTextWidth(label + '…', this.state.font) > max) {
			label = label.slice(0, -1);
		}
		return label + '…';
	}

	renderLegend() {
		this.legendArea.textContent = '';
		this.legendRows.forEach((row, r) => {
			row.forEach(({ index, x }) => {
				this.legendArea.appendChild(legendDot(
					x,
					r * HBAR_LEGEND_ROW_HEIGHT + HBAR_LEGEND_ROW_HEIGHT / 2,
					LEGEND_DOT_SIZE,
					LEGEND_DOT_SIZE / 2,
					this.colors[index],
					this.state.datasets[index].name,
					null,
					LEGEND_FONT_SIZE,
					this.config.truncateLegends
				));
			});
		});
	}

	makeTooltip() {
		super.makeTooltip();
		this.tip.placement = 'side';
		this.tip.sideOffset = TOOLTIP_SIDE_GAP;
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', (e) => {
			let s = this.state;
			let offset = getOffset(this.container);
			let relY = e.pageY - offset.top - getTopOffset(this.measures);
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

		let end = Math.max(...this.rowEnds().filter(e => e.row === i).map(e => this.x(Math.max(e.value, 0))));
		this.tip.setValues(
			getLeftOffset(m) + end,
			getTopOffset(m) + i * s.rowHeight + s.rowHeight / 2,
			{ name: escapeHTML(s.labels[i]), value: '' },
			s.datasets.map((d, j) => ({
				title: escapeHTML(d.name),
				formatted: escapeHTML(this.formatTooltipValue(d.values[i])),
				color: this.colors[j]
			}))
		);
		this.tip.showTip();
	}

	hideTooltip() {
		this.tip.hideTip();
		if (this.hoverBand) this.hoverBand.style.display = 'none';
	}
}

function horizontalBarPathStr(x0, x1, y, height, radius) {
	let left = Math.min(x0, x1);
	let right = Math.max(x0, x1);
	let r = Math.max(0, Math.min(radius, height / 2, right - left));
	let bottom = y + height;
	if (x1 >= x0) {
		return `M${left},${y} H${right - r} Q${right},${y} ${right},${y + r} `
			+ `V${bottom - r} Q${right},${bottom} ${right - r},${bottom} H${left} Z`;
	}
	return `M${right},${y} H${left + r} Q${left},${y} ${left},${y + r} `
		+ `V${bottom - r} Q${left},${bottom} ${left + r},${bottom} H${right} Z`;
}
