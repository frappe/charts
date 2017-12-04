import LineChart from './LineChart';

export default class ScatterChart extends LineChart {
	constructor(args) {
		super(args);

		this.type = 'scatter';

		if(!args.dotRadius) {
			this.dotRadius = 8;
		} else {
			this.dotRadius = args.dotRadius;
		}

		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dotRadius }
		};
	}

	make_paths() {}
	make_path() {}
}
