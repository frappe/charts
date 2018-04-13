import AggregationChart from './AggregationChart';
import { $, getOffset } from '../utils/dom';
import { getComponent } from '../objects/ChartComponents';
import { PERCENTAGE_BAR_DEFAULT_HEIGHT, PERCENTAGE_BAR_DEFAULT_DEPTH } from '../utils/constants';

export default class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';

		this.barOptions = args.barOptions || {};
		this.barOptions.height = this.barOptions.height
			|| PERCENTAGE_BAR_DEFAULT_HEIGHT;
		this.barOptions.depth = this.barOptions.depth
			|| PERCENTAGE_BAR_DEFAULT_DEPTH;

		this.setup();
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'percentageBars',
				{
					barHeight: this.barOptions.height,
					barDepth: this.barOptions.depth,
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

	makeDataByIndex() { }

	bindTooltip() {
		let s = this.state;
		this.container.addEventListener('mousemove', (e) => {
			let bars = this.components.get('percentageBars').store;
			let bar = e.target;
			if(bars.includes(bar)) {

				let i = bars.indexOf(bar);
				let gOff = getOffset(this.container), pOff = getOffset(bar);

				let x = pOff.left - gOff.left + parseInt(bar.getAttribute('width'))/2;
				let y = pOff.top - gOff.top;
				let title = (this.formattedLabels && this.formattedLabels.length>0
					? this.formattedLabels[i] : this.state.labels[i]) + ': ';
				let fraction = s.sliceTotals[i]/s.grandTotal;

				this.tip.setValues(x, y, {name: title, value: (fraction*100).toFixed(1) + "%"});
				this.tip.showTip();
			}
		});
	}
}
