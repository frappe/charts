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

// function get_commafied_or_powered_number(number) {}

function get_actual_pretty_num(number, exponent) {
	return number;
}

function get_range_intervals(max, min=0) {
	let upper_bound = Math.ceil(max);
	let lower_bound = Math.floor(min);
	let range = upper_bound - lower_bound;

	let no_of_parts = range;
	let part_size = 1;

	if(range > 5) {
		if(range % 2 !== 0) {
			upper_bound++;
			// Recalc range
			range = upper_bound - lower_bound;
		}
		no_of_parts = range/2;
		part_size = 2;
	}

	if(range <= 2) {
		no_of_parts = 4;
		part_size = range/no_of_parts;
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

export function calc_intervals(values, with_minimum=false) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	let max_value = Math.max(...values);
	let min_value = Math.min(...values);

	let exponent = 0, intervals = [];

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

	if(max_value > 0 && min_value < 0) {
		// `with_minimum` irrelevant in this case,
		// We'll be handling both sides of zero separately
		// (both starting from zero)
		// Because ceil() and floor() behave differently
		// in those two regions

		function get_positive_first_intervals(max_value, abs_min_value) {
			let intervals = get_intervals(max_value);

			let interval_size = intervals[1] - intervals[0];

			// Then unshift the negative values
			let value = 0;
			for(var i = 1; value < abs_min_value; i++) {
				value += interval_size;
				intervals.unshift((-1) * value)
			}
			return intervals;
		}

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

	if(max_value <= 0 && min_value <= 0) {
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

	intervals = intervals.map(value => get_actual_pretty_num(value, exponent));
	return intervals;
}

export function calc_distribution(values, distribution_size) {
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

export function get_max_checkpoint(value, distribution) {
	return distribution.filter(d => d < value).length;
}
