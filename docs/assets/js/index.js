// Composite Chart
// ================================================================================
let reportCountList = [152, 222, 199, 287, 534, 709,
	1179, 1256, 1632, 1856, 1850];

let lineCompositeData = {
	labels: ["2007", "2008", "2009", "2010", "2011", "2012",
		"2013", "2014", "2015", "2016", "2017"],

	yMarkers: [
		{
			label: "Average 100 reports/month",
			value: 1200,
		}
	],

	datasets: [{
		"name": "Events",
		"values": reportCountList
	}]
};


let fireball_5_25 = [
	[4, 0, 3, 1, 1, 2, 1, 1, 1, 0, 1, 1],
	[2, 3, 3, 2, 1, 3, 0, 1, 2, 7, 10, 4],
	[5, 6, 2, 4, 0, 1, 4, 3, 0, 2, 0, 1],
	[0, 2, 6, 2, 1, 1, 2, 3, 6, 3, 7, 8],
	[6, 8, 7, 7, 4, 5, 6, 5, 22, 12, 10, 11],
	[7, 10, 11, 7, 3, 2, 7, 7, 11, 15, 22, 20],
	[13, 16, 21, 18, 19, 17, 12, 17, 31, 28, 25, 29],
	[24, 14, 21, 14, 11, 15, 19, 21, 41, 22, 32, 18],
	[31, 20, 30, 22, 14, 17, 21, 35, 27, 50, 117, 24],
	[32, 24, 21, 27, 11, 27, 43, 37, 44, 40, 48, 32],
	[31, 38, 36, 26, 23, 23, 25, 29, 26, 47, 61, 50],
];
let fireball_2_5 = [
	[22, 6, 6, 9, 7, 8, 6, 14, 19, 10, 8, 20],
	[11, 13, 12, 8, 9, 11, 9, 13, 10, 22, 40, 24],
	[20, 13, 13, 19, 13, 10, 14, 13, 20, 18, 5, 9],
	[7, 13, 16, 19, 12, 11, 21, 27, 27, 24, 33, 33],
	[38, 25, 28, 22, 31, 21, 35, 42, 37, 32, 46, 53],
	[50, 33, 36, 34, 35, 28, 27, 52, 58, 59, 75, 69],
	[54, 67, 67, 45, 66, 51, 38, 64, 90, 113, 116, 87],
	[84, 52, 56, 51, 55, 46, 50, 87, 114, 83, 152, 93],
	[73, 58, 59, 63, 56, 51, 83, 140, 103, 115, 265, 89],
	[106, 95, 94, 71, 77, 75, 99, 136, 129, 154, 168, 156],
	[81, 102, 95, 72, 58, 91, 89, 122, 124, 135, 183, 171],
];
let fireballOver25 = [
	// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
	[3, 2, 1, 3, 2, 0, 2, 2, 2, 3, 0, 1],
	[2, 3, 5, 2, 1, 3, 0, 2, 3, 5, 1, 4],
	[7, 4, 6, 1, 9, 2, 2, 2, 20, 9, 4, 9],
	[5, 6, 1, 2, 5, 4, 5, 5, 16, 9, 14, 9],
	[5, 4, 7, 5, 1, 5, 3, 3, 5, 7, 22, 2],
	[5, 13, 11, 6, 1, 7, 9, 8, 14, 17, 16, 3],
	[8, 9, 8, 6, 4, 8, 5, 6, 14, 11, 21, 12]
];

let monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

let barCompositeData = {
	labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	datasets: [
		{
			name: "Over 25 reports",
			values: fireballOver25[9],
		},
		{
			name: "5 to 25 reports",
			values: fireball_5_25[9],
		},
		{
			name: "2 to 5 reports",
			values: fireball_2_5[9]
		}
	]
};

let c1 = document.querySelector("#chart-composite-1");
let c2 = document.querySelector("#chart-composite-2");

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


// Demo Chart (bar, linepts, scatter(blobs), percentage)
// ================================================================================
let typeData = {
	labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
		"12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],

	yMarkers: [
		{
			label: "Marker",
			value: 43,
			// type: 'dashed'
		}
	],

	yRegions: [
		{
			label: "Region",
			start: -10,
			end: 50
		},
	],

	datasets: [
		{
			name: "Some Data",
			values: [18, 40, 30, 35, 8, 52, 17, -4],
			axisPosition: 'right',
			chartType: 'bar'
		},
		{
			name: "Another Set",
			values: [30, 50, -10, 15, 18, 32, 27, 14],
			axisPosition: 'right',
			chartType: 'bar'
		},
		{
			name: "Yet Another",
			values: [15, 20, -3, -15, 58, 12, -17, 37],
			chartType: 'line'
		}
	]
};

// let typeChart = new Chart("#chart-types", {
// 	title: "My Awesome Chart",
// 	data: typeData,
// 	type: 'bar',
// 	height: 250,
// 	colors: ['purple', 'magenta', 'red'],
// 	tooltipOptions: {
// 		formatTooltipX: d => (d + '').toUpperCase(),
// 		formatTooltipY: d => d + ' pts',
// 	}
// });




// Aggregation chart
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
}
let aggrChart = new Chart("#chart-aggr", args);

