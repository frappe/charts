import BaseChart from './BaseChart';
import { legendDot, FONT_SIZE, LABEL_MAX_CHARS } from '../utils/draw';
import { getTextWidth } from '../utils/dom';
import { truncateString } from '../utils/draw-utils';
import { round } from '../utils/helpers';

export default class AggregationChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
	}

	configure(args) {
		super.configure(args);

		this.config.formatTooltipY = (args.tooltipOptions || {}).formatTooltipY;
		this.config.maxSlices = args.maxSlices || 20;
		this.config.maxLegendPoints = args.maxLegendPoints || 20;
		this.config.legendRowHeight = 60;
	}

	calc() {
		let s = this.state;
		let maxSlices = this.config.maxSlices;
		s.sliceTotals = [];

		let allTotals = this.data.labels.map((label, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, label];
		}).filter(d => { return d[0] >= 0; }); // keep only positive results

		let totals = allTotals;
		if (allTotals.length > maxSlices) {
			// Prune and keep a grey area for rest as per maxSlices
			allTotals.sort((a, b) => { return b[0] - a[0]; });

			totals = allTotals.slice(0, maxSlices - 1);
			let remaining = allTotals.slice(maxSlices - 1);

			let sumOfRemaining = 0;
			remaining.map(d => { sumOfRemaining += d[0]; });
			totals.push([sumOfRemaining, 'Rest']);
			this.colors[maxSlices - 1] = 'grey';
		}

		s.labels = [];
		totals.map(d => {
			s.sliceTotals.push(round(d[0]));
			s.labels.push(d[1]);
		});

		s.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);

		this.center = {
			x: this.width / 2,
			y: this.height / 2
		};
	}

	calcLegend() {
		let s = this.state;
		let family = getComputedStyle(this.container).fontFamily;
		this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);
		this.calcLegendRows(this.legendTotals.map((total, i) => {
			let label = this.config.truncateLegends ? truncateString(s.labels[i], LABEL_MAX_CHARS) : s.labels[i];
			let value = this.config.formatTooltipY ? this.config.formatTooltipY(total) : total;
			return 12 + FONT_SIZE + Math.max(
				getTextWidth(label, `${FONT_SIZE * 1.6}px ${family}`),
				getTextWidth(String(value), `${FONT_SIZE * 1.2}px ${family}`)
			);
		}));
	}

	renderLegend() {
		super.renderLegend(this.legendTotals);
	}

	makeLegend(data, index, x_pos, y_pos) {
		let formatted = this.config.formatTooltipY ? this.config.formatTooltipY(data) : data;

		return legendDot(
			x_pos,
			y_pos,
			12, // size
			3, // dot radius
			this.colors[index], // fill
			this.state.labels[index], // label
			formatted, // value
			null, // base_font_size
			this.config.truncateLegends // truncate_legends
		);
	}
}
