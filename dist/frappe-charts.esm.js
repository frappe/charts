function $(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

$.findNodeIndex = (node) =>
{
	var i = 0;
	while (node.previousSibling) {
		node = node.previousSibling;
		i++;
	}
	return i;
};

$.create = (tag, o) => {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		} else if (i === "styles") {
			if(typeof val === "object") {
				Object.keys(val).map(prop => {
					element.style[prop] = val[prop];
				});
			}
		} else if (i in element ) {
			element[i] = val;
		}
		else {
			element.setAttribute(i, val);
		}
	}

	return element;
};

$.createSVG = (tag, o) => {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		}
		else {
			if(i === "className") { i = "class"; }
			if(i === "innerHTML") {
				element['textContent'] = val;
			} else {
				element.setAttribute(i, val);
			}
		}
	}

	return element;
};

$.offset = (element) => {
	let rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	};
};

$.isElementInViewport = (el) => {
	// Although straightforward: https://stackoverflow.com/a/7557433/6495043
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
	);
};

$.bind = (element, o) => {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.addEventListener(event, callback);
			});
		}
	}
};

$.unbind = (element, o) => {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function(event) {
				element.removeEventListener(event, callback);
			});
		}
	}
};

$.fire = (target, type, properties) => {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true );

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
};

var UnitRenderer = (function() {
	var UnitRenderer = function(total_height, zero_line, avg_unit_width) {
		this.total_height = total_height;
		this.zero_line = zero_line;
		this.avg_unit_width = avg_unit_width;
	};

	function get_bar_height_and_y_attr(y_top, zero_line, total_height) {
		let height, y;
		if (y_top <= zero_line) {
			height = zero_line - y_top;
			y = y_top;

			// In case of invisible bars
			if(height === 0) {
				height = total_height * 0.01;
				y -= height;
			}
		} else {
			height = y_top - zero_line;
			y = zero_line;

			// In case of invisible bars
			if(height === 0) {
				height = total_height * 0.01;
			}
		}

		return [height, y];
	}

	UnitRenderer.prototype = {
		draw_bar: function (x, y_top, args, color, index, dataset_index, no_of_datasets) {
			let total_width = this.avg_unit_width - args.space_width;
			let start_x = x - total_width/2;

			let width = total_width / no_of_datasets;
			let current_x = start_x + width * dataset_index;

			let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.total_height);

			return $.createSVG('rect', {
				className: `bar mini`,
				style: `fill: ${color}`,
				'data-point-index': index,
				x: current_x,
				y: y,
				width: width,
				height: height
			});
		},

		draw_dot: function(x, y, args, color, index) {
			return $.createSVG('circle', {
				style: `fill: ${color}`,
				'data-point-index': index,
				cx: x,
				cy: y,
				r: args.radius
			});
		},

		animate_bar: function(bar_obj, x, y_top, index, no_of_datasets) {
			let start = x - this.avg_unit_width/4;
			let width = (this.avg_unit_width/2)/no_of_datasets;
			let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.total_height);

			x = start + (width * index);

			return [bar_obj, {width: width, height: height, x: x, y: y}, 350, "easein"];
			// bar.animate({height: args.new_height, y: y_top}, 350, mina.easein);
		},

		animate_dot: function(dot_obj, x, y_top) {
			return [dot_obj, {cx: x, cy: y_top}, 350, "easein"];
			// dot.animate({cy: y_top}, 350, mina.easein);
		}
	};

	return UnitRenderer;
})();


function make_x_line(height, text_start_at, point, label_class, axis_line_class, x_pos) {
	let line = $.createSVG('line', {
		x1: 0,
		x2: 0,
		y1: 0,
		y2: height
	});

	let text = $.createSVG('text', {
		className: label_class,
		x: 0,
		y: text_start_at,
		dy: '.71em',
		innerHTML: point
	});

	let x_line = $.createSVG('g', {
		className: `tick ${axis_line_class}`,
		transform: `translate(${ x_pos }, 0)`
	});

	x_line.appendChild(line);
	x_line.appendChild(text);

	return x_line;
}

function make_y_line(start_at, width, text_end_at, point, label_class, axis_line_class, y_pos, darker=false, line_type="") {
	let line = $.createSVG('line', {
		className: line_type === "dashed" ? "dashed": "",
		x1: start_at,
		x2: width,
		y1: 0,
		y2: 0
	});

	let text = $.createSVG('text', {
		className: label_class,
		x: text_end_at,
		y: 0,
		dy: '.32em',
		innerHTML: point+""
	});

	let y_line = $.createSVG('g', {
		className: `tick ${axis_line_class}`,
		transform: `translate(0, ${y_pos})`,
		'stroke-opacity': 1
	});

	if(darker) {
		line.style.stroke = "rgba(27, 31, 35, 0.6)";
	}

	y_line.appendChild(line);
	y_line.appendChild(text);

	return y_line;
}

// Leveraging SMIL Animations

const EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

