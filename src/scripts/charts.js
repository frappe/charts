import '../styles/charts.less';

import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import PercentageChart from './charts/PercentageChart';
import Heatmap from './charts/Heatmap';

if (ENV !== 'production') {
	// Enable LiveReload
	document.write(
		'<script src="http://' + (location.host || 'localhost').split(':')[0] +
		':35729/livereload.js?snipver=1"></' + 'script>'
	);
}

export default class Chart {
	constructor(args) {
		if(args.type === 'line') {
			return new LineChart(arguments[0]);
		} else if(args.type === 'bar') {
			return new BarChart(arguments[0]);
		} else if(args.type === 'percentage') {
			return new PercentageChart(arguments[0]);
		} else if(args.type === 'heatmap') {
			return new Heatmap(arguments[0]);
		} else {
			return new LineChart(arguments[0]);
		}
	}
}