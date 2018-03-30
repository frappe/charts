import { shuffle } from '../../../src/js/utils/helpers';
import { fireballOver25, fireball_2_5, fireball_5_25, lineCompositeData,
	barCompositeData, typeData, trendsData, moonData, heatmapData } from './data';

// ================================================================================

let c1 = document.querySelector("#chart-composite-1");
let c2 = document.querySelector("#chart-composite-2");

let Chart = frappe.Chart; // eslint-disable-line no-undef

let lineCompositeChart = new Chart (c1, {
	title: "Fireball/Bolide Events - Yearly (reported)",
	data: lineCompositeData,
	type: 'line',
	height: 190,
	colors: ['green'],
	isNavigable: 1,
	valuesOverPoints: 1,

	lineOptions: {
		dotSize: 8
	},
	// yAxisMode: 'tick'
	// regionFill: 1
});

let barCompositeChart = new Chart (c2, {
	data: barCompositeData,
	type: 'bar',
	height: 190,
	colors: ['violet', 'light-blue', '#46a9f9'],
	valuesOverPoints: 1,
	axisOptions: {
		xAxisMode: 'tick'
	},
	barOptions: {
		stacked: 1
	},

});

lineCompositeChart.parent.addEventListener('data-select', (e) => {
	let i = e.index;
	barCompositeChart.updateDatasets([
		fireballOver25[i], fireball_5_25[i], fireball_2_5[i]
	]);
});

// ================================================================================

let args = {
	data: typeData,
	type: 'axis-mixed',
	height: 250,
	colors: ['purple', 'magenta', 'light-blue'],

	maxLegendPoints: 6,
	maxSlices: 10,

	tooltipOptions: {
		formatTooltipX: d => (d + '').toUpperCase(),
		formatTooltipY: d => d + ' pts',
	}
};

let aggrChart = new Chart("#chart-aggr", args);

Array.prototype.slice.call(
	document.querySelectorAll('.aggr-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		args.type = type;

		let newChart = aggrChart.getDifferentChart(type);
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

// Update values chart
// ================================================================================
let updateDataAllLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue",
	"Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
	"Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

let getRandom = () => Math.floor(Math.random() * 75 - 15);
let updateDataAllValues = Array.from({length: 30}, getRandom);

// We're gonna be shuffling this
let updateDataAllIndices = updateDataAllLabels.map((d,i) => i);

let getUpdateData = (source_array, length=10) => {
	let indices = updateDataAllIndices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let update_data = {
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

let update_chart = new Chart("#chart-update", {
	data: update_data,
	type: 'line',
	height: 250,
	colors: ['#ff6c03'],
	lineOptions: {
		// hideLine: 1,
		regionFill: 1
	},
});

let chart_update_buttons = document.querySelector('.chart-update-buttons');

chart_update_buttons.querySelector('[data-update="random"]').addEventListener("click", () => {
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
	update_chart.update(data);
});

chart_update_buttons.querySelector('[data-update="add"]').addEventListener("click", () => {
	let index = update_chart.state.datasetLength; // last index to add
	if(index >= updateDataAllIndices.length) return;
	update_chart.addDataPoint(
		updateDataAllLabels[index], [updateDataAllValues[index]]
	);
});

chart_update_buttons.querySelector('[data-update="remove"]').addEventListener("click", () => {
	update_chart.removeDataPoint();
});

// Trends Chart
// ================================================================================

let plotChartArgs = {
	title: "Mean Total Sunspot Count - Yearly",
	data: trendsData,
	type: 'line',
	height: 250,
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

new Chart("#chart-trends", plotChartArgs);

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
	height: 250,
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

let heatmap = new Chart("#chart-heatmap", {
	data: heatmapData,
	type: 'heatmap',
	height: 115,
	discreteDomains: 1,
	colors: ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c']
});

console.log('heatmapData', Object.assign({}, heatmapData), heatmap);

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
			colors = ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c'];
		}

		new Chart("#chart-heatmap", {
			data: heatmapData,
			type: 'heatmap',
			legendScale: [0, 1, 2, 4, 5],
			height: 115,
			discreteDomains: discreteDomains,
			colors: colors
		});

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
			colors = ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c'];
		}

		let discreteDomains = 1;

		let view_mode = document
			.querySelector('.heatmap-mode-buttons .active')
			.getAttribute('data-mode');
		if(view_mode === 'continuous') {
			discreteDomains = 0;
		}

		new Chart("#chart-heatmap", {
			data: heatmapData,
			type: 'heatmap',
			legendScale: [0, 1, 2, 4, 5],
			height: 115,
			discreteDomains: discreteDomains,
			colors: colors
		});

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});
