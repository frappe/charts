import '../styles/charts.less';

import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import ScatterChart from './charts/ScatterChart';
import PercentageChart from './charts/PercentageChart';
import Heatmap from './charts/Heatmap';

// if (ENV !== 'production') {
// 	// Enable LiveReload
// 	document.write(
// 		'<script src="http://' + (location.host || 'localhost').split(':')[0] +
// 		':35729/livereload.js?snipver=1"></' + 'script>'
// 	);
// }

export default class Chart {
	constructor(args) {
		switch (args.type) {
			case 'line': return new LineChart(arguments[0]);
			case 'bar': return new BarChart(arguments[0]);
			case 'scatter': return new ScatterChart(arguments[0]);
			case 'percentage': return new PercentageChart(arguments[0]);
			case 'heatmap': return new Heatmap(arguments[0]);
			default: return new LineChart(arguments[0]);
		}
	}
}
