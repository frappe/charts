import AxisChart from './AxisChart';
import { ChartComponent } from '../objects/ChartComponent';
import { makeSVGGroup, makePath, makeGradient } from '../utils/draw';

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

	getDataUnitsComponents(config) {
		if(!config.showDots) {
			return [];
		} else {
			return super.getDataUnitsComponents();
		}
	}

	getPathComponents() {
		return this.state.datasets.map((d, index) => {
			return new ChartComponent({
				layerClass: 'path dataset-path',
				make: () => {
					let d = this.state.datasets[index];
					let color = this.colors[index];

					let pointsList = d.positions.map((y, i) => (this.state.xAxisPositions[i] + ',' + y));
					let pointsStr = pointsList.join("L");
					let path = makePath("M"+pointsStr, 'line-graph-path', color);

					// HeatLine
					if(this.config.heatline) {
						let gradient_id = makeGradient(this.svg_defs, color);
						path.style.stroke = `url(#${gradient_id})`;
					}

					let components = [path];

					// Region
					if(this.config.regionFill) {
						let gradient_id_region = makeGradient(this.svg_defs, color, true);

						let zeroLine = this.state.yAxis.zeroLine;
						let pathStr = "M" + `0,${zeroLine}L` + pointsStr + `L${this.width},${zeroLine}`;
						components.push(makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id_region})`));
					}

					return components;
				},
				animate: () => {}
			});
		});
	}
}