function animateSVG(element, props, dur, easing_type="linear", type=undefined, old_values={}) {

	let anim_element = element.cloneNode(true);
	let new_element = element.cloneNode(true);

	for(var attributeName in props) {
		let animate_element;
		if(attributeName === 'transform') {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		let current_value = old_values[attributeName] || element.getAttribute(attributeName);
		let value = props[attributeName];

		let anim_attr = {
			attributeName: attributeName,
			from: current_value,
			to: value,
			begin: "0s",
			dur: dur/1000 + "s",
			values: current_value + ";" + value,
			keySplines: EASING[easing_type],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if(type) {
			anim_attr["type"] = type;
		}

		for (var i in anim_attr) {
			animate_element.setAttribute(i, anim_attr[i]);
		}

		anim_element.appendChild(animate_element);

		if(type) {
			new_element.setAttribute(attributeName, `translate(${value})`);
		} else {
			new_element.setAttribute(attributeName, value);
		}
	}

	return [anim_element, new_element];
}

function transform(element, style) { // eslint-disable-line no-unused-vars
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
}

function runSVGAnimation(svg_container, elements) {
	let new_elements = [];
	let anim_elements = [];

	elements.map(element => {
		let obj = element[0];
		let parent = obj.unit.parentNode;

		let anim_element, new_element;

		element[0] = obj.unit;
		[anim_element, new_element] = animateSVG(...element);

		new_elements.push(new_element);
		anim_elements.push([anim_element, parent]);

		parent.replaceChild(anim_element, obj.unit);

		if(obj.array) {
			obj.array[obj.index] = new_element;
		} else {
			obj.object[obj.key] = new_element;
		}
	});

	let anim_svg = svg_container.cloneNode(true);

	anim_elements.map((anim_element, i) => {
		anim_element[1].replaceChild(new_elements[i], anim_element[0]);
		elements[i][0] = new_elements[i];
	});

	return anim_svg;
}

function normalize(x) {
	// Calculates mantissa and exponent of a number
	// Returns normalized number and exponent
	// https://stackoverflow.com/q/9383593/6495043

	if(x===0) {
		return [0, 0];
	}
	if(isNaN(x)) {
		return {mantissa: -6755399441055744, exponent: 972};
	}
	var sig = x > 0 ? 1 : -1;
	if(!isFinite(x)) {
		return {mantissa: sig * 4503599627370496, exponent: 972};
	}

	x = Math.abs(x);
	var exp = Math.floor(Math.log10(x));
	var man = x/Math.pow(10, exp);

	return [sig * man, exp];
}

function get_range_intervals(max, min=0) {
	let upper_bound = Math.ceil(max);
	let lower_bound = Math.floor(min);
	let range = upper_bound - lower_bound;

	let no_of_parts = range;
	let part_size = 1;

	// To avoid too many partitions
	if(range > 5) {
		if(range % 2 !== 0) {
			upper_bound++;
			// Recalc range
			range = upper_bound - lower_bound;
		}
		no_of_parts = range/2;
		part_size = 2;
	}

	// Special case: 1 and 2
	if(range <= 2) {
		no_of_parts = 4;
		part_size = range/no_of_parts;
	}

	// Special case: 0
	if(range === 0) {
		no_of_parts = 5;
		part_size = 1;
	}

	let intervals = [];
	for(var i = 0; i <= no_of_parts; i++){
		intervals.push(lower_bound + part_size * i);
	}
	return intervals;
}

function get_intervals(max_value, min_value=0) {
	let [normal_max_value, exponent] = normalize(max_value);
	let normal_min_value = min_value ? min_value/Math.pow(10, exponent): 0;

	// Allow only 7 significant digits
	normal_max_value = normal_max_value.toFixed(6);

	let intervals = get_range_intervals(normal_max_value, normal_min_value);
	intervals = intervals.map(value => value * Math.pow(10, exponent));
	return intervals;
}

function calc_intervals(values, with_minimum=false) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	let max_value = Math.max(...values);
	let min_value = Math.min(...values);

	// Exponent to be used for pretty print
	let exponent = 0, intervals = []; // eslint-disable-line no-unused-vars

	function get_positive_first_intervals(max_value, abs_min_value) {
		let intervals = get_intervals(max_value);

		let interval_size = intervals[1] - intervals[0];

		// Then unshift the negative values
		let value = 0;
		for(var i = 1; value < abs_min_value; i++) {
			value += interval_size;
			intervals.unshift((-1) * value);
		}
		return intervals;
	}

	// CASE I: Both non-negative

	if(max_value >= 0 && min_value >= 0) {
		exponent = normalize(max_value)[1];
		if(!with_minimum) {
			intervals = get_intervals(max_value);
		} else {
			intervals = get_intervals(max_value, min_value);
		}
	}

	// CASE II: Only min_value negative

	else if(max_value > 0 && min_value < 0) {
		// `with_minimum` irrelevant in this case,
		// We'll be handling both sides of zero separately
		// (both starting from zero)
		// Because ceil() and floor() behave differently
		// in those two regions

		let abs_min_value = Math.abs(min_value);

		if(max_value >= abs_min_value) {
			exponent = normalize(max_value)[1];
			intervals = get_positive_first_intervals(max_value, abs_min_value);
		} else {
			// Mirror: max_value => abs_min_value, then change sign
			exponent = normalize(abs_min_value)[1];
			let pos_intervals = get_positive_first_intervals(abs_min_value, max_value);
			intervals = pos_intervals.map(d => d * (-1));
		}

	}

	// CASE III: Both non-positive

	else if(max_value <= 0 && min_value <= 0) {
		// Mirrored Case I:
		// Work with positives, then reverse the sign and array

		let pseudo_max_value = Math.abs(min_value);
		let pseudo_min_value = Math.abs(max_value);

		exponent = normalize(pseudo_max_value)[1];
		if(!with_minimum) {
			intervals = get_intervals(pseudo_max_value);
		} else {
			intervals = get_intervals(pseudo_max_value, pseudo_min_value);
		}

		intervals = intervals.reverse().map(d => d * (-1));
	}

	return intervals;
}

function calc_distribution(values, distribution_size) {
	// Assume non-negative values,
	// implying distribution minimum at zero

	let data_max_value = Math.max(...values);

	let distribution_step = 1 / (distribution_size - 1);
	let distribution = [];

	for(var i = 0; i < distribution_size; i++) {
		let checkpoint = data_max_value * (distribution_step * i);
		distribution.push(checkpoint);
	}

	return distribution;
}

function get_max_checkpoint(value, distribution) {
	return distribution.filter(d => d < value).length;
}

/**
 * Returns the value of a number upto 2 decimal places.
 * @param {Number} d Any number
 */
function float_2(d) {
	return parseFloat(d.toFixed(2));
}

/**
 * Returns whether or not two given arrays are equal.
 * @param {Array} arr1 First array
 * @param {Array} arr2 Second array
 */
function arrays_equal(arr1, arr2) {
	if(arr1.length !== arr2.length) return false;
	let are_equal = true;
	arr1.map((d, i) => {
		if(arr2[i] !== d) are_equal = false;
	});
	return are_equal;
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} array An array containing the items.
 */


/**
 * Returns pixel width of string.
 * @param {String} string
 * @param {Number} char_width Width of single char in pixels
 */
function get_string_width(string, char_width) {
	return (string+"").length * char_width;
}

class SvgTip {
	constructor({
		parent = null,
		colors = []
	}) {
		this.parent = parent;
		this.colors = colors;
		this.title_name = '';
		this.title_value = '';
		this.list_values = [];
		this.title_value_first = 0;

		this.x = 0;
		this.y = 0;

		this.top = 0;
		this.left = 0;

		this.setup();
	}

	setup() {
		this.make_tooltip();
	}

	refresh() {
		this.fill();
		this.calc_position();
		// this.show_tip();
	}

	make_tooltip() {
		this.container = $.create('div', {
			inside: this.parent,
			className: 'graph-svg-tip comparison',
			innerHTML: `<span class="title"></span>
				<ul class="data-point-list"></ul>
				<div class="svg-pointer"></div>`
		});
		this.hide_tip();

		this.title = this.container.querySelector('.title');
		this.data_point_list = this.container.querySelector('.data-point-list');

		this.parent.addEventListener('mouseleave', () => {
			this.hide_tip();
		});
	}

	fill() {
		let title;
		if(this.title_value_first) {
			title = `<strong>${this.title_value}</strong>${this.title_name}`;
		} else {
			title = `${this.title_name}<strong>${this.title_value}</strong>`;
		}
		this.title.innerHTML = title;
		this.data_point_list.innerHTML = '';

		this.list_values.map((set, i) => {
			const color = this.colors[i] || 'black';

			let li = $.create('li', {
				styles: {
					'border-top': `3px solid ${color}`
				},
				innerHTML: `<strong style="display: block;">${ set.value === 0 || set.value ? set.value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.data_point_list.appendChild(li);
		});
	}

	calc_position() {
		let width = this.container.offsetWidth;

		this.top = this.y - this.container.offsetHeight;
		this.left = this.x - width/2;
		let max_left = this.parent.offsetWidth - width;

		let pointer = this.container.querySelector('.svg-pointer');

		if(this.left < 0) {
			pointer.style.left = `calc(50% - ${-1 * this.left}px)`;
			this.left = 0;
		} else if(this.left > max_left) {
			let delta = this.left - max_left;
			let pointer_offset = `calc(50% + ${delta}px)`;
			pointer.style.left = pointer_offset;

			this.left = max_left;
		} else {
			pointer.style.left = `50%`;
		}
	}

	set_values(x, y, title_name = '', title_value = '', list_values = [], title_value_first = 0) {
		this.title_name = title_name;
		this.title_value = title_value;
		this.list_values = list_values;
		this.x = x;
		this.y = y;
		this.title_value_first = title_value_first;
		this.refresh();
	}

	hide_tip() {
		this.container.style.top = '0px';
		this.container.style.left = '0px';
		this.container.style.opacity = '0';
	}

	show_tip() {
		this.container.style.top = this.top + 'px';
		this.container.style.left = this.left + 'px';
		this.container.style.opacity = '1';
	}
}

function limit_color(r){
	if (r > 255) return 255;
	else if (r < 0) return 0;
	return r;
}

function lighten_darken_color(color, amt) {
	let col = get_color(color);
	let usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	let num = parseInt(col,16);
	let r = limit_color((num >> 16) + amt);
	let b = limit_color(((num >> 8) & 0x00FF) + amt);
	let g = limit_color((num & 0x0000FF) + amt);
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

function is_valid_color(string) {
	// https://stackoverflow.com/a/8027444/6495043
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(string);
}

const color_map = {
	'light-blue': '#7cd6fd',
	blue: '#5e64ff',
	violet: '#743ee2',
	red: '#ff5858',
	orange: '#ffa00a',
	yellow: '#feef72',
	green: '#28a745',
	'light-green': '#98d85b',
	purple: '#b554ff',
	magenta: '#ffa3ef',
	black: '#36114C',
	grey: '#bdd3e6',
	'light-grey': '#f0f4f7',
	'dark-grey': '#b8c2cc'
};

const get_color = (color) => {
	return color_map[color] || color;
};

class BaseChart {
	constructor({
		height = 240,

		title = '',
		subtitle = '',
		colors = [],
		summary = [],

		is_navigable = 0,
		has_legend = 0,

		type = '', // eslint-disable-line no-unused-vars

		parent,
		data
	}) {
		this.raw_chart_args = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;

		this.specific_values = data.specific_values || [];
		this.summary = summary;

		this.is_navigable = is_navigable;
		if(this.is_navigable) {
			this.current_index = 0;
		}
		this.has_legend = has_legend;
		this.colors = colors;

		const list = type === 'percentage' || type === 'pie'
			? this.data.labels
			: this.data.datasets;

		if(!this.colors || (list && this.colors.length < list.length)) {
			this.colors = ['light-blue', 'blue', 'violet', 'red', 'orange',
				'yellow', 'green', 'light-green', 'purple', 'magenta'];
		}
		this.colors = this.colors.map(color => get_color(color));

		this.chart_types = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

		this.set_margins(height);
	}

	get_different_chart(type) {
		if(!this.chart_types.includes(type)) {
			console.error(`'${type}' is not a valid chart type.`);
		}
		if(type === this.type) return;

		// Only across compatible types
		let compatible_types = {
			bar: ['line', 'scatter', 'percentage', 'pie'],
			line: ['scatter', 'bar', 'percentage', 'pie'],
			pie: ['line', 'scatter', 'percentage', 'bar'],
			scatter: ['line', 'bar', 'percentage', 'pie'],
			percentage: ['bar', 'line', 'scatter', 'pie'],
			heatmap: []
		};

		// Only across compatible colors types
		let color_compatible_types = {
			bar: ['line', 'scatter'],
			line: ['scatter', 'bar'],
			pie: ['percentage'],
			scatter: ['line', 'bar'],
			percentage: ['pie'],
			heatmap: []
		};

		if(!compatible_types[this.type].includes(type)) {
			console.error(`'${this.type}' chart cannot be converted to a '${type}' chart.`);
		}

		// whether the new chart can use the existing colors
		const use_color = color_compatible_types[this.type].includes(type);

		// Okay, this is anticlimactic
		// this function will need to actually be 'change_chart_type(type)'
		// that will update only the required elements, but for now ...
		return new Chart({
			parent: this.raw_chart_args.parent,
			title: this.title,
			data: this.raw_chart_args.data,
			type: type,
			height: this.raw_chart_args.height,
			colors: use_color ? this.colors : undefined
		});
	}

	set_margins(height) {
		this.base_height = height;
		this.height = height - 40;
		this.translate_x = 60;
		this.translate_y = 10;
	}

	setup() {
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return;
		}
		if(this.validate_and_prepare_data()) {
			this.bind_window_events();
			this.refresh(true);
		}
	}

	validate_and_prepare_data() {
		return true;
	}

	bind_window_events() {
		window.addEventListener('resize', () => this.refresh());
		window.addEventListener('orientationchange', () => this.refresh());
	}

	refresh(init=false) {
		this.setup_base_values();
		this.set_width();

		this.setup_container();
		this.setup_components();

		this.setup_values();
		this.setup_utils();

		this.make_graph_components(init);
		this.make_tooltip();

		if(this.summary.length > 0) {
			this.show_custom_summary();
		} else {
			this.show_summary();
		}

		if(this.is_navigable) {
			this.setup_navigation(init);
		}
	}

	set_width() {
		let special_values_width = 0;
		let char_width = 8;
		this.specific_values.map(val => {
			let str_width = get_string_width((val.title + ""), char_width);
			if(str_width > special_values_width) {
				special_values_width = str_width - 40;
			}
		});
		this.base_width = this.parent.offsetWidth - special_values_width;
		this.width = this.base_width - this.translate_x * 2;
	}

	setup_base_values() {}

	setup_container() {
		this.container = $.create('div', {
			className: 'chart-container',
			innerHTML: `<h6 class="title">${this.title}</h6>
				<h6 class="sub-title uppercase">${this.subtitle}</h6>
				<div class="frappe-chart graphics"></div>
				<div class="graph-stats-container"></div>`
		});

		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';
		this.parent.appendChild(this.container);

		this.chart_wrapper = this.container.querySelector('.frappe-chart');
		this.stats_wrapper = this.container.querySelector('.graph-stats-container');

		this.make_chart_area();
		this.make_draw_area();
	}

	make_chart_area() {
		this.svg = $.createSVG('svg', {
			className: 'chart',
			inside: this.chart_wrapper,
			width: this.base_width,
			height: this.base_height
		});

		this.svg_defs = $.createSVG('defs', {
			inside: this.svg,
		});

		return this.svg;
	}

	make_draw_area() {
		this.draw_area = $.createSVG("g", {
			className: this.type + '-chart',
			inside: this.svg,
			transform: `translate(${this.translate_x}, ${this.translate_y})`
		});
	}

	setup_components() { }

	make_tooltip() {
		this.tip = new SvgTip({
			parent: this.chart_wrapper,
			colors: this.colors
		});
		this.bind_tooltip();
	}


	show_summary() {}
	show_custom_summary() {
		this.summary.map(d => {
			let stats = $.create('div', {
				className: 'stats',
				styles: {
					background: d.color
				},
				innerHTML: `<span class="indicator">${d.title}: ${d.value}</span>`
			});
			this.stats_wrapper.appendChild(stats);
		});
	}

	setup_navigation(init=false) {
		this.make_overlay();

		if(init) {
			this.bind_overlay();

			document.addEventListener('keydown', (e) => {
				if($.isElementInViewport(this.chart_wrapper)) {
					e = e || window.event;

					if (e.keyCode == '37') {
						this.on_left_arrow();
					} else if (e.keyCode == '39') {
						this.on_right_arrow();
					} else if (e.keyCode == '38') {
						this.on_up_arrow();
					} else if (e.keyCode == '40') {
						this.on_down_arrow();
					} else if (e.keyCode == '13') {
						this.on_enter_key();
					}
				}
			});
		}
	}

	make_overlay() {}
	bind_overlay() {}
	bind_units() {}

	on_left_arrow() {}
	on_right_arrow() {}
	on_up_arrow() {}
	on_down_arrow() {}
	on_enter_key() {}

	get_data_point(index=this.current_index) {
		// check for length
		let data_point = {
			index: index
		};
		let y = this.y[0];
		['svg_units', 'y_tops', 'values'].map(key => {
			let data_key = key.slice(0, key.length-1);
			data_point[data_key] = y[key][index];
		});
		data_point.label = this.x[index];
		return data_point;
	}

	update_current_data_point(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.x.length) index = this.x.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$.fire(this.parent, "data-select", this.get_data_point());
	}

	// Objects
	setup_utils() { }
}

class AxisChart extends BaseChart {
	constructor(args) {
		super(args);

		this.x = this.data.labels || [];
		this.y = this.data.datasets || [];

		this.is_series = args.is_series;

		this.format_tooltip_y = args.format_tooltip_y;
		this.format_tooltip_x = args.format_tooltip_x;

		this.zero_line = this.height;

		// this.old_values = {};
	}

	validate_and_prepare_data() {
		return true;
	}

	setup_values() {
		this.data.datasets.map(d => {
			d.values = d.values.map(val => (!isNaN(val) ? val : 0));
		});
		this.setup_x();
		this.setup_y();
	}

	setup_x() {
		this.set_avg_unit_width_and_x_offset();

		if(this.x_axis_positions) {
			this.x_old_axis_positions =  this.x_axis_positions.slice();
		}
		this.x_axis_positions = this.x.map((d, i) =>
			float_2(this.x_offset + i * this.avg_unit_width));

		if(!this.x_old_axis_positions) {
			this.x_old_axis_positions = this.x_axis_positions.slice();
		}
	}

	setup_y() {
		if(this.y_axis_values) {
			this.y_old_axis_values =  this.y_axis_values.slice();
		}

		let values = this.get_all_y_values();

		if(this.y_sums && this.y_sums.length > 0) {
			values = values.concat(this.y_sums);
		}

		this.y_axis_values = calc_intervals(values, this.type === 'line');

		if(!this.y_old_axis_values) {
			this.y_old_axis_values = this.y_axis_values.slice();
		}

		const y_pts = this.y_axis_values;
		const value_range = y_pts[y_pts.length-1] - y_pts[0];

		if(this.multiplier) this.old_multiplier = this.multiplier;
		this.multiplier = this.height / value_range;
		if(!this.old_multiplier) this.old_multiplier = this.multiplier;

		const interval = y_pts[1] - y_pts[0];
		const interval_height = interval * this.multiplier;

		let zero_index;

		if(y_pts.indexOf(0) >= 0) {
			// the range has a given zero
			// zero-line on the chart
			zero_index = y_pts.indexOf(0);
		} else if(y_pts[0] > 0) {
			// Minimum value is positive
			// zero-line is off the chart: below
			let min = y_pts[0];
			zero_index = (-1) * min / interval;
		} else {
			// Maximum value is negative
			// zero-line is off the chart: above
			let max = y_pts[y_pts.length - 1];
			zero_index = (-1) * max / interval + (y_pts.length - 1);
		}

		if(this.zero_line) this.old_zero_line = this.zero_line;
		this.zero_line = this.height - (zero_index * interval_height);
		if(!this.old_zero_line) this.old_zero_line = this.zero_line;
	}

	setup_components() {
		super.setup_components();
		this.setup_marker_components();
		this.setup_aggregation_components();
		this.setup_graph_components();
	}

	setup_marker_components() {
		this.y_axis_group = $.createSVG('g', {className: 'y axis', inside: this.draw_area});
		this.x_axis_group = $.createSVG('g', {className: 'x axis', inside: this.draw_area});
		this.specific_y_group = $.createSVG('g', {className: 'specific axis', inside: this.draw_area});
	}

	setup_aggregation_components() {
		this.sum_group = $.createSVG('g', {className: 'data-points', inside: this.draw_area});
		this.average_group = $.createSVG('g', {className: 'chart-area', inside: this.draw_area});
	}

	setup_graph_components() {
		this.svg_units_groups = [];
		this.y.map((d, i) => {
			this.svg_units_groups[i] = $.createSVG('g', {
				className: 'data-points data-points-' + i,
				inside: this.draw_area
			});
		});
	}

	make_graph_components(init=false) {
		this.make_y_axis();
		this.make_x_axis();
		this.draw_graph(init);
		this.make_y_specifics();
	}

	// make VERTICAL lines for x values
	make_x_axis(animate=false) {
		let char_width = 8;
		let start_at, height, text_start_at, axis_line_class = '';
		if(this.x_axis_mode === 'span') {		// long spanning lines
			start_at = -7;
			height = this.height + 15;
			text_start_at = this.height + 25;
		} else if(this.x_axis_mode === 'tick'){	// short label lines
			start_at = this.height;
			height = 6;
			text_start_at = 9;
			axis_line_class = 'x-axis-label';
		}

		this.x_axis_group.setAttribute('transform', `translate(0,${start_at})`);

		if(animate) {
			this.make_anim_x_axis(height, text_start_at, axis_line_class);
			return;
		}

		let allowed_space = this.avg_unit_width * 1.5;
		let allowed_letters = allowed_space / 8;

		this.x_axis_group.textContent = '';
		this.x.map((point, i) => {
			let space_taken = get_string_width(point, char_width) + 2;
			if(space_taken > allowed_space) {
				if(this.is_series) {
					// Skip some axis lines if X axis is a series
					let skips = 1;
					while((space_taken/skips)*2 > allowed_space) {
						skips++;
					}
					if(i % skips !== 0) {
						return;
					}
				} else {
					point = point.slice(0, allowed_letters-3) + " ...";
				}
			}
			this.x_axis_group.appendChild(
				make_x_line(
					height,
					text_start_at,
					point,
					'x-value-text',
					axis_line_class,
					this.x_axis_positions[i]
				)
			);
		});
	}

	// make HORIZONTAL lines for y values
	make_y_axis(animate=false) {
		if(animate) {
			this.make_anim_y_axis();
			this.make_anim_y_specifics();
			return;
		}

		let [width, text_end_at, axis_line_class, start_at] = this.get_y_axis_line_props();

		this.y_axis_group.textContent = '';
		this.y_axis_values.map((value, i) => {
			this.y_axis_group.appendChild(
				make_y_line(
					start_at,
					width,
					text_end_at,
					value,
					'y-value-text',
					axis_line_class,
					this.zero_line - value * this.multiplier,
					(value === 0 && i !== 0) // Non-first Zero line
				)
			);
		});
	}

	get_y_axis_line_props(specific=false) {
		if(specific) {
			return[this.width, this.width + 5, 'specific-value', 0];
		}
		let width, text_end_at = -9, axis_line_class = '', start_at = 0;
		if(this.y_axis_mode === 'span') {		// long spanning lines
			width = this.width + 6;
			start_at = -6;
		} else if(this.y_axis_mode === 'tick'){	// short label lines
			width = -6;
			axis_line_class = 'y-axis-label';
		}

		return [width, text_end_at, axis_line_class, start_at];
	}

	draw_graph(init=false) {
		if(this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
			this.y.map((d, i) => {
				d.svg_units = [];
				this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, this.colors[i]);
				this.make_new_units(d, i);
				this.calc_y_dependencies();
			});
			return;
		}
		if(init) {
			this.draw_new_graph_and_animate();
			return;
		}
		this.y.map((d, i) => {
			d.svg_units = [];
			this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, this.colors[i]);
			this.make_new_units(d, i);
		});
	}

	draw_new_graph_and_animate() {
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.y_tops = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, this.colors[i]);
			this.make_new_units(d, i);
		});

		setTimeout(() => {
			this.update_values(data);
		}, 350);
	}

	setup_navigation(init) {
		if(init) {
			// Hack: defer nav till initial update_values
			setTimeout(() => {
				super.setup_navigation(init);
			}, 500);
		} else {
			super.setup_navigation(init);
		}
	}

	make_new_units(d, i) {
		this.make_new_units_for_dataset(
			this.x_axis_positions,
			d.y_tops,
			this.colors[i],
			i,
			this.y.length
		);
	}

	make_new_units_for_dataset(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {

		if(!units_group) units_group = this.svg_units_groups[dataset_index];
		if(!units_array) units_array = this.y[dataset_index].svg_units;
		if(!unit) unit = this.unit_args;

		units_group.textContent = '';
		units_array.length = 0;

		let unit_renderer = new UnitRenderer(this.height, this.zero_line, this.avg_unit_width);

		y_values.map((y, i) => {
			let data_unit = unit_renderer['draw_' + unit.type](
				x_values[i],
				y,
				unit.args,
				color,
				i,
				dataset_index,
				no_of_datasets
			);
			units_group.appendChild(data_unit);
			units_array.push(data_unit);
		});

		if(this.is_navigable) {
			this.bind_units(units_array);
		}
	}

	make_y_specifics() {
		this.specific_y_group.textContent = '';
		this.specific_values.map(d => {
			this.specific_y_group.appendChild(
				make_y_line(
					0,
					this.width,
					this.width + 5,
					d.title.toUpperCase(),
					'specific-value',
					'specific-value',
					this.zero_line - d.value * this.multiplier,
					false,
					d.line_type
				)
			);
		});
	}

	bind_tooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chart_wrapper.addEventListener('mousemove', (e) => {
			let offset = $.offset(this.chart_wrapper);
			let relX = e.pageX - offset.left - this.translate_x;
			let relY = e.pageY - offset.top - this.translate_y;

			if(relY < this.height + this.translate_y * 2) {
				this.map_tooltip_x_position_and_show(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	map_tooltip_x_position_and_show(relX) {
		if(!this.y_min_tops) return;

		let titles = this.x;
		if(this.format_tooltip_x && this.format_tooltip_x(this.x[0])) {
			titles = this.x.map(d=>this.format_tooltip_x(d));
		}

		let y_format = this.format_tooltip_y && this.format_tooltip_y(this.y[0].values[0]);

		for(var i=this.x_axis_positions.length - 1; i >= 0 ; i--) {
			let x_val = this.x_axis_positions[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.x_axis_positions[i-1];
			if(relX > x_val - this.avg_unit_width/2) {
				let x = x_val + this.translate_x;
				let y = this.y_min_tops[i] + this.translate_y;

				let title = titles[i];
				let values = this.y.map((set, j) => {
					return {
						title: set.title,
						value: y_format ? this.format_tooltip_y(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	// API
	show_sums() {
		this.updating = true;

		this.y_sums = new Array(this.x_axis_positions.length).fill(0);
		this.y.map(d => {
			d.values.map( (value, i) => {
				this.y_sums[i] += value;
			});
		});

		// Remake y axis, animate
		this.update_values();

		// Then make sum units, don't animate
		this.sum_units = [];

		this.make_new_units_for_dataset(
			this.x_axis_positions,
			this.y_sums.map( val => float_2(this.zero_line - val * this.multiplier)),
			'light-grey',
			0,
			1,
			this.sum_group,
			this.sum_units
		);

		// this.make_path && this.make_path(d, i, old_x, old_y, this.colors[i]);

		this.updating = false;
	}

	hide_sums() {
		if(this.updating) return;
		this.y_sums = [];
		this.sum_group.textContent = '';
		this.sum_units = [];
		this.update_values();
	}

	show_averages() {
		this.old_specific_values = this.specific_values.slice();
		this.y.map((d, i) => {
			let sum = 0;
			d.values.map(e => {sum+=e;});
			let average = sum/d.values.length;

			this.specific_values.push({
				title: "AVG" + " " + (i+1),
				line_type: "dashed",
				value: average,
				auto: 1
			});
		});

		this.update_values();
	}

	hide_averages() {
		this.old_specific_values = this.specific_values.slice();

		let indices_to_remove = [];
		this.specific_values.map((d, i) => {
			if(d.auto) indices_to_remove.unshift(i);
		});

		indices_to_remove.map(index => {
			this.specific_values.splice(index, 1);
		});

		this.update_values();
	}

	update_values(new_y, new_x) {
		if(!new_x) {
			new_x = this.x;
		}
		this.elements_to_animate = [];
		this.updating = true;

		this.old_x_values = this.x.slice();
		this.old_y_axis_tops = this.y.map(d => d.y_tops.slice());

		this.old_y_values = this.y.map(d => d.values);

		this.no_of_extra_pts = new_x.length - this.x.length;

		// Just update values prop, setup_x/y() will do the rest
		if(new_y) this.y.map((d, i) => {d.values = new_y[i].values;});
		if(new_x) this.x = new_x;

		this.setup_x();
		this.setup_y();

		// Animate only if positions have changed
		if(!arrays_equal(this.x_old_axis_positions, this.x_axis_positions)) {
			this.make_x_axis(true);
			setTimeout(() => {
				if(!this.updating) this.make_x_axis();
			}, 350);
		}

		if(!arrays_equal(this.y_old_axis_values, this.y_axis_values) ||
			(this.old_specific_values &&
			!arrays_equal(this.old_specific_values, this.specific_values))) {

			this.make_y_axis(true);
			setTimeout(() => {
				if(!this.updating) {
					this.make_y_axis();
					this.make_y_specifics();
				}
			}, 350);
		}

		// Change in data, so calculate dependencies
		this.calc_y_dependencies();

		this.animate_graphs();

		// Trigger animation with the animatable elements in this.elements_to_animate
		this.run_animation();

		this.updating = false;
	}

	add_data_point(y_point, x_point, index=this.x.length) {
		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d, i) => { d.values.splice(index, 0, y_point[i]); });
		let new_x = this.x.slice();
		new_x.splice(index, 0, x_point);

		this.update_values(new_y, new_x);
	}

	remove_data_point(index = this.x.length-1) {
		if(this.x.length < 3) return;

		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d) => { d.values.splice(index, 1); });
		let new_x = this.x.slice();
		new_x.splice(index, 1);

		this.update_values(new_y, new_x);
	}

	run_animation() {
		let anim_svg = runSVGAnimation(this.svg, this.elements_to_animate);

		if(this.svg.parentNode == this.chart_wrapper) {
			this.chart_wrapper.removeChild(this.svg);
			this.chart_wrapper.appendChild(anim_svg);

		}

		// Replace the new svg (data has long been replaced)
		setTimeout(() => {
			if(anim_svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(anim_svg);
				this.chart_wrapper.appendChild(this.svg);
			}
		}, 250);
	}

	animate_graphs() {
		this.y.map((d, i) => {
			// Pre-prep, equilize no of positions between old and new
			let [old_x, old_y, new_x, new_y] = this.calc_old_and_new_postions(d, i);
			if(this.no_of_extra_pts >= 0) {
				this.make_path && this.make_path(d, i, old_x, old_y, this.colors[i]);
				this.make_new_units_for_dataset(old_x, old_y, this.colors[i], i, this.y.length);
			}
			d.path && this.animate_path(d, i, old_x, old_y, new_x, new_y);
			this.animate_units(d, i, old_x, old_y, new_x, new_y);
		});

		// TODO: replace with real units
		setTimeout(() => {
			this.y.map((d, i) => {
				this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, this.colors[i]);
				this.make_new_units(d, i);
			});
		}, 400);
	}

	animate_path(d, i, old_x, old_y, new_x, new_y) {
		// Animate path
		const new_points_list = new_y.map((y, i) => (new_x[i] + ',' + y));
		const new_path_str = new_points_list.join("L");

		const path_args = [{unit: d.path, object: d, key: 'path'}, {d:"M"+new_path_str}, 350, "easein"];
		this.elements_to_animate.push(path_args);

		// Animate region
		if(d.region_path) {
			let reg_start_pt = `0,${this.zero_line}L`;
			let reg_end_pt = `L${this.width},${this.zero_line}`;

			const region_args = [
				{unit: d.region_path, object: d, key: 'region_path'},
				{d:"M" + reg_start_pt + new_path_str + reg_end_pt},
				350,
				"easein"
			];
			this.elements_to_animate.push(region_args);
		}
	}

	animate_units(d, index, old_x, old_y, new_x, new_y) {
		let type = this.unit_args.type;
		let unit_renderer = new UnitRenderer(this.height, this.zero_line, this.avg_unit_width);

		d.svg_units.map((unit, i) => {
			if(new_x[i] === undefined || new_y[i] === undefined) return;
			this.elements_to_animate.push(unit_renderer['animate_' + type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				new_x[i],
				new_y[i],
				index,
				this.y.length
			));
		});
	}

	calc_old_and_new_postions(d, i) {
		let old_x = this.x_old_axis_positions.slice();
		let new_x = this.x_axis_positions.slice();

		let old_y = this.old_y_axis_tops[i].slice();
		let new_y = d.y_tops.slice();

		const last_old_x_pos = old_x[old_x.length - 1];
		const last_old_y_pos = old_y[old_y.length - 1];

		const last_new_x_pos = new_x[new_x.length - 1];
		const last_new_y_pos = new_y[new_y.length - 1];

		if(this.no_of_extra_pts >= 0) {
			// First substitute current path with a squiggled one (looking the same but
			// having more points at end),
			// then animate to stretch it later to new points
			// (new points already have more points)

			// Hence, the extra end points will correspond to current(old) positions
			let filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_y_pos);

			old_x = old_x.concat(filler_x);
			old_y = old_y.concat(filler_y);

		} else {
			// Just modify the new points to have extra points
			// with the same position at end
			let filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_y_pos);

			new_x = new_x.concat(filler_x);
			new_y = new_y.concat(filler_y);
		}

		return [old_x, old_y, new_x, new_y];
	}

	make_anim_x_axis(height, text_start_at, axis_line_class) {
		// Animate X AXIS to account for more or less axis lines

		const old_pos = this.x_old_axis_positions;
		const new_pos = this.x_axis_positions;

		const old_vals = this.old_x_values;
		const new_vals = this.x;

		const last_line_pos = old_pos[old_pos.length - 1];

		let add_and_animate_line = (value, old_pos, new_pos) => {
			if(typeof new_pos === 'string') {
				new_pos = parseInt(new_pos.substring(0, new_pos.length-1));
			}
			const x_line = make_x_line(
				height,
				text_start_at,
				value, // new value
				'x-value-text',
				axis_line_class,
				old_pos // old position
			);
			this.x_axis_group.appendChild(x_line);

			this.elements_to_animate && this.elements_to_animate.push([
				{unit: x_line, array: [0], index: 0},
				{transform: `${ new_pos }, 0`},
				350,
				"easein",
				"translate",
				{transform: `${ old_pos }, 0`}
			]);
		};

		this.x_axis_group.textContent = '';

		this.make_new_axis_anim_lines(
			old_pos,
			new_pos,
			old_vals,
			new_vals,
			last_line_pos,
			add_and_animate_line
		);
	}

	make_anim_y_axis() {
		// Animate Y AXIS to account for more or less axis lines

		const old_pos = this.y_old_axis_values.map(value =>
			this.zero_line - value * this.multiplier);
		const new_pos = this.y_axis_values.map(value =>
			this.zero_line - value * this.multiplier);

		const old_vals = this.y_old_axis_values;
		const new_vals = this.y_axis_values;

		const last_line_pos = old_pos[old_pos.length - 1];

		this.y_axis_group.textContent = '';

		this.make_new_axis_anim_lines(
			old_pos,
			new_pos,
			old_vals,
			new_vals,
			last_line_pos,
			this.add_and_animate_y_line.bind(this),
			this.y_axis_group
		);
	}

	make_anim_y_specifics() {
		this.specific_y_group.textContent = '';
		this.specific_values.map((d) => {
			this.add_and_animate_y_line(
				d.title,
				this.old_zero_line - d.value * this.old_multiplier,
				this.zero_line - d.value * this.multiplier,
				0,
				this.specific_y_group,
				d.line_type,
				true
			);
		});
	}

	make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, add_and_animate_line, group) {
		let superimposed_positions, superimposed_values;
		let no_of_extras = new_vals.length - old_vals.length;
		if(no_of_extras > 0) {
			// More axis are needed
			// First make only the superimposed (same position) ones
			// Add in the extras at the end later
			superimposed_positions = new_pos.slice(0, old_pos.length);
			superimposed_values = new_vals.slice(0, old_vals.length);
		} else {
			// Axis have to be reduced
			// Fake it by moving all current extra axis to the last position
			// You'll need filler positions and values in the new arrays
			const filler_vals = new Array(Math.abs(no_of_extras)).fill("");
			superimposed_values = new_vals.concat(filler_vals);

			const filler_pos = new Array(Math.abs(no_of_extras)).fill(last_line_pos + "F");
			superimposed_positions = new_pos.concat(filler_pos);
		}

		superimposed_values.map((value, i) => {
			add_and_animate_line(value, old_pos[i], superimposed_positions[i], i, group);
		});

		if(no_of_extras > 0) {
			// Add in extra axis in the end
			// and then animate to new positions
			const extra_values = new_vals.slice(old_vals.length);
			const extra_positions = new_pos.slice(old_pos.length);

			extra_values.map((value, i) => {
				add_and_animate_line(value, last_line_pos, extra_positions[i], i, group);
			});
		}
	}

	add_and_animate_y_line(value, old_pos, new_pos, i, group, type, specific=false) {
		let filler = false;
		if(typeof new_pos === 'string') {
			new_pos = parseInt(new_pos.substring(0, new_pos.length-1));
			filler = true;
		}
		let new_props = {transform: `0, ${ new_pos }`};
		let old_props = {transform: `0, ${ old_pos }`};

		if(filler) {
			new_props['stroke-opacity'] = 0;
			// old_props['stroke-opacity'] = 1;
		}

		let [width, text_end_at, axis_line_class, start_at] = this.get_y_axis_line_props(specific);
		let axis_label_class = !specific ? 'y-value-text' : 'specific-value';
		value = !specific ? value : (value+"").toUpperCase();
		const y_line = make_y_line(
			start_at,
			width,
			text_end_at,
			value,
			axis_label_class,
			axis_line_class,
			old_pos,  // old position
			(value === 0 && i !== 0), // Non-first Zero line
			type
		);

		group.appendChild(y_line);

		this.elements_to_animate && this.elements_to_animate.push([
			{unit: y_line, array: [0], index: 0},
			new_props,
			350,
			"easein",
			"translate",
			old_props
		]);
	}

	set_avg_unit_width_and_x_offset() {
		// Set the ... you get it
		this.avg_unit_width = this.width/(this.x.length - 1);
		this.x_offset = 0;
	}

	get_all_y_values() {
		let all_values = [];

		// Add in all the y values in the datasets
		this.y.map(d => {
			all_values = all_values.concat(d.values);
		});

		// Add in all the specific values
		return all_values.concat(this.specific_values.map(d => d.value));
	}

	calc_y_dependencies() {
		this.y_min_tops = new Array(this.x_axis_positions.length).fill(9999);
		this.y.map(d => {
			d.y_tops = d.values.map( val => float_2(this.zero_line - val * this.multiplier));
			d.y_tops.map( (y_top, i) => {
				if(y_top < this.y_min_tops[i]) {
					this.y_min_tops[i] = y_top;
				}
			});
		});
		// this.chart_wrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}
}

class BarChart extends AxisChart {
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

class LineChart extends AxisChart {
	constructor(args) {
		super(args);

		this.x_axis_mode = args.x_axis_mode || 'span';
		this.y_axis_mode = args.y_axis_mode || 'span';

		if(args.hasOwnProperty('show_dots')) {
			this.show_dots = args.show_dots;
		} else {
			this.show_dots = 1;
		}
		this.region_fill = args.region_fill;

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}
		this.dot_radius = args.dot_radius || 4;
		this.heatline = args.heatline;
		this.type = 'line';

		this.setup();
	}

	setup_graph_components() {
		this.setup_path_groups();
		super.setup_graph_components();
	}

	setup_path_groups() {
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = $.createSVG('g', {
				className: 'path-group path-group-' + i,
				inside: this.draw_area
			});
		});
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: this.dot_radius }
		};
	}

	make_new_units_for_dataset(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {
		if(this.show_dots) {
			super.make_new_units_for_dataset(x_values, y_values, color, dataset_index,
				no_of_datasets, units_group, units_array, unit);
		}
	}

	make_paths() {
		this.y.map((d, i) => {
			this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
		});
	}

	make_path(d, i, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[i].textContent = '';

		d.path = $.createSVG('path', {
			inside: this.paths_groups[i],
			style: `stroke: ${color}`,
			d: "M"+points_str
		});

		if(this.heatline) {
			let gradient_id = this.make_gradient(color);
			d.path.style.stroke = `url(#${gradient_id})`;
		}

		if(this.region_fill) {
			this.fill_region_for_dataset(d, i, color, points_str);
		}
	}

	fill_region_for_dataset(d, i, color, points_str) {
		let gradient_id = this.make_gradient(color, true);

		d.region_path = $.createSVG('path', {
			inside: this.paths_groups[i],
			className: `region-fill`,
			d: "M" + `0,${this.zero_line}L` + points_str + `L${this.width},${this.zero_line}`,
		});

		d.region_path.style.stroke = "none";
		d.region_path.style.fill = `url(#${gradient_id})`;
	}

	make_gradient(color, lighter = false) {
		let gradient_id ='path-fill-gradient' + '-' + color;

		let gradient_def = $.createSVG('linearGradient', {
			inside: this.svg_defs,
			id: gradient_id,
			x1: 0,
			x2: 0,
			y1: 0,
			y2: 1
		});

		let set_gradient_stop = (grad_elem, offset, color, opacity) => {
			$.createSVG('stop', {
				style: `stop-color: ${color}`,
				inside: grad_elem,
				'offset': offset,
				'stop-opacity': opacity
			});
		};

		let opacities = [1, 0.6, 0.2];

		if(lighter) {
			opacities = [0.4, 0.2, 0];
		}

		set_gradient_stop(gradient_def, "0%", color, opacities[0]);
		set_gradient_stop(gradient_def, "50%", color, opacities[1]);
		set_gradient_stop(gradient_def, "100%", color, opacities[2]);

		return gradient_id;
	}
}

class ScatterChart extends LineChart {
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

	setup_graph_components() {
		this.setup_path_groups();
		super.setup_graph_components();
	}

	setup_path_groups() {}

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

class PercentageChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'percentage';

		this.max_slices = 10;
		this.max_legend_points = 6;

		this.setup();
	}

	make_chart_area() {
		this.chart_wrapper.className += ' ' + 'graph-focus-margin';
		this.chart_wrapper.style.marginTop = '45px';

		this.stats_wrapper.className += ' ' + 'graph-focus-margin';
		this.stats_wrapper.style.marginBottom = '30px';
		this.stats_wrapper.style.paddingTop = '0px';
	}

	make_draw_area() {
		this.chart_div = $.create('div', {
			className: 'div',
			inside: this.chart_wrapper
		});

		this.chart = $.create('div', {
			className: 'progress-chart',
			inside: this.chart_div
		});
	}

	setup_components() {
		this.percentage_bar = $.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	setup_values() {
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	make_graph_components() {
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		this.slices = [];
		this.slice_totals.map((total, i) => {
			let slice = $.create('div', {
				className: `progress-bar`,
				inside: this.percentage_bar,
				styles: {
					background: this.colors[i],
					width: total*100/this.grand_total + "%"
				}
			});
			this.slices.push(slice);
		});
	}

	bind_tooltip() {
		this.slices.map((slice, i) => {
			slice.addEventListener('mouseenter', () => {
				let g_off = $.offset(this.chart_wrapper), p_off = $.offset(slice);

				let x = p_off.left - g_off.left + slice.offsetWidth/2;
				let y = p_off.top - g_off.top - 6;
				let title = (this.formatted_labels && this.formatted_labels.length>0
					? this.formatted_labels[i] : this.labels[i]) + ': ';
				let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);

				this.tip.set_values(x, y, title, percent + "%");
				this.tip.show_tip();
			});
		});
	}

	show_summary() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			if(d) {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background: ${this.colors[i]}"></i>
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}

const ANGLE_RATIO = Math.PI / 180;
const FULL_ANGLE = 360;

class PieChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'pie';
		this.elements_to_animate = null;
		this.hoverRadio = args.hoverRadio || 0.1;
		this.max_slices = 10;
		this.max_legend_points = 6;
		this.isAnimate = false;
		this.startAngle = args.startAngle || 0;
		this.clockWise = args.clockWise || false;
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		this.setup();
	}
	setup_values() {
		this.centerX = this.width / 2;
		this.centerY = this.height / 2;
		this.radius = (this.height > this.width ? this.centerX : this.centerY);
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	static getPositionByAngle(angle,radius){
		return {
			x:Math.sin(angle * ANGLE_RATIO) * radius,
			y:Math.cos(angle * ANGLE_RATIO) * radius,
		};
	}
	makeArcPath(startPosition,endPosition){
		const{centerX,centerY,radius,clockWise} = this;
		return `M${centerX} ${centerY} L${centerX+startPosition.x} ${centerY+startPosition.y} A ${radius} ${radius} 0 0 ${clockWise ? 1 : 0} ${centerX+endPosition.x} ${centerY+endPosition.y} z`;
	}
	make_graph_components(init){
		const{radius,clockWise} = this;
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		const prevSlicesProperties = this.slicesProperties || [];
		this.slices = [];
		this.elements_to_animate = [];
		this.slicesProperties = [];
		let curAngle = 180 - this.startAngle;
		this.slice_totals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / this.grand_total) * FULL_ANGLE;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = PieChart.getPositionByAngle(startAngle,radius);
			const endPosition = PieChart.getPositionByAngle(endAngle,radius);
			const prevProperty = init && prevSlicesProperties[i];
			let curStart,curEnd;
			if(init){
				curStart = prevProperty?prevProperty.startPosition : startPosition;
				curEnd = prevProperty? prevProperty.endPosition : startPosition;
			}else{
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath = this.makeArcPath(curStart,curEnd);
			let slice = $.createSVG('path',{
				inside: this.draw_area,
				className: 'pie-path',
				style: 'transition:transform .3s;',
				d: curPath,
				fill: this.colors[i]
			});
			this.slices.push(slice);
			this.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: this.grand_total,
				startAngle,
				endAngle,
				angle:diffAngle
			});
			if(init){
				this.elements_to_animate.push([{unit: slice, array: this.slices, index: this.slices.length - 1},
					{d:this.makeArcPath(startPosition,endPosition)},
					650, "easein",null,{
						d:curPath
					}]);
			}

		});
		if(init){
			this.run_animation();
		}
	}
	run_animation() {
		// if(this.isAnimate) return ;
		// this.isAnimate = true;
		if(!this.elements_to_animate || this.elements_to_animate.length === 0) return;
		let anim_svg = runSVGAnimation(this.svg, this.elements_to_animate);

		if(this.svg.parentNode == this.chart_wrapper) {
			this.chart_wrapper.removeChild(this.svg);
			this.chart_wrapper.appendChild(anim_svg);

		}

		// Replace the new svg (data has long been replaced)
		setTimeout(() => {
			// this.isAnimate = false;
			if(anim_svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(anim_svg);
				this.chart_wrapper.appendChild(this.svg);
			}
		}, 650);
	}

	calTranslateByAngle(property){
		const{radius,hoverRadio} = this;
		const position = PieChart.getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}
	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag){
			transform(path,this.calTranslateByAngle(this.slicesProperties[i]));
			path.setAttribute('fill',lighten_darken_color(color,50));
			let g_off = $.offset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length>0
				? this.formatted_labels[i] : this.labels[i]) + ': ';
			let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);
			this.tip.set_values(x, y, title, percent + "%");
			this.tip.show_tip();
		}else{
			transform(path,'translate3d(0,0,0)');
			this.tip.hide_tip();
			path.setAttribute('fill',color);
		}
	}

	mouseMove(e){
		const target = e.target;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		for(let i = 0; i < this.slices.length; i++){
			if(target === this.slices[i]){
				this.hoverSlice(prevAcitve,prevIndex,false);
				this.curActiveSlice = target;
				this.curActiveSliceIndex = i;
				this.hoverSlice(target,i,true,e);
				break;
			}
		}
	}
	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
	bind_tooltip() {
		this.draw_area.addEventListener('mousemove',this.mouseMove);
		this.draw_area.addEventListener('mouseleave',this.mouseLeave);
	}

	show_summary() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			const color = this.colors[i];

			if(d) {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background-color:${color};"></i>
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}