Array.prototype.slice.call(
	document.querySelectorAll('.aggr-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		args.type = type;

		let newChart = new Chart("#chart-aggr", args);;
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
let update_data_all_labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue",
	"Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
	"Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

let getRandom = () => Math.floor(Math.random() * 75 - 15);
let update_data_all_values = Array.from({length: 30}, getRandom);

// We're gonna be shuffling this
let update_data_all_indices = update_data_all_labels.map((d,i) => i);

let get_update_data = (source_array, length=10) => {
	let indices = update_data_all_indices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let update_data = {
	labels: get_update_data(update_data_all_labels),
	datasets: [{
		"values": get_update_data(update_data_all_values)
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

chart_update_buttons.querySelector('[data-update="random"]').addEventListener("click", (e) => {
	shuffle(update_data_all_indices);
	let value = getRandom();
	let start = getRandom();
	let end = getRandom();
	let data = {
		labels: update_data_all_labels.slice(0, 10),
		datasets: [{values: get_update_data(update_data_all_values)}],
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
	}
	update_chart.update(data);
});

chart_update_buttons.querySelector('[data-update="add"]').addEventListener("click", (e) => {
	let index = update_chart.state.datasetLength; // last index to add
	if(index >= update_data_all_indices.length) return;
	update_chart.addDataPoint(
		update_data_all_labels[index], [update_data_all_values[index]]
	);
});

chart_update_buttons.querySelector('[data-update="remove"]').addEventListener("click", (e) => {
	update_chart.removeDataPoint();
});

// Trends Chart
// ================================================================================
let trends_data = {
	labels: [1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976,
		1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986,
		1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996,
		1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006,
		2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016] ,
	datasets: [
		{
			values: [132.9, 150.0, 149.4, 148.0,  94.4,  97.6,  54.1,  49.2,  22.5, 18.4,
				39.3, 131.0, 220.1, 218.9, 198.9, 162.4,  91.0,  60.5,  20.6,  14.8,
				33.9, 123.0, 211.1, 191.8, 203.3, 133.0,  76.1,  44.9,  25.1,  11.6,
				28.9,  88.3, 136.3, 173.9, 170.4, 163.6,  99.3,  65.3,  45.8,  24.7,
				12.6,   4.2,   4.8,  24.9,  80.8,  84.5,  94.0, 113.3,  69.8,  39.8]
		}
	]
};

let plotChartArgs = {
	title: "Mean Total Sunspot Count - Yearly",
	data: trends_data,
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
let moon_names = ["Ganymede", "Callisto", "Io", "Europa"];
let masses = [14819000, 10759000, 8931900, 4800000];
let distances = [1070.412, 1882.709, 421.700, 671.034];
let diameters = [5262.4, 4820.6, 3637.4, 3121.6];

let jupiter_moons = {
	'Ganymede': {
		mass: '14819000 x 10^16 kg',
		'semi-major-axis': '1070412 km',
		'diameter': '5262.4 km'
	},
	'Callisto': {
		mass: '10759000 x 10^16 kg',
		'semi-major-axis': '1882709 km',
		'diameter': '4820.6 km'
	},
	'Io': {
		mass: '8931900 x 10^16 kg',
		'semi-major-axis': '421700 km',
		'diameter': '3637.4 km'
	},
	'Europa': {
		mass: '4800000 x 10^16 kg',
		'semi-major-axis': '671034 km',
		'diameter': '3121.6 km'
	},
};

let events_data = {
	labels: ["Ganymede", "Callisto", "Io", "Europa"],
	datasets: [
		{
			"values": distances,
			"formatted": distances.map(d => d*1000 + " km")
		}
	]
};

let events_chart = new Chart("#chart-events", {
	title: "Jupiter's Moons: Semi-major Axis (1000 km)",
	data: events_data,
	type: 'bar',
	height: 250,
	colors: ['grey'],
	isNavigable: 1,
});

let data_div = document.querySelector('.chart-events-data');

events_chart.parent.addEventListener('data-select', (e) => {
	let name = moon_names[e.index];
	data_div.querySelector('.moon-name').innerHTML = name;
	data_div.querySelector('.semi-major-axis').innerHTML = distances[e.index] * 1000;
	data_div.querySelector('.mass').innerHTML = masses[e.index];
	data_div.querySelector('.diameter').innerHTML = diameters[e.index];
	data_div.querySelector('img').src = "./assets/img/" + name.toLowerCase() + ".jpg";
});

// Heatmap
// ================================================================================

let heatmapData = {};
let current_date = new Date();
let timestamp = current_date.getTime()/1000;
timestamp = Math.floor(timestamp - (timestamp % 86400)).toFixed(1); // convert to midnight
for (var i = 0; i< 375; i++) {
	heatmapData[parseInt(timestamp)] = Math.floor(Math.random() * 5);
	timestamp = Math.floor(timestamp - 86400).toFixed(1);
}

let heatmap = new Chart("#chart-heatmap", {
	data: heatmapData,
	type: 'heatmap',
	legendScale: [0, 1, 2, 4, 5],
	height: 115,
	discreteDomains: 1,
	legendColors: ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c']
});

// console.log(heatmapData, heatmap);

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
			legendColors: colors
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
			legendColors: colors
		});

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

// Helpers
// ================================================================================
function shuffle(array) {
	// https://stackoverflow.com/a/2450976/6495043
	// Awesomeness: https://bost.ocks.org/mike/shuffle/

	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}


