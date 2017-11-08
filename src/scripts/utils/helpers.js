/**
 * Returns the value of a number upto 2 decimal places.
 * @param {Number} d Any number
 */
export function float_2(d) {
	return parseFloat(d.toFixed(2));
}

/**
 * Returns whether or not two given arrays are equal.
 * @param {Array} arr1 First array
 * @param {Array} arr2 Second array
 */
export function arrays_equal(arr1, arr2) {
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
 * Returns pixel width of string.
 * @param {String} string
 * @param {Number} char_width Width of single char in pixels
 */
export function get_string_width(string, char_width) {
	return (string+"").length * char_width;
}
