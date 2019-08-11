import { fillArray } from './helpers';

export function getBarHeightAndYAttr(yTop, zeroLine) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;
	} else {
		height = yTop - zeroLine;
		y = zeroLine;
	}

	return [height, y];
}

export function equilizeNoOfElements(array1, array2,
	extraCount = array2.length - array1.length) {

	// Doesn't work if either has zero elements.
	if(extraCount > 0) {
		array1 = fillArray(array1, extraCount);
	} else {
		array2 = fillArray(array2, extraCount);
	}
	return [array1, array2];
}

export function truncateString(txt, len) {
	if (!txt) {
		return;
	}
	if (txt.length > len) {
		return txt.slice(0, len-3) + '...';
	} else {
		return txt;
	}
}

export function shortenLargeNumber(label) {
	let number;
	if (typeof label === 'number') number = label;
	else if (typeof label === 'string') {
		number = Number(label);
		if (Number.isNaN(number)) return label;
	}

	// Using absolute since log wont work for negative numbers
	let p = Math.floor(Math.log10(Math.abs(number)));
	if (p <= 2) return number; // Return as is for a 3 digit number of less
	let	l = Math.floor(p / 3);
	let shortened = (Math.pow(10, p - l * 3) * +(number / Math.pow(10, p)).toFixed(1));

	// Correct for floating point error upto 2 decimal places
	return Math.round(shortened*100)/100 + ' ' + ['', 'K', 'M', 'B', 'T'][l];
}