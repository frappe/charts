// Playing around with dates

export const NO_OF_YEAR_MONTHS = 12;
export const NO_OF_DAYS_IN_WEEK = 7;
export const NO_OF_MILLIS = 1000;

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(dateStr) {
	let result = new Date(dateStr);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

export function getDdMmYyyy(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		(dd>9 ? '' : '0') + dd,
		(mm>9 ? '' : '0') + mm,
		date.getFullYear()
	].join('-');
}

export function clone(date) {
	return new Date(date.getTime());
}

export function getWeeksBetween(startDateStr, endDateStr) {
	return Math.ceil(getDaysBetween(startDateStr, endDateStr) / 7);
}

export function getDaysBetween(startDateStr, endDateStr) {
	let millisecondsPerDay = 24 * 60 * 60 * 1000;
	return (treatAsUtc(endDateStr) - treatAsUtc(startDateStr)) / millisecondsPerDay;
}

// mutates
export function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
}

export function getMonthName(i, short=false) {
	let monthName = MONTH_NAMES[i];
	return short ? monthName.slice(0, 3) : monthName;
}
