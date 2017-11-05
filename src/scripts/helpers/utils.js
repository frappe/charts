export function float_2(d) {
	return parseFloat(d.toFixed(2));
}

export function arrays_equal(arr1, arr2) {
	if(arr1.length !== arr2.length) return false;
	let are_equal = true;
	arr1.map((d, i) => {
		if(arr2[i] !== d) are_equal = false;
	});
	return are_equal;
}

function limitColor(r){
	if (r > 255) return 255;
	else if (r < 0) return 0;
	return r;
}

export function lightenDarkenColor(col,amt) {
	let usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	let num = parseInt(col,16);
	let r = limitColor((num >> 16) + amt);
	let b = limitColor(((num >> 8) & 0x00FF) + amt);
	let g = limitColor((num & 0x0000FF) + amt);
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(array) {
	// Awesomeness: https://bost.ocks.org/mike/shuffle/
	// https://stackoverflow.com/a/2450976/6495043
	// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array?noredirect=1&lq=1

	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}