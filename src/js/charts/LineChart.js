import AxisChart from './AxisChart';
import { makeSVGGroup, makePath, makeGradient } from '../utils/draw';

export default class LineChart extends AxisChart {
	constructor(args) {
		super(args);

		this.xAxisMode = args.xAxisMode || 'span';
		this.yAxisMode = args.yAxisMode || 'span';

		if(args.hasOwnProperty('show_dots')) {
			this.show_dots = args.show_dots;
		} else {
			this.show_dots = 1;
		}
		this.region_fill = args.region_fill;

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}
		this.dot_radius = args.dot_radius || 4;
		this.heatline = args.heatline;
		this.type = 'line';

		this.setup();
	}

	setupPreUnitLayers() {
		// Path groups
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = makeSVGGroup(
				this.drawArea,
				'path-group path-group-' + i
			);
		});
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	makeDatasetUnits(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {
		if(this.show_dots) {
			super.makeDatasetUnits(x_values, y_values, color, dataset_index,
				no_of_datasets, units_group, units_array, unit);
		}
	}

	make_paths() {
		this.y.map(d => {
			this.make_path(d, this.xPositions, d.yUnitPositions, d.color || this.colors[d.index]);
		});
	}

	make_path(d, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[d.index].textContent = '';

		d.path = makePath("M"+points_str, 'line-graph-path', color);
		this.paths_groups[d.index].appendChild(d.path);

		if(this.heatline) {
			let gradient_id = makeGradient(this.svg_defs, color);
			d.path.style.stroke = `url(#${gradient_id})`;
		}

		if(this.region_fill) {
			this.fill_region_for_dataset(d, color, points_str);
		}
	}

	fill_region_for_dataset(d, color, points_str) {
		let gradient_id = makeGradient(this.svg_defs, color, true);
		let pathStr = "M" + `0,${this.zeroLine}L` + points_str + `L${this.width},${this.zeroLine}`;

		d.regionPath = makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id})`);
		this.paths_groups[d.index].appendChild(d.regionPath);
	}
}
