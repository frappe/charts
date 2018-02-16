import AxisChart from './AxisChart';
import { ChartComponent } from '../objects/ChartComponent';
import { makeSVGGroup, makePath, makeGradient } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';

export default class LineChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'line';

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'span';
		this.config.yAxisMode = args.yAxisMode || 'span';

		this.config.dotRadius = args.dotRadius || 4;

		this.config.heatline = args.heatline || 0;
		this.config.regionFill = args.regionFill || 0;
		this.config.showDots = args.showDots || 1;
	}

	configUnits() {
		this.unitArgs = {
			type: 'dot',
			args: { radius: this.config.dotRadius }
		};
	}

	// temp commented
	setUnitWidthAndXOffset() {
		this.state.unitWidth = this.width/(this.state.datasetLength - 1);
		this.state.xOffset = 0;
	}

}