// Playing around with dates

// https://stackoverflow.com/a/11252167/6495043
function treat_as_utc(date_str) {
	let result = new Date(date_str);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

function get_dd_mm_yyyy(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		(dd>9 ? '' : '0') + dd,
		(mm>9 ? '' : '0') + mm,
		date.getFullYear()
	].join('-');
}

function get_weeks_between(start_date_str, end_date_str) {
	return Math.ceil(get_days_between(start_date_str, end_date_str) / 7);
}

function get_days_between(start_date_str, end_date_str) {
	let milliseconds_per_day = 24 * 60 * 60 * 1000;
	return (treat_as_utc(end_date_str) - treat_as_utc(start_date_str)) / milliseconds_per_day;
}

// mutates
function add_days(date, number_of_days) {
	date.setDate(date.getDate() + number_of_days);
}

// export function get_month_name() {}

class Heatmap extends BaseChart {
	constructor({
		start = '',
		domain = '',
		subdomain = '',
		data = {},
		discrete_domains = 0,
		count_label = '',
		legend_colors = []
	}) {
		super(arguments[0]);

		this.type = 'heatmap';

		this.domain = domain;
		this.subdomain = subdomain;
		this.data = data;
		this.discrete_domains = discrete_domains;
		this.count_label = count_label;

		let today = new Date();
		this.start = start || add_days(today, 365);

		legend_colors = legend_colors.slice(0, 5);
		this.legend_colors = this.validate_colors(legend_colors)
			? legend_colors
			: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		// Hardcoded for a fixed 5-color theme,
		// More colors are difficult to parse visually
		this.distribution_size = 5;

		this.translate_x = 0;
		this.setup();
	}

