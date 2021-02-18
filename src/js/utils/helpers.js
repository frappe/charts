import { ANGLE_RATIO } from './constants';

/**
 * Returns the value of a number upto 2 decimal places.
 * @param {Number} d Any number
 */
export function floatTwo(d) {
	return parseFloat(d.toFixed(2));
}

/**
 * Returns whether or not two given arrays are equal.
 * @param {Array} arr1 First array
 * @param {Array} arr2 Second array
 */
export function arraysEqual(arr1, arr2) {
	if(arr1.length !== arr2.length) return false;
	let areEqual = true;
	arr1.map((d, i) => {
		if(arr2[i] !== d) areEqual = false;
	});
	return areEqual;
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} array An array containing the items.
 */
export function shuffle(array) {
	// Awesomeness: https://bost.ocks.org/mike/shuffle/
	// https://stackoverflow.com/a/2450976/6495043
	// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array?noredirect=1&lq=1

	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

/**
 * Fill an array with extra points
 * @param {Array} array Array
 * @param {Number} count number of filler elements
 * @param {Object} element element to fill with
 * @param {Boolean} start fill at start?
 */
export function fillArray(array, count, element, start=false) {
	if(!element) {
		element = start ? array[0] : array[array.length - 1];
	}
	let fillerArray = new Array(Math.abs(count)).fill(element);
	array = start ? fillerArray.concat(array) : array.concat(fillerArray);
	return array;
}

/**
 * Returns pixel width of string.
 * @param {String} string
 * @param {Number} charWidth Width of single char in pixels
 */
export function getStringWidth(string, charWidth) {
	return (string+"").length * charWidth;
}

export function bindChange(obj, getFn, setFn) {
	return new Proxy(obj, {
		set: function(target, prop, value) {
			setFn();
			return Reflect.set(target, prop, value);
		},
		get: function(target, prop) {
			getFn();
			return Reflect.get(target, prop);
		}
	});
}

// https://stackoverflow.com/a/29325222
export function getRandomBias(min, max, bias, influence) {
	const range = max - min;
	const biasValue = range * bias + min;
	var rnd = Math.random() * range + min,		// random in range
		mix = Math.random() * influence;		// random mixer
	return rnd * (1 - mix) + biasValue * mix;	// mix full range and bias
}

export function getPositionByAngle(angle, radius) {
	return {
		x: Math.sin(angle * ANGLE_RATIO) * radius,
		y: Math.cos(angle * ANGLE_RATIO) * radius,
	};
}

/**
 * Check if a number is valid for svg attributes
 * @param {object} candidate Candidate to test
 * @param {Boolean} nonNegative flag to treat negative number as invalid
 */
export function isValidNumber(candidate, nonNegative=false) {
	if (Number.isNaN(candidate)) return false;
	else if (candidate === undefined) return false;
	else if (!Number.isFinite(candidate)) return false;
	else if (nonNegative && candidate < 0) return false;
	else return true;
}

/**
 * Round a number to the closes precision, max max precision 4
 * @param {Number} d Any Number
 */
export function round(d) {
	// https://floating-point-gui.de/
	// https://www.jacklmoore.com/notes/rounding-in-javascript/
	return Number(Math.round(d + 'e4') + 'e-4');
}

/**
 * Creates a deep clone of an object
 * @param {Object} candidate Any Object
 */
 export function deepClone(candidate) {
	let cloned, value, key;
  
	if (candidate instanceof Date) {
	  return new Date(candidate.getTime());
	}
  
	if (typeof candidate !== "object" || candidate === null) {
	  return candidate;
	}
  
	cloned = Array.isArray(candidate) ? [] : {};
  
	for (key in candidate) {
	  value = candidate[key];
  
	  cloned[key] = deepClone(value);
	}
  
	return cloned;
  }