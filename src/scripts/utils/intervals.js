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

export function calc_intervals() {
	//
}