	validate_colors(colors) {
		if(colors.length < 5) return 0;

		let valid = 1;
		colors.forEach(function(string) {
			if(!is_valid_color(string)) {
				valid = 0;
				console.warn('"' + string + '" is not a valid color.');
			}
		}, this);

		return valid;
	}

	setup_base_values() {
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.first_week_start = new Date(this.start.toDateString());
		this.last_week_start = new Date(this.today.toDateString());
		if(this.first_week_start.getDay() !== 7) {
			add_days(this.first_week_start, (-1) * this.first_week_start.getDay());
		}
		if(this.last_week_start.getDay() !== 7) {
			add_days(this.last_week_start, (-1) * this.last_week_start.getDay());
		}
		this.no_of_cols = get_weeks_between(this.first_week_start + '', this.last_week_start + '') + 1;
	}

	set_width() {
		this.base_width = (this.no_of_cols + 3) * 12 ;

		if(this.discrete_domains) {
			this.base_width += (12 * 12);
		}
	}

	setup_components() {
		this.domain_label_group = $.createSVG("g", {
			className: "domain-label-group chart-label",
			inside: this.draw_area
		});
		this.data_groups = $.createSVG("g", {
			className: "data-groups",
			inside: this.draw_area,
			transform: `translate(0, 20)`
		});
	}

