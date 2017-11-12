export function divide_if_more_than_five(number) {
	return (number < 5) ? number : number / 2;
}

export function calc_whole_parts(value, divisor) {
	return Math.ceil(value / divisor);
}

export function make_even(number) {
	return (number % 2 !== 0) ? ++number : number;
}

export function calc_part_size(value) {
	// take care of fractions
	return Math.pow(10, ((value+"").length - 1));
}

export function calc_upper_bound(value) {
	//
}

export function clump_intervals(start, interval_size, count) {
	let intervals = [];
	for(var i = 0; i <= count; i++){
		intervals.push(start);
		start += interval_size;
	}
	return intervals;
}

// export function calc_intervals() {
// 	//
// }

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

export function calc_y_intervals(array) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	// TODO: Fractions

	let max_bound, min_bound, pos_no_of_parts, neg_no_of_parts, part_size; // eslint-disable-line no-unused-vars

	// Critical values
	let max_val = parseInt(Math.max(...array));
	let min_val = parseInt(Math.min(...array));
	if(min_val >= 0) {
		min_val = 0;
	}

	let get_params = (value1, value2) => {
		let bound1, bound2, no_of_parts_1, no_of_parts_2, interval_size;
		if((value1+"").length <= 1) {
			[bound1, no_of_parts_1] = [10, 5];
		} else {
			[bound1, no_of_parts_1] = calc_upper_bound_and_no_of_parts(value1);
		}

		interval_size = bound1 / no_of_parts_1;
		no_of_parts_2 = calc_no_of_parts(value2, interval_size);
		bound2 = no_of_parts_2 * interval_size;

		return [bound1, bound2, no_of_parts_1, no_of_parts_2, interval_size];
	};

	const abs_min_val = min_val * -1;
	if(abs_min_val <= max_val) {
		// Get the positive region intervals
		// then calc negative ones accordingly
		[max_bound, min_bound, pos_no_of_parts, neg_no_of_parts, part_size]
			= get_params(max_val, abs_min_val);
		if(abs_min_val === 0) {
			min_bound = 0; neg_no_of_parts = 0;
		}
	} else {
		// Get the negative region here first
		[min_bound, max_bound, neg_no_of_parts, pos_no_of_parts, part_size]
			= get_params(abs_min_val, max_val);
	}

	// Make both region parts even
	if(pos_no_of_parts % 2 !== 0 && neg_no_of_parts > 0) pos_no_of_parts++;
	if(neg_no_of_parts % 2 !== 0) {
		// every increase in no_of_parts entails an increase in corresponding bound
		// except here, it happens implicitly after every calc_no_of_parts() call
		neg_no_of_parts++;
		min_bound += part_size;
	}

	let no_of_parts = pos_no_of_parts + neg_no_of_parts;
	if(no_of_parts > 5) {
		no_of_parts /= 2;
		part_size *= 2;

		pos_no_of_parts /=2;
	}

	if (max_val < (pos_no_of_parts - 1) * part_size) {
		no_of_parts--;
	}

	return get_intervals(
		(-1) * min_bound,
		part_size,
		no_of_parts
	);
}

function get_intervals(start, interval_size, count) {
	let intervals = [];
	for(var i = 0; i <= count; i++){
		intervals.push(start);
		start += interval_size;
	}
	return intervals;
}

function calc_upper_bound_and_no_of_parts(max_val) {
	// Given a positive value, calculates a nice-number upper bound
	// and a consequent optimal number of parts

	const part_size = Math.pow(10, ((max_val+"").length - 1));
	const no_of_parts = calc_no_of_parts(max_val, part_size);

	// Use it to get a nice even upper bound
	const upper_bound = part_size * no_of_parts;

	return [upper_bound, no_of_parts];
}

function calc_no_of_parts(value, divisor) {
	// value should be a positive number, divisor should be greater than 0
	// returns an even no of parts
	let no_of_parts = Math.ceil(value / divisor);
	if(no_of_parts % 2 !== 0) no_of_parts++; // Make it an even number

	return no_of_parts;
}

function get_optimal_no_of_parts(no_of_parts) {
	// aka Divide by 2 if too large
	return (no_of_parts < 5) ? no_of_parts : no_of_parts / 2;
}
