import { $ } from '../../../src/js/utils/dom';
import { shuffle, getRandomBias } from '../../../src/js/utils/helpers';
import { fireballOver25, fireball_2_5, fireball_5_25, lineCompositeData,
	barCompositeData, typeData, trendsData, moonData } from './data';
import dc from './demoConfig';
import { docSectionBuilder } from './docSectionBuilder';

let Chart = frappe.Chart; // eslint-disable-line no-undef
let dcb = new docSectionBuilder(Chart);

let lineComposite = new Chart("#line-composite-1", dc.lineComposite.config);
let barComposite = new Chart("#bar-composite-1", dc.barComposite.config);

lineComposite.parent.addEventListener('data-select', (e) => {
	let i = e.index;
	barComposite.updateDatasets([
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
	valuesOverPoints: 1,

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

let section = document.querySelector('.trends-plot');
dcb.setParent(section);
dcb.setSys(dc.trendsPlot);
dcb.make();


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

section = document.querySelector('.heatmap');
dcb.setParent(section);
dcb.setSys(dc.heatmap);
dcb.make();
