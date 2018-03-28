// Playing around with dates

export const NO_OF_YEAR_MONTHS = 12;
export const NO_OF_DAYS_IN_WEEK = 7;
export const DAYS_IN_YEAR = 375;
export const NO_OF_MILLIS = 1000;
export const SEC_IN_DAY = 86400;

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(date) {
	let result = new Date(date);
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

export function timestampSec(date) {
	return date.getTime()/NO_OF_MILLIS;
}

export function timestampToMidnight(timestamp, roundAhead = false) {
	let midnightTs = Math.floor(timestamp - (timestamp % SEC_IN_DAY));
	if(roundAhead) {
		return midnightTs + SEC_IN_DAY;
	}
	return midnightTs;
}

export function getWeeksBetween(startDate, endDate) {
	return Math.ceil(getDaysBetween(startDate, endDate) / NO_OF_DAYS_IN_WEEK);
}

export function getDaysBetween(startDate, endDate) {
	let millisecondsPerDay = SEC_IN_DAY * NO_OF_MILLIS;
	return (treatAsUtc(endDate) - treatAsUtc(startDate)) / millisecondsPerDay;
}

export function getMonthName(i, short=false) {
	let monthName = MONTH_NAMES[i];
	return short ? monthName.slice(0, 3) : monthName;
}

// mutates
export function setDayToSunday(date) {
	const day = date.getDay();
	if(day !== NO_OF_DAYS_IN_WEEK) {
		addDays(date, (-1) * day);
	}
	return date;
}

// mutates
export function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
}
