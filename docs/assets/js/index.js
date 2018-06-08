import { shuffle, getRandomBias } from '../../../src/js/utils/helpers';
import { HEATMAP_COLORS_YELLOW, HEATMAP_COLORS_BLUE } from '../../../src/js/utils/constants';
import { SEC_IN_DAY, clone, timestampToMidnight, timestampSec, addDays } from '../../../src/js/utils/date-utils';
import { fireballOver25, fireball_2_5, fireball_5_25, lineCompositeData,
	barCompositeData, typeData, trendsData, moonData } from './data';
import demoConfig from './demoConfig';
// import { lineComposite, barComposite } from './demoConfig';
// ================================================================================

let Chart = frappe.Chart; // eslint-disable-line no-undef

let lc = demoConfig.lineComposite;
let lineCompositeChart = new Chart (lc.elementID, lc.options);

let bc = demoConfig.barComposite;
let barCompositeChart = new Chart (bc.elementID, bc.options);

lineCompositeChart.parent.addEventListener('data-select', (e) => {
	let i = e.index;
	barCompositeChart.updateDatasets([
		fireballOver25[i], fireball_5_25[i], fireball_2_5[i]
	]);
});

// ================================================================================

let customColors = ['purple', 'magenta', 'light-blue'];
let typeChartArgs = {
	title: "My Awesome Chart",
	data: typeData,
	type: 'axis-mixed',
	height: 300,
	colors: customColors,

	// maxLegendPoints: 6,
	maxSlices: 10,

	tooltipOptions: {
		formatTooltipX: d => (d + '').toUpperCase(),
		formatTooltipY: d => d + ' pts',
	}
};

let aggrChart = new Chart("#chart-aggr", typeChartArgs);

