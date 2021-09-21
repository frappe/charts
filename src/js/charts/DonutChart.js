import PieChart from './PieChart';
import { getComponent } from '../objects/ChartComponents';
import { makeArcStrokePathStr, makeStrokeCircleStr } from '../utils/draw';
import { transform } from '../utils/animation';

export default class DonutChart extends PieChart {
	constructor(parent, args) {
		super(parent, args);
	}

	configure(args) {
		super.configure(args);

		this.type = 'donut';
		this.sliceName = 'donutSlices';

		this.arcFunc = makeArcStrokePathStr;
		this.shapeFunc = makeStrokeCircleStr;

		this.strokeWidth = args.strokeWidth || 30;
	}

	getRadius() {
		return this.height > this.width
			? this.center.x - this.strokeWidth / 2
			: this.center.y - this.strokeWidth / 2;
	}

	resetHover(path, color) {
		transform(path,'translate3d(0,0,0)');
		this.tip.hideTip();
		path.style.stroke = color;
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
						colors: this.colors,
						strokeWidth: this.strokeWidth,
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
}