	setup_values() {
		this.domain_label_group.textContent = '';
		this.data_groups.textContent = '';

		let data_values = Object.keys(this.data).map(key => this.data[key]);
		this.distribution = calc_distribution(data_values, this.distribution_size);

		this.month_names = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];

		this.render_all_weeks_and_store_x_values(this.no_of_cols);
	}

	render_all_weeks_and_store_x_values(no_of_weeks) {
		let current_week_sunday = new Date(this.first_week_start);
		this.week_col = 0;
		this.current_month = current_week_sunday.getMonth();

		this.months = [this.current_month + ''];
		this.month_weeks = {}, this.month_start_points = [];
		this.month_weeks[this.current_month] = 0;
		this.month_start_points.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let data_group, month_change = 0;
			let day = new Date(current_week_sunday);

			[data_group, month_change] = this.get_week_squares_group(day, this.week_col);
			this.data_groups.appendChild(data_group);
			this.week_col += 1 + parseInt(this.discrete_domains && month_change);
			this.month_weeks[this.current_month]++;
			if(month_change) {
				this.current_month = (this.current_month + 1) % 12;
				this.months.push(this.current_month + '');
				this.month_weeks[this.current_month] = 1;
			}
			add_days(current_week_sunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(current_date, index) {
		const no_of_weekdays = 7;
		const square_side = 10;
		const cell_padding = 2;
		const step = 1;
		const today_time = this.today.getTime();

		let month_change = 0;
		let week_col_change = 0;

		let data_group = $.createSVG("g", {
			className: "data-group",
			inside: this.data_groups
		});

		for(var y = 0, i = 0; i < no_of_weekdays; i += step, y += (square_side + cell_padding)) {
			let data_value = 0;
			let color_index = 0;

			let current_timestamp = current_date.getTime()/1000;
			let timestamp = Math.floor(current_timestamp - (current_timestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				data_value = this.data[timestamp];
			}

			if(this.data[Math.round(timestamp)]) {
				data_value = this.data[Math.round(timestamp)];
			}

			if(data_value) {
				color_index = get_max_checkpoint(data_value, this.distribution);
			}

			let x = 13 + (index + week_col_change) * 12;

			$.createSVG("rect", {
				className: 'day',
				inside: data_group,
				x: x,
				y: y,
				width: square_side,
				height: square_side,
				fill:  this.legend_colors[color_index],
				'data-date': get_dd_mm_yyyy(current_date),
				'data-value': data_value,
				'data-day': current_date.getDay()
			});

			let next_date = new Date(current_date);
			add_days(next_date, 1);
			if(next_date.getTime() > today_time) break;


			if(next_date.getMonth() - current_date.getMonth()) {
				month_change = 1;
				if(this.discrete_domains) {
					week_col_change = 1;
				}

				this.month_start_points.push(13 + (index + week_col_change) * 12);
			}
			current_date = next_date;
		}

		return [data_group, month_change];
	}

	render_month_labels() {
		// this.first_month_label = 1;
		// if (this.first_week_start.getDate() > 8) {
		// 	this.first_month_label = 0;
		// }
		// this.last_month_label = 1;

		// let first_month = this.months.shift();
		// let first_month_start = this.month_start_points.shift();
		// render first month if

		// let last_month = this.months.pop();
		// let last_month_start = this.month_start_points.pop();
		// render last month if

		this.months.shift();
		this.month_start_points.shift();
		this.months.pop();
		this.month_start_points.pop();

		this.month_start_points.map((start, i) => {
			let month_name =  this.month_names[this.months[i]].substring(0, 3);

			$.createSVG('text', {
				className: 'y-value-text',
				inside: this.domain_label_group,
				x: start + 12,
				y: 10,
				dy: '.32em',
				innerHTML: month_name
			});
		});
	}

	make_graph_components() {
		Array.prototype.slice.call(
			this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')
		).map(d => {
			d.style.display = 'None';
		});
		this.chart_wrapper.style.marginTop = '0px';
		this.chart_wrapper.style.paddingTop = '0px';
	}

	bind_tooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let date_parts = e.target.getAttribute('data-date').split('-');

				let month = this.month_names[parseInt(date_parts[1])-1].substring(0, 3);

				let g_off = this.chart_wrapper.getBoundingClientRect(), p_off = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = p_off.left - g_off.left + (width+2)/2;
				let y = p_off.top - g_off.top - (width+2)/2;
				let value = count + ' ' + this.count_label;
				let name = ' on ' + month + ' ' + date_parts[0] + ', ' + date_parts[2];

				this.tip.set_values(x, y, name, value, [], 1);
				this.tip.show_tip();
			});
		});
	}

	update(data) {
		this.data = data;
		this.setup_values();
		this.bind_tooltip();
	}
}

const chartTypes = {
	line: LineChart,
	bar: BarChart,
	scatter: ScatterChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', options) {
	if (!chartTypes[chartType]) {
		return new LineChart(options);
	}

	return new chartTypes[chartType](options);
}

class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}

export default Chart;
