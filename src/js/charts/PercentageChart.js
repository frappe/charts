import AggregationChart from './AggregationChart';
import { $, getOffset } from '../utils/dom';
import { getComponent } from '../objects/ChartComponents';
import { PERCENTAGE_BAR_DEFAULT_HEIGHT } from '../utils/constants';

export default class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';

		this.barOptions = args.barOptions || {};
		this.barOptions.height = this.barOptions.height
			|| PERCENTAGE_BAR_DEFAULT_HEIGHT;

		this.setup();
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'percentageBars',
				{
					barHeight: this.barOptions.height
				},
				function() {
					return {
						xPositions: s.xPositions,
						widths: s.widths,
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

	calc() {
		super.calc();
		let s = this.state;

		s.xPositions = [];
		s.widths = [];

		let xPos = 0;
		s.sliceTotals.map((value, i) => {
			let width = this.width * value / s.grandTotal;
			s.widths.push(width);
			s.xPositions.push(xPos);
			xPos += width;
		});
	}

	bindTooltip() {
		let s = this.state;

		this.container.addEventListener('mousemove', (e) => {
			let slice = e.target;
			if(slice.classList.contains('progress-bar')) {

				let i = slice.getAttribute('data-index');
				let gOff = getOffset(this.container), pOff = getOffset(slice);

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
