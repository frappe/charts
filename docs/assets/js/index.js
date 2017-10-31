// Composite Chart
// ================================================================================
let report_count_list = [17, 40, 33, 44, 126, 156,
	324, 333, 478, 495, 373];

let bar_composite_data = {
	labels: ["2007", "2008", "2009", "2010", "2011", "2012",
		"2013", "2014", "2015", "2016", "2017"],

	datasets: [{
		"title": "Events",
		"color": "orange",
		"values": report_count_list,
		// "formatted": report_count_list.map(d => d + " reports")
	}]
};

let line_composite_data = {
	labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	datasets: [{
		"color": "green",
		"values": [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0],
		// "formatted": ["₹ 0.00", "₹ 0.00", "₹ 0.00", "₹ 61,500.00", "₹ 82,936.88", "₹ 24,010.00", "₹ 0.00", "₹ 0.00", "₹ 25,840.00", "₹ 5,08,048.82", "₹ 1,16,820.00", "₹ 0.00"],
	}]
};

let more_line_data = {
	0: {values: [4, 0, 3, 1, 1, 2, 1, 2, 1, 0, 1, 1]},
	1: {values: [2, 3, 3, 2, 1, 4, 0, 1, 2, 7, 11, 4]},
	2: {values: [7, 7, 2, 4, 0, 1, 5, 3, 1, 2, 0, 1]},
	3: {values: [0, 2, 6, 2, 2, 1, 2, 3, 6, 3, 7, 10]},
	4: {values: [9, 10, 8, 10, 6, 5, 8, 8, 24, 15, 10, 13]},
	5: {values: [9, 13, 16, 9, 4, 5, 7, 10, 14, 22, 23, 24]},
	6: {values: [20, 22, 28, 19, 28, 19, 14, 19, 51, 37, 29, 38]},
	7: {values: [29, 20, 22, 16, 16, 19, 24, 26, 57, 31, 46, 27]},
	8: {values: [36, 24, 38, 27, 15, 22, 24, 38, 32, 57, 139, 26]},
	9: {values: [37, 36, 32, 33, 12, 34, 52, 45, 58, 57, 64, 35]},
	10: {values: [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0]}
};

let bar_composite_chart = new Chart ({
	parent: "#chart-composite-1",
	title: "Fireball/Bolide Events - Yearly (more than 5 reports)",
	data: bar_composite_data,
	type: 'bar',
	height: 180,
	is_navigable: 1,
	is_series: 1
	// region_fill: 1
});

let line_composite_chart = new Chart ({
	parent: "#chart-composite-2",
	data: line_composite_data,
	type: 'line',
	height: 180,
	is_series: 1
});

bar_composite_chart.parent.addEventListener('data-select', (e) => {
	line_composite_chart.update_values([more_line_data[e.index]]);
});


// Demo Chart (bar, linepts, scatter(blobs), percentage)
// ================================================================================
let type_data = {
	labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
		"12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],

	datasets: [
		{
			title: "Some Data", color: "light-blue",
			values: [25, 40, 30, 35, 8, 52, 17, -4]
		},
		{
			title: "Another Set", color: "violet",
			values: [25, 50, -10, 15, 18, 32, 27, 14]
		},
		{
			title: "Yet Another", color: "blue",
			values: [15, 20, -3, -15, 58, 12, -17, 37]
		}
	]
};

let type_chart = new Chart({
	parent: "#chart-types",
	title: "My Awesome Chart",
	data: type_data,
	type: 'bar',
	height: 250,
	// is_series: 1
});

Array.prototype.slice.call(
	document.querySelectorAll('.chart-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');

		type_chart = type_chart.get_different_chart(type);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
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
			"color": "blue",
			"values": [132.9, 150.0, 149.4, 148.0,  94.4,  97.6,  54.1,  49.2,  22.5, 18.4,
				39.3, 131.0, 220.1, 218.9, 198.9, 162.4,  91.0,  60.5,  20.6,  14.8,
				33.9, 123.0, 211.1, 191.8, 203.3, 133.0,  76.1,  44.9,  25.1,  11.6,
				28.9,  88.3, 136.3, 173.9, 170.4, 163.6,  99.3,  65.3,  45.8,  24.7,
				12.6,   4.2,   4.8,  24.9,  80.8,  84.5,  94.0, 113.3,  69.8,  39.8]
		}
	]
};

let plot_chart_args = {
	parent: "#chart-trends",
	title: "Mean Total Sunspot Count - Yearly",
	data: trends_data,
	type: 'line',
	height: 250,
	is_series: 1,
	show_dots: 0,
	heatline: 1,
	x_axis_mode: 'tick',
	y_axis_mode: 'span'
};

