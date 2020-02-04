import AggregationChart from './AggregationChart';
import { getOffset } from '../utils/dom';
import { getComponent } from '../objects/ChartComponents';
import { PERCENTAGE_BAR_DEFAULT_HEIGHT, PERCENTAGE_BAR_DEFAULT_DEPTH } from '../utils/constants';

export default class PercentageChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'percentage';
		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		this.barOptions = options.barOptions || {};

		let b = this.barOptions;
		b.height = b.height || PERCENTAGE_BAR_DEFAULT_HEIGHT;
		b.depth = b.depth || PERCENTAGE_BAR_DEFAULT_DEPTH;

		m.paddings.right = 30;
		m.legendHeight = 60;
		m.baseHeight = (b.height + b.depth * 0.5) * 8;
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
		s.sliceTotals.map((value) => {
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
