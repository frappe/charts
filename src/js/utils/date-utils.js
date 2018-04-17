// Playing around with dates

export const NO_OF_YEAR_MONTHS = 12;
export const NO_OF_DAYS_IN_WEEK = 7;
export const DAYS_IN_YEAR = 375;
export const NO_OF_MILLIS = 1000;
export const SEC_IN_DAY = 86400;

export const MONTH_NAMES = ["January", "February", "March", "April", "May",
	"June", "July", "August", "September", "October", "November", "December"];
export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday",
	"Thursday", "Friday", "Saturday"];

// https://stackoverflow.com/a/11252167/6495043
function treatAsUtc(date) {
	let result = new Date(date);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return result;
}

export function getYyyyMmDd(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	return [
		date.getFullYear(),
		(mm>9 ? '' : '0') + mm,
		(dd>9 ? '' : '0') + dd
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

// export function getMonthsBetween(startDate, endDate) {}

export function getWeeksBetween(startDate, endDate) {
	let weekStartDate = setDayToSunday(startDate);
	return Math.ceil(getDaysBetween(weekStartDate, endDate) / NO_OF_DAYS_IN_WEEK);
}

export function getDaysBetween(startDate, endDate) {
	let millisecondsPerDay = SEC_IN_DAY * NO_OF_MILLIS;
	return (treatAsUtc(endDate) - treatAsUtc(startDate)) / millisecondsPerDay;
}

export function areInSameMonth(startDate, endDate) {
	return startDate.getMonth() === endDate.getMonth()
		&& startDate.getFullYear() === endDate.getFullYear();
}

export function getMonthName(i, short=false) {
	let monthName = MONTH_NAMES[i];
	return short ? monthName.slice(0, 3) : monthName;
}

export function getLastDateInMonth (month, year) {
	return new Date(year, month + 1, 0); // 0: last day in previous month
}

// mutates
export function setDayToSunday(date) {
	let newDate = clone(date);
	const day = newDate.getDay();
	if(day !== 0) {
		addDays(newDate, (-1) * day);
	}
	return newDate;
}

// mutates
export function addDays(date, numberOfDays) {
	date.setDate(date.getDate() + numberOfDays);
}
