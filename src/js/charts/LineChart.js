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

	getDataUnitsComponents(config) {
		if(!config.showDots) {
			return [];
		}
		else {
			return super.getDataUnitsComponents();
		}
	}

	getPathComponents() {
		return this.data.datasets.map((d, index) => {
			return new ChartComponent({
				layerClass: 'path dataset-path',
				make: () => {
					let d = this.state.datasets[index];
					let color = this.colors[index];

					return this.getPaths(
						d.positions,
						this.state.xAxisPositions,
						color,
						this.config.heatline,
						this.config.regionFill
					);
				},
				animate: (paths) => {
					let newX = this.state.xAxisPositions;
					let newY = this.state.datasets[index].positions;

					let oldX = this.oldState.xAxisPositions;
					let oldY = this.oldState.datasets[index].positions;


					let parentNode = paths[0].parentNode;

					[oldX, newX] = equilizeNoOfElements(oldX, newX);
					[oldY, newY] = equilizeNoOfElements(oldY, newY);

					if(this.oldState.xExtra > 0) {
						paths = this.getPaths(
							oldY, oldX, this.colors[index],
							this.config.heatline,
							this.config.regionFill
						);
						parentNode.textContent = '';
						paths.map(path => parentNode.appendChild(path));
					}

					const newPointsList = newY.map((y, i) => (newX[i] + ',' + y));
					this.elementsToAnimate = this.elementsToAnimate
						.concat(this.renderer.animatepath(paths, newPointsList.join("L")));
				}
			});
		});
	}

	getPaths(yList, xList, color, heatline=false, regionFill=false) {
		let pointsList = yList.map((y, i) => (xList[i] + ',' + y));
		let pointsStr = pointsList.join("L");
		let path = makePath("M"+pointsStr, 'line-graph-path', color);

		// HeatLine
		if(heatline) {
			let gradient_id = makeGradient(this.svgDefs, color);
			path.style.stroke = `url(#${gradient_id})`;
		}

		let components = [path];

		// Region
		if(regionFill) {
			let gradient_id_region = makeGradient(this.svgDefs, color, true);

			let zeroLine = this.state.yAxis.zeroLine;
			// TODO: use zeroLine OR minimum
			let pathStr = "M" + `0,${zeroLine}L` + pointsStr + `L${this.width},${zeroLine}`;
			components.push(makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id_region})`));
		}

		return components;
	}
}
