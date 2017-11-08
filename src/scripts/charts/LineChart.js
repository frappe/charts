import AxisChart from './AxisChart';
import $ from '../utils/dom';

export default class LineChart extends AxisChart {
	constructor(args) {
		super(args);

		this.x_axis_mode = args.x_axis_mode || 'span';
		this.y_axis_mode = args.y_axis_mode || 'span';

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

	setup_graph_components() {
		this.setup_path_groups();
		super.setup_graph_components();
	}

	setup_path_groups() {
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = $.createSVG('g', {
				className: 'path-group path-group-' + i,
				inside: this.draw_area
			});
		});
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	make_new_units_for_dataset(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {
		if(this.show_dots) {
			super.make_new_units_for_dataset(x_values, y_values, color, dataset_index,
				no_of_datasets, units_group, units_array, unit);
		}
	}

	make_paths() {
		this.y.map((d, i) => {
			this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
		});
	}

	make_path(d, i, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[i].textContent = '';

		d.path = $.createSVG('path', {
			inside: this.paths_groups[i],
			className: `stroke ${color}`,
			d: "M"+points_str
		});

		if(this.heatline) {
			let gradient_id = this.make_gradient(color);
			d.path.style.stroke = `url(#${gradient_id})`;
		}

		if(this.region_fill) {
			this.fill_region_for_dataset(d, i, color, points_str);
		}
	}

	fill_region_for_dataset(d, i, color, points_str) {
		let gradient_id = this.make_gradient(color, true);

		d.region_path = $.createSVG('path', {
			inside: this.paths_groups[i],
			className: `region-fill`,
			d: "M" + `0,${this.zero_line}L` + points_str + `L${this.width},${this.zero_line}`,
		});

		d.region_path.style.stroke = "none";
		d.region_path.style.fill = `url(#${gradient_id})`;
	}

	make_gradient(color, lighter = false) {
		let gradient_id ='path-fill-gradient' + '-' + color;

		let gradient_def = $.createSVG('linearGradient', {
			inside: this.svg_defs,
			id: gradient_id,
			x1: 0,
			x2: 0,
			y1: 0,
			y2: 1
		});

		let set_gradient_stop = (grad_elem, offset, color, opacity) => {
			$.createSVG('stop', {
				'className': 'stop-color ' + color,
				'inside': grad_elem,
				'offset': offset,
				'stop-opacity': opacity
			});
		};

		let opacities = [1, 0.6, 0.2];

		if(lighter) {
			opacities = [0.4, 0.2, 0];
		}

		set_gradient_stop(gradient_def, "0%", color, opacities[0]);
		set_gradient_stop(gradient_def, "50%", color, opacities[1]);
		set_gradient_stop(gradient_def, "100%", color, opacities[2]);

		return gradient_id;
	}
}
