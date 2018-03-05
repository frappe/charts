import AggregationChart from './AggregationChart';
import { $, getOffset } from '../utils/dom';

export default class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';

		this.setup();
	}

	makeChartArea() {
		this.chartWrapper.className += ' ' + 'graph-focus-margin';
		this.chartWrapper.style.marginTop = '45px';

		this.statsWrapper.className += ' ' + 'graph-focus-margin';
		this.statsWrapper.style.marginBottom = '30px';
		this.statsWrapper.style.paddingTop = '0px';

		this.svg = $.create('div', {
			className: 'div',
			inside: this.chartWrapper
		});

		this.chart = $.create('div', {
			className: 'progress-chart',
			inside: this.svg
		});

		this.percentageBar = $.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	render() {
		let s = this.state;
		this.grand_total = s.sliceTotals.reduce((a, b) => a + b, 0);
		this.slices = [];
		s.sliceTotals.map((total, i) => {
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
		let s = this.state;
		// this.slices.map((slice, i) => {
		// 	slice.addEventListener('mouseenter', () => {
		// 		let g_off = getOffset(this.chartWrapper), p_off = getOffset(slice);

		// 		let x = p_off.left - g_off.left + slice.offsetWidth/2;
		// 		let y = p_off.top - g_off.top - 6;
		// 		let title = (this.formatted_labels && this.formatted_labels.length>0
		// 			? this.formatted_labels[i] : this.labels[i]) + ': ';
		// 		let percent = (s.sliceTotals[i]*100/this.grand_total).toFixed(1);

		// 		this.tip.set_values(x, y, title, percent + "%");
		// 		this.tip.show_tip();
		// 	});
		// });
	}
}
