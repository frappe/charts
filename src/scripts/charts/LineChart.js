import AxisChart from './AxisChart';
import $ from '../helpers/dom';

export default class LineChart extends AxisChart {
	constructor(args) {
		super(args);
		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}

		this.type = 'line';
		this.region_fill = args.region_fill;
		this.x_axis_mode = args.x_axis_mode || 'span';
		this.y_axis_mode = args.y_axis_mode || 'span';

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
			args: { radius: 8 }
		};
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

		if(this.region_fill) {
			let gradient_id ='path-fill-gradient' + '-' + color;

			this.gradient_def = $.createSVG('linearGradient', {
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

			set_gradient_stop(this.gradient_def, "0%", color, 0.4);
			set_gradient_stop(this.gradient_def, "50%", color, 0.2);
			set_gradient_stop(this.gradient_def, "100%", color, 0);

			d.region_path = $.createSVG('path', {
				inside: this.paths_groups[i],
				className: `region-fill`,
				d: "M" + `0,${this.zero_line}L` + points_str + `L${this.width},${this.zero_line}`,
			});

			d.region_path.style.stroke = "none";
			d.region_path.style.fill = `url(#${gradient_id})`;
		}
	}
}
