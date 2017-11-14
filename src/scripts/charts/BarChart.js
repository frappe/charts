import AxisChart from './AxisChart';

export default class BarChart extends AxisChart {
	constructor(args) {
		super(args);

		this.type = 'bar';
		this.x_axis_mode = args.x_axis_mode || 'tick';
		this.y_axis_mode = args.y_axis_mode || 'span';
		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.x_offset = this.avg_unit_width;
		this.unit_args = {
			type: 'bar',
			args: {
				space_width: this.avg_unit_width/2,
			}
		};
	}

	make_overlay() {
		// Just make one out of the first element
		let index = this.x.length - 1;
		let unit = this.y[0].svg_units[index];
		this.update_current_data_point(index);

		if(this.overlay) {
			this.overlay.parentNode.removeChild(this.overlay);
		}
		this.overlay = unit.cloneNode();
		this.overlay.style.fill = '#000000';
		this.overlay.style.opacity = '0.4';
		this.draw_area.appendChild(this.overlay);
	}

	bind_overlay() {
		// on event, update overlay
		this.parent.addEventListener('data-select', (e) => {
			this.update_overlay(e.svg_unit);
		});
	}

	bind_units(units_array) {
		units_array.map(unit => {
			unit.addEventListener('click', () => {
				let index = unit.getAttribute('data-point-index');
				this.update_current_data_point(index);
			});
		});
	}

	update_overlay(unit) {
		let attributes = [];
		Object.keys(unit.attributes).map(index => {
			attributes.push(unit.attributes[index]);
		});

		attributes.filter(attr => attr.specified).map(attr => {
			this.overlay.setAttribute(attr.name, attr.nodeValue);
		});

		this.overlay.style.fill = '#000000';
		this.overlay.style.opacity = '0.4';
	}

	on_left_arrow() {
		this.update_current_data_point(this.current_index - 1);
	}

	on_right_arrow() {
		this.update_current_data_point(this.current_index + 1);
	}

	set_avg_unit_width_and_x_offset() {
		this.avg_unit_width = this.width/(this.x.length + 1);
		this.x_offset = this.avg_unit_width;
	}
}
