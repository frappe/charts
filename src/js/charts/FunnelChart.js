import AggregationChart from './AggregationChart';
import { getOffset } from '../utils/dom';
import { getComponent } from '../objects/ChartComponents';
import { getEndpointsForTrapezoid } from '../utils/draw-utils';

export default class FunnelChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'funnel';
		this.setup();
	}

	calc() {
		super.calc();
		let s = this.state;
		
		// calculate width and height options
		const totalheight = this.height * 0.9;
		const baseWidth = (2 * totalheight) / Math.sqrt(3);
		

		const reducer = (accumulator, currentValue) => accumulator + currentValue;
		const weightage = s.sliceTotals.reduce(reducer, 0.0);

		const center_x_offset = this.center.x - baseWidth / 2;
		const center_y_offset = this.center.y - totalheight / 2;

		let slicePoints = [];
		let startPoint = [[center_x_offset, center_y_offset], [center_x_offset + baseWidth, center_y_offset]];
		s.sliceTotals.forEach(d => {
			let height = totalheight * d / weightage;
			let endPoint = getEndpointsForTrapezoid(startPoint, height);
			slicePoints.push([startPoint, endPoint]);
			startPoint = endPoint;
		});
		s.slicePoints = slicePoints;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'funnelSlices',
				{ },
				function() {
					return {
						slicePoints: s.slicePoints,
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

	bindTooltip() {
		function getPolygonWidth(slice)  {
			const points = slice.points;
			return points[1].x - points[0].x;
		}

		this.container.addEventListener('mousemove', (e) => {
			let slices = this.components.get('funnelSlices').store;
			let slice = e.target;
			if(slices.includes(slice)) {
				let i = slices.indexOf(slice);

				let gOff = getOffset(this.container), pOff = getOffset(slice);
				let x = pOff.left - gOff.left + getPolygonWidth(slice)/2;
				let y = pOff.top - gOff.top;
				let title = (this.formatted_labels && this.formatted_labels.length > 0
					? this.formatted_labels[i] : this.state.labels[i]) + ': ';
				let percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
				this.tip.setValues(x, y, {name: title, value: percent + "%"});
				this.tip.showTip();
			}
		});
	}
}