Array.prototype.slice.call(
	document.querySelectorAll('.aggr-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		typeChartArgs.type = type;
		if(type !== 'axis-mixed') {
			typeChartArgs.colors = undefined;
		} else {
			typeChartArgs.colors = customColors;
		}

		if(type !== 'percentage') {
			typeChartArgs.height = 300;
		} else {
			typeChartArgs.height = undefined;
		}

		let newChart = new Chart("#chart-aggr", typeChartArgs);
		if(newChart){
			aggrChart = newChart;
		}
		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

document.querySelector('.export-aggr').addEventListener('click', () => {
	aggrChart.export();
});

// Update values chart
// ================================================================================
let updateDataAllLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue",
	"Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
	"Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

let getRandom = () => Math.floor(getRandomBias(-40, 60, 0.8, 1));
let updateDataAllValues = Array.from({length: 30}, getRandom);

// We're gonna be shuffling this
let updateDataAllIndices = updateDataAllLabels.map((d,i) => i);

let getUpdateData = (source_array, length=10) => {
	let indices = updateDataAllIndices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let updateData = {
	labels: getUpdateData(updateDataAllLabels),
	datasets: [{
		"values": getUpdateData(updateDataAllValues)
	}],
	yMarkers: [
		{
			label: "Altitude",
			value: 25,
			type: 'dashed'
		}
	],
	yRegions: [
		{
			label: "Range",
			start: 10,
			end: 45
		},
	],
};

let updateChart = new Chart("#chart-update", {
	data: updateData,
	type: 'line',
	height: 300,
	colors: ['#ff6c03'],
	lineOptions: {
		// hideLine: 1,
		regionFill: 1
	},
});

let chartUpdateButtons = document.querySelector('.chart-update-buttons');

chartUpdateButtons.querySelector('[data-update="random"]').addEventListener("click", () => {
	shuffle(updateDataAllIndices);
	let value = getRandom();
	let start = getRandom();
	let end = getRandom();
	let data = {
		labels: updateDataAllLabels.slice(0, 10),
		datasets: [{values: getUpdateData(updateDataAllValues)}],
		yMarkers: [
			{
				label: "Altitude",
				value: value,
				type: 'dashed'
			}
		],
		yRegions: [
			{
				label: "Range",
				start: start,
				end: end
			},
		],
	};
	updateChart.update(data);
});

chartUpdateButtons.querySelector('[data-update="add"]').addEventListener("click", () => {
	let index = updateChart.state.datasetLength; // last index to add
	if(index >= updateDataAllIndices.length) return;
	updateChart.addDataPoint(
		updateDataAllLabels[index], [updateDataAllValues[index]]
	);
});

chartUpdateButtons.querySelector('[data-update="remove"]').addEventListener("click", () => {
	updateChart.removeDataPoint();
});

document.querySelector('.export-update').addEventListener('click', () => {
	updateChart.export();
});

// Trends Chart
// ================================================================================

let plotChartArgs = {
	title: "Mean Total Sunspot Count - Yearly",
	data: trendsData,
	type: 'line',
	height: 300,
	colors: ['#238e38'],
	lineOptions: {
		hideDots: 1,
		heatline: 1,
	},
	axisOptions: {
		xAxisMode: 'tick',
		yAxisMode: 'span',
		xIsSeries: 1
	}
};

let trendsChart = new Chart("#chart-trends", plotChartArgs);

Array.prototype.slice.call(
	document.querySelectorAll('.chart-plot-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		let config = {};
		config[type] = 1;

		if(['regionFill', 'heatline'].includes(type)) {
			config.hideDots = 1;
		}

		// plotChartArgs.init = false;
		plotChartArgs.lineOptions = config;

		new Chart("#chart-trends", plotChartArgs);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

document.querySelector('.export-trends').addEventListener('click', () => {
	trendsChart.export();
});


// Event chart
// ================================================================================



let eventsData = {
	labels: ["Ganymede", "Callisto", "Io", "Europa"],
	datasets: [
		{
			"values": moonData.distances,
			"formatted": moonData.distances.map(d => d*1000 + " km")
		}
	]
};

let eventsChart = new Chart("#chart-events", {
	title: "Jupiter's Moons: Semi-major Axis (1000 km)",
	data: eventsData,
	type: 'bar',
	height: 330,
	colors: ['grey'],
	isNavigable: 1,
});

let dataDiv = document.querySelector('.chart-events-data');

eventsChart.parent.addEventListener('data-select', (e) => {
	let name = moonData.names[e.index];
	dataDiv.querySelector('.moon-name').innerHTML = name;
	dataDiv.querySelector('.semi-major-axis').innerHTML = moonData.distances[e.index] * 1000;
	dataDiv.querySelector('.mass').innerHTML = moonData.masses[e.index];
	dataDiv.querySelector('.diameter').innerHTML = moonData.diameters[e.index];
	dataDiv.querySelector('img').src = "./assets/img/" + name.toLowerCase() + ".jpg";
});

// Heatmap
// ================================================================================

let today = new Date();
let start = clone(today);
addDays(start, 4);
let end = clone(start);
start.setFullYear( start.getFullYear() - 2 );
end.setFullYear( end.getFullYear() - 1 );

let dataPoints = {};

let startTs = timestampSec(start);
let endTs = timestampSec(end);

startTs = timestampToMidnight(startTs);
endTs = timestampToMidnight(endTs, true);

while (startTs < endTs) {
	dataPoints[parseInt(startTs)] = Math.floor(getRandomBias(0, 5, 0.2, 1));
	startTs += SEC_IN_DAY;
}

const heatmapData = {
	dataPoints: dataPoints,
	start: start,
	end: end
};

let heatmapArgs = {
	title: "Monthly Distribution",
	data: heatmapData,
	type: 'heatmap',
	discreteDomains: 1,
	countLabel: 'Level',
	colors: HEATMAP_COLORS_BLUE,
	legendScale: [0, 1, 2, 4, 5]
};
let heatmapChart = new Chart("#chart-heatmap", heatmapArgs);

Array.prototype.slice.call(
	document.querySelectorAll('.heatmap-mode-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let mode = btn.getAttribute('data-mode');
		let discreteDomains = 0;

		if(mode === 'discrete') {
			discreteDomains = 1;
		}

		let colors = [];
		let colors_mode = document
			.querySelector('.heatmap-color-buttons .active')
			.getAttribute('data-color');
		if(colors_mode === 'halloween') {
			colors = HEATMAP_COLORS_YELLOW;
		} else if (colors_mode === 'blue') {
			colors = HEATMAP_COLORS_BLUE;
		}

		heatmapArgs.discreteDomains = discreteDomains;
		heatmapArgs.colors = colors;
		new Chart("#chart-heatmap", heatmapArgs);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

Array.prototype.slice.call(
	document.querySelectorAll('.heatmap-color-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let colors_mode = btn.getAttribute('data-color');
		let colors = [];

		if(colors_mode === 'halloween') {
			colors = HEATMAP_COLORS_YELLOW;
		} else if (colors_mode === 'blue') {
			colors = HEATMAP_COLORS_BLUE;
		}

		let discreteDomains = 1;

		let view_mode = document
			.querySelector('.heatmap-mode-buttons .active')
			.getAttribute('data-mode');
		if(view_mode === 'continuous') {
			discreteDomains = 0;
		}

		heatmapArgs.discreteDomains = discreteDomains;
		heatmapArgs.colors = colors;
		new Chart("#chart-heatmap", heatmapArgs);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

document.querySelector('.export-heatmap').addEventListener('click', () => {
	heatmapChart.export();
});
