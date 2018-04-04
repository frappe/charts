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
		this.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);
		s.slices = [];
		s.sliceTotals.map((total, i) => {
			let slice = $.create('div', {
				className: `progress-bar`,
				'data-index': i,
				inside: this.percentageBar,
				styles: {
					background: this.colors[i],
					width: total*100/this.grandTotal + "%"
				}
			});
			s.slices.push(slice);
		});
	}

	bindTooltip() {
		let s = this.state;

		this.chartWrapper.addEventListener('mousemove', (e) => {
			let slice = e.target;
			if(slice.classList.contains('progress-bar')) {

				let i = slice.getAttribute('data-index');
				let gOff = getOffset(this.chartWrapper), pOff = getOffset(slice);

				let x = pOff.left - gOff.left + slice.offsetWidth/2;
				let y = pOff.top - gOff.top - 6;
				let title = (this.formattedLabels && this.formattedLabels.length>0
					? this.formattedLabels[i] : this.state.labels[i]) + ': ';
				let percent = (s.sliceTotals[i]*100/this.grandTotal).toFixed(1);

				this.tip.setValues(x, y, {name: title, value: percent + "%"});
				this.tip.showTip();
			}
		});
	}
}
