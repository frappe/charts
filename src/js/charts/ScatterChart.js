import LineChart from './LineChart';

export default class ScatterChart extends LineChart {
	constructor(args) {
		super(args);

		this.type = 'scatter';

		if(!args.dot_radius) {
			this.dot_radius = 8;
		} else {
			this.dot_radius = args.dot_radius;
		}

		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	make_paths() {}
	make_path() {}
}