new Chart(plot_chart_args);

Array.prototype.slice.call(
	document.querySelectorAll('.chart-plot-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		let config = [];

		if(type === 'line') {
			config = [0, 0, 0];
		} else if(type === 'region') {
			config = [0, 0, 1];
		} else {
			config = [0, 1, 0];
		}

		plot_chart_args.show_dots = config[0];
		plot_chart_args.heatline = config[1];
		plot_chart_args.region_fill = config[2];

		plot_chart_args.init = false;

		new Chart(plot_chart_args);

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
let update_data_all_values = Array.from({length: 30}, () => Math.floor(Math.random() * 75 - 15));

// We're gonna be shuffling this
let update_data_all_indices = update_data_all_labels.map((d,i) => i);

let get_update_data = (source_array, length=10) => {
	let indices = update_data_all_indices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let update_data = {
	labels: get_update_data(update_data_all_labels),
	datasets: [{
		"color": "red",
		"values": get_update_data(update_data_all_values)
	}],
	"specific_values": [
		{
			title: "Altitude",
			// title: "A very long text",
			line_type: "dashed",
			value: 38
		},
	]
};

let update_chart = new Chart({
	parent: "#chart-update",
	data: update_data,
	type: 'line',
	height: 250,
	is_series: 1,
	region_fill: 1
});

let chart_update_buttons = document.querySelector('.chart-update-buttons');

chart_update_buttons.querySelector('[data-update="random"]').addEventListener("click", (e) => {
	shuffle(update_data_all_indices);
	update_chart.update_values(
		[{values: get_update_data(update_data_all_values)}],
		update_data_all_labels.slice(0, 10)
	);
});

chart_update_buttons.querySelector('[data-update="add"]').addEventListener("click", (e) => {
	// NOTE: this ought to be problem, labels stay the same after update
	let index = update_chart.x.length; // last index to add
	if(index >= update_data_all_indices.length) return;
	update_chart.add_data_point(
		[update_data_all_values[index]], update_data_all_labels[index]
	);
});

chart_update_buttons.querySelector('[data-update="remove"]').addEventListener("click", (e) => {
	update_chart.remove_data_point();
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
			// "title": "km",
			"color": "grey",
			"values": distances,
			"formatted": distances.map(d => d*1000 + " km")
		}
	]
};

let events_chart = new Chart({
	parent: "#chart-events",
	title: "Jupiter's Moons: Semi-major Axis (1000 km)",
	data: events_data,
	type: 'bar',
	height: 250,
	is_navigable: 1,
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

// Aggregation chart
// ================================================================================
let aggr_data = {
	labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	datasets: [
		{
			"color": "purple",
			"values": [25, 40, 30, 35, 8, 52, 17]
		},
		{
			"color": "orange",
			"values": [25, 50, -10, 15, 18, 32, 27]

		}
	]
};

let aggr_chart = new Chart({
	parent: "#chart-aggr",
	data: aggr_data,
	type: 'bar',
	height: 250
});

document.querySelector('[data-aggregation="sums"]').addEventListener("click", (e) => {
	if(e.target.innerHTML === "Show Sums") {
		aggr_chart.show_sums();
		e.target.innerHTML = "Hide Sums";
	} else {
		aggr_chart.hide_sums();
		e.target.innerHTML = "Show Sums";
	}
});

document.querySelector('[data-aggregation="average"]').addEventListener("click", (e) => {
	if(e.target.innerHTML === "Show Averages") {
		aggr_chart.show_averages();
		e.target.innerHTML = "Hide Averages";
	} else {
		aggr_chart.hide_averages();
		e.target.innerHTML = "Show Averages";
	}
});

// Heatmap
// ================================================================================
let heatmap_data = {
	1479753000.0: 1,
	1498588200.0: 1,
	1499193000.0: 1,
	1499625000.0: 2,
	1500921000.0: 1,
	1501612200.0: 1,
	1502994600.0: 1,
	1503858600.0: 1,
	1504809000.0: 3,
	1505241000.0: 1,
	1506277800.0: 2
};

new Chart({
	parent: "#chart-heatmap",
	data: heatmap_data,
	type: 'heatmap',
	height: 100,
	discrete_domains: 1  // default 0
});

Array.prototype.slice.call(
	document.querySelectorAll('.heatmap-mode-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let mode = btn.getAttribute('data-mode');

		if(mode === 'discrete') {
			new Chart({
				parent: "#chart-heatmap",
				data: heatmap_data,
				type: 'heatmap',
				height: 100,
				discrete_domains: 1  // default 0
			});
		} else {
			new Chart({
				parent: "#chart-heatmap",
				data: heatmap_data,
				type: 'heatmap',
				height: 100
			});
		}

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
