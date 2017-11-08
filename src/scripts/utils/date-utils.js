// Playing around with dates

// https://stackoverflow.com/a/11252167/6495043
function treat_as_utc(date_str) {
	let result = new Date(date_str);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

export function get_dd_mm_yyyy(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		(dd>9 ? '' : '0') + dd,
		(mm>9 ? '' : '0') + mm,
		date.getFullYear()
	].join('-');
}

export function get_weeks_between(start_date_str, end_date_str) {
	return Math.ceil(get_days_between(start_date_str, end_date_str) / 7);
}

export function get_days_between(start_date_str, end_date_str) {
	let milliseconds_per_day = 24 * 60 * 60 * 1000;
	return (treat_as_utc(end_date_str) - treat_as_utc(start_date_str)) / milliseconds_per_day;
}

// mutates
export function add_days(date, number_of_days) {
	date.setDate(date.getDate() + number_of_days);
}

// export function get_month_name() {}
