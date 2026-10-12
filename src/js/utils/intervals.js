import { floatTwo } from './helpers';

function normalize(x) {
	// Calculates mantissa and exponent of a number
	// Returns normalized number and exponent
	// https://stackoverflow.com/q/9383593/6495043

	if (x === 0) {
		return [0, 0];
	}
	if (isNaN(x)) {
		return { mantissa: -6755399441055744, exponent: 972 };
	}
	var sig = x > 0 ? 1 : -1;
	if (!isFinite(x)) {
		return { mantissa: sig * 4503599627370496, exponent: 972 };
	}

	x = Math.abs(x);
	var exp = Math.floor(Math.log10(x));
	var man = x / Math.pow(10, exp);

	return [sig * man, exp];
}

const NICE_STEPS = [1, 2, 2.5, 5, 10];
const TARGET_INTERVALS = 5;

function getNiceStep(range) {
	let roughStep = range / TARGET_INTERVALS;
	let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
	let niceStep = NICE_STEPS.find(step => step * magnitude >= roughStep);
	return niceStep * magnitude;
}

function getChartIntervals(maxValue, minValue = 0) {
	let magnitude = Math.pow(10, normalize(maxValue)[1]);
	let lowerBound = Math.floor(minValue / magnitude) * magnitude;
	let step = magnitude;
	let noOfParts = 5;

	if (maxValue > lowerBound) {
		step = getNiceStep(maxValue - lowerBound);
		lowerBound = Math.floor(lowerBound / step) * step;
		noOfParts = Math.ceil((maxValue - lowerBound) / step);
	}

	let intervals = [];
	for (let i = 0; i <= noOfParts; i++) {
		intervals.push(parseFloat((lowerBound + step * i).toPrecision(12)));
	}
	return intervals;
}

export function calcChartIntervals(values, withMinimum = false, range = {}) {
	//*** Where the magic happens ***

	// Calculates best-fit y intervals from given values
	// and returns the interval array

	let maxValue = Math.max(...values);
	let minValue = Math.min(...values);

	if (range.max !== undefined) {
		maxValue = maxValue > range.max ? maxValue : range.max;
	}
	
	if (range.min !== undefined) {
		minValue = minValue < range.min ? minValue : range.min;
	}

	// Exponent to be used for pretty print
	let exponent = 0, intervals = []; // eslint-disable-line no-unused-vars

	function getPositiveFirstIntervals(maxValue, absMinValue) {
		let intervals = getChartIntervals(maxValue);

		let intervalSize = intervals[1] - intervals[0];

		// Then unshift the negative values
		let value = 0;
		for (var i = 1; value < absMinValue; i++) {
			value += intervalSize;
			intervals.unshift((-1) * value);
		}
		return intervals;
	}

	// CASE I: Both non-negative

	if (maxValue >= 0 && minValue >= 0) {
		exponent = normalize(maxValue)[1];
		if (!withMinimum) {
			intervals = getChartIntervals(maxValue);
		} else {
			intervals = getChartIntervals(maxValue, minValue);
		}
	}

	// CASE II: Only minValue negative

	else if (maxValue > 0 && minValue < 0) {
		// `withMinimum` irrelevant in this case,
		// We'll be handling both sides of zero separately
		// (both starting from zero)
		// Because ceil() and floor() behave differently
		// in those two regions

		let absMinValue = Math.abs(minValue);

		if (maxValue >= absMinValue) {
			exponent = normalize(maxValue)[1];
			intervals = getPositiveFirstIntervals(maxValue, absMinValue);
		} else {
			// Mirror: maxValue => absMinValue, then change sign
			exponent = normalize(absMinValue)[1];
			let posIntervals = getPositiveFirstIntervals(absMinValue, maxValue);
			intervals = posIntervals.reverse().map(d => d * (-1));
		}

	}

	// CASE III: Both non-positive

	else if (maxValue <= 0 && minValue <= 0) {
		// Mirrored Case I:
		// Work with positives, then reverse the sign and array

		let pseudoMaxValue = Math.abs(minValue);
		let pseudoMinValue = Math.abs(maxValue);

		exponent = normalize(pseudoMaxValue)[1];
		if (!withMinimum) {
			intervals = getChartIntervals(pseudoMaxValue);
		} else {
			intervals = getChartIntervals(pseudoMaxValue, pseudoMinValue);
		}

		intervals = intervals.reverse().map(d => d * (-1));
	}

	return intervals;
}

export function getZeroIndex(yPts) {
	let zeroIndex;
	let interval = getIntervalSize(yPts);
	if (yPts.indexOf(0) >= 0) {
		// the range has a given zero
		// zero-line on the chart
		zeroIndex = yPts.indexOf(0);
	} else if (yPts[0] > 0) {
		// Minimum value is positive
		// zero-line is off the chart: below
		let min = yPts[0];
		zeroIndex = (-1) * min / interval;
	} else {
		// Maximum value is negative
		// zero-line is off the chart: above
		let max = yPts[yPts.length - 1];
		zeroIndex = (-1) * max / interval + (yPts.length - 1);
	}
	return zeroIndex;
}

export function getRealIntervals(max, noOfIntervals, min = 0, asc = 1) {
	let range = max - min;
	let part = range * 1.0 / noOfIntervals;
	let intervals = [];

	for (var i = 0; i <= noOfIntervals; i++) {
		intervals.push(min + part * i);
	}

	return asc ? intervals : intervals.reverse();
}

export function getIntervalSize(orderedArray) {
	return orderedArray[1] - orderedArray[0];
}

export function getValueRange(orderedArray) {
	return orderedArray[orderedArray.length - 1] - orderedArray[0];
}

export function scale(val, yAxis) {
	return floatTwo(yAxis.zeroLine - val * yAxis.scaleMultiplier);
}

export function isInRange(val, min, max) {
	return val > min && val < max;
}

export function isInRange2D(coord, minCoord, maxCoord) {
	return isInRange(coord[0], minCoord[0], maxCoord[0])
		&& isInRange(coord[1], minCoord[1], maxCoord[1]);
}

export function getClosestInArray(goal, arr, index = false) {
	let closest = arr.reduce(function (prev, curr) {
		return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
	}, []);

	return index ? arr.indexOf(closest) : closest;
}

export function calcDistribution(values, distributionSize) {
	// Assume non-negative values,
	// implying distribution minimum at zero

	let dataMaxValue = Math.max(...values);

	let distributionStep = 1 / (distributionSize - 1);
	let distribution = [];

	for (var i = 0; i < distributionSize; i++) {
		let checkpoint = dataMaxValue * (distributionStep * i);
		distribution.push(checkpoint);
	}

	return distribution;
}

export function getMaxCheckpoint(value, distribution) {
	return distribution.filter(d => d < value).length;
}
